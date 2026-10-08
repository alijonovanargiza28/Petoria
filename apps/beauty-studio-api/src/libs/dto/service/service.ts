import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ServiceStatus } from "../../enums/service.enum";
import { CatalogTotalCounter } from "../category/category";

@ObjectType()
export class Service {
  @Field(() => String) _id!: string;
  @Field(() => String) categoryId!: string;
  @Field(() => String) name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => Float) price!: number;
  @Field(() => Int) duration!: number;
  @Field(() => String, { nullable: true }) image?: string | null;
  @Field(() => ServiceStatus) serviceStatus!: ServiceStatus;
  @Field(() => Int) serviceViews!: number;
  @Field(() => Int) serviceLikes!: number;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
}

@ObjectType()
export class Services {
  @Field(() => [Service]) list!: Service[];
  @Field(() => [CatalogTotalCounter]) metaCounter!: CatalogTotalCounter[];
}
