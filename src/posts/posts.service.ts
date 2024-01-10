import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, MoreThanOrEqual, Repository, getRepository } from 'typeorm';

import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto, id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    const newPost = this.postRepo.create(createPostDto);
    newPost.user = user;
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
      relations: {
        user: true,
      },
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

  async findByTitle(title: string) {
    console.log(title);
    return await this.postRepo.find({
      where: {
        title: ILike(`%${title}%`),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: true,
      },
      select: {
        title: true,
        description: true,
        picture: true,
        likes: true,
        user: {
          userName: true,
        },
      },
    });
  }

  findPost(id: number) {
    return this.postRepo.find({
      where: { user: { id } },
    });
  }

  async author(id: number) {
    const post: Post = await this.findOne(id);
    return post.user.id;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return this.postRepo.update(id, updatePostDto);
  }

  remove(id: number) {
    return this.postRepo.delete({ id });
  }

  async getLikes(id: number) {
    const post: Post = await this.findOne(id);
    return post.likes;
  }

  async likePost(id: number): Promise<boolean> {
    const likes = this.postRepo.createQueryBuilder('post');
    likes.select(['wholikes']).where({ id: id });

    console.log(likes);

    const post = this.findOne(id);
    if (post) {
      (await post).likes++;
      return true;
    }
    return false;
  }
}
