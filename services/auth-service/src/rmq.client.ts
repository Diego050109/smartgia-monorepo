import { ClientProxyFactory, Transport } from "@nestjs/microservices";

const RMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const RMQ_QUEUE = process.env.RABBITMQ_QUEUE || "events";

export const rmqClient = ClientProxyFactory.create({
  transport: Transport.RMQ,
  options: {
    urls: [RMQ_URL],
    queue: RMQ_QUEUE,
    queueOptions: { durable: true },
  },
});
