# Sprint-24-Audit – Home Assistant App Packaging

## Audit-Metadaten

- Audit-Part: 13
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Commit: `593ba5a`
- Gesamtstatus: **PARTIAL**
- Spezifikation: [`SPRINT-24.md`](../../sprints/SPRINT-24.md)
- Anwendungscode geändert: nein
- Reales Home Assistant kontaktiert: nein
- Physische HAOS-/iPad-Prüfung in diesem Lauf: nein

Der Arbeitsbaum enthielt zu Beginn ausschließlich die noch nicht committeten
Auditdokumente aus Part 12 sowie den bereitgestellten Part-13-Prompt. Diese
Änderungen wurden bewahrt. Der aktuelle Anwendungscode entspricht vollständig
Commit `593ba5a`.

## Ergebniszusammenfassung

Sprint 24 hat die geforderte zusätzliche Home-Assistant-App-Betriebsart
architektonisch umgesetzt: dieselbe externe Express-Anwendung läuft entweder
Standalone mit `HA_URL`/`HA_TOKEN` oder als App über den Supervisor-Core-REST-
und WebSocket-Proxy mit ausschließlich serverseitigem `SUPERVISOR_TOKEN`.
`/data`, direkter LAN-Port, minimales `homeassistant_api`, AppArmor, Healthcheck,
Signalbehandlung, Multi-Arch-Metadaten und die unveränderte Browser-API sind im
aktuellen Code vorhanden. Es gibt weder Lovelace-/Ingress-Zwang noch eine
generische HA-Service- oder WebSocket-Proxyfläche.

Der aktuelle App-Veröffentlichungsstand bildet den heutigen Repositoryinhalt
jedoch nicht ab: `ha_legacy_dashboard/config.yaml` verweist weiterhin auf die
immutable Version `1.0.0-rc.1`. Der zugehörige Tag zeigt auf `741bba4`, während
seitdem mehrere laufzeitrelevante Fixes und Features bis `593ba5a` hinzugekommen
sind. Eine Installation über das App-Repository lädt deshalb nicht den aktuell
auditierten Code. Zusätzlich kopiert das als lokaler Supervisor-Build
dokumentierte Vorbereitungsskript die `image:`-Angabe unverändert in den
Build-Kontext; nach aktueller Home-Assistant-Semantik wird damit das Registry-
Image verwendet statt der kopierten lokalen Quellen. Das sind die Befunde
`RQ-13-01` und `RQ-13-02`.

