# Versions-Update — sexdiary

*Briefing fuer eine eigene Claude-Code-Sitzung in diesem Repo. Angelegt 26.08.2026.
Nach erledigtem Update loeschen.*

## Auftrag

Dieses Repo hat als einziges der bagruber-Familie **einen echten Versionskonflikt**,
keine blosse Drift. Er muss aufgeloest werden, bevor das Repo auf pnpm kann.

**Welle 4 von 4 — zuletzt.** Welle 1 (TypeScript ~7.0.2) und Welle 2 (Vite ^8.2.2 mit @vitejs/plugin-react ^6.1.0) sind am 26.08.2026 in zwoelf anderen Repos erledigt; sexdiary war nicht dabei, weil es noch auf npm liegt. Achtung: plugin-react muss mit Vite 8 zwingend auf 6.x, 4.x ist inkompatibel. Welle 1 (TypeScript ~7.0.2, @types/node ^26.3.0) ist am 26.08.2026 in dreizehn anderen Repos erledigt; sexdiary war nicht dabei, weil es noch auf npm liegt. Alle anderen Repos sind vorher dran, weil sie einfacher
sind und das Muster etablieren.

## Der Konflikt

| Paket | apps/web | apps/mobile |
|---|---|---|
| react | `^18.3.1` | `19.1.0` |
| @types/react | `^18.3.12` | `~19.1.0` |
| typescript | `^5.6.3` | `~5.9.2` |
| vite | `^5.4.11` | — (Expo/Metro) |

`apps/mobile` haengt an React 19, weil React Native 0.81.5 das verlangt. `apps/web`
steht auf React 18. Das ist kein Versehen, sondern zwei Pakete mit unterschiedlichen
Anforderungen im selben Workspace.

**npm hat den Konflikt verdeckt**, indem es `@types/react` 18.3.29 nach root gehoistet
und mobile seine 19.1.17 verschachtelt gelassen hat. Ob web oder mobile gewinnt, war
Zufall der Hoisting-Reihenfolge.

**pnpm isoliert korrekt** — und dann sehen die Typen von `lucide-react` React 19,
waehrend `apps/web` gegen React 18 kompiliert. Ergebnis: `TS2786 — 'Icon' cannot be
used as a JSX component`. Das ist mit keiner pnpm-Einstellung zu loesen, auch nicht
mit `node-linker=hoisted` (beides am 26.08.2026 erfolglos versucht).

## Aufgabe

`apps/web` auf React 19 ziehen, damit der ganze Workspace eine React-Major hat:

| Paket | Ist (web) | Ziel |
|---|---|---|
| react / react-dom | `^18.3.1` | `^19.2.x` |
| @types/react | `^18.3.12` | `^19.2.x` |
| typescript | `^5.6.3` | `~7.0.2` |
| vite | `^5.4.11` | `^8.2.2` |

`packages/core` hat kein React und braucht nur `vitest ^2.1.8 -> ^4.1.x` und `typescript ^5.6.3 -> ~7.0.2`.
`apps/mobile` bleibt unangetastet — Expo gibt die Versionen vor.

## Danach: zurueck auf pnpm

Sobald der Workspace eine React-Major hat, kann das Repo auf pnpm. Die Schritte sind
am 26.08.2026 einmal durchgespielt worden und funktionieren bis auf den Typkonflikt:

1. `pnpm-workspace.yaml` im Root anlegen:
   ```yaml
   packages:
     - 'packages/*'
     - 'apps/*'
   ```
2. `workspaces` aus der root-`package.json` entfernen — pnpm liest das Feld nicht.
3. Root-Scripts von `npm run X -w @sexdiary/web` auf `pnpm --filter @sexdiary/web X`
   umstellen (bzw. `pnpm -r --if-present typecheck` fuer typecheck).
4. **Wichtig:** in `apps/web` und `apps/mobile` die Referenz
   `"@sexdiary/core": "*"` auf `"@sexdiary/core": "workspace:*"` aendern. Mit `*`
   sucht pnpm im Registry und bricht mit
   *"@sexdiary/core is not in the npm registry"* ab.
5. `rm -rf node_modules apps/*/node_modules packages/*/node_modules package-lock.json`
6. `pnpm install`, dann ggf. `pnpm approve-builds esbuild`.

Expo/Metro reagiert empfindlich auf pnpms strikte Struktur. Falls `apps/mobile`
danach nicht startet: `node-linker=hoisted` in einer `.npmrc` im Repo-Root ist der
dokumentierte Ausweg und erhaelt den Speichervorteil (Store und Hardlinks bleiben,
nur das Layout wird flach).

## Verifikation

```bash
pnpm run build     # baut apps/web
pnpm run test      # 45 Tests in packages/core, muessen alle gruen bleiben
```

Zusaetzlich `apps/mobile` mindestens einmal starten — der Web-Build sagt nichts
darueber aus, ob Metro den Dependency-Baum aufloesen kann.

## Ausgangslage

Stand 26.08.2026 ist das Repo **auf npm zurueckgesetzt**, Working Tree sauber,
`pnpm run build` gruen, 45/45 Tests gruen. Von diesem Stand aus starten.
