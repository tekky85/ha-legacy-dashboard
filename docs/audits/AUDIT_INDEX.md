# Sprint-27-Auditindex

## Audit-Baseline

- Auditprogramm: Sprint 27 – Full Sprint Audit & RC Readiness Review
- Auditzeitraum: 31. August bis 7. September 2026
- Branch: `main`
- Auditierter Ausgangscommit: `8d2295a`
- Aktuell auditierter Repository-Commit: `09422e0`
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
| 17 | Drag-and-Drop Grid Layout | [`SPRINT-17.md`](../sprints/SPRINT-17.md) | Grid-Koordinaten, Drag-and-drop, Persistenz | 16 | 03 | PARTIAL |
| 17.1 | Grid Refinement + Responsive Card Content | [`SPRINT-17.1.md`](../sprints/SPRINT-17.1.md) | Grid, responsive Inhalte, Legacy-CSS | 17 | 03 | PARTIAL |
| 17.2 | Card Identity, Proportional Geometry & Theme Persistence | [`SPRINT-17.2.md`](../sprints/SPRINT-17.2.md) | Kartenidentität, Geometrie, Theme | 17.1 | 04 | PARTIAL |
| 17.3 | Live Card Preview, Unified Controls & Focus Mode | [`SPRINT-17.3.md`](../sprints/SPRINT-17.3.md) | Preview, Controls, Focus | 17.2 | 04 | PARTIAL |
| 17.4 | Focus Overlay Layout Stabilization | [`SPRINT-17.4.md`](../sprints/SPRINT-17.4.md) | Focus-Overlay, Mobile Safari | 17.3 | 05 | PARTIAL |
| 17.5 | Native Focus Renderer & Mobile Safari Stabilization | [`SPRINT-17.5.md`](../sprints/SPRINT-17.5.md) | separater Focus-Renderer, iPad | 17.4 | 05 | PARTIAL |
| 17.6 | Power Control Alignment & Icon Stabilization | [`SPRINT-17.6.md`](../sprints/SPRINT-17.6.md) | gemeinsamer Power-Control, SVG | 17.5 | 06 | PARTIAL |
| 17.7 | Legacy Safari Control Alignment Hardening | [`SPRINT-17.7.md`](../sprints/SPRINT-17.7.md) | Control-Hierarchie, iPad mini | 17.6 | 06 | PARTIAL |
| 18 | System Dashboard Foundation | [`SPRINT-18.md`](../sprints/SPRINT-18.md) | Systemrouten, gemeinsame Modelle | 17.x | 07 | PARTIAL |
| 19 | Summary Dashboard MVP | [`SPRINT-19.md`](../sprints/SPRINT-19.md) | Summary-Dashboard, Zustandsauswertung | 18 | 07 | PARTIAL |
| 20 | Error Dashboard MVP | [`SPRINT-20.md`](../sprints/SPRINT-20.md) | Fehler-Dashboard, Severity | 18, 19 | 08 | PARTIAL |
| D1 | Bilingual Documentation & Screenshot Baseline | [`SPRINT-D1.md`](../sprints/SPRINT-D1.md) | README DE/EN, Screenshots, Wartungsregel | sichtbarer Stand bis 20 | 08 | PARTIAL |
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
| 03 | 17, 17.1 | Grid-Grundlage und erste responsive Verfeinerung | abgeschlossen |
| 04 | 17.2–17.3 | Geometrie/Theme und Preview/Focus | abgeschlossen |
| 05 | 17.4–17.5 | beide Focus-/Mobile-Safari-Stabilisierungen | abgeschlossen |
| 06 | 17.6–17.7 | gemeinsame Controls und Safari-Alignment | abgeschlossen |
| 07 | 18–19 | System-Grundlage und Summary MVP | abgeschlossen |
| 08 | 20, D1 | Error MVP und dazugehörige Dokumentationsbaseline | abgeschlossen |
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

Parts 01 bis 08 sind abgeschlossen. Part 09 wurde ausdrücklich nicht begonnen.

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

## Part-03-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 17 | PARTIAL | [`SPRINT-17-AUDIT.md`](sprints/SPRINT-17-AUDIT.md) |
| 17.1 | PARTIAL | [`SPRINT-17.1-AUDIT.md`](sprints/SPRINT-17.1-AUDIT.md) |

Das persistente Raster, 6-/12-Spalten-Migration, Backendvalidierung,
Admin-Editor, Legacy-Renderer und die responsive Präsentationsarchitektur sind
im aktuellen Code vorhanden. Part 03 fand keine aktuelle `MISSING`- oder
`BROKEN`-Anforderung. Die beiden `PARTIAL`-Ergebnisse beruhen ausschließlich
auf fehlenden realen Pointer-/Safari-, iPad-mini-/iOS-9- und produktiven
LXC-Neustartabnahmen.

