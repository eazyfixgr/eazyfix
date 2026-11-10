const contentEl = document.getElementById('admin-content');
const navEl = document.getElementById('adminNav');
const pageTitle = document.getElementById('pageTitle');
const pageSubtitle = document.getElementById('pageSubtitle');
const saveBtn = document.getElementById('save-btn');
const statusEl = document.getElementById('save-status');
const storageFill = document.getElementById('storage-fill');
const storageText = document.getElementById('storage-text');
const navProjectsCount = document.getElementById('nav-projects-count');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuBtn = document.getElementById('menuBtn');
const sidebarClose = document.getElementById('sidebarClose');

const CATEGORIES = [
  { slug: 'websites', label: 'Ιστοσελίδες' },
  { slug: 'android-apps', label: 'Εφαρμογές Android' },
  { slug: 'android-games', label: 'Παιχνίδια Android' },
  { slug: 'web-games', label: 'Παιχνίδια Web' },
  { slug: 'windows-apps', label: 'Windows & Python' },
  { slug: 'repairs', label: 'Service Ηλεκτρονικών' },
];

const CATEGORY_META = {
  websites: { link: true, download: false, screenshots: true, rich: true },
  'android-apps': { link: true, download: true, screenshots: true, rich: false },
  'android-games': { link: true, download: true, screenshots: true, rich: false },
  'web-games': { link: true, download: 'play', screenshots: true, rich: false },
  'windows-apps': { link: true, download: true, screenshots: true, rich: false },
  repairs: { link: false, download: false, screenshots: false, rich: false },
};

const ICONS = {
  power: '<path d="M12 2v10"/><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:
    '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  folder: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.18-9.17 4.16a2 2 0 0 1-1.66 0L2 12.18"/><path d="m22 17.18-9.17 4.16a2 2 0 0 1-1.66 0L2 17.18"/>',
  storage: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/>',
  cart: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
};

const state = {
  tab: 'dashboard',
  business: null,
  site: null,
  projects: [],
  storage: { used: 0, limit: 1 },
  editing: null,
  isNew: false,
  filter: 'all',
  search: '',
  editorTab: 'basics',
  dirty: false,
};

