# HA Legacy Dashboard – Sprint Roadmap

## Zweck

Diese Datei fasst die bisher umgesetzten, aktuell offenen und geplanten Sprints
des Projekts zusammen. Sie ergänzt `AGENTS.md`, `README.md` und
`docs/CODEX_HANDOFF.md`.

Codex muss vor Änderungen immer den tatsächlichen Repository-Stand prüfen.

## Projektziel

Ein leichtgewichtiges Home-Assistant-Dashboard für ein Apple iPad mini der
ersten Generation mit iOS 9.3.5 und Safari unter iOS 9.

```text
Legacy-Browser -> HA Legacy Dashboard Gateway -> Home Assistant REST API
```

Der Home-Assistant-Token verbleibt ausschließlich im Backend.

## Statusübersicht

| Sprint | Thema | Status |
|---|---|---|
| 0 | Projektgrundlage und Repository | abgeschlossen |
| 1 | Express-Gateway und HA-Anbindung | abgeschlossen |
| 2 | Legacy-kompatibles Dashboard | abgeschlossen |
| 3 | Modulare Widgets, Icons und Theme | abgeschlossen |
| 4 | Climate-Widget und Solltemperatur | abgeschlossen |
| 5 | Standalone-Web-App für iOS 9 | abgeschlossen |
| 6 | Weitere steuerbare Entitäten | abgeschlossen |
| 7 | Konfigurationsgetriebene Dashboards | abgeschlossen |
| 8 | Robustheit und Sicherheit | abgeschlossen |
| 9 | Lokale Mock- und Integrationstests | abgeschlossen |
| 10 | Deployment und Betrieb | abgeschlossen |
| 11 | Wall-Display-Betrieb | abgeschlossen |
| 12 | Release und Dokumentation | abgeschlossen |
| 13 | Multi-Dashboard Foundation | abgeschlossen |
| 14 | Persistenz und Admin-API-Grundlage | abgeschlossen |
| 15 | Grafische Admin-Konfiguration | abgeschlossen |
| 16 | Konfigurierbare Kachelgrößen | abgeschlossen |

---

# Sprint 0 – Projektgrundlage und Repository

## Umgesetzt

- Git-Repository und GitHub-Repository eingerichtet
- Branch auf `main` vereinheitlicht
- getrennte Historien zusammengeführt
- SSH-Zugriff vom LXC und Mac zu GitHub eingerichtet
- Repository auf dem Mac geklont
- `.gitignore` und Ausschluss von `.env`
- `README.md`, `AGENTS.md` und `docs/CODEX_HANDOFF.md`
- Codex-Arbeitsordner auf dem Mac vorbereitet

## Relevante Commits

```text
2491f61 Initial project setup
e7d2d48 merge: integrate initial GitHub repository
aa44565 docs: add Codex instructions and project handoff
```

---

# Sprint 1 – Express-Gateway und Home-Assistant-Anbindung

## Ziel

Sicheres Backend zwischen Legacy-Browser und Home Assistant.

## Umgesetzt

- Node.js und Express
- `.env`-Konfiguration
- axios-basierte HA-Kommunikation
- `/api/status`
- `/api/dashboard`
- statische Frontend-Auslieferung
- Token ausschließlich serverseitig

## Dateien

```text
src/server.js
src/routes/api.js
src/services/homeassistant.js
```

---

# Sprint 2 – Legacy-kompatibles Dashboard

## Umgesetzt

- responsive Kartenansicht
- Flexbox statt CSS Grid
- Portrait und Landscape
- Light Mode und Dark Mode
- manueller Theme-Schalter
- Theme-Persistenz
- automatischer Refresh
- ES5-kompatibles Frontend
- Wechsel von `fetch` zu `XMLHttpRequest`

## Dateien

```text
src/public/index.html
src/public/css/style.css
src/public/js/app.js
src/public/js/core/compat.js
src/public/js/core/theme.js
```

---

# Sprint 3 – Modulare Widgets, Icons und Dashboard-Struktur

## Umgesetzt

- Widget-Basiskonzept
- Dashboard-Renderer
- Inline-SVG-Icons
- Temperatur-Widget
- Luftfeuchtigkeits-Widget
- Binary-Sensor-Widget
- Fensterstatus
- zentrale Widget-Registrierung

## Aktuelle Entitäten

```text
sensor.badezimmer_smart_indoor_module_temperatur
sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit
binary_sensor.kuche_fenster_rechts
binary_sensor.kuche_fenster_mitte
```

---

