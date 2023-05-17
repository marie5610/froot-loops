import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PayloadToken } from 'src/auth/models/token.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private user: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.user.findByEmail(email);
    if (!user) {
      return 'Email not found';
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return 'Incorrect password';
    } else {
      const payload: PayloadToken = { role: user.role, sub: user.id };
      return {
        access_token: this.jwt.sign(payload),
      };
    }
  }
}
