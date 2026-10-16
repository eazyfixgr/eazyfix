const CART_KEY = 'eazyfix_cart_v1';

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
}

function itemKey(item) {
  return `${item.productId}:${item.variantId ?? 0}`;
}

const shop = {
  get items() {
    return readCart();
  },
  count() {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
  },
  subtotalCents() {
    return readCart().reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  },
  add(item) {
    const items = readCart();
    const key = itemKey(item);
    const existing = items.find((entry) => itemKey(entry) === key);
    if (existing) existing.quantity += item.quantity || 1;
    else items.push({ ...item, quantity: item.quantity || 1 });
    writeCart(items);
  },
  setQuantity(key, quantity) {
    const items = readCart();
    const entry = items.find((item) => itemKey(item) === key);
    if (!entry) return;
    entry.quantity = Math.max(1, quantity);
    writeCart(items);
  },
  remove(key) {
    writeCart(readCart().filter((item) => itemKey(item) !== key));
  },
  clear() {
    writeCart([]);
  },
  key: itemKey,
};

window.EazyShop = shop;

function formatEuro(cents) {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

function updateCounters() {
  const count = shop.count();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(count);
    el.classList.toggle('is-empty', count === 0);
  });
}

function toast(message) {
  let el = document.querySelector('.shop-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'shop-toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove('show'), 2600);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-to-cart]');
  if (!button) return;
  const variantSelect = document.querySelector('[data-variant-select]');
  const variantId = variantSelect
    ? Number(variantSelect.value)
    : Number(button.dataset.variantId || 0);
  const option = variantSelect
    ? variantSelect.options[variantSelect.selectedIndex]
    : null;
  const priceCents = option
    ? Number(option.dataset.price || 0)
    : Number(button.dataset.priceCents || 0);
  const variantName = option ? option.dataset.name || '' : button.dataset.variantName || '';

  const qtyInput = document.querySelector('[data-qty-input]');
  const quantity = qtyInput ? Math.max(1, Number(qtyInput.value) || 1) : 1;

  shop.add({
    productId: Number(button.dataset.productId),
    variantId: variantId || null,
    slug: button.dataset.slug || '',
    name: button.dataset.name || '',
    variantName,
    priceCents,
    quantity,
  });

  toast(`Το «${button.dataset.name}» προστέθηκε στο καλάθι`);
});

window.addEventListener('cart:change', updateCounters);
window.addEventListener('storage', updateCounters);
document.addEventListener('DOMContentLoaded', updateCounters);
if (document.readyState !== 'loading') updateCounters();

export { shop, formatEuro };
