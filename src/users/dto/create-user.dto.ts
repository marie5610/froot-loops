export class CreateUserDto {
  name: string;
  userName: string;
  email: string;
  password: string;
}
export class UserPagination {
  limit?: number;
  offset?: number;
  name?: string;
}
