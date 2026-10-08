import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Member } from "../../libs/dto/member/member";
import { MemberStatus, MemberType } from "../../libs/enums/member.enum";

const passwordHasher = bcrypt as unknown as {
  hash(password: string, rounds: number): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
};

interface MemberClaims {
  sub: string;
  memberType: MemberType;
  authVersion: number;
  formatVersion: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel("Member") private readonly memberModel: Model<Member>,
  ) {}

  hashPassword(password: string): Promise<string> {
    return passwordHasher.hash(password, 10);
  }
  comparePassword(password: string, hash: string): Promise<boolean> {
    return passwordHasher.compare(password, hash);
  }

  createToken(member: Member): Promise<string> {
    if (!Object.values(MemberType).includes(member.memberType))
      throw new UnauthorizedException("Account role migration required");
    return this.jwtService.signAsync({
      sub: member._id.toString(),
      memberType: member.memberType,
      authVersion: member.authVersion ?? 0,
      formatVersion: 1,
    });
  }

  async verifyToken(token: string): Promise<Member> {
    let claims: MemberClaims;
    try {
      claims = await this.jwtService.verifyAsync<MemberClaims>(token);
    } catch {
      throw new UnauthorizedException("Fresh authentication required");
    }
    if (
      claims.formatVersion !== 1 ||
      !Object.values(MemberType).includes(claims.memberType) ||
      !Types.ObjectId.isValid(claims.sub) ||
      !Number.isInteger(claims.authVersion)
    )
      throw new UnauthorizedException("Fresh authentication required");
    const member = await this.memberModel.findById(claims.sub).lean().exec();
    if (
      !member ||
      member.memberStatus !== MemberStatus.ACTIVE ||
      member.memberType !== claims.memberType ||
      (member.authVersion ?? 0) !== claims.authVersion
    )
      throw new UnauthorizedException("Fresh authentication required");
    return { ...member, _id: member._id.toString() };
  }
}
