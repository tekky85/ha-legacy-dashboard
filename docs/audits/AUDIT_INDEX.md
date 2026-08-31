# Sprint-27-Auditindex

## Audit-Baseline

- Auditprogramm: Sprint 27 – Full Sprint Audit & RC Readiness Review
- Auditdatum: 31. August 2026
- Branch: `main`
- Auditierter Ausgangscommit: `8d2295a`
- Arbeitsbaum zu Beginn: sauber
- Vorhandene Sprint-Spezifikationen: 38
- Auditgegenstände: 37 (Sprint 27 steuert das Audit und wird nicht als eigener
  Implementierungssprint auditiert)
- Früheste vorhandene Spezifikation: Sprint 12

`SPRINT-1.md` bis `SPRINT-11.md` existieren nicht. Für diese Nummern werden
keine Anforderungen oder Auditdateien erfunden.

## Statusregeln

Requirement-Status: `PASS`, `PARTIAL`, `MISSING`, `BROKEN`, `NOT TESTED`,
`N/A`.

Sprint-Gesamtstatus: `PASS`, `PARTIAL`, `FAIL`, `BLOCKED`, `NOT TESTED`.

Später bewusst ersetzte Anforderungen werden als `N/A` mit einem
Superseded-Hinweis dokumentiert. Reale Geräte-, HAOS-, HomeScreen- und
Home-Assistant-Prüfungen werden nur nach tatsächlicher Durchführung als
`PASS` markiert.

## Vollständiges Sprint-Inventar

