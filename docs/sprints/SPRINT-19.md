# Sprint 19 – Summary Dashboard MVP

## Status

Planned

## Abhängigkeiten

Sprint 19 setzt voraus:

- Sprint 18 – System Dashboard Foundation
- Sprint 17.1 – Grid Refinement + Responsive Card Content

Codex muss vor Beginn den tatsächlichen Repository-Stand prüfen und verifizieren:

- `/system/summary` existiert
- `/system/errors` existiert
- gemeinsamer System-State-Collector existiert
- normalisierter System-Snapshot existiert
- Snapshot-Cache und Stale-Data-Verhalten existieren
- Summary Engine Interface existiert
- Legacy-System-Dashboard-Shell ist ES5-kompatibel
- Sprint 17.1 hat das User-Dashboard-Raster verfeinert
- Sprint 17.1 hat responsive Presentation Modes eingeführt
- normale User-Dashboards und System-Dashboards bleiben getrennt

Falls diese Voraussetzungen fehlen, darf Sprint 19 nicht durch parallele
provisorische Architektur kompensiert werden.

---

# Ziel

Sprint 19 implementiert das erste fachlich nutzbare feste dynamische
Summary-Dashboard.

Route:

```text
/system/summary
```

Das Dashboard beantwortet:

> Was ist im Haus gerade aktiv, eingeschaltet, geöffnet, in Bewegung oder in
> einem sonstigen aktuell relevanten Zustand?

Es ist kein vollständiges Entity-Dashboard und kein Ersatz für Lovelace.

Es zeigt ausschließlich aktuell handlungsrelevante Zustände.

---

# Verbindliche Sicherheitsgrundsätze

Unverändert:

- Home-Assistant-Token ausschließlich im Backend
- Browser kennt keinen HA-Token
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Home-Assistant-Service-API
- keine neuen Schreibaktionen in Sprint 19
- keine Schnellaktionen in Sprint 19
- bestehende Write-Allowlists bleiben unverändert
- Summary-Sichtbarkeit erzeugt keine Schreibberechtigung
- Admin-Token bleibt getrennt
- keine Secrets in Browser, Logs oder Repository
- Gateway liefert nur reduzierte Summary-Daten

Kurzform:

```text
Summary Item sichtbar
        !=
Entity schreibbar
```

---

# Legacy-Kompatibilität

Das Summary-Dashboard muss funktionieren auf:

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
- `async`
- `await`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

Browserkommunikation ausschließlich über die bestehende
`Legacy.http`-/`XMLHttpRequest`-Schicht.

---

# Feste System-Dashboard-Eigenschaften

`/system/summary` ist:

- immer vorhanden
- nicht löschbar
- nicht umbenennbar über normalen Dashboardeditor
- nicht Teil von `/d/:dashboardId`
- nicht Teil des normalen Drag-and-drop-Rasters
- nicht frei mit normalen Widgets bestückbar
- dynamisch aus dem System-Snapshot erzeugt

Das Layout bleibt speziell für Summary optimiert.

---

# Grundprinzip „aktiv“

„Aktiv“ darf niemals pauschal bedeuten:

```text
state != off
```

Eine numerische Entity wie:

```text
sensor.temperatur = 21.5
```

ist keine Aktivität.

Eine Entity erscheint nur, wenn ihr Zustand eine aktuell relevante Aktivität
oder einen offenen/eingeschalteten Zustand repräsentiert.

Bewertung mindestens anhand von:

- Domain
- Device Class
- State
- ausgewählten Attributen

Spätere Sprints ergänzen:

- Device Metadata
- Area Metadata
- Labels
- Benutzerregeln
- Mindestdauer
- Nachlaufzeit
- Geräteaggregation

---

# Normalisiertes Summary-Modell

Sprint 19 soll die in Sprint 18 vorbereitete Summary Engine fachlich füllen.

Konzeptuelles Modell:

```javascript
{
    id: "summary-light-light.wohnzimmer",
    entityIds: [
        "light.wohnzimmer"
    ],
    category: "powered",
    priority: 70,
    title: "Wohnzimmer",
    description: "Licht ist eingeschaltet",
    state: "on",
    startedAt: "2026-08-11T18:00:00Z",
    durationSeconds: 420,
    icon: "light",
    metadata: {
        domain: "light"
    }
}
```

