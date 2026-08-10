# Projektstatus – HA Legacy Dashboard

Stand der Prüfung: 10. August 2026

Dieser Bericht beschreibt den lokalen Stand nach Umsetzung von Sprint 12 und
vor Review, Commit, Deployment oder iPad-Abnahme. Er enthält keine Werte aus
`.env`, keine Home-Assistant-Zugangsdaten und keine Tokens.

## 1. Aktueller Branch und Commit

- Branch: `main`
- Commit: `628ae319dacb7ae2be169b17a7c5f4b12ae63207`
- Kurzform: `628ae31`
- Commit-Betreff: `docs: define sprint 12 ui polish and release baseline`
- Upstream: `origin/main`
- `HEAD`, `origin/main` und `origin/HEAD` zeigen auf denselben Commit.
- Es sind keine Git-Tags vorhanden.

Relevante Prüfung:

```text
* main 628ae31 [origin/main] docs: define sprint 12 ui polish and release baseline
```

## 2. Status des Arbeitsbaums

Der Arbeitsbaum enthält die noch nicht committed Sprint-12-Umsetzung:

```text
## main...origin/main
 M README.md
 M docs/sprints/SPRINT-12.md
 M package-lock.json
 M package.json
 M src/public/css/style.css
 M src/public/index.html
 M src/public/js/app.js
 M src/public/js/widgets/climate.js
 M src/public/manifest.json
 M src/routes/api.js
 M test/gateway.test.js
 M test/standalone.test.js
?? CHANGELOG.md
?? docs/PROJECT_STATUS.md
?? test/write-rate-limit.test.js
```

`docs/sprints/SPRINT-12.md` wurde während der Bearbeitung außerhalb der
fachlichen Sprint-Implementierung vom committed binären Property-List-Format
in UTF-8-Text umgewandelt und erscheint deshalb ebenfalls als geändert. Diese
inhaltlich gleichwertige externe Änderung wurde nicht zurückgesetzt. Es wurde
auf Anweisung weder committed noch gepusht.

## 3. Implementierte Funktionen

### Backend und Sicherheit

- Express-Gateway auf Node.js
- Home-Assistant-Anbindung über die REST-API mit Axios
- Home-Assistant-Zugangsdaten ausschließlich im Backend
- paralleles Lesen der ausgewählten Home-Assistant-Entities
- explizite Schreib-Allowlisten für Climate und Light
- fest zugeordnete Services `climate.set_temperature`, `light.turn_on` und
  `light.turn_off`
- Validierung von Entity, Temperatur, Minimum, Maximum und Temperaturschritt
- 10 Sekunden Timeout für Browser- und Home-Assistant-Anfragen
- 16-KB-Limit für JSON-Anfragen
- In-Memory-Rate-Limit für erlaubte Schreibzugriffe
- strukturierte JSON-Logs mit Redaktion sensitiver Feldnamen
- generische Frontendfehler und detailliertere Backendlogs
- Sicherheitsheader einschließlich CSP, `X-Frame-Options`,
  `Referrer-Policy` und `X-Content-Type-Options`
- deaktivierter Express-Technologieheader
- `Cache-Control: no-store` für API-Antworten

### API

- Gateway- und Home-Assistant-Status
- öffentliche, bereinigte Dashboardkonfiguration
- Dashboardzustände mit Erreichbarkeitsmetadaten
- Climate-Solltemperatursteuerung mit Bestätigungsprüfung
- Light-Ein-/Aus-Steuerung
- definierte Fehlercodes für ungültige oder nicht erlaubte Anfragen

### Frontend

