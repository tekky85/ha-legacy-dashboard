# Sprint 17.2 Audit

## Audit Metadata

- Sprint: 17.2
- Sprint title: Card Identity, Proportional Geometry & Theme Persistence
- Audit date: 1. September 2026
- Repository commit: `8d5b4bd`
- Spec file: [`docs/sprints/SPRINT-17.2.md`](../../sprints/SPRINT-17.2.md)
- Working tree at Part-04 start: Anwendungscode sauber; ausschließlich die
  noch nicht committeten Auditdokumente aus Part 03 waren vorhanden.

## Overall Result

PARTIAL

Kartenidentität, proportionale und gecachte Rastergeometrie, pixelabhängige
Präsentation, Theme-Persistenz samt sicherem Storage-Fallback sowie die
Legacy-Grenzen sind im aktuellen Code implementiert. Spätere Sprints haben
die damaligen drei Presentation Modes und die kompakte Climate-Control-
Anordnung bewusst weiterentwickelt. Der aktuelle Endzustand erfüllt das
ursprüngliche Bedienziel über fünf Presentation-Tiers und die native Focus-
Ansicht.

Part 04 fand einen aktuellen umsetzbaren Defekt: `index.html` lädt die
gemeinsam genutzten Legacy-Assets mit `v=51`, `system.html` dieselben Dateien
weiterhin mit `v=44`. Wegen `immutable`-Caching kann ein altes Safari dadurch
auf Summary/Errors veraltetes `theme.js` oder `style.css` behalten. Zusätzlich
fehlt die physische iPad-mini-/iOS-9-Abnahme. Deshalb ist Sprint 17.2 nicht
vollständig `PASS`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.2-I1 | Jede kompakte Karte behält eine sichtbare Identität | PASS | `src/public/js/core/presentation.js`: `getIdentity()`; `src/public/js/widgets/{sensor,binary,light,climate}.js`; `test/sprint-17-2.test.js` | Kontrollierter Browserlauf zeigte für alle fünf sichtbaren Karten `.card-identity`. |
| 17.2-I2 | Priorität: Widget-Titel, Raum/Kurztext, `friendly_name`, Entity-ID | PASS | `src/public/js/core/presentation.js`: `getIdentity()`; `src/public/js/core/widget.js`: `getCardIdentity()`; Test „Card-Identität folgt …“ | Die Fallback-Reihenfolge ist zentral und nicht rendererabhängig. |
| 17.2-I3 | Identität hat eigene DOM-Klasse und ist von Wert/Zustand getrennt | PASS | `.card-identity` in allen vier Widget-Renderern; `src/public/css/style.css` | Keine Ableitung nur aus Farbe oder Icon. |
| 17.2-S1 | Sensor Compact zeigt Wert, Unit und Identität | PASS | `src/public/js/widgets/sensor.js`; Compact-Regeln in `style.css`; Sprint-17.2-/25.6-Tests | Kontrollierter Lauf: `21.4°C` plus `Badezimmer`, ohne Overflow. |
| 17.2-B1 | Binary Compact zeigt Zustand und Identität eindeutig | PASS | `src/public/js/widgets/binary.js`; `style.css`; Sprint-17.2-Test | Textzustand bleibt sichtbar und ist nicht nur farbcodiert. |
| 17.2-L1 | Light Compact zeigt Zustand, Identität und bedienbaren Power-Control | PASS | `src/public/js/widgets/light.js`; `src/public/js/controls/power.js`; Sprint-17.3/17.6/17.7-Tests | Power-Komponente wurde später als gemeinsames SVG-Control gehärtet. |
| 17.2-C1 | Climate Compact erhält Identität, Ist-/Sollwert und Schrittsteuerung | PASS | `src/public/js/widgets/climate.js`; `src/public/js/focus/renderer.js`; Sprint-17.3/17.5-/25.6-Tests | Superseded: Sprint 17.3/17.5 verlagerten vollständigen Sollwert und ± bewusst in Focus; der Zugriff bleibt vorhanden. |
| 17.2-C2 | Climate-Control bleibt zentriert und touchfähig | PASS | `src/public/css/style.css`; Sprint-17.7-Test; kontrollierter Focus-Lauf | Gemessen: Minus/Plus je 56×56 px, Power 54 px hoch und am Panelzentrum. Reales iPad bleibt MT-14. |
| 17.2-G1 | Zentrale proportionale Zeilengeometrie mit Faktor, Gutter und Padding | PASS | `src/public/js/core/presentation.js`: `ROW_ASPECT_FACTOR`, `calculateGridGeometry()`; `src/public/js/core/layout.js`: `calculateGeometry()` | `ROW_ASPECT_FACTOR=0.9`, Gutter 20 px, Mindestzeile 128 px. |
| 17.2-G2 | Zeilenhöhe aus Containerbreite und Profilspalten statt globaler Pixelkonstante | PASS | `src/public/js/core/layout.js`: `calculateGeometry()`; Test „Rastergeometrie ist proportional …“ | Tatsächliche Containerbreite fließt in die Berechnung ein. |
| 17.2-G3 | Mindesthöhe verhindert unbedienbar flache Karten | PASS | `MIN_ROW_HEIGHT=128`; Layout- und Presentation-Tests | Typspezifische Rasterminima bleiben zusätzlich serverseitig aktiv. |
| 17.2-G4 | `w/h` wirken proportional auf die endgültige Pixelgeometrie | PASS | `src/public/js/core/layout.js`: `apply()`; `test/sprint-17-2.test.js` | Breite und Höhe werden aus demselben validierten Raster abgeleitet. |
| 17.2-G5 | Neuberechnung bei Resize/Orientierung ohne Polling oder State-Reload | PASS | `src/public/js/app.js`: Resize-Handler; `src/public/js/core/layout.js`: Geometrie-/Presentation-Cache; Legacy-Layouttests | Signaturen vermeiden unnötige DOM-Arbeit. |
| 17.2-P1 | Präsentation berücksichtigt Typ, Rastergröße und reale Pixelmaße | PASS | `src/public/js/core/presentation.js`: `getHints()`, `getMode()`; Sprint-17.2-/25.6-Tests | Spätere Content-/Capability-Hints erweitern das ursprüngliche Modell. |
| 17.2-P2 | Damalige Modi Compact/Normal/Expanded | N/A | Sprint 25.6; `src/public/js/core/presentation.js`: `TIERS` | Bewusst ersetzt durch `compact`, `standard`, `wide`, `tall`, `large`; kein aktueller Defekt. |
| 17.2-P3 | Keine globale Inhaltsverkleinerung per `zoom` oder `transform: scale()` | PASS | statischer Scan `src/public`; `src/public/css/style.css` | Präsentation wird selektiv über Klassen geregelt. |
| 17.2-T1 | Lange Titel werden einzeilig gekürzt und zerstören das Grid nicht | PASS | `.card-identity`, `.card .title`, `.card .subtitle` mit Shrink-/Ellipsis-Regeln; Sprint-25.6-Matrix | Kontrollierter 768×1024-Lauf zeigte keinen Karten- oder Body-Overflow. |
| 17.2-T2 | Icons, Schrift und Sekundärinhalt reagieren auf verfügbare Größe | PASS | `style.css`: `card-presentation-*`; `presentation.js`: Content-Hints | Fünf aktuelle Tiers superseden die damalige Drei-Stufen-Ausprägung. |
| 17.2-T3 | Interaktive Touchziele bleiben ungefähr 44 px oder größer | PASS | Control-CSS; Sprint-17.6/17.7-Tests; kontrollierte Messung | Physische Touch-Abnahme bleibt `NOT TESTED`. |
| 17.2-TH1 | Ein globales Theme für alle Wall-Routen | PASS | `src/public/js/core/theme.js`: `storageKey = "ha-legacy-theme"`; `index.html`, `system.html` | `/`, `/d/:id`, Summary und Errors verwenden dasselbe Theme-Modul. Admin bleibt separat. |
| 17.2-TH2 | Theme überlebt Reload und Navigation | PASS | `theme.js`: `readStoredTheme()`, `persistTheme()`; Sprint-17.2-Tests; kontrollierter Browserlauf | Light blieb nach Reload und Navigation zu `/system/summary` aktiv. |
| 17.2-TH3 | LocalStorage-Fehler und ungültige Werte werden sicher behandelt | PASS | `theme.js`: Try/Catch und Cookie-Fallback; Tests „Storage-Fehlern …“, „Ungültige Theme-Werte …“ | Kein Startabbruch bei eingeschränktem Safari-Storage. |
| 17.2-TH4 | Theme wird vor sichtbarem Seitenaufbau angewendet | PASS | `index.html` und `system.html`: `theme.js` vor Styles; `theme.js`: frühe Root-Klasse | CSP bleibt ohne Inline-Script intakt. |
| 17.2-TH5 | Gemeinsame Theme-/Style-Assets tragen routenübergreifend denselben Cache-Buster | PARTIAL | `src/public/index.html`: `theme.js`/`style.css?v=51`; `src/public/system.html`: dieselben Dateien mit `v=44`; `setStaticHeaders()` setzt Assets immutable | Reparatur RQ-04-01. Der vorhandene Test prüft frühes Laden, aber akzeptiert die Versionsabweichung und deckt die Regression nicht ab. |
| 17.2-A1 | Admin-Layouteditor behält Drag/Resize, Minimum, Bounds und Kollision | PASS | `src/admin/js/app.js`, `src/admin/js/layout.js`; Part-03-Audit; `test/admin-ui.test.js` | Part 04 änderte keinen Anwendungscode. |
| 17.2-A2 | Backend validiert Raster weiterhin autoritativ und persistiert atomar | PASS | `src/services/layout.js`; `src/services/dashboard-config-store.js`; Admin-/Persistenztests | Ungültige Konfiguration wird vor dem Schreiben abgewiesen. |
| 17.2-SEC1 | Keine Änderung von HA-Schreibrechten, Allowlist oder System-Businesslogik | PASS | `src/services/control-authorization.js`; `src/routes/api.js`; Security-/Systemtests | Geometrie, Identität und Theme sind rein präsentational. |
| 17.2-LEG1 | Wall-JavaScript bleibt ES5/iOS-9-kompatibel | PASS | 21 Public-JS-Dateien mit `node --check`; Forbidden-Syntax-Scan | Kein `let/const`, Arrow, Fetch, Promise, Async/Await, Optional Chaining oder `??`. |
| 17.2-LEG2 | Kein CSS Grid, Flexbox-`gap`, ResizeObserver oder Container Query im Wall-Frontend | PASS | statischer Scan `src/public`; Legacy-/Systemtests | Admin darf als moderner separater Client CSS Grid verwenden. |
| 17.2-PERF1 | Geometrie/Presentation werden gecacht und nicht per Polling neu berechnet | PASS | `src/public/js/core/layout.js`: `geometryCache`, `presentationCache` | Zustands-Polling und Resize-Geometrie bleiben getrennt. |
| 17.2-TST1 | Identity-, Geometrie-, Presentation-, Theme- und Regressionstests | PASS | `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/system-frontend.test.js`, `test/sprint-25-6.test.js` | Part-04-Fokuslauf 127/127; Gesamtsuite 329/329. |
| 17.2-MAN1 | Reale iPad-Abnahme für kompakte Karten und Proportionen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-11 und MT-12 | Part 04 führte ausdrücklich keinen physischen iPad-Test durch. |
| 17.2-MAN2 | Reale iPad-Abnahme für Theme über Routen, Reload und Neustart der Web-App | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-13 | Kontrolliertes Chromium ist keine iOS-9-Abnahme. |
| 17.2-DOC1 | Status/Roadmap und Assetversion dokumentieren | PARTIAL | `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md`; aktuelle HTML-Dateien | Die Dokumentation beschreibt den Sprint, aber die aktuelle Cacheversion ist zwischen Wall- und Systemseite inkonsistent. Mit RQ-04-01 gemeinsam zu korrigieren. |

