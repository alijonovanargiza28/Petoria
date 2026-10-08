import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { ServiceRecord } from "../../schemas/Service.model";
import { Service, Services } from "../../libs/dto/service/service";
import {
  ServiceInput,
  ServicesInquiry,
} from "../../libs/dto/service/service.input";
import { ServiceUpdate } from "../../libs/dto/service/service.update";
import { ServiceStatus } from "../../libs/enums/service.enum";
import { CategoryService } from "../category/category.service";
import {
  catalogFields,
  catalogId,
  catalogPagination,
  literalSearch,
} from "../../libs/catalog.helpers";

type ServiceRow = ServiceRecord & { _id: Types.ObjectId };
const editableFields = [
  "categoryId",
  "name",
  "description",
  "price",
  "duration",
  "image",
  "serviceStatus",
] as const;

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel("Service") private readonly serviceModel: Model<ServiceRecord>,
    private readonly categoryService: CategoryService,
  ) {}

  private output(row: ServiceRow): Service {
    return {
      ...row,
      _id: row._id.toString(),
      categoryId: row.categoryId.toString(),
    };
  }

  async createService(input: ServiceInput): Promise<Service> {
    await this.categoryService.requireActiveCategory(input.categoryId);
    const result = await this.serviceModel.create(
      catalogFields(input, editableFields),
    );
    return this.output(result.toObject());
  }

  async updateService(input: ServiceUpdate): Promise<Service> {
    const id = catalogId(input._id);
    const current = await this.serviceModel
      .findOne({ _id: id, serviceStatus: { $ne: ServiceStatus.DELETE } })
      .lean()
      .exec();
    if (!current) throw new NotFoundException("Service not found or archived");
    if (
      input.categoryId !== undefined ||
      input.serviceStatus === ServiceStatus.ACTIVE
    ) {
      await this.categoryService.requireActiveCategory(
        input.categoryId ?? current.categoryId.toString(),
      );
    }
    const result = await this.serviceModel
      .findOneAndUpdate(
        { _id: id, serviceStatus: { $ne: ServiceStatus.DELETE } },
        { $set: catalogFields(input, editableFields) },
        { new: true, runValidators: true },
      )
      .lean()
      .exec();
    if (!result) throw new NotFoundException("Service not found or archived");
    return this.output(result);
  }

  async getService(id: string): Promise<Service> {
    const result = await this.serviceModel
      .findOne({ _id: catalogId(id), serviceStatus: ServiceStatus.ACTIVE })
      .lean()
      .exec();
    if (!result) throw new NotFoundException("Service not found");
    await this.categoryService.requireActiveCategory(
      result.categoryId.toString(),
    );
    return this.output(result);
  }

  async getServices(input: ServicesInquiry, admin = false): Promise<Services> {
    const match: FilterQuery<ServiceRecord> = {};
    if (admin) {
      if (input.serviceStatus) match.serviceStatus = input.serviceStatus;
      if (input.categoryId) match.categoryId = catalogId(input.categoryId);
    } else {
      match.serviceStatus = ServiceStatus.ACTIVE;
      if (input.categoryId) {
        await this.categoryService.requireActiveCategory(input.categoryId);
        match.categoryId = catalogId(input.categoryId);
      } else
        match.categoryId = {
          $in: await this.categoryService.activeCategoryIds(),
        };
    }
    if (input.text) match.name = literalSearch(input.text);
    if (input.minPrice != null || input.maxPrice != null)
      match.price = this.range(input.minPrice, input.maxPrice);
    if (input.minDuration != null || input.maxDuration != null)
      match.duration = this.range(input.minDuration, input.maxDuration);
    const paging = catalogPagination(
      input,
      ["name", "price", "duration", "createdAt", "updatedAt"],
      "createdAt",
    );
    const [result] = await this.serviceModel
      .aggregate<{ list: ServiceRow[]; metaCounter: Array<{ total: number }> }>(
        [
          { $match: match },
          { $sort: paging.sort },
          {
            $facet: {
              list: [{ $skip: paging.skip }, { $limit: paging.limit }],
              metaCounter: [{ $count: "total" }],
            },
          },
        ],
      )
      .exec();
    return {
      list: (result?.list ?? []).map((row) => this.output(row)),
      metaCounter: result?.metaCounter.length
        ? result.metaCounter
        : [{ total: 0 }],
    };
  }

  private range(min?: number, max?: number): { $gte?: number; $lte?: number } {
    if (min != null && max != null && min > max)
      throw new BadRequestException("Minimum must not exceed maximum");
    return {
      ...(min != null ? { $gte: min } : {}),
      ...(max != null ? { $lte: max } : {}),
    };
  }
}
