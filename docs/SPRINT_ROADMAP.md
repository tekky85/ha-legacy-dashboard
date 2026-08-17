# HA Legacy Dashboard – Sprint Roadmap

## Dokumentstatus

Aktualisierte verbindliche Projekt-Roadmap.

Diese Roadmap integriert:

- den aktuellen Projektstand,
- die bisherigen Sprints 0 bis 17,
- die geplanten Admin-/Layout-Sprints,
- die Brainstorming-Anforderungen zu festen dynamischen System-Dashboards,
- die weiterhin verbindlichen Sicherheits- und Legacy-Kompatibilitätsregeln.

Sie ergänzt:

- `AGENTS.md`
- `README.md`
- `docs/CODEX_HANDOFF.md`
- `docs/PROJECT_STATUS.md`
- die einzelnen Dateien unter `docs/sprints/`

Codex muss vor jedem Sprint den tatsächlichen Repository-Stand prüfen.

---

# Verbindliche Grundsätze

## Architektur

`ha-legacy-dashboard` bleibt eine eigenständige externe Node.js-/Express-Anwendung.

Es ist:

- kein internes Home-Assistant-Dashboard,
- kein Lovelace-Dashboard,
- kein Custom Panel,
- keine direkte Frontend-Erweiterung innerhalb von Home Assistant.

Datenfluss:

```text
Legacy Browser / iPad
        |
        | HTTP
        v
HA Legacy Dashboard Gateway
Node.js + Express
        |
        | Home Assistant API
        v
Home Assistant
```

## Sicherheit

Verbindlich für alle Sprints:

- Home-Assistant-Token ausschließlich im Backend
- Browser kennt keinen HA-Token
- keine generische Home-Assistant-Service-API
- keine automatische Freigabe schreibender Entitäten
- bestehende Write-Allowlists bleiben separate Sicherheitsgrenze
- Dashboard-Sichtbarkeit erzeugt niemals Schreibrechte
- Admin-Token getrennt vom HA-Token
- keine Secrets in Logs
- keine Secrets im Browser
- keine Secrets im Repository
- bestehende Rate Limits, Payload Limits und Security Header bleiben erhalten
- neue Schreibaktionen nur über explizite, eng begrenzte Backend-Endpunkte

Kurzform:

```text
Entity sichtbar
     !=
Entity schreibbar
```

## Legacy-Kompatibilität

Das Wall-Display bleibt kompatibel mit:

- Apple iPad mini 1
- iOS 9.3.5
- Safari unter iOS 9
- ECMAScript 5

Im Legacy-Frontend weiterhin nicht verwenden:

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
- CSS Grid
- Flexbox `gap`

Browserkommunikation weiterhin über:

```text
Legacy.http
XMLHttpRequest
```

Die Admin-Oberfläche darf moderne Browsertechnologie verwenden, sofern das
Legacy-Wall-Display davon technisch getrennt bleibt.

---

# Zwei Dashboard-Klassen

Ab Sprint 18 unterscheidet das Projekt verbindlich zwischen zwei Arten von
Dashboards.

## 1. Benutzerdashboards

Beispiele:

```text
/d/eingang
/d/wohnen
/d/esszimmer
```

Eigenschaften:

- frei konfigurierbar
- anlegbar
- löschbar
- umbenennbar
- Widgets frei auswählbar
- Kachelgrößen konfigurierbar
- Rasterlayout konfigurierbar
- im Admin-UI verwaltbar

## 2. Feste System-Dashboards

Feste Routen:

```text
/system/summary
/system/errors
```

Eigenschaften:

- immer vorhanden
- nicht löschbar
- feste technische Funktion
- festes Layout
- dynamischer Inhalt
- nicht über das normale Rasterlayout frei editierbar
- nur begrenzte Regeln und Filter konfigurierbar
- dieselbe sichere Gateway-Architektur wie alle anderen Ansichten

Bedeutung von „fest“:

- fest innerhalb der externen Anwendung
- nicht in Home Assistant registriert
- nicht Teil von Lovelace
- nicht Teil des normalen Dashboard-Editors

---

# Statusübersicht

| Sprint | Thema | Status |
|---|---|---|
| 0 | Projektgrundlage und Repository | umgesetzt |
| 1 | Express-Gateway und HA-Anbindung | umgesetzt |
| 2 | Legacy-kompatibles Dashboard | umgesetzt |
| 3 | Modulare Widgets, Icons und Theme | umgesetzt |
| 4 | Climate-Widget und Solltemperatur | umgesetzt |
| 5 | Standalone-Web-App für iOS 9 | umgesetzt |
| 6 | Weitere steuerbare Entitäten | teilweise umgesetzt, Light vorhanden |
| 7 | Konfigurationsgetriebenes Einzel-Dashboard | umgesetzt |
| 8 | Robustheit und Sicherheit | umgesetzt |
| 9 | Lokale Mock- und Integrationstests | umgesetzt |
| 10 | Deployment und Betrieb | umgesetzt |
| 11 | Wall-Display-Betrieb | umgesetzt |
| 12 | UI Polish + Release Baseline | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistent Configuration + Admin API Foundation | umgesetzt |
| 15 | Admin Configuration UI | umgesetzt |
| 16 | Configurable Tile Sizes | umgesetzt |
| 17 | Drag-and-Drop Grid Layout | umgesetzt |
| 18 | System Dashboard Foundation | umgesetzt |
| 17.1 | Grid Refinement + Responsive Card Content (Korrektursprint nach 18) | umgesetzt |
| 19 | Summary Dashboard MVP | umgesetzt |
| 17.2 | Card Identity, Proportional Geometry & Theme Persistence (Korrektursprint nach 19) | umgesetzt |
| 20 | Error Dashboard MVP | umgesetzt |
| 17.3 | Live Card Preview, Unified Controls & Focus Mode (Korrektursprint nach 20) | umgesetzt |
| 17.4 | Focus Overlay Layout Stabilization (Korrektursprint nach 21) | umgesetzt |
| 17.5 | Native Focus Renderer & Mobile Safari Stabilization (Korrektursprint nach 17.4) | umgesetzt |
| 17.6 | Power Control Alignment & Icon Stabilization (Korrektursprint nach 17.5) | umgesetzt |
| 21 | Registry & Diagnostic Enrichment | umgesetzt |
| 21.1 | Error Dashboard Device Aggregation & Navigation | umgesetzt |
| 21.2 | System Dashboard Filters, Column Views & Risk Severity | umgesetzt |
| 22 | Rules, Grace Periods & Device Aggregation | neu geplant |
| 23 | Automation Impact & Advanced Diagnostics | neu geplant |
| 24 | Home Assistant App Packaging | verschoben |
| 25 | Release & Distribution | geplant |

