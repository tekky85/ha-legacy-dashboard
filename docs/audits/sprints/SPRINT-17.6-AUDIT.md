# Sprint 17.6 Audit

## Audit Metadata

- Sprint: 17.6
- Sprint title: Power Control Alignment & Icon Stabilization
- Audit date: 2. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-17.6.md`](../../sprints/SPRINT-17.6.md)
- Working tree at Part-06 start: Anwendungscode und bestehende Audit-Historie
  sauber; ausschließlich der vom Benutzer bereitgestellte Part-06-Prompt
  `docs/sprints/SPRINT-27-AUDIT-PART-06.md` war unversioniert.

## Overall Result

PARTIAL

Die aktuelle Implementierung erfüllt die automatisiert und lokal prüfbaren
Anforderungen: Grid und Focus verwenden genau einen echten Power-Button mit
festem Inline-SVG; Zustände verändern keine Control-Geometrie; Focus bleibt
von Grid-Geometrie getrennt. Ein kontrollierter Lauf der echten Anwendung mit
lokalem Fake-HA bestätigte die Mittelpunkte von Button, Content und SVG sowie
Touchgrößen und fehlenden Overflow. Die von der Spezifikation verlangten
physischen Abnahmen auf macOS Safari, iPad Air 2 und iPad mini/iOS 9 wurden in
Audit Part 06 ausdrücklich nicht durchgeführt. Daher ist ein Gesamt-`PASS`
noch nicht zulässig.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 17.6-RC1 | Tatsächliche Ursache vor der Korrektur identifizieren und dokumentieren | PASS | Historischer Commit `6bf61da`; `docs/PROJECT_STATUS.md`, Abschnitt 8d | Grid und Focus besaßen getrennte Power-Renderer; Pfadgeometrie, Inline-SVG-Baseline, `line-height`, Padding und Höhen unterschieden sich. Unicode war im damaligen Grid bereits nicht mehr der Hauptpfad. |
| 17.6-A1 | Eine gemeinsame Power-Control-Basis für Light und Climate | PASS | `src/public/js/controls/power.js`: `LegacyControls.powerButton()` | Grid-Light, Grid-Climate, Light Focus und Climate Focus rufen denselben Renderer auf. |
| 17.6-A2 | Gemeinsame Zustände on/off/busy/disabled/unavailable/error ohne Geometriewechsel | PASS | `powerButton()`; `test/sprint-17-6.test.js`: „Power Control bildet alle gemeinsamen Zustände …“ | Zustände ergänzen ausschließlich Klassen, ARIA und `disabled`; Maße stammen aus unveränderten CSS-Selektoren. |
| 17.6-A3 | Power als echtes `button`-Element | PASS | `powerButton()` erzeugt `<button type="button">`; Sprint-17.6-Test | Kein `div`-/`span`-Click-Ersatz. |
| 17.6-B1 | Dediziertes Inline-SVG mit stabiler `viewBox` | PASS | `powerIcon()`: 24×24, `viewBox="0 0 24 24"`, zwei Pfade | Kein externes Asset und keine Fontabhängigkeit. |
| 17.6-B2 | SVG blockförmig, feste Maße und zuverlässiger Button-Click | PASS | `.dashboard-control-power-icon`, `.dashboard-control-power-icon svg` | Beide sind 24×24, `display:block`, `line-height:0` beziehungsweise `pointer-events:none`. |
| 17.6-B3 | Unicode-Powerglyph nicht als Hauptpfad | PASS | `power.js`; statischer Scan; Sprint-17.6-Test | Im produktiven Renderer existiert kein `⏻`. |
| 17.6-B4 | Optische SVG-Geometrie nicht über zufälliges Button-Padding korrigieren | PASS | Historischer Diff `6bf61da`; aktueller Pfad `M12 3v10` / `M6.3 6.7…`; CSS ohne Alignment-Translate | Die Pfadgeometrie selbst wurde korrigiert; Button-Padding bleibt symmetrisch. |
| 17.6-C1 | Inhalt horizontal und vertikal robust zentrieren | PASS – superseded by Sprint 17.7 | `LegacyControls.controlContent()`; `.dashboard-control-content` | Sprint 17.7 ersetzte Flex direkt auf dem nativen Button durch ein separates präfixiertes Content-Element. Der beabsichtigte Endzustand bleibt erfüllt. |
| 17.6-C2 | `line-height`, Padding, Größe, `box-sizing`, Border und Appearance kontrollieren | PASS | `.dashboard-control`, `.dashboard-control-power`, `.dashboard-control-content` | `line-height:1`, symmetrisches Padding, `border-box`, feste Mindestmaße und gezieltes `-webkit-appearance:none`; Borderbreite bleibt zustandsunabhängig. |
| 17.6-C3 | Touchziele mindestens ungefähr 44×44 px | PASS | Compact Light 48×48, Climate 46×46, Focus mindestens 54 px; Browsermessung | Kontrollierter Lauf maß 48×48 im Grid, 46×46 Climate Compact, 56×56 Steps und 54 px Focus-Power. |
| 17.6-D1 | Light Compact Power korrekt | PASS – superseded by Sprint 25.6 | `light.js`; Compact-Tier-CSS; Card-Matrix-Tests | Sprint 25.6 bestimmt die Sichtbarkeit/Anordnung je Pixelgröße. Das sichtbare Control nutzt weiterhin die gemeinsame 48×48-Komponente; Browsermittelpunkte stimmten exakt überein. |
| 17.6-D2 | Light Normal/weitere sichtbare Größen korrekt | PASS – superseded by Sprint 25.6 | `.light-control-row`, `.light-control-group`, Presentation-Tier-CSS; `test/sprint-25-6.test.js` | Fünf heutige Tiers ersetzen Compact/Normal/Expanded. Jede sichtbare Power-Instanz stammt aus demselben Renderer. |
| 17.6-D3 | Light Focus verwendet dieselbe Komponente | PASS | `renderLightFocus()` → `LegacyControls.controlRow(powerButton(...))`; Browsermessung | Row/Group/Button/Content waren horizontal auf Mittelpunkt 384 px ausgerichtet. |
| 17.6-E1 | Climate Compact Power korrekt, falls sichtbar | PASS – superseded by Sprint 25.6 | `climate.js`; Compact-Tier-CSS; kontrollierter Browserlauf | Im aktuellen Compact-Tier bleiben Minus/Plus/Ziel verborgen; Power liegt bewusst in der rechten kompakten Zone, ist intern exakt 46×46 zentriert. |
| 17.6-E2 | Climate Normal/weitere sichtbare Größen und gemeinsame Baseline | PASS – superseded by Sprint 25.6/26.2 | `climate-target-group`; Standard-/Large-Tier-CSS; Card-Matrix und Sprint-26.2-Tests | Sprint 25.6 entscheidet Präsentation; Sprint 26.2 entscheidet Power-Capability. Sichtbare ±/Power-Controls nutzen dieselbe 44/46/52-px-Geometriesprache. |
| 17.6-E3 | Climate Focus: ± und Power konsistent | PASS | `renderClimateFocus()`; Focus-CSS; kontrollierter 768×1024-Lauf | Minus/Plus 56×56, SVG 26×26; Power 54 px. Alle jeweiligen Innenmittelpunkte waren identisch. |
| 17.6-E4 | Icon-only und Icon-plus-Label aus derselben Komponente | PASS | `powerButton()` und kontextabhängige `.dashboard-control-power-label`-Sichtbarkeit | Climate Grid ist icon-only; Light/Focus kann Icon plus Label zeigen, ohne zweiten Renderer. |
| 17.6-E5 | Langes Label zerstört den Button nicht | PASS | `.dashboard-control-power-label`: `min-width:0`, Ellipsis, `white-space:nowrap`; Focus-Browserlauf | Der aktuelle Focus-Text „Thermostat ausschalten“ blieb vollständig innerhalb des Controls. |
| 17.6-F1 | Mobile-Safari-relevante Button-/SVG-Eigenschaften auditieren | PASS | Historische Diffs `6bf61da`, `ed2878a`; aktuelle gemeinsame CSS-Basis | Appearance, Font, Line-Height, Padding, Baseline, Flex, Box-Sizing, Border und Maße sind gezielt neutralisiert. |
| 17.6-G1 | Power, Minus und Plus verwenden eine konsistente geometrische Sprache | PASS – superseded by Sprint 17.7/25.6 | `.dashboard-control`, `.dashboard-control-step`, `.dashboard-control-power`; Focus-/Tier-CSS | Gemeinsame Basisklasse und separates Content-Element bleiben erhalten; konkrete Größe folgt Kontext/Tier. |
| 17.6-G2 | Keine Transform-/Absolute-/Geräte-Margin-Hacks als Alignment-Lösung | PASS | statischer Part-06-Scan der Control-Dateien/CSS | Kein `translateX/Y`, keine absolute Iconpositionierung und keine gerätespezifische 37-px-Margin. `scale()` existiert nur als temporäres Active-Feedback, nicht zur Ausrichtung. |
| 17.6-H1 | Sprint-17.5-Focus/Grid-Trennung bewahren | PASS | `focus/renderer.js`, `focus/focus.js`; Sprint-17.5/17.6-Tests | Focus übernimmt weder Grid-DOM noch `x/y/w/h`, Size- oder Presentation-Klassen; nur die Control-Komponente wird geteilt. |
| 17.6-T1 | Power-Komponente, Zustände und Geometrie automatisiert testen | PASS | `test/sprint-17-6.test.js` | Alle fünf Sprint-17.6-Tests bestanden. |
| 17.6-T2 | Light/Climate Grid und Focus sowie Themes/States regressionsprüfen | PASS | Part-06-Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierter Browserlauf | On/Off, Capabilities, Busy/Disabled/Unavailable, Focus und Card Matrix sind abgedeckt; Dark/Light-Regeln blieben grün. |
| 17.6-T3 | Summary, Errors, Filter, Spalten und Risk unverändert | PASS | `test/system-frontend.test.js`, `test/gateway.test.js`; Gesamtsuite | System-Frontend-Fälle einschließlich exakter Filter und 1/2/3 Spalten bestanden; Part 06 änderte keinen Anwendungscode. |
| 17.6-SEC1 | Tokens backend-only, keine Browser-HA-Verbindung oder neue Write-API | PASS | Public-Secret-/WS-Scan; `src/routes/api.js`; Security-/Gatewaytests | Kein Token im Public-Frontend, kein Browser-HA-WebSocket und kein generischer Serviceproxy. |
| 17.6-SEC2 | Schreibberechtigung bleibt serverseitig und UI erzeugt keine Capability | PASS – superseded by Sprint 26.2 | `src/services/control-authorization.js`, `climate-power.js`; Sprint-26.2-/Gatewaytests | Die früheren festen Allowlisten wurden bewusst durch persistierte explizite Control-Grants plus Domain-/Entity-/Payloadvalidierung ersetzt; Sichtbarkeit erteilt weiterhin nichts. |
| 17.6-SEC3 | unavailable/stale sendet keine Write-Aktion | PASS | View Model, Widget-Capabilities, `disableDashboardControls()`; Tests 17.5/26.2 | Buttons werden deaktiviert, bevor der delegierte Handler einen Request auslösen kann. |
| 17.6-LEG1 | ES5/Safari-iOS-9-JavaScript | PASS | 21× `node --check`; statischer Forbidden-Syntax-Scan | Kein `let/const`, Arrow, Fetch, Promise, Async/Await, Optional Chaining oder Nullish Coalescing im Wall-Frontend. |
| 17.6-LEG2 | Kein CSS Grid, Flexbox-gap, ResizeObserver oder Container Query | PASS | statischer Scan `src/public` | Die Control-Hierarchie nutzt Block/Inline-Block und präfixiertes Flex ausschließlich im inneren Content. |
| 17.6-MAN1 | macOS Safari manuell prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-23 | Kontrolliertes Chromium ersetzt Safari nicht. |
| 17.6-MAN2 | iPad Air 2/iPadOS 15.8.5 manuell prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-22 | Keine physische Geräteprüfung in Part 06. |
| 17.6-MAN3 | iPad mini/iOS 9.3.5 in Portrait/Landscape manuell prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-21 | Wichtigstes Legacy-Zielgerät bleibt offen. |
| 17.6-SHOT1 | Reale Screenshots auf Repräsentativität prüfen | PASS | `main-light.png`, `main-dark.png`, `focus-card.png` visuell geprüft | Grid- und Focus-Power sind sichtbar und entsprechen dem aktuellen gemeinsamen SVG-Control; kein neuer Screenshot erforderlich. |
| 17.6-DOC1 | README DE/EN, Projektstatus und Roadmap dokumentieren | PASS | `README.de.md`, `README.en.md`, `docs/PROJECT_STATUS.md`, `docs/SPRINT_ROADMAP.md` | Beide README-Sprachen erklären semantisch synchron SVG und vollständige Control-Hierarchie. |
| 17.6-N1 | Keine neuen Writes, Dashboardtypen, Systemregeln oder Grid-/Focus-Neuentwicklung | PASS | aktueller Part-06-Diff; Routes/Tests | Dieser Auditpart verändert ausschließlich Auditdokumentation. |

## Root Cause and Current End State

Die erste Fehlausrichtung entstand aus zwei getrennten Power-Pfaden. Grid und
Focus verwendeten verschiedene SVGs, Buttonmaße und Baseline-Regeln. Das Grid-
SVG saß innerhalb seiner `viewBox` optisch zu hoch; das Focus-SVG war zusätzlich
inline und damit baselineabhängig. Sprint 17.6 vereinheitlichte Renderer und
Pfad. Sprint 17.7 supersedierte anschließend Flex direkt auf nativen Buttons
durch `Row → Group → Button → Content → Icon/Label`, ohne die Sprint-17.5-
Trennung von Grid- und Focus-Geometrie aufzuheben.

## Automated and Controlled Browser Evidence

- Part-06-Fokuslauf: 99/99 Tests bestanden. Ein erster Sandboxlauf hatte
  ausschließlich beim localhost-Mock `listen EPERM`; der identische erlaubte
  Lauf war vollständig grün.
- Vollständige Regression: 329/329 Tests bestanden.
- Alle 21 Legacy-JavaScriptdateien bestanden `node --check`.
- Statische Legacy-/Security-Scans waren ohne Treffer.
- Kontrollierte echte Anwendung mit Fake-HA:
  - 768×1024: Light-Grid Row/Group/Button/Content/SVG horizontal zentriert;
    Climate-Grid Button/Content/SVG intern zentriert;
  - Climate Focus: beide 56×56-Step-Buttons und 26×26-SVGs intern zentriert,
    Step- und Power-Row auf dem Widgetmittelpunkt, kein Overflow;
  - Light Focus: Row, Group, Button und Content auf demselben horizontalen
    Mittelpunkt;
  - 1024×768: interne Zentrierung der Landscape-Gruppen und kein Overflow;
  - keine Console-Warnung und kein Console-Fehler.
- Ausschließlich localhost und Fake-Credentials; kein reales Home Assistant,
  kein produktiver LXC und keine `.env` wurden verwendet.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- Kein neuer umsetzbarer Reparaturpunkt.
- `NOT TESTED`: MT-21 bis MT-23 für die drei geforderten Safari-Geräte.
- RQ-04-01 aus Part 04 bleibt separat offen und betrifft Cache-Buster, nicht
  die Power-Control-Implementierung.

## Final Assessment

Sprint 17.6 ist im aktuellen Code implementiert und automatisiert grün. Wegen
der ausdrücklich geforderten, noch nicht durchgeführten realen Safari-
Abnahmen bleibt der Sprint-27-Baselinestatus `PARTIAL`.
