import type { JwtSignOptions } from '@nestjs/jwt';

import type { AppConfigService } from '~/config/config.service';

export type SignTokenPayload = Pick<TokenPayload, 'jti' | 'sub'>;

export type TokenPayload = {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  sub: number;
};

export type Tokens = Record<'accessToken' | 'refreshToken', string>;

export const BANNED_ACCESS_TOKEN_ID_REDIS_PREFIX = 'banned_access_token_id';
export const ACCESS_TOKEN_STRATEGY_NAME = 'accessJwtStrategy';

// Refresh token request property name (ex. req.refreshToken)
export const REFRESH_TOKEN_PROPERTY = 'refreshToken';
export const REFRESH_TOKEN_COOKIE = 'refresh-token';
export const REFRESH_TOKEN_HASH_ROUNDS = 10;
export const REFRESH_TOKEN_STRATEGY_NAME = 'refreshJwtStrategy';

export const getRefreshSignOptions = (
  configService: AppConfigService
): JwtSignOptions => {
  return {
    algorithm: 'RS256',
    audience: configService.get('JWT_AUDIENCE'),
    expiresIn: configService.get('REFRESH_EXPIRES_IN'),
    issuer: configService.get('JWT_ISSUER'),
    privateKey: configService.get('REFRESH_PRIVATE_KEY'),
  };
};

export const getAccessSignOptions = (
  configService: AppConfigService
): JwtSignOptions => {
  return {
    algorithm: 'RS256',
    audience: configService.get('JWT_AUDIENCE'),
    expiresIn: configService.get('ACCESS_EXPIRES_IN'),
    issuer: configService.get('JWT_ISSUER'),
    privateKey: configService.get('ACCESS_PRIVATE_KEY'),
  };
};
