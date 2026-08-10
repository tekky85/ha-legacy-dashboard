# Projektstatus – HA Legacy Dashboard

Stand der Prüfung: 10. August 2026

Dieser Bericht beschreibt den tatsächlichen Implementierungsstand nach Sprint
16. Er enthält keine Werte aus `.env`, keine Home-Assistant-Zugangsdaten und
keine Tokens.

## 1. Branch und Ausgangscommit

- Branch: `main`
- Ausgangscommit: `3b05a93 docs: define sprint 16 configurable tile sizes`
- Sprint-16-Commit: `9c44cd5 feat: add configurable tile size presets`
- Upstream: `origin/main`
- Sprint 15 war vollständig implementiert, committed, gepusht und im LXC
  ausgerollt.
- Sprint 16 wurde committed, gepusht und im Produktions-LXC ausgerollt.

## 2. Arbeitsbaum

Der Arbeitsbaum war zu Beginn von Sprint 16 sauber und war nach dem ersten
Produktions-Rollout sowohl lokal als auch im LXC wieder sauber.
Laufzeitkonfigurationen unter `data/`, `.env`, Tokens und lokale
Browser-Testdaten bleiben durch Git ausgeschlossen.

## 3. Implementierte Funktionen und Sprints

| Sprint | Thema | Stand |
|---|---|---|
| 0–3 | Grundlage, Gateway, Legacy-UI und Widgets | umgesetzt |
| 4–6 | Climate, Standalone und Light | umgesetzt |
| 7–8 | Konfiguration, Robustheit und Sicherheit | umgesetzt |
| 9–10 | Tests, Deployment und Betrieb | umgesetzt |
| 11–12 | Wall-Display und Release-Baseline | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistenz und Admin-API-Grundlage | umgesetzt |
| 15 | Grafische Admin-Konfiguration | umgesetzt |
| 16 | Konfigurierbare Kachelgrößen | umgesetzt |

Zusätzlich zu den bestehenden Sensor-, Binary-, Light- und Climate-Widgets
unterstützt jedes Widget nun ein festes, validiertes Größen-Preset. Die
Oberfläche bleibt ein responsiver Flexbox-Fluss; Sprint 16 führt weder
Drag-and-drop noch freie Positionen oder Maße ein.

## 4. Sprint-15-Verifikation

Vor den Änderungen wurden die persistente Multi-Dashboard-Konfiguration,
stabile Dashboard- und Widget-IDs, Admin API, `/admin`, Entity-Inventar,
Widgetbearbeitung, Gesamtkonfigurationsentwurf, Speichern und Verwerfen sowie
die getrennten HA-Schreib-Allowlisten im tatsächlichen Code bestätigt. Der
Sprint-15-Referenztest bestand mit 62 von 62 Tests.

## 5. Konfigurationsschema und Migration

Das persistente Schema ist Version 2:

```json
{
  "schemaVersion": 2,
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
      ]
    }
  ]
}
```

Zulässig sind ausschließlich `compact`, `normal`, `wide`, `tall` und `large`.
Schema-1-Dateien werden beim Laden vollständig validiert und anschließend
atomar zu Schema 2 migriert. Fehlendes `size` wird zu `normal`; Dashboard-IDs,
Widget-IDs, Entity-IDs, Reihenfolge, Sichtbarkeit, Texte und Icons bleiben
unverändert. Die erste Migrationssicherung enthält die letzte gültige
Schema-1-Konfiguration.

Nach späteren Schema-2-Schreibvorgängen kann die rollierende `.bak`-Datei
ebenfalls Schema 2 enthalten. Ein späteres Downgrade auf Sprint 15 benötigt
dann eine separat aufbewahrte Schema-1-Sicherung oder eine manuelle
Rückkonvertierung; eine automatische Downgrade-Migration ist bewusst nicht
enthalten.

## 6. Persistenz und Backendvalidierung

- Standardpfad `data/dashboards.json`, überschreibbar mit
  `DASHBOARD_CONFIG_PATH`
- vollständige Validierung vor jedem Schreibvorgang
- temporäre Datei und atomare Umbenennung
- eine gültige Vorgängerversion als `dashboards.json.bak`
- kontrollierter HTTP-400-Code `invalid_widget_size`
- ungültige Größen verändern weder aktive noch persistierte Konfiguration
- Public API liefert nur die validierten Presets aus
- Renderer normalisiert fehlende oder unbekannte Werte zusätzlich zu `normal`

## 7. Admin-Oberfläche

Die Widgetbearbeitung unter `/admin` besitzt ein festes Select-Feld
„Kachelgröße“ mit den fünf Presets. Die Widgetliste zeigt den deutschen
Größennamen. Neue Widgets beginnen mit `normal`; Größen bleiben beim
Ausblenden, Verwerfen, Speichern, Reload und Duplizieren erhalten. Es gibt
keine freie Texteingabe für Maße oder CSS.

## 8. Wall-Display und responsive Größen

Der ES5-Renderer ordnet bekannte Werte ausschließlich den Klassen
`card-size-compact`, `card-size-normal`, `card-size-wide`,
`card-size-tall` und `card-size-large` zu.

