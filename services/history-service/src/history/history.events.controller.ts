import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { HistoryService } from "./history.service";

@Controller()
export class HistoryEventsController {
  constructor(private readonly history: HistoryService) {}

  // Evento ejemplo: lo puedes emitir desde routine-service o api-gateway
  @MessagePattern("routine.created")
  async onRoutineCreated(@Payload() data: any) {
    const userId = data?.userId ?? "unknown";
    await this.history.add(userId, "routine.created", data);
    return true;
  }
}
