/**
 * Ingest pipeline: headers+rows -> suggested mapping (learned rules override)
 * -> records -> merge into state + extend the provenance chain.
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
  newCount: number;
  chain: ChainLink[];
}

export function suggestMapping(
  headers: string[],
  learnedRules: Record<string, string>,
): ColumnSuggestion[] {
  const base = mapColumns(headers);
  // learned factory vocabulary overrides fresh suggestions
  return base.map((s) => {
    const learned = learnedRules[normalizeHeader(s.header)] ?? learnedRules[s.header.toLowerCase().trim()];
    if (learned) {
      return { ...s, attrKey: learned, attrEn: learned, confidence: 1, method: 'pattern' as const };
    }
    return s;
  });
}

export function ingest(
  headers: string[],
  rows: Record<string, unknown>[],
  sourceFile: string,
  state: FactoryState,
  overrideMapping?: ColumnSuggestion[],
): IngestResult {
  const suggestions = overrideMapping ?? suggestMapping(headers, state.learnedRules);
  const { records, conflicts, rowsIn } = buildRecords(headers, rows, suggestions);

  // merge into existing records by poId (existing values win; missing filled in)
  const byId = new Map(state.records.map((r) => [r.poId ?? '', r]));
  let newCount = 0;
  for (const rec of records) {
    const id = rec.poId ?? '';
    const prev = byId.get(id);
    if (!prev) {
      byId.set(id, rec);
      newCount++;
    } else {
      for (const [k, c] of Object.entries(rec.attrs)) {
        if (c.raw && !prev.attrs[k].raw) prev.attrs[k] = c;
      }
      prev.filled = Object.values(prev.attrs).filter((a) => a.ok).length;
    }
  }
  return { suggestions, records, conflicts, rowsIn, newCount, chain: state.chain };
}

/** Async ingest: extends the hash chain for every new, keyed record. */
export async function ingestAsync(
  headers: string[],
  rows: Record<string, unknown>[],
  sourceFile: string,
  state: FactoryState,
  overrideMapping?: ColumnSuggestion[],
): Promise<IngestResult> {
  const base = ingest(headers, rows, sourceFile, state, overrideMapping);
  let chain = state.chain;
  for (const rec of base.records) {
    if (rec.poId && !rec.poId.startsWith('UNKEYED-')) {
      const alreadyChained = chain.some((l) => l.poId === rec.poId);
      if (!alreadyChained) {
        const attrsJson = JSON.stringify(
          Object.fromEntries(Object.entries(rec.attrs).filter(([, c]) => c.ok).map(([k, c]) => [k, c.value])),
        );
        chain = [...chain, await makeLink(chain, rec.poId, attrsJson, sourceFile)];
      }
    }
  }
  return { ...base, chain };
}

/** Ingest several sheets/files sequentially, chaining + merging as we go. */
export async function ingestSheets(
  sheets: SheetInput[],
  state: FactoryState,
  mappings?: ColumnSuggestion[][],
): Promise<{ results: IngestResult[]; finalState: FactoryState }> {
  let cur = state;
  const results: IngestResult[] = [];
  for (let i = 0; i < sheets.length; i++) {
    const s = sheets[i];
    const res = await ingestAsync(s.headers, s.rows, s.name, cur, mappings?.[i]);
    cur = mergeState(cur, res);
    results.push(res);
  }
  return { results, finalState: cur };
}

export function mergeState(state: FactoryState, res: IngestResult): FactoryState {
  const byId = new Map(state.records.map((r) => [r.poId ?? '', r]));
  for (const rec of res.records) byId.set(rec.poId ?? '', rec);
  return {
    ...state,
    records: [...byId.values()],
    chain: res.chain,
    learnedRules: Object.fromEntries(
      Object.entries(state.learnedRules).concat(
        res.suggestions.filter((s) => s.attrKey && s.method === 'pattern' && s.confidence >= 0.92)
          .map((s) => [s.header.toLowerCase().trim(), s.attrKey as string]),
      ),
    ),
  };
}
