# Projektstatus – HA Legacy Dashboard

Stand: 31. August 2026, Sprint 26.1 auf Basis des sauberen, mit `origin/main`
identischen Commits `0878769` implementiert und repositoryseitig validiert.
Sprint 26 wurde mit `0878769` abgeschlossen.
Release Candidate `1.0.0-rc.1` ist veröffentlicht; die JPEG-Härtung aus Sprint
25.5 und die Kartenkorrekturen aus Sprint 25.6 gehören zum noch nicht neu
getaggten Stand nach RC.1. Reale iPad-/HomeScreen-/Safari- und verbleibende
HAOS-Persistenzabnahmen bleiben offen.

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-26-Ausgangscommit: `6e94ea8`
- Sprint-25.7-Ausgangscommit: `2cf2d23`
- Sprint-25.6-Ausgangscommit: `91045b8`
- Sprint-25.6-Implementierungscommit: `03648a9`
- Sprint-25.5-Ausgangscommit: `02abf11`
- Sprint-25.5-Implementierungscommits: `e0df018`, `42d88f3`
- Sprint-25.4-RC-Commit und Tag: `741bba4`, `v1.0.0-rc.1`
- Sprint-25.3-Ausgangscommit: `c8d452b`
- Sprint-25.3-Implementierungscommit: `f010350`
- Sprint-25.2-Ausgangscommit: `94c7efa`
- Sprint-25.1-Ausgangscommit: `10c1f75`
- Sprint-25-Ausgangscommit: `95f6603`
- Sprint-23-Ausgangscommit: `e692eed`
- Sprint-24-Ausgangscommit: `0c968b4`
- Sprint-22-Ausgangscommit: `ca95e21`
- Sprint-17.7-Ausgangscommit: `ff71d23`
- Sprint-21.3-Ausgangscommit: `a490dcf`
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

Der Arbeitsbaum war vor Sprint 25.2 auf `main` bei `94c7efa` sauber und mit
`origin/main` identisch. Die Sprint-25.2-Änderungen wurden nach Review als
`c432d7c` committet, auf `origin/main` gepusht und per Fast-Forward auf dem
Standalone-LXC ausgerollt.

Der Arbeitsbaum war vor Sprint 25.3 auf `main` bei `c8d452b` sauber und mit
`origin/main` identisch. Der Ausgangscommit ergänzt ausschließlich die
vollständige Sprint-25.3-Spezifikation um die Full-Height-/Footer-Anforderungen.
Die in Abschnitt 22 beschriebene Implementierung wurde nach Review als
`f010350` committet, auf `origin/main` gepusht und per Fast-Forward auf dem
Standalone-LXC ausgerollt.

Der Arbeitsbaum war vor Sprint 25.5 auf `main` bei `02abf11` sauber und mit
`origin/main` identisch. Der Commit nach dem RC-Tag ergänzt ausschließlich die
Spezifikationen für Sprint 25.5 und spätere Sprints; die Sprint-25.5-
Implementierung startete daher ohne nicht eingeordnete Voränderungen.

Der Arbeitsbaum war vor Sprint 25.6 auf `main` bei `91045b8` sauber und mit
`origin/main` identisch. Der Commit enthält nur die dokumentierte
Sprint-25.5-LXC-Abnahme; die Sprint-25.6-Implementierung startete ohne
unbekannte oder nicht eingeordnete Voränderungen.

Der Arbeitsbaum war vor Sprint 25.7 auf `main` bei `2cf2d23` sauber und mit
`origin/main` identisch. Sprint 25.7 verändert keine Anwendung, keine
Konfiguration und keine Sicherheitsgrenze. Die physische iOS-9.3.5-Abnahme
bleibt offen und wird nicht aus Dokumenten- oder Quelltests als bestanden
abgeleitet.

Die Implementierung wurde als `e0df018` gepusht. Beim anschließenden LXC-
Rollout zeigte sich `data/backgrounds/` als einzige unversionierte
Persistenzablage; keine Datei wurde verändert. `42d88f3` ergänzt den fehlenden
Ignore-Eintrag samt Regressionstest. Danach lief der LXC per Fast-Forward und
regulärem Deployment erfolgreich auf genau diesen Stand.

Der Arbeitsbaum war vor Sprint 25.1 auf `main` bei `10c1f75` sauber und mit
`origin/main` identisch. Die in Abschnitt 20 beschriebene Sprint-25.1-
Implementierung wurde nach Review als `a438e3c` committet, auf `origin/main`
gepusht und per Fast-Forward nach
`/home/dashboard/ha-legacy-dashboard` ausgerollt. Der Release-Tag wurde
bewusst noch nicht gesetzt.

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
| 17.7 | Legacy-Safari-Control-Alignment-Härtung | umgesetzt |
| D1 | Zweisprachige Dokumentation und Screenshot-Baseline | umgesetzt |
| 21 | Registry & Diagnostic Enrichment | umgesetzt |
| 21.1 | Error Dashboard Device Aggregation & Navigation | umgesetzt |
| 21.2 | System Dashboard Filters, Column Views & Risk Severity | umgesetzt |
| 21.3 | Error Filtering & Critical Device Detection Modes | umgesetzt |
| 21.4 | Entity Rule Manager und eindeutige Header-Counts | umgesetzt |
| 21.5 | Globale Systemnavigation und Health-Indikator | umgesetzt |
| 22 | Rules, Grace Periods & Device Aggregation | umgesetzt |
| 23 | Automation Impact & Advanced Diagnostics | umgesetzt |
| 24 | Home Assistant App Packaging | umgesetzt |
| 25 | Release & Distribution | umgesetzt, RC.1 veröffentlicht |
| 25.1 | Pre-Release UI State & Filter Correctness | implementiert, gepusht und auf LXC ausgerollt; iPad-Abnahme offen |
| 25.2 | HomeScreen Standalone Navigation Correctness | implementiert, gepusht und auf LXC ausgerollt; Geräteabnahme offen |
| 25.3 | Dashboard Backgrounds & Full-Height Layout | implementiert, gepusht und auf LXC ausgerollt; Geräteabnahme offen |
| 25.4 | RC Validation | RC.1 veröffentlicht; Standalone validiert, reale HAOS-/iPad-Punkte teilweise offen |
| 25.5 | HAOS Network Access & Background Upload Hardening | implementiert und lokal mit vollständigem Release Gate validiert; neuer HAOS-Build und Realgerätetest offen |
| 25.6 | Card Size Matrix & Responsive Layout Hardening | implementiert und lokal mit vollständiger Test-/Browsermatrix validiert; iPad-mini-Abnahme offen |
| 25.7 | Legacy iPad Kiosk Deployment & Guided Access Validation | Betriebsanleitung und Checkliste erstellt; physische iPad-mini-Abnahme offen |
| 26 | Persistent Dashboard Sections | implementiert; physische iPad-mini-Abnahme offen |
| 26.1 | Native Room Card MVP | implementiert; physische iPad-mini-Abnahme offen |

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

Die Kopfzahlen sind als getrennte Filter für Severity und Status bedienbar.
Critical, Error, Warning und Info vergleichen exakt; Unknown und Unavailable
bleiben exakte States. Beide Dimensionen werden per UND am selben Child-Issue
geprüft. Device Groups werden für die Anzeige erst nach dem Child-Filter
gebildet: sichtbare Severity, Anzahl, Dauer und relevante Zustandsmerkmale
stammen nur aus den passenden Children. Die ursprüngliche Gruppen-Severity,
der Overall Health und der globale Sprint-21.5-Health-Indikator bleiben dabei
unverändert. Child-Entities sind standardmäßig eingeklappt und werden erst
beim Öffnen der Details in den DOM eingefügt. Summary und Errors verwenden
dieselbe Filterdarstellung und besitzen getrennte persistente 1-/2-/3-Spalten-
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

