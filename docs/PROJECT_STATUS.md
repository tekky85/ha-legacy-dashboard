# Projektstatus – HA Legacy Dashboard

Stand der Prüfung: 10. August 2026

Dieser Bericht beschreibt den implementierten und im LXC ausgerollten Stand
nach Sprint 15. Er enthält keine Werte aus `.env`, keine
Home-Assistant-Zugangsdaten und keine Tokens.

## 1. Aktueller Branch und Ausgangscommit

- Branch: `main`
- Ausgangscommit: `47a5a56 docs: define sprint 15 admin configuration ui`
- Sprint-15-Commit: `332d0a5 feat: add graphical admin configuration ui`
- Upstream: `origin/main`
- `HEAD`, `origin/main` und `origin/HEAD` waren vor der Umsetzung synchron.
- Sprint 15 wurde committed, gepusht und im Produktions-LXC ausgerollt.

## 2. Status des Arbeitsbaums

Der Arbeitsbaum war zu Beginn sauber und ist nach dem Deployment wieder sauber.
Laufzeitkonfiguration, `.env`, Tokens und Browser-Testdaten sind nicht Teil des
Repositories.

## 3. Implementierte Funktionen

### Bestehende Anwendung

- Express-Gateway und Home-Assistant-REST-Anbindung
- iOS-9-/ES5-kompatibles Wall-Display ohne Frontendframework
- Sensor-, Binary-, Light- und Climate-Widgets
- optimistische, explizit allowlisted Climate- und Light-Steuerung
- persistente Multi-Dashboard-Konfiguration mit atomarem Backup
- geschützte Admin API und sanitisiertes Entity-Inventar

### Sprint 15

- separate moderne Admin-Oberfläche unter `/admin`
- Login mit separatem Bearer-Token und optionalem `sessionStorage`
- Logout und Tokenbereinigung bei HTTP 401/403
- Dashboardliste mit Standardmarkierung, Widgetanzahl und Preview-Link
- Dashboard erstellen, umbenennen, duplizieren und löschen
- Standard-Dashboard und Refresh-Intervall bearbeiten
- lokaler Gesamtkonfigurationsentwurf mit Speichern und Verwerfen
- Warnung beim Verlassen mit ungespeicherten Änderungen
- Entity-Browser mit Suche und Domainfilter
- Widget hinzufügen, bearbeiten, ein-/ausblenden, verschieben und entfernen
- Widgetreihenfolge über Auf-/Ab-Schaltflächen statt Drag-and-drop
- verständliche Behandlung definierter API-Fehler

## 4. Implementierte Sprints

| Sprint | Thema | Stand |
|---|---|---|
| 0–3 | Grundlage, Gateway, Legacy-UI und Widgets | umgesetzt |
| 4–6 | Climate, Standalone und Light | umgesetzt |
| 7–8 | Konfiguration, Robustheit und Sicherheit | umgesetzt |
| 9–10 | Tests, Deployment und Betrieb | umgesetzt |
| 11–12 | Wall-Display und Release-Baseline | umgesetzt |
| 13 | Multi-Dashboard Foundation | umgesetzt |
| 14 | Persistenz und Admin-API-Grundlage | umgesetzt |
| 15 | Grafische Admin-Konfiguration | umgesetzt und ausgerollt |

## 5. Entity-Auswahl und Schreibgrenzen

Die Admin-Oberfläche lädt ausschließlich das sanitierte Inventar aus
`GET /api/admin/entities`. Automatisch zuordenbar sind:

| HA-Domain | Widgettyp |
|---|---|
| `sensor` | `sensor` |
| `binary_sensor` | `binary` |
| `light` | `light` |
| `climate` | `climate` |

Andere Domains werden nicht als Widget angeboten. Sichtbarkeit und
Entity-Auswahl steuern nur Anzeige und HA-Lesezugriff. Schreibrechte bleiben
unverändert separat in `src/routes/api.js`:

