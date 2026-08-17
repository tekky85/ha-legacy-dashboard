# Projektstatus – HA Legacy Dashboard

Stand: 17. August 2026, Sprint 17.6 auf Basis von Sprint 21.2 implementiert;
physische Safari-Geräteabnahme nach Rollout ausstehend

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-17.6-Ausgangscommit: `5a95f3d`
- Sprint-21.2-Ausgangscommit: `7cacfb0`
- Sprint-21.1-Ausgangscommit: `6ab4e93`
- Sprint-17.5-Ausgangscommit: `251309d`
- Sprint-17.4-Ausgangscommit: `ce91dcb`
- Sprint-21-Commit: `a441880`
- Sprint-21-Ausgangscommit: `f8f3d3a`
- Sprint-D1-Ausgangscommit: `0881705`
- Sprint-17.3-Ausgangscommit: `11ff013`
- Upstream vor Implementierung: `origin/main`
- Sprint-20-Feature-Commit: `fe38e60`
- Sprint-19-Commit: `b4da718`
- Sprint-18-Commit: `94ce1c0`
- Sprint-17.1-Commit: `53ce672`

Die Sprint-17.6-Implementierung baut auf dem vollständig ausgerollten
Sprint-21.2-Stand und der getrennten Sprint-17.5-Focus-Architektur auf. Die bestehende
Dashboard-Konfiguration, Summary-/Error-Fachlogik und die Write-Allowlists
wurden nicht verändert.

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
| 17.4 | Focus Overlay Layout Stabilization | umgesetzt |
| 17.5 | Native Focus Renderer und Mobile-Safari-Stabilisierung | umgesetzt |
| 17.6 | Power Control Alignment und SVG-Stabilisierung | umgesetzt |
| D1 | Zweisprachige Dokumentation und Screenshot-Baseline | umgesetzt |
| 21 | Registry & Diagnostic Enrichment | umgesetzt |
| 21.1 | Error Dashboard Device Aggregation & Navigation | umgesetzt |
| 21.2 | System Dashboard Filters, Column Views & Risk Severity | umgesetzt |

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

Sprint 21.2 ergänzt eine Filterdefinition direkt im serverseitigen Summary-
Payload. Alle, Offen, Licht & Strom, Aktiv, Klima, Medien und Sicherheit
verwenden ausschließlich die bereits normalisierten Sprint-19-Kategorien;
der Browser ordnet keine Entities fachlich neu ein. Filter wechseln ohne
Reload und ohne HA-Abfrage. Ein leerer Teilfilter zeigt „Keine passenden
aktiven Zustände“, während Stale-/Offline-Hinweise unverändert sichtbar
bleiben.

## 4a. Error Dashboard MVP

`/system/errors` beantwortet getrennt von Summary die Frage, welche Entities
aktuell nicht funktionieren. Nur die States `unavailable` und `unknown`
erzeugen im MVP Issues; beide bleiben in API und UI unterscheidbar.

Die zentrale Severity-Regel lautet jetzt:

```text
normal unavailable  -> warning
normal unknown      -> info
safety/security unavailable -> critical
safety/security unknown     -> critical
```

Eine zentrale Risk Class unterscheidet `safety`, `security`, `normal` und
`diagnostic`. Sie nutzt ausschließlich normalisierte Domain-, Device-Class-
und Registry-Metadaten. Smoke, CO, Gas, Moisture/Water sowie Door, Window,
Opening, Garage Door und Lock werden bei `unknown` oder `unavailable` als
Critical bewertet. Normale und diagnostische Entities behalten die bisherigen
milderen Regeln; Entity-Name und Entity-ID sind keine Klassifikationsquelle.
Explizite `securityEntities` bleiben vorrangig und werden ebenfalls für beide
Ausfallstates Critical. Ignorierte Entities erscheinen nicht in der aktiven
Fehlerliste.

Issues enthalten ausschließlich normalisierte Anzeigefelder: ID, Quelle,
Severity, aktiven Status, Titel, Kurzbeschreibung, Entity-ID, State,
Security-Flag, Start-/Updatezeit, Dauer, Domain und soweit vorhanden Device
Class. Titel folgen Widget-Konfiguration, Friendly Name und Entity-ID. Die
Sortierung ist Critical, Error, Warning, Info, danach Security, Dauer, Titel
und Entity-ID.

