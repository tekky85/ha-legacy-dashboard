# Sprint 17.3 – Live Card Preview, Unified Controls & Focus Mode

## Status
Planned

## Einordnung
Sprint 17.3 wird nach dem bereits vollständig implementierten, gepushten und produktiv ausgerollten Sprint 20 umgesetzt.

Reihenfolge:

```text
Sprint 20 – produktiv
Sprint 17.3 – Live Card Preview, Unified Controls & Focus Mode
Sprint 21 – Registry & Diagnostic Enrichment
```

Sprint 17.3 darf die fachliche Summary-/Error-Architektur aus Sprint 18–20 nicht verändern.

---

# Ziele

Sprint 17.3 löst vier UX-/Bedienprobleme:

1. Der Admin-Layouteditor soll nicht nur Größe und Position, sondern eine echte Card-Vorschau mit aktuellem Entity-Inhalt zeigen.
2. Der bisherige iOS-Switch-Stil für Light passt visuell und proportional nicht zum Dashboard.
3. Climate-Cards sollen neben +/- wieder sicher ein- und ausgeschaltet werden können.
4. Kleine Cards sollen sehr kompakt bleiben dürfen; vollständige Information und Bedienung wird über einen temporären Focus Card Mode verfügbar.

---

# Verbindliche Sicherheitsgrundsätze

- Home-Assistant-Token ausschließlich im Backend
- kein HA-Token im Browser
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Home-Assistant-Service-API
- keine frei eingebbaren Domains/Services
- bestehende Write-Allowlists bleiben Sicherheitsgrenze
- sichtbare, previewte oder fokussierte Entity erhält niemals automatisch Schreibrechte
- Admin Preview ist immer read-only
- Climate Power nur über engen dedizierten Backend-Endpunkt
- bestehende Rate Limits, Payload Limits, Security Header und Secret Redaction bleiben erhalten
- keine Secrets in Browser, Logs oder Repository

```text
Entity sichtbar != Entity steuerbar
Preview sichtbar != Schreibrecht
Focus sichtbar != Schreibrecht
```

---

# Legacy-Kompatibilität

Wall-Display weiterhin kompatibel mit:

```text
Apple iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
```

Im Legacy-Frontend nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- classes
- `fetch`
- `Promise`
- `async` / `await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries
- `<dialog>` als Voraussetzung
- Pointer Events als alleinige Bedienmöglichkeit

Admin-UI darf moderne Browsertechnologie verwenden.

---

# Teil A – Live Card Preview im Admin-Layouteditor

## Ziel

Der Layouteditor zeigt die reale Card mit aktuellem, saniertem Entity-Inhalt.

Beispiel Sensor:

```text
┌─────────────────────┐
│ 🌡                   │
│ 21,8 °C             │
│ Badezimmer          │
└─────────────────────┘
```

Beispiel Climate:

```text
┌──────────────────────────┐
│ 🔥 Esszimmer             │
│ 21,8° → 22,5°            │
│      [ − ] [ + ]         │
└──────────────────────────┘
```

## Datenfluss

```text
Admin Browser
      |
      | sichere Gateway/Admin API
      v
Gateway
      |
      v
Home Assistant
```

Keine direkte HA-Verbindung aus dem Admin-Browser.

## Datenquelle

Codex muss bestehende APIs nach Sprint 20 prüfen und bevorzugt wiederverwenden:

- Dashboard-State-API
- Admin-Entity-API
- bestehende sichere State-Services

Nur wenn nötig, enger read-only Preview-Endpunkt.

Bevorzugt Batch statt Einzelrequest pro Card.

## Preview-Inhalt

Mindestens:

- Widgettitel / Identity
- Icon
- aktueller Wert/Status
- Presentation Mode
- Card-Größe
- on/off-Zustände
- sichtbare Controls

## Preview Controls

Controls im Layouteditor:

- sichtbar
- proportional korrekt
- deaktiviert/read-only
- dürfen niemals HA-Schreibaktionen auslösen

## Preview Modes

Mindestens:

```text
Portrait
Landscape

