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
| 6 | Weitere steuerbare Entitäten | vorgeschlagen |
| 7 | Konfigurationsgetriebene Dashboards | vorgeschlagen |
| 8 | Robustheit und Sicherheit | vorgeschlagen |
| 9 | Lokale Mock- und Integrationstests | abgeschlossen |
| 10 | Deployment und Betrieb | vorgeschlagen |
| 11 | Wall-Display-Betrieb | vorgeschlagen |
| 12 | Release und Dokumentation | vorgeschlagen |

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

## Vorgeschlagen

- `light`
- `switch`
- `cover`
- `weather`
- `media_player`
- weitere `climate`- und `binary_sensor`-Widgets

## Sicherheitsanforderung

Jede schreibbare Entity muss im Backend explizit erlaubt werden. Es darf keine
generische Browser-API für beliebige HA-Services geben.

---

# Sprint 7 – Konfigurationsgetriebene Dashboards

## Vorgeschlagen

Eine Konfiguration soll Entity-ID, Widget-Typ, Titel, Icon, Einheit,
Reihenfolge und Sichtbarkeit definieren.

Frontend-Konfiguration und Backend-Schreibrechte bleiben strikt getrennt.

---

# Sprint 8 – Robustheit, Fehlerbehandlung und Sicherheit

## Vorgeschlagen

- zentrale Fehlerbehandlung
- Request-Timeouts
- definierte HTTP-Statuscodes
- strukturierte Logs
- HA-Erreichbarkeitsstatus
- Anzeige veralteter Daten
- letzter erfolgreicher Refresh
- Rate-Limit für schreibende Endpunkte
- Payload-Begrenzung
- sichere HTTP-Header
- keine Secrets in Logs

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

## Aktueller Ablauf

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

## Vorgeschlagen

- Deployment-Checkliste
- Syntaxprüfung vor Neustart
- Health-Check danach
- Rollback
- Release-Tags
- optionales Deployment-Skript

---

# Sprint 11 – Wall-Display-Betrieb

## Vorgeschlagen

- Uhr und Datum
- Verbindungsstatus
- letzter erfolgreicher Refresh
- automatische Wiederverbindung
- konfigurierbares Refresh-Intervall
- Tag-/Nacht-Darstellung
- Netzwerkfehler-Banner
- große Touch-Ziele

Echte Kiosk- und Bildschirmsteuerung bleibt durch iOS 9 begrenzt.

---

# Sprint 12 – Release, Dokumentation und Wartbarkeit

## Vorgeschlagen

- Versionierung
- `CHANGELOG.md`
- Installationsanleitung
- Upgrade- und Rollback-Anleitung
- Troubleshooting
- Sicherheitsdokumentation
- Testdokumentation
- Entity-Beispiele
- bekannte Einschränkungen
- Lizenzentscheidung

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