# Sprint 4 – Climate-Widget und Solltemperatursteuerung

## Umgesetzt

- Climate-Widget
- Ist- und Solltemperatur
- HVAC-Status beziehungsweise HVAC-Aktion
- Plus-/Minus-Steuerung
- `POST /api/climate/temperature`
- Entity-Allowlist
- Eingabevalidierung
- HA-Service `climate.set_temperature`

## Entity

```text
climate.esszimmer_thermostate
```

## Beobachtetes Problem

Nach dem Drücken von Plus erschien:

```text
Setze Zieltemperatur auf 22.5 °C …
```

Die Erfolgsmeldung und der neue Zielwert wurden zunächst nicht sichtbar.

## Vorgesehene Korrektur

- Zielwert optimistisch aktualisieren
- Refresh kurz blockieren
- Erfolgsmeldung nicht sofort überschreiben
- HA-State kurz nachprüfen
- HTTP 200 bei Bestätigung
- HTTP 202 bei noch ausstehender Bestätigung

## Abschluss

- Zielwert wird optimistisch aktualisiert
- schnelle Plus-/Minus-Klicks werden zusammengefasst
- Bedienelemente bleiben während der HA-Bestätigung aktiv
- veraltete Refresh-Antworten werden verworfen
- HTTP 200 und HTTP 202 werden korrekt verarbeitet
- Funktion auf dem iPad unter iOS 9 abgenommen

## Abnahmekriterien

- Plus und Minus funktionieren
- Zielwert ändert sich unmittelbar
- Erfolgsmeldung bleibt sichtbar
- Refresh überschreibt keinen neuen Wert
- korrekter HA-Service-Aufruf
- verständliche Fehleranzeige
- kein Token im Browser

---

# Sprint 5 – Standalone-Web-App für iOS 9

## Umgesetzt

- Apple-Web-App-Meta-Tags
- `apple-mobile-web-app-capable`
- `apple-mobile-web-app-title`
- Statusbalkenstil für den Standalone-Modus
- lokale Apple-Touch-Icons in 76, 120, 152 und 180 Pixeln
- Start über den Home-Bildschirm
- Vollbildmodus ohne Safari-Adress- und Buttonleisten
- Manifest und Icons in 192 und 512 Pixeln für moderne Browser
- keine Service-Worker-Registrierung
- HTML und Manifest werden nicht dauerhaft gecacht
- versionierte statische Assets erhalten langfristige Cache-Header
- automatisierte Tests für Metadaten, Manifest, Icons und Cache-Header

## Einschränkung

iOS 9 unterstützt keine Service Worker. Ziel ist daher eine klassische
iOS-Standalone-Web-App, keine moderne Offline-PWA.

---

# Sprint 6 – Weitere steuerbare Entitäten

## Umgesetzt

- ES5-kompatibles `light`-Widget mit großem Touch-Schalter
- explizit freigegebene Entity `light.esszimmer_lampen`
- eigener Gateway-Endpunkt `POST /api/light/state`
- ausschließlich fest zugeordnete Services `light.turn_on` und
  `light.turn_off`
- sofortige optimistische Anzeige ohne mehrsekündige Buttonsperre
- schnelle Folgetaps werden auf den zuletzt gewünschten Zustand
  zusammengeführt
- Fehleranzeige und anschließender Zustands-Refresh
- Light-/Dark-Mode und mindestens 44 Pixel große Touch-Ziele
- Gateway- und Frontendtests für erlaubte und abgewiesene Befehle

## Bewusst nicht freigegeben

- beliebige `switch`-Entities
- Garagentore oder andere `cover`-Entities
- Pumpen, Server-Steckdosen und sonstige sensible Geräte
- beliebige Home-Assistant-Domänen oder Services aus Browserdaten

`weather`, `media_player`, weitere `climate`- und `binary_sensor`-Widgets
bleiben mögliche spätere Erweiterungen und erhalten ohne konkrete Auswahl
keine zusätzlichen Dashboard-Kacheln.

## Sicherheitsanforderung

Jede schreibbare Entity muss im Backend explizit erlaubt werden. Es darf keine
generische Browser-API für beliebige HA-Services geben.

---

# Sprint 7 – Konfigurationsgetriebene Dashboards

## Umgesetzt

- zentrale Konfiguration in `src/config/dashboard.js`
- Entity-ID, Widget-Typ, Titel, Untertitel, Icon, Icon-Klasse, Einheit,
  Reihenfolge und Sichtbarkeit je Eintrag
