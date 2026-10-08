// Catalog tests do not execute legacy upload/UUID helpers.
jest.mock("./config", () => ({ shapeIntoMongoObjectId: (id: string) => id }));

import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { CategoryModule } from "../components/category/category.module";
import { ServiceModule } from "../components/service/service.module";
import { AuthService } from "../components/auth/auth.service";
import { Test } from "@nestjs/testing";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { printSchema } from "graphql";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { CategoryResolver } from "../components/category/category.resolver";
import { ServiceResolver } from "../components/service/service.resolver";
import { RolesGuard } from "../components/auth/guards/roles.guard";
import { MemberType } from "./enums/member.enum";
import { ServiceInput, ServicesInquiry } from "./dto/service/service.input";
import { ServiceUpdate } from "./dto/service/service.update";
import { CategoryInput } from "./dto/category/category.input";
import CategorySchema from "../schemas/Category.model";
import ServiceSchema from "../schemas/Service.model";
import { catalogId } from "./catalog.helpers";

describe("Catalog contracts (no database)", () => {
  it("wires both modules with mocked models and no Mongo connection", async () => {
    const module = await Test.createTestingModule({
      imports: [CategoryModule, ServiceModule],
    })
      .overrideProvider(getModelToken("Member"))
      .useValue({})
      .overrideProvider(getModelToken("Category"))
      .useValue({})
      .overrideProvider(getModelToken("Service"))
      .useValue({})
      .compile();
    try {
      expect(module.get(CategoryResolver)).toBeInstanceOf(CategoryResolver);
      expect(module.get(ServiceResolver)).toBeInstanceOf(ServiceResolver);
    } finally {
      await module.close();
    }
  });

  it.each([MemberType.CLIENT, MemberType.MASTER, MemberType.RECEPTIONIST])(
    "denies %s using the existing guard",
    async (role) => {
      const auth = {
        verifyToken: jest.fn().mockResolvedValue({ memberType: role }),
      };
      const guard = new RolesGuard(
        new Reflector(),
        auth as unknown as AuthService,
      );
      const method = Object.getOwnPropertyDescriptor(
        ServiceResolver.prototype,
        "createService",
      )?.value as object;
      const request = {
        headers: { authorization: "Bearer offline-test" },
        body: {},
      };
      const context = {
        getHandler: () => method,
        getType: () => "graphql",
        getArgByIndex: () => ({ req: request }),
      } as unknown as ExecutionContext;
      await expect(guard.canActivate(context)).rejects.toThrow(
        "ONLY_SPECIFIC_ROLES_ALLOWED",
      );
    },
  );

  it("generates the catalog GraphQL contract without bootstrapping the application", async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    try {
      const schema = await module
        .get(GraphQLSchemaFactory)
        .create([CategoryResolver, ServiceResolver]);
      const printed = printSchema(schema);
      for (const field of [
        "createCategory",
        "updateCategory",
        "getCategoriesByAdmin",
        "getCategories",
        "createService",
        "updateService",
        "getServicesByAdmin",
        "getServices",
        "getService",
      ])
        expect(printed).toContain(field);
      expect(printed).toContain("enum ServiceStatus");
      expect(printed).not.toContain("masterId");
      expect(printed).not.toContain("Appointment");
    } finally {
      await module.close();
    }
  });

  it("protects all mutations/admin queries with the existing ADMIN RolesGuard", () => {
    for (const [prototype, name] of [
      [CategoryResolver.prototype, "createCategory"],
      [CategoryResolver.prototype, "updateCategory"],
      [CategoryResolver.prototype, "getCategoriesByAdmin"],
      [ServiceResolver.prototype, "createService"],
      [ServiceResolver.prototype, "updateService"],
      [ServiceResolver.prototype, "getServicesByAdmin"],
    ] as const) {
      const method = Object.getOwnPropertyDescriptor(prototype, name)
        ?.value as object;
      expect(Reflect.getMetadata("roles", method) as unknown).toEqual([
        MemberType.ADMIN,
      ]);
      expect(Reflect.getMetadata(GUARDS_METADATA, method) as unknown).toEqual([
        RolesGuard,
      ]);
    }
    expect(Object.values(MemberType)).toEqual([
      "CLIENT",
      "MASTER",
      "RECEPTIONIST",
      "ADMIN",
    ]);
  });

  it("validates references, money, duration, names and pagination", async () => {
    expect(
      await validate(
        plainToInstance(ServiceInput, {
          categoryId: "invalid",
          name: "",
          price: -1,
          duration: 1.5,
        }),
      ),
    ).toHaveLength(4);
    expect(
      await validate(plainToInstance(CategoryInput, { name: "", sort: -1 })),
    ).toHaveLength(2);
    expect(
      await validate(plainToInstance(ServicesInquiry, { limit: 101 })),
    ).toHaveLength(1);
    expect(() => catalogId("invalid")).toThrow("Invalid catalog ID");
  });

  it("allows partial updates but rejects explicit null required fields", async () => {
    const id = "012345678901234567890123";
    expect(
      await validate(plainToInstance(ServiceUpdate, { _id: id, price: 0 })),
    ).toHaveLength(0);
    expect(
      await validate(
        plainToInstance(ServiceUpdate, { _id: id, duration: null }),
      ),
    ).toHaveLength(1);
  });

  it("declares no owner or legacy fields and never auto-creates collections/indexes", () => {
    expect(ServiceSchema.path("masterId")).toBeUndefined();
    expect(ServiceSchema.path("propertyTitle")).toBeUndefined();
    expect(ServiceSchema.options.collection).toBe("services");
    expect(CategorySchema.options.collection).toBe("categories");
    for (const schema of [ServiceSchema, CategorySchema]) {
      expect(schema.options.autoCreate).toBe(false);
      expect(schema.options.autoIndex).toBe(false);
    }
  });
});
