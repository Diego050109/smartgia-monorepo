import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { internalOnlyMiddleware } from "./common/internal-only.middleware";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mantiene tu middleware para HTTP
  app.use(internalOnlyMiddleware);

  // RMQ listener (event bus)
  const RMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
  const RMQ_QUEUE = process.env.RABBITMQ_QUEUE || "events";

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RMQ_URL],
      queue: RMQ_QUEUE,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ? Number(process.env.PORT) : 4002;
  await app.listen(port);
  console.log(`User service running on http://localhost:${port}`);
}
bootstrap();
