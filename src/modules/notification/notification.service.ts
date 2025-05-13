import { Inject, Injectable } from '@nestjs/common';

import type { NotificationPayload } from './notification.interface';
import type { NotificationStrategy } from './strategies/notification-strategy.interface';

import { NOTIFICATION_STRATEGIES } from './strategies';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_STRATEGIES)
    private readonly notificationStrategies: NotificationStrategy[]
  ) {}

  private getStrategy(type: string): NotificationStrategy | undefined {
    return this.notificationStrategies.find((strategy) =>
      strategy.canHandle(type)
    );
  }

  notifyUser(userId: number, notification: NotificationPayload): void {
    const { body, type } = notification;

    const strategy = Array.isArray(type)
      ? type.map((t) => this.getStrategy(t))
      : this.getStrategy(type);

    if (!strategy || (Array.isArray(strategy) && strategy.length === 0)) {
      throw new Error(`No notification strategy found for type: ${type}`);
    }

    if (Array.isArray(strategy)) {
      strategy.forEach((s) => s.send({ ...notification, recipient: userId }));
    } else {
      strategy.send({ ...notification, recipient: userId });
    }
  }

  // notifyUsers(userId: number[], notification: NotificationPayload): void {
  //   const { body, type } = notification;

  //   const strategy = Array.isArray(type)
  //     ? type.map((t) => this.getStrategy(t))
  //     : this.getStrategy(type);

  //   if (!strategy || (Array.isArray(strategy) && strategy.length === 0)) {
  //     throw new Error(`No notification strategy found for type: ${type}`);
  //   }

  //   if (Array.isArray(strategy)) {
  //     strategy.forEach((s) => s.send({ ...notification, recipient: userId }));
  //   } else {
  //     strategy.send({ ...notification, recipient: userId });
  //   }
  // }
}
