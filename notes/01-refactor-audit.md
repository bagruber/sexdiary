# Refactor audit — code quality, design, usability

Audited: 2026-07-10, at commit `918ab9b` (v0.3.0, ~4 000 LOC).
Status legend: ✅ fixed · 🔧 in progress · ⏳ planned · 💡 idea, not committed to.

## What is already good (keep)

- Clean layering for a prototype: pure risk engine (`lib/risk.ts`), typed
  domain model (`types/domain.ts`), reducer-based store, views separated.
- Strict TypeScript, discriminated-union actions, no `any` sprawl.
- Bilingual i18n with typed keys and EN fallback.
- Local-first by design — nothing leaves the device. This is the single
  strongest asset for public-sector positioning; protect it.

## Code quality findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| Q1 | No separation between platform-free logic and browser code — `seed.ts` reads `navigator`, `storage.ts`/`mock-server.ts` hardcode `localStorage`. Blocks mobile reuse. | high | ✅ `packages/core` extraction |
| Q2 | Zero automated tests. The risk engine is exactly the code a health authority would audit. | high | ✅ Vitest in core |
| Q3 | No storage schema versioning. Key is `sexdiary.v1.appData` but there is no migration path; a shape change silently corrupts or drops user data. | high | ✅ versioned envelope + migration table |
| Q4 | `gid()` uses a module counter + `Math.random` — collision-prone across devices/imports. | medium | ✅ crypto-based IDs |
| Q5 | Import path in `App.tsx` casts unvalidated JSON to domain types (`parsed as {...}`); a malformed backup file can poison the whole store via `replaceAll`. | high | ✅ validation in core `schema.ts` |
| Q6 | `parseImportPayload` doesn't validate date format, result values, STI names, or payload size — QR content is attacker-controlled input. | high | ✅ hardened |
| Q7 | No ESLint/Prettier config; style is consistent by discipline only. | low | ⏳ |
| Q8 | Inline styles everywhere (no design tokens beyond `palette.ts`); makes theming/accessibility passes expensive. | medium | ⏳ move to CSS variables + tokens |
| Q9 | `window.alert`/`window.confirm` for destructive actions (delete-all) — not localizable styling, blocks BITV. | medium | ⏳ in-app confirm modal |
| Q10 | `prefs.lock` exists but does nothing — a settings toggle that lies to the user. | medium | ⏳ implement app lock or remove until real |
| Q11 | Seed data ships as the default state for real users (`freshAppData` returns demo contacts/tests). Fine for a demo, dangerous for production — must become an explicit "demo mode". | high | ⏳ demo-mode flag |
| Q12 | Mock alert server progresses status on wall-clock seconds; fine as mock, but the interface (`sendAlert`/`statusFor`) should be an adapter so a real backend can drop in. | medium | ⏳ `AlertTransport` interface |
| Q13 | Discovered by unit test: `calcRisk` day counts are noon-anchored (`toDate` pins to 12:00), so "days since exposure" differs by ±1 depending on time of day. Harmless for display, but `testable` flips half a day early/late at window boundaries. Consider anchoring "today" to noon too. | low | ⏳ |

## Design-choice findings

- **Monorepo** (decided): npm workspaces — `packages/core` (pure TS, no
  DOM/RN imports, unit-tested), `apps/web`, `apps/mobile`. GH Pages
  build still lands in root `/docs`.
- **Storage as adapter**: core defines `serialize/deserialize + migrate`;
  each platform supplies the byte store (web: localStorage today,
  encrypted IndexedDB later; mobile: SQLCipher/SecureStore).
- **Risk model transparency**: `stis.ts` transmission numbers have no
  source citations. For any public-sector review each number needs a
  reference (RKI/WHO/CDC). ⏳ add `source` field per entry.
- **Single-user assumption** is fine; do not add accounts. Identity for
  partner notification stays token-based and anonymous.

## Usability findings

- Onboarding doesn't explain the risk model or its limits — users must
  understand this is estimation, not diagnosis (also a liability issue).
- No undo after delete; destructive actions are one confirm away.
- Calendar is log-first; a "quick log yesterday/today" shortcut would
  cover the 90% case.
- Positive-result flow is good (modal → alerts) but there's no guidance
  content ("what now?" — treatment, Gesundheitsamt Beratungsstellen).
- No reminder system despite window periods being the core concept
  ("your HIV window closes in 3 days — book a test").
- Accessibility: icon-only FAB/nav lack labels in places, contrast
  unchecked, no focus management in sheets/modals. Needs a full BITV
  pass (see notes/02).
