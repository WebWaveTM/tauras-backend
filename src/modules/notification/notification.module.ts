import { Module } from '@nestjs/common';

import type { NotificationStrategy } from './strategies/notification-strategy.interface';

import { NotificationController } from './notification.controller';
import {
  NOTIFICATION_STRATEGIES,
  NOTIFICATION_STRATEGIES_ARRAY,
} from './strategies';
import { SseNotificationService } from './strategies/sse/sse-notification.service';
import {
  SSE_NOTIFICATION_SERVICE,
  SseNotificationStrategy,
} from './strategies/sse/sse-notification.strategy';

@Module({
  controllers: [NotificationController],
  providers: [
    SseNotificationStrategy,
    {
      inject: NOTIFICATION_STRATEGIES_ARRAY,
      provide: NOTIFICATION_STRATEGIES,
      useFactory: (...strategies: NotificationStrategy[]) => [...strategies],
    },
    {
      provide: SSE_NOTIFICATION_SERVICE,
      useClass: SseNotificationService,
    },
  ],
})
export class NotificationModule {}
