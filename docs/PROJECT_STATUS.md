# Projektstatus – HA Legacy Dashboard

Stand: 11. August 2026, nach Sprint 17.1 (Korrektursprint nach Sprint 18)

Dieser Bericht beschreibt den tatsächlich geprüften und produktiv
ausgerollten Stand. Er enthält keine Werte aus `.env`, keine
Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Commits und Arbeitsbaum

- Branch: `main`
- Sprint-17.1-Ausgangscommit: `a768bfe`
- Sprint-18-Implementierung: `94ce1c0 feat: add system dashboard foundation`
- Upstream: `origin/main`
- Zielbranch: `main`

Vor Sprint 18 wurde die tatsächliche Sprint-17-Implementierung geprüft. Das
persistente Schema 3, getrennte 3/6-Spalten-Raster, Drag-and-drop,
Resize, Kollisionserkennung, Admin UI und ES5-Wall-Renderer waren vorhanden.
Sprint 18 war mit festen Systemrouten, gemeinsamem Snapshot/Cache und
reduzierten read-only APIs vollständig vorhanden; der Ausgangslauf bestand
mit 92 von 92 Tests.

Laufzeitkonfigurationen unter `data/`, `.env`, Tokens und lokale
Browser-Testdaten sind nicht Bestandteil von Git.

## 2. Implementierte Sprints und Funktionen

| Sprint | Thema | Stand |
|---|---|---|
| 0–12 | Gateway, Widgets, Sicherheit, Betrieb und Release-Baseline | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistenz und Admin-API-Grundlage | umgesetzt |
| 15 | Grafische Admin-Konfiguration | umgesetzt |
| 16 | Konfigurierbare Kachelgrößen | umgesetzt |
| 17 | Persistentes Drag-and-Drop-Rasterlayout | umgesetzt |
| 18 | System Dashboard Foundation | umgesetzt |
| 17.1 | Grid Refinement + Responsive Card Content | umgesetzt nach Sprint 18 |

Die bestehenden Sensor-, Binary-, Light- und Climate-Widgets sowie alle
Benutzerdashboards bleiben unverändert nutzbar. Sprint 18 ergänzt zwei feste,
read-only System-Dashboards mit einer gemeinsamen Datengrundlage; die
vollständige Summary- und Issue-Fachlogik ist ausdrücklich noch nicht
implementiert.

Sprint 17.1 verfeinert ausschließlich die konfigurierbaren
Benutzerdashboards: Schema 4 verwendet 6 Spalten in Portrait und 12 Spalten in
Landscape. Sensor, Binary, Light und Climate reagieren intern mit den
Presentation Modes `compact`, `normal` und `expanded` auf ihre validierte
Geometrie. Die Sprint-18-System-Dashboard-Architektur blieb unverändert.

## 3. Dashboardklassen und Routing

Benutzerdashboards bleiben konfigurierbar und verwenden:

```text
/
/d/:dashboardId
```

Feste System-Dashboards verwenden:

```text
/system/summary
/system/errors
```

Die Systemrouten sind immer vorhanden, nicht löschbar, nicht Teil der
persistenten Dashboardkonfiguration und nicht im Rastereditor bearbeitbar.
Unbekannte Pfade unter `/system/...` liefern kontrolliert HTTP 404.

## 4. Collector- und Snapshot-Architektur

`src/services/system/collector.js` lädt alle Entity States serverseitig mit
einer einzigen Home-Assistant-Sammelabfrage. Der HA-Token bleibt dabei im
bestehenden Axios-Client des Gateways.

`src/services/system/snapshot.js` erzeugt ein normalisiertes internes Modell:

```json
{
  "version": 1,
  "collectedAt": "ISO-8601",
  "lastSuccessfulCollectionAt": "ISO-8601",
  "stale": false,
  "gateway": {"reachable": true},
  "homeAssistant": {"reachable": true},
  "sources": {"states": {"ok": true, "error": null}},
  "entities": [
    {
      "entityId": "sensor.example",
      "domain": "sensor",
      "state": "21.5",
      "attributes": {"friendlyName": "Example"},
      "lastChanged": "ISO-8601",
      "lastUpdated": "ISO-8601"
    }
  ]
}
```

