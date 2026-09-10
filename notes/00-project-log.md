# Project log

Reverse-chronological decision log. Read this first each session; append
before ending one. `docs/` is GitHub Pages build output — notes live here.

## 2026-09-10 (latest) — The information page became the pitch

Benedict's call: the pitch does not get its own artifact. It *is* the page that
GitHub Pages serves at `index`. One surface, one source, and whoever gets shown
it can read it again afterwards without a deck being mailed around.

That decision costs something and it is worth naming: a pitch has a slide
saying what the speaker wants out of the meeting, and a public page cannot
carry that. What replaces it is the "Klare Augen" section, which now names the
open questions by group — medical, legal, operational, effect.

**Structure, in the order a reader meets it.** Two flows before any feature
list: Julia, who wants to reach someone she does not want to see again, and
Max, who exchanges nothing but a random number off an NFC card. Then the three
motives the flows demonstrate, then the modules split into the three that make
it a product and the eight that come after, each with its actual state. Then
architecture, the server, and what is unresolved.

**The conflict that had to be decided before writing.** The brief listed
notification *by phone number* under the base functions. ADR-0008 rejects
exactly that in its list of discarded alternatives, and the May pitch still
carried it — the ADR closed the path in July without the pitch following. It is
now a **Sollfunktion marked "rechtlich ungeklärt"**, and the Julia flow says so
at the step where it breaks: her story does not complete today. Showing that
gap is worth more than a story that quietly assumes the unresolved part.

The precise objection, which the page states: the service would see a phone
number, would have to hand it to a delivery provider, and the recipient
consented to none of it. That is three separate problems, not one.

**Two diagrams, written by hand.** A library would be a third-party script, and
this page loads nothing. Data flow first — the asymmetry between one thick box
on the device and one thin box on the server *is* the argument, so the boxes
are sized to it. Layers second, with `@sexdiary/core` as the inverted band: the
audit surface is the one thing worth making unmissable. Both carry a
`role="img"` label and the prose beside them says the same thing; nothing is
lost when the SVG is not seen.

Checked by rendering, not by counting tags — headless Chrome, both themes.
That caught the thing a build never would: three-sentence bold lead-ins in the
flows read as block text. Each step is one short sentence now, with the detail
underneath.

**A finding while writing the module states.** `verifySignedResult` exists in
core and is tested, and **no app calls it**. The scanner reads QR codes and
imports them unverified. The page says so rather than claiming a signature
check that does not happen; `OFFENE-PUNKTE.md` was stale on this and is
corrected.

Status markers stay neutral, no semantic colour. "gebaut" in green and
"ungeklärt" in red would be the risk scale used where it means nothing —
in this app that scale means infection risk (ADR-0015).

Green: lint, 115 tests, three typechecks, build. `.gegenueber` was removed from
`info.css`; the rewrite orphaned it.

---

## 2026-09-10 — The app ran, and wave 3 caught up with the web prototype

**The oldest open point is closed.** The app ran on a device on 09.09.2026,
first time since it was written in July. Lock, disguise mode and the
notification permission all work. What the run exposed was not a bug but a
shape: the native app was an *unfinished port* of the web tracker. The data
model could do everything; the surfaces were missing.

That framing drove most of this session.

---

**Getting a build at all took three findings**, none of them about the app.
`executionHistory.bin` failing reads like a Gradle bug and was a full disk. The
JDK is the one bundled with Android Studio; there is no standalone one on this
machine. And the real blocker: Windows caps paths at 260 characters, CMake
3.22.1 encodes the absolute source path into the object path, and a codegen file
under `react-native-safe-area-context` came out at 396. CMake **3.31.6** hashes
that segment instead. Two things that look like fixes are not, both measured:
moving the repo somewhere shallow (still 308) and enabling Windows long paths
(the ninja in 3.22.1 has no `longPathAware` manifest). The recipe is in
`apps/mobile/README.md`.

`nodeLinker: hoisted` came out of the same hunt and is now in
`pnpm-workspace.yaml`. It cut the longest source path from 293 to 213. The
lockfile did not move — a layout change, not a version drift, so no other repo
pays for it. Worth knowing: the hoisted layout is the family that caused the
duplicate-React crash in August, so the runtime probe matters more, not less.
Checked after the switch: exactly one React copy.

