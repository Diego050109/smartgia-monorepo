import { Controller, Post, Body } from '@nestjs/common';
import * as amqp from 'amqplib';

@Controller('events')
export class EventController {
  @Post('progress')
  async sendProgressEvent(@Body() body: any) {
    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
    const queue = process.env.RABBITMQ_QUEUE || 'progress_queue';

    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();
    await channel.assertQueue(queue, { durable: true });

    const payload = { ...body, ts: new Date().toISOString() };
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));

    await channel.close();
    await conn.close();

    return { sent: true, queue, payload };
  }
}
