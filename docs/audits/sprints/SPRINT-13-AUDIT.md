# Sprint 13 Audit

## Audit Metadata

- Sprint: 13
- Sprint title: Multi-Dashboard Foundation
- Audit date: 31. August 2026
- Repository commit: `8d2295a`
- Spec file: [`docs/sprints/SPRINT-13.md`](../../sprints/SPRINT-13.md)

## Overall Result

PARTIAL

Multi-Dashboard-Modell, APIs, Routing, Migration und Sicherheitsgrenze sind im
aktuellen Repository automatisiert belegt. Die spezifizierte reale iPad- und
Home-Assistant-Abnahme wurde in diesem Auditlauf nicht wiederholt.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 13-D1 | Mehrere benannte Profile mit stabilen, validierten IDs, getrennten Titeln und eindeutigem Standard-Dashboard | PASS | `src/config/dashboard.js`: `DASHBOARD_ID_PATTERN`, `validateConfiguration()`, `getDefaultDashboard()`, `getDashboardById()`; `test/dashboard-config.test.js` | Aktuell existieren `default` und `esszimmer`. |
| 13-D2 | Keine Mutation, `order`-Sortierung, `visible: false`, unbekannte ID ohne Fallback | PASS | `src/config/dashboard.js`: Clone-/Public-Getter, `getVisibleWidgets()`, `getVisibleEntityIds()`; `test/dashboard-config.test.js` | Getter liefern geklonte öffentliche Modelle. |
| 13-D3 | Bisheriges Dashboard vollständig als Standardprofil und zweites Profil nur aus vorhandenen Entities | PASS | `src/config/dashboard.js`: `createDefaultConfiguration()`; Migrations-/Gateway-Fixtures | Spätere Schema-Migrationen erhalten das Modell. |
| 13-A1 | `GET /api/dashboards` liefert nur öffentliche Liste | PASS | `src/routes/api.js` Route `/dashboards`; `test/gateway.test.js` | Keine Tokens, Allowlists, Dienste oder Dateipfade im Payload. |
| 13-A2 | Dashboard-spezifische Config- und State-APIs | PASS | `src/routes/api.js`: `/dashboards/:dashboardId/config`, `/dashboards/:dashboardId/state`; `test/gateway.test.js` | State-Pfad verwendet die dashboard-spezifische Entity-Liste. |
| 13-A3 | Unbekanntes Dashboard kontrolliert 404 ohne interne Details | PASS | `src/routes/api.js`, `src/server.js`; Tests für unbekannte API- und `/d/`-IDs in `test/gateway.test.js` | Kein stiller Default-Fallback. |
| 13-A4 | Legacy-Endpunkte liefern weiter das Standard-Dashboard | PASS | `src/routes/api.js`: `/dashboard/config`, `/dashboard`; `test/gateway.test.js` | Rückwärtskompatibilität bleibt erhalten. |
| 13-R1 | `/`, `/d/default`, `/d/<zweites>`; gültige Route liefert Legacy-App, unbekannte Route 404 | PASS | `src/server.js` Route `/d/:dashboardId`; `src/public/js/app.js`: Pfadparser; `test/gateway.test.js` | Kein moderner Frontend-Router. |
| 13-F1 | Frontend liest Dashboard-ID ES5-kompatibel aus `window.location.pathname`, lädt passende APIs und übernimmt Titel | PASS | `src/public/js/app.js`: `getDashboardIdFromPath()`, Config-/State-URL-Aufbau und Titelupdate; `test/gateway.test.js`, `test/legacy-compat.test.js` | Browserkommunikation läuft über `Legacy.http`. |
| 13-E1 | Nur sichtbare Entities des angeforderten Dashboards lesen und Duplikate deduplizieren | PASS | `src/config/dashboard.js`: `getVisibleEntityIds()`; `src/routes/api.js`; `test/gateway.test.js` | Dieselbe Entity darf in mehreren Dashboards stehen. |
| 13-S1 | Sichtbarkeit und Write-Autorisierung strikt getrennt; Light/Climate aus jedem Dashboard nur bei expliziter serverseitiger Erlaubnis | PASS | `src/services/control-authorization.js`; `src/config/dashboard.js`: öffentliche Widgets ohne `control`; `test/admin-api.test.js`, `test/sprint-26-2.test.js`, `test/gateway.test.js` | Die ursprünglichen statischen Allowlists wurden in Sprint 26.2 bewusst durch explizite persistente Control-Grants ersetzt; Sichtbarkeit erteilt weiterhin nie Schreibrecht. |
| 13-L1 | Sprint 13 verändert Layout nicht und führt keine Koordinaten/Größen ein | N/A | Historischer Sprint-13-Commit `ac822d2`; heutige Felder stammen aus Sprint 16/17/26 | Spätere Sprints superseden dieses zeitlich begrenzte Nicht-Ziel. |
| 13-P1 | Sprint 13 bleibt bei Repository-Konfiguration ohne Laufzeitpersistenz | N/A | Historischer Commit `ac822d2`; Persistenz wurde anschließend ausdrücklich in Sprint 14 eingeführt | Kein heutiger Defekt. |
| 13-V1 | ID, Titel, Widgets, Typ, Entity, `order`, `visible` und Default früh validieren | PASS | `src/config/dashboard.js`: `validateConfiguration()`; `test/dashboard-config.test.js`, `test/dashboard-persistence.test.js` | Heutige Validierung ist strenger und schema-versioniert. |
| 13-C1 | ES5/iOS-9, `Legacy.http`, kein moderner Router; konsistente Asset-Cacheversion | PASS | `test/legacy-compat.test.js`; `src/public/js/core/compat.js`; `src/public/index.html` überall `v=51` | Reale Hardware siehe 13-M1. |
| 13-MG1 | Bestehendes Dashboard ohne Verlust migriert | PASS | `src/services/dashboard-config-store.js`; `test/dashboard-persistence.test.js` Test zur initialen Sprint-13-Migration | Heute durch Sprint-14+-Persistenz geschützt. |
| 13-T1 | Alte und neue Multi-Dashboard-Tests vollständig grün, nur lokale Mocks | PASS | 329/329 Gesamttests; `test/dashboard-config.test.js`; `test/gateway.test.js` | Keine Produktion oder reale `.env` verwendet. |
| 13-DOC1 | README, Projektstatus und Roadmap dokumentieren Multi-Dashboard-Grundlage | PASS | `README.md`, `README.de.md`, `README.en.md`, `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md` | Dokumente beschreiben inzwischen den erweiterten aktuellen Stand. |
| 13-M1 | Reale iPad-Abnahme aller drei Routen, Themes, Orientierungen, Refresh/Status/HomeScreen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-02 | Nicht aus automatisierten Tests ableitbar. |
| 13-M2 | Reale Light-/Climate-Steuerung im Multi-Dashboard-Kontext | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-03 | Mocktests belegen Logik, nicht reale Geräte/Integrationen. |
| 13-N1 | Keine Admin-UI, Persistenz, Drag-and-drop, Größen, HA-App oder neuen Write-Domänen in Sprint 13 | N/A | Git-Historie `ac822d2`; spätere spezifizierte Sprints 14–26 | Historisch eingehalten, im heutigen Gesamtprodukt bewusst superseded. |

