import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import CategorySchema from "../../schemas/Category.model";
import { AuthModule } from "../auth/auth.module";
import { CategoryResolver } from "./category.resolver";
import { CategoryService } from "./category.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Category", schema: CategorySchema }]),
    AuthModule,
  ],
  providers: [CategoryService, CategoryResolver],
  exports: [CategoryService],
})
export class CategoryModule {}
