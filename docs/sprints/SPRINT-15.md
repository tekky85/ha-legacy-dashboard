# Sprint 15 – Admin Configuration UI

## Status

Implemented

## Abhängigkeit

Sprint 15 setzt die erfolgreiche Umsetzung von Sprint 14 voraus.

Codex muss vor Beginn prüfen, ob Sprint 14 tatsächlich vollständig vorhanden ist:

- persistente Dashboard-Konfiguration
- versioniertes Konfigurationsschema
- stabile Widget-IDs
- Admin-API
- Admin-Authentifizierung
- Entity-Inventar
- atomisches Speichern
- Backup-Verhalten
- getrennte Schreib-Allowlisten

Falls diese Grundlage fehlt oder nur teilweise umgesetzt ist, darf Codex die
Admin-Oberfläche nicht auf provisorische Direktzugriffe oder Dateimanipulationen
stützen.

---

# Ziel

Sprint 15 implementiert eine grafische Konfigurationsoberfläche unter:

```text
/admin
```

Die Oberfläche soll es ermöglichen, Dashboards und Widgets ohne Quellcodeänderung
zu verwalten.

Die Admin-Oberfläche ist für moderne Browser vorgesehen.

Sie muss **nicht** auf Safari unter iOS 9 funktionieren.

Das eigentliche Wall-Display unter `/` beziehungsweise `/d/:dashboardId`
muss weiterhin vollständig Safari-iOS-9- und ECMAScript-5-kompatibel bleiben.

---

# Hauptfunktionen

Die Admin-Oberfläche soll ermöglichen:

- Dashboards anzeigen
- Dashboard erstellen
- Dashboard umbenennen
- Dashboard duplizieren
- Dashboard löschen
- Standard-Dashboard auswählen
- Widgets eines Dashboards anzeigen
- Home-Assistant-Entities durchsuchen
- Entity zu einem Dashboard hinzufügen
- Widget entfernen
- Widgettitel ändern
- Widgetuntertitel ändern
- Icon ändern
- Einheit anzeigen beziehungsweise anpassen, sofern sinnvoll
- Sichtbarkeit ändern
- Reihenfolge ändern
- Refresh-Intervall eines Dashboards ändern
- Änderungen speichern
- nicht gespeicherte Änderungen verwerfen
- verständliche Fehler anzeigen

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 15:

- kein Drag-and-drop
- keine frei positionierbaren Kacheln
- keine frei wählbare Kachelgröße
- keine Rasterkoordinaten
- keine Portrait-/Landscape-spezifischen Layoutprofile
- keine Home-Assistant-App
- keine HACS-Integration
- keine neuen Home-Assistant-Schreibdomänen
- keine automatische Erweiterung von Schreib-Allowlisten
- keine Benutzer-/Rollenverwaltung
- kein komplexes Mehrbenutzersystem
- keine Cloud-Synchronisierung
- kein visueller WYSIWYG-Wall-Display-Editor
- keine Umstellung des Legacy-Dashboards auf moderne JavaScript-Syntax

---

# Architektur

Die Admin-Oberfläche darf ausschließlich über die in Sprint 14 bereitgestellte
Admin-API arbeiten.

Nicht erlaubt:

- direkte Bearbeitung von `data/dashboards.json` im Browser
- direkte Bearbeitung von Quellcodedateien
- direkte Home-Assistant-API-Aufrufe aus dem Browser
- Home-Assistant-Token im Browser
- Dateisystemzugriffe aus dem Frontend
- automatische Änderung der Write-Allowlists

Architektur:

```text
Admin Browser
     |
     | authenticated Admin API
     v
HA Legacy Dashboard Backend
     |
     +--> Config Store
     |
     +--> sanitized HA Entity Inventory
     |
     v
Home Assistant
```

Das Wall-Display bleibt davon getrennt:

```text
Legacy iPad
     |
     | public dashboard API
     v
HA Legacy Dashboard Backend
```

---

# Trennung Admin UI und Legacy Frontend

Die Admin-Oberfläche soll technisch klar vom Legacy-Frontend getrennt werden.

Bevorzugte Struktur:

```text
src/admin/
    index.html
    css/
        admin.css
    js/
        admin.js
        api.js
        auth.js
        state.js
        dashboards.js
        widgets.js
        entities.js
```

Alternativ:

```text
src/public/admin/
```

wenn dies besser zur vorhandenen Express-Struktur passt.

