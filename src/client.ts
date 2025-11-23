/**
 * Notifs Client
 * Main SDK client for interacting with the Notifs API
 */

import { WebhookClient } from './webhook';
import {
  NotifsConfig,
  CreateWebhookParams,
  Webhook,
  NotifsError,
} from './types';

export class Notifs {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: NotifsConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    if (!config.apiKey.startsWith('ntf_live_') && !config.apiKey.startsWith('ntf_test_')) {
      throw new Error('Invalid API key format. Must start with ntf_live_ or ntf_test_');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://notifs.io';
  }

  /**
   * Webhooks API
   */
  public readonly webhooks = {
    /**
     * Create a new webhook
     */
    create: async (params: CreateWebhookParams): Promise<WebhookClient> => {
      const response = await this.fetch('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({}));
        throw new NotifsError(
          error.message || 'Failed to create webhook',
          response.status,
          error.code
        );
      }

      const data: any = await response.json();
      const webhook: Webhook = data.webhook;

      return new WebhookClient(
        webhook.id,
        webhook.name,
        webhook.project_id,
        webhook.user_id,
        webhook.webhook_secret,
        this.baseUrl
      );
    },

    /**
     * Get an existing webhook by ID
     */
    get: async (webhookId: string): Promise<WebhookClient> => {
      const response = await this.fetch(`/api/webhooks/${webhookId}`);

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({}));
        throw new NotifsError(
          error.message || 'Failed to fetch webhook',
          response.status,
          error.code
        );
      }

      const data: any = await response.json();
      const webhook: Webhook = data.webhook;

      return new WebhookClient(
        webhook.id,
        webhook.name,
        webhook.project_id,
        webhook.user_id,
        webhook.webhook_secret,
        this.baseUrl
      );
    },

    /**
     * List all webhooks (optionally filtered by project)
     */
    list: async (projectId?: string): Promise<WebhookClient[]> => {
      const url = projectId
        ? `/api/webhooks?projectId=${projectId}`
        : '/api/webhooks';

      const response = await this.fetch(url);

      if (!response.ok) {
        const error: any = await response.json().catch(() => ({}));
        throw new NotifsError(
          error.message || 'Failed to list webhooks',
          response.status,
          error.code
        );
      }

      const data: any = await response.json();
      const webhooks: Webhook[] = data.webhooks || [];

      return webhooks.map(
        (webhook) =>
          new WebhookClient(
            webhook.id,
            webhook.name,
            webhook.project_id,
            webhook.user_id,
            webhook.webhook_secret,
            this.baseUrl
          )
      );
    },
  };

  /**
   * Internal fetch wrapper with authentication
   */
  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${path}`;

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });
  }
}
