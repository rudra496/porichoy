import { DPP_SCHEMA_V01, SCHEMA_VERSION } from '../engine/schema';
import { EVIDENCE } from '../evidence';

const FACTS: { claim: string; source: string }[] = [
  { claim: 'ESPR (EU 2024/1781) entered into force 18 July 2024', source: 'European Commission, ESPR page (fetched 2026-09-12)' },
  { claim: 'Textiles are in the first ESPR Working Plan (April 2025); textile delegated act expected ~2027', source: 'EC ESPR page + Working Plan coverage (research verified 2026-08-26)' },
  { claim: 'EU customs will perform automatic checks on existence and authenticity of DPPs of imported products', source: 'European Commission, ESPR page (fetched 2026-09-12)' },
  { claim: 'Bangladesh RMG employs approximately 4 million workers (majority women)', source: 'BGMEA statistics' },
  { claim: 'Global DPP/traceability platforms (e.g. TrusTrace, TextileGenesis, Reverse Resources) are brand-side; factory-floor capture is the open last mile', source: 'trustrace.com (fetched 2026-09-12); verified competitor research 2026-08-26' },
];

export default function Method() {
  return (
    <div>
      <h2 className="section-title">Method, schema &amp; sources</h2>
      <p className="muted">
        Porichoy maps factory records onto a versioned canonical DPP schema. Nothing here is
        hand-waved: every attribute carries its regulatory anchor, every claim below its source.
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>Canonical schema v{SCHEMA_VERSION} (weight = Readiness Score share)</h3>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Attribute</th><th>Kind</th><th>Weight</th><th>Regulatory anchor</th></tr></thead>
          <tbody>
            {DPP_SCHEMA_V01.map((a) => (
              <tr key={a.key}>
                <td><b>{a.en}</b></td>
                <td>{a.kind}</td>
                <td>{a.weight}</td>
                <td className="muted">{a.reg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Schema v0.1 aligns to ESPR Art. 8 content categories and the public taxonomies of
        CIRPASS-2 — the EU co-funded DPP preparatory project whose pilots cover textiles,
        electronics, tires and construction (verified on cirpass2.eu, 2026-09-13). The textile
        delegated act is still a draft — the mapping layer is versioned so final rules are a
        config change, not a rebuild.
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>Readiness Score methodology</h3>
      <p className="muted">
        Score = (sum of weights of validated attributes) ÷ 100, per production order. A valid
        unique identifier (po_id) is mandatory — without it the order is structurally invalid
        and scores 0. Values are type-checked (percentages incl. Bangla numerals, dates);
        duplicate rows merge, conflicting values are flagged to the steward, never silently
        overwritten. Every accepted value — ingested or manually entered by a certified
        steward — extends the SHA-256 provenance chain and re-scores the order instantly.
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>Mapping engine (deterministic, offline)</h3>
      <p className="muted">
        Stage 1: documented synonym patterns over normalized headers (English + Bangla,
        punctuation/units stripped, Bangla numerals transliterated). Stage 2: bigram-dice
        fuzzy fallback (acceptance ≥ 0.72). Confirmed mappings become learned rules per
        factory. Values validated by type (percent incl. Bangla digits, dates). Duplicate
        PO rows are merged; conflicting values are flagged, never silently overwritten.
        17 unit tests cover the engine (<span className="mono">src/engine/engine.test.ts</span>).
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>Provenance</h3>
      <p className="muted">
        Accepted records join an append-only SHA-256 hash chain
        (hash = SHA256(prevHash | seq | poId | attrsJson | at)). Published passports embed the
        chain tip in the QR link itself, so a buyer can verify without any backend. We
        deliberately say <b>hash chain</b>, not blockchain.
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>Verified facts used in this product</h3>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Claim</th><th>Source</th></tr></thead>
          <tbody>
            {FACTS.map((f) => (
              <tr key={f.claim}><td>{f.claim}</td><td className="muted">{f.source}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-title" style={{ fontSize: 17 }}>Peer-reviewed evidence</h3>
      <p className="muted">
        The claims above and the design of this product are grounded in a live-verified
        literature base: {EVIDENCE.length} peer-reviewed works (EU DPP regulation, textile
        supply-chain traceability, Bangladesh RMG compliance, circular economy) — every DOI
        resolved via the Crossref API on 2026-09-13 with metadata copied verbatim.
        See the <a href="#/evidence">Evidence page</a> for the full table.
      </p>

      <h3 className="section-title" style={{ fontSize: 17 }}>What the pilot is not (yet)</h3>
      <p className="muted">
        Multi-tenant cloud sync, OCR of paper trim cards and live ERP connectors are the
        grant-funded roadmap (the architecture reserves connector slots for all three).
        The pilot deliberately ships local-first: raw factory data never leaves the device.
      </p>
    </div>
  );
}