Wichtig:

- Admin-JavaScript darf modern sein
- Legacy-JavaScript bleibt ES5
- keine gemeinsame Modernisierung des Wall-Display-Codes
- Admin-CSS darf moderne Browserfeatures verwenden
- keine Abhängigkeit des Legacy-Dashboards von Admin-Code

---

# Admin-Authentifizierung

Sprint 15 verwendet die in Sprint 14 definierte Admin-Authentifizierung.

Falls Sprint 14 Bearer-Token verwendet:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

muss die Admin-Oberfläche diesen Mechanismus verwenden.

## Login-Verhalten

Beim Aufruf von:

```text
/admin
```

soll eine einfache Anmeldemaske erscheinen.

Felder:

- Admin-Token

Optional:

- Checkbox „für diese Sitzung merken“

## Speicherung des Admin-Tokens

Bevorzugt:

```text
sessionStorage
```

Nicht standardmäßig:

```text
localStorage
```

Der Token soll nach Schließen des Browserfensters beziehungsweise Tabs nicht
dauerhaft gespeichert bleiben.

## Sicherheitsanforderungen

- Token niemals in URL
- Token niemals Query-Parameter
- Token niemals in Logs
- Token niemals in HTML schreiben
- Token niemals im Repository
- Token niemals an öffentliche Dashboard-Endpunkte senden
- Token bei HTTP 401/403 aus Session entfernen
- klarer Logout-Button
- Logout löscht Token aus Session
- keine automatische Verwendung des Home-Assistant-Tokens

---

# Admin-Startseite

Nach erfolgreicher Anmeldung zeigt `/admin` eine kompakte Verwaltungsansicht.

Beispiel:

```text
┌────────────────────────────────────────────┐
│ HA Legacy Dashboard – Administration      │
├────────────────────────────────────────────┤
│ Dashboards                                │
│                                            │
│ Übersicht              [Bearbeiten]        │
│ Wohn-/Esszimmer        [Bearbeiten]        │
│ Eingang                [Bearbeiten]        │
│                                            │
│ [+ Neues Dashboard]                       │
└────────────────────────────────────────────┘
```

Zusätzlich:

- aktuelles Standard-Dashboard markieren
- Anzahl Widgets anzeigen
- Dashboard-URL anzeigen
- Logout

---

# Dashboard erstellen

Button:

```text
+ Neues Dashboard
```

Felder:

- Titel
- technische ID / Slug

Beispiel:

```text
Titel: Eingang
ID: eingang
```

Die finale Slug-Validierung bleibt immer im Backend.

---

# Dashboard bearbeiten

Bearbeitungsansicht:

```text
Dashboard: Wohn-/Esszimmer

Titel:
[ Wohn-/Esszimmer ]

ID:
[ wohnen ]  (read-only)

Standard-Dashboard:
[ ]

Refresh:
[ 5000 ms ]

Widgets:
...
```

Die technische Dashboard-ID bleibt nach Erstellung in diesem Sprint bevorzugt
read-only.

---

# Dashboard duplizieren

Ein Dashboard soll duplizierbar sein.

Beim Duplizieren:

- neue Dashboard-ID erforderlich
- neuer Titel erforderlich oder sinnvoll vorgeschlagen
- Widgets werden kopiert
- jedes kopierte Widget erhält eine neue eindeutige Widget-ID
- Schreib-Allowlisten werden nicht verändert

---

# Dashboard löschen

Dashboard löschen nur mit Bestätigung.

Regeln:

- Standard-Dashboard nicht ohne vorherige Auswahl eines anderen Standard-Dashboards löschen
- mindestens ein Dashboard muss bestehen bleiben
- Backend bleibt finale Autorität
- UI zeigt Backend-Fehler verständlich an

---

# Standard-Dashboard

Die Oberfläche muss ein Dashboard als Standard markieren können.

Nach Speichern:

```text
/
```

zeigt dieses Dashboard.

Explizite URLs bleiben erhalten:

```text
/d/eingang
/d/wohnen
```

---

# Widgetliste

Innerhalb eines Dashboards werden Widgets in aktueller Reihenfolge angezeigt.

Beispiel:

```text
1. Badezimmer Temperatur
2. Badezimmer Luftfeuchtigkeit
3. Küchenfenster rechts
4. Esszimmer Licht
5. Esszimmer Thermostat
```

Pro Widget:

