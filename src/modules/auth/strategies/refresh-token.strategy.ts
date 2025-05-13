import type { Request } from 'express';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import { AppConfigService } from '~/config/config.service';

import type { UnauthorizedExceptionPayload } from '../types/exceptions.types';

import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_STRATEGY_NAME,
  type TokenPayload,
} from '../const';
import { RefreshTokenService } from '../refresh-token.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  REFRESH_TOKEN_STRATEGY_NAME
) {
  constructor(
    private readonly refreshTokenService: RefreshTokenService,
    configService: AppConfigService
  ) {
    super({
      algorithms: ['RS256'],
      audience: configService.get('JWT_AUDIENCE'),
      ignoreExpiration: false,
      issuer: configService.get('JWT_ISSUER'),
      jwtFromRequest: (req: Request) => req.cookies[REFRESH_TOKEN_COOKIE],
      secretOrKey: configService.get('REFRESH_PUBLIC_KEY'),
    });
  }

  async validate(payload: TokenPayload) {
    const refreshToken = await this.refreshTokenService.validate(payload);
    if (!refreshToken) {
      throw new UnauthorizedException({
        message: 'Invalid refresh token',
        type: 'invalid_token',
      } satisfies UnauthorizedExceptionPayload);
    }

    return payload;
  }
}
