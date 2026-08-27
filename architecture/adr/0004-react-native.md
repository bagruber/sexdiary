# ADR-0004 — React Native statt zweier nativer Codebasen

**Status:** angenommen · 10.07.2026

## Kontext

Die App braucht Android und iOS. Sie braucht Zugriff auf Plattform-Keystore,
Biometrie, Kamera, lokale Benachrichtigungen und Screenshot-Sperre. Und sie
muss die Gesundheitslogik aus ADR-0002 unverändert mitbenutzen.

Entwicklungskapazität: eine Person.

## Entscheidung

React Native, verwaltet über Expo, in TypeScript. Der geteilte Kern wird
unverändert importiert.

## Konsequenzen

**Positiv**

- Eine Implementierung der Gesundheitslogik für beide Plattformen. Das ist das
  eigentliche Argument — nicht Entwicklungsgeschwindigkeit, sondern eine
  einzige prüfbare Wahrheit.
- Native Bedienelemente, keine Webansicht.
- Zugriff auf Keystore, Biometrie, Kamera, Benachrichtigungen über gepflegte
  Module.
- Bau lokal möglich, ohne Cloud-Dienst.

**Negativ**

- Abhängigkeit vom Versionsrhythmus des Rahmenwerks. Der Sprung über drei
  Generationen am 27.08.2026 zeigt, dass das Arbeit erzeugt.
- Die Plattform gibt Versionsstände vor, die mit der repositoryübergreifenden
  Vorgabe kollidieren können. Gelöst über eine Ausnahmeliste.
- Eine zusätzliche Abstraktionsschicht zwischen Code und Plattform.

## Verworfene Alternativen

**Flutter oder zwei native Codebasen.** Hätten Risikologik und Uebersetzungen
in einer zweiten Sprache dupliziert. Zwei Implementierungen derselben
Gesundheitsaussagen sind bei einer Person Entwicklungskapazität nicht
synchron zu halten — und die Prüfgeschichte wäre deutlich schwächer.

**Webansicht-Verpackung.** Schwächste Sicherheitslage und schwächste
Plattformanbindung. Genau die Grenzen, an denen ADR-0001 den reinen Webweg
verworfen hat.