Sprint 21.1 setzt auf dieses unveränderte Engine-Ergebnis eine separate
Presentation-Schicht. Entity-Issues werden nur dann zu einer Device Card
zusammengefasst, wenn der Sprint-21-Snapshot für sie dieselbe echte
`device_id` enthält. Gleiche Namen, Räume, Domains oder Integrationen sind
keine Gruppierungsquelle. Device Cards zeigen die höchste Child-Severity, ein
propagiertes Security-Flag, die älteste aktive Child-Dauer, Issue-Counts sowie
Device Name, Raum und Integration. Entities ohne Device-ID und alle
Config-Entry-, Repair-, Matter- und System-Issues bleiben Standalone.

Die Kopfzahlen sind als Filter für Alle, Kritisch, Fehler, Warnungen und
Unknown bedienbar. Unknown filtert weiterhin den State und ist keine neue
Severity. Child-Entities sind standardmäßig eingeklappt und werden erst beim
Öffnen der Details in den DOM eingefügt. Summary und Errors verwenden dieselbe
Filterdarstellung und besitzen getrennte persistente 1-/2-/3-Spalten-
Präferenzen. Unter 701 Pixeln wird auf eine, unter 900 Pixeln höchstens auf
zwei Spalten zurückgefallen; bei wieder ausreichender Breite wird die
gespeicherte Präferenz erneut angewendet.

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
Assetversion ist 34.

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

## 8b. Sprint 17.4 – Focus Overlay Stabilisierung

Die Regression hatte eine konkrete Layoutursache: Sprint 17.3 klonte die
Grid-Card und ergänzte `card-presentation-expanded`, ohne eine Focus-spezifische
Inhaltsstruktur aufzubauen. Die Expanded-Regeln waren jedoch an
`.grid-layout-active` gebunden und griffen außerhalb des Grids nicht
zuverlässig. Gleichzeitig ergänzte das Focus-CSS feste
Mindesthöhen von 270 beziehungsweise 300 Pixeln und machte sowohl Overlay als
auch Shell zu vollständigen Scrollcontainern. Die reale sichtbare
Viewport-Höhe wurde nicht gemessen; Resize und Orientation Change wurden
nicht behandelt. Dadurch konnten Grid-Abstände und Mindesthöhen die Controls
unnötig nach unten schieben, während der Hintergrund weiter scrollbar blieb.

Der Focus-Clone wird jetzt in `focus-header`, `focus-primary`,
`focus-controls` und `focus-secondary` gegliedert. Sensor und Binary zeigen
Identität, Icon und Primärwert zusammen; Light hält State und Power-Control
oberhalb sekundärer Informationen; Climate trennt Header, Isttemperatur und
die gemeinsame Soll-/Minus-/Plus-/Power-Zeile. Es werden keine neuen Daten
und keine neuen Capabilities erzeugt.

Die Geometrie verwendet `window.innerWidth` und `window.innerHeight` mit
Fallbacks auf `documentElement` und `body`. Daraus entstehen tatsächliche
Außenabstände, maximal 760 Pixel Breite und eine Maximalhöhe innerhalb des
sichtbaren Viewports. Portrait und Landscape erhalten eigene Flexbox-Regeln;
ein offener Focus wird nach Resize beziehungsweise Orientation Change
debounced neu vermessen. Der Poll-Refresh ersetzt weiterhin nur den Clone und
vermisst das Layout nicht bei jedem Abruf.

Overlay und Shell sind nicht mehr scrollbar. Nur `focus-content` dient bei
echter Überhöhe als kontrollierter Fallback-Scrollbereich; die üblichen vier
Widgettypen passen in 768×1024 und 1024×768 vollständig ohne Scrollen. Beim
Öffnen wird die Dashboardposition gespeichert und der Body iOS-9-kompatibel
fixiert. Beim Schließen werden vorherige Inline-Styles und Scrollposition
wiederhergestellt.

