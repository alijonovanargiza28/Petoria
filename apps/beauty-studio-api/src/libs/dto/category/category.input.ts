import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { Direction } from "../../enums/common.enum";

@InputType()
export class CategoryInput {
  @IsString() @Length(1, 100) @Field(() => String) name!: string;
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Field(() => String, { nullable: true })
  description?: string;
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Field(() => String, { nullable: true })
  image?: string;
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  @Field(() => Int, { nullable: true })
  sort?: number;
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}

@InputType()
export class CategoriesInquiry {
  @IsInt() @Min(1) @Field(() => Int, { defaultValue: 1 }) page: number = 1;
  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;
  @IsOptional()
  @IsIn(["name", "sort", "createdAt", "updatedAt"])
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field(() => String, { nullable: true })
  text?: string;
  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
