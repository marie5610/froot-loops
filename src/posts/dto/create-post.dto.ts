import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsString()
  description?: string;
  @IsNumber()
  @IsNotEmpty()
  userId: number;
  @IsString()
  picture?: string;
  @IsNumber()
  likes?: number;
}
