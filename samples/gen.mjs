// Generates the downloadable messy sample files (matches src/demoData.ts).
import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const wb = XLSX.utils.book_new();
const sheets = [
  ['Sewing_PO', ['লট নং', 'Item Description', 'Fiber Comp (%)', 'Recycled %', 'Delivery Date'], [
    ['PO-1001', 'Mens Polo Shirt S/S', '60% Cotton 40% Polyester', '20%', '2026-11-15'],
    ['PO-1002', 'Ladies Denim Jacket', '98% Cotton 2% Elastane', '30%', '2026-12-01'],
    ['PO-1003', 'Kids T-Shirt', '100% Cotton (organic)', null, '2026-12-20'],
    ['PO-1001', 'Mens Polo Shirt S/S', '60% Cotton 40% Polyester', '25%', null],
  ]],
  ['Compliance', ['PO No', 'সার্টিফিকেট', 'Unit / Floor', 'রিসাইকেল কনটেন্ট'], [
    ['PO-1001', 'OEKO-TEX Standard 100', 'Unit-2 Sewing Floor', '20%'],
    ['PO-1002', 'GOTS, GRS', 'Unit-5 Denim', '30%'],
    ['PO-1004', 'BSCI Audit 2026', 'Unit-2 Sewing Floor', null],
  ]],
  ['Finishing', ['Order Number', 'Wash Care', 'Substance Check', 'পুনর্ব্যবহার পথ'], [
    ['PO-1001', 'Machine wash 30C, warm iron', 'AZO Free', 'Textile recycling bin at store'],
    ['PO-1002', 'Wash inside out, do not bleach', 'AZO Free', 'Denim take-back program'],
    ['PO-1003', 'Gentle cycle 30C', 'AZO Free', null],
  ]],
];
for (const [name, headers, rows] of sheets) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, ws, name);
}
XLSX.writeFile(wb, 'porichoy-sample-factory-data.xlsx');
writeFileSync('porichoy-sample-sewing-po.csv',
  'লট নং,Item Description,Fiber Comp (%),Recycled %,Delivery Date\n' +
  'PO-1001,Mens Polo Shirt S/S,"60% Cotton 40% Polyester",20%,2026-11-15\n' +
  'PO-1002,Ladies Denim Jacket,"98% Cotton 2% Elastane",30%,2026-12-01\n' +
  'PO-1003,Kids T-Shirt,100% Cotton (organic),,2026-12-20\n' +
  'PO-1001,Mens Polo Shirt S/S,"60% Cotton 40% Polyester",25%,\n');
console.log('sample files written');
