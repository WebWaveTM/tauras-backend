import { Module } from '@nestjs/common';

import { SseInterceptor } from './sse.interceptor';

@Module({
  exports: [SseInterceptor],
  providers: [SseInterceptor],
})
export class SseModule {}
