# Projektstatus – HA Legacy Dashboard

Stand der Prüfung: 10. August 2026

Dieser Bericht beschreibt den Arbeitsstand nach Umsetzung von Sprint 13. Er
enthält keine Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine
Tokens.

## 1. Aktueller Branch und Commit

- Branch: `main`
- Implementierungsbasis: `794d523`
- Ausgangscommit: `docs: define sprint 13 multi-dashboard foundation`
- Upstream: `origin/main`
- Vor Sprint 13 waren lokales `HEAD` und `origin/main` synchron.

## 2. Status des Arbeitsbaums

Sprint 13 ist im Arbeitsbaum implementiert. Betroffen sind:

- Backend-Konfiguration und Routing
- Frontend-Routing und Cache-Version
- Konfigurations-, Frontend-, Gateway- und Standalone-Tests
- README, Changelog, Roadmap und dieser Statusbericht

Die vorgefundene lokale Änderung an dieser Datei beschrieb einen älteren
Pre-Sprint-12-Stand. Sie wurde nicht blind übernommen, sondern mit dem
tatsächlichen Sprint-12- und Sprint-13-Stand zusammengeführt.

## 3. Implementierte Funktionen

### Backend und Sicherheit

- Express-Gateway zwischen Browser und Home Assistant
- HA-Zugangsdaten ausschließlich im Backend
- bereinigte Lese-APIs für statisch konfigurierte Dashboards
- explizit getrennte Schreib-Allowlisten für Climate und Light
- fest zugeordnete HA-Services
- Validierung, Payload-Limit, Rate-Limit und Sicherheitsheader
- strukturierte Logs mit Redaktion sensitiver Felder
- kein generischer HA-Service-Endpunkt

### Frontend

- ES5-kompatibles JavaScript ohne Framework oder externe Abhängigkeiten
- XHR-Kommunikation ausschließlich über `Legacy.http`
- Sensor-, Binary-, Light- und Climate-Widgets
- optimistische Climate- und Light-Bedienung
- responsives Flexbox-Layout für Portrait und Landscape
- Light-/Dark-Mode, Uhr, Datum und Verbindungsanzeige
- iOS-9-Standalone-Metadaten und lokale Icons
- mehrere Dashboard-URLs ohne clientseitiges Router-Framework

### Multi-Dashboard

- statische Dashboardprofile mit stabiler ID und Titel
- Standard-Dashboard `default`
- zweites Profil `esszimmer`
- dashboard-spezifische öffentliche Konfiguration
- dashboard-spezifische, deduplizierte Entity-Leselisten
- kontrollierte 404-Antworten für unbekannte IDs
- dynamischer Titel im sichtbaren Header und Dokumenttitel
- bestehende Einzel-Dashboard-Routen bleiben kompatibel

## 4. Implementierte Sprints

| Sprint | Thema | Stand |
|---|---|---|
| 0–3 | Grundlage, Gateway, Legacy-UI und Widgets | umgesetzt |
| 4 | Climate-Steuerung | umgesetzt und gegen veraltete States abgesichert |
| 5 | iOS-9-Standalone-Web-App | umgesetzt |
| 6 | Light-Steuerung | umgesetzt und explizit allowlisted |
| 7 | Konfigurationsgetriebenes Dashboard | umgesetzt |
| 8 | Robustheit und Sicherheit | umgesetzt |
| 9 | Lokale Mock- und Integrationstests | umgesetzt |
| 10 | Deployment und Betrieb | umgesetzt |
| 11 | Wall-Display-Betrieb | umgesetzt |
| 12 | UI-Polish und Release-Baseline 1.0.0 | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |

## 5. Aktueller Mechanismus zur Entity-Auswahl

Lesende Entity-Auswahl entsteht ausschließlich aus den sichtbaren Widgets des
angeforderten Profils in `src/config/dashboard.js`. Die Entity-IDs werden
vor der HA-Abfrage pro Dashboard dedupliziert.

Das Standard-Dashboard liest:

