import { queryOne } from './d1';
import type { Coupon } from './shop';

interface CouponRow {
  code: string;
  type: string;
  value: number;
  min_subtotal_cents: number;
  active: number;
  expires_at: string | null;
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discountCents: number }
  | { ok: false; error: string };

export function computeDiscount(coupon: Coupon, subtotalCents: number): number {
  if (subtotalCents <= 0) return 0;
  if (coupon.type === 'percent') {
    const raw = Math.floor((subtotalCents * coupon.value) / 100);
    return Math.min(raw, subtotalCents);
  }
  return Math.min(coupon.value, subtotalCents);
}

export async function validateCoupon(rawCode: string, subtotalCents: number): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: 'empty' };

  const row = await queryOne<CouponRow>('SELECT * FROM coupons WHERE code = ?', [code]);
  if (!row) return { ok: false, error: 'not_found' };

  const coupon: Coupon = {
    code: row.code,
    type: row.type === 'fixed' ? 'fixed' : 'percent',
    value: row.value,
    minSubtotalCents: row.min_subtotal_cents,
    active: row.active === 1,
    expiresAt: row.expires_at,
  };

  if (!coupon.active) return { ok: false, error: 'inactive' };
  if (coupon.expiresAt && Date.now() > Date.parse(coupon.expiresAt)) {
    return { ok: false, error: 'expired' };
  }
  if (subtotalCents < coupon.minSubtotalCents) return { ok: false, error: 'min_subtotal' };

  return { ok: true, coupon, discountCents: computeDiscount(coupon, subtotalCents) };
}

export const COUPON_ERRORS: Record<string, string> = {
  empty: 'Δώσε έναν κωδικό.',
  not_found: 'Ο κωδικός δεν βρέθηκε.',
  inactive: 'Ο κωδικός δεν είναι ενεργός.',
  expired: 'Ο κωδικός έχει λήξει.',
  min_subtotal: 'Το ποσό είναι μικρότερο από το ελάχιστο για αυτόν τον κωδικό.',
  invalid: 'Μη έγκυρος κωδικός.',
};
