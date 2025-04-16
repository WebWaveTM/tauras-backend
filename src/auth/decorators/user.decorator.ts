import type { User as TUser } from '@prisma/client';
import type { Request } from 'express';

import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  <T extends keyof TUser>(data: T, ctx: ExecutionContext): TUser | TUser[T] => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? user[data] : user;
  }
);