Die lokale Implementierungs- und Regressionsebene ist vollständig grün. Eine
historisch dokumentierte reale HAOS-RC.1-Installation bestätigt Start,
Supervisor REST und direkten IPv4-LAN-Zugriff. Die aktuellen Artefakte,
Supervisor-WebSocket-Recovery, `/data`-Persistenz, Backup/Restore, Upgrade,
aarch64 und Rebootverhalten wurden in Part 13 nicht real geprüft und bleiben
deshalb ausdrücklich `NOT TESTED`.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 24-ARCH-01 | Eigenständige externe App; kein Lovelace, Custom Panel oder HA-Frontend-Runtime | PASS | `src/server.js`, `src/public/`, Express-Routen und `ha_legacy_dashboard/Dockerfile`; keine HA-Frontend-/Custom-Card-Abhängigkeit. |
| 24-ARCH-02 | App und Standalone verwenden dieselbe Anwendung ohne duplizierten Quellbaum | PASS | App-Image kopiert das Root-`src/`; im App-Verzeichnis existiert kein zweiter Laufzeit-Quellbaum. |
| 24-ARCH-03 | Standalone/LXC bleibt unterstützt | PASS | `src/config/runtime.js` behält `standalone`, `HA_URL`, `HA_TOKEN` und Standard-Datenpfad; Standalone-Tests und Gesamtsuite grün. |
| 24-REP-01 | Valides App-Repository mit `repository.yaml` | PASS | Root-`repository.yaml` besitzt Name, URL und Maintainer; YAML-Prüfung erfolgreich. |
| 24-REP-02 | Vollständige App-Struktur und auflösbare Referenzen | PASS | `ha_legacy_dashboard/{config.yaml,Dockerfile,run.sh,DOCS.md,README.md,CHANGELOG.md,icon.png,logo.png,translations/}` vorhanden; Icons sind valide PNGs. |
| 24-REP-03 | Keine widersprüchliche obsolete Verpackungsstruktur | PASS – superseded by Sprint 25 | Sprint 25 entfernte `build.yaml` zugunsten des Dockerfile-/BuildKit-Modells; kein konkurrierendes App-Quellverzeichnis vorhanden. |
| 24-REP-04 | Dokumentierter lokaler Supervisor-Build verwendet die kopierten aktuellen Quellen | BROKEN | `deploy/prepare-home-assistant-app.sh` kopiert `config.yaml` samt `image: ghcr.io/...`; Supervisor verwendet dadurch das veröffentlichte Image statt des lokalen Dockerfile-Kontexts. Siehe `RQ-13-02`. |
| 24-MODE-01 | Explizite Runtime Modes und sichere Auto-Erkennung | PASS | `src/config/runtime.js`: `standalone`, `home_assistant_app`, expliziter Modus vor Auto-Erkennung über vorhandenes `SUPERVISOR_TOKEN`; ungültige Modi werden abgewiesen. |
| 24-MODE-02 | Standalone nutzt vorhandene HA-URL und backend-only HA-Token | PASS | `resolveStandalone()` erzeugt `/api` und `/api/websocket`; `src/services/homeassistant.js` setzt Bearer nur serverseitig. |
| 24-MODE-03 | App-Modus benötigt keinen Long-Lived HA Token | PASS | `resolveHomeAssistantApp()` verlangt `SUPERVISOR_TOKEN`; `run.sh` setzt App-Modus ohne `HA_TOKEN`. |
| 24-HA-01 | Supervisor-Core-REST-Proxy korrekt | PASS | Basis `http://supervisor/core/api`, Bearer `SUPERVISOR_TOKEN`; lokaler Adaptertest und dokumentierter realer RC.1-State-Abruf grün. |
| 24-HA-02 | Supervisor-Core-WebSocket-Proxy nur im Backend | PASS | `ws://supervisor/core/websocket` in `src/config/runtime.js`; feste Requests in `src/services/homeassistant-websocket.js`; kein Browser-WebSocket. |
| 24-HA-03 | Reale Supervisor-WebSocket-Metadaten und Recovery | NOT TESTED | Lokale Mocks sind grün; reale HAOS-Registry-/Config-/Repair-/Automation-/Trace-Kommunikation und Recovery stehen in `MT-50`. |
| 24-HA-04 | Browser-API bleibt modusunabhängig | PASS | Routes erhalten injizierte Clients/Snapshots; Browser kennt weder Supervisor-Host noch Betriebsmodus. Gateway-/Sprint-21–23-Tests grün. |
| 24-META-01 | App-Metadaten: Name, Slug, Version, Architekturen, Startup, Boot | PASS | `ha_legacy_dashboard/config.yaml`: `slug`, `version`, `amd64`, `aarch64`, `startup: application`, `boot: auto`, `stage: experimental`. |
| 24-META-02 | Minimale HA-Berechtigung | PASS | Nur `homeassistant_api: true`; kein `hassio_api`, `docker_api`, Host-Netz, Host-PID, Geräte-, `/config`- oder privilegierter Zugriff. |
| 24-META-03 | AppArmor und kein unnötiger Ingress | PASS | `apparmor: true`; kein `ingress`, direkter Port ist bewusst die Legacy-Schnittstelle. |
| 24-META-04 | Sichere App-Optionen und Admin-Token-Semantik | PASS | `options.json` wird in `run.sh` begrenzt gelesen; Admin API default aus; Admin-Token muss gesetzt und vom Supervisor-Token verschieden sein. |
| 24-ARCHSUP-01 | amd64 und aarch64 in Metadaten und Buildstrategie | PASS – superseded by Sprint 25 | `config.yaml`, Multi-Arch-GHCR-Referenz und Sprint-25-BuildKit-Workflow; veröffentlichter RC.1-Manifestnachweis existiert. |
| 24-ARCHSUP-02 | Reale aarch64-Installation | NOT TESTED | Keine reale aarch64-HAOS-Installation in Part 13; siehe `MT-53`. |
| 24-SEC-01 | `SUPERVISOR_TOKEN` ausschließlich serverseitig und nicht persistiert | PASS | Nur Backend/runtime/startup/tests referenzieren es; Public-/Admin-Scan ohne Treffer; Dashboardkonfiguration kennt das Feld nicht. |
| 24-SEC-02 | Keine Tokens in Browserpayload, HTML/JS oder Fehlerantworten | PASS | Routen liefern reduzierte Modelle; `src/services/logger.js` redigiert Token-/Authorization-/Secret-Schlüssel; Securitytests grün. |
| 24-SEC-03 | Keine generische HA-Service-/WebSocket-Proxyfläche oder neue Writes | PASS | Ausschließlich feste State-/Systemrouten sowie enge Light-/Climate-Endpunkte; keine browserdefinierten Domains, Services oder WS-Commands. |
| 24-SEC-04 | Reale App-Logs bleiben secretfrei | NOT TESTED | Statische Redaction und lokale Tests PASS; reale Startup-/Failure-Logs stehen in `MT-50`. |
| 24-PERSIST-01 | Persistente App-Daten unter `/data` | PASS | `run.sh` setzt `DATA_DIR=/data`; Dashboardkonfiguration und Hintergrundservice leiten Pfade zentral über `DATA_DIR` ab. |
| 24-PERSIST-02 | Keine erforderlichen persistenten Daten im Image oder `/tmp` | PASS | Konfiguration, Backup und Backgrounds liegen unter `DATA_DIR`; Caches sind bewusst bounded und flüchtig. |
| 24-PERSIST-03 | Standalone-Datenpfad und Override bleiben erhalten | PASS | `src/config/runtime.js`: Root-`data` im Standalone-Modus, `DATA_DIR`-/`DASHBOARD_CONFIG_PATH`-Override weiterhin unterstützt. |
| 24-PERSIST-04 | Keine disruptive automatische Standalone→App-Migration | PASS | Pfade bleiben getrennt; Dokumentation weist auf manuellen, kontrollierten Transfer hin. |
| 24-PERSIST-05 | `/data` über App-Restart/Update erhalten | NOT TESTED | Pfadarchitektur und lokale Persistenztests PASS; reale App-Restart-/Updateprüfung siehe `MT-51` und `MT-52`. |
| 24-PERSIST-06 | Cold Backup/Restore der App-Daten | NOT TESTED | `backup: cold` ist konfiguriert; realer Backup-/Restore-Lauf siehe `MT-52`. |
| 24-NET-01 | Prozess bindet nicht nur an localhost | PASS | `src/server.js`: Default `0.0.0.0`; `run.sh` setzt explizit `BIND_ADDRESS=0.0.0.0`. |
| 24-NET-02 | Direkter konfigurierbarer LAN-Port, kein Ingress-Zwang | PASS | `3000/tcp: 3000`, `webui: http://[HOST]:[PORT:3000]`; historischer realer IPv4-Aufruf `http://192.168.1.16:3000` war erfolgreich. |
| 24-NET-03 | `.local`-Hostname funktioniert auf jedem Client | N/A | Kein Sprint-24-Erfordernis. Sprint 25.5 ordnete den beobachteten IPv6/mDNS-Pfad als Netzwerkproblem ein; funktionierender IPv4-Direktzugriff blieb unverändert. |
| 24-HEALTH-01 | Begrenzter, credentialfreier Health-Endpunkt | PASS | `GET /health` liefert nur `{status:"ok"}`; `config.yaml` nutzt ihn als Watchdog; Tests grün. |
| 24-HEALTH-02 | Healthcheck misst App-Verfügbarkeit, nicht kurzfristige HA-Erreichbarkeit | PASS | `/health` führt keinen HA-Aufruf aus und bleibt bei temporärem HA-Ausfall deterministisch. |
| 24-START-01 | Sicheres Startup, Verzeichnisvorbereitung und PID-1-Verhalten | PASS | `run.sh`: `umask 077`, `/data`, Optionsvalidierung, secretfreie Statusausgabe und `exec node /app/src/server.js`. |
| 24-START-02 | Sauberes SIGTERM | PASS | `src/server.js` schließt HTTP-Server und HA-WebSocket bei SIGTERM/SIGINT mit begrenztem 10-s-Fallback; Deploymenttest grün. |
| 24-START-03 | Reale HA-/App-/HAOS-Restarts und Boot-Autostart | NOT TESTED | `boot: auto` statisch korrekt; reale Abläufe siehe `MT-50` bis `MT-52`. |
| 24-WS-01 | Temporäre HA-Unverfügbarkeit scheitert sicher und erholt sich | PASS | REST-Snapshots besitzen stale/offline; der gemeinsame Backend-WebSocket verarbeitet Error/Close seit Sprint 27.1-C idempotent und reconnectet mit begrenztem Backoff. | Automatisierter Transportpfad für Standalone und App PASS; reale HAOS-Recovery bleibt MT-50. |
| 24-IMAGE-01 | Definierte Node-Version, Produktionsdependencies und gezielte Kopien | PASS – superseded by Sprint 25 | Multi-stage `ha_legacy_dashboard/Dockerfile`, Default `node:22-alpine`, `npm ci --omit=dev`, gezielte Runtime-Kopien. |
| 24-IMAGE-02 | `.dockerignore` schließt Secrets, Daten und Entwicklungsartefakte aus | PASS | Root- und App-`.dockerignore`; Release-Secret-Scan grün; weder `.env` noch Daten/Keys werden kopiert. |
| 24-IMAGE-03 | Aktuelle App-Version/Image entspricht dem auditierten Repositorycode | BROKEN | `1.0.0-rc.1` referenziert ein Image/Tag vom Commit `741bba4`; aktueller Commit ist `593ba5a` mit späteren Runtimeänderungen. Siehe `RQ-13-01`. |
| 24-IMAGE-04 | Aktuelles Image lokal reproduzierbar gebaut | NOT TESTED | Docker ist auf dem Audit-Mac nicht installiert. Historische Workflow-/Manifesttests PASS; aktueller Build folgt erst nach `RQ-13-01`. |
| 24-VERSION-01 | Versionen in Package/App/Changelogs sind formal konsistent | PASS – superseded by Sprint 25 | `release/check-version.js --tag v1.0.0-rc.1` ist grün; alle formalen Felder nennen `1.0.0-rc.1`. |
| 24-VERSION-02 | Immutable Version bezeichnet genau den aktuellen App-Inhalt | BROKEN | Der reine Stringcheck erkennt keine laufzeitrelevanten Änderungen nach dem Tag. Aktuelle Quellen und veröffentlichtes RC.1-Image divergieren; `RQ-13-01`. |
| 24-DOC-01 | App- und Standalone-Installation dokumentiert | PASS | `README.de.md`, `README.en.md`, `docs/DEPLOYMENT.md`, App-`DOCS.md` und App-`README.md`; beide Betriebsarten klar getrennt. |
| 24-DOC-02 | Lokale App-Installation baut tatsächlich den aktuellen lokalen Kontext | BROKEN | Dokumentation verspricht einen lokalen Supervisor-Build, aber der vorbereitete Kontext behält `image:` und zieht das Registry-Artefakt; `RQ-13-02`. |
| 24-DOC-03 | Technische Statusdokumentation entspricht der aktuellen Struktur | PARTIAL | `PROJECT_STATUS.md` nennt noch `build.yaml`, obwohl Sprint 25 es entfernte; bestehender Befund `RQ-08-03` erhält Part-13-Evidenz. |
| 24-LEGACY-01 | Wall-Display bleibt ES5/iOS-9-kompatibel | PASS | App verwendet denselben Wall-Build; Legacy-Suite und statischer Scan grün, kein CSS Grid/Flex-gap oder verbotene moderne Syntax. |
| 24-LEGACY-02 | Reale iPad-mini-Abnahme über App-Direktport | NOT TESTED | Historisch waren Default/Custom sowie Light/Climate-Grundsteuerung erreichbar; vollständige aktuelle Route-/HomeScreen-Abnahme siehe `MT-54`. |
| 24-REG-01 | Sprint-21-/21.x-Funktionen bleiben erhalten | PASS | Part-09 bis Part-11 sowie Part-13-Fokuslauf grün; keine App-spezifische Browserabweichung. |
| 24-REG-02 | Sprint 22/23 vollständig regressionsfrei | PARTIAL | `RQ-12-01` bis `RQ-12-03` sind in Sprint 27.1-C repariert und gezielt regressiert; die vollständige Anforderungsmatrix `RQ-12-04` bleibt offen. | App nutzt denselben transportneutralen Code. |
| 24-TEST-01 | Connection-, Config-, Persistenz-, Container-, Legacy- und Securitytests | PASS | Part-13-Fokuslauf 153/153; Gesamtsuite 329/329; ausschließlich localhost-Mocks/Fake-Credentials. |
| 24-TEST-02 | Syntax und statische Metadatenprüfung | PASS | 7 relevante JS-Dateien `node --check`; beide Shellskripte `sh -n`; YAML-Dateien parsebar; Versions- und Secret-Scan grün. |

