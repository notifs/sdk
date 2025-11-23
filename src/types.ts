/**
 * Notifs SDK Types
 */

export interface NotifsConfig {
  /**
   * Your Notifs API key (starts with ntf_live_ or ntf_test_)
   */
  apiKey: string;

  /**
   * Base URL for the Notifs API
   * @default "https://notifs.io"
   */
  baseUrl?: string;
}

export interface Webhook {
  id: string;
  name: string;
  project_id: string;
  user_id: string;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookParams {
  /**
   * Name of the webhook
   */
  name: string;

  /**
   * Project ID to create the webhook in
   */
  projectId: string;
}

export interface SendNotificationParams {
  /**
   * Notification title
   */
  title: string;

  /**
   * Notification message/body
   */
  message?: string;

  /**
   * Additional data to include in the notification
   */
  data?: Record<string, any>;

  /**
   * Webhook name (automatically set if using webhook.send())
   */
  webhookName?: string;

  /**
   * Any other custom fields
   */
  [key: string]: any;
}

export interface NotificationResponse {
  message: string;
  notificationId: string;
  servicesExecuted: boolean;
  usageInfo?: {
    current: number;
    limit: number;
    inGracePeriod?: boolean;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export class NotifsError extends Error {
  public readonly code?: string;
  public readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'NotifsError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, NotifsError.prototype);
  }
}
