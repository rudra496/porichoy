import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { FactoryState } from '../store';
import { readinessScore, scoreBand } from '../engine/score';
import { t } from '../engine/i18n';
import { sampleSheets, SAMPLE_FACTORY_NAME } from '../demoData';
import { ingestSheets } from '../ingest';

export default function Dashboard({
  state,
  setState,
}: {
  state: FactoryState;
  setState: React.Dispatch<React.SetStateAction<FactoryState>>;
}) {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const lang = state.lang;

  const scored = useMemo(
    () => state.records.map((r) => ({ rec: r, s: readinessScore(r) })),
    [state.records],
  );
  const avg = scored.length ? Math.round(scored.reduce((a, x) => a + x.s.score, 0) / scored.length) : 0;
  const band = scoreBand(avg);

  const loadSample = async () => {
    setBusy(true);
    const sheets = sampleSheets().map((s) => ({ name: `${s.name} (sample)`, headers: s.headers, rows: s.rows.map((r) => Object.fromEntries(s.headers.map((h, i) => [h, r[i]]))) }));
    const { finalState } = await ingestSheets(sheets, state);
    setState({ ...finalState, factoryName: SAMPLE_FACTORY_NAME });
    setBusy(false);
  };

  return (
    <div>
      <div className="grid2" style={{ alignItems: 'stretch' }}>
        <div className="card scorewrap">
          <ScoreRing score={avg} color={band.color} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{t('readiness', lang)}</div>
            <div className="muted">{t('readinessSub', lang)}</div>
            <span className="band" style={{ background: band.color, marginTop: 8 }}>
              {lang === 'bn' ? band.bn : band.label}
            </span>
            <div className="muted" style={{ marginTop: 6 }}>
              {state.factoryName} · {scored.length} {t('pos', lang).toLowerCase()}
            </div>
          </div>
        </div>
        <div className="card">
          <b>{lang === 'bn' ? 'রেকর্ড আনুন' : 'Bring records in'}</b>
          <p className="muted">
            {lang === 'bn'
              ? 'কারখানার সত্যিকারের এক্সেল আপলোড করুন — অথবা নমুনা ডেটা দিয়ে দেখুন।'
              : 'Upload a real factory Excel — or try the bundled messy sample first.'}
          </p>
          <div className="cta-row">
            <button className="btn btn-primary" disabled={busy} onClick={() => nav('/app/upload')}>
              {busy ? '…' : t('upload', lang)}
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={loadSample}>
              {lang === 'bn' ? 'নমুনা ডেটা লোড করুন' : 'Load sample data'}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>{t('localFirst', lang)}</p>
        </div>
      </div>

      {state.chain.length > 0 && (
        <div className="notice info">
          {lang === 'bn' ? 'প্রোভেন্যান্স চেইন সক্রিয় — ' : 'Provenance chain live — '}
          <span className="mono">{state.chain.length} links · tip {state.chain[state.chain.length - 1].hash.slice(0, 16)}…</span>
        </div>
      )}

      <h2 className="section-title">{t('pos', lang)}</h2>
      {scored.length === 0 ? (
        <div className="card muted">{t('noPos', lang)}</div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>PO</th>
                <th>{lang === 'bn' ? 'পণ্য' : 'Product'}</th>
                <th>{t('readiness', lang)}</th>
                <th>{lang === 'bn' ? 'ঘাটতি' : 'Missing'}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scored.map(({ rec, s }) => {
                const b = scoreBand(s.score);
                const missing = s.perAttr.filter((a) => !a.ok);
                return (
                  <tr key={rec.poId ?? ''}>
                    <td><b>{rec.poId}</b></td>
                    <td>{rec.attrs['product_name']?.value ?? '—'}</td>
                    <td>
                      <span className="band" style={{ background: b.color }}>{s.score}</span>
                    </td>
                    <td className="muted">{missing.length ? missing.map((m) => m.key).join(', ') : '—'}</td>
                    <td><Link to={`/app/po/${encodeURIComponent(rec.poId ?? '')}`}>{lang === 'bn' ? 'খুলুন' : 'Open'}</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 34, c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * c;
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`score ${score}`}>
      <circle cx="46" cy="46" r={r} fill="none" stroke="#eceafb" strokeWidth="10" />
      <circle
        cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round"
        transform="rotate(-90 46 46)"
      />
      <text x="46" y="53" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1e1b4b">{score}</text>
    </svg>
  );
}