- HTML, CSS und plain JavaScript ohne Frontendframework
- ES5-kompatibler Browsercode und `XMLHttpRequest` über `Legacy.http`
- responsive Flexbox-Kartenansicht ohne CSS Grid und ohne Flexbox `gap`
- Portrait- und Landscape-Darstellung
- Light- und Dark-Mode mit manuellem Umschalter
- lokale Theme-Persistenz mit sicherem Fehlerfallback
- Inline-SVG-Icons ohne CDN oder Iconfont
- Sensor-, Binary-, Light- und Climate-Widgets
- optimistische Light- und Climate-Bedienung
- Zusammenfassen schneller Climate- und Light-Eingaben
- Schutz vor Überschreiben optimistischer Zustände durch ältere Refreshes
- automatische Aktualisierung mit serverseitig begrenztem Intervall
- Anzeige alter Daten bei vollständigem Home-Assistant-Ausfall
- Kennzeichnung teilweiser Verfügbarkeit
- Uhr, deutsches Datum, Verbindungsstatus und Netzwerkfehlerbanner
- automatische Wiederverbindung über Intervall und Browser-Online-Ereignis
- kompakte 44-Pixel-Kopfzeile mit weiterhin 44 Pixel großem Theme-Touchziel
- kompaktere allgemeine Kartenabstände und Mindesthöhen
- kompakte Climate-Karte mit Titel und HVAC-Status in der Kopfzeile
- Ist- und Solltemperatur ab 740 Pixeln in einer gemeinsamen Wertezeile
- kontrolliert gestapeltes Climate-Layout auf schmaleren Displays
- geometrisch zentrierte Plus-/Minus-SVGs in 46-Pixel-Touchzielen

### Standalone-Betrieb

- Apple-Web-App-Metatags für iOS 9
- lokale Apple-Touch-Icons
- Web-App-Manifest für moderne Browser
- Standalone-Start vom iOS-Home-Bildschirm
- versionierte Frontendassets, aktuell Cache-Version `v=16`
- kein Service Worker, weil iOS 9 diesen nicht unterstützt

### Betrieb

- systemd-Unit für den Produktionsbetrieb
- automatisierter Syntax-, Diff- und Testcheck
- Fast-Forward-Deployment von `origin/main`
- Dienstneustart über eine eng begrenzte sudoers-Regel
- produktiver Health-Check
- expliziter Rollback auf Commit oder Tag in einem Detached HEAD
- GitHub Actions für Pushes und Pull Requests ohne Produktionszugangsdaten

## 4. Implementierte Sprints

| Sprint | Thema | Tatsächlicher Stand |
|---|---|---|
| 0 | Projektgrundlage und Repository | umgesetzt |
| 1 | Express-Gateway und HA-Anbindung | umgesetzt |
| 2 | Legacy-kompatibles Dashboard | umgesetzt |
| 3 | Modulare Widgets, Icons und Theme | umgesetzt |
| 4 | Climate-Widget und Solltemperatur | umgesetzt und korrigiert |
| 5 | Standalone-Web-App für iOS 9 | umgesetzt |
| 6 | Weitere steuerbare Entitäten | Light-Widget umgesetzt; keine generische Entity-Steuerung |
| 7 | Konfigurationsgetriebenes Dashboard | für ein einzelnes Dashboard umgesetzt |
| 8 | Robustheit und Sicherheit | umgesetzt |
| 9 | Lokale Mock- und Integrationstests | umgesetzt und inzwischen erweitert |
| 10 | Deployment und Betrieb | umgesetzt und produktiv verwendet |
| 11 | Wall-Display-Betrieb | umgesetzt; Kopfzeile anschließend kompakter gestaltet |
| 12 | UI Polish und Release-Baseline | lokal umgesetzt; Review und iPad-Abnahme offen |

Damit stimmen die Statusangaben für Sprint 0 bis 11 im Wesentlichen mit der
Implementierung überein. Sprint 12 ist technisch umgesetzt, aber bis zum
Nutzerreview, der realen iOS-9-Abnahme und einem später ausdrücklich
freigegebenen Commit noch nicht veröffentlicht.

## 5. Aktueller Mechanismus zur Entity-Auswahl

Die Entity-Auswahl erfolgt statisch im Backendquellcode und ist in Lese- und
Schreibrechte getrennt.

### Lesende Auswahl

`src/config/dashboard.js` enthält das Array `WIDGETS`. Sichtbare Einträge
werden durch `visible !== false` ausgewählt, nach `order` sortiert und über
`getVisibleEntityIds()` zur Leseliste für Home Assistant abgeleitet.

Aktuell sichtbar und gelesen werden:

| Reihenfolge | Entity | Widget-Typ |
|---:|---|---|
| 10 | `sensor.badezimmer_smart_indoor_module_temperatur` | `sensor` |
| 20 | `sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit` | `sensor` |
| 30 | `binary_sensor.kuche_fenster_rechts` | `binary` |
| 40 | `light.esszimmer_lampen` | `light` |
| 50 | `climate.esszimmer_thermostate` | `climate` |

Konfiguriert, aber unsichtbar und daher nicht gelesen wird:

- `binary_sensor.kuche_fenster_mitte` mit `visible: false`

