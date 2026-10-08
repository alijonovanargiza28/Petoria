import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { AuthService } from "./auth.service";
import { Member } from "../../libs/dto/member/member";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";

const id = "012345678901234567890123";
describe("Beauty Studio JWT authorization", () => {
  const jwt = { verifyAsync: jest.fn(), signAsync: jest.fn() };
  const model = { findById: jest.fn() };
  const auth = new AuthService(
    jwt as unknown as JwtService,
    model as unknown as Model<Member>,
  );
  const member = {
    _id: id,
    memberType: MemberType.CLIENT,
    memberStatus: MemberStatus.ACTIVE,
    authVersion: 0,
    memberPassword: "never-in-token",
  };
  beforeEach(() => {
    jest.resetAllMocks();
    jwt.verifyAsync.mockResolvedValue({
      sub: id,
      memberType: MemberType.CLIENT,
      authVersion: 0,
      formatVersion: 1,
    });
    model.findById.mockReturnValue({
      lean: () => ({ exec: () => Promise.resolve(member) }),
    });
  });
  it.each(["USER", "AGENT"])(
    "rejects obsolete %s before database lookup",
    async (role) => {
      jwt.verifyAsync.mockResolvedValue({
        sub: id,
        memberType: role,
        authVersion: 0,
        formatVersion: 1,
      });
      await expect(auth.verifyToken("old")).rejects.toThrow(
        "Fresh authentication",
      );
      expect(model.findById).not.toHaveBeenCalled();
    },
  );
  it("rejects old token formats including ADMIN", async () => {
    jwt.verifyAsync.mockResolvedValue({
      _id: id,
      memberType: MemberType.ADMIN,
    });
    await expect(auth.verifyToken("old")).rejects.toThrow(
      "Fresh authentication",
    );
  });
  it.each([
    { ...member, memberStatus: MemberStatus.BLOCK },
    { ...member, memberType: MemberType.MASTER },
    { ...member, authVersion: 1 },
    null,
  ])(
    "rejects revoked, changed, blocked or missing accounts (%#)",
    async (row) => {
      model.findById.mockReturnValue({
        lean: () => ({ exec: () => Promise.resolve(row) }),
      });
      await expect(auth.verifyToken("stale")).rejects.toThrow(
        "Fresh authentication",
      );
    },
  );
  it("accepts a fresh matching active account", async () => {
    await expect(auth.verifyToken("fresh")).resolves.toMatchObject({
      memberType: MemberType.CLIENT,
    });
  });
  it("signs minimal versioned claims without private member data", async () => {
    jwt.signAsync.mockResolvedValue("fresh");
    await auth.createToken(member as Member);
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: id,
      memberType: MemberType.CLIENT,
      authVersion: 0,
      formatVersion: 1,
    });
  });
});
