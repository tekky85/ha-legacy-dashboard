# Projektstatus – HA Legacy Dashboard

Stand: 16. August 2026, Sprint 21 zur Prüfung vorbereitet

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-21-Ausgangscommit: `f8f3d3a`
- Sprint-D1-Ausgangscommit: `0881705`
- Sprint-17.3-Ausgangscommit: `11ff013`
- Upstream vor Implementierung: `origin/main`
- Sprint-20-Feature-Commit: `fe38e60`
- Sprint-19-Commit: `b4da718`
- Sprint-18-Commit: `94ce1c0`
- Sprint-17.1-Commit: `53ce672`

Der Arbeitsbaum enthält den noch uncommitteten Sprint-D1-Dokumentationsstand
und die darauf aufbauende Sprint-21-Implementierung. Es wurde nichts
committet oder gepusht. Die bestehende Dashboard-Konfiguration und die
Write-Allowlists wurden nicht verändert.

Der tatsächliche Sprint-20-Stand einschließlich Summary-/Error-APIs,
System-Snapshot, Cache, Layout-/Theme-Korrekturen und produktiver Assetversion
26 wurde vor Sprint 17.3 geprüft. Im Arbeitsbaum lag bereits eine begonnene,
noch nicht committete Sprint-17.3-Implementierung; sie wurde vollständig gegen
die Spezifikation geprüft, korrigiert und vervollständigt.

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
| 17.3 | Live Card Preview, Unified Controls und Focus Mode | umgesetzt |
| D1 | Zweisprachige Dokumentation und Screenshot-Baseline | zur Prüfung vorbereitet |
| 21 | Registry & Diagnostic Enrichment | zur Prüfung vorbereitet |

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
Assetversion ist 29.

## 8a. Sprint 17.3 – Preview, Controls und Focus

Der Admin-Layouteditor lädt alle aktuellen Preview-Zustände gebündelt über
`GET /api/admin/preview`. Der Endpunkt ist durch dieselbe standardmäßig
deaktivierte Bearer-Authentifizierung wie die übrige Admin API geschützt und
liefert ausschließlich Entity-ID, Domain, Friendly Name, Device Class,
Einheit, State sowie die wenigen normalisierten Climate-Werte. Rohattribute,
Tokens, Dienste und Write-Allowlists fehlen. Der Editor aktualisiert die Daten
alle 15 Sekunden; Drag und Resize rendern lokal und erzeugen keine HA-Abfrage
pro Frame. Controls in der Preview sind immer deaktiviert.

`src/public/js/core/presentation.js` enthält die gemeinsamen reinen Regeln für
Identität, Rastergeometrie und Presentation Mode. Admin und Legacy verwenden
diese Regeln; eine große Renderer-Neuschreibung war nicht nötig. Der Editor
zeigt Sensor, Binary, Light und Climate mit aktuellem Inhalt und unterstützt
Portrait/Landscape sowie eine unabhängige Hell-/Dunkel-Vorschau.

Light verwendet jetzt den gemeinsamen dashboard-eigenen Power-Button aus
`src/public/js/controls/power.js`; Markup und CSS des alten iOS-Switches werden
nicht mehr verwendet. Climate erhält denselben Power-Button zusätzlich zu
Minus/Plus. Der enge Endpunkt `POST /api/climate/power` akzeptiert nur eine
allowlist-geprüfte Climate-Entity und den Intent `on` oder `off`. Ausschalten
ruft intern ausschließlich `climate.set_hvac_mode` mit `off` auf. Einschalten
ist nur möglich, wenn genau ein Nicht-Off-Modus existiert oder für die bereits
freigegebene Esszimmer-Entity der explizite Modus `heat` in den gemeldeten
Modi enthalten ist. Capability-Flags werden ausschließlich serverseitig aus
dem aktuellen HA-State erzeugt. Das Write-Rate-Limit greift vor dem HA-Zugriff.

