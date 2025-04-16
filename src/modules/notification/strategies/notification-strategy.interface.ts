export interface NotificationPayload<T extends Record<string, unknown>> {
  content: string;
  metadata?: T;
  recipient: string;
  subject?: string;
}

export interface NotificationStrategy {
  canHandle(type: string): boolean;
  send<T extends Record<string, unknown>>(
    payload: NotificationPayload<T>
  ): Promise<boolean>;
}
