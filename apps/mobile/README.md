# Sexdiary mobile (Android + iOS)

Expo / React Native shell around `@sexdiary/core` — the same audited
risk engine, schemas, i18n, and state reducer the web app uses. The app
adds only screens and a platform storage adapter, which keeps the
security-relevant surface small and reviewable.

## Security model

- **Master key**: 256-bit, generated on first launch from the OS CSPRNG,
  stored in the iOS Keychain / Android Keystore via `expo-secure-store`
  with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (hardware-backed where the
  device supports it; excluded from backups and keychain cloud sync).
- **Data at rest**: the app state is serialized through the core storage
  envelope (schema versioning + migrations), then AES-256-GCM encrypted
  (`@noble/ciphers`, audited pure-TypeScript — no native crypto module
  needed, works in Expo Go) with a fresh random 96-bit nonce per write.
  Only ciphertext ever reaches disk (AsyncStorage).
- **Backups**: `android:allowBackup=false`; nothing readable leaves the
  device. Explicit passphrase-encrypted export is on the roadmap.
- **Updates**: OTA updates are disabled in `app.json` — the code that
  ships in a build is the code that was reviewed.
- **Network**: none. There is no server communication in this milestone.
- **Third-party code**: no analytics, no crash uploaders, no SDKs beyond
  Expo modules and the audited cipher library.

Known limitation (tracked in `notes/04-mobile-app-plan.md`): no app-lock
yet — an attacker holding the *unlocked* phone can open the app. The
biometric gate is milestone 3.

## Running

```bash
pnpm install                            # once, at the repo root
pnpm --filter @sexdiary/mobile start    # Expo dev server (QR → Expo Go)
pnpm --filter @sexdiary/mobile android  # launch on Android device/emulator
pnpm --filter @sexdiary/mobile ios      # launch on iOS simulator (macOS)
```

Native builds without any cloud service:

```bash
npx expo prebuild      # generates android/ + ios/ projects
# then standard Gradle / Xcode builds on your own machine
```

## Structure

| Path | What |
|------|------|
| `index.ts` | Entry; installs the CSPRNG polyfill before anything else |
| `App.tsx` | Provider, onboarding (disclaimer + explicit demo-data choice), tab shell |
| `src/lib/secure-storage.ts` | Keystore-held key + AES-GCM storage adapter |
| `src/state/store.tsx` | React context around the shared core reducer |
| `src/screens/` | Dashboard (risk report), Log (encounters + tests), Settings |
| `src/ui.tsx`, `src/theme.ts` | Minimal UI kit, light/dark palettes |
