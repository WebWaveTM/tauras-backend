import type { Request } from 'express';

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import { REFRESH_TOKEN_PROPERTY, type TokenPayload } from '../const';

export const RefreshPayload = createParamDecorator(
  <T extends keyof TokenPayload>(
    data: T,
    ctx: ExecutionContext
  ): TokenPayload | TokenPayload[T] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const payload = request[REFRESH_TOKEN_PROPERTY];

    return data ? payload[data] : payload;
  }
);
