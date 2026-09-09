# Sprint-27-Auditindex

## Audit-Baseline

- Auditprogramm: Sprint 27 – Full Sprint Audit & RC Readiness Review
- Auditzeitraum: 31. August bis 9. September 2026
- Branch: `main`
- Auditierter Ausgangscommit: `8d2295a`
- Aktuell auditierter Repository-Commit: `593ba5a`
- Arbeitsbaum zu Beginn von Part 19: Anwendungscode unverändert; die noch nicht
  committeten Auditdokumente aus Parts 12 bis 18 sowie die bereitgestellten
  Audit-Prompts waren vorhanden und wurden vollständig bewahrt
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
| 21 | Registry & Diagnostic Enrichment | [`SPRINT-21.md`](../sprints/SPRINT-21.md) | HA WebSocket Backend, Registries, Repairs, Matter | 20 | 09 | PARTIAL |
| 21.1 | Error Dashboard Device Aggregation & Navigation | [`SPRINT-21.1.md`](../sprints/SPRINT-21.1.md) | Geräteaggregation, Filter, Layout | 21 | 09 | PARTIAL |
| 21.2 | System Dashboard Filters, Column Views & Risk Severity | [`SPRINT-21.2.md`](../sprints/SPRINT-21.2.md) | Summary-/Fehlerfilter, Spalten, Risiko | 21.1 | 10 | PARTIAL |
| 21.3 | Error Filtering & Critical Device Detection Modes | [`SPRINT-21.3.md`](../sprints/SPRINT-21.3.md) | Severity/State, Device Class/Labels | 21.2 | 10 | PARTIAL |
| 21.4 | System Dashboard Configuration & Header Simplification | [`SPRINT-21.4.md`](../sprints/SPRINT-21.4.md) | Entity Rule Manager, Header | 21.3 | 11 | PARTIAL |
| 21.5 | System Dashboard Navigation & Global Health Indicator | [`SPRINT-21.5.md`](../sprints/SPRINT-21.5.md) | Navigation, Health, Return-Ziel | 21.4 | 11 | PARTIAL |
| 22 | Rules, Grace Periods & Device Aggregation | [`SPRINT-22.md`](../sprints/SPRINT-22.md) | Regelengine, Flapping, Recovery | 21.x | 12 | PARTIAL |
| 23 | Automation Impact & Advanced Diagnostics | [`SPRINT-23.md`](../sprints/SPRINT-23.md) | Automation-Inventar, Referenzen, Traces | 22 | 12 | PARTIAL |
| 24 | Home Assistant App Packaging | [`SPRINT-24.md`](../sprints/SPRINT-24.md) | App, Supervisor REST/WS, `/data`, Container | 23 | 13 | PARTIAL |
| 25 | Release & Distribution | [`SPRINT-25.md`](../sprints/SPRINT-25.md) | BuildKit, Multi-Arch, GHCR, Releases | 24 | 14 | PARTIAL |
| 25.1 | Pre-Release UI State & Filter Correctness | [`SPRINT-25.1.md`](../sprints/SPRINT-25.1.md) | Theme, exakte Fehlerfilter | 25 | 15 | PARTIAL |
| 25.2 | HomeScreen Standalone Navigation Correctness | [`SPRINT-25.2.md`](../sprints/SPRINT-25.2.md) | Same-Origin/Window, Return-Ziel | 25.1 | 15 | PARTIAL |
| 25.3 | Per-Dashboard Background Images & Optional Titles | [`SPRINT-25.3.md`](../sprints/SPRINT-25.3.md) | Uploads, Backgrounds, Titel, Full Height | 25.2 | 16 | PARTIAL |
| 25.4 | RC CheckUp & Home Assistant App Installation Validation | [`SPRINT-25.4.md`](../sprints/SPRINT-25.4.md) | RC-Matrix, Standalone, HAOS | 25.3 | 17 | PARTIAL |
| 25.5 | HAOS Network Access & Background Upload Hardening | [`SPRINT-25.5.md`](../sprints/SPRINT-25.5.md) | mDNS/Ports, JPEG-Validator | 25.4 | 18 | PARTIAL |
| 25.6 | Card Size Matrix & Responsive Layout Hardening | [`SPRINT-25.6.md`](../sprints/SPRINT-25.6.md) | Renderer × Größe × Zustand | 25.5 | 18 | PARTIAL |
| 25.7 | Legacy iPad Kiosk Deployment & Guided Access Validation | [`SPRINT-25.7.md`](../sprints/SPRINT-25.7.md) | iOS 9, Guided Access, Single App Mode | 25.6 | 18 | PARTIAL |
| 26 | Dashboard Sections & Room Model Foundation | [`SPRINT-26.md`](../sprints/SPRINT-26.md) | Sections, Grid-Isolation, HA Areas | 25.x | 19 | PARTIAL |
| 26.1 | Native Room Card MVP | [`SPRINT-26.1.md`](../sprints/SPRINT-26.1.md) | Room Card, Area-Setup, Hintergrund, Controls | 26 | 19 | PARTIAL |
| 26.2 | Controllable Entity Authorization & Climate Capability Hardening | [`SPRINT-26.2.md`](../sprints/SPRINT-26.2.md) | zentrale Autorisierung, Light/Climate | 26.1 | 19 | PARTIAL |
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
| 09 | 21–21.1 | Registry-Anreicherung und erste Geräteaggregation | abgeschlossen |
| 10 | 21.2–21.3 | Filter, Spalten, Risiko- und Kritikalitätsmodi | abgeschlossen |
| 11 | 21.4–21.5 | Konfiguration, Header, Navigation und Health | abgeschlossen |
| 12 | 22–23 | Regelengine und Automation/Diagnostik | abgeschlossen |
| 13 | 24 | umfangreiche HA-App-Verpackung separat | abgeschlossen |
| 14 | 25 | umfangreiche Release-/Distributionspipeline separat | abgeschlossen |
| 15 | 25.1–25.2 | zusammengehörige RC-UI-/Navigations-Gates | abgeschlossen |
| 16 | 25.3 | Upload-/Persistenz-/UI-Sicherheitsfläche separat | abgeschlossen |
| 17 | 25.4 | reale RC-Validierung separat | abgeschlossen |
| 18 | 25.5–25.7 | RC-Härtung, Layoutmatrix und iPad-Kiosk | abgeschlossen |
| 19 | 26–26.2 | Sections, Room Card und zentrale Controls gemeinsam | abgeschlossen |
| Abschluss | alle | Repair-Queue-Konsolidierung, Reparaturen, Re-Audits und finale RC-Gate-Entscheidung | als nächster Arbeitsabschnitt geplant |

Parts 01 bis 19 sind abgeschlossen. Damit ist die vollständige geplante
Baseline-Auditsequenz beendet. Es gibt keinen Audit Part 20; als Nächstes folgt
die Repair-Queue-Konsolidierung vor einem eventuellen Sprint 27.1.

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

