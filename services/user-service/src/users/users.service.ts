import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "./users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfileByUserId(userId: string) {
    const user = await this.userModel.findOne({ userId }).lean();
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async upsertProfile(userId: string, email: string, data: Partial<User>) {
    const user = await this.userModel
      .findOneAndUpdate(
        { userId },
        { $set: { ...data, userId, email } },
        { new: true, upsert: true }
      )
      .lean();

    return user;
  }

  async upsertFromAuth(user: { id: string; email: string }) {
    // crea el doc mínimo si no existe (o actualiza email si cambió)
    return this.userModel
      .findOneAndUpdate(
        { userId: user.id },
        { $set: { email: user.email }, $setOnInsert: { userId: user.id } },
        { new: true, upsert: true }
      )
      .lean();
  }
}

