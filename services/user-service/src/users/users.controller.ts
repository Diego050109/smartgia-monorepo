import { Body, Controller, Get, Put, Param } from "@nestjs/common";
import { CurrentUser } from "../common/current-user.decorator";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfileByUserId(user.userId);
  }

  @Put("profile")
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.upsertProfile(user.userId, user.email, body);
  }

  // Endpoint interno para microservicios (pasa por internalOnlyMiddleware)
  @Get("internal/profile/:userId")
  async getProfileInternal(@Param("userId") userId: string) {
    return this.usersService.getProfileByUserId(userId);
  }
}
