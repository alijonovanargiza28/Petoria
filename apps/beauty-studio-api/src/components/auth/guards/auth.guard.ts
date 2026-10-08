import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "../auth.service";
import { Member } from "../../../libs/dto/member/member";

export interface MemberRequest {
  headers: { authorization?: string };
  body: { authMember?: Member | null };
}
export function bearerToken(request: MemberRequest): string {
  const match = request.headers.authorization?.match(/^Bearer (\S+)$/);
  if (!match) throw new UnauthorizedException("Bearer token required");
  return match[1];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== "graphql") return false;
    const { req } = context.getArgByIndex<{ req: MemberRequest }>(2);
    req.body.authMember = await this.authService.verifyToken(bearerToken(req));
    return true;
  }
}
