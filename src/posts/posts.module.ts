import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, User]), AuthModule, UsersModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsModule],
})
export class PostsModule {}