## 8c. Sprint 17.5 – Native Focus Renderer

Die verbliebene iPadOS-Regression lag nicht an einer falschen
Viewport-Messung. Der Sprint-17.4-Focus verwendete weiterhin
`card.cloneNode(true)`: Zwar wurde der äußere Inline-Style entfernt, der Clone
behielt jedoch `.card`, `.card-climate` beziehungsweise die übrigen
Widgetklassen, verschachteltes Grid-DOM und zusätzlich
`card-presentation-expanded`. Damit griffen weiterhin allgemeine
Card-/Widget-Regeln sowie die Media Queries bei 599, 739 und 900 Pixeln. Die
Focus-Overrides ersetzten nur einen Teil dieser Regeln. Gleichzeitig waren
Panel und verschachtelte Flex-Inhalte ohne durchgängigen Shrink-Schutz; Mobile
WebKit durfte sie unter seiner Min-Content-/Fixed-Overlay-Berechnung stärker
komprimieren als macOS Safari. `transform`, `scale` oder `zoom` waren nicht
beteiligt, und `window.innerWidth`/`window.innerHeight` lieferten korrekte
Werte.

Focus ist nun architektonisch vom Grid getrennt:

```text
Widgetdefinition + sanitierter State + Gateway-Capabilities
                         |
                         v
                 Focus View Model
                         |
                         v
          typgetrennter nativer Focus Renderer
```

`view-model.js` erzeugt eine kleine, seiteneffektfreie Datenstruktur.
`renderer.js` besitzt eigene Renderer für Sensor, Binary, Light und Climate.
`focus.js` verwaltet ausschließlich Lifecycle, Viewport, Rotation, Scroll-Lock
und Refresh. Es gibt kein `cloneNode`, keine Grid-DOM-Suche und keine Übernahme
von `x/y/w/h`, Inline-Größen oder Presentation-Klassen. Das Dashboard liefert
die Daten über eine stabile Widget-ID; optimistische Light-/Climate-Updates
aktualisieren denselben Zustands-Cache, sodass ein offener Focus aktuell
bleibt.

Der CSS-Block verwendet ausschließlich den `focus-*`-Namespace. Panel,
Widget, Header, Kernbereiche und Controls besitzen konsistentes
`box-sizing`; Panel, Widget und Interaktionen dürfen nicht schrumpfen. Die
Panelbreite wird aus dem sichtbaren Viewport als echter Pixelwert gesetzt und
bei 760 Pixeln begrenzt. Minus und Plus sind 56×56 Pixel, Power ist mindestens
54 Pixel hoch. Stale und unavailable deaktivieren die bestehenden Controls,
ohne neue Berechtigungen abzuleiten.

## 8d. Sprint 17.6 – Power Control Alignment und Icon-Stabilisierung

Die Fehlausrichtung hatte keine aktuelle Unicode-Glyphe als Hauptursache: Der
Grid-Renderer verwendete bereits ein Inline-SVG. Tatsächlich bestanden jedoch
zwei getrennte Implementierungen. Grid nutzte `LegacyControls.powerButton`,
während Focus einen eigenen Button, ein zweites SVG und abweichende CSS-Regeln
erzeugte. Die sichtbare Pfadgeometrie des Grid-SVG lag innerhalb der 24×24-
`viewBox` leicht oberhalb der optischen Mitte. Beim Focus-SVG fehlte zusätzlich
`display: block`, sodass dort auch die Inline-SVG-Baseline wirksam blieb. Beide
Buttonpfade erbten außerdem Text-`line-height` und unterschieden sich bei Höhe,
Padding und Zustandsklassen. Mobile Safari konnte den sichtbaren Inhalt deshalb
anders ausrichten als Desktop Safari.

`src/public/js/controls/power.js` ist nun die einzige Power-Control- und
Power-Icon-Quelle für Light und Climate in Grid und Focus. Das echte
`button`-Element enthält ein 24×24-Pixel-Inline-SVG mit fester `viewBox` sowie
optional ein Label. On, Off, Busy, Disabled, Unavailable und Error verändern
nur Darstellung und Verfügbarkeit, nicht die Boxgeometrie.

