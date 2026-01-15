import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("health")
  health() {
    return { ok: true, service: "auth-service" };
  }

  // Para que también responda a través del gateway como /auth/health
  @Get("auth/health")
  authHealth() {
    return { ok: true, service: "auth-service" };
  }
}
