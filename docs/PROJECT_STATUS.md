# Projektstatus – HA Legacy Dashboard

Stand: 11. August 2026, nach Sprint 17

Dieser Bericht beschreibt den tatsächlich geprüften und produktiv ausgerollten
Stand. Er enthält keine Werte aus `.env`, keine Home-Assistant-Zugangsdaten
und keine Admin-Tokens.

## 1. Branch, Commits und Arbeitsbaum

- Branch: `main`
- Sprint-17-Ausgangscommit: `a346a82`
- Implementierung: `db49277 feat: add persistent drag and drop grid layouts`
- finaler Drag-Fix: `81466fc fix: unify admin grid pointer dragging`
- Upstream: `origin/main`
- Produktiver Sprint-17-Implementierungsstand: `81466fc`

Sprint 16 war vor Beginn vollständig vorhanden: Multi-Dashboard,
Schema-Version 2, atomare Persistenz, stabile Widget-IDs, Admin API und UI
sowie die fünf Größen-Presets wurden im tatsächlichen Code verifiziert. Der
Ausgangsarbeitsbaum war sauber und der Referenzlauf bestand mit 69 Tests.

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

Sensor-, Binary-, Light- und Climate-Widgets besitzen weiterhin stabile IDs,
Reihenfolge, Sichtbarkeit und Größen-Presets. Sprint 17 ergänzt getrennte,
persistente Raster für Portrait und Landscape.

## 3. Finale Konfigurationsstruktur

Das persistente Schema ist Version 3. Jede Layoutreferenz verwendet die
stabile Widget-ID, niemals die Entity-ID:

```json
{
  "schemaVersion": 3,
  "defaultDashboardId": "default",
  "dashboards": [
    {
      "id": "default",
      "title": "Übersicht",
      "refreshIntervalMs": 5000,
      "widgets": [
        {
          "id": "default-bathroom-temperature",
          "entity": "sensor.example",
          "type": "sensor",
          "title": "Badezimmer",
          "subtitle": "Temperatur",
          "icon": "temperature",
          "iconClass": "temperature",
          "unit": "",
          "order": 10,
          "visible": true,
          "size": "normal"
        }
      ],
      "layouts": {
        "portrait": {
          "columns": 3,
          "items": {
            "default-bathroom-temperature": {"x": 0, "y": 0, "w": 1, "h": 1}
          }
        },
        "landscape": {
          "columns": 6,
          "items": {
            "default-bathroom-temperature": {"x": 0, "y": 0, "w": 1, "h": 1}
          }
        }
      }
    }
  ]
}
```

Nur die bekannten Profile, festgelegten Spaltenzahlen und Integerwerte werden
akzeptiert. Koordinaten und Maße sind keine CSS-Strings.

## 4. Migration und Auto-Placement

- Schema 1 wird zuerst um `size: normal` ergänzt und dann auf Schema 3
  migriert.
- Schema 2 wird direkt und atomar auf Schema 3 migriert.
- Dashboard-IDs, Widget-IDs, Entities, Reihenfolge, Sichtbarkeit und Inhalte
  bleiben erhalten.
- `compact` und `normal` starten mit 1×1, `wide` mit 2×1, `tall` mit 1×2 und
  `large` mit 2×2.
- Platzierung erfolgt deterministisch von links nach rechts und dann in der
  nächsten freien Zeile.
- Belegte Bereiche werden übersprungen; unsichtbare Widgets blockieren keine
  Zellen.
- Beim erneuten Einblenden wird die alte Position genutzt, wenn sie frei ist,
  andernfalls erfolgt Auto-Placement.

Produktiv wurde Schema 2 erfolgreich auf Schema 3 migriert. Die rollierende
Sicherung `dashboards.json.bak` enthält weiterhin die letzte gültige
Schema-2-Konfiguration.

## 5. Validierung, Kollisionen und Größen

Backend und Admin-Entwurf prüfen:

