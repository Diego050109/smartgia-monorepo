import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisModule } from "../redis/redis.module";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || "smartgia_access_secret",
      signOptions: { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN || 900) },

    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
})
export class AuthModule {}
