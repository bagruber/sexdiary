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
- **App lock**: the device's own authentication — biometrics where
  enrolled, the device PIN or pattern otherwise (`expo-local-authentication`).
  It gates the *interface*; the data is encrypted independently of it.
  The key is deliberately **not** bound to authentication yet: Android
  discards such a key when the enrolled biometrics change, which without
  a backup is a data-loss trap (see `OFFENE-PUNKTE.md`).
- **Screen capture**: blocked via `expo-screen-capture` — FLAG_SECURE on
  Android, which also blanks the recents tile. iOS has no equivalent, so
  the app covers itself when it stops being frontmost.
- **Backups**: `android:allowBackup=false`; nothing readable leaves the
  device. Explicit passphrase-encrypted export is on the roadmap.
- **Updates**: OTA updates are disabled in `app.json` — the code that
  ships in a build is the code that was reviewed.
- **Network**: none. There is no server communication in this milestone.
- **Third-party code**: no analytics, no crash uploaders, no SDKs beyond
  Expo modules and the audited cipher library.

## Testing on a real phone

**This app has never run on a device.** Typecheck, `expo-doctor` and a
Metro export say the code is coherent; they say nothing about whether
the lock holds across backgrounding or whether a reminder fires on the
right morning. There are two rungs, and the first one costs five
minutes.

### Rung 1 — Expo Go: does it work at all

```bash
pnpm install                          # once, at the repo root
pnpm --filter @sexdiary/mobile start  # scan the QR with Expo Go
```

No build, no signing, no download. Every native module this app uses is
part of Expo Go, and `@noble/ciphers` is pure TypeScript, so the whole
storage path runs unchanged.

What this rung **can** answer — and these are the open questions, not a
formality:

- Does the app start on the New Architecture at all (it jumped three
  Expo majors, 54 → 57, and never ran once since)?
- Does `SecureStore` hold the master key, and does the **second** start
  decrypt what the first one wrote? That is the single most important
  check in the whole app.
- Does the lock prompt appear, and does the device PIN work as fallback?
- Does a reminder actually get scheduled, and does the text stay
  discreet on the lock screen?

What it **cannot** answer: anything about the app's identity. Config
plugins do not apply in Expo Go, so the icon, the app name, the Face ID
permission text, `allowBackup=false` and the notification icon are Expo
Go's, not ours. Disguise mode cannot be judged here either.

**Expo Go tests the logic. The APK tests the promises.**

### Rung 2 — an installable APK

Locally, no cloud service involved (the ADR-0010 "self-hosted" path):

```bash
export JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"

npx expo prebuild --platform android   # generates android/, not committed
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

**Windows: der lokale Build kommt derzeit nicht durch.** Nicht wegen der
App, sondern wegen der 260-Zeichen-Pfadgrenze. Stand 28.08.2026:

- Das flache pnpm-Layout (`nodeLinker: hoisted`) hat den groessten Teil
  geloest: laengster Quellpfad 293 auf 213 Zeichen, CMake-Warnungen von
  403 auf 1, zwei scheiternde Native-Tasks auf einen.
- Was bleibt: CMake kodiert bei `react-native-safe-area-context` den
  absoluten Quellpfad in den Objektpfad (`.../react_codegen_….dir/C_/Users/…`).
  Der Repo-Pfad steckt dadurch zweimal drin, zusammen 396 Zeichen.
  **Repo flacher legen hilft nicht** — unter `C:/sd` waeren es noch 308.
- Windows-Langpfade einzuschalten hilft ebenfalls nicht: das ninja.exe
  aus Android SDK cmake 3.22.1 ist nicht langpfadfaehig (weder
  `longPathAware`-Manifest noch `RtlAreLongPathsEnabled` im Binary), es
  bricht unabhaengig von der Registry bei 260 ab. Ab ninja 1.11 waere das
  anders — dafuer braucht es eine neuere CMake aus dem SDK-Manager.

Bis dahin: EAS Build baut auf Linux, wo die Grenze nicht existiert.

**Check free disk space first: this needs about 4 GB.** Attempted on
28.08.2026 and it did not finish — Gradle downloaded its distribution
and dependency cache (2.4 GB), ran for 17 minutes, and then failed
writing `executionHistory.bin` because the disk had filled up. That
error reads like a Gradle bug and is almost always a full disk or a file
lock on Windows. The route itself is sound; it has simply not produced
an APK on this machine yet.

The generated project signs the release build with the **debug**
keystore — fine for sideloading to testers, and exactly what must be
replaced before anything is distributed for real.

One more thing that cost time: piping Gradle through `tail` hides its
exit code, so a failed build reports success. Redirect to a file and
check `$?`, or set `pipefail`.

Or via EAS, which builds in the cloud and hands back a download link:

```bash
npx eas-cli build --platform android --profile preview
```

`eas.json` carries two profiles: `preview` builds an APK for
sideloading, `production` an app bundle for the store's internal test
channel. Both distribution routes are the ones ADR-0010 decided on.

The trade-off is worth stating plainly: EAS is a third party, and the
source is uploaded to build. Nothing of it ends up *in* the app — it is
a build service, not a runtime dependency — but the self-hosted path is
the one that carries the sovereignty argument, so it should stay the one
that works.

### The checklist that matters

Ticking "it launched" is not a test. In order of what would hurt most:

1. Log an encounter, force-quit, reopen. **The entry is still there.**
   If not, the whole encryption path is broken.
2. Switch the app lock on. Leave the app to the background, come back.
   **It asks.** Try to switch the lock off — **it asks again.**
3. Take a screenshot. **Android refuses.** Open the recents switcher —
   **the tile is blank.**
4. Switch reminders on, log an encounter. Check the pending
   notification. **It names no infection.**
5. Log an encounter *before noon*. The main screen says "testable in 45
   days", not 46. That off-by-one was real until 28.08.2026.
6. Open a test entry in the timeline. It says **"self-entered"** —
   every record states where it came from.

## Structure

| Path | What |
|------|------|
| `index.ts` | Entry; installs the CSPRNG polyfill before anything else |
| `App.tsx` | Provider, onboarding (disclaimer + explicit demo-data choice), tab shell |
| `src/lib/secure-storage.ts` | Keystore-held key + AES-GCM storage adapter |
| `src/state/store.tsx` | React context around the shared core reducer |
| `src/screens/` | Dashboard (risk report), Log (encounters + tests), Settings |
| `src/lib/app-lock.ts` | Device authentication for the app lock |
| `src/lib/reminders.ts` | Local notifications for closing windows |
| `src/ui.tsx` | Minimal UI kit; the palette comes from core (ADR-0015) |
