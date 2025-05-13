import { Controller, Inject } from '@nestjs/common';

import { SseStream } from '~/infrastructure/sse/sse-stream.decorator';

import type { TUser } from '../user/types';

import { User } from '../auth/decorators/user.decorator';
import {
  SSE_NOTIFICATION_SERVICE,
  type SseNotificationService,
} from './strategies/sse/sse-notification.service';

@Controller('/notifications')
export class NotificationController {
  constructor(
    @Inject(SSE_NOTIFICATION_SERVICE)
    private readonly sseNotificationService: SseNotificationService
  ) {}

  @SseStream('/sse')
  subscribeSse(@User() user: TUser) {
    return this.sseNotificationService.addClient(user.id);
  }
}
