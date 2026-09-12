import { describe, it, expect } from 'vitest';
import { mapColumns, buildRecords, validateValue, normalizeHeader, parseBanglaNumber, dice } from './mapping';
import { DPP_SCHEMA_V01, TOTAL_WEIGHT } from './schema';
import { readinessScore } from './score';
import { makeLink, verifyChain, GENESIS } from './provenance';
import type { ChainLink } from './provenance';
import { mergeSheet, processSheet, extendChain } from '../ingest';
import type { FactoryState } from '../store';

describe('multi-sheet ingest (per-department files)', () => {
  const EMPTY: FactoryState = {
    lang: 'en', factoryName: 'F', records: [], chain: [], learnedRules: {}, published: {},
  };
  it('merges attributes for the same PO across sheets without losing earlier values', async () => {
    const s1 = processSheet({ name: 'sewing', headers: ['PO No', 'Item Description', 'Recycled %'], rows: [{ 'PO No': 'PO-1', 'Item Description': 'Polo', 'Recycled %': '20%' }] }, {});
    let st = mergeSheet(EMPTY, s1);
    st = { ...st, chain: await extendChain(st, s1) };
    const s2 = processSheet({ name: 'finishing', headers: ['Order Number', 'Wash Care'], rows: [{ 'Order Number': 'PO-1', 'Wash Care': 'Wash 30C' }] }, {});
    st = mergeSheet(st, s2);
    st = { ...st, chain: await extendChain(st, s2) };
    const rec = st.records.find((r) => r.poId === 'PO-1')!;
    expect(rec.attrs['product_name'].value).toBe('Polo');
    expect(rec.attrs['care_info'].value).toBe('Wash 30C');
    expect(rec.filled).toBe(3); // po_id + product_name + care_info
    expect(st.chain.map((l) => l.poId)).toEqual(['PO-1']); // chained once, not twice
  });
  it('does not mutate the previous state object', async () => {
    const s1 = processSheet({ name: 'a', headers: ['PO No', 'Item Description'], rows: [{ 'PO No': 'PO-1', 'Item Description': 'X' }] }, {});
    const st1 = mergeSheet(EMPTY, s1);
    const s2 = processSheet({ name: 'b', headers: ['PO No', 'Wash Care'], rows: [{ 'PO No': 'PO-1', 'Wash Care': 'Y' }] }, {});
    const st2 = mergeSheet(st1, s2);
    expect(st1.records[0].attrs['care_info'].raw).toBe('');
    expect(st2.records[0].attrs['care_info'].value).toBe('Y');
  });
});

describe('header normalization', () => {
  it('strips punctuation/units and transliterates Bangla digits', () => {
    expect(normalizeHeader('Fiber Comp (%)')).toBe('fiber comp');
    expect(normalizeHeader('লট নং ৩')).toBe('লট নং 3');
    expect(normalizeHeader('  P.O.  No. ')).toBe('p o no');
  });
});

describe('mapping engine — the moat', () => {
  it('maps messy English headers', () => {
    const m = mapColumns(['PO No.', 'Item Description', 'Fiber Comp (%)', 'Recycled %', 'Wash Care']);
    const by = Object.fromEntries(m.map((x) => [x.header, x.attrKey]));
    expect(by['PO No.']).toBe('po_id');
    expect(by['Item Description']).toBe('product_name');
    expect(by['Fiber Comp (%)']).toBe('fiber_comp');
    expect(by['Recycled %']).toBe('recycled_pct');
    expect(by['Wash Care']).toBe('care_info');
  });

  it('maps Bangla and mixed headers', () => {
    const m = mapColumns(['লট নং', 'ফাইবার গঠন', 'সার্টিফিকেট', 'ডেলিভারি তারিখ']);
    const by = Object.fromEntries(m.map((x) => [x.header, x.attrKey]));
    expect(by['লট নং']).toBe('po_id');
    expect(by['ফাইবার গঠন']).toBe('fiber_comp');
    expect(by['সার্টিফিকেট']).toBe('certs');
    expect(by['ডেলিভারি তারিখ']).toBe('mfg_dates');
  });

  it('pattern confidence 0.92+; junk header maps to none', () => {
    const m = mapColumns(['PO No.', 'xkcd qwerty']);
    expect(m[0].confidence).toBeGreaterThanOrEqual(0.92);
    expect(m[1].attrKey).toBeNull();
  });

  it('no attribute is claimed twice', () => {
    const m = mapColumns(['PO No.', 'Order No', 'Lot ID']);
    const keys = m.map((x) => x.attrKey).filter(Boolean) as string[];
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.filter((k) => k === 'po_id').length).toBeLessThanOrEqual(1);
  });

  it('concatenated header still maps via pattern robustness', () => {
    const m = mapColumns(['RecycledContents']);
    expect(m[0].attrKey).toBe('recycled_pct');
    expect(m[0].method).toBe('pattern');
  });

  it('dice threshold gates the fuzzy fallback', () => {
    // same-word → 1.0, unrelated → below the 0.72 acceptance gate
    expect(dice('recycled', 'recycled')).toBe(1);
    expect(dice('orderreference', 'chemical')).toBeLessThan(0.72);
  });

  it('dice similarity sane at extremes', () => {
    expect(dice('recycled', 'recycled')).toBe(1);
    expect(dice('abc', 'xyz')).toBeLessThan(0.2);
  });
});