Ein Tap auf eine nicht interaktive Card-Fläche öffnet genau eine temporäre
Focus Card als `position: fixed`-Overlay. Sie klont die bereits gerenderte
Card, verwendet dadurch dieselben aktuellen Daten und startet keine zweite
Pollingpipeline. Close-Button und Tap auf den Hintergrund schließen; das
persistente Grid bleibt unverändert. Button-Taps stoppen die Weiterleitung und
öffnen Focus nicht zusätzlich. Bei stale, offline, `unknown` oder
`unavailable` werden die Controls deaktiviert.

Compact Climate zeigt entsprechend dem Sprint-17.3-Contract Identität,
Isttemperatur und – sofern sicher erlaubt – Power. Solltemperatur und Stepper
bleiben in Normal/Expanded sowie vollständig im Focus sichtbar; so ragen die
44-Pixel-Controls auch im kleinsten 3×1-Landscape-Layout nicht aus der Card.

## 9. Sicherheitsgrenzen

Sprint 17.3 ergänzt als einzige Schreibfunktion den engen Climate-Power-Pfad;
es gibt weiterhin keinen generischen Service-Proxy und keine automatische
Berechtigung. Die bestehenden Write-Allowlists in `src/routes/api.js` bleiben
getrennt und inhaltlich unverändert:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

Summary-/Error-Erkennung, Security-/Ignorierlisten, Dashboard-Sichtbarkeit,
Admin-Inventar, Preview und Focus erteilen keinerlei Schreibrecht. HA-Token
und Admin-Token bleiben serverseitig und werden weder an Wall-Display noch
Systemansichten ausgeliefert oder geloggt.

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
| Gemeinsame Presentation-Regeln | `src/public/js/core/presentation.js`, `src/public/js/core/layout.js`, `src/public/js/core/widget.js` |
| Unified Controls und Focus | `src/public/js/controls/power.js`, `src/public/js/focus/focus.js`, `src/public/js/app.js`, `src/public/css/style.css` |
| Climate Power | `src/services/climate-power.js`, `src/routes/api.js` |
| Admin Live Preview | `src/routes/admin.js`, `src/admin/js/api.js`, `src/admin/js/state.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Theme | `src/public/js/core/theme.js`, `src/public/index.html`, `src/public/system.html` |
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/sprint-17-3.test.js`, `test/issues.test.js`, `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/summary.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js` |

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
- sanitisierte Admin-Batch-Preview ohne Tokens, Rohattribute oder Allowlists
- gemeinsame Presentation-Regeln für Admin und Legacy
- deaktivierte Preview-Controls und Focus ohne zusätzliche Pollingpipeline
- dashboard-native Light Controls einschließlich Busy/Unavailable
- Climate Power On/Off, Allowlist, Domain, State, HA-Fehler und Rate Limit
- eindeutiger beziehungsweise explizit konfigurierter Power-On-Modus
- Focus-Overlay, einzelner Focus und getrennte Card-/Control-Events
- 1000-Entity-Issue-Lauf, 1500 aktive Summary-Entities und 3000 normalisierte Entities
- WebSocket-Authentifizierung, Request-Korrelation, Timeouts, Disconnect,
  begrenzter Reconnect sowie synchrone Konstruktor-/Sendefehler
- getrennte Registry-/Config-/Repairs-Capabilities, TTL, In-flight-Deduplizierung,
  Stale-Fallback, Recovery und vollständiger WebSocket-Ausfall
- Registry-Sanitization, Single-Config-Entry-Modell, Legacy-Fallback,
  Area-Priorität, Disabled/Hidden/Registry-only und Config-/Repair-Issues
- 3000 Entities, 500 Devices, 50 Areas, 100 Config Entries und 100 Repairs

