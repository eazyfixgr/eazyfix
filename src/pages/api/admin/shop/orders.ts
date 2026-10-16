import type { APIRoute } from 'astro';
import { COOKIE_NAME, isValidSession } from '../../../../lib/auth';
import {
  listOrders,
  updateOrder,
  addOrderEvent,
  getOrderById,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from '../../../../lib/orders';

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
  return json(await listOrders());
};

export const PATCH: APIRoute = async ({ request, cookies }) => {
  if (!(await isValidSession(cookies.get(COOKIE_NAME)?.value))) {
    return json({ error: 'unauthorized' }, 401);
  }
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const id = Number(body.id);
  if (!id) return json({ error: 'missing_id' }, 400);

  const status = (ORDER_STATUSES as readonly string[]).includes(body.status)
    ? (body.status as OrderStatus)
    : undefined;
  const paymentStatus = (PAYMENT_STATUSES as readonly string[]).includes(body.paymentStatus)
    ? (body.paymentStatus as PaymentStatus)
    : undefined;

  await updateOrder(id, {
    status,
    paymentStatus,
    courier: body.courier !== undefined ? String(body.courier) : undefined,
    trackingCode: body.trackingCode !== undefined ? String(body.trackingCode) : undefined,
  });

  if (status) {
    const order = await getOrderById(id);
    await addOrderEvent(id, status, order ? `Ενημέρωση κατάστασης: ${status}` : '');
  }

  return json({ ok: true });
};
