# Projektstatus – HA Legacy Dashboard

Stand: 11. August 2026, Sprint 20 implementiert

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-20-Ausgangscommit: `62c823c`
- Upstream vor Implementierung: `origin/main`
- Sprint-19-Commit: `b4da718`
- Sprint-18-Commit: `94ce1c0`
- Sprint-17.1-Commit: `53ce672`

Der Ausgangsarbeitsbaum war sauber und der vollständige Baseline-Testlauf
bestand mit 115 von 115 Tests. Die tatsächlichen Sprint-17.2-, Sprint-18- und
Sprint-19-Implementierungen einschließlich Layout-/Theme-Korrekturen,
System-Snapshot, Cache und Summary wurden vor Sprint 20 geprüft.

## 2. Implementierte Sprints und Funktionen

| Sprint | Thema | Stand |
|---|---|---|
| 0–12 | Gateway, Widgets, Sicherheit, Betrieb und Release-Baseline | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistenz und geschützte Admin API | umgesetzt |
| 15 | Grafische Admin-Konfiguration | umgesetzt |
| 16 | Konfigurierbare Kachelgrößen | umgesetzt |
| 17 | Persistentes Drag-and-Drop-Rasterlayout | umgesetzt |
| 18 | System Dashboard Foundation | umgesetzt |
| 17.1 | 6/12-Raster und responsive Karteninhalte | umgesetzt |
| 19 | Summary Dashboard MVP | umgesetzt |
| 17.2 | Kartenidentität, proportionale Geometrie und Theme-Persistenz | umgesetzt |
| 20 | Error Dashboard MVP | umgesetzt |

Benutzerdashboards unterstützen weiterhin Sensor-, Binary-, Light- und
Climate-Widgets, mehrere persistente Profile, feste URLs, fünf Größenpresets,
getrennte Portrait-/Landscape-Layouts und einen modernen Admin-Editor. Die
Legacy-Ausgabe bleibt ES5-/iOS-9-kompatibel.

## 3. Summary Dashboard MVP

`/system/summary` beantwortet jetzt die Frage, was im Haus gerade aktiv, offen,
eingeschaltet oder in Bewegung ist. Die serverseitigen Regeln erkennen:

- `light` und `switch` bei `on`
- relevante `binary_sensor` Device Classes `window`, `door`, `opening` und
  `garage_door` bei `on`
- `cover` bei `open`, `opening` oder `closing`
- `vacuum` bei `cleaning`, `returning` oder `paused`
- `climate` nur bei tatsächlicher `hvac_action` `heating`, `cooling`, `drying`
  oder `fan`
- `media_player` bei `playing`
- `fan` bei `on`
- `lock` bei `unlocked`, `unlocking` oder `locking`
- relevante aktive Zustände von `alarm_control_panel`

Numerische Sensoren, Bewegung/Präsenz ohne eigene Sprint-19-Regel sowie
`unknown` und `unavailable` erscheinen nicht. Switches können über eine
explizite Ignorierliste ausgeblendet werden; es gibt keine unsichere
Namensheuristik.

## 4. Kategorien, Sortierung und Payload

Die Prioritäten sind fest und deterministisch:

```text
security 100
open      90
running   80
cleaning  80
climate   70
media     60
powered   50
movement  40
other     10
```

Innerhalb der API werden Einträge nach Priorität, Kategorie, Dauer, Titel und
Entity-ID sortiert. Gruppen ohne Einträge fehlen. Ein Eintrag enthält nur die
für die Anzeige nötigen Felder: stabile ID, Entity-IDs, Kategorie, Priorität,
Titel, Zustand, Startzeit, Dauer, festes Icon, Beschreibung und die Domain.
Medientitel fehlen standardmäßig vollständig und werden nur nach explizitem
Admin-Opt-in ergänzt.

## 4a. Error Dashboard MVP

`/system/errors` beantwortet getrennt von Summary die Frage, welche Entities
aktuell nicht funktionieren. Nur die States `unavailable` und `unknown`
erzeugen im MVP Issues; beide bleiben in API und UI unterscheidbar.

Die zentrale Severity-Regel lautet:

```text
normal unavailable  -> warning
normal unknown      -> info
security unavailable -> critical
security unknown     -> error
```