- sichtbare Entity-Liste für `/api/dashboard` wird aus der Konfiguration
  abgeleitet
- eigener read-only Endpunkt `GET /api/dashboard/config`
- Frontend lädt Konfiguration vor den Zustandsdaten
- explizite Zuordnung der erlaubten Typen `sensor`, `binary`, `light` und
  `climate`
- unbekannte Widget-Typen werden ignoriert und nicht dynamisch ausgeführt
- fehlgeschlagene Konfigurationsabfragen werden beim nächsten Intervall erneut
  versucht
- automatisierte Tests für Reihenfolge, Sichtbarkeit, Typ-Allowlist,
  API-Ausgabe und Ladeabfolge

## Sicherheitstrennung

Die Dashboard-Konfiguration steuert ausschließlich Anzeige und lesende
Entity-Abfragen. Sie enthält keine Services und gewährt keine Schreibrechte.
Die Allowlisten für `climate` und `light` verbleiben separat in
`src/routes/api.js`.

---

# Sprint 8 – Robustheit, Fehlerbehandlung und Sicherheit

## Umgesetzt

- zentrale Express-Fehlerbehandlung für ungültiges JSON und zu große Payloads
- 10-Sekunden-Timeouts für Browser- und HA-Requests
- definierte Statuscodes einschließlich 400, 403, 404, 413, 429, 502 und 503
- strukturierte einzeilige JSON-Logs
- zusätzliche Redaktion von Feldnamen wie Token, Authorization, Password und
  Secret
- `GET /api/status` mit getrenntem Gateway- und HA-Erreichbarkeitsstatus
- `_meta` in Dashboard-Antworten mit HA-Status, Abrufzeit und ausgefallenen
  sichtbaren Entities
- letzte erfolgreiche Kacheln bleiben bei vollständigem HA-Ausfall sichtbar
- Anzeige des letzten vollständigen erfolgreichen Refreshs
- Kennzeichnung teilweiser Erreichbarkeit
- Rate-Limit von 10 tatsächlichen HA-Schreibaufrufen je Entity und 10 Sekunden
- JSON-Payload-Limit von 16 KB
- `Cache-Control: no-store` für API-Antworten
- Content-Security-Policy, `X-Frame-Options: DENY`, `Referrer-Policy:
  no-referrer` und `X-Content-Type-Options: nosniff`
- Express-Technologieheader deaktiviert
- automatisierte Sicherheits-, Gateway- und Frontendtests

---

# Sprint 9 – Lokale Mock- und Integrationstests

## Umgesetzt

- integrierter Node-Test-Runner ohne zusätzliche Testabhängigkeiten
- Frontend-Test mit Fake-DOM und kontrollierten Timern
- echter Gateway-Prozess gegen lokalen Mock-Home-Assistant
- Test-Gateway startet in einem leeren temporären Arbeitsverzeichnis
- ausschließlich gefälschter HA-Token
- Mock-Server bindet nur an `127.0.0.1`
- automatische Bereinigung aller Testprozesse und temporären Dateien

Ausführung:

```bash
npm test
```

## Verbindliche Regeln

- nur `127.0.0.1` oder `localhost`
- kein Kontakt zum realen Home Assistant
- produktive `.env` nicht lesen
- nur gefälschte Credentials
- produktiven systemd-Service nicht verändern
- temporäre Artefakte nicht committen
- Mock-Server nach Tests beenden

## Testfälle

- Status- und Dashboard-Endpunkt
- fehlende Entity
- Timeout und HTTP-Fehler
- ungültiges JSON
- erlaubte und nicht erlaubte Climate-Entity
- gültige und ungültige Temperatur
- Minimum, Maximum und Step
- HA-Fehler
- verzögerte Bestätigung
- HTTP 200 und HTTP 202

---

# Sprint 10 – Deployment und Betrieb

## Bisheriger Ablauf

Mac:

```bash
git status
git add .
git commit -m "..."
git push
```

LXC:

```bash
cd /home/dashboard/ha-legacy-dashboard
git pull --ff-only
```

Backend-Änderungen:

```bash
systemctl restart ha-legacy-dashboard.service
systemctl status ha-legacy-dashboard.service --no-pager -l
```

## Umgesetzt

