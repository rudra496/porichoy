/**
 * Provenance: append-only SHA-256 hash chain over accepted records.
 * link.hash = SHA256(prevHash | seq | poId | attrsJson | at)
 * Passport pages display the chain tip + link list so a buyer or auditor can
 * re-derive the chain from the stored links alone. Honest trust: hash chain,
 * not blockchain.
 */

export interface ChainLink {
  seq: number;
  poId: string;
  prevHash: string;
  hash: string;
  at: string; // ISO timestamp
  sourceFile: string;
  attrsJson: string; // snapshot of accepted attrs at acceptance time
}

const enc = new TextEncoder();
export const GENESIS = 'porichoy-genesis-0000';

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function chainPayload(l: Omit<ChainLink, 'hash' | 'sourceFile'>): string {
  return [l.prevHash, l.seq, l.poId, l.attrsJson, l.at].join('|');
}

export async function makeLink(
  prev: ChainLink[],
  poId: string,
  attrsJson: string,
  sourceFile: string,
): Promise<ChainLink> {
  const prevHash = prev.length ? prev[prev.length - 1].hash : GENESIS;
  const seq = prev.length + 1;
  const at = new Date().toISOString();
  const base = { seq, poId, prevHash, attrsJson, at };
  const hash = await sha256Hex(chainPayload(base));
  return { ...base, hash, sourceFile };
}

export async function verifyChain(links: ChainLink[]): Promise<{ ok: boolean; brokenAt: number | null }> {
  let prevHash = GENESIS;
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    if (l.seq !== i + 1 || l.prevHash !== prevHash) return { ok: false, brokenAt: i + 1 };
    const expect = await sha256Hex(chainPayload({ seq: l.seq, poId: l.poId, prevHash: l.prevHash, attrsJson: l.attrsJson, at: l.at }));
    if (expect !== l.hash) return { ok: false, brokenAt: i + 1 };
    prevHash = l.hash;
  }
  return { ok: true, brokenAt: null };
}
