# Schnittstellen

Die Stellen, an denen Daten die Gerätegrenze überqueren. Alle sind bewusst
schmal, und alle sind spezifiziert **bevor** sie gebaut werden — sie sind der
Teil, den eine Datenschutzprüfung liest.

| Spezifikation | Richtung | Status |
|---|---|---|
| [`signed-results.md`](signed-results.md) | Teststelle ↔ App | Entwurf |
| [`alert-relay.md`](alert-relay.md) | App ↔ Relay ↔ Kontakt | Entwurf |
| [`research-export.md`](research-export.md) | App → Forschungsempfänger | Entwurf, nicht zu bauen |

**Die Zahl ist von zwei auf drei gewachsen, und das ist bemerkenswert, nicht
beiläufig.** Der ursprüngliche Entwurf sagte: es gibt keine dritte
Schnittstelle. Der Befundabruf hat diese Aussage widerlegt, weil ohne ihn die
signierten Befunde theoretisch bleiben — Ergebnisse liegen zum Testzeitpunkt
nicht vor.

Die Regel bleibt trotzdem: Jeder Vorschlag für eine weitere muss zuerst die
Frage aus [ADR-0003](../adr/0003-local-first.md) beantworten — **könnte das auf
dem Gerät bleiben?** Der Befundabruf konnte es nicht. Das ist die Messlatte.