Part 08 änderte keinen Anwendungscode. Part 09 wurde anschließend
ausschließlich im verbindlichen Umfang Sprint 21 und Sprint 21.1 durchgeführt.

## Part-09-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 21 | PARTIAL | [`SPRINT-21-AUDIT.md`](sprints/SPRINT-21-AUDIT.md) |
| 21.1 | PARTIAL | [`SPRINT-21.1-AUDIT.md`](sprints/SPRINT-21.1-AUDIT.md) |

Der serverseitige HA-WebSocket, die festen read-only Registry-/Config-/Repair-
Adapter, unabhängigen TTL-/Stale-Caches, der angereicherte gemeinsame Snapshot
und die reduzierte Browserausgabe sind vorhanden. Matter bleibt mangels
belastbarer read-only API kontrolliert `unsupported`. Standalone verwendet
backend-only `HA_TOKEN`; der spätere Sprint-24-App-Transport verwendet
backend-only `SUPERVISOR_TOKEN`. Der Browser erhält weder WebSocket-Zugriff
noch Rohregistries oder Secrets.

Sprint 21.1 gruppiert ausschließlich Entity-State-Issues mit echter
`device_id`, bewahrt Children und leitet Severity, Security, ältesten Start,
Counts und Sortierung deterministisch ab. Entities ohne Device-ID sowie
System-, Config-, Repair- und Matter-Issues bleiben Standalone. Spätere Sprints
21.2/21.3/25.1 ersetzen die einfache Kategorienavigation durch exakte
Severity-/State-Filter und ergänzen 1/2/3-Spaltenansichten, ohne die
Device-ID-Regel oder read-only Grenze zu ändern.

Part 09 fand einen neuen funktionalen P2-Robustheitsbefund: Ein isoliertes
WebSocket-`error`-Event ohne nachfolgendes `close` plant keinen automatischen
Reconnect (`RQ-09-01`). Ein späterer Source-Abruf kann neu verbinden und der
REST-State-Snapshot bleibt erhalten, dennoch ist die Error-only-Erholung nicht
vollständig. `RQ-09-02` erfasst die fehlende explizite Zuordnung aller 93/77
Testanforderungen. Der bestehende Cache-Buster `RQ-04-01` betrifft nun
ausdrücklich auch Sprint-21-Enrichment und Sprint-21.1-Device-Cards;
`RQ-08-02` bleibt für veraltete System-/Adminbilder maßgeblich.

Beide Sprints bleiben wegen dieser Befunde und der ausstehenden realen
Safari-/HA-/iPad-Abnahmen `PARTIAL`. MT-30 bis MT-32 enthalten vollständige
Abnahmeanleitungen. Part 09 änderte keinen Anwendungscode und führte keine
physische Geräteprüfung aus. Part 10 wurde anschließend ausschließlich im
verbindlichen Umfang Sprint 21.2 und Sprint 21.3 durchgeführt.

## Part-10-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 21.2 | PARTIAL | [`SPRINT-21.2-AUDIT.md`](sprints/SPRINT-21.2-AUDIT.md) |
| 21.3 | PARTIAL | [`SPRINT-21.3-AUDIT.md`](sprints/SPRINT-21.3-AUDIT.md) |

Summary- und Error-Filter arbeiten auf dem bereits geladenen reduzierten
Payload; die getrennten Spaltenpräferenzen verwenden sichere Storage-Fallbacks
und einen responsiven 1/2/3-Spalten-Cap. Safety-/Security-Risk und Severity
sind zentral und fail-safe. Die aktuelle, durch Sprint 25.1 gehärtete Error-
Filterung ist exakt: Severity und State verwenden AND auf demselben Child,
Device Children werden zuerst gefiltert, und nur daraus entsteht die sichtbare
Gruppenseverity. Der globale Error-/Health-Status bleibt unverändert.

Die Modi `device_class` und `ha_label` sind persistiert und validiert. Labels
werden backendseitig read-only aus Entity-/Device-Registryzuweisungen
ausgewertet; Areas vererben keine Kritikalität. Last-known/stale, unsupported,
missing und Mode-Isolation verhindern einen stillen Device-Class-Fallback.
Der aktuelle Sprint-21.4-Entity-Rule-Manager und die Sprint-22-Regelengine
supersedieren historische UI-/Prioritätsdetails, erhalten aber den beabsichtigten
21.2/21.3-Endzustand.

Kein neuer fachlicher Laufzeitdefekt wurde gefunden. `RQ-10-01` dokumentiert
die nicht vollständig einzeln rückverfolgbare 92-/96-Punkte-Testmatrix.
`RQ-09-01` betrifft zusätzlich die Recovery der Labelquelle bei einem
isolierten WebSocket-Error; `RQ-04-01` und `RQ-08-02` bleiben für Cache bzw.
Screenshots maßgeblich. MT-33 bis MT-36 enthalten vollständige reale
Abnahmeanleitungen. Part 10 änderte keinen Anwendungscode und führte keine
physische iPad- oder reale HA-Prüfung aus. Part 11 wurde nicht begonnen; sein
verbindlicher Umfang ist ausschließlich Sprint 21.4 und Sprint 21.5.

## Part-11-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 21.4 | PARTIAL | [`SPRINT-21.4-AUDIT.md`](sprints/SPRINT-21.4-AUDIT.md) |
| 21.5 | PARTIAL | [`SPRINT-21.5-AUDIT.md`](sprints/SPRINT-21.5-AUDIT.md) |

Der Entity Rule Manager verwendet einen einmal aufgebauten, clientseitigen
Index und kombiniert Friendly-Name-/Entity-ID-/Device-/Area-/Domain-Suche,
Area-/Domain-/Device-Filter und „Nur konfigurierte“. Jede Entity bearbeitet
Summary Ignore, Security Relevant und Error Ignore in einem gemeinsamen
lokalen Draft. Save sendet genau einen geschützten Konfigurationswrite;
Discard stellt den gespeicherten Zustand wieder her. Die aktuelle Sprint-22-
Erweiterung nutzt dieselbe Karte und ändert diese drei historischen Regeln
nicht.

Summary und Errors teilen den kompakten Header und zeigen die dominante
Gesamtzahl nur einmal. Der kleine read-only Status-Endpunkt berechnet Health
aus der globalen ungefilterten Issue-Menge: Fresh Healthy und Info-only blenden
den Alarm aus; Warning/Error/Critical, stale, unknown und API-Fehler bleiben
sichtbar. Filter und Spalten sind rein lokale Präsentation und können Health
nicht verändern.

