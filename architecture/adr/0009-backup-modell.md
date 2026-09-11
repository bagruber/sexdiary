# ADR-0009 — Sicherung in die Cloud des Nutzers, Ende-zu-Ende verschlüsselt

**Status:** angenommen · 27.08.2026 · Dateiexport umgesetzt am 09.09.2026,
Cloud-Sicherung weiterhin offen

## Kontext

ADR-0003 hat einen Preis: **Geräteverlust bedeutet Datenverlust.** Für ein
Werkzeug, in dem jemand über Jahre seine Testhistorie führt, ist das auf Dauer
nicht zumutbar — und es ist der Punkt, an dem Nutzer die App verlassen.

Gleichzeitig darf die Lösung ADR-0003 nicht aufweichen. Der Betreiber darf die
Daten nicht bekommen, auch nicht verschlüsselt.

## Entscheidung

Vorgeschlagen wird das Modell, das aus verbreiteten Messengern bekannt ist:

- Die Sicherung geht in die **Cloud des Nutzers** — iCloud oder Google Drive —,
  nicht an den Betreiber.
- Verschlüsselt mit einem Schlüssel, der aus einer **Passphrase des Nutzers**
  abgeleitet wird, oder alternativ mit einem angezeigten Wiederherstellungscode.
- Der Cloud-Anbieter sieht undurchdringliche Bytes. Der Betreiber sieht nichts,
  weil er nicht beteiligt ist.
- **Ausdrücklich opt-in.** Ohne Zutun gibt es keine Sicherung.
- Klar abgegrenzt vom automatischen Systembackup, das ausgeschaltet bleibt
  (ADR-0005). Das hier ist ein bewusster, separater Kanal.

Der eigentliche Vorteil ist nicht technisch, sondern erklärerisch: Das mentale
Modell ist bereits verbreitet und lässt sich in einem Satz sagen. Auch die
unangenehme Konsequenz ist bereits bekannt — wer die Passphrase verliert,
verliert die Sicherung.

## Konsequenzen

**Positiv**

- Gerätewechsel und Geräteverlust werden überlebbar, ohne dass der Betreiber
  Daten hält.
- Keine zusätzliche datenschutzrechtliche Fläche beim Betreiber. Die
  Rechtsbeziehung besteht zwischen Nutzer und seinem Cloud-Anbieter.
- Vertrautes Modell, geringe Erklärungslast.

**Negativ**

- Verlorene Passphrase heißt verlorene Sicherung. Muss vor der Einrichtung
  unmissverständlich gesagt werden, nicht im Kleingedruckten.
- Bindet an die Cloud-Dienste der Plattformanbieter. Für Nutzer, die diese
  bewusst meiden, braucht es zusätzlich einen Dateiexport.
- Zwei Implementierungen, eine je Plattform.

## Entschieden am 09.09.2026

**Der Dateiexport kommt zuerst.** Die Empfehlung oben wird angenommen: er ist
billig, macht unabhängig, und er baut Format und Kryptographie, die die
Cloud-Variante später unverändert wiederverwendet. Das nimmt die
Datenverlust-Klippe sofort für jeden, der handelt. Der Einwand von unten bleibt
gültig — eine Sicherung, die Disziplin verlangt, existiert im Ernstfall nicht.
Das hier ist Schritt eins, nicht die Antwort.

**Schlüsselableitung: scrypt**, N = 2^15, r = 8, p = 1, 128-Bit-Salz je Datei.
Speicherhart, also nicht mit Grafikkarten breitzuwalzen, und aus derselben
geprüften Bibliotheksfamilie wie die bereits eingesetzte Chiffre — reines
TypeScript, kein nativer Code. Argon2id wäre die formal stärkere Wahl
(RFC 9106), ist in reinem JavaScript auf älteren Telefonen aber spürbar
langsam; scrypt ist ausserdem langweiliger und weiter verstanden, was bei einer
Übergabe in Jahren mehr wiegt.

N = 2^15 sind rund 32 MiB. Das ist **niedriger als die übliche Empfehlung**
(OWASP nennt 2^17 für Passwortspeicher) und bewusst so gewählt, weil 2^17 rund
128 MiB belegt und auf älteren Android-Geräten in JavaScript ein
Speicherproblem wäre. Gemessen auf dem Entwicklungsrechner: 111 ms. Auf einem
echten Gerät ist das noch nicht gemessen; die Kosten gehören dort nachgeprüft
und dann angehoben, soweit es trägt.

**Chiffre: AES-256-GCM** unter frischer 96-Bit-Nonce — dieselbe, die die App
schon im Ruhezustand nutzt. Ein zweites Verfahren einzuführen hiesse, eine
zweite Sache prüfen zu lassen.

**Format:** JSON mit selbstbeschreibendem Kopf. Jede Datei trägt ihre eigenen
Parameter, was zwei Dinge kauft: die Kosten lassen sich anheben, ohne alte
Dateien unlesbar zu machen, und wer die Datei in drei Jahren ohne die App in
der Hand hält, kann dem Kopf entnehmen, was zu tun ist. Der Container liegt in
`packages/core` und kommt ohne Abhängigkeiten aus; alles Kryptographische liegt
in der App, damit die Prüffläche des Kerns bleibt, was sie ist.

Eine falsche Passphrase und eine beschädigte Datei sind von aussen nicht zu
unterscheiden — GCM authentifiziert, mehr nicht. Die Meldung nennt deshalb
beides, statt zu raten.

**Weiterhin offen**

Die Cloud-Sicherung selbst, also zwei Plattform-Implementierungen. Und der
Umgang mit Teilwiederherstellung bei Schemadifferenz: die Datei führt die
Schemaversion mit, abgelehnt wird bisher aber nur pauschal.

## Verworfene Alternativen

**Sicherung beim Betreiber, verschlüsselt.** Technisch äquivalent sicher,
aber die Argumentation verschiebt sich von „wir haben die Daten nicht“ zu
„wir können sie nicht lesen“. Der erste Satz überzeugt eine
Datenschutzprüfung ohne Beweisführung.

**Nur Dateiexport.** Billig und unabhängig, aber niemand macht es regelmäßig.
Eine Sicherung, die manuelle Disziplin verlangt, existiert im Ernstfall nicht.
Gehört als Ergänzung dazu, nicht als einziger Weg.

**Automatisches Systembackup einschalten.** Würde Gesundheitsdaten unkontrolliert
in Plattform-Backups tragen. Widerspruch zu ADR-0005.
