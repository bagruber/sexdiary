# ADR-0014 — Hauptbildschirm: Antwort zuerst

**Status:** angenommen · 27.08.2026

## Kontext

Der Hauptbildschirm beantwortet die eine Frage, für die es diese App gibt:
*Muss ich gerade etwas tun?* Die Häufigkeitsverteilung ist extrem schief —
„bin ich okay?“ und „ich hatte Sex“ sind zusammen rund 95 % aller Öffnungen,
während „ich bin positiv, wen informiere ich?“ vielleicht nie passiert und
trotzdem der Moment ist, in dem alles zählt.

Der bisherige Aufbau — vier gleich große Tabs — behandelt vier sehr ungleiche
Aufgaben als gleichwertig.

Zwei Richtungen wurden als Entwurf gegeneinandergestellt:

- **A — Antwort zuerst.** Ein Satz in großer Type, darunter die Belege, die zu
  ihm geführt haben.
- **B — Zeitachse.** „Heute“ als feste Trennlinie; oben was war, unten was
  kommt. Diagnostische Fenster werden als Bänder sichtbar statt beschrieben.

## Entscheidung

**Richtung A** wird gebaut. **Richtung B bleibt als Variante notiert** und
liegt als Entwurf vor — sie ist nicht verworfen, nur nicht jetzt.

Struktur: eine Hauptfläche (*Heute*), eine ständig erreichbare primäre Aktion
(*Begegnung*), und alles Weitere als Ablauf, der den Bildschirm übernimmt,
wenn er dran ist — Verlauf, Erklärung, Befunde, Positiv-Ablauf, Kontakte,
Deine Daten, Einstellungen.

## Konsequenzen

**Positiv**

- Die Antwort steht vor allem anderen, ohne Scrollen und ohne Suchen. Für eine
  App, die man auch mal in der Öffentlichkeit öffnet, ist die Zeit bis zur
  Antwort ein Sicherheitsmerkmal, nicht nur ein Komfortmerkmal.
- Deutlich schneller zu bauen und schwerer falsch zu machen als B.
- Seltene, aber schwere Abläufe bekommen den ganzen Bildschirm statt eines
  Modals.

**Negativ**

- **Das diagnostische Fenster bleibt beschrieben statt gezeigt.** Es ist der
  Kernbegriff des Produkts, und B hätte ihn sichtbar gemacht.
- **Der zweite Kodierungskanal fehlt weiterhin.** In B wäre die Position auf
  der Achse eine von der Farbe unabhängige Information gewesen, womit der
  BITV-Befund „Risiko nur über Farbe“ nebenbei gelöst wäre. Unter A muss er
  eigens gelöst werden — über Textlabel und Form.

## Was mit Variante B passiert

Sie liegt als Entwurf im Design-Canvas auf einer eigenen Seite und wird nicht
gelöscht. Zwei Anlässe, sie wieder hervorzuholen:

1. Wenn sich in der Erprobung zeigt, dass Nutzer die Fensterlogik trotz der
   Erklärung nicht verstehen — dann ist „zeigen“ dem „beschreiben“ überlegen.
2. Wenn der zweite Kodierungskanal aus A sich als umständlich erweist.

## Verworfene Alternativen

**Beides bauen und A/B testen.** Setzt eine Nutzerbasis voraus, die es nicht
gibt, und verdoppelt die Pflege in genau der Fläche, die am häufigsten
angefasst wird.

**Die bestehende Tab-Struktur behalten.** Behandelt Ungleiches gleich und gibt
rund 80 px vertikalen Platz an eine Leiste ab, die zwei echte Ziele hat.