Die Konfiguration verwendet Schema 11. Zusätzlich zu
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
      "ignoredEntities": [],
      "criticalDetectionMode": "device_class",
      "criticalLabelId": null,
      "rules": {
        "defaults": {},
        "riskClasses": {},
        "domains": {},
        "devices": {},
        "entities": {}
      }
    }
  }
}
```

Jeder Eintrag unter `dashboards` ergänzt `showTitle`, `background` und
`sections`; Widgets besitzen optional `sectionId`. Native Room Cards ergänzen
Schema 11 mit einer eigenen `room`-Konfiguration. Details zu Abschnitten und
Room Cards stehen in den Abschnitten 27 und 28. Schema 1 bis 10 werden
automatisch und atomar auf Schema 11 migriert. Bei Schema
4 bleiben die 6/12-Spalten-Layouts unverändert. Bei Schema 5 bleiben Summary
und Layouts unverändert und die leeren Error-Standardwerte werden ergänzt.
Vollständige Validierung, atomarer
Dateiersatz und genau ein `.bak` bleiben erhalten. Ungültige Entity-IDs,
Duplikate, ungültige Hintergrundwerte oder ein nicht-boolesches Privacy-Flag
werden abgelehnt, ohne die
letzte gültige Datei zu ersetzen.

## 7. Admin UI

Die moderne, Bearer-geschützte Admin UI besitzt einen eigenen Bereich
„System-Dashboards“. Dort können Summary und Fehler geöffnet, Entities aus dem
bereits sanitisierten Admin-Inventar als sicherheitsrelevant markiert oder für
Errors beziehungsweise Summary ignoriert werden. Der gemeinsame Entity Rule
Manager verwaltet außerdem Expected Offline und Entity-/Geräteregeln für
Grace, Recovery und Flapping; Safety-/Security-Ausnahmen verlangen eine
zweite bewusste Bestätigung. Die Anzeige von Medientiteln kann ausdrücklich
aktiviert werden. Die Änderungen laufen wie alle
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

Die bestehende Theme-Persistenz verwendet weiterhin genau die globale
Präferenz `ha-legacy-theme`. Das externe Theme-Skript läuft im Dokumentkopf,
validiert den gespeicherten Wert und setzt die Klasse früh auf das
Root-Element; nach Aufbau des Bodys werden Root, Body und Toggle synchronisiert.
`localStorage` ist der primäre Speicher. Weil Safari auf älteren iOS-Versionen
das Objekt anbieten und Schreibzugriffe dennoch ablehnen kann, wird derselbe
nicht sensible Wert zusätzlich in einem Root-Pfad-Cookie gespiegelt. Schlagen
beide Wege fehl, bleibt der aktuelle Session-State ohne Crash bedienbar. `/`,
`/d/:dashboardId`, `/system/summary` und `/system/errors` übernehmen dieselbe
Light-/Dark-Auswahl nach Reload; Return-Navigation ändert sie nicht. CSP wurde
nicht gelockert.

Alle Dateien unter `src/public/js/` bleiben ECMAScript 5. Das Wall-Display
verwendet weiterhin `Legacy.http.get`, kein `fetch`, keine Promise, kein CSS
Grid, kein Flexbox-`gap` und keine CSS-Custom-Property-Abhängigkeit. Die
Assetversion des Wall-Displays und der Systemansichten ist 43.

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

## 8e. Sprint 17.7 – Legacy-Safari-Control-Alignment-Härtung

Die verbliebene Fehlausrichtung lag nicht am Power-SVG. Die komplette
Control-Hierarchie verließ sich auf zwei in älterem Mobile Safari instabile
Annahmen: Power- und Step-Buttons waren selbst Flex-Container, obwohl WebKit
den Inhalt nativer Buttons über eine eigene anonyme Content-Box rendert. Grid-
Light besaß außerdem keine dedizierte Control-Row; im Compact-Modus erzwang
der spezifischere Selector sogar `align-self: flex-end`. Im Climate Focus war
die Minus/Plus-Gruppe nur shrink-to-content breit und hatte keine eigene
vollbreite Zentrierungszone.

Die gemeinsame Basis in `src/public/js/controls/power.js` erzeugt jetzt
`dashboard-control-row`, `dashboard-control-group`, den echten Button und ein
neutrales `dashboard-control-content`. Row und Group verwenden robuste
Block-/Inline-Block-Zentrierung; nur das innere Span verwendet gezielt
`display: -webkit-flex`/`flex` sowie präfixiertes `align-items` und
`justify-content`. Dadurch ist die Zentrierung nicht mehr von der nativen
Safari-Button-Inhaltsbox abhängig. Light Grid erhält eine volle Control-Zone,
Climate Grid eine eigene volle Target-Gruppe und Climate Focus getrennte
vollbreite Rows für Minus/Plus und Power. Portrait, Landscape und Short Focus
ändern weiterhin nur Focus-eigene Geometrie.

`-webkit-appearance: none`, `border-box`, feste 46/48/52/54/56-Pixel-
Touchziele und die Sprint-17.6-SVG-Komponente bleiben erhalten. Weder
CSS Grid, Flexbox-`gap`, Transform-Zentrierung noch gerätespezifische Pixel-
Margins wurden ergänzt. Summary, Errors, Critical Detection und alle Write-
Allowlists bleiben unverändert.

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
| Regeln und Engines | `src/services/summary/rules.js`, `src/services/summary/engine.js`, `src/services/issues/rule-engine.js`, `src/services/issues/engine.js`, `src/services/issues/severity.js`, `src/services/issues/presentation.js` |
| Snapshot und Cache | `src/services/system/snapshot.js`, `src/services/system/cache.js`, `src/services/system/index.js` |
| System-API | `src/routes/system-dashboards.js` |
| Schema/Persistenz | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Dashboard-Abschnitte | `src/config/dashboard.js`, `src/services/layout.js`, `src/admin/js/sections.js`, `src/admin/js/layout.js`, `src/admin/js/app.js`, `src/public/js/core/dashboard.js`, `src/public/js/core/layout.js`, `src/public/css/style.css` |
| Legacy-Systemansichten | `src/public/system.html`, `src/public/js/system/common.js`, `src/public/js/system/summary.js`, `src/public/js/system/errors.js`, `src/public/css/system.css` |
| Sprint-17.2-Layout | `src/public/js/core/layout.js`, `src/public/js/core/widget.js`, `src/public/css/style.css` |
| Sprint-17.2-Widgets | `src/public/js/widgets/sensor.js`, `src/public/js/widgets/binary.js`, `src/public/js/widgets/light.js`, `src/public/js/widgets/climate.js` |
| Gemeinsame Presentation-Regeln | `src/public/js/core/presentation.js`, `src/public/js/core/layout.js`, `src/public/js/core/widget.js` |
| Unified Power Control, Control Rows und Focus | `src/public/js/controls/power.js`, `src/public/js/widgets/light.js`, `src/public/js/widgets/climate.js`, `src/public/js/focus/view-model.js`, `src/public/js/focus/renderer.js`, `src/public/js/focus/focus.js`, `src/public/js/core/dashboard.js`, `src/public/js/app.js`, `src/public/index.html`, `src/public/css/style.css` |
| Climate Power | `src/services/climate-power.js`, `src/routes/api.js` |
| Admin Live Preview | `src/routes/admin.js`, `src/admin/js/api.js`, `src/admin/js/state.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Theme | `src/public/js/core/theme.js`, `src/public/index.html`, `src/public/system.html` |
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/sprint-22.test.js`, `test/sprint-17-7.test.js`, `test/sprint-17-6.test.js`, `test/sprint-21-3.test.js`, `test/sprint-21-2.test.js`, `test/sprint-21-1.test.js`, `test/sprint-21.test.js`, `test/sprint-17-5.test.js`, `test/sprint-17-4.test.js`, `test/sprint-17-3.test.js`, `test/issues.test.js`, `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/summary.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js` |

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
- gemeinsame volle Control-Rows, Inline-Block-Groups und separat präfixiert
  zentrierte Button-Contents für Grid und Focus
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

Der abschließende vollständige Lauf besteht mit 202 von 202 Tests. Der
gezielte Focus-/Interaktionssatz besteht mit 28 von 28 Tests, davon 8 neue
Sprint-17.5-Tests. Die fünf neuen Sprint-17.6-Tests prüfen gemeinsamen Renderer,
SVG, Zustände, Geometrie, Focus-Isolation, ES5 und unveränderte Write-Fläche.
Der gezielte Sprint-17.6-/Layout-/System-Satz besteht mit 50 von 50 Tests. Der
Sprint-21-Satz bleibt mit 15 von 15 Tests grün; sein
größter Synthetikfall mit 3000
Entities, 500 Devices, 50 Areas, 100 Config Entries und 100 Repairs benötigte
42 ms. Die sechs Sprint-21.1-Tests sind grün; die Aggregation von 3000
Entities, 500 Devices und 200 aktiven Issues blieb unter 1,5 Sekunden. Die
gezielte Sprint-21.2-Regression besteht mit 33 von 33 Tests. Die sieben neuen
Sprint-17.7-Tests prüfen die komplette Control-Hierarchie, volle Grid- und
Focus-Rows, Mobile-Safari-Button-Neutralisierung, Portrait-/Landscape-
Isolation, ES5 und die unveränderte Write-Fläche. Alle geänderten
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

Für Sprint 17.7 wurde dieselbe echte Anwendung gegen einen isolierten
localhost-HA-Mock mit Fake-Credentials geprüft. Im Grid lagen bei Light und
Climate Row-, Group-, Button-, Content- und SVG-Mittelpunkte exakt aufeinander.
Im Climate Focus waren beide 56×56-Step-Buttons einschließlich ihrer 26×26-
SVGs intern exakt zentriert; die Step-Gruppe war innerhalb ihrer eigenen Row
symmetrisch. Light Focus hatte für Row, Group, Button und Content denselben
horizontalen Mittelpunkt. Landscape blieb kompakt und ohne Überlauf. Die
vorhandenen echten Dashboard-/Focus-Screenshots wurden geprüft und bleiben
repräsentativ; da nur die fehlerhafte Legacy-Safari-Ausrichtung korrigiert
wurde, ist kein neuer Screenshot erforderlich. Die physische Abnahme auf iPad
mini, iPad Air 2 und macOS Safari bleibt nach dem Rollout erforderlich.

## 12. Bekannte Einschränkungen und technischer Rest

- Matter besitzt aktuell keine belastbar belegte generische Read-only-
  Diagnose-API und wird daher ohne Command-Probe als `unsupported` gemeldet.
- Flapping-Historie bleibt bewusst prozesslokal, auf 16 Transitionen je Entity
  begrenzt und geht bei einem Gateway-Neustart verloren.
- Summary-Aktivitätsregeln, Mindestdauer, Nachlaufzeit und semantische
  Geräteaggregation sind ausdrücklich nicht Teil von Sprint 22.
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

Sprint 21 bis 22 entsprechen der spezifizierten Folge: Der REST-State-
Collector bleibt bestehen, während fest codierte Backend-WebSocket-Adapter
ausschließlich read-only Metadaten ergänzen. Device Cards liegen weiterhin in
der Presentation-Schicht. Filter- und Spaltenwechsel bleiben rein lokal;
Sprint 22 ergänzt ausschließlich die serverseitige Error-Regelbewertung und
die vorhandene Device-Präsentation. Nicht vorgezogen wurden fachliche Summary-
Aggregation, persistente Historie, weitere Schreibdomänen oder freie System-
Dashboard-Layouts.

Der aktuelle nächste Schritt ist kein weiterer Funktionssprint, sondern die
physische Sprint-25.1-Release-Gate-Abnahme auf iPad mini/iOS 9: Dark und Light
müssen die vollständige Routenmatrix überstehen, und ein gemischter
Error-Datensatz muss alle exakten Severity-/Status-Kombinationen bestätigen.
Erst danach sind Commit, LXC-Rollout und die Entscheidung über den RC-
beziehungsweise Stable-Tag sinnvoll.

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

Ein allgemeiner Severity-Override ist im Schema 7 nicht vorhanden und wurde
nicht neu eingeführt. Safety/Security `unknown` und `unavailable` sind
Critical; normale `unknown` bleiben Info und normale `unavailable` Warning.
Sprint-21.1-Gruppen übernehmen weiterhin die höchste Child-Severity, und nur
eine echte `device_id` darf Entity-Issues zusammenfassen.

Filter, Spaltenansicht und Risk Class fügen keine Route, keine Home-Assistant-
Abfrage, keine Serviceaktion und keine Write-Berechtigung hinzu. Climate- und
Light-Allowlists sowie Admin-, Registry-, Repair- und Matter-Sicherheitsgrenzen
bleiben unverändert.

## 18. Sprint 21.3 – Error-Filter und Critical Detection

Die Error-Präsentation liefert mit `presentationVersion: 2` getrennte Counts:

```text
filters.severity = all, critical, error, warning, info
filters.state    = all, unavailable, unknown
```

Das ES5-Frontend hält beide Auswahlwerte nur für die aktuelle Seite; nach
Reload gilt Alle/Alle. Ein Issue muss beide Bedingungen erfüllen. Device Cards
bleiben über ihre echte `device_id` gruppiert, geöffnete Details rendern nur
passende Children und die lokale 1-/2-/3-Spaltenpräferenz bleibt erhalten.
Das Layout nutzt Flexbox mit `-webkit-`-Fallbacks, ohne CSS Grid oder `gap`.

Das persistente Dashboard-Schema ist Version 7. Unter
`systemDashboards.errors` liegen zusätzlich `criticalDetectionMode`
(`device_class` oder `ha_label`) und `criticalLabelId`. Label-Modus ohne
syntaktisch gültige stabile Label-ID wird abgewiesen; Schema 6 migriert
automatisch auf Device-Class-Modus. Die Admin UI lädt eine reduzierte Liste
über `GET /api/admin/labels`, zeigt aktuelle Labelnamen und warnt bei
Unsupported, Ausfall, stale Daten oder gelöschter gespeicherter ID.

Der feste read-only WebSocket-Adapter `config/label_registry/list` ergänzt die
normalisierten Entity-/Device-Registry-Daten um Label-IDs. Er nutzt den
60-Sekunden-Registry-Cache. Temporäre Fehler behalten das letzte erfolgreiche
Ergebnis als stale; ein erster Fehler oder gelöschtes Label erzeugt einen
sichtbaren `critical_detection`-Fehler. Area-Labels werden nicht vererbt. Es
existieren keine Label-Writes, rohen Registry-Ausgaben oder generischen
WebSocket-Schnittstellen.

Im Device-Class-Modus klassifiziert die zentrale Policy die definierten
Safety-/Security-Klassen einschließlich CO und die Cover-Klassen Door, Garage,
Gate und Window. Shade, Shutter, Problem und Tamper werden nicht automatisch
Critical. Im Label-Modus laufen Device Classes bewusst nicht parallel: Ein
Device-Label gilt für seine Children, ein Entity-Label nur für diese Entity.
Explizite `securityEntities` behalten höhere Priorität. Climate-/Light-
Write-Allowlists und alle Home-Assistant-Schreibgrenzen sind unverändert.

Alle Syntaxprüfungen der geänderten JavaScript-Dateien bestehen. Die komplette
Suite umfasst 195 Tests und ist vollständig grün; darin enthalten sind ein
lokaler Mock-HA-Gatewaylauf sowie der Sprint-21.3-Lastfall mit 3000 Entities,
500 Devices, 100 Labels, 500 Zuweisungen und 200 aktiven Issues.

Die D1-Screenshots wurden geprüft und aktualisiert. `system/errors.png` stammt
von der real ausgerollten Anwendung mit der datenschutzsicheren leeren
Kombination Kritisch + Unavailable; dadurch sind keine Geräte-, Personen-,
Entity- oder IP-Namen sichtbar. `admin/system-diagnostics.png` stammt von der
unveränderten Anwendung gegen eine isolierte localhost-Demo mit Fake-Token und
zeigt die neue Label-Registry-Zeile. Die breite Browserabnahme ist erfolgt;
die physische iPad-Portrait-/Landscape-Abnahme bleibt durch den Benutzer offen.

## 19. Sprint 21.4 – Entity Rule Manager und eindeutige Header-Counts

Ausgangspunkt war Commit `a24e32b`. Die drei persistierten Listen unter
`systemDashboards.summary.ignoredEntities`,
`systemDashboards.errors.securityEntities` und
`systemDashboards.errors.ignoredEntities` bleiben unverändert; Schema 7 und
die atomare Speicherung aus Sprint 14 werden weiterverwendet.

Die drei bisherigen vollständigen Entity-Dropdowns wurden durch einen
gemeinsamen Entity Rule Manager ersetzt. Jede Entity erscheint genau einmal
und bietet direkt die Regeln „In Summary ignorieren“, „Sicherheitsrelevant“
und „In Errors ignorieren“. Ein vorberechneter Suchindex berücksichtigt
Friendly Name, Entity-ID, Area, Device und Domain. Area- und Domain-Werte
werden nur aus tatsächlich vorhandenen Metadaten aufgebaut; für Devices wird
bewusst ein Suchfeld statt eines weiteren großen Dropdowns verwendet. Die
Filter sind kombinierbar, und „Nur konfigurierte“ verwendet Lookup-Maps über
alle drei Listen. Bereits konfigurierte IDs bleiben als reduzierte
Fallback-Zeile entfernbar, wenn sie im aktuellen Inventar fehlen.

Checkbox-Änderungen markieren ausschließlich den vorhandenen lokalen
Admin-Entwurf als dirty. Speichern überträgt die vollständige validierte
Konfiguration in einem Request, Verwerfen stellt den letzten gespeicherten
Stand wieder her. Suche und Filter erzeugen keine Backend- oder HA-Anfrage.
Für große Installationen werden maximal 100 vollständige Cards gerendert; der
Lasttest umfasst 3000 Entities, 500 Devices und 50 Areas.

`GET /api/admin/entities` bezieht den vorhandenen serverseitigen
System-Snapshot ein und ergänzt nur `area_name` und `device_name` zu den schon
vorhandenen reduzierten Inventarfeldern. Raw Registry-Daten, IDs sensibler
Gerätekennungen, Tokens oder Schreibmöglichkeiten werden nicht ausgegeben.
Der Backend-WebSocket bleibt allein im Gateway und verwendet weiterhin nur
die festen read-only Commands aus Sprint 21.

Summary und Errors verwenden nun die gemeinsamen CSS-/DOM-Primitiven
`system-dashboard-header`, `system-dashboard-title`,
`system-dashboard-total`, `system-dashboard-filter-section` und
`system-dashboard-column-switch`. Der Total-Count erscheint genau einmal im
Titel. Summary-, Severity- und State-`Alle` wiederholen ihn nicht; alle
Teilfilter-Counts, getrennte Severity-/State-Auswahl, Device Groups,
1-/2-/3-Spaltenpräferenzen sowie Stale-/Offline- und Empty-State-Semantik
bleiben erhalten. Online-Statuszeilen mit derselben Gesamtinformation werden
ausgeblendet, Recovery-, Stale- und Offline-Hinweise bleiben sichtbar.

Relevante Dateien sind `src/admin/index.html`, `src/admin/css/admin.css`,
`src/admin/js/entity-rules.js`, `src/admin/js/system-dashboards.js`,
`src/admin/js/app.js`, `src/routes/admin.js`, `src/public/system.html`,
`src/public/css/system.css` sowie die drei ES5-Systemskripte unter
`src/public/js/system/`. Die Wall-Assets verwenden Cache-Version 37.

Die vollständige Testsuite umfasst 206 Tests. Darin enthalten sind die
Sprint-21.4-Suche, kombinierte Filter, alle drei Regeln, Dirty/Save/Discard,
ein einzelner Batch-Request, die 100-Card-Grenze, der 3000/500/50-Lastfall,
eindeutige Header-Counts sowie alle bisherigen Admin-, Summary-, Error-,
Device-Group-, Label-, Risk-, Focus-, Light-/Climate- und Security-
Regressionen. Alle geänderten JavaScript-Dateien bestehen `node --check`.

Die Browserabnahme gegen eine kontrollierte Instanz der echten Anwendung mit
lokalem Mock und Fake-Credentials bestätigt Suche, Registry-Kontext,
Checkboxen, Dirty State, Discard, Batch Save sowie je genau eine sichtbare
Spaltensteuerung. `docs/screenshots/admin/entity-rules.png`,
`docs/screenshots/system/summary.png` und `docs/screenshots/system/errors.png`
wurden aus dieser Instanz aktualisiert und enthalten keine Produktionsdaten.
Die physische iPad-Abnahme bleibt nach dem LXC-Rollout durch den Benutzer
offen.

Empfohlener nächster Sprint bleibt Sprint 22. Er kann Grace Periods, Flapping
und erwartete Offline-Zustände spezifizieren, ohne die in Sprint 21.4
bereinigte Konfigurations- und Header-Struktur oder bestehende
Write-Sicherheitsgrenzen zu verändern.

## 20. Sprint 21.5 – Globale Systemnavigation und Health-Indikator

Ausgangspunkt war Commit `65bcf39`. Default und Custom Dashboards verwenden
nun denselben ES5-Headerbaustein aus
`src/public/js/core/system-navigation.js`. Der neutrale Summary-Link ist immer
sichtbar. Der danebenliegende Health-Link besitzt eine etwa 44 × 44 Pixel
große Touchfläche, ein sichtbares `!` beziehungsweise `?` sowie `title` und
`aria-label`; die Bedeutung hängt daher nicht allein von Farbe ab.

Der Health-Indikator wird nur bei einem frischen Snapshot ohne `warning`,
`error` oder `critical` verborgen. Reine `info`-Issues bleiben im Error
Dashboard verfügbar, erzeugen aber keinen Alarm im normalen Dashboard-Header.
Warning, Error und Critical wählen deterministisch die höchste vorhandene
Severity. Stale oder noch unbekannte Daten bleiben sichtbar. Bei einem
Abruffehler wird ein letzter bekannter Alarm nicht gelöscht, sondern mit einer
zusätzlichen Stale-Markierung dargestellt.

Der bestehende Endpoint `GET /api/system-dashboards/status` liefert zusätzlich
nur `total`, `critical`, `error`, `warning`, `info`, `relevant` und
`highest_severity`. Er gibt keine Issue-Liste, Summary-Liste, Entity-Zustände
oder Registry-Rohdaten aus. Die Berechnung verwendet die bestehende
Issue-Engine und denselben `System.getSnapshot()`-Cache. Im Browser wird der
Statusabruf an `loadDashboard()` gekoppelt, gegen Überlappung geschützt und
ohne eigenen Timer ausgeführt. Für die Navigation werden weder
`/api/system-dashboards/errors` noch `/api/system-dashboards/summary` geladen.

Der aktuelle Dashboard-Pfad wird als URL-kodiertes `returnTo` an Summary oder
Errors übertragen und beim Wechsel zwischen beiden Systemseiten beibehalten.
Erlaubt sind ausschließlich `/` und der exakte Pfad `/d/<id>` mit optionalem
abschließendem Slash. `src/services/dashboard-return-target.js` prüft Custom-
IDs serverseitig zusätzlich gegen die persistierte Dashboard-Konfiguration.
Externe URLs, `//`-Ziele, `javascript:`, `data:`, unbekannte Dashboards und
sonstige Pfade werden abgewiesen; die Systemroute wird ohne ungültigen Query-
Wert neu geladen und `← Zurück` fällt auf `/` zurück. Ein gleichoriginiger,
syntaktisch sicherer History-Pfad dient nur als Fallback, nicht als primäre
Quelle.

