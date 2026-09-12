/**
 * DPP Readiness Score — 0..100 per record.
 * weight-weighted share of validated attributes vs the schema total.
 * A record without a valid po_id is structurally invalid (score floors at 0
 * regardless of other fields) — mirrors ESPR identifier-first logic.
 */
import { DPP_SCHEMA_V01, TOTAL_WEIGHT } from './schema';
import type { DppRecord } from './mapping';

export interface ScoreBreakdown {
  score: number; // 0..100
  earnedWeight: number;
  totalWeight: number;
  perAttr: { key: string; weight: number; ok: boolean }[];
  invalid: boolean;
}

export function readinessScore(rec: DppRecord): ScoreBreakdown {
  const perAttr = DPP_SCHEMA_V01.map((a) => ({
    key: a.key,
    weight: a.weight,
    ok: !!rec.attrs[a.key]?.ok,
  }));
  const earnedWeight = perAttr.reduce((s, a) => s + (a.ok ? a.weight : 0), 0);
  const idOk = rec.poId !== null && !rec.poId.startsWith('UNKEYED-') && !!rec.attrs['po_id']?.ok;
  return {
    score: idOk ? Math.round((earnedWeight / TOTAL_WEIGHT) * 100) : 0,
    earnedWeight,
    totalWeight: TOTAL_WEIGHT,
    perAttr,
    invalid: !idOk,
  };
}

export function scoreBand(score: number): { label: string; bn: string; color: string } {
  if (score >= 80) return { label: 'Buyer-ready', bn: 'ক্রেতার জন্য প্রস্তুত', color: '#16a34a' };
  if (score >= 50) return { label: 'Compliance gaps', bn: 'কিছু ঘাটতি আছে', color: '#d97706' };
  if (score > 0) return { label: 'Critical gaps', bn: 'বড় ঘাটতি', color: '#dc2626' };
  return { label: 'Unscored', bn: 'অমূল্যায়িত', color: '#6b7280' };
}
