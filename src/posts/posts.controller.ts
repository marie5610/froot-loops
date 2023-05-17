import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/models/role.model';
import { PayloadToken } from 'src/auth/models/token.model';
import { UserIsAuthorGuard } from 'src/auth/guards/user-is-author.guard';

export const storage = {
  storage: diskStorage({
    destination: './uploads/posts',
    filename: (req, file, cb) => {
      const filename: string = file.originalname.split('.')[0] + uuidv4();
      cb(null, `${filename}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|PNG)$/)) {
      return cb(new Error('Invalid format type'), false);
    }
    cb(null, true);
  },
};

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  create(@Req() request: Request, @Body() createPostDto: CreatePostDto) {
    const user = request.user as PayloadToken;
    createPostDto.userId = user.sub;
    return this.postsService.create(createPostDto);
  }

  @Roles(Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard, UserIsAuthorGuard)
  @Patch('picture/:id')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    return this.postsService.uploadFile(file.path, +id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.USER)
  profile(@Req() request: Request) {
    const user = request.user as PayloadToken;
    return this.postsService.findPost(user.sub);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('search')
  findBy(@Query('query') query: string) {
    return this.postsService.findBy(query);
  }

  @UseGuards(JwtAuthGuard, RoleGuard, UserIsAuthorGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard, UserIsAuthorGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
