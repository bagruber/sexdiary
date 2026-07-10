# Feature roadmap

Priorities: P1 = next, P2 = after refactor settles, P3 = later/idea.
Updated 2026-07-10.

## Done (2026-07-10)

- ✅ Rating explanation ("Why this rating?") — core `contributions[]`.
- ✅ Next-action summary — core `nextAction()`.
- ✅ Vaccination series completion — core `vaccineSeries()`.
- ✅ "Your data" screen with raw inspector.
- ✅ Disguise mode + panic-hide decoy (mobile).
- ✅ Simulated app lock w/ PIN + re-lock on background (mobile).
- ✅ Demo mode: explicit "explore with sample data" in onboarding
  (mobile only — **web still seeds by default**, audit Q11 open there).

**Port these four to web**: explanation, next action, vaccine series,
your-data. All logic already lives in core.

## P1 — round out the core loop

- **Demo mode on web**: seed data only behind an explicit "explore with
  sample data" choice; real users start empty. (Audit Q11.)
- **Real app lock**: replace the simulation with
  `expo-local-authentication` (biometric) + keystore-bound gating, and
  screen-capture / recent-apps blurring. Remove the "simulated" label
  only when it is a genuine boundary.
- **Native disguise**: alternate app icon + OS-level app name (requires
  a native build; in-app disguise already ships).
- **Test reminders**: local notifications when a window period closes
  ("HIV testable from Friday") and periodic routine-test nudges.
  Mobile: expo-notifications; web: best-effort.
- **App lock**: PIN/biometric gate (mobile: LocalAuthentication;
  web: passphrase). Makes `prefs.lock` real.
- **Post-positive guidance**: per-STI "what now" content — treatment
  facts, partner-notification checklist, links to local
  Beratungsstellen (Gesundheitsamt directory by PLZ).
- **Undo/soft-delete** for records; delete-all with typed confirmation.

## P2 — depth

- **Real partner-alert backend** (self-hostable, municipal-friendly):
  tiny service — POST alert by token, GET alerts for my token, DELETE
  by token. Anonymous, no accounts. Ships with Dockerfile + audit doc.
  The mock server interface becomes an adapter so web/mobile switch
  between mock and real via config.
- **Signed clinic QRs**: optional JWS signature on test-result payloads;
  app shows "verified result from <facility>" badge.
- **Encrypted backup/restore**: passphrase-encrypted export file
  (AES-GCM), QR-chunked or file-based; also the web↔mobile migration
  path.
- **Risk model v2**: cite sources per parameter, per-act frequency
  (times, not just flags), symptom check-in, HPV/Hep C/Trich coverage,
  configurable prevalence by region instead of the hardcoded
  country list.
- **Statistics view**: testing cadence, protection usage over time —
  purely local.

## P3 — ideas (not committed)

- Multi-language beyond EN/DE (TR, RU, AR — Gesundheitsamt audiences).
- Clinic-facing web page that generates result QRs (the other half of
  the import flow).
- Doxy-PEP / PrEP adherence tracking with refill reminders.
- Anonymized, opt-in, differential-privacy epidemiology export for the
  health authority (very sensitive — only with a DSFA and real review).
- Wear OS / watchOS quick-log.

## Explicit non-goals

- Accounts, cloud sync of health data, social features, advertising or
  any third-party analytics. These would destroy the local-first trust
  argument (see notes/02).
