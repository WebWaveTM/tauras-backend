import type { Request } from 'express';

import {
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import type { UnauthorizedExceptionPayload } from '../types/exceptions.types';

import { ACCESS_TOKEN_STRATEGY_NAME } from '../const';
import { isInactiveAllowed } from '../decorators/allow-inactive.decorator';
import { isUnverifiedAllowed } from '../decorators/allow-unverified.decorator';
import { isPublicRoute } from '../decorators/public-route.decorator';

@Injectable()
export class AccessTokenGuard extends AuthGuard(ACCESS_TOKEN_STRATEGY_NAME) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    if (isPublicRoute(context, this.reflector)) {
      return true;
    }

    await super.canActivate(context);

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        type: 'invalid_token',
      } satisfies UnauthorizedExceptionPayload);
    }

    if (
      !isUnverifiedAllowed(context, this.reflector) &&
      !user.isEmailVerified
    ) {
      throw new UnauthorizedException({
        message: 'Email is not verified',
        type: 'email_not_verified',
      } satisfies UnauthorizedExceptionPayload);
    }

    if (!isInactiveAllowed(context, this.reflector) && !user.isActive) {
      throw new UnauthorizedException({
        message: 'User is banned',
        type: 'user_banned',
      } satisfies UnauthorizedExceptionPayload);
    }

    return true;
  }
}