### Schreibende Auswahl

Schreibrechte werden nicht aus der Dashboardkonfiguration abgeleitet.
`src/routes/api.js` enthält getrennte Allowlisten:

- `ALLOWED_CLIMATE_ENTITIES`: nur
  `climate.esszimmer_thermostate`
- `ALLOWED_LIGHT_ENTITIES`: nur `light.esszimmer_lampen`

Ein sichtbarer Konfigurationseintrag gewährt somit keine Schreibrechte. Eine
Änderung der Entity-Auswahl erfordert eine Quellcodeänderung und einen
Backendneustart beziehungsweise ein Deployment.

## 6. Aktueller Mechanismus der Dashboardkonfiguration

Es gibt eine zentrale, statische Backendkonfiguration in
`src/config/dashboard.js`. Pro Widget werden aktuell folgende Felder gepflegt:

- `entity`
- `type`
- `title`
- `subtitle`
- `icon`
- `iconClass`
- `unit`
- `order`
- `visible`

`GET /api/dashboard/config` liefert nur sichtbare, bereinigte Einträge sowie
das validierte `refresh_interval_ms`. Services und Schreibberechtigungen sind
nicht Teil dieser Antwort. Das Frontend lädt diese Konfiguration vor den
Zuständen und erzeugt ausschließlich die fest bekannten Typen `sensor`,
`binary`, `light` und `climate`. Unbekannte Typen werden verworfen.

Das Refresh-Intervall stammt aus einer optionalen Backendumgebungsvariable,
wird auf 3.000 bis 300.000 Millisekunden begrenzt und fällt bei ungültigen
Werten auf 5.000 Millisekunden zurück.

Es gibt keine Konfigurationsdatei im JSON- oder YAML-Format, keine Datenbank
und keinen Laufzeit-Schreibendpunkt für die Dashboardkonfiguration.

## 7. Aktuelle Multi-Dashboard-Unterstützung

Multi-Dashboard-Unterstützung ist nicht vorhanden.

- Es existiert genau ein `WIDGETS`-Array.
- Es gibt keine Dashboard-ID, keinen Slug und keine Dashboardliste.
- Es gibt nur `GET /api/dashboard/config` und `GET /api/dashboard`.
- Die Root-URL `/` liefert genau eine Oberfläche aus.
- Das Frontend kennt keinen Dashboardparameter und keinen Dashboardwechsel.
- Das Manifest verwendet `./` als `start_url` und `scope`.

Mehrere Geräte können dieselbe Oberfläche öffnen, aber nicht serverseitig
unterschiedliche Dashboards auswählen.

## 8. Aktuelle Unterstützung für Kachelposition und -größe

Die Positionierung ist bewusst einfach und vollständig CSS-/Reihenfolge-
basiert.

### Vorhanden

- numerische Reihenfolge über `order`
- Sortierung vor Erzeugung der Widgetinstanzen
- Flexbox mit Umbruch
- unter 600 Pixeln: eine normale Kachel pro Zeile
- ab 600 Pixeln: zwei normale Kacheln pro Zeile
- ab 900 Pixeln: drei normale Kacheln pro Zeile
- Climate belegt ab 900 Pixeln zwei normale Spalten
- typabhängige Mindesthöhen für normale, Light- und Climate-Karten
- besondere kompaktere Höhen und Abstände für kleine Displays und Landscape

### Nicht vorhanden

- keine frei definierbaren X-/Y-Positionen
- keine Zeilen-/Spaltenkoordinaten
- keine pro Kachel konfigurierbare Breite oder Höhe
- kein Drag-and-drop
- keine Benutzerreihenfolge im Browser
- keine gerätespezifischen Layoutprofile
- keine persistierte Kachelposition

Die aktuelle Konfiguration kann damit Reihenfolge und Sichtbarkeit steuern,
aber nicht individuelle Position oder Größe.

## 9. Aktuelle Admin- oder Konfigurationsoberfläche

Es gibt keine Admin- oder Konfigurationsoberfläche.

- keine Loginseite
- keine Adminroute
- keine Formulare zur Entity-Auswahl
- keine UI für Reihenfolge, Sichtbarkeit oder Kachelgröße
- keine API zum Schreiben der Dashboardkonfiguration
- keine serverseitige Benutzer- oder Rollenverwaltung

Alle Änderungen erfolgen im Repository und werden per Git und Deployment in
den LXC übertragen. Dies hält die Angriffsfläche klein, ist aber für häufige
Layoutänderungen weniger komfortabel.