| Sprint | Titel | Spezifikation | Relevante Komponenten | Abhängigkeiten | Audit-Part | Status |
|---|---|---|---|---|---:|---|
| 12 | UI Polish + Release Baseline | [`SPRINT-12.md`](../sprints/SPRINT-12.md) | Legacy-CSS, Climate, Version, Wartbarkeit, Tests | bestehendes Einzel-Dashboard | 01 | PARTIAL |
| 13 | Multi-Dashboard Foundation | [`SPRINT-13.md`](../sprints/SPRINT-13.md) | Dashboardmodell, Public API, Routing, Legacy-Frontend | 12 | 01 | PARTIAL |
| 14 | Persistent Configuration & Admin API Foundation | [`SPRINT-14.md`](../sprints/SPRINT-14.md) | Schema, Dateispeicher, Admin API, Authentifizierung | 13 | 01 | PASS |
| 15 | Admin Configuration UI | [`SPRINT-15.md`](../sprints/SPRINT-15.md) | Admin-Frontend, Editor, Preview | 14 | 02 | PARTIAL |
| 16 | Configurable Tile Sizes | [`SPRINT-16.md`](../sprints/SPRINT-16.md) | Größenmodell, Admin, Legacy-Layout | 15 | 02 | PARTIAL |
| 17 | Drag-and-Drop Grid Layout | [`SPRINT-17.md`](../sprints/SPRINT-17.md) | Grid-Koordinaten, Drag-and-drop, Persistenz | 16 | 03 | NOT TESTED |
| 17.1 | Grid Refinement + Responsive Card Content | [`SPRINT-17.1.md`](../sprints/SPRINT-17.1.md) | Grid, responsive Inhalte, Legacy-CSS | 17 | 03 | NOT TESTED |
| 17.2 | Card Identity, Proportional Geometry & Theme Persistence | [`SPRINT-17.2.md`](../sprints/SPRINT-17.2.md) | Kartenidentität, Geometrie, Theme | 17.1 | 04 | NOT TESTED |
| 17.3 | Live Card Preview, Unified Controls & Focus Mode | [`SPRINT-17.3.md`](../sprints/SPRINT-17.3.md) | Preview, Controls, Focus | 17.2 | 04 | NOT TESTED |
| 17.4 | Focus Overlay Layout Stabilization | [`SPRINT-17.4.md`](../sprints/SPRINT-17.4.md) | Focus-Overlay, Mobile Safari | 17.3 | 05 | NOT TESTED |
| 17.5 | Native Focus Renderer & Mobile Safari Stabilization | [`SPRINT-17.5.md`](../sprints/SPRINT-17.5.md) | separater Focus-Renderer, iPad | 17.4 | 05 | NOT TESTED |
| 17.6 | Power Control Alignment & Icon Stabilization | [`SPRINT-17.6.md`](../sprints/SPRINT-17.6.md) | gemeinsamer Power-Control, SVG | 17.5 | 06 | NOT TESTED |
| 17.7 | Legacy Safari Control Alignment Hardening | [`SPRINT-17.7.md`](../sprints/SPRINT-17.7.md) | Control-Hierarchie, iPad mini | 17.6 | 06 | NOT TESTED |
| 18 | System Dashboard Foundation | [`SPRINT-18.md`](../sprints/SPRINT-18.md) | Systemrouten, gemeinsame Modelle | 17.x | 07 | NOT TESTED |
| 19 | Summary Dashboard MVP | [`SPRINT-19.md`](../sprints/SPRINT-19.md) | Summary-Dashboard, Zustandsauswertung | 18 | 07 | NOT TESTED |
| 20 | Error Dashboard MVP | [`SPRINT-20.md`](../sprints/SPRINT-20.md) | Fehler-Dashboard, Severity | 18, 19 | 08 | NOT TESTED |
| D1 | Bilingual Documentation & Screenshot Baseline | [`SPRINT-D1.md`](../sprints/SPRINT-D1.md) | README DE/EN, Screenshots, Wartungsregel | sichtbarer Stand bis 20 | 08 | NOT TESTED |
| 21 | Registry & Diagnostic Enrichment | [`SPRINT-21.md`](../sprints/SPRINT-21.md) | HA WebSocket Backend, Registries, Repairs, Matter | 20 | 09 | NOT TESTED |
| 21.1 | Error Dashboard Device Aggregation & Navigation | [`SPRINT-21.1.md`](../sprints/SPRINT-21.1.md) | Geräteaggregation, Filter, Layout | 21 | 09 | NOT TESTED |
| 21.2 | System Dashboard Filters, Column Views & Risk Severity | [`SPRINT-21.2.md`](../sprints/SPRINT-21.2.md) | Summary-/Fehlerfilter, Spalten, Risiko | 21.1 | 10 | NOT TESTED |
| 21.3 | Error Filtering & Critical Device Detection Modes | [`SPRINT-21.3.md`](../sprints/SPRINT-21.3.md) | Severity/State, Device Class/Labels | 21.2 | 10 | NOT TESTED |
| 21.4 | System Dashboard Configuration & Header Simplification | [`SPRINT-21.4.md`](../sprints/SPRINT-21.4.md) | Entity Rule Manager, Header | 21.3 | 11 | NOT TESTED |
| 21.5 | System Dashboard Navigation & Global Health Indicator | [`SPRINT-21.5.md`](../sprints/SPRINT-21.5.md) | Navigation, Health, Return-Ziel | 21.4 | 11 | NOT TESTED |
| 22 | Rules, Grace Periods & Device Aggregation | [`SPRINT-22.md`](../sprints/SPRINT-22.md) | Regelengine, Flapping, Recovery | 21.x | 12 | NOT TESTED |
| 23 | Automation Impact & Advanced Diagnostics | [`SPRINT-23.md`](../sprints/SPRINT-23.md) | Automation-Inventar, Referenzen, Traces | 22 | 12 | NOT TESTED |
| 24 | Home Assistant App Packaging | [`SPRINT-24.md`](../sprints/SPRINT-24.md) | App, Supervisor REST/WS, `/data`, Container | 23 | 13 | NOT TESTED |
| 25 | Release & Distribution | [`SPRINT-25.md`](../sprints/SPRINT-25.md) | BuildKit, Multi-Arch, GHCR, Releases | 24 | 14 | NOT TESTED |
| 25.1 | Pre-Release UI State & Filter Correctness | [`SPRINT-25.1.md`](../sprints/SPRINT-25.1.md) | Theme, exakte Fehlerfilter | 25 | 15 | NOT TESTED |
| 25.2 | HomeScreen Standalone Navigation Correctness | [`SPRINT-25.2.md`](../sprints/SPRINT-25.2.md) | Same-Origin/Window, Return-Ziel | 25.1 | 15 | NOT TESTED |
| 25.3 | Per-Dashboard Background Images & Optional Titles | [`SPRINT-25.3.md`](../sprints/SPRINT-25.3.md) | Uploads, Backgrounds, Titel, Full Height | 25.2 | 16 | NOT TESTED |
| 25.4 | RC CheckUp & Home Assistant App Installation Validation | [`SPRINT-25.4.md`](../sprints/SPRINT-25.4.md) | RC-Matrix, Standalone, HAOS | 25.3 | 17 | NOT TESTED |
| 25.5 | HAOS Network Access & Background Upload Hardening | [`SPRINT-25.5.md`](../sprints/SPRINT-25.5.md) | mDNS/Ports, JPEG-Validator | 25.4 | 18 | NOT TESTED |
| 25.6 | Card Size Matrix & Responsive Layout Hardening | [`SPRINT-25.6.md`](../sprints/SPRINT-25.6.md) | Renderer × Größe × Zustand | 25.5 | 18 | NOT TESTED |
| 25.7 | Legacy iPad Kiosk Deployment & Guided Access Validation | [`SPRINT-25.7.md`](../sprints/SPRINT-25.7.md) | iOS 9, Guided Access, Single App Mode | 25.6 | 18 | NOT TESTED |
| 26 | Dashboard Sections & Room Model Foundation | [`SPRINT-26.md`](../sprints/SPRINT-26.md) | Sections, Grid-Isolation, HA Areas | 25.x | 19 | NOT TESTED |
| 26.1 | Native Room Card MVP | [`SPRINT-26.1.md`](../sprints/SPRINT-26.1.md) | Room Card, Area-Setup, Hintergrund, Controls | 26 | 19 | NOT TESTED |
| 26.2 | Controllable Entity Authorization & Climate Capability Hardening | [`SPRINT-26.2.md`](../sprints/SPRINT-26.2.md) | zentrale Autorisierung, Light/Climate | 26.1 | 19 | NOT TESTED |
| 27 | Full Sprint Audit & RC Readiness Review | [`SPRINT-27.md`](../sprints/SPRINT-27.md) | Auditprogramm, Queues, RC-Gate | alle | Programm | N/A |

