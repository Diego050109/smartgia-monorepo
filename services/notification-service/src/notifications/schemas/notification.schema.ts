import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object })
  payload: any;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
