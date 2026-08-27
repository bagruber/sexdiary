# Risikomodell — Herkunft jeder Zahl

**Stand:** 27.08.2026 · **Status:** belegt, wo belegbar; sonst ausdrücklich
als Schätzung markiert

Die App rechnet mit rund 120 medizinischen Zahlen: Übertragungswahrscheinlichkeiten
je Akt, Kondom-Wirkfaktoren, diagnostische Fenster, Prophylaxe-Faktoren.
Bisher stand keine davon mit einer Quelle im Code. Dieses Dokument holt das
nach — und macht dabei sichtbar, wo es *keine* Quelle gibt.

## Wie dieses Dokument zu lesen ist

| Kennzeichen | Bedeutung |
|---|---|
| **belegt** | Der Wert entspricht einer benannten Veröffentlichung. |
| **abgeleitet** | Aus einer benannten Quelle hergeleitet, aber nicht wörtlich darin. |
| **Schätzung** | Plausibel, aber **keine Per-Akt-Literatur gefunden**. Fachlich zu prüfen. |
| **Befund** | Der Wert ist vermutlich fachlich falsch. Nicht geändert — siehe Abschnitt 7. |

Die Werte stehen in `packages/core/src/stis.ts` (`STI_DB`) und
`packages/core/src/risk.ts` (Prophylaxen).

> Die Angaben hier sind aus der Literatur zusammengetragen und **nicht
> ärztlich geprüft**. Vor einer Erprobung mit echten Nutzerinnen und Nutzern
> muss eine infektiologisch qualifizierte Person das Modell abnehmen. Das gilt
> besonders für die vier Befunde in Abschnitt 7.

## 1. HIV, Übertragung je Akt — belegt

Die vier Hauptwerte decken sich **exakt** mit der maßgeblichen Metaanalyse.

> Patel P, Borkowf CB, Brooks JT, Lansky A, Mermin J. *Estimating per-act HIV
> transmission risk: a systematic review.* AIDS. 2014;28(10):1509–1519.

| Akt | Code | Patel et al. (je 10 000 Expositionen) |
|---|---|---|
| rezeptiv anal | `0.0138` | 138 |
| insertiv anal | `0.0011` | 11 |
| rezeptiv vaginal | `0.0008` | 8 |
| insertiv vaginal | `0.0004` | 4 |

**Ausnahme oral.** Der Code führt `0.00002` rezeptiv und `0.00001` insertiv.
Patel et al. geben für Oralverkehr *keinen Punktschätzer* an, sondern „low“ mit
einer Spanne von 0 bis 4 je 10 000. Die Werte im Code liegen unterhalb der
Auflösung der Quelle. Sie sind also **eine eigene, konservative Setzung** — das
ist vertretbar, darf aber nicht als Literaturwert ausgegeben werden.

## 2. Kondom-Wirkfaktoren — teils belegt, überwiegend Schätzung

Der Faktor `c` ist die relative Risikoreduktion bei Kondomgebrauch;
gerechnet wird `rate = p × (1 − c)`.

| STI | `c` | Einordnung |
|---|---|---|
| HIV | 0,8 | **belegt.** Weller S, Davis K. *Condom effectiveness in reducing heterosexual HIV transmission.* Cochrane Database Syst Rev. 2002;(1):CD003255 — rund 80 % Reduktion der HIV-Inzidenz bei konsequentem Gebrauch. |
| Gonorrhoe, Chlamydien (penetrativ) | 0,9 | **Schätzung.** Keine Per-Akt-Zahl gefunden. |
| Gonorrhoe, Chlamydien (oral) | 0,7 | **Schätzung.** |
| Syphilis | 0,5 | **abgeleitet.** Niedriger angesetzt, weil Kondome nur den bedeckten Bereich schützen und der Primäraffekt außerhalb liegen kann. Die Richtung ist fachlich korrekt, die Höhe ist gesetzt. |
| HSV-2 | 0,2–0,3 | **abgeleitet**, gleiche Begründung wie Syphilis. |
| Hep B | 0,85 | **Schätzung.** |
| Mpox | 0,3–0,4 | **Schätzung.** Übertragung überwiegend über Hautkontakt, den ein Kondom nicht abdeckt. |

## 3. Prophylaxen — belegt mit Vorbehalt

**Doxy-PEP** (`risk.ts`): Faktor `0.25`, also 75 % Reduktion, für Gonorrhoe,
Chlamydien und Syphilis innerhalb von 72 Stunden.

> Luetkemeyer AF, Donnell D, Dombrowski JC, et al. *Postexposure Doxycycline to
> Prevent Bacterial Sexually Transmitted Infections.* N Engl J Med.
> 2023;388(14):1296–1306.

Die Größenordnung stimmt, der **einheitliche Faktor stimmt nicht**: Die
Reduktion fiel je Erreger deutlich unterschiedlich aus und war bei Gonorrhoe am
schwächsten. Ein Faktor je Erreger wäre näher an der Studie. Die genauen Werte
sind vor einer Änderung nachzuschlagen.

**PrEP** (`risk.ts`): ab sieben Tagen nach Beginn wirksam, danach wird die
Begegnung vollständig aus der HIV-Bewertung genommen. Zwei Vorbehalte:

- Die **sieben Tage gelten für rezeptiven Analverkehr.** Für vaginale
  Exposition setzen die Leitlinien einen deutlich längeren Vorlauf an. Der Code
  unterscheidet nicht.