Die interne Attribut-Allowlist ist auf Anzeigename, Device Class, Einheit,
Icon, HVAC-Aktion, Position, Medientitel/-typ und Batteriestand begrenzt.
Große oder unnötige Rohattribute, Authorization Header und Secrets werden
nicht übernommen. Entity-IDs, Domains und Zeitstempel werden normalisiert.

## 5. Cache und Stale-/Offline-Semantik

`src/services/system/cache.js` hält den Snapshot pro Node-Prozess im Speicher:

- TTL: 3000 ms
- parallele Sammlungen werden über einen gemeinsamen In-flight-Request
  dedupliziert
- Summary, Error und Status können denselben Snapshot verwenden
- nach Ablauf der TTL wird neu gesammelt
- der letzte erfolgreiche Snapshot bleibt separat erhalten
- ein späterer HA-Ausfall liefert dessen Entities mit `stale: true`
- ein Ausfall ohne vorherigen Erfolg liefert einen klaren Offlinezustand mit
  leerer interner Entityliste
- eine erfolgreiche Folgesammlung ersetzt den Stale-Snapshot automatisch

Der Cache ist bewusst keine Persistenz und geht beim Dienstneustart verloren.

## 6. System-Dashboard-API

Implementiert sind:

```text
GET /api/system-dashboards/status
GET /api/system-dashboards/summary
GET /api/system-dashboards/errors
```

Unbekannte System-Dashboard-APIs liefern HTTP 404 mit
`system_dashboard_not_found`. API-Antworten sind `no-store`.

Die Browserantwort enthält nur reduzierte Metadaten:

```text
gateway.reachable
home_assistant.reachable
stale
collected_at
last_successful_update
sources.states.ok/error
entity_count
```

Der Summary-Endpunkt ergänzt derzeit absichtlich `items: []`, der
Error-Endpunkt `issues: []`. Es gibt keinen Rohstate-Endpunkt.

## 7. Engine-Schnittstellen

- `src/services/summary/engine.js` stellt `buildSummary(snapshot)` bereit.
- `src/services/issues/engine.js` stellt `buildIssues(snapshot)` bereit.
- Die Router enthalten keine Normalisierung, Cachelogik oder fachlichen
  Summary-/Issue-Regeln.

Sprint 19 kann Aktivitätsregeln in der Summary Engine ergänzen. Sprint 20 kann
Issue-Klassifikation und Severity ergänzen, ohne Collector, Cache oder
Routing neu zu bauen.

## 8. Legacy-Frontend

`src/public/system.html` ist die gemeinsame feste Shell. Getrennte Dateien
unter `src/public/js/system/` übernehmen Polling und die routenspezifischen
Placeholder. Beide Ansichten zeigen:

- Loading- und definierten Empty-State
- Gateway-/HA-Verbindungsstatus
- Stale-/Offline-/Recovery-Hinweise
- letzten erfolgreichen Zeitpunkt
- Entityanzahl als technische Metadaten
- kompakte Navigation, Uhr, Datum und Theme-Umschaltung

Die Browserkommunikation verwendet ausschließlich `Legacy.http.get`. Das neue
Frontend verwendet ES5-Syntax, kein `fetch`, keine Promise, kein CSS Grid und
kein Flexbox-`gap`. Die Asset-Cache-Version wurde konsistent von 19 auf 20
erhöht. Sprint 17.1 erhöht sie für alle Wall- und System-Shell-Referenzen auf
22.

Der Benutzerdashboard-Renderer leitet Presentation Modes aus Widgettyp, `w`
und `h` ab. Kleine Sensor-/Binary-Karten reduzieren Titelblöcke zugunsten der
Kernwerte, Light behält einen eigenständigen Schalter, Climate zeigt Ist- und
Solltemperatur sowie zentrierte Plus-/Minus-Tasten. Die interaktiven Compact-
Controls bleiben mindestens ungefähr 44×44 Pixel groß. Entscheidungen werden
pro Profil und Geometriesignatur gecacht, sodass reine State-Refreshes keine
unnötige Neuberechnung auslösen; Rotation wendet das andere Profil ohne neuen
State-Abruf an.

## 9. Sicherheitsgrenzen

Die System-Dashboards sind vollständig read-only. Es wurden keine Services,
Schreibendpunkte oder automatischen Berechtigungen ergänzt. Die bestehenden
Write-Allowlists in `src/routes/api.js` blieben unverändert:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

