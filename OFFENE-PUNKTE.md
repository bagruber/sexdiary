# Offene Punkte

*Notiert am 26.08.2026 fuer spaetere Sitzungen. Erledigte Punkte bitte streichen,
nicht abhaken — die Datei soll kurz bleiben.*


## Laeuft als einziges Repo noch auf npm

Bewusst so. Der Umstieg auf pnpm wurde am 26.08.2026 versucht und wieder
zurueckgenommen, weil dieses Repo einen echten Versionskonflikt hat: `apps/web`
steht auf React 18, `apps/mobile` auf React 19 (Vorgabe von React Native 0.81).
npm verdeckte das durch Hoisting, pnpm isoliert korrekt — und dann kompilieren
die Typen von `lucide-react` gegen die falsche React-Version.

Vollstaendiger Befund und der Weg zurueck auf pnpm stehen in
`VERSION-UPGRADE.md`. Der Working Tree ist sauber, Build gruen, 45/45 Tests
gruen — von diesem Stand aus starten.

## Beim Umstieg: `workspace:*` statt `*`

Falls pnpm erneut versucht wird: `"@sexdiary/core": "*"` in `apps/web` und
`apps/mobile` muss auf `"workspace:*"`. Mit `*` sucht pnpm im Registry und
bricht mit *"@sexdiary/core is not in the npm registry"* ab. npm loest das
implizit auf, pnpm bewusst nicht.

## Nichts davon ist gepusht

Alle Aenderungen vom 26.08.2026 liegen als lokale Commits.
