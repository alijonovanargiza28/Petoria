import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Category {
  @Field(() => String) _id!: string;
  @Field(() => String) name!: string;
  @Field(() => String, { nullable: true }) description?: string | null;
  @Field(() => String, { nullable: true }) image?: string | null;
  @Field(() => Int) sort!: number;
  @Field(() => Boolean) isActive!: boolean;
  @Field(() => Date) createdAt!: Date;
  @Field(() => Date) updatedAt!: Date;
}

@ObjectType()
export class CatalogTotalCounter {
  @Field(() => Int) total!: number;
}

@ObjectType()
export class Categories {
  @Field(() => [Category]) list!: Category[];
  @Field(() => [CatalogTotalCounter]) metaCounter!: CatalogTotalCounter[];
}