Security-Relevanz entsteht ausschließlich durch die explizite persistente
Admin-Konfiguration. Bekannte Device Classes wie `smoke`, `gas` oder
`moisture` sind nur ein Hinweis und erhöhen die Severity nicht selbständig.
Ignorierte Entities erscheinen nicht in der aktiven Fehlerliste.

Issues enthalten ausschließlich normalisierte Anzeigefelder: ID, Quelle,
Severity, aktiven Status, Titel, Kurzbeschreibung, Entity-ID, State,
Security-Flag, Start-/Updatezeit, Dauer, Domain und soweit vorhanden Device
Class. Titel folgen Widget-Konfiguration, Friendly Name und Entity-ID. Die
Sortierung ist Critical, Error, Warning, Info, danach Security, Dauer, Titel
und Entity-ID.

## 5. Collector, Cache und Ausfallsemantik

Sprint 19 verwendet unverändert den gemeinsamen Sprint-18-Pfad:

```text
Home Assistant -> Collector -> normalisierter Snapshot -> 3-s-Cache
                                                   -> Summary Engine
                                                   -> Issue Engine
```

Es gibt keine zusätzliche Home-Assistant-Abfrage pro Summary-Aufruf. Parallel
angeforderte Systemansichten teilen denselben In-flight-Request und Cache.
Nach einem HA-Ausfall bleiben Aktivitäten aus dem letzten erfolgreichen
Snapshot sichtbar und sind als stale gekennzeichnet. Ohne vorherigen Erfolg
zeigt das Legacy-Frontend offline und nicht fälschlich „keine Aktivitäten“.
Nach Recovery ersetzt ein frischer Snapshot die veralteten Daten.

## 6. Persistente Konfiguration

Die Konfiguration verwendet Schema 6. Zusätzlich zu
`defaultDashboardId` und `dashboards` enthält sie:

```json
{
  "systemDashboards": {
    "summary": {
      "ignoredEntities": [],
      "showMediaTitles": false
    },
    "errors": {
      "securityEntities": [],
      "ignoredEntities": []
    }
  }
}
```

Schema 1 bis 5 werden automatisch und atomar auf Schema 6 migriert. Bei Schema
4 bleiben die 6/12-Spalten-Layouts unverändert. Bei Schema 5 bleiben Summary
und Layouts unverändert und die leeren Error-Standardwerte werden ergänzt.
Vollständige Validierung, atomarer
Dateiersatz und genau ein `.bak` bleiben erhalten. Ungültige Entity-IDs,
Duplikate oder ein nicht-boolesches Privacy-Flag werden abgelehnt, ohne die
letzte gültige Datei zu ersetzen.

## 7. Admin UI

Die moderne, Bearer-geschützte Admin UI besitzt einen eigenen Bereich
„System-Dashboards“. Dort können Summary und Fehler geöffnet, Entities aus dem
bereits sanitisierten Admin-Inventar als sicherheitsrelevant markiert oder für
Errors beziehungsweise Summary ignoriert und die Anzeige von Medientiteln
ausdrücklich aktiviert werden. Die Änderungen laufen wie alle
anderen Konfigurationsänderungen über Entwurf, Speichern, Schema-Validierung,
Rate Limit und atomare Persistenz.

Die Systemansicht selbst fragt keine Entity-Inventar- oder HA-API direkt ab.
Die Admin API bleibt standardmäßig deaktiviert.

## 8. Legacy-Frontend und Sprint 17.2

Die Summary zeigt einen kompakten Aktivzähler und nur nichtleere
Kategoriegruppen mit festem Inline-SVG, Titel, Kurzbeschreibung und Dauer.
Stale-, Offline- und Recovery-Hinweise bleiben sichtbar. Lange Namen werden
ohne horizontales Überlaufen behandelt; Portrait und Landscape verwenden
Flexbox und normale Blocklayouts.