Die Browserabnahme gegen die echte Anwendung mit lokalem Mock und
Fake-Credentials bestätigte Default- und Custom-Navigation,
`/d/esszimmer → Summary/Errors → Zurück → /d/esszimmer`, Warning-Anzeige,
Light/Dark Mode sowie 768 × 1024, 1024 × 768 und 1280 × 720. Echte Safari-
Laufzeiten auf iPad mini, iPad Air 2 und macOS stehen in der automatisierten
Umgebung nicht zur Verfügung und bleiben Teil der Geräteabnahme nach dem
Rollout.

Die vier sichtbar betroffenen D1-Aufnahmen
`docs/screenshots/dashboards/main-light.png`,
`docs/screenshots/dashboards/main-dark.png`,
`docs/screenshots/system/summary.png` und
`docs/screenshots/system/errors.png` wurden als 1280 × 720 PNGs aus dieser
kontrollierten Instanz aktualisiert. Sie enthalten nur generische Demo-Daten,
keine Tokens, privaten Namen, internen Adressen oder Standortdaten.

Die vollständige Suite umfasst 214 grüne Tests. Sie prüft zusätzlich Healthy,
Info-only, Warning, Error, Critical, stale, unknown, Last-known Critical,
Default-/Custom-Return, Reload-stabile Query-Weitergabe, History-Fallback,
Open-Redirect-Abwehr, kompakten Status-Payload, Cache-Wiederverwendung und den
fehlenden zweiten Polling-Loop. Alle JavaScript-Dateien bestehen `node --check`;
die Wall-Skripte bleiben ES5, CSS Grid und Flexbox `gap` bleiben ausgeschlossen.
Die Asset-Cache-Version ist 38.

Sprint 21.1 Device Groups, Sprint 21.2 Spaltenansichten, Sprint 21.3 Filter und
Critical-Modi, Sprint 21.4 Entity Rule Manager/Header-Counts sowie Sprint 17.7
Control-Zentrierung sind durch die vollständige Regression unverändert. Es
wurden keine neuen Write-Routen, HA-Serviceaufrufe, Browser-WebSockets oder
Schreibberechtigungen ergänzt. Empfohlener nächster Sprint bleibt Sprint 22 –
Rules, Grace Periods & Device Aggregation.

## 21. Sprint 22 – Rules, Grace Periods & Device Aggregation

Ausgangspunkt ist Commit `ca95e21`. Die neue zentrale Engine
`src/services/issues/rule-engine.js` sitzt zwischen normalisiertem Snapshot,
Risk Classification und der bestehenden Issue-/Presentation-Pipeline. Sie
wertet ausschließlich bereits geladene, reduzierte Entity-Daten aus. Es gibt
weder eine HA-History-Abfrage noch einen zusätzlichen Poll oder Browserzugriff
auf Home Assistant.

Schema 8 speichert `systemDashboards.errors.rules` in fünf Ebenen. Die
verbindliche Priorität lautet: Entity, Device, explizite `securityEntities`,
Critical Detection aus Device Class oder HA Label, Risk Class, Domain,
globaler Default. Die Standardwerte sind:

| Risk Class | Unknown Grace | Unavailable Grace |
|---|---:|---:|
| Safety | 0 ms | 0 ms |
| Security | 0 ms | 5.000 ms |
| Normal | 15.000 ms | 30.000 ms |
| Diagnostic | 30.000 ms | 60.000 ms |

Recovery dauert standardmäßig 10.000 ms. Vier Transitionen innerhalb von
600.000 ms gelten als Flapping. Die Historie ist pro Prozess auf 16
Transitionen je Entity und insgesamt 10.000 verfolgte Entities begrenzt;
veraltete Einträge werden entfernt. Ein Neustart darf diese Historie verlieren,
verwendet für eine laufende Grace Period aber weiterhin zuverlässiges HA-
`last_changed`, sodass ein bereits lange bestehender Ausfall nicht erneut
unsichtbar wird.

Expected Offline kann für Entity oder echtes Device gesetzt werden und
unterdrückt ausschließlich `unavailable`. `unknown` bleibt auswertbar. Ignore
überspringt dagegen die Entity vollständig. Safety-/Security-Ausfälle werden
nur nach einer zusätzlichen expliziten `allowCriticalExpectedOffline`-
Bestätigung unterdrückt. Die Admin UI warnt davor und hält sämtliche
Änderungen im bestehenden Batch-Entwurf; Save und Discard bleiben unverändert.

Device Cards liefern zusätzlich unavailable-, unknown-, Flapping- und
Recovery-Counts. Sind mindestens zwei Entities und mindestens 70 Prozent der
aktivierten Entities derselben echten `device_id` unavailable, zeigt die UI
den konservativen Hinweis „Mehrere Entitäten dieses Geräts sind nicht
erreichbar.“ Sie behauptet keinen sicher bestätigten physischen Geräteausfall.
Grace und Expected Offline erzeugen kein aktives Issue und damit keinen Health-
Alarm. Recovery Pending hält einen vorhandenen Alarm stabil sichtbar;
Stale-/Offline-Semantik bleibt vorrangig.

Die erweiterten Config-Werte werden vollständig auf Typ, Ganzzahligkeit und
sinnvolle Grenzen validiert: Grace/Recovery 0 bis 86.400.000 ms,
Flap Threshold 2 bis 16 und Flap Window 1.000 bis 86.400.000 ms. Schema 1 bis
7 migrieren atomar auf Schema 8; letzte gültige Konfiguration und Backup-
Verhalten bleiben erhalten. Das Admin-Inventar ergänzt ausschließlich eine
validierte `device_id`, keine Rohregistry und keine Zugangsdaten.

Die neue Testsuite prüft Grace-Grenzen, Risk Classes, Restart-Zeitbasis,
Expected Offline/Ignore, Critical-Schutz, Priorität, Ringbuffer, Flapping,
Recovery, Health-Status, Device-Hinweis, Schema-Migration/-Validierung,
read-only Sicherheitsgrenzen sowie einen Lastfall mit 3.000 Entities,
500 Devices, 200 aktiven Issues, 100 flapping Entities und 500 Overrides.
Summary-Fachlogik, Severity-/State-Filter, Spaltenansichten, Device Groups,
Critical-Modi, globale Navigation, Focus und bestehende Light-/Climate-
Allowlists bleiben durch die vollständige Regression abgedeckt.

Die Legacy-Systemansicht bleibt ECMAScript 5, Flexbox-basiert und ohne CSS
Grid oder Flexbox `gap`; die gemeinsame Asset-Cache-Version ist 39. Die Admin
UI darf weiterhin moderne Browser voraussetzen. Physische Tests auf Safari
iOS 9 und iPadOS bleiben nach dem LXC-Rollout manuell erforderlich.

