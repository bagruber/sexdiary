# ADR-0004 — React Native statt zweier nativer Codebasen

**Status:** angenommen · 10.07.2026

## Kontext

Die App braucht Android und iOS. Sie braucht Zugriff auf Plattform-Keystore,
Biometrie, Kamera, lokale Benachrichtigungen und Screenshot-Sperre. Und sie
muss die Gesundheitslogik aus ADR-0002 unveraendert mitbenutzen.

Entwicklungskapazitaet: eine Person.

## Entscheidung

React Native, verwaltet ueber Expo, in TypeScript. Der geteilte Kern wird
unveraendert importiert.

## Konsequenzen

**Positiv**

- Eine Implementierung der Gesundheitslogik fuer beide Plattformen. Das ist das
  eigentliche Argument — nicht Entwicklungsgeschwindigkeit, sondern eine
  einzige pruefbare Wahrheit.
- Native Bedienelemente, keine Webansicht.
- Zugriff auf Keystore, Biometrie, Kamera, Benachrichtigungen ueber gepflegte
  Module.
- Bau lokal moeglich, ohne Cloud-Dienst.

**Negativ**

- Abhaengigkeit vom Versionsrhythmus des Rahmenwerks. Der Sprung ueber drei
  Generationen am 27.08.2026 zeigt, dass das Arbeit erzeugt.
- Die Plattform gibt Versionsstaende vor, die mit der repositoryuebergreifenden
  Vorgabe kollidieren koennen. Geloest ueber eine Ausnahmeliste.
- Eine zusaetzliche Abstraktionsschicht zwischen Code und Plattform.

## Verworfene Alternativen

**Flutter oder zwei native Codebasen.** Haetten Risikologik und Uebersetzungen
in einer zweiten Sprache dupliziert. Zwei Implementierungen derselben
Gesundheitsaussagen sind bei einer Person Entwicklungskapazitaet nicht
synchron zu halten — und die Pruefgeschichte waere deutlich schwaecher.

**Webansicht-Verpackung.** Schwaechste Sicherheitslage und schwaechste
Plattformanbindung. Genau die Grenzen, an denen ADR-0001 den reinen Webweg
verworfen hat.