## 10. Aktuelles Deploymentmodell

Das Produktionsmodell ist ein kleiner Linux-LXC mit systemd:

- Runtimebenutzer: `dashboard`
- Anwendungspfad: `/home/dashboard/ha-legacy-dashboard`
- Dienst: `ha-legacy-dashboard.service`
- Node-Prozess über `/usr/bin/node src/server.js`
- automatischer Neustart bei Prozessfehlern
- systemd-Härtung mit `NoNewPrivileges`, `PrivateTmp`, `ProtectSystem` und
  restriktiver `UMask`

Der normale Deploymentablauf ist:

1. sauberer Arbeitsbaum wird verlangt,
2. Rückkehr auf `main`, falls ein Rollback im Detached HEAD aktiv ist,
3. Fetch von `origin/main`,
4. ausschließlich Fast-Forward-Merge,
5. `npm ci --omit=dev` nur bei geänderter Lockdatei,
6. Syntaxprüfung aller JavaScript-Dateien,
7. vollständiger lokaler Mock- und Integrationstest,
8. eng begrenzter systemd-Neustart,
9. Health-Check für Dienst, APIs und Sicherheitsheader.

Rollback erfolgt explizit auf einen vorhandenen Commit oder Tag. Es werden
weder `git reset --hard` noch Force-Push verwendet. GitHub Actions führt bei
Pushes und Pull Requests denselben grundlegenden Syntax- und Testsatz aus.

## 11. Relevante Dateien je Bereich

| Bereich | Relevante Dateien |
|---|---|
| Projektregeln, Release und Status | `AGENTS.md`, `README.md`, `CHANGELOG.md`, `docs/CODEX_HANDOFF.md`, `docs/SPRINT_ROADMAP.md`, `docs/sprints/SPRINT-12.md`, `docs/PROJECT_STATUS.md` |
| Paket und Runtime | `package.json`, `package-lock.json` |
| HTTP-Server und URL-Routing | `src/server.js`, `src/routes/api.js` |
| Dashboard-/Entitykonfiguration | `src/config/dashboard.js`, `src/routes/api.js` |
| Home Assistant | `src/services/homeassistant.js` |
| Logging und Rate-Limit | `src/services/logger.js`, `src/services/write-rate-limit.js` |
| HTML und Manifest | `src/public/index.html`, `src/public/manifest.json` |
| Layout und Themes | `src/public/css/style.css`, `src/public/js/core/theme.js` |
| Browserkommunikation | `src/public/js/core/compat.js`, `src/public/js/app.js` |
| Widgetsystem | `src/public/js/core/widget.js`, `src/public/js/core/dashboard.js`, `src/public/js/core/icons.js` |
| Widgets | `src/public/js/widgets/sensor.js`, `binary.js`, `light.js`, `climate.js` |
| Standalone-Assets | `src/public/icons/app-icon.svg`, `src/public/icons/app-icon-*.png` |
| Deployment | `deploy/check.sh`, `deploy/deploy.sh`, `deploy/health-check.sh`, `deploy/rollback.sh` |
| systemd und sudoers | `deploy/systemd/ha-legacy-dashboard.service`, `deploy/sudoers/ha-legacy-dashboard` |
| CI | `.github/workflows/test.yml` |
| Tests | `test/climate-flow.test.js`, `dashboard-config.test.js`, `deployment.test.js`, `gateway.test.js`, `security.test.js`, `standalone.test.js`, `write-rate-limit.test.js` |

### Aktuelle URL-Routen

| Methode | URL | Funktion |
|---|---|---|
| GET | `/` | statisches Dashboard (`index.html`) |
| GET | `/api/status` | Gateway- und Home-Assistant-Status |
| GET | `/api/dashboard/config` | bereinigte Einzel-Dashboardkonfiguration |
| GET | `/api/dashboard` | Zustände aller sichtbaren Entities plus `_meta` |
| POST | `/api/climate/temperature` | Solltemperatur der freigegebenen Climate-Entity |
| POST | `/api/light/state` | Ein-/Aus-Zustand der freigegebenen Light-Entity |
| alle | sonstige `/api/*` | generischer JSON-Fehler mit HTTP 404 |
| GET | sonstige vorhandene statische Dateien | Auslieferung aus `src/public` |