Die vollständige lokale Suite besteht mit 226 von 226 Tests; alle JavaScript-
Dateien unter `src/` und `test/` bestehen `node --check`. Der Sprint-22-
Lastfall mit 3.000 Entities, 500 Devices, 200 aktiven Issues, 100 Flapping-
Entities und 500 Overrides benötigte im abschließenden Gesamtlauf rund
1,18 Sekunden. Die Browser-Abnahme verwendete die echte Anwendung mit einem
kontrollierten localhost-HA-Mock und Fake-Credentials. Der Rule Manager blieb
bei 1280×720 und 768×1024 ohne horizontalen Überlauf; Expected Offline,
Critical-Freigabe, Dirty State und Discard wurden interaktiv bestätigt. Das
Error Dashboard blieb bei 768×1024 und 1024×768 ohne horizontalen Überlauf,
die Browserkonsole ohne Warnungen oder Fehler.

`docs/screenshots/admin/entity-rules.png` wurde aus dieser kontrollierten
Instanz aktualisiert und enthält nur generische Demo-Daten. Der vorhandene
echte Demo-Screenshot `docs/screenshots/system/errors.png` wurde geprüft und
bleibt repräsentativ, weil die neuen Flapping-, Recovery- und Device-Hinweise
nur bedingt eingeblendet werden und das Grundlayout nicht verändern.

## 17. Sprint 23 – Automation Impact & Advanced Diagnostics

Sprint 23 verwendet die vorhandenen `automation.*`-States als normalisiertes
Inventory. Zustand, Friendly Name, `last_triggered`, Modus und Laufzähler
werden bereits beim System-Snapshot reduziert; unbekannte Attribute werden
nicht übernommen. `off` ist ausschließlich Deaktivierungs-Kontext.
`unavailable` durchläuft weiterhin die Sprint-22-Regelengine und erscheint
nach der wirksamen Grace Period als Warning vom Typ
`automation_unavailable`; `unknown` behält die bestehende Rule-/Severity-
Semantik. Alter oder Fehlen von `last_triggered` erzeugt keine Severity.

Der feste read-only WebSocket-Adapter `automation/config` wird nur für Error-
Dashboard und Admin-Diagnose capability-geprüft aufgerufen. Ein begrenzter
Worker-Pool liest die Automationen, verwirft anschließend die Rohkonfiguration
und behält ausschließlich deduplizierte explizite Referenzen aus Triggern,
Bedingungen und Actions/Targets. Vier Maps indexieren Automation-Entity-IDs
nach `entity_id`, `device_id`, `area_id` und `label_id`. Jinja-/Template-
Ausdrücke und Blueprints werden nicht ausgewertet und setzen stattdessen
`dynamicReferences`; die globale Analyse weist diese Unsicherheit als
`unknown` und möglicherweise unvollständig aus, ohne sie einer beliebigen
Störung zuzuordnen. Namen werden nie als Referenzheuristik verwendet.

Erst nachdem Sprint 22 Grace, Expected Offline, Flapping, Recovery und Severity
ausgewertet hat, ergänzt die Presentation-Schicht aktive Device Groups oder
Standalone Entity Issues. Entity-/Device-Treffer sind `direct`, Area-/Label-
Treffer `indirect`. Die Oberfläche formuliert ausschließlich „möglicherweise
betroffen“ und behauptet keine Kausalität. Automation Impact ist in den
Kartendetails separat einklappbar; deaktivierte Automationen bleiben sichtbar,
aber diagnostisch neutral.

`trace/list` wird über einen zweiten festen read-only Adapter ausschließlich
on-demand geladen, wenn im Error Dashboard „Advanced Diagnostics“ geöffnet
wird und tatsächlich betroffene Automationen vorhanden sind. Der Browser
erhält höchstens drei normalisierte Summaries je Automation mit Run-ID,
Zeitstempeln, Dauer, Ergebnis, generischem Fehlerindikator und kurzer Trigger-
Beschreibung. Raw Config, Raw Trace, Variables, Actions, Services und interne
States werden weder übertragen noch geloggt. `failed_conditions` und
`not_triggered` gelten als normale Ablaufentscheidungen. Config-Metadaten
werden 60 Sekunden, Traces 30 Sekunden gecacht; beide Pfade deduplizieren
laufende Requests und behalten bei Teilfehlern verwendbare Daten.

Admin Diagnostic Sources zeigen Automation Inventory, Automation Config Read
und Automation Trace Read getrennt als verfügbar, nicht unterstützt, veraltet
oder fehlerhaft. Es existieren weiterhin keine Trigger-, Enable-/Disable-,
Reload-, Edit-, YAML-, Registry-, Label-, Repair- oder generischen WebSocket-
Write-Endpunkte. Der normale Systemstatus-Header fragt keine Traces ab und
Automation-Impact-Kontext verändert den globalen Health-Indikator nicht.

Die Sprint-23-Lasttests decken 3.000 Entities, 500 Devices, 500 Automationen,
200 aktive Zuordnungsprüfungen, 2.000 explizite Referenzen und 100 Trace
Summaries ab. Der gezielte Sprint-21/22/23-Systemsatz besteht mit 80 von 80
Tests; der vollständige Deployment-Check besteht mit 240 von 240 Tests und
alle JavaScript-Dateien unter `src/` und `test/` bestehen `node --check`.
Die Legacy-Systemansicht bleibt ES5- und Flexbox-basiert, ohne
CSS Grid oder Flexbox `gap`; die System-Assetversion ist 42. Die kontrollierte
Browserabnahme der echten Anwendung bei 768×1024 und 1280×720 zeigte keinen
horizontalen Überlauf und keine Konsolenfehler. Automation-Details und Traces
wurden dabei interaktiv und erst nach dem Öffnen geladen. Die Screenshots
`docs/screenshots/system/errors.png`,
`docs/screenshots/system/errors-automation-impact.png` und
`docs/screenshots/admin/system-diagnostics.png` wurden aus dieser Instanz mit
Fake-Credentials und generischen Demo-Daten aktualisiert. Die physische
iPad-Abnahme bleibt nach dem LXC-Rollout offen.

Die bis Sprint 23 festgelegten Grenzen für das zusätzliche App-Paket bleiben
auch nach Sprint 24 erfüllt: Standalone-Betrieb, Backend-only HA-Zugang,
Admin-Token-Trennung, read-only Automationsdiagnose und explizite Write-
Allowlists wurden unverändert bewahrt.

## 18. Sprint 24 – Home Assistant App Packaging

Sprint 24 ergänzt den Standalone-/LXC-Betrieb um ein lokales Home-Assistant-
App-Paket. Ausgangspunkt ist Commit `0c968b4`; Branch und Upstream waren zu
Beginn identisch und der Arbeitsbaum war sauber. Der bestehende
`deploy/systemd/ha-legacy-dashboard.service` sowie `.env`-basierte Betrieb
bleiben unverändert erhalten.

Die zentrale Runtime-Auflösung liegt in `src/config/runtime.js`. Im Modus
`standalone` verwendet sie weiterhin `HA_URL`, den backend-only `HA_TOKEN`,
`<HA_URL>/api` und `<HA_URL>/api/websocket`. Im Modus
`home_assistant_app` verwendet sie fest:

```text
REST       http://supervisor/core/api
WebSocket  ws://supervisor/core/websocket
Bearer     SUPERVISOR_TOKEN
```

Ein vorhandener `SUPERVISOR_TOKEN` erkennt den App-Modus automatisch; der
App-Wrapper setzt den Modus zusätzlich explizit. `HA_TOKEN` ist keine
App-Option und wird dort nicht benötigt. REST und WebSocket nutzen dieselbe
Auflösung, während sämtliche Browser-Routen und Payloads unverändert bleiben.
Der Admin-Token wird nun auch gegen den `SUPERVISOR_TOKEN` abgegrenzt.

Das Paket liegt direkt unter `ha_legacy_dashboard/` und enthält
`config.yaml`, `build.yaml`, `Dockerfile`, `run.sh`, README, DOCS, Changelog,
Übersetzungen und echte bestehende Projekt-Icons. `repository.yaml` liegt am
Repository-Root. Der Quellcode wird nicht dupliziert; für lokale HA-OS-Tests
erzeugt `deploy/prepare-home-assistant-app.sh` einen selbständigen, nicht
versionierten Build-Kontext.

`config.yaml` deklariert `amd64` und `aarch64`, einen konfigurierbaren
`3000/tcp`-Host-Port, direkte `webui`, Prozess-Watchdog, Cold Backup,
AppArmor und ausschließlich `homeassistant_api: true`. Nicht vorhanden sind
Ingress, `hassio_api`, privilegierte Rechte, Host-Netz/PID/DBus, Docker API,
Gerätemounts oder ein Home-Assistant-Konfigurationsmount. Der direkte LAN-Port
bleibt damit unabhängig von der modernen Home-Assistant-Oberfläche für alte
iPads nutzbar; die bestehenden Gateway- und Admin-Sicherheitsgrenzen gelten
auch dort.

Im App-Modus ist `/data` der zentrale persistente Datenpfad und
`/data/dashboards.json` die Dashboard-Konfiguration. Die atomare Primärdatei
und `.bak` enthalten Dashboards, Layouts, Widgets, Entity Rules, Critical-
Detection- und Sprint-22-Regeln. Home Assistant nimmt den App-Datenbereich in
Backups auf; `backup: cold` liefert einen konsistenten Snapshot. Theme-Wahl
bleibt absichtlich browserlokal; Sprint 25.1 ergänzt zum primären
`localStorage` einen gleichnamigen Cookie-Fallback. Registry-, Trace- und
Flapping-Caches bleiben begrenzt im Arbeitsspeicher und dürfen nach einem
Neustart neu aufgebaut werden. Eine vorhandene LXC-Konfiguration wird nicht
automatisch in den getrennten App-Datenbereich übernommen.

`GET /health` liefert ausschließlich `{ "status": "ok" }` und prüft den
lokalen Node-Prozess, nicht die momentane HA-Erreichbarkeit. Der Server bindet
im Container an `0.0.0.0`, verarbeitet SIGTERM/SIGINT kontrolliert und beendet
nach dem Schließen des HTTP-Servers mit Status 0. Der Startup-Wrapper liest
App-Optionen ohne Secret-Ausgabe, trennt Admin- und Supervisor-Token und
startet Node mit `exec`.

Die Sprint-24-Tests verwenden nur `test-token` und lokale Mocks. Sie prüfen
beide Runtime-Modi, den Supervisor-REST-Pfad, WebSocket-Authentifizierung und
Registry-Metadaten, Start ohne `HA_TOKEN`, HA-Ausfall bei weiterhin gesundem
Prozess, sauberes SIGTERM, `/data`-Persistenz, App-Metadaten, minimale Rechte,
Frontend-/Log-Secret-Grenzen und fehlende Quellcode-Duplikation. Die gesamte
Regression umfasst 250 grüne Tests; alle JavaScript-Dateien unter `src/` und
`test/` bestehen `node --check`, beide Shell-Skripte `sh -n`, und die YAML-
Metadaten wurden lokal geparst. Der sichere vorbereitete App-Buildkontext ist
vollständig. Ein tatsächlicher Container-Build sowie eine reale HA-OS-
Installation konnten mangels Docker-/HA-OS-Testumgebung nicht ausgeführt
werden; eine Produktionsinstanz wurde bewusst nicht kontaktiert.

Die sichtbare Anwendung wurde nicht geändert. Daher waren gemäß Sprint D1
keine neuen Produkt-Screenshots oder Asset-Cache-Versionen erforderlich.
Physische iOS-9-/iPad-Abnahme und reale App-Abnahme bleiben offen.

Die daran anschließende Sprint-25-Implementierung ergänzt den reproduzierbaren
amd64/aarch64-Build in CI, das generische GHCR-Multi-Arch-Image, Release-Tags
und -Notes, Upgrade/Rollback sowie die Custom-App-Repository-Installation.

## 19. Sprint 25 – Release & Distribution

Sprint 25 startet auf dem sauberen `main`-Commit `95f6603`. Die tatsächliche
Versionshistorie enthält seit dem ersten Projektcommit `1.0.0` in
`package.json`, aber keinen Git-Tag und kein veröffentlichtes Release. Deshalb
wird die bestehende Hauptversion nicht zurückgesetzt; der erste extern zu
prüfende Stand ist konsistent als `1.0.0-rc.1` vorbereitet.

`release/check-version.js` validiert SemVer, optionalen Git-Tag, beide npm-
Versionsfelder, Home-Assistant-App-Version, generische Image-Referenz,
`release/metadata.json`, beide Changelogs und die versionierte Release-Notes-
Datei. Jede Abweichung bricht das Release ab. Root- und App-Changelog sind nun
nutzungsorientiert und die zuvor implizite ISC-Lizenz ist wieder eindeutig in
`LICENSE` und `package.json` festgelegt.

Der Dockerfile unter `ha_legacy_dashboard/` ist die einzige Container-
Buildquelle. Das alte `build.yaml` wurde entfernt. CI und Release verwenden
Docker Buildx/BuildKit mit `npm ci --omit=dev`, OCI-Labels, Lockfile,
Build-Provenance und SBOM. `config.yaml` referenziert ausschließlich das
generische Image:

