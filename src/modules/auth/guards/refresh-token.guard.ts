import type { ExecutionContext } from '@nestjs/common';

import { AuthGuard, type IAuthModuleOptions } from '@nestjs/passport';

import { REFRESH_TOKEN_STRATEGY_NAME } from '../const';

export class RefreshTokenGuard extends AuthGuard(REFRESH_TOKEN_STRATEGY_NAME) {
  getAuthenticateOptions(
    context: ExecutionContext
  ): IAuthModuleOptions | undefined {
    const options = super.getAuthenticateOptions(context) || {};

    options.property = 'refreshToken';

    return options;
  }
}
