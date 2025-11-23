/**
 * @notifs/sdk
 * Official TypeScript SDK for Notifs
 */

export { Notifs } from './client';
export { WebhookClient } from './webhook';
export type {
  NotifsConfig,
  Webhook,
  CreateWebhookParams,
  SendNotificationParams,
  NotificationResponse,
  NotifsError,
} from './types';
export { generateSignature, verifySignature, SIGNATURE_HEADER, SIGNATURE_VERSION } from './signature';