| Breite | compact / normal / tall | wide / large |
|---|---|---|
| unter 600 px | volle Breite | volle Breite |
| 600–899 px | etwa halbe Breite | volle Breite |
| ab 900 px | etwa ein Drittel | etwa zwei Drittel |

`compact` reduziert Mindesthöhe und Innenabstände, `tall` erhöht die
Mindesthöhe und `large` kombiniert breite Darstellung mit zusätzlicher
Mindesthöhe. Inhalte dürfen Karten vergrößern; feste Höhen werden nicht
erzwungen. Climate-Tasten bleiben 46 × 46 px, der Theme-Schalter 44 × 44 px
und der Light-Schalter mindestens 44 px hoch.

Die Reihenfolge entsteht weiterhin nur aus `order`; `order + size` bestimmen
den Flexbox-Fluss. Zeilenumbrüche sind responsiv und nicht pixelgenau.

## 9. Entity-Auswahl und Sicherheitsgrenzen

Das Admin-Frontend verwendet nur das sanitierte Inventar aus
`GET /api/admin/entities`. Dashboard-Sichtbarkeit und Kachelgröße steuern
ausschließlich Anzeige und HA-Lesezugriff. Die getrennten Schreib-Allowlisten
in `src/routes/api.js` bleiben unverändert:

- Climate: `climate.esszimmer_thermostate`
- Light: `light.esszimmer_lampen`

Der Admin-Token bleibt getrennt vom HA-Token. Die Admin API bleibt
standardmäßig deaktiviert, Bearer-geschützt und für Schreibzugriffe
rate-limitiert. Kein Token gelangt in das Wall-Display oder eine öffentliche
Dashboardantwort.

## 10. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Schema und Migration | `src/config/dashboard.js`, `src/services/dashboard-config-store.js` |
| Admin API | `src/routes/admin.js` |
| Admin UI | `src/admin/index.html`, `src/admin/js/app.js`, `src/admin/js/widgets.js` |
| Legacy-Mapping | `src/public/js/core/widget.js`, `src/public/js/widgets/*.js` |
| Responsive Layout | `src/public/css/style.css` |
| Cache | `src/public/index.html`, `src/public/manifest.json` |
| Tests | `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js`, `test/tile-size.test.js` |

## 11. Tests und manuelle Prüfung

Alle automatisierten Integrationsprüfungen verwenden ausschließlich lokale
Mock-HA-Dienste auf `127.0.0.1`, temporäre Konfigurationspfade und
Fake-Credentials. Geprüft werden unter anderem Schema-1-Migration, alle fünf
Presets, fehlerhafte Werte, atomare Persistenz, Backup, Admin API und UI,
Public API, sichere CSS-Klassenzuordnung sowie unveränderte Schreibgrenzen.

In einem lokalen Browserlauf wurden Speichern, Reload, Verwerfen und alle fünf
Größen geprüft. Bei 768 × 1024 und 1024 × 768 px gab es in Light und Dark Mode
keinen horizontalen Überlauf, keine Konsolenfehler und keine verkleinerten
Touchziele. Eine echte automatisierte Safari-iOS-9-Ausführung steht weiterhin
nicht zur Verfügung.

Der vollständige Sprint-16-Testlauf bestand mit 69 von 69 Tests; alle 17
geänderten JavaScript-Dateien bestanden `node --check`.

Der LXC-Deployment-Check bestand dieselben 69 Tests, startete den systemd-Dienst
erfolgreich neu und bestätigte Gateway sowie Home Assistant als online. Die
Produktionskonfiguration enthält zwei Dashboards unter Schema 2; alle acht
bisherigen Widgets wurden zu `normal` migriert. Die unmittelbar dabei erzeugte
Sicherung blieb im Schema-1-Format erhalten.

## 12. Bekannte Einschränkungen und technische Schulden

- Flexbox garantiert keine exakte Rasterposition.
- Keine getrennten Größen für Portrait und Landscape.
- Keine Konflikterkennung für parallele Admin-Entwürfe.
- In-Memory-Rate-Limit ist nicht prozessübergreifend.
- Keine automatisierte echte Safari-/iOS-9-Ausführung.
- Keine freie Breite, Höhe, X-/Y-Position, Drag-and-drop oder Layout-Handles.
- Das Admin-Frontend besitzt keine vollständige Live-Vorschau.

Im automatisierten Testlauf ist kein funktionaler Sprint-16-Defekt bekannt.

## 13. Roadmap-Abgleich und Voraussetzung für Sprint 17

Sprint 16 entspricht der Spezifikation: feste Presets, Schema-Migration,
Backendvalidierung, Admin-Auswahl, sichere öffentliche Ausgabe und
iOS-9-kompatibler Flexbox-Renderer sind umgesetzt. Nicht-Ziele wie CSS Grid,
freie Werte, WYSIWYG, zusätzliche HA-Domänen und automatische
Schreibberechtigungen wurden nicht eingeführt.

Sprint 17 kann auf stabilen Widget-IDs, `order`, `size`, Schema 2, atomarer
Persistenz und dem lokalen Admin-Entwurf aufbauen. Für ein Drag-and-drop-Raster
muss es ein eigenes validiertes Positionsmodell, eine klare Migration und eine
iOS-9-taugliche Darstellung geben; das aktuelle Größenfeld darf dabei nicht in
freie CSS-Werte umgedeutet werden.
