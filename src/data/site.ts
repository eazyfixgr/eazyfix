export const site = {
  business: {
    name: 'EazyFix',
    tagline: {
      el: 'Λογισμικό, ιστοσελίδες & επισκευές',
      en: 'Software, websites & repairs',
    },
    description: {
      el: 'Επισκευές ηλεκτρονικών, κατασκευή ιστοσελίδων, εφαρμογές Android και παιχνίδια, εργαλεία για Windows. Ό,τι χρειάζεται τεχνολογία, σε έναν άνθρωπο.',
      en: 'Electronics repair, website development, Android apps and games, Windows tools. Everything tech, from one person.',
    },
    phone: '6971234567',
    email: 'info@eazyfix.gr',
    whatsapp: '6971234567',
    address: { el: 'Σαλαμίνα, Αττική', en: 'Salamina, Greece' },
    hours: {
      el: 'Δευτέρα – Παρασκευή: 09:00 – 18:00 · Σάββατο: 10:00 – 14:00',
      en: 'Monday – Friday: 09:00 – 18:00 · Saturday: 10:00 – 14:00',
    },
  },
  hero: {
    badge: { el: 'Full-Stack Developer & Τεχνικός Υπολογιστών', en: 'Full-Stack Developer & IT Technician' },
    title: { el: 'Αξιόπιστες τεχνολογικές λύσεις.', en: 'Reliable technology solutions.' },
    titleAccent: {
      el: 'Από το service υπολογιστών μέχρι custom εφαρμογές.',
      en: 'From computer service to custom apps.',
    },
    subtitle: {
      el: 'Πίσω από το EazyFix προσφέρω εξειδικευμένες υπηρεσίες επισκευής υπολογιστών, ανάπτυξη σύγχρονων ιστοσελίδων, εφαρμογών και παιχνιδιών Android, καθώς και custom εργαλείων για Windows.',
      en: 'Behind EazyFix I provide specialised computer repair services, modern website development, Android apps and games, and custom Windows tools.',
    },
    primaryCta: { el: 'Δείτε έτοιμες σελίδες', en: 'See ready-made sites' },
    secondaryCta: { el: 'Επικοινωνία', en: 'Contact' },
    stats: [
      { value: '5', label: { el: 'τομείς', en: 'fields' } },
      { value: '30+', label: { el: 'projects', en: 'projects' } },
      { value: '3', label: { el: 'πλατφόρμες', en: 'platforms' } },
    ],
  },
  about: {
    title: { el: 'Σχετικά με εμένα', en: 'About me' },
    lead: {
      el: 'Γεώργιος Τσουχνικάς, Software Developer & Τεχνικός Πληροφορικής',
      en: 'Georgios Tsouchnikas, Software Developer & IT Technician',
    },
    text: {
      el: 'Ξεκινώντας από την τεχνική υποστήριξη και επισκευή υπολογιστών, εξέλιξα την πορεία μου στην ανάπτυξη λογισμικού.\n\nΣήμερα σχεδιάζω και υλοποιώ σύγχρονες ιστοσελίδες, native εφαρμογές και mobile games για Android, καθώς και αυτοματισμούς ή εργαλεία σε Windows και Python.\n\nΣτόχος μου είναι να δίνω ουσιαστικές, γρήγορες και αποδοτικές λύσεις σε πραγματικές ανάγκες — παραδίδοντας πάντα έργα υψηλής ποιότητας και λειτουργικότητας.',
      en: 'Starting from IT support and computer repair, I grew into software development.\n\nToday I design and build modern websites, native apps and mobile games for Android, as well as automation and tools for Windows and Python.\n\nMy goal is to deliver practical, fast and efficient solutions for real needs — always with high quality and functionality.',
    },
    skills: [
      'HTML / CSS / JavaScript',
      'TypeScript',
      'Astro',
      'Vue',
      'Kotlin / Android',
      'Python',
      'Cloudflare',
      'Supabase',
      'Firebase',
      'Game development',
      'ESP32 / Hardware',
      'AI tools',
    ],
  },
  contact: {
    title: { el: 'Ας συνεργαστούμε', en: "Let's work together" },
    subtitle: {
      el: 'Χρειάζεστε επισκευή, ιστοσελίδα ή εφαρμογή; Στείλτε μου και θα σας απαντήσω σύντομα.',
      en: 'Need a repair, a website or an app? Send me a message and I will get back to you shortly.',
    },
  },
  social: [
    { label: 'GitHub', url: 'https://github.com/eazyfixgr' },
    { label: 'Chook Games', url: 'https://github.com/chook-games' },
  ],
  branding: {
    favicon: '/favicon.svg',
    ogImage: '/og.png',
  },
};

export type Business = typeof site.business;
export type Hero = typeof site.hero;
export type About = typeof site.about;
export type Contact = typeof site.contact;
export type Branding = typeof site.branding;
export type SiteContentDefaults = {
  hero: Hero;
  about: About;
  contact: Contact;
  branding: Branding;
};