- **Vollständige Suppression ist zu stark.** PrEP ist bei guter Adhärenz sehr
  wirksam, aber nicht 100 %. Die App zeigt die Begegnung immerhin als
  `prepExcluded` weiter an, statt sie zu verschweigen — die Bewertung selbst
  behandelt sie aber als risikofrei.

## 4. Diagnostische Fenster (`wd`) — die Kernzahl der App

Das ist die Zahl, für die es diese App gibt: ab wann ein Test aussagekräftig
wird. Entsprechend schwer wiegt jede Ungenauigkeit.

| STI | `wd` | Einordnung |
|---|---|---|
| HIV | 45 | **belegt.** Der Labortest der 4. Generation (Antigen/Antikörper) erfasst nach CDC die meisten Infektionen 18–45 Tage nach Exposition. 45 ist das konservative Ende — richtig gewählt. |
| Gonorrhoe | 7 | **Befund, optimistisch.** NAAT wird üblicherweise ab 1–2 Wochen angesetzt. 7 Tage ist das äußerste untere Ende. |
| Chlamydien | 14 | **abgeleitet**, im üblichen Bereich. |
| Syphilis | 21 | **Befund, optimistisch.** Die Serologie wird typischerweise 3–6 Wochen nach Primäraffekt positiv; Leitlinien empfehlen Nachtestung nach 6 und 12 Wochen. Bei 21 Tagen meldet die App „testbar“, während ein negativer Befund noch wenig aussagt. |
| Hep B | 45 | **Schätzung**, im plausiblen Bereich (HBsAg ab etwa 4 Wochen). Ein sicherer Ausschluss braucht deutlich länger. |
| **HSV-2** | **16** | **Befund, zu kurz.** Die IgG-Serokonversion dauert typischerweise 3–12 Wochen. Bei 16 Tagen sagt die App „jetzt testbar“, obwohl ein negatives Ergebnis nichts ausschließt. |
| **Mpox** | **21** | **Befund, begrifflich falsch.** Mpox wird per PCR aus Läsionsmaterial diagnostiziert. Es gibt kein serologisches Fenster, das ablaufen müsste — es gibt eine Läsion oder keine. Die Fensterlogik trifft hier ins Leere. |

## 5. Übertragung je Akt, alle außer HIV — Schätzung

Für Gonorrhoe, Chlamydien, Syphilis, Hep B, HSV-2 und Mpox ließ sich **keine
Per-Akt-Literatur finden**, die die Werte im Code stützt. Sie sind plausibel
gereiht — rezeptiv über insertiv, anal über vaginal über oral — aber die
absolute Höhe ist gesetzt.

Praktisch wiegt das weniger schwer, als es klingt: Die App zeigt dem Nutzer
**keine Prozentzahl**, sondern eine Stufe (`RiskLevel`) und ein Fenster. Die
Ordnung der Werte trägt die Aussage, nicht ihr Betrag. Das sollte so bleiben —
eine ausgewiesene Prozentzahl würde eine Genauigkeit behaupten, die es nicht
gibt.

**Ein Wert fällt auf.** Hep B, rezeptiv anal, steht bei `0.37`. In der Literatur
begegnet 37 % als Risiko nach **Nadelstichverletzung** durch eine HBeAg-positive
Quelle. Das ist ein anderer Übertragungsweg. Der Verdacht ist nicht bewiesen,
aber die Zahl sieht aus wie eine belegte Größe am falschen Ort — und sie erzeugt
heute die Stufe `very_high`.

## 6. Was keine Quelle hat und auch keine bekommt

- **`HIGH_PREVALENCE`** — Länderlisten, die den Hinweis „erhöhte Prävalenz“
  auslösen. Ohne Quelle, ohne Stand, ohne Kriterium. Sie steuern eine Anzeige,
  die der Nutzer als Faktum liest. Entweder auf eine datierte Quelle stellen
  (UNAIDS, ECDC, RKI) oder streichen.
- **Symptomlisten** — je Krankheit genau drei Einträge. Der Inhalt wurde einer
  Form angepasst statt der Krankheit; als Muster bereits in `notes/05`
  festgehalten.
- **`RISK_ORDER` und die Stufen `r`** — eine interne Ordinalskala, keine
  medizinische Größe. Braucht keine Quelle, sollte aber auch nicht wie eine
  aussehen.

## 7. Was daraus folgt

Nichts an den Zahlen wurde für dieses Dokument geändert. Das ist Absicht: ein
medizinisches Modell aufgrund einer Literaturrecherche zu verstellen wäre
derselbe Fehler wie es ohne Quellen zu schreiben — nur schwerer zu bemerken.

Vier Punkte sind vor einer Erprobung zu klären, in dieser Reihenfolge:

1. **HSV-2 und Mpox.** Beide melden „testbar“ zu einem Zeitpunkt, an dem ein
   negatives Ergebnis nichts wert ist. Das ist der Kernnutzen der App, der dort
   falsch abbiegt.
2. **Syphilis und Gonorrhoe** auf das konservative Ende der Spanne setzen, wie
   es bei HIV bereits geschieht.
3. **Hep B, rezeptiv anal `0.37`** auf seine Herkunft prüfen.
4. **`HIGH_PREVALENCE`** belegen oder entfernen.

Alle vier gehören einer Infektiologin vorgelegt, nicht von der Entwicklung
entschieden.
