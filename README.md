# Porichoy (পরিচয়) — DPP-in-a-Box for Bangladeshi garment factories

**Porichoy** ("identity") turns a factory's messy existing records — Excel with
Bangla/English mixed headers, ERP exports, paper trim cards — into **buyer-ready EU
Digital Product Passports**, before the EU's 2027 rules bite. Powered by women
**DPP Data Stewards** trained at each pilot factory.

Live: https://rudra496.github.io/porichoy/

## What it does (pilot v1.0)

1. **Ingest** — drop a factory `.xlsx`/`.csv`; first sheet parsed on-device.
2. **Map** — deterministic engine maps chaotic headers to the canonical DPP schema
   (documented synonym patterns EN+BN, bigram-dice fuzzy fallback, confidence scores,
   human confirm; learned vocabulary per factory). Bangla numerals supported.
3. **Score** — DPP Readiness Score 0–100 per production order (weight = ESPR Art. 8
   category), with the exact missing-attribute list.
4. **Publish** — a QR whose link *embeds the passport snapshot* (no backend needed):
   scanning opens the buyer view on any phone. Provenance = append-only SHA-256 hash
   chain (we say hash chain, not blockchain).
5. **Local-first** — raw factory data never leaves the device in the pilot.

## Engineering

- Vite + React + TypeScript PWA (offline-tolerant service worker), zero backend.
- `src/engine/` — schema (12 ESPR-anchored attributes, versioned), mapping engine,
  readiness scoring, provenance chain. **17 unit tests** (`npm test`).
- Schema v0.1 tracks ESPR Art. 8 + CIRPASS-2 textile attribute families; the textile
  delegated act is a draft, so mappings are config, not rewrites.

## Run

```bash
npm install && npm test && npm run build && npm run preview
```

## Sample data

`samples/porichoy-sample-factory-data.xlsx` — 3 sheets of deliberately messy
(fictional "Shonali Textiles Ltd.") records: Bangla headers, duplicates with
conflicting values, missing cells. The dashboard's "Load sample data" button
loads the same dataset in-app.

## Roadmap (grant-funded)

OCR for paper trim cards → one ERP API connector → cloud multi-tenant sync →
steward training curriculum + certification → 10-factory paid pilot.

---

Built for Needle Innovation Challenge 3.0 (Oporajita / H&M Foundation initiative) —
"Better Process: transparency & traceability" focus area. Verified claims with
sources live in the app's Method page and `docs/FORM_ANSWERS.md`.
