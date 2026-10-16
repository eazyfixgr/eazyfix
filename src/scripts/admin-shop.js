const contentEl = document.getElementById('shop-content');
const navEl = document.getElementById('shopNav');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const statusEl = document.getElementById('shop-status');
const actionsEl = document.getElementById('shop-actions');

const CATEGORIES = [
  { slug: 'keria-soyias', label: 'Κεριά σόγιας' },
  { slug: 'keria-vazo', label: 'Κεριά σε βάζο' },
  { slug: 'kiropigia', label: 'Κηροπήγια & Πηλός' },
  { slug: 'gift-sets', label: 'Gift Sets' },
  { slug: 'diakosmitika', label: 'Διακοσμητικά' },
];

const ORDER_STATUS = {
  pending: 'Νέα',
  paid: 'Πληρωμή',
  processing: 'Προετοιμασία',
  shipped: 'Στάλθηκε',
  delivered: 'Παραδόθηκε',
  cancelled: 'Ακυρώθηκε',
};

const PAYMENT_STATUS = { unpaid: 'Απλήρωτη', paid: 'Πληρωμένη', refunded: 'Επιστροφή' };

const state = {
  tab: 'orders',
  orders: [],
  products: [],
  coupons: [],
  editingProduct: null,
  editingCoupon: null,
};

/* ---------- helpers ---------- */

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function euro(cents) {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(
    (Number(cents) || 0) / 100
  );
}

function euroInput(cents) {
  return ((Number(cents) || 0) / 100).toFixed(2);
}