Die konkrete Struktur darf an bestehende Projektkonventionen angepasst werden.

---

# Mindestfelder pro Summary Item

Mindestens:

```text
id
entityIds[]
category
priority
title
state
```

Optional beziehungsweise soweit sicher verfügbar:

```text
description
startedAt
durationSeconds
icon
area
device
metadata
```

Keine unnötigen Rohattribute weiterreichen.

---

# Kategorien

Mindestens folgende Kategorien vorsehen:

```text
open
running
powered
cleaning
climate
media
movement
security
other
```

Nicht jede Kategorie muss im Sprint-19-MVP bereits gefüllt werden.

---

# Standardbereiche im UI

Bevorzugt:

```text
Offen
Läuft gerade
Eingeschaltet
Klima aktiv
Medien aktiv
Weitere relevante Zustände
```

Leere Bereiche sollen nicht unnötig angezeigt werden.

---

# MVP-Regeln

## 1. Light

Domain:

```text
light
```

Aktiv wenn:

```text
state == "on"
```

Kategorie:

```text
powered
```

Beispiel:

```text
Wohnzimmerlicht ist an.
```

Optionale Attribute:

- brightness

Nur wenn sie bereits sicher im Snapshot vorhanden sind.

---

# 2. Switch

Domain:

```text
switch
```

Aktiv wenn:

```text
state == "on"
```

Kategorie:

```text
powered
```

Wichtig:

Technische oder diagnostische Schalter sollen nicht ungeprüft erscheinen.

Da Sprint 21 Registry/Entity-Category-Enrichment erst später bringt, soll
Sprint 19 mindestens eine einfache sichere Ignore-Konfiguration unterstützen.

Keine Heuristik nur anhand eines Namens als alleinige Sicherheitsentscheidung.

---

# 3. Binary Sensor – Fenster und Türen

Domain:

```text
binary_sensor
```

Relevante Device Classes mindestens:

```text
window
door
opening
garage_door
```

Relevant wenn:

```text
state == "on"
```

Kategorie:

```text
open
```

Beispiel:

```text
Fenster Kinderzimmer ist offen.
```

`unknown` oder `unavailable` gehören nicht in das Summary als „offen“.

Diese Zustände werden in Sprint 20 im Error Dashboard behandelt.

---

# 4. Cover

Domain:

```text
cover
```

Relevant mindestens bei:

```text
open
opening
closing
```

Kategorie:

```text
open
```

oder für Bewegung:

```text
running
```

Codex soll eine konsistente Regel wählen.

Wenn `current_position` sicher vorhanden ist, darf es als Zusatzinformation
verwendet werden.

Keine komplexe Cover-Class-Semantik in diesem MVP erzwingen.

---

# 5. Vacuum

Domain:

```text
vacuum
```

Relevant mindestens bei:

```text
cleaning
returning
paused
```

Kategorie:

```text
cleaning
```

oder:

```text
running
```

Beispiel:

```text
Saugroboter reinigt.
```

Wenn sichere Attribute bereits vorhanden sind:

- Batteriestand
- Raum/Zone

dürfen sie als Zusatz angezeigt werden.

Keine gerätespezifischen Vendor-Adapter in Sprint 19.

---

# 6. Climate

Domain:

```text
climate
```

Nicht allein anhand des HVAC-Modus anzeigen.

Beispiel:

```text
state == heat
```

ist nicht automatisch aktiv.

Relevant ist die tatsächliche Aktion, z. B. aus:

```text
hvac_action
```

Aktive Werte mindestens:

```text
heating
cooling
drying
fan
```

Kategorie:

```text
climate
```

Beispiel:

```text
Wohnzimmer wird beheizt.
```

Wenn `hvac_action` fehlt, nicht aus dem Modus allein Aktivität ableiten.

---

# 7. Media Player

Domain:

```text
media_player
```

Im MVP erlaubt:

```text
state == "playing"
```

Kategorie:

```text
media
```

Beispiel:

```text
Wohnzimmer spielt Medien ab.
```

Optionale Zusatzinfo:

```text
media_title
```

aber nur wenn bereits sicher gefiltert.

## Datenschutz

Medientitel müssen über Summary-Konfiguration ausblendbar sein.

Default bevorzugt:

```text
media_title sichtbar = false
```

wenn noch keine Produktentscheidung getroffen wurde.

