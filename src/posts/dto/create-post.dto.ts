export class CreatePostDto {
  title: string;
  description?: string;
  userId?: number;
  picture?: string;
  likes?: number;
}
