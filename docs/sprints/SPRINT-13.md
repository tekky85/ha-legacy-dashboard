# Sprint 13 – Multi-Dashboard Foundation

## Status

Planned

## Zweck

Sprint 13 führt mehrere Dashboards als saubere serverseitige Grundlage ein.

Der Sprint schafft:

- mehrere benannte Dashboard-Profile,
- stabile Dashboard-IDs / Slugs,
- eigene URLs pro Dashboard,
- Dashboard-spezifische Konfiguration,
- Dashboard-spezifische Entity-Leselisten,
- eine Liste verfügbarer Dashboards,
- vollständige Rückwärtskompatibilität für das bisherige Einzel-Dashboard.

Dieser Sprint führt **noch keine Admin-Oberfläche** und **keine schreibbare Konfigurationspersistenz** ein.

## Ausgangslage

Vor Sprint 13 existiert genau ein konfigurationsgetriebenes Dashboard.

Der bekannte Stand aus `docs/PROJECT_STATUS.md` beschreibt:

- `src/config/dashboard.js` mit einem einzelnen `WIDGETS`-Array,
- `GET /api/dashboard/config`,
- `GET /api/dashboard`,
- Root-URL `/`,
- keine Dashboard-ID,
- keinen Dashboard-Slug,
- keine Dashboard-Liste,
- keinen Dashboardwechsel,
- keine persistente Laufzeitkonfiguration.

Schreibrechte für Climate und Light sind separat in Backend-Allowlisten definiert und dürfen nicht aus der Dashboard-Sichtbarkeit abgeleitet werden.

Codex muss den aktuellen Repository-Stand zu Beginn erneut prüfen, da Sprint 12 zwischenzeitlich Änderungen vorgenommen haben kann.

---

# Zielbild

Nach Sprint 13 sollen mehrere Dashboards parallel verfügbar sein.

Beispiele:

```text
/d/eingang
/d/wohnen
/d/esszimmer
```

Die Startseite `/` lädt weiterhin ein Standard-Dashboard.

Neue API-Struktur:

```text
GET /api/dashboards
GET /api/dashboards/:dashboardId/config
GET /api/dashboards/:dashboardId/state
```

Die alten Endpunkte bleiben aus Rückwärtskompatibilitätsgründen erhalten:

```text
GET /api/dashboard/config
GET /api/dashboard
```

Sie verweisen intern auf das Standard-Dashboard.

---

# Nicht-Ziele

Nicht Bestandteil dieses Sprints:

- keine Admin-Oberfläche
- keine `/admin`-Route
- keine Laufzeitbearbeitung durch den Browser
- kein Speichern von Konfiguration aus dem Frontend
- keine beschreibbare JSON-/YAML-Persistenz
- keine Datenbank
- kein Drag-and-drop
- keine freie Kachelposition
- keine individuelle Kachelbreite oder -höhe
- keine Portrait-/Landscape-spezifischen Layoutprofile
- keine neuen Widget-Domänen
- keine neuen Schreibservices
- keine generische Home-Assistant-Service-API
- keine Home-Assistant-App
- keine HACS-Integration
- keine große Refaktorierung des gesamten Frontends
- keine Änderung bestehender Climate-/Light-Sicherheitsgrenzen

---

# Architekturprinzipien

## 1. Dashboard und Schreibberechtigung bleiben getrennt

Ein Dashboard darf definieren, welche Entity angezeigt wird.

Ein Dashboard darf **keine Schreibberechtigung erzeugen**.

Die bestehenden Climate- und Light-Allowlisten bleiben separate serverseitige Sicherheitsentscheidungen.

## 2. Dashboard-ID ist technisch stabil

Jedes Dashboard besitzt eine ID / einen Slug.

Beispiele:

```text
eingang
wohnen
esszimmer
```

Empfohlene Validierung:

```text
^[a-z0-9][a-z0-9-]{0,62}$
```

## 3. Titel und ID sind getrennt

Beispiel:

```javascript
{
    id: "wohnen",
    title: "Wohn- / Esszimmer"
}
```

Die technische URL bleibt:

```text
/d/wohnen
```

---

# Dashboard-Datenmodell

Die bisherige Einzelkonfiguration soll in eine Liste oder Map von Dashboarddefinitionen überführt werden.

Beispiel:

```javascript
{
    defaultDashboardId: "default",
    dashboards: [
        {
            id: "default",
            title: "Übersicht",
            refreshIntervalMs: 5000,
            widgets: [
                // bisherige Widgets
            ]
        },
        {
            id: "wohnen",
            title: "Wohn- / Esszimmer",
            refreshIntervalMs: 5000,
            widgets: [
                // vorhandene passende Entities
            ]
        }
    ]
}
```