---

# Sprint 0 – Projektgrundlage und Repository

## Ziel

Versioniertes, reproduzierbares Projekt mit GitHub-Workflow.

## Kerninhalte

- Git-Repository
- Branch `main`
- GitHub-Anbindung
- SSH vom LXC
- SSH vom Mac
- `.gitignore`
- `.env` ausgeschlossen
- Dokumentationsgrundlage
- Codex-Arbeitsablauf

---

# Sprint 1 – Express-Gateway und Home-Assistant-Anbindung

## Ziel

Sicheres Backend zwischen Browser und Home Assistant.

## Kerninhalte

- Node.js
- Express
- Axios
- serverseitige HA-Zugangsdaten
- Status-API
- Dashboard-API
- statische Frontend-Auslieferung

---

# Sprint 2 – Legacy-kompatibles Dashboard

## Ziel

Responsive Oberfläche für Safari iOS 9.

## Kerninhalte

- HTML/CSS/plain JS
- ES5
- XMLHttpRequest
- Light/Dark Mode
- Portrait/Landscape
- Flexbox
- Polling

---

# Sprint 3 – Modulare Widgets, Icons und Dashboard-Struktur

## Kerninhalte

- Widget-Basis
- Sensor
- Binary Sensor
- Inline-SVG-Icons
- zentrale Widgetregistrierung

---

# Sprint 4 – Climate-Widget und Solltemperatursteuerung

## Kerninhalte

- Climate-Widget
- Solltemperatur
- Plus/Minus
- optimistische Aktualisierung
- Refreshschutz
- Bestätigungsprüfung
- separate Write-Allowlist

---

# Sprint 5 – Standalone-Web-App für iOS 9

## Kerninhalte

- Apple-Web-App-Metatags
- Touch Icons
- Manifest
- Home-Screen-Start
- Asset-Versionierung
- kein Service Worker

---

# Sprint 6 – Weitere steuerbare Entitäten

## Aktueller Stand

Light ist umgesetzt.

## Weiterhin möglicher späterer Ausbau

- Switch
- Cover
- weitere explizit erlaubte Domains

Nur in separaten, sicherheitsgeprüften Sprints.

---

# Sprint 7 – Konfigurationsgetriebenes Dashboard

## Kerninhalte

- zentrale Dashboardkonfiguration
- `visible`
- `order`
- öffentliche bereinigte Config-API
- Anzeige und Schreibrecht getrennt

---

# Sprint 8 – Robustheit und Sicherheit

## Kerninhalte

- Timeouts
- Fehlerbehandlung
- Stale Data
- Teilverfügbarkeit
- Rate Limits
- Payload Limits
- Security Header
- Log Redaction

---

# Sprint 9 – Lokale Mock- und Integrationstests

## Kerninhalte

- localhost-only Mock HA
- keine Produktionscredentials
- Gateway-Integration
- Climate
- Light
- Security
- Fehlerfälle

---

# Sprint 10 – Deployment und Betrieb

## Kerninhalte

- systemd
- Syntaxprüfung
- Tests vor Deployment
- Fast-Forward
- Restart
- Health Check
- Rollback
- GitHub Actions

---

# Sprint 11 – Wall-Display-Betrieb

## Kerninhalte

- Uhr
- Datum
- Verbindungsstatus
- Recovery
- kompakter Header
- Stale-Data-Anzeige

---

# Sprint 12 – UI Polish + Release Baseline

## Ziel

Visuelle und technische Baseline bereinigen.

## Kerninhalte

- Climate Plus/Minus zentrieren
- Climate-Karte kompakter
- Kartenabstände optimieren
- Versionsnummern vereinheitlichen
- tote/ungenutzte Komponenten prüfen
- Rate-Limit-Test isolieren
- Node-Runtime dokumentieren
- Changelog-Basis

Details:

```text
docs/sprints/SPRINT-12.md
```

---

# Sprint 13 – Multi-Dashboard Foundation

## Ziel

Mehrere statische serverseitige Dashboards einführen.

## Kerninhalte

- Dashboard-IDs / Slugs
- Standard-Dashboard
- `/d/:dashboardId`
- Dashboardliste
- dashboard-spezifische Config-API
- dashboard-spezifische State-API
- Legacy-Endpunkte bleiben kompatibel

