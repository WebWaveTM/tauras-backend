import { type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { ACCESS_TOKEN_STRATEGY_NAME } from '../const';
import { isPublicRoute } from '../decorators/public-route.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_TOKEN_STRATEGY_NAME) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (isPublicRoute(context, this.reflector)) {
      return true;
    }

    return super.canActivate(context);
  }
}