---

**The web tracker is now a demo that stores nothing.** ADR-0001 left its fate
open and recommended retirement; Benedict chose the labelled demo, because
whoever gets a demonstration does not install an APK in the same moment. What
separates it from a second product is not the banner but that state lives in
the tab and a reload starts over. A banner people can close is a banner people
close.

Verifying that found a leftover: `lib/mock-server.ts` still wrote to
localStorage, and a row there pairs a recipient token with an infection name —
exactly the trace this product exists not to leave. In memory now. The built
bundle contains no `localStorage` at all.

**The information page exists**, at `index`, with the tracker moved to
`demo.html`. It follows the concept presentation of 21.05.2026: three gaps, two
functions, "Lokal denken, minimal zentralisieren", "Klare Augen". It is
rendered at *build* time — a page carrying an Impressum that needs JavaScript to
show anything shows nothing without it. That is what `render()` without a DOM
was always for; the design page claimed the ability and never used it.

Two things the page deliberately does not do: name the diagnostic windows (five
values are under clinical review; two would say "testable" too early), and
invent an Impressum. Both stand as visible placeholders.

While writing it, a factual error of mine: the page claimed "no server". ADR-0008
and the pitch both describe a minimal relay. Device and server are now set side
by side.

---

**Feature parity, and then some.** Built this session: protection *per act*
(the engine always computed it, only one switch existed), onboarding with
profile, contacts and vaccinations, editing and deleting, month view, QR share
and scan, NFC cards, the alerts screen, the positive-result flow, and the
settings the web had and the app did not.

Three of those are worth remembering for the reasons rather than the feature:

- `PROTECTABLE_ACTS` is *derived* from `STI_DB`, so a corrected rate cannot
  leave the interface offering a switch that does nothing. Writing the test for
  it caught a wrong assumption of mine — kissing does transmit — and surfaced a
  **fifth** questionable value: Mpox lists a condom effect of 0.2 for kissing
  where syphilis correctly lists 0. Recorded, not changed.
- The positive-result prompt lives in the test sheet, not the shell, so it
  fires no matter which way the result arrived. Checking that found that the QR
  import would have skipped it — the very path the pitch advertises.
- Deleting a contact takes their token, and with it any chance of notifying
  that person anonymously. The confirmation says so.

**Schema v4** adds `alerts`: who was told about which finding, and how.
"Personal" is not a second-class channel; it is often the better one. The reply
vocabulary follows ADR-0011, not the older web mock.

**Backup, first leg** (ADR-0009): an encrypted file, scrypt over a passphrase,
AES-256-GCM — the cipher already used at rest, rather than a second scheme to
review. N = 2^15 is *below* the usual recommendation and chosen for older
phones; the parameters travel inside the file so the cost can be raised without
orphaning old backups. Cloud backup is still open, and it is the leg that
actually removes the data-loss cliff.

---

**Look and feel.** The neutrals were purple throughout and read as generic;
they are on petrol now, in the same range as the concept presentation, so
presentation, site and app speak one language. Contrast was computed before the
change, not checked after. **Atkinson Hyperlegible** is bundled at last — the
condition was always shipping the files rather than linking them. React Native
does not inherit `fontFamily` and Android will not synthesise bold for a bundled
face, so `Text` in `ui.tsx` sets both; the screens import it from there. Fourteen
import lines instead of 147 elements.

**Navigation, decided after the functions existed rather than before:** Heute ·
Kalender · Melden, with two actions centred above the bar. Settings sit behind a
gear. Melden carries alerts *and* contacts. One objection of mine stands
recorded in `OFFENE-PUNKTE.md`: two equally sized round targets side by side get
confused, and here one creates an entry while the other opens the camera.

---

**Decided, and it shapes wave 5:** the Hostinger plan is **shared**, so the
relay is PHP with MySQL, not a Node service. For `{token, pathogen, timestamp}`
and three operations that is no loss, and a readable PHP file is easier to audit
than a serverless function. Docker, own ports and background processes are out,
which also touches ADR-0012. A pseudonymised token **may** sit on the server for
the prototype; the legal question stays open beyond it.