Es gibt keine clientseitige Routerbibliothek und keinen SPA-Fallback für
beliebige Pfade.

### Vollständiger Repositorybaum

Der folgende Baum umfasst die Projektdateien ohne `.git`, `node_modules` und
lokale `.env`-Dateien:

```text
ha-legacy-dashboard/
├── .github/
│   └── workflows/
│       └── test.yml
├── .gitignore
├── AGENTS.md
├── CHANGELOG.md
├── README.md
├── deploy/
│   ├── check.sh
│   ├── deploy.sh
│   ├── health-check.sh
│   ├── rollback.sh
│   ├── sudoers/
│   │   └── ha-legacy-dashboard
│   └── systemd/
│       └── ha-legacy-dashboard.service
├── docs/
│   ├── CODEX_HANDOFF.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_STATUS.md
│   ├── SPRINT_ROADMAP.md
│   └── sprints/
│       └── SPRINT-12.md
├── package-lock.json
├── package.json
├── src/
│   ├── config/
│   │   └── dashboard.js
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── icons/
│   │   │   ├── app-icon-76.png
│   │   │   ├── app-icon-120.png
│   │   │   ├── app-icon-152.png
│   │   │   ├── app-icon-180.png
│   │   │   ├── app-icon-192.png
│   │   │   ├── app-icon-512.png
│   │   │   └── app-icon.svg
│   │   ├── index.html
│   │   ├── js/
│   │   │   ├── app.js
│   │   │   ├── core/
│   │   │   │   ├── compat.js
│   │   │   │   ├── dashboard.js
│   │   │   │   ├── icons.js
│   │   │   │   ├── theme.js
│   │   │   │   └── widget.js
│   │   │   └── widgets/
│   │   │       ├── binary.js
│   │   │       ├── climate.js
│   │   │       ├── light.js
│   │   │       └── sensor.js
│   │   └── manifest.json
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── homeassistant.js
│   │   ├── logger.js
│   │   └── write-rate-limit.js
│   └── server.js
└── test/
    ├── climate-flow.test.js
    ├── dashboard-config.test.js
    ├── deployment.test.js
    ├── gateway.test.js
    ├── security.test.js
    ├── standalone.test.js
    └── write-rate-limit.test.js
```

## 12. Vorhandene Tests und Ergebnis

Ausgeführt wurden:

```bash
npm ci
npm test
```

Ergebnis am 10. August 2026:

```text
tests 40
pass 40
fail 0
cancelled 0
skipped 0
duration_ms 14763.144475
```

Der Testlauf verwendet den Node-Test-Runner, bindet den Mock ausschließlich an
`127.0.0.1`, startet den Gatewayprozess in einem temporären leeren
Arbeitsverzeichnis und verwendet nur Testzugangsdaten.

### Frontendfluss und Sprint 11

- Konfiguration wird vor Zuständen geladen.
- fehlerhafte Konfiguration wird erneut geladen.
- Uhr, Datum, Status und automatische Wiederverbindung funktionieren.
- alte Daten bleiben mit letztem erfolgreichen Refresh sichtbar.
- schnelle Climate-Klicks werden zusammengefasst.
- Climate-Fehler bleiben sichtbar und lösen einen Refresh aus.
- schnelle Light-Taps bleiben reaktionsfähig.
- Light-Fehler bleiben sichtbar und lösen einen Refresh aus.

### Dashboardkonfiguration

- sichtbare Widgets und Reihenfolge stimmen.
- unsichtbare Entities werden nicht öffentlich ausgegeben oder gelesen.
- das Refresh-Intervall wird serverseitig begrenzt.
- nur bekannte Widgettypen werden erzeugt.
- Anzeige- und Schreibberechtigung bleiben getrennt.

### Gateway-Integration gegen Mock-Home-Assistant

- Standalone-Dateien und Cacheheader
- Status, Konfiguration und Dashboarddaten
- Home-Assistant-Erreichbarkeitsstatus
- fehlende Entity und Teilverfügbarkeit
- ungültiges JSON
- Payloadbegrenzung und unbekannte API
- erlaubte und nicht erlaubte Climate-Entity
- ungültige, zu niedrige und zu hohe Temperatur
- Normalisierung des Temperaturschritts
- unmittelbare, verzögerte und ausstehende Climate-Bestätigung
- erlaubte und nicht erlaubte Light-Entity
- Light ein und aus
- ungültiger Light-Zustand
- nicht verfügbares Light
- Light- und Climate-Servicefehler
- Rate-Limit
- Home-Assistant-Timeout
- Authorization-Header nur zwischen Gateway und Mock
- kein Testtoken in Browserantworten oder Gatewaylogs
- der Rate-Limit-Untertest startet unmittelbar vor seinen elf Requests einen
  frischen Gatewayprozess und hängt nicht mehr von vorherigen Schreibtests ab
