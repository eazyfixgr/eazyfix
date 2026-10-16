export interface Category {
  slug: string;
  icon: string;
  title: { el: string; en: string };
  short: { el: string; en: string };
  description: { el: string; en: string };
  highlights: { el: string[]; en: string[] };
  tech: string[];
  extraLink?: { href: string; label: { el: string; en: string } };
}

export const categories: Category[] = [
  {
    slug: 'repairs',
    icon: 'wrench',
    title: { el: 'Service Ηλεκτρονικών', en: 'Electronics Repair' },
    short: {
      el: 'Επισκευές υπολογιστών, λάπτοπ και κινητών, με επίσκεψη στον χώρο σας.',
      en: 'Computer, laptop and phone repairs, on-site at your place.',
    },
    description: {
      el: 'Αναλαμβάνω επισκευές σε υπολογιστές, λάπτοπ, κινητά και tablets. Έρχομαι σε σπίτι ή επιχείρηση, κάνω δωρεάν διάγνωση και σας δίνω τιμή πριν ξεκινήσω. Ιδανικό για όσους δεν μπορούν να μετακινήσουν τη συσκευή τους ή θέλουν γρήγορη εξυπηρέτηση.',
      en: 'I repair computers, laptops, phones and tablets. I come to your home or business, diagnose for free and give you a price before starting. Ideal if you cannot move your device or need fast service.',
    },
    highlights: {
      el: ['Επίσκεψη σε σπίτι ή επιχείρηση', 'Δωρεάν διάγνωση βλάβης', 'Εγγύηση 30 ημερών', 'Γρήγορη παράδοση 24–48 ωρών'],
      en: ['Home or business visit', 'Free fault diagnosis', '30-day warranty', 'Fast 24–48h turnaround'],
    },
    tech: ['Hardware', 'Windows', 'Δίκτυα', 'Ανάκτηση δεδομένων'],
  },
  {
    slug: 'websites',
    icon: 'code',
    title: { el: 'Κατασκευή Ιστοσελίδων', en: 'Website Development' },
    short: {
      el: 'Σύγχρονες, γρήγορες ιστοσελίδες για επιχειρήσεις — από σελίδα παρουσίασης μέχρι e-shop.',
      en: 'Modern, fast websites for businesses — from presentation pages to online stores.',
    },
    description: {
      el: 'Σχεδιάζω και κατασκευάζω ιστοσελίδες στα μέτρα κάθε επιχείρησης: επαγγελματική εμφάνιση, responsive σε κινητά, γρήγορη φόρτωση και βελτιστοποίηση για Google. Αναλαμβάνω τα πάντα — hosting, domain, email και υποστήριξη μετά την παράδοση.',
      en: 'I design and build websites tailored to each business: professional look, mobile responsive, fast loading and SEO-ready. I handle everything — hosting, domain, email and post-launch support.',
    },
    highlights: {
      el: ['Σχεδιασμός στα μέτρα σας', 'Τέλεια εμφάνιση σε κάθε οθόνη', 'SEO & ταχύτητα', 'e-Shop & online κρατήσεις', 'Hosting, domain & email', 'Υποστήριξη μετά την παράδοση'],
      en: ['Custom design', 'Perfect on every screen', 'SEO & speed', 'e-Shop & online bookings', 'Hosting, domain & email', 'Post-launch support'],
    },
    tech: ['Astro', 'Vue', 'TypeScript', 'Cloudflare', 'Supabase', 'Firebase'],
    extraLink: { href: '/templates', label: { el: 'Δείτε τα έτοιμα πρότυπα ιστοσελίδων', en: 'Browse our website templates' } },
  },
  {
    slug: 'android-apps',
    icon: 'smartphone',
    title: { el: 'Εφαρμογές Android', en: 'Android Apps' },
    short: {
      el: 'Native εφαρμογές Android με Kotlin — από tracking εφαρμογές μέχρι εργαλεία παραγωγικότητας.',
      en: 'Native Android apps in Kotlin — from trackers to productivity tools.',
    },
    description: {
      el: 'Αναπτύσσω native εφαρμογές Android με Kotlin και Jetpack Compose. Καθαρό UI, offline λειτουργία, ειδοποιήσεις και δημοσίευση στο Google Play. Κάποιες από τις εφαρμογές μου είναι διαθέσιμες δημόσια στο Play Store.',
      en: 'I build native Android apps with Kotlin and Jetpack Compose. Clean UI, offline support, notifications and Google Play publishing. Some of my apps are publicly available on the Play Store.',
    },
    highlights: {
      el: ['Native Kotlin & Jetpack Compose', 'Δημοσίευση στο Google Play', 'Offline λειτουργία & συγχρονισμός', 'Material Design UI'],
      en: ['Native Kotlin & Jetpack Compose', 'Google Play publishing', 'Offline mode & sync', 'Material Design UI'],
    },
    tech: ['Kotlin', 'Jetpack Compose', 'Room', 'Firebase'],
  },
  {
    slug: 'android-games',
    icon: 'gamepad',
    title: { el: 'Παιχνίδια Android', en: 'Android Games' },
    short: {
      el: '2D παιχνίδια Android — puzzle, action, roguelike, tower defense και idle.',
      en: '2D Android games — puzzle, action, roguelike, tower defense and idle.',
    },
    description: {
      el: 'Σχεδιάζω και προγραμματίζω ολόκληρα παιχνίδια για Android σε Kotlin, με custom γραφικά και ήχο. Από puzzle και idle μέχρι action και roguelike, με procedurally generated levels. Έχω επίσης φτιάξει web παιχνίδια και μια μηχανή δημιουργίας παιχνιδιών με AI.',
      en: 'I design and code complete Android games in Kotlin, with custom graphics and sound. From puzzle and idle to action and roguelike, with procedurally generated levels. I have also built web games and an AI game-creation engine.',
    },
    highlights: {
      el: ['Ολοκληρωμένα παιχνίδια σε Kotlin', 'Custom γραφικά & ήχος', 'Procedural levels', 'Idle, puzzle, action, roguelike'],
      en: ['Complete games in Kotlin', 'Custom graphics & sound', 'Procedural levels', 'Idle, puzzle, action, roguelike'],
    },
    tech: ['Kotlin', 'Canvas', 'Jetpack Compose', 'Game design'],
  },
  {
    slug: 'web-games',
    icon: 'globe',
    title: { el: 'Παιχνίδια Web', en: 'Web Games' },
    short: {
      el: 'Παιχνίδια που παίζουν απευθείας στον browser — χωρίς εγκατάσταση.',
      en: 'Games that play directly in the browser — no install needed.',
    },
    description: {
      el: 'Παιχνίδια φτιαγμένα για browser (HTML/JS, Three.js, PWA). Παίζουν άμεσα σε κινητό ή υπολογιστή, χωρίς εγκατάσταση — απλώς άνοιξε τον σύνδεσμο και παίξε.',
      en: 'Games built for the browser (HTML/JS, Three.js, PWA). They run instantly on phone or desktop, with no installation — just open the link and play.',
    },
    highlights: {
      el: ['Παίζουν στον browser', 'Χωρίς εγκατάσταση', 'Mobile-friendly', 'Three.js & PWA'],
      en: ['Play in the browser', 'No installation', 'Mobile-friendly', 'Three.js & PWA'],
    },
    tech: ['JavaScript', 'Three.js', 'PWA'],
  },
  {
    slug: 'windows-apps',
    icon: 'monitor',
    title: { el: 'Εφαρμογές Windows & Python', en: 'Windows & Python Apps' },
    short: {
      el: 'Εργαλεία για Windows και Python scripts που λύνουν καθημερινά προβλήματα.',
      en: 'Windows tools and Python scripts that solve everyday problems.',
    },
    description: {
      el: 'Φτιάχνω εφαρμογές και εργαλεία για Windows με Python: backup, επεξεργασία βίντεο και εικόνας, μετατροπή αρχείων, αυτοματοποιήσεις και εργαλεία AI. Επίσης κατασκευάζω μικρά hardware projects με ESP32 και Raspberry Pi Pico.',
      en: 'I build Windows apps and Python tools: backup, video and image processing, file conversion, automation and AI tools. I also build small hardware projects with ESP32 and Raspberry Pi Pico.',
    },
    highlights: {
      el: ['Python εργαλεία & αυτοματισμοί', 'Backup & διαχείριση αρχείων', 'Επεξεργασία βίντεο/εικόνας/PDF', 'AI εργαλεία & τοπικά μοντέλα'],
      en: ['Python tools & automation', 'Backup & file management', 'Video/image/PDF processing', 'AI tools & local models'],
    },
    tech: ['Python', 'Windows', 'AI/LLM', 'ESP32', 'Raspberry Pi'],
  },
];

export function getCategoryMeta(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
