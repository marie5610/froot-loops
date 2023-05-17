import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { Login } from './models/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}
  @Post('login')
  async login(@Body() login: Login) {
    return this.auth.validateUser(login.email, login.password);
  }
}