Bewusst superseded sind die 3-/6-Spalten-Ausgangsauflösung aus Sprint 17
(Sprint 17.1: 6/12), die ursprüngliche Zeilenformel (Sprint 17.2), die
Grid-internen Controls (Sprint 17.3/17.5–17.7: native Focus-Ansicht) und die
drei Presentation Modes (Sprint 25.6: fünf pixel-/inhaltsabhängige Tiers). Die
beabsichtigten Endzustände bleiben im aktuellen System erfüllt.

Zum Abschluss von Part 03 war Part 04 ausdrücklich noch nicht begonnen; sein
verbindlicher Planumfang war ausschließlich Sprint 17.2 und 17.3.

## Part-04-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 17.2 | PARTIAL | [`SPRINT-17.2-AUDIT.md`](sprints/SPRINT-17.2-AUDIT.md) |
| 17.3 | PARTIAL | [`SPRINT-17.3-AUDIT.md`](sprints/SPRINT-17.3-AUDIT.md) |

Kartenidentität, proportionale Rastergeometrie, globale Theme-Persistenz,
geschützte Admin-Live-Preview, gemeinsame Controls, enge Climate-Power-API und
die aktuelle native Focus-Architektur sind implementiert. Die beiden
`PARTIAL`-Ergebnisse berücksichtigen die ausstehende physische iPad-/iOS-9-
Abnahme und die reale Safari-/Pointer-Abnahme.

Part 04 fand mit RQ-04-01 außerdem den ersten umsetzbaren Baseline-Befund:
`src/public/index.html` referenziert gemeinsam genutzte Wall-Assets mit `v=51`,
`src/public/system.html` dieselben Dateien noch mit `v=44`. Da diese Assets
immutable ausgeliefert werden, ist die frühere Aussage einer einheitlichen
Cacheversion nicht mehr korrekt. Part 04 dokumentiert den Defekt, repariert ihn
gemäß Baseline-Regel aber nicht.

Bewusst superseded sind die drei Presentation Modes (Sprint 25.6: fünf Tiers),
vollständige Controls in der kleinsten Climate-Gridkarte (Sprint 17.3/17.5:
native Focus-Ansicht), der Focus-Clone (Sprint 17.5: eigener Renderer), das
damalige Power-Markup (Sprint 17.6/17.7: gemeinsames SVG-Control) und die
ursprüngliche mehrdeutige HVAC-On-Auswahl (Sprint 26.2: zentrale sichere
Capability-/Autorisierungslogik).

Part 04 ist abgeschlossen. Part 05 wurde anschließend ausschließlich im
festgelegten Umfang Sprint 17.4 und 17.5 durchgeführt.

## Part-05-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 17.4 | PARTIAL | [`SPRINT-17.4-AUDIT.md`](sprints/SPRINT-17.4-AUDIT.md) |
| 17.5 | PARTIAL | [`SPRINT-17.5-AUDIT.md`](sprints/SPRINT-17.5-AUDIT.md) |

Viewportgeometrie, Scroll-Lock, Rotation, priorisierte Focus-Inhalte und die
native Trennung von Grid und Focus sind im aktuellen Code vorhanden. Der
kontrollierte lokale Browserlauf bestätigte Sensor, Binary, Light und Climate
in Portrait und Landscape ohne Overflow; Climate blieb zusätzlich bei
320×460 vollständig bedienbar. Part 05 fand keinen aktuellen `MISSING`- oder
`BROKEN`-Befund und erzeugte keinen neuen Reparaturauftrag.

Beide Sprints bleiben `PARTIAL`, weil die Spezifikationen reale Abnahmen auf
iPad mini/iOS 9, iPad Air 2/iPadOS 15.8.5 und macOS Safari verlangen. Diese
Prüfungen wurden gemäß Part-05-Regel nicht physisch ausgeführt und stehen als
MT-18 bis MT-20 in der manuellen Warteschlange. Sprint 17.5 supersediert den
17.4-Clone; Sprint 17.6/17.7 supersedieren Power-Glyph und Control-Hierarchie,
ohne die native Focus/Grid-Trennung zurückzunehmen.

Part 05 ist abgeschlossen. Part 06 wurde anschließend ausschließlich im
festgelegten Umfang Sprint 17.6 und 17.7 durchgeführt.

## Part-06-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 17.6 | PARTIAL | [`SPRINT-17.6-AUDIT.md`](sprints/SPRINT-17.6-AUDIT.md) |
| 17.7 | PARTIAL | [`SPRINT-17.7-AUDIT.md`](sprints/SPRINT-17.7-AUDIT.md) |