Returnziele werden client- und serverseitig auf `/` oder eine vorhandene
`/d/<id>`-Route begrenzt. Sprint 25.2 supersediert den damaligen Linkmechanismus
mit dem heutigen validierten Same-Window-/Same-Origin-Helper, ohne die Sprint-
21.5-Semantik zu ändern. Absolute, protocol-relative, `javascript:`, `data:`,
malformed und unbekannte Ziele bleiben abgewiesen; direkter Aufruf fällt auf
`/` zurück.

Kein neuer fachlicher oder Security-Laufzeitdefekt wurde gefunden. Der
bestehende P1-Cache-Buster `RQ-04-01` betrifft Part 11 direkt, weil
`system-navigation.js` und `style.css` auf normalen Dashboards mit `v=51`, auf
Systemseiten jedoch mit `v=44` geladen werden. `RQ-11-01` erfasst die nicht
vollständig einzeln rückverfolgbaren 75-/73-Punkte-Testmatrizen; `RQ-08-02`
bleibt für veraltete Screenshots maßgeblich. MT-37 bis MT-42 enthalten
vollständige reale Safari-/Tablet-/iPad-Abnahmeanleitungen.

Beide Sprints bleiben deshalb `PARTIAL`. Part 11 änderte keinen Anwendungscode,
kontaktierte kein reales Home Assistant und führte keine physische
Geräteprüfung aus. Die komplette Sprint-21-/21.x-Auditfolge Parts 09 bis 11 ist
damit baseline-seitig abgeschlossen. Part 12 wurde nicht begonnen; sein
verbindlicher Umfang ist ausschließlich Sprint 22 und Sprint 23.

## Part-12-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 22 | PARTIAL | [`SPRINT-22-AUDIT.md`](sprints/SPRINT-22-AUDIT.md) |
| 23 | PARTIAL | [`SPRINT-23-AUDIT.md`](sprints/SPRINT-23-AUDIT.md) |

Sprint 22 besitzt die zentrale serverseitige Pipeline für Risk Classification,
Rule Resolution, getrennte Grace Periods, Expected Offline, begrenztes
Flapping, Stable Recovery, Severity, echte Device-ID-Aggregation und Global
Health. Admin-Draft, Persistenz und serverseitige Validation sind vorhanden;
es gibt keine HA-History-Abfrage, keinen Zusatzpoll und keine neue
Write-Fähigkeit. `RQ-12-01` hält einen konkreten Erklärbarkeitsdefekt fest:
`resolveRule()` meldet bei einem effektiven Domain-Feldwert trotzdem
`ruleSource="risk_class"`, sobald die darüberliegende Risk-Class-Regelstruktur
vorhanden ist. Die Wertpriorität selbst bleibt korrekt.

Sprint 23 normalisiert das Automation Inventory, extrahiert explizite Entity-,
Device-, Area- und Labelreferenzen über feste backendseitige read-only
Commands, baut Maps und ergänzt ausschließlich aktive Sprint-22-Issues.
Trace Summaries sind capability-driven, begrenzt, sanitisiert und werden erst
beim Öffnen von Advanced Diagnostics geladen. Zwei weitere konkrete Befunde
sind `RQ-12-02` und `RQ-12-03`: Rein dynamische Referenzen erzeugen trotz
vorbereitetem Enum/UI keinen erreichbaren `unknown`-Impact, und der bei einem
Config-Cache-Hit wiederverwendete alte `inventoryByEntityId`-Index kann
Automation-State, Disabled-Kontext und `lastTriggered` bis zum 60-s-TTL
veraltet anzeigen.

`RQ-12-04` erfasst außerdem die nicht vollständig einzeln rückverfolgbaren
80-/84-Punkte-Testmatrizen. Der bestehende Cache-Buster-Befund `RQ-04-01`, die
Screenshotlücke `RQ-08-02` und der veraltete globale Projektstatus
`RQ-08-03` erhielten zusätzliche Part-12-Evidenz. `RQ-09-01` betrifft über den
gemeinsamen WebSocket-Transport nun nachweislich auch die autonome Recovery von
Automation Config und Trace nach einem isolierten Error-only-Ereignis. MT-43
bis MT-49 enthalten vollständige reale HA-/LXC-/Safari-/iPad-
Abnahmeanleitungen.

Beide Sprints bleiben deshalb `PARTIAL`. Part 12 änderte keinen Anwendungscode,
kontaktierte kein reales Home Assistant und führte keine physische Geräte-
oder Produktionsprüfung aus. Part 13 wurde anschließend ausschließlich im
verbindlichen Umfang Sprint 24 durchgeführt.

## Part-13-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 24 | PARTIAL | [`SPRINT-24-AUDIT.md`](sprints/SPRINT-24-AUDIT.md) |

Die zusätzliche Home-Assistant-App-Betriebsart ist architektonisch vorhanden:
dieselbe externe Express-Anwendung verwendet im Standalone-Modus weiterhin
backend-only `HA_TOKEN` und im App-Modus den Supervisor-Core-REST-/WebSocket-
Proxy mit backend-only `SUPERVISOR_TOKEN`. App-Metadaten, `homeassistant_api`,
AppArmor, direkter LAN-Port, `/data`, Healthcheck, SIGTERM und amd64/aarch64-
Strategie sind implementiert. Es gibt weder Lovelace-/Ingress-Zwang noch
generische Service-/WebSocket-Proxies oder zusätzliche Write-Fähigkeiten.

Part 13 fand zwei konkrete Verpackungsbefunde. `RQ-13-01` ist ein P1-RC-
Blocker: `1.0.0-rc.1` und das darüber ausgewählte GHCR-Image stammen vom
Commit `741bba4`, während der auditierte HEAD `593ba5a` mehrere spätere
laufzeitrelevante Änderungen enthält. Die aktuelle App-Installation liefert
daher nicht den aktuellen Repositorycode. `RQ-13-02` dokumentiert, dass der als
lokaler Supervisor-Build beschriebene Vorbereitungskontext `image:` beibehält
und deshalb das Registry-Image statt der kopierten lokalen Quellen verwendet.

Der gemeinsame WebSocket-Befund `RQ-09-01` sowie die Cacheversion
`RQ-04-01` gelten wegen des identischen Quellbaums auch im App-Modus.
`RQ-08-03` erhielt Evidenz zur inzwischen entfernten, in `PROJECT_STATUS.md`
noch genannten `build.yaml`. Die Sprint-22-/23-Befunde `RQ-12-01` bis
`RQ-12-04` bleiben im App-Betrieb identisch und verhindern eine pauschale
Regressionsfrei-Aussage.

Die fokussierten lokalen Tests bestanden mit 153/153, die Gesamtsuite mit
329/329. Historische reale HAOS-Evidenz bestätigt Installation/Start von RC.1,
Supervisor REST und den direkten IPv4-LAN-Port. Diese Evidenz wird nicht auf
den heutigen unveröffentlichten Code hochgerechnet. Reale Supervisor-
WebSocket-Recovery, `/data`-Rechte/Persistenz, Backup/Restore, Upgrade,
HAOS-Reboot, aarch64 und der vollständige iPad-mini-Lauf stehen als MT-50 bis
MT-54 in der manuellen Warteschlange.

