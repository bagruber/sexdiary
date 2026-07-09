# Native mobile app — architecture & security model

Decided 2026-07-10. Goal: Android + iOS app that shares the audited core
logic with the web app, stores data as securely as the platform allows,
and is realistic to audit by a municipal IT department.

## Stack decision

**Expo (React Native) + TypeScript**, living in `apps/mobile` of the
monorepo, importing `@sexdiary/core`.

Why not alternatives:
- *Flutter/Kotlin+Swift*: would duplicate the risk engine and i18n in a
  second language — two codebases to audit and keep in sync. The risk
  engine is the trust-critical artifact; one implementation, unit-tested,
  used by both platforms, is the stronger audit story.
- *Capacitor (webview wrapper)*: weakest security posture (webview +
  localStorage) and weakest platform integration (biometrics,
  notifications). RN renders native views and lets us use platform
  keystores directly.
- Expo specifically: reproducible builds via EAS **or** plain
  `expo prebuild` + local Gradle/Xcode builds (municipal build servers —
  no cloud dependency required), OTA updates deliberately **disabled**
  (auditors must know the shipped code is the reviewed code).

## Data security model (the part to get right)

Layered, matching what "as secure as possible" means per platform:

1. **Encryption key**: 256-bit random key generated on first launch,
   stored in **iOS Keychain / Android Keystore** via
   `expo-secure-store` (hardware-backed where available,
   `WHEN_UNLOCKED_THIS_DEVICE_ONLY` — never in iCloud/Google backups).
2. **Data at rest**: app data encrypted with that key (AES-256-GCM)
   before touching disk. Storage engine: start with encrypted blob via
   the core storage envelope + expo-file-system; upgrade path to
   SQLCipher (`op-sqlite` w/ SQLCipher) when data outgrows a blob.
3. **App lock**: biometric/PIN gate (`expo-local-authentication`) on
   launch and on return from background; screen-capture protection and
   recent-apps snapshot blurring.
4. **OS backups excluded**: `android:allowBackup=false`, iOS file
   protection `NSFileProtectionComplete`; backups happen only through
   the explicit passphrase-encrypted export (roadmap P2).
5. **Network**: none by default. When the partner-alert backend exists:
   TLS-pinned, token-only payloads, user-visible "what gets sent"
   screen before every transmission.
6. **No third-party SDKs**: no analytics, no crash reporting that
   uploads (offline logs only), dependencies pinned + lockfile audited.

## Auditability

- All health logic in `packages/core` — pure functions, no I/O, unit
  tests, reviewable in isolation.
- `apps/mobile` is thin: screens + storage adapter + platform glue.
- Build reproducibly from source with `expo prebuild` + Gradle/Xcode;
  document the exact toolchain versions in the app README.
- THREAT-MODEL.md (planned) enumerates: attacker with unlocked phone,
  with locked phone, with backup file, with the server, with a QR.

## Milestones

1. ✅ Scaffold in monorepo, Metro configured for workspaces, core
   imported, storage adapter with SecureStore-held key + AES-GCM blob.
2. Screens: Dashboard (risk cards), Log (add intercourse/test), History,
   Settings — reusing core risk/i18n; navigation via expo-router or
   plain state (start simple, mirror web's view-switch pattern).
3. Biometric app lock + backgrounding protection.
4. QR: camera scan (expo-camera) + QR render (react-native-qrcode-svg)
   using the same core schema payloads.
5. Notifications for window-period reminders.
6. Feature parity checklist vs web; then store-listing prep (16+ rating
   rationale, screenshots, Datenschutzerklärung).

## Open questions for Benedict

- Local builds only, or is EAS (Expo's cloud build) acceptable pre-pilot?
- Should web and mobile stay feature-identical, or is mobile the lead
  platform once it exists?
