/**
 * Porichoy mapping engine v0.1
 * Maps chaotic factory spreadsheet headers (English, Bangla, mixed) onto the
 * canonical DPP schema with confidence scores + human confirmation.
 *
 * Deterministic and offline: two-stage — (1) synonym-pattern match (documented,
 * auditable), (2) bigram-dice fuzzy fallback. Every accepted mapping becomes a
 * reusable rule (store layer) so each factory's vocabulary is learned.
 */
import { DPP_SCHEMA_V01 } from './schema';
import type { AttrDef } from './schema';

export type AttrKey = string;

/** Stage-1 synonym patterns per canonical key. Order = priority. */
export const SYNONYM_PATTERNS: Record<AttrKey, RegExp[]> = {
  po_id: [
    /p[.\s-]?o[.\s-]*(no|number|id)?/, /production\s*order/, /order\s*(no|id|number)/,
    /lot\s*(no|id|number)/, /style\s*(no|id|ref)/, /লট/, /অর্ডার\s*(নং|নম্বর|আইডি)/, /পিও/,
  ],
  gtin: [/gtin/, /sku/, /barcode/, /bar\s*code/, /item\s*code/, /product\s*code/, /আইটেম\s*কোড/, /বার\s*কোড/],
  hs_code: [/hs\s*code/, /hs\s*/, /tariff/, /এইচ\s*এস/],
  product_name: [/product/, /description/, /item\s*name/, /style\s*name/, /article/, /পণ্য/, /বিবরণ/, /আইটেমের\s*নাম/],
  fiber_comp: [
    /fiber|fibre|composition|blend|content\s*%/, /cotton|polyester|viscose|denim/,
    /%?\s*cotton/, /ফাইবার/, /গঠন/, /সুতা/, /মিশ্রণ/,
  ],
  recycled_pct: [/recycl/, /recycled\s*(content|share|%|percent)?/, /grs/, /পুনর্ব্যবহৃত/, /রিসাইকেল/],
  facilities: [
    /facility|factory|supplier|vendor|mill|unit/, /process\s*step|stage/, /spinning|weaving|knitting|dyeing|washing|cutting|sewing/,
    /কারখানা/, /ধাপ/, /কারুশিল্প/,
  ],
  certs: [/certificat|cert\b|oeko|gots|bci|grs|iso/, /সার্টিফিকেট/, /প্রত্যয়ন/],
  mfg_dates: [/date|dt\b|period|delivery|shipment|ex[- ]?factory/, /তারিখ/, /সময়/, /ডেলিভারি/],
  care_info: [/care|wash|laundry|iron/, /ধোয়া/, /ইস্তিরি/, /যত্ন/],
  recycling: [/end[\s-]of[\s-]life|eol|disposal|donation|reuse/, /পুনর্ব্যবহার/, /অপসারণ/],
  substances: [/substance|rsl|chemical|az o|azo|restricted/, /পদার্থ/, /রাসায়নিক/],
};

const BANGLA_DIGITS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

export function normalizeHeader(h: string): string {
  let s = String(h ?? '').trim().toLowerCase();
  // transliterate Bangla digits -> ASCII
  s = s.replace(/[০-৯]/g, (d) => BANGLA_DIGITS[d] ?? d);
  // strip punctuation, units, brackets: "fiber comp (%)" -> "fiber comp"
  s = s.replace(/[()[\]{}]/g, ' ').replace(/[.\-_/\\,:;|]+/g, ' ');
  s = s.replace(/\s*(pct|percent|%)\s*$/, ' ');
  return s.replace(/\s+/g, ' ').trim();
}

/** bigram dice coefficient — fuzzy fallback similarity */
export function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const grams = (s: string) => {
    const set = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      set.set(g, (set.get(g) ?? 0) + 1);
    }
    return set;
  };
  const ga = grams(a), gb = grams(b);
  let hits = 0;
  for (const [g, n] of ga) hits += Math.min(n, gb.get(g) ?? 0);
  const totalA = [...ga.values()].reduce((s, n) => s + n, 0);
  const totalB = [...gb.values()].reduce((s, n) => s + n, 0);
  return totalA + totalB === 0 ? 0 : (2 * hits) / (totalA + totalB);
}

export interface ColumnSuggestion {
  header: string;
  attrKey: string | null;
  attrEn: string | null;
  confidence: number; // 0..1
  method: 'pattern' | 'fuzzy' | 'none';
}

/** Keyword seed per attr for fuzzy fallback (first token of en label + aliases) */
const FUZZY_SEEDS: Record<AttrKey, string[]> = {
  po_id: ['order', 'lot', 'po'],
  gtin: ['code', 'sku', 'gtin'],
  hs_code: ['hs', 'tariff'],
  product_name: ['product', 'description', 'item'],
  fiber_comp: ['fiber', 'composition', 'blend'],
  recycled_pct: ['recycled', 'grs'],
  facilities: ['factory', 'facility', 'supplier'],
  certs: ['certificate', 'oeko', 'gots'],
  mfg_dates: ['date', 'delivery'],
  care_info: ['care', 'wash'],
  recycling: ['reuse', 'disposal'],
  substances: ['substance', 'chemical'],
};