- ein separater Modultest ist mit frischem Require-Cache per Namensfilter
  isoliert ausführbar

### Sicherheit, Standalone und Betrieb

- Secret-Felder werden in strukturierten Logs redigiert.
- Apple-Standalone-Metadaten sind vorhanden.
- Manifest und Icongrößen sind korrekt.
- Cache-Version `v=16` ist in HTML, Manifest und Tests konsistent.
- Deploymentskripte sind ausführbar und enthalten keine destruktiven Gitbefehle.
- sudoers erlaubt nur den exakten Dashboardneustart.
- GitHub-CI verwendet keine Produktionszugangsdaten.

Zusätzlich wurde das lokale Dashboard mit einem lokalen Mock im Browser bei
375, 600, 768 und 900 Pixeln geprüft. Es gab keine horizontalen Überläufe;
Plus und Minus waren jeweils 46 × 46 Pixel groß, ihre 24 × 24 Pixel großen
SVGs exakt mittig. Plus, Minus, Erfolgsmeldung und Dark Mode funktionierten.

Nicht automatisiert getestet wird Safari unter iOS 9 selbst. Die abschließende
Zielgeräteabnahme auf iPad mini/iOS 9 bleibt manuell.

## 13. Bekannte Defekte und Inkonsistenzen

Im aktuellen Testlauf und der lokalen Browserprüfung wurde kein funktionaler
Laufzeitdefekt reproduziert. Offen bleiben:

1. **Reale iOS-9-Abnahme:** Die lokale Prüfung bestätigt Layout und Verhalten
   in einem modernen Browser, ersetzt aber nicht Safari auf dem Ziel-iPad.
2. **Roadmap-Entityliste veraltet:** Sprint 3 führt die zweite Fenster-Entity
   als aktuelle Entity auf, obwohl sie inzwischen `visible: false` ist und
   deshalb nicht gelesen wird.
3. **Lizenzentscheidung blockiert:** Paket und README behaupten nun keine
   gewählte Lizenz mehr; eine tatsächliche Lizenz darf aber nur der
   Projektinhaber bestimmen. Eine `LICENSE`-Datei fehlt deshalb weiterhin.
4. **Produktive Node-Version unbelegt:** CI verwendet Node 22, die Runtime des
   Produktiv-LXC ist im Repository aber nicht verbindlich dokumentiert. Ein
   `engines`-Feld wurde daher bewusst nicht ergänzt.

## 14. Technische Schulden

- `src/public/js/app.js` ist mit mehr als 2.200 Zeilen monolithisch und mischt
  Wall-Display, Laden, Status, Climate- und Light-Steuerung.
- `src/routes/api.js` bündelt Status-, Konfigurations-, Lese- und
  Schreibrouten in einer großen Datei.
- Die Schreib-Allowlisten duplizieren Entity-IDs aus der sichtbaren
  Konfiguration. Die Trennung ist sicherheitsrelevant und soll bleiben, könnte
  aber strukturiert und testbar zentralisiert werden.
- `package.json` hat leere Felder für Beschreibung und Autor.
- Eine unterstützte Node-Version ist nicht über `engines` festgelegt, obwohl
  CI explizit Node 22 verwendet; zuerst muss die LXC-Version verifiziert werden.
- Die In-Memory-Rate-Limit-Buckets werden nicht persistent gespeichert und
  nicht separat bereinigt. Ein Neustart setzt alle Zähler zurück.
- Dashboardkonfiguration und Entity-Auswahl sind nur per Quellcodeänderung
  möglich.
- Nur das Theme wird persistiert; Layout, letzte Zustände und Konfiguration
  werden nicht lokal oder serverseitig gespeichert.
- Dashboardantworten geben den vollständigen Home-Assistant-State der
  ausgewählten Entities weiter, statt Attribute pro Widget explizit zu
  reduzieren. Zugangsdaten werden dabei nicht übertragen, die Datenfläche ist
  aber größer als für die aktuellen Widgets notwendig.