Die gemeinsame CSS-Basis neutralisiert native Safari-Appearance, Text- und
SVG-Baselines mit `line-height: 1` beziehungsweise `0`, setzt `display: block`
für das SVG, symmetrisches Padding, `border-box`, unveränderliche Iconmaße und
robustes Ellipsis-Verhalten für lange Labels. Der SVG-Pfad selbst ist um einen
Pixel nach unten korrigiert; Button-Padding oder CSS-Transforms dienen nicht als
Zentrierungshack. Climate Normal verwendet 46×46,
Light Compact 48×48, Light Normal 52 Pixel Höhe und Focus 54 Pixel Höhe.

Sprint 17.5 bleibt architektonisch erhalten: Der Focus Renderer baut weiterhin
eigenes Focus-DOM aus View Model und Gateway-Capabilities und übernimmt keine
Grid-Geometrie, Größen- oder Presentation-Klassen. Gemeinsam sind nur Power-
Renderer, SVG und Zustandsbasis.

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
| Regeln und Engines | `src/services/summary/rules.js`, `src/services/summary/engine.js`, `src/services/issues/engine.js`, `src/services/issues/severity.js`, `src/services/issues/presentation.js` |
| Snapshot und Cache | `src/services/system/snapshot.js`, `src/services/system/cache.js`, `src/services/system/index.js` |
| System-API | `src/routes/system-dashboards.js` |
| Schema/Persistenz | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Legacy-Systemansichten | `src/public/system.html`, `src/public/js/system/common.js`, `src/public/js/system/summary.js`, `src/public/js/system/errors.js`, `src/public/css/system.css` |
| Sprint-17.2-Layout | `src/public/js/core/layout.js`, `src/public/js/core/widget.js`, `src/public/css/style.css` |
| Sprint-17.2-Widgets | `src/public/js/widgets/sensor.js`, `src/public/js/widgets/binary.js`, `src/public/js/widgets/light.js`, `src/public/js/widgets/climate.js` |
| Gemeinsame Presentation-Regeln | `src/public/js/core/presentation.js`, `src/public/js/core/layout.js`, `src/public/js/core/widget.js` |
| Unified Power Control und Focus | `src/public/js/controls/power.js`, `src/public/js/focus/view-model.js`, `src/public/js/focus/renderer.js`, `src/public/js/focus/focus.js`, `src/public/js/core/dashboard.js`, `src/public/js/app.js`, `src/public/index.html`, `src/public/css/style.css` |
| Climate Power | `src/services/climate-power.js`, `src/routes/api.js` |
| Admin Live Preview | `src/routes/admin.js`, `src/admin/js/api.js`, `src/admin/js/state.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Theme | `src/public/js/core/theme.js`, `src/public/index.html`, `src/public/system.html` |
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/sprint-17-6.test.js`, `test/sprint-21-1.test.js`, `test/sprint-21.test.js`, `test/sprint-17-5.test.js`, `test/sprint-17-4.test.js`, `test/sprint-17-3.test.js`, `test/issues.test.js`, `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/summary.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js` |

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
- reale Focus-Viewport-Geometrie, priorisierte Widgetregionen, Rotation,
  Scroll-Lock/-Restore und Poll-Refresh ohne Neuvermessung
- native Focus-Renderer für alle vier Widgettypen, View-Model-State-Binding,
  CSS-Isolation, fehlende Grid-Geometrie und nicht schrumpfende Touchziele
- ein gemeinsamer Power-Renderer für Light und Climate in Grid und Focus,
  feste SVG-Geometrie, alle Control-Zustände und neutralisierte Safari-Baselines
- 1000-Entity-Issue-Lauf, 1500 aktive Summary-Entities und 3000 normalisierte Entities
- WebSocket-Authentifizierung, Request-Korrelation, Timeouts, Disconnect,
  begrenzter Reconnect sowie synchrone Konstruktor-/Sendefehler
- getrennte Registry-/Config-/Repairs-Capabilities, TTL, In-flight-Deduplizierung,
  Stale-Fallback, Recovery und vollständiger WebSocket-Ausfall
