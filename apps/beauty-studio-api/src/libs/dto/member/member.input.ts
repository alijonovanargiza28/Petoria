import { Field, InputType, Int } from "@nestjs/graphql";

import {
  IsNotEmpty,
  IsOptional,
  Length,
  Min,
  IsIn,
  IsEnum,
} from "class-validator";

import {
  MemberAuthType,
  MemberStatus,
  MemberType,
} from "../../enums/member.enum";

import { availableMasterSorts, availableMemberSorts } from "../../config";

import { Direction } from "../../enums/common.enum";

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;

  @IsNotEmpty()
  @Field(() => String)
  memberPhone!: string;

  @IsOptional()
  @Field(() => MemberAuthType, { nullable: true })
  memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 12)
  @Field(() => String)
  memberNick!: string;

  @IsNotEmpty()
  @Length(5, 12)
  @Field(() => String)
  memberPassword!: string;
}

@InputType()
class MasterSearch {
  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class MastersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableMasterSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => MasterSearch)
  search!: MasterSearch;
}

@InputType()
class MISearch {
  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class MembersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page!: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit!: number;

  @IsOptional()
  @IsIn(availableMemberSorts)
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => MISearch)
  search!: MISearch;
}

@InputType()
export class StaffMemberInput extends MemberInput {
  @IsEnum(MemberType)
  @IsIn([MemberType.MASTER, MemberType.RECEPTIONIST, MemberType.ADMIN])
  @Field(() => MemberType)
  memberType!: MemberType;
}
