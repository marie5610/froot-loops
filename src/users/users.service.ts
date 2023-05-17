import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto, UserPagination } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepo.create(createUserDto);
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
    this.userRepo.save(newUser);
    const { password, ...user } = newUser;
    return user;
  }

  async uploadFile(picture: string, id: number) {
    const user = await this.findOne(id);
    user.picture = picture;
    return this.userRepo.update(id, user);
  }

  PaginateFilter(params?: UserPagination) {
    return this.userRepo.find({
      take: +params.limit || 10,
      skip: +params.offset || 0,
      select: {
        name: true,
        userName: true,
        email: true,
      },
      where: {
        name: Like(`%${params.name}%`),
      },
    });
  }

  findAll() {
    return this.userRepo.find({
      select: {
        name: true,
        userName: true,
        email: true,
      },
    });
  }

  async findByName(name: string) {
    const users = await this.userRepo.find({
      where: {
        name: Like(`%${name}%`),
      },
    });
    return users;
  }

  findOne(id: number) {
    return this.userRepo.findOne({
      where: { id },
      select: {
        name: true,
        userName: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    updateUserDto.email = user.email;
    updateUserDto.password = user.password;
    return this.userRepo.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.userRepo.delete({ id });
  }
}
