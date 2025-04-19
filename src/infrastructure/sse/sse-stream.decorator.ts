import type { Reflector } from '@nestjs/core';

import {
  applyDecorators,
  type ExecutionContext,
  Get,
  SetMetadata,
} from '@nestjs/common';

const SSE_STREAM_METADATA_KEY = 'isSseStreamRoute';

const Sse = () => SetMetadata(SSE_STREAM_METADATA_KEY, true);
export const isSseStream = (reflector: Reflector, context: ExecutionContext) =>
  reflector.get<boolean>(SSE_STREAM_METADATA_KEY, context.getHandler());

export const SseStream = (path: string) => applyDecorators(Get(path), Sse());
