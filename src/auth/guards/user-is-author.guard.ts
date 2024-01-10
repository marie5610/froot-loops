/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { PostsService } from './../../posts/posts.service';
import { PayloadToken } from '../models/token.model';

@Injectable()
export class UserIsAuthorGuard implements CanActivate {
  constructor(private postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const postId = +params.id;
    const user = request.user as PayloadToken;

    const author = await this.postsService.author(postId);

    if (+author === user.sub) {
      return true;
    }
    return false;
  }
}
