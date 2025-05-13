import type Redis from 'ioredis';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { numbers } from 'nanoid-dictionary';

import { AppConfigService } from '~/config/config.service';
import { REDIS_CLIENT } from '~/infrastructure/database/redis/redis.module';
import { MailService } from '~/infrastructure/mail/mail.service';

import { UserService } from '../user/user.service';

export const PASSCODE_LENGTH = 6;
const CODE_PLACEHOLDER = '{code}';
const PASSCODE_REDIS_PREFIX = 'verify-email-passcode';
const PASSCODE_CREATED_AT_REDIS_PREFIX = `${PASSCODE_REDIS_PREFIX}:createdAt`;
const passcodeGenerator = customAlphabet(numbers);

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly config: AppConfigService,
    private readonly userService: UserService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis
  ) {}

  private async generateCode() {
    this.logger.log('Generating verification code');
    const result = passcodeGenerator(PASSCODE_LENGTH);
    this.logger.log(`Generated code: ${result}`);
    return result;
  }

  async sendVerificationCode(email: string, name: string, code: string) {
    this.logger.log(
      `Sending verification code to ${email} (name: ${name}), code: ${code}`
    );
    await this.mailService.sendMail(email, 'Подтверждение почты', {
      data: {
        code,
        link: this.config
          .get('VERIFY_EMAIL_LINK')
          .replace(CODE_PLACEHOLDER, code),
        name,
      },
      id: 'verifyEmail',
    });
    this.logger.log(`Verification email sent to ${email}`);
  }

  async getNextResendDate(email: string): Promise<null | string> {
    this.logger.log(`Getting elapsed time for ${email}`);
    const createdAtKey = `${PASSCODE_CREATED_AT_REDIS_PREFIX}:${email}`;
    const passcodeResendRate = this.config.get(
      'VERIFY_EMAIL_PASSCODE_RESEND_RATE'
    );
    const createdAt = await this.redis.get(createdAtKey);
    if (!createdAt) {
      this.logger.log(`No passcode found for ${email}`);
      return null;
    }
    const createdAtTimestamp = parseInt(createdAt, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeElapsed = currentTimestamp - createdAtTimestamp;
    this.logger.log(
      `Time elapsed since last request for ${email}: ${timeElapsed} seconds`
    );
    if (timeElapsed < passcodeResendRate) {
      this.logger.log(
        `Request not allowed for ${email}, please wait ${
          passcodeResendRate - timeElapsed
        } seconds`
      );
      return new Date(
        (createdAtTimestamp + passcodeResendRate) * 1000
      ).toISOString();
    }
    this.logger.log(`Request allowed for ${email}`);
    return null;
  }

  async isRequestAllowed(email: string) {
    this.logger.log(`Checking if request is allowed for ${email}`);
    const nextResendDate = await this.getNextResendDate(email);
    if (nextResendDate) {
      this.logger.log(
        `Request not allowed for ${email}, please wait until ${nextResendDate}`
      );
      return false;
    }

    this.logger.log(`Request allowed for ${email}`);
    return true;
  }

  async requestEmailVerification(email: string, name: string) {
    this.logger.log(
      `Requesting email verification for ${email} (name: ${name})`
    );
    const isAllowed = await this.isRequestAllowed(email);
    if (!isAllowed) {
      this.logger.log(
        `Request not allowed for ${email}, please wait before trying again`
      );
      return null;
    }
    this.logger.log(`Generating verification code for ${email}`);
    const code = await this.generateCode();
    await this.sendVerificationCode(email, name, code);
    const redisKey = `${PASSCODE_REDIS_PREFIX}:${email}`;
    const createdAtKey = `${PASSCODE_CREATED_AT_REDIS_PREFIX}:${email}`;
    const passcodeLifetime = this.config.get('VERIFY_EMAIL_PASSCODE_LIFETIME');
    this.logger.log(
      `Saving code for ${email} in Redis with key ${redisKey} and TTL ${passcodeLifetime}`
    );
    await this.redis.setex(redisKey, passcodeLifetime, code);
    await this.redis.setex(
      createdAtKey,
      passcodeLifetime,
      Math.floor(Date.now() / 1000).toString()
    );
    this.logger.log(`Verification code for ${email} saved in Redis`);
    return code;
  }

  async verifyEmail(userId: number, email: string, code: string) {
    this.logger.log(`Verifying email ${email} with code ${code}`);
    const redisKey = `${PASSCODE_REDIS_PREFIX}:${email}`;
    const createdAtKey = `${PASSCODE_CREATED_AT_REDIS_PREFIX}:${email}`;
    const storedCode = await this.redis.get(redisKey);
    if (!storedCode) {
      this.logger.log(`No verification code found for ${email}`);
      return false;
    }
    if (storedCode !== code) {
      this.logger.log(`Verification code for ${email} is incorrect`);
      return false;
    }
    await this.redis.del(redisKey);
    await this.redis.del(createdAtKey);
    await this.userService.update(userId, {
      isEmailVerified: true,
    });
    this.logger.log(`Email ${email} verified successfully`);
    return true;
  }
}
