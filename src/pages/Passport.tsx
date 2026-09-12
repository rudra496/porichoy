import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { FactoryState } from '../store';
import { decodeSnapshot, type PassportSnapshot } from '../store';
import { DPP_SCHEMA_V01, SCHEMA_VERSION } from '../engine/schema';
import { readinessScore } from '../engine/score';
import { ingestSheets } from '../ingest';
import { sampleSheets, SAMPLE_FACTORY_NAME } from '../demoData';

/** Build a snapshot from a record in state (used for ?id= links). */
export function snapshotFromState(state: FactoryState, poId: string): PassportSnapshot | null {
  const rec = state.records.find((r) => r.poId === poId);
  if (!rec) return null;
  return {
    poId: rec.poId ?? poId,
    schemaVersion: SCHEMA_VERSION,
    issuedAt: new Date().toISOString(),
    factory: state.factoryName,
    attrs: rec.attrs,
    chain: state.chain.slice(-2).map((l) => ({ seq: l.seq, hash: l.hash, prevHash: l.prevHash, at: l.at })),
    stewardNote: 'Certified women DPP Data Stewards maintain this data at source.',
  };
}

export default function Passport({
  state,
  setState,
}: {
  state: FactoryState;
  setState: React.Dispatch<React.SetStateAction<FactoryState>>;
}) {
  const [params] = useSearchParams();
  const [snap, setSnap] = useState<PassportSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const d = params.get('d');
      if (d) {
        const s = decodeSnapshot(d);
        if (s && alive) { setSnap(s); setLoading(false); return; }
      }
      const id = params.get('id');
      if (id) {
        const s = snapshotFromState(state, id);
        if (s && alive) { setSnap(s); setLoading(false); return; }
        if (!state.records.length) {
          // first-visit demo: build the sample passport in-memory only (never persisted)
          const sheets = sampleSheets().map((s) => ({ name: `${s.name} (sample)`, headers: s.headers, rows: s.rows.map((r) => Object.fromEntries(s.headers.map((h, i) => [h, r[i]]))) }));
          const { finalState } = await ingestSheets(sheets, state);
          if (!alive) return;
          const s2 = snapshotFromState(finalState, id);
          if (alive) { setSnap(s2); setLoading(false); return; }
        }
      }
      if (alive) { setSnap(null); setLoading(false); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const score = useMemo(() => {
    if (!snap) return null;
    const pseudo = { poId: snap.poId, attrs: snap.attrs, filled: 0 };
    return readinessScore(pseudo as never);
  }, [snap]);

  if (loading) return <div className="card muted">…</div>;
  if (!snap) {
    return (
      <div className="card">
        <p className="muted">No passport to show. Open a dashboard order and publish it, or scan a factory’s QR.</p>
        <Link className="btn btn-ghost" to="/">← Porichoy home</Link>
      </div>
    );
  }

  return (
    <div className="passport-doc">
      <div className="pp-head">
        <div>
          <h1>Digital Product Passport · {snap.poId}</h1>
          <div className="sub">
            {snap.factory} · schema v{snap.schemaVersion} · issued {snap.issuedAt.slice(0, 10)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 34, fontWeight: 900 }}>{score?.score ?? 0}</div>
          <div style={{ fontSize: 11, opacity: .8 }}>readiness /100</div>
        </div>
      </div>
      <div className="pp-body">
        <div className="pp-grid">
          {DPP_SCHEMA_V01.map((a) => {
            const cell = snap.attrs[a.key];
            const ok = cell?.ok;
            return (
              <div key={a.key} className={`pp-cell ${ok ? '' : 'missing'}`}>
                <div className="k">{a.en}</div>
                <div className="v">{ok ? cell?.value : 'Not yet evidenced'}</div>
                <div className="r">{a.reg}{ok && cell?.sourceHeader ? ` · source: ${cell.sourceHeader}` : ''}</div>
              </div>
            );
          })}
        </div>
        <div className="notice info" style={{ marginBottom: 0 }}>
          {snap.stewardNote}
        </div>
      </div>
      <div className="pp-foot">
        <span>
          Provenance: {snap.chain.length
            ? <span className="mono">tip #{snap.chain[snap.chain.length - 1].seq} {snap.chain[snap.chain.length - 1].hash.slice(0, 20)}…</span>
            : <span className="mono">sample snapshot (no chain)</span>}
        </span>
        <span>Verified with Porichoy (পরিচয়) — local-first DPP pilot</span>
      </div>
    </div>
  );
}
