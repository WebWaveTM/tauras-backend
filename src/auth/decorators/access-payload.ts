import type { Request } from 'express';

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { TokenPayload } from '../const';

export const AccessPayload = createParamDecorator(
  <T extends keyof TokenPayload>(
    data: string,
    ctx: ExecutionContext
  ): TokenPayload | TokenPayload[T] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const payload = request.accessToken;

    return data ? payload[data] : payload;
  }
);