Details:

```text
docs/sprints/SPRINT-13.md
```

---

# Sprint 14 – Persistent Configuration + Admin API Foundation

## Ziel

Multi-Dashboard-Konfiguration persistent und zur Laufzeit editierbar machen.

## Kerninhalte

- versioniertes Konfigurationsschema
- stabile Widget-IDs
- persistenter Config Store
- atomisches Schreiben
- Backup
- Migration
- Admin-API
- Admin-Token
- Admin-API standardmäßig deaktiviert
- Entity-Inventar

## Persistenz

Bevorzugt:

```text
data/dashboards.json
```

überschreibbar über:

```text
DASHBOARD_CONFIG_PATH
```

## Wichtig

Admin-Konfiguration verändert keine Write-Allowlist.

---

# Sprint 15 – Admin Configuration UI

## Ziel

Grafische Verwaltungsoberfläche unter:

```text
/admin
```

## Kerninhalte

- Admin-Login
- Dashboards verwalten
- Standard-Dashboard wählen
- Entity-Browser
- Widgets hinzufügen/ändern/löschen
- Reihenfolge
- Sichtbarkeit
- Icon-Auswahl
- Speichern/Verwerfen

Details:

```text
docs/sprints/SPRINT-15.md
```

---

# Sprint 16 – Configurable Tile Sizes

## Ziel

Sichere Größen-Presets pro Widget.

## Presets

```text
compact
normal
wide
tall
large
```

## Kerninhalte

- Schema-Erweiterung
- Migration
- Admin-Select
- sichere CSS-Klassen
- responsive Flexbox-Darstellung
- weiterhin kein freies Raster

Details:

```text
docs/sprints/SPRINT-16.md
```

---

# Sprint 17 – Drag-and-Drop Grid Layout

## Status

Abgeschlossen

## Ziel

Rasterbasierter Layouteditor.

## Kerninhalte

- stabile Widget-IDs als Layoutreferenz
- `x`
- `y`
- `w`
- `h`
- Portraitlayout
- Landscapelayout
- Drag-and-drop
- Resize
- Kollisionserkennung
- Bounds
- deterministisches Auto-Placement
- Tastaturalternative
- Legacy-Renderer ohne CSS Grid

Details:

```text
docs/sprints/SPRINT-17.md
```

---

# Sprint 18 – System Dashboard Foundation

## Status

Abgeschlossen

## Ziel

Gemeinsame technische Grundlage für feste dynamische System-Dashboards schaffen.

Noch kein vollständiges Summary- oder Error-Dashboard.

## Neue feste Routen

```text
/system/summary
/system/errors
```

Diese Routen sind:

- immer vorhanden
- nicht löschbar
- nicht Teil normaler Benutzerdashboards
- nicht frei über das Raster editierbar

## Backend-Zielarchitektur

```text
Home Assistant
      |
      v
System State Collector
      |
      v
Normalized System Snapshot
      |
      +-------------------+
      |                   |
      v                   v
Summary Engine        Issue Engine
      |                   |
      v                   v
/system/summary       /system/errors
```

## Gemeinsamer Snapshot

Der Snapshot soll, soweit sicher und verfügbar, enthalten:

- Entity States
- Verfügbarkeit
- Zeitstempel
- Gateway-/HA-Verbindungsstatus
- optionale Entity-/Device-/Area-Metadaten
- später erweiterbare Diagnoseinformationen

## API

Konzeptionell:

```text
GET /api/system-dashboards/summary
GET /api/system-dashboards/errors
GET /api/system-dashboards/status
```

Die tatsächliche Route darf an die bestehende Architektur angepasst werden.

Umgesetzt sind ein gemeinsamer Entity-State-Collector, ein normalisiertes
internes Snapshotmodell, ein In-Memory-Cache mit drei Sekunden TTL und
In-flight-Deduplizierung sowie Stale-/Offline-/Recovery-Semantik. Die
Browserantworten enthalten nur reduzierte Metadaten. Die eigentlichen
Summary- und Issue-Regeln bleiben Sprint 19 beziehungsweise Sprint 20
vorbehalten.

## Anforderungen

- keine doppelten unnötigen HA-Abfragen
- Snapshot für beide System-Dashboards gemeinsam nutzbar
- nur reduzierte Browser-Payloads
- Teilfehler behandelbar
- letzte erfolgreiche Daten speicherbar
- HA-Ausfall != leerer Zustand
- Gateway-Ausfall != HA-Ausfall
- ES5-Frontend
- keine Schreibaktionen

## Neue Architekturmodule bevorzugt

Beispielsweise:

```text
src/services/system-state.js
src/services/entity-metadata.js
src/services/summary/engine.js
src/services/summary/rules.js
src/services/issues/engine.js
src/services/issues/severity.js
```

Keine weitere Konzentration der Logik in `app.js` oder `api.js`.

---

# Sprint 17.1 – Grid Refinement + Responsive Card Content

## Status

Umgesetzt nach Sprint 18 als gezielter Korrektursprint.

## Ergebnis

- persistentes Konfigurationsschema 4
- Portraitraster von 3 auf 6 Spalten verfeinert
- Landscaperaster von 6 auf 12 Spalten verfeinert
- Schema-3-Migration skaliert `x` und `w` exakt einmal mit Faktor 2 und lässt
  `y`/`h` unverändert