- ausführbare Deployment-Checkliste in `deploy/check.sh`
- Syntaxprüfung aller JavaScript-Dateien vor einem Neustart
- vollständige Mock- und Integrationstests vor einem Neustart
- ausschließlich Fast-Forward von `origin/main`
- optionales `npm ci --omit=dev` bei geänderter Lockdatei
- read-only Health-Check für Dienst, APIs, Dashboard-Metadaten und Header
- explizites Rollback auf Commit oder Tag mittels Detached HEAD
- kein `git reset --hard`, kein Force-Push und kein Überschreiben von Branches
- Dokumentation für Release-Tags
- GitHub-CI für Pushes und Pull Requests ohne produktive Credentials
- eng begrenzte optionale sudoers-Regel ausschließlich für den Neustart von
  `ha-legacy-dashboard.service`
- vollständige Betriebsanleitung in `docs/DEPLOYMENT.md`

---

# Sprint 11 – Wall-Display-Betrieb

## Umgesetzt

- gut lesbare Uhr und deutsches Datum im Kopfbereich
- sichtbarer Zustand für Gateway und Home Assistant
- letzter erfolgreicher Refresh bleibt unter den Kacheln sichtbar
- automatische Wiederverbindung durch Intervall und Online-Ereignis
- serverseitig validiertes Refresh-Intervall über
  `DASHBOARD_REFRESH_INTERVAL_MS` von 3000 bis 300000 Millisekunden
- bestehende manuelle Tag-/Nacht-Darstellung mit sicherer Persistenz
- Netzwerkfehler-Banner, das nach erfolgreicher Verbindung verschwindet
- bestehende große Touch-Ziele bleiben erhalten
- automatisierte Frontend- und Gateway-Tests für Status, Erholung und Intervall

Echte Kiosk- und Bildschirmsteuerung bleibt durch iOS 9 begrenzt.

---

# Sprint 12 – Release, Dokumentation und Wartbarkeit

## Umgesetzt

- Versionierung
- `CHANGELOG.md`
- Installationsanleitung
- Upgrade- und Rollback-Anleitung
- Troubleshooting
- Sicherheitsdokumentation
- Testdokumentation
- Entity-Beispiele
- bekannte Einschränkungen
- dokumentierter Hinweis auf die noch offene Lizenzentscheidung

Die Release-Baseline `1.0.0`, der Changelog, die Wartungsdokumentation, die
isolierten Rate-Limit-Tests und das kompaktere UI sind umgesetzt. Eine
Projektlizenz bleibt eine bewusste Entscheidung des Projektinhabers.

---

# Sprint 13 – Multi-Dashboard Foundation

## Umgesetzt

- statische, versionierte Dashboardprofile in `src/config/dashboard.js`
- eindeutiges Standard-Dashboard `default`
- zweites Dashboard `esszimmer` mit vorhandenen Light- und Climate-Entities
- stabile Browserpfade `/d/default` und `/d/esszimmer`
- öffentliche Dashboardliste `GET /api/dashboards`
- dashboard-spezifische Konfiguration und Zustände
- kontrollierte 404-Antworten für unbekannte Dashboard-IDs
- Legacy-Routen `/api/dashboard/config` und `/api/dashboard` zeigen weiterhin
  das Standard-Dashboard
- dashboard-spezifische, deduplizierte HA-Leselisten
- dynamischer Dashboardtitel im bestehenden ES5-Frontend
- unveränderte, getrennte Schreib-Allowlisten für Climate und Light
- keine Admin-UI, keine Laufzeitpersistenz und keine Layoutbearbeitung
- automatisierte Konfigurations-, Frontend-, Routing- und Integrationstests

---

# Sprint 14 – Persistenz und Admin-API-Grundlage

## Umgesetzt

- versioniertes Konfigurationsschema `schemaVersion: 1`
- stabile, global eindeutige Widget-IDs
- Standardpersistenz in `data/dashboards.json`
- Pfadüberschreibung über `DASHBOARD_CONFIG_PATH`
- automatische Migration der Sprint-13-Profile beim ersten Start
- vollständige Validierung vor jeder Speicherung
- atomare Ersetzung und eine gültige Vorgängerversion als `.bak`
- Wiederherstellung aus gültigem Backup bei beschädigter Primärdatei
- standardmäßig deaktivierte Admin-API
- separater Bearer-Token, der nicht dem HA-Token entsprechen darf
- CRUD-Routen für Gesamtkonfiguration, Dashboards und Widgets
- sanitisiertes Entity-Inventar ohne Rohzustände oder beliebige Attribute
- Rate-Limit für Admin-Schreiboperationen
- unveränderte Climate- und Light-Schreib-Allowlisten
- keine grafische Admin-Oberfläche, keine Layoutbearbeitung und keine
  automatische Schreibberechtigung