Sprint 24 bleibt deshalb `PARTIAL`. Part 13 änderte keinen Anwendungscode,
kontaktierte kein reales Home Assistant und führte keine physische Geräte-
oder Produktionsprüfung aus. Part 14 wurde anschließend ausschließlich im
festgelegten Umfang Sprint 25 durchgeführt.

## Part-14-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 25 | PARTIAL | [`SPRINT-25-AUDIT.md`](sprints/SPRINT-25-AUDIT.md) |

Sprint 25 besitzt eine reale, funktionsfähige Releasearchitektur. Das
Dockerfile ist die einzige Buildquelle; GitHub Actions verwendet BuildKit für
amd64/aarch64, veröffentlicht erst danach ein generisches Manifest, führt einen
Mock-Smoke-Test aus und trennt RC von Stable/`latest`. Das öffentliche
`v1.0.0-rc.1`-Prerelease vom 28. August 2026 bestätigt alle sechs Workflowjobs,
das versionierte GHCR-Manifest, das Standalone-Tar und `SHA256SUMS`. Die
heruntergeladene Datei bestand die veröffentlichte SHA256-Prüfung.

Der aktuelle HEAD ist trotzdem nicht freigabefähig. Das unveränderliche RC.1-
Tag zeigt auf `741bba4`, HEAD auf `593ba5a`; `RQ-13-01` bleibt damit P1. Neu
fand Part 14, dass das Bundle die verlinkte Releaseanleitung und die in der
enthaltenen Deploymentdokumentation verlangten Git-Deployskripte nicht enthält
(`RQ-14-01`). Der „Upgrade“-Test lädt nur dieselbe Codeversion zweimal
(`RQ-14-02`), die 60 Releasefälle sind nicht vollständig direkt rückverfolgbar
(`RQ-14-03`), und der Stable-Workflow ist nicht an eine commitbezogene manuelle
Freigabe/offene P1-Befunde gekoppelt (`RQ-14-04`). Der High/Critical-
Produktionsaudit besteht, meldet aber zwei moderate `qs@6.15.3`-DoS-Advisories
(`RQ-14-05`).

Das lokale Release-Gate einschließlich Gesamtsuite bestand mit 329/329 Tests;
19 fokussierte Sprint-25-Tests waren grün. Zwei reproduzierte Bundles waren
byteidentisch. Keine Credential-, Nutzerdaten- oder Telemetrieoffenlegung wurde
gefunden. Ein aktueller Dockerbuild, der nächste öffentliche RC, echtes
Standalone-N→N+1/Rollback, Stable-Promotion, HAOS-Update/aarch64 sowie die
physische iPad-Abnahme bleiben `NOT TESTED`. Neu stehen MT-55 bis MT-57 in der
manuellen Warteschlange; MT-50 bis MT-54 und die bestehenden UI-Prüfungen
bleiben gültig.

Sprint 25 bleibt deshalb `PARTIAL`. Part 14 änderte keinen Anwendungscode,
veröffentlichte nichts und kontaktierte kein produktives Home Assistant, HAOS
oder physisches iPad.

## Part-15-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 25.1 | PARTIAL | [`SPRINT-25.1-AUDIT.md`](sprints/SPRINT-25.1-AUDIT.md) |
| 25.2 | PARTIAL | [`SPRINT-25.2-AUDIT.md`](sprints/SPRINT-25.2-AUDIT.md) |

Sprint 25.1 besitzt eine funktionierende globale, nicht sensitive
`ha-legacy-theme`-Preference mit sicherem LocalStorage-/Cookie-Fallback und
früher Anwendung vor dem UI-Render. Error-Severity und -State matchen exakt
auf demselben Child; Device Groups werden child-first gefiltert und erhalten
sichtbare Severity, Counts und Details ausschließlich aus den passenden
Children. Die ungefilterte globale Error-/Healthlage bleibt unverändert.

Sprint 25.2 besitzt eine zentrale ES5-kompatible interne Navigation. Relative,
validierte Pfade, `target="_self"` und `window.location.href` halten den
Browsing Context; das genaue Default-/Custom-Returnziel wird clientseitig
begrenzt und serverseitig zusätzlich gegen existierende Dashboards geprüft.
Der Quellcode enthält kein internes `_blank`, kein `window.open()`, keinen
festen Host/Port und keine `navigator.standalone`-Sonderlogik. Open-Redirect-
und malformed-Query-Regressionen sind grün.

Beide Sprints bleiben `PARTIAL`, weil der bestehende P1-Cachebefund
`RQ-04-01` genau die Theme- und Navigationassets betrifft und die reale
iPad-mini-HomeScreen-Abnahme nicht durchgeführt wurde. `RQ-15-01` erfasst
außerdem die fehlende vollständige direkte Zuordnung der 74/51 nummerierten
Testfälle. Keine neue funktionale `BROKEN`- oder `MISSING`-Anforderung wurde
gefunden. MT-13, MT-34 und MT-40 bis MT-42 wurden wiederverwendet und Part 15
zugeordnet; jeder Eintrag besitzt bereits vollständige Schritte, Expected-
und Fail-Kriterien sowie Evidenzvorgaben.

Der Fokuslauf bestand mit 65/65 Tests, die Gesamtsuite mit 329/329. Relevante
JavaScript-, Legacy-, CSS-, Same-Origin- und Securityprüfungen waren grün.
Part 15 änderte keinen Anwendungscode und kontaktierte kein produktives Home
Assistant, HAOS, LXC oder physisches iPad. Part 16 wurde anschließend
ausschließlich im verbindlichen Umfang Sprint 25.3 durchgeführt.

## Part-16-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 25.3 | PARTIAL | [`SPRINT-25.3-AUDIT.md`](sprints/SPRINT-25.3-AUDIT.md) |

Die per-Dashboard Konfiguration für Background, Position, Cover/Contain,
Overlay und optionalen Titel ist im aktuellen Schema, Admineditor, sicheren
Assetstore, Public API und ES5-Wall-Renderer vorhanden. Assets verwenden den
Runtime-`DATA_DIR`, im HA-App-Modus `/data`, zufällige IDs, atomare Writes,
restriktive Rechte und eine referenzgeprüfte read-only Route. Vollhöhe,
normaler kompakter Footer und Focus-Stacking sind architektonisch umgesetzt.
Der spätere Sprint 25.5 supersediert den ursprünglichen JPEG-Parser mit
Unterstützung für reale Baseline-/Progressive-/JFIF-/EXIF-/ICC-Varianten.

