import { Injectable } from '@nestjs/common';

import type {
  NotificationPayload,
  NotificationStrategy,
} from './notification-strategy.interface';

export const SSE_NOTIFICATION_SERVICE = 'SseNotificationService';

@Injectable()
export class SseNotificationStrategy implements NotificationStrategy {
  canHandle(type: string): boolean {}
  send<T extends Record<string, unknown>>(
    payload: NotificationPayload<T>
  ): Promise<boolean> {}
}
