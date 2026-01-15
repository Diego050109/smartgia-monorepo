import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type RoutineDocument = Routine & Document;

export type RoutineStatus = "ACTIVE" | "ARCHIVED";
export type RoutinePeriod = "WEEKLY" | "DAILY";

@Schema({ _id: false })
class ExerciseItem {
  @Prop({ required: true }) exerciseId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) sets: number;
  @Prop({ required: true }) reps: string;
  @Prop({ required: true }) restSeconds: number;
  @Prop() notes?: string;
}

@Schema({ _id: false })
class RoutineDay {
  @Prop({ required: true }) dayOfWeek: number; // 1..7
  @Prop({ required: true }) focus: string; // UPPER/LOWER/FULL_BODY...
  @Prop({ type: [ExerciseItem], default: [] }) exercises: ExerciseItem[];
}

@Schema({ timestamps: true })
export class Routine {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  goal?: string;

  @Prop()
  level?: string;

  @Prop({ required: true, enum: ["WEEKLY", "DAILY"], default: "WEEKLY", index: true })
  period: RoutinePeriod;

  @Prop({ required: true, default: "ACTIVE", enum: ["ACTIVE", "ARCHIVED"], index: true })
  status: RoutineStatus;

  @Prop({ required: true, index: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop({ type: [RoutineDay], default: [] })
  days: RoutineDay[];

  // compat (viejo)
  @Prop({ type: [String], default: [] })
  exercises: string[];

  // compat (viejo)
  @Prop({ default: true })
  active: boolean;


  @Prop({ type: [Number], default: [] })
  completedDays: number[];}

export const RoutineSchema = SchemaFactory.createForClass(Routine);

RoutineSchema.index(
  { userId: 1, status: 1, period: 1, periodStart: 1 },
  { unique: true, partialFilterExpression: { status: "ACTIVE" } }
);

RoutineSchema.index({ userId: 1, period: 1, periodStart: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "ACTIVE" } });


