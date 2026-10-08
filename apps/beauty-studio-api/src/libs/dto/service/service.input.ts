import { Field, Float, InputType, Int } from "@nestjs/graphql";
import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { Direction } from "../../enums/common.enum";
import { ServiceStatus } from "../../enums/service.enum";

@InputType()
export class ServiceInput {
  @IsMongoId() @Field(() => String) categoryId!: string;
  @IsString() @Length(1, 100) @Field(() => String) name!: string;
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Field(() => String, { nullable: true })
  description?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Field(() => Float) price!: number;
  @IsInt() @Min(1) @Field(() => Int) duration!: number;
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Field(() => String, { nullable: true })
  image?: string;
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEnum(ServiceStatus)
  @Field(() => ServiceStatus, { nullable: true })
  serviceStatus?: ServiceStatus;
}

@InputType()
export class ServicesInquiry {
  @IsInt() @Min(1) @Field(() => Int, { defaultValue: 1 }) page: number = 1;
  @IsInt()
  @Min(1)
  @Max(100)
  @Field(() => Int, { defaultValue: 20 })
  limit: number = 20;
  @IsOptional()
  @IsIn(["name", "price", "duration", "createdAt", "updatedAt"])
  @Field(() => String, { nullable: true })
  sort?: string;
  @IsOptional()
  @IsEnum(Direction)
  @Field(() => Direction, { nullable: true })
  direction?: Direction;
  @IsOptional()
  @IsMongoId()
  @Field(() => String, { nullable: true })
  categoryId?: string;
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field(() => String, { nullable: true })
  text?: string;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Field(() => Float, { nullable: true })
  minPrice?: number;
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Field(() => Float, { nullable: true })
  maxPrice?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  minDuration?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Field(() => Int, { nullable: true })
  maxDuration?: number;
  @IsOptional()
  @IsEnum(ServiceStatus)
  @Field(() => ServiceStatus, { nullable: true })
  serviceStatus?: ServiceStatus;
}