export function mapColumns(headers: string[]): ColumnSuggestion[] {
  const out: ColumnSuggestion[] = [];
  const taken = new Set<AttrKey>();
  for (const raw of headers) {
    const norm = normalizeHeader(raw);
    let best: ColumnSuggestion | null = null;
    // stage 1: synonym patterns (regex test on normalized header)
    for (const attr of DPP_SCHEMA_V01) {
      if (taken.has(attr.key)) continue;
      const pats = SYNONYM_PATTERNS[attr.key] ?? [];
      for (const re of pats) {
        if (re.test(norm)) {
          if (!best) best = { header: raw, attrKey: attr.key, attrEn: attr.en, confidence: 0.92, method: 'pattern' };
          break;
        }
      }
    }
    // stage 2: fuzzy vs seeds
    if (!best) {
      for (const attr of DPP_SCHEMA_V01) {
        if (taken.has(attr.key)) continue;
        for (const seed of FUZZY_SEEDS[attr.key] ?? []) {
          const sim = dice(norm, seed);
          if (sim >= 0.72 && (!best || sim > best.confidence)) {
            best = { header: raw, attrKey: attr.key, attrEn: attr.en, confidence: Math.round(sim * 100) / 100, method: 'fuzzy' };
          }
        }
      }
    }
    if (best && best.attrKey) {
      taken.add(best.attrKey);
      out.push(best);
    } else {
      out.push({ header: raw, attrKey: null, attrEn: null, confidence: 0, method: 'none' });
    }
  }
  return out;
}

/* ---------------- value parsing & validation ---------------- */

export function parseBanglaNumber(s: string): number | null {
  const norm = String(s ?? '').replace(/[০-৯]/g, (d) => BANGLA_DIGITS[d] ?? d);
  const m = norm.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

export function validateValue(def: AttrDef, raw: string): { ok: boolean; value: string | null; note?: string } {
  const s = String(raw ?? '').trim();
  if (!s) return { ok: false, value: null, note: 'empty' };
  switch (def.valueType) {
    case 'percent': {
      const n = parseBanglaNumber(s);
      if (n === null) return { ok: false, value: null, note: 'not a number' };
      const pct = /%|পার্সেন্ট/.test(s) || n <= 1 ? (n <= 1 && !/%/.test(s) ? n * 100 : n) : n;
      if (pct < 0 || pct > 100) return { ok: false, value: null, note: 'out of 0-100' };
      return { ok: true, value: String(Math.round(pct * 10) / 10) };
    }
    case 'date': {
      const d = new Date(s);
      if (isNaN(d.getTime())) return { ok: false, value: null, note: 'unparseable date' };
      return { ok: true, value: d.toISOString().slice(0, 10) };
    }
    default:
      return { ok: true, value: s };
  }
}

/* ---------------- record assembly ---------------- */

export interface DppRecord {
  poId: string | null;
  attrs: Record<AttrKey, { raw: string; value: string | null; ok: boolean; note?: string; sourceHeader: string }>;
  filled: number;
}

export interface BuildResult {
  records: DppRecord[];
  conflicts: { poId: string; field: string; values: string[] }[];
  rowsIn: number;
}

/** Assemble canonical records from worksheet rows given an accepted mapping. */
export function buildRecords(
  headers: string[],
  rows: Record<string, unknown>[],
  mapping: ColumnSuggestion[],
): BuildResult {
  const headerToAttr = new Map<string, string>();
  for (const m of mapping) if (m.attrKey) headerToAttr.set(m.header, m.attrKey);

  const byId = new Map<string, DppRecord>();
  const conflicts: BuildResult['conflicts'] = [];
  let rowsIn = 0;

  for (const row of rows) {
    rowsIn++;
    // pass 1: collect validated cells for this row
    type Cell = { raw: string; value: string | null; ok: boolean; note?: string; sourceHeader: string };
    const cells = new Map<string, Cell>();
    let rowId: string | null = null;
    for (const [header, attrKey] of headerToAttr) {
      const def = DPP_SCHEMA_V01.find((a) => a.key === attrKey)!;
      const raw = row[header];
      const rawStr = raw === undefined || raw === null ? '' : String(raw).trim();
      if (!rawStr) continue;
      const v = validateValue(def, rawStr);
      const cell: Cell = { raw: rawStr, value: v.value, ok: v.ok, note: v.note, sourceHeader: header };
      cells.set(attrKey, cell);
      if (attrKey === 'po_id' && (v.value ?? rawStr)) rowId = v.value ?? rawStr;
    }
    // pass 2: create a new record or merge into the existing one
    if (rowId && byId.has(rowId)) {
      const prev = byId.get(rowId)!;
      for (const [attrKey, c] of cells) {
        if (!prev.attrs[attrKey].raw) prev.attrs[attrKey] = c;
        else if (prev.attrs[attrKey].raw !== c.raw) {
          conflicts.push({ poId: rowId, field: attrKey, values: [prev.attrs[attrKey].raw, c.raw] });
        }
      }
      prev.filled = Object.values(prev.attrs).filter((a) => a.ok).length;
      continue;
    }
    const rec: DppRecord = {
      poId: rowId,
      attrs: Object.fromEntries(DPP_SCHEMA_V01.map((a) => [a.key, { raw: '', value: null, ok: false, sourceHeader: '' }])),
      filled: 0,
    };
    for (const [attrKey, c] of cells) rec.attrs[attrKey] = c;
    rec.filled = Object.values(rec.attrs).filter((a) => a.ok).length;
    if (!rec.poId) rec.poId = `UNKEYED-${rowsIn}`;
    byId.set(rec.poId, rec);
  }
  const records = [...byId.values()].map((r) => ({
    ...r,
    filled: Object.values(r.attrs).filter((a) => a.ok).length,
  }));
  return { records, conflicts, rowsIn };
}
