# Projektstatus – HA Legacy Dashboard

Stand: 11. August 2026, Sprint 19 implementiert

Dieser Bericht beschreibt den tatsächlich geprüften Stand. Er enthält keine
Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine Admin-Tokens.

## 1. Branch, Ausgangscommit und Arbeitsbaum

- Branch: `main`
- Sprint-19-Ausgangscommit: `53ce672`
- Upstream vor Implementierung: `origin/main`
- Sprint-18-Commit: `94ce1c0`
- Sprint-17.1-Commit: `53ce672`

Der Ausgangsarbeitsbaum war sauber und der vollständige Baseline-Testlauf
bestand mit 99 von 99 Tests. Sprint 18 und Sprint 17.1 wurden im tatsächlichen
Code geprüft, bevor Sprint 19 geändert wurde.

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

## 8. Legacy-Frontend

Die Summary zeigt einen kompakten Aktivzähler und nur nichtleere
Kategoriegruppen mit festem Inline-SVG, Titel, Kurzbeschreibung und Dauer.
Stale-, Offline- und Recovery-Hinweise bleiben sichtbar. Lange Namen werden
ohne horizontales Überlaufen behandelt; Portrait und Landscape verwenden
Flexbox und normale Blocklayouts.

Alle Dateien unter `src/public/js/` bleiben ECMAScript 5. Das Wall-Display
verwendet weiterhin `Legacy.http.get`, kein `fetch`, keine Promise, kein CSS
Grid, kein Flexbox-`gap` und keine CSS-Custom-Property-Abhängigkeit. Die
Assetversion ist 23.

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
| Admin-Einstellungen | `src/admin/index.html`, `src/admin/js/system-dashboards.js`, `src/admin/js/app.js`, `src/admin/css/admin.css` |
| Tests | `test/summary.test.js`, `test/system-foundation.test.js`, `test/system-frontend.test.js`, `test/gateway.test.js`, `test/dashboard-persistence.test.js`, `test/admin-ui.test.js` |

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
- 1500 aktive Summary-Entities und 3000 normalisierte Entities

Der abschließende lokale Lauf besteht mit 108 von 108 Tests. Alle
JavaScriptdateien unter `src/` und `test/` bestehen `node --check`;
`git diff --check` ist sauber. Die Browser-Abnahme bei 768×1024 und 1024×768
zeigte keine horizontale Überbreite und keine Konsolenfehler. Die echte
iOS-9-Abnahme erfolgt nach dem Produktions-Rollout auf dem iPad.

## 12. Bekannte Einschränkungen und technischer Rest

- `/system/errors` bleibt bis Sprint 20 der leere Issue-Platzhalter.
- Registry-, Device-, Area-, Config-Entry- und Repairs-Anreicherung folgen
  frühestens in Sprint 21.
- Switch-Ausschlüsse sind absichtlich explizit statt heuristisch; die
  Ersteinrichtung kann daher eine kurze Admin-Auswahl erfordern.
- Der Snapshot-Cache ist pro Node-Prozess und geht beim Neustart verloren.
- Eine automatisierte echte Safari-iOS-9-Laufzeit steht nicht zur Verfügung;
  ES5- und CSS-Regeln sind statisch und durch den vorhandenen iPad-Praxistest
  abgesichert.

## 13. Roadmap-Abgleich und nächster Sprint

Sprint 19 entspricht der Spezifikation: explizite read-only Aktivitätsregeln,
stabile Kategorien/Prioritäten, reduzierte und privacy-sichere Payloads,
persistente Ignorierliste, Admin-Bedienung über sanitisiertes Inventar,
Legacy-Darstellung, Stale-Erhalt sowie Lasttests sind umgesetzt. Nicht
vorgezogen wurden Error-Fachlogik, Registry-Anreicherung, weitere
Schreibdomänen oder freie System-Dashboard-Layouts.

Empfohlener nächster Schritt ist Sprint 20 – Error Dashboard MVP. Er soll auf
demselben Snapshot und Cache Issues klassifizieren, ohne die Summary-Regeln
oder Sicherheitsgrenzen aufzuweichen.
