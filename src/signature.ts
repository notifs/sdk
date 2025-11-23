/**
 * Webhook Signature Generation
 * Generates HMAC-SHA256 signatures for webhook requests
 */

import { createHmac } from 'crypto';

export const SIGNATURE_VERSION = 'v1';
export const SIGNATURE_HEADER = 'X-Notifs-Signature';

/**
 * Generate a webhook signature
 * Format: t=<timestamp>,v1=<signature>
 */
export function generateSignature(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;

  const hash = createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  return `t=${ts},${SIGNATURE_VERSION}=${hash}`;
}

/**
 * Verify a webhook signature
 * Validates that the signature matches the payload and secret
 *
 * @param payload - The raw request body as a string
 * @param signature - The signature from the X-Notifs-Signature header
 * @param secret - Your webhook secret
 * @param toleranceSeconds - Optional tolerance for timestamp validation (default: 300 = 5 minutes)
 * @returns true if signature is valid, false otherwise
 *
 * @example
 * const isValid = verifySignature(
 *   await request.text(),
 *   request.headers.get('x-notifs-signature'),
 *   process.env.WEBHOOK_SECRET
 * );
 */
export function verifySignature(
  payload: string,
  signature: string | null,
  secret: string,
  toleranceSeconds: number = 300
): boolean {
  if (!signature) {
    return false;
  }

  try {
    // Parse signature: t=<timestamp>,v1=<hash>
    const parts = signature.split(',');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const signaturePart = parts.find(p => p.startsWith(`${SIGNATURE_VERSION}=`));

    if (!timestampPart || !signaturePart) {
      return false;
    }

    const timestamp = parseInt(timestampPart.split('=')[1], 10);
    const receivedHash = signaturePart.split('=')[1];

    // Check timestamp tolerance to prevent replay attacks
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > toleranceSeconds) {
      return false;
    }

    // Generate expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedHash = createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(receivedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Timing-safe string comparison
 * Prevents timing attacks by comparing all bytes
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}
