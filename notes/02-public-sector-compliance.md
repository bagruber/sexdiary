# Suitability for German public administration — concerns to address in advance

Target scenario: a Gesundheitsamt / city health department offers the app
(or its partner-notification backend) to citizens; server components run
on municipal infrastructure. Written 2026-07-10; not legal advice —
items marked ⚖️ need professional review before any deployment.

## 1. Data protection (DSGVO / GDPR)

Health + sex-life data is **Art. 9 special-category data** — the
strictest class. Everything below flows from that.

- **Local-first is the winning argument.** As long as all personal data
  stays on-device and the server only ever sees anonymous tokens, the
  server-side DSGVO surface is minimal. Preserve this property in every
  design decision; never "sync for convenience".
- **Partner-notification backend** must store only: recipient token, STI
  label (or even just "please get tested"), timestamp. No sender
  identity, no IP retention beyond transport, no message content. ⚖️
  Data Protection Impact Assessment (DSFA, Art. 35) will be mandatory.
- **Erasure (Art. 17)**: delete-all must also purge server-side alerts
  addressed to the user's token. Design the API with a revoke endpoint.
- **Encryption at rest on device** is expected for Art. 9 data: mobile
  gets SQLCipher/Keychain-backed storage (see notes/04); web needs
  passphrase-derived WebCrypto encryption or an honest statement that
  browser storage is only as safe as the device profile.
- **No third-party anything**: no CDNs, no analytics, no fonts from
  Google, no push via bare FCM/APNs payloads containing health data
  (use silent pushes that trigger a fetch, or polling).
- **Records**: provide a Verzeichnis von Verarbeitungstätigkeiten (Art.
  30) template and a plain-language Datenschutzerklärung in the app.

## 2. Medical device regulation (MDR) ⚖️ — the biggest strategic risk

The per-STI risk engine computes an individual risk assessment and tells
users when testing is meaningful. Software that supports diagnostic or
therapeutic decisions can qualify as a **medical device (MDR class IIa+
under Rule 11)**. Options, in ascending ambition:

1. Reframe outputs as **information/education** (window-period facts,
   "testing is generally recommended after X") rather than personalized
   risk scoring — likely outside MDR.
2. Keep scoring but pursue **DiGA** (Digitale Gesundheitsanwendung)
   listing — heavyweight: quality management system (ISO 13485), study
   evidence, BfArM process.
3. Ship risk scoring as clearly labelled research prototype — acceptable
   now, not for an official rollout.

Decision needed before public-sector conversations. Until then: keep the
"not a medical device, not medical advice" disclaimer visible in
onboarding and settings, and cite sources for every number in `stis.ts`.

## 3. Accessibility (BITV 2.0 / EN 301 549)

Public bodies must meet BITV 2.0 (≈ WCAG 2.1 AA). Concrete gaps:
keyboard/focus management in sheets and modals, aria-labels on icon-only
controls, contrast verification for both themes, reduced-motion support
(exists ✅), screen-reader text for the risk visualizations, Leichte
Sprache summary + DGS (sign language) info page for the public entry
point. Plan a full audit; fix labels/focus as we touch components.

## 4. IT security & hosting on municipal infrastructure

- **BSI IT-Grundschutz** alignment for the backend; municipalities will
  ask for it. Keep the server a single small, boring, self-contained
  service (one container, one Postgres/SQLite, no external calls) so a
  security review is cheap. OSS licence enables code audit.
- **Auditability**: reproducible builds, pinned dependencies, minimal
  dependency tree, unit tests on the risk engine, CHANGELOG. The
  monorepo/core split exists partly for this: an auditor can review
  `packages/core` (pure logic, no I/O) in isolation.
- **eIDAS/OZG hooks** 💡: test-result import QRs could later be signed
  by clinics (JWS) so results are verifiable — big trust win, design the
  payload envelope with an optional `sig` field now.
- Hosting: Dockerfile + docs for on-prem deployment, no cloud-vendor
  dependencies, IPv6, TLS via municipal PKI.

## 5. Legal & content ⚖️

- Impressum + Datenschutzerklärung required (TMG/DDG) once publicly
  offered — even for the GitHub Pages demo if it's promoted.
- §§ IfSG context: Gesundheitsämter do partner notification today by
  phone; anonymous token notification complements, not replaces, that.
  Frame the pitch accordingly.
- Age rating / youth protection: sexual-health content is fine
  (educational), but store listings will ask; prepare 16+ rating
  rationale.
- German localization must be complete and reviewed (medical terms).

## 6. Trust-building measures (cheap, do early)

- Publish the risk model with sources as a human-readable document.
- Open-source licence decision (currently "all rights reserved" — blocks
  audits and municipal adoption; consider EUPL-1.2, the EU public
  licence, which German administrations know). ⚖️ user decision.
- Threat-model document (what an attacker with the phone / with the
  server / with a QR can learn).
- "Data never leaves your device except X, Y" one-pager in-app.