Errors zeigt Gesamtstatus, Counts für alle vier Severities und beide States
sowie nur nichtleere Gruppen. Jede Zeile enthält sichtbaren Severity-Text und
Symbol, Titel, Entity-ID, State und Dauer. OK erscheint ausschließlich bei
einem frischen erfolgreichen Snapshot ohne Issues. Bei stale/offline bleiben
letzte Issues sichtbar; ohne vorherigen Erfolg steht der Status auf unbekannt.
Die API-Counts bleiben vollständig; das Legacy-Frontend begrenzt nur den DOM
auf die 200 höchstpriorisierten Zeilen und weist auf weitere Issues hin.

Alle Compact Cards besitzen nun eine sichtbare, einzeilige `card-identity`.
Die Fallback-Reihenfolge ist: expliziter Widgettitel, konfigurierter
Kurztext/Raum (`subtitle`), Home-Assistant-`friendly_name`, Entity-ID. Sensor
behält Wert und Identität, Binary Zustand und Identität, Light Zustand,
Identität und Control, Climate Identität, Ist, Soll sowie Minus und Plus.
Lange Identitäten werden mit Ellipsis gekürzt und nicht pauschal versteckt.

Die früheren starren Zeilenhöhen von 260px im Portrait und 240px im Landscape
sind entfernt. Die zentrale Formel lautet:

```text
columnWidth = containerWidth / columns
rowHeight = max(round(columnWidth * 0.9), 128)
effectiveCardSize = rasterSize - 20px gutter
```

Presentation Modes berücksichtigen jetzt Widgettyp, `w`/`h` und die effektive
Pixelbreite/-höhe. Geometrie und Presentation Mode werden pro Profil und
relevanter Breite gecacht; State-Polls lösen keine unnötige Neuberechnung aus.
Resize und Orientation Change wenden die passende Geometrie erneut an.

Die bestehende Theme-Persistenz verwendet weiterhin ausschließlich den Key
`ha-legacy-theme`. Das externe Theme-Skript läuft nun im Dokumentkopf und
setzt die gespeicherte Klasse früh auf das Root-Element; nach Aufbau des Bodys
werden Root, Body und Toggle synchronisiert. Storage-Zugriffe bleiben in
`try/catch`. `/`, `/d/:dashboardId`, `/system/summary` und `/system/errors`
übernehmen dieselbe Light-/Dark-Auswahl nach Reload. CSP wurde nicht gelockert.

Alle Dateien unter `src/public/js/` bleiben ECMAScript 5. Das Wall-Display
verwendet weiterhin `Legacy.http.get`, kein `fetch`, keine Promise, kein CSS
Grid, kein Flexbox-`gap` und keine CSS-Custom-Property-Abhängigkeit. Die
Assetversion ist 25.

## 9. Sicherheitsgrenzen

Sprint 20 ist vollständig read-only. Es wurden keine HA-Services, Schreib-
Endpoints oder automatischen Berechtigungen ergänzt. Die bestehenden
Write-Allowlists in `src/routes/api.js` bleiben getrennt:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

Summary-/Error-Erkennung, Security-/Ignorierlisten, Dashboard-Sichtbarkeit und Admin-Inventar
erteilen keinerlei Schreibrecht. HA-Token und Admin-Token bleiben serverseitig
und werden weder an Wall-Display noch Summary ausgeliefert oder geloggt.

