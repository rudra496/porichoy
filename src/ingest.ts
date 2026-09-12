/**
 * Ingest pipeline: per-sheet processing -> sequential immutable merge into
 * factory state -> provenance chain extension for every keyed record.
 * Each sheet/file keeps its own header vocabulary (a department's "PO No" and
 * the sewing floor's "লট নং" both land on po_id independently).
 */
import { mapColumns, buildRecords } from './engine/mapping';
import type { DppRecord, ColumnSuggestion } from './engine/mapping';
import { makeLink } from './engine/provenance';
import type { ChainLink } from './engine/provenance';
import type { FactoryState } from './store';
import { normalizeHeader } from './engine/mapping';

/** One department's export: its own headers + rows (a sheet or a CSV file). */
export interface SheetInput {
  name: string;
  headers: string[];
  rows: Record<string, unknown>[];
}

export interface IngestResult {
  suggestions: ColumnSuggestion[];
  records: DppRecord[];
  conflicts: { poId: string; field: string; values: string[] }[];
  rowsIn: number;
  sourceFile: string;
}

/** Learned factory vocabulary overrides fresh suggestions. */
export function suggestMapping(
  headers: string[],
  learnedRules: Record<string, string>,
): ColumnSuggestion[] {
  return mapColumns(headers).map((s) => {
    const learned = learnedRules[normalizeHeader(s.header)] ?? learnedRules[s.header.toLowerCase().trim()];
    if (learned) {
      return { ...s, attrKey: learned, attrEn: learned, confidence: 1, method: 'pattern' as const };
    }
    return s;
  });
}

/** Pure per-sheet processing (no state merge). */
export function processSheet(
  sheet: SheetInput,
  learnedRules: Record<string, string>,
  overrideMapping?: ColumnSuggestion[],
): IngestResult {
  const suggestions = overrideMapping ?? suggestMapping(sheet.headers, learnedRules);
  const { records, conflicts, rowsIn } = buildRecords(sheet.headers, sheet.rows, suggestions);
  return { suggestions, records, conflicts, rowsIn, sourceFile: sheet.name };
}

/** Immutable merge of one sheet's records into the state. */
export function mergeSheet(state: FactoryState, res: IngestResult): FactoryState {
  const byId = new Map(state.records.map((r) => [r.poId ?? '', r]));
  for (const rec of res.records) {
    const prev = byId.get(rec.poId ?? '');
    if (!prev) {
      byId.set(rec.poId ?? '', rec);
    } else {
      const attrs = { ...prev.attrs };
      for (const [k, c] of Object.entries(rec.attrs)) {
        if (c.raw && !attrs[k].raw) attrs[k] = c;
      }
      const merged = { ...prev, attrs, filled: Object.values(attrs).filter((a) => a.ok).length };
      byId.set(merged.poId ?? '', merged);
    }
  }
  const learnedRules = { ...state.learnedRules };
  for (const s of res.suggestions) {
    if (s.attrKey && s.confidence >= 0.92) {
      learnedRules[s.header.toLowerCase().trim()] = s.attrKey;
    }
  }
  return { ...state, records: [...byId.values()], learnedRules };
}

/** Extend the chain for keyed records not yet chained. */
export async function extendChain(state: FactoryState, res: IngestResult): Promise<ChainLink[]> {
  let chain = state.chain;
  for (const rec of res.records) {
    if (rec.poId && !rec.poId.startsWith('UNKEYED-') && !chain.some((l) => l.poId === rec.poId)) {
      const attrsJson = JSON.stringify(
        Object.fromEntries(Object.entries(rec.attrs).filter(([, c]) => c.ok).map(([k, c]) => [k, c.value])),
      );
      chain = [...chain, await makeLink(chain, rec.poId, attrsJson, res.sourceFile)];
    }
  }
  return chain;
}

/** Full pipeline: ingest several sheets sequentially, chaining as we go. */
export async function ingestSheets(
  sheets: SheetInput[],
  state: FactoryState,
  mappings?: ColumnSuggestion[][],
): Promise<{ results: IngestResult[]; finalState: FactoryState }> {
  let cur = state;
  const results: IngestResult[] = [];
  for (let i = 0; i < sheets.length; i++) {
    const s = sheets[i];
    const res = processSheet(s, cur.learnedRules, mappings?.[i]);
    cur = { ...mergeSheet(cur, res), chain: await extendChain(cur, res) };
    results.push(res);
  }
  return { results, finalState: cur };
}
