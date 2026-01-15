import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";
import { WhoamiController } from "./whoami.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
  ],
  controllers: [
    AppController,
    HealthController,
    WhoamiController,
  ],
  providers: [AppService],
})
export class AppModule {}

