import type Redis from 'ioredis';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { AppConfigService } from '~/config/config.service';
import { REDIS_CLIENT } from '~/infrastructure/database/redis/redis.module';
import { UserService } from '~/modules/user/user.service';

import {
  BANNED_ACCESS_TOKEN_ID_REDIS_PREFIX,
  getAccessSignOptions,
  type SignTokenPayload,
  type TokenPayload,
} from './const';

@Injectable()
export class AccessTokenService {
  private readonly logger = new Logger(AccessTokenService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService
  ) {}

  async create(userId: number) {
    this.logger.log(`Creating access token for user ID: ${userId}`);
    const tokenId = randomUUID();
    const token = await this.jwtService.signAsync(
      { jti: tokenId, sub: userId } satisfies SignTokenPayload,
      getAccessSignOptions(this.configService)
    );
    this.logger.debug(`Generated access token ID: ${tokenId}, token: ${token}`);
    return token;
  }

  async validate(payload: TokenPayload) {
    this.logger.log(`Validating access token with ID: ${payload.jti}`);
    this.logger.debug(`Payload: ${JSON.stringify(payload)}`);
    const tokenId = payload.jti;
    this.logger.debug(`Token ID: ${tokenId}`);
    const isBanned = await this.redis.exists(
      `${BANNED_ACCESS_TOKEN_ID_REDIS_PREFIX}:${tokenId}`
    );
    this.logger.debug(`Is token banned: ${isBanned}`);
    const user = await this.userService.findOne(payload.sub);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    if (isBanned || !user?.password) {
      return null;
    }
    this.logger.log(`Access token with ID: ${tokenId} is valid`);
    this.logger.debug(`User ID: ${user.id}`);
    return user;
  }

  async ban(payload: TokenPayload) {
    this.logger.log(`Banning access token with ID: ${payload.jti}`);
    const key = `${BANNED_ACCESS_TOKEN_ID_REDIS_PREFIX}:${payload.jti}`;
    this.logger.debug(`Redis key: ${key}`);
    const expiration = payload.exp - Math.floor(Date.now() / 1000);
    this.logger.debug(`Token expiration: ${expiration}`);

    await this.redis.set(key, '1', 'EX', expiration);
    this.logger.debug(`Access token with ID: ${payload.jti} banned`);
    this.logger.log(`Access token with ID: ${payload.jti} banned successfully`);
  }
}
