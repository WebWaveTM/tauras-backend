import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '~/config/config.service';

import { AccessTokenService } from '../access-token.service';
import { ACCESS_TOKEN_STRATEGY_NAME, type TokenPayload } from '../const';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  ACCESS_TOKEN_STRATEGY_NAME
) {
  private logger = new Logger(AccessTokenStrategy.name);

  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly reflector: Reflector,
    configService: AppConfigService
  ) {
    super({
      algorithms: ['RS256'],
      audience: configService.get('JWT_AUDIENCE'),
      ignoreExpiration: false,
      issuer: configService.get('JWT_ISSUER'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKey: configService.get('ACCESS_PUBLIC_KEY'),
    });
  }

  async validate(req: Request, payload: TokenPayload) {
    const user = await this.accessTokenService.validate(payload);

    if (!user) {
      return false;
    }

    req.accessToken = payload;

    return user;
  }
}
