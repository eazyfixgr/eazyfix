import type { APIRoute } from 'astro';
import { getProductById } from '../../../lib/shop';
import { getShippingMethod } from '../../../data/shop';
import { validateCoupon } from '../../../lib/coupons';
import { createOrder, updateOrder, type OrderItem } from '../../../lib/orders';
import { createCheckoutSession, isStripeConfigured, type CheckoutLine } from '../../../lib/stripe';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

interface IncomingItem {
  productId?: number;
  variantId?: number | null;
  quantity?: number;
}

interface CheckoutBody {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    notes?: string;
  };
  shippingMethod?: string;
  coupon?: string;
  items?: IncomingItem[];
}

export const POST: APIRoute = async ({ request }) => {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return json({ message: 'Μη έγκυρο αίτημα.' }, 400);
  }

  const customer = body.customer ?? {};
  const name = String(customer.name ?? '').trim();
  const email = String(customer.email ?? '').trim();
  const phone = String(customer.phone ?? '').trim();
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ message: 'Συμπλήρωσε σωστά όνομα και email.' }, 400);
  }

  const incoming = Array.isArray(body.items) ? body.items : [];
  if (!incoming.length) return json({ message: 'Το καλάθι είναι άδειο.' }, 400);

  const items: OrderItem[] = [];
  for (const entry of incoming) {
    const productId = Number(entry.productId);
    if (!productId) continue;
    const product = await getProductById(productId);
    if (!product || !product.active) continue;

    const variant = entry.variantId
      ? product.variants.find((item) => item.id === Number(entry.variantId))
      : product.variants[0];
    const unitPriceCents = variant?.priceCents ?? product.priceCents;
    const quantity = Math.min(99, Math.max(1, Math.round(Number(entry.quantity) || 1)));

    items.push({
      id: 0,
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name,
      variantName: variant?.name ?? '',
      unitPriceCents,
      quantity,
    });
  }

  if (!items.length) return json({ message: 'Δεν βρέθηκαν έγκυρα προϊόντα.' }, 400);

  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);

  const method = getShippingMethod(body.shippingMethod ?? '') ?? getShippingMethod('pickup')!;
  const shippingCents =
    method.freeOverCents && subtotalCents >= method.freeOverCents ? 0 : method.priceCents;

  let discountCents = 0;
  let couponCode = '';
  if (body.coupon) {
    const result = await validateCoupon(body.coupon, subtotalCents);
    if (result.ok) {
      discountCents = result.discountCents;
      couponCode = result.coupon.code;
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingCents;

  const order = await createOrder({
    email,
    name,
    phone,
    address: String(customer.address ?? '').trim(),
    city: String(customer.city ?? '').trim(),
    postalCode: String(customer.postalCode ?? '').trim(),
    notes: String(customer.notes ?? '').trim(),
    couponCode,
    subtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    shippingMethod: method.id,
    courier: method.courier ?? '',
    items: items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      name: item.name,
      variantName: item.variantName,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity,
    })),
  });

  if (!isStripeConfigured()) {
    return json(
      {
        message:
          'Οι πληρωμές δεν είναι ακόμη ρυθμισμένες (λείπει το Stripe κλειδί). Επικοινώνησε μαζί μας για να ολοκληρώσουμε την παραγγελία.',
        reference: order.reference,
      },
      503
    );
  }

  const lines = buildStripeLines(items, discountCents, shippingCents, subtotalCents, method.name);
  const origin = new URL(request.url).origin;

  try {
    const session = await createCheckoutSession({
      lineItems: lines,
      email,
      successUrl: `${origin}/shop/success?ref=${encodeURIComponent(order.reference)}`,
      cancelUrl: `${origin}/shop/cancel`,
      metadata: { order_id: String(order.id), reference: order.reference },
      coupon: null,
    });

    await updateOrder(order.id, { stripeSessionId: session.id });
    return json({ url: session.url, reference: order.reference });
  } catch {
    return json(
      { message: 'Δεν ήταν δυνατή η έναρξη της πληρωμής. Δοκίμασε ξανά.' },
      502
    );
  }
};

function buildStripeLines(
  items: OrderItem[],
  discountCents: number,
  shippingCents: number,
  subtotalCents: number,
  shippingName: string
): CheckoutLine[] {
  const lines: CheckoutLine[] = [];
  let allocated = 0;

  items.forEach((item, index) => {
    const lineTotal = item.unitPriceCents * item.quantity;
    let share = 0;
    if (discountCents > 0 && subtotalCents > 0) {
      share =
        index === items.length - 1
          ? discountCents - allocated
          : Math.round((discountCents * lineTotal) / subtotalCents);
      share = Math.min(share, lineTotal);
      allocated += share;
    }
    const amount = lineTotal - share;
    if (amount <= 0) return;
    const label = item.variantName
      ? `${item.name} (${item.variantName})`
      : item.name;
    lines.push({ name: `${label} × ${item.quantity}`, amountCents: amount, quantity: 1 });
  });

  if (shippingCents > 0) {
    lines.push({ name: `Μεταφορικά — ${shippingName}`, amountCents: shippingCents, quantity: 1 });
  }
  if (!lines.length) {
    lines.push({ name: 'Παραγγελία', amountCents: Math.max(1, shippingCents), quantity: 1 });
  }
  return lines;
}