---

# Sprint 15 – Grafische Admin-Konfiguration

## Umgesetzt

- getrennte moderne Oberfläche unter `/admin`
- session-scoped Bearer-Anmeldung mit Logout und automatischer Bereinigung bei
  HTTP 401/403
- lokaler Gesamtkonfigurationsentwurf mit explizitem Speichern und Verwerfen
- Dashboard erstellen, umbenennen, duplizieren und löschen
- Standard-Dashboard und Refresh-Intervall bearbeiten
- global eindeutige Widget-IDs beim Duplizieren und Hinzufügen
- sanitisiertes Entity-Inventar mit Suche und Domainfilter
- ausschließlich bekannte Widgettypen und vorhandene Icon-Namen
- Widgettitel, Untertitel, Icon, Einheit, Sichtbarkeit und Reihenfolge
- Auf-/Ab-Steuerung ohne Drag-and-drop
- verständliche API-Fehler und Warnung bei ungespeicherten Änderungen
- lokale Admin-Assets ohne CDN oder Framework
- unverändertes ES5-/iOS-9-Wall-Display und unveränderte HA-Schreib-Allowlisten

---

# Sprint 16 – Konfigurierbare Kachelgrößen

## Umgesetzt

- Schema-Version 2 mit validiertem Widgetfeld `size`
- automatische Migration von Schema 1 mit `size: normal` ohne Änderung
  bestehender IDs, Entities, Reihenfolge oder Sichtbarkeit
- feste Presets `compact`, `normal`, `wide`, `tall` und `large`
- Kachelgrößen-Auswahl und Größenanzeige in der Admin-Oberfläche
- Größenübernahme bei Dashboardduplikaten und Standard `normal` für neue
  Widgets
- kontrollierter API-Fehler `invalid_widget_size` ohne Teilpersistenz
- sichere, allowlist-basierte CSS-Klassen im ES5-Wall-Display
- responsiver Flexbox-Fluss für schmale, mittlere und große Displays
- unveränderte Climate-/Light-Touchziele und Schreib-Allowlisten
- Legacy-Asset-Cache-Version 18
- keine freie Positionierung, keine frei definierbaren Maße und kein
  Drag-and-drop

---

# Priorisierte Reihenfolge

1. Sprint 4 vollständig verifizieren und abschließen
2. Sprint 9 lokale Mock- und Integrationstests
3. Sprint 5 iOS-Standalone-Web-App
4. Sprint 8 Robustheit und Sicherheit
5. Sprint 10 Deployment und Rollback
6. Sprint 6 weitere Entitäten
7. Sprint 7 Konfigurationssteuerung
8. Sprint 11 Wall-Display-Funktionen
9. Sprint 12 Release und Dokumentation
10. Sprint 13 Multi-Dashboard-Grundlage
11. Sprint 14 Persistenz und Admin-API-Grundlage
12. Sprint 15 grafische Admin-Konfiguration
13. Sprint 16 konfigurierbare Kachelgrößen

---

# Arbeitsregeln für Codex

Vor jeder Änderung:

```bash
git status
git log --oneline -10
```

Weitere Regeln:

- relevante Dateien vor Änderungen vollständig lesen
- pro Auftrag nur ein klar begrenztes Feature oder Problem
- Frontend bleibt ES5- und iOS-9-kompatibel
- `.env` niemals committen
- Token niemals ins Frontend
- schreibbare Entities explizit erlauben
- jede geänderte JavaScript-Datei mit `node --check` prüfen
- nach Frontend-Änderungen Cache-Versionen in `index.html` erhöhen
- Backend-Änderungen erfordern einen Service-Neustart

---

# Empfohlener Codex-Startprompt

```text
Read AGENTS.md, README.md, docs/CODEX_HANDOFF.md and
docs/SPRINT_ROADMAP.md.

Inspect the current Git status, recent commits and actual implementation.

Do not assume that planned or previously proposed changes already exist.

Identify the current sprint and compare its acceptance criteria with the
actual code.

Work on only one clearly bounded issue at a time.

Preserve Safari iOS 9 and ECMAScript 5 frontend compatibility.
Do not expose Home Assistant credentials to the frontend.

You may use local-only mock HTTP servers for integration tests under these
conditions:

- bind only to 127.0.0.1 or localhost,
- do not contact the real Home Assistant instance,
- do not read or use the production .env,
- use fake credentials only,
- do not modify the production systemd service,
- do not commit temporary secrets, logs or test artifacts,
- stop all mock servers after testing.
```