Backend-Code darf moderne Node.js-Syntax verwenden, sofern die aktuelle Runtime dies unterstützt. Frontend-Code bleibt ES5.

---

# Konfigurationsmodul

Die bisherige Datei:

```text
src/config/dashboard.js
```

soll von einem Einzel-Dashboard-Modell auf ein Multi-Dashboard-Modell erweitert oder in klar benannte Module aufgeteilt werden.

Mögliche Funktionen:

```text
getDashboards()
getPublicDashboards()
getDefaultDashboard()
getDashboardById(id)
getPublicDashboardConfig(id)
getVisibleWidgets(id)
getVisibleEntityIds(id)
```

Anforderungen:

- keine Mutation der Originalkonfiguration durch API-Aufrufe
- definierte Sortierung der Widgets über `order`
- `visible: false` bleibt unterstützt
- unbekanntes Dashboard liefert keinen Fallback auf ein anderes Dashboard
- eindeutiges Standard-Dashboard
- doppelte Dashboard-IDs erkennen
- ungültige Dashboard-IDs erkennen

---

# Initiale Dashboards

Sprint 13 soll mindestens zwei Dashboardprofile unterstützen, damit Multi-Dashboard-Funktionalität real getestet wird.

## Standard-Dashboard

Das bisherige Dashboard muss vollständig erhalten bleiben.

Bevorzugte ID:

```text
default
```

## Zweites Dashboard

Ein zweites Dashboard soll ausschließlich aus bereits vorhandenen Entities zusammengestellt werden.

Keine neuen Home-Assistant-Entities erfinden.

Beispiel, falls anhand des aktuellen Codes sinnvoll:

```text
wohnen
```

mit vorhandenen Light-/Climate-Entities.

---

# API

## Dashboard-Liste

Neue Route:

```text
GET /api/dashboards
```

Beispielantwort:

```json
{
  "default_dashboard": "default",
  "dashboards": [
    {
      "id": "default",
      "title": "Übersicht"
    },
    {
      "id": "wohnen",
      "title": "Wohn- / Esszimmer"
    }
  ]
}
```

Die API darf nur öffentliche Darstellungsinformationen liefern.

Nicht enthalten:

- Home-Assistant-Token
- interne Services
- Schreib-Allowlisten
- interne Dateipfade
- Servergeheimnisse

## Dashboard-Konfiguration

Neue Route:

```text
GET /api/dashboards/:dashboardId/config
```

Antwort enthält:

- Dashboard-ID
- Dashboard-Titel
- Refresh-Intervall
- sichtbare Widgets
- öffentliche Darstellungsattribute

## Dashboard-Zustände

Neue Route:

```text
GET /api/dashboards/:dashboardId/state
```

Die Route liest ausschließlich die sichtbaren Entities des angeforderten Dashboards.

Bestehende `_meta`-Informationen zu Erreichbarkeit und Stale Data sollen erhalten bleiben.

## Unbekanntes Dashboard

Unbekannte IDs liefern kontrolliert HTTP 404, z. B.:

```json
{
  "error": "dashboard_not_found"
}
```

Keine Stacktraces oder internen Details an den Browser.

---

# Rückwärtskompatibilität

Weiterhin unterstützt:

```text
GET /api/dashboard/config
GET /api/dashboard
```

Diese Endpunkte verweisen auf das Standard-Dashboard und bleiben als Legacy-Kompatibilitätsendpunkte dokumentiert.

---

# Browser-Routing

Neue Dashboard-URLs:

```text
/d/:dashboardId
```

Beispiele:

```text
/d/default
/d/wohnen
```

Express soll für gültige Dashboardpfade dieselbe Legacy-kompatible `index.html` ausliefern.

Die Root-URL:

```text
/
```

muss weiterhin funktionieren und das Standard-Dashboard anzeigen.

Unbekannte Dashboardpfade dürfen nicht stillschweigend das Standard-Dashboard laden.

---

# Frontend

Das Frontend bestimmt die Dashboard-ID ES5-kompatibel aus:

```text
window.location.pathname
```

Keine moderne Routerbibliothek.

Keine `URLPattern`-API.

Für `/d/wohnen` werden geladen:

```text
/api/dashboards/wohnen/config
/api/dashboards/wohnen/state
```

Der Header soll den Titel des geladenen Dashboards anzeigen können.

Ein vollwertiger Dashboard-Selector ist noch nicht Bestandteil dieses Sprints.

---

# Entity-Leselisten

Für ein Dashboard sollen nur dessen Entities von Home Assistant gelesen werden.

