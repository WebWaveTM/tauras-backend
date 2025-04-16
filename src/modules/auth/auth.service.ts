import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Logger } from '@nestjs/common';

import { UserService } from '~/modules/user/user.service';

import type { TokenPayload, Tokens } from './const';
import type { SignInPayload } from './types/signin.payload';
import type { SignUpPayload } from './types/signup.payload';

import { AccessTokenService } from './access-token.service';
import { RefreshTokenService } from './refresh-token.service';

export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    private readonly accessTokenService: AccessTokenService,
    @Inject(UserService) private readonly userService: UserService
  ) {}

  @Transactional<TransactionalAdapterPrisma>()
  async refreshTokens(oldRefreshTokenPayload: TokenPayload): Promise<Tokens> {
    const userId = oldRefreshTokenPayload.sub;
    this.logger.log(`Refreshing tokens for user ID: ${userId}`);
    await this.refreshTokenService.remove(oldRefreshTokenPayload.jti);
    const refreshToken = await this.refreshTokenService.create(userId);
    this.logger.debug(`Generated refresh token: ${refreshToken}`);

    const accessToken = await this.accessTokenService.create(userId);
    this.logger.debug(`Generated new access token: ${accessToken}`);
    this.logger.log(`Generated new access token for user ID: ${userId}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  @Transactional<TransactionalAdapterPrisma>()
  async signup(payload: SignUpPayload): Promise<Tokens> {
    this.logger.log(`Registering user with email: ${payload.email}`);
    this.logger.debug(`USERSERVICE ${this.userService}`);
    const user = await this.userService.create(payload);
    this.logger.debug(`Created user: ${user}`);

    const refreshToken = await this.refreshTokenService.create(user.id);
    this.logger.debug(`Generated refresh token: ${refreshToken}`);

    const accessToken = await this.accessTokenService.create(user.id);
    this.logger.debug(`Generated access token: ${accessToken}`);

    this.logger.log(
      `User registered successfully with email: ${payload.email}`
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  @Transactional<TransactionalAdapterPrisma>()
  async signin(payload: SignInPayload): Promise<Tokens> {
    this.logger.log('Logging in user');
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      this.logger.warn(`User not found with email: ${payload.email}`);
      return null;
    }

    const refreshToken = await this.refreshTokenService.create(user.id);
    this.logger.debug(`Generated refresh token: ${refreshToken}`);

    const accessToken = await this.accessTokenService.create(user.id);
    this.logger.debug(`Generated access token: ${accessToken}`);

    this.logger.log('User logged in successfully');
    return {
      accessToken,
      refreshToken,
    };
  }

  @Transactional<TransactionalAdapterPrisma>()
  async signout(
    accessPayload: TokenPayload,
    refreshPayload: TokenPayload
  ): Promise<void> {
    this.logger.log(`Signing out user with ID: ${accessPayload.sub}`);
    await this.refreshTokenService.remove(refreshPayload.jti);
    this.logger.debug(`Removed refresh token with ID: ${refreshPayload.jti}`);

    await this.accessTokenService.ban(accessPayload);
    this.logger.debug(`Banned access token with ID: ${accessPayload.jti}`);
    this.logger.log(`User signed out successfully`);
  }
}