Part 16 fand einen aktuellen P1-Korrektheitsdefekt (`RQ-16-01`): Die PNG-
Prüfung validiert weder Chunk-CRC noch das Vorhandensein von Bilddaten. Zwei
kontrollierte Direktproben wurden fälschlich angenommen: ein PNG nur aus
Signatur, IHDR und IEND sowie ein PNG mit manipulierter CRC. Bei einem Ersatz
kann ein solcher vermeintlich erfolgreicher Upload nach dem Configwrite das
vorherige gültige Asset entfernen. Dies ist kein Credential- oder HA-Write-
Leak, verletzt aber Uploadvalidierung und Erhaltung der letzten gültigen
Backgroundkonfiguration.

`RQ-16-02` erfasst die unvollständige direkte Zuordnung der 84 nummerierten
Testfälle. Der bestehende Cache-Buster-Befund `RQ-04-01` gilt nun ausdrücklich
auch für Preview-/Runtime-/Theme-Parität; `RQ-14-04` berücksichtigt die
ausstehenden Background-Gates. MT-51, MT-52 und MT-54 wurden Sprint 25.3 mit
zugeordnet; MT-58 bis MT-60 enthalten neue vollständige iPad-, Safari/Admin-
und Standalone/LXC-Anleitungen.

Der Fokuslauf bestand mit 96/96 Tests, die Gesamtsuite mit 329/329; elf
relevante JavaScriptdateien waren syntaktisch gültig. Part 16 änderte keinen
Anwendungscode, kontaktierte kein produktives HA/HAOS/LXC/iPad und führte
keine Veröffentlichung durch. Sprint 25.3 bleibt deshalb `PARTIAL`. Part 17
wurde anschließend ausschließlich im verbindlichen Umfang Sprint 25.4
durchgeführt.

## Part-17-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 25.4 | PARTIAL | [`SPRINT-25.4-AUDIT.md`](sprints/SPRINT-25.4-AUDIT.md) |

Sprint 25.4 besitzt das geforderte `docs/RC_CHECKLIST.md`, eine Result Matrix,
eine explizite `RC BLOCKERS`-Liste und eine manuelle Abschlussreihenfolge. Die
historische RC.1 bleibt öffentlich nachweisbar: Release und beide erfolgreichen
Workflows zeigen auf `741bba4`; der anonyme GHCR-Abruf liefert HTTP 200 und ein
OCI-Manifest mit amd64/arm64. App-Metadaten, Minimalrechte, direkter Port,
backend-only Tokens und lokale Supervisor-/Standalone-Mocks sind weiterhin
funktional.

Diese Evidenz gilt nicht für den heutigen HEAD `593ba5a`. Die lebende
RC-Checkliste vermischt RC.1/`741bba4`, einen späteren LXC-Stand `42d88f3`,
275/283/290 Tests und nachträglich angehängte Sprint-25.5-/25.6-Evidenz. Sie
nennt außerdem einen nicht existierenden Root-Dockerfile, weiterhin null npm-
Schwachstellen und einen vollständigen Upload-PASS, obwohl der aktuelle Audit
eine moderate `qs`-Schwachstelle und Part 16 den P1-PNG-Defekt nachweist.
`RQ-17-01` erfasst diese fehlende Commit-/Artefaktkohärenz und die unvollständige
aktuelle Blockerliste.

Die aktuelle RC Matrix im Sprint-25.4-Audit bewertet HEAD deshalb `BLOCKED`.
Zusätzlich gelten `RQ-04-01`, `RQ-08-03`, `RQ-09-01`, `RQ-13-01`,
`RQ-14-01/-02/-04/-05` und `RQ-16-01`. MT-13, MT-34, MT-40, MT-42, MT-50 bis
MT-56 und MT-58 bis MT-60 wurden Sprint 25.4 zugeordnet; keine physische oder
produktive Prüfung wurde künstlich als PASS gewertet.

Der Fokuslauf bestand mit 92/92 Tests, die Gesamtsuite mit 329/329. 119
JavaScript- und acht Shell-Dateien waren syntaktisch gültig; Versions-, YAML-
und Secret-Scan bestanden. Part 17 änderte keinen Anwendungscode, installierte
nichts, baute/veröffentlichte kein Image und kontaktierte kein produktives
HA/HAOS/LXC/Netzwerk/iPad. Sprint 25.4 bleibt `PARTIAL`. Part 18 wurde
anschließend ausschließlich im verbindlichen Umfang Sprint 25.5, 25.6 und
25.7 durchgeführt.

## Part-18-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 25.5 | PARTIAL | [`SPRINT-25.5-AUDIT.md`](sprints/SPRINT-25.5-AUDIT.md) |
| 25.6 | PARTIAL | [`SPRINT-25.6-AUDIT.md`](sprints/SPRINT-25.6-AUDIT.md) |
| 25.7 | PARTIAL | [`SPRINT-25.7-AUDIT.md`](sprints/SPRINT-25.7-AUDIT.md) |

Sprint 25.5 behebt den bestätigten JPEG-Parserfehler korrekt. Der aktuelle
Parser trennt Marker- und Entropiedaten, akzeptiert reale Baseline-,
Progressive-, JFIF-, EXIF-/Orientation-/Thumbnail- und ICC-JPEGs sowie `.jpg`
und `.jpeg`, während getarnte, abgeschnittene und übergroße Dateien
kontrolliert scheitern. Binding `0.0.0.0`, Port 3000, WebUI und minimale
Apprechte sind korrekt. Die dokumentierte reale Sprint-Evidenz klassifiziert
den damaligen Hostnamenfehler als IPv6-/mDNS-/Netzpfad bei weiterhin
funktionierendem IPv4-IP-Zugriff, ohne App-Hacks. Der aktuelle Runtimepfad
bleibt MT-61. Die unveränderte Uploadsicherheitsvorgabe ist wegen des bereits
bekannten PNG-Defekts `RQ-16-01` dennoch `BROKEN`; reale `/data`-Persistenz und
iPad-Anzeige stehen in MT-62.

Sprint 25.6 besitzt für Sensor, Binary, Light und Climate eine umfangreiche
Matrix mit bewussten fünf Präsentationstiers und einer echten Large-Climate-
Darstellung. Die zentrale Trennung aus Gridgeometrie und Widgetpräsentation
ist erhalten. Der kontrollierte Browser-Harness renderte 1.128 Fälle und fand
keinen Overflow-, Clipping-, Tier- oder Touchzieldefekt. Er meldete jedoch 120
falsche `missing-control`-Fehler: Nach Sprint 26.2 erhalten Climate `unknown`
und `unavailable` korrekt keinen Power-Control ohne bestätigte Capability, der
alte Harness erwartet pauschal drei Controls. Zusätzlich fehlen der seit
Sprint 26.1 produktive Room-Typ und dessen vollständige gültige Größen-/State-
Matrix einschließlich Tall in zentraler Dokumentation/Harness. Beides ist als
`RQ-18-01` erfasst. Die physische Gesamtmatrix ist MT-63.

