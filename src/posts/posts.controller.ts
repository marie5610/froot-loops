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
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { ApiTags } from '@nestjs/swagger';

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

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  //publicar post con imagenes
  @Roles(Role.USER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
    @Body() createPostDto: CreatePostDto,
  ) {
    const user = request.user as PayloadToken;
    createPostDto.picture = file.path;
    this.postsService.create(createPostDto, user.sub);
    return createPostDto;
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
  findByTitle(@Query('title') title: string) {
    return this.postsService.findByTitle(title);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Patch(':id/likes')
  likes(@Param('id') id: string) {
    return this.postsService.likePost(+id);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
