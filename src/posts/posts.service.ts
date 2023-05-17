import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectRepository(Post) private postRepo: Repository<Post>) {}

  create(createPostDto: CreatePostDto) {
    const newPost = this.postRepo.create(createPostDto);
    this.postRepo.save(newPost);
    return newPost;
  }

  async uploadFile(picture: string, id: number) {
    const post = await this.findOne(id);
    post.picture = picture;
    return this.postRepo.update(id, post);
  }

  findOne(id: number) {
    return this.postRepo.findOne({
      where: { id },
    });
  }

  findAll() {
    const lastDay = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.postRepo.find({
      where: {
        createdAt: MoreThanOrEqual(lastDay),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findBy(query: string) {
    return this.postRepo.find({
      where: {
        title: Like(`%${query}%`),
        description: Like(`%${query}%`),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findPost(id: number) {
    return this.postRepo.find({
      where: { user: { id } },
    });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.postRepo.update(id, updatePostDto);
  }

  remove(id: number) {
    return this.postRepo.delete({ id });
  }
}