- Registry-Sanitization, Single-Config-Entry-Modell, Legacy-Fallback,
  Area-Priorität, Disabled/Hidden/Registry-only und Config-/Repair-Issues
- 3000 Entities, 500 Devices, 50 Areas, 100 Config Entries und 100 Repairs
- echte Device-ID-Aggregation, Standalone-Regeln, Gruppen-Severity, Security-
  Propagation, älteste Dauer, Filter-Counts und deterministische Sortierung
- ES5-Filter ohne Reload, Unknown-State-Filter, eingeklappte/lazy gerenderte
  Child-Details und ein-/zweispaltige Flexbox-Regeln
- 3000 Entities, 500 Devices und 200 aktive Entity-Issues für Sprint 21.1
- Summary-Filterdefinitionen und Counts aus bestehenden Kategorien
- Safety-/Security-Risk-Class für Unknown und Unavailable, normale und
  diagnostische Gegenbeispiele sowie fehlende Name-only-Heuristik
- getrennte Storage-Präferenzen, Reload, Storage Failure und responsive
  1-/2-/3-Spalten-Fallbacks für Summary und Errors

Der abschließende vollständige Lauf besteht mit 184 von 184 Tests. Der
gezielte Focus-/Interaktionssatz besteht mit 28 von 28 Tests, davon 8 neue
Sprint-17.5-Tests. Die fünf neuen Sprint-17.6-Tests prüfen gemeinsamen Renderer,
SVG, Zustände, Geometrie, Focus-Isolation, ES5 und unveränderte Write-Fläche.
Der gezielte Sprint-17.6-/Layout-/System-Satz besteht mit 50 von 50 Tests. Der
Sprint-21-Satz bleibt mit 15 von 15 Tests grün; sein
größter Synthetikfall mit 3000
Entities, 500 Devices, 50 Areas, 100 Config Entries und 100 Repairs benötigte
42 ms. Die sechs Sprint-21.1-Tests sind grün; die Aggregation von 3000
Entities, 500 Devices und 200 aktiven Issues blieb unter 1,5 Sekunden. Die
gezielte Sprint-21.2-Regression besteht mit 33 von 33 Tests. Alle 79
JavaScriptdateien unter `src/` und `test/` bestehen `node --check`;
`git diff --check` ist sauber.

Die Browser-Abnahme an der real laufenden Anwendung mit kontrolliertem
localhost-HA-Mock und Fake-Credentials bestätigte Sensor, Binary, Light und
Climate Focus. Bei 768×1024 ist das Climate-Widget 716 Pixel breit, bei
1024×768 740 Pixel; beide haben weder horizontalen noch vertikalen Überlauf.
Minus und Plus bleiben 56×56 Pixel, Power 54 Pixel hoch. Im kleinen
320×460-Viewport ist das Panel 304 Pixel breit, sämtliche drei Climate-
Controls bleiben vollständig sichtbar und ohne Überlauf. Light Power sowie
Climate Plus/Minus wurden im geöffneten Focus betätigt; State und Sollwert
aktualisierten sich, ohne den Focus zu schließen. Die Sprint-21.2-Abnahme
bestätigte für Summary und Errors bei 1280×720 drei Spalten mit 332-Pixel-
Cards ohne horizontalen Überlauf. Bei 768×1024 greifen zwei Spalten mit
310-Pixel-Cards; bei 320×460 eine Spalte, kein horizontaler Überlauf und ein
44-Pixel-Detailsbutton. Critical-Filter und Child-Details zeigen die neuen
Risk-Severities und tatsächlichen States korrekt.

Dieser kontrollierte Lauf verwendet den In-App-Browser und ersetzt keine echte
Safari-Laufzeit. Das vom Anwender bestätigte gute Verhalten unter macOS Safari
13.7.8 ist die Ausgangsbasis; die Post-Rollout-Abnahme auf macOS Safari,
iPad Air 2 mit iPadOS 15.8.5 und dem Legacy-iOS-9-Gerät bleibt manuell. Der
sichtbar geänderte echte Demo-Screenshot `focus-card.png` bleibt gültig.
`summary.png` und `errors.png` wurden für Sprint 21.2 aus der echten
Systemseite mit einem kontrollierten localhost-Demo-Payload und ausschließlich
künstlichen Daten aktualisiert; Admin-Screenshots benötigen keine Änderung.