- Climate: ausschließlich `climate.esszimmer_thermostate`
- Light: ausschließlich `light.esszimmer_lampen`

## 6. Konfigurationsschema

Schema Version 1 bleibt unverändert:

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

Das Backend bleibt finale Validierungsinstanz. Neue und duplizierte Widgets
erhalten bereits im UI-Entwurf global eindeutige IDs; das Backend prüft sie
erneut vor der Speicherung.

## 7. Persistenz und Entwurfsmodell

- Persistenz weiterhin standardmäßig in `data/dashboards.json`
- vollständige Validierung vor Speicherung
- atomare Primärdatei und eine gültige Vorgängerversion als `.bak`
- UI lädt eine vollständige Konfiguration als lokalen Entwurf
- Eingaben persistieren nicht bei jedem Tastendruck
- `PUT /api/admin/config` speichert den Entwurf explizit als Ganzes
- Fehler erhalten Entwurf und letzte gültige Serverkonfiguration
- „Verwerfen“ stellt die zuletzt geladene oder gespeicherte Konfiguration her

Eine Konfliktversion oder ETag für mehrere parallele Admin-Browser existiert
noch nicht.

## 8. Multi-Dashboard-Unterstützung

Alle Sprint-13-/14-Routen bleiben bestehen. Die Admin UI kann Profile
erstellen, umbenennen, duplizieren, löschen und als Standard auswählen.
Technische IDs bleiben nach Erstellung read-only. Das Duplizieren vergibt für
jedes kopierte Widget eine neue globale ID.

Die Root-URL zeigt weiterhin das konfigurierte Standard-Dashboard; explizite
URLs bleiben `/d/:dashboardId`.

## 9. Admin API und Authentifizierung

Die Admin API bleibt ohne `ADMIN_API_ENABLED=true` deaktiviert. Bei Aktivierung
ist ein vom `HA_TOKEN` verschiedener `ADMIN_TOKEN` erforderlich.

Die UI sendet ihn ausschließlich als:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

und ausschließlich an `/api/admin/*`. Er erscheint nicht in URLs, HTML,
öffentlichen Dashboard-Anfragen oder Logs. Die optionale Tab-Speicherung nutzt
`sessionStorage`, niemals `localStorage`. Logout sowie HTTP 401/403 löschen den
Token.

Die Sprint-14-CRUD-Routen und das Rate-Limit für Schreiboperationen bleiben
unverändert.

## 10. Admin-Oberfläche

Die Oberfläche liegt getrennt unter `src/admin/` und wird mit `no-store`
ausgeliefert. Sie verwendet lokale HTML-, CSS- und JavaScript-Dateien ohne CDN
oder Framework. Dynamische HA- und Konfigurationswerte werden über DOM-APIs und
`textContent`, nicht über unbereinigtes `innerHTML`, ausgegeben.

Das moderne Admin-JavaScript ist auf Authentifizierung, API, Zustand,
Dashboards, Widgets, Entities und UI-Orchestrierung aufgeteilt. Das
Wall-Display importiert keinen Admin-Code.

## 11. Relevante Dateien

| Bereich | Dateien |
|---|---|
| Admin-Auslieferung | `src/server.js`, `src/admin/index.html` |
| Admin-Design | `src/admin/css/admin.css` |
| Auth und API | `src/admin/js/auth.js`, `src/admin/js/api.js` |
| lokaler Entwurf | `src/admin/js/state.js` |
| Dashboardlogik | `src/admin/js/dashboards.js` |
| Widgetlogik | `src/admin/js/widgets.js` |
| Entity-Suche | `src/admin/js/entities.js` |
| UI-Orchestrierung | `src/admin/js/app.js` |
| Tests | `test/admin-ui.test.js`, `test/admin-api.test.js`, `test/gateway.test.js` |
| Dokumentation | `README.md`, `CHANGELOG.md`, `docs/SPRINT_ROADMAP.md`, `docs/sprints/SPRINT-15.md` |

