import type { APIRoute } from 'astro';
import type { AstroCookies } from 'astro';
import { COOKIE_NAME, isValidSession } from '../../../../lib/auth';
import {
  listProducts,
  saveProduct,
  deleteProduct,
  deleteVariant,
  type ProductInput,
} from '../../../../lib/shop';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function authorized(cookies: AstroCookies): Promise<boolean> {
  return isValidSession(cookies.get(COOKIE_NAME)?.value);
}

function normalize(body: any): ProductInput {
  return {
    id: body.id ? Number(body.id) : undefined,
    slug: String(body.slug ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60),
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim(),
    priceCents: Math.max(0, Math.round(Number(body.priceCents) || 0)),
    category: String(body.category ?? '').trim(),
    imageKey: String(body.imageKey ?? '').trim(),
    featured: Boolean(body.featured),
    active: body.active !== false,
    sortOrder: Number(body.sortOrder) || 0,
    variants: Array.isArray(body.variants)
      ? body.variants.map((variant: any) => ({
          id: variant.id ? Number(variant.id) : undefined,
          name: String(variant.name ?? '').trim(),
          priceCents:
            variant.priceCents === null || variant.priceCents === '' || variant.priceCents === undefined
              ? null
              : Math.max(0, Math.round(Number(variant.priceCents) || 0)),
          stock: Math.max(0, Math.round(Number(variant.stock) || 0)),
          sku: String(variant.sku ?? '').trim(),
        }))
      : [],
  };
}

export const GET: APIRoute = async ({ cookies }) => {
  if (!(await authorized(cookies))) return json({ error: 'unauthorized' }, 401);
  return json(await listProducts(false));
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await authorized(cookies))) return json({ error: 'unauthorized' }, 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const input = normalize(body);
  if (!input.name || !input.slug) return json({ error: 'missing_fields' }, 400);
  const id = await saveProduct(input);
  return json({ ok: true, id });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  if (!(await authorized(cookies))) return json({ error: 'unauthorized' }, 401);
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const input = normalize(body);
  if (!input.id) return json({ error: 'missing_id' }, 400);
  await saveProduct(input);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ url, cookies }) => {
  if (!(await authorized(cookies))) return json({ error: 'unauthorized' }, 401);
  const id = Number(url.searchParams.get('id'));
  const variantId = Number(url.searchParams.get('variantId'));
  if (variantId) {
    await deleteVariant(variantId);
    return json({ ok: true });
  }
  if (!id) return json({ error: 'missing_id' }, 400);
  await deleteProduct(id);
  return json({ ok: true });
};
