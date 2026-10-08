import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsMongoId } from "class-validator";
import { ServiceInput } from "./service.input";

@InputType()
export class ServiceUpdate extends PartialType(ServiceInput, {
  skipNullProperties: false,
}) {
  @IsMongoId() @Field(() => String) _id!: string;
}
