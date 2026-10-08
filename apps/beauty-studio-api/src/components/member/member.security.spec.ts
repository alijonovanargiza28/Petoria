jest.mock("../../libs/config", () => ({
  shapeIntoMongoObjectId: (id: string) => id,
  lookupAuthMemberLiked: () => ({}),
}));
import { Model, Types } from "mongoose";
import { MemberService } from "./member.service";
import { AuthService } from "../auth/auth.service";
import { ViewService } from "../view/view.service";
import { LikeService } from "../like/like.service";
import { Member } from "../../libs/dto/member/member";
import { MemberType } from "../../libs/enums/member.enum";
import { Follower, Following } from "../../libs/dto/follow/follow";
import {} from "../../libs/dto/member/member.input";
import { MemberUpdate } from "../../libs/dto/member/member.update";

const id = new Types.ObjectId();
describe("Member provisioning and privilege boundaries", () => {
  const model = {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
  };
  const auth = { hashPassword: jest.fn(), createToken: jest.fn() };
  const service = new MemberService(
    model as unknown as Model<Member>,
    {} as Model<Follower | Following>,
    auth as unknown as AuthService,
    {} as ViewService,
    {} as LikeService,
  );
  beforeEach(() => {
    jest.resetAllMocks();
    auth.hashPassword.mockResolvedValue("hashed");
    auth.createToken.mockResolvedValue("fresh");
    model.create.mockResolvedValue({ _id: id, memberType: MemberType.CLIENT });
    model.findOneAndUpdate.mockReturnValue({
      exec: () => Promise.resolve({ _id: id, memberType: MemberType.CLIENT }),
    });
  });
  it("forces CLIENT signup even with injected privileged fields", async () => {
    const input = {
      memberNick: "client",
      memberPhone: "123",
      memberPassword: "password",
      memberType: MemberType.ADMIN,
      memberStatus: "ACTIVE",
    };
    await service.signup(input);
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        memberType: MemberType.CLIENT,
        memberPassword: "hashed",
      }),
    );
  });
  it.each([MemberType.MASTER, MemberType.RECEPTIONIST, MemberType.ADMIN])(
    "allows ADMIN provisioning of %s with hashed passwords",
    async (role) => {
      await service.createStaffMember({
        memberNick: "staff",
        memberPhone: "456",
        memberPassword: "password",
        memberType: role,
      });
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({ memberType: role, memberPassword: "hashed" }),
      );
    },
  );
  it("does not permit CLIENT through the staff provisioning workflow", async () => {
    await expect(
      service.createStaffMember({
        memberNick: "client",
        memberPhone: "123",
        memberPassword: "password",
        memberType: MemberType.CLIENT,
      }),
    ).rejects.toThrow("Invalid staff role");
    expect(model.create).not.toHaveBeenCalled();
  });
  it("ignores role/status/counter injection into self-update and hashes password", async () => {
    await service.updateMember(id, {
      memberPassword: "newpassword",
      memberType: MemberType.ADMIN,
      memberStatus: "DELETE",
      memberProperties: 99,
    } as MemberUpdate);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { $set: { memberPassword: "hashed" }, $inc: { authVersion: 1 } },
      { runValidators: true, new: true },
    );
  });
  it("master discovery filters only active MASTER records", async () => {
    model.aggregate.mockReturnValue({
      exec: () => Promise.resolve([{ list: [], metaCounter: [] }]),
    });
    await service.getMasters(id, {
      page: 1,
      limit: 20,
      search: {},
    });
    const calls = model.aggregate.mock.calls as unknown as Array<
      [Array<{ $match?: { memberType?: MemberType } }>]
    >;
    expect(calls[0][0][0].$match?.memberType).toBe(MemberType.MASTER);
  });
});