describe('value validation', () => {
  it('parses percent forms incl. Bangla digits and fractions', () => {
    expect(validateValue(DPP_SCHEMA_V01.find((a) => a.key === 'recycled_pct')!, '35%')).toEqual({ ok: true, value: '35' });
    expect(validateValue(DPP_SCHEMA_V01.find((a) => a.key === 'recycled_pct')!, '৩৫').ok).toBe(true);
    const frac = validateValue(DPP_SCHEMA_V01.find((a) => a.key === 'recycled_pct')!, '0.35');
    expect(frac.ok && frac.value === '35').toBe(true);
    expect(validateValue(DPP_SCHEMA_V01.find((a) => a.key === 'recycled_pct')!, '140').ok).toBe(false);
  });
  it('rejects empty values', () => {
    expect(validateValue(DPP_SCHEMA_V01[0], '').ok).toBe(false);
  });
  it('parses Bangla numerals to numbers', () => {
    expect(parseBanglaNumber('৩৫')).toBe(35);
  });
});

describe('record assembly + conflict detection', () => {
  const headers = ['PO No.', 'Recycled %'];
  const mapping = mapColumns(headers);
  it('merges duplicate PO rows and flags conflicts', () => {
    const rows = [
      { 'PO No.': 'PO-1001', 'Recycled %': '20%' },
      { 'PO No.': 'PO-1001', 'Recycled %': '25%' },
    ];
    const r = buildRecords(headers, rows, mapping);
    expect(r.records).toHaveLength(1);
    expect(r.records[0].attrs['recycled_pct'].value).toBe('20');
    expect(r.conflicts).toContainEqual({ poId: 'PO-1001', field: 'recycled_pct', values: ['20%', '25%'] });
  });
  it('unkeyed rows get synthetic ids', () => {
    const r = buildRecords(['Recycled %'], [{ 'Recycled %': '10%' }], mapping);
    expect(r.records[0].poId).toMatch(/^UNKEYED-/);
  });
});

describe('readiness score', () => {
  it('schema weights sum to 100', () => {
    expect(TOTAL_WEIGHT).toBe(100);
  });
  it('scores weight-weighted fill; invalid without po_id', () => {
    const headers = ['PO No.', 'Recycled %', 'Fiber Comp (%)'];
    const rows = [{ 'PO No.': 'PO-1', 'Recycled %': '30%', 'Fiber Comp (%)': '100% cotton' }];
    const rec = buildRecords(headers, rows, mapColumns(headers)).records[0];
    const s = readinessScore(rec);
    expect(s.invalid).toBe(false);
    expect(s.score).toBe(10 + 15 + 15); // po_id + recycled + fiber
  });
  it('unkeyed record scores 0', () => {
    const rec = buildRecords(['Recycled %'], [{ 'Recycled %': '10%' }], mapColumns(['Recycled %'])).records[0];
    expect(readinessScore(rec).score).toBe(0);
    expect(readinessScore(rec).invalid).toBe(true);
  });
});

describe('provenance chain', () => {
  it('extends and verifies; tamper is detected', async () => {
    const links: ChainLink[] = [];
    links.push(await makeLink(links, 'PO-1', '{"po_id":{"value":"PO-1"}}', 'a.csv'));
    links.push(await makeLink(links, 'PO-2', '{"po_id":{"value":"PO-2"}}', 'a.csv'));
    expect(links[0].prevHash).toBe(GENESIS);
    expect((await verifyChain(links)).ok).toBe(true);
    const tampered = JSON.parse(JSON.stringify(links)) as typeof links;
    tampered[1].poId = 'PO-EVIL';
    expect((await verifyChain(tampered)).ok).toBe(false);
  });
});
