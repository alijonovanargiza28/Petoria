import { Model, Types } from "mongoose";
import { NotFoundException } from "@nestjs/common";
import { ServiceService } from "./service.service";
import { ServiceRecord } from "../../schemas/Service.model";
import { CategoryService } from "../category/category.service";
import { ServiceStatus } from "../../libs/enums/service.enum";
import { ServicesInquiry } from "../../libs/dto/service/service.input";

const categoryId = new Types.ObjectId();
const serviceId = new Types.ObjectId();
const row = {
  _id: serviceId,
  categoryId,
  name: "Haircut",
  price: 100000,
  duration: 30,
  serviceStatus: ServiceStatus.ACTIVE,
  serviceViews: 0,
  serviceLikes: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const query = (result: unknown) => ({
  lean: () => ({ exec: () => Promise.resolve(result) }),
});

describe("Service catalog behavior (offline)", () => {
  const model = {
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
  };
  const categories = {
    requireActiveCategory: jest.fn(),
    activeCategoryIds: jest.fn(),
  };
  let service: ServiceService;

  beforeEach(() => {
    jest.resetAllMocks();
    categories.requireActiveCategory.mockResolvedValue(undefined);
    categories.activeCategoryIds.mockResolvedValue([categoryId]);
    service = new ServiceService(
      model as unknown as Model<ServiceRecord>,
      categories as unknown as CategoryService,
    );
  });

  it("rejects a missing/inactive category before creating anything", async () => {
    categories.requireActiveCategory.mockRejectedValue(new NotFoundException());
    await expect(
      service.createService({
        categoryId: categoryId.toString(),
        name: "Haircut",
        price: 100000,
        duration: 30,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.create).not.toHaveBeenCalled();
  });

  it("ignores injected owner and engagement counters", async () => {
    model.create.mockResolvedValue({ ...row, toObject: () => row });
    const input = {
      categoryId: categoryId.toString(),
      name: "Haircut",
      price: 100000,
      duration: 30,
      masterId: "injected",
      serviceViews: 99,
    };
    await service.createService(input);
    expect(model.create).toHaveBeenCalledWith({
      categoryId: categoryId.toString(),
      name: "Haircut",
      price: 100000,
      duration: 30,
    });
  });

  it("archives with a validated update rather than deleting", async () => {
    model.findOne.mockReturnValue(query(row));
    model.findOneAndUpdate.mockReturnValue(
      query({ ...row, serviceStatus: ServiceStatus.DELETE }),
    );
    const result = await service.updateService({
      _id: serviceId.toString(),
      serviceStatus: ServiceStatus.DELETE,
    });
    expect(result.serviceStatus).toBe(ServiceStatus.DELETE);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: serviceId, serviceStatus: { $ne: ServiceStatus.DELETE } },
      { $set: { serviceStatus: ServiceStatus.DELETE } },
      { new: true, runValidators: true },
    );
  });

  it("rejects attempts to reactivate an archived service", async () => {
    model.findOne.mockReturnValue(query(null));
    await expect(
      service.updateService({
        _id: serviceId.toString(),
        serviceStatus: ServiceStatus.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("requires an active category on reactivation or reassignment", async () => {
    model.findOne.mockReturnValue(
      query({ ...row, serviceStatus: ServiceStatus.PAUSE }),
    );
    categories.requireActiveCategory.mockRejectedValue(new NotFoundException());
    await expect(
      service.updateService({
        _id: serviceId.toString(),
        serviceStatus: ServiceStatus.ACTIVE,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("hides a service whose category is inactive", async () => {
    model.findOne.mockReturnValue(query(row));
    categories.requireActiveCategory.mockRejectedValue(new NotFoundException());
    await expect(
      service.getService(serviceId.toString()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("public discovery forces active status and active category despite supplied DELETE filter", async () => {
    model.aggregate.mockReturnValue({
      exec: () =>
        Promise.resolve([{ list: [row], metaCounter: [{ total: 1 }] }]),
    });
    const result = await service.getServices({
      ...new ServicesInquiry(),
      serviceStatus: ServiceStatus.DELETE,
      text: ".*",
    });
    expect(result.list[0]._id).toBe(serviceId.toString());
    const calls = model.aggregate.mock.calls as unknown as Array<
      [
        Array<{
          $match?: {
            serviceStatus: ServiceStatus;
            categoryId: { $in: Types.ObjectId[] };
            name: RegExp;
          };
        }>,
      ]
    >;
    const pipeline = calls[0][0];
    expect(pipeline[0].$match?.serviceStatus).toBe(ServiceStatus.ACTIVE);
    expect(pipeline[0].$match?.categoryId).toEqual({ $in: [categoryId] });
    expect(pipeline[0].$match?.name.test("anything")).toBe(false);
    expect(pipeline[0].$match?.name.test("literal .*")).toBe(true);
  });

  it("admin discovery can include archived records and returns zero for empty results", async () => {
    model.aggregate.mockReturnValue({
      exec: () => Promise.resolve([{ list: [], metaCounter: [] }]),
    });
    await expect(
      service.getServices(
        { ...new ServicesInquiry(), serviceStatus: ServiceStatus.DELETE },
        true,
      ),
    ).resolves.toEqual({ list: [], metaCounter: [{ total: 0 }] });
    expect(categories.activeCategoryIds).not.toHaveBeenCalled();
  });

  it("rejects reversed ranges and unapproved sorting", async () => {
    await expect(
      service.getServices(
        { ...new ServicesInquiry(), minPrice: 20, maxPrice: 10 },
        true,
      ),
    ).rejects.toThrow("Minimum");
    await expect(
      service.getServices({ ...new ServicesInquiry(), sort: "$where" }, true),
    ).rejects.toThrow("sorting");
    expect(model.aggregate).not.toHaveBeenCalled();
  });
});