## Aktuelle Betriebsarten

### Standalone/LXC

- `HA_URL` und `HA_TOKEN` werden nur vom Backend gelesen.
- REST läuft über `<HA_URL>/api`, WebSocket über `<HA_URL>/api/websocket`.
- Persistenz verwendet standardmäßig das Repositoryverzeichnis `data/` und
  kann über `DATA_DIR` beziehungsweise `DASHBOARD_CONFIG_PATH` geändert werden.
- Der Sprint-24-Code hat den vorhandenen systemd-/LXC-Betrieb nicht ersetzt.

### Home Assistant App / HAOS

- REST: `http://supervisor/core/api`
- WebSocket: `ws://supervisor/core/websocket`
- Authentifizierung: ausschließlich backendseitiges `SUPERVISOR_TOKEN`
- Persistenz: `/data`
- WebUI: direkter Port 3000, standardmäßig auf Host-Port 3000
- Berechtigung: `homeassistant_api: true`; kein Ingress, Host-Netz, `/config`,
  Docker-Socket oder sonstiger privilegierter Zugriff

Diese Werte entsprechen weiterhin den aktuellen offiziellen Home-Assistant-
App-Konventionen. Die aktuelle Dokumentation beschreibt außerdem, dass eine
`image:`-Angabe ein vorgebautes Registry-Image auswählt; genau daraus entsteht
der lokale Build-Befund `RQ-13-02`.