Wenn dieselbe Entity innerhalb eines Dashboards mehrfach vorkommt, soll der State nur einmal abgefragt werden.

Dieselbe Entity darf auf mehreren Dashboards vorkommen.

---

# Schreiboperationen

Climate und Light funktionieren aus jedem Dashboard weiter, sofern die Entity in der bestehenden Backend-Allowlist liegt.

Die POST-Endpunkte können unverändert bleiben:

```text
POST /api/climate/temperature
POST /api/light/state
```

Die Dashboard-ID ist keine Autorisierungsquelle.

---

# Layout

Sprint 13 verändert das Layoutmodell nicht.

Weiterhin:

- `order`
- `visible`
- Flexbox
- bestehende Breakpoints
- bestehende typabhängige Größen

Nicht hinzufügen:

```text
x
y
width
height
```

---

# Persistenz

Sprint 13 verwendet weiterhin versionierte serverseitige Konfiguration im Repository.

Das ist bewusst so gewählt, damit das Multi-Dashboard-Modell zuerst ohne zusätzliche Schreib- und Authentifizierungsrisiken stabilisiert werden kann.

---

# Validierung

Mindestens prüfen:

- Dashboard-ID vorhanden
- Dashboard-ID gültig
- Dashboard-ID eindeutig
- Titel vorhanden
- Widgets ist ein Array
- Widget-Entity vorhanden
- Widget-Typ bekannt
- `order` sinnvoll behandelbar
- `visible` korrekt behandelbar
- Standard-Dashboard eindeutig auflösbar

Ungültige Konfiguration soll früh und klar erkannt werden.

---

# Tests

Der bestehende Testsatz muss vollständig grün bleiben.

Letzter bekannter Referenzstand aus `PROJECT_STATUS.md`:

```text
39 passed
0 failed
```

Sprint 12 kann diesen Wert bereits verändert haben. Codex muss den aktuellen Wert zuerst feststellen.

Neue Tests mindestens für:

1. mehrere Dashboards werden erkannt
2. Standard-Dashboard wird korrekt ermittelt
3. Dashboard-IDs sind eindeutig
4. ungültige ID wird abgewiesen
5. unbekanntes Dashboard liefert 404
6. unsichtbare Widgets erscheinen nicht öffentlich
7. Widgetsortierung bleibt Dashboard-spezifisch
8. `GET /api/dashboards` liefert öffentliche Liste
9. `GET /api/dashboards/:id/config` liefert richtige Konfiguration
10. `GET /api/dashboards/:id/state` liest nur Entities dieses Dashboards
11. Legacy-Config-Endpunkt liefert Standard-Dashboard
12. Legacy-State-Endpunkt liefert Standard-Dashboard
13. `/` lädt Standard-Dashboard
14. `/d/default` lädt Standard-Dashboard
15. `/d/<zweites-dashboard>` lädt das zweite Dashboard
16. Dashboardtitel wird korrekt übernommen
17. unbekanntes Dashboard wird verständlich behandelt
18. Climate-Steuerung funktioniert im Multi-Dashboard-Kontext
19. Light-Steuerung funktioniert im Multi-Dashboard-Kontext
20. Dashboardliste enthält keine Allowlists oder Secrets
21. sichtbare Entity gewährt keine neue Schreibberechtigung
22. nicht erlaubte Climate-/Light-Entity bleibt verboten

---

# Mock-Home-Assistant

Alle Integrationstests ausschließlich lokal.

Erlaubt:

```text
127.0.0.1
localhost
```

Nicht erlaubt:

- reales Home Assistant
- reale `.env`
- echte Tokens
- produktiver systemd-Service

---

# iOS-9-Kompatibilität

Wall-Display-Code bleibt ECMAScript 5.

Nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing
- moderne Routingbibliotheken

Browserrequests weiterhin über die bestehende `Legacy.http`-/`XMLHttpRequest`-Kompatibilitätsschicht.

---

# Cache-Version

Wenn Frontend-JavaScript, CSS oder HTML geändert wird, die Frontend-Cache-Version in `src/public/index.html` konsistent erhöhen.

Codex soll den aktuellen Wert zuerst aus dem Repository lesen.

---

# Voraussichtlich betroffene Dateien

```text
src/config/dashboard.js
src/server.js
src/routes/api.js
src/public/index.html
src/public/js/app.js
src/public/js/core/dashboard.js
test/dashboard-config.test.js
test/gateway.test.js
README.md
docs/PROJECT_STATUS.md
```

Optional:

```text
src/config/dashboards.js
```

Keine unnötige Großrefaktorierung.

