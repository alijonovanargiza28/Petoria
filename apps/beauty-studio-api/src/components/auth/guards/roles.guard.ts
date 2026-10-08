import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";
import { MemberType } from "../../../libs/enums/member.enum";
import { bearerToken, MemberRequest } from "./auth.guard";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<MemberType[]>(
      "roles",
      context.getHandler(),
    );
    if (!roles) return true;
    if (context.getType<string>() !== "graphql") return false;
    const { req } = context.getArgByIndex<{ req: MemberRequest }>(2);
    const member = await this.authService.verifyToken(bearerToken(req));
    if (!roles.includes(member.memberType))
      throw new ForbiddenException("ONLY_SPECIFIC_ROLES_ALLOWED");
    req.body.authMember = member;
    return true;
  }
}
