import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true,
  });

  // ✅ Health check simple (NO requiere controller)
  app.getHttpAdapter().get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "auth-service" });
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 4001;

  // ✅ IMPORTANTE para Docker
  await app.listen(port, "0.0.0.0");

  console.log(`Auth service running on http://localhost:${port}`);
}

bootstrap();

