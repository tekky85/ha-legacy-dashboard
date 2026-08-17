# HA Legacy Dashboard

Eine leichtgewichtige, externe Dashboard-Anwendung für Home Assistant – mit besonderem Fokus auf ältere Browser und dauerhaft installierte Wall-Displays.

## Überblick

`ha-legacy-dashboard` läuft als eigenständiges Node.js-/Express-Gateway außerhalb von Home Assistant.

```text
Legacy-Browser / Wall-Tablet
        |
        | HTTP
        v
HA Legacy Dashboard Gateway
Node.js + Express
        |
        | Home Assistant API
        v
Home Assistant
```

Das Projekt ist **kein Lovelace-Dashboard**, kein Custom Panel und kein internes Home-Assistant-Frontend. Der Home-Assistant-Token bleibt ausschließlich im Backend.

## Zielplattform

- Apple iPad mini 1
- iOS 9.3.5
- Safari unter iOS 9
- ECMAScript 5

Das Legacy-Frontend bleibt frameworkfrei und verwendet die vorhandene `Legacy.http`-/`XMLHttpRequest`-Kompatibilitätsschicht.

## Hauptfunktionen

### Benutzerdashboards

- mehrere Dashboards
- persistente Konfiguration
- konfigurierbare Widgets
- Drag-and-drop-Rasterlayout
- Portrait- und Landscape-Layouts
- konfigurierbare Card-Größen
- responsive Compact-/Normal-/Expanded-Darstellung
- eigenständige, viewportbasierte Focus-Ansicht mit priorisierten Werten und Controls
- gemeinsames, SVG-basiertes Power-Control für Light und Climate in Grid und Focus
- Light- und Climate-Steuerung über explizit freigegebene Backend-Endpunkte
- Light/Dark Mode
- Stale-Data- und Reconnect-Verhalten

### Admin-Bereich

Unter `/admin` werden Dashboards und Widgets verwaltet.

Dazu gehören unter anderem:

- Dashboards erstellen, umbenennen, duplizieren und löschen
- Standard-Dashboard festlegen
- Entities auswählen
- Widgets hinzufügen und bearbeiten
- Sichtbarkeit und Reihenfolge
- Card-Größen
- Drag-and-drop-Layout
- Portrait-/Landscape-Layouts
- Live-Card-Vorschau
- Light-/Dark-Vorschau
- read-only Status der diagnostischen Home-Assistant-Quellen

### Summary Dashboard

```text
/system/summary
```

Zeigt aktuell relevante Zustände, z. B.:

- eingeschaltete Lichter
- relevante eingeschaltete Schalter
- offene Fenster und Türen
- aktive Cover
- laufende Saugroboter
- aktive Heiz-/Kühlvorgänge
- Medienwiedergabe

Die vorhandenen normalisierten Kategorien lassen sich direkt nach Alle,
Offen, Licht & Strom, Aktiv, Klima, Medien und Sicherheit filtern. Filter und
Ansicht wechseln ohne neue Home-Assistant-Abfrage. Für Summary kann eine
eigene 1-/2-/3-Spaltenansicht sicher im Browser gespeichert werden; auf zu
schmalen Viewports fällt sie kontrolliert zurück.

### Fehler-/Systemstatus-Dashboard

```text
/system/errors
```

Zeigt unter anderem:

- `unavailable`
- `unknown`
- sicherheitsrelevante Ausfälle
- Schweregrade
- Stale-/Offline-Zustände
- letzten erfolgreichen Aktualisierungszeitpunkt
- klickbare Filter für Alle, Kritisch, Fehler, Warnungen und Unknown
- kompakte Device Cards für Entity-Issues mit derselben echten `device_id`
- standardmäßig eingeklappte Child-Entity-Details
- getrennt persistierte 1-/2-/3-Spaltenansicht mit responsivem Fallback

`unknown` und `unavailable` werden bewusst getrennt behandelt.
Entities ohne `device_id` sowie Config-Entry-, Repair- und Matter-Hinweise
bleiben als eigenständige Issues sichtbar. Die Gruppierung ist ausschließlich
eine read-only Präsentationsschicht und verändert weder Severity-Regeln noch
Schreibrechte.

