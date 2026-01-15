import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from "@nestjs/microservices";
import { HistoryService } from "./history.service";

@Controller()
export class WorkoutEventsController {
  private readonly logger = new Logger(WorkoutEventsController.name);
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern("workout.completed")
  async handleWorkoutCompleted(@Payload() data: any) {
    this.logger.log('workout.completed received ' + JSON.stringify(data));
    const { userId, routineId, dayOfWeek } = data;

    await this.historyService.logEvent({
      userId,
      type: "workout.completed",
      meta: { routineId, dayOfWeek },
    });
  }
}