---

**What a next session should know.** `OFFENE-PUNKTE.md` is current and is the
place to start. The relay is the only substantial thing still missing — the
anonymous notification path visibly waits on it, and so do the ADR-0011
replies. Everything else is either a decision for Benedict (own keystore,
licence, Impressum data, the clinical review of five values) or small.

Three things exist only as claims until someone looks at a phone: whether
`qrcode` survives at runtime, whether the 447 views of a handle QR stutter, and
whether the calendar markers in three greys read at all.

Also unmerged: 30 commits on `refactor/wellen-0-bis-3`, PR #1. CI has been green
throughout, including the `docs/` comparison that was unverified for weeks.
GitHub Pages still serves the old, persisting tracker from `main` — deliberately,
until that merge.

---

## 2026-08-28 — Design-system page, and half of wave 3

**The design-system page.** Benedict asked for the design system to be visible
on the web presence, as part of a small doc — for showing, not necessarily for
the public. It lives at `docs/design.html`: a second Vite entry, `noindex`,
linked from nowhere. It shares nothing with the tracker but the build, so it
survives wave 4.

The point of it is that it writes nothing down. Colours, levels and contrast
figures come out of `@sexdiary/core` at runtime and are computed with the same
`contrast()` the test uses — which is now exported from core rather than living
in the test file, since two callers need the same arithmetic.

`page.ts` has no DOM and no stylesheet import, so the page can be rendered
outside a browser and actually looked at. That paid off immediately: the brand
tile labelled "So nicht" showed **9.93:1** in the dark theme — a pass. Munich
yellow is perfectly readable on a dark ground; the contrast failure only
happens on light. The tile is pinned to the light background now, and the
section says which argument actually carries: yellow already means "elevated"
on the risk scale, so a button in it would look like a warning in either theme.

---

**Wave 3, three features and a half.**

**The lock was simulated and is not any more.** It used to be a four-digit code
the app kept in its own data — inside the very blob it was supposed to protect.
Authentication is the device's job now: biometrics where enrolled, the device
PIN or pattern otherwise. `prefs.lockPin` is gone at schema v3.

The migration was worth thinking about: anyone who had a PIN wanted a lock, so
it carries over as `lock: true` rather than quietly unlocking an app somebody
had deliberately protected. Three tests, checked by switching the migration off
and watching them go red.

Two lying switches became true in the process. `prefs.lock` had no reader
(finding 1.4); it has one now, and it refuses to switch on when the device has
no unlock configured — otherwise it would be the same lie in a new coat.
Switching it *off* is authenticated too, or the lock only defends against
someone who cannot find the settings screen. `prefs.notifs` had no reader
either; it has one now, and it asks the OS before it promises anything.

Both switches are gone from `apps/web`. What they promise, a browser cannot
deliver (ADR-0001).

**Screen capture**: FLAG_SECURE on Android, which also blanks the recents tile.
iOS has no equivalent, so the app covers itself when it stops being frontmost.
Locked on `background`, covered on `inactive`, and no grace period — the
attacker in this threat model is standing next to you.

**Reminders.** The decidable half is in core and tested: `reminderSchedule`
derives from the same report the screen shows which day which windows close,
grouped by date. Seven notifications on one morning is how a health app teaches
people to switch notifications off.

The wording is the security-relevant part, and it is deliberately empty: a
notification is rendered on the lock screen, in front of exactly the person
ADR-0001 is about. It names no infection, no count, no date. The settings
screen says so, rather than leaving the user to work it out.

**A real bug fell out of this.** A test broke when the session crossed
midnight — and the reason was not the test. `calcRisk` measured "days since
exposure" by dividing elapsed milliseconds, while dates in this app are days
anchored at noon. Demonstrated rather than argued:

    encounter logged today at 00:02
    days = -1, wPct = -0.022
    "testable in 46 days" for a 45-day window

Anyone logging an encounter before noon saw a negative progress bar and a
window one day too far away. `daysBetween` counts calendar days now, which also
survives the two clock changes a year.