System-Dashboard-Sichtbarkeit und Snapshot-Inhalt erzeugen keine
Schreibberechtigung. HA-Token, Admin-Token, Authorization Header, Rohstates,
Write-Allowlists und beliebige Attribute werden nicht an den Browser
übertragen oder in neue Logs geschrieben. Admin API und Admin UI bleiben
unverändert getrennt und standardmäßig deaktiviert.

## 10. Persistenz und Admin UI

Die persistente Konfiguration verwendet nun Schema 4. Schema 3 wird
deterministisch genau einmal migriert: `x` und `w` werden verdoppelt, `y` und
`h` bleiben unverändert. Schema 1/2 werden über die bestehende
Migrationsarchitektur direkt auf gültige 6/12-Profile gehoben. Atomare
Persistenz und `.bak` bleiben unverändert.

Size Presets bleiben persistente Initial-/Fallbackgrößen (`2×1`, `3×1`,
`6×1`, `3×2`, `6×2`). Presentation Modes sind davon getrennt und werden nicht
gespeichert. Backend und Admin erzwingen dieselben Mindestgrößen: Sensor,
Binary und Light jeweils 2×1; Climate 2×1 in Portrait und 3×1 in Landscape.
Der Admin-Editor snappt und resized auf dem feineren Raster, prüft Bounds und
Kollisionen und verhindert Verkleinerungen unter das Minimum. Die festen
System-Dashboards bleiben außerhalb dieser Konfiguration.