function parseEuro(value) {
  const n = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function formatDate(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

function setStatus(text, kind) {
  statusEl.textContent = text || '';
  statusEl.className = kind || '';
}

async function api(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'request_failed');
  return data;
}

function options(list, selected) {
  return list
    .map(
      ([value, label]) =>
        `<option value="${value}" ${selected === value ? 'selected' : ''}>${esc(label)}</option>`
    )
    .join('');
}

function setActions(html) {
  actionsEl.innerHTML = html;
}

/* ---------- orders ---------- */

function renderOrders() {
  setActions('<button type="button" class="abtn abtn--ghost2" data-action="refresh-orders">Ανανέωση</button>');
  if (!state.orders.length) {
    return '<div class="panel"><p class="hint">Δεν υπάρχουν παραγγελίες ακόμη.</p></div>';
  }
  return state.orders
    .map((order) => {
      const items = order.items
        .map((item) => `${item.quantity}× ${esc(item.name)}${item.variantName ? ` (${esc(item.variantName)})` : ''}`)
        .join('<br/>');
      return `<div class="panel" data-order="${order.id}">
        <div class="editor-head">
          <h2>${esc(order.reference)} <span class="badge badge--cat">${esc(ORDER_STATUS[order.status] || order.status)}</span>
            <span class="badge ${order.paymentStatus === 'paid' ? 'badge--on' : 'badge--off'}">${esc(PAYMENT_STATUS[order.paymentStatus] || order.paymentStatus)}</span>
          </h2>
          <span class="hint">${formatDate(order.createdAt)}</span>
        </div>
        <div class="grid-2" style="margin-bottom:14px">
          <div>
            <p style="margin:0 0 6px"><strong>${esc(order.name)}</strong></p>
            <p class="hint" style="margin:0">${esc(order.email)} · ${esc(order.phone || '—')}</p>
            <p class="hint" style="margin:6px 0 0">${esc(order.address || '—')}, ${esc(order.city || '')} ${esc(order.postalCode || '')}</p>
            ${order.notes ? `<p class="hint" style="margin:6px 0 0">Σημείωση: ${esc(order.notes)}</p>` : ''}
          </div>
          <div>
            <p class="hint" style="margin:0 0 6px;line-height:1.7">${items}</p>
          </div>
        </div>
        <div class="grid-2">
          <div class="field"><label>Κατάσταση</label>
            <select data-order-field="status">${options(Object.entries(ORDER_STATUS), order.status)}</select>
          </div>
          <div class="field"><label>Πληρωμή</label>
            <select data-order-field="paymentStatus">${options(Object.entries(PAYMENT_STATUS), order.paymentStatus)}</select>
          </div>
        </div>
        <div class="grid-2">
          <div class="field"><label>Courier</label><input type="text" data-order-field="courier" value="${esc(order.courier)}" placeholder="ACS / BoxNow / Γενική" /></div>
          <div class="field"><label>Κωδικός αποστολής (tracking)</label><input type="text" data-order-field="trackingCode" value="${esc(order.trackingCode)}" placeholder="π.χ. 1234567890" /></div>
        </div>
        <div class="summary-row"><span>Υποσύνολο</span><span>${euro(order.subtotalCents)}</span></div>
        ${order.discountCents ? `<div class="summary-row discount"><span>Έκπτωση ${esc(order.couponCode)}</span><span>− ${euro(order.discountCents)}</span></div>` : ''}
        <div class="summary-row"><span>Μεταφορικά</span><span>${order.shippingCents ? euro(order.shippingCents) : 'Δωρεάν'}</span></div>
        <div class="summary-total"><span>Σύνολο</span><span>${euro(order.totalCents)}</span></div>
        ${order.trackingCode ? `<p class="hint">Tracking: <a href="https://www.aftership.com/track?num=${encodeURIComponent(order.trackingCode)}" target="_blank" rel="noopener">παρακολούθηση αποστολής</a></p>` : ''}
        <div class="editor-actions">
          <button type="button" class="abtn abtn--primary" data-action="save-order" data-id="${order.id}">Αποθήκευση</button>
        </div>
      </div>`;
    })
    .join('');
}

/* ---------- products ---------- */

function renderProducts() {
  setActions('<button type="button" class="abtn abtn--primary" data-action="new-product">+ Νέο προϊόν</button>');
  const rows = state.products
    .map(
      (product) => `<div class="prow ${product.active ? '' : 'prow--off'}">
        <div class="prow-main">
          <strong>${esc(product.name)}</strong>
          <div class="prow-meta">
            <span class="badge badge--cat">${esc(categoryLabel(product.category))}</span>
            <span class="badge ${product.active ? 'badge--on' : 'badge--off'}">${product.active ? 'Ενεργό' : 'Ανενεργό'}</span>
            ${product.featured ? '<span class="badge badge--cat">Δημοφιλές</span>' : ''}
            <span>${euro(product.priceCents)}</span>
            <span>${product.variants.length} επιλογές</span>
          </div>
        </div>
        <div class="prow-actions">
          <button type="button" class="icon-btn" data-action="edit-product" data-id="${product.id}" title="Επεξεργασία">✎</button>
          <button type="button" class="icon-btn icon-btn--danger" data-action="delete-product" data-id="${product.id}" title="Διαγραφή">🗑</button>
        </div>
      </div>`
    )
    .join('');
  return `<div class="panel">${rows || '<p class="hint">Δεν υπάρχουν προϊόντα.</p>'}</div>`;
}

function renderProductEditor() {
  const product = state.editingProduct;
  const isNew = !product.id;
  setActions(
    `<button type="button" class="abtn abtn--ghost2" data-action="cancel-product">Πίσω</button>
     <button type="button" class="abtn abtn--primary" data-action="save-product">Αποθήκευση</button>`
  );

  const variants = product.variants
    .map(
      (variant, index) => `<div class="mini-card">
        <div class="mini-card-head"><strong>Επιλογή ${index + 1}</strong>
          <button type="button" class="icon-btn icon-btn--danger" data-action="remove-variant" data-index="${index}" title="Διαγραφή">🗑</button>
        </div>
        <div class="grid-2">
          <div class="field"><label>Όνομα</label><input type="text" data-variant-index="${index}" data-variant-field="name" value="${esc(variant.name)}" placeholder="π.χ. 180ml" /></div>
          <div class="field"><label>Τιμή (€, κενό = τιμή προϊόντος)</label><input type="text" inputmode="decimal" data-variant-index="${index}" data-variant-field="priceCents" value="${variant.priceCents === null ? '' : euroInput(variant.priceCents)}" /></div>
        </div>
        <div class="grid-2">
          <div class="field"><label>Απόθεμα</label><input type="number" min="0" data-variant-index="${index}" data-variant-field="stock" value="${variant.stock}" /></div>
          <div class="field"><label>SKU (προαιρετικό)</label><input type="text" data-variant-index="${index}" data-variant-field="sku" value="${esc(variant.sku)}" /></div>
        </div>
      </div>`
    )
    .join('');

  const categoryOptions = CATEGORIES.map(
    (c) => `<option value="${c.slug}" ${product.category === c.slug ? 'selected' : ''}>${esc(c.label)}</option>`
  ).join('');

  return `<div class="panel">
    <div class="grid-2">
      <div class="field"><label>Όνομα</label><input type="text" data-product-field="name" value="${esc(product.name)}" /></div>
      <div class="field"><label>Slug (URL)</label><input type="text" data-product-field="slug" value="${esc(product.slug)}" placeholder="auto" /></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Κατηγορία</label><select data-product-field="category">${categoryOptions}</select></div>
      <div class="field"><label>Τιμή βάσης (€)</label><input type="text" inputmode="decimal" data-product-field="priceCents" value="${euroInput(product.priceCents)}" /></div>
    </div>
    <div class="field"><label>Περιγραφή</label><textarea rows="3" data-product-field="description">${esc(product.description)}</textarea></div>
    <div class="grid-2">
      <div class="field"><label>Εικόνα</label>
        <div class="upload-row">
          <input type="text" data-product-field="imageKey" value="${esc(product.imageKey)}" placeholder="media key" />
          <label class="file-btn">Ανέβασμα<input type="file" accept="image/*" data-action="upload-product-image" /></label>
        </div>
      </div>
      <div class="field"><label>Κατάσταση</label>
        <label class="switch"><input type="checkbox" data-product-field="active" ${product.active ? 'checked' : ''} /> Ενεργό</label>
        <label class="switch"><input type="checkbox" data-product-field="featured" ${product.featured ? 'checked' : ''} /> Δημοφιλές</label>
      </div>
    </div>
    <div class="editor-head" style="margin-top:18px"><h2>Επιλογές / Variants</h2>
      <button type="button" class="abtn abtn--ghost2 abtn--sm" data-action="add-variant">+ Προσθήκη</button>
    </div>
    ${variants || '<p class="hint">Χωρίς επιλογές — χρησιμοποιείται η τιμή βάσης.</p>'}
  </div>`;
}

/* ---------- coupons ---------- */

function renderCoupons() {
  setActions('<button type="button" class="abtn abtn--primary" data-action="new-coupon">+ Νέο κουπόνι</button>');
  const rows = state.coupons
    .map(
      (coupon) => `<div class="prow ${coupon.active ? '' : 'prow--off'}">
        <div class="prow-main">
          <strong>${esc(coupon.code)}</strong>
          <div class="prow-meta">
            <span>${coupon.type === 'percent' ? `−${coupon.value}%` : `−${euro(coupon.value)}`}</span>
            ${coupon.minSubtotalCents ? `<span>ελάχ. ${euro(coupon.minSubtotalCents)}</span>` : ''}
            <span class="badge ${coupon.active ? 'badge--on' : 'badge--off'}">${coupon.active ? 'Ενεργό' : 'Ανενεργό'}</span>
            ${coupon.expiresAt ? `<span>λήξη ${esc(coupon.expiresAt)}</span>` : ''}
          </div>
        </div>
        <div class="prow-actions">
          <button type="button" class="icon-btn" data-action="edit-coupon" data-code="${esc(coupon.code)}" title="Επεξεργασία">✎</button>
          <button type="button" class="icon-btn icon-btn--danger" data-action="delete-coupon" data-code="${esc(coupon.code)}" title="Διαγραφή">🗑</button>
        </div>
      </div>`
    )
    .join('');
  return `<div class="panel">${rows || '<p class="hint">Δεν υπάρχουν κουπόνια.</p>'}</div>`;
}

function renderCouponEditor() {
  const coupon = state.editingCoupon;
  setActions(
    `<button type="button" class="abtn abtn--ghost2" data-action="cancel-coupon">Πίσω</button>
     <button type="button" class="abtn abtn--primary" data-action="save-coupon">Αποθήκευση</button>`
  );
  const isPercent = coupon.type === 'percent';
  return `<div class="panel">
    <div class="grid-2">
      <div class="field"><label>Κωδικός</label><input type="text" data-coupon-field="code" value="${esc(coupon.code)}" ${coupon._existing ? 'readonly' : ''} placeholder="π.χ. WELCOME10" /></div>
      <div class="field"><label>Τύπος</label><select data-coupon-field="type">
        <option value="percent" ${isPercent ? 'selected' : ''}>Ποσοστό (%)</option>
        <option value="fixed" ${!isPercent ? 'selected' : ''}>Σταθερό ποσό (€)</option>
      </select></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>${isPercent ? 'Ποσοστό (%)' : 'Ποσό (€)'}</label>
        <input type="text" inputmode="decimal" data-coupon-field="value" value="${isPercent ? coupon.value : euroInput(coupon.value)}" /></div>
      <div class="field"><label>Ελάχιστο ποσό (€)</label>
        <input type="text" inputmode="decimal" data-coupon-field="minSubtotalCents" value="${euroInput(coupon.minSubtotalCents)}" /></div>
    </div>
    <div class="grid-2">
      <div class="field"><label>Λήξη (προαιρετικό)</label><input type="date" data-coupon-field="expiresAt" value="${coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : ''}" /></div>
      <div class="field"><label>Κατάσταση</label>
        <label class="switch"><input type="checkbox" data-coupon-field="active" ${coupon.active ? 'checked' : ''} /> Ενεργό</label>
      </div>
    </div>
  </div>`;
}

/* ---------- render ---------- */

function render() {
  navEl.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === state.tab);
  });

  if (state.tab === 'orders') {
    pageTitle.textContent = 'Παραγγελίες';
    pageSubtitle.textContent = 'Δες τις παραγγελίες, ενημέρωσε κατάσταση και πρόσθεσε κωδικό αποστολής.';
    contentEl.innerHTML = renderOrders();
  } else if (state.tab === 'products') {
    if (state.editingProduct) {
      pageTitle.textContent = state.editingProduct.id ? 'Επεξεργασία προϊόντος' : 'Νέο προϊόν';
      pageSubtitle.textContent = 'Στοιχεία, τιμές και επιλογές προϊόντος.';
      contentEl.innerHTML = renderProductEditor();
    } else {
      pageTitle.textContent = 'Προϊόντα';
      pageSubtitle.textContent = 'Διαχείριση καταλόγου — προσθήκη, επεξεργασία, ενεργοποίηση.';
      contentEl.innerHTML = renderProducts();
    }
  } else {
    if (state.editingCoupon) {
      pageTitle.textContent = 'Κουπόνι';
      pageSubtitle.textContent = 'Ποσοστιαία ή σταθερή έκπτωση.';
      contentEl.innerHTML = renderCouponEditor();
    } else {
      pageTitle.textContent = 'Κουπόνια έκπτωσης';
      pageSubtitle.textContent = 'Δημιούργησε κωδικούς για προσφορές.';
      contentEl.innerHTML = renderCoupons();
    }
  }
}

