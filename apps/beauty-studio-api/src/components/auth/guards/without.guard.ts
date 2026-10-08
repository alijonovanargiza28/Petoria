import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { bearerToken, MemberRequest } from "./auth.guard";

@Injectable()
export class WithoutGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== "graphql") return false;
    const { req } = context.getArgByIndex<{ req: MemberRequest }>(2);
    req.body.authMember = req.headers.authorization
      ? await this.authService.verifyToken(bearerToken(req))
      : null;
    return true;
  }
}
