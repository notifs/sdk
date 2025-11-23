# @notifs/sdk

Official TypeScript SDK for [Notifs](https://notifs.io) - webhook notifications made easy.

## Installation

```bash
npm install @notifs/sdk
# or
yarn add @notifs/sdk
# or
pnpm add @notifs/sdk
```

## Quick Start

```typescript
import { Notifs } from '@notifs/sdk';

// Initialize the client
const notifs = new Notifs({
  apiKey: process.env.NOTIFS_API_KEY,
});

// Create a webhook
const webhook = await notifs.webhooks.create({
  name: 'User Signup Notifications',
  projectId: 'proj_...',
});

// Send a notification
await webhook.send({
  title: 'New user signed up!',
  message: 'John Doe just created an account',
  data: {
    userId: '123',
    email: 'john@example.com',
  },
});
```

## Getting Your API Key

1. Visit [notifs.io/app/api-keys](https://notifs.io/app/api-keys)
2. Click "Create API Key"
3. Copy the key (you'll only see it once!)
4. Store it securely in your environment variables

## Documentation

For full documentation, visit [docs.notifs.io](https://docs.notifs.io)

## Features

- 🔐 **Type-safe** - Full TypeScript support
- 🚀 **Simple API** - Intuitive, easy-to-use interface
- 🔒 **Secure** - Automatic HMAC-SHA256 signature generation
- 📦 **Lightweight** - Minimal dependencies
- ⚡ **Fast** - Optimized for performance

## Security Best Practices

### API Key Security

**Critical: Treat API keys like passwords**

API keys grant access to:
- Read all your webhooks and their secrets
- Create new webhooks (consumes quota)
- Send notifications (consumes usage limits)
- Access webhook signing secrets

#### What to do:
✅ Store keys in environment variables (`.env.local`)
✅ Use `ntf_test_*` keys for development
✅ Use `ntf_live_*` keys for production only
✅ Add `.env*` to your `.gitignore`
✅ Rotate keys immediately if compromised
✅ Use separate keys per environment/service

#### What NOT to do:
❌ Never commit API keys to version control
❌ Never use API keys in client-side/browser code
❌ Never share keys between environments
❌ Never log API keys or include them in error messages
❌ Never hardcode keys in your source code

**Example `.gitignore`:**
```
.env
.env.local
.env.*.local
```

### Webhook Signature Verification

All webhook requests are automatically signed with HMAC-SHA256 using your webhook secret. This prevents request tampering and ensures authenticity.

To verify incoming webhooks on your server:

```typescript
import { verifySignature } from '@notifs/sdk';

// In your webhook handler
export async function POST(request: Request) {
  const signature = request.headers.get('x-notifs-signature');
  const body = await request.text();

  if (!verifySignature(body, signature, process.env.WEBHOOK_SECRET)) {
    return new Response('Invalid signature', { status: 401 });
  }

  // Process webhook...
}
```

### Environment Separation

Always use separate projects and API keys for different environments:

```typescript
// ❌ Bad: Single key for all environments
const notifs = new Notifs({
  apiKey: 'ntf_live_...'
});

// ✅ Good: Environment-specific keys
const notifs = new Notifs({
  apiKey: process.env.NODE_ENV === 'production'
    ? process.env.NOTIFS_LIVE_API_KEY
    : process.env.NOTIFS_TEST_API_KEY
});
```

### If Your API Key is Compromised

1. **Immediately revoke** the key at [notifs.io/app/api-keys](https://notifs.io/app/api-keys)
2. **Generate a new key** with a different name
3. **Update** all services using the old key
4. **Review** recent webhook activity for suspicious usage
5. **Monitor** your usage metrics for anomalies

### Server-Side Only

**Never use the SDK in client-side code:**

```typescript
// ❌ Bad: Client-side usage exposes API key
'use client';
import { Notifs } from '@notifs/sdk';

export function MyComponent() {
  const notifs = new Notifs({ apiKey: process.env.NEXT_PUBLIC_NOTIFS_KEY });
  // This key is now exposed to all users!
}

// ✅ Good: Server-side usage (API route, server action, etc.)
import { Notifs } from '@notifs/sdk';

export async function POST(request: Request) {
  const notifs = new Notifs({ apiKey: process.env.NOTIFS_API_KEY });
  // Key stays on the server
}
```

## License

MIT