Der gemeinsame echte Power-Button, sein festes Inline-SVG und die vollständige
Hierarchie `Row → Group → Button → Content → SVG/Icon → Label` sind im
aktuellen Code vorhanden. Der kontrollierte Lauf der echten Anwendung mit
lokalem Fake-HA bestätigte in Grid und Focus die interne Zentrierung aller
Ebenen, die vorgesehenen Touchgrößen sowie fehlenden horizontalen Overflow in
Portrait und Landscape. Part 06 fand keinen aktuellen `MISSING`- oder
`BROKEN`-Befund und erzeugte keinen neuen Reparaturauftrag.

Beide Sprints bleiben `PARTIAL`, weil ihre Spezifikationen reale Abnahmen auf
iPad mini/iOS 9.3.5, iPad Air 2/iPadOS 15.8.5 und macOS Safari verlangen. Diese
Prüfungen wurden gemäß Part-06-Regel nicht physisch ausgeführt und stehen als
MT-21 bis MT-23 in der manuellen Warteschlange. Sprint 17.7 supersediert die
direkte Flexzentrierung nativer Buttons aus Sprint 17.6 durch ein separates
Content-Element; Sprint 25.6 supersediert die alten Größenmodi, Sprint 26.2 die
damalige Autorisierungs-/Capability-Auswahl. Der beabsichtigte gemeinsame und
sichere Control-Endzustand bleibt jeweils erfüllt.

Part 06 ist abgeschlossen. Part 07 wurde anschließend ausschließlich im
festgelegten Umfang Sprint 18 und Sprint 19 durchgeführt.

## Part-07-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 18 | PARTIAL | [`SPRINT-18-AUDIT.md`](sprints/SPRINT-18-AUDIT.md) |
| 19 | PARTIAL | [`SPRINT-19-AUDIT.md`](sprints/SPRINT-19-AUDIT.md) |

Die externe System-Dashboard-Architektur, festen Routen, Sammelabfrage,
normalisierten Snapshots, der gemeinsame Cache, Stale-/Offline-/Recovery-
Semantik und die getrennten Summary-/Issue-Engines sind vorhanden. Das
Summary MVP wertet die spezifizierten Domainzustände serverseitig aus, liefert
reduzierte priorisierte Items und Gruppen und rendert sie über die gemeinsame
ES5-System-Shell. Spätere 21.x-/25.x-Sprints erweitern Filter, Header, Theme
und Navigation, ohne das Fundament oder die read-only Grenze aufzuheben.

Beide Sprints bleiben `PARTIAL`, weil die moderne Safari- und reale
iPad-mini-/iOS-9-Abnahme aussteht (MT-24 bis MT-26). Der bekannte
Cache-Buster-Befund `RQ-04-01` bleibt P1 und erhielt zusätzliche Evidenz aus
dem Admin-Entry-Point. Neu ist `RQ-07-01` (P2): Die Summary-Regeln sind
implementiert, aber mehrere in Sprint 19 ausdrücklich nummerierte
Zustandsvarianten besitzen keine gezielte Regression.

Part 07 fand kein aktuelles `MISSING` oder `BROKEN` und änderte keinen
Anwendungscode. Part 08 wurde nicht begonnen; sein verbindlicher Planumfang
ist ausschließlich Sprint 20 und Sprint D1.

## Part-08-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 20 | PARTIAL | [`SPRINT-20-AUDIT.md`](sprints/SPRINT-20-AUDIT.md) |
| D1 | PARTIAL | [`D1-AUDIT.md`](sprints/D1-AUDIT.md) |

Die Sprint-20-Issue-Basis ist fachlich vorhanden: getrennte unavailable-/
unknown-Zustände, zentrale Severity/Sortierung, stale/offline/Recovery,
reduzierte API, persistente Security-/Ignore-Regeln und read-only Legacy-UI.
Spätere Sprints 21 bis 23 erweitern denselben Datenfluss absichtlich um
Registry-Kontext, Geräteaggregation, Regeln und Automation-Diagnostik.

Sprint 20 bleibt wegen der nicht vollständig expliziten historischen
82-Punkte-Testmatrix (`RQ-08-01`), des auch die Error-Seite betreffenden
Cache-Busters (`RQ-04-01`) und der ausstehenden realen Safari-/iPad-Abnahmen
`PARTIAL`. Part 08 fand keinen aktuellen fachlichen Sprint-20-Laufzeitdefekt.

