# Projektstatus – HA Legacy Dashboard

Stand der Prüfung: 10. August 2026

Dieser Bericht beschreibt den Arbeitsstand nach Umsetzung von Sprint 14. Er
enthält keine Werte aus `.env`, keine Home-Assistant-Zugangsdaten und keine
Tokens.

## 1. Aktueller Branch und Ausgangscommit

- Branch: `main`
- Ausgangscommit: `ac822d2 feat: add multi-dashboard foundation`
- Upstream vor Beginn: `origin/main`
- `HEAD`, `origin/main` und `origin/HEAD` waren vor Sprint 14 synchron.

## 2. Status des Arbeitsbaums

Vor Sprint 14 waren bereits zwei Nutzerdokumente verändert:

- `docs/PROJECT_STATUS.md` enthielt einen älteren Pre-Sprint-12-Bericht.
- `docs/sprints/SPRINT-14.md` lag als neue Sprintbeschreibung vor.

Beide Dateien wurden als Nutzerdaten behandelt. Die Sprintbeschreibung wurde
erhalten und um ihren Status ergänzt. Der Projektstatus wurde mit dem
tatsächlichen Sprint-13- und Sprint-14-Stand zusammengeführt.

## 3. Implementierte Funktionen

### Bestehende Anwendung

- Express-Gateway und Home-Assistant-REST-Anbindung
- iOS-9-/ES5-kompatibles Dashboard ohne Frontendframework
- Sensor-, Binary-, Light- und Climate-Widgets
- optimistische, explizit allowlisted Climate- und Light-Steuerung
- zwei Dashboardprofile mit stabilen Direkt-URLs
- Status-, Stale-Data-, Theme-, Uhr- und Standalone-Funktionen

### Sprint 14

- Konfigurationsschema Version 1
- stabile global eindeutige Widget-IDs
- persistente JSON-Konfiguration
- automatische Erst-Migration der Sprint-13-Profile
- vollständige Validierung vor Speicherung
- atomare Dateiersetzung und eine Vorgängerversion
- Recovery aus gültigem Backup
- geschützte, standardmäßig deaktivierte Admin-API
- sanitisiertes HA-Entity-Inventar
- Rate-Limit für Admin-Schreiboperationen

## 4. Implementierte Sprints

| Sprint | Thema | Stand |
|---|---|---|
| 0–3 | Grundlage, Gateway, Legacy-UI und Widgets | umgesetzt |
| 4 | Climate-Steuerung | umgesetzt |
| 5 | iOS-9-Standalone-Web-App | umgesetzt |
| 6 | Light-Steuerung | umgesetzt |
| 7–8 | Konfiguration, Robustheit und Sicherheit | umgesetzt |
| 9–10 | Tests, Deployment und Betrieb | umgesetzt |
| 11 | Wall-Display-Betrieb | umgesetzt |
| 12 | UI-Polish und Release-Baseline 1.0.0 | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistenz und Admin-API-Grundlage | umgesetzt |

## 5. Entity-Auswahl und Schreibgrenzen

Die sichtbaren Widgets eines Dashboards bestimmen ausschließlich dessen
deduplizierte HA-Leseliste.

Schreibrechte bleiben separat in `src/routes/api.js` definiert:

- Climate: ausschließlich `climate.esszimmer_thermostate`
- Light: ausschließlich `light.esszimmer_lampen`

Admin-API, persistierte Konfiguration und Entity-Inventar ändern diese
Allowlisten nicht. Tests ergänzen nicht freigegebene Climate- und
Light-Entities sichtbar zu einem Dashboard und bestätigen weiterhin HTTP 403
auf den Schreibendpunkten.

## 6. Konfigurationsschema

Das vollständige Schema verwendet:

```json
{
  "schemaVersion": 1,
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
          "title": "Titel",
          "subtitle": "Untertitel",
          "icon": "temperature",
          "iconClass": "temperature",
          "unit": "",
          "order": 10,
          "visible": true
        }
      ]
    }
  ]
}
```

Validiert werden Schema-Version, Standard-Dashboard, Dashboard- und Widget-IDs,
globale Eindeutigkeit, bekannte Widgettypen, Entity-ID, Titel und
Darstellungsfelder, numerische Reihenfolge, boolesche Sichtbarkeit sowie
Refresh-Intervalle von 3000 bis 300000 Millisekunden.

## 7. Persistenz und Migration

- Standardpfad: `data/dashboards.json`
- optionaler Pfad: `DASHBOARD_CONFIG_PATH`
- Erststart ohne Primärdatei und Backup: validierte Sprint-13-Profile werden
  geschrieben.
- Schreiben: temporäre Datei im selben Verzeichnis, `fsync`, atomarer Rename.
- Vorherige gültige Primärdatei: `dashboards.json.bak`
- Dateimodus: `0600`; Standardverzeichnis im Deployment: `0700`
- ungültige Daten oder Schreibfehler ändern Primärdatei und Backup nicht.
- beschädigte oder fehlende Primärdatei wird aus einem gültigen Backup
  wiederhergestellt.

Die Laufzeitdateien sind in `.gitignore` ausgeschlossen.

## 8. Multi-Dashboard-Unterstützung

Die Sprint-13-Profile bleiben erhalten:

| ID | Titel | Pfad |
|---|---|---|
| `default` | Übersicht | `/`, `/d/default` |
| `esszimmer` | Esszimmer | `/d/esszimmer` |

Legacy- und dashboard-spezifische Lese-APIs bleiben kompatibel. Persistierte
Änderungen wirken ohne Frontendänderung auf diese APIs.