---

# 8. Fan

Domain:

```text
fan
```

Aktiv wenn:

```text
state == "on"
```

Kategorie:

```text
powered
```

Optional:

- percentage

Nur soweit vorhanden.

---

# 9. Lock

Domain:

```text
lock
```

Relevant bei:

```text
unlocked
unlocking
locking
```

`jammed` gehört primär in das Error Dashboard.

Kategorie:

```text
security
```

Beispiel:

```text
Haustür ist nicht verriegelt.
```

Sprint 19 darf `jammed` nicht als normale Summary-Aktivität verharmlosen.

---

# 10. Alarm Control Panel

Domain:

```text
alarm_control_panel
```

Relevant nur bei klar handlungsrelevanten Zuständen.

Mindestens sinnvoll:

```text
armed_home
armed_away
armed_night
pending
triggered
```

`triggered` muss später auch im Error/Security-Kontext besonders priorisiert
werden.

Sprint 19 darf es im Summary anzeigen, aber nicht so darstellen, als sei es
nur eine normale Aktivität.

---

# Numerische Sensoren

Standardregel:

```text
sensor.*
```

mit numerischen Messwerten werden **nicht** automatisch als Summary Item
erzeugt.

Beispiele:

- Temperatur
- Luftfeuchtigkeit
- Leistung
- Energie
- Helligkeit
- CO2

Spätere Regeln für Leistungsschwellen kommen in Sprint 22.

---

# Motion / Presence

`binary_sensor` mit:

```text
motion
occupancy
presence
```

sollen im Sprint-19-MVP standardmäßig **nicht** angezeigt werden.

Grund:

- zu kurzlebig
- unruhige Oberfläche
- Mindestdauer/Nachlauf fehlt noch

Diese Kategorie folgt später mit zeitlicher Logik.

---

# Unavailable / Unknown

Verbindlich:

```text
unavailable
unknown
```

werden im Summary nicht als normale Aktivität dargestellt.

Das Summary darf diese Zustände nicht als „aus“ interpretieren.

Wenn der komplette HA-Snapshot stale/offline ist, muss der Summary-Metastatus
dies anzeigen.

---

# Ignore-Konfiguration

Sprint 19 soll mindestens eine explizite Ignore-Liste ermöglichen.

Konzept:

```json
{
  "systemDashboards": {
    "summary": {
      "ignoredEntities": [
        "switch.router_led",
        "switch.integration_debug_mode"
      ]
    }
  }
}
```

Die konkrete Struktur muss zur bestehenden persistenten Konfiguration passen.

---

# Include-Konfiguration

Optional im MVP:

```text
includedEntities
```

aber nur wenn dies ohne unnötige Komplexität sauber implementiert werden kann.

Priorität hat die Ignore-Liste.

---

# Keine automatische Write-Freigabe

Wenn eine Entity in Summary-Konfiguration aufgenommen wird:

```text
light.xyz
```

ändert dies niemals:

```text
ALLOWED_LIGHT_ENTITIES
```

oder andere Write-Allowlists.

Testpflicht.

---

# Sortierung

Standardmäßig:

1. Priorität
2. Kategorie
3. `startedAt` / Dauer, falls vorhanden
4. Titel

Die Sortierung muss deterministisch sein.

---

# Prioritäten

Konzeptuelle Defaults:

```text
security:  100
open:       90
running:    80
cleaning:   80
climate:    70
media:      60
powered:    50
movement:   40
other:      10
```

Codex darf diese Werte anpassen, solange die Reihenfolge klar dokumentiert ist.

---

# Dauer

Wenn `last_changed` sicher im Snapshot vorhanden ist:

```text
durationSeconds = now - last_changed
```

Anzeige z. B.:

```text
seit 18 Min.
```

Wichtig:

- nur für aktuellen State
- keine Historie behaupten
- keine dauerhafte Persistenz in Sprint 19 nötig

---

# Raum / Area

Sprint 21 führt Registry-Enrichment ein.

Falls Sprint 18 bereits sicher Area-Metadaten liefert, darf Sprint 19 sie
verwenden.

Falls nicht:

- kein künstliches Area-Mapping erfinden
- Titel/Friendly Name verwenden
- fehlende Area ist kein Fehler

---

# Gruppierung

## Standard

Im MVP standardmäßig:

