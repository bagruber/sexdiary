# Project log

Reverse-chronological decision log. Read this first each session; append
before ending one. `docs/` is GitHub Pages build output — notes live here.

## 2026-07-10 (later) — Trust & discretion feature batch (mobile)

Shipped as one batch on `apps/mobile` (v0.2.0), with the shared logic in
core so the web app can reuse it:

- **Rating explanation.** `calcRisk` now emits `contributions[]` per STI:
  the exact encounters that drove the rating, which acts contributed,
  whether protection was recorded, and whether Doxy-PEP reduced it. Also
  `prepExcluded` — PrEP-suppressed encounters are *counted and shown*
  rather than silently dropped. Tapping any risk card opens the
  breakdown. This is the highest-leverage trust feature and it softens
  the MDR posture: transparent education reads less like a diagnostic
  device than an opaque score.
- **Next action.** New core `nextAction(report)` reduces the whole engine
  to one sentence at the top of the dashboard ("Time to get tested" /
  "Too early to test — {sti} in {n} days" / "Nothing to do right now").
- **Vaccination completion.** New core `vaccineSeries(vx)` (Hep B 3,
  Mpox 2) drives a progress card. Public-health value shaped as a
  satisfying progress bar; no streaks (streaks shame lapses, wrong tool
  for sexual health).
- **Your data screen.** Plain-language data-flow statement + record
  counts + raw-record inspector (PIN redacted). Trust what you can
  inspect, don't ask users to believe.
- **Disguise mode** (opt-in): neutral app name in-app and on the lock
  screen, plus a one-tap "Hide" that swaps the whole UI for a neutral
  notes decoy (exit = triple-tap the title). Shoulder-surfing is the
  realistic threat model here.
- **App lock: simulated, and labelled as such** in the UI. 4-digit PIN
  keypad, re-locks on backgrounding via AppState, plus a "use biometrics
  (simulated)" affordance where `expo-local-authentication` will go. The
  PIN gates the interface only — it derives no key, and the store is
  encrypted at rest regardless. `Preferences.lockPin` documents this.
- Interaction polish: haptics on all controls, accessible progress
  meters, chevron affordances on tappable rows.

**Not done:** the four portable features (explanation, next action,
vaccine series, your-data) are **mobile-only so far**; core exposes
everything needed to port them to `apps/web`. Mobile still hasn't been
run on a device — verified by typecheck + Metro bundle export only.

**i18n note:** `{s}` plural suffixes don't survive German ("1 Tags").
Added `plurals(t, n)` in core which injects the noun itself
(`{dayWord}`, `{encWord}`, `{doseWord}`). Use it for any new counted
string. `de.ts` is typed `: Dict`, so missing keys fail the build.

## 2026-07-10 (later) — Decisions from Benedict

- **License: moving to an open license.** Concrete license (EUPL-1.2 vs
  MIT/Apache-2.0) still to be picked; EUPL-1.2 recommended for the
  public-administration audience. Action: add LICENSE file + update
  README "all rights reserved" wording once picked.
- **MDR strategy: explicitly unsettled.** Keep the disclaimer prominent,
  keep risk wording informational, don't block work on it, revisit
  before any public-sector pitch.
- Build question clarified: local Gradle/Xcode has no technical issue —
  the open question was only whether Expo's cloud build service (EAS)
  is acceptable. See UX/feature brainstorm discussed same day.

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