## 9. Admin-API

Die Admin-API ist ohne `ADMIN_API_ENABLED=true` deaktiviert. Bei Aktivierung
ist ein separater `ADMIN_TOKEN` erforderlich. Er darf nicht dem `HA_TOKEN`
entsprechen. Authentifizierung erfolgt ausschließlich über
`Authorization: Bearer ...` mit Digest-basierter konstanter Vergleichslänge.

Routen:

| Methode | URL | Funktion |
|---|---|---|
| GET/PUT | `/api/admin/config` | Gesamtkonfiguration lesen/ersetzen |
| GET/POST | `/api/admin/dashboards` | Dashboards lesen/anlegen |
| PUT/DELETE | `/api/admin/dashboards/:id` | Dashboard ändern/löschen |
| POST | `/api/admin/dashboards/:id/widgets` | Widget anlegen |
| PUT/DELETE | `/api/admin/dashboards/:id/widgets/:widgetId` | Widget ändern/löschen |
| GET | `/api/admin/entities` | sanitisiertes HA-Entity-Inventar |

Admin-Schreiboperationen teilen ein eigenes Präfix im vorhandenen
In-Memory-Rate-Limit. Es gibt keine grafische Admin-Oberfläche, Loginseite,
Session oder Browserpersistenz für den Token.

## 10. Entity-Inventar

`GET /api/admin/entities` ruft serverseitig `/api/states` ab und liefert je
gültiger Entity ausschließlich:

- `entity_id`
- `domain`
- `friendly_name`
- `device_class`
- `unit_of_measurement`

Rohzustände, beliebige Attribute, Standortdaten, Tokens und Services werden
nicht weitergegeben.

## 11. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Schema und Laufzeitmodell | `src/config/dashboard.js` |
| atomare Persistenz | `src/services/dashboard-config-store.js` |
| Admin-API | `src/routes/admin.js` |
| öffentliche API und Allowlists | `src/routes/api.js` |
| HA-Entity-Inventar | `src/services/homeassistant.js` |
| Initialisierung | `src/server.js` |
| Datenpfad und systemd | `.gitignore`, `data/.gitkeep`, `deploy/systemd/ha-legacy-dashboard.service` |
| Deployment | `deploy/deploy.sh`, `docs/DEPLOYMENT.md` |
| Tests | `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, bestehende `test/*.test.js` |

## 12. Tests und Ergebnis

Ausgangsstand Sprint 13:

```text
tests 45
pass 45
fail 0
```

Stand nach Sprint 14:

```text
tests 58
pass 58
fail 0
cancelled 0
skipped 0
```

Alle Integrationsprüfungen verwenden ausschließlich lokale Mock-Dienste auf
`127.0.0.1`, temporäre Konfigurationspfade und Fake-Credentials.

Abgedeckt sind insbesondere Migration, Laden, ungültiges JSON, Schema-Version,
doppelte und ungültige IDs, atomare Speicherung, Backup, Recovery,
Schreibfehler, deaktivierte Admin-API, fehlender/wiederverwendeter/ungültiger
und gültiger Token, CRUD, Standard-Dashboard-Konsistenz, Entity-Sanitizing,
Rate-Limit-Header, unveränderte Allowlists und sämtliche Sprint-13-Fälle.

## 13. Bekannte Defekte

Im automatisierten Testlauf wurde kein funktionaler Defekt reproduziert.
Safari iOS 9 bleibt eine manuelle Zielgeräteprüfung.

Für die produktive Aktivierung der Admin-API muss die aktualisierte
systemd-Unit einmalig als root installiert werden, damit ausschließlich das
`data`-Verzeichnis trotz `ProtectHome=read-only` beschreibbar bleibt.

## 14. Technische Schulden

- keine grafische Admin-Oberfläche
- kein CSRF-Thema, solange ausschließlich Bearer-Header ohne Cookies verwendet
  werden; eine spätere Browser-Session würde eine neue Sicherheitsprüfung
  benötigen
- In-Memory-Rate-Limit ist nicht prozessübergreifend
- synchrone Dateizugriffe sind für die kleine Konfiguration bewusst gewählt
- keine Konfliktversion beziehungsweise ETag für parallele Admin-Schreibende
- keine automatisierte Safari-iOS-9-Ausführung
- keine freie Kachelposition oder -größe

## 15. Abweichungen zwischen Roadmap und Code

Die Roadmap wurde um Sprint 14 ergänzt. Historische Abschnitte zu Sprint 3 und
Sprint 7 beschreiben weiterhin ihren damaligen Stand. Sprint 13 nannte bewusst
statische Konfiguration; diese wurde in Sprint 14 durch die spezifizierte
Persistenz ersetzt, während Datenmodell und öffentliche APIs erhalten blieben.

## 16. Empfohlener Sprint 15

Empfohlen wird eine kleine grafische Admin-Oberfläche mit klarer
Sicherheitsentscheidung:

- moderne Admin-Oberfläche getrennt vom iOS-9-Dashboard
- sichere Token-Eingabe nur im Arbeitsspeicher oder ein ausdrücklich
  entworfenes Sessionmodell
- Entity-Auswahl aus dem sanitisierten Inventar
- Formularvalidierung und verständliche Konflikt-/Backup-Anzeige
- keine automatische HA-Schreibberechtigung
- keine freie Layoutpositionierung im selben Sprint

Vor der UI sollte entschieden werden, ob Bearer-Token-Eingabe oder eine
serverseitige Session mit CSRF-Schutz das gewünschte Betriebsmodell ist.