/* ------------------------------------------------------------------ utils */

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function icon(name, size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] ?? ''}</svg>`;
}

function slugify(text) {
  const greek = {
    α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l',
    μ: 'm', ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f',
    χ: 'ch', ψ: 'ps', ω: 'o', ά: 'a', έ: 'e', ή: 'i', ί: 'i', ό: 'o', ύ: 'y', ώ: 'o',
    ϊ: 'i', ϋ: 'y', ΐ: 'i', ΰ: 'y',
  };
  return String(text)
    .toLowerCase()
    .split('')
    .map((char) => greek[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || current[key] === null) {
      current[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function formatBytes(bytes) {
  if (!bytes) return '0 MB';
  const mb = bytes / 1048576;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function categoryLabel(slug) {
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}

function categoryMeta(slug) {
  return CATEGORY_META[slug] ?? { link: false, download: false, screenshots: true, rich: false };
}

function setStatus(text, kind = '') {
  statusEl.textContent = text;
  statusEl.className = `save-status ${kind}`;
}

function markDirty() {
  state.dirty = true;
  setStatus('Μη αποθηκευμένες αλλαγές');
}

function setStorage(data) {
  state.storage = data;
  const pct = Math.min(100, (data.used / data.limit) * 100);
  if (storageFill) storageFill.style.width = `${pct.toFixed(2)}%`;
  if (storageText) storageText.textContent = formatBytes(data.used);
}

/* -------------------------------------------------------------------- api */

async function refreshStorage() {
  try {
    const res = await fetch('/api/admin/storage');
    if (!res.ok) return;
    setStorage(await res.json());
  } catch {
    /* ignore */
  }
}

async function handleResponse(res) {
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('unauthorized');
  }
  return res;
}

async function saveProjectsOnly() {
  try {
    await handleResponse(
      await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.projects),
      })
    );
    state.dirty = false;
    setStatus('Αποθηκεύτηκε', 'ok');
  } catch {
    setStatus('Σφάλμα αποθήκευσης', 'error');
  }
}

async function saveAll() {
  saveBtn.disabled = true;
  setStatus('Αποθήκευση...');
  try {
    if (state.editing) commitEditing();
    const responses = await Promise.all([
      fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.business),
      }),
      fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.projects),
      }),
      fetch('/api/admin/site', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.site),
      }),
    ]);
    responses.forEach((res) => {
      if (res.status === 401) window.location.href = '/admin/login';
    });
    if (responses.some((res) => !res.ok)) throw new Error('save failed');
    state.dirty = false;
    setStatus('Αποθηκεύτηκε', 'ok');
    render();
  } catch {
    setStatus('Σφάλμα αποθήκευσης', 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

async function uploadImages(files) {
  if (!files || files.length === 0 || !state.editing) return;
  setStatus('Ανέβασμα...');
  try {
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', 'image');
      const res = await handleResponse(await fetch('/api/admin/upload', { method: 'POST', body: form }));
      const data = await res.json();
      if (data.url) state.editing.screenshots.push(data.url);
    }
    markDirty();
    setStatus('Ανέβηκε — πατήστε Αποθήκευση', 'ok');
    render();
    refreshStorage();
  } catch {
    setStatus('Σφάλμα ανεβάσματος', 'error');
  }
}

async function uploadDownload(file) {
  if (!file || !state.editing) return;
  setStatus('Ανέβασμα...');
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'file');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 413 || data.error === 'too_large') {
      setStatus(`Το αρχείο είναι μεγαλύτερο από ${formatBytes(data.max ?? 25165824)}`, 'error');
      return;
    }
    if (!res.ok || !data.url) throw new Error('upload failed');
    state.editing.downloadUrl = data.url;
    state.editing.downloadName = data.name;
    state.editing.downloadSize = data.size;
    markDirty();
    setStatus('Ανέβηκε — πατήστε Αποθήκευση', 'ok');
    render();
    refreshStorage();
  } catch {
    setStatus('Σφάλμα ανεβάσματος', 'error');
  }
}

async function uploadBrand(file, path) {
  if (!file || !state.site || !path) return;
  setStatus('Ανέβασμα...');
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', 'image');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error('upload failed');
    setPath(state.site, path, data.url);
    markDirty();
    setStatus('Ανέβηκε — πατήστε Αποθήκευση', 'ok');
    render();
    refreshStorage();
  } catch {
    setStatus('Σφάλμα ανεβάσματος', 'error');
  }
}

/* ---------------------------------------------------------------- helpers */

function field(label, path, value, type = 'text', attrs = '') {
  return `<div class="field"><label>${esc(label)}</label><input type="${type}" data-path="${path}" value="${esc(value)}" ${attrs} /></div>`;
}

function bi(label, base, obj, multiline = false, rows = 3) {
  const control = (loc) => {
    const value = esc(obj?.[loc] ?? '');
    return multiline
      ? `<textarea rows="${rows}" data-path="${base}.${loc}">${value}</textarea>`
      : `<input type="text" data-path="${base}.${loc}" value="${value}" />`;
  };
  return `<div class="field"><label>${esc(label)}</label>
    <div class="bi-row">
      <div class="bi"><span class="flag">EL</span>${control('el')}</div>
      <div class="bi"><span class="flag">EN</span>${control('en')}</div>
    </div></div>`;
}

function siteField(label, path, value, type = 'text') {
  return `<div class="field"><label>${esc(label)}</label><input type="${type}" data-site="${path}" value="${esc(value)}" /></div>`;
}

function siteBi(label, base, obj, multiline = false, rows = 3) {
  const control = (loc) => {
    const value = esc(obj?.[loc] ?? '');
    return multiline
      ? `<textarea rows="${rows}" data-site="${base}.${loc}">${value}</textarea>`
      : `<input type="text" data-site="${base}.${loc}" value="${value}" />`;
  };
  return `<div class="field"><label>${esc(label)}</label>
    <div class="bi-row">
      <div class="bi"><span class="flag">EL</span>${control('el')}</div>
      <div class="bi"><span class="flag">EN</span>${control('en')}</div>
    </div></div>`;
}

function businessField(label, path, value, type = 'text') {
  return `<div class="field"><label>${esc(label)}</label><input type="${type}" data-bind="${path}" value="${esc(value)}" /></div>`;
}

function businessBi(label, base, obj, multiline = false) {
  const control = (loc) => {
    const value = esc(obj?.[loc] ?? '');
    return multiline
      ? `<textarea rows="3" data-bind="${base}.${loc}">${value}</textarea>`
      : `<input type="text" data-bind="${base}.${loc}" value="${value}" />`;
  };
  return `<div class="field"><label>${esc(label)}</label>
    <div class="bi-row">
      <div class="bi"><span class="flag">EL</span>${control('el')}</div>
      <div class="bi"><span class="flag">EN</span>${control('en')}</div>
    </div></div>`;
}

function section(title, hint, body) {
  return `<div class="form-section"><h3>${esc(title)}</h3>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}${body}</div>`;
}

/* -------------------------------------------------------------- dashboard */

function renderDashboard() {
  const enabled = state.projects.filter((p) => p.enabled).length;
  const shots = state.projects.reduce((sum, p) => sum + (p.screenshots?.length ?? 0), 0);
  const counts = CATEGORIES.map((category) => ({
    ...category,
    count: state.projects.filter((p) => p.category === category.slug).length,
  }));

  return `<div class="dash-grid">
    <div class="stat-card">
      <div class="stat-top"><span class="stat-icon">${icon('layers', 19)}</span></div>
      <strong>${state.projects.length}</strong>
      <span>Projects συνολικά</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-icon">${icon('check', 19)}</span></div>
      <strong>${enabled}</strong>
      <span>Ενεργά στη σελίδα</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-icon">${icon('image', 19)}</span></div>
      <strong>${shots}</strong>
      <span>Screenshots</span>
    </div>
    <div class="stat-card">
      <div class="stat-top"><span class="stat-icon">${icon('storage', 19)}</span></div>
      <strong>${formatBytes(state.storage.used)}</strong>
      <span>από ${formatBytes(state.storage.limit)}</span>
    </div>
  </div>

  <div class="dash-columns">
    <div class="panel">
      <h2>Projects ανά κατηγορία</h2>
      <div class="cat-list">
        ${counts
          .map(
            (category) => `<button type="button" class="cat-row" data-action="filter-cat" data-cat="${category.slug}">
              <strong>${esc(category.label)}</strong>
              <span>${category.count} ${category.count === 1 ? 'project' : 'projects'}</span>
            </button>`
          )
          .join('')}
      </div>
    </div>
    <div class="panel">
      <h2>Γρήγορες ενέργειες</h2>
      <div class="quick-grid">
        <button type="button" class="quick-btn" data-action="new-project">${icon('plus', 17)} Νέο project</button>
        <button type="button" class="quick-btn" data-action="goto-content">${icon('sparkles', 17)} Hero &amp; περιεχόμενο</button>
        <a class="quick-btn" href="/" target="_blank" rel="noopener">${icon('globe', 17)} Προβολή site</a>
        <a class="quick-btn" href="/admin/shop">${icon('cart', 17)} E-shop</a>
      </div>
    </div>
  </div>`;
}

/* --------------------------------------------------------------- projects */

function renderProjectsList() {
  const filters = [{ slug: 'all', label: 'Όλα' }, ...CATEGORIES]
    .map(
      (category) =>
        `<button type="button" data-action="filter" data-cat="${category.slug}" class="${state.filter === category.slug ? 'active' : ''}">${esc(category.label)}</button>`
    )
    .join('');

  const rows = state.projects
    .map((project) => {
      const meta = categoryMeta(project.category);
      const preview =
        project.enabled && project.slug
          ? `<a class="icon-btn" href="/projects/${esc(project.slug)}" target="_blank" rel="noopener" title="Προβολή">${icon('eye')}</a>`
          : '';
      return `<div class="prow ${project.enabled ? '' : 'prow--off'}" data-project-row data-name="${esc(
        `${project.name} ${project.slug}`.toLowerCase()
      )}" data-cat="${esc(project.category)}">
        <div class="prow-main">
          <strong>${esc(project.name || '(χωρίς όνομα)')}</strong>
          <div class="prow-meta">
            <span class="badge badge--cat">${esc(categoryLabel(project.category))}</span>
            <span class="badge ${project.enabled ? 'badge--on' : 'badge--off'}">${project.enabled ? 'Ενεργό' : 'Ανενεργό'}</span>
            ${meta.screenshots ? `<span>${(project.screenshots || []).length} screenshots</span>` : ''}
            ${project.slug ? `<span>/${esc(project.slug)}</span>` : ''}
          </div>
        </div>
        <div class="prow-actions">
          ${preview}
          <button type="button" class="icon-btn ${project.enabled ? '' : 'icon-btn--on'}" data-action="toggle" data-id="${esc(project.id)}" title="${project.enabled ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}">${icon('power')}</button>
          <button type="button" class="icon-btn" data-action="edit" data-id="${esc(project.id)}" title="Επεξεργασία">${icon('edit')}</button>
          <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-id="${esc(project.id)}" title="Διαγραφή">${icon('trash')}</button>
        </div>
      </div>`;
    })
    .join('');

  return `<div class="toolbar">
      <div class="filters">${filters}</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:auto">
        <div class="search-box">
          ${icon('search', 15)}
          <input type="search" data-search placeholder="Αναζήτηση project..." value="${esc(state.search)}" />
        </div>
        <button type="button" class="abtn abtn--primary" data-action="new-project">${icon('plus')} Νέο project</button>
      </div>
    </div>
    ${rows || ''}
    <div class="empty" id="projects-empty" ${rows ? 'hidden' : ''}>
      <strong>Δεν βρέθηκαν projects</strong>
      <span>Δοκίμασε άλλη αναζήτηση ή πρόσθεσε νέο project.</span>
    </div>`;
}

function applyProjectFilter() {
  const query = state.search.trim().toLowerCase();
  let visible = 0;
  contentEl.querySelectorAll('[data-project-row]').forEach((row) => {
    const matchesSearch = !query || row.dataset.name.includes(query);
    const matchesCategory = state.filter === 'all' || row.dataset.cat === state.filter;
    const show = matchesSearch && matchesCategory;
    row.hidden = !show;
    if (show) visible += 1;
  });
  const empty = document.getElementById('projects-empty');
  if (empty) empty.hidden = visible > 0;
}

/* ----------------------------------------------------------------- editor */

function editorTabs(project) {
  const meta = categoryMeta(project.category);
  const tabs = [
    { id: 'basics', label: 'Βασικά' },
    { id: 'content', label: 'Περιεχόμενο' },
  ];
  if (meta.screenshots) tabs.push({ id: 'media', label: 'Screenshots' });
  if (meta.link || meta.download) tabs.push({ id: 'links', label: 'Σύνδεσμοι' });
  if (meta.rich) tabs.push({ id: 'rich', label: 'Τιμές & SEO' });
  return tabs;
}

function renderBasics(project) {
  return `<div class="panel">
    <div class="form-section">
      <h3>Ταυτότητα</h3>
      <p class="hint">Το όνομα και το slug εμφανίζονται στη σελίδα και στο URL.</p>
      <div class="grid-2">
        ${field('Όνομα', 'name', project.name)}
        ${field('Slug (URL)', 'slug', project.slug, 'text', 'placeholder="auto"')}
      </div>
      <div class="grid-2">
        <div class="field"><label>Κατηγορία</label><select data-path="category">${CATEGORIES.map(
          (category) =>
            `<option value="${category.slug}" ${project.category === category.slug ? 'selected' : ''}>${esc(category.label)}</option>`
        ).join('')}</select></div>
        <div class="field"><label>Κατάσταση</label>
          <label class="switch"><input type="checkbox" data-path="enabled" ${project.enabled ? 'checked' : ''} /> Ενεργό στη σελίδα</label>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3>Σύντομη περιγραφή</h3>
      <p class="hint">Εμφανίζεται στις κάρτες της αρχικής και στην κορυφή της σελίδας project.</p>
      ${bi('Περιγραφή', 'description', project.description, true)}
    </div>

    <div class="form-section">
      <h3>Tags</h3>
      <p class="hint">Χωρισμένα με κόμμα. Για τα services χρησιμοποιούνται συχνά ως τιμές (π.χ. «από 30€»).</p>
      ${field('Tags', 'tags', (project.tags || []).join(', '), 'text', 'data-type="list"')}
    </div>
  </div>`;
}

function renderContentTab(project) {
  const meta = categoryMeta(project.category);
  return `<div class="panel">
    <div class="form-section">
      <h3>Αναλυτικό κείμενο</h3>
      <p class="hint">Η μεγάλη περιγραφή της σελίδας. Χρησιμοποίησε κενή γραμμή για νέα παράγραφο.</p>
      ${bi('Κείμενο', 'body', project.body, true, 8)}
    </div>

    <div class="form-section">
      <h3>Βασικά σημεία</h3>
      <p class="hint">Μία γραμμή ανά σημείο. Εμφανίζονται ως λίστα ή κάρτες στη σελίδα.</p>
      <div class="bi-row">
        <div class="bi"><span class="flag">EL</span><textarea rows="7" data-path="features.el" data-type="lines">${esc((project.features?.el || []).join('\n'))}</textarea></div>
        <div class="bi"><span class="flag">EN</span><textarea rows="7" data-path="features.en" data-type="lines">${esc((project.features?.en || []).join('\n'))}</textarea></div>
      </div>
    </div>

    ${
      meta.rich
        ? `<div class="form-section">
            <h3>Εικονίδια δυνατοτήτων</h3>
            <p class="hint">Προαιρετικό. Ονόματα εικονιδίων με κόμμα, στην ίδια σειρά με τα βασικά σημεία. π.χ. layout, search, sliders, map, globe, heart, file-text, git-compare, users, devices, zap, wrench.</p>
            ${field('Icons', 'featureIcons', (project.featureIcons || []).join(', '), 'text', 'data-type="list"')}
          </div>`
        : ''
    }
  </div>`;
}

function renderMedia(project) {
  const shots = (project.screenshots || [])
    .map(
      (url, index) => `<div class="shot">
        <img src="${esc(url)}" alt="" />
        <button type="button" class="shot-remove" data-action="remove-shot" data-index="${index}" aria-label="Διαγραφή">×</button>
      </div>`
    )
    .join('');

  return `<div class="panel">
    <div class="form-section">
      <h3>Screenshots</h3>
      <p class="hint">Οι πρώτες εικόνες εμφανίζονται στη gallery της σελίδας. Σύρετε για αλλαγή σειράς; προς το παρόν χρησιμοποιήστε τη σειρά προσθήκης.</p>
      ${shots ? `<div class="shots">${shots}</div>` : ''}
      <div class="upload-row">
        <label class="file-btn">${icon('image')} Ανέβασμα εικόνων
          <input type="file" accept="image/*" multiple data-action="upload" />
        </label>
        <input type="text" id="shot-url" placeholder="https://..." style="max-width:300px" />
        <button type="button" class="abtn abtn--ghost2 abtn--sm" data-action="add-shot">Προσθήκη από URL</button>
      </div>
    </div>
  </div>`;
}

function renderLinks(project) {
  const meta = categoryMeta(project.category);
  const isPlay = meta.download === 'play';
  const linkHint =
    project.category === 'websites'
      ? 'Ο σύνδεσμος της πραγματικής ιστοσελίδας.'
      : 'Ο σύνδεσμος του GitHub repository.';

  const downloadBlock = meta.download
    ? `<div class="form-section">
        <h3>${isPlay ? 'Σύνδεσμος παιχνιδιού' : 'Αρχείο λήψης'}</h3>
        <p class="hint">${
          isPlay
            ? 'Το URL όπου παίζει το παιχνίδι (π.χ. GitHub Pages). Δεν χρειάζεται ανέβασμα αρχείου.'
            : 'Ανέβασε EXE/ZIP/APK ή βάλε απευθείας URL. Το όνομα και το μέγεθος συμπληρώνονται αυτόματα.'
        }</p>
        <div class="upload-row">
          <input type="text" data-path="downloadUrl" value="${esc(project.downloadUrl ?? '')}" placeholder="https://..." style="flex:1;min-width:220px" />
          ${project.downloadUrl ? `<a class="abtn abtn--ghost2 abtn--sm" href="${esc(project.downloadUrl)}" target="_blank" rel="noopener">${icon('external')} Άνοιγμα</a><button type="button" class="abtn abtn--danger abtn--sm" data-action="clear-download">Καθαρισμός</button>` : ''}
        </div>
        ${
          isPlay
            ? ''
            : `<div class="upload-row" style="margin-top:10px">
                <label class="file-btn">${icon('download')} Ανέβασμα αρχείου
                  <input type="file" data-action="upload-file" />
                </label>
                <span class="hint" style="margin:0">Μέγιστο 24 MB ανά αρχείο</span>
              </div>`
        }
        ${
          project.downloadName
            ? `<p class="hint">${esc(project.downloadName)}${project.downloadSize ? ` · ${formatBytes(project.downloadSize)}` : ''}</p>`
            : ''
        }
        ${bi(isPlay ? 'Ετικέτα κουμπιού' : 'Ετικέτα λήψης', 'downloadLabel', project.downloadLabel ?? { el: '', en: '' })}
      </div>`
    : '';

  return `<div class="panel">
    <div class="form-section">
      <h3>Σύνδεσμος</h3>
      <p class="hint">${linkHint}</p>
      ${field('URL', 'url', project.url ?? '', 'text', 'placeholder="https:// ή /"')}
      ${bi('Ετικέτα συνδέσμου', 'linkLabel', project.linkLabel ?? { el: '', en: '' })}
    </div>
    ${downloadBlock}
  </div>`;
}

function renderRich(project) {
  const pricing = project.pricing;
  const plans = [0, 1]
    .map((index) => {
      const plan = pricing?.plans?.[index] ?? {};
      return `<div class="mini-card">
        <div class="mini-card-head"><strong>Πακέτο ${index + 1}</strong>
          <label class="switch"><input type="checkbox" data-path="pricing.plans.${index}.highlight" ${plan.highlight ? 'checked' : ''} /> Προσφορά</label>
        </div>
        <div class="grid-2">
          ${bi('Όνομα', `pricing.plans.${index}.name`, plan.name ?? { el: '', en: '' })}
          ${bi('Badge', `pricing.plans.${index}.badge`, plan.badge ?? { el: '', en: '' })}
        </div>
        <div class="grid-2">
          ${field('Εφάπαξ', `pricing.plans.${index}.setup`, plan.setup ?? '')}
          ${field('Μηνιαία', `pricing.plans.${index}.monthly`, plan.monthly ?? '')}
        </div>
        ${bi('Σημείωση', `pricing.plans.${index}.note`, plan.note ?? { el: '', en: '' })}
      </div>`;
    })
    .join('');

  return `<div class="panel">
    <div class="form-section">
      <h3>SEO</h3>
      <p class="hint">Τίτλος και περιγραφή για Google/κοινωνικά δίκτυα. Αν μείνουν κενά, χρησιμοποιείται η σύντομη περιγραφή.</p>
      ${bi('SEO title', 'seo.title', project.seo?.title ?? { el: '', en: '' })}
      ${bi('SEO description', 'seo.description', project.seo?.description ?? { el: '', en: '' }, true)}
      ${bi('SEO keywords', 'seo.keywords', project.seo?.keywords ?? { el: '', en: '' })}
    </div>

    <div class="form-section">
      <h3>Τιμοκατάλογος</h3>
      <p class="hint">Εμφανίζεται μόνο αν συμπληρωθούν τίτλος και τουλάχιστον ένα πακέτο.</p>
      ${bi('Eyebrow', 'pricing.eyebrow', pricing?.eyebrow ?? { el: '', en: '' })}
      ${bi('Τίτλος ενότητας', 'pricing.title', pricing?.title ?? { el: '', en: '' })}
      ${bi('Υπότιτλος', 'pricing.lead', pricing?.lead ?? { el: '', en: '' }, true)}
      ${plans}
      <div class="field" style="margin-top:14px"><label>Τι περιλαμβάνει η μηνιαία (μία ανά γραμμή)</label>
        <div class="bi-row">
          <div class="bi"><span class="flag">EL</span><textarea rows="5" data-path="pricing.includes.el" data-type="lines">${esc((pricing?.includes?.el || []).join('\n'))}</textarea></div>
          <div class="bi"><span class="flag">EN</span><textarea rows="5" data-path="pricing.includes.en" data-type="lines">${esc((pricing?.includes?.en || []).join('\n'))}</textarea></div>
        </div>
      </div>
      ${bi('Υποσημείωση (ΦΠΑ κ.λπ.)', 'pricing.footnote', pricing?.footnote ?? { el: '', en: '' }, true)}
    </div>

    <div class="form-section">
      <h3>Υπηρεσία μεταφοράς αγγελιών</h3>
      ${bi('Τίτλος', 'service.title', project.service?.title ?? { el: '', en: '' })}
      ${bi('Κείμενο', 'service.body', project.service?.body ?? { el: '', en: '' }, true)}
      ${bi('Τιμή', 'service.priceLabel', project.service?.priceLabel ?? { el: '', en: '' })}
      ${bi('Σημείωση', 'service.note', project.service?.note ?? { el: '', en: '' }, true)}
    </div>

    <div class="form-section">
      <h3>Τελικό CTA</h3>
      ${bi('Τίτλος', 'cta.title', project.cta?.title ?? { el: '', en: '' })}
      ${bi('Κείμενο', 'cta.body', project.cta?.body ?? { el: '', en: '' }, true)}
      <div class="grid-2">
        ${bi('Κουμπί 1 — κείμενο', 'cta.primary.label', project.cta?.primary?.label ?? { el: '', en: '' })}
        ${field('Κουμπί 1 — URL', 'cta.primary.href', project.cta?.primary?.href ?? '')}
      </div>
      <div class="grid-2">
        ${bi('Κουμπί 2 — κείμενο', 'cta.secondary.label', project.cta?.secondary?.label ?? { el: '', en: '' })}
        ${field('Κουμπί 2 — URL (contact = φόρμα)', 'cta.secondary.href', project.cta?.secondary?.href ?? '')}
      </div>
    </div>
  </div>`;
}

function renderEditor() {
  const project = state.editing;
  const meta = categoryMeta(project.category);
  const tabs = editorTabs(project);
  const activeTab = tabs.some((tab) => tab.id === state.editorTab) ? state.editorTab : 'basics';
  const thumb = (project.screenshots || [])[0];

  const tabPanels = {
    basics: renderBasics(project),
    content: renderContentTab(project),
    media: meta.screenshots ? renderMedia(project) : '',
    links: meta.link || meta.download ? renderLinks(project) : '',
    rich: meta.rich ? renderRich(project) : '',
  };

  return `<div class="editor-layout">
    <div>
      <div class="editor-tabs">
        ${tabs
          .map(
            (tab) =>
              `<button type="button" class="editor-tab ${activeTab === tab.id ? 'active' : ''}" data-action="editor-tab" data-tab="${tab.id}">${esc(tab.label)}</button>`
          )
          .join('')}
      </div>
      ${tabs.map((tab) => `<div class="tab-panel ${activeTab === tab.id ? 'active' : ''}" data-tab-panel="${tab.id}">${tabPanels[tab.id] ?? ''}</div>`).join('')}
    </div>

    <aside class="editor-aside">
      <div class="summary-card">
        <div class="summary-thumb">${thumb ? `<img src="${esc(thumb)}" alt="" />` : icon('image', 34)}</div>
        <strong style="display:block;font-size:1rem">${esc(project.name || 'Χωρίς όνομα')}</strong>
        <div class="summary-row"><span>Κατηγορία</span><strong>${esc(categoryLabel(project.category))}</strong></div>
        <div class="summary-row"><span>Κατάσταση</span><strong>${project.enabled ? 'Ενεργό' : 'Ανενεργό'}</strong></div>
        <div class="summary-row"><span>Slug</span><strong>${esc(project.slug || '—')}</strong></div>
        ${meta.screenshots ? `<div class="summary-row"><span>Screenshots</span><strong>${(project.screenshots || []).length}</strong></div>` : ''}
        <div class="summary-row"><span>Σημεία</span><strong>${(project.features?.['el'] || []).length}</strong></div>
        <div style="display:grid;gap:8px;margin-top:14px">
          ${
            project.enabled && project.slug
              ? `<a class="abtn abtn--ghost2 abtn--sm" href="/projects/${esc(project.slug)}" target="_blank" rel="noopener">${icon('eye')} Προβολή project</a>`
              : ''
          }
          <button type="button" class="abtn abtn--ghost2 abtn--sm" data-action="cancel">${icon('arrowLeft')} Πίσω στη λίστα</button>
          ${state.isNew ? '' : `<button type="button" class="abtn abtn--danger abtn--sm" data-action="delete" data-id="${esc(project.id)}">${icon('trash')} Διαγραφή</button>`}
        </div>
      </div>
    </aside>
  </div>`;
}

/* --------------------------------------------------------------- content */

function renderContent() {
  const c = state.site;
  const stats = c.hero.stats
    .map(
      (stat, index) => `<div class="mini-card">
        <div class="mini-card-head"><strong>Στατιστικό ${index + 1}</strong>
          <button type="button" class="icon-btn icon-btn--danger" data-action="remove-stat" data-index="${index}" title="Διαγραφή">${icon('trash')}</button>
        </div>
        ${siteField('Τιμή', `hero.stats.${index}.value`, stat.value)}
        ${siteBi('Ετικέτα', `hero.stats.${index}.label`, stat.label)}
      </div>`
    )
    .join('');

  return `<div class="content-stack">
    <div class="panel">
      <h2>Hero (αρχική ενότητα)</h2>
      ${siteBi('Ετικέτα (badge)', 'hero.badge', c.hero.badge)}
      ${siteBi('Τίτλος', 'hero.title', c.hero.title)}
      ${siteBi('Τίτλος — τονισμένη γραμμή', 'hero.titleAccent', c.hero.titleAccent)}
      ${siteBi('Υπότιτλος', 'hero.subtitle', c.hero.subtitle, true)}
      <div class="grid-2">
        ${siteBi('Κουμπί 1', 'hero.primaryCta', c.hero.primaryCta)}
        ${siteBi('Κουμπί 2', 'hero.secondaryCta', c.hero.secondaryCta)}
      </div>
    </div>

    <div class="panel">
      <div class="editor-head"><h2>Στατιστικά Hero</h2>
        <button type="button" class="abtn abtn--ghost2 abtn--sm" data-action="add-stat">+ Προσθήκη</button>
      </div>
      ${stats || '<p class="hint">Δεν υπάρχουν στατιστικά.</p>'}
    </div>

    <div class="panel">
      <h2>Σχετικά με εμένα</h2>
      ${siteBi('Τίτλος', 'about.title', c.about.title)}
      ${siteBi('Υπότιτλος (όνομα & ιδιότητα)', 'about.lead', c.about.lead)}
      ${siteBi('Κείμενο', 'about.text', c.about.text, true, 8)}
      <div class="field"><label>Τεχνολογίες (μία ανά γραμμή)</label>
        <textarea rows="7" data-site="about.skills" data-site-type="lines">${esc((c.about.skills || []).join('\n'))}</textarea>
      </div>
    </div>

    <div class="panel">
      <h2>Επικοινωνία (τίτλοι)</h2>
      ${siteBi('Τίτλος', 'contact.title', c.contact.title)}
      ${siteBi('Υπότιτλος', 'contact.subtitle', c.contact.subtitle, true)}
    </div>

    <div class="panel">
      <h2>Εμφάνιση &amp; κοινοποίηση</h2>
      <div class="field">
        <label>Favicon — εικονίδιο σελίδας (SVG ή PNG)</label>
        <div class="upload-row">
          <img class="brand-preview" src="${esc(c.branding?.favicon || '/favicon.svg')}" alt="" />
          <input type="text" data-site="branding.favicon" value="${esc(c.branding?.favicon ?? '')}" placeholder="/favicon.svg ή /media/..." />
          <label class="file-btn">Ανέβασμα<input type="file" accept="image/*" data-action="upload-brand" data-target="branding.favicon" /></label>
        </div>
      </div>
      <div class="field">
        <label>Εικόνα κοινοποίησης (Open Graph, 1200×630)</label>
        <div class="upload-row">
          <img class="brand-preview brand-preview--wide" src="${esc(c.branding?.ogImage || '/og.png')}" alt="" />
          <input type="text" data-site="branding.ogImage" value="${esc(c.branding?.ogImage ?? '')}" placeholder="/og.png ή /media/..." />
          <label class="file-btn">Ανέβασμα<input type="file" accept="image/*" data-action="upload-brand" data-target="branding.ogImage" /></label>
        </div>
      </div>
      <p class="hint">Το favicon είναι το εικονίδιο στην καρτέλα του browser. Η εικόνα κοινοποίησης εμφανίζεται σε Viber / Messenger / WhatsApp / Facebook όταν στέλνεις το link.</p>
    </div>
  </div>`;
}

/* -------------------------------------------------------------- business */

function renderBusiness() {
  const b = state.business;
  return `<div class="content-stack">
    <div class="panel">
      <h2>Στοιχεία επικοινωνίας</h2>
      <div class="grid-2">
        ${businessField('Όνομα', 'name', b.name)}
        ${businessField('Τηλέφωνο', 'phone', b.phone)}
      </div>
      <div class="grid-2">
        ${businessField('Email', 'email', b.email, 'email')}
        ${businessField('WhatsApp (για τη φόρμα)', 'whatsapp', b.whatsapp)}
      </div>
      <p class="hint">Το WhatsApp χρησιμοποιείται από τη φόρμα επικοινωνίας του site.</p>
    </div>

    <div class="panel">
      <h2>Παρουσίαση</h2>
      ${businessBi('Tagline', 'tagline', b.tagline)}
      ${businessBi('Περιγραφή', 'description', b.description, true)}
    </div>

    <div class="panel">
      <h2>Περιοχή &amp; ωράριο</h2>
      ${businessBi('Περιοχή', 'address', b.address)}
      ${businessBi('Ώρες λειτουργίας', 'hours', b.hours, true)}
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ render */