```text
nach Kategorie
```

## Optional

Wenn Area-Metadaten bereits zuverlässig vorhanden sind:

```text
nach Raum
```

darf als zweite Option vorbereitet werden.

Nicht zwingend für DoD.

---

# UI-Konzept

Das Summary-Dashboard soll kompakter als normale User-Dashboards sein.

Keine großen frei angeordneten Cards.

Bevorzugte Darstellung:

```text
AKTUELL AKTIV

Offen
────────────────────────
Fenster Kinderzimmer       seit 18 Min.
Terrassentür               seit 4 Min.

Läuft gerade
────────────────────────
Saugroboter                Reinigung

Eingeschaltet
────────────────────────
Wohnzimmer                 Licht
Büro                       Steckdose

Klima aktiv
────────────────────────
Wohnzimmer                 Heizung
```

---

# DOM-Strategie

Für Legacy-Geräte:

- keine dichten Tabellen
- keine großen verschachtelten DOM-Strukturen
- keine unnötigen Animationen
- Gruppen nur rendern, wenn Inhalt vorhanden
- kompakte Listenstruktur
- Inline SVG wiederverwenden
- sinnvolle DOM-Obergrenze im Blick behalten

---

# Summary Header

Mindestens:

```text
Summary
X aktive Zustände
letzte Aktualisierung
```

Optional zusätzlich:

```text
Y offen
Z eingeschaltet
```

nur wenn ohne große Zusatzlogik verfügbar.

---

# Empty State

Wenn aktueller Snapshot erfolgreich und keine Summary Items aktiv:

```text
Aktuell sind keine überwachten Geräte oder Vorgänge aktiv.
```

Optional:

```text
Letzte Aktualisierung: 21:23
```

---

# Stale State

Wenn HA aktuell nicht erreichbar ist, aber ein letzter erfolgreicher Snapshot
existiert:

```text
Daten nicht aktuell
Letzte erfolgreiche Aktualisierung: ...
```

Die letzten bekannten Summary Items bleiben sichtbar.

Nicht:

```text
Keine Aktivitäten
```

---

# Offline ohne erfolgreichen Snapshot

Wenn noch nie ein erfolgreicher Snapshot vorlag:

```text
Home Assistant derzeit nicht erreichbar.
Summary-Daten sind noch nicht verfügbar.
```

Keine falsche leere Liste.

---

# Recovery

Nach Wiederherstellung von HA:

- neuer Snapshot
- stale verschwindet
- Summary neu berechnen
- Oberfläche automatisch aktualisieren
- kein manueller Reload nötig

---

# Polling

Bestehendes Polling aus Sprint 18 verwenden.

Keine neue zweite Polling-Infrastruktur.

Keine direkte Browser-WebSocket-Verbindung.

---

# Summary API

Bevorzugte Antwort:

```json
{
  "items": [],
  "groups": [],
  "_meta": {
    "reachable": true,
    "stale": false,
    "last_successful_update": "..."
  }
}
```

Die genaue Struktur darf an Sprint 18 angepasst werden.

Wichtig:

- keine Rohstates
- keine Tokens
- keine Write-Allowlists
- keine unnötigen Attribute

---

# Server-seitige Gruppierung

Bevorzugt:

Die Summary Engine liefert bereits normalisierte Items und optional Gruppen.

Der Browser soll nicht die gesamte Fachlogik selbst nachbauen.

Domain-/Device-Class-Aktivitätslogik gehört ins Backend.

Legacy-Frontend ist primär Renderer.

---

# Keine doppelte Fachlogik

Nicht:

```text
Backend sagt Item aktiv
Frontend prüft Domain noch einmal anders
```

Eine fachliche Quelle der Wahrheit.

---

# Admin UI – Summary Settings MVP

Sprint 19 soll einen kleinen System-Dashboard-Bereich im Admin ergänzen.

Mindestens:

```text
System Dashboards
  Summary
```

Einstellungen:

```text
Ignored Entities
Media Titles anzeigen: ja/nein
```

Optional:

```text
Grouping: Category
```

Keine vollständige Regel-Engine im Admin.

---

# Entity-Auswahl für Ignore-Liste

Wenn Sprint 15/18 bereits Entity-Inventar besitzt, dieses wiederverwenden.

Keine neue direkte HA-Abfrage aus dem Admin-Browser.

