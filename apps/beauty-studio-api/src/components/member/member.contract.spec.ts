jest.mock("../../libs/config", () => ({
  availableMasterSorts: ["createdAt"],
  availableMemberSorts: ["createdAt"],
}));
import { Test } from "@nestjs/testing";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { GUARDS_METADATA } from "@nestjs/common/constants";
import { printSchema } from "graphql";
import { MemberResolver } from "./member.resolver";
import { RolesGuard } from "../auth/guards/roles.guard";
import { MemberType } from "../../libs/enums/member.enum";
import MemberSchema from "../../schemas/Member.model";

describe("Member role contracts", () => {
  it("exposes new roles and separate privileged inputs without legacy member counters", async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    try {
      const schema = await module
        .get(GraphQLSchemaFactory)
        .create([MemberResolver]);
      const printed = printSchema(schema);
      expect(printed).toContain("getMasters");
      expect(printed).not.toContain("getAgents");
      expect(printed).not.toContain("memberProperties");
      expect(printed).not.toContain("memberRank");
      expect(printed).toContain("RECEPTIONIST");
      const signup = schema.getType("MemberInput");
      expect(String(signup)).toBe("MemberInput");
      const selfInput = printed.match(/input MemberUpdate \{([^}]+)\}/)?.[1];
      expect(selfInput).not.toContain("memberType");
      expect(selfInput).not.toContain("memberStatus");
      expect(MemberSchema.path("memberProperties")).toBeUndefined();
      expect(MemberSchema.path("memberType").options.default as unknown).toBe(
        MemberType.CLIENT,
      );
    } finally {
      await module.close();
    }
  });
  it("restricts staff provisioning/role changes to ADMIN and client directory to staff", () => {
    for (const [name, roles] of [
      ["createStaffMember", [MemberType.ADMIN]],
      ["updateMemberByAdmin", [MemberType.ADMIN]],
      ["getClientsForStaff", [MemberType.ADMIN, MemberType.RECEPTIONIST]],
    ] as const) {
      const method = Object.getOwnPropertyDescriptor(
        MemberResolver.prototype,
        name,
      )?.value as object;
      expect(Reflect.getMetadata("roles", method) as unknown).toEqual(roles);
      expect(Reflect.getMetadata(GUARDS_METADATA, method) as unknown).toEqual([
        RolesGuard,
      ]);
    }
  });
});