```text
ghcr.io/tekky85/ha-legacy-dashboard
```

`.github/workflows/test.yml` besitzt nur `contents: read` und führt Test Gate,
Produktionsaudit, reproduzierbares Standalone-Archiv sowie einen nicht
publizierenden amd64/aarch64-Build aus. `.github/workflows/release.yml` wird
nur durch validierte `v*.*.*`-Tags ausgelöst. Zwei getrennte Architekturjobs
veröffentlichen interne Tags. Erst nach beiden Erfolgen entsteht das
versionierte Multi-Arch-Manifest. Ein anschließender Container-Smoke-Test
verwendet ausschließlich einen lokalen Supervisor-/HA-Mock mit Fake-
Credential. Erst danach wird ein GitHub Release erzeugt; `latest` entsteht nur
bei Stable, niemals bei einem RC.

`release/create-standalone-bundle.js` erzeugt deterministisch
`ha-legacy-dashboard-1.0.0-rc.1.tar.gz` und `SHA256SUMS`. Das Archiv enthält
Runtime-Quellcode, npm-Lockfile, `.env.example`, Readmes, Changelog, Lizenz,
Standalone-Deploymentdokumentation, systemd-Unit und `VERSION`. Ausgeschlossen
sind `.env`, `node_modules`, Tests, Daten, Git-Metadaten, Screenshots, Schlüssel
und Logs. Zwei unabhängig erzeugte Archive waren bytegleich; die lokale
SHA256-Prüfung und Tar-Inhaltsprüfung waren erfolgreich.

Die Upgrade-Regression initialisiert sowohl einen simulierten Standalone-
Datenpfad als auch einen App-`/data`-äquivalenten Pfad, persistiert Dashboards,
Summary-Privacy, Entity Rules, Security-Entities, Critical-Label-Modus,
Grace-Regeln und Expected Offline und lädt sie nach dem simulierten
Versionswechsel unverändert neu. Theme bleibt browserlokal und wird von keinem
Release-Artefakt berührt. Die bestehende atomare Primär-/Backup-Semantik bleibt
unverändert.

Das Release Security Gate scannt alle verfolgten und nicht ignorierten Quellen
auf private Dateinamen, Private-Key-Header und verbreitete Tokenmuster. Root-
und App-Docker-Kontexte schließen `.env`, Daten, Schlüssel, Tests und Logs aus.
CI verwendet `github.token`, keine Registry-PATs, keine HA-/Supervisor-/Admin-
Secrets und keine Produktions-HA-Adresse. Der Produktionsaudit meldet keine
bekannten Schwachstellen. Die bestehenden HA-Write-Allowlists, backend-only
Credentials und Browser-Payloads wurden nicht verändert.

Die vollständige lokale Regression besteht nach der finalen Korrektur mit 257
von 257 Tests; sämtliche JavaScript-Dateien unter `src/`, `test/` und
`release/` bestehen `node --check`, alle Shellskripte `sh -n`, und die GitHub-
Workflow-, Repository- und App-YAML-Dateien wurden lokal geparst. Da auf dem
Entwicklungs-Mac kein Docker/Buildx installiert ist, sind der echte lokale
amd64/aarch64-Build, Manifest-Push und Container-Smoke-Test dort nicht
ausführbar. Diese Prüfungen sind verbindlich im GitHub-Workflow implementiert,
aber erst nach Review und Tag-Push tatsächlich auszuführen.

`docs/RELEASING.md` dokumentiert RC und Stable, Fresh Install und Upgrade für
App und Standalone, Backup/Rollback, GHCR-/Manifestprüfung, minimale CI-Rechte,
Failure Atomicity, Secret Gate sowie manuelle Legacy-Safari- und Test-HAOS-
Checklisten. README Deutsch und Englisch bleiben semantisch synchron und
verlinken die offizielle My-Home-Assistant-Repository-Weiterleitung. Die
öffentliche GHCR-Sichtbarkeit, das echte GitHub-Prerelease, eine reale HAOS-
Installation, das App-Update mit `/data`, aarch64-Runtime und die physische
iOS-9-Abnahme bleiben bewusste manuelle Schritte. Da keine sichtbare
Produktoberfläche geändert wurde, sind keine Screenshots oder Asset-
Cacheversionen zu aktualisieren.

## 20. Sprint 25.1 – Pre-Release UI State & Filter Correctness

Sprint 25.1 startet auf dem sauberen, mit `origin/main` identischen Commit
`10c1f75`. Der Commit enthält bereits die Sprint-25.1-Spezifikation; die
produktive Sprint-25-Implementierung liegt im vorherigen Commit `6628d81`.

Die Theme-Regression lag nicht in getrennten Route-Keys: Default-, Custom- und
System-Dashboards luden bereits dasselbe `ha-legacy-theme`. Der reale
Fehlerpfad war die alte Storage-Abstraktion: Stellt Safari `localStorage`
bereit, lehnt `setItem()` aber ab, wurde die Exception nur abgefangen. Beim
nächsten Dokument- oder Routenladen las `Theme.loadEarly()` deshalb `null` und
setzte Light. Die bisherigen Tests bestätigten lediglich, dass der laufende
JavaScript-Kontext nach dem Fehler bedienbar blieb.

`src/public/js/core/theme.js` behält genau diese globale logische Präferenz.
Es validiert nur `light` oder `dark`, liest primär `localStorage` und fällt auf
eine gleichnamige, nicht sensible Cookie-Kopie mit `path=/` zurück. Beim
bewussten Umschalten werden beide Backends gespiegelt. Kann auch das Cookie
nicht gelesen oder geschrieben werden, werden alle Exceptions abgefangen und
der aktuelle In-Memory-State bleibt nutzbar. Das Theme-Skript läuft auf
`index.html` und `system.html` weiterhin vor den Styles: lesen, validieren,
Root-Klasse anwenden, später Body und Toggle synchronisieren. Die sichere
Return-Navigation arbeitet nur mit internen Pfaden und verändert keinen
Theme-State. Der moderne Admin besitzt kein globales Oberflächen-Theme; sein
Light-/Dark-Schalter bleibt ausschließlich eine Card-Preview-Einstellung.

Beim Error Dashboard waren Severity- und State-Predicates bereits exakte
Vergleiche und am selben Child per UND verbunden. Der Renderpfad übergab aber
anschließend die ungefilterte Device Group an die Karte. Damit blieben
Kartenklasse, Badge, Issue-Count und Gruppenmetadaten auf der ursprünglichen
höchsten Severity; eine Info-Teilmenge konnte somit weiterhin als Warning oder
Critical erscheinen.

Die neue reine Frontend-Presentation-Pipeline filtert zuerst die Child-Issues,
verwirft Gruppen ohne Treffer und baut eine flache, nicht mutierende
Darstellungskopie. `visibleSeverity`, sichtbare Counts, Dauer, Security-Flag,
Unavailable/Unknown sowie Flapping/Recovery werden nur aus den passenden
Children abgeleitet. Das Original-Payload, `group.severity`, Backend-
Klassifikation, Sprint-22-Regeln, Automation Impact, Overall Status und der
separate Sprint-21.5-Health-Endpunkt bleiben unverändert. Aufgeklappte Details
erhalten ausschließlich die bereits gefilterten Children. Dadurch sind
Critical, Error, Warning und Info exakte Teilmengen; kombinierte Statusfilter
können keinen Treffer mehr aus zwei unterschiedlichen Children konstruieren.

Die gemeinsame Assetversion ist 43. Der vollständige Lauf mit ausschließlich
localhost-Mocks und Fake-Credentials besteht mit 260 von 260 Tests. Die neuen
Regressionen prüfen Dark und Light über Default, Custom, Summary, Errors und
Return, LocalStorage-/Cookie-Ausfälle, ungültige Werte, alle vier exakten
Severity-Karten, sichtbare Child-Counts und Details, Status-UND, Cross-Child-
Abwehr, Payload-Unveränderlichkeit, konstanten Overall Health und ausbleibende
zusätzliche HA-Abfragen. Alle Frontenddateien bleiben ES5; es gibt keine neue
Route, HA-Abfrage oder Write-Fähigkeit. Das vollständige Release Test Gate für
`v1.0.0-rc.1` besteht einschließlich Versionskonsistenz, Syntaxprüfungen und
Secret Scan. Die physische iPad-Abnahme bleibt vor Freigabe offen.

Der Standalone-Rollout am 26. August 2026 aktualisierte den sauberen LXC per
Fast-Forward von `6628d81` auf `a438e3c`. Direkt auf dem LXC bestanden erneut
260 von 260 Tests. `ha-legacy-dashboard.service` ist aktiv; `/health`,
`/api/status`, `/api/dashboard` und `/api/system-dashboards/status` antworteten
anschließend jeweils mit HTTP 200. Es wurden weder ein reales HA-Token
ausgegeben noch ein Release-Tag oder öffentliches Release erzeugt.

README Deutsch und Englisch wurden semantisch synchron ergänzt. Die echten
D1-Screenshots wurden geprüft: Die Theme-Farben und das ungefilterte
Systemstatus-Layout ändern sich nicht; der Fix korrigiert ausschließlich
persistenten Zustand und gefilterte Präsentationsdaten. Daher wäre ein neuer
Screenshot ohne reale zusätzliche Aussage und wurde nicht erzeugt. Die reale
iPad-mini-, optionale iPad-Air-2- und macOS-Safari-Abnahme bleiben vor einer
Stable-Empfehlung verbindlich.

## 21. Sprint 25.2 – HomeScreen Standalone Navigation Correctness

Sprint 25.2 startet auf dem sauberen, mit `origin/main` identischen Commit
`94c7efa`. Die Implementierung wurde nach Review als `c432d7c` committet, auf
`origin/main` gepusht und auf den LXC ausgerollt.

Die Root Cause lag in der Navigationsart des Legacy-Frontends: Summary,
Health/Errors und die meisten System-Dashboard-Links waren gewöhnliche
`<a href>`-Links. Nur der besondere Zurück-Fall ohne explizites `returnTo`
hatte einen Click-Handler. In normalem Safari blieb ein solcher Link im Tab;
altes Mobile Safari kann native Link-Navigation aus einer vom HomeScreen
gestarteten Web-App jedoch an die normale Safari-App übergeben. Im Wall
Display waren weder `target="_blank"` noch `window.open()`, absolute interne
URLs, ein Host-/Port-/Protokollwechsel oder ein Ingress-Wechsel beteiligt.
Der moderne Admin enthielt allerdings drei interne `_blank`-Fälle derselben
Fehlerklasse: Summary, Errors und die Dashboard-Vorschau.

`src/public/js/core/system-navigation.js` besitzt jetzt eine gemeinsame
ES5-Funktion `navigateInternal(path)`. Ihr vorgeschalteter Validator akzeptiert
nur `/`, gültige `/d/<dashboard-id>`-Pfade sowie `/system/summary` und
`/system/errors`; bei Systemrouten ist höchstens ein gültiges, internes
`returnTo` erlaubt. Absolute und protokollrelative URLs, `javascript:`,
`data:`, `blob:`, Fragmente, unbekannte Routen und manipulierte Queries werden
abgelehnt. Relative Root-Pfade und `window.location.href` erhalten automatisch
dasselbe Protokoll, denselben Host und denselben Port und benötigen kein
Ingress.

Alle vier Wall-Display-Navigationsrichtungen – Dashboard zu Summary,
Dashboard zu Errors, Summary/Errors untereinander und zurück zum Default- oder
Custom-Dashboard – verwenden jetzt denselben Helper. Die echten `href`-Werte
bleiben als Fallback erhalten, Links erhalten `_self`, und genau ein
Click-Handler verhindert die native Standardnavigation. Es wurde kein
zusätzlicher Touch-Handler ergänzt, sodass kein `touchend`/`click`-Doppelpfad
entsteht. Die Admin-Links öffnen ebenfalls im aktuellen Fenster. Die Logik
hängt nicht von `navigator.standalone` ab und verhält sich deshalb in einem
normalen Safari-Tab gleich.

Sprint 21.5 behält seine validierten Return Targets und den serverseitigen
Open-Redirect-Schutz. Sprint 25.1 behält die globale Theme-Persistenz und die
exakte Severity-/Status-Filterung; die vollständige Suite prüft diese
Regressionen erneut. Es wurden keine Backendroute, Home-Assistant-Abfrage,
Credential-Grenze, Write-Route oder Allowlist verändert. Die gemeinsame
Legacy-Assetversion ist 44. Da keine sichtbare Geometrie oder Fachanzeige
geändert wurde, bleiben die echten D1-Screenshots repräsentativ.