- Size Presets dienen weiter der Erstplatzierung; Presentation Modes werden
  nicht persistiert, sondern aus Typ, Breite und Höhe abgeleitet
- `compact`, `normal` und `expanded` für Sensor, Binary, Light und Climate
- Mindestgrößen in Backend und Admin-Editor
- Light- und Climate-Bedienflächen bleiben ungefähr 44×44 Pixel
- Legacy-Renderer bleibt ES5-/iOS-9-kompatibel und verwendet kein CSS Grid
- Sprint-18-Systemrouten und Snapshotarchitektur bleiben fachlich unverändert

---

# Sprint 19 – Summary Dashboard MVP

## Status

Abgeschlossen

## Ziel

Feste dynamische Übersicht:

> Was ist im Haus gerade aktiv, offen, eingeschaltet oder läuft?

Umgesetzt sind explizite Regeln für Light, Switch, relevante Binary Sensoren,
Cover, Vacuum, tatsächliche Climate-Aktionen, Media Player, Fan, Lock und
Alarmanlage. Ergebnisse werden deterministisch nach Priorität und Kategorie
gruppiert. Numerische Sensoren, Bewegung/Präsenz sowie unknown/unavailable
bleiben außen vor. Die persistente Ignorierliste und das standardmäßig
deaktivierte Medientitel-Opt-in werden über die bestehende geschützte Admin UI
verwaltet. Collector, Cache und HA-Write-Allowlists bleiben unverändert.

## Route

```text
/system/summary
```

## MVP-Aktivitätsregeln

### Light

```text
domain: light
active: state == on
```

### Switch

```text
domain: switch
active: state == on
```

nur wenn nicht als technisch/diagnostisch ausgeschlossen.

### Binary Sensor

Relevante Device Classes:

```text
window
door
opening
garage_door
```

aktiv/relevant bei offenem Zustand.

### Cover

Relevant bei:

```text
open
opening
closing
```

und sinnvoller Positionsinformation.

### Vacuum

Relevant bei:

```text
cleaning
returning
paused
```

### Climate

Nicht allein HVAC-Modus verwenden.

Relevant bei tatsächlicher Aktion, z. B.:

```text
heating
cooling
drying
fan
```

### Media Player

MVP optional:

```text
playing
```

## Nicht automatisch anzeigen

Numerische Messsensoren wie:

```text
sensor.temperature
sensor.humidity
```

erscheinen nicht ohne explizite Aktivitätsregel.

## Gruppierung

Standard:

```text
nach Kategorie
```

Optional später:

```text
nach Raum
```

## Standardbereiche

```text
Offen
Läuft gerade
Eingeschaltet
Klima aktiv
Medien aktiv
Weitere relevante Zustände
```

## UI

Kompakte Aktivitätsliste statt großer normaler Dashboardkacheln.

## Offline-Verhalten

HA nicht erreichbar:

```text
nicht "keine Aktivitäten"
```

sondern:

```text
Daten nicht aktuell
Letzte erfolgreiche Aktualisierung: ...
```

## Konfiguration

Mindestens:

- Entities ausschließen
- technische/diagnostische Entities standardmäßig ausschließen
- später erweiterbar für Einschlussregeln

---

# Sprint 17.2 – Card Identity, Proportional Geometry & Theme Persistence

## Status

Umgesetzt nach Sprint 19.

## Ergebnis

- Compact Sensor behält Wert und eindeutige Identität.
- Compact Binary behält Zustand und eindeutige Identität.
- Compact Light behält Zustand, Identität und Control.
- Compact Climate behält Identität, Ist, Soll sowie Minus und Plus.
- Die zentrale Identitätskette lautet Widgettitel, Kurztext/Raum,
  `friendly_name`, Entity-ID.
- Row Height wird mit Faktor `0.9`, Mindesthöhe `128px` und `20px` Gutter aus
  der tatsächlichen Container-/Spaltenbreite berechnet.
- Presentation Modes berücksichtigen Widgettyp, Rastergröße und effektive
  Pixelbreite/-höhe; Geometrie und Entscheidung werden zwischen State-Polls
  gecacht.
- Das bestehende Theme unter `ha-legacy-theme` wird früh geladen und bleibt
  auf Benutzer- und Systemrouten nach Reload erhalten.
- Keine Backend-, Summary-/Error-Fachlogik- oder Write-Änderung.

---

# Sprint 20 – Error Dashboard MVP

## Status

Umgesetzt am 11. August 2026.

## Ergebnis

- `/system/errors` klassifiziert `unavailable` und `unknown` getrennt aus dem
  gemeinsamen Sprint-18-Snapshot.
- Normal: `unavailable -> warning`, `unknown -> info`.
- Explizit sicherheitsrelevant: `unavailable -> critical`, `unknown -> error`.
- Security- und Ignore-Entities sind im geschützten Admin konfigurierbar und
  werden mit Schema 6 atomar persistiert.
- Stale beziehungsweise Offline ergeben niemals `OK`; letzte bekannte Issues
  bleiben bei vorhandenem Snapshot sichtbar.
- Keine Grace Period, Registry-Anreicherung, Historie oder Schreibaktion wurde
  vorgezogen.

## Ziel

Feste Diagnoseansicht:

> Was funktioniert aktuell nicht oder ist gefährdet?

## Route

```text
/system/errors
```

## MVP-Daten

Mindestens:

- `unavailable`
- `unknown`
- Gateway-/HA-Verbindungsstatus
- sicherheitsrelevante Entities
- Dauer des Problems
- Entity-ID
- Anzeigename
- Domain
- Bereich, sofern verfügbar
- Schweregrad

## Verbindliche Trennung

```text
unknown != unavailable
```

## Schweregrade

```text
critical
error
warning
info
```

## Sicherheitsrelevante Entities

Im Admin konfigurierbar.

Bevorzugte Priorität:

1. explizite Markierung in HA Legacy Dashboard
2. Sicherheitsgruppe
3. HA Label, falls verfügbar
4. Bereich/Gerät
5. Heuristik
6. manuelle Nachbearbeitung

## Leerer Zustand

Nur wenn aktuelle Daten erfolgreich geladen wurden:

```text
Keine aktiven Störungen erkannt.
```

Bei HA-Ausfall niemals „alles OK“.

---

# Sprint 17.3 – Live Card Preview, Unified Controls & Focus Mode

## Status

Umgesetzt nach Sprint 20.

## Ergebnis

- Der Admin-Layouteditor zeigt aktuelle, sanitisierte Entity-Zustände als
  Card-Preview in Portrait/Landscape sowie Hell/Dunkel.
- Preview-Controls sind echte, deaktivierte Buttons und lösen niemals einen
  Home-Assistant-Schreibzugriff aus.
- Legacy und Admin verwenden dieselben reinen Regeln für Identität,
  Rastergeometrie und Presentation Mode.
- Light verwendet ein gemeinsames dashboard-eigenes Power-Control statt des
  bisherigen iOS-Switch-Stils.
- Climate Power verwendet ausschließlich `POST /api/climate/power`, die
  bestehende Climate-Allowlist und serverseitig eindeutig ermittelte
  Power-On-Modi.
- Ein temporäres, Legacy-kompatibles Focus-Overlay zeigt den vollständigen
  Card-Inhalt und erlaubte Controls, ohne das Raster zu verändern.
- Summary- und Error-Fachlogik sowie alle bestehenden Write-Allowlists bleiben
  unverändert.

---

# Sprint 17.4 – Focus Overlay Layout Stabilization

## Status

Umgesetzt nach Sprint 21.

## Ergebnis

- Die Focus Card verwendet `window.innerWidth` und `window.innerHeight` mit
  sicheren DOM-Fallbacks statt einer ausschließlich statischen CSS-Höhe.
- Sensor, Binary, Light und Climate erhalten getrennte Focus-Regionen für
  Identität, Primärwert, Controls und sekundäre Informationen.
- Feste Focus-Mindesthöhen und doppelte Overlay-/Shell-Scrollcontainer wurden
  entfernt; nur der Focus-Inhalt scrollt kontrolliert bei echter Überhöhe.
- Light Power sowie Climate Ist, Soll, Minus, Plus und erlaubtes Power-Control
  bleiben im iPad-Portrait- und -Landscape-Viewport ohne unnötiges Scrollen
  erreichbar.
- Resize und Orientation Change vermessen den offenen Focus neu, ohne einen
  zweiten Focus oder eine neue Pollingpipeline zu erzeugen.
- Der Dashboard-Hintergrund wird während Focus gesperrt und die vorherige
  Scrollposition beim Schließen wiederhergestellt.
- Summary-/Error-Fachlogik, Write-Routen, Allowlisten und HA-Sicherheitsgrenzen
  bleiben unverändert.

---

# Sprint 17.5 – Native Focus Renderer & Mobile Safari Stabilization

## Status

Umgesetzt nach Sprint 17.4.

## Ergebnis

- Focus ist keine weitere Grid-Kartengröße mehr, sondern eine eigenständige
  Interaction View aus Widgetdefinition, aktuellem Zustand und den bereits
  serverseitig bestimmten Capabilities.
- `renderSensorFocus`, `renderBinaryFocus`, `renderLightFocus` und
  `renderClimateFocus` erzeugen Focus-eigenes DOM ohne Clone, `x/y/w/h`,
  Grid-Inline-Geometrie oder Compact-/Normal-/Expanded-Klassen.
- Ein reines Focus View Model bindet State Refresh, stale/unavailable und
  erlaubte Controls an die stabile Widget-ID, ohne eine zweite Pollingpipeline.
- Der abgeschottete Focus-CSS-Namespace setzt echte Viewportbreiten,
  `box-sizing` und expliziten Shrink-Schutz für Panel, Widgets und Controls.
- Minus/Plus bleiben 56×56 Pixel und Power mindestens 54 Pixel hoch; Portrait,
  Landscape und ein kleiner 320×460-Legacy-Viewport bleiben ohne Überlauf.
- Der Sprint-17.4-Scroll-Lock, Theme-Persistenz, Grid, Admin Preview,
  Summary-/Error-Fachlogik und alle Write-Sicherheitsgrenzen bleiben erhalten.
- Die echte iPad-Air-2-/iPadOS-15.8.5- sowie iOS-9-Safari-Abnahme bleibt nach
  dem produktiven Rollout als manueller Gerätecheck dokumentiert.

---

# Sprint 17.6 – Power Control Alignment & Icon Stabilization

## Status

Umgesetzt nach Sprint 21.2.

## Ergebnis

- Light und Climate verwenden in Compact, Normal und Focus denselben
  `LegacyControls.powerButton` mit einem einzigen fest dimensionierten
  Inline-SVG; der Focus Renderer besitzt keine zweite Power-Icon-
  Implementierung mehr.
- Die Fehlausrichtung entstand durch zwei getrennte Button-/SVG-Pfade: Die
  sichtbare Grid-Pfadgeometrie lag im `viewBox` leicht oberhalb der optischen
  Mitte; das Focus-SVG blieb zusätzlich inline und damit baseline-abhängig.
  Grid und Focus erbten außerdem unterschiedliche `line-height`-, Padding- und
  Größenregeln.
- Der gemeinsame Button neutralisiert native Safari-Appearance, Text- und
  SVG-Baselines, verwendet symmetrisches Padding, explizites `border-box` und
  feste 46-/48-/52-/54-Pixel-Kontextgrößen bei mindestens 44 Pixel Touchziel.
- On, Off, Busy, Disabled, Unavailable und Error verwenden dieselbe
  Control-Geometrie; Icon-only und Icon-plus-Label stammen aus demselben DOM.
- Die native Sprint-17.5-Focus-Architektur bleibt vollständig von Grid-
  Geometrie und Presentation-Klassen getrennt.
- Summary-/Error-Logik, Home-Assistant-Aufrufe, Write-Routen und Allowlisten
  bleiben unverändert.
- Die physische Abnahme auf macOS Safari, iPad Air 2 und iOS 9 bleibt nach dem
  produktiven Rollout ein manueller Gerätecheck.

---

# Sprint 21 – Registry & Diagnostic Enrichment

## Status

Umgesetzt nach Sprint 17.3 und D1.

## Ziel

System-Dashboards mit zusätzlichen strukturierten HA-Metadaten anreichern.

## Zu prüfen

- Entity Registry
- Device Registry
- Area Registry
- Config Entries
- Repairs / Issues
- Matter-bezogene Daten
- Integrationsstatus

## Wichtig

Dieser Sprint beginnt mit einer Capability-Prüfung gegen die tatsächlich
unterstützte Home-Assistant-Version.

Für jede Quelle klären:

```text
REST verfügbar?
WebSocket erforderlich?
offiziell/stabil?
intern/undokumentiert?
sicher nutzbar?
```

Nur belastbare Schnittstellen produktiv verwenden.

## Matter

Matter wird als spezialisierte Diagnosequelle behandelt, nicht als eigenes
Parallelframework.

Ziel:

```text
Matter-Komponente gestört
X Geräte betroffen
Y Entities betroffen
```

statt nur vieler einzelner Entity-Fehler.

## Ergebnis

- Ein ausschließlich serverseitiger, authentifizierter HA-WebSocket-Client
  verarbeitet eindeutige IDs, Timeouts, Disconnect und begrenzten Reconnect.
- Feste Read-only-Adapter lesen Entity-, Device- und Area Registry,
  Config Entries und – capability-gesteuert – Repairs.
- Matter besitzt keine belastbar belegte generische Read-only-Diagnose-API und
  bleibt deshalb kontrolliert `unsupported`; es wird kein Matter-Command
  gesendet.
- Unabhängige TTL-Caches verhindern Registry-Abrufe pro Browser-Poll und
  deduplizieren parallele Aktualisierungen.
- Summary und Errors erhalten nur reduzierte Device-, Area-, Integrations- und
  Plattformfelder; rohe Registries, Identifier, Connections und Secrets
  bleiben im Backend.
- Disabled, hidden, unavailable, unknown und registry-only werden getrennt
  behandelt.
- Problematische Config-Entry-States und Repairs werden read-only in die
  bestehende Issue Engine normalisiert.
- Der Admin-Systembereich zeigt nur Source-Status, keine Registry-Inhalte und
  keine Aktionen.

---

# Sprint 21.1 – Error Dashboard Device Aggregation & Navigation

## Status

Umgesetzt nach Sprint 21.

## Ergebnis

- Die unveränderten Sprint-20-/21-Issues werden in einer eigenen read-only
  Presentation-Schicht ausschließlich über eine echte `device_id` zu Device
  Cards aggregiert.
- Entities ohne Device-ID sowie Config-Entry-, Repair-, Matter- und sonstige
  System-Issues bleiben Standalone.
- Group Severity entspricht der höchsten Child-Severity, Security-Relevanz
  wird propagiert und die älteste aktive Child-Dauer bestimmt die Gruppendauer.
- Alle, Kritisch, Fehler, Warnungen und Unknown sind ohne Reload einzeln
  filterbar; Unknown bleibt ein State-Filter.
- Child-Entities sind standardmäßig eingeklappt und werden erst beim
  ES5-kompatiblen Details-Toggle in den DOM eingefügt.
- Breite Viewports verwenden ein zweispaltiges Flexbox-Layout, schmale
  Viewports eine Spalte; CSS Grid und Flexbox-`gap` bleiben ausgeschlossen.
- Es gibt keine zusätzliche Home-Assistant-Abfrage, keine neue Admin-
  Konfiguration und keine Write-Funktion.

---

# Sprint 21.2 – System Dashboard Filters, Column Views & Risk Severity

## Status

Umgesetzt nach Sprint 21.1.

## Ergebnis

- Summary filtert ohne Reload über die bereits serverseitig normalisierten
  Kategorien `open`, `powered`, `running`, `cleaning`, `climate`, `media`,
  `movement` und `security`; im Browser existiert keine zweite Fachlogik.
- Summary und Errors verwenden dieselbe ES5-kompatible Filterdarstellung.
- Beide System-Dashboards besitzen getrennt persistierte 1-/2-/3-Spalten-
  Präferenzen mit Flexbox, Width/Wrapping und responsivem Fallback.
- Die zentrale Risk Class unterscheidet `safety`, `security`, `normal` und
  `diagnostic` anhand normalisierter Domain-, Device-Class- und Registry-
  Metadaten, ohne Name-only-Heuristik.
- Safety-/Security-Entities werden für `unknown` und `unavailable` als
  Critical bewertet; normale und diagnostische Entities behalten die
  bisherigen milderen Regeln.
- Explizite `securityEntities` bleiben vorrangig. Device Groups übernehmen
  weiterhin die höchste Child-Severity und werden nur über echte `device_id`
  gebildet.
- Filter und Spaltenwechsel sind rein lokal, erzeugen keine HA-Abfrage und
  weder neue Write-Routen noch Write-Berechtigungen.

---

# Sprint 22 – Rules, Grace Periods & Device Aggregation

## Ziel

Fehlalarme reduzieren und Summary-Einträge semantisch verbessern.

## Fehler-Dashboard

Einführen:

- globale Karenzzeit
- sicherheitskritische Karenzzeit
- Entity-spezifische Karenzzeit
- Ignorierliste
- erwarteter Offlinezustand
- Flapping-Erkennung
- automatische Rücknahme nach Wiederherstellung

Beispiel:

```text
normal: 120 Sekunden
security critical: 15 Sekunden
```

## Summary-Dashboard

Einführen:

- Mindestdauer
- Nachlaufzeit
- Entprellung
- explizite Include-/Exclude-Regeln
- benutzerdefinierte Aktivitätsregeln
- Leistungs-Schwellwerte

Beispiel:

```text
Waschmaschine Leistung > 8 W
Mindestdauer 30 s
Nachlauf 60 s
```

## Geräteaggregation

Mehrere Entities eines Geräts werden zu einem verständlichen Summary-Eintrag
zusammengeführt.

Beispiel:

```text
Waschmaschine läuft
Baumwolle · noch ca. 24 Minuten
```

---

# Sprint 23 – Automation Impact & Advanced Diagnostics

## Ziel

Potenzielle Auswirkungen von Fehlern auf Automationen analysieren.

## Funktionen

- Entity-Referenzen in Automationen finden
- Trigger/Bedingung/Aktion unterscheiden, sofern zuverlässig
- sicherheitsrelevante Automationen markieren
- potenziell betroffene Alarmketten hervorheben

## Wichtige Formulierung

Keine falsche Sicherheit erzeugen.

Nicht:

```text
Automation funktioniert nicht
```

sondern:

```text
Automation potenziell betroffen
```

## Einschränkungen

Besonders berücksichtigen:

- Templates
- Blueprints
- Gruppen
- indirekte Referenzen
- dynamische Entity-IDs

## Spätere optionale Erweiterungen

- Historie
- Quittierung
- Wartungsmodus
- Benachrichtigungen
- Zustandszusammenfassungen

---

# Sprint 24 – Home Assistant App Packaging

## Ziel

HA Legacy Dashboard zusätzlich als Home-Assistant-App betreibbar machen.

Standalone-Betrieb bleibt erhalten.

## Zielmodelle

```text
1. Standalone
   LXC / VM / Docker / Node.js

2. Home Assistant App
   Home Assistant OS / Supervisor
```

## Kerninhalte

- App-Repository-Struktur
- Container-Image
- persistente Daten unter `/data`
- Gateway-Konfigurationspfade abstrahieren
- Home-Assistant-API sicher über Supervisor-Kontext nutzen
- Admin-Oberfläche integrieren
- System-Dashboards integrieren
- bestehende Legacy-Routen erhalten

## Wichtig

Keine Abhängigkeit davon, dass das Legacy-iPad die moderne HA-Oberfläche
anzeigen kann.

---

# Sprint 25 – Release & Distribution

## Ziel

Nachvollziehbare veröffentlichbare Version.

## Kerninhalte

- konsistente Version
- Release-Tags
- `CHANGELOG.md`
- Installationsanleitung
- Upgrade
- Rollback
- Troubleshooting
- Security-Dokumentation
- Testdokumentation
- Home-Assistant-App-Installationsanleitung
- Standalone-Installationsanleitung
- Screenshots
- bekannte Einschränkungen
- unterstützte HA-/Node-Versionen
- Lizenzstatus final klären

---

# Gemeinsames Datenmodell der System-Dashboards

## Summary

Konzept:

```text
SummaryItem
```

Felder sinngemäß:

```text
id
entityIds[]
deviceId
areaId
category
priority
title
description
state
startedAt
updatedAt
durationSeconds
progress
remainingSeconds
icon
metadata
```

## Error

Konzept:

```text
DashboardIssue
```

Felder sinngemäß:

```text
id
source
severity
status
title
description
startedAt
updatedAt
integrationDomain
configEntryId
deviceId
entityId
areaId
securityRelevant
affectedAutomations[]
metadata
```

Die endgültigen Modelle müssen an die tatsächliche JavaScript-/Node-Architektur
angepasst werden.

---

# Gemeinsame System-Dashboard-Konfiguration

System-Dashboards dürfen konfigurierbare Regeln besitzen, aber nicht wie normale
Dashboards vollständig löschbar oder frei umbaubar sein.

## Summary-Konfiguration

Mögliche Einstellungen:

- Gruppierung
- Ignore Entities
- Include Entities
- ausgeschlossene Entity Categories
- Mindestdauer
- Nachlaufzeit
- Schwellenwerte
- benutzerdefinierte Regeln

## Error-Konfiguration

Mögliche Einstellungen:

- Security Entities
- Grace Period
- Security Grace Period
- Ignore Entities
- erwartete Offlinegeräte
- Severity Overrides
- Matter-/Integrationsfilter

## Persistenz

Diese Einstellungen sollen in die bestehende versionierte Konfiguration oder
einen klar getrennten Systembereich derselben Persistenzarchitektur integriert
werden.

Keine parallele unversionierte Konfigurationsdatei ohne Grund.

---

# Navigation

Ab Sprint 18 soll die Anwendung konzeptionell folgende Ziele kennen:

```text
Benutzerdashboards:
/d/:dashboardId

System:
/system/summary
/system/errors

Administration:
/admin
```

Die Navigation selbst muss auf dem Legacy-Gerät kompakt bleiben.

System-Dashboards sollen direkt per URL aufrufbar sein.

---

# Performance-Grundsätze

Für System-Dashboards:

- keine Einzelabfrage pro Listenzeile, wenn Sammelabfrage möglich
- gemeinsame Datengrundlage für Summary und Error
- serverseitig normalisieren
- Browser-Payload reduzieren
- Diagnoseattribute filtern
- DOM-Anzahl begrenzen
- lange Listen gruppieren, paginieren oder schrittweise darstellen
- keine unnötigen Animationen
- Polling bleibt zunächst Standard
- Browser verbindet sich niemals direkt mit Home Assistant

Serverseitiger WebSocket darf später separat bewertet werden, ist aber keine
Voraussetzung.

---

# Fehler- und Offline-Semantik

Verbindlich:

```text
keine Daten
!=
keine Probleme
```

und:

```text
keine Daten
!=
keine Aktivitäten
```

Bei HA-Ausfall:

- letzte erfolgreiche Daten sichtbar halten
- Stale-Status anzeigen
- letzten erfolgreichen Zeitpunkt anzeigen
- keine falsche grüne/ruhige Aussage

---

# Sicherheitsregeln für zukünftige Schnellaktionen

System-Dashboards sind im MVP read-only.

Spätere Aktionen wie:

```text
Licht ausschalten
Cover schließen
Vacuum pausieren
Integration neu laden
```

dürfen nur eingeführt werden, wenn:

- eigener Sprint
- expliziter Backend-Endpunkt
- explizite Entity-/Service-Allowlist
- serverseitige Validierung
- Rate Limit
- kein generischer Service-Proxy
- passende Bestätigung bei kritischen Aktionen

System-Dashboard-Sichtbarkeit allein berechtigt niemals zu Aktionen.

---

# Codex-Arbeitsregeln

Vor jedem Sprint:

```bash
git status
git log --oneline -15
```

Dann lesen:

```text
AGENTS.md
README.md
docs/CODEX_HANDOFF.md
docs/SPRINT_ROADMAP.md
docs/PROJECT_STATUS.md
aktuelle Sprint-Datei
```

Nach jedem Sprint:

- vollständige Tests
- relevante `node --check`
- `docs/PROJECT_STATUS.md` aktualisieren
- Roadmapstatus aktualisieren
- keine Secrets committen
- nicht committen/pushen, wenn der Benutzer dies nicht freigegeben hat

---

# Kommunikationsmodell Chat ↔ Codex

Verbindliche Übergabedateien:

```text
AGENTS.md
docs/SPRINT_ROADMAP.md
docs/PROJECT_STATUS.md
docs/sprints/SPRINT-XX.md
```

Ablauf:

```text
Planung in ChatGPT
       |
       v
Sprint-Datei
       |
       v
Codex implementiert
       |
       v
PROJECT_STATUS.md
       |
       v
nächste Planung
```

---

# Priorisierte Reihenfolge ab Sprint 17

```text
18  System Dashboard Foundation
19  Summary Dashboard MVP
20  Error Dashboard MVP
21  Registry & Diagnostic Enrichment
21.1 Error Dashboard Device Aggregation & Navigation
21.2 System Dashboard Filters, Column Views & Risk Severity
22  Rules, Grace Periods & Device Aggregation
23  Automation Impact & Advanced Diagnostics
24  Home Assistant App Packaging
25  Release & Distribution
```

---

# Architekturentscheidung: System-Dashboards sind kein Lovelace-Ersatz

Auch mit Summary und Error bleibt HA Legacy Dashboard bewusst begrenzt.

Es wird nicht zu:

- vollständigem Lovelace-Ersatz
- generischem HA-Frontend
- beliebigem Service-Terminal
- universellem Admin-Frontend für Home Assistant

Ziel bleibt:

> Eine kleine, sichere, performante und iOS-9-kompatible externe Oberfläche
> für ausgewählte Home-Assistant-Informationen und ausdrücklich freigegebene
> Aktionen.

---

# Nächster Sprint

Nach Abschluss von Sprint 21.2:

```text
Sprint 22 – Rules, Grace Periods & Device Aggregation
```

Die Device-Aggregation des Error Dashboards bleibt die reine Präsentations-
funktion aus Sprint 21.1; Sprint 21.2 ergänzt lokale Filter/Spaltenansichten
und eine metadatenbasierte Risk Class. Sprint 22 ergänzt fachliche Karenz-,
Flapping- und erwartete Offline-Regeln sowie die geplante semantische Geräte-
aggregation im Summary Dashboard. Diese Regeln benötigen eine eigene
Spezifikation und dürfen die bestehenden Write-Sicherheitsgrenzen nicht
verändern.
