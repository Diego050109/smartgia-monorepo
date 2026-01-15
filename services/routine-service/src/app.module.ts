import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";
import { AppService } from "./app.service";
import { RoutinesModule } from "./routines/routines.module";

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI ?? "mongodb://smartgia:smartgia@mongo:27017/smartgia?authSource=admin"),
    RoutinesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
