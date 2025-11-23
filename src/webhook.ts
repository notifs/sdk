/**
 * Webhook Class
 * Represents a webhook and provides methods to send notifications
 */

import { generateSignature, SIGNATURE_HEADER } from './signature';
import { SendNotificationParams, NotificationResponse, NotifsError } from './types';

export class WebhookClient {
  public readonly id: string;
  public readonly name: string;
  public readonly projectId: string;
  public readonly userId: string;
  private readonly secret: string;
  private readonly baseUrl: string;

  constructor(
    id: string,
    name: string,
    projectId: string,
    userId: string,
    secret: string,
    baseUrl: string
  ) {
    this.id = id;
    this.name = name;
    this.projectId = projectId;
    this.userId = userId;
    this.secret = secret;
    this.baseUrl = baseUrl;
  }

  /**
   * Get the webhook URL
   */
  public get url(): string {
    return `${this.baseUrl}/api/webhook/${this.id}`;
  }

  /**
   * Send a notification through this webhook
   */
  public async send(params: SendNotificationParams): Promise<NotificationResponse> {
    const payload = {
      ...params,
      webhookName: params.webhookName || this.name,
    };

    const body = JSON.stringify(payload);
    const signature = generateSignature(body, this.secret);

    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SIGNATURE_HEADER]: signature,
      },
      body,
    });

    if (!response.ok) {
      const error: any = await response.json().catch(() => ({}));
      throw new NotifsError(
        error.message || 'Failed to send notification',
        response.status,
        error.code
      );
    }

    return response.json() as Promise<NotificationResponse>;
  }
}