/* ---------- loaders ---------- */

async function loadOrders() {
  setStatus('Φόρτωση...');
  try {
    state.orders = await api('/api/admin/shop/orders');
    render();
    setStatus('');
  } catch {
    setStatus('Σφάλμα φόρτωσης', 'error');
  }
}

async function loadProducts() {
  try {
    state.products = await api('/api/admin/shop/products');
    render();
  } catch {
    setStatus('Σφάλμα φόρτωσης', 'error');
  }
}

async function loadCoupons() {
  try {
    state.coupons = await api('/api/admin/shop/coupons');
    render();
  } catch {
    setStatus('Σφάλμα φόρτωσης', 'error');
  }
}

/* ---------- actions ---------- */

function slugify(text) {
  const map = { α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o', ά: 'a', έ: 'e', ή: 'i', ί: 'i', ό: 'o', ύ: 'y', ώ: 'o' };
  return String(text)
    .toLowerCase()
    .split('')
    .map((char) => map[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function newProduct() {
  state.editingProduct = {
    id: 0,
    slug: '',
    name: '',
    description: '',
    priceCents: 0,
    category: CATEGORIES[0].slug,
    imageKey: '',
    featured: false,
    active: true,
    variants: [{ name: '', priceCents: null, stock: 0, sku: '' }],
  };
  render();
}

function editProduct(id) {
  const product = state.products.find((item) => item.id === Number(id));
  if (!product) return;
  state.editingProduct = JSON.parse(JSON.stringify(product));
  render();
}

async function saveProduct() {
  const product = state.editingProduct;
  if (!product.name) {
    setStatus('Λείπει το όνομα', 'error');
    return;
  }
  if (!product.slug) product.slug = slugify(product.name);
  setStatus('Αποθήκευση...');
  try {
    if (product.id) {
      await api('/api/admin/shop/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } else {
      await api('/api/admin/shop/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    }
    state.editingProduct = null;
    await loadProducts();
    setStatus('Αποθηκεύτηκε', 'ok');
  } catch {
    setStatus('Σφάλμα αποθήκευσης', 'error');
  }
}

async function deleteProduct(id) {
  if (!window.confirm('Διαγραφή προϊόντος;')) return;
  try {
    await api(`/api/admin/shop/products?id=${id}`, { method: 'DELETE' });
    await loadProducts();
  } catch {
    setStatus('Σφάλμα διαγραφής', 'error');
  }
}

async function saveOrder(id) {
  const panel = contentEl.querySelector(`[data-order="${id}"]`);
  if (!panel) return;
  const value = (field) => panel.querySelector(`[data-order-field="${field}"]`);
  setStatus('Αποθήκευση...');
  try {
    await api('/api/admin/shop/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: Number(id),
        status: value('status').value,
        paymentStatus: value('paymentStatus').value,
        courier: value('courier').value,
        trackingCode: value('trackingCode').value,
      }),
    });
    await loadOrders();
    setStatus('Αποθηκεύτηκε', 'ok');
  } catch {
    setStatus('Σφάλμα αποθήκευσης', 'error');
  }
}

function newCoupon() {
  state.editingCoupon = {
    code: '',
    type: 'percent',
    value: 10,
    minSubtotalCents: 0,
    active: true,
    expiresAt: null,
    _existing: false,
  };
  render();
}

function editCoupon(code) {
  const coupon = state.coupons.find((item) => item.code === code);
  if (!coupon) return;
  state.editingCoupon = { ...JSON.parse(JSON.stringify(coupon)), _existing: true };
  render();
}

async function saveCoupon() {
  const coupon = state.editingCoupon;
  if (!coupon.code) {
    setStatus('Λείπει ο κωδικός', 'error');
    return;
  }
  setStatus('Αποθήκευση...');
  try {
    await api('/api/admin/shop/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minSubtotalCents: coupon.minSubtotalCents,
        active: coupon.active,
        expiresAt: coupon.expiresAt,
      }),
    });
    state.editingCoupon = null;
    await loadCoupons();
    setStatus('Αποθηκεύτηκε', 'ok');
  } catch {
    setStatus('Σφάλμα αποθήκευσης', 'error');
  }
}

async function deleteCoupon(code) {
  if (!window.confirm(`Διαγραφή κουπονιού ${code};`)) return;
  try {
    await api(`/api/admin/shop/coupons?code=${encodeURIComponent(code)}`, { method: 'DELETE' });
    await loadCoupons();
  } catch {
    setStatus('Σφάλμα διαγραφής', 'error');
  }
}

async function uploadProductImage(file) {
  if (!file || !state.editingProduct) return;
  setStatus('Ανέβασμα...');
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'image');
    const data = await api('/api/admin/upload', { method: 'POST', body: form });
    state.editingProduct.imageKey = String(data.url || '').replace(/^\/media\//, '');
    render();
    setStatus('Η εικόνα ανέβηκε', 'ok');
  } catch {
    setStatus('Σφάλμα ανεβάσματος', 'error');
  }
}

