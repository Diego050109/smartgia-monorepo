import { Controller, Get } from "@nestjs/common";
import { CurrentUser } from "./common/current-user.decorator";

@Controller()
export class WhoamiController {
  @Get("whoami")
  whoami(@CurrentUser() user: any) {
    return user;
  }
}
