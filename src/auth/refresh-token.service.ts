import type { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';

import { AppConfigService } from '~/config/config.service';
import { PrismaService } from '~/prisma/prisma.service';

import {
  getRefreshSignOptions,
  type SignTokenPayload,
  type TokenPayload,
} from './const';

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService
  ) {}

  async create(userId: number) {
    this.logger.log(`Creating refresh token for user ID: ${userId}`);
    const tokenId = randomUUID();
    const tokenExpiresIn = this.configService.get('REFRESH_EXPIRES_IN');

    const expiresAt = new Date(Date.now() + tokenExpiresIn * 1000);
    this.logger.debug(
      `Generated token ID: ${tokenId}, expires at: ${expiresAt.toISOString()}`
    );
    await this.txHost.tx.refreshToken.create({
      data: {
        expiresAt,
        tokenId,
        userId,
      },
    });

    this.logger.log(
      `Refresh token stored in the database for user ID: ${userId}`
    );

    const token = await this.jwtService.signAsync(
      { jti: tokenId, sub: userId } satisfies SignTokenPayload,
      getRefreshSignOptions(this.configService)
    );

    this.logger.log(`Refresh token signed for user ID: ${userId}`);

    return token;
  }

  async remove(tokenId: string) {
    this.logger.log(`Removing refresh token with ID: ${tokenId}`);
    await this.txHost.tx.refreshToken.delete({
      where: {
        tokenId,
      },
    });
    this.logger.log(`Refresh token with ID: ${tokenId} removed successfully`);
  }

  async validate(payload: TokenPayload) {
    const refreshToken = await this.txHost.tx.refreshToken.findFirst({
      where: { tokenId: payload.jti, userId: payload.sub },
    });
    this.logger.log(
      `Validating refresh token with ID: ${payload.jti} for user ID: ${payload.sub}`
    );
    if (!refreshToken) {
      this.logger.warn(
        `Refresh token with ID: ${payload.jti} for user ID: ${payload.sub} not found`
      );
      return null;
    }
    this.logger.log(
      `Refresh token with ID: ${payload.jti} for user ID: ${payload.sub} is valid`
    );
    return refreshToken;
  }

  @Cron(CronExpression.EVERY_12_HOURS, { waitForCompletion: true })
  private async invalidateStaleTokens() {
    this.logger.log('Starting stale refresh token cleanup process');
    const now = new Date();

    const deletedTokens = await this.txHost.tx.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    this.logger.log(
      `Deleted ${deletedTokens.count} stale refresh tokens.`,
      'invalidateStaleTokens'
    );
  }
}