## Sicherheitsbewertung

Die Sicherheitsgrenze ist intakt. Weder `HA_TOKEN` noch `SUPERVISOR_TOKEN`
werden in HTML, Wall-JavaScript, Admin-JavaScript, Dashboardkonfiguration oder
Browserpayload aufgenommen. Home-Assistant-Zugriffe bleiben in den beiden
Backendclients. Der Browser kann keine HA-Domain, keinen Service und keinen
WebSocket-Command frei bestimmen. App-Verpackung und Sprint-24-Routen erweitern
die Write-Oberfläche nicht. Das Admin-Token bleibt separat und darf nicht mit
einem HA-/Supervisor-Token identisch sein.

Die neuen Befunde betreffen Distribution und Entwicklungsworkflow, nicht eine
Credentialoffenlegung. Der bestehende WebSocket-Reconnectbefund ist ein
Robustheitsproblem ohne neue Browser- oder Write-Fähigkeit.

## Superseded-Anforderungen

- Sprint 25 ersetzte die frühe Architektur-spezifische Buildervorbereitung
  durch ein Dockerfile-/BuildKit-basiertes Multi-Arch-Release. Das entfernte
  `build.yaml` ist daher korrekt nicht mehr vorhanden.
- Sprint 25 konkretisierte die generische Multi-Arch-GHCR-Referenz,
  Versionskonsistenz und Releaseartefakte. Der beabsichtigte Sprint-24-Endstand
  bleibt grundsätzlich gültig; die aktuelle Version/Image-Zuordnung ist aber
  real veraltet und wird deshalb nicht als superseded verborgen.
