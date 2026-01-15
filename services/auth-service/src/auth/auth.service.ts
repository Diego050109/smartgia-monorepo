import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { rmqClient } from "../rmq.client";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomUUID, createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

type PublicUser = { id: string; email: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private refreshKey(userId: string, jti: string) {
    return `refresh:${userId}:${jti}`;
  }

  private parseExpiresToSeconds(expires: string, fallbackSeconds: number) {
    const match = /^(\d+)([smhd])$/.exec(expires.trim());
    if (!match) return fallbackSeconds;
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] ?? 1);
  }

  private async issueTokens(user: PublicUser) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_ACCESS_SECRET || "smartgia_access_secret",
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN || 900),

      },
    );

    const jti = randomUUID();
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti },
      {
        secret: process.env.JWT_REFRESH_SECRET || "smartgia_refresh_secret",
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN || 604800),

      },
    );

    const ttl = Number(process.env.JWT_REFRESH_EXPIRES_IN || 604800);

    await this.redis.raw.set(this.refreshKey(user.id, jti), this.hashToken(refreshToken), "EX", ttl);

    return { accessToken, refreshToken };
  }

  async register(email: string, password: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException("Email ya registrado");

    const passwordHash = await bcrypt.hash(password, 10);

    const userDb = await this.prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    
    try {
      rmqClient.emit("user.created", { id: userDb.id, email: userDb.email }).subscribe();
    } catch (e) {}
const tokens = await this.issueTokens({ id: userDb.id, email: userDb.email });
    return { user: userDb, ...tokens };
  }

  async login(email: string, password: string) {
    const userDb = await this.prisma.user.findUnique({ where: { email } });
    if (!userDb) throw new UnauthorizedException("Credenciales inválidas");

    const ok = await bcrypt.compare(password, userDb.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciales inválidas");

    const user = { id: userDb.id, email: userDb.email };
    const tokens = await this.issueTokens(user);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException("Refresh token requerido");

    let payload: any;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || "smartgia_refresh_secret",
      });
    } catch {
      throw new UnauthorizedException("Refresh token inválido");
    }

    const userId = payload.sub as string;
    const jti = payload.jti as string;
    if (!userId || !jti) throw new UnauthorizedException("Refresh token inválido");

    const key = this.refreshKey(userId, jti);
    const storedHash = await this.redis.raw.get(key);
    if (!storedHash) throw new UnauthorizedException("Refresh expirado o revocado");

    const incomingHash = this.hashToken(refreshToken);
    if (storedHash !== incomingHash) throw new UnauthorizedException("Refresh token no reconocido");

    await this.redis.raw.del(key);

    const userDb = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!userDb) throw new UnauthorizedException("Usuario no existe");

    const tokens = await this.issueTokens({ id: userDb.id, email: userDb.email });
    return { user: userDb, ...tokens };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { ok: true };

    try {
      const payload: any = await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || "smartgia_refresh_secret",
      });

      const userId = payload.sub as string;
      const jti = payload.jti as string;
      if (userId && jti) {
        await this.redis.raw.del(this.refreshKey(userId, jti));
      }
    } catch {
      // ok
    }

    return { ok: true };
  }
}