- Typ
- Entity-ID
- Titel
- Sichtbarkeit
- Bearbeiten
- Entfernen
- Reihenfolge nach oben/unten

---

# Reihenfolge

Sprint 15 verwendet bewusst noch **kein Drag-and-drop**.

Stattdessen:

```text
↑
↓
```

oder:

```text
Nach oben
Nach unten
```

Intern wird das vorhandene `order`-Feld aktualisiert.

Die Reihenfolge soll nach Änderungen sinnvoll normalisiert werden, z. B.:

```text
10
20
30
40
```

---

# Entity-Auswahl

Button:

```text
+ Widget hinzufügen
```

öffnet den Entity-Browser.

Die Daten stammen ausschließlich aus dem bereinigten Admin-Entity-Endpunkt aus
Sprint 14.

---

# Entity-Browser

Die Entityliste soll mindestens anzeigen:

- Friendly Name
- Entity-ID
- Domain
- Device Class
- Unit

Beispiel:

```text
Badezimmer Temperatur
sensor.badezimmer_smart_indoor_module_temperatur
sensor · temperature · °C
```

---

# Entity-Suche

Suchfeld:

```text
Entity suchen …
```

Suche mindestens über:

- Friendly Name
- Entity-ID
- Domain
- Device Class

Bevorzugte Filter:

```text
Alle
Sensor
Binary Sensor
Light
Climate
```

---

# Unterstützte Widget-Typen

Codex muss den tatsächlichen Stand prüfen.

Voraussichtlich:

```text
sensor
binary
light
climate
```

Vorschlagslogik:

```text
sensor.*        -> sensor
binary_sensor.* -> binary
light.*         -> light
climate.*       -> climate
```

Unbekannte Domains:

- nicht automatisch als funktionsfähiges Widget anlegen
- verständlichen Hinweis anzeigen
- keine generische unsichere Steuerung erzeugen

---

# Widget hinzufügen

Nach Entity-Auswahl Formular:

```text
Entity:
sensor.badezimmer_temperatur

Widget-Typ:
sensor

Titel:
[ Badezimmer ]

Untertitel:
[ Temperatur ]

Icon:
[ temperature ]

Einheit:
[ °C ]

Sichtbar:
[x]
```

Nach Speichern:

- Backend validiert
- Widget erhält stabile Widget-ID
- Dashboard wird aktualisiert
- Widgetliste wird neu geladen

---

# Widget bearbeiten

Bearbeitbare Felder:

- Titel
- Untertitel
- Icon
- Einheit, sofern sinnvoll
- sichtbar
- Reihenfolge

Bevorzugt nicht direkt bearbeitbar:

- Widget-ID
- Entity-ID
- Widget-Typ

Für Entity-/Typ-Wechsel in Sprint 15:

```text
altes Widget löschen
neues Widget hinzufügen
```

---

# Widget entfernen

Das Entfernen aus einem Dashboard:

- entfernt nur die Anzeige
- verändert keine Write-Allowlist
- löscht keine Home-Assistant-Entity
- ruft keinen Home-Assistant-Service auf

---

# Widget-Sichtbarkeit

Checkbox:

```text
[x] Sichtbar
```

Ein unsichtbares Widget bleibt konfiguriert, wird aber im Wall-Display nicht
angezeigt.

---

# Icon-Auswahl

Keine komplexe Icon-Verwaltung.

Bevorzugt:

- Select-Feld mit vorhandenen Icons
- kleine Vorschau

Codex soll die tatsächlich vorhandene Icon-Bibliothek prüfen und nur bekannte
Icons anbieten.

---

# Preview-Link

Jedes Dashboard erhält:

```text
Dashboard öffnen
```

Ziel:

```text
/d/:dashboardId
```

Bevorzugt in neuem Tab.

Keine eingebettete Live-Vorschau in Sprint 15.

---

# Speichern und Verwerfen

Änderungen sollen nicht bei jedem Tastendruck sofort persistent geschrieben
werden.

Bevorzugt:

```text
Bearbeiten
    ↓
lokaler Entwurf
    ↓
[Speichern] [Verwerfen]
```

Bei Erfolg:

```text
Änderungen gespeichert
```

Bei Fehler:

- verständliche Fehlermeldung
- Eingaben erhalten
- kein unnötiger Full-Page-Reload

---

# Ungespeicherte Änderungen

