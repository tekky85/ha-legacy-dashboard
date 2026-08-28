# Sprint 26.1 – Native Room Card MVP

## Status
Planned – Post-RC feature sprint

## Architekturentscheidung

Als UX-Referenz wurde `lop1505/RoomCard` / OneLine Room Card betrachtet.

Interessante Konzepte:
- Visual Editor
- Area-Based Auto-Setup
- Room Background Image
- Temperatur/Luftfeuchte/Zieltemperatur
- Alert-/Window-/Battery-Chips
- Collapsible Card
- flexible Controls
- direkte Raumsteuerung

Das Upstream-Projekt ist eine Home-Assistant-Lovelace/HACS-Custom-Card als JavaScript-Modul und eng an das HA-Frontend gekoppelt.

HA Legacy Dashboard ist dagegen:
```text
external Node/Express gateway
+
custom ES5 frontend
+
iOS 9 target
```

Daher:

> Kein Fork als Implementierungsbasis.

Native Room Card auf unserem eigenen State-/Capability-Modell bauen.

Das Upstream-Projekt ist MIT-lizenziert. Falls Quellcode direkt wiederverwendet wird, Lizenz-/Copyright-Hinweise erhalten. Bevorzugt UX-/Architektur-Inspiration statt direkter Übernahme.

## Ziel
Neue Card Type:
```text
room
```

## A – Room Card Model
Konzept:
```javascript
{
  type: "room",
  title: "Wohnzimmer",
  areaId: "...",
  imageId: "...",
  entities: {
    temperature: "...",
    humidity: "...",
    climate: "...",
    presence: "...",
    windows: [...],
    lights: [...],
    switches: [...],
    covers: [...]
  },
  collapsible: true
}
```

## B – HA Area Auto-Setup
Admin kann eine HA Area auswählen.

Read-only Vorschläge:
- temperature
- humidity
- climate
- lights
- switches
- covers
- fans
- media players
- locks
- windows/openings
- presence
- battery warnings

Benutzer bestätigt/ändert Zuordnung. Keine HA Writes.

## C – Header / Primary Status
- Raumname
- Temperatur
- Luftfeuchte
- optional Zieltemperatur
- optional Presence
- Open Windows
- Critical Alert

## D – Room Background
Optionales Room-Card-Bild. Upload-Sicherheitsarchitektur aus Sprint 25.3 wiederverwenden.

## E – Alerts
Bestehende Risk-/State-Semantik wiederverwenden:
- Fenster/Tür offen
- Smoke/CO/Gas/Leak critical
- Batterie niedrig

Keine zweite Security Engine.

## F – Controls
Ausgewählte direkte Controls, aber nur wenn HA Legacy Dashboard dafür bereits explizite sichere Backend-Endpunkte/Allowlists besitzt.

Keine generische HA Service API bauen.

Nicht unterstützte Controls read-only oder nicht anbieten.

## G – Collapse
Optional:
```text
expanded
collapsed
```

Collapsed:
- identity
- primary values
- important alerts

Expanded:
- controls
- secondary sensors

## H – Section Integration
Beispiel:
```text
Section Erdgeschoss
├── Room Card Wohnzimmer
├── Room Card Esszimmer
└── Room Card Küche
```

## I – Size Matrix
Sprint 25.6-Matrix nutzen:
```text
compact
standard
wide
large
```

## J – Legacy Constraints
Kein:
- Lit
- Lovelace runtime dependency
- HA frontend module dependency
- modern ES module requirement im Legacy Browser
- CSS Grid
- Shadow DOM als Voraussetzung

## K – Warum kein Fork
Ein Fork müsste zentrale Upstream-Bestandteile ersetzen:
- Lovelace lifecycle
- hass object coupling
- custom-card registration
- module loading
- moderne Browserannahmen
- HA Editor APIs
- HA action handling

Damit ist native Umsetzung langfristig wartbarer.

## Tests
- area auto-setup
- no area
- temperature/humidity
- climate
- windows
- presence
- alerts
- safe controls
- unsupported controls safe
- collapsed/expanded
- background
- long room name
- unavailable states
- all valid sizes
- portrait/landscape
- HomeScreen
- iOS 9

## Definition of Done
- native room card
- keine Lovelace Runtime Dependency
- HA Area Auto-Setup read-only
- Alerts reuse existing risk logic
- Controls reuse explicit safe APIs
- Collapse funktioniert
- Section integration
- Size Matrix integration
- Upload-Security reuse
- iOS 9 / ES5
- keine generische HA Service API

## Codex-Prompt

```text
Implement Sprint 26.1 exactly as specified in docs/sprints/SPRINT-26.1.md.

Do not fork or embed lop1505/RoomCard as the runtime implementation.

Use it only as UX/feature inspiration.

Build a native HA Legacy Dashboard Room Card on our existing normalized entity,
device, area, risk and capability models.

Keep the external gateway architecture and Safari iOS 9 / ES5 frontend.

Reuse existing secure upload, risk classification and explicit control APIs.

Never add a generic Home Assistant service proxy merely to support Room Card
controls.

Integrate with Sprint 26 Sections and Sprint 25.6 Card Size Matrix.

Do not commit or push until I review the result.
```