function renderNav() {
  navEl.querySelectorAll('button').forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === state.tab);
  });
  if (navProjectsCount) navProjectsCount.textContent = String(state.projects.length);
}

function render() {
  renderNav();
  sidebar?.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.hidden = true;

  if (state.tab === 'projects') {
    if (state.editing) {
      pageTitle.textContent = state.isNew ? 'Νέο project' : 'Επεξεργασία project';
      pageSubtitle.textContent = 'Συμπλήρωσε τα στοιχεία και πάτησε Αποθήκευση.';
      contentEl.innerHTML = renderEditor();
    } else {
      pageTitle.textContent = 'Projects';
      pageSubtitle.textContent = 'Διαχείριση projects ανά κατηγορία.';
      contentEl.innerHTML = renderProjectsList();
      applyProjectFilter();
    }
  } else if (state.tab === 'content') {
    pageTitle.textContent = 'Περιεχόμενο σελίδας';
    pageSubtitle.textContent = 'Hero, Σχετικά με εμένα, Επικοινωνία και branding.';
    contentEl.innerHTML = renderContent();
  } else if (state.tab === 'business') {
    pageTitle.textContent = 'Επιχείρηση';
    pageSubtitle.textContent = 'Τηλέφωνο, email, WhatsApp, περιοχή και ωράριο.';
    contentEl.innerHTML = renderBusiness();
  } else {
    pageTitle.textContent = 'Dashboard';
    pageSubtitle.textContent = 'Επισκόπηση της σελίδας και γρήγορες ενέργειες.';
    contentEl.innerHTML = renderDashboard();
  }
}