## Token-sicherer chronologischer Audit-Part-Plan

| Part | Sprints | Begründung | Status |
|---:|---|---|---|
| 01 | 12–14 | UI-/Release-Baseline, Multi-Dashboard und Persistenz-/Admin-API-Fundament | abgeschlossen |
| 02 | 15–16 | zusammengehöriger Admin-Editor und Größenmodell | abgeschlossen |
| 03 | 17, 17.1 | Grid-Grundlage und erste responsive Verfeinerung | geplant |
| 04 | 17.2–17.3 | Geometrie/Theme und Preview/Focus | geplant |
| 05 | 17.4–17.5 | beide Focus-/Mobile-Safari-Stabilisierungen | geplant |
| 06 | 17.6–17.7 | gemeinsame Controls und Safari-Alignment | geplant |
| 07 | 18–19 | System-Grundlage und Summary MVP | geplant |
| 08 | 20, D1 | Error MVP und dazugehörige Dokumentationsbaseline | geplant |
| 09 | 21–21.1 | Registry-Anreicherung und erste Geräteaggregation | geplant |
| 10 | 21.2–21.3 | Filter, Spalten, Risiko- und Kritikalitätsmodi | geplant |
| 11 | 21.4–21.5 | Konfiguration, Header, Navigation und Health | geplant |
| 12 | 22–23 | Regelengine und Automation/Diagnostik | geplant |
| 13 | 24 | umfangreiche HA-App-Verpackung separat | geplant |
| 14 | 25 | umfangreiche Release-/Distributionspipeline separat | geplant |
| 15 | 25.1–25.2 | zusammengehörige RC-UI-/Navigations-Gates | geplant |
| 16 | 25.3 | Upload-/Persistenz-/UI-Sicherheitsfläche separat | geplant |
| 17 | 25.4 | reale RC-Validierung separat | geplant |
| 18 | 25.5–25.7 | RC-Härtung, Layoutmatrix und iPad-Kiosk | geplant |
| 19 | 26–26.2 | Sections, Room Card und zentrale Controls gemeinsam | geplant |
| Abschluss | alle | Repair-Re-Audits und finale RC-Gate-Entscheidung | geplant |