## Automated and Controlled Browser Evidence

- Part-04-Fokuslauf: 127 Tests bestanden, 0 fehlgeschlagen.
- Vollständige Suite: 329 Tests bestanden, 0 fehlgeschlagen.
- 21 Legacy-JavaScript-Dateien bestanden `node --check`.
- Statischer Scan: keine verbotene moderne JavaScript-Syntax, kein CSS Grid,
  kein Flexbox-`gap`, kein `ResizeObserver`, keine Container Query und keine
  Tokenbezeichner im Wall-Frontend.
- Kontrollierter lokaler Browserlauf mit Fake-HA: 768×1024, fünf sichtbare
  Karten, keine horizontale Seite- oder Kartenüberläufe, stabile Identität.
- Theme blieb nach Umschaltung, Reload und Navigation zu Summary erhalten.
- Keine Browser-Console-Warnung und kein Browser-Console-Fehler.
- Kein reales Home Assistant, keine produktive `.env` und keine echten
  Credentials wurden verwendet.

## Superseded Requirements

- Sprint 17.3/17.5 ersetzten vollständige Controls in der kleinsten Climate-
  Gridkarte durch einen vom Grid getrennten nativen Focus-Renderer.
- Sprint 17.6/17.7 ersetzten das damalige Power-/Control-Markup durch ein
  gemeinsames SVG-Control und eine Mobile-Safari-stabile Hierarchie.
