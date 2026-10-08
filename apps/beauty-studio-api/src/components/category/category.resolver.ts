import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Categories, Category } from "../../libs/dto/category/category";
import {
  CategoriesInquiry,
  CategoryInput,
} from "../../libs/dto/category/category.input";
import { CategoryUpdate } from "../../libs/dto/category/category.update";
import { MemberType } from "../../libs/enums/member.enum";
import { Roles } from "../auth/decorators/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CategoryService } from "./category.service";

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Category)
  createCategory(@Args("input") input: CategoryInput): Promise<Category> {
    return this.categoryService.createCategory(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Category)
  updateCategory(@Args("input") input: CategoryUpdate): Promise<Category> {
    return this.categoryService.updateCategory(input);
  }

  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Categories)
  getCategoriesByAdmin(
    @Args("input") input: CategoriesInquiry,
  ): Promise<Categories> {
    return this.categoryService.getCategories(input, true);
  }

  @Query(() => Categories)
  getCategories(@Args("input") input: CategoriesInquiry): Promise<Categories> {
    return this.categoryService.getCategories(input);
  }
}
