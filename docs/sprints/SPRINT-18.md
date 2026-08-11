# Sprint 18 – System Dashboard Foundation

## Status

Completed

## Zweck

Sprint 18 schafft die gemeinsame technische Grundlage für die beiden festen,
dynamischen System-Dashboards:

```text
/system/summary
/system/errors
```

Dieser Sprint implementiert noch **nicht** die vollständige Fachlogik des
Summary-Dashboards und noch **nicht** die vollständige Fehler-/Diagnoselogik.

Der Schwerpunkt liegt auf:

- Routing,
- gemeinsamer Datenbeschaffung,
- normalisiertem System-Snapshot,
- serverseitiger Zwischenspeicherung,
- reduzierten Gateway-Antworten,
- Stale-/Offline-Semantik,
- sauberer Trennung von Summary- und Issue-Engine,
- Legacy-kompatibler Frontend-Shell,
- Tests und Erweiterbarkeit.

---

# Verbindliche Grundsätze

## Bestehende Sicherheitsgrenzen erhalten

Verbindlich:

- Home-Assistant-Token ausschließlich im Backend
- kein HA-Token im Browser
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische Home-Assistant-Service-API
- keine automatischen Schreibrechte durch Sichtbarkeit
- bestehende Climate-/Light-/sonstige Write-Allowlists bleiben unverändert
- System-Dashboards sind in Sprint 18 read-only
- keine Reparatur-, Reload- oder Reauthentifizierungsaktionen
- keine Schnellaktionen
- bestehende Rate Limits, Payload Limits, Security Header und Secret Redaction bleiben erhalten

Kurzform:

```text
System-Dashboard sichtbar
        !=
Schreibberechtigung
```

## Legacy-Kompatibilität erhalten

Das Wall-Display muss weiterhin funktionieren auf:

- Apple iPad mini 1
- iOS 9.3.5
- Safari unter iOS 9
- ECMAScript 5

Im Legacy-Frontend weiterhin nicht verwenden:

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

Browserkommunikation weiterhin über die vorhandene
`Legacy.http`-/`XMLHttpRequest`-Kompatibilitätsschicht.

---

# Ausgangslage

Vor Sprint 18 existieren beziehungsweise sind bis dahin vorgesehen:

- mehrere Benutzerdashboards unter `/d/:dashboardId`
- persistente Dashboard-Konfiguration
- Admin-API
- Admin-UI
- konfigurierbare Kachelgrößen
- Drag-and-drop-Rasterlayout
- bestehende Stale-Data-/Reconnect-Logik
- Home-Assistant-Zugriff ausschließlich über das Gateway
- lokale Mock-Integrationstests

Codex muss vor Beginn den tatsächlichen Stand des Repositories prüfen.

Insbesondere:

```bash
git status
git log --oneline -15
```

und lesen:

```text
AGENTS.md
README.md
docs/CODEX_HANDOFF.md
docs/SPRINT_ROADMAP.md
docs/PROJECT_STATUS.md
docs/sprints/SPRINT-17.md
docs/sprints/SPRINT-18.md
```

---

# Zielarchitektur

```text
Home Assistant
      |
      v
System State Collector
      |
      v
Normalized System Snapshot
      |
      +------------------------+
      |                        |
      v                        v
Summary Engine             Issue Engine
      |                        |
      v                        v
Summary API                Error API
      |                        |
      v                        v
/system/summary            /system/errors
```

Sprint 18 implementiert:

- Collector
- Snapshot
- Cache-/Stale-Semantik
- Engine-Schnittstellen
- API-Shells
- Routing
- Frontend-Shells
- Tests

Sprint 19 implementiert die eigentliche Summary-Logik.

Sprint 20 implementiert die eigentliche Error-/Issue-Logik.

---

# Neue feste System-Routen

Mindestens:

```text
/system/summary
/system/errors
```

Eigenschaften:

- immer vorhanden
- nicht löschbar
- nicht Teil normaler Benutzerdashboards
- nicht über Dashboard-Slugs verwaltet
- nicht über den normalen Rastereditor editierbar
- eigene feste technische Identität

Unbekannte Systemroute:

```text
/system/does-not-exist
```