**Signed results.** The interface spec left the signature scheme open; it is
Ed25519, encoded JWS-style as `SXD1.<base64url payload>.<base64url signature>`,
signing the *encoded* payload segment byte for byte. That removes
canonicalisation from the verifying side entirely — there is exactly one byte
sequence to check and it is the one that arrived.

The signature check is injected, not implemented: core has no runtime
dependencies and Ed25519 is not something to hand-roll. What core owns is
everything that decides the outcome. base64url and UTF-8 are hand-written for
the same reason — `btoa` is missing from some React Native runtimes and
`Buffer` is Node-only.

Tested against real Ed25519 from `node:crypto`, because a stub would only prove
the stub was called. Both the signature check and the padding check were
removed on purpose to confirm the tests notice.

Also answered: ADR-0007's open question about expired keys. A key still
verifies what it signed while it was valid — compared against the *sample*
date. Otherwise a routine rotation would void everyone's stored history.

The part that matters most is the cheapest: the timeline now labels every
record "self-entered" or "signed by X". Per the ADR that is the larger half of
the trust gain, and it works today, before a single test centre takes part.

**Not built, and deliberately so.** The camera screen and the on-device
verifier — unused crypto is worse than none. Backup (ADR-0009) and distribution
(ADR-0010). And the key is *not* bound to authentication: Android discards it
when enrolled biometrics change, which without a backup is a data-loss trap.
That is why backup comes first in the next block of work.

**The thing that has not changed since 10 July:** none of this has run on a
phone. 104 tests, three typechecks, lint, `expo-doctor` 21/21 and a Metro
export say the code is coherent. They say nothing about whether the lock holds
across backgrounding or whether a reminder fires on the right morning.

## 2026-08-27 — Wave 2 shipped: tokens, a real package, lint, CI, sources

All five items. Nothing in this entry was decided by looking at code and
guessing; each has a number behind it.

**Colour tokens, decided and computed** (ADR-0015). Two scales that never
touch: one interaction colour plus neutrals, and a separate semantic scale for
the risk rating. Three values changed, each because the arithmetic said so:

- `warn` light `#B7791F` → `#8C6208`. The old one was **3.29:1** against the
  background — it failed as text. That was R16, sitting on the list.
- `bad` dark `#E06A5A` → `#E87A6A`. At 4.96:1 on card it was the weakest of
  the three semantic colours, which means the *most severe* level was the
  least legible.
- `good` light `#2E7D52` → `#2B7A4E`. 4.54 passes only on the second decimal.

The three now sit at 4.74 / 4.90 / 4.91 on light — equal weight, so no level
shouts louder for being accidentally darker.

**The web tracker's seven-step risk ramp turned out worse than its
reputation.** Six of seven values below 3:1 on light, and on dark `very_high`
was the *weakest value in the whole ramp* at 3.19:1. Seven levels now map onto
four colours; the level name is the discriminator. `apps/web` takes only
`riskColor` from core and keeps its own palette — its accent is teal, and
recolouring an app that wave 4 replaces would be a redesign, not a refactor.

`packages/core/test/tokens.test.ts` recomputes every pair against both grounds
of its theme. Checked that it is not vacuous: with the old warn value it fails
at exactly 3.29.

**Core is a package now, not an alias.** It had `main: src/index.ts` plus three
aliases — vite config, web tsconfig paths, mobile tsconfig paths. `exports`
points at `dist`, built with **NodeNext** resolution, which is the only setting
that proves the output resolves outside a bundler. Relative imports carry `.js`
now; doing that surfaced `./i18n` as a *directory import*, which would never
have worked in Node. Verified by actually loading it: `node -e "import('./packages/core/dist/index.js')"`
gives 47 exports.

The dev loop cost was real, and Benedict framed the answer well — whatever is
easier for whoever maintains this in Munich. The worst failure mode for a
newcomer is the silent one: change core, nothing happens. So `pnpm dev` starts
the core watch and the dev server together via `pnpm --parallel`, no extra
dependency, one command.