- Es gibt keine automatisierte Prüfung mit Safari/iOS 9 und keinen CSS-Parser-
  oder Screenshot-Regressionslauf in CI.
- Ein Changelog ist vorhanden; Release-Tags sowie dedizierte Upgrade-,
  Troubleshooting-, Sicherheits- und Testdokumente fehlen weiterhin.
- `docs/sprints/SPRINT-12.md` ist im Commit als binäre Apple-Property-List mit
  HTML-Inhalt abgelegt, obwohl die Dateiendung Markdown erwarten lässt. Die
  aktuell sichtbare UTF-8-Umwandlung sollte separat geprüft werden.
- Das Gateway besitzt keine eigene Benutzeranmeldung. Sicherheit basiert auf
  Netzwerkbegrenzung und den engen Entity-/Service-Allowlisten.

## 15. Unterschiede zwischen `SPRINT_ROADMAP.md` und tatsächlichem Code

### Übereinstimmungen

- Sprint 0 bis 11 sind im tatsächlichen Code im Wesentlichen umgesetzt.
- Climate-Bestätigung, optimistisches Frontend und Refreshschutz aus Sprint 4
  sind vorhanden.
- Standalone-Metadaten und Cachebehandlung aus Sprint 5 sind vorhanden.
- Light als einzige weitere schreibbare Entity aus Sprint 6 ist vorhanden.
- zentrale Einzel-Dashboardkonfiguration aus Sprint 7 ist vorhanden.
- Sicherheits-, Fehler- und Stale-Data-Funktionen aus Sprint 8 sind vorhanden.
- Mocktests aus Sprint 9 und Deploymentablauf aus Sprint 10 sind vorhanden.
- Wall-Display-Funktionen aus Sprint 11 sind vorhanden.

### Abweichungen und überholte Stellen

- Die Entityliste in Sprint 3 ist historisch: Die zweite Fenster-Entity ist
  konfiguriert, aber nicht mehr sichtbar. Light und Climate kamen später hinzu.
- Die Testliste in Sprint 9 ist unvollständig gegenüber dem tatsächlichen
  Stand. Light, Security, Deployment, Standalone und Sprint-11-Fälle sind
  inzwischen zusätzlich abgedeckt.
- Sprint 11 erwähnt nicht den Folgecommit, der Titel, Uhr, Status und
  Theme-Schalter nach Nutzerfeedback deutlich kompakter gestaltet hat.
- Die Roadmap beschreibt Sprint 12 primär als Release- und
  Dokumentationssprint. Die detaillierte Sprint-Datei erweitert ihn um UI
  Polish; dieser konkrete Umfang ist lokal umgesetzt. API, Footer, README und
  Changelog verwenden nun `1.0.0`, das frühere pauschale ISC-Feld wurde ohne
  Erfindung einer neuen Lizenz entfernt.
- Die priorisierte Reihenfolge am Ende der Roadmap ist historisch und listet
  bereits abgeschlossene Sprints weiterhin als zukünftige Reihenfolge auf.
- Die Bezeichnung „konfigurationsgetriebene Dashboards“ kann mehrere
  Dashboards suggerieren; implementiert ist nur ein konfigurationsgetriebenes
  Dashboard.

## 16. Empfohlener nächster Sprint

Vor Sprint 13 sollte Sprint 12 auf dem echten iPad in Portrait, Landscape,
Light und Dark Mode abgenommen und danach separat zum Commit freigegeben
werden. Für eine vollständige Release-Baseline bleiben zwei
Projektinhaber-/Betriebsentscheidungen offen:

1. Lizenz auswählen oder ausdrücklich proprietär belassen.
2. `node --version` im Produktiv-LXC prüfen; nur bei bestätigtem Node 22 das
   passende `engines`-Feld ergänzen.

Danach empfiehlt sich als klar begrenzter **Sprint 13 eine statische
Multi-Dashboard-Grundlage ohne Admin-Schreibzugriff**:

- mehrere serverseitig definierte Dashboardprofile,
- explizite, validierte Dashboard-Slugs,
- ausschließlich lesende Auswahlrouten,
- unverändert getrennte Climate-/Light-Schreib-Allowlisten,
- kein Drag-and-drop, keine freie Kachelgröße und keine persistente
  Browserkonfiguration.

Eine Adminoberfläche und frei positionierbare Kacheln sollten jeweils eigene,
spätere und sicherheitsgeprüfte Sprints bleiben.