Wenn lokale Änderungen vorhanden sind und der Benutzer die Seite verlassen
will, soll `beforeunload` verwendet werden.

Nur aktivieren, wenn tatsächlich ungespeicherte Änderungen bestehen.

---

# API-Fehler

Mindestens verständlich behandeln:

```text
400 validation error
401 unauthorized
403 forbidden
404 dashboard/widget not found
409 conflict
429 rate limit
500 internal error
503 Home Assistant unavailable
```

Keine rohen Stacktraces anzeigen.

---

# Admin-Statusanzeige

Optional im Header:

```text
Backend verbunden
Home Assistant verbunden
```

Ein Home-Assistant-Ausfall darf lokale Konfigurationsänderungen nicht unnötig
blockieren.

Der Entity-Browser kann bei HA-Ausfall als nicht verfügbar markiert werden.

---

# Design

Ziel:

- klar
- modern
- Desktop-first
- auf dem MacBook gut nutzbar
- auf modernen Tablets nutzbar
- informationsdichter als das Wall-Display
- keine unnötigen Animationen
- klare Formulare
- klare Fehlermeldungen

Dark Mode ist optional.

---

# Accessibility

Mindestens:

- echte `<label>`-Elemente
- Tastaturbedienbarkeit
- sichtbarer Focus
- echte Buttons statt klickbarer `<div>`
- sinnvolle `aria-*`-Attribute, wo notwendig
- ausreichender Farbkontrast
- Fehlermeldungen nicht nur über Farbe kommunizieren

---

# Content Security Policy

Die bestehende CSP darf für `/admin` nicht unnötig aufgeweicht werden.

Bevorzugt:

- lokale JS-Dateien
- lokale CSS-Dateien
- keine CDN-Abhängigkeiten
- kein `unsafe-eval`
- Inline-Skripte vermeiden

---

# Frontend-Technik

Bevorzugt:

```text
HTML + CSS + JavaScript
```

ohne React, Vue oder Angular.

Eine zusätzliche Frontendabhängigkeit nur bei klar dokumentiertem Mehrwert.

Sprint 15 soll keine Frameworkentscheidung erzwingen, die Sprint 16/17
unnötig bindet.

---

# Tests

Der vollständige bestehende Testsatz muss grün bleiben.

Zusätzliche Tests mindestens für:

## Authentifizierung

1. `/admin` erreichbar
2. Admin-API ohne Token abgewiesen
3. falscher Token abgewiesen
4. gültiger Token akzeptiert
5. Logout entfernt Session-Token

## Dashboardverwaltung

6. Dashboardliste laden
7. Dashboard erstellen
8. ungültigen Slug anzeigen
9. doppelten Slug anzeigen
10. Dashboard umbenennen
11. Dashboard duplizieren
12. Widget-IDs beim Duplizieren eindeutig
13. Dashboard löschen
14. Standard-Dashboard nicht inkonsistent löschen
15. Standard-Dashboard wechseln

## Widgetverwaltung

16. Widgetliste laden
17. Entity-Browser laden
18. Entity-Suche
19. Domainfilter
20. unterstützte Domain auswählen
21. unbekannte Domain nicht ungeprüft anlegen
22. Widget hinzufügen
23. Widget bearbeiten
24. Widget sichtbar/unsichtbar
25. Widget nach oben
26. Widget nach unten
27. Widget entfernen

## Sicherheit

28. Admin-Token erscheint nicht in URL
29. Admin-Token erscheint nicht in HTML
30. Admin-Token erscheint nicht in normalen Dashboard-Requests
31. Light-Widget verändert keine Light-Allowlist
32. Climate-Widget verändert keine Climate-Allowlist
33. öffentliche Dashboard-API enthält keine Admin-Daten

## Regression

34. `/` funktioniert
35. `/d/:dashboardId` funktioniert
36. Climate-Steuerung funktioniert
37. Light-Steuerung funktioniert
38. Legacy-Wall-Display bleibt ES5-kompatibel
39. bestehende Multi-Dashboard-Tests bleiben erfolgreich

---

# Browser-Test

Admin-Oberfläche mindestens manuell prüfen in:

- aktueller Safari-Version auf macOS
- aktuellem Chromium-basierten Browser, falls vorhanden

Admin-UI muss nicht auf iOS 9 getestet werden.

Wall-Display weiterhin auf dem Ziel-iPad prüfen.

---

# JavaScript-Aufteilung