- `sensor.badezimmer_smart_indoor_module_temperatur`
- `sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit`
- `binary_sensor.kuche_fenster_rechts`
- `light.esszimmer_lampen`
- `climate.esszimmer_thermostate`

`binary_sensor.kuche_fenster_mitte` bleibt konfiguriert, ist aber unsichtbar
und wird deshalb nicht gelesen.

Das Dashboard `esszimmer` liest ausschließlich:

- `light.esszimmer_lampen`
- `climate.esszimmer_thermostate`

Schreibrechte werden nicht daraus abgeleitet. Climate und Light verwenden
weiterhin die unveränderten, separaten Allowlists in `src/routes/api.js`.

## 6. Aktueller Mechanismus der Dashboardkonfiguration

`src/config/dashboard.js` exportiert ein validiertes statisches Modell mit:

- `defaultDashboardId`
- Dashboardliste mit `id`, `title`, `refreshIntervalMs` und `widgets`
- Lookup-, Public-Config-, Sortier- und Entity-Listen-Helfern
- Startvalidierung für IDs, Duplikate, Titel, Widgets, Typ, Reihenfolge,
  Sichtbarkeit und Standard-Dashboard

Rückgabewerte werden geklont, damit Aufrufer die zentrale Konfiguration nicht
versehentlich verändern.

## 7. Aktuelle Multi-Dashboard-Unterstützung

Verfügbar sind:

| ID | Titel | Browserpfad |
|---|---|---|
| `default` | Übersicht | `/` und `/d/default` |
| `esszimmer` | Esszimmer | `/d/esszimmer` |

Es gibt noch keinen Dashboard-Selector. Direkte, stabile URLs sind die
vorgesehene Auswahlmethode für Sprint 13.

## 8. Aktuelle Kachelpositionierung und Größenunterstützung

- Reihenfolge über numerisches `order`
- Sichtbarkeit über `visible`
- responsive Breite über bestehendes Flexbox-Layout
- kompakte Climate-Karte und mindestens ungefähr 44 Pixel große Touchziele
- keine freie Positionierung
- keine persistierbaren Größen
- kein CSS Grid, Drag-and-drop oder Layouteditor

Sprint 13 verändert das Layoutmodell nicht.

## 9. Aktuelle Admin- oder Konfigurationsoberfläche

Es gibt keine Admin- oder Konfigurationsoberfläche. Dashboardänderungen sind
versionierte Quellcodeänderungen. Es existieren keine Browser-Endpunkte zum
Speichern, Erstellen, Löschen oder Umsortieren von Dashboards.

## 10. Aktuelles Deploymentmodell

- Git-Repository auf Branch `main`
- Produktionspfad `/home/dashboard/ha-legacy-dashboard`
- Fast-Forward-Deployment über `deploy/deploy.sh`
- systemd-Dienst `ha-legacy-dashboard.service`
- enger sudoers-Eintrag nur für den Dienstneustart
- Health-Check und recoverable Rollback
- `.env` bleibt lokal im LXC und wird weder committed noch ausgeliefert

## 11. Relevante Dateien je Bereich

| Bereich | Dateien |
|---|---|
| Regeln und Status | `AGENTS.md`, `README.md`, `docs/CODEX_HANDOFF.md`, `docs/SPRINT_ROADMAP.md` |
| Sprint 13 | `docs/sprints/SPRINT-13.md`, `src/config/dashboard.js` |
| HTTP- und Browser-Routing | `src/server.js`, `src/routes/api.js`, `src/public/js/app.js` |
| Frontendstruktur | `src/public/index.html`, `src/public/css/style.css` |
| Widgets | `src/public/js/widgets/*.js`, `src/public/js/core/dashboard.js` |
| HA-Integration | `src/services/homeassistant.js`, `src/routes/api.js` |
| Persistenz | `src/public/js/core/theme.js` für Theme; keine Dashboardpersistenz |
| Deployment | `deploy/deploy.sh`, `deploy/health-check.sh`, `deploy/rollback.sh` |
| Tests | `test/*.test.js` |

### Aktuelle URL-Routen

