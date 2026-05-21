# Sexdiary

A private case study exploring whether a personal sexual-health tracker
can make individual STI exposure feel as legible as, say, COVID risk did
in 2020 — and whether anonymous, token-based partner notification can
lower the social friction of telling recent contacts to get tested.

This is a single-person research prototype. It is **not** a product, not
medically validated, not maintained on a release schedule, and not open
for outside contribution. There is no license — all rights reserved.

## What's inside

- Logbook for intercourse, tests, vaccinations, PrEP and Doxy-PEP
- Per-STI risk engine across 8 activity types, factoring window
  periods, condom efficacy, vaccine immunity (Hep B, Mpox), PrEP, and
  Doxy-PEP
- Dashboard with testable-now banner, window-period state, and an
  "All clear" state; protections strip showing active prophylaxis
- Calendar with day-level detail sheets
- Bilingual UI (English / German), toggleable in Settings
- Light / dark / system theme
- Connect screen: real QR-code generation and camera-based QR scanning
  for contact exchange or test-result import
- Mock partner-alert flow with status progression
  (pending → notified → confirmed → tested negative)
- All data stored locally in `localStorage`; nothing leaves the device

## Stack

- Vite + React + TypeScript
- `qrcode` for generation, `jsqr` + `getUserMedia` for scanning
- No server. The "partner alert server" is a localStorage mock.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # builds to ./docs for GitHub Pages
```

GitHub Pages is served from `main` branch, `/docs` folder.

## QR import schema

External providers can hand a user a QR that imports a test result
directly. The payload is JSON:

```json
{
  "v": 1,
  "type": "test_result",
  "date": "2026-05-15",
  "facility": "City Health Clinic",
  "num": "T-2026-009",
  "ts":      { "HIV": 1, "Gonorrhea": 1, "Chlamydia": 1, "Syphilis": 1 },
  "results": { "HIV": "negative", "Gonorrhea": "negative", "Chlamydia": "negative", "Syphilis": "positive" }
}
```

Contact-exchange QR uses the same envelope:

```json
{ "v": 1, "type": "contact", "token": "...", "platform": "telegram", "handle": "..." }
```

## Status

Prototype. Subject to scope changes, removal, or abandonment without
notice. Not a medical device.
