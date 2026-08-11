# Projektstatus – HA Legacy Dashboard

Stand: 11. August 2026, Sprint 17.2 nach Sprint 19 implementiert

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-17.2-Ausgangscommit: `8bf0a41`
- Upstream vor Implementierung: `origin/main`
- Sprint-19-Commit: `b4da718`
- Sprint-18-Commit: `94ce1c0`
- Sprint-17.1-Commit: `53ce672`

Der Ausgangsarbeitsbaum war sauber und der vollständige Baseline-Testlauf
bestand mit 108 von 108 Tests. Der tatsächliche Sprint-19-Code einschließlich
Summary-Regeln, Schema 5, System-Snapshot, Admin-Einstellungen und
Sicherheitsgrenzen wurde vor Sprint 17.2 geprüft.

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

Die Konfiguration verwendet Schema 5. Zusätzlich zu
`defaultDashboardId` und `dashboards` enthält sie:

```json
{
  "systemDashboards": {
    "summary": {
      "ignoredEntities": [],
      "showMediaTitles": false
    }
  }
}
```

Schema 1 bis 4 werden automatisch und atomar auf Schema 5 migriert. Bei Schema
4 bleiben die 6/12-Spalten-Layouts unverändert; nur die sicheren
Summary-Standardwerte werden ergänzt. Vollständige Validierung, atomarer
Dateiersatz und genau ein `.bak` bleiben erhalten. Ungültige Entity-IDs,
Duplikate oder ein nicht-boolesches Privacy-Flag werden abgelehnt, ohne die
letzte gültige Datei zu ersetzen.

## 7. Admin UI

Die moderne, Bearer-geschützte Admin UI besitzt einen eigenen Bereich
„System-Dashboards“. Dort kann die feste Summary geöffnet, eine Entity aus dem
bereits sanitisierten Admin-Inventar ignoriert und die Anzeige von
Medientiteln ausdrücklich aktiviert werden. Die Änderungen laufen wie alle
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
Assetversion ist 24.

## 9. Sicherheitsgrenzen

Sprint 19 ist vollständig read-only. Es wurden keine HA-Services, Schreib-
Endpoints oder automatischen Berechtigungen ergänzt. Die bestehenden
Write-Allowlists in `src/routes/api.js` bleiben getrennt:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

Summary-Erkennung, Ignorierliste, Dashboard-Sichtbarkeit und Admin-Inventar
erteilen keinerlei Schreibrecht. HA-Token und Admin-Token bleiben serverseitig
und werden weder an Wall-Display noch Summary ausgeliefert oder geloggt.

## 10. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Regeln und Engine | `src/services/summary/rules.js`, `src/services/summary/engine.js` |
| Snapshot und Cache | `src/services/system/snapshot.js`, `src/services/system/cache.js`, `src/services/system/index.js` |
| System-API | `src/routes/system-dashboards.js` |
| Schema/Persistenz | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Legacy-Summary | `src/public/system.html`, `src/public/js/system/common.js`, `src/public/js/system/summary.js`, `src/public/css/system.css` |
| Sprint-17.2-Layout | `src/public/js/core/layout.js`, `src/public/js/core/widget.js`, `src/public/css/style.css` |
| Sprint-17.2-Widgets | `src/public/js/widgets/sensor.js`, `src/public/js/widgets/binary.js`, `src/public/js/widgets/light.js`, `src/public/js/widgets/climate.js` |
| Theme | `src/public/js/core/theme.js`, `src/public/index.html`, `src/public/system.html` |
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/sprint-17-2.test.js`, `test/legacy-layout.test.js`, `test/summary.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-ui.test.js` |

## 11. Tests

Der vollständige Lauf verwendet ausschließlich localhost Mock-Home-Assistant-
Dienste und Fake-Credentials. Abgedeckt sind insbesondere:

- alle positiven und negativen Sprint-19-Regeln
- Climate nur nach `hvac_action`
- ignorierte Entities und Medientitel-Privacy
- deterministische Priorisierung, Gruppierung und Dauer
- Stale-Datenerhalt, Offline und Recovery
- gemeinsamer Cache ohne zusätzliche HA-Abfragen
- Schema-4-auf-5-Migration und Einstellungsvalidierung
- Admin-Entwurf und geschützte Persistenz
- unveränderte Write-Allowlists
- ES5- und CSS-Verbote der Legacy-Oberfläche
- Compact-Identity-Contract und vollständige Inhalte aller vier Widgets
- proportionale, gutter-aware und gecachte Rastergeometrie
- flächenabhängige Presentation Modes und Orientation Change
- Dark-/Light-Persistenz, Reload und sichere Storage-Fehler
- 1500 aktive Summary-Entities und 3000 normalisierte Entities

Der abschließende lokale Lauf besteht mit 115 von 115 Tests. Alle
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

- `/system/errors` bleibt bis Sprint 20 der leere Issue-Platzhalter.
- Registry-, Device-, Area-, Config-Entry- und Repairs-Anreicherung folgen
  frühestens in Sprint 21.
- Switch-Ausschlüsse sind absichtlich explizit statt heuristisch; die
  Ersteinrichtung kann daher eine kurze Admin-Auswahl erfordern.
- Der Snapshot-Cache ist pro Node-Prozess und geht beim Neustart verloren.
- Eine automatisierte echte Safari-iOS-9-Laufzeit steht nicht zur Verfügung;
  ES5-/CSS-Regeln und iPad-Abmessungen sind automatisiert geprüft, der reale
  iPad-Praxistest bleibt nach dem Rollout erforderlich.

## 13. Roadmap-Abgleich und nächster Sprint

Sprint 17.2 korrigiert ausschließlich die drei spezifizierten UX-Regressionen:
Compact-Identität, proportionale Kartenhöhe und Theme-Persistenz. Sprint 19
bleibt fachlich unverändert; ebenso Schema, Admin-Editor, Summary-/Error-
Architektur, Drag/Resize und Write-Allowlists. Nicht vorgezogen wurden
Error-Fachlogik, Registry-Anreicherung, weitere Schreibdomänen oder freie
System-Dashboard-Layouts.

Empfohlener nächster Schritt ist Sprint 20 – Error Dashboard MVP. Er soll auf
demselben Snapshot und Cache Issues klassifizieren, ohne die Summary-Regeln
oder Sicherheitsgrenzen aufzuweichen.