Hell
Dunkel
```

Preview-Theme ändert nicht zwingend das Admin-Theme.

## Drag/Resize

Während Drag und Resize bleibt die echte Preview sichtbar und passt ihren Presentation Mode an.

---

# Renderer-Konsistenz

Admin Preview und Legacy Wall Display sollen möglichst dieselben Presentation-Regeln verwenden.

Bevorzugt gemeinsame oder extrahierte reine Presentation-Hilfsfunktionen statt zweier unabhängig gepflegter Card-Implementierungen.

Keine große Frontend-Neuschreibung.

---

# Teil B – Unified Dashboard Controls

## Ziel

Der nachgebildete iOS-Switch für Light wird durch ein dashboard-eigenes Control-System ersetzt.

Bevorzugte Controls:

```text
[ ⏻ ]        Power
[ − ] [ + ]  Stepper
```

Später können weitere Controls denselben Stil nutzen.

## Gemeinsame Designregeln

- gleiche visuelle Sprache
- gleiche Rahmen/Rundungen
- gleiche Typografie
- gleiche Active-/Disabled-/Busy-Zustände
- Light und Dark Mode
- Compact/Normal/Focus Varianten
- echte Button-Elemente
- ca. 44×44 px Touchziel, wo interaktiv

## Light Compact Beispiel

```text
┌───────────────┐
│ 💡 AN     [⏻] │
│ Esszimmer     │
└───────────────┘
```

## Light Normal Beispiel

```text
┌─────────────────────┐
│ 💡 Esszimmer        │
│        AN           │
│       [ ⏻ ]         │
└─────────────────────┘
```

Bestehende sichere Light-API bleibt bestehen; nur Darstellung/UX ändern.

---

# Teil C – Climate Power Control

## Ziel

Climate-Widgets erhalten eine sichere Ein-/Aus-Funktion zusätzlich zur Solltemperatursteuerung.

## API

Bevorzugt:

```text
POST /api/climate/power
```

Request:

```json
{
  "entity": "climate.esszimmer_thermostate",
  "state": "on"
}
```

oder:

```json
{
  "entity": "climate.esszimmer_thermostate",
  "state": "off"
}
```

Erlaubte States ausschließlich:

```text
on
off
```

Keine Browserparameter wie:

```text
domain
service
service_data
```

## Allowlist

Power nur für ausdrücklich freigegebene Climate-Entities.

Die vorhandene Climate-Schreibgrenze bleibt verbindlich.

Keine automatische Freigabe durch:

- Sichtbarkeit
- Preview
- Focus
- Summary
- Error Dashboard
- Entity Inventory

## Power-On-Modus

Climate-Entities können mehrere Nicht-Off-Modi besitzen.

Sichere Regel:

1. Wenn genau ein sinnvoller Nicht-Off-Modus existiert, darf dieser als Power-On-Ziel verwendet werden.
2. Bei mehreren möglichen Modi ist ein explizit konfigurierter bevorzugter Einschaltmodus erforderlich.
3. Ohne eindeutige sichere Zuordnung wird Power-On nicht angeboten.

Konzept:

```text
powerOnMode: "heat"
```

Keine blinde Annahme eines vorherigen Modus.

Wenn die tatsächliche HA-Integration eine sichere dedizierte On/Off-Capability bietet und diese serverseitig eindeutig erkannt wird, darf sie intern verwendet werden. Der Browser wählt niemals den HA-Service.

## Capability Read Model

Frontend erhält höchstens:

```json
{
  "can_power_on": true,
  "can_power_off": true
}
```

Keine Browser-Capability wird vertraut.

## Climate UI

Compact:

```text
┌─────────────────┐
│ 🔥 21,8°    [⏻] │
│ Esszimmer       │
└─────────────────┘
```

Normal:

```text
Esszimmer
Ist 21,8°  Soll 22,5°
[ − ] [ + ] [ ⏻ ]
```

Focus:

```text
Esszimmer

Ist:  21,8 °C
Soll: 22,5 °C

