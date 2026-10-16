import type { APIRoute } from 'astro';
import { COOKIE_NAME, isValidSession } from '../../../../lib/auth';
import { listCoupons, saveCoupon, deleteCoupon, type Coupon } from '../../../../lib/shop';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }
  return json(await listCoupons());
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const code = String(body.code ?? '').trim().toUpperCase();
  if (!code) return json({ error: 'missing_code' }, 400);
  const type = body.type === 'fixed' ? 'fixed' : 'percent';

  const coupon: Coupon = {
    code,
    type,
    value: Math.max(0, Math.round(Number(body.value) || 0)),
    minSubtotalCents: Math.max(0, Math.round(Number(body.minSubtotalCents) || 0)),
    active: body.active !== false,
    expiresAt: body.expiresAt ? String(body.expiresAt) : null,
  };

  await saveCoupon(coupon);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }
  const code = url.searchParams.get('code') ?? '';
  if (!code) return json({ error: 'missing_code' }, 400);
  await deleteCoupon(code);
  return json({ ok: true });
};
