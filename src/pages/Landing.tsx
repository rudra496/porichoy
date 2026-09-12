import { Link } from 'react-router-dom';
import { t, type Lang } from '../engine/i18n';

export default function Landing({ lang }: { lang: Lang }) {
  return (
    <div>
      <section className="hero">
        <div>
          <span className="chip chip-neutral">Needle Innovation Challenge 3.0 · “Better Process” focus area</span>
          <h1>
            {t('tagline', lang).split(' ').slice(0, -2).join(' ')}{' '}
            <span className="hl">{t('tagline', lang).split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p className="lead">{t('heroSub', lang)}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/app">{t('ctaStart', lang)}</Link>
            <Link className="btn btn-ghost" to="/pp?id=PO-1002">{t('ctaDemo', lang)}</Link>
          </div>
          <p className="muted" style={{ marginTop: 18 }}>{t('localFirst', lang)}</p>
        </div>
        <div className="card">
          <b style={{ fontSize: 15 }}>{lang === 'bn' ? 'কেন এখন?' : 'Why now?'}</b>
          <ul className="muted" style={{ lineHeight: 1.7, paddingLeft: 18, marginTop: 8 }}>
            <li>EU ESPR in force since <b>18 Jul 2024</b>; textiles in the first Working Plan (Apr 2025).</li>
            <li>Textile DPP delegated act expected <b>~2027</b>; EU customs will auto-check passports of imported goods.</li>
            <li>Buyers already ask; factories hold the data — in Excel, ERPs and paper.</li>
          </ul>
          <div className="notice info" style={{ marginBottom: 0 }}>
            {t('women', lang)}
          </div>
        </div>
      </section>

      <h2 className="section-title">{lang === 'bn' ? '৯০ সেকেন্ডে কীভাবে কাজ করে' : 'How it works — 90 seconds'}</h2>
      <div className="flow">
        <div className="step"><span className="num">1</span><b>{lang === 'bn' ? 'আপলোড' : 'Ingest'}</b><span>{lang === 'bn' ? 'কারখানার এক্সেল/সিএসভি আপলোড — বাংলা-ইংরেজি মিশ্রিত হেডারও চলবে' : 'Drop the factory’s Excel/CSV — Bangla, English or mixed headers'}</span></div>
        <div className="step"><span className="num">2</span><b>{lang === 'bn' ? 'ম্যাপিং' : 'Map'}</b><span>{lang === 'bn' ? 'এআই কলাম চেনে, কনফিডেন্স স্কোর দেখায়, স্টুয়ার্ড নিশ্চিত করে' : 'The engine suggests column mappings with confidence; the steward confirms'}</span></div>
        <div className="step"><span className="num">3</span><b>{lang === 'bn' ? 'স্কোর' : 'Score'}</b><span>{lang === 'bn' ? 'প্রতি অর্ডারে ডিপিপি রেডিনেস স্কোর ০–১০০, ঘাটতির তালিকাসহ' : 'A DPP Readiness Score (0–100) per order, with the exact gap list'}</span></div>
        <div className="step"><span className="num">4</span><b>{lang === 'bn' ? 'পাসপোর্ট' : 'Passport'}</b><span>{lang === 'bn' ? 'কিউআর স্ক্যান করলেই ক্রেতার পাসপোর্ট পেজ, হ্যাশ-চেইন প্রমাণসহ' : 'Scan the QR for the buyer-facing passport, backed by a hash chain'}</span></div>
      </div>

      <div className="grid2">
        <div className="card">
          <b>{lang === 'bn' ? 'নারী কর্মীর জন্য কী বদলায়' : 'What changes for women workers'}</b>
          <p className="muted">{t('women', lang)}</p>
          <p className="muted">EU customs auto-checks mean factories without passport data lose orders. Keeping Bangladeshi factories compliant <b>protects the livelihoods of a majority-women workforce</b>.</p>
        </div>
        <div className="card">
          <b>{lang === 'bn' ? 'বিশ্বাসযোগ্য কীভাবে' : 'How it stays trustworthy'}</b>
          <p className="muted">
            {lang === 'bn'
              ? 'প্রতিটি গৃহীত রেকর্ড একটি SHA-256 হ্যাশ-চেইনে যুক্ত হয় — কোনো ব্লকচেইন বাজব্বজ নয়, নিরীক্ষাযোগ্য প্রমাণ। মূল ফাইলের হ্যাশ, সময় ও প্রবেশকারীর নাম সংরক্ষিত থাকে।'
              : 'Every accepted record joins a SHA-256 hash chain — auditable proof, no blockchain hype. Source-file hash, timestamp and entering steward are kept per field.'}
          </p>
          <p className="muted">{lang === 'bn' ? 'স্কিমা ভার্সনড: ইউরোপীয় ডেলিগেটেড অ্যাক্ট চূড়ান্ত হলে কনফিগ বদলায়, প্রোডাক্ট নয়।' : 'The schema is versioned: when the EU delegated act finalises, we change config — not the product.'}</p>
        </div>
      </div>
    </div>
  );
}
