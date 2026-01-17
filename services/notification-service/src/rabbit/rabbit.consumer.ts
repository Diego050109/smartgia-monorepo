import * as amqp from 'amqplib';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function startRabbitConsumer() {
  const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672';
  const queue = process.env.RABBITMQ_QUEUE ?? 'progress_queue';

  for (let attempt = 1; ; attempt++) {
    try {
      console.log(`👂 Connecting to RabbitMQ (${url}) attempt=${attempt}`);

      const conn = await amqp.connect(url);
      conn.on('error', (e) => console.error('RabbitMQ conn error:', e));
      conn.on('close', () => console.error('RabbitMQ conn closed'));

      const ch = await conn.createChannel();
      await ch.assertQueue(queue, { durable: true });

      console.log(`👂 Listening RabbitMQ queue: ${queue}`);

      ch.consume(queue, (msg) => {
        if (!msg) return;
        const body = msg.content.toString();
        console.log('Notification received:', body);
        ch.ack(msg);
      });

      return; // listo: ya quedó escuchando
    } catch (err: any) {
      const wait = Math.min(30000, 1000 * attempt);
      console.error(`Rabbit connect failed: ${err?.message}. retry in ${wait}ms`);
      await sleep(wait);
    }
  }
}