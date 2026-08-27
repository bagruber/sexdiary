# Schnittstellen

Die zwei Stellen, an denen Daten die Gerätegrenze überqueren. Beide sind
bewusst schmal und beide sind spezifiziert, **bevor** sie gebaut werden — sie
sind der Teil, den eine Datenschutzprüfung liest.

| Spezifikation | Richtung | Status |
|---|---|---|
| [`signed-results.md`](signed-results.md) | Teststelle → App | Entwurf |
| [`alert-relay.md`](alert-relay.md) | App ↔ Relay | Entwurf |

Was hier *nicht* steht, ist Absicht: Es gibt keine dritte Schnittstelle. Jeder
Vorschlag für eine weitere muss zuerst die Frage aus ADR-0003 beantworten —
könnte das auf dem Gerät bleiben?