| Methode | URL | Funktion |
|---|---|---|
| GET | `/` | Standard-Dashboard |
| GET | `/d/:dashboardId` | konfiguriertes Dashboard oder 404 |
| GET | `/api/status` | Gateway- und HA-Status |
| GET | `/api/dashboards` | öffentliche Dashboardliste |
| GET | `/api/dashboards/:dashboardId/config` | öffentliche Profilkonfiguration |
| GET | `/api/dashboards/:dashboardId/state` | profilbegrenzte Zustände |
| GET | `/api/dashboard/config` | Legacy-Konfiguration des Standards |
| GET | `/api/dashboard` | Legacy-Zustände des Standards |
| POST | `/api/climate/temperature` | allowlisted Climate-Schreibzugriff |
| POST | `/api/light/state` | allowlisted Light-Schreibzugriff |

## 12. Vorhandene Tests und Ergebnis

Ausgeführt:

```bash
node --check src/config/dashboard.js
node --check src/routes/api.js
node --check src/server.js
node --check src/public/js/app.js
npm test
```

Ergebnis:

```text
tests 45
pass 45
fail 0
cancelled 0
skipped 0
```

Die Integrationstests verwenden ausschließlich einen lokalen Mock-Home-
Assistant mit Testtoken. Sie prüfen unter anderem:

- beide Dashboardprofile und das Standard-Dashboard
- öffentliche Liste ohne Secret
- profilbezogene Konfiguration und Leseliste
- deduplizierte State-Abfragen
- Legacy-Endpunkte
- Browserpfade und kontrollierte 404-Antworten
- Frontend-Pfaderkennung und Dashboardtitel
- unverändert erlaubte und verbotene Climate-/Light-Schreibzugriffe
- bestehende Robustheits-, Sicherheits-, Standalone- und Deploymentfälle

## 13. Bekannte Defekte

Im automatisierten Testlauf wurde kein funktionaler Defekt reproduziert.
Manuell offen bleibt die Abnahme auf Safari iOS 9 im Portrait- und
Landscape-Modus. Das Zielgerät soll insbesondere beide Dashboard-URLs,
Light-/Climate-Bedienung und das Home-Screen-Verhalten prüfen.

## 14. Technische Schulden

- Dashboardprofile werden nur im Quellcode gepflegt.
- Es gibt keinen Dashboard-Selector im Frontend.
- Konfigurationsvalidierung läuft beim Prozessstart, aber es gibt noch kein
  separates Schemaformat.
- Layoutpositionen und Größen sind nicht frei konfigurierbar.
- Das In-Memory-Rate-Limit ist absichtlich nicht prozessübergreifend.
- Die produktive Node-Version ist nicht durch ein `engines`-Feld fixiert.
- Eine Projektlizenz wurde noch nicht durch den Eigentümer festgelegt.

## 15. Abweichungen zwischen Roadmap und tatsächlichem Code

Die Roadmap wurde für Sprint 12 und 13 aktualisiert. Verbleibende historische
Abweichungen:

- Die Sprint-3-Entityliste nennt den mittleren Fenstersensor, obwohl er aktuell
  unsichtbar ist.
- „Konfigurationsgetriebene Dashboards“ in Sprint 7 beschrieb ursprünglich nur
  ein Profil; echte Multi-Dashboard-Unterstützung beginnt erst mit Sprint 13.
- Die priorisierte Reihenfolge ist eine historische Umsetzungsfolge und keine
  aktuelle Backlog-Priorisierung.

## 16. Empfohlener nächster Sprint

Empfohlen wird Sprint 14 als kleine, read-only Dashboard-Navigation:

- optionaler ES5-kompatibler Selector oder kompakte Linknavigation
- Daten ausschließlich aus `GET /api/dashboards`
- keine Schreibpersistenz und keine Ableitung von Berechtigungen
- weiterhin stabile Direkt-URLs für iOS-Home-Screen-Verknüpfungen

Vor neuen schreibbaren Widgets sollte weiterhin eine separate
Sicherheitsentscheidung mit eigener Entity- und Service-Allowlist erfolgen.