Für Sprint 17.6 wurde die reale Anwendung zusätzlich gegen einen kontrollierten
localhost-HA-Mock mit Fake-Credentials geprüft. Bei 1024×768 und 768×1024 lagen
Grid-Icon und Buttonmittelpunkt jeweils exakt übereinander; Light Compact blieb
48×48 Pixel, Climate Compact 46×46 Pixel. Im Climate Focus war das gemeinsame
Power-Control 54 Pixel hoch, Icon-plus-Label als Gruppe horizontal und das Icon
vertikal exakt zentriert. 320×460 und 1024×768 zeigten keinen sichtbaren
Überlauf; Plus und Light Power aktualisierten den offenen Focus, ohne ihn zu
schließen. Die Browserkonsole blieb ohne Warnung oder Fehler. Die vorhandenen
Dashboard-/Focus-Screenshots wurden geprüft und bleiben repräsentativ, da
Sprint 17.6 keine beabsichtigte Designänderung außer der Zentrierung einführt;
es wurde kein künstlich erzeugter Ersatz-Screenshot committed.

## 12. Bekannte Einschränkungen und technischer Rest

- Matter besitzt aktuell keine belastbar belegte generische Read-only-
  Diagnose-API und wird daher ohne Command-Probe als `unsupported` gemeldet.
- Grace Periods, erwartete Offlinezustände und Flapping folgen Sprint 22;
  kurze Ausfälle erscheinen im MVP daher sofort. Die Error-Präsentation ist
  bereits nach echter Device-ID aggregiert; semantische Summary-Aggregation
  bleibt für Sprint 22 geplant.
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

Sprint 21, 21.1 und 21.2 entsprechen der Roadmap: Der REST-State-Collector bleibt bestehen,
während fest codierte Backend-WebSocket-Adapter ausschließlich read-only
Metadaten ergänzen. Die Error Engine wurde nur um sicheren Kontext und klar
belegte Config-/Repair-Issues ergänzt; Device Cards liegen getrennt davon in
der Presentation-Schicht. Summary-Filterkategorien entstehen serverseitig;
Filter- und Spaltenwechsel bleiben rein lokal. Nicht vorgezogen wurden Grace
Periods, Flapping, fachliche Summary-Aggregation, Historie,
weitere Schreibdomänen oder freie System-Dashboard-Layouts.

Empfohlener nächster Schritt ist Sprint 22 – Rules, Grace Periods & Device
Aggregation. Voraussetzung sind reale Betriebsbeobachtungen zu kurzzeitigen
Ausfällen, erwarteten Offline-Zuständen und sinnvollen Karenzzeiten; Sprint 21
liefert dafür den stabilen Device-/Area-/Integrationskontext, Sprint 21.1 die
davon getrennte Error-Präsentation und Sprint 21.2 die korrigierte Risk-
Severity sowie die lokale Ansichtssteuerung.

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

## 16. Sprint 21.1 – Error Dashboard Device Aggregation & Navigation

`src/services/issues/presentation.js` ist die einzige neue serverseitige
Schicht. Sie erhält den unveränderten Rückgabewert der Sprint-20-Issue-Engine
und den bereits gecachten Sprint-21-Snapshot. Ein linear aufgebauter
Entity-Index und ein `issuesByDeviceId`-Dictionary verhindern quadratische
Suchen. Nur `entity_state`-Issues mit derselben normalisierten Device-ID werden
zusammengeführt; alle übrigen Issue-Quellen bleiben Standalone.

Die Route liefert zusätzlich `presentationVersion: 1`, Filter-Counts und ein
einheitliches Gruppenmodell. Device Groups enthalten nur benötigte Child-
Felder und keinen Registry-Rohdatensatz. Die ursprüngliche normalisierte
`issues`-Liste bleibt für Kompatibilität erhalten; Detection, Summary,
Overall-Status und Severity werden nicht neu berechnet.

