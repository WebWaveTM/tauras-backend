import type { NotificationPayload } from '../notification.interface';

export interface NotificationStrategy {
  broadcast(userIds: number[], payload: NotificationPayload): Promise<boolean>;
  canHandle(type: string): boolean;
  send(userId: number, payload: NotificationPayload): Promise<boolean>;
  strategyName: NotificationStrategyType;
}

export type NotificationStrategyType = 'sse';