Admin-JavaScript soll nicht als neue monolithische Datei entstehen.

Bevorzugt:

```text
admin/js/api.js
admin/js/auth.js
admin/js/state.js
admin/js/dashboards.js
admin/js/widgets.js
admin/js/entities.js
admin/js/app.js
```

Native ES Modules sind ausschließlich für das moderne Admin-Frontend erlaubt,
wenn sie sinnvoll sind.

---

# Voraussichtlich betroffene Dateien

Codex soll zuerst den realen Sprint-14-Stand prüfen.

Mögliche neue Dateien:

```text
src/admin/index.html
src/admin/css/admin.css
src/admin/js/app.js
src/admin/js/api.js
src/admin/js/auth.js
src/admin/js/state.js
src/admin/js/dashboards.js
src/admin/js/widgets.js
src/admin/js/entities.js
```

Mögliche bestehende Dateien:

```text
src/server.js
src/routes/admin.js
src/routes/api.js
package.json
test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Keine unnötige Änderung des Legacy-Wall-Display-Codes.

---

# Deployment

Die Admin-Oberfläche wird durch denselben Node-/Express-Dienst ausgeliefert.

Der bestehende Deploymentprozess bleibt bestehen.

Backendänderungen erfordern weiterhin den normalen Service-Neustart.

---

# Definition of Done

Sprint 15 ist abgeschlossen, wenn:

- `/admin` eine funktionierende Admin-Oberfläche bereitstellt
- Admin-Authentifizierung funktioniert
- Dashboards angezeigt werden
- Dashboard erstellt werden kann
- Dashboard umbenannt werden kann
- Dashboard dupliziert werden kann
- Dashboard gelöscht werden kann
- Standard-Dashboard gewechselt werden kann
- Entity-Inventar durchsucht werden kann
- unterstützte Entities als Widgets hinzugefügt werden können
- Widgets bearbeitet werden können
- Widgets sichtbar/unsichtbar gesetzt werden können
- Widgetreihenfolge verändert werden kann
- Widgets entfernt werden können
- Änderungen persistent gespeichert werden
- Fehler verständlich dargestellt werden
- keine Write-Allowlist automatisch verändert wird
- Admin-Token nicht geleakt wird
- keine Home-Assistant-Credentials im Browser erscheinen
- Wall-Display auf iOS 9 unverändert funktioniert
- bestehende Tests grün bleiben
- neue Admin-Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde
- keine Drag-and-drop-Funktion implementiert wurde
- keine freie Kachelgröße implementiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. geprüfter Sprint-14-Status
3. geänderte und neue Dateien
4. Admin-URL
5. Authentifizierungsablauf
6. Dashboard-Funktionen
7. Widget-Funktionen
8. Entity-Browser-Funktionen
9. Sicherheitsmaßnahmen
10. Tests und Ergebnisse
11. manuelle Browsertests
12. Regressionstest des Legacy-Dashboards
13. technische Schulden
14. Grundlage für Sprint 16
15. Commit-Vorschlag
16. Deploymentbefehle

---

# Codex-Prompt für Sprint 15

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-13.md
- docs/sprints/SPRINT-14.md
- docs/sprints/SPRINT-15.md

Inspect the actual repository state and verify that Sprint 14 provides the
required persistent configuration and protected Admin API foundation.

Implement Sprint 15 exactly as specified in docs/sprints/SPRINT-15.md.

The goal is a graphical Admin Configuration UI under /admin.

The Admin UI may target modern browsers and does not need Safari iOS 9
compatibility.

The wall-display frontend must remain fully compatible with Safari on iOS 9
and ECMAScript 5.

Use the existing Admin API only. Do not access configuration files or Home
Assistant directly from the browser.

Preserve the strict separation between dashboard visibility and Home Assistant
write authorization.

Do not implement:

- drag-and-drop,
- free tile positioning,
- tile sizing,
- layout profiles,
- Home Assistant App packaging,
- HACS integration,
- automatic write allowlist modification.

Use session-scoped Admin authentication and do not expose tokens in URLs,
HTML, logs or public dashboard requests.

Run the complete existing test suite and add tests for the Admin UI and its
security boundaries.

At the end:

- update docs/PROJECT_STATUS.md,
- summarize every changed file,
- report tests and manual browser checks,
- report any remaining limitations,
- identify the exact prerequisites for Sprint 16,
- do not commit or push unless explicitly instructed.
```