Der abschließende vollständige Lauf besteht mit 150 von 150 Tests. Der isolierte
Sprint-21-Satz besteht mit 15 von 15 Tests; sein größter Synthetikfall mit 3000
Entities, 500 Devices, 50 Areas, 100 Config Entries und 100 Repairs benötigte
36 ms. Alle JavaScriptdateien unter `src/` und `test/` bestehen `node --check`;
`git diff --check` ist sauber.

Die Browser-Abnahme an der real laufenden Anwendung mit kontrolliertem
localhost-HA-Mock und Fake-Credentials bestätigte Light und Dark,
768×1024 und 1024×768 ohne horizontalen Überlauf, Summary-Enrichment,
vier Issue-Typen mit reduziertem Kontext, fünf verfügbare Diagnosequellen,
Matter `unsupported`, Offline-Stale-Fallback und Recovery. Die Browserkonsole
blieb fehlerfrei. `summary.png` und `errors.png` wurden neu aufgenommen;
`system-diagnostics.png` wurde ergänzt. Die echte Safari-iOS-9-Abnahme erfolgt
nach einem später freigegebenen Produktions-Rollout auf dem iPad.

## 12. Bekannte Einschränkungen und technischer Rest

- Matter besitzt aktuell keine belastbar belegte generische Read-only-
  Diagnose-API und wird daher ohne Command-Probe als `unsupported` gemeldet.
- Grace Periods, erwartete Offlinezustände, Flapping und Aggregation folgen
  Sprint 22; kurze Ausfälle erscheinen im MVP daher sofort.
- Es gibt noch keine Issue-Historie oder Acknowledgements.
- Switch-Ausschlüsse sind absichtlich explizit statt heuristisch; die
  Ersteinrichtung kann daher eine kurze Admin-Auswahl erfordern.
- Der Snapshot-Cache ist pro Node-Prozess und geht beim Neustart verloren.
- Eine automatisierte echte Safari-iOS-9-Laufzeit steht nicht zur Verfügung;
  ES5-/CSS-Regeln und iPad-Abmessungen sind automatisiert geprüft, der reale
  iPad-Praxistest bleibt nach dem Rollout erforderlich.
- Die Admin-Preview teilt Presentation-Regeln und Inhalte mit dem Wall-Display,
  verwendet aber bewusst keinen vollständigen zweiten Legacy-DOM-Renderer.
- Focus ist temporär und wird weder in der Dashboardkonfiguration noch im
  Browser gespeichert.

## 13. Roadmap-Abgleich und nächster Sprint

Sprint 21 entspricht der Roadmap: Der REST-State-Collector bleibt bestehen,
während fest codierte Backend-WebSocket-Adapter ausschließlich read-only
Metadaten ergänzen. Die sichtbaren Summary-/Error-Regeln wurden nur um sicheren
Kontext, Kategorie-Filter und klar belegte Config-/Repair-Issues erweitert.
Nicht vorgezogen wurden Grace Periods, Flapping, Device-Aggregation, Historie,
weitere Schreibdomänen oder freie System-Dashboard-Layouts.

Empfohlener nächster Schritt ist Sprint 22 – Rules, Grace Periods & Device
Aggregation. Voraussetzung sind reale Betriebsbeobachtungen zu kurzzeitigen
Ausfällen, erwarteten Offline-Zuständen und sinnvollen Karenzzeiten; Sprint 21
liefert dafür jetzt den stabilen Device-/Area-/Integrationskontext.

## 14. Dokumentation und Screenshot-Baseline

Die kompakte Root-README verlinkt die vollständigen deutschen und englischen
Versionen. `README.de.md` und `README.en.md` sind semantisch synchron und
dokumentieren Architektur, Legacy-Kompatibilität, Funktionen, Admin- und
Systemansichten, Sicherheitsmodell, Entwicklung, Tests, Deployment und
Roadmap ohne schnell veraltende Testzahlen oder Commit-IDs.

