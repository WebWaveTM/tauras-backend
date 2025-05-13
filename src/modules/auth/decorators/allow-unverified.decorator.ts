import type { ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

export const AllowUnverified = Reflector.createDecorator<void>({
  transform: () => true,
});

export const isUnverifiedAllowed = (
  context: ExecutionContext,
  reflector: Reflector
) =>
  reflector.getAllAndOverride<boolean>(AllowUnverified, [
    context.getHandler(),
    context.getClass(),
  ]) ?? false;
