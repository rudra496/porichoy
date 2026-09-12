# 📦 PORICHOY × NIC 3.0 — FINAL REVIEW PACKAGE (v2.0)

**Updated by Rudra Junior · 2026-09-13 · Deadline: 3 October 2026**
**STATUS: everything built & verified — AWAITING RUDRA SIR'S REVIEW. Nothing is submitted.**

## 0. What v2.0 added (2026-09-13, his directive: "more professional + Q1 papers + more features")

| Addition | Verified how |
|---|---|
| **Evidence base: 16 peer-reviewed papers** (EU DPP regulation, traceability tech, Bangladesh RMG compliance, circular economy — incl. two 7,000+ citation foundations in Journal of Cleaner Production / Resources, Conservation & Recycling) | Every DOI resolved LIVE via Crossref API 2026-09-13; metadata copied verbatim from API JSON; cached in `state/citations_cache.json`; rendered on the app's **Evidence page** with DOI links |
| **Professional redesign**: gradient brand mark, stat strip (≈4M workers BGMEA · #2 exporter · 2027–30 EU wall — each with source label), eyebrow badge, card shadows, refined nav/footer | Visual judge pass on landing, dashboard, PO detail, evidence page (3 issues found & fixed: nav overlap, mid-word column breaks, DOI wrapping → re-judged PASS) |
| **Steward gap-filling (edit-in-place)**: click Add on any missing attribute → type value → Save → score updates instantly + provenance chain extends + published QR invalidated for re-publish | Live browser test: PO-1003 scored 45→60, value attributed "ম্যানুয়াল এন্ট্রি — স্টুয়ার্ড", chain 4→5 links |
| **Exports**: readiness report CSV (dashboard) + passport JSON (PO page) | Buttons render + download (Blob) |
| **Sample file downloads** in Upload page | /porichoy/samples/*.xlsx + *.csv return HTTP 200 |
| **SUBMISSION_CHECKLIST.md** — every form field (extracted from their app bundle) mapped to our answer + word-limit status | docs/SUBMISSION_CHECKLIST.md |
| CIRPASS-2 textile-pilot wording | verified on cirpass2.eu 2026-09-13 ("pilot deployments and use cases in textiles, electronics, tires…") |

---

## 1. Where everything is

| # | Deliverable | Location | Verified how |
|---|-------------|----------|--------------|
| 1 | **Live app** (the product) | https://rudra496.github.io/porichoy/ · repo `rudra496/porichoy` | Browser-verified end-to-end: sample load → scores 90/90/45/35 → QR → passport page → Bangla toggle; 19/19 unit tests; CI green |
| 2 | **Pitch deck** (6 slides, their required topics) | `deck/Porichoy_NIC3_Deck.pdf` (+ .pptx + slide PNGs) | Visual judge pass 6/6 (slide-4 overlap found & fixed, re-judged) |
| 3 | **Form answers** (all questions, word limits validated) | `docs/FORM_ANSWERS.md` | 135/150 · 91/100 · 136/150 · 75/100 — all PASS (script: `docs/validate_answers.py`) |
| 4 | **Demo video** (~2:35, AI placeholder voice) | `video/Porichoy_NIC3_Demo.mp4` | Real screen recordings of the live app + deck slides, burned subtitles |
| 5 | **His-voice re-record script** | `video/VOICE_SCRIPT.md` | 6 segments; drop `his_voice/seg1..6.mp3` → I re-render in minutes |
| 6 | **Factory LOI request** (EN email + BN WhatsApp) | `docs/FACTORY_LOI_REQUEST.md` | Ready to send as-is |
| 7 | **Messy sample files** (what a real factory upload looks like) | `samples/porichoy-sample-factory-data.xlsx` + CSV | Generated, valid xlsx (checked magic bytes) |
| 8 | **Full analysis** (why this project, rules, competitors) | `../ANALYSIS.md` + ADDENDUM | All claims sourced; unverifiable items explicitly flagged |

## 2. What YOU must check, Rudra Sir (30 minutes)

1. **Open the app** → click "Load sample data" → click a PO → "Generate QR" → open the
   link. Does the story convince you? (Toggle বাংলা too.)
2. **Read the deck PDF** (`deck/Porichoy_NIC3_Deck.pdf`) — 6 slides, ~4 minutes.
   Slide 5 (team) states: AdalatAI, JolSetu, RippleUp, StealthHumanizer, Q1 paper —
   **confirm you're comfortable claiming all of these publicly.**
3. **Read `docs/FORM_ANSWERS.md`** — especially the honest staging narrative
   ("Launched Sep 2026, pre-revenue"). This is the truthfulness line we never cross.
4. **Watch the video** when it finishes (~2:35) — then decide: placeholder voice or
   your voice (script in `video/VOICE_SCRIPT.md`).
5. **LOI**: tell me 2–3 factory contacts to send `docs/FACTORY_LOI_REQUEST.md` to.

## 3. What happens after your OK

- You create the account at needlechallenge.com (your email — you type credentials),
  then fill the form using FORM_ANSWERS.md and upload `deck/Porichoy_NIC3_Deck.pdf`.
- Target: **submit by 30 September** (72-hour buffer before the 3 Oct deadline).
- If you want, I can drive the form in the in-app browser while you type only the
  sign-up credentials (same pattern as Ural Study / Xylem registration).

## 4. Honesty ledger (what we claim vs what is true)

| Claim (deck/form) | Reality |
|---|---|
| "Live today, 19 automated tests" | True — CI-verified |
| "Launched/Product-market fit" stage | Honest: live since Sep 2026, pilots in progress, pre-revenue — stated as such in the form narrative |
| "Pilot factories in progress / LOIs in progress" | **Needs your factory outreach to become true before submission** — or reword to "pilot recruitment starting" |
| ESPR dates, customs auto-checks, ≈4M workers (BGMEA), #2 exporter | All verified live (sources in app Method page + ANALYSIS.md §9) |
| Team projects (AdalatAI, JolSetu, RippleUp, Q1 paper) | All real, all yours — confirm public claim comfort |
| NOT claimed anywhere: revenue, registered company, 1.5-year traction, past winners, CIRPASS-2/H&M | Deliberately absent — flagged unverified in ANALYSIS.md |

## 5. Risk register (top 3)

| Risk | Mitigation |
|---|---|
| Track gate ("1.5+ years traction" wording) | Honest staging via "Launched/PMF" dropdown + strongest possible pilot evidence (LOIs) — and the work survives losing (real product + portfolio) |
| AI-content scrutiny | Re-voice the form prose in your own words before submitting (your call, like IPESphere) |
| Zero factory contacts | LOI template ready; SUST IPE network + BGMEA angle; even ONE real Excel sheet transforms the demo |
