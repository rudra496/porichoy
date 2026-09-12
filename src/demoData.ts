/**
 * Bundled demo dataset — a faithful simulation of what real factory exports
 * look like: Bangla/English mixed headers, inconsistent column names, missing
 * cells, duplicated PO rows with conflicting values. Used by the "Load sample
 * data" button and shipped as downloadable .xlsx files under /samples.
 * CLEARLY LABELLED sample data (fictional "Shonali Textiles Ltd.").
 */

export interface SheetSpec {
  name: string;
  headers: string[];
  rows: (string | number | null)[][];
}

export const SAMPLE_SHEETS: SheetSpec[] = [
  {
    name: 'Sewing_PO',
    headers: ['লট নং', 'Item Description', 'Fiber Comp (%)', 'Recycled %', 'Delivery Date'],
    rows: [
      ['PO-1001', 'Mens Polo Shirt S/S', '60% Cotton 40% Polyester', '20%', '2026-11-15'],
      ['PO-1002', 'Ladies Denim Jacket', '98% Cotton 2% Elastane', '30%', '2026-12-01'],
      ['PO-1003', 'Kids T-Shirt', '100% Cotton (organic)', null, '2026-12-20'],
      ['PO-1001', 'Mens Polo Shirt S/S', '60% Cotton 40% Polyester', '25%', null], // duplicate w/ conflict
    ],
  },
  {
    name: 'Compliance',
    headers: ['PO No', 'সার্টিফিকেট', 'Unit / Floor', 'রিসাইকেল কনটেন্ট'],
    rows: [
      ['PO-1001', 'OEKO-TEX Standard 100', 'Unit-2 Sewing Floor', '20%'],
      ['PO-1002', 'GOTS, GRS', 'Unit-5 Denim', '30%'],
      ['PO-1004', 'BSCI Audit 2026', 'Unit-2 Sewing Floor', null],
    ],
  },
  {
    name: 'Finishing',
    headers: ['Order Number', 'Wash Care', 'Substance Check', 'পুনর্ব্যবহার পথ'],
    rows: [
      ['PO-1001', 'Machine wash 30C, warm iron', 'AZO Free', 'Textile recycling bin at store'],
      ['PO-1002', 'Wash inside out, do not bleach', 'AZO Free', 'Denim take-back program'],
      ['PO-1003', 'Gentle cycle 30C', 'AZO Free', null],
    ],
  },
];

export const SAMPLE_FACTORY_NAME = 'Shonali Textiles Ltd. (sample data)';

/** Merge all sheets into rows-in for a single ingest demo. */
export function sampleRows(): { headers: string[]; rows: Record<string, string | number | null>[] } {
  const headers = SAMPLE_SHEETS.flatMap((s) => s.headers);
  const uniqueHeaders = [...new Set(headers)];
  const rows: Record<string, string | number | null>[] = [];
  for (const sheet of SAMPLE_SHEETS) {
    for (const r of sheet.rows) {
      const row: Record<string, string | number | null> = {};
      sheet.headers.forEach((h, i) => (row[h] = r[i]));
      rows.push(row);
    }
  }
  return { headers: uniqueHeaders, rows };
}