## 10. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Regeln und Engines | `src/services/summary/rules.js`, `src/services/summary/engine.js`, `src/services/issues/engine.js`, `src/services/issues/severity.js` |
| Snapshot und Cache | `src/services/system/snapshot.js`, `src/services/system/cache.js`, `src/services/system/index.js` |
| System-API | `src/routes/system-dashboards.js` |
| Schema/Persistenz | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Legacy-Systemansichten | `src/public/system.html`, `src/public/js/system/common.js`, `src/public/js/system/summary.js`, `src/public/js/system/errors.js`, `src/public/css/system.css` |
| Sprint-17.2-Layout | `src/public/js/core/layout.js`, `src/public/js/core/widget.js`, `src/public/css/style.css` |
| Sprint-17.2-Widgets | `src/public/js/widgets/sensor.js`, `src/public/js/widgets/binary.js`, `src/public/js/widgets/light.js`, `src/public/js/widgets/climate.js` |
| Theme | `src/public/js/core/theme.js`, `src/public/index.html`, `src/public/system.html` |
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/issues.test.js`, `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/summary.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js` |

## 11. Tests

Der vollständige Lauf verwendet ausschließlich localhost Mock-Home-Assistant-
Dienste und Fake-Credentials. Abgedeckt sind insbesondere:

- alle positiven und negativen Sprint-19-Regeln
- getrennte unavailable-/unknown-Klassifikation und alle vier Severities
- Security-/Ignore-Konfiguration, Schema-5-auf-6-Migration und Reload
- Statuslogik für OK, Warning, Error, Critical, stale, offline und Recovery
- Dauer, deterministische Sortierung, fehlende Attribute und Datenreduktion
- Climate nur nach `hvac_action`
- ignorierte Entities und Medientitel-Privacy
- deterministische Priorisierung, Gruppierung und Dauer
- Stale-Datenerhalt, Offline und Recovery
- gemeinsamer Cache ohne zusätzliche HA-Abfragen
- Schema-1-bis-5-auf-6-Migration und Einstellungsvalidierung
- Admin-Entwurf und geschützte Persistenz
- unveränderte Write-Allowlists
- ES5- und CSS-Verbote der Legacy-Oberfläche
- Compact-Identity-Contract und vollständige Inhalte aller vier Widgets
- proportionale, gutter-aware und gecachte Rastergeometrie
- flächenabhängige Presentation Modes und Orientation Change
- Dark-/Light-Persistenz, Reload und sichere Storage-Fehler
- 1000-Entity-Issue-Lauf, 1500 aktive Summary-Entities und 3000 normalisierte Entities

Der abschließende lokale Lauf besteht mit 127 von 127 Tests. Alle
JavaScriptdateien unter `src/` und `test/` bestehen `node --check`;
`git diff --check` ist sauber. Die Browser-Abnahme bei 768×1024 und 1024×768
prüfte die kleinsten erlaubten Sensor-, Binary-, Light- und Climate-Karten.
Alle Identitäten und Pflichtinhalte waren sichtbar, alle Karten ohne
horizontalen oder vertikalen Überlauf, die Seiten ohne horizontalen Überlauf
und die Browserkonsole fehlerfrei. Rotation wechselte ohne Daten-Reload von
Portrait zu Landscape. Dark und Light blieben jeweils nach Reload erhalten;
Dark wurde außerdem auf `/d/esszimmer`, `/system/summary` und
`/system/errors` bestätigt. Die echte Safari-iOS-9-Abnahme erfolgt nach dem
Produktions-Rollout auf dem iPad.

## 12. Bekannte Einschränkungen und technischer Rest

- Registry-, Device-, Area-, Config-Entry- und Repairs-Anreicherung folgen
  frühestens in Sprint 21.
- Grace Periods, erwartete Offlinezustände, Flapping und Aggregation folgen
  Sprint 22; kurze Ausfälle erscheinen im MVP daher sofort.
- Es gibt noch keine Issue-Historie oder Acknowledgements.
- Switch-Ausschlüsse sind absichtlich explizit statt heuristisch; die
  Ersteinrichtung kann daher eine kurze Admin-Auswahl erfordern.
- Der Snapshot-Cache ist pro Node-Prozess und geht beim Neustart verloren.
- Eine automatisierte echte Safari-iOS-9-Laufzeit steht nicht zur Verfügung;
  ES5-/CSS-Regeln und iPad-Abmessungen sind automatisiert geprüft, der reale
  iPad-Praxistest bleibt nach dem Rollout erforderlich.

## 13. Roadmap-Abgleich und nächster Sprint

Sprint 20 füllt ausschließlich die vorhandene Issue Engine und erweitert die
versionierte System-Dashboard-Konfiguration. Summary-Regeln, Drag/Resize,
Theme und Write-Allowlists bleiben unverändert. Nicht vorgezogen wurden
Registry-/Repairs-Daten, Grace Periods, Historie, weitere Schreibdomänen oder
freie System-Dashboard-Layouts.

Empfohlener nächster Schritt ist Sprint 21 – Registry & Diagnostic Enrichment.
Er beginnt mit einer Capability-Prüfung der tatsächlich eingesetzten Home-
Assistant-Version und ergänzt nur stabile, sicher reduzierbare Diagnosequellen.
