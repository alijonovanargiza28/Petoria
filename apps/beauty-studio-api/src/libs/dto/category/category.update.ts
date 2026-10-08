import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsMongoId } from "class-validator";
import { CategoryInput } from "./category.input";

@InputType()
export class CategoryUpdate extends PartialType(CategoryInput, {
  skipNullProperties: false,
}) {
  @IsMongoId() @Field(() => String) _id!: string;
}