Sprint 25.7 dokumentiert HomeScreen plus Geführten Zugriff als sinnvolle
Einzelgeräteempfehlung und Supervision plus Single App Mode/App Lock als
strengere verwaltete Alternative. Direkte LAN-URLs, Hardwaretasten, Touch,
Motion/Rotation, Auto-Lock, Laden, Exit, Reboot-, WLAN-, HA- und App-Recovery
sowie Sicherheitsgrenzen sind abgedeckt. Guided Access wird ausdrücklich
nicht als unbeaufsichtigter Auto-Start-Kiosk oder Adminschutz dargestellt.
Same-window/same-origin Navigation und Apple-Standalone-Metadaten aus Sprint
25.2 sind vorhanden; moderne PWA-/Wake-Lock-APIs sind nicht erforderlich.
Exakte deutsche iOS-9-Menüs und reales Geräteverhalten bleiben MT-64 bis MT-66.
Der P1-Cachebefund `RQ-04-01` erhielt wegen des aggressiven iOS-HomeScreen-
Caches zusätzliche Kioskrelevanz.

Der fokussierte Part-18-Lauf bestand mit 89/89 Tests. 25 Wall-/
Harness-JavaScriptdateien waren syntaktisch valide; Legacy-, Navigation- und
Security-Scans waren sauber. Die Gesamtsuite konnte in dieser Session wegen
einer lokalen monotonen Timer-/Zeitsprungstörung nicht als neuer PASS gewertet
werden: zwei Läufe meldeten ausschließlich in zeitbasierten Gatewaytests einen
Timeout/Abbruch, während 327 beziehungsweise 328 Tests ohne fachlichen Fehler
bestanden. Derselbe Gatewayumfang war im ersten 89/89-Fokuslauf grün; der
frühere Part-17-Lauf 329/329 bleibt historische Evidenz und wird nicht als
Part-18-Ergebnis umetikettiert.

MT-61 bis MT-66 enthalten vollständige spätere Netz-, Upload-, Card-Matrix-,
HomeScreen-, Guided-Access-, Hardware-/Power- und Reboot-Abnahmen. Part 18
änderte keinen Anwendungscode, kontaktierte kein produktives Home Assistant,
HAOS, LXC oder physisches iPad, veröffentlichte nichts und führte Part 19 nicht
aus. Die Sprint-25-/25.x-Auditsequenz ist damit vollständig. Part 19 umfasst
laut verbindlichem Plan ausschließlich Sprint 26, 26.1 und 26.2.

## Part-19-Ergebnis

| Sprint | Ergebnis | Auditdatei |
|---|---|---|
| 26 | PARTIAL | [`SPRINT-26-AUDIT.md`](sprints/SPRINT-26-AUDIT.md) |
| 26.1 | PARTIAL | [`SPRINT-26.1-AUDIT.md`](sprints/SPRINT-26.1-AUDIT.md) |
| 26.2 | PARTIAL | [`SPRINT-26.2-AUDIT.md`](sprints/SPRINT-26.2-AUDIT.md) |

Sprint 26 besitzt ein additives persistentes Section-Modell mit stabilen IDs,
Titel, Order, `showTitle`, optionaler read-only `areaId` und optionalem
Widget-`sectionId`. Admin-CRUD, Kartenverschiebung und sichere Section-Löschung
sind vorhanden; Löschen setzt Karten auf `unassigned`, ohne ihre stabilen IDs
oder Inhalte zu entfernen. Sections werden vertikal angeordnet und verwenden
jeweils das bestehende Flexbox-Grid mit sectionlokaler Kollisionsprüfung.
Sections und HA Areas bleiben ausdrücklich unabhängige Konzepte; es existiert
kein Area-Write.

Sprint 26.1 ist als native Room Card vollständig im Schema, Admin, Public
Payload, Room-Service und ES5-Renderer vorhanden. Area-Auto-Setup nutzt stabile
read-only Registry-Metadaten nur als bestätigungspflichtigen Vorschlag; manuelle
Zuordnungen bleiben erhalten. Die früher real gemeldeten Defekte sind im
aktuellen Stand behoben: Collapse/Expand aktualisiert die betroffene Card
direkt und Controls werden vor dem Toggle abgefangen; der Runtime-Hintergrund
wird nach der CSP-Divergenz über eine dedizierte, nicht interaktive Ebene und
CSSOM gesetzt. Der kontrollierte Browser-Harness bestand vier repräsentative
Tiers. Offen bleiben der bereits bekannte gemeinsame PNG-Defekt `RQ-16-01`,
die unvollständige aktuelle Room/Card-Matrix `RQ-18-01` und reale Abnahmen.

Sprint 26.2 ersetzt die früheren Esszimmer-ID-/`heat`-Sonderfälle durch eine
zentrale persistente Grant- und Capabilityarchitektur. Grid, separater Focus
und Room konsumieren dieselben serverseitig erzeugten Light-/Climate-
Capabilities. Power verlangt echte `hvac_modes`; der sichere On-Mode folgt
Last-known, gültiger Preference, aktuellem Nicht-Off-Modus und deterministischem
unterstütztem Fallback. Climate Target bleibt in `off` bedienbar, wenn Feature,
Min/Max/Step und Grant es erlauben, und ruft ausschließlich
`climate.set_temperature` auf. Mehrere Entity-IDs, Ablehnungsfälle und
Integrationserror/Rollback sind lokal geprüft. Keine generische Service- oder
WebSocket-Writefläche wurde gefunden.

Der Part-19-Fokuslauf bestand mit 95/95 Tests, der ergänzende Gateway-/
Cross-Surface-Lauf mit 72/72 und die vollständige Regression mit 329/329.
Sämtliche Wall-JavaScriptdateien bestanden `node --check`; Legacy-, CSS- und
Securityscans waren grün. Ein kontrollierter Browserlauf des Room-Harness
bestand 4/4 Fälle. Ausschließlich localhost-Mocks und Fake-Credentials wurden
verwendet; kein produktives HA, HAOS, LXC oder physisches iPad wurde
kontaktiert.

MT-67 bis MT-72 ergänzen vollständige Section-, Room-, HAOS-, reale HA-Control-
und iPad-Control-Abnahmen. Im finalen Strukturabgleich fiel außerdem auf, dass
MT-01 bis MT-10 nur Kurzbeschreibungen besaßen; Part 19 ergänzte dafür
vollständige Voraussetzungen, Routen/Testdaten, Schritte, visuelle und
funktionale Erwartungen, Fehlerkriterien, Evidenz und `NOT TESTED`, ohne ein
Ergebnis vorzutäuschen.

