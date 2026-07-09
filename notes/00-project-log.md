# Project log

Reverse-chronological decision log. Read this first each session; append
before ending one. `docs/` is GitHub Pages build output — notes live here.

## 2026-07-10 — Grand refactor kickoff + mobile app start

Scope set by Benedict: refactor the whole app (quality, design,
usability, German public-administration readiness, features) and start a
native Android/iOS app in parallel. Working rules: no AI mentions
anywhere incl. commits; overcommunicate; small verified steps; persist
all findings in `notes/`.

**Decisions made:**
- Monorepo via npm workspaces: `packages/core` (pure TS domain logic —
  risk engine, STI data, schema, i18n, storage envelope; Vitest-tested),
  `apps/web` (existing Vite app), `apps/mobile` (new Expo RN app).
  Rationale: one audited implementation of the health logic for both
  platforms; auditors review core in isolation. Web build still outputs
  to root `/docs` for GH Pages.
- Mobile stack: Expo/React Native; SecureStore-held AES-256-GCM key,
  encrypted-at-rest blob, no OTA updates, no third-party SDKs. Full
  security model in `notes/04-mobile-app-plan.md`.
- Storage becomes a versioned envelope with a migration table in core;
  platforms plug in byte stores (audit finding Q3).
- Compliance analysis written to `notes/02-public-sector-compliance.md`.
  Headline risks: MDR/medical-device classification of the risk engine
  (strategy decision pending), DSGVO Art. 9 handling (local-first is the
  answer — protect it), BITV 2.0 accessibility debt, licence currently
  "all rights reserved" which blocks municipal audits (EUPL-1.2
  suggested, Benedict to decide).

**Open questions for Benedict** (also flagged in the relevant notes):
1. MDR strategy: soften risk scoring to education, or aim for DiGA?
2. Licence: stay proprietary or EUPL-1.2/similar for auditability?
3. Mobile builds: local-only toolchain or EAS acceptable for now?
4. Real backend timing: mock is fine until a pilot — when is a pilot?

**Done this session:** see git history of this date + status columns in
`notes/01-refactor-audit.md`.
