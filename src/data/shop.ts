export interface ShopCategory {
  slug: string;
  name: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  freeOverCents?: number;
  courier?: string;
}

export interface SeedVariant {
  name: string;
  priceCents?: number;
  stock: number;
  sku?: string;
}

export interface SeedProduct {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  featured: boolean;
  variants: SeedVariant[];
}

export const SHOP_BRAND = 'Κερί & Πηλός';

export const shopCategories: ShopCategory[] = [
  { slug: 'keria-soyias', name: 'Κεριά σόγιας' },
  { slug: 'keria-vazo', name: 'Κεριά σε βάζο' },
  { slug: 'kiropigia', name: 'Κηροπήγια & Πηλός' },
  { slug: 'gift-sets', name: 'Gift Sets' },
  { slug: 'diakosmitika', name: 'Διακοσμητικά' },
];

export const shippingMethods: ShippingMethod[] = [
  {
    id: 'pickup',
    name: 'Παραλαβή από το εργαστήρι',
    description: 'Σαλαμίνα, Αττική — χωρίς κόστος',
    priceCents: 0,
  },
  {
    id: 'courier',
    name: 'Courier (ACS / Γενική)',
    description: 'Παράδοση 1–3 εργάσιμες ημέρες',
    priceCents: 450,
    freeOverCents: 4000,
    courier: 'ACS',
  },
  {
    id: 'boxnow',
    name: 'BoxNow — θυρίδα',
    description: 'Παραλαβή 24/7 από κοντινή θυρίδα',
    priceCents: 300,
    freeOverCents: 4000,
    courier: 'BoxNow',
  },
];

export const FREE_SHIPPING_THRESHOLD = 4000;

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return shippingMethods.find((method) => method.id === id);
}

const TONES = ['a', 'b', 'c', 'd', 'e', 'f'];

export function toneFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function categoryName(slug: string): string {
  return shopCategories.find((category) => category.slug === slug)?.name ?? slug;
}

export const seedProducts: SeedProduct[] = [
  {
    slug: 'keri-soyias-levanta',
    name: 'Κερί σόγιας «Λεβάντα»',
    description:
      'Φυσικό κερί σόγιας με αιθέριο έλαιο λεβάντας και βαμβακερό φυτίλι. Χαλαρωτικό άρωμα για ύπνο και ηρεμία.',
    priceCents: 1200,
    category: 'keria-soyias',
    featured: true,
    variants: [
      { name: '180ml · 35 ώρες', priceCents: 1200, stock: 40 },
      { name: '380ml · 70 ώρες', priceCents: 2000, stock: 25 },
    ],
  },
  {
    slug: 'keri-soyias-vanilia-karyda',
    name: 'Κερί σόγιας «Βανίλια & Καρύδα»',
    description: 'Ζεστό, γλυκό άρωμα βανίλιας και καρύδας. Ιδανικό για σαλόνι και χειμωνιάτικα βράδια.',
    priceCents: 1200,
    category: 'keria-soyias',
    featured: true,
    variants: [
      { name: '180ml · 35 ώρες', priceCents: 1200, stock: 38 },
      { name: '380ml · 70 ώρες', priceCents: 2000, stock: 20 },
    ],
  },
  {
    slug: 'keri-vazo-kanela',
    name: 'Κερί σε βάζο «Κανέλα»',
    description: 'Σε επαναχρησιμοποιούμενο γυάλινο βάζο, με άρωμα κανέλας. Μεγάλη διάρκεια καύσης.',
    priceCents: 1600,
    category: 'keria-vazo',
    featured: false,
    variants: [
      { name: '250ml · 50 ώρες', priceCents: 1600, stock: 30 },
      { name: '500ml · 95 ώρες', priceCents: 2600, stock: 15 },
    ],
  },
  {
    slug: 'kiropigio-pilos',
    name: 'Χειροποίητο κηροπήγιο (πηλός)',
    description: 'Κηροπήγιο από πηλό, φτιαγμένο στο χέρι. Κάθε κομμάτι είναι μοναδικό.',
    priceCents: 2200,
    category: 'kiropigia',
    featured: false,
    variants: [{ name: 'Μοναδικό τεμάχιο', stock: 8 }],
  },
  {
    slug: 'gift-set-zestasia',
    name: 'Gift Set «Ζεστασιά»',
    description: 'Δύο κεριά σόγιας και ένα πήλινο κηροπήγιο, σε προσεγμένη συσκευασία δώρου.',
    priceCents: 3400,
    category: 'gift-sets',
    featured: true,
    variants: [
      { name: 'Classic', priceCents: 3400, stock: 18 },
      { name: 'Deluxe (3 κεριά)', priceCents: 4400, stock: 10 },
    ],
  },
  {
    slug: 'piato-pilou',
    name: 'Διακοσμητικό πιάτο πηλού',
    description: 'Χειροποίητο πιάτο πηλού, 20cm, με φυσική υφή. Για τοίχο ή τραπέζι.',
    priceCents: 1800,
    category: 'diakosmitika',
    featured: false,
    variants: [{ name: 'Ø 20cm', stock: 12 }],
  },
];