Eine zentrale Risk-Class nutzt ausschließlich verlässliche Domain-, Device-
Class- und Registry-Metadaten. `unknown` und `unavailable` werden für Safety-
Sensoren wie Rauch, CO, Gas oder Feuchtigkeit sowie für Security-Sensoren wie
Tür, Fenster, Öffnung, Garagentor und Schloss als `critical` bewertet. Normale
und diagnostische Sensoren behalten die milderen Regeln; reine Namensmuster
erzeugen keine kritische Einstufung. Explizite `securityEntities` bleiben
vorrangig.

### Registry- und Diagnoseanreicherung

Das Gateway ergänzt die REST-basierten State-Daten serverseitig um
read-only Metadaten aus Entity-, Device- und Area Registry, Config Entries
und – sofern unterstützt – Home Assistant Repairs. Dafür existiert genau im
Backend eine authentifizierte Home-Assistant-WebSocket-Verbindung. Der Browser
erhält weder WebSocket-Zugriff noch Zugangsdaten oder rohe Registry-Daten.

Die Quellen werden capability-gesteuert abgefragt und getrennt gecacht:

- Entity, Device und Area Registry: 60 Sekunden
- Config Entries: 30 Sekunden
- Repairs: 30 Sekunden
- Matter-Diagnostik: 60 Sekunden beziehungsweise kontrolliert `unsupported`

Teilweise Ausfälle lassen den bestehenden REST-State-Snapshot und damit
Summary und Systemstatus weiterlaufen. Entity-Issues können dadurch
Geräte-, Raum-, Integrations- und Plattformkontext anzeigen und werden im
Systemstatus ausschließlich über ihre echte `device_id` zu Device Cards
zusammengefasst. Deaktivierte
Entities werden nicht mit `unavailable` gleichgesetzt; Registry-Einträge ohne
State werden nicht pauschal als verwaist klassifiziert. Config-Entry-Probleme
und Repairs erscheinen ausschließlich als Hinweise – ohne Reload-, Reauth-,
Repair- oder Matter-Aktionen.

## Sicherheitsmodell

Verbindlich:

- Home-Assistant-Token nur im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische HA-Service-API
- Schreibzugriffe nur über explizite Backend-Endpunkte
- explizite Entity-/Service-Allowlists
- Sichtbarkeit einer Entity erzeugt keine Schreibberechtigung
- Admin-Token und HA-Token bleiben getrennt
- Rate Limits
- Payload Limits
- Security Header
- Secret Redaction
- Home-Assistant-WebSocket ausschließlich im Backend
- Registries, Config Entries, Repairs und Matter in Sprint 21 ausschließlich read-only
- keine rohe Registry- oder generische WebSocket-Command-API

```text
Entity sichtbar != Entity schreibbar
```

## Legacy-Kompatibilität

Im Legacy-Frontend werden bewusst nicht verwendet:

- `fetch`
- `Promise`
- `async` / `await`
- arrow functions
- `let`
- `const`
- optional chaining
- nullish coalescing
- CSS Grid
- Flexbox `gap`
- ResizeObserver
- Container Queries

## Screenshots

Produkt-Screenshots müssen echte Aufnahmen der laufenden Anwendung oder einer kontrollierten Demo-/Mock-Instanz der echten Anwendung sein. Keine generierten Mockups als Produkt-Screenshot verwenden.

Die aktuelle Galerie wurde mit der unveränderten Anwendung und einem lokalen, kontrollierten Home-Assistant-Mock mit Fake-Credentials aufgenommen. Sie enthält keine Produktionsdaten.

### Benutzerdashboards

#### Light Mode

![Benutzerdashboard im Light Mode](docs/screenshots/dashboards/main-light.png)

#### Dark Mode

![Benutzerdashboard im Dark Mode](docs/screenshots/dashboards/main-dark.png)

#### Kompakte Karten im Landscape-Layout

![Kompakte Karten im Landscape-Layout](docs/screenshots/dashboards/compact-cards.png)

#### Focus Card

