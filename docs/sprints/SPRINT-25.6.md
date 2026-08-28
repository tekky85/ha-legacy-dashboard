# Sprint 25.6 – Card Size Matrix & Responsive Layout Hardening

## Status
Planned

## Charakter
RC visual-correctness sprint.

## Bestätigtes Problem
Auf dem realen iPad mini zeigen einzelne Entity Cards bei größeren Grid-Größen eine fehlerhafte Anordnung. Besonders sichtbar: große Climate-/Thermostat-Card.

## Ziel
Jeder tatsächlich unterstützte Card-/Widget-Typ wird in jeder zulässigen Card-Größe systematisch geprüft und erhält eine definierte responsive Presentation.

## A – Supported Card Inventory
Aus dem realen Repo alle Renderer ermitteln.

Mindestens bekannte Typen:
```text
sensor
binary sensor
light
switch
climate
```

Zusätzlich alle tatsächlich vorhandenen Renderer wie cover/fan/lock/media/vacuum, falls unterstützt.

## B – Size Matrix
Für jeden Widget-Typ alle im Editor tatsächlich zulässigen `w × h` Kombinationen testen. Reale Grid-Spaltenzahl und Min-/Max-Größen aus dem Repo ableiten.

## C – Geometry vs Presentation
Beibehalten:

```text
Grid geometry != Widget presentation
```

Presentation berücksichtigt:
- Widget type
- Grid width/height
- reale Pixelbreite/-höhe
- Capabilities

## D – Presentation Tiers
Pro Widget robuste Stufen definieren:
```text
compact
standard
wide
tall
large
```

## E – Climate/Thermostat Pflichtmatrix
Prüfen:
- Identity
- current temperature
- target temperature
- HVAC/action status
- minus
- plus
- power
- secondary info

Regeln:
- klare Hierarchie
- logisch gruppierte Controls
- +/- bleiben sauber ausgerichtet
- Power korrekt zentriert
- keine Überlappungen
- keine abgeschnittenen Temperaturen
- Touch Targets >= ca. 44x44
- Sprint 17.7 Alignment erhalten

Große Climate Card erhält echte Large-Presentation statt nur einer kleinen Card in großer Box.

## F – Light
on/off/unavailable, lange Namen, brightness falls vorhanden, Power.

## G – Sensors
kurzer/langer Wert, decimal, negative Zahl, Unit, lange Unit, lange Friendly Names, unknown/unavailable.

## H – Binary / Switch
unterschiedliche States und Controls.

## I – Other Renderers
Für jeden realen Renderer:
```text
state matrix
size matrix
long-name matrix
unavailable matrix
```

## J – Test Harness
Test-only Card-Matrix-Harness erzeugen, das alle Card-Typen und gültigen Größen mit Mock States rendert.

Automatisiert prüfen soweit möglich:
- overflow
- duplicate controls
- missing controls
- invalid presentation class
- syntax

Visual screenshots in modernem Browser, wenn bestehende Toolchain dies zulässt.

## K – Real iPad
Kritische Matrixfälle auf iPad mini in Portrait und Landscape prüfen.

## L – Text Overflow
Legacy-safe ellipsis/wrap; keine unkontrollierten Textblöcke in Controls.

## M – Background Regression
Sprint 25.3 Backgrounds und Lesbarkeit prüfen.

## Definition of Done
- vollständiges Card Inventory
- vollständige gültige Size Matrix
- definierte Presentation je Größenklasse
- Climate large sauber
- keine Überlappungen/Clipping
- Touch Targets nutzbar
- iPad mini Portrait/Landscape geprüft
- HomeScreen/Background/Theme geprüft
- Focus korrekt
- Security unverändert
- PROJECT_STATUS aktualisiert

## Codex-Prompt

```text
Implement Sprint 25.6 exactly as specified in docs/sprints/SPRINT-25.6.md.

Inspect the real repository first and enumerate every supported card renderer
and every valid grid size.

Build a complete Card Type x Valid Size test matrix.

The confirmed regression is a large Climate/Thermostat card whose contents are
poorly arranged.

Do not fix only that one screenshot. Define responsive presentation tiers for
every supported card type using actual card dimensions/capabilities.

Test long names, values, units, unavailable/unknown states and controls.

Preserve Sprint 17.x geometry/presentation separation and Sprint 17.7 legacy
Safari control alignment.

Create a test-only card matrix harness where practical.

Manually verify critical matrix cases on iPad mini in portrait and landscape.

Preserve Sprint 25.x backgrounds, theme persistence, HomeScreen navigation,
security boundaries and ES5/iOS 9 compatibility.

Do not commit or push until I review the result.
```
