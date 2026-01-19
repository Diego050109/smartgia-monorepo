import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authMiddleware } from "./middlewares/auth.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
  });

  app.use(authMiddleware);

  const AUTH_TARGET = process.env.AUTH_SERVICE_URL || "http://auth-service:4001";
  const USER_TARGET = process.env.USER_SERVICE_URL || "http://user-service:4002";
  const ROUTINE_TARGET = process.env.ROUTINE_SERVICE_URL || "http://routine-service:4003";
  const EXERCISE_TARGET = process.env.EXERCISE_SERVICE_URL || "http://exercise-service:4004";
  const ATTENDANCE_TARGET = process.env.ATTENDANCE_SERVICE_URL || "http://attendance-service:4005";
  const HISTORY_TARGET = process.env.HISTORY_SERVICE_URL || "http://history-service:4006";
  const PROGRESS_TARGET = process.env.PROGRESS_SERVICE_URL || "http://progress-service:4007";
  const NOTIFICATION_TARGET = process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:4008";
  const AI_TARGET = process.env.AI_SERVICE_URL || "http://ai-service:4009";

  const internalToken = process.env.INTERNAL_SERVICE_TOKEN || "";

  const proxy = (target: string) =>
    createProxyMiddleware({
      target,
      changeOrigin: true,
      headers: internalToken ? { "x-internal-token": internalToken } : {},
    });

  app.use("/auth", proxy(AUTH_TARGET));
  app.use("/users", proxy(USER_TARGET));
  app.use("/routines", proxy(ROUTINE_TARGET));
  app.use("/exercises", proxy(EXERCISE_TARGET));
  app.use("/attendance", proxy(ATTENDANCE_TARGET));
  app.use("/history", proxy(HISTORY_TARGET));
  app.use("/progress", proxy(PROGRESS_TARGET));
  app.use("/notification", proxy(NOTIFICATION_TARGET));
  app.use("/ai", proxy(AI_TARGET));

  await app.listen(4000);
}
bootstrap();