- bekannte Profile `portrait` und `landscape`
- exakt 3 beziehungsweise 6 Spalten
- ganze Zahlen für `x`, `y`, `w` und `h`
- `x/y >= 0`, `w/h >= 1`, Spalten- und Zeilengrenzen
- maximal 100 Rasterzeilen und maximal 4 Zeilen Höhe je Kachel
- bekannte Widgetreferenzen und vollständige Layoutitems
- keine Kollisionen zwischen sichtbaren Widgets
- Climate-Mindestbreite 2 im Landscape-Profil

Ungültige Konfigurationen liefern kontrolliert HTTP 400 mit
`invalid_layout` und ersetzen weder aktive noch persistierte Konfiguration.

## 6. Admin-Layouteditor

Unter `/admin` gibt es je Dashboard einen Rastereditor mit Portrait- und
Landscape-Umschaltung. Unterstützt werden:

- Pointer-Dragging für Maus und moderne Touchgeräte
- Erhaltung der Greifposition innerhalb mehrspaltiger Kacheln
- Snapping auf ganze Rasterzellen
- gültige und ungültige Zielvorschau
- Resize-Griff in ganzen Rastereinheiten
- Bounds-, Mindestgrößen- und Kollisionsschutz
- sichtbare und fokussierbare Tasten für links, rechts, oben, unten, breiter,
  schmaler, höher und niedriger
- lokaler Entwurf mit Speichern, Verwerfen und `beforeunload`-Warnung
- korrektes Layout-Remapping auf neue Widget-IDs beim Duplizieren
- automatische Layoutpositionen für neue Widgets

Die Admin UI darf moderne Browserfunktionen und CSS Grid verwenden; sie ist
technisch vom Legacy-Wall-Display getrennt.

## 7. Legacy-Wall-Display

`src/public/js/core/layout.js` ist reines ECMAScript 5. Es wählt das Profil
über `window.innerWidth` und `window.innerHeight`, validiert die öffentliche
Konfiguration nochmals defensiv und setzt ausschließlich berechnete
Prozentwerte und Pixelhöhen.

Der Dashboardcontainer ist `position: relative`, Kacheln sind absolut
positioniert. Portrait nutzt eine Zeilenhöhe von 260 px, Landscape 240 px.
Die Containerhöhe wird aus `max(y + h)` berechnet. Bei Rotation wird nur das
Layout neu angewendet; Refresh- und Widgetzustand bleiben erhalten.

Das Legacy-CSS enthält kein CSS Grid und keinen Flexbox-`gap`. Fehlt ein
Profil oder ist es im Browser ungültig, wird ausschließlich aus den bekannten
Größen-Presets ein sicheres Profil erzeugt; Koordinaten des anderen Profils
werden nicht übernommen. Asset-Cache-Version ist 19.

## 8. Sicherheitsgrenzen

Layout und Sichtbarkeit steuern ausschließlich Anzeige und HA-Lesezugriff.
Sie verändern keine Schreibberechtigung. Die Allowlist in
`src/routes/api.js` blieb unverändert:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

Der HA-Token bleibt ausschließlich im Backend. Admin API und Admin UI nutzen
weiterhin einen separaten Bearer-Token, sind standardmäßig deaktiviert und
rate-limitiert. Die öffentliche Layoutantwort enthält keine Tokens,
Admin-Daten, beliebigen Attribute oder CSS-Werte.

## 9. Persistenz und API

- Standardpfad `data/dashboards.json`, überschreibbar mit
  `DASHBOARD_CONFIG_PATH`
- vollständige Validierung vor jedem Schreiben
- temporäre Datei und atomare Ersetzung
- eine letzte gültige Vorgängerversion als `.bak`
- Admin CRUD erweitert das bestehende Konfigurationsmodell; keine parallele
  Layout-API
- öffentliche Dashboardkonfiguration liefert nur Layouts sichtbarer Widgets