## 12. Tests und Ergebnisse

Baseline Sprint 14:

```text
tests 58
pass 58
fail 0
```

Sprint-15-Stand:

```text
tests 62
pass 62
fail 0
cancelled 0
skipped 0
```

Neue Prüfungen decken Session-Token und Logout, reine Admin-API-Ziele,
Dashboard-CRUD, Slugfehler, Duplikat-IDs, Standardwechsel, Entity-Suche,
Domainfilter, bekannte Typen, Widget-CRUD, Sichtbarkeit, Pfeilreihenfolge,
Secret-Grenzen, `/admin`-Auslieferung und unveränderte ES5-Syntax ab.

Alle Integrationsprüfungen verwenden ausschließlich lokale Mock-Dienste auf
`127.0.0.1`, temporäre Konfigurationspfade und Fake-Credentials.

## 13. Manuelle Browserprüfung und bekannte Defekte

Im aktuellen Codex-Browser wurden Login, falscher Token, Logout, Session-
Restore, Dashboard-Erstellung/-Duplizierung, Entity-Suche und -Filter,
Widgetanlage/-bearbeitung/-sichtbarkeit/-reihenfolge, Speichern, Reload,
Verwerfen, Desktop-/Tabletdarstellung sowie `/` und `/d/default` erfolgreich
geprüft. Es gab keine Konsolenfehler.

Safari 18.6 ist auf dem Mac vorhanden, verweigert WebDriver jedoch, solange
„Entfernte Automation erlauben“ in Safari nicht aktiviert ist. Die native
Safari-Sichtprüfung ist daher noch manuell nachzuholen. Ein separater Chrome-,
Chromium- oder Edge-Browser ist auf dem Mac nicht installiert.

Im automatisierten Testlauf ist kein funktionaler Defekt offen.

## 14. Technische Schulden

- keine Konflikterkennung für parallele Admin-Entwürfe
- Bearer-Token liegt während der Sitzung bewusst im Browserkontext; CSP und
  ausschließlich lokale Assets begrenzen die Angriffsfläche
- In-Memory-Rate-Limit ist nicht prozessübergreifend
- keine automatisierte echte Safari-/iOS-9-Ausführung
- keine freie Kachelposition oder -größe
- keine visuelle Icon-Vorschau, nur eine auf bekannte Namen begrenzte Auswahl

## 15. Abweichungen zwischen Roadmap und Code

Die Roadmap ist bis Sprint 15 aktualisiert. Sprint 15 verwendet für gebündelte
Entwurfsänderungen bevorzugt die vorhandene Gesamtconfig-Route statt für jede
lokale Einzelaktion sofort eine CRUD-Route aufzurufen. Dadurch wird nicht bei
jedem Tastendruck geschrieben; Backendvalidierung, atomare Persistenz und
Rate-Limit bleiben dieselben.

Es wurden bewusst weder Drag-and-drop noch freie Positionierung, Tile-Größen,
Layoutprofile, neue HA-Schreibdomänen, HACS oder App-Packaging implementiert.

## 16. Grundlage für Sprint 16

Die Grundlage für einen späteren Layout-Sprint besteht aus:

- stabilen Dashboard- und Widget-IDs
- persistenter, versionierter Gesamtconfig
- getrenntem modernen Admin-Frontend
- lokalem Entwurfs- und Speichermodell
- normalisierter Widgetreihenfolge
- weiterhin klarer Trennung von Sichtbarkeit und Schreibberechtigung

Vor paralleler Mehrbenutzerbearbeitung sollte Sprint 16 eine
Konfigurationsrevision beziehungsweise ETag-Konflikterkennung ergänzen. Freie
Positionierung oder Größen benötigen außerdem eine neue Schema-Version und
dürfen nicht stillschweigend in Schema 1 aufgenommen werden.
