/** Tiny EN/BN dictionary — no dependency. Keyed by UI string id. */

export type Lang = 'en' | 'bn';

const STRINGS: Record<string, { en: string; bn: string }> = {
  appName: { en: 'Porichoy', bn: 'পরিচয়' },
  tagline: {
    en: 'Every garment gets a verifiable identity',
    bn: 'প্রতিটি পোশাক পায় যাচাইযোগ্য পরিচয়',
  },
  heroSub: {
    en: 'Turn your factory’s existing Excel, ERP exports and paper records into buyer-ready EU Digital Product Passports — before the 2027 rules bite.',
    bn: 'আপনার কারখানার এক্সেল, ইআরপি ও কাগজের রেকর্ড থেকে তৈরি করুন ক্রেতার জন্য প্রস্তুত ইউরোপীয় ডিজিটাল প্রোডাক্ট পাসপোর্ট — ২০২৭ সালের নিয়মের আগেই।',
  },
  ctaStart: { en: 'Open the dashboard', bn: 'ড্যাশবোর্ড খুলুন' },
  ctaDemo: { en: 'See a sample passport', bn: 'নমুনা পাসপোর্ট দেখুন' },
  upload: { en: 'Upload records', bn: 'রেকর্ড আপলোড করুন' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  readiness: { en: 'DPP Readiness', bn: 'ডিপিপি প্রস্তুতি' },
  readinessSub: { en: 'Weighted share of EU-required fields you can already evidence', bn: 'ইউরোপীয় নিয়মে প্রয়োজনীয় তথ্যের ওজনভিত্তিক অনুপাত' },
  pos: { en: 'Production orders', bn: 'প্রোডাকশন অর্ডার' },
  mapping: { en: 'Column mapping', bn: 'কলাম ম্যাপিং' },
  confirm: { en: 'Confirm & score', bn: 'নিশ্চিত করুন ও স্কোর দেখুন' },
  passport: { en: 'Digital Product Passport', bn: 'ডিজিটাল প্রোডাক্ট পাসপোর্ট' },
  buyerView: { en: 'Buyer view — share this QR', bn: 'ক্রেতার ভিউ — এই কিউআর শেয়ার করুন' },
  provenance: { en: 'Provenance chain', bn: 'প্রোভেন্যান্স চেইন' },
  method: { en: 'Method & sources', bn: 'পদ্ধতি ও সূত্র' },
  women: {
    en: 'Each pilot factory trains 2 women operators as certified DPP Data Stewards — new, higher-skilled roles on the floor.',
    bn: 'প্রতিটি পাইলট কারখানায় ২ জন নারী কর্মীকে প্রশিক্ষণ দেওয়া হয় সার্টিফাইড ডিপিপি ডেটা স্টুয়ার্ড হিসেবে — কারখানায় নতুন, উন্নত দক্ষতার চাকরি।',
  },
  localFirst: {
    en: 'Local-first: in this pilot your raw records never leave the factory device. Only the passport you choose to share is public.',
    bn: 'লোকাল-ফার্স্ট: এই পাইলটে কাঁচা রেকর্ড কারখানার ডিভাইস ছাড়ে না। শুধু আপনার শেয়ার করা পাসপোর্টই প্রকাশ্য।',
  },
  conflicts: { en: 'Conflicting values found', bn: 'অসঙ্গত মান পাওয়া গেছে' },
  noPos: { en: 'No production orders yet — upload your first file.', bn: 'এখনও কোনো অর্ডার নেই — প্রথম ফাইল আপলোড করুন।' },
  back: { en: 'Back', bn: 'ফিরে যান' },
};

export function t(id: string, lang: Lang): string {
  const s = STRINGS[id];
  if (!s) return id;
  return lang === 'bn' ? s.bn : s.en;
}