Part 19 erzeugt keinen neuen Reparaturpunkt. `RQ-04-01` erhielt Evidenz für
Section-/Room-/Controlcache, `RQ-16-01` wurde auf den wiederverwendeten Room-
Backgroundpfad und `RQ-18-01` auf den tatsächlich grünen, aber unvollständigen
Room-Harness sowie Sprint-26.2-Capabilities erweitert.

## Finale Baseline-Konsistenzprüfung

- Alle 37 auditierbaren Sprint-Spezifikationen aus Parts 01 bis 19 besitzen
  eine Auditdatei; Sprint 27 bleibt als Auditprogramm `N/A`.
- Jeder umsetzbare `PARTIAL`-/`MISSING`-/`BROKEN`-Befund verweist auf einen
  bestehenden Repair-Eintrag. Reine physische/runtimeabhängige `PARTIAL`- oder
  `NOT TESTED`-Punkte besitzen einen Manual-Test oder eine begründete
  Evidenzgrenze.
- Alle `MISSING`- und `BROKEN`-Produkt-/Dokumentationsbefunde sind in der
  Repair Queue repräsentiert. Es gibt keinen offenkundigen doppelten Root
  Cause; Part 19 erweiterte RQ-04-01, RQ-16-01 und RQ-18-01 statt neue IDs zu
  erzeugen.
- Die 25 offenen Repair-Einträge enthalten ausnahmslos Priorität, Evidence,
  vorgeschlagene Reparatur und RC-Relevanz: P0 0, P1 8, P2 17, P3 0.
- Alle 72 manuellen Tests besitzen nach der Dokumentationskorrektur eine
  vollständige Einzelanleitung und bleiben `NOT TESTED`. Primäre Zuordnung:
  iPad mini/HomeScreen 31, iPad Air 2 5, macOS-/Browser-/kontrolliertes Test-HA
  18, Standalone/LXC 9, HAOS 7, Release/GitHub 2. Überschneidungen in den
  Voraussetzungen sind in den Einzeltests beschrieben; die Primärgruppen
  zählen jeden Test genau einmal.
- Es fehlt keine geplante Auditdatei und kein Part ist strukturell unvollständig.
  Historische Auditdokumente wurden nicht überschrieben; die uncommitteten
  Dateien der Parts 12 bis 18 bleiben erhalten.
- Die Baseline ist damit bereit für eine Repair-Queue-Konsolidierung. Vor einem
  Sprint 27.1 sollen zuerst Root-Cause-Reihenfolge, Abhängigkeiten und
  Re-Audit-Gates festgelegt werden. Es wird kein Audit Part 20 erfunden.

## Repair-Queue-Consolidation

- Status: **COMPLETE**
- Konsolidierungsdatum: 9. September 2026
- geprüfter Codecommit: `593ba5a`
- Bericht: [`REPAIR_QUEUE_CONSOLIDATION.md`](REPAIR_QUEUE_CONSOLIDATION.md)
- Kanonische Repairs: 25 (P0 0, P1 7, P2 18, P3 0)
- Direkte RC-Blocker: 6; bedingte RC-Blocker: 5
- Security-sensitive Repairs: 11
- Manuelle Tests: 72 weiterhin `NOT TESTED`; 60 durch konkrete Repairs
  blockiert, MT-29/MT-57 bewusst erst nach späteren Endständen
- Nächste Phase: Sprint 27.1, beginnend mit dem vorgeschlagenen Batch 27.1-A
  für `RQ-16-01`, danach 27.1-B für `RQ-04-01`
- Finales RC-Gate: **PENDING**

Die Konsolidierung normalisierte und priorisierte ausschließlich den Backlog.
Sie reparierte keinen Produktcode, führte keinen Realtest aus und bedeutet
nicht, dass das Projekt RC-ready ist.

## Sprint 27.1 – Repair Batch A

- Status: **COMPLETE – AUTOMATED GATE PASS / MANUAL PENDING**
- Basiscommit: `dec0c54`
- Repair: `RQ-16-01`
- Root Cause: Der gemeinsame PNG-Parser prüfte weder Chunk-CRC noch zwingende
  Bilddaten und Critical-Chunk-Reihenfolge; ein ungültiger Upload konnte daher
  als erfolgreicher Dashboard-/Room-Ersatz das letzte gültige Asset verdrängen.
- Implementierung: CRC32 je Chunk, gültiger IHDR-Inhalt, strikte bekannte
  Critical-Chunk-Reihenfolge, zusammenhängendes IDAT und sauberes IEND/EOF im
  zentralen `dashboard-backgrounds`-Store.
- Re-Audit: Sprint 25.3, 25.4, 25.5 und 26.1.
- Testevidenz: 85/85 fokussiert und 330/330 vollständig, alle geänderten
  JavaScriptdateien syntaktisch gültig; ausschließlich Localhost-Mocks,
  Fake-Credentials und lokale Dateien.
- Manuell: MT-59 und MT-60 sind jetzt ausführbar; alle 72 Ergebnisse bleiben
  `NOT TESTED`. Weitere verknüpfte Tests bleiben nur wegen anderer Repairs
  blockiert.
- Nächster zulässiger Schritt war Batch 27.1-B (`RQ-04-01`); kein anderer
  Repair wurde begonnen.

## Sprint 27.1 – Repair Batch B

- Status: **COMPLETE – AUTOMATED GATE PASS / MANUAL PENDING**
- Basiscommit: `3830259`
- Repair: `RQ-04-01`
- Root Cause: Dashboard, Systemseite, Admin und Manifest verwendeten trotz
  immutable Static-Cache unterschiedliche Assetquery-Versionen v51/v44/v50.
- Implementierung: sämtliche Assetreferenzen auf die erhöhte gemeinsame
  Version v52 gesetzt; `test/asset-version.test.js` erzwingt Gleichheit,
  Erhöhung und die Parität gemeinsam genutzter Theme-/Navigation-/Icon-/
  Presentation-Assets.
- Re-Audit: Sprint 17.2 bis 17.7 sowie alle im kanonischen Finding betroffenen
  Audits Sprint 18 bis 26.2, insgesamt 29 Auditdateien.
- Testevidenz: 46/46 fokussiert und 331/331 vollständig; keine Produktlogik,
  HA-Route, Berechtigung oder Cache-Header-Semantik verändert.
- Manuell: `RQ-04-01` wurde aus allen Testabhängigkeiten entfernt; sämtliche
  72 Ergebnisse bleiben `NOT TESTED`, kombinierte Tests behalten ihre übrigen
  Blocker.