- Sprint 25.6 ersetzte drei Presentation Modes durch fünf Tiers, die neben
  Typ und Rastergröße echte Pixelmaße, Fähigkeiten und Inhalt berücksichtigen.

## Security Review

PASS – Theme, Identität und Geometrie haben keine HA-Schreibfläche. HA-Token,
Supervisor-Token und Admin-Token bleiben backendseitig bzw. im geschützten
Admin-Kontext; Sichtbarkeit und Layout erteilen keine Control-Grants.

## Runtime Relevance

- Standalone/LXC: Logik und lokale Standalone-Laufzeit sind grün; kein
  produktiver LXC wurde in Part 04 verändert oder neu gestartet.
- Home Assistant App: Präsentations- und Theme-Code ist runtimeunabhängig.
  Eine reale HAOS-Abnahme gehört nicht zum Sprint-17.2-Scope und bleibt einem
  späteren Audit-Part vorbehalten.

## Findings

- `PARTIAL`: uneinheitliche Cacheparameter für gemeinsam genutzte Wall-/System-
  Assets (`v=51` gegenüber `v=44`), Reparatur RQ-04-01.
- `NOT TESTED`: physische iPad-mini-/iOS-9-Render-, Rotations-, Touch- und
  Theme-Abnahmen MT-11 bis MT-13.
- Kein `MISSING` und kein aktuell reproduzierter funktionaler `BROKEN`-Befund.

## Final Assessment

Sprint 17.2 ist funktional weitgehend vorhanden, kann wegen des aktuellen
Cache-Buster-Befunds und der ausstehenden realen Zielgeräteabnahme aber nur als
`PARTIAL` bewertet werden.