[ − ]       [ + ]

[ ⏻ Ein/Aus ]
```

## Off State

Wenn Climate off:

- Zustand eindeutig anzeigen
- Temperaturcontrols bei Bedarf disabled
- Power-On anzeigen, wenn sicher erlaubt

## Rate Limit

Climate Power nutzt bestehende Write-Rate-Limit-Architektur.

---

# Teil D – Focus Card Mode

## Ziel

Kleine Cards bleiben dicht und übersichtlich. Vollständige Informationen und erlaubte Controls erscheinen temporär im Focus Mode.

```text
Tap auf Card
      ↓
Focus Overlay
      ↓
volle Details + volle erlaubte Bedienung
```

## Kein Grid-Reflow

Focus darf niemals die echte Grid-Geometrie verändern.

Nicht:

```text
Card wächst im Grid
→ Nachbarn verschieben sich
```

Sondern Overlay.

## Legacy-kompatibles Overlay

Bevorzugt:

```text
position: fixed
```

mit halbtransparentem Hintergrund.

Kein `<dialog>` erforderlich.

## Eigenschaften

- nur eine Focus Card gleichzeitig
- zentral sichtbar
- ausreichend groß
- vollständiger Inhalt
- erlaubte Controls
- sichtbarer Close-Button
- Tap außerhalb schließt
- Grid darunter bleibt unverändert
- Focus-Card darf intern scrollen, falls nötig

## Standardinteraktion

Bevorzugt:

```text
Tap auf nicht-interaktive Card-Fläche
→ Focus öffnen
```

Long Press ist nicht erforderlich.

## Event-Trennung

```text
Tap Card-Fläche
→ Focus öffnen

Tap +
→ Temperatur erhöhen
→ Focus nicht zusätzlich öffnen

Tap -
→ Temperatur senken
→ Focus nicht zusätzlich öffnen

Tap Power
→ Gerät schalten
→ Focus nicht zusätzlich öffnen
```

Event-Bubbling entsprechend kontrollieren.

---

# Focus Content Contracts

## Sensor

Compact:

```text
Icon
Value
Identity
```

Focus:

```text
Identity
Icon
voller Wert
Einheit
ggf. zusätzliche bereits sichere Informationen
```

## Binary

Compact:

```text
Status
Identity
```

Focus:

```text
Identity
Status
ggf. Dauer / sichere Zusatzinfo
```

## Light

Compact:

```text
Status
Identity
optional primäres Power-Control
```

Focus:

```text
Identity
Status
vollständiges erlaubtes Power-Control
```

## Climate

Compact:

```text
Identity
Isttemperatur
ggf. Power
```

Focus mindestens:

```text
Identity
Isttemperatur
Solltemperatur
-
+
Power
```

---

# Focus und Schreibrechte

Controls nur aktiv, wenn:

- Widgettyp Funktion unterstützt
- Backend-Capability vorhanden
- Entity ausdrücklich schreibberechtigt

Nicht schreibberechtigte Entity:

```text
read-only Focus Card
```

## unavailable / stale

Bei `unavailable`:

- Controls deaktivieren
- Zustand anzeigen
- keine Schreibaktion senden

Bei stale Daten bestehende Sicherheitslogik beibehalten und keine irreführende aktive Bedienbarkeit erzeugen.

---

# Theme

Focus Card respektiert persistiertes Legacy-Theme.

Dark Mode:
- Dark Focus Card
- passende Controls
- ausreichender Kontrast

Light Mode entsprechend.

---

# Gemeinsame Komponenten

Bevorzugte Trennung, wenn passend:

```text
src/public/js/controls/
    power.js
    stepper.js

src/public/js/focus/
    focus.js