Automatisierte Tests decken beide Werte von `navigator.standalone`, Default-
und Custom-Dashboards, Summary, Errors, Back, wiederholbare relative
Same-Window-Ziele, externe/protokollrelative/aktive Protokolle, ungültige
Return Targets, `_blank`-/`window.open`-Guards und ES5 ab. Diese Simulation
kann nicht bestätigen, dass physisches iOS keine Safari-UI öffnet. Lokal
bestehen 265 von 265 Tests; das RC-Gate bestätigt zusätzlich konsistente
Versionen, alle JavaScript-Syntaxprüfungen und einen erfolgreichen Secret Scan.
Deshalb bleiben die reale iPad-mini-HomeScreen-Abnahme, dieselben Rundreisen
auf dem iPad Air 2 und der normale macOS-Safari-Test vor einer Stable-
Empfehlung verbindlich.

Der Standalone-Rollout aktualisierte den sauberen LXC per Fast-Forward von
`de7fad0` auf `c432d7c`. Direkt auf dem LXC bestanden erneut 265 von 265 Tests.
`ha-legacy-dashboard.service` ist aktiv; `/health`, `/api/status`,
`/api/dashboard` und `/api/system-dashboards/status` antworteten anschließend
jeweils mit HTTP 200. Es wurden keine Zugangsdaten ausgegeben und weder ein
Release-Tag noch ein öffentliches Release erzeugt.

## 22. Sprint 25.3 – Dashboard Backgrounds & Full-Height Layout

Sprint 25.3 startet auf dem sauberen, mit `origin/main` identischen Commit
`c8d452b`. Der Stand wurde nach Review als `f010350` committet, auf
`origin/main` gepusht und auf den Standalone-LXC ausgerollt.

Das persistente Dashboard-Schema ist Version 9. Jedes normale Default- oder
Custom-Dashboard besitzt `showTitle` sowie entweder `background: null` oder
ein Objekt mit einer generierten `imageId`, einer aus fünf festen Positionen,
`cover`/`contain` und einer Abdunklung von 0 bis 50 Prozent in Zehnerschritten.
Schema 8 migriert atomar mit `showTitle: true` und ohne Hintergrund. Summary
und Errors bleiben feste System-Dashboards ohne Hintergrundkonfiguration.

JPEG und PNG werden ausschließlich über
`POST /api/admin/dashboards/:dashboardId/background` als roher Bildkörper
hochgeladen. Die bestehende Bearer-Authentifizierung und das Admin-Write-
Rate-Limit laufen vor dem Body-Parser. Der Server prüft den exakten MIME-Typ,
JPEG-/PNG-Signatur und Struktur, positive Abmessungen, höchstens 4096 × 4096
Pixel beziehungsweise 16.777.216 Pixel sowie maximal 10 MiB. SVG, HTML,
abweichende MIME-Typen, ungültige IDs und Pfadtraversierung werden kontrolliert
abgewiesen. Sichere zufällige Namen haben die Form
`bg-<32 hex>.jpg|png`; Verzeichnis und Dateien verwenden 0700/0600.

Assets liegen unter `<DATA_DIR>/backgrounds`. Damit bleibt Standalone beim
bisherigen `data/backgrounds` und die Home Assistant App bei
`/data/backgrounds`. Ein Upload wird zunächst über temporäre Datei, `fsync`
und Rename atomar abgelegt. Erst nach erfolgreicher atomarer
Konfigurationspersistenz wird das alte Asset gelöscht; bei einem Fehler bleibt
der vorige gültige Hintergrund erhalten. Das Entfernen persistiert zuerst die
Konfiguration und löscht danach nur das zugeordnete Asset. Entfernte
Dashboards werden nach erfolgreichem Batch-Speichern ebenfalls bereinigt.

Das Wall-Display erhält nur die bereinigte URL
`/assets/backgrounds/<imageId>` sowie Position, Größe und Overlay. Die Route
liefert nur eine aktuell referenzierte, streng validierte Bild-ID mit
`nosniff` und immutable Cache aus; der übrige Datenpfad besitzt weder Static
Serving noch Directory Listing. Ersetzen erzeugt stets eine neue ID und
umgeht so aggressive Legacy-Safari-Caches. Fehlende Assets führen lediglich
zu einem fehlenden Hintergrund, nicht zu einem Dashboard-Ausfall.

Der moderne Admin ergänzt Upload, gespeicherte Vorschau, Ersetzen und
Entfernen sowie Batch-Einstellungen für Position, Cover/Contain, Overlay und
Titelanzeige. Andere offene Konfigurationsänderungen müssen vor einer direkten
Asset-Operation gespeichert oder verworfen werden. Die Layout-Vorschau zeigt
Hintergrund, Overlay und optionalen Titel gemeinsam mit den echten Card-
Vorschauen. Duplikate übernehmen die Titelanzeige, aber absichtlich nicht die
Asset-ID, sodass ihr Hintergrund unabhängig bleibt.

Im Legacy-Frontend setzt eine ES5-Funktion die ausschließlich servervalidierte
Darstellung. `showTitle=false` entfernt Brand und Titelabstand, während
Summary, Health, Verbindung, Uhr und Theme erreichbar bleiben. Der Focus-
Layer liegt weiterhin oberhalb von Hintergrund und Overlay. Die globale
Sprint-25.1-Theme-Persistenz und die Sprint-25.2-Same-Window-Navigation wurden
nicht verändert. Die gemeinsame Wall-Assetversion ist 45.

`html`, `body` und `.app` propagieren die volle Höhe; `.app` ist eine
iOS-9-kompatible Flex-Spalte und das Dashboard übernimmt den freien Raum. Eine
kleine `window.innerHeight`-Synchronisierung berücksichtigt den tatsächlichen
HomeScreen-Viewport bei Start und Rotation. Bei wenig beziehungsweise null
Cards bleibt der einzeilige, mittige Aktualisierungs-Footer unten; bei vielen
Cards wächst der Inhalt normal und der Footer folgt ihm. Er ist nicht fixed
und überdeckt keine Card. Die Versionsangabe wurde aus normalen Dashboards
entfernt und ist dezent im Admin sowie in Summary/Errors als
`1.0.0-rc.1` auffindbar.

Relevante Dateien:

- Schema/Public Config: `src/config/dashboard.js`
- sicherer Asset-Speicher: `src/services/dashboard-backgrounds.js`
- Admin API und Bereinigung: `src/routes/admin.js`
- kontrolliertes Asset Serving: `src/server.js`
- Admin UI: `src/admin/index.html`, `src/admin/js/api.js`,
  `src/admin/js/dashboards.js`, `src/admin/js/app.js`,
  `src/admin/css/admin.css`
- Legacy-Darstellung: `src/public/index.html`, `src/public/js/app.js`,
  `src/public/css/style.css`
- Tests: `test/sprint-25-3.test.js`, `test/admin-api.test.js` sowie die
  aktualisierten Schema-/Cache-Regressionsprüfungen

Die isolierten Tests verwenden nur temporäre lokale Datenverzeichnisse,
localhost-Mocks und Fake-Credentials. Die vollständige Suite ist mit
275 von 275 Tests erfolgreich. `node --check` ist für alle geänderten und
neuen JavaScript-Dateien erfolgreich; `git diff --check` und der Scan des
Wall-Frontends auf ausgeschlossene moderne JavaScript-Merkmale sind ebenfalls
sauber. Eine reale Home-Assistant-Instanz wurde dabei nicht kontaktiert.

Die sichtbaren Dashboard-/Admin-Änderungen wurden gemäß Sprint D1 mit der
echten Anwendung gegen einen kontrollierten lokalen Mock und Fake-Credentials
neu aufgenommen. Aktualisiert sind `main-light.png` und `main-dark.png`; neu
hinzugekommen sind `dashboards/background-image.png` und
`admin/dashboard-background.png`. Die Aufnahmen enthalten keine Tokens,
internen Adressen oder privaten Produktionsdaten. Die Browserprüfung bestätigt
für 768 × 1024 den vollständig gefüllten Viewport und den Footer bei 1006 von
1024 Pixeln sowie für 1280 × 720 eine Dokumenthöhe von 720 Pixeln und den
Footer bei 702 Pixeln. Titel aus blendet den Titel aus, während Summary
erreichbar bleibt; Browserkonsole und Warnungsprotokoll bleiben leer.

Vor einer Stable-Empfehlung bleiben die physische Abnahme auf iPad mini/iOS 9,
iPad Air 2/iPadOS 15 und macOS Safari sowie Portrait, Landscape, Rotation,
HomeScreen, Light/Dark, unterschiedliche Hintergründe, fehlendes Asset und
0/1/wenige/viele Cards verbindlich.

Der Standalone-Rollout aktualisierte den sauberen LXC per Fast-Forward von
`29722a6` auf `f010350`. Direkt auf dem LXC bestanden erneut 275 von 275 Tests
einschließlich Syntax-, Security- und Integrationsprüfungen.
`ha-legacy-dashboard.service` ist aktiv; `/health`, `/api/status` und die
öffentliche Dashboard-Konfiguration antworteten anschließend jeweils mit
HTTP 200. Das persistente `data`-Verzeichnis gehört `dashboard:dashboard` und
hat Modus 0700; `data/backgrounds` wird sicher beim ersten Upload erzeugt. Es
wurden keine Zugangsdaten ausgegeben und weder ein Release-Tag noch ein
öffentliches Release erzeugt.

## 23. Sprint 25.4 – RC Validation

Sprint 25.4 prüfte den sauberen Stand `741bba4` als `v1.0.0-rc.1`. Es wurden
keine Produktfunktionen verändert. Die vollständige Ergebnismatrix,
Einzelprüfungen und offenen Pflichtabnahmen stehen in `docs/RC_CHECKLIST.md`.

Das lokale Release Gate, der reale LXC-Deployment-Check und beide GitHub-
Workflows bestanden jeweils mit 275 von 275 Tests. `npm audit` meldete keine
Schwachstellen. Der GitHub-Prerelease, das Standalone-Bundle und
`SHA256SUMS` wurden veröffentlicht und öffentlich verifiziert. Das anonyme
GHCR-OCI-Manifest enthält `linux/amd64` und `linux/arm64`; der Release-
Container-Smoke-Test bestand. Der RC-Tag zeigt auf den exakt geprüften Commit.

Der Standalone-LXC war sauber auf diesem Commit, lief unprivilegiert als
`dashboard`, verwendete ausschließlich die Standalone-Credentials und behielt
seine 0600-Dashboard-Konfiguration unverändert über einen Dienstneustart.
HA REST und die ausschließlich backendseitige HA-WebSocket-Diagnose waren
verfügbar. Default und Custom Dashboard, Summary, Errors, Theme-Persistenz,
Same-Origin-Navigation, exakte Error-Filter, Focus und Full-Height-Footer
wurden im laufenden LAN-System geprüft. Die letzten Dienstlogs enthielten
keine Secret-, Stacktrace- oder Reconnect-Schleifen-Muster.

Eine Stable-Empfehlung ist noch blockiert. Es stand keine reale HAOS-
Testinstanz für Repository-Installation, Supervisor REST/WebSocket, direkten
LAN-Zugriff, `/data`-Persistenz, App-/HA-Restart und Backup/Restore zur
Verfügung. Ebenso war kein steuerbarer iPad-mini-/iOS-9-Lauf für HomeScreen,
Theme, Filter, Backgrounds, Footer, Rotation, Focus und Controls verfügbar.
Diese Punkte sind deshalb ausdrücklich `BLOCKED` und nicht aus Mock- oder
Desktop-Tests als bestanden abgeleitet.

## 24. Sprint 25.5 – HAOS Network Access & Background Upload Hardening

Sprint 25.5 startete auf dem sauberen, mit `origin/main` identischen Commit
`02abf11`. Die inzwischen durchgeführte reale HAOS-Abnahme bestätigt, dass das
Custom-App-Repository hinzugefügt, die App installiert und gestartet werden
kann. Default und Custom Dashboard sind auf dem iPad mini erreichbar; die
bestehenden Light-/Climate-Power-Controls funktionieren. Der direkte LAN-
Zugriff über die HAOS-IPv4 und Port 3000 bleibt unverändert funktionsfähig.

Der Hostnamefehler ist als Dual-Stack-Netzwerk-/mDNS-Fall eingegrenzt. Auf dem
getesteten Client liefert `homeassistant.local` sowohl `192.168.1.16` als auch
globale und link-lokale IPv6-Adressen. Port 8123 ist über IPv6 erreichbar,
der veröffentlichte App-Port 3000 jedoch nicht. `curl -4` und die direkte
IPv4-URL liefern für `/health` HTTP 200, während `curl -6` auf Port 3000
scheitert. Die App bindet korrekt an `0.0.0.0:3000`, `config.yaml` veröffentlicht
`3000/tcp` auf Host-Port 3000 und die WebUI-Vorlage nutzt
`http://[HOST]:[PORT:3000]/`. Damit liegt kein Anwendungs- oder WebUI-URL-Fehler
vor. Es wurden weder Host-Networking noch zusätzliche App-Rechte oder andere
Netzwerk-Hacks ergänzt. Für Wall-Displays ist eine reservierte/statische IPv4
oder ein lokaler DNS-Name mit eindeutigem A-Record dokumentiert.