muss kontrolliert 404 liefern.

---

# API-Grundlage

Bevorzugte neue Endpunkte:

```text
GET /api/system-dashboards/summary
GET /api/system-dashboards/errors
GET /api/system-dashboards/status
```

Optional:

```text
GET /api/system-dashboards/config
```

nur wenn dies zur bestehenden Konfigurationsarchitektur sauber passt.

Die exakten Namen dürfen an die bestehende API-Struktur angepasst werden,
solange die Trennung klar bleibt.

---

# System State Collector

## Ziel

Home-Assistant-Zustände für beide System-Dashboards gemeinsam erfassen.

Nicht:

```text
Summary ruft HA separat ab
Error ruft HA separat ab
```

sondern:

```text
ein Collector
ein Snapshot
mehrere Auswerter
```

---

# Datenquelle im MVP

Sprint 18 soll nur Datenquellen verwenden, die im bestehenden Projekt bereits
sicher und stabil verfügbar sind.

Mindestens:

- Home-Assistant Entity States
- Gateway-/HA-Erreichbarkeit
- Zeitstempel
- bestehende Metadaten, sofern bereits sicher vorhanden

Noch nicht verpflichtend:

- Entity Registry
- Device Registry
- Area Registry
- Config Entries
- Repairs
- Matter-spezifische Diagnosedaten
- Automationsanalyse

Diese folgen ab Sprint 21.

---

# Sammelabfrage

Wenn der bestehende Home-Assistant-Service heute einzelne States gezielt
abfragt, soll Codex prüfen, ob für die System-Dashboards eine sichere
Sammelabfrage sinnvoll und bereits unterstützt ist.

Bevorzugt für System-Dashboards:

```text
GET /api/states
```

oder eine bestehende äquivalente Sammelfunktion.

Wichtig:

- nur serverseitig
- HA-Token bleibt Backend
- Antwort wird nicht roh an den Browser weitergereicht
- Snapshot wird serverseitig reduziert/normalisiert

---

# Normalized System Snapshot

## Ziel

Ein gemeinsames internes Modell, das unabhängig von der späteren Darstellung
ist.

Konzeptuell:

```javascript
{
    collectedAt: "...",
    homeAssistant: {
        reachable: true
    },
    gateway: {
        reachable: true
    },
    stale: false,
    lastSuccessfulCollectionAt: "...",
    entities: [
        {
            entityId: "light.wohnzimmer",
            domain: "light",
            state: "on",
            attributes: {
                friendlyName: "Wohnzimmer"
            },
            lastChanged: "...",
            lastUpdated: "..."
        }
    ]
}
```

Die konkrete Struktur darf an bestehende Projektkonventionen angepasst werden.

---

# Snapshot-Anforderungen

Der Snapshot soll:

- keine Tokens enthalten
- keine Authorization Header enthalten
- keine internen Secrets enthalten
- nur benötigte Attribute übernehmen
- bekannte große/unwichtige Attribute reduzieren
- einheitliche Feldnamen verwenden
- Zeitstempel normalisieren
- Domain aus `entity_id` ableiten
- Entity-State und relevante Attribute getrennt halten
- unveränderlich oder defensiv kopiert behandelt werden, wenn sinnvoll

---

# Attributfilterung

Sprint 18 soll keine komplette rohe HA-State-Antwort im Browser verfügbar
machen.

Im internen Snapshot dürfen mehr Daten verbleiben als in der Browserantwort,
aber auch dort soll unnötige Datenmenge vermieden werden.

Mindestens bevorzugt übernehmen:

```text
friendly_name
device_class
unit_of_measurement
icon
hvac_action
current_position
media_title
media_content_type
battery_level
```

Nur soweit vorhanden und sinnvoll.

Codex darf die genaue Allowlist kleiner halten.

---

# Keine Rohdaten-Passthroughs

Nicht zulässig:

```text
GET /api/system-dashboards/raw-ha-state
```

oder vergleichbare Endpunkte.

Browser erhält nur fachlich reduzierte System-Dashboard-Daten.

---

# Snapshot Cache

## Ziel

Summary und Error sollen möglichst denselben Snapshot nutzen.

Ein einfacher serverseitiger In-Memory-Cache ist ausreichend.

