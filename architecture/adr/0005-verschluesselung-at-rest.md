# ADR-0005 — Keystore-gehaltener Schluessel, AES-256-GCM

**Status:** angenommen · 10.07.2026

## Kontext

Die Daten liegen ausschliesslich auf dem Geraet (ADR-0003). Damit ist die
Speicherung auf dem Geraet die einzige Verteidigungslinie. Fuer Art.-9-Daten
wird Verschluesselung im Ruhezustand erwartet, nicht diskutiert.

Angreifermodelle: jemand mit dem entsperrten Geraet, jemand mit dem
ausgeschalteten Geraet, jemand mit einem Systembackup.

## Entscheidung

- Ein 256-Bit-Schluessel, erzeugt beim ersten Start aus dem Zufallsgenerator des
  Systems.
- Verwahrt im Plattform-Keystore mit der Einstellung **nur bei entsperrtem
  Geraet, nur dieses Geraet**. Damit wandert er nicht in Systembackups und nicht
  auf andere Geraete.
- Nutzdaten AES-256-GCM, verschluesselt bevor sie die Platte beruehren.
- **Systembackup ausgeschaltet.** Sicherung laeuft ausschliesslich ueber den
  bewussten Weg aus ADR-0009.

## Konsequenzen

**Positiv**

- Ein Angreifer mit dem ausgeschalteten Geraet findet nur einen Blob.
- Ein Systembackup enthaelt weder Schluessel noch lesbare Daten.
- Auf Geraeten mit Sicherheitshardware ist der Schluessel hardwaregebunden.

**Negativ**

- Geht der Keystore-Eintrag verloren — Zuruecksetzen, Deinstallation,
  Geraetetausch — sind die Daten unwiederbringlich. Genau dafuer existiert
  ADR-0009.
- Der Schutz endet am entsperrten Geraet mit geoeffneter App. Deshalb der
  App-Lock als zweite Schicht.

**Bekannte Luecke (Stand 27.08.2026)**

Der App-Lock ist **simuliert**. Eine vierstellige PIN sperrt die Oberflaeche,
leitet aber keinen Schluessel ab und ist keine Sicherheitsgrenze. Das ist in der
Oberflaeche als solches beschriftet und im Datenmodell dokumentiert. Behebung in
Welle 3.

## Verworfene Alternativen

**Nur vom Nutzerpasswort abgeleiteter Schluessel.** Staerker gegen einen
Angreifer mit dem entsperrten Geraet, aber jeder Start braucht die Eingabe, und
ein vergessenes Passwort ist endgueltiger Datenverlust. Fuer ein Werkzeug,
das man beilaeufig oeffnet, zu viel Reibung.

**Verschluesselte Datenbank statt Blob.** Der bessere Weg, sobald die Datenmenge
den Blob sprengt. Heute nicht noetig; als Aufruestpfad vorgesehen.

**Keine Verschluesselung, Verlass auf die Geraeteverschluesselung.** Bei
Art.-9-Daten nicht vertretbar.