Die Focus-Ansicht ist eine eigenständige Interaction View: Sie wird aus
Widgetdefinition, aktuellem Zustand und serverseitig bestimmten Capabilities
neu aufgebaut und klont weder Grid-DOM noch Grid-Geometrie. Eigene
Focus-Klassen, echte Viewportmaße und expliziter Shrink-Schutz halten Kernwerte
und erlaubte Controls auch in Mobile Safari erreichbar und bewahren die
Dashboardposition. Automatisiert geprüft werden 768×1024, 1024×768 und der
kleine Legacy-Viewport 320×460; die physische Safari-Abnahme bleibt Bestandteil
des Geräte-Rollouts.

Light und Climate verwenden in Grid und Focus denselben echten Power-Button
mit fest dimensioniertem Inline-SVG. Damit hängen Zentrierung und Darstellung
nicht von Unicode-Glyphen, Font-Baselines oder nativen Safari-Button-Paddings
ab; die eigenständige Focus-Geometrie bleibt davon unberührt.

![Geöffnete Focus Card](docs/screenshots/dashboards/focus-card.png)

### Admin

#### Dashboard-Verwaltung

![Dashboard-Verwaltung im Admin-Bereich](docs/screenshots/admin/dashboard-management.png)

#### Layout-Editor

![Rasterbasierter Layout-Editor](docs/screenshots/admin/layout-editor.png)

#### Live-Vorschau

![Live-Vorschau in Landscape und Dark Mode](docs/screenshots/admin/live-preview.png)

#### Diagnostische Quellen

![Read-only Status der diagnostischen Home-Assistant-Quellen](docs/screenshots/admin/system-diagnostics.png)

### System-Dashboards

#### Summary

![Summary Dashboard mit aktiven Zuständen](docs/screenshots/system/summary.png)

#### Systemstatus

![Error Dashboard mit unavailable- und unknown-Zuständen](docs/screenshots/system/errors.png)

## Screenshot-Pflege

Bei jedem Sprint mit sichtbaren UI-Änderungen muss geprüft werden:

1. Hat sich eine dokumentierte Ansicht sichtbar geändert?
2. Ist ein vorhandener Screenshot veraltet?
3. Muss ein neuer Screenshot ergänzt werden?
4. Stimmen README-Verweise und Dateinamen noch?

Vor dem Commit prüfen:

- keine Tokens
- keine unerwünschten internen IP-Adressen
- keine privaten Personen-/Gerätenamen
- keine sicherheitskritischen Entity-Namen
- keine privaten Medieninformationen
- keine Standortdaten

Bevorzugt Demo-Entities oder bewusst freigegebene Namen verwenden.

## Empfohlene Screenshot-Struktur

```text
docs/
  screenshots/
    dashboards/
      main-light.png
      main-dark.png
      compact-cards.png
      focus-card.png
    admin/
      dashboard-management.png
      layout-editor.png
      live-preview.png
      system-diagnostics.png
    system/
      summary.png
      errors.png
```

## Entwicklung

Vor Änderungen mindestens lesen:

```text
AGENTS.md
README.md
README.de.md
README.en.md
docs/CODEX_HANDOFF.md
docs/SPRINT_ROADMAP.md
docs/PROJECT_STATUS.md
```

Sprint-Spezifikationen:

```text
docs/sprints/
```

## Tests

Automatisierte Tests decken unter anderem Gateway, Dashboard-Konfiguration, Security, Climate, Light, Admin, Layout, System-Dashboards, Stale-/Offline-Verhalten und lokale Home-Assistant-Mocks ab.

Produktionscredentials dürfen niemals für lokale Integrationstests verwendet werden.

## Deployment

Der Standalone-Betrieb setzt Node.js 22 oder neuer voraus und unterstützt
Debian-basierte LXC-/VM-Systeme mit systemd. Die Architektur bleibt zusätzlich
für eine spätere Home-Assistant-App-Verpackung geeignet.

## Projektstatus und Roadmap

- Technischer Stand: `docs/PROJECT_STATUS.md`
- Roadmap: `docs/SPRINT_ROADMAP.md`

## Sprache

- [English](README.en.md)
