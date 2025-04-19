import { Module } from '@nestjs/common';

import { NotificationController } from './notification.controller';
import { SseNotificationService } from './sse-notification.service';
import { SSE_NOTIFICATION_SERVICE } from './strategies/sse-notification.strategy';

@Module({
  controllers: [NotificationController],
  providers: [
    {
      provide: SSE_NOTIFICATION_SERVICE,
      useClass: SseNotificationService,
    },
  ],
})
export class NotificationModule {}
