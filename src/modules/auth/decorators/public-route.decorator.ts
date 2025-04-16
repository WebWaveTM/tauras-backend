import type { ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

export const PublicRoute = Reflector.createDecorator<void>({
  transform: () => true,
});

export const isPublicRoute = (
  context: ExecutionContext,
  reflector: Reflector
) =>
  reflector.getAllAndOverride<boolean>(PublicRoute, [
    context.getHandler(),
    context.getClass(),
  ]) ?? false;
