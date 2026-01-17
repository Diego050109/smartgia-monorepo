import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { EventController } from './events/event.controller';

@Module({
  imports: [],
  controllers: [AppController, HealthController, EventController],
  providers: [AppService],
})
export class AppModule {}
