const views = Array.from(document.querySelectorAll('[data-view]'));
const navItems = Array.from(document.querySelectorAll('.nav-item[data-screen]'));
const breadcrumb = document.getElementById('breadcrumbTitle');
const sidebar = document.getElementById('demoSidebar');
const backdrop = document.getElementById('sidebarBackdrop');
const modal = document.getElementById('listingModal');
const modalTitle = document.getElementById('modalTitle');
const mockTitle = document.getElementById('mockTitle');
const toastEl = document.getElementById('demoToast');

const screenTitles = {
  dashboard: 'Πίνακας ελέγχου',
  listings: 'Αγγελίες',
  requests: 'Αιτήματα ενδιαφέροντος',
  assignments: 'Αναθέσεις',
  reports: 'Αναφορές προβλημάτων',
  statistics: 'Στατιστικά',
  services: 'Υπηρεσίες',
  settings: 'Στοιχεία γραφείου',
  categories: 'Κατηγορίες & περιοχές',
  'site-content': 'Κείμενα ιστοσελίδας',
};

const demoListings = {
  'd-1042': { title: 'Φωτεινό διαμέρισμα με θέα', price: '148000', area: '82' },
  'd-1041': { title: 'Μονοκατοικία με αυλή', price: '212000', area: '126' },
  'd-1038': { title: 'Οικόπεδο εντός σχεδίου', price: '74000', area: '510' },
  'd-1035': { title: 'Επιπλωμένο διαμέρισμα', price: '650', area: '64' },
  'd-1031': { title: 'Νεόδμητη κατοικία', price: '179000', area: '98' },
};

let toastTimer;

function showToast(message = 'Demo προεπισκόπηση — οι αλλαγές δεν αποθηκεύονται.') {
  if (!toastEl) return;
  const text = toastEl.querySelector('p');
  if (text) text.textContent = message;
  toastEl.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('visible'), 3300);
}

function closeSidebar() {
  sidebar?.classList.remove('open');
  backdrop?.classList.remove('visible');
}

function openScreen(screen) {
  if (!screenTitles[screen]) return;
  views.forEach((view) => view.classList.toggle('active', view.dataset.view === screen));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.screen === screen));
  if (breadcrumb) breadcrumb.textContent = screenTitles[screen];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openListing(id = '') {
  if (!modal) return;
  const listing = demoListings[id];
  modalTitle.textContent = id ? `Αγγελία δείγματος · #${id.toUpperCase()}` : 'Νέα αγγελία · demo';
  if (mockTitle) mockTitle.value = listing?.title ?? '';
  const inputs = modal.querySelectorAll('.modal-fields input');
  if (inputs[1]) inputs[1].value = listing?.price ?? '';
  if (inputs[2]) inputs[2].value = listing?.area ?? '';
  modal.hidden = false;
  document.body.classList.add('modal-open');
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

function filterListings() {
  const query = (document.getElementById('listingSearch')?.value ?? '').trim().toLowerCase();
  const type = document.getElementById('listingType')?.value ?? 'all';
  const status = document.getElementById('listingStatus')?.value ?? 'all';
  let visible = 0;

  document.querySelectorAll('[data-listing-row]').forEach((row) => {
    const matchesQuery = !query || row.dataset.search.includes(query);
    const matchesType = type === 'all' || row.dataset.type === type;
    const matchesStatus = status === 'all' || row.dataset.status === status;
    const show = matchesQuery && matchesType && matchesStatus;
    row.hidden = !show;
    if (show) visible += 1;
  });

  const count = document.getElementById('listingCount');
  if (count) count.textContent = `${visible} ενδεικτικές αγγελίες`;
}

document.getElementById('demoNav')?.addEventListener('click', (event) => {
  const item = event.target.closest('[data-screen]');
  if (item) openScreen(item.dataset.screen);
});

document.getElementById('mobileMenu')?.addEventListener('click', () => {
  sidebar?.classList.add('open');
  backdrop?.classList.add('visible');
});
document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
backdrop?.addEventListener('click', closeSidebar);

document.addEventListener('click', (event) => {
  const screenLink = event.target.closest('[data-go-screen]');
  if (screenLink) {
    openScreen(screenLink.dataset.goScreen);
    return;
  }

  const listingLink = event.target.closest('[data-open-listing]');
  if (listingLink) {
    openListing(listingLink.dataset.openListing);
    return;
  }

  if (event.target.closest('[data-close-modal]')) {
    closeModal();
    return;
  }

  const action = event.target.closest('[data-demo-action]')?.dataset.demoAction;
  if (!action) return;

  if (action === 'add-listing') openListing();
  else if (action === 'save') showToast('Demo μόνο: η αγγελία δεν αποθηκεύτηκε σε πραγματική βάση.');
  else if (action === 'matches') showToast('Demo: οι αντιστοιχίσεις προβάλλονται με ενδεικτικά στοιχεία.');
  else if (action === 'profile') showToast('Demo προφίλ διαχειριστή. Δεν υπάρχει πραγματικός λογαριασμός.');
  else if (action === 'notifications') showToast('Οι ειδοποιήσεις είναι ενδεικτικές για το demo.');
  else showToast();
});

document.getElementById('listingSearch')?.addEventListener('input', filterListings);
document.getElementById('listingType')?.addEventListener('change', filterListings);
document.getElementById('listingStatus')?.addEventListener('change', filterListings);
document.getElementById('resetFilters')?.addEventListener('click', () => {
  const search = document.getElementById('listingSearch');
  const type = document.getElementById('listingType');
  const status = document.getElementById('listingStatus');
  if (search) search.value = '';
  if (type) type.value = 'all';
  if (status) status.value = 'all';
  filterListings();
});

modal?.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeModal();
    closeSidebar();
  }
});
