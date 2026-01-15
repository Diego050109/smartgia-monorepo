import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { internalMiddleware } from "./middlewares/internal.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware interno: exige x-internal-token (excepto /health)
  app.use(internalMiddleware);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`${process.env.npm_package_name ?? "service"} running on http://localhost:${port}`);
}
bootstrap();