Konzept:

```text
lastSnapshot
lastSuccessfulSnapshot
lastCollectionAttempt
lastSuccessfulCollection
```

---

# Cache-Verhalten

Bevorzugt:

- Snapshot innerhalb eines kurzen Zeitfensters wiederverwenden
- parallele Requests zusammenführen, wenn sinnvoll
- HA nicht unnötig mehrfach gleichzeitig abfragen
- Cache nicht als dauerhafte Datenbank missbrauchen

Beispielhafte TTL:

```text
1–5 Sekunden
```

Codex soll einen sinnvollen Wert anhand des bestehenden Refresh-Intervalls
wählen.

---

# Parallel Requests

Wenn `/system/summary` und `/system/errors` nahezu gleichzeitig geladen
werden, sollen sie möglichst denselben aktuellen Snapshot verwenden.

Optional sinnvoll:

```text
in-flight request deduplication
```

Keine Pflicht, wenn die bestehende Architektur dies unnötig kompliziert macht.

---

# Stale Data

Verbindliche Semantik:

```text
keine neuen HA-Daten
!=
leerer Zustand
```

Bei HA-Ausfall:

- letzten erfolgreichen Snapshot behalten
- `stale: true`
- letzten erfolgreichen Zeitpunkt ausgeben
- aktuellen Verbindungsfehler markieren
- keine falsche Aussage „keine Probleme“
- keine falsche Aussage „keine Aktivitäten“

---

# Vollständiger HA-Ausfall

Beispielhafte Systemstatusantwort:

```json
{
  "reachable": false,
  "stale": true,
  "last_successful_update": "2026-08-11T18:00:00Z"
}
```

Die genaue Feldbenennung soll zum Projektstil passen.

---

# Teilfehler

Falls einzelne Datenquellen später fehlschlagen, soll das Snapshotmodell bereits
erweiterbar sein.

Beispiel:

```json
{
  "sources": {
    "states": {
      "ok": true
    },
    "entity_registry": {
      "ok": false,
      "error": "not_available"
    }
  }
}
```

Sprint 18 muss noch nicht alle Quellen implementieren.

Es soll aber vermeiden, das Datenmodell so eng zu bauen, dass spätere
Teilquellen nicht sauber ergänzt werden können.

---

# Summary Engine Interface

Sprint 18 implementiert noch nicht die vollständige Aktivitätslogik.

Es soll aber eine klare Schnittstelle schaffen.

Beispiel:

```text
buildSummary(snapshot, config)
```

Rückgabe im Sprint 18 darf minimal sein.

Beispiel:

```json
{
  "items": [],
  "meta": {
    "stale": false
  }
}
```

Die eigentliche Domain-/Device-Class-Logik folgt Sprint 19.

---

# Issue Engine Interface

Sprint 18 implementiert noch nicht die vollständige Fehlerklassifikation.

Es soll aber eine klare Schnittstelle schaffen.

Beispiel:

```text
buildIssues(snapshot, config)
```

Rückgabe im Sprint 18 darf minimal sein.

Beispiel:

```json
{
  "issues": [],
  "meta": {
    "stale": false
  }
}
```

Die fachliche Auswertung von `unavailable`, `unknown`, Severity usw. folgt
Sprint 20.

---

# Keine Business-Logik im Router

Router sollen nur:

- Parameter prüfen
- Service aufrufen
- Antwort senden
- Fehler mappen

Nicht:

- Summary-Regeln enthalten
- Issue-Regeln enthalten
- State-Normalisierung enthalten
- Snapshotcache selbst verwalten

---

# Bevorzugte Modulstruktur

Nur als Orientierung:

```text
src/services/system/
    collector.js
    snapshot.js
    cache.js

src/services/summary/
    engine.js

src/services/issues/
    engine.js

src/routes/system-dashboards.js
```

Codex darf bestehende Struktur beibehalten, wenn sie klarer ist.

Wichtig:

- keine weitere Aufblähung von `src/routes/api.js`
- keine weitere Aufblähung von `src/public/js/app.js`

---

# Frontend-Shell

Sprint 18 soll beide festen Routen mit einer einfachen, funktionsfähigen
Legacy-Shell ausstatten.

