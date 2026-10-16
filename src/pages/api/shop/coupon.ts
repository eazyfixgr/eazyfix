import type { APIRoute } from 'astro';
import { validateCoupon, COUPON_ERRORS } from '../../../lib/coupons';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: { code?: string; subtotalCents?: number };
  try {
    body = (await request.json()) as { code?: string; subtotalCents?: number };
  } catch {
    return json({ ok: false, message: 'Μη έγκυρο αίτημα.' }, 400);
  }

  const subtotal = Math.max(0, Math.round(Number(body.subtotalCents) || 0));
  const result = await validateCoupon(body.code ?? '', subtotal);

  if (!result.ok) {
    return json({ ok: false, message: COUPON_ERRORS[result.error] ?? COUPON_ERRORS.invalid });
  }

  return json({
    ok: true,
    code: result.coupon.code,
    discountCents: result.discountCents,
    type: result.coupon.type,
    value: result.coupon.value,
  });
};
