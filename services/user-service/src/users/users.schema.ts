import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  name?: string;

  @Prop()
  age?: number;

  @Prop()
  weight?: number;

  @Prop()
  height?: number;

  @Prop({ enum: ["bajar_peso", "fuerza", "resistencia", "bienestar"] })
  goal?: string;

  @Prop({ enum: ["principiante", "intermedio", "avanzado"] })
  level?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