- Sprint 25.5 untersuchte `homeassistant.local`; der beobachtete Clientpfad war
  ein IPv6-/mDNS-Thema. Sprint 24 fordert direkten LAN-Zugriff, der über IPv4
  nachgewiesen ist, nicht universelle `.local`-Namensauflösung.

## Automatisierte Verifikation

- Part-13-Fokussuite: **153/153 PASS**, 0 Fehler.
- Gesamtsuite `npm test`: **329/329 PASS**, 0 Fehler.
- JavaScript-Syntax: **7/7 PASS**.
- Shellsyntax `run.sh` und `prepare-home-assistant-app.sh`: **2/2 PASS**.
- YAML-Parsing von Repository-, App- und Übersetzungsmetadaten: **PASS**.
- Versionskonsistenzcheck für `v1.0.0-rc.1`: **PASS**; seine begrenzte
  Aussagekraft bezüglich Source-/Tag-Identität ist `RQ-13-01`.
- Secret-/Artefaktscan: **PASS**.
- Lokaler aktueller Docker-Build: **NOT TESTED**, weil auf dem Audit-Mac kein
  Docker verfügbar ist.
- Kein produktives Home Assistant, kein HAOS und kein reales Gerät wurden
  durch Part 13 kontaktiert.

## Reale und manuelle Evidenz

