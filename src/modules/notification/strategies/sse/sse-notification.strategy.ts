import { Inject, Injectable } from '@nestjs/common';

import type { NotificationPayload } from '../../notification.interface';
import type { NotificationStrategy } from '../notification-strategy.interface';
import type { SseNotificationService } from './sse-notification.service';

export const SSE_NOTIFICATION_SERVICE = 'SseNotificationService';

@Injectable()
export class SseNotificationStrategy implements NotificationStrategy {
  strategyName: 'sse';

  constructor(
    @Inject(SSE_NOTIFICATION_SERVICE)
    private readonly sseService: SseNotificationService
  ) {}

  canHandle(type: string): boolean {
    return type === this.strategyName;
  }

  send(userId: number, payload: NotificationPayload): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  broadcast(userIds: number[], payload: NotificationPayload): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