## `/system/summary`

Anzeige mindestens:

```text
Summary
Daten werden geladen …
```

danach:

```text
Noch keine Summary-Regeln aktiviert.
```

oder ein äquivalenter definierter Placeholder.

## `/system/errors`

Anzeige mindestens:

```text
Systemstatus
Daten werden geladen …
```

danach:

```text
Noch keine Fehlerauswertung aktiviert.
```

---

# Frontend-Dateien

Bevorzugte Trennung:

```text
src/public/js/system/
    common.js
    summary.js
    errors.js
```

oder äquivalente klare Struktur.

Keine Integration der kompletten System-Dashboard-Logik in die bestehende
monolithische `app.js`.

---

# Gemeinsame System-Frontend-Logik

Mögliche gemeinsame Funktionen:

- Polling
- Stale-Anzeige
- HA-Erreichbarkeit
- Gatewaystatus
- letzter erfolgreicher Refresh
- Fehlerbanner
- Uhr/Datum, falls wiederverwendet
- Empty-/Loading-State

---

# Polling

Bestehendes Polling-Modell beibehalten.

Kein direkter Browser-WebSocket zu Home Assistant.

System-Dashboards fragen ausschließlich Gateway-Endpunkte ab.

---

# System-Dashboard-Konfiguration

Sprint 18 darf bereits einen eigenen Konfigurationsbereich im bestehenden
persistenten Schema vorbereiten.

Beispiel:

```json
{
  "systemDashboards": {
    "summary": {
      "enabled": true
    },
    "errors": {
      "enabled": true
    }
  }
}
```

Wichtig:

- feste Dashboards selbst bleiben nicht löschbar
- `enabled` darf nur verwendet werden, wenn die Produktentscheidung das
  Abschalten einzelner Ansichten wirklich vorsieht
- bevorzugt sind beide immer verfügbar

---

# Keine freie Rasterkonfiguration

Die System-Dashboards verwenden nicht:

```text
x
y
w
h
```

aus dem normalen Dashboard-Rastereditor.

Sie besitzen ein festes, speziell für ihren Zweck optimiertes Layout.

---

# Navigation

Sprint 18 soll prüfen, wie die festen System-Dashboards sinnvoll erreichbar
werden.

Mindestens:

Direkt per URL:

```text
/system/summary
/system/errors
```

Optional:

- kompakter Link in bestehender Navigation
- Systembereich im Admin

Keine große Navigationsneugestaltung in diesem Sprint.

---

# Admin UI

Sprint 18 muss noch keine vollständigen System-Dashboard-Einstellungen bauen.

Optional erlaubt:

ein read-only Bereich:

```text
System Dashboards
- Summary
- Fehler
```

mit Links.

Konfigurierbare Summary-/Error-Regeln folgen später.

---

# Performance

## Anforderungen

- keine HA-Abfrage pro sichtbarem Summary-/Error-Eintrag
- Sammelabfrage bevorzugen
- Snapshot wiederverwenden
- Browser-Payload klein halten
- DOM zunächst klein halten
- keine unnötigen Animationen

---

# Große Installationen

Sprint 18 soll mit großen State-Listen umgehen können.

Mindestens Test mit simuliert:

```text
1000+ Entities
```

Bevorzugt zusätzlich:

```text
3000+ Entities
```

Ziel:

- Snapshotbildung ohne extreme Verzögerung
- Browser erhält noch keine vollständige Entityliste
- keine Rohdatenantwort von mehreren MB an Legacy-Gerät

---

# Logging

Neue Logs sollen strukturiert bleiben.

Sinnvolle Events:

```text
system_snapshot_collection_started
system_snapshot_collection_succeeded
system_snapshot_collection_failed
system_snapshot_cache_hit
system_snapshot_cache_stale
```

Nur wenn dies zum bestehenden Loggingstil passt.

Keine Token-/Secret-Ausgabe.

---

# Fehlercodes

Bevorzugte kontrollierte Fehlercodes:

```text
system_snapshot_unavailable
home_assistant_unavailable
system_dashboard_not_found
```

Keine Stacktraces im Browser.

---

# Tests – Collector

Mindestens:

1. Collector lädt Entity States über lokalen Mock
2. HA-Token wird nur zum Mock-HA gesendet
3. Token erscheint nicht in Gateway-Antworten
4. Token erscheint nicht in Logs
5. State-Domain wird korrekt normalisiert
6. relevante Attribute werden übernommen
7. unnötige Attribute werden nicht öffentlich durchgereicht
8. leere HA-State-Liste wird kontrolliert behandelt

---

# Tests – Snapshot Cache

9. erster Request erzeugt Snapshot
10. zweiter Request innerhalb TTL nutzt Snapshot wieder
11. Snapshot nach TTL wird erneuert
12. Summary und Error können denselben Snapshot verwenden
13. erfolgreicher Snapshot wird als `lastSuccessfulSnapshot` gehalten
14. HA-Ausfall nach Erfolg liefert Stale-Daten
15. HA-Ausfall ohne vorherigen Erfolg liefert klaren Offlinezustand
16. Wiederherstellung ersetzt Stale-Snapshot

---

# Tests – API

17. `/api/system-dashboards/status` funktioniert
18. Summary-Endpunkt funktioniert
19. Error-Endpunkt funktioniert
20. unbekannte System-Dashboard-API kontrolliert 404
21. API enthält keine Write-Allowlists
22. API enthält keine Admin-Tokens
23. API enthält keine HA-Tokens
24. API-Antworten erhalten passende `Cache-Control`-Regeln

---

# Tests – Routing

25. `/system/summary` liefert System-Shell
26. `/system/errors` liefert System-Shell
27. unbekannte `/system/...` Route liefert 404
28. normale `/d/:dashboardId` Routen bleiben unverändert
29. `/admin` bleibt unverändert
30. `/` bleibt unverändert

---

# Tests – Legacy Frontend

31. Summary-Shell verwendet ES5-kompatibles JS
32. Error-Shell verwendet ES5-kompatibles JS
33. kein `fetch`
34. kein `Promise`
35. Polling nutzt bestehende HTTP-Kompatibilität
36. Stale-Zustand sichtbar
37. Offline-Zustand sichtbar
38. Recovery sichtbar

---

# Tests – Performance

39. 1000 Entities können normalisiert werden
40. Browserantwort enthält nicht ungefiltert alle 1000 Rohstates
41. Snapshotbildung bleibt deterministisch
42. keine doppelte HA-Abfrage bei unmittelbar aufeinanderfolgenden Summary-/Error-Requests, sofern Cache aktiv

---

# Regression

Der komplette bestehende Testsatz muss grün bleiben.

Codex muss die tatsächliche Testzahl vor Änderungen ermitteln.

Keine historische Testzahl voraussetzen.

---

# Manuelle Abnahme

## Moderner Browser

Prüfen:

```text
/system/summary
/system/errors
```

- Loading State
- normaler Onlinezustand
- HA-Ausfall
- Stale-Anzeige
- Recovery
- keine kaputte Navigation

## iPad mini / iOS 9

Prüfen:

- `/system/summary`
- `/system/errors`
- Portrait
- Landscape
- Light Mode
- Dark Mode
- Polling
- Stale-Anzeige
- Offline-Anzeige
- Recovery
- kein JS-Fehler

---

# Cache-Version

Wenn Legacy-HTML, CSS oder JS geändert wird:

- aktuelle Asset-Cache-Version aus Repository lesen
- konsistent erhöhen
- keine historischen Werte voraussetzen

---

# Dokumentation

Nach Sprint 18 aktualisieren:

