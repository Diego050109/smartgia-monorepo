import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startRabbitConsumer } from './rabbit/rabbit.consumer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ? Number(process.env.PORT) : 4008;
  await app.listen(port);

  console.log('✅ Notification service on port ' + port);

  // Arranca el consumer con reintentos dentro del consumer (no lo mates aquí)
  startRabbitConsumer();
}

bootstrap();