import * as amqp from 'amqplib';

export async function startRabbitConsumer() {
  const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
  const queue = process.env.RABBITMQ_QUEUE || 'progress_queue';

  const conn = await amqp.connect(url);
  const ch = await conn.createChannel();
  await ch.assertQueue(queue, { durable: true });

  console.log('Listening RabbitMQ queue: ' + queue);

  await ch.consume(queue, (msg) => {
    if (!msg) return;
    const payload = msg.content.toString();
    console.log('Notification received:', payload);
    ch.ack(msg);
  });
}
