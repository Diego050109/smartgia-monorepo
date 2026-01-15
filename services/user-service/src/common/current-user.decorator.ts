import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return {
      userId: req.headers["x-user-id"],
      email: req.headers["x-user-email"],
    };
  }
);