/* ----------------------------------------------------------------- actions */

function newProject() {
  state.editing = {
    id: 'p-' + Date.now().toString(36),
    slug: '',
    category: 'websites',
    name: '',
    enabled: true,
    description: { el: '', en: '' },
    body: { el: '', en: '' },
    features: { el: [], en: [] },
    tags: [],
    url: '',
    linkLabel: { el: '', en: '' },
    screenshots: [],
  };
  state.isNew = true;
  state.tab = 'projects';
  state.editorTab = 'basics';
  markDirty();
  render();
}

function editProject(id) {
  const project = state.projects.find((item) => item.id === id);
  if (!project) return;
  state.editing = clone(project);
  state.isNew = false;
  state.tab = 'projects';
  state.editorTab = 'basics';
  render();
}

function commitEditing() {
  if (!state.editing) return;
  if (!state.editing.slug) {
    state.editing.slug = slugify(state.editing.name) || state.editing.id;
  }
  const index = state.projects.findIndex((item) => item.id === state.editing.id);
  if (index === -1) state.projects.push(state.editing);
  else state.projects[index] = state.editing;
  state.editing = null;
  state.isNew = false;
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.hidden = true;
}

function openSidebar() {
  sidebar?.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.hidden = false;
}

function applySearch() {
  contentEl.querySelectorAll('[data-search]').forEach((input) => {
    if (input instanceof HTMLInputElement) state.search = input.value;
  });
  applyProjectFilter();
}

