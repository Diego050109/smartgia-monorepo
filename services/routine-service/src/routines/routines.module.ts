import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Routine, RoutineSchema } from "./routine.schema";
import { RoutinesController } from "./routines.controller";
import { RoutinesService } from "./routines.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: Routine.name, schema: RoutineSchema }])],
  controllers: [RoutinesController],
  providers: [RoutinesService],
})
export class RoutinesModule {}
