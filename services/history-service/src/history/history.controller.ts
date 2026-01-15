import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { HistoryService } from "./history.service";

@Controller("history")
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  // Esto asume que el API Gateway te manda x-user-id
  @Get()
  async myHistory(@Req() req: Request) {
    const userId = req.header("x-user-id");
    if (!userId) return [];
    return this.history.listByUser(userId);
  }
}

