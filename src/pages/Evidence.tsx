import { EVIDENCE } from '../evidence';

const GROUPS = ['DPP & regulation', 'traceability technology', 'Bangladesh RMG compliance', 'Bangladesh circularity', 'circular economy', 'sustainable supply chain', 'due diligence & buyers', 'circularity & recycling', 'textile waste impact', 'DPP & tracking'];

const REG_SOURCES = [
  { label: 'European Commission — Ecodesign for Sustainable Products Regulation (ESPR)', detail: 'In force 18 July 2024; textiles in the first Working Plan (Apr 2025); customs will auto-check DPP existence & authenticity. Fetched 2026-09-12.', url: 'https://commission.europa.eu/energy-climate-change-environment/standards-tools-and-labels/products-labelling-rules-and-requirements/ecodesign-sustainable-products-regulation_en' },
  { label: 'CIRPASS-2 (EU co-funded DPP preparatory project)', detail: 'Pilot deployments and use cases in textiles, electronics, tires and construction — verified on cirpass2.eu 2026-09-13.', url: 'https://cirpass2.eu/' },
  { label: 'TrusTrace — brand-side DPP/traceability platform', detail: 'Example of the global brand-side category; factory-floor capture is the open last mile. Fetched 2026-09-12.', url: 'https://www.trustrace.com/' },
];

export default function Evidence() {
  const counts = GROUPS.map((g) => ({ g, n: EVIDENCE.filter((e) => e.group === g).length })).filter((x) => x.n > 0);
  return (
    <div>
      <h2 className="section-title">Evidence base</h2>
      <p className="muted">
        Every paper below was retrieved from the <b>Crossref API</b> and its DOI re-resolved
        live on <b>2026-09-13</b>; titles, journals, years and authors are copied verbatim from
        the API response (never typed by hand). The base grounds Porichoy’s problem statement
        (EU regulation, traceability, Bangladesh RMG compliance) and its design choices
        (circularity, data provenance).
      </p>
      <div className="pill-row" style={{ marginBottom: 14 }}>
        {counts.map(({ g, n }) => (
          <span key={g} className="chip chip-neutral">{g} · {n}</span>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Paper</th><th>Venue</th><th>Year</th><th>Group</th><th>Cited by</th><th>DOI (verified)</th></tr>
          </thead>
          <tbody>
            {EVIDENCE.map((e, i) => (
              <tr key={e.doi}>
                <td>{i + 1}</td>
                <td style={{ maxWidth: 380 }}><b>{e.title}</b>{e.authors.length > 0 && <div className="muted" style={{ fontSize: 12 }}>{e.authors.join(', ')}{e.authors.length >= 3 ? ' et al.' : ''}</div>}</td>
                <td>{e.journal}</td>
                <td>{e.year ?? '—'}</td>
                <td><span className="chip chip-neutral">{e.group}</span></td>
                <td>{e.citedBy.toLocaleString()}</td>
                <td><a className="mono" href={`https://doi.org/${e.doi}`} target="_blank" rel="noreferrer">{e.doi}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title" style={{ fontSize: 18 }}>Regulatory & market sources (fetched live)</h2>
      <div className="card" style={{ padding: 0 }}>
        <table className="tbl">
          <thead><tr><th>Source</th><th>What it establishes</th></tr></thead>
          <tbody>
            {REG_SOURCES.map((r) => (
              <tr key={r.url}>
                <td style={{ maxWidth: 320 }}><a href={r.url} target="_blank" rel="noreferrer"><b>{r.label}</b></a></td>
                <td className="muted">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="notice info">
        Verification method: Crossref REST API (<span className="mono">api.crossref.org/works/DOI</span>) —
        HTTP 200 + metadata match required for inclusion; the same protocol is recorded in
        our citation cache. Claims without a verifiable source are not made anywhere in this product.
      </div>
    </div>
  );
}
