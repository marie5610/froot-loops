import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto, UserPagination } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/models/role.model';
import { PayloadToken } from 'src/auth/models/token.model';
import { ValidationPipe } from 'src/common/validation.pipe';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profile',
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

@UseGuards(JwtAuthGuard, RoleGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Patch('picture')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const user = request.user as PayloadToken;
    return this.usersService.uploadFile(file.path, +user.sub);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Get('filter')
  PaginateFilter(@Query() params: UserPagination) {
    return this.usersService.PaginateFilter(params);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get('profile')
  findOne(@Req() request: Request) {
    const user = request.user as PayloadToken;
    return this.usersService.findOne(+user.sub);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Get('search')
  findByName(@Query('name') name: string) {
    return this.usersService.findByName(name);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as PayloadToken;
    if (+user.sub !== +id) {
      throw new UnauthorizedException(
        'No tienes permiso para modificar este perfil',
      );
    }
    return this.usersService.update(+id, updateUserDto);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as PayloadToken;
    if (+user.sub !== +id) {
      throw new UnauthorizedException(
        'No tienes permiso para eliminar este perfil',
      );
    }
    return this.usersService.remove(+id);
  }
}
