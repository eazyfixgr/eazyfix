import type { APIRoute } from 'astro';
import { verifyWebhook } from '../../../lib/stripe';
import {
  getOrderById,
  getOrderBySession,
  updateOrder,
  addOrderEvent,
  decrementStock,
} from '../../../lib/orders';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  const event = await verifyWebhook(payload, signature);

  if (!event) return new Response('Invalid signature', { status: 400 });

  const object = event.data?.object ?? {};

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const orderId = Number(object.metadata?.order_id);
    const order = orderId
      ? await getOrderById(orderId)
      : object.id
        ? await getOrderBySession(object.id)
        : null;

    if (order && order.paymentStatus !== 'paid') {
      await updateOrder(order.id, {
        status: 'paid',
        paymentStatus: 'paid',
        stripeSessionId: object.id ?? order.stripeSessionId,
        stripePaymentIntent: object.payment_intent ?? '',
      });
      await addOrderEvent(order.id, 'paid', 'Πληρωμή ελήφθη (Stripe)');
      await decrementStock(
        order.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity }))
      );
    }
  }

  if (event.type === 'checkout.session.expired' && object.id) {
    const order = await getOrderBySession(object.id);
    if (order && order.status === 'pending') {
      await updateOrder(order.id, { status: 'cancelled' });
      await addOrderEvent(order.id, 'cancelled', 'Η πληρωμή έληξε');
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
