import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import type { FactoryState } from '../store';
import type { ColumnSuggestion } from '../engine/mapping';
import { DPP_SCHEMA_V01 } from '../engine/schema';
import { suggestMapping, ingestSheets } from '../ingest';
import { t } from '../engine/i18n';

interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, unknown>[];
  mapping: ColumnSuggestion[];
}

export default function Upload({
  state,
  setState,
}: {
  state: FactoryState;
  setState: React.Dispatch<React.SetStateAction<FactoryState>>;
}) {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState<ParsedSheet[] | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const lang = state.lang;

  const handleFile = async (f: File) => {
    setErr('');
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const parsed: ParsedSheet[] = [];
      for (const name of wb.SheetNames) {
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[name], { defval: null });
        if (!json.length) continue;
        const headers = Object.keys(json[0]);
        parsed.push({ name, headers, rows: json, mapping: suggestMapping(headers, state.learnedRules) });
      }
      if (!parsed.length) throw new Error('no readable rows in any sheet');
      setSheets(parsed);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const setAttr = (si: number, header: string, attrKey: string) => {
    setSheets((ss) => (ss ?? []).map((s, i) => (i !== si ? s : ({
      ...s,
      mapping: s.mapping.map((m) => (m.header === header
        ? { ...m, attrKey: attrKey || null, attrEn: DPP_SCHEMA_V01.find((a) => a.key === attrKey)?.en ?? null, confidence: attrKey ? 1 : 0, method: attrKey ? ('pattern' as const) : ('none' as const) }
        : m)),
    }))));
  };

  const confirm = async () => {
    if (!sheets) return;
    setBusy(true);
    const { finalState } = await ingestSheets(
      sheets.map((s) => ({ name: `${sheets.length > 1 ? s.name : 'uploaded'} · ${s.rows.length} rows`, headers: s.headers, rows: s.rows })),
      state,
      sheets.map((s) => s.mapping),
    );
    setState(finalState);
    setBusy(false);
    nav('/app');
  };

  const totalRows = sheets?.reduce((a, s) => a + s.rows.length, 0) ?? 0;

  return (
    <div>
      <h2 className="section-title">{t('upload', lang)}</h2>
      <div
        className="dropzone"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) void handleFile(f);
        }}
      >
        <b>{lang === 'bn' ? 'এক্সেল বা সিএসভি ফাইল টেনে আনুন' : 'Drop an Excel (.xlsx) or CSV file'}</b>
        <p className="muted">
          {lang === 'bn'
            ? 'সব শিট আলাদাভাবে পড়া হয় · বাংলা/ইংরেজি মিশ্র হেডার সমর্থিত · কিছুই সার্ভারে যায় না'
            : 'Every sheet is read separately · Bangla/English/mixed headers supported · nothing leaves this device'}
        </p>
        <input
          ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
        <p className="muted" style={{ marginTop: 12 }}>
          {t('samples', lang)}{' '}
          <a href="/porichoy/samples/porichoy-sample-factory-data.xlsx" download>Excel (3 sheets)</a>
          {' · '}
          <a href="/porichoy/samples/porichoy-sample-sewing-po.csv" download>CSV</a>
        </p>
      </div>
      {err && <div className="notice">⚠ {err}</div>}

      {sheets && (
        <>
          <h2 className="section-title">{t('mapping', lang)}</h2>
          <p className="muted">
            {lang === 'bn'
              ? `${sheets.length} টি শিটে ${totalRows} সারি পড়া হয়েছে। ভুল সাজেশন ঠিক করুন — আপনার শব্দচয়ন মনে থাকবে।`
              : `${sheets.length} sheet(s), ${totalRows} rows read. Fix any wrong suggestion — your vocabulary is remembered next time.`}
          </p>
          {sheets.map((s, si) => (
            <div key={s.name} style={{ marginBottom: 18 }}>
              <b>{s.name}</b>
              <div className="card" style={{ padding: 0, marginTop: 6 }}>
                <table className="tbl">
                  <thead>
                    <tr><th>{lang === 'bn' ? 'ফাইলের কলাম' : 'Column in file'}</th><th>{lang === 'bn' ? 'ম্যাপ করা হয়েছে' : 'Mapped to'}</th><th>{lang === 'bn' ? 'কনফিডেন্স' : 'Confidence'}</th></tr>
                  </thead>
                  <tbody>
                    {s.mapping.map((m) => (
                      <tr key={m.header}>
                        <td><b>{m.header}</b></td>
                        <td>
                          <select value={m.attrKey ?? ''} onChange={(e) => setAttr(si, m.header, e.target.value)}>
                            <option value="">— {lang === 'bn' ? 'বাদ দিন' : 'ignore'} —</option>
                            {DPP_SCHEMA_V01.map((a) => (
                              <option key={a.key} value={a.key}>{a.en}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {m.attrKey ? (
                            <span className={`chip ${m.confidence >= 0.9 ? 'chip-hi' : m.confidence >= 0.72 ? 'chip-md' : 'chip-no'}`}>
                              {Math.round(m.confidence * 100)}% · {m.method}
                            </span>
                          ) : (
                            <span className="chip chip-neutral">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="cta-row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={busy} onClick={confirm}>{busy ? '…' : t('confirm', lang)}</button>
          </div>
        </>
      )}
    </div>
  );
}