## Automated Tests

- `npm test`: 329/329 bestanden.
- Dashboard-Konfiguration, Public-/Legacy-Routen, 404, Entity-Deduplizierung und
  Write-Grenzen sind in `test/dashboard-config.test.js`,
  `test/gateway.test.js`, `test/admin-api.test.js` und
  `test/sprint-26-2.test.js` abgedeckt.
- 119 JavaScript-Dateien bestanden `node --check`.

## Manual Tests

- MT-02: reales iPad-/HomeScreen-Routing und Darstellung – `NOT TESTED`.
- MT-03: reale Light-/Climate-Steuerung aus mehreren Dashboards – `NOT TESTED`.

## Security Review

PASS – Public-Dashboarddaten enthalten keine Secrets oder Write-Grants.
`control-authorization.js` erzwingt explizite serverseitige Grants; Domain,
Entity, Aktion und Payload werden in engen Endpunkten validiert. Es existiert
kein generischer Browser-Serviceproxy.

## Legacy Safari / iPad Review

PARTIAL – ES5-, Request-, Routing- und Cache-Checks bestehen; die reale
iOS-9-/HomeScreen-Abnahme bleibt offen.

## Home Assistant App Review

N/A – die HA-App war kein Sprint-13-Ziel und wurde erst in Sprint 24 ergänzt.

## Standalone/LXC Review

PASS – Root- und Dashboardrouten sowie beide API-Generationen bestehen die
lokalen Gateway-Integrationstests. Kein Produktiv-LXC wurde in diesem
Auditlauf angesprochen.

## Findings

- Keine aktuelle `MISSING`- oder `BROKEN`-Anforderung.
- Reale Geräte- und HA-Schreibabnahme fehlt.
- Persistenz, Admin, Grid und weitere spätere Features superseden bewusst die
  Sprint-13-Nicht-Ziele.

## Repair Required

Keine Code-Reparatur. MT-02 und MT-03 durchführen und dokumentieren.

## Final Assessment

Sprint 13 ist technisch im aktuellen Stand erhalten. Wegen der ausdrücklich
geforderten, aber in diesem Lauf nicht real ausgeführten Abnahmen bleibt der
Gesamtstatus `PARTIAL`.
