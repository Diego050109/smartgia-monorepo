import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { UsersService } from "./users.service";

@Controller()
export class UsersEventsController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern("user.created")
  async handleUserCreated(@Payload() data: any) {
    const id = data?.id;
    const email = data?.email;
    if (!id || !email) return;
    await this.usersService.upsertFromAuth({ id, email });
  }
}