## 11. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Feste Seitenrouten | `src/server.js`, `src/public/system.html` |
| System-API | `src/routes/system-dashboards.js`, `src/routes/api.js` |
| Collector | `src/services/system/collector.js`, `src/services/homeassistant.js` |
| Snapshot und Filter | `src/services/system/snapshot.js` |
| Cache und Singleton | `src/services/system/cache.js`, `src/services/system/index.js` |
| Engine-Schnittstellen | `src/services/summary/engine.js`, `src/services/issues/engine.js` |
| Legacy-Systemfrontend | `src/public/js/system/*.js`, `src/public/css/system.css` |
| Cache-Version | `src/public/index.html`, `src/public/system.html`, `src/public/manifest.json` |
| Sprint-18-Tests | `test/system-foundation.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js` |
| Bestehende Konfiguration | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Bestehende Admin UI | `src/admin/`, `src/routes/admin.js` |
| Raster und Migration | `src/services/layout.js`, `src/config/dashboard.js` |
| Legacy-Presentation | `src/public/js/core/layout.js`, `src/public/css/style.css`, `src/public/js/widgets/*.js` |
| Admin-Raster | `src/admin/js/layout.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Sprint-17.1-Tests | `test/layout.test.js`, `test/legacy-layout.test.js`, `test/admin-ui.test.js`, `test/dashboard-persistence.test.js` |

## 12. Tests und manuelle Abnahme

Der vollständige lokale und produktive Testlauf besteht mit 99 von 99 Tests.
Alle Integrationstests verwenden nur localhost Mock-Home-Assistant-Dienste und
Fake-Credentials. Alle JavaScriptdateien unter `src/` und `test/` bestehen
`node --check`; `git diff --check` ist sauber.

Sprint 18 testet insbesondere:

- Sammelabfrage, leere State-Liste und Attributfilter
- keine Tokens oder Rohstates in Antworten und Logs
- TTL, Cache-Hit, parallele Deduplizierung und Erneuerung
- Stale nach Erfolg, Offline ohne Erfolg und Recovery
- gemeinsame Snapshotnutzung durch Summary, Error und Status
- feste Routen, kontrollierte 404 und unveränderte Hauptseiten
- ES5-, `Legacy.http`- und CSS-Kompatibilität
- deterministische Normalisierung von 3000 Entities
- Browserpayload kleiner als 2 KB im Foundation-Zustand

Sprint 17.1 ergänzt insbesondere:

- exakte und deterministische Schema-3-Migration für Portrait und Landscape
- unveränderte IDs sowie unveränderte `y`/`h`-Werte
- keine Doppel-Migration und persistenter Neustart
- 6/12-Spalten-Autoplacement, Bounds, Kollisionen und typabhängige Minima
- feines Drag-/Resize-Snapping im Admin-Entwurf
- Compact/Normal/Expanded-Ableitung bei Rotation
- keine Presentation-Neuberechnung bei unveränderter State-Geometrie
- sichtbare Kerninformationen und 44×44-Climate-Touchflächen
- unveränderte Summary-/Error-Systemrouten und Security-Grenzen

Im modernen Browser wurden `/system/summary`, `/system/errors` und die
Benutzerdashboard-Layouts bei 768×1024 und 1024×768 geprüft. Die kleinsten
erlaubten Karten und der Profilwechsel wurden dabei als Viewport-Näherung
kontrolliert.

Eine echte automatisierte Safari-iOS-9-Laufzeit steht weiterhin nicht zur
Verfügung. Der reale iPad-Test erfolgt nach dem produktiven Rollout durch den
Projektbetreiber; ES5- und CSS-Verbote sind zusätzlich statisch abgesichert.

## 13. Produktionsstand

Sprint 17.1 wurde nach Commit und Push über das bestehende Fast-forward-
Deployment im LXC ausgerollt. Das Skript führte dort Syntaxprüfungen und den
vollständigen Testlauf aus und startete `ha-legacy-dashboard.service` neu.
Laufzeitdaten und das migrierte `data/dashboards.json` bleiben außerhalb von
Git; die Schema-3-Vorgängerversion wird beim ersten Start als `.bak` bewahrt.

Produktiv verifiziert:

- `/system/summary`: HTTP 200
- `/system/errors`: HTTP 200
- unbekannte Systemroute: HTTP 404
- alle drei System-APIs: HTTP 200
- Benutzerdashboard-Konfiguration: Schema 4 mit 6/12-Spalten-Profilen
- gemeinsamer erfolgreicher Snapshot und Cache-Hits für unmittelbar folgende
  Summary-/Error-Abfragen
- produktiver Git-Arbeitsbaum auf `main...origin/main`

## 14. Bekannte Einschränkungen und technische Schulden

- Summary enthält noch keine Aktivitätsregeln; dies ist Sprint 19.
- Error enthält noch keine `unknown`-/`unavailable`-Klassifikation oder
  Severity; dies ist Sprint 20.
- Der Snapshot verwendet bisher nur `/api/states`; Registry-, Device-, Area-,
  Config-Entry- und Repairs-Daten folgen frühestens ab Sprint 21.
- Der In-Memory-Cache ist pro Prozess und geht bei Neustart verloren.
- Der Recovery-Hinweis ist bewusst transient bis zum nächsten Poll.
- Keine automatisierte echte Safari-/iOS-9-Ausführung.
- Feste Legacy-Zeilenhöhen und fehlender paralleler Admin-Konfliktschutz
  bleiben bestehen; das horizontale Raster ist nun feiner, aber weiterhin
  bewusst endlich und validiert.

Im geprüften Sprint-17.1-Umfang ist kein funktionaler Defekt bekannt. Eine
automatisierte echte Safari-iOS-9-Abnahme steht technisch weiterhin nicht zur
Verfügung.

## 15. Roadmap-Abgleich und nächster Sprint

Sprint 18 entspricht weiterhin der Spezifikation: feste getrennte Routen, gemeinsamer
Collector, normalisierter Snapshot, kurzer Cache, Stale-Erhalt,
Summary-/Issue-Schnittstellen, reduzierte read-only APIs, Legacy-Shells,
großer Performance-Test und unveränderte Sicherheitsgrenzen sind umgesetzt.

Bewusst nicht umgesetzt wurden die vollständige Summary- und Error-Fachlogik,
Registry-Anreicherung, Diagnostik, Grace Periods, Geräteaggregation,
Schnellaktionen, Reparaturaktionen, Packaging und HACS.

Empfohlener nächster Schritt ist Sprint 19 – Summary Dashboard MVP. Er kann
direkt auf `snapshot.entities`, `buildSummary(snapshot)`, dem gemeinsamen
3-Sekunden-Cache, der bestehenden Summary-API und der Legacy-Shell aufbauen.
Vor Beginn müssen die genauen read-only Aktivitätsregeln, Ausschlüsse,
Gruppierung und Begrenzung der Browserpayload gemäß Sprint-19-Spezifikation
umgesetzt und getestet werden. Die Issue Engine bleibt bis Sprint 20 minimal.
