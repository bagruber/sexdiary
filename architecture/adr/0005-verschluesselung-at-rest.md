# ADR-0005 — Keystore-gehaltener Schlüssel, AES-256-GCM

**Status:** angenommen · 10.07.2026

## Kontext

Die Daten liegen ausschließlich auf dem Gerät (ADR-0003). Damit ist die
Speicherung auf dem Gerät die einzige Verteidigungslinie. Für Art.-9-Daten
wird Verschlüsselung im Ruhezustand erwartet, nicht diskutiert.

Angreifermodelle: jemand mit dem entsperrten Gerät, jemand mit dem
ausgeschalteten Gerät, jemand mit einem Systembackup.

## Entscheidung

- Ein 256-Bit-Schlüssel, erzeugt beim ersten Start aus dem Zufallsgenerator des
  Systems.
- Verwahrt im Plattform-Keystore mit der Einstellung **nur bei entsperrtem
  Gerät, nur dieses Gerät**. Damit wandert er nicht in Systembackups und nicht
  auf andere Geräte.
- Nutzdaten AES-256-GCM, verschlüsselt bevor sie die Platte berühren.
- **Systembackup ausgeschaltet.** Sicherung läuft ausschließlich über den
  bewussten Weg aus ADR-0009.

## Konsequenzen

**Positiv**

- Ein Angreifer mit dem ausgeschalteten Gerät findet nur einen Blob.
- Ein Systembackup enthält weder Schlüssel noch lesbare Daten.
- Auf Geräten mit Sicherheitshardware ist der Schlüssel hardwaregebunden.

**Negativ**

- Geht der Keystore-Eintrag verloren — Zurücksetzen, Deinstallation,
  Gerätetausch — sind die Daten unwiederbringlich. Genau dafür existiert
  ADR-0009.
- Der Schutz endet am entsperrten Gerät mit geöffneter App. Deshalb der
  App-Lock als zweite Schicht.

**Bekannte Lücke (Stand 27.08.2026)**

Der App-Lock ist **simuliert**. Eine vierstellige PIN sperrt die Oberfläche,
leitet aber keinen Schlüssel ab und ist keine Sicherheitsgrenze. Das ist in der
Oberfläche als solches beschriftet und im Datenmodell dokumentiert. Behebung in
Welle 3.

## Verworfene Alternativen

**Nur vom Nutzerpasswort abgeleiteter Schlüssel.** Stärker gegen einen
Angreifer mit dem entsperrten Gerät, aber jeder Start braucht die Eingabe, und
ein vergessenes Passwort ist endgültiger Datenverlust. Für ein Werkzeug,
das man beiläufig öffnet, zu viel Reibung.

**Verschlüsselte Datenbank statt Blob.** Der bessere Weg, sobald die Datenmenge
den Blob sprengt. Heute nicht nötig; als Aufrüstpfad vorgesehen.

**Keine Verschlüsselung, Verlass auf die Geräteverschlüsselung.** Bei
Art.-9-Daten nicht vertretbar.