```

oder äquivalente bestehende Struktur.

Keine erneute Aufblähung von `app.js`.

---

# API-Sicherheit – Preview

Preview API liefert nur erforderliche Felder, z. B.:

```json
{
  "entity_id": "sensor.bad_temp",
  "state": "21.8",
  "friendly_name": "Badezimmer",
  "device_class": "temperature",
  "unit": "°C"
}
```

Keine vollständigen Roh-State-Objekte, wenn nicht notwendig.

---

# API-Sicherheit – Climate Power

Servervalidierung:

```text
entity vorhanden?
↓
Domain climate?
↓
Entity explizit schreibberechtigt?
↓
state exakt on/off?
↓
Power-Capability serverseitig vorhanden?
↓
fester interner HA-Aufruf
```

Keine Capability aus Browserdaten vertrauen.

---

# Tests – Admin Live Preview

1. Sensor Preview sichtbar
2. aktuelle Entity-Daten sichtbar
3. Identity sichtbar
4. Icon sichtbar
5. Preview reagiert auf Resize
6. Compact/Normal/Expanded korrekt
7. Portrait Preview
8. Landscape Preview
9. Light Preview
10. Climate Preview
11. Preview-Control löst keine HA-Schreibaktion aus
12. unavailable kontrolliert
13. unknown kontrolliert
14. Preview API enthält keine Tokens
15. Preview API enthält keine Write-Allowlists

---

# Tests – Unified Controls

16. alter iOS-Switch nicht mehr verwendet
17. Light Power Button sichtbar
18. Light on funktioniert
19. Light off funktioniert
20. Busy State
21. unavailable deaktiviert
22. Dark Mode
23. Light Mode
24. Touchziel ausreichend
25. Compact ohne Überlappung

---

# Tests – Climate Power

26. erlaubte Climate Entity kann ausgeschaltet werden
27. erlaubte Climate Entity kann sicher eingeschaltet werden
28. nicht erlaubte Climate Entity wird abgewiesen
29. falsche Domain wird abgewiesen
30. ungültiger State wird abgewiesen
31. kein beliebiger Service-Name akzeptiert
32. Rate Limit greift
33. HA-Fehler kontrolliert
34. Capability serverseitig bestimmt
35. uneindeutiger Power-On-Modus führt nicht zu blindem Einschalten
36. expliziter Power-On-Modus funktioniert
37. Sichtbarkeit verändert Allowlist nicht

---

# Tests – Focus Mode

38. Sensor Tap öffnet Focus
39. Binary Tap öffnet Focus
40. Light Tap öffnet Focus
41. Climate Tap öffnet Focus
42. nur eine Focus Card
43. Close Button schließt
44. Tap außerhalb schließt
45. Grid-Geometrie unverändert
46. Nachbar-Cards bewegen sich nicht
47. Focus nutzt aktuelles Theme
48. Focus zeigt Identity
49. Focus zeigt Kerninformationen
50. Light Focus zeigt erlaubtes Power-Control
51. Climate Focus zeigt Isttemperatur
52. Climate Focus zeigt Solltemperatur
53. Climate Focus zeigt Minus
54. Climate Focus zeigt Plus
55. Climate Focus zeigt Power bei Capability
56. Plus öffnet nicht zusätzlich Focus
57. Minus öffnet nicht zusätzlich Focus
58. Power öffnet nicht zusätzlich Focus
59. unavailable deaktiviert Controls

---

# Regression – Sprint 17.2 / 19 / 20

60. Compact Identity bleibt sichtbar
61. proportionale Geometrie bleibt erhalten
62. Dark Mode bleibt nach Reload erhalten
63. `/system/summary` funktioniert
64. Summary API unverändert
65. `/system/errors` funktioniert
66. Error API unverändert
67. Severity-Klassifikation unverändert
68. Stale-/Offline-Verhalten unverändert
69. User-Dashboard Drag/Resize funktioniert
70. Admin funktioniert
71. Climate Temperatursteuerung funktioniert
72. Light-Steuerung funktioniert

---

# Security Regression

73. HA-Token Backend-only
74. Admin-Token geschützt
75. Light-Allowlist unverändert
76. Climate-Schreibgrenze unverändert
77. Preview erzeugt keine Schreibberechtigung
78. Focus erzeugt keine Schreibberechtigung
79. keine generische Service-API
80. keine Secrets in Preview-/Focus-Payloads

---

# Manuelle Abnahme – Admin

Mit echten sanierten Entity-Daten prüfen:

- Sensor
- Binary
- Light
- Climate
- Compact
- Normal
- Expanded
- Portrait
- Landscape
- Light Theme
- Dark Theme
- Drag
- Resize

Ziel:

> Die Preview muss dem Wall-Display sehr nahekommen.

---

# Manuelle Abnahme – iPad mini

## Compact Dashboard

Mehrere kleine Cards platzieren und prüfen:

- Identity lesbar
- Wert/Status lesbar
- hohe Informationsdichte
- keine Überlappung
- Controls proportional

## Focus

In Portrait und Landscape:

```text
Tap Sensor
Tap Binary
Tap Light
Tap Climate
```

Prüfen:

- öffnen
- anzeigen
- erlaubte Controls bedienen
- schließen
- Grid bleibt unverändert

## Climate

Prüfen:

- Thermostat an
- ausschalten
- Thermostat aus
- einschalten
- Solltemperatur erhöhen
- Solltemperatur senken
- Busy State
- Fehlerfall
- Dark/Light Mode

## Light

Prüfen:

- neues Power-Control
- on/off
- Busy
- unavailable
- Compact
- Focus
- Dark/Light

---

# Performance

Live Preview:
- keine HA-Abfrage pro Drag-Frame
- State-Daten cachen/wiederverwenden
- Resize lokal rendern
- moderates Polling

Focus:
- keine zweite permanente Pollingpipeline
- vorhandene Dashboard-State-Daten verwenden
- nur notwendige DOM-Struktur

---

# Persistenz

Focus Mode ist temporärer UI-State.

Nicht persistent speichern:

```text
focusedWidgetId
```

Card-Layout bleibt unverändert.

---

# Accessibility

Mindestens:

- Close als echtes Button-Element
- Power als echte Buttons
- erkennbare Disabled States
- sinnvolle Labels / aria-labels
- Status nicht nur über Farbe

---

# Asset Cache

Da Legacy CSS/JS geändert wird:

- aktuellen Cache-Buster aus Repository lesen
- konsistent erhöhen
- keinen historischen Wert voraussetzen

---

# Voraussichtlich betroffene Dateien

Codex muss den tatsächlichen Stand nach Sprint 20 prüfen.

Voraussichtlich:

```text
src/public/css/style.css
src/public/js/core/widget.js
src/public/js/core/dashboard.js
src/public/js/core/theme.js
src/public/js/widgets/sensor.js
src/public/js/widgets/binary.js
src/public/js/widgets/light.js
src/public/js/widgets/climate.js
src/public/js/controls/
src/public/js/focus/
src/routes/
src/services/homeassistant.js
src/services/write-rate-limit.js
src/admin/
src/admin/js/layout.js
test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Tatsächliche Dateinamen sind maßgeblich.

