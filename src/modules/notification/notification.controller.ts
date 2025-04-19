import { Controller, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { SseStream } from '~/infrastructure/sse/sse-stream.decorator';

import { PublicRoute } from '../auth/decorators/public-route.decorator';
import {
  SSE_NOTIFICATION_SERVICE,
  type SseNotificationService,
} from './sse-notification.service';

@Controller('/notifications')
export class NotificationController {
  constructor(
    @Inject(SSE_NOTIFICATION_SERVICE)
    private readonly sseNotificationService: SseNotificationService
  ) {}

  @PublicRoute()
  @SseStream('/sse')
  subscribeSse() {
    return this.sseNotificationService.addClient(0);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  private aboba() {
    this.sseNotificationService.broadcast({
      data: { body: 'Test message' },
      id: Date.now(),
      type: 'notification',
    });
  }
}