---

# Feste Summary-Route

`/system/summary` darf nicht:

- gelöscht
- umbenannt
- dupliziert
- in normalen Dashboards gelistet
- als normales Rasterdashboard bearbeitet

werden.

---

# Navigation

Sprint 19 darf eine kompakte Navigation zu Summary ergänzen.

Bevorzugt:

- kleiner fester Link/Icon
- keine große Navigationsneugestaltung

Direkter URL-Aufruf bleibt Pflicht.

---

# Performance

Summary Engine soll über den in Sprint 18 vorhandenen gemeinsamen Snapshot
arbeiten.

Keine zusätzliche HA-Abfrage pro Domain.

Keine zusätzliche HA-Abfrage pro Summary Item.

---

# Große Installationen

Tests mindestens mit:

```text
1000 Entities
```

davon viele irrelevante numerische Sensoren.

Ziel:

- nur kleine Teilmenge wird Summary Item
- Browserantwort deutlich kleiner als Rohsnapshot
- Auswertung deterministisch
- Legacy-UI bleibt bedienbar

Optional:

```text
3000 Entities
```

wenn Testlauf praktikabel.

---

# Sicherheits- und Datenschutzfilter

Summary-Antworten dürfen nicht enthalten:

- HA Token
- Admin Token
- Authorization Header
- Service-Allowlists
- interne Config-Dateipfade
- Rohdiagnoseattribute
- vollständige Media-Metadaten ohne Bedarf

---

# Logging

Optional strukturierte Events:

```text
summary_build_started
summary_build_succeeded
summary_build_failed
summary_items_count
```

Keine sensiblen Entity-Attribute unnötig loggen.

---

# Fehlerverhalten

Summary Engine darf nicht das gesamte System-Dashboard zum Absturz bringen,
wenn eine einzelne Entity unvollständige Attribute besitzt.

Einzelne unbrauchbare Entity:

- ignorieren oder neutral behandeln
- optional backendseitig debugloggen
- keine Browser-Exception

---

# Tests – Aktivitätsregeln

Mindestens:

1. Light `on` erscheint
2. Light `off` erscheint nicht
3. Switch `on` erscheint
4. ignorierter Switch erscheint nicht
5. Window Binary Sensor `on` erscheint als open
6. Window Binary Sensor `off` erscheint nicht
7. Door `on` erscheint
8. Binary Sensor ohne relevante Device Class erscheint nicht
9. Cover `open` erscheint
10. Cover `opening` erscheint
11. Cover `closing` erscheint
12. Cover `closed` erscheint nicht
13. Vacuum `cleaning` erscheint
14. Vacuum `returning` erscheint
15. Vacuum `paused` erscheint
16. Vacuum `docked` erscheint nicht
17. Climate `hvac_action=heating` erscheint
18. Climate `hvac_action=cooling` erscheint
19. Climate `state=heat`, aber keine aktive Aktion erscheint nicht
20. Media Player `playing` erscheint
21. Media Player `idle` erscheint nicht
22. Fan `on` erscheint
23. Lock `unlocked` erscheint
24. Lock `locked` erscheint nicht
25. numerischer Temperatursensor erscheint nicht
26. numerischer Leistungssensor erscheint nicht
27. Motion erscheint standardmäßig nicht

---

# Tests – Unknown / Unavailable

28. `unavailable` erzeugt kein normales Summary Item
29. `unknown` erzeugt kein normales Summary Item
30. `unavailable` wird nicht als `off` behandelt
31. `unknown` wird nicht als `off` behandelt

---

# Tests – Dauer / Sortierung

32. `last_changed` erzeugt duration
33. Sortierung ist deterministisch
34. Security/Open stehen vor Powered
35. gleiche Priorität besitzt stabilen Tie-Breaker

---

# Tests – Ignore-Konfiguration

36. ignored Entity wird entfernt
37. nicht ignorierte Entity bleibt
38. unbekannte Ignore-ID verursacht keinen Fehler
39. Ignore-Konfiguration verändert keine Write-Allowlist

---

# Tests – API

40. Summary API liefert normalisierte Items
41. Summary API liefert keine Rohstates
42. Summary API liefert keine Secrets
43. Summary API liefert Stale-Meta
44. Empty State bei aktuellem erfolgreichen Snapshot
45. Offline ohne Snapshot klar markiert