---

# Nicht-Ziele

Nicht Bestandteil von Sprint 17.3:

- neue Summary-Regeln
- neue Error-/Severity-Regeln
- Registry-Enrichment
- Repairs
- Matter
- Automation Impact
- generische neue steuerbare Domains
- generischer Service-Proxy
- Vacuum Controls
- Cover Controls
- Home Assistant App
- HACS
- freie Pixelpositionierung
- CSS Grid

---

# Definition of Done

Sprint 17.3 ist abgeschlossen, wenn:

- Admin-Layouteditor echte Card-Vorschauen zeigt
- Preview aktuelle sanitisierte Entity-Daten nutzt
- Preview niemals HA-Geräte schaltet
- Preview auf Resize und Presentation Mode reagiert
- Preview Portrait/Landscape und Light/Dark darstellen kann
- Light-Control nicht mehr im iOS-Switch-Stil dargestellt wird
- neues Light-Control visuell zum Dashboard passt
- Climate Power sicher Ein/Aus ermöglicht, wenn Capability eindeutig erlaubt
- kein generischer Climate-Service-Proxy entsteht
- Climate Write-Sicherheitsgrenze erhalten bleibt
- Compact Cards Identity + Kernwert/-status behalten
- Tap auf Card Focus Mode öffnet
- Focus Mode das Grid nicht verändert
- Focus volle erlaubte Bedienung anbietet
- direkte Control-Taps nicht zusätzlich Focus öffnen
- Focus auf iOS 9 funktioniert
- Theme im Focus funktioniert
- `/system/summary` unverändert funktioniert
- `/system/errors` unverändert funktioniert
- alle Security Boundaries erhalten bleiben
- alle Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Sprint-20-Stand
3. geänderte Dateien
4. Preview-Datenquelle
5. Preview-Renderer-Architektur
6. Preview-Read-only-Sicherheitsmechanismus
7. Unified-Control-Design
8. Light-Control-Änderung
9. Climate-Power-API
10. Climate-Power-Capability-Regeln
11. Power-On-Modus-Regeln
12. Focus-Mode-Architektur
13. Tap-/Control-Event-Regeln
14. ES5-/iOS-9-Prüfung
15. Testanzahl und Ergebnis
16. Asset-Cache-Version
17. manuelle iPad-Abnahme
18. Summary-Regression
19. Error-Regression
20. Security-Regression
21. verbleibende Einschränkungen
22. Voraussetzungen für Sprint 21
23. Commit-Vorschlag
24. Deploymentbefehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-17.1.md
- docs/sprints/SPRINT-17.2.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-17.3.md