---

# Migrationsanforderung

Das bisherige Dashboard muss ohne manuelle Neuerfassung als Standard-Dashboard übernommen werden.

Kein Verlust von:

- sichtbaren Widgets
- Titeln
- Untertiteln
- Icons
- Einheiten
- Reihenfolge
- Sichtbarkeit
- Refresh-Intervall
- Climate-Funktion
- Light-Funktion

---

# Manuelle Abnahme

Prüfen:

```text
/
```

und:

```text
/d/default
```

müssen inhaltlich dasselbe Dashboard darstellen.

Das zweite Dashboard unter:

```text
/d/<id>
```

zeigt nur die dafür konfigurierten Widgets.

Auf dem iPad mini zusätzlich:

- Portrait
- Landscape
- Light Mode
- Dark Mode
- Climate-Steuerung
- Light-Steuerung
- automatische Aktualisierung
- Verbindungsstatus
- Uhr/Datum
- Home-Screen-Standalone-Modus

---

# Dokumentation

README ergänzen um:

- Konzept mehrerer Dashboards
- URL-Schema
- statische Dashboarddefinition
- Standard-Dashboard
- Hinweis, dass die Admin-UI erst später folgt

`docs/PROJECT_STATUS.md` nach Abschluss aktualisieren.

`docs/SPRINT_ROADMAP.md` aktualisieren, wenn der Status dort überholt ist.

---

# Definition of Done

Sprint 13 ist abgeschlossen, wenn:

- mindestens zwei Dashboardprofile existieren
- ein eindeutiges Standard-Dashboard existiert
- `/` weiterhin funktioniert
- `/d/:dashboardId` funktioniert
- `/api/dashboards` funktioniert
- dashboard-spezifische Config-API funktioniert
- dashboard-spezifische State-API funktioniert
- unbekannte Dashboard-ID kontrolliert 404 liefert
- Legacy-API auf Standard-Dashboard weiter funktioniert
- nur Entities des jeweiligen Dashboards gelesen werden
- sichtbare Entities keine Schreibrechte erzeugen
- Climate-Allowlist unverändert sicher bleibt
- Light-Allowlist unverändert sicher bleibt
- vorhandenes Dashboard vollständig migriert ist
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle alten Tests grün bleiben
- neue Multi-Dashboard-Tests grün sind
- Frontend-Cache-Version bei Bedarf erhöht wurde
- keine Admin-Oberfläche implementiert wurde
- keine Runtime-Schreibpersistenz implementiert wurde
- keine Drag-and-drop-Funktion implementiert wurde
- keine Secrets committed wurden
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. aktueller Startcommit
2. geänderte Dateien
3. gewähltes Dashboard-Datenmodell
4. Standard-Dashboard-ID
5. angelegte Dashboardprofile
6. neue API-Routen
7. Legacy-Kompatibilitätsverhalten
8. neue Tests
9. vollständiges Testergebnis
10. `node --check`-Ergebnisse
11. neue Frontend-Cache-Version, falls geändert
12. manuell noch zu prüfende Punkte
13. Risiken oder technische Schulden
14. empfohlene Grundlage für Sprint 14
15. Commit-Vorschlag
16. Deploymentbefehle

---

# Codex-Prompt für Sprint 13

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-12.md
- docs/sprints/SPRINT-13.md

Inspect the current repository state and the actual result of Sprint 12 before
making changes.

Implement Sprint 13 exactly as specified in docs/sprints/SPRINT-13.md.

The goal is a backward-compatible multi-dashboard foundation with:

- multiple static server-side dashboard profiles,
- stable dashboard IDs/slugs,
- a default dashboard,
- /d/:dashboardId URLs,
- dashboard-specific config and state APIs,
- a public dashboard list,
- legacy API compatibility.

Do not implement:

- an admin UI,
- runtime configuration writes,
- JSON/YAML persistence,
- a database,
- drag-and-drop,
- free tile positioning,
- individual tile sizing,
- Home Assistant App packaging,
- HACS support.

Preserve the separation between dashboard visibility and backend write
allowlists.

Keep all wall-display frontend code compatible with Safari on iOS 9 and
ECMAScript 5.

Use only local mock Home Assistant services for integration tests. Do not
contact the real Home Assistant instance and do not read or use production
credentials.

Run all required syntax checks and the complete test suite.

At the end:

- update docs/PROJECT_STATUS.md,
- summarize every changed file,
- report all tests and syntax checks,
- report the resulting dashboard URLs and APIs,
- report the frontend cache version,
- identify remaining work for Sprint 14,
- do not commit or push unless explicitly instructed.
```