Die Screenshot-Baseline umfasst Light Mode, Dark Mode, Compact Cards, Focus
Card, Dashboard-Verwaltung, Layout-Editor, Live Preview, diagnostische Quellen,
Summary und Systemstatus. Alle Aufnahmen stammen aus der real laufenden
Anwendung mit einem kontrollierten localhost Home-Assistant-Mock und
Fake-Credentials. Vor der Ablage wurden sie auf Tokens, interne IP-Adressen,
private Namen, sicherheitskritische Entity-Namen, Medien- und Standortdaten
geprüft.

`AGENTS.md` verlangt künftig bei sichtbaren UI-Änderungen eine Prüfung der
Screenshots und README-Bildverweise, hält die semantische Synchronität beider
Sprachversionen fest und verbietet generierte Mockups als Produkt-Screenshots.

## 15. Sprint 21 – Registry & Diagnostic Enrichment

Der Sprint-18-State-Collector bleibt unverändert REST-basiert. Zusätzlich
existiert ausschließlich im Backend ein authentifizierter Home-Assistant-
WebSocket-Client mit eindeutigen Request-IDs, Request-/Connect-Timeouts,
kontrolliertem Disconnect und auf fünf Versuche begrenztem exponentiellem
Reconnect-Backoff. Die eingebaute WebSocket-Implementierung setzt Node.js 22
oder neuer voraus; die Mindestversion ist in `package.json` festgehalten.

Fest codierte interne Read-only-Adapter verwenden genau diese Commands:

```text
config/entity_registry/list
config/device_registry/list
config/area_registry/list
config_entries/get
repairs/list_issues
```

Unbekannte Commands werden als `unsupported` behandelt. Für Matter ist keine
belastbar belegte generische Read-only-Diagnose-API vorhanden; deshalb bleibt
die Capability kontrolliert `false`, ohne einen Matter-Command zu senden.

Entity-, Device- und Area Registry werden 60 Sekunden, Config Entries und
Repairs 30 Sekunden gecacht. Parallele Aktualisierungen teilen denselben
In-flight-Request. Jede Quelle führt `supported`, `ok`, `stale`,
`lastSuccessfulAt` und `errorCode`; ein Fehler einer Quelle zerstört weder
andere Enrichments noch den REST-State-Snapshot.

Die Enrichment-Maps sind nach Entity-, Device-, Area- und Config-Entry-ID
indiziert. Area-Auflösung priorisiert Entity Area vor Device Area und verwendet
keine Namensheuristik. Device-Namen priorisieren `name_by_user` vor `name` und
Friendly Name. Das aktuelle Single-Config-Entry-/Subentry-Modell wird direkt
verarbeitet; ältere Array-Antworten erhalten einen defensiven eindeutigen
Fallback.

Browser-Payloads enthalten ausschließlich benötigte Kontextfelder wie Device-
und Area-Name, Integration, Plattform und Entity Category. MAC-Adressen,
Seriennummern, Identifier, Connections, Registry-Rohdaten und Zugangsdaten
werden nicht öffentlich normalisiert. Diagnostic-/Config-Entities stören
Summary nicht. Disabled Entities erzeugen keine unavailable-Issues;
registry-only wird nicht automatisch als verwaist bewertet.

`setup_error`, `migration_error` und `failed_unload` erzeugen Config-Entry-
Issues mit Severity Error; `setup_retry` wird als Warning behandelt. Loaded,
unbekannte States und deaktivierte Config Entries erzeugen kein Issue. Repairs
werden mit Critical/Error/Warning beziehungsweise defensiv Info normalisiert;
`fixable` zeigt nur „In Home Assistant reparierbar“ und bietet keine Aktion.

Der geschützte Read-only-Endpunkt
`GET /api/admin/system-diagnostics/status` liefert ausschließlich Source-
Status, Capabilities und TTLs. Es gibt keine Raw-Registry-, WebSocket-Proxy-,
Repair-, Reload-, Reauth-, Registry- oder Matter-Schreibroute. Climate- und
Light-Allowlists bleiben unverändert.
