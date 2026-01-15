import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
  });

  app.use(authMiddleware);

  const AUTH_TARGET = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";
  const USER_TARGET = process.env.USER_SERVICE_URL || "http://user-service:4002";
  const ROUTINE_TARGET = process.env.ROUTINE_SERVICE_URL || "http://routine-service:4003";
  const EXERCISE_TARGET = process.env.EXERCISE_SERVICE_URL || "http://exercise-service:4004";
  const ATTENDANCE_TARGET = process.env.ATTENDANCE_SERVICE_URL || "http://attendance-service:4005";
  const HISTORY_TARGET = process.env.HISTORY_SERVICE_URL || "http://history-service:4006";

  const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";

  const proxyKeepPrefix = (prefix: string, target: string) =>
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: (path) => `${prefix}${path}`,
      headers: internalToken ? { "x-internal-token": internalToken } : {},
    });

  const proxyStripPrefix = (target: string) =>
    createProxyMiddleware({
      target,
      changeOrigin: true,
      headers: internalToken ? { "x-internal-token": internalToken } : {},
    });

  app.use("/auth", proxyKeepPrefix("/auth", AUTH_TARGET));
  app.use("/users", proxyStripPrefix(USER_TARGET));
  app.use("/routines", proxyStripPrefix(ROUTINE_TARGET));
  app.use("/exercises", proxyStripPrefix(EXERCISE_TARGET));
  app.use("/attendance", proxyStripPrefix(ATTENDANCE_TARGET));
  app.use("/history", proxyStripPrefix(HISTORY_TARGET));

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  console.log(`API Gateway running on http://localhost:${port}`);
}

bootstrap();
