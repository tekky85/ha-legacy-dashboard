# Sprint-25.6-Audit – Card Size Matrix & Responsive Layout Hardening

## Auditrahmen

- Audit-Part: 18
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.6.md`](../../sprints/SPRINT-25.6.md)
- Anwendungscode geändert: nein
- Physisches iPad oder produktive Runtime geprüft: nein

## Gesamtergebnis

**Sprint 25.6: PARTIAL**

Für die damaligen vier Renderer `sensor`, `binary`, `light` und `climate` ist
die Größen-/State-Matrix umfangreich und die zentrale Trennung von
Gridgeometrie und Präsentation weiterhin vorhanden. 1.128 Kombinationen aus
gültigen Portrait-/Landscape-Größen und repräsentativen Zuständen werden vom
Browser-Harness aufgebaut; die fünf Tiers `compact`, `standard`, `wide`,
`tall`, `large` werden erreicht. Climate Large besitzt eine gezielte
Darstellung für Identität, Ist-/Sollwert, HVAC, sekundäre Information und
Controls statt einer gestreckten Kleinkarte.

Spätere Sprints haben die aktuelle Rendereroberfläche jedoch bewusst
erweitert und gehärtet. Sprint 26.1 ergänzte den Typ `room`, Sprint 26.2 machte
Power-Controls capabilityabhängig. `docs/CARD_MATRIX.md` und der zentrale
Harness wurden daran nicht vollständig angepasst: Room fehlt im dokumentierten
Inventar und in der vollständigen Typ×Größe×State-Matrix; dessen Tall- und
Gesamtgrößenabdeckung ist nur teilweise in separaten Room-Tests vorhanden.
Außerdem meldet der reale Browser-Harness 120 falsche `missing-control`-Fehler,
weil er für Climate pauschal drei Controls erwartet, obwohl `unknown` und
`unavailable` nach Sprint 26.2 korrekt keinen unbestätigten Power-Button
erhalten. Das ist `RQ-18-01`.

Die Layoutmessung selbst fand in allen 1.128 Fällen keinen Overflow-,
Clipping-, Tier- oder Touchzielbefund. Die reale iPad-mini-Abnahme bleibt
`NOT TESTED`; sie wird in MT-63 vollständig beschrieben.

## Aktuelles Card Inventory

| Typ | Eigener Grid-Renderer | Aktuelle Rolle |
|---|---:|---|
| `sensor` | ja | read-only Sensorwert |
| `binary` | ja | read-only Binary-Sensor/Kontakt |
| `light` | ja | explizit autorisierbarer Power-Control |
| `climate` | ja | explizite Target-/Power-Controls nach Capabilities |
| `room` | ja | native aggregierte Room Card seit Sprint 26.1 |

`switch`, `cover`, `fan`, `lock`, `media_player` und `vacuum` besitzen keinen
eigenen Dashboard-Kartenrenderer. Einige davon können innerhalb der Room Card
read-only erscheinen. Sie werden deshalb nicht künstlich als eigenständige
Sprint-25.6-Kartentypen gezählt.

## Aktuelle gültige Größenmatrix

`src/services/layout.js` definiert 6 Portrait- und 12 Landscape-Spalten sowie
Höhen 1 bis 4. Mindestbreiten:

- Sensor, Binary, Light und Room: Portrait 2, Landscape 2;
- Climate: Portrait 2, Landscape 3.

Damit ergeben sich für Sensor/Binary/Light/Room je 64, für Climate 60 und
insgesamt 316 aktuelle Typ×Größe-Kombinationen. Die ursprüngliche Sprint-
25.6-Matrix ohne den späteren Room-Typ umfasste 252 Kombinationen; mit vier
repräsentativen Sensor/Binary/Light- und sechs Climate-Zuständen entstehen
1.128 Harnessfälle.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.6-SCOPE-01 | Visuelle RC-Härtung, keine neue HA-Funktion | PASS | Präsentations-/Testarchitektur ohne neue Route oder Write-Domain. |
| 25.6-INV-01 | Alle aktuell unterstützten Renderer inventarisieren | PARTIAL | Tests kennen Room zusätzlich, `docs/CARD_MATRIX.md` und Hauptfixture nennen nur vier Typen. `RQ-18-01`. |
| 25.6-INV-02 | Nicht existierende Typen nicht erfinden | PASS | Dokument grenzt switch/cover/fan/lock/media/vacuum korrekt als nicht eigenständig unterstützt ab. |
| 25.6-SIZE-01 | Jede serverseitig gültige Größe ableiten | PASS | `CardMatrixFixtures.sizes()` folgt Profilspalten, Höhen 1–4 und typspezifischen Mindestbreiten; Room-Größen werden separat serverseitig validiert. |
| 25.6-SIZE-02 | Vollständige aktuelle Type×Size×State-Matrix | PARTIAL | Ursprüngliche vier Typen vollständig; Room nicht im Haupt-Harness und nicht vollständig über alle Tiers/Zustände vermessen. `RQ-18-01`. |
| 25.6-ARCH-01 | Grid geometry != Widget presentation | PASS | `src/public/js/core/layout.js` setzt Position; `presentation.js` berechnet Tier separat aus Typ, Grid- und Pixelmaßen sowie Hints. |
| 25.6-ARCH-02 | Typ, Breite, Höhe und reale Pixel berücksichtigen | PASS | `LegacyPresentation.getMode(widget,w,h,pixelWidth,pixelHeight,hints)`. |
| 25.6-ARCH-03 | Capabilities und verfügbarer Inhalt berücksichtigen | PASS | `getHints()`/Widgetdaten sowie capabilityabhängige Light-/Climate-/Room-Renderer. |
| 25.6-TIER-01 | `compact` | PASS | Zentraler Modus und typbezogene CSS-Darstellung; im Browserlauf erreicht. |
| 25.6-TIER-02 | `standard` | PASS | Zentraler Modus und typbezogene CSS-Darstellung; im Browserlauf erreicht. |
| 25.6-TIER-03 | `wide` | PASS | Zentraler Modus und typbezogene CSS-Darstellung; im Browserlauf erreicht. |
| 25.6-TIER-04 | `tall` | PARTIAL | Originaltypen abgedeckt; Room nutzt nur generischen Tall-Fallback und ist nicht im Room-Harness als eigener repräsentativer Modus enthalten. `RQ-18-01`. |
| 25.6-TIER-05 | `large` | PASS | Originaltypen und Room besitzen bewusste Large-Darstellung. |
| 25.6-CLIMATE-01 | Identity, aktuelle und Zieltemperatur | PASS | `src/public/js/widgets/climate.js`; Matrixzustände Heating/Cooling/Negative/Off/Unknown/Unavailable. |
| 25.6-CLIMATE-02 | HVAC/action und sekundäre Information | PASS | Stateinfo/Subtitle werden in nicht-kompakten Tiers angezeigt; CSS/Harnessfixture. |
| 25.6-CLIMATE-03 | Minus, Plus und Power logisch gruppiert | PASS | Gemeinsame Controls und Sprint-17.7-Hierarchie; Fokus-/Gridtests grün. |
| 25.6-CLIMATE-04 | Power nur bei realer Capability | PASS – superseded by Sprint 26.2 | `gateway_capabilities.supports_power`; unknown/unavailable ohne Capability erhalten korrekt keinen Fake-Power-Button. |
| 25.6-CLIMATE-05 | Large Climate bewusst groß gestalten | PASS | `.card-climate.card-presentation-large` mit zentralem Current-Bereich, eigener Target-Zeile und 52-px-Controls. |
| 25.6-CLIMATE-06 | Keine Überlappung/abgeschnittene Werte lokal | PASS | Browser-Harness meldete keine `overflow`-/`clipped-content`-Fehler. |
| 25.6-CLIMATE-07 | Touchziele mindestens ca. 44×44 lokal | PASS | Harness misst sichtbare Controls; keine `touch-target`-Fehler. Physisch: MT-63. |
| 25.6-LIGHT-01 | On/Off/Unavailable und Power-Kombinationen | PASS | Fixture plus zentraler Light-Renderer; unavailable sicher disabled. |
| 25.6-SENSOR-01 | Kurze/lange/negative/dezimale/unknown/unavailable Werte | PASS | Vier repräsentative Sensorzustände über alle gültigen Größen. |
| 25.6-BINARY-01 | On/Off/unknown/unavailable | PASS | Binaryfixture und Renderer über alle gültigen Größen. |
| 25.6-OTHER-01 | Nur wirklich vorhandene weitere Renderer prüfen | PARTIAL | Room ist vorhanden, aber zentrale Matrix/Dokumentation driftet. `RQ-18-01`. |
| 25.6-HARNESS-01 | Test-only Card Matrix Harness vorhanden | PASS | `test/card-matrix-harness.html`, `test/fixtures/card-matrix*.js`. |
| 25.6-HARNESS-02 | Echte Renderer statt Mockmarkup | PASS | Harness lädt und instanziiert produktive Widgetkonstruktoren. |
| 25.6-HARNESS-03 | Overflow und Clipping automatisch prüfen | PASS | `scrollWidth/Height`, Bounds und semantische Elemente. |
| 25.6-HARNESS-04 | Duplicate/Missing Controls prüfen | BROKEN | Pauschal `climate ? 3` ist nach Sprint 26.2 falsch; 120 False Positives für unknown/unavailable. `RQ-18-01`. |
| 25.6-HARNESS-05 | Ungültige Tierklassen prüfen | PASS | Exakt eine Klasse aus fünf Tiers wird verlangt. |
| 25.6-HARNESS-06 | Harness selbst als ausführbares Gate grün | BROKEN | Kontrollierter Chromium-Lauf: `data-matrix-status=failed`, 120/1.128 False Positives. `RQ-18-01`. |
| 25.6-TEXT-01 | Lange Namen/Werte/Units sicher kürzen/umbrachen | PASS | Fixture, `min-width:0`, Overflow-/Ellipsis-Regeln und Browsermessung. Physische Lesbarkeit: MT-63. |
| 25.6-BG-01 | Background/Title/Footer/Focus nicht regressieren | PASS | Sprint-25.3-/Focus-/Layouttests im 89/89-Fokuslauf grün. Physisch: MT-63. |
| 25.6-THEME-01 | Dark/Light und HomeScreen unverändert | PASS | Theme-/Navigationstests grün; physisch NOT TESTED über MT-63. |
| 25.6-LEGACY-01 | ES5 und Safari iOS 9 | PASS | Wall-/Harnessdateien `node --check`; kein fetch/Promise/arrow/let/const/async/optional chaining. |
| 25.6-CSS-01 | Kein CSS Grid/Flex-gap im Wall-Display | PASS | Statischer Scan; Admin-CSS darf modern sein und ist nicht Wall-Laufzeit. |
| 25.6-SEC-01 | Security und explizite Writepfade unverändert | PASS | Keine neue Route; Grid/Focus/Room konsumieren zentrale Gateway-Capabilities. |
| 25.6-IPAD-01 | Reales iPad mini Portrait | NOT TESTED | MT-63. |
| 25.6-IPAD-02 | Reales iPad mini Landscape/Rotation | NOT TESTED | MT-63. |
| 25.6-IPAD-03 | Reale Controlausrichtung/Touch/Focus | NOT TESTED | MT-63. |
| 25.6-DOC-01 | Card Matrix dokumentiert aktuellen Stand | BROKEN | `docs/CARD_MATRIX.md` ist für Sprint 25.6 korrekt historisch, aber als aktuelles Inventar nach Sprint 26.1 unvollständig. `RQ-18-01`. |
| 25.6-DOC-02 | `PROJECT_STATUS.md` aktualisiert | PASS | Sprint-25.6-Abschnitt vorhanden; globaler Statusdrift bleibt separat `RQ-08-03`. |
| 25.6-DOD-01 | Sprint vollständig releasefähig | PARTIAL | Produktdarstellung der Originaltypen stark belegt; aktuelle Matrix/Harness `RQ-18-01` driftet und physisches iPad MT-63 fehlt. |

## Kontrollierter Browserlauf

Der reale Harness wurde lokal in Chromium aus den Repositorydateien geladen:

- 1.128 Fälle gerendert;
- alle fünf Presentation Tiers erreicht;
- keine Overflow-, Clipping-, Duplicate-Control-, Invalid-Tier- oder
  Touch-Target-Meldung;
- 120 `missing-control`-Meldungen, ausschließlich Climate `unknown` und
  `unavailable` in allen gültigen Größen;
- Ursache: Harness erwartet drei Controls unabhängig von
  `gateway_capabilities`; der aktuelle Renderer zeigt bei fehlender Power-
  Capability absichtlich nur die beiden sicher deaktivierten Step-Buttons.

Damit ist die Produktlogik aus Sprint 26.2 korrekt, der Harness als Gate aber
veraltet.

## Testevidenz

- Part-18-Fokuslauf: 89/89 Tests bestanden.
- `test/sprint-25-6.test.js`: sieben breite Tests grün; sie prüfen den
  Harnessquelltext, führen dessen Browseranalyse aber nicht als Node-Test aus.
- Browser-Harness: 1.128 Fälle, 120 capabilitybedingte False Positives.
- Syntax-/Legacy-Scan: grün.
- Vollständige Suite: wegen lokaler Timer-/Zeitsprungstörung in zeitbasierten
  Gatewaytests technisch nicht als neuer PASS verwertbar; kein Sprint-25.6-
  Fachtest schlug fehl.

## Reparatur- und Manuelltestbezug

- `RQ-18-01`: aktuelles Card Inventory, Room-Gesamtmatrix und
  capabilityabhängige Harness-Erwartungen synchronisieren.
- MT-63: vollständige physische iPad-mini-Session für Portrait/Landscape,
  Rotation, alle aktuellen Typen/Tiers, lange Inhalte, Controls, Focus,
  Background, Theme und HomeScreen.

## Sprint-27.1-B-Re-Audit

Card-Presentation, Icons und Styles werden in Dashboard/System/Admin gemeinsam
als v52 referenziert. `test/asset-version.test.js`, Matrix-Regressionen und die
Gesamtsuite 331/331 sind grün. RQ-18-01 und reale iPad-Matrix bleiben offen.
