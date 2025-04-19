import { SseServiceFactory } from '~/infrastructure/sse/sse-service.factory';

export const SSE_NOTIFICATION_SERVICE = 'SseNotificationService';
export const SseNotificationService = SseServiceFactory<
  { body: string },
  'notification'
>(SSE_NOTIFICATION_SERVICE);

export type SseNotificationService = InstanceType<
  typeof SseNotificationService
>;