**FONT removed, 91 sites.** It pointed at DM Sans, deleted in July for the
Google Fonts request. One correction to `notes/05`: "not a pixel changes" was
not quite right — `input`, `select` and `textarea` do **not** inherit
`font-family` from `body`, so removing the inline value would have handed them
to the browser's default form font. The existing `button` rule in `global.css`
now covers them. Bundle 454.43 → 451.54 kB.

**Lint and CI.** ESLint 10 flat config in the same ranges as freshdoc and
freshpost, so the three repos share one copy in the store; the targets are in
`hausbasis/baseline.json` now. Three zones rather than one config for
everything — and the middle one is the interesting part: **`packages/core` may
not import anything non-relative.** That is ADR-0002 as a rule instead of an
intention. Plus a test that goes red the moment core takes a dependency, which
`notes/05` 6.5 had asked for. Both were verified by breaking them on purpose.

The first lint run found eight errors. `App.tsx` held an effect that could
never do anything (`locked` is only read as `locked && hasPin`).
`ExplainSheet` imported `Pressable` and `ACT_KEYS` without using either, both
predating this wave. `index.ts` suppressed a rule that no longer exists. The
React rules apply to `apps/mobile` only — no new React is written in
`apps/web`, and rewriting its effects would be work on code that is going away.

**Sources on the medical numbers — and this is the part that grew.** The HIV
per-act values match Patel et al. 2014 *exactly* (138/11/8/4 per 10 000). The
condom factor for HIV is Weller & Davis, Cochrane 2002. Doxy-PEP is Luetkemeyer
et al. 2023. The 45-day HIV window is the conservative end of the CDC range.

Everything else is marked as an estimate rather than dressed up as sourced —
including the HIV oral values, for which the meta-analysis gives no point
estimate at all.

**Four findings came out of the search, and two of them matter:**

- **HSV-2, window 16 days.** IgG seroconversion takes 3–12 weeks. The app says
  "testable now" where a negative rules nothing out.
- **Mpox, window 21 days.** Mpox is diagnosed by PCR from lesion material.
  There is no serological window to wait out — the logic is answering a
  question that does not arise.
- Syphilis 21 and gonorrhoea 7 sit at the optimistic end of their ranges while
  HIV sits at the conservative end.
- Hep B receptive anal `0.37` looks like the **needlestick** figure. Different
  route, and it produces `very_high` today.

None of them were changed, on Benedict's decision and with the reasoning in
`architecture/risikomodell-quellen.md` section 7: adjusting a medical model
from a literature search is the same mistake as writing it without sources,
only harder to notice. These belong in front of an infectious-disease
clinician. It is the app's core promise that bends in the wrong place here.

**Next up:** wave 3 — mobile becomes the product. Real lock, screenshot
blocking, reminders, signed QRs, backup, distribution. And the app has still
never run on a device.

## 2026-08-27 — Data-architecture additions, UI direction, design tokens

Three additions from Benedict, each with a consequence beyond the feature —
plus a UI direction decision and a first look at a proposed palette.

**ADR-0011, feedback from the notified contact.** This contradicts ADR-0008,
where "no reply from the recipient" stood as a deliberate gap. That reasoning
was too short: a reply channel needs no sender *identity*, only a sender
*address*, and that can be fresh per notification. So a reply is not a new
relay operation, just a notification in the other direction. Two rules are
fixed: **no automatic delivery or read receipts**, and "done" is offered
*before* "tested negative". Someone receiving an exposure notice must be able
to not answer, and the reciprocity pressure after a disclosed diagnosis is real
enough that the interface must not push toward disclosure.

**ADR-0012, result retrieval by code.** Surfaces something obvious that
ADR-0007 missed: **at the time the sample is given, there is no result.** A QR
handed over at the counter cannot contain a finding. Without a retrieval path
the whole signing feature is theoretical. The retrieval goes to the test
centre, not the operator — were the operator in the path, they would know who
tests when.

**ADR-0013, research contribution.** Pushed back on the phrasing "opt-in for
pseudonymised research data": pseudonymised is not anonymous under Art. 4 Nr. 5,
Art. 9 applies in full, and sexual-health records are exceptionally
re-identifiable. Specified instead as on-device aggregation, coarsening before
aggregation, noise **on the device** rather than at the recipient, and a
threshold before publication. Not to be built before a research partner with
ethics approval exists.