/* ------------------------------------------------------------------ events */

navEl?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  state.tab = button.dataset.tab;
  state.editing = null;
  closeSidebar();
  render();
});

menuBtn?.addEventListener('click', openSidebar);
sidebarClose?.addEventListener('click', closeSidebar);
sidebarOverlay?.addEventListener('click', closeSidebar);

contentEl.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'new-project') newProject();
  else if (action === 'edit') editProject(target.dataset.id);
  else if (action === 'cancel') {
    state.editing = null;
    state.isNew = false;
    render();
  } else if (action === 'filter') {
    state.filter = target.dataset.cat;
    contentEl.querySelectorAll('[data-action="filter"]').forEach((button) => {
      button.classList.toggle('active', button === target);
    });
    applyProjectFilter();
  } else if (action === 'filter-cat') {
    state.filter = target.dataset.cat;
    state.tab = 'projects';
    state.editing = null;
    render();
  } else if (action === 'toggle') {
    const project = state.projects.find((item) => item.id === target.dataset.id);
    if (project) {
      project.enabled = !project.enabled;
      saveProjectsOnly();
      render();
    }
  } else if (action === 'delete') {
    const project = state.projects.find((item) => item.id === target.dataset.id);
    if (project && window.confirm(`Διαγραφή του «${project.name}»;`)) {
      state.projects = state.projects.filter((item) => item.id !== target.dataset.id);
      if (state.editing?.id === project.id) {
        state.editing = null;
        state.isNew = false;
      }
      saveProjectsOnly();
      render();
    }
  } else if (action === 'editor-tab') {
    state.editorTab = target.dataset.tab;
    render();
  } else if (action === 'clear-download' && state.editing) {
    state.editing.downloadUrl = '';
    state.editing.downloadName = '';
    state.editing.downloadSize = 0;
    markDirty();
    render();
  } else if (action === 'remove-shot' && state.editing) {
    state.editing.screenshots.splice(Number(target.dataset.index), 1);
    markDirty();
    render();
  } else if (action === 'add-shot' && state.editing) {
    const input = document.getElementById('shot-url');
    const url = input?.value?.trim();
    if (url) {
      state.editing.screenshots.push(url);
      markDirty();
      render();
    }
  } else if (action === 'add-stat' && state.site) {
    state.site.hero.stats.push({ value: '', label: { el: '', en: '' } });
    markDirty();
    render();
  } else if (action === 'remove-stat' && state.site) {
    state.site.hero.stats.splice(Number(target.dataset.index), 1);
    markDirty();
    render();
  } else if (action === 'goto-content') {
    state.tab = 'content';
    render();
  }
});

