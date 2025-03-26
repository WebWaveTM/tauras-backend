import bcrypt from 'bcrypt';

import { UserService } from '~/user/user.service';

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.userService.signJwt(payload),
    };
  }

  async register(user: any) {
    return this.userService.create(user);
  }
}
