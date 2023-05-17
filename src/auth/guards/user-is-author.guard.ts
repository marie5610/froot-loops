/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const userId = +params.id;
    const user = request.user as PayloadToken;
    if (userId === user.sub) {
      return true;
    }
    return false;
  }
}