The external surface grew from three connections to six. That is recorded as
R13 in arc42 section 11, alongside R14 and R15. The threat model gained A9
(re-identification in the research contribution — the most dangerous attacker
on the list) and A10 (a found retrieval code).

**ADR-0014, main screen.** Two directions were drawn against each other and
Benedict picked **A, answer-first**; **B, the timeline, is kept as a noted
variant**, not discarded. The honest cost is in the ADR: B would have made the
diagnostic window *visible* rather than described, and position on an axis
would have been a second encoding channel alongside colour — which would have
solved the BITV "colour only" finding as a side effect. Under A that has to be
built deliberately (recorded as R17).

**Design tokens** (`architecture/design-tokens.md`, decision still open). A
palette proposal with a Munich reference was checked by computing contrast
rather than eyeballing it:

- Munich yellow cannot be the primary/CTA: **1.51–1.82:1** on light. It works
  as a *fill* with dark text (9.57:1). The heavier objection is semantic —
  yellow is already "elevated risk" on the risk scale, so CTA and warning would
  look alike in an app where colour carries the message.
- Medical Blue fails as text in dark mode (3.17–3.63:1) and pulls toward
  "medical device", the exact signal the regulatory position avoids. Safe Green
  fails on light (3.38–3.75:1), and "safe" is a state this app cannot certify.
- Found in passing: the existing warning colour `#B7791F` is **3.64:1** and
  fails as text too. Pre-existing, recorded as R16.
- Recommendation: two palettes that never touch — interaction keeps `#1F1D2B`
  (14.93:1), semantics get their own scale, Munich yellow becomes the *brand*
  colour rather than the CTA.
- Type: **Atkinson Hyperlegible throughout**. Designed by the Braille Institute
  for maximum character distinction; where BITV is an admission requirement
  that is an argument, not a style choice. Advised against Inter (named as an
  LLM tell in the working agreement, and pairing it with Roboto is duplication
  rather than a pairing) and Montserrat (the Canva default look).
- Constraint worth not losing: the app ships **no webfont** today, because
  Google Fonts was removed in July for GDPR reasons. Any of these means
  bundling the font files — never a Google Fonts link.

**Design drafts.** Eight artboards, built from the real values in
`apps/mobile/src/ui.tsx` and `theme.ts` rather than from memory. Two rendering
bugs were found and fixed only by actually rendering them — a timeline built
from per-row line segments breaks (`flex:1` grows width, not height, in a row
flex), and the absolutely positioned axis then painted over the dots. Neither
was visible in the source.

Found while rebuilding: **the app's chips are ~31px tall** (7px padding,
13px type) — below the 44px touch-target minimum. Left as-is in the drafts
because they mirror the app; belongs on the BITV list.

**New this session:** `CLAUDE.md` at the repo root, so a fresh session gets
oriented without being told. It points at the log, the open points and
`architecture/`, and carries the repo-specific rules (pnpm, hausbasis, no
third-party requests) and the verification habits this repo learned the hard
way.

**Next up:** wave 2 — design tokens into core (after the palette decision),
lint and CI, dead constants out, source citations on every medical number, and
core gets a real package entry point.

## 2026-08-27 (later) — Architecture decision: native-only, and the architecture deck

Benedict decided the shape of the product: **the native app is the product.**
Contact tracing, tests and vaccinations live only there and are stored nowhere
else. The browser gets an information site — how it works, Impressum,
Datenschutz, Teststellen — and nothing more. Backup follows the model people
already know from messengers: the user's own cloud, encrypted with a key only
they hold.

This is the right call, and the reasoning is worth recording: the realistic
threat model for this app is the person sitting next to you, and *none* of the
defences against that — screen-capture blocking, recents blurring, a
keystore-bound lock, an alternate icon, local reminders — are possible in a
browser. The web tracker could never deliver the product's core promise. Full
reasoning in `architecture/adr/0001-native-only.md`.

