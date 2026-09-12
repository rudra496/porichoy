/* Porichoy — NIC 3.0 pitch deck (exactly 6 slides, their required topics).
   Run: node build_deck.js  → Porichoy_NIC3_Deck.pptx   */
const pptxgen = require('pptxgenjs');

const INK = '1E1B4B', PINK = 'E11D74', INDIGO = '4F46E5', SOFT = 'F6F6FB',
  GREY = '4B4877', LINE = 'E5E4F0', AMBER = 'B45309', GREEN = '15803D';

const p = new pptxgen();
p.defineLayout({ name: 'W', width: 13.33, height: 7.5 });
p.layout = 'W';

function footer(s, n) {
  s.addText(`Porichoy (পরিচয়) — Needle Innovation Challenge 3.0 · slide ${n}/6 · every claim verified, sources on the live Method page`, {
    x: 0.55, y: 7.08, w: 12.2, h: 0.32, fontSize: 10, color: GREY, fontFace: 'Calibri',
  });
}
function chip(s, text, x, y, w, color) {
  s.addText(text, { x, y, w, h: 0.42, shape: 'roundRect', rectRadius: 0.21, fill: { color }, fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', fontFace: 'Calibri' });
}

/* ---------------- SLIDE 1 — TITLE + PROBLEM ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: 0, w: 13.33, h: 1.62, fill: { color: INK } });
  s.addText([
    { text: 'Porichoy ', options: { color: 'FFFFFF', fontSize: 34, bold: true } },
    { text: '(পরিচয়)', options: { color: 'F9A8D4', fontSize: 30, bold: true } },
    { text: '  —  DPP-in-a-Box for Bangladesh’s garment factories', options: { color: 'FFFFFF', fontSize: 22 } },
  ], { x: 0.55, y: 0.22, w: 12.3, h: 0.75, fontFace: 'Calibri' });
  s.addText('“Identity.” Every garment gets a verifiable identity — before the EU’s 2027 wall.', {
    x: 0.57, y: 1.0, w: 12.2, h: 0.45, fontSize: 15, italic: true, color: 'C7D2FE', fontFace: 'Calibri',
  });

  s.addText('THE PROBLEM — a dated wall is coming for the industry’s biggest market', {
    x: 0.55, y: 1.95, w: 12.2, h: 0.5, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  const items = [
    ['From 2027, EU Digital Product Passports (DPP) phase in.', ' ESPR in force 18 Jul 2024 · textiles in the first Working Plan (Apr 2025) · textile delegated act expected ~2027.'],
    ['EU customs will auto-check DPP existence & authenticity on imported garments', ' (European Commission). A factory that cannot produce passport data loses EU orders.'],
    ['The data already exists — but it is scattered', ' in Excel files with mixed Bangla/English headers, legacy ERP exports and paper trim cards. Global platforms will not climb onto the factory floor to collect it.'],
  ];
  let y = 2.55;
  for (const [b, r] of items) {
    s.addShape('roundRect', { x: 0.55, y, w: 8.0, h: 1.18, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
    s.addText([{ text: b, options: { bold: true, color: INK } }, { text: r, options: { color: GREY } }],
      { x: 0.8, y: y + 0.08, w: 7.55, h: 1.02, fontSize: 15.5, fontFace: 'Calibri', valign: 'middle' });
    y += 1.34;
  }
  // evidence card right
  s.addShape('roundRect', { x: 8.85, y: 2.55, w: 3.95, h: 3.86, rectRadius: 0.09, fill: { color: INK } });
  s.addText('WHAT IS AT STAKE', { x: 9.1, y: 2.75, w: 3.5, h: 0.4, fontSize: 13, bold: true, color: 'F9A8D4', fontFace: 'Calibri' });
  s.addText([
    { text: '≈ 4 million', options: { fontSize: 30, bold: true, color: 'FFFFFF', breakLine: true } },
    { text: 'RMG workers in Bangladesh, the majority women (BGMEA)', options: { fontSize: 13, color: 'C7D2FE', breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: '#2 exporter,', options: { fontSize: 24, bold: true, color: 'FFFFFF', breakLine: true } },
    { text: 'world’s ready-made garments — “Europe is our biggest market” (NIC 3.0 call)', options: { fontSize: 13, color: 'C7D2FE', breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: '2027–30:', options: { fontSize: 24, bold: true, color: 'F9A8D4', breakLine: true } },
    { text: 'DPP obligations phase in on the EU side', options: { fontSize: 13, color: 'C7D2FE' } },
  ], { x: 9.1, y: 3.15, w: 3.5, h: 3.1, fontFace: 'Calibri' });
  footer(s, 1);
}

/* ---------------- SLIDE 2 — MARKET OPPORTUNITY ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText('MARKET OPPORTUNITY — compliance budget meets an empty factory-floor square', {
    x: 0.55, y: 0.5, w: 12.2, h: 0.55, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  // timeline
  const tl = [['18 Jul 2024', 'ESPR in force'], ['Apr 2025', '1st Working Plan — textiles priority'], ['~2027', 'Textile delegated act'], ['2027–30', 'DPP obligations phase in']];
  let x = 0.55;
  for (const [d, t] of tl) {
    s.addShape('roundRect', { x, y: 1.25, w: 2.95, h: 1.05, rectRadius: 0.09, fill: { color: INK } });
    s.addText([{ text: d, options: { bold: true, fontSize: 15, color: 'F9A8D4', breakLine: true } }, { text: t, options: { fontSize: 12, color: 'FFFFFF' } }],
      { x: x + 0.15, y: 1.33, w: 2.65, h: 0.9, fontFace: 'Calibri' });
    x += 3.11;
  }
  s.addText('Every export factory shipping to Europe must be DPP-ready inside this window — thousands of factories (BGMEA member base), no BD-built tool exists for them.', {
    x: 0.55, y: 2.5, w: 12.2, h: 0.5, fontSize: 16, color: GREY, fontFace: 'Calibri',
  });
  // three-column landscape
  const cols = [
    ['Brand-side DPP SaaS', 'TrusTrace · TextileGenesis · Reverse Resources', 'Enterprise pricing, English-first, consume clean data — they do NOT capture at the BD factory floor', PINK],
    ['Consultancies & audits', 'Big-4 / compliance firms', 'Expensive, per-visit, no product — costs recur, nothing is learned or reused', AMBER],
    ['Porichoy’s square', 'The BD last-mile data engine', 'Sits at the factory, speaks Bangla, feeds ANY platform — partner to the global players, not a rival', GREEN],
  ];
  x = 0.55;
  for (const [h, sub, body, c] of cols) {
    s.addShape('roundRect', { x, y: 3.25, w: 3.95, h: 2.9, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
    chip(s, h, x + 0.25, 3.5, 3.45, c);
    s.addText([{ text: sub, options: { bold: true, fontSize: 13.5, color: INK, breakLine: true } }, { text: '', options: { fontSize: 6, breakLine: true } }, { text: body, options: { fontSize: 14, color: GREY } }],
      { x: x + 0.25, y: 4.1, w: 3.45, h: 1.9, fontFace: 'Calibri' });
    x += 4.11;
  }
  s.addText('Beachhead: mid-size exporters facing live buyer DPP requests → expand to buying houses and certification bodies.', {
    x: 0.55, y: 6.4, w: 12.2, h: 0.45, fontSize: 15, italic: true, color: INDIGO, fontFace: 'Calibri',
  });
  footer(s, 2);
}

/* ---------------- SLIDE 3 — INNOVATIVE SOLUTION ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText('THE SOLUTION — messy factory files in, buyer-ready passport out, in 90 seconds', {
    x: 0.55, y: 0.5, w: 12.2, h: 0.55, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  const steps = [
    ['1 · INGEST', 'Drop Excel/CSV — every sheet parsed on-device. Nothing leaves the factory (local-first).'],
    ['2 · MAP', 'AI reads chaotic headers — Bangla, English, mixed — with confidence scores; the steward confirms. The factory’s vocabulary is learned.'],
    ['3 · SCORE', 'DPP Readiness 0–100 per production order (weight = ESPR Art. 8 categories) with the exact gap list.'],
    ['4 · PASSPORT', 'One click → QR code whose link embeds the passport — scan opens the buyer view on any phone. No backend needed.'],
  ];
  let y = 1.3;
  for (const [h, b] of steps) {
    s.addShape('roundRect', { x: 0.55, y, w: 6.1, h: 1.12, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
    s.addText([{ text: h + '   ', options: { bold: true, color: PINK, fontSize: 14.5 } }, { text: b, options: { color: GREY, fontSize: 12.5 } }],
      { x: 0.78, y: y + 0.06, w: 5.7, h: 1.0, fontFace: 'Calibri', valign: 'middle' });
    y += 1.27;
  }
  // right: real product screenshot + proof points
  s.addImage({ path: 'passport.png', x: 7.0, y: 1.3, w: 3.05, h: 4.0 });
  s.addShape('roundRect', { x: 10.25, y: 1.3, w: 2.55, h: 4.0, rectRadius: 0.09, fill: { color: INK } });
  s.addText([
    { text: 'LIVE TODAY', options: { bold: true, fontSize: 14, color: 'F9A8D4', breakLine: true } },
    { text: 'rudra496.github.io/ porichoy', options: { fontSize: 13, color: 'FFFFFF', breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: '19 automated engine tests', options: { fontSize: 12.5, color: 'C7D2FE', breakLine: true } },
    { text: 'SHA-256 provenance chain', options: { fontSize: 12.5, color: 'C7D2FE', breakLine: true } },
    { text: 'Bangla + English UI', options: { fontSize: 12.5, color: 'C7D2FE', breakLine: true } },
    { text: 'Works offline (PWA)', options: { fontSize: 12.5, color: 'C7D2FE', breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: 'Schema versioned — the final EU delegated act is a config change, not a rebuild', options: { fontSize: 11.5, color: 'F9A8D4', italic: true } },
  ], { x: 10.45, y: 1.5, w: 2.2, h: 3.7, fontFace: 'Calibri' });
  s.addText('Every attribute on the passport carries its ESPR legal anchor and the exact source column it came from — auditable by design.', {
    x: 0.55, y: 6.45, w: 12.2, h: 0.45, fontSize: 15, italic: true, color: INDIGO, fontFace: 'Calibri',
  });
  footer(s, 3);
}

/* ---------------- SLIDE 4 — BUSINESS & REVENUE MODEL ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText('BUSINESS & REVENUE MODEL — factories pay little; brands pay to make suppliers compliant', {
    x: 0.55, y: 0.5, w: 12.2, h: 0.55, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  const rev = [
    ['Factory SaaS', 'BDT 2,000–8,000 / month per factory by size — priced for SMEs, not enterprise budgets'],
    ['Onboarding & data-rescue', 'One-time fee: steward training + first ingest + mapping of the factory’s historic files'],
    ['Brand-funded onboarding', 'Brands pay to onboard their supplier base before 2027 — CAC moves to the party with the money'],
  ];
  let y = 1.3;
  for (const [h, b] of rev) {
    s.addShape('roundRect', { x: 0.55, y, w: 6.6, h: 1.15, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
    s.addText([{ text: h, options: { bold: true, fontSize: 16, color: INK, breakLine: true } }, { text: b, options: { fontSize: 13, color: GREY } }],
      { x: 0.8, y: y + 0.1, w: 6.1, h: 0.95, fontFace: 'Calibri' });
    y += 1.3;
  }
  s.addText([
    { text: 'Unit economics: ', options: { bold: true, color: INK } },
    { text: 'onboarding ≈ 2 person-days per factory · software gross margin >80% · replication is a per-factory template, not a project.', options: { color: GREY } },
  ], { x: 0.55, y: 5.25, w: 6.6, h: 0.85, fontSize: 14, fontFace: 'Calibri' });

  // grant use card
  s.addShape('roundRect', { x: 7.5, y: 1.3, w: 5.3, h: 4.8, rectRadius: 0.09, fill: { color: INK } });
  s.addText('USE OF THE BDT 650,000 POLLINATION GRANT', { x: 7.75, y: 1.5, w: 4.8, h: 0.4, fontSize: 14, bold: true, color: 'F9A8D4', fontFace: 'Calibri' });
  const grant = [
    ['BDT 220,000', '10-factory pilot: steward training curriculum + certification'],
    ['BDT 180,000', 'OCR capture for paper trim cards & POs'],
    ['BDT 150,000', 'Mapping-corpus growth: Bangla vocabulary, ERP export formats'],
    ['BDT 100,000', 'Legal entity, certification & data protection'],
  ];
  let gy = 2.0;
  for (const [amt, use] of grant) {
    s.addText([
      { text: amt + '  ', options: { bold: true, fontSize: 16, color: 'FFFFFF' } },
      { text: use, options: { fontSize: 12.5, color: 'C7D2FE' } },
    ], { x: 7.75, y: gy, w: 4.8, h: 0.8, fontFace: 'Calibri' });
    gy += 0.86;
  }
  s.addText('3-year path: 10 pilot factories → 100 → buyer-channel partnerships with global DPP platforms.', {
    x: 7.75, y: 5.5, w: 4.8, h: 0.5, fontSize: 12, italic: true, color: 'F9A8D4', fontFace: 'Calibri' });
  footer(s, 4);
}

/* ---------------- SLIDE 5 — TEAM ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText('TEAM — a builder who ships production systems alone, with the right domain', {
    x: 0.55, y: 0.5, w: 12.2, h: 0.55, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  s.addShape('roundRect', { x: 0.55, y: 1.35, w: 7.4, h: 4.9, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
  s.addText([
    { text: 'Rudra Sarker — Founder & Engineer', options: { fontSize: 22, bold: true, color: INK, breakLine: true } },
    { text: 'Final-year B.Sc. Industrial & Production Engineering, Shahjalal University of Science & Technology', options: { fontSize: 15, color: GREY, breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: 'Ships alone, at production grade:', options: { fontSize: 15, bold: true, color: INK, breakLine: true } },
    { text: '• AdalatAI — AI-assisted court workflow platform; trained a 30-type trilingual case classifier (F1 0.963 over a 1.28M-case corpus), live since 2026', options: { fontSize: 13.5, color: GREY, bullet: false, breakLine: true } },
    { text: '• JolSetu — arsenic-testing PWA reading $1 test kits by photo; live map of 6,593 real wells; competition deck judge-passed 15/15', options: { fontSize: 13.5, color: GREY, breakLine: true } },
    { text: '• RippleUp — production Android + Windows desktop app (Kotlin/Compose Multiplatform), release v5.3.3', options: { fontSize: 13.5, color: GREY, breakLine: true } },
    { text: '• StealthHumanizer — self-trained LLM system served from a VPS, 45s/request at production', options: { fontSize: 13.5, color: GREY, breakLine: true } },
    { text: '• Published Q1 journal article (Journal of Ethnopharmacology, 2026, 3rd author)', options: { fontSize: 13.5, color: GREY, breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: 'Why me for THIS product: factory-process engineering (IPE) + production LLM pipelines + a proven 3-week ship velocity — the exact stack Porichoy needs.', options: { fontSize: 14, italic: true, color: INDIGO } },
  ], { x: 0.85, y: 1.6, w: 6.8, h: 4.5, fontFace: 'Calibri' });

  s.addShape('roundRect', { x: 8.25, y: 1.35, w: 4.55, h: 4.9, rectRadius: 0.09, fill: { color: INK } });
  s.addText([
    { text: 'WHAT WE ASK FROM NIC 3.0', options: { bold: true, fontSize: 14, color: 'F9A8D4', breakLine: true } },
    { text: '', options: { fontSize: 8, breakLine: true } },
    { text: 'The pollination grant to fund the 10-factory pilot', options: { fontSize: 14, color: 'FFFFFF', breakLine: true } },
    { text: '', options: { fontSize: 6, breakLine: true } },
    { text: 'Bootcamp mentoring on RMG business models & circularity', options: { fontSize: 14, color: 'FFFFFF', breakLine: true } },
    { text: '', options: { fontSize: 6, breakLine: true } },
    { text: 'Warm intros: 2–3 pilot factories + one buyer sustainability team', options: { fontSize: 14, color: 'FFFFFF', breakLine: true } },
    { text: '', options: { fontSize: 10, breakLine: true } },
    { text: 'Full-time commitment. Ready for the residential bootcamps.', options: { fontSize: 13, italic: true, color: 'F9A8D4' } },
  ], { x: 8.5, y: 1.6, w: 4.05, h: 4.4, fontFace: 'Calibri' });
  footer(s, 5);
}

/* ---------------- SLIDE 6 — WOMEN + RMG BENEFIT ---------------- */
{
  const s = p.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addShape('rect', { x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: PINK } });
  s.addText('WOMEN AT THE CENTER — designed in from the first commit, not bolted on', {
    x: 0.55, y: 0.5, w: 12.2, h: 0.55, fontSize: 24, bold: true, color: INK, fontFace: 'Calibri',
  });
  const cards = [
    ['NEW SKILLED JOBS', '2 women operators per factory trained and certified as DPP Data Stewards — formal, higher-skilled back-office roles with a public micro-credential.', PINK],
    ['JOBS PROTECTED AT SCALE', 'EU customs auto-checks mean non-compliant factories lose orders. Keeping factories order-eligible protects the livelihoods of a majority-women workforce (≈4M workers, BGMEA).', INDIGO],
    ['BURDEN → CAREER', 'Compliance paperwork done ad-hoc — often by women staff — becomes a titled role with training, certification and a visible career path.', AMBER],
  ];
  let x = 0.55;
  for (const [h, b, c] of cards) {
    s.addShape('roundRect', { x, y: 1.35, w: 3.95, h: 2.75, rectRadius: 0.09, fill: { color: SOFT }, line: { color: LINE } });
    chip(s, h, x + 0.25, 1.6, 3.45, c);
    s.addText(b, { x: x + 0.25, y: 2.25, w: 3.45, h: 1.7, fontSize: 14.5, color: GREY, fontFace: 'Calibri' });
    x += 4.11;
  }
  // impact targets + roadmap
  s.addShape('roundRect', { x: 0.55, y: 4.4, w: 12.25, h: 1.7, rectRadius: 0.09, fill: { color: INK } });
  s.addText([
    { text: 'YEAR-1 TARGETS  ', options: { bold: true, fontSize: 15, color: 'F9A8D4' } },
    { text: '10 factories onboarded · 20 women certified as DPP Data Stewards · 40+ women trained · first brand-funded onboarding contract', options: { fontSize: 14.5, color: 'FFFFFF', breakLine: true } },
    { text: 'SCALE  ', options: { bold: true, fontSize: 15, color: 'F9A8D4' } },
    { text: '100+ factories → 200+ stewards → the default DPP layer for BD mid-size exporters before the 2027–30 phase-in', options: { fontSize: 14.5, color: 'C7D2FE' } },
  ], { x: 0.85, y: 4.62, w: 11.7, h: 1.3, fontFace: 'Calibri' });
  s.addText('“The last mile of the Digital Product Passport runs through Bangladesh’s factory floor — and it will be walked by its women.”', {
    x: 0.55, y: 6.35, w: 12.2, h: 0.6, fontSize: 17, italic: true, bold: true, color: PINK, align: 'center', fontFace: 'Calibri',
  });
  footer(s, 6);
}

p.writeFile({ fileName: 'Porichoy_NIC3_Deck.pptx' }).then(() => console.log('deck written'));