```text
README.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- feste System-Dashboard-Routen
- Snapshot-Grundlage
- read-only Charakter
- Stale-/Offline-Semantik
- Abgrenzung zu normalen Dashboards
- Abgrenzung zu Sprint 19/20

---

# Nicht-Ziele

Sprint 18 implementiert ausdrücklich noch nicht:

- vollständige Summary-Regeln
- Light-/Switch-/Cover-/Vacuum-/Climate-Aktivitätsauswertung
- vollständige `unavailable`-/`unknown`-Fehlerklassifikation
- Security-Entity-Priorisierung
- Repairs
- Config Entries
- Matter-Diagnostik
- Entity Registry
- Device Registry
- Area Registry
- Automationsanalyse
- Grace Periods
- Ignore Rules
- Device Aggregation
- Schnellaktionen
- Integration Reload
- Reparaturaktionen
- Home Assistant App Packaging
- HACS

---

# Definition of Done

Sprint 18 ist abgeschlossen, wenn:

- `/system/summary` vorhanden ist
- `/system/errors` vorhanden ist
- beide Routen nicht löschbar sind
- beide Routen nicht Teil des normalen Dashboard-Rasters sind
- ein gemeinsamer System-State-Collector existiert
- ein normalisierter Snapshot existiert
- Snapshot-Caching existiert
- Stale-Daten bei HA-Ausfall erhalten bleiben
- ein gemeinsamer Snapshot von Summary und Error nutzbar ist
- Summary-Engine-Schnittstelle existiert
- Issue-Engine-Schnittstelle existiert
- beide Gateway-Endpunkte reduzierte Daten liefern
- keine Rohstates ungefiltert an den Browser gehen
- keine neuen Schreibaktionen existieren
- bestehende Write-Allowlists unverändert bleiben
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- bestehende User-Dashboards unverändert funktionieren
- Admin-UI unverändert funktioniert
- alle bisherigen Tests grün bleiben
- neue System-Dashboard-Foundation-Tests grün sind
- `docs/PROJECT_STATUS.md` aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. Startcommit
2. geprüfter Sprint-17-Status
3. geänderte Dateien
4. neue Routen
5. neue API-Endpunkte
6. Collector-Architektur
7. Snapshot-Datenmodell
8. Cache-Verhalten
9. Stale-/Offline-Verhalten
10. Summary-Engine-Schnittstelle
11. Issue-Engine-Schnittstelle
12. Legacy-Frontend-Struktur
13. Testanzahl und Ergebnis
14. Performance-Test
15. Asset-Cache-Version
16. manuelle iPad-Prüfung
17. technische Schulden
18. Voraussetzungen für Sprint 19
19. Commit-Vorschlag
20. Deploymentbefehle

---

# Codex-Prompt für Sprint 18

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-17.md
- docs/sprints/SPRINT-18.md
- ha-legacy-dashboard_brainstorming_externe_system-dashboards.md if present in the repository

Inspect the actual repository state and verify the completed Sprint 17
implementation before changing anything.

Implement Sprint 18 exactly as specified in docs/sprints/SPRINT-18.md.

Goal:

Create the common technical foundation for two fixed dynamic system
dashboards:

- /system/summary
- /system/errors

Implement:

- fixed system routes,
- a shared Home Assistant state collector,
- a normalized internal system snapshot,
- short-lived server-side snapshot caching,
- stale-data retention,
- shared snapshot use between summary and error,
- minimal Summary Engine interface,
- minimal Issue Engine interface,
- reduced read-only system dashboard APIs,
- ES5-compatible legacy frontend shells,
- isolated tests,
- large-entity-count performance tests.

Do not implement the full Summary or Error business logic yet.

Do not implement:

- Repairs,
- Config Entry diagnostics,
- Matter diagnostics,
- registry enrichment,
- grace periods,
- device aggregation,
- automation impact analysis,
- repair/reload actions,
- quick actions,
- Home Assistant App packaging,
- HACS support.

Preserve all existing Home Assistant security boundaries.

Do not expose the Home Assistant token, Admin token, write allowlists or raw
Home Assistant state payloads to the browser.

Do not add any new write capability.

Keep the wall-display frontend fully compatible with Safari on iOS 9 and
ECMAScript 5.

Use only localhost mock Home Assistant services and fake credentials for
integration tests.

Run the complete test suite and all required syntax checks.

Manually verify /system/summary and /system/errors in modern browsers and on
the iPad mini in portrait and landscape.

Update docs/PROJECT_STATUS.md when finished.

At the end report:

- changed files,
- collector architecture,
- normalized snapshot schema,
- cache TTL and behavior,
- stale/offline behavior,
- system dashboard routes and APIs,
- test results,
- performance results,
- cache version,
- remaining limitations,
- exact prerequisites for Sprint 19.

Do not commit or push unless explicitly instructed.
```
