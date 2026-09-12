import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import type { FactoryState } from '../store';
import { encodeSnapshot, type PassportSnapshot } from '../store';
import { readinessScore, scoreBand } from '../engine/score';
import { DPP_SCHEMA_V01, SCHEMA_VERSION } from '../engine/schema';
import { validateValue } from '../engine/mapping';
import { makeLink } from '../engine/provenance';
import { t } from '../engine/i18n';

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PoDetail({
  state,
  setState,
}: {
  state: FactoryState;
  setState: React.Dispatch<React.SetStateAction<FactoryState>>;
}) {
  const { id } = useParams();
  const poId = decodeURIComponent(id ?? '');
  const lang = state.lang;
  const rec = state.records.find((r) => r.poId === poId);
  const s = useMemo(() => (rec ? readinessScore(rec) : null), [rec]);
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [edits, setEdits] = useState<Record<string, string>>({});

  const saveEdit = async (key: string) => {
    const raw = edits[key] ?? '';
    if (!raw.trim() || !rec) return;
    const def = DPP_SCHEMA_V01.find((a) => a.key === key)!;
    const v = validateValue(def, raw);
    if (!v.ok) return;
    const attrs = {
      ...rec.attrs,
      [key]: { raw, value: v.value, ok: true, sourceHeader: t('manualEntry', lang) },
    };
    const updated = { ...rec, attrs, filled: Object.values(attrs).filter((a) => a.ok).length };
    const attrsJson = JSON.stringify(
      Object.fromEntries(Object.entries(attrs).filter(([, c]) => c.ok).map(([k, c]) => [k, c.value])),
    );
    const chain = [...state.chain, await makeLink(state.chain, rec.poId ?? '', attrsJson, t('manualEntry', lang))];
    setState((st) => ({
      ...st,
      chain,
      records: st.records.map((r) => (r.poId === rec.poId ? updated : r)),
      // any published QR for this PO is now stale — drop it so the steward re-publishes
      published: Object.fromEntries(Object.entries(st.published).filter(([k]) => k !== rec.poId)),
    }));
    setEdits((e) => ({ ...e, [key]: '' }));
  };

  const downloadPassportJson = () => {
    const snap: PassportSnapshot = {
      poId: rec!.poId ?? '',
      schemaVersion: SCHEMA_VERSION,
      issuedAt: new Date().toISOString(),
      factory: state.factoryName,
      attrs: rec!.attrs,
      chain: state.chain.slice(-2).map((l) => ({ seq: l.seq, hash: l.hash, prevHash: l.prevHash, at: l.at })),
      stewardNote: t('women', lang),
    };
    download(`porichoy-passport-${rec!.poId}.json`, JSON.stringify(snap, null, 2), 'application/json');
  };

  if (!rec || !s) {
    return (
      <div className="card">
        <p className="muted">{lang === 'bn' ? 'অর্ডার পাওয়া যায়নি।' : 'Order not found.'}</p>
        <Link className="btn btn-ghost" to="/app">{t('back', lang)}</Link>
      </div>
    );
  }

  const band = scoreBand(s.score);

  const publish = async () => {
    const snap: PassportSnapshot = {
      poId: rec.poId ?? '',
      schemaVersion: SCHEMA_VERSION,
      issuedAt: new Date().toISOString(),
      factory: state.factoryName,
      attrs: rec.attrs,
      chain: state.chain.slice(-2).map((l) => ({ seq: l.seq, hash: l.hash, prevHash: l.prevHash, at: l.at })),
      stewardNote: t('women', lang),
    };
    const code = encodeSnapshot(snap);
    const url = `${window.location.origin}${window.location.pathname}#/pp?d=${code}`;
    const dataUrl = await QRCode.toDataURL(url, { width: 240, margin: 1, errorCorrectionLevel: 'L' });
    setState((st) => ({ ...st, published: { ...st.published, [poId]: code } }));
    setLink(url);
    setQr(dataUrl);
  };

  const conflicts = state.records && rec.poId ? [] : [];

  return (
    <div>
      <Link to="/app" className="muted">← {t('back', lang)}</Link>
      <h2 className="section-title">
        {rec.poId} — {rec.attrs['product_name']?.value ?? ''}
      </h2>
      <div className="grid2">
        <div className="card scorewrap">
          <svg width="92" height="92" viewBox="0 0 92 92">
            <circle cx="46" cy="46" r="34" fill="none" stroke="#eceafb" strokeWidth="10" />
            <circle cx="46" cy="46" r="34" fill="none" stroke={band.color} strokeWidth="10"
              strokeDasharray={`${(s.score / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`} strokeLinecap="round" transform="rotate(-90 46 46)" />
            <text x="46" y="53" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1e1b4b">{s.score}</text>
          </svg>
          <div>
            <span className="band" style={{ background: band.color }}>{lang === 'bn' ? band.bn : band.label}</span>
            <p className="muted" style={{ marginBottom: 0 }}>
              {lang === 'bn'
                ? `${s.earnedWeight}/${s.totalWeight} ওজন-পয়েন্ট প্রমাণসহ যাচাই হয়েছে।`
                : `${s.earnedWeight}/${s.totalWeight} weight-points evidenced and validated.`}
            </p>
          </div>
        </div>
        <div className="card">
          <b>{lang === 'bn' ? 'ক্রেতার জন্য প্রকাশ করুন' : 'Publish for the buyer'}</b>
          <p className="muted">
            {lang === 'bn'
              ? 'পাসপোর্টের স্ন্যাপশট কিউআরের ভেতরেই থাকে — ক্লাউড ছাড়াই যেকোনো ফোনে খোলে।'
              : 'The passport snapshot rides inside the QR itself — opens on any phone, no cloud needed.'}
          </p>
          <div className="cta-row" style={{ marginTop: 10 }}>
            {!qr ? (
              <button className="btn btn-primary" onClick={publish}>{lang === 'bn' ? 'কিউআর তৈরি করুন' : 'Generate QR & passport'}</button>
            ) : (
              <div className="grid2" style={{ alignItems: 'center' }}>
                <div className="qr-box">
                  <img src={qr} alt="passport QR" width={170} height={170} />
                </div>
                <div>
                  <a className="btn btn-ghost" href={link} target="_blank" rel="noreferrer">Open buyer view ↗</a>
                  <p className="mono" style={{ marginTop: 8 }}>{link.slice(0, 96)}…</p>
                  <button className="btn btn-ghost" onClick={() => { void navigator.clipboard.writeText(link); setCopied(true); }}>
                    {copied ? (lang === 'bn' ? 'কপি হয়েছে ✓' : 'Copied ✓') : (lang === 'bn' ? 'লিংক কপি' : 'Copy link')}
                  </button>
                </div>
              </div>
            )}
            <button className="btn btn-ghost" onClick={downloadPassportJson}>{t('downloadPassport', lang)}</button>
          </div>
        </div>
      </div>

      <h2 className="section-title">{lang === 'bn' ? 'প্রয়োজনীয় তথ্য চেকলিস্ট' : 'Required attribute checklist'}</h2>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr><th>{lang === 'bn' ? 'তথ্য' : 'Attribute'}</th><th>{lang === 'bn' ? 'মান' : 'Value'}</th><th>{lang === 'bn' ? 'উৎস কলাম' : 'Source column'}</th><th>{lang === 'bn' ? 'নিয়ম' : 'Regulatory anchor'}</th><th>{lang === 'bn' ? 'ওজন' : 'Weight'}</th></tr>
          </thead>
          <tbody>
            {DPP_SCHEMA_V01.map((a) => {
              const cell = rec.attrs[a.key];
              const ok = cell?.ok;
              const editing = edits[a.key] !== undefined;
              return (
                <tr key={a.key}>
                  <td><b>{lang === 'bn' ? a.bn : a.en}</b></td>
                  <td>
                    {ok ? <span className="chip chip-hi">{cell?.value}</span>
                      : editing ? (
                        <span className="edit-inline">
                          <input
                            autoFocus
                            value={edits[a.key]}
                            placeholder={lang === 'bn' ? 'মান লিখুন' : 'enter value'}
                            onChange={(e) => setEdits((x) => ({ ...x, [a.key]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(a.key); }}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => void saveEdit(a.key)}>{t('save', lang)}</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEdits((x) => { const n = { ...x }; delete n[a.key]; return n; })}>{t('cancel', lang)}</button>
                        </span>
                      )
                      : (
                        <span className="edit-inline">
                          <span className="chip chip-no">{lang === 'bn' ? 'ঘাটতি' : 'missing'}</span>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEdits((x) => ({ ...x, [a.key]: '' }))}>{t('addValue', lang)}</button>
                        </span>
                      )}
                  </td>
                  <td className="mono">{cell?.sourceHeader || '—'}</td>
                  <td className="muted">{a.reg}</td>
                  <td>{a.weight}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {state.chain.length > 0 && (
        <>
          <h2 className="section-title">{t('provenance', lang)}</h2>
          <div className="card chain-list">
            {state.chain.map((l) => (
              <div key={l.seq} className="mono" style={{ marginBottom: 6 }}>
                #{l.seq} {l.poId} · {l.at.slice(0, 19)} · {l.hash.slice(0, 24)}… (prev {l.prevHash.slice(0, 12)}… · src {l.sourceFile})
              </div>
            ))}
          </div>
        </>
      )}
      {conflicts.length > 0 && <div className="notice">{t('conflicts', lang)}</div>}
    </div>
  );
}
