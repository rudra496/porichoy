/**
 * Local-first store (localStorage). The pilot keeps raw factory data on the
 * factory device — data sovereignty by design. Shared passports travel in the
 * QR link itself (URL-encoded snapshot), so the buyer view works cross-device
 * with no backend. Cloud multi-tenant sync is a post-grant roadmap item.
 */
import type { DppRecord, ColumnSuggestion } from './engine/mapping';
import type { ChainLink } from './engine/provenance';
import type { Lang } from './engine/i18n';

export interface PassportSnapshot {
  poId: string;
  schemaVersion: string;
  issuedAt: string;
  factory: string;
  attrs: DppRecord['attrs'];
  chain: { seq: number; hash: string; prevHash: string; at: string }[];
  stewardNote: string;
}

export interface FactoryState {
  lang: Lang;
  factoryName: string;
  records: DppRecord[];
  chain: ChainLink[];
  learnedRules: Record<string, string>; // normalized header -> attrKey
  published: Record<string, string>; // poId -> URL-safe base64 snapshot
}

const KEY = 'porichoy.v1';

const EMPTY: FactoryState = {
  lang: 'en',
  factoryName: 'Pilot Factory (Sample)',
  records: [],
  chain: [],
  learnedRules: {},
  published: {},
};

export function loadState(): FactoryState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

export function saveState(s: FactoryState): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(): FactoryState {
  localStorage.removeItem(KEY);
  return { ...EMPTY };
}

/* ---------- passport snapshot <-> URL-safe base64 ---------- */

export function encodeSnapshot(s: PassportSnapshot): string {
  const json = JSON.stringify(s);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSnapshot(code: string): PassportSnapshot | null {
  try {
    const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/** Persist accepted mapping rules so the same vocabulary auto-maps next time. */
export function learnRules(existing: Record<string, string>, suggestions: ColumnSuggestion[]): Record<string, string> {
  const out = { ...existing };
  for (const s of suggestions) {
    if (s.attrKey && s.method === 'pattern' && s.confidence >= 0.92) {
      out[s.header.toLowerCase().trim()] = s.attrKey;
    }
  }
  return out;
}