Bereits in `docs/RC_CHECKLIST.md` dokumentierte historische reale Evidenz:

- App-Repository auf echtem HAOS hinzugefügt: PASS.
- RC.1 installiert und gestartet: PASS.
- Supervisor REST über reale Dashboardzustände: PASS.
- Direkter IPv4-LAN-Aufruf und `/health`: PASS.
- Grundlegender iPad-Zugriff sowie getestete Light-/Climate-Controls: PASS.

Diese Evidenz wird nicht auf den heutigen, noch nicht veröffentlichten
Repositoryinhalt hochgerechnet. Neu beziehungsweise weiterhin offen sind:

- `MT-50`: reale Supervisor-WebSocket-/Outage-/Log-Abnahme,
- `MT-51`: `/data`-Persistenz, Rechte und App-Restart,
- `MT-52`: Backup/Restore, Versionsupgrade und HAOS-Reboot,
- `MT-53`: reale aarch64-App,
- `MT-54`: vollständige iPad-mini-/iOS-9-Direct-LAN-Abnahme.

## Reparaturbezug

- **RQ-13-01 (BROKEN, P1):** App-Version/Image bildet nicht den aktuellen
  Repositorycode ab; Release- und Source-Identität müssen vor RC zusammengeführt
  werden.
- **RQ-13-02 (BROKEN, P2):** Der dokumentierte lokale Supervisor-Build zieht
  wegen `image:` das Registry-Image statt der vorbereiteten Quellen.
- **RQ-09-01 (CODE CLOSED / MANUAL PENDING, P2):** isolierter WebSocket-Error
  plant auch im App-Modus genau einen begrenzten Reconnect; reale Abnahme MT-50.
- **RQ-04-01 (CODE CLOSED / MANUAL PENDING, P1):** App und Standalone
  referenzieren aktuell denselben v53-Assetstand; reale HAOS-/Clientabnahme
  bleibt offen.
- **RQ-08-03 (BROKEN, P2):** `PROJECT_STATUS.md` beschreibt noch die entfernte
  `build.yaml`-Struktur.
- **RQ-12-01 bis RQ-12-03:** in Sprint 27.1-C code-seitig geschlossen;
  **RQ-12-04** bleibt für die vollständige Testmatrix offen.

## Schlussfolgerung

Sprint 24 ist als Architektur- und Sicherheitsfundament weitgehend vorhanden,
aber im aktuellen Repositoryzustand **PARTIAL**. Die App lässt sich in der
historisch veröffentlichten RC.1-Version real betreiben; sie liefert jedoch
nicht den heutigen Code, und der dokumentierte lokale Supervisor-Build umgeht
die lokalen Quellen. Vor einer aktuellen RC-Freigabe müssen `RQ-13-01` und
`RQ-13-02` behoben und die resultierende Version anhand `MT-50` bis `MT-54`
real validiert werden.

Audit Part 13 ist abgeschlossen. Audit Part 14 wurde nicht begonnen und umfasst
laut `AUDIT_INDEX.md` ausschließlich Sprint 25.

## Sprint-27.1-B-Re-Audit

Standalone- und App-Paket verteilten nach Batch B denselben v52-konsistent
referenzierten Quellbaum. `test/asset-version.test.js` und die damalige
Gesamtsuite 331/331 waren grün. RQ-04-01 ist code-seitig geschlossen; HAOS-
Runtime und reale Clients bleiben `NOT TESTED`.

## Sprint-27.1-C-Re-Audit

Der gemeinsame Standalone-/Supervisor-WebSocketpfad behandelt Error-only und
Error+Close nun idempotent, begrenzt Reconnectversuche und respektiert
explizites `close()`. Auch ein synchron werfendes natives Socket-`close()`
beendet den Gateway-Prozess nicht. Dieselbe transportneutrale Reparatur schützt Registry-,
Label-, Automation- und Trace-Adapter, ohne einen Browser-Proxy oder neue
Commands einzuführen. Die Sprint-22-/23-Korrekturen laufen ebenfalls vor dem
App-Transport und ändern keine App-Berechtigung. `RQ-09-01` sowie
`RQ-12-01/-02/-03` sind code-seitig geschlossen; die Gesamtsuite bestand
336/336. Reale HAOS-Prüfung MT-50 und die Packaging-/Releasebefunde bleiben
offen.
