import { queryAll, queryOne, execute, getDb } from './d1';
import { seedProducts, type SeedProduct } from '../data/shop';

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  priceCents: number | null;
  stock: number;
  sku: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageKey: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  variants: ProductVariant[];
}

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minSubtotalCents: number;
  active: boolean;
  expiresAt: string | null;
}

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  category: string;
  image_key: string;
  featured: number;
  active: number;
  sort_order: number;
}

interface VariantRow {
  id: number;
  product_id: number;
  name: string;
  price_cents: number | null;
  stock: number;
  sku: string;
  sort_order: number;
}

interface CouponRow {
  code: string;
  type: string;
  value: number;
  min_subtotal_cents: number;
  active: number;
  expires_at: string | null;
}

function mapVariant(row: VariantRow): ProductVariant {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    priceCents: row.price_cents,
    stock: row.stock,
    sku: row.sku,
    sortOrder: row.sort_order,
  };
}

function mapProduct(row: ProductRow, variants: ProductVariant[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    category: row.category,
    imageKey: row.image_key,
    featured: row.featured === 1,
    active: row.active === 1,
    sortOrder: row.sort_order,
    variants,
  };
}

function mapCoupon(row: CouponRow): Coupon {
  return {
    code: row.code,
    type: row.type === 'fixed' ? 'fixed' : 'percent',
    value: row.value,
    minSubtotalCents: row.min_subtotal_cents,
    active: row.active === 1,
    expiresAt: row.expires_at,
  };
}

async function variantsFor(productId: number): Promise<ProductVariant[]> {
  const rows = await queryAll<VariantRow>(
    'SELECT * FROM product_variants WHERE product_id = ? ORDER BY sort_order, id',
    [productId]
  );
  return rows.map(mapVariant);
}

export async function listProducts(activeOnly = false): Promise<Product[]> {
  const rows = await queryAll<ProductRow>(
    `SELECT * FROM products ${activeOnly ? 'WHERE active = 1' : ''} ORDER BY sort_order, id`
  );
  const products = await Promise.all(
    rows.map(async (row) => mapProduct(row, await variantsFor(row.id)))
  );
  return products;
}

export async function getProductBySlug(slug: string, activeOnly = true): Promise<Product | null> {
  const row = await queryOne<ProductRow>('SELECT * FROM products WHERE slug = ?', [slug]);
  if (!row) return null;
  if (activeOnly && row.active !== 1) return null;
  return mapProduct(row, await variantsFor(row.id));
}

export async function getProductById(id: number): Promise<Product | null> {
  const row = await queryOne<ProductRow>('SELECT * FROM products WHERE id = ?', [id]);
  if (!row) return null;
  return mapProduct(row, await variantsFor(row.id));
}

export interface ProductInput {
  id?: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  imageKey?: string;
  featured?: boolean;
  active?: boolean;
  sortOrder?: number;
  variants: Array<{
    id?: number;
    name: string;
    priceCents: number | null;
    stock: number;
    sku?: string;
  }>;
}

export async function saveProduct(input: ProductInput): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();
  const imageKey = input.imageKey ?? '';
  const featured = input.featured ? 1 : 0;
  const active = input.active === false ? 0 : 1;
  const sortOrder = input.sortOrder ?? 0;

  let productId = input.id ?? 0;

  if (productId) {
    await execute(
      `UPDATE products SET slug = ?, name = ?, description = ?, price_cents = ?, category = ?,
       image_key = ?, featured = ?, active = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`,
      [
        input.slug,
        input.name,
        input.description,
        input.priceCents,
        input.category,
        imageKey,
        featured,
        active,
        sortOrder,
        now,
        productId,
      ]
    );
  } else {
    const result = (await execute(
      `INSERT INTO products (slug, name, description, price_cents, category, image_key, featured, active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.slug,
        input.name,
        input.description,
        input.priceCents,
        input.category,
        imageKey,
        featured,
        active,
        sortOrder,
        now,
        now,
      ]
    )) as { meta?: { last_row_id?: number } };
    productId = Number(result?.meta?.last_row_id ?? 0);
  }

  const statements = input.variants.map((variant, index) => {
    const sku = variant.sku ?? '';
    if (variant.id) {
      return db
        .prepare(
          `UPDATE product_variants SET name = ?, price_cents = ?, stock = ?, sku = ?, sort_order = ? WHERE id = ?`
        )
        .bind(
          variant.name,
          variant.priceCents,
          variant.stock,
          sku,
          index,
          variant.id
        );
    }
    return db
      .prepare(
        `INSERT INTO product_variants (product_id, name, price_cents, stock, sku, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(productId, variant.name, variant.priceCents, variant.stock, sku, index);
  });

  if (statements.length) await db.batch(statements);
  return productId;
}

export async function deleteVariant(variantId: number): Promise<void> {
  await execute('DELETE FROM product_variants WHERE id = ?', [variantId]);
}

export async function deleteProduct(id: number): Promise<void> {
  const db = getDb();
  await db.batch([
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').bind(id),
    db.prepare('DELETE FROM products WHERE id = ?').bind(id),
  ]);
}

export async function listCoupons(): Promise<Coupon[]> {
  const rows = await queryAll<CouponRow>('SELECT * FROM coupons ORDER BY code');
  return rows.map(mapCoupon);
}

export async function saveCoupon(coupon: Coupon): Promise<void> {
  const now = new Date().toISOString();
  await execute(
    `INSERT INTO coupons (code, type, value, min_subtotal_cents, active, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(code) DO UPDATE SET type = excluded.type, value = excluded.value,
       min_subtotal_cents = excluded.min_subtotal_cents, active = excluded.active,
       expires_at = excluded.expires_at, updated_at = excluded.updated_at`,
    [
      coupon.code.trim().toUpperCase(),
      coupon.type,
      coupon.value,
      coupon.minSubtotalCents,
      coupon.active ? 1 : 0,
      coupon.expiresAt || null,
      now,
      now,
    ]
  );
}

export async function deleteCoupon(code: string): Promise<void> {
  await execute('DELETE FROM coupons WHERE code = ?', [code.toUpperCase()]);
}

async function seed(): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const statements = [];
  for (let p = 0; p < seedProducts.length; p++) {
    const item: SeedProduct = seedProducts[p];
    statements.push(
      db
        .prepare(
          `INSERT INTO products (slug, name, description, price_cents, category, image_key, featured, active, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, '', ?, 1, ?, ?, ?)`
        )
        .bind(
          item.slug,
          item.name,
          item.description,
          item.priceCents,
          item.category,
          item.featured ? 1 : 0,
          p,
          now,
          now
        )
    );
  }
  await db.batch(statements);

  const rows = await queryAll<ProductRow>('SELECT id, slug FROM products');
  const bySlug = new Map(rows.map((row) => [row.slug, row.id]));
  const variantStatements = [];
  for (const item of seedProducts) {
    const productId = bySlug.get(item.slug);
    if (!productId) continue;
    item.variants.forEach((variant, index) => {
      variantStatements.push(
        db
          .prepare(
            `INSERT INTO product_variants (product_id, name, price_cents, stock, sku, sort_order) VALUES (?, ?, ?, ?, '', ?)`
          )
          .bind(productId, variant.name, variant.priceCents ?? null, variant.stock, index)
      );
    });
  }
  if (variantStatements.length) await db.batch(variantStatements);
}

let seedChecked = false;

export async function ensureShopSeeded(): Promise<void> {
  if (seedChecked) return;
  try {
    const row = await queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM products');
    if (!row || row.count === 0) await seed();
    seedChecked = true;
  } catch {
    /* table may not exist yet */
  }
}
