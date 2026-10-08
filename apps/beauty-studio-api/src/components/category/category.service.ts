import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { CategoryRecord } from "../../schemas/Category.model";
import { Categories, Category } from "../../libs/dto/category/category";
import {
  CategoriesInquiry,
  CategoryInput,
} from "../../libs/dto/category/category.input";
import { CategoryUpdate } from "../../libs/dto/category/category.update";
import {
  catalogFields,
  catalogId,
  catalogPagination,
  literalSearch,
} from "../../libs/catalog.helpers";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel("Category")
    private readonly categoryModel: Model<CategoryRecord>,
  ) {}

  async createCategory(input: CategoryInput): Promise<Category> {
    const result = await this.categoryModel.create(
      catalogFields(input, [
        "name",
        "description",
        "image",
        "sort",
        "isActive",
      ]),
    );
    return { ...result.toObject(), _id: result._id.toString() };
  }

  async updateCategory(input: CategoryUpdate): Promise<Category> {
    const result = await this.categoryModel
      .findByIdAndUpdate(
        catalogId(input._id),
        {
          $set: catalogFields(input, [
            "name",
            "description",
            "image",
            "sort",
            "isActive",
          ]),
        },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();
    if (!result) throw new NotFoundException("Category not found");
    return { ...result, _id: result._id.toString() };
  }

  async requireActiveCategory(id: string): Promise<void> {
    const category = await this.categoryModel.exists({
      _id: catalogId(id),
      isActive: true,
    });
    if (!category) throw new NotFoundException("Active category not found");
  }

  async activeCategoryIds(): Promise<Types.ObjectId[]> {
    const rows = await this.categoryModel
      .find({ isActive: true })
      .select("_id")
      .lean()
      .exec();
    return rows.map((row) => row._id);
  }

  async getCategories(
    input: CategoriesInquiry,
    admin = false,
  ): Promise<Categories> {
    const match: FilterQuery<CategoryRecord> = {};
    if (!admin) match.isActive = true;
    else if (input.isActive != null) match.isActive = input.isActive;
    if (input.text) match.name = literalSearch(input.text);
    const paging = catalogPagination(
      input,
      ["name", "sort", "createdAt", "updatedAt"],
      "sort",
    );
    const [result] = await this.categoryModel
      .aggregate<{
        list: Array<CategoryRecord & { _id: Types.ObjectId }>;
        metaCounter: Array<{ total: number }>;
      }>([
        { $match: match },
        { $sort: paging.sort },
        {
          $facet: {
            list: [{ $skip: paging.skip }, { $limit: paging.limit }],
            metaCounter: [{ $count: "total" }],
          },
        },
      ])
      .exec();
    return {
      list: (result?.list ?? []).map((row) => ({
        ...row,
        _id: row._id.toString(),
      })),
      metaCounter: result?.metaCounter.length
        ? result.metaCounter
        : [{ total: 0 }],
    };
  }
}