Part 02 ist abgeschlossen. Part 03 wurde ausdrücklich nicht begonnen.

Zu Beginn von Part 02 lagen ausschließlich die noch nicht committeten
Dokumentationsänderungen aus Part 01 im Arbeitsbaum; Anwendungscode war nicht
verändert. Auditierter Code- und Versionsstand blieb `8d2295a`.

## Part-01-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 12 | PARTIAL | [`SPRINT-12-AUDIT.md`](sprints/SPRINT-12-AUDIT.md) |
| 13 | PARTIAL | [`SPRINT-13-AUDIT.md`](sprints/SPRINT-13-AUDIT.md) |
| 14 | PASS | [`SPRINT-14-AUDIT.md`](sprints/SPRINT-14-AUDIT.md) |

Die beiden `PARTIAL`-Ergebnisse entstehen ausschließlich durch nicht erneut auf
der realen Zielhardware bzw. gegen ein reales Home Assistant geprüfte
Abnahmepunkte. Part 01 hat keine aktuelle `MISSING`- oder `BROKEN`-Anforderung
gefunden und erzeugt deshalb keinen Reparaturauftrag.

## Part-02-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 15 | PARTIAL | [`SPRINT-15-AUDIT.md`](sprints/SPRINT-15-AUDIT.md) |
| 16 | PARTIAL | [`SPRINT-16-AUDIT.md`](sprints/SPRINT-16-AUDIT.md) |

Beide `PARTIAL`-Ergebnisse beruhen auf fehlenden realen Safari-, iPad- bzw.
LXC-Abnahmen. Die weiterhin anwendbaren Code-, API-, Persistenz- und
Sicherheitsanforderungen sind implementiert; Part 02 hat keine aktuelle
`MISSING`- oder `BROKEN`-Anforderung und keinen Reparaturauftrag gefunden.

Bewusst superseded sind insbesondere der Sprint-15-Wunsch nach einem neuen
Preview-Tab (Sprint 25.2 verlangt Same-Window-/Same-Origin-Navigation) sowie
die allein durch Presets bestimmte Sprint-16-Flexgeometrie (ersetzt durch die
persistenten Layouts aus Sprint 17/17.1). Die beabsichtigten Endzustände bleiben
im aktuellen System erfüllt.

## Verifikation der Audit-Baseline

- Vollständige Testsuite: 329 von 329 Tests bestanden, 0 fehlgeschlagen.
- Part-02-Fokustests: 92 von 92 Tests bestanden, 0 fehlgeschlagen.
- Kontrollierter Chromium-Lauf: Admin-Login/-Logout, Dashboard-
  Erstellen/Speichern/Reload, Entity-Suche, Größenänderung/Verwerfen und fünf
  Größenklassen ohne horizontalen Overflow bei 768×1024 und 1024×768 geprüft.
- JavaScript-Syntax: 119 Dateien aus `src/`, `test/` und `release/` mit
  `node --check` geprüft, ohne Fehler.
- Testkommunikation: lokale Mock-Dienste und Fake-Credentials; kein produktives
  Home Assistant kontaktiert.
- Lokale Runtime: Node.js `v22.15.0`, npm `10.9.2`.
- Frontend-Assets: einheitlicher Cacheparameter `v=51`.
- Auditlauf änderte keinen Anwendungscode.