---

# Tests – Admin

46. Summary Settings sichtbar
47. Ignore Entity kann ausgewählt werden
48. Ignore gespeichert
49. Reload behält Ignore
50. Media-Title-Option gespeichert
51. Admin-Änderung beeinflusst keine normalen Dashboards

---

# Tests – Legacy UI

52. `/system/summary` lädt
53. Loading State
54. aktive Gruppe sichtbar
55. leere Gruppen nicht sichtbar
56. Empty State korrekt
57. Stale State korrekt
58. Offline State korrekt
59. Recovery korrekt
60. kein `fetch`
61. kein `Promise`
62. ES5-kompatibel

---

# Tests – Regression

63. `/system/errors` aus Sprint 18 funktioniert weiterhin
64. User-Dashboards funktionieren
65. Admin funktioniert
66. Climate-Steuerung funktioniert
67. Light-Steuerung funktioniert
68. Grid aus Sprint 17.1 funktioniert
69. Write-Allowlists unverändert
70. HA-Token Backend-only

---

# Performance-Test

Mindestens:

```text
1000 Entities
```

mit Mischung aus:

- numerischen Sensoren
- Lights
- Switches
- Binary Sensors
- Climate
- Vacuum
- Media Player

Prüfen:

- Summary-Auswertung abgeschlossen
- nur relevante Items ausgegeben
- Payload deutlich reduziert
- keine HA-Abfrage pro Entity
- keine Browser-Rohstate-Flut

---

# Manuelle Abnahme – moderner Browser

Prüfen:

- Summary mit mehreren Kategorien
- Ignore-Konfiguration
- Empty State
- Stale
- Recovery
- lange Friendly Names
- Media Title an/aus

---

# Manuelle Abnahme – iPad mini

## Portrait

Prüfen:

- Header
- Kategorien
- lange Titel
- Dauer
- Icons
- Empty State
- Stale State
- Scrollen
- keine horizontalen Scrollbars

## Landscape

Dieselben Prüfungen.

---

# Große Listen

Wenn viele Items aktiv sind:

- Gruppen kompakt halten
- Browser nicht mit unnötiger Detailtiefe überladen
- keine komplexe Accordion-Logik in MVP erforderlich

Optional darf pro Gruppe ein einfaches Limit mit „weitere anzeigen“ eingeführt
werden, wenn dies für iOS 9 wirklich notwendig ist.

Nicht verpflichtend.

---

# Verhältnis zu Sprint 20

Sprint 19 beantwortet:

```text
Was ist gerade aktiv?
```

Sprint 20 beantwortet:

```text
Was funktioniert nicht?
```

Beispiele:

```text
Fenster offen
-> Summary

Fenstersensor unavailable
-> Error

Vacuum cleaning
-> Summary

Vacuum error
-> Error

Climate heating
-> Summary

Climate unavailable
-> Error
```

Diese Trennung ist verbindlich.

---

# Nicht-Ziele

Sprint 19 implementiert noch nicht:

- Repairs
- Config Entry Fehler
- Matter-Diagnose
- Registry-Enrichment
- Geräteaggregation mehrerer Entities
- Waschmaschine via Leistungsschwelle
- Mindestdauer
- Nachlaufzeit
- Debounce
- Flapping-Erkennung
- kombinierte Regeln
- Automationsanalyse
- Schnellaktionen
- neue Write-Endpunkte
- Home Assistant App
- HACS

---

# Dokumentation

Nach Umsetzung aktualisieren:

```text
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- Summary-Route
- unterstützte MVP-Domains
- Aktivitätsregeln
- Ignore-Konfiguration
- Stale-/Offline-Verhalten
- Abgrenzung zum Error Dashboard
- bekannte Einschränkungen

---

# Cache-Version

Wenn Legacy-Assets geändert werden:

- aktuellen Wert aus Repository lesen
- konsistent erhöhen
- keine historische Version annehmen

---

# Voraussichtlich betroffene Dateien

Codex muss den tatsächlichen Stand prüfen.

Voraussichtlich:

```text
src/services/summary/engine.js
src/services/summary/rules.js
src/services/system/
src/routes/system-dashboards.js

src/public/js/system/common.js
src/public/js/system/summary.js
src/public/css/

src/admin/
src/services/config-store.js