Der Legacy-Renderer bindet fünf statische Buttons per `onclick`, hält genau
einen lokalen Filter aktiv und erzeugt keine Navigation oder neue Anfrage.
Der aktive Filter ist durch Häkchen, Rahmen und `aria-pressed` auch ohne Farbe
erkennbar. Device-Details sind initial leer; Child-DOM wird erst beim Öffnen
erzeugt und beim Schließen entfernt. Auf breiten Viewports verwenden Cards
48 Prozent plus definierte Ränder, unter 700 Pixeln 100 Prozent. `flex-start`
verhindert, dass eine geöffnete Card die Nachbar-Card künstlich streckt.

Die kontrollierte Browserabnahme ergab:

- 1024×768: zwei Spalten, Cardbreite 414 Pixel, kein horizontaler Überlauf
- 768×1024: zwei Spalten, Cardbreite 310 Pixel, kein horizontaler Überlauf
- 320×460: eine Spalte, 44-Pixel-Details-Button, kein horizontaler Überlauf
- Details öffnen/schließen korrekt; Unknown zeigt nur Gruppen mit Unknown-
  Child und im geöffneten Gerät nur das passende Child
- Light und Dark funktionieren; Browserkonsole ohne Warnungen oder Fehler

Die Messung erfolgte in einem modernen In-App-Browser und belegt die
responsive Web-Darstellung, ersetzt aber keine physische Safari-iOS-9-
Laufzeit. Die reale iPad-/Legacy-Geräteabnahme bleibt nach dem Deployment
erforderlich.

## 17. Sprint 21.2 – Filter, Spaltenansichten und Risk Severity

`src/services/summary/engine.js` liefert sieben Filterdefinitionen mit ID,
Label, Count und den zugrunde liegenden bestehenden Kategorien. Das
ES5-Frontend vergleicht nur diese vom Server gelieferten Kategorien und führt
keine zweite Activity- oder Entity-Klassifikation aus. Der Filterwechsel
verändert ausschließlich den vorhandenen DOM.

`src/public/js/system/common.js` stellt die gemeinsame Filtersteuerung und den
Column Controller bereit. Summary und Errors speichern 1, 2 oder 3 getrennt
unter `systemSummaryColumns` und `systemErrorsColumns` über die fehlertolerante
Storage-Funktion aus `theme.js`. Bei Storage-Fehlern gilt weiter das
viewportabhängige Default. Die Containerklassen `system-columns-1`, `-2` und
`-3` steuern ausschließlich Flexbox-/Width-/Wrap-Regeln; CSS Grid, Flexbox-
`gap` und ResizeObserver werden nicht verwendet.

`src/services/issues/risk.js` ist die einzige Risk-Class-Quelle. Reliable
Safety-Device-Classes sind Smoke, Carbon Monoxide, Gas, Moisture, Safety und
Water; Security umfasst Door, Window, Opening, Garage Door und Lock sowie die
verlässlichen Domains Lock und Alarm Control Panel. `entity_category =
diagnostic` wird als Diagnostic klassifiziert, sofern keine belegte Safety-
oder Security-Device-Class vorliegt. Name-only-Heuristiken existieren nicht.

Die Severity-Priorität ist im aktuell unterstützten Konfigurationsmodell:

```text
1. explizite securityEntities
2. Risk Class aus normalisierten Metadaten
3. bestehende State-Regel
4. Fallback
```

Ein allgemeiner Severity-Override ist im Schema 6 nicht vorhanden und wurde
nicht neu eingeführt. Safety/Security `unknown` und `unavailable` sind
Critical; normale `unknown` bleiben Info und normale `unavailable` Warning.
Sprint-21.1-Gruppen übernehmen weiterhin die höchste Child-Severity, und nur
eine echte `device_id` darf Entity-Issues zusammenfassen.

Filter, Spaltenansicht und Risk Class fügen keine Route, keine Home-Assistant-
Abfrage, keine Serviceaktion und keine Write-Berechtigung hinzu. Climate- und
Light-Allowlists sowie Admin-, Registry-, Repair- und Matter-Sicherheitsgrenzen
bleiben unverändert.
