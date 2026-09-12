import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import type { FactoryState } from '../store';
import type { ColumnSuggestion } from '../engine/mapping';
import { DPP_SCHEMA_V01 } from '../engine/schema';
import { suggestMapping, ingestAsync, mergeState } from '../ingest';
import { t } from '../engine/i18n';

interface Parsed {
  fileName: string;
  headers: string[];
  rows: Record<string, unknown>[];
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
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [mapping, setMapping] = useState<ColumnSuggestion[]>([]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const lang = state.lang;

  const handleFile = async (f: File) => {
    setErr('');
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null });
      if (!json.length) throw new Error('no rows found in first sheet');
      const headers = Object.keys(json[0]);
      setParsed({ fileName: f.name, headers, rows: json });
      setMapping(suggestMapping(headers, state.learnedRules));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const setAttr = (header: string, attrKey: string) => {
    setMapping((ms) => ms.map((m) => (m.header === header
      ? { ...m, attrKey: attrKey || null, attrEn: DPP_SCHEMA_V01.find((a) => a.key === attrKey)?.en ?? null, confidence: attrKey ? 1 : 0, method: attrKey ? ('pattern' as const) : ('none' as const) }
      : m)));
  };

  const confirm = async () => {
    if (!parsed) return;
    setBusy(true);
    const res = await ingestAsync(parsed.headers, parsed.rows, parsed.fileName, state, mapping);
    setState((s) => mergeState(s, res));
    setBusy(false);
    nav('/app');
  };

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
            ? 'প্রথম শিট পড়া হবে · বাংলা/ইংরেজি মিশ্র হেডার সমর্থিত · কিছুই সার্ভারে যায় না'
            : 'First sheet is read · Bangla/English/mixed headers supported · nothing leaves this device'}
        </p>
        <input
          ref={fileRef} type="file" accept=".xlsx,.xls,.csv" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
      </div>
      {err && <div className="notice">⚠ {err}</div>}

      {parsed && (
        <>
          <h2 className="section-title">{t('mapping', lang)}</h2>
          <p className="muted">
            {lang === 'bn'
              ? `${parsed.rows.length} সারি পড়া হয়েছে। ম্যাপিং ভুল হলে ঠিক করুন — আপনার শব্দচয়ন পরেরবার নিজেই মনে থাকবে।`
              : `${parsed.rows.length} rows read. Fix any wrong suggestion — your vocabulary is remembered next time.`}
          </p>
          <div className="card" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr><th>{lang === 'bn' ? 'ফাইলের কলাম' : 'Column in file'}</th><th>{lang === 'bn' ? 'ম্যাপ করা হয়েছে' : 'Mapped to'}</th><th>{lang === 'bn' ? 'কনফিডেন্স' : 'Confidence'}</th></tr>
              </thead>
              <tbody>
                {mapping.map((m) => (
                  <tr key={m.header}>
                    <td><b>{m.header}</b></td>
                    <td>
                      <select value={m.attrKey ?? ''} onChange={(e) => setAttr(m.header, e.target.value)}>
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
          <div className="cta-row" style={{ marginTop: 14 }}>
            <button className="btn btn-primary" disabled={busy} onClick={confirm}>{busy ? '…' : t('confirm', lang)}</button>
          </div>
        </>
      )}
    </div>
  );
}
