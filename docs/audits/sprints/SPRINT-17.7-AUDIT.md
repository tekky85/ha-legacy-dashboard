# Sprint 17.7 Audit

## Audit Metadata

- Sprint: 17.7
- Sprint title: Legacy Safari Control Alignment Hardening
- Audit date: 2. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-17.7.md`](../../sprints/SPRINT-17.7.md)
- Working tree at Part-06 start: kein veränderter Anwendungscode; nur der
  bereitgestellte Part-06-Prompt war unversioniert.

## Overall Result

PARTIAL

Die gesamte Control-Hierarchie ist im aktuellen Code vorhanden und wird in
Grid und Focus strukturell geteilt: vollbreite Row, zentrierte Inline-Block-
Group, echter Inline-Block-Button, separat präfixiert zentriertes Content-
Element und blockförmiges SVG. Der historische iOS-spezifische Fehlerpfad –
native anonyme Button-Inhaltsbox plus ein Compact-`align-self:flex-end` – ist
nicht mehr vorhanden. Lokale Browsermessungen bestätigen die berechneten
Mittelpunkte. Die Spezifikation verlangt jedoch reale Prüfungen auf iPad mini,
iPad Air 2 und macOS Safari; diese bleiben `NOT TESTED`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.7-RC1 | Tatsächliche Mobile-Safari-Ursache konkret identifizieren | PASS | Historischer Commit `ed2878a`; `docs/PROJECT_STATUS.md`, Abschnitt 8e | Native Buttons waren selbst Flex-Container; ältere WebKit-Versionen richteten deren anonyme Inhaltsbox abweichend aus. Zusätzlich schob `align-self:flex-end` den Compact-Control-Parent. |
| 17.7-RC2 | Row, Cell/Group, Button, Content, SVG/Icon und Label vollständig auditieren | PASS | `power.js`, `light.js`, `climate.js`, `focus/renderer.js`, Control-CSS; Sprint-17.7-Tests | Jede Ebene ist explizit und besitzt eigene Maße/Zentrierung. |
| 17.7-RC3 | CSS-Specificity und Media Queries auf Gegenregeln prüfen | PASS | `style.css` Presentation-/Focus-/Media-Blöcke; statischer Scan | Der frühere Compact-`align-self:flex-end` ist entfernt. Keine Mobile-Regel setzt Control-Rows auf `flex-start` oder Text links. |
| 17.7-A1 | Alle betroffenen Controls horizontal und vertikal zentrieren | PASS | kontrollierte 768×1024- und 1024×768-Messungen; Sprint-17.7-Tests | Grid-Light, Grid-Climate-Power, Focus ± und Focus-Power waren jeweils in ihrer vorgesehenen Zone intern zentriert. |
| 17.7-B1 | Explizite Control-Row/Group/Button-Hierarchie | PASS | `LegacyControls.controlRow()` und `controlContent()` | Markup ist `dashboard-control-row → dashboard-control-group → button → dashboard-control-content`. |
| 17.7-B2 | Control-Row nimmt den vorgesehenen verfügbaren Bereich ein | PASS – superseded by Sprint 25.6 | `.dashboard-control-row { width:100% }`; tierbezogene Ausnahmen | Light und Focus nutzen volle Rows. In kompakten/landscape Tiers darf Sprint 25.6 bewusst eine kleinere Control-Zone verwenden; deren Inhalt bleibt zentriert. |
| 17.7-C1 | Gezielte Legacy-Flex-Präfixe | PASS | `.dashboard-control-content`: `display:-webkit-flex`, `-webkit-align-items`, `-webkit-justify-content` | Präfixe sitzen nur am neutralen inneren Content, nicht blind auf allen Buttons. |
| 17.7-C2 | Robuster Fallback bei instabilem Button-Flex | PASS | Row/Group/Button sind Block/Inline-Block plus `text-align:center`; Content besitzt präfixiertes Flex | Das ist genau der spezifizierte einfache Legacy-Fallback. |
| 17.7-D1 | Light Power auf normalen Karten zentriert | PASS – superseded by Sprint 25.6 | `render()` in `light.js`; `.light-control-row/group`; Browsermessung | Im Compact-Lauf waren Row/Card-Mittelpunkt 572 px; Group, Button, Content und SVG lagen ebenfalls bei 572 px. Andere Tiers nutzen dieselbe Hierarchie. |
| 17.7-D2 | Dedizierte Control-Zone statt zufälliger Margin | PASS | `LegacyControls.controlRow()`; `.light-control-row`, `.light-control-group` | Die Zentrierung kommt aus Breite und `text-align:center`, nicht aus einem gerätespezifischen Offset. |
| 17.7-D3 | Climate Power auf normalen Karten zentriert | PASS – superseded by Sprint 25.6 | `.climate-target-row`, `.climate-target-group`, `climate-power-control`; Browsermessung | Im Compact-Tier liegt die 50-px-Controlzone bewusst rechts neben dem Primärwert; Button, Content und SVG besitzen innerhalb dieser Zone denselben Mittelpunkt. Standard/Large verwenden die gemeinsame Gruppe. |
| 17.7-E1 | Climate-Focus Minus/Plus-Gruppe zentriert | PASS | `renderClimateFocus()`; `.focus-temperature-control-row`, `.focus-step-controls`; Browsermessung | Portrait: Row/Group-Mittelpunkt 384 px; Buttons symmetrisch bei 350/418 px. |
| 17.7-E2 | Minus/Plus intern zentriert und mindestens 44×44 px | PASS | `.focus-step-action` 56×56; `.dashboard-control-content`; `.focus-step-icon` 26×26 | Button, Content und SVG hatten je denselben X-/Y-Mittelpunkt. |
| 17.7-E3 | Climate-Focus Power zentriert | PASS | `.focus-power-control-row/group`; gemeinsamer Power-Renderer; Browsermessung | Portrait: Row, Group, Button und Content bei X=384 px; Icon+Label als Gesamtinhalt zentriert. |
| 17.7-E4 | Light-Focus Power zentriert | PASS | `renderLightFocus()`; Browsermessung | Row, Group, Button und Content lagen auf X=384 px; 180×54-px-Touchziel. |
| 17.7-E5 | Portrait und Landscape bewusst behandeln | PASS | `.focus-layout-landscape`, `.focus-layout-short`; Browserläufe 768×1024 und 1024×768 | Landscape ordnet Ziel, Step- und Power-Gruppen kompakt; jede Gruppe bleibt intern zentriert und der Focus ohne Overflow. |
| 17.7-F1 | Power-Icon und Icon-plus-Label vollständig zentrieren | PASS | `.dashboard-control-power-content`, Icon-/Label-CSS | Icon-only sitzt mittig; bei Icon+Label ist die gesamte Content-Gruppe mittig, mit expliziter Label-Margin statt `gap`. |
| 17.7-G1 | Parentbreite, min/max-width und Flexbasis kontrollieren | PASS | `.dashboard-control-row/group/content`, tier- und Focus-Regeln | Rows besitzen `width:100%`/`min-width:0`; Buttons werden nicht unnötig `flex:1`; Focus-Actions schrumpfen nicht. |
| 17.7-H1 | Compact/Tablet/Mobile/Portrait/Landscape-Overrides überschreiben Zentrierung nicht | PASS | CSS-Audit und Sprint-17.7-Test „Portrait, Landscape und Short …“ | Focus-Namespace bleibt von Grid-Presentation getrennt; kein später Selector reaktiviert `align-self:flex-end`. |
| 17.7-I1 | Native Safari Button Styles gezielt neutralisieren | PASS | `.dashboard-control`, `.climate-control`, `.focus-action` | `-webkit-appearance:none`, geerbte Schrift, kontrollierte Line-Height/Padding/Border/Box-Sizing. |
| 17.7-J1 | Gemeinsame Layoutbasis bei getrennter Grid-/Focus-Geometrie | PASS | `power.js`, `focus/renderer.js`, Sprint-17.5–17.7-Tests | Geteilt werden Control-Primitiven; Gridpositionen und Focus-Viewport bleiben getrennt. |
| 17.7-K1 | Keine Debug-Styles oder sensitiven Debug-Logs verbleiben | PASS | statischer Source-Scan; Browserkonsole | Keine Control-Outlines/ClientWidth-Logs; kontrollierter Browserlauf ohne Warnung/Fehler. |
| 17.7-T1 | Normales Dashboard: Größen, Titel, Busy und unavailable | PASS | Sprint-17.6/17.7-, Card-Matrix-, Sprint-25.6- und Sprint-26.2-Tests | Lange Titel, unterschiedliche Tiers, Busy/Disabled und Capability-Grenzen sind automatisiert abgedeckt. |
| 17.7-T2 | Focus: Gruppe, Buttoninhalt, Rotation und Refresh | PASS | Sprint-17.4–17.7-Tests; Browsermessung | Native Renderer, Refreshbindung, Rotation und separate Rows bestanden. |
| 17.7-T3 | Keine CSS-Grid-, `gap`-, Translate- oder Geräte-Margin-Lösung | PASS | statischer Part-06-Scan | Kein entsprechender Treffer im Wall-Frontend/Controlpfad. Active-`scale()` ist nur Touchfeedback. |
| 17.7-T4 | Light/Climate Controls funktional | PASS | Gateway-, Sprint-26.2- und App-Interaktionstests | Enge Light-/Climate-Routen, mehrere Entity-IDs, Busy, unavailable und Fehlerpfade bestanden. |
| 17.7-T5 | Summary/Errors und Sprint-21.3-Funktionen unverändert | PASS | System-Frontend-/Gatewaytests; Gesamtsuite 329/329 | Exakte Filter, Device Groups, Spalten und Critical-Modi blieben grün; Part 06 änderte keine Fachlogik. |
| 17.7-SEC1 | HA-/Supervisor-Token backend-only und keine neue Write-API | PASS | Public-Scan; API-/Securitytests | Kein Token, generischer Serviceproxy oder Browser-HA-WebSocket im Frontend. |
| 17.7-SEC2 | Light/Climate-Autorisierung und unavailable-Schutz unverändert | PASS – superseded by Sprint 26.2 | `control-authorization.js`, `climate-power.js`; Sprint-26.2-/Gatewaytests | Aktuelle explizite Control-Grants ersetzen alte feste Test-ID-Allowlists sicher; UI-Alignment erzeugt keine Berechtigung. |
| 17.7-LEG1 | ES5/Safari-iOS-9-JavaScript | PASS | 21 Syntaxchecks und Forbidden-Syntax-Scan | Keine moderne Wall-Frontend-Syntax oder moderne Modulabhängigkeit. |
| 17.7-LEG2 | Kein CSS Grid, Flexbox-gap, ResizeObserver oder Container Query | PASS | statischer Scan `src/public` | Legacy-Controlpfad bleibt Flex-/Block-basiert. |
| 17.7-MAN1 | iPad mini 1/iOS 9.3.5 wichtigste Abnahme | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-21 | Ohne physische Hardware kein `PASS`. |
| 17.7-MAN2 | iPad Air 2/iPadOS 15.8.5 Abnahme | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-22 | Keine physische Geräteprüfung in diesem Part. |
| 17.7-MAN3 | macOS Safari Nichtregression | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-23 | Chromium-Viewporttest ist nur ergänzende Evidenz. |
| 17.7-SHOT1 | Reale Screenshots prüfen | PASS | `main-light.png`, `main-dark.png`, `focus-card.png` | Grid-Power und Focus ±/Power sind sichtbar und repräsentieren den aktuellen Stand; keine neue sichtbare Änderung im Audit. |
| 17.7-DOC1 | README DE/EN, Projektstatus und Roadmap synchron dokumentieren | PASS | README DE/EN; Projektstatus 8e; Roadmap 17.7 | Root Cause und Hierarchie sind dokumentiert. |
| 17.7-N1 | Keine neuen Controls/Writes/Systemregeln oder Grid-/Focus-Neuentwicklung | PASS | aktueller Diff und Routen | Part 06 ist ein Baseline-Audit ohne Anwendungscodeänderung. |

## Exact Root Cause

Das SVG allein war nach Sprint 17.6 bereits stabil. Die verbleibende reale
iPad-Regression saß eine Ebene höher: native `<button>`-Elemente waren selbst
Flex-Layout-Parents. Mobile Safari behandelte deren anonyme innere Inhaltsbox
anders als Desktop Safari, weshalb ein mathematisch zentriertes SVG sichtbar
links blieb. Zusätzlich verschob ein Compact-Selector den Light-Control mit
`align-self:flex-end`; Focus Minus/Plus besaßen keine separate vollbreite Row.

Der aktuelle Endzustand vermeidet diese drei Ursachen strukturell. Native
Buttons sind `inline-block`; ein neutrales Kind übernimmt die präfixierte
Flexzentrierung. Volle Rows zentrieren Inline-Block-Groups per
`text-align:center`, und Focus ± sowie Power besitzen getrennte Rows.

## Automated and Controlled Browser Evidence

- Part-06-Fokuslauf: 99/99 Tests bestanden.
- Vollständige Regression: 329/329 Tests bestanden.
- Syntax-/Legacy-/Security-Scans: vollständig grün.
- Kontrollierter Runtime-Lauf mit lokalem Fake-HA:
  - Light Grid 768×1024: Row, Group, Button, Content, Icon und SVG horizontal
    auf X=572 px; Button 48×48 px;
  - Climate Grid Compact: Button, Content, Icon und SVG auf X/Y=340/394 px,
    Button 46×46 px;
  - Climate Focus Portrait: Row/Group X=384 px; ± 56×56 px, SVG 26×26 px;
    Power Row/Group/Button/Content X=384 px und 54 px hoch;
  - Light Focus Portrait: Row/Group/Button/Content X=384 px;
  - Climate Focus Landscape: Gruppen intern zentriert, kein Overflow;
  - Browserkonsole ohne Warnung/Fehler.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Kein neuer Reparaturauftrag.
- Drei reale Safari-Matrizen bleiben als MT-21 bis MT-23 `NOT TESTED`.
- RQ-04-01 ist seit Sprint 27.1-B code-seitig geschlossen.

## Final Assessment

Sprint 17.7 ist strukturell und automatisiert vollständig vorhanden. Die
fehlenden physischen Safari-Abnahmen verhindern allein den Gesamtstatus
`PASS`; der Sprint-27-Baselinestatus bleibt `PARTIAL`.

## Sprint-27.1-B-Re-Audit

Die unveränderte gemeinsame Control-Hierarchie wird über Dashboard/System/Admin
konsistent als v52 referenziert. Gleichheitstest und Gesamtsuite 331/331 sind
grün; RQ-04-01 ist code-seitig geschlossen, iPad bleibt `NOT TESTED`.
