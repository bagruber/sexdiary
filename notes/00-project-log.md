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

**Done this session** (all verified: 3× typecheck, 36 unit tests, web
build, Metro bundle export):
- Monorepo restructure complete; web app unchanged in behavior, still
  deploys to `/docs`.
- Core extracted with versioned storage envelope (v2; legacy v1
  localStorage migrates transparently, unreadable data is quarantined
  under `<key>.corrupt` instead of deleted), hardened QR/backup
  validation, crypto-random ids/tokens, shared state reducer.
- 36 Vitest tests over risk engine, schemas, storage, ids. One test
  surfaced audit finding Q13 (noon-anchored day counts, ±1 day).
- Removed Google Fonts (third-party request — German case law risk) and
  the blanket `outline: none` (BITV); focus-visible styles added.
- `apps/mobile` shipped, milestone 1: Expo SDK 54, shares core.
  Security: 256-bit key in Keychain/Keystore (`expo-secure-store`,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY), AES-256-GCM via @noble/ciphers (pure
  TS, Expo Go compatible), `allowBackup=false`, OTA updates disabled, no
  network, no third-party SDKs. Screens: onboarding w/ disclaimer +
  explicit demo-data choice (mobile already implements audit Q11),
  dashboard (risk report + protections), log (add encounter/test,
  timeline), settings (language/theme/delete-all).
- Mobile not yet run on a physical device/emulator — Metro bundle export
  verified only. **Next session: run in Expo Go and smoke-test.**

**Next up (suggested order):** mobile smoke test on device → app lock
(biometric) → demo-mode for web (Q11) → in-app confirm modals replacing
window.confirm (Q9) → source citations in stis.ts → encrypted export.
