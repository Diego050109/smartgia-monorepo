import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health/health.controller';
import { Notification, NotificationSchema } from './notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [HealthController],
})
export class AppModule {}
