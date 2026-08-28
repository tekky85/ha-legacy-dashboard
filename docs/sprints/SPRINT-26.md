# Sprint 26 – Dashboard Sections & Room Model Foundation

## Status
Planned – Post-RC feature sprint

## Einordnung
Kein RC-Blocker. Beginn der nächsten Produktphase.

## Ziel
Ein Dashboard kann in logische Abschnitte gegliedert werden:

```text
Erdgeschoss
├── Wohnzimmer
├── Esszimmer
└── Küche

Obergeschoss
├── Schlafzimmer
├── Kinderzimmer
└── Bad
```

Oder frei:
```text
Räume
Sicherheit
Energie
Außenbereich
```

## A – Section Model
Konzept:
```javascript
sections: [
  {
    id: "section-...",
    title: "Erdgeschoss",
    order: 10,
    showTitle: true,
    areaId: null
  }
]
```

Cards referenzieren optional `sectionId`.

Bestehende Cards ohne Section bleiben in einer Default-/Unassigned-Gruppe.

## B – Admin
- Abschnitt hinzufügen
- umbenennen
- verschieben
- löschen
- Cards zuordnen
- Cards zwischen Sections verschieben

Beim Löschen keine Cards verlieren.

## C – Layout
Sections untereinander, innerhalb jeder Section bestehendes Grid.

Kein CSS Grid-Zwang; iOS 9 / ES5 bleibt Pflicht.

## D – Optionaler Section Header
Section-Titel pro Section ein-/ausblendbar.

## E – Room Semantics
Eine Section darf optional eine bestehende Home Assistant Area referenzieren (`areaId`), muss aber keine Area sein.

```text
Section != zwingend Area
```

## F – HA Area Metadata
Nur bestehende read-only Area Registry verwenden. Keine Area Writes.

## G – Room Card Preparation
Section Model bereitet Sprint 26.1 Native Room Card vor.

## H – Backward Compatibility
Bestehende Dashboards ohne Sections rendern wie bisher. Keine disruptive Migration.

## Tests
- existing dashboard no sections
- create/rename/reorder/delete
- delete loses no cards
- assign/move/unassigned
- default/custom
- background
- showTitle
- portrait/landscape
- iOS 9
- HomeScreen

## Definition of Done
- Section Model persistent
- Admin Section Management
- keine Cards bei Delete verloren
- bestehende Dashboards kompatibel
- HA Area optional
- keine HA Area Writes
- iPad mini kompatibel
- Sprint 26.1 vorbereitet

## Codex-Prompt

```text
Implement Sprint 26 exactly as specified in docs/sprints/SPRINT-26.md.

This is a post-RC feature sprint.

Add persistent per-dashboard sections that can represent rooms, floors or
arbitrary logical groups.

Sections may optionally reference an existing Home Assistant Area, but must not
require one and must never write HA Areas.

Preserve existing dashboards without migration breakage.

Use the existing grid inside each section and keep iOS 9 / ES5 compatibility.

Prepare the model cleanly for Sprint 26.1 Native Room Cards.

Do not commit or push until I review the result.
```
