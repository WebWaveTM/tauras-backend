import type { ExecutionContext } from '@nestjs/common';

import { Reflector } from '@nestjs/core';

export const AllowInactive = Reflector.createDecorator<void>({
  transform: () => true,
});

export const isInactiveAllowed = (
  context: ExecutionContext,
  reflector: Reflector
) =>
  reflector.getAllAndOverride<boolean>(AllowInactive, [
    context.getHandler(),
    context.getClass(),
  ]) ?? false;