Die JPEG-Ursache lag im serverseitigen Strukturprüfer: Nach dem ersten SOS-
Marker behandelte er die komprimierten Entropiedaten weiter als reguläre
JPEG-Segmente. Gültiges Byte-Stuffing (`FF 00`), Restart-Marker oder gewöhnliche
komprimierte Bytes konnten deshalb als falsche Segmentlänge gelesen werden und
den kontrollierten Fehler „JPEG-Segment ist ungültig“ auslösen. Der Parser
trennt jetzt Marker- und Scanmodus, akzeptiert Byte-Stuffing und Restart-Marker,
kehrt für weitere progressive Scans sauber in den Markermodus zurück und
verlangt weiterhin vollständigen Frame, Scan und EOI.

Tests verwenden echte, lokal erzeugte 8×8-JPEG-Fixtures für Baseline und
Progressive sowie JFIF/APP0, EXIF/APP1 mit Orientation, EXIF mit eingebettetem
JPEG-Thumbnail und ICC/APP2. Alle Varianten wurden zusätzlich von Pillow als
echte Bilder dekodiert. `.jpg` und `.jpeg` verwenden denselben geprüften
`image/jpeg`-Pfad. HTML oder SVG mit JPEG-Endung, abgeschnittene oder
strukturell ungültige JPEGs, übergroße Dateien/Abmessungen und Pfadtraversierung
bleiben abgewiesen.

Der Admin-API-Regressionstest ersetzt einen vorhandenen Hintergrund zunächst
mit einem ungültigen JPEG und bestätigt HTTP 400, unveränderte Public Config,
erhaltenes altes Asset und das Fehlen von Teil- oder Fremddateien. Erst ein
anschließendes gültiges Progressive-JPEG wird atomar übernommen. Bearer-
Authentifizierung, Rate Limit, `DATA_DIR`-/`/data`-Grenze, HA-/Supervisor-
Token-Isolation und die bestehenden Home-Assistant-Write-Allowlists wurden
nicht verändert.

`data/backgrounds/` ist nun ausdrücklich von Git ausgeschlossen. Persistente
Standalone-Bilder erscheinen dadurch nicht mehr als unversionierte Quellen
und blockieren kein sicheres Fast-Forward-Deployment; vorhandene Bilder werden
dabei weder verschoben noch gelöscht.

`node --check` bestand für alle geänderten und neuen JavaScript-Dateien. Das
vollständige Release Gate bestand lokal und auf dem LXC mit 283 von 283 Tests,
0 Fehlern, einschließlich
Shell-Syntax, Versionskonsistenz, Secret Scan, reproduzierbarem Bundle und
allen Sprint-25.1-/25.2-/25.3-Sicherheitsregressionen. Es wurden nur lokale
Fixtures, temporäre Datenpfade, localhost-Mocks und Fake-Credentials verwendet;
keine Produktions-`.env` und keine reale HA-API wurden für automatisierte Tests
kontaktiert.

Der Standalone-Rollout aktualisierte den LXC ohne Änderung der vorhandenen
`data/backgrounds` auf `42d88f3`. Dienstneustart, `/health`, `/api/status` und
Dashboard-Metadaten bestanden; Gateway und reale backendseitige HA-Verbindung
meldeten online, fünf Widgets wurden geladen. Der Remote-Arbeitsbaum ist durch
den neuen Ignore-Eintrag wieder sauber.

Vor einer Stable-Empfehlung muss die korrigierte Version als neuer, nicht den
immutablen RC.1 überschreibender HAOS-Build installiert werden. Danach sind
JPEG-Upload/Replace/Remove mit echten Bildern, `/data`-Persistenz über App- und
HA-Neustart, Backup/Restore, Supervisor REST/WebSocket und App-Logs erneut real
abzunehmen. Auf dem iPad mini bleiben außerdem Theme über alle Routen, exakte
Error-Filter, HomeScreen-Navigation, Background-Darstellung, Footer/Rotation
und alle Focus-Controls als zusammenhängender Release-Gate-Lauf offen.

## 25. Sprint 25.6 – Card Size Matrix & Responsive Layout Hardening

Sprint 25.6 startete auf dem sauberen, mit `origin/main` identischen Commit
`91045b8`. Die tatsächliche Wall-Ausgabe unterstützt genau vier Renderer:
`SensorWidget`, `BinaryWidget`, `LightWidget` und `ClimateWidget`. Es gibt
keine produktiven Renderer oder erlaubten Konfigurationstypen für Switch,
Cover, Fan, Lock, Media Player oder Vacuum.

Die vollständige Größenquelle ist die serverseitige Layoutvalidierung. In
Portrait gelten sechs, in Landscape zwölf Spalten und jeweils Höhen von eins
bis vier Rasterzeilen. Sensor, Binary und Light erlauben Breiten von 2–6 bzw.
2–12; Climate erlaubt 2–6 bzw. 3–12. Daraus entstehen 252 gültige
Typ-/Profil-/Größenkombinationen. Mit 4 Sensor-, 4 Binary-, 4 Light- und 6
Climate-Zuständen rendert der neue Test-Harness 1.128 Fälle. Die vollständige
Herleitung steht in `docs/CARD_MATRIX.md`.

Die Ursache der großen Climate-Fehlausrichtung war keine einzelne iPad-
Abweichung, sondern das zu grobe Präsentationsmodell. Es unterschied nur
Compact, Normal und Expanded; Expanded vergrößerte überwiegend Icon und Wert,
ohne Climate eine eigenständige Large-Hierarchie zu geben. Zusätzlich lag die
Target-Zone als `width: 100%`-Flex-Kind neben dem aktuellen Temperaturblock.
Beide Breiten konnten dadurch zusammen größer als die Card werden, während
große Flächen in anderen Fällen ungenutzt blieben.

Grid-Geometrie und Widget-Presentation bleiben getrennt. Die Geometrie setzt
weiterhin nur Position und Pixelmaße. `LegacyPresentation` wertet zusätzlich
Renderer-Typ, `w`/`h`, effektive Pixelbreite/-höhe, Capabilities, Control-Anzahl,
Sekundärinhalt und Inhaltsdichte aus und vergibt genau einen der Tiers
`compact`, `standard`, `wide`, `tall` oder `large`. Admin-Vorschau und
Wall-Display nutzen dieselbe Entscheidung; die Focus-Geometrie aus Sprint 17.5
bleibt davon isoliert.

Climate Large besitzt nun eine bewusste großflächige Hierarchie: Identität und
HVAC/Action im Header, Current als eigener großer Bereich und Target zusammen
mit Minus, Plus und Power als klar begrenzte Control-Zone. Standard, Wide,
Tall und Compact besitzen ebenfalls explizite Anordnungen. Lange Sensorwerte
und Units sowie lange Binary-Zustände werden tierabhängig verkleinert,
umgebrochen oder mit Legacy-kompatiblem Ellipsis begrenzt. Sichtbare Controls
bleiben mindestens ungefähr 44 × 44 Pixel groß.

Die Quelltests bestanden vollständig mit 290 von 290 Tests. Alle geänderten
JavaScript-Dateien bestanden `node --check`. Der browserbasierte Matrix-Harness
lief im Codex-In-App-Browser mit 1.128 von 1.128 Fällen ohne Overflow,
Clipping, fehlende oder doppelte Controls, ungültige Tier-Klassen oder zu
kleine sichtbare Touchziele. Große Climate-Cards wurden in repräsentativen
Portrait- und Landscape-Abmessungen zusätzlich visuell geprüft. Es wurden nur
Mock-Zustände verwendet und keine reale Home-Assistant-Instanz kontaktiert.

Die Home-Assistant-Write-Routen und Entity-Allowlists sind unverändert. Das
Wall-JavaScript bleibt ECMAScript 5, die Darstellung Flexbox-basiert und frei
von CSS Grid, Flexbox `gap`, Container Queries oder modernen Modul-/Promise-
Abhängigkeiten. Die produktive Assetversion wurde einheitlich von 45 auf 46
erhöht. Die vorhandenen Produkt-Screenshots bleiben als allgemeine Oberfläche
repräsentativ; der neue Test-Harness ist bewusst kein Produkt-Screenshot.

Für die RC-Freigabe bleibt die Realgerät-Abnahme `BLOCKED`: Climate Compact,
Standard, Wide, Tall und Large müssen auf dem iPad mini in Portrait und
Landscape einschließlich Rotation, langem Namen, Off/Unknown/Unavailable,
Minus/Plus/Power und Focus geprüft werden. Zusätzlich bleiben Light-Power,
lange Sensor-/Binary-Inhalte, Theme, Background-Lesbarkeit, HomeScreen und
Footer Teil des zusammenhängenden iPad-Release-Gates.

Der Standalone-Rollout aktualisierte den sauberen LXC per Fast-Forward von
`91045b8` auf `03648a9`. Das Deployment-Gate bestand dort ebenfalls mit 290
von 290 Tests. Der Dienst wurde regulär neu gestartet; Git-Stand und
`origin/main` waren identisch, `systemctl` meldete `active` und der produktive
Health-Check meldete Gateway, Home Assistant sowie Dashboard online und fünf
geladene Widgets. Persistente Konfiguration und Background-Assets wurden nicht
verändert.

## 26. Sprint 25.7 – Legacy iPad Kiosk Deployment & Guided Access Validation

Sprint 25.7 startete auf dem sauberen, mit `origin/main` identischen Commit
`2cf2d23`. Der Sprint ändert kein Anwendungsverhalten. Die neue Betriebsanleitung
`docs/IPAD_KIOSK.md` dokumentiert für das iPad mini 1 mit iOS 9.3.5 den
historischen Pfad `Einstellungen > Allgemein > Bedienungshilfen > Geführter
Zugriff`, Codeeinrichtung, Home-Dreifachklick, Sitzungsoptionen, sicheren Exit,
Auto-Lock-/Dauerstrombetrieb und Wiederanlaufgrenzen.

Für ein einzelnes privates Wall-Display ist Geführter Zugriff die Empfehlung.
Touch bleibt aktiv; Standby-Taste, Lautstärke, Bewegung/Rotation, Tastatur und
Zugriffszeit werden bewusst je Betriebsziel gesetzt. Es werden keine sperrbaren
Bildschirmflächen empfohlen, weil diese nach Rotation Navigation oder Controls
verdecken können. Der iOS-9-Systempfad zur automatischen Sperre wird getrennt
von modernen, in historischen Anleitungen nicht belegten Guided-Access-
Optionen behandelt.

Geführter Zugriff wird ausdrücklich nicht als vollverwalteter Auto-Start-Kiosk
beschrieben. Nach iPad-Reboot, vollständigem Stromverlust oder Beenden der
HomeScreen-Web-App kann ein manueller Start erforderlich sein. WLAN-Reconnect,
Home-Assistant-Neustart, HA-Legacy-Dashboard-App-/Dienstneustart und dauerhafte
Display-Aktivität sind als konkrete physische Prüfpunkte dokumentiert.

Für mehrere verwaltete Geräte beschreibt die Anleitung Supervision plus Single
App Mode/App Lock über Apple Configurator oder MDM als strengere Alternative.
Aktuelle Enrollment-Menüs werden nicht auf iOS 9 übertragen; Webclip-Eignung,
Configurator-/MDM-Kompatibilität und Reboot-Wiederanlauf müssen mit der
tatsächlich eingesetzten Verwaltungsumgebung geprüft werden. MDM ist für ein
einzelnes privates Gerät keine Voraussetzung.

Die Sprint-25.2-Same-Origin-/Same-Window-Navigation und Standalone-Metadaten
sind repositoryseitig vorhanden. Die Anleitung bewahrt alle bestehenden
Sicherheitsgrenzen: kein HA-/Supervisor-Token im Browser, keine automatische
Admin-Anmeldung, getrenntes `ADMIN_TOKEN` und unveränderte Write-Allowlists.

Die vollständige lokale Testsuite bestand mit 290 von 290 Tests. Dazu gehören
die Sprint-25.2-HomeScreen-Navigation, sichere Return Targets, fehlende neue
Fenster, Standalone-Metadaten, ES5-Kompatibilität und unveränderte HA-Write-
Flächen. Die Tests verwendeten ausschließlich lokale Mocks und Fake-
Credentials. Da keine Anwendung und keine sichtbare Produktoberfläche geändert
wurde, waren weder JavaScript-Syntaxprüfungen noch neue Screenshots erforderlich.

