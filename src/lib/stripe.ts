import { env } from 'cloudflare:workers';

const API_BASE = 'https://api.stripe.com/v1';

function getSecretKey(): string {
  return (env as unknown as { STRIPE_SECRET_KEY?: string }).STRIPE_SECRET_KEY ?? '';
}

export function isStripeConfigured(): boolean {
  return getSecretKey().startsWith('sk_');
}

export interface CheckoutLine {
  name: string;
  amountCents: number;
  quantity: number;
}

export interface CheckoutCoupon {
  type: 'percent' | 'fixed';
  value: number;
}

export interface CheckoutSessionInput {
  lineItems: CheckoutLine[];
  email?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  coupon?: CheckoutCoupon | null;
}

function encode(data: Record<string, unknown>, prefix = ''): string[] {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((entry, index) => {
        if (entry !== null && typeof entry === 'object') {
          parts.push(...encode(entry as Record<string, unknown>, `${fullKey}[${index}]`));
        } else if (entry !== undefined) {
          parts.push(`${encodeURIComponent(`${fullKey}[${index}]`)}=${encodeURIComponent(String(entry))}`);
        }
      });
    } else if (typeof value === 'object') {
      parts.push(...encode(value as Record<string, unknown>, fullKey));
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts;
}

async function stripePost(path: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: encode(data).join('&'),
  });
  const json = (await res.json()) as { error?: { message?: string } };
  if (!res.ok) throw new Error(json?.error?.message ?? 'stripe_request_failed');
  return json as Record<string, unknown>;
}

async function createDiscountCoupon(coupon: CheckoutCoupon): Promise<string> {
  const payload: Record<string, unknown> = { duration: 'once' };
  if (coupon.type === 'percent') payload.percent_off = coupon.value;
  else {
    payload.amount_off = coupon.value;
    payload.currency = 'eur';
  }
  const result = await stripePost('coupons', payload);
  return String(result.id ?? '');
}

export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<{ id: string; url: string }> {
  const payload: Record<string, unknown> = {
    mode: 'payment',
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: input.lineItems.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: 'eur',
        unit_amount: line.amountCents,
        product_data: { name: line.name },
      },
    })),
  };
  if (input.email) payload.customer_email = input.email;
  if (input.metadata && Object.keys(input.metadata).length) payload.metadata = input.metadata;
  if (input.coupon && input.coupon.value > 0) {
    const couponId = await createDiscountCoupon(input.coupon);
    if (couponId) payload.discounts = [{ coupon: couponId }];
  }

  const session = await stripePost('checkout/sessions', payload);
  return { id: String(session.id ?? ''), url: String(session.url ?? '') };
}

export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id?: string;
      payment_intent?: string;
      metadata?: Record<string, string>;
      payment_status?: string;
    };
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacHex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyWebhook(
  payload: string,
  signatureHeader: string | null,
  toleranceSeconds = 300
): Promise<StripeEvent | null> {
  const secret = (env as unknown as { STRIPE_WEBHOOK_SECRET?: string }).STRIPE_WEBHOOK_SECRET ?? '';
  if (!secret || !signatureHeader) return null;

  const parts = signatureHeader.split(',').reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split('=');
    if (!key || !value) return acc;
    (acc[key] ??= []).push(value);
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];
  if (!timestamp || !signatures.length) return null;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return null;

  const expected = await hmacHex(secret, `${timestamp}.${payload}`);
  if (!signatures.some((sig) => timingSafeEqual(sig, expected))) return null;

  try {
    return JSON.parse(payload) as StripeEvent;
  } catch {
    return null;
  }
}
