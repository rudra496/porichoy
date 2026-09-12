/**
 * Porichoy canonical DPP schema v0.1
 *
 * Aligned to: Regulation (EU) 2024/1781 (ESPR) Art. 8 minimum DPP content
 * categories + the CIRPASS-2 textile-pilot attribute families.
 * The textile delegated act is still a draft -> every attribute carries a
 * `reg` anchor and the schema is versioned so regulatory changes are config.
 */

export type AttrKind = 'identifier' | 'material' | 'process' | 'compliance' | 'circularity';

export interface AttrDef {
  key: string;
  en: string;
  bn: string;
  kind: AttrKind;
  /** relative weight in the DPP Readiness Score (sums to 100) */
  weight: number;
  /** regulatory anchor (ESPR article / CIRPASS category) */
  reg: string;
  /** accepted value types for validation */
  valueType: 'string' | 'percent' | 'date' | 'id' | 'list';
}

export const DPP_SCHEMA_V01: AttrDef[] = [
  { key: 'po_id',        en: 'Production order / lot ID',      bn: 'প্রোডাকশন অর্ডার আইডি',   kind: 'identifier',  weight: 10, reg: 'ESPR Art.8(a) unique identifier',            valueType: 'id' },
  { key: 'gtin',         en: 'Product code (GTIN/SKU)',        bn: 'প্রোডাক্ট কোড',            kind: 'identifier',  weight: 5,  reg: 'ESPR Art.8(a) + GS1',                        valueType: 'id' },
  { key: 'hs_code',      en: 'HS tariff code',                 bn: 'এইচএস কোড',               kind: 'identifier',  weight: 5,  reg: 'Customs linkage',                            valueType: 'id' },
  { key: 'product_name', en: 'Product description',            bn: 'পণ্যের বিবরণ',            kind: 'identifier',  weight: 5,  reg: 'ESPR Art.8(b)',                              valueType: 'string' },
  { key: 'fiber_comp',   en: 'Fibre composition (%)',          bn: 'ফাইবার গঠন (%)',          kind: 'material',    weight: 15, reg: 'ESPR Art.8(c) materials',                    valueType: 'string' },
  { key: 'recycled_pct', en: 'Recycled content (%)',           bn: 'রিসাইকেল কনটেন্ট (%)',     kind: 'circularity', weight: 15, reg: 'ESPR Art.8(c) recycled content',             valueType: 'percent' },
  { key: 'facilities',   en: 'Production facilities (steps)',  bn: 'উৎপাদন কারখানা (ধাপ)',    kind: 'process',     weight: 15, reg: 'ESPR Art.8(d) economic operators',           valueType: 'list' },
  { key: 'certs',        en: 'Certificates (OEKO-TEX/GOTS…)',  bn: 'সার্টিফিকেট',              kind: 'compliance',  weight: 10, reg: 'ESPR Art.8(e) compliance documentation',     valueType: 'list' },
  { key: 'mfg_dates',    en: 'Manufacturing period',           bn: 'উৎপাদনের সময়',            kind: 'process',     weight: 5,  reg: 'ESPR Art.8(d)',                              valueType: 'date' },
  { key: 'care_info',    en: 'Care / washing instructions',    bn: 'যত্নের নির্দেশনা',         kind: 'circularity', weight: 5,  reg: 'ESPR Art.8(f) care & end-of-life',           valueType: 'string' },
  { key: 'recycling',    en: 'End-of-life / recycling route',  bn: 'পুনর্ব্যবহার পথ',          kind: 'circularity', weight: 5,  reg: 'ESPR Art.8(f)',                              valueType: 'string' },
  { key: 'substances',   en: 'Substances of concern (RSL)',    bn: 'ক্ষতিকর পদার্থ তথ্য',      kind: 'compliance',  weight: 5,  reg: 'ESPR Art.8(c) substances of concern',        valueType: 'list' },
];

export const SCHEMA_VERSION = '0.1';
export const TOTAL_WEIGHT = DPP_SCHEMA_V01.reduce((s, a) => s + a.weight, 0);
