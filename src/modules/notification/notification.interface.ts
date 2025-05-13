export type NotificationPayload = {
  body: string;
  id: number;
  metadata?: Record<string, unknown>;
  title: string;
  type: string | string[];
  userId: number;
};