Die vollständige manuelle Checkliste umfasst HomeScreen-Vollbild, Guided-
Access-Start und -Exit, Home-Taste, Summary, Errors, Custom Dashboard,
Light/Climate, Rotation, Display-Dauerbetrieb, WLAN- und Backend-Reconnect sowie
iPad-Reboot/Stromverlust. Mangels fernsteuerbarer iOS-9-Hardware bleiben diese
Realgerätpunkte offen und sind kein bestandener Release Gate.

## 27. Sprint 26 – Persistent Dashboard Sections

Sprint 26 startete auf dem sauberen, mit `origin/main` identischen Commit
`6e94ea8`. Das vorhandene Dashboardmodell wurde additiv von Schema 9 auf
Schema 10 erweitert; es gibt keine zweite Konfigurationsdatei und kein
paralleles Layoutformat.

Jedes Default- oder Custom-Dashboard besitzt nun `sections`. Ein Abschnitt
enthält die stabile ID, Titel, numerische Reihenfolge, `showTitle` und optional
eine read-only `areaId`. Widgets referenzieren einen Abschnitt optional über
`sectionId`; `null` bedeutet „Nicht zugeordnet“. Schema-9-Konfigurationen
migrieren atomar mit leerer Abschnittsliste und nicht zugeordneten Widgets.
Die vorhandenen Layoutkoordinaten, Hintergründe, Dashboardtitel und System-
Dashboard-Regeln bleiben dabei unverändert. Dashboards ohne Abschnitte nehmen
weiterhin exakt den bisherigen einzelnen Rasterpfad.

Die bestehenden Portrait-/Landscape-Layouts bleiben die einzige persistente
Geometriequelle. `x`, `y`, `w` und `h` werden bei vorhandenen Abschnitten als
abschnittslokale Koordinaten interpretiert. Kollisionen werden deshalb nur
zwischen sichtbaren Widgets desselben Abschnitts beziehungsweise innerhalb
der nicht zugeordneten Gruppe geprüft. Das Wall-Display ordnet Abschnitte
vertikal an und wendet das vorhandene absolute Flexbox-Raster separat auf die
jeweilige Widget-Teilmenge an. Es wurde weder CSS Grid noch eine zweite
Drag-and-drop-Geometrie in das Legacy-Frontend eingeführt. Focus bleibt über
Widget-ID und State gebunden und außerhalb der Grid-Geometrie.

Der geschützte Admin-Editor kann Abschnitte erstellen, umbenennen, nach oben
oder unten sortieren, Titel ein-/ausblenden und löschen. Die Widgetmaske weist
Karten einem Abschnitt oder „Nicht zugeordnet“ zu. Beim Wechsel in eine Gruppe
mit belegten Koordinaten wird nur die betroffene Karte deterministisch auf den
ersten freien Platz dieser Gruppe gesetzt. Beim Löschen eines Abschnitts
werden niemals Widgets gelöscht: Alle betroffenen Karten wechseln nacheinander
in die nicht zugeordnete Gruppe und erhalten nur bei einer dortigen Kollision
eine freie Position.

Die Area-Auswahl kommt aus dem bereits vorhandenen backendseitigen System-
Snapshot der Home-Assistant-Area-Registry. Der Browser erhält nur reduzierte
IDs und Namen sowie die sanitisierte `area_id` an Inventareinträgen. Abschnitt
und HA Area sind ausdrücklich verschiedene Konzepte; Abschnitte funktionieren
ohne Area. Es wurden keine neuen Home-Assistant-Kommandos, keine Area-Registry-
Writes und keine neuen Write-Routen oder Allowlists ergänzt.

Die Sprint-26-Tests decken Schema-9-Migration, Abschnittsvalidierung,
abschnittslokale Kollisionen, Erstellen/Umbenennen/Sortieren/Löschen,
Kartenrückführung, Zuordnung/Wechsel/Unassigned, alten Ein-Raster-Fallback,
vertikale Legacy-Ausgabe, optionale Titel, Area-Read-only-Grenze, ES5 und
CSS-Grid-Freiheit ab. Die bestehenden Tests bewahren Default-/Custom-
Dashboards, Hintergründe, Titel, Theme, HomeScreen-Navigation, Focus,
Presentation-Tiers, Summary/Errors und Home-Assistant-Sicherheitsgrenzen.
Alle geänderten JavaScript-Dateien bestanden `node --check`; die vollständige
Testsuite bestand mit 297 von 297 Tests. Ein kontrollierter Browserlauf mit
lokalem Mock-Home-Assistant und Fake-Zugangsdaten bestätigte bei 768 x 1024
und 1024 x 768 Pixeln drei vertikal getrennte Abschnitte ohne Kartenüberlappung
oder horizontales Scrollen, den Footer unterhalb des Inhalts sowie ein korrekt
zentriertes Focus-Overlay. Dabei wurde eine reale Legacy-Layout-Regression
gefunden und behoben: Das Ersetzen der Section-CSS-Klasse veränderte eine live
`HTMLCollection`, sodass Mobile Safari nachfolgende Raster überspringen konnte.
Das Layout erhält die Section-Klasse nun dauerhaft; ein Regressionstest sichert
dieses Verhalten ab.

Produkt-Screenshots wurden nicht künstlich ersetzt. Dashboards ohne Abschnitte
verwenden weiterhin die unveränderte Ein-Raster-Darstellung; eine aktualisierte
Admin-Aufnahme des neuen Section Managers soll erst aus einer realen oder
kontrollierten, vollständig anonymisierten Instanz aufgenommen werden.

Auf dem echten iPad mini 1 bleiben Portrait und Landscape, Rotation,
Abschnittstitel an/aus, lange Titel, viele Abschnitte, nicht zugeordnete Karten,
Hintergrundkontinuität, Footerposition, horizontales Überlaufen und Focus über
Abschnittsgrenzen manuell zu prüfen. Für Sprint 26.1 stehen `areaId` und die
Section-Zuordnung bereits als saubere read-only Grundlage für Native Room
Cards und bestätigte Area-basierte Vorschläge bereit.

## 28. Sprint 26.1 – Native Room Card MVP

Sprint 26.1 startete auf dem sauberen, mit `origin/main` identischen Commit
`0878769`. Das bestehende Dashboardmodell wurde additiv von Schema 10 auf
Schema 11 erweitert. Der neue Widget-Typ `room` besitzt weiterhin die normale
stabile Widget-ID, Größe, Sichtbarkeit, Layoutkoordinaten und optionale
`sectionId`. Seine zusätzliche `room`-Konfiguration enthält eine unabhängige
optionale `areaId`, `collapsible`, `defaultExpanded`, einen optionalen
Hintergrund und explizite Entity-Rollen.

Die Einzelrollen sind Temperatur, Luftfeuchte, Climate und Präsenz. Listen
stehen für Öffnungen, Lights, Switches, Covers, Fans, Media Player, Locks,
Batterien, Sicherheitsmelder und sekundäre Sensoren zur Verfügung. Eine Room
Card darf ohne Area und ohne optionale Rollen bestehen. Eine nicht mehr
vorhandene Area verwirft keine manuellen Zuordnungen; der Admin zeigt dafür
eine Warnung. Bestehende Schema-10-Dashboards und ihre Sections migrieren
unverändert. Room Cards ohne `sectionId` bleiben im sicheren nicht
zugeordneten Bereich sichtbar.

Der native Admin-Editor bietet eine durchsuchbare Entity-Auswahl je Rolle,
read-only Area-Auswahl, explizites Auto-Setup, manuelle Überschreibungen,
Section-Zuordnung, alle fünf Größen, Collapse-Verhalten, Live Preview und einen
eigenen optionalen Raumhintergrund. Auto-Setup verwendet ausschließlich
stabile `area_id`-, Domain- und Device-Class-Metadaten des vorhandenen
sanitisierten Inventars. Sind bereits Zuordnungen vorhanden, werden Vorschläge
nur nach einer ausdrücklichen Bestätigung übernommen. Es gibt weder
Namensheuristiken für Gerätezuordnung noch Area-/Entity-Registry-Writes.

Raumhintergründe verwenden unverändert den typgeprüften, größenbegrenzten und
atomaren JPEG-/PNG-Speicher aus Sprint 25.3/25.5. Der Admin kann hochladen,
voranzeigen, ersetzen und entfernen; die normale Dashboard-Konfiguration
erhält nur eine kontrollierte `/assets/backgrounds/...`-URL. Nicht mehr
referenzierte Dateien werden erst nach erfolgreicher Konfigurationspersistenz
entfernt.

Das Wall-Display rendert Room Cards nativ in ES5 und Flexbox. Compact zeigt
Raumidentität, primäre Temperatur und den wichtigsten Alert; Standard ergänzt
Luftfeuchte, Präsenz und Öffnungsstatus; Wide und Large bieten bewusst mehr
Platz für Alerts, Details und Controls. Tall bleibt als vorhandener fünfter
Presentation-Tier unterstützt. Expanded zeigt zusätzliche Entities, während
Collapsed die Informationshierarchie bewusst knapp hält. Die 20 gültigen
Portrait- und 44 gültigen Landscape-Geometrien sind in der Card Matrix
validiert. Die Card lässt sich innerhalb jeder Sprint-26-Section verwenden;
Section und Room-Area bleiben unabhängig.

Die Laufzeit lädt nicht separat pro Room Card. Sie projiziert alle benötigten
Raumzustände aus einem einzigen bereits gecachten und normalisierten
System-Snapshot pro Dashboard-Antwort. Die zentrale Issue Engine wird dabei
einmal ausgewertet; Room Alerts filtern nur das Ergebnis und verwenden
zusätzlich die vorhandenen Summary-, Risk-, Severity-, Grace-, Flapping- und
Recovery-Regeln. Dadurch gibt es weder N+1-HA-Abfragen noch eine zweite
Security Engine.

Direkt bedienbar sind ausschließlich Lights und Climate-Entities, die bereits
von den bestehenden expliziten Backend-Endpunkten und unveränderten
Write-Allowlists freigegeben sind. Switches, Covers, Fans, Media Player und
Locks erscheinen read-only. Es wurden keine neue HA-Schreibaktion, keine
generische Service-Route, kein Browser-WebSocket zu HA und keine zusätzlichen
Home-Assistant-App-Berechtigungen ergänzt. Room Cards werden inline erweitert
und bewusst nicht in den Sprint-17.5-Focus-Renderer gezwungen; damit bleibt die
Trennung von Grid-Geometrie, Room-Präsentation und Focus-Geometrie erhalten.

Die automatisierten Sprint-26.1-Tests decken Migration, vollständige
Validierung, Room ohne/mit Area, Area-Vorschläge, manuelle Zuordnung,
Temperatur/Luftfeuchte/Climate/Präsenz, eine und mehrere Öffnungen, alle
read-only Domainlisten, Low Battery, Safety Alert, Unknown/Unavailable,
fehlende optionale Entities, Missing Area, Collapse/Expand, Hintergrund,
lange Namen, alle gültigen Größen und Tiers, Sections, Default-/Custom-Routen,
Theme, HomeScreen und ES5/CSS-Grid-Freiheit ab. Die vollständige bestehende
Suite bewahrt zusätzlich Admin-Auth, Upload-Härtung, Persistenz, Summary,
Errors, Systemregeln, Focus, Standalone und HA-App-Sicherheitsgrenzen.
Alle 310 automatisierten Tests bestanden; sämtliche geänderten
JavaScript-Dateien bestanden `node --check`. Der test-only Browser-Harness
bestand Compact, Standard, Wide und Large bei 768 × 1024 sowie 1024 × 768
Pixeln ohne horizontales Überlaufen.

Produkt-Screenshots wurden nicht durch generierte Mockups ersetzt. Ein neues
Room-Card-Bild soll erst aus der real laufenden oder einer vollständig
anonymisierten kontrollierten Instanz aufgenommen werden. Auf dem echten iPad
mini 1 bleiben Compact/Standard/Wide/Large in Portrait und Landscape, lange
Raumnamen/Werte, Collapse-Touch, mehrere Alert-Chips, Climate-Plus/Minus/
Power, Light-Power, Hintergrundkontrast, Sections, Dark/Light und HomeScreen-
Modus manuell abzunehmen. Auf HAOS sind Persistenz und Neustart mit einem
Room-Hintergrund ebenfalls noch real zu bestätigen.

Die Umsetzung übernimmt von RoomCard ausschließlich die UX-Ideen Area-
Vorschläge, Primärwerte, Alerts, Collapse und Raumhintergrund. Lovelace-
Lifecycle, `hass`-Objekt, Custom Elements, Shadow DOM, HACS-Laufzeit,
HA-Frontend-Editor und generische Actions wurden bewusst nicht übernommen.
Künftige Erweiterungen können zusätzliche read-only Darstellungen oder neue
explizit abgesicherte Domain-Endpunkte auf diesem nativen Modell ergänzen,
ohne die aktuelle Sicherheits- oder Legacy-Grenze zu umgehen.
