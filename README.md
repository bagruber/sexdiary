# Sexdiary

A private case study exploring whether a personal sexual-health tracker
can make individual STI exposure feel as legible as, say, COVID risk did
in 2020 — and whether anonymous, token-based partner notification can
lower the social friction of telling recent contacts to get tested.

This is a single-person research prototype. It is **not** a product, not
medically validated, not maintained on a release schedule, and not open
for outside contribution. There is no license — all rights reserved.
It is not a medical device and provides no medical advice.

## Repository layout

npm-workspaces monorepo:

| Path | What |
|------|------|
| `packages/core` | Platform-free domain logic: risk engine, STI data, import/export schemas, storage envelope (versioning + migrations), i18n. Zero runtime dependencies, unit-tested. This is the audit surface. |
| `apps/web` | Vite + React web app (UI, localStorage adapter, QR camera/render). |
| `apps/mobile` | Expo (React Native) app for Android/iOS sharing the same core; encrypted-at-rest storage. |
| `docs/` | **Build output** of the web app, served by GitHub Pages from `main`. Not documentation. |
| `notes/` | Project knowledge base: decision log, refactor audit, public-sector compliance notes, roadmap, mobile architecture. |

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
- All data stored locally; nothing leaves the device. No third-party
  requests at runtime (fonts are a system stack by design).

## Running it

```bash
npm install          # once, at the repo root (installs all workspaces)
npm run dev          # web dev server
npm run build        # typecheck + build web app into ./docs
npm test             # core unit tests (risk engine, schemas, storage)
npm run typecheck    # typecheck all workspaces

# mobile (see apps/mobile/README.md)
npm run start -w @sexdiary/mobile
```

GitHub Pages is served from `main` branch, `/docs` folder.

## QR import schema

External providers can hand a user a QR that imports a test result
directly. Payloads are validated (dates, tokens, enum values, size
caps) before anything enters the store — see
`packages/core/src/schema.ts`. The payload is JSON:

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