- Ergebnis: `RQ-04-01` **CODE CLOSED / MANUAL PENDING**. Sprint 27.1 stoppt
  planmäßig nach Batch B; kein weiterer Repair wurde begonnen.

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
- Part-09-Fokustests: 153 von 153 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei vier lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-10-Fokustests: 142 von 142 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei zwei lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-11-Fokustests: 165 von 165 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei zwei lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-12-Fokustests: 118 von 118 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei zwei lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-13-Fokustests: 153 von 153 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei vier lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-14-Fokustests: 19 von 19 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei zwei lokalen Mockservern
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-15-Fokustests: 65 von 65 Tests bestanden, 0 fehlgeschlagen.
  Ein erster eingeschränkter Lauf traf bei einem lokalen Gateway-Mock
  ausschließlich auf `listen EPERM`; der identische Lauf mit freigegebenem
  127.0.0.1-Bind war vollständig grün.
- Part-16-Fokustests: 96 von 96 Tests bestanden, 0 fehlgeschlagen. Verwendet
  wurden ausschließlich lokale Filesystem-Fixtures, localhost-Mocks und
  Fake-Credentials. Elf relevante JavaScriptdateien bestanden `node --check`,
  beide relevanten Shell-Entry-Points `sh -n`; der direkte Versionsstringcheck
  bestätigte `v1.0.0-rc.1` (Source-/Tag-Drift bleibt `RQ-13-01`).
- Part-17-Fokustests: 92 von 92 Tests bestanden, 0 fehlgeschlagen; Gesamtsuite
  erneut 329 von 329. 119 JavaScript- und acht Shell-Dateien bestanden die
  Release-Gate-Syntaxprüfungen; YAML-, Versions- und Secret-Scan waren grün.
  Der Produktionsaudit meldete eine moderate `qs`-Schwachstelle mit zwei
  Advisories und Exit 0 bei `--audit-level=high` (`RQ-14-05`).
- Part-18-Fokustests: 89 von 89 Tests bestanden, 0 fehlgeschlagen. Der
  kontrollierte Card-Matrix-Browserlauf renderte 1.128 Fälle und erreichte alle
  fünf Tiers; er meldete keine Overflow-, Clipping-, Touchziel- oder
  Tierverletzung, aber 120 veraltete `missing-control`-Erwartungen für Climate
  `unknown`/`unavailable` (`RQ-18-01`). 25 Wall-/Harness-JavaScriptdateien
  bestanden `node --check`; Legacy-, Navigation- und Credentialscans waren
  sauber. Zwei Gesamtsuite-Wiederholungen waren wegen einer lokalen monotonen
  Timer-/Zeitsprungstörung in zeitbasierten Gatewaytests technisch ungültig
  (327/329 beziehungsweise 328/329 ohne fachlichen Fail, Rest abgebrochen);
  daher wird für Part 18 kein neuer 329/329-PASS behauptet.
- Part-19-Fokustests: 95 von 95 Tests bestanden, 0 fehlgeschlagen. Ein erster
  eingeschränkter Lauf traf bei lokalen Mockservern ausschließlich auf
  `listen EPERM`; der identische Lauf mit freigegebenem localhost-Bind war
  vollständig grün. Der ergänzende Gateway-/Cross-Surface-Lauf bestand 72/72,
  die vollständige Suite 329/329. Der kontrollierte Room-Browser-Harness
  bestand Compact, Standard, Wide und Large mit 4/4 Fällen; seine fehlende
  vollständige Tall-/Size-/State-/Capability-Matrix bleibt `RQ-18-01`.
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
- JavaScript-Syntax: für Part 13 wurden 7 relevante Runtime-, REST-, WebSocket-,
  Server-, Admin-, Logging- und Testdateien mit `node --check` geprüft, ohne
  Fehler. `run.sh` und `prepare-home-assistant-app.sh` bestanden `sh -n`; Root-,
  App- und Übersetzungs-YAML ließen sich sicher parsen. Frühere vollständige
  Legacy-Scans bleiben als Evidenz erhalten.
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
- Kontrollierte Part-12-Direktproben reproduzierten falsches `ruleSource`, den
  nicht erreichbaren Dynamic-`unknown`-Impact und den veralteten Automation-
  Impactindex innerhalb des Config-TTL; dabei wurden keine Dateien oder
  externen Systeme verändert.
- Kontrollierte Part-16-Direktproben reproduzierten die unvollständige PNG-
  Validierung: fehlendes `IDAT` und falsche Chunk-CRC wurden akzeptiert. Es
  wurden keine Dateien im Repository und keine externen Systeme verändert.
- Öffentliche Part-17-Prüfung: GitHub Release/API bestätigen weiterhin nur
  `v1.0.0-rc.1` auf `741bba4`; beide referenzierten Workflows waren erfolgreich.
  Der anonyme GHCR-Manifestabruf lieferte HTTP 200, amd64/arm64 und Digest
  `sha256:1c5d4eeae461ce88b3775d0a6666d7a6f67774046102ac50c8a54e77fc498e7c`.
- Part-13-Verpackungsprobe: der erzeugte lokale Supervisor-Kontext enthielt
  weiterhin `image: ghcr.io/tekky85/ha-legacy-dashboard`; Docker war auf dem
  Audit-Mac nicht installiert, daher wurde kein aktuelles lokales Image gebaut.
- Part-13-Versionsevidenz: `v1.0.0-rc.1` zeigt auf `741bba4`, während HEAD
  `593ba5a` ist und seit dem Tag mehrere laufzeitrelevante Änderungen enthält.
  Der formale Versionsstringcheck und der Secret-Scan waren dennoch grün.
- Part-14-Veröffentlichungsevidenz: öffentlicher RC.1-Run `33203376391` mit
  Validate, amd64, arm64, Manifest, Smoke und Prerelease vollständig grün;
  Stable-`latest` korrekt übersprungen. Das öffentliche Archiv hatte SHA256
  `c7db4e1874334195aaf00147f5a58e6d46b31cc3c14cfbb04c93c3c96880d984`.
- Part-14-Bundleprobe: zwei aktuelle lokale Archive waren byteidentisch. Das
  öffentliche und aktuelle Bundle enthielt weder `.env`, Daten, Tests, Keys
  noch `node_modules`, aber auch weder die verlinkte `docs/RELEASING.md` noch
  die von `docs/DEPLOYMENT.md` verlangten Git-Deployskripte (`RQ-14-01`).
- Produktionsabhängigkeitsaudit: kein High/Critical-Befund; zwei moderate
  DoS-Advisories für `qs@6.15.3` sind als `RQ-14-05` erfasst.
- Offizielle Home-Assistant-App-Konventionen für Repositorystruktur,
  `homeassistant_api`, Core-REST/-WebSocket, `/data` und generische Multi-Arch-
  Images wurden am 8. September 2026 gegen die aktuelle Developer-
  Dokumentation geprüft.
- Auditlauf änderte keinen Anwendungscode. Parts 01 bis 19 sind abgeschlossen;
  damit ist die geplante Sprint-27-Baseline vollständig. Nächster Schritt ist
  Repair-Queue-Konsolidierung vor Sprint 27.1, nicht ein Audit Part 20.
