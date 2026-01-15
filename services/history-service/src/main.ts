import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { internalMiddleware } from "./middlewares/internal.middleware";
import { rmqClient } from "./rmq.client";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // protege TODO el HTTP (si quieres dejar /health público dímelo y te lo ajusto)
  app.use(internalMiddleware);

  // RabbitMQ microservice listener
  app.connectMicroservice(rmqClient());
  await app.startAllMicroservices();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