Sprint 20 is already fully implemented, pushed and deployed to the production
LXC. Inspect the actual repository state before making changes.

Implement Sprint 17.3 exactly as specified in docs/sprints/SPRINT-17.3.md.

Goals:

1. Add a real live card preview to the Admin layout editor using current,
   sanitized entity data through the gateway.
2. Replace the iOS-style Light switch with a dashboard-native unified control
   design.
3. Restore safe Climate on/off control through a dedicated allowlist-protected
   backend API.
4. Add a Focus Card mode so compact cards can remain dense while full
   information and controls are available on tap.

Admin Preview:
- show actual card content,
- react to card size and presentation mode,
- support portrait/landscape,
- support light/dark preview,
- show controls read-only,
- never issue Home Assistant write actions.

Unified Controls:
- common dashboard visual language,
- real buttons,
- usable touch targets,
- no iOS-switch imitation.

Climate Power:
- no generic service proxy,
- only allowlisted climate entities,
- only explicit on/off intent,
- capability determined server-side,
- do not trust browser capability flags,
- if power-on is ambiguous, require a safe explicit configured power-on mode
  or do not offer power-on.

Focus Mode:
- tap non-interactive card area to open temporary overlay,
- never resize/reflow the actual grid,
- only one Focus Card at a time,
- visible close button and tap-outside close,
- authorized controls remain functional,
- direct control taps must not also open Focus,
- unavailable/stale states must not expose unsafe active controls.

Preserve the compact-card identity contract and proportional geometry from
Sprint 17.2.

Preserve all existing Home Assistant security boundaries.

Do not automatically extend Light or Climate write allowlists because an
entity is visible, previewed or focused.

Keep the wall-display fully compatible with Safari on iOS 9 and ECMAScript 5.

Do not use CSS Grid, ResizeObserver, container queries, fetch, Promise or
modern JavaScript syntax in the legacy wall display.

Do not modify Summary or Error Dashboard business logic.

Run regression tests for:
- /system/summary
- /system/errors
- severity classification
- stale/offline handling
- theme persistence
- grid layout
- Light control
- Climate temperature control
- all write-security boundaries.

Run the complete test suite and required syntax checks.

Manually verify on the iPad mini in portrait and landscape:
- compact Sensor,
- compact Binary,
- compact Light,
- compact Climate,
- Light power control,
- Climate on/off,
- Climate +/-,
- Focus open/close,
- Focus controls,
- Dark Mode,
- Light Mode.

Update docs/PROJECT_STATUS.md when finished.

Do not commit or push unless explicitly instructed.
```
