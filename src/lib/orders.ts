import { queryAll, queryOne, execute, getDb } from './d1';

export const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface OrderItem {
  id: number;
  productId: number | null;
  variantId: number | null;
  name: string;
  variantName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  reference: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  couponCode: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  shippingMethod: string;
  courier: string;
  trackingCode: string;
  stripeSessionId: string;
  stripePaymentIntent: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderRow {
  id: number;
  reference: string;
  status: string;
  payment_status: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  notes: string;
  coupon_code: string;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  shipping_method: string;
  courier: string;
  tracking_code: string;
  stripe_session_id: string;
  stripe_payment_intent: string;
  created_at: string;
  updated_at: string;
}

interface ItemRow {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  name: string;
  variant_name: string;
  unit_price_cents: number;
  quantity: number;
}

function mapItem(row: ItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    name: row.name,
    variantName: row.variant_name,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
  };
}

function isStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

function isPayment(value: string): value is PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

function mapOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    reference: row.reference,
    status: isStatus(row.status) ? row.status : 'pending',
    paymentStatus: isPayment(row.payment_status) ? row.payment_status : 'unpaid',
    email: row.email,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postalCode: row.postal_code,
    notes: row.notes,
    couponCode: row.coupon_code,
    subtotalCents: row.subtotal_cents,
    discountCents: row.discount_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    currency: row.currency,
    shippingMethod: row.shipping_method,
    courier: row.courier,
    trackingCode: row.tracking_code,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntent: row.stripe_payment_intent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  };
}

async function itemsFor(orderId: number): Promise<OrderItem[]> {
  const rows = await queryAll<ItemRow>('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [
    orderId,
  ]);
  return rows.map(mapItem);
}

export function generateReference(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `KP-${stamp}${rand}`;
}

export interface CreateOrderInput {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
  couponCode: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  shippingMethod: string;
  courier: string;
  items: Array<{
    productId: number | null;
    variantId: number | null;
    name: string;
    variantName: string;
    unitPriceCents: number;
    quantity: number;
  }>;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const db = getDb();
  const now = new Date().toISOString();
  const reference = generateReference();

  const result = (await execute(
    `INSERT INTO orders (reference, status, payment_status, email, name, phone, address, city, postal_code, notes,
      coupon_code, subtotal_cents, discount_cents, shipping_cents, total_cents, currency, shipping_method, courier,
      created_at, updated_at)
     VALUES (?, 'pending', 'unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', ?, ?, ?, ?)`,
    [
      reference,
      input.email,
      input.name,
      input.phone,
      input.address,
      input.city,
      input.postalCode,
      input.notes,
      input.couponCode,
      input.subtotalCents,
      input.discountCents,
      input.shippingCents,
      input.totalCents,
      input.shippingMethod,
      input.courier,
      now,
      now,
    ]
  )) as { meta?: { last_row_id?: number } };

  const orderId = Number(result?.meta?.last_row_id ?? 0);
  const statements = input.items.map((item) =>
    db
      .prepare(
        `INSERT INTO order_items (order_id, product_id, variant_id, name, variant_name, unit_price_cents, quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        orderId,
        item.productId,
        item.variantId,
        item.name,
        item.variantName,
        item.unitPriceCents,
        item.quantity
      )
  );
  if (statements.length) await db.batch(statements);

  const order = await getOrderById(orderId);
  if (!order) throw new Error('order_creation_failed');
  return order;
}

export async function getOrderById(id: number): Promise<Order | null> {
  const row = await queryOne<OrderRow>('SELECT * FROM orders WHERE id = ?', [id]);
  if (!row) return null;
  return mapOrder(row, await itemsFor(row.id));
}

export async function getOrderByReference(reference: string): Promise<Order | null> {
  const row = await queryOne<OrderRow>('SELECT * FROM orders WHERE reference = ?', [reference]);
  if (!row) return null;
  return mapOrder(row, await itemsFor(row.id));
}

export async function getOrderBySession(sessionId: string): Promise<Order | null> {
  const row = await queryOne<OrderRow>('SELECT * FROM orders WHERE stripe_session_id = ?', [sessionId]);
  if (!row) return null;
  return mapOrder(row, await itemsFor(row.id));
}

export async function listOrders(limit = 200): Promise<Order[]> {
  const rows = await queryAll<OrderRow>(
    'SELECT * FROM orders ORDER BY datetime(created_at) DESC LIMIT ?',
    [limit]
  );
  return Promise.all(rows.map(async (row) => mapOrder(row, await itemsFor(row.id))));
}

export interface OrderPatch {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  courier?: string;
  trackingCode?: string;
  stripeSessionId?: string;
  stripePaymentIntent?: string;
}

export async function updateOrder(id: number, patch: OrderPatch): Promise<void> {
  const fields: string[] = [];
  const values: unknown[] = [];
  const push = (column: string, value: unknown) => {
    fields.push(`${column} = ?`);
    values.push(value);
  };

  if (patch.status) push('status', patch.status);
  if (patch.paymentStatus) push('payment_status', patch.paymentStatus);
  if (patch.courier !== undefined) push('courier', patch.courier);
  if (patch.trackingCode !== undefined) push('tracking_code', patch.trackingCode);
  if (patch.stripeSessionId !== undefined) push('stripe_session_id', patch.stripeSessionId);
  if (patch.stripePaymentIntent !== undefined) push('stripe_payment_intent', patch.stripePaymentIntent);

  if (!fields.length) return;
  push('updated_at', new Date().toISOString());
  values.push(id);
  await execute(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function addOrderEvent(orderId: number, status: string, note = ''): Promise<void> {
  await execute(
    'INSERT INTO order_events (order_id, status, note, created_at) VALUES (?, ?, ?, ?)',
    [orderId, status, note, new Date().toISOString()]
  );
}

export async function decrementStock(
  items: Array<{ variantId: number | null; quantity: number }>
): Promise<void> {
  const db = getDb();
  const statements = items
    .filter((item) => item.variantId)
    .map((item) =>
      db
        .prepare('UPDATE product_variants SET stock = MAX(0, stock - ?) WHERE id = ?')
        .bind(item.quantity, item.variantId)
    );
  if (statements.length) await db.batch(statements);
}
