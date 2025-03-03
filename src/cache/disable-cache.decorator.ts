import type { Reflector } from '@nestjs/core';

import { type ExecutionContext, SetMetadata } from '@nestjs/common';

const DISABLE_CACHE_METADATA_KEY = 'isCacheDisabled';
export const DisableCache = () => SetMetadata(DISABLE_CACHE_METADATA_KEY, true);

export const getIsCacheDisabled = (
  context: ExecutionContext,
  reflector: Reflector
) =>
  reflector.getAllAndOverride<boolean>(DISABLE_CACHE_METADATA_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