test/
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Keine unnötige Logik in `app.js` oder großen Routern anhäufen.

---

# Definition of Done

Sprint 19 ist abgeschlossen, wenn:

- `/system/summary` fachlich nutzbar ist
- aktive Lights erscheinen
- relevante Switches erscheinen
- offene Fenster/Türen erscheinen
- relevante Cover erscheinen
- aktive Vacuums erscheinen
- tatsächliche Climate-Aktivität erscheint
- Media Player `playing` erscheint
- Fan `on` erscheint
- relevante Lock-Zustände erscheinen
- numerische Sensoren nicht pauschal erscheinen
- Motion/Presence standardmäßig nicht erscheinen
- `unknown`/`unavailable` nicht als Aktivität erscheinen
- Ignore-Liste funktioniert
- Summary Items serverseitig normalisiert werden
- Browser keine Rohstates erhält
- Kategorien deterministisch sortiert werden
- Empty State korrekt ist
- HA-Ausfall nicht als Empty State dargestellt wird
- Stale-Daten sichtbar bleiben
- Recovery automatisch funktioniert
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- keine neuen Schreibaktionen existieren
- Write-Allowlists unverändert bleiben
- `/system/errors` nicht beschädigt wird
- User-Dashboards nicht beschädigt werden
- alle Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. tatsächlicher Sprint-17.1-/Sprint-18-Status
3. geänderte Dateien
4. finale Summary-Item-Struktur
5. unterstützte Domains
6. genaue Aktivitätsregeln
7. Kategorien und Prioritäten
8. Ignore-Konfiguration
9. Media-Title-Datenschutzverhalten
10. Stale-/Offline-Verhalten
11. Legacy-UI-Struktur
12. Admin-Settings
13. Testanzahl und Ergebnis
14. Performance-Test
15. Asset-Cache-Version
16. manuelle iPad-Prüfung
17. Regression `/system/errors`
18. verbleibende Einschränkungen
19. Voraussetzungen für Sprint 20
20. Commit-Vorschlag
21. Deploymentbefehle

---

# Codex-Prompt für Sprint 19

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-17.1.md
- docs/sprints/SPRINT-18.md
- docs/sprints/SPRINT-19.md
- ha-legacy-dashboard_brainstorming_externe_system-dashboards.md if present

Inspect the actual repository state first.

Verify that Sprint 18 provides the shared System Dashboard foundation and that
Sprint 17.1 has completed its grid/card responsiveness corrections.

Implement Sprint 19 exactly as specified in docs/sprints/SPRINT-19.md.

Goal:

Turn /system/summary into the first functional fixed dynamic Summary Dashboard.

Implement server-side activity rules for at least:

- light,
- switch,
- binary_sensor window/door/opening/garage_door,
- cover,
- vacuum,
- climate using actual hvac_action,
- media_player playing,
- fan,
- relevant lock states.

Do not treat generic numeric sensors as activity.

Do not show motion/presence by default yet.

Do not treat unavailable or unknown as normal Summary activity.

Use the shared Sprint 18 snapshot. Do not create a second Home Assistant polling
pipeline.

Normalize Summary Items server-side and send only reduced data to the legacy
browser.

Implement deterministic categories/priorities and a compact ES5-compatible
legacy Summary UI.

Implement at least an explicit ignored-entities configuration in the Admin UI.

Preserve stale data correctly:
Home Assistant offline must never be rendered as "no activities".

Preserve all existing Home Assistant security boundaries.

Do not add any new write endpoints, quick actions, generic services or
automatic write permissions.

Keep the wall-display frontend fully compatible with Safari on iOS 9 and
ECMAScript 5.

Do not implement Sprint 20 error classification, Repairs, Matter diagnostics,
registry enrichment, grace periods, device aggregation or automation impact
analysis.

Run the complete test suite and required syntax checks.

Manually verify /system/summary on the iPad mini in portrait and landscape.

Update docs/PROJECT_STATUS.md when finished.

At the end report:

- changed files,
- Summary Item schema,
- activity rules,
- categories/priorities,
- ignored-entity behavior,
- stale/offline behavior,
- test results,
- performance results,
- asset cache version,
- iPad verification,
- /system/errors regression,
- remaining limitations,
- exact prerequisites for Sprint 20.

Do not commit or push unless explicitly instructed.
```