contentEl.addEventListener('input', (event) => {
  const el = event.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;

  if (el.dataset.search !== undefined) {
    state.search = el.value;
    applyProjectFilter();
    return;
  }

  if (el.dataset.site && state.site) {
    let value = el.value;
    if (el.dataset.siteType === 'lines') {
      value = value.split('\n').map((part) => part.trim()).filter(Boolean);
    }
    setPath(state.site, el.dataset.site, value);
    markDirty();
    return;
  }

  if (el.dataset.bind && state.business) {
    setPath(state.business, el.dataset.bind, el.value);
    markDirty();
    return;
  }

  if (el.dataset.path && state.editing) {
    let value = el.value;
    if (el.dataset.type === 'list') {
      value = value.split(',').map((part) => part.trim()).filter(Boolean);
    } else if (el.dataset.type === 'lines') {
      value = value.split('\n').map((part) => part.trim()).filter(Boolean);
    }
    setPath(state.editing, el.dataset.path, value);

    if (el.dataset.path === 'name' && !state.editing.slug) {
      state.editing.slug = slugify(el.value);
      const slugInput = contentEl.querySelector('[data-path="slug"]');
      if (slugInput instanceof HTMLInputElement) slugInput.value = state.editing.slug;
    }
    markDirty();
  }
});

