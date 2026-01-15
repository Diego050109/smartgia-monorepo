import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { History, HistoryDocument } from "./history.schema";

@Injectable()
export class HistoryService {
  constructor(@InjectModel(History.name) private readonly historyModel: Model<HistoryDocument>) {}

  async add(userId: string, type: string, payload?: any) {
    return this.historyModel.create({ userId, type, payload });
  }

  async listByUser(userId: string) {
    return this.historyModel.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  async logEvent(dto: { userId: string; type: string; meta?: any; at?: string }) {
    const doc = await this.historyModel.create({
      userId: dto.userId,
      type: dto.type,
      meta: dto.meta ?? {},
      at: dto.at ? new Date(dto.at) : new Date(),
    });
    return doc.toObject();
  }
}



