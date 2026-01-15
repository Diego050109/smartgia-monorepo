import { MicroserviceOptions, Transport } from "@nestjs/microservices";

export const rmqClient = (): MicroserviceOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? "amqp://rabbitmq:5672"],
    queue: process.env.RABBITMQ_QUEUE ?? "history_queue",
    queueOptions: { durable: true },
  },
});
