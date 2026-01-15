import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HistoryDocument = History & Document;

@Schema({ timestamps: true })
export class History {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Date, default: () => new Date() })
  at?: Date;

  @Prop({ type: Object })
  payload?: any;

  @Prop({ type: Object, default: {} })
  meta?: Record<string, any>;
}

export const HistorySchema = SchemaFactory.createForClass(History);




