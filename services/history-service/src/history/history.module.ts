import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HistoryController } from "./history.controller";
import { WorkoutEventsController } from "./workout.events.controller";
import { HistoryEventsController } from "./history.events.controller";
import { HistoryService } from "./history.service";
import { History, HistorySchema } from "./history.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: History.name, schema: HistorySchema },
    ]),
  ],
  controllers: [HistoryController, HistoryEventsController, WorkoutEventsController],
  providers: [HistoryService],
})
export class HistoryModule {}


