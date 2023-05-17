/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/role.decorator';
import { Role } from '../models/role.model';
import { PayloadToken } from '../models/token.model';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());
    if (isPublic) {
      return true;
    } else {
      const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
      if (!roles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const user = request.user as PayloadToken;
      const isAuth = roles.some((role) => role === user.role);
      if (!isAuth) {
        throw new UnauthorizedException('your role is wrong');
      }
      return isAuth;
    }
  }
}