**What it invalidated.** A good part of the wave plan from earlier today aimed
at the wrong codebase: porting four features to web, the web demo-mode fix as
top priority, refactoring the web tracker's inline styles, and the accessibility
work on the tracker. The accessibility work moves to the info site, where it is
much cheaper — building accessible from scratch beats retrofitting a grown
tracker. `notes/05` carries an addendum rather than a rewrite, so it stays clear
what applied when.

**Wave 1 shipped: the architecture deck.** `architecture/` — deliberately not
`docs/`, which is build output. 18 files, ~1 600 lines:

- `arc42.md` — the DACH-standard 12-section architecture overview, with C4
  diagrams at levels 1–3, runtime views for the three flows that matter, and an
  honest section 11 listing twelve risks and debts including "the app has never
  run on a device" and "the app lock is simulated".
- `adr/` — ten decision records in MADR format. Six retroactively capture
  decisions from 10.07. that were only ever in the log; four are new or
  proposed. Immutable by convention: a revised decision gets a new ADR that
  supersedes the old one.
- `threat-model.md` — attacker-centric, eight attackers, with what each learns
  today versus after the planned work. Names three things explicitly *not*
  covered (compromised OS, coercion, forensics on a seized unlocked device),
  because a threat model that implies completeness gets read as a guarantee.
- `data-flow.md` — Art. 30 groundwork. Four processing activities; the operator
  appears in exactly one of them.
- `interfaces/` — the two places data crosses the device boundary, specified
  before being built.

**Verified:** 40 internal links, none dead. All 9 Mermaid diagrams actually
render — checked by injecting the mermaid UMD bundle into headless Chrome and
calling `parse` + `render` on each block. Fence balance alone proves nothing,
and a broken diagram in the flagship architecture document would be expensive
at a pitch. The check script lives outside the repo; making it a CI job in wave
2 would mean adding mermaid and playwright-core as dev dependencies, which is a
family-wide decision, not a single-repo one.

**LLM-pattern audit** (Benedict asked for it, done against the code):

- `theme/tokens.ts` exports a four-step radius scale that is imported **zero
  times**, while 57 hardcoded radii in 13 distinct values sit next to it. The
  archetypal tell: a token scale written because good code looks like that, then
  never wired up. Same file, four exports — one dead but used 91×, one entirely
  dead, two working.
- Five STIs, five symptom lists, every one exactly three entries. Content shaped
  to a template rather than to the disease. Worse than the radius scale because
  it is medical content. The transmission probabilities themselves hold up —
  the HIV per-act values match the published literature — but nothing cites a
  source, and unsourced good data looks exactly like invented data.
- Checked and clean: comments explain *why* rather than restating the line
  below; user-facing copy is terse, not hedge-stacked; no abstraction without a
  second caller.

**Also answered:** Android can be distributed to testers without going public
(self-hosted signed package as the story, store internal-testing as the tool —
ADR-0010). Hosting professionalism is a property of the deployment's shape, not
the vendor: plain Linux VM, compose file, runbook, and the deliverable is the
deployment artifact rather than the running instance. The anti-forgery QR has a
German precedent worth copying wholesale — the COVID certificate's
signed-payload-plus-trust-list, verified offline.

**Not done:** the app still hasn't run on a device. Licence still open. The web
tracker still exists and still duplicates the product — retiring it is wave 4,
and it needs a decision (recommendation: retire, don't keep as a demo; a
clickable web clone of a native app sends the wrong signal in a pitch).

**Next up:** wave 2 — design tokens into core, lint and CI, dead constants out,
source citations on every medical number, and the core gets a real package
entry point so the relay can validate against the same schemas.

## 2026-08-27 — Wave 0: version alignment, Expo 57, pnpm

Scope set by Benedict: refactor across design, usability and code quality;
think it through from the perspective of a public administration such as
Stadt Muenchen (integrability, maintainability, data protection); and pull
the versions up to `hausbasis/baseline.json` along the way. Full proposal in
`notes/05-refactor-verwaltung-2026-08.md`, written in German because most of
it concerns German administration.

