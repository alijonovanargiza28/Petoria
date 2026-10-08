import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import ServiceSchema from "../../schemas/Service.model";
import { AuthModule } from "../auth/auth.module";
import { CategoryModule } from "../category/category.module";
import { ServiceResolver } from "./service.resolver";
import { ServiceService } from "./service.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Service", schema: ServiceSchema }]),
    CategoryModule,
    AuthModule,
  ],
  providers: [ServiceService, ServiceResolver],
})
export class ServiceModule {}