## 10. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Schema und Migration | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Rastervalidierung und Auto-Placement | `src/services/layout.js` |
| Admin API | `src/routes/admin.js` |
| Admin-Layoutmodell | `src/admin/js/layout.js` |
| Admin-Interaktion | `src/admin/js/app.js`, `src/admin/js/dashboards.js`, `src/admin/js/widgets.js` |
| Legacy-Raster | `src/public/js/core/layout.js`, `src/public/js/core/dashboard.js` |
| Legacy-Widget-IDs | `src/public/js/core/widget.js`, `src/public/js/widgets/*.js` |
| Legacy-Darstellung und Cache | `src/public/css/style.css`, `src/public/index.html`, `src/public/manifest.json` |
| Tests | `test/layout.test.js`, `test/legacy-layout.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js`, `test/dashboard-persistence.test.js` |

## 11. Tests und manuelle Abnahme

Der vollständige lokale und produktive Testlauf besteht mit 80 von 80 Tests.
Alle Integrationstests verwenden nur localhost Mock-Home-Assistant-Dienste und
Fake-Credentials. Alle geänderten JavaScriptdateien bestehen `node --check`.

Manuell geprüft wurden:

- Maus-Drag mit gültigem Snapping und abgewiesener Kollision
- Pointer-Resize-Griff
- alle acht sichtbaren Alternativtasten
- Portrait-/Landscape-Umschaltung, Speichern, Reload und Verwerfen
- Dashboardduplikat und zurückgesetzter Entwurf
- Wall-Display bei 768×1024 und 1024×768
- Rotation Portrait → Landscape → Portrait ohne Reload
- keine Kollision und kein horizontaler Overflow
- Climate-Tasten 46×46 px und Light-Taste innerhalb der Kachel
- Header, Uhr, Status und keine Browser-Konsolenfehler

Eine automatisierte echte Safari-iOS-9-Laufzeit steht weiterhin nicht zur
Verfügung; ES5- und CSS-Verbote werden statisch und im kompatiblen Renderer
getestet.

## 12. Produktionsstand

Das Deployment-Skript führte Syntaxprüfungen und alle 80 Tests auf dem LXC
aus, migrierte die vorhandenen zwei Dashboards auf Schema 3 und startete
`ha-legacy-dashboard.service` erfolgreich neu. Dienst, Gateway, Home Assistant
und Dashboard-Health-Check sind online.

Produktiv bestätigt:

- Sprint-17-Laufzeitcode `81466fc`; nachfolgende reine
  Dokumentationscommits ändern den Dienstcode nicht
- Primärkonfiguration Schema 3, Backup Schema 2
- `default`: 6 Layoutitems
- `esszimmer`: 2 Layoutitems
- Portrait 3 / Landscape 6 Spalten
- öffentliche Standardkonfiguration: 5 sichtbare Widgets, keine Tokenhinweise

## 13. Bekannte Einschränkungen und technische Schulden

- Keine automatisierte echte Safari-/iOS-9-Ausführung.
- Feste Legacy-Zeilenhöhen statt inhaltsabhängiger Rasterzeilen.
- Maximale Rastergröße ist bewusst statisch begrenzt.
- Kein Revisionsfeld oder Konfliktschutz für parallele Admin-Entwürfe.
- Admin-Rate-Limit ist nur pro Prozess gespeichert.
- Keine freie Pixelpositionierung, Überlappung, Rotation einzelner Kacheln oder
  Z-Index-Bearbeitung; dies sind bewusste Nicht-Ziele.

Im geprüften Sprint-17-Umfang ist kein funktionaler Defekt bekannt.

## 14. Roadmap-Abgleich und nächster Sprint

Sprint 17 entspricht der Spezifikation: Schema 3, Migration, zwei Profile,
Auto-Placement, Kollisionen, Bounds, Drag, Resize, zugängliche Alternativen,
Duplikat-Remapping, öffentlicher sicherer Layouttransport und ES5-Renderer
ohne CSS Grid sind umgesetzt.

Der empfohlene nächste Schritt gemäß aktualisierter Roadmap ist Sprint 18 –
System Dashboard Foundation. Er sollte eine gemeinsame normalisierte,
read-only System-Snapshot-Grundlage und feste Routen für spätere Summary- und
Error-Dashboards schaffen, ohne die bestehenden Raster oder HA-Schreibgrenzen
zu erweitern.