**The finding that reordered everything.** The React conflict documented in
`VERSION-UPGRADE.md` no longer existed. That briefing was written when Expo
SDK 54 was current; Expo is now at 57, and React Native 0.86.3 peers on
`react ^19.2.3`. So pulling mobile to Expo 57 lands it on React 19.2.x by
itself — exactly the hausbasis target. The plan changed from "lift web to 19
and leave mobile at 19.1.0" (two minors) to "both apps on 19.2.8" (one), and
the order flipped: Expo first, then web.

Probed the one real unknown first — TypeScript 7 against React Native's type
surface, since hausbasis wants `~7.0.2` while the Expo 57 template ships
`~6.0.3`. It typechecks clean. Everything after that was mechanical.

**Shipped, all verified:**

- `apps/mobile`: Expo 54 -> 57, RN 0.81.5 -> 0.86.3, React 19.2.8, TS 7.0.2.
  `app.json` migrated to the SDK 57 schema — `newArchEnabled` and
  `android.edgeToEdgeEnabled` are gone (both defaults now), `splash` moved
  into the `expo-splash-screen` plugin block. Security settings untouched:
  `allowBackup=false`, `predictiveBackGestureEnabled=false`,
  `updates.enabled=false`.
- `expo.install.exclude` for typescript/react/@types/react. Those three
  deliberately follow hausbasis rather than the SDK template; without the
  entry `expo-doctor` reports it as an error forever.
- `apps/web`: React 19.2.8, Vite 8.2.2, `@vitejs/plugin-react` 6.1.0
  (4.x is incompatible with Vite 8), TS 7.0.2.
- `packages/core`: Vitest 4.1.11, TS 7.0.2.
- New `apps/web/src/vite-env.d.ts`. TS 7 requires a type declaration for
  side-effect imports and fails with TS2882 on the CSS import in `main.tsx`.
  The `vite/client` reference supplies it; the project never had one, TS 5
  simply didn't complain.
- Repo moved to pnpm: `pnpm-workspace.yaml`, `workspace:*` for
  `@sexdiary/core`, root scripts on `pnpm --filter`. Metro resolves fine
  under pnpm's strict layout — **no `node-linker=hoisted` needed**, contrary
  to what the briefing anticipated.
- Exception for sexdiary removed from `hausbasis/baseline.json` (uncommitted
  there). `VERSION-UPGRADE.md` deleted; its runtime-probe recipe preserved as
  the appendix of `notes/05`.

**The bug the runtime probe caught.** Build green, 45/45 tests green, three
clean typechecks — and the app still crashed in the browser the moment the
dashboard rendered: *"A React Element from an older version of React was
rendered."* npm had left `react@18.3.1` hoisted in the root `node_modules`
while `apps/web` resolved 19.2.8 locally; `lucide-react` sits in the root and
therefore pulled `react/jsx-runtime` from the 18 copy. The onboarding view
renders no lucide icons, so the crash only appeared after clicking through
it. Removing all `node_modules` and the lockfile left exactly one React copy.

This is the same hoisting pathology `OFFENE-PUNKTE.md` described in July,
surfacing at runtime instead of in the type checker. Two lessons worth
keeping: after a major version change, do a clean install rather than an
incremental one; and the runtime probe is not optional, it is the only step
that found this.

Incidental but worth noting: the web bundle hash was byte-identical between
the npm and the pnpm install (`index-Cw5IuCLi.js`) — a small piece of
evidence for the reproducible-build claim in `notes/02`, which is currently
asserted but not verified anywhere.

**Not done:** mobile still hasn't run on a device, and that now matters more
than before — three SDK majors and the New Architecture, which SDK 57 no
longer lets you turn off. Licence deliberately left open. Hostinger product
unknown, so wave 5 isn't planned in detail yet. See `OFFENE-PUNKTE.md`.

**Next up:** wave 1 of `notes/05` — the subtraction pass (dead `FONT`
constant, palette to CSS custom properties, shared design tokens, lint +
CI, `AlertTransport` interface). Highest-value single item across all waves
is in wave 2 though: the web app still seeds fabricated sexual encounters as
the default state for real users (audit Q11, fixed on mobile in July).

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