/* ---------- events ---------- */

navEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  state.tab = button.dataset.tab;
  state.editingProduct = null;
  state.editingCoupon = null;
  state.tab === 'orders' ? loadOrders() : render();
  if (state.tab === 'products' && !state.products.length) loadProducts();
  if (state.tab === 'coupons' && !state.coupons.length) loadCoupons();
});

actionsEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'new-product') newProduct();
  else if (action === 'save-product') saveProduct();
  else if (action === 'cancel-product') {
    state.editingProduct = null;
    render();
  } else if (action === 'new-coupon') newCoupon();
  else if (action === 'save-coupon') saveCoupon();
  else if (action === 'cancel-coupon') {
    state.editingCoupon = null;
    render();
  } else if (action === 'refresh-orders') loadOrders();
});

contentEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'save-order') saveOrder(target.dataset.id);
  else if (action === 'edit-product') editProduct(target.dataset.id);
  else if (action === 'delete-product') deleteProduct(target.dataset.id);
  else if (action === 'add-variant' && state.editingProduct) {
    state.editingProduct.variants.push({ name: '', priceCents: null, stock: 0, sku: '' });
    render();
  } else if (action === 'remove-variant' && state.editingProduct) {
    state.editingProduct.variants.splice(Number(target.dataset.index), 1);
    render();
  } else if (action === 'edit-coupon') editCoupon(target.dataset.code);
  else if (action === 'delete-coupon') deleteCoupon(target.dataset.code);
});