D1 besitzt das dreiteilige README-Modell, semantisch parallele Sprachfassungen,
funktionierende Bildlinks, Datenschutzregeln und die dauerhafte AGENTS-Regel.
Die Galerie wurde aber nach späteren sichtbaren Sprints nicht vollständig
aktualisiert: alte Admin-/Compact-/Focus-Aufnahmen, fehlender aktueller
Sections-/Room-Card-Nachweis und vier JPEG-Dateien unter `.png`-Namen stehen
in `RQ-08-02`. Der veraltete Kopf von `PROJECT_STATUS.md` (Schema 11 statt 12,
Auditfortschritt nur bis Part 02) steht in `RQ-08-03`.

Part 08 änderte keinen Anwendungscode. Part 09 wurde nicht begonnen; sein
verbindlicher Planumfang ist ausschließlich Sprint 21 und Sprint 21.1.

## Verifikation der Audit-Baseline

- Vollständige Testsuite: 329 von 329 Tests bestanden, 0 fehlgeschlagen.
- Part-03-Fokustests: 114 von 114 Tests bestanden, 0 fehlgeschlagen.
- Part-04-Fokustests: 127 von 127 Tests bestanden, 0 fehlgeschlagen.
- Part-05-Fokustests: 99 von 99 Tests bestanden, 0 fehlgeschlagen.
  Ein erster Versuch traf ausschließlich auf ein sandboxbedingtes
  `listen EPERM`; der identische Lauf mit erlaubtem localhost-Bind war grün.
- Part-06-Fokustests: 99 von 99 Tests bestanden, 0 fehlgeschlagen.
  Ein erster Versuch traf ausschließlich auf ein sandboxbedingtes
  `listen EPERM`; der identische Lauf mit erlaubtem localhost-Bind war grün.
- Part-07-Fokustests: 104 von 104 Tests bestanden, 0 fehlgeschlagen.
  Ein erster Versuch traf bei den lokalen Gateway-/Admin-Mocks ausschließlich
  auf `listen EPERM`; der identische Lauf mit erlaubtem localhost-Bind war
  vollständig grün.
- Part-08-Fokustests: 147 von 147 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei zwei lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit erlaubtem
  127.0.0.1-Bind war vollständig grün.
- Kontrollierter Chromium-Lauf für Part 04: Wall-Display 768×1024 ohne
  horizontalen Overflow, sichtbare Card Identity, Focus ohne Grid-Reflow,
  56×56-px-Climate-Step-Controls, 54-px-Power-Control, Theme über Reload und
  Summary sowie schreibfreie Admin-Live-Preview geprüft.
- Kontrollierter Browserlauf für Part 05: native Focus-DOMs für Sensor,
  Binary, Light und Climate; 768×1024, 1024×768 sowie Climate bei 320×460 ohne
  Focus-Overflow; Rotation, Control-Ereignistrennung, Außenklick, Body-Lock und
  Dark Theme geprüft. Keine Console-Warnung und kein Console-Fehler.
- Kontrollierter Browserlauf für Part 06: echte Anwendung mit lokalem Fake-HA
  bei 768×1024 und 1024×768; Grid-Light, Grid-Climate-Power, Focus ± sowie
  Light-/Climate-Focus-Power über Row, Group, Button, Content und SVG vermessen.
  Alle jeweiligen Innenmittelpunkte stimmten überein, Touchziele lagen bei
  46–56 px, es entstand kein horizontaler Overflow und die Konsole blieb leer.
- JavaScript-Syntax: für Part 08 wurden alle relevanten Issue-, System-,
  System-Wall-, Config- und Admin-Rule-Dateien mit `node --check` geprüft,
  ohne Fehler; der vorherige Vollscan aller 21 Legacy-Dateien bleibt als
  Part-06-Evidenz erhalten.
- Legacy-Scan: kein CSS Grid, kein Flexbox-`gap`, kein `ResizeObserver`, keine
  Container Query und keine verbotene moderne JavaScript-Syntax im
  Wall-Frontend.
- Testkommunikation: lokale Mock-Dienste und Fake-Credentials; kein produktives
  Home Assistant kontaktiert.
- Lokale Runtime: Node.js `v22.15.0`, npm `10.9.2`.
- Frontend-Assets: Dashboard `v=51`, Systemseiten `v=44`; Admin lädt zusätzlich
  geteilte Public-Assets mit `v=50`. Als P1-Befund RQ-04-01 dokumentiert und
  nicht in diesem Baseline-Audit repariert.
- D1-Link-/Screenshotprüfung: Root 1/1, Deutsch 14/14 und Englisch 14/14
  Bildpfade vorhanden; alle 14 Bilder visuell geprüft; vier
  Dateiendung-/Formatabweichungen und mehrere veraltete Aufnahmen gefunden.
- Auditlauf änderte keinen Anwendungscode. Part 09 wurde nicht begonnen.