contentEl.addEventListener('change', (event) => {
  const el = event.target;

  if (el instanceof HTMLInputElement && el.type === 'file' && el.dataset.action === 'upload') {
    uploadImages(el.files);
    el.value = '';
    return;
  }

  if (el instanceof HTMLInputElement && el.type === 'file' && el.dataset.action === 'upload-file') {
    uploadDownload(el.files?.[0]);
    el.value = '';
    return;
  }

  if (el instanceof HTMLInputElement && el.type === 'file' && el.dataset.action === 'upload-brand') {
    uploadBrand(el.files?.[0], el.dataset.target);
    el.value = '';
    return;
  }

  if (!state.editing) return;

  if (el instanceof HTMLInputElement && el.type === 'checkbox' && el.dataset.path) {
    setPath(state.editing, el.dataset.path, el.checked);
    markDirty();
  } else if (el instanceof HTMLSelectElement && el.dataset.path) {
    setPath(state.editing, el.dataset.path, el.value);
    if (el.dataset.path === 'category') {
      markDirty();
      state.editorTab = 'basics';
      render();
    } else {
      markDirty();
    }
  }
});

saveBtn.addEventListener('click', saveAll);

window.addEventListener('beforeunload', (event) => {
  if (!state.dirty) return;
  event.preventDefault();
  event.returnValue = '';
});

/* -------------------------------------------------------------------- load */

async function load() {
  try {
    const [businessRes, projectsRes, siteRes, storageRes] = await Promise.all([
      fetch('/api/admin/content'),
      fetch('/api/admin/projects'),
      fetch('/api/admin/site'),
      fetch('/api/admin/storage'),
    ]);
    if (
      businessRes.status === 401 ||
      projectsRes.status === 401 ||
      siteRes.status === 401 ||
      storageRes.status === 401
    ) {
      window.location.href = '/admin/login';
      return;
    }
    state.business = await businessRes.json();
    state.projects = await projectsRes.json();
    state.site = await siteRes.json();
    if (storageRes.ok) setStorage(await storageRes.json());
    setStatus('');
    render();
  } catch {
    contentEl.innerHTML = '<div class="loading">Σφάλμα φόρτωσης. Ανανέωσε τη σελίδα.</div>';
  }
}

load();