contentEl.addEventListener('input', (event) => {
  const el = event.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement))
    return;

  if (el.dataset.productField && state.editingProduct) {
    const field = el.dataset.productField;
    if (field === 'priceCents') state.editingProduct.priceCents = parseEuro(el.value);
    else if (field === 'active' || field === 'featured')
      state.editingProduct[field] = el.checked;
    else state.editingProduct[field] = el.value;
    if (field === 'name' && !state.editingProduct.slug) {
      state.editingProduct.slug = slugify(el.value);
      const slugInput = contentEl.querySelector('[data-product-field="slug"]');
      if (slugInput instanceof HTMLInputElement) slugInput.value = state.editingProduct.slug;
    }
    return;
  }

  if (el.dataset.variantIndex !== undefined && state.editingProduct) {
    const index = Number(el.dataset.variantIndex);
    const variant = state.editingProduct.variants[index];
    if (!variant) return;
    const field = el.dataset.variantField;
    if (field === 'priceCents') variant.priceCents = el.value.trim() === '' ? null : parseEuro(el.value);
    else if (field === 'stock') variant.stock = Math.max(0, Number(el.value) || 0);
    else variant[field] = el.value;
    return;
  }

  if (el.dataset.couponField && state.editingCoupon) {
    const field = el.dataset.couponField;
    if (field === 'active') state.editingCoupon.active = el.checked;
    else if (field === 'type') {
      state.editingCoupon.type = el.value;
      render();
    } else if (field === 'value') {
      state.editingCoupon.value =
        state.editingCoupon.type === 'percent' ? Number(el.value) || 0 : parseEuro(el.value);
    } else if (field === 'minSubtotalCents') state.editingCoupon.minSubtotalCents = parseEuro(el.value);
    else state.editingCoupon[field] = el.value;
  }
});

contentEl.addEventListener('change', (event) => {
  const el = event.target;
  if (el instanceof HTMLInputElement && el.dataset.action === 'upload-product-image') {
    uploadProductImage(el.files?.[0]);
    el.value = '';
  }
});

/* ---------- init ---------- */

loadOrders();
loadProducts();
loadCoupons();
