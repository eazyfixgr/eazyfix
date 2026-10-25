export interface Template {
  slug: string;
  number: number;
  name: { el: string; en: string };
  category: { el: string; en: string };
  short: { el: string; en: string };
  style: string;
  built: boolean;
}

export const templates: Template[] = [
  {
    slug: 'dikigoriko',
    number: 1,
    name: { el: 'Δικηγορικό Γραφείο', en: 'Law Office' },
    category: { el: 'Νομικές Υπηρεσίες', en: 'Legal' },
    short: { el: 'Τομείς πρακτικής & επικοινωνία.', en: 'Practice areas & contact.' },
    style: 'formal-editorial',
    built: true,
  },
  {
    slug: 'odontiatreio',
    number: 2,
    name: { el: 'Οδοντιατρείο', en: 'Dental Clinic' },
    category: { el: 'Υγεία', en: 'Health' },
    short: { el: 'Υπηρεσίες & online ραντεβού.', en: 'Services & online booking.' },
    style: 'clean-medical',
    built: true,
  },
  {
    slug: 'kallopismos',
    number: 3,
    name: { el: 'Στούντιο Καλλοπισμού', en: 'Beauty Studio' },
    category: { el: 'Ομορφιά', en: 'Beauty' },
    short: { el: 'Νύχια ή κομμωτήριο, με ραντεβού.', en: 'Nails or hair salon, with booking.' },
    style: 'elegant-beauty',
    built: true,
  },
  {
    slug: 'rouxa',
    number: 4,
    name: { el: 'Κατάστημα Ρούχων', en: 'Clothing Store' },
    category: { el: 'Λιανική', en: 'Retail' },
    short: { el: 'Συλλογές & e-shop ρούχων.', en: 'Collections & clothing e-shop.' },
    style: 'fashion-grid',
    built: true,
  },
  {
    slug: 'keri',
    number: 5,
    name: { el: 'Χειροποίητα Κεριά & Κατασκευές', en: 'Handmade Candles & Crafts' },
    category: { el: 'Χειροποίητα', en: 'Handmade' },
    short: { el: 'Χειροποίητα προϊόντα & παραγγελίες.', en: 'Handmade products & orders.' },
    style: 'warm-artisanal',
    built: true,
  },
  {
    slug: 'enoikiasi-autokiniton',
    number: 6,
    name: { el: 'Ενοικιάσεις Αυτοκινήτων', en: 'Car Rentals' },
    category: { el: 'Αυτοκίνητα', en: 'Automotive' },
    short: { el: 'Στόλος, τιμές & online κρατήσεις.', en: 'Fleet, pricing & online booking.' },
    style: 'bold-booking',
    built: true,
  },
  {
    slug: 'estiatorio',
    number: 7,
    name: { el: 'Εστιατόριο', en: 'Restaurant' },
    category: { el: 'Εστίαση', en: 'Food' },
    short: { el: 'Μενού & online παραγγελίες.', en: 'Menu & online orders.' },
    style: 'appetite-ordering',
    built: true,
  },
];

export function getTemplate(slug: string): Template | undefined {
  return templates.find((template) => template.slug === slug);
}
