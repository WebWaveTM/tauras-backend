import type Redis from 'ioredis';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

import { AppConfigService } from '~/config/config.service';
import { REDIS_CLIENT } from '~/infrastructure/database/redis/redis.module';
import { MailService } from '~/infrastructure/mail/mail.service';

import { UserService } from '../user/user.service';

const TOKEN_LENGTH = 32;
const TOKEN_REDIS_PREFIX = 'password-reset-token';

const tokenGenerator = customAlphabet(alphanumeric);

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: AppConfigService,
    private readonly mailService: MailService,
    private readonly userService: UserService
  ) {}

  private generateToken(): string {
    this.logger.log('Generating password reset token');
    const token = tokenGenerator(TOKEN_LENGTH);
    this.logger.log(`Generated token: ${token}`);
    return token;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    this.logger.log(`Requesting password reset for ${email}`);
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      return false;
    }

    const token = this.generateToken();
    const expirationTime = this.config.get('RESTORE_PASSWORD_TOKEN_LIFETIME');

    this.redis.setex(`${TOKEN_REDIS_PREFIX}:${email}`, expirationTime, token);

    this.mailService.sendMail(email, 'Сброс пароля', {
      data: {
        link: this.config.get('RESTORE_PASSWORD_LINK'),
        name: user.fullName,
      },
      id: 'restorePassword',
    });

    return true;
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ): Promise<boolean> {
    this.logger.log(`Resetting password with token ${token}`);
    const storedToken = await this.redis.get(`${TOKEN_REDIS_PREFIX}:${email}`);
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      return false;
    }

    if (!storedToken || storedToken !== token) {
      this.logger.warn(`Invalid or expired token for ${email}`);
      return false;
    }

    await this.userService.update(user.id, {
      password: newPassword,
    });
    await this.redis.del(`${TOKEN_REDIS_PREFIX}:${email}`);

    return true;
  }
}
