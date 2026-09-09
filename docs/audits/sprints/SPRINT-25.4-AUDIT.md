# Sprint-25.4-Audit – RC CheckUp & Home Assistant App Installation Validation

## Auditrahmen

- Audit-Part: 17
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.4.md`](../../sprints/SPRINT-25.4.md)
- Gezielter Re-Audit: Sprint 27.1-A, Basiscommit `dec0c54`
- Anwendungscode im Baseline-Audit geändert: nein; Sprint 27.1-A: zentraler
  PNG-Parser gehärtet
- Produktives Home Assistant, HAOS, LXC, Netzwerk oder physisches iPad
  kontaktiert: nein
- Öffentliche Release-/Workflow-/GHCR-Metadaten read-only geprüft: ja

## Gesamtergebnis

**Sprint 25.4: PARTIAL**

Sprint 25.4 hat das verlangte Validierungsdokument, eine RC Result Matrix, eine
explizite Blockerliste und eine manuelle Abschlussreihenfolge erzeugt. Die
damalige RC.1 ist weiterhin öffentlich vorhanden: Tag und beide erfolgreichen
GitHub-Workflows zeigen auf `741bba41d8ffc34cba4c7643f2e2b777f2e6501e`;
Releasebundle und Checksum sind verfügbar; das anonyme GHCR-Manifest antwortet
mit HTTP 200 und enthält `linux/amd64` sowie `linux/arm64`. Die heutige App-
Konfiguration ist syntaktisch valide, verwendet das generische Image,
`homeassistant_api: true`, direkten Port 3000, `/data` und keine breiten Host-,
Docker-, Config- oder Privileged-Rechte. Standalone und App halten ihre Tokens
backend-only und verwenden ausschließlich die bestehenden engen Write-Routen.

Diese Evidenz validiert jedoch nicht den aktuellen HEAD. RC.1 ist unverändert
der Stand `741bba4`; seitdem wurden 36 Laufzeit-/Packagingdateien unter anderem
für JPEG, Card Presentation, Sections, Room Cards und Control Authorization
geändert. Die aktuelle `docs/RC_CHECKLIST.md` nennt im Kopf RC.1/`741bba4`,
führt beim LXC aber später `42d88f3`, beim Gate 283/290 Tests und nachträglich
Sprint-25.5-/25.6-Ergebnisse. Damit ist die Matrix kein einheitlicher,
commitbezogener Kandidatennachweis. Zusätzlich behauptet sie ein Root-
`Dockerfile`, obwohl die Pipeline korrekt `ha_legacy_dashboard/Dockerfile`
verwendet, sowie null npm-Schwachstellen, während der aktuelle Audit eine
moderate `qs`-Schwachstelle mit zwei Advisories meldet. Vor Sprint 27.1-A
bildete die Blockerliste außerdem weder den damaligen P1-PNG-Defekt noch alle
bereits offenen P1-Releasebefunde ab. Der PNG-Codepfad ist jetzt repariert; der
commitbezogene Evidenz-/Dokumentationsdefekt `RQ-17-01` bleibt davon unabhängig
offen.

Die vorhandenen realen HAOS-/LXC-Nachweise bleiben historische Evidenz für die
jeweils ausdrücklich genannten älteren Builds; sie werden nicht als PASS für
HEAD hochgerechnet. Aktuelle App-Installation, Supervisor-WebSocket, `/data`,
Restart/Backup, Direct LAN, LXC-Releasebundle, iPad Theme/Filter/HomeScreen/
Background/Focus und Performance bleiben `NOT TESTED`. Der aktuelle RC-
Entscheid lautet daher weiterhin **BLOCKED**.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.4-SCOPE-01 | Sprint ist Validierung, kein Feature-Sprint | PASS | Commit `d0313b0` änderte nur Projektstatus, Roadmap und `docs/RC_CHECKLIST.md`; Part 17 ändert ebenfalls keinen Anwendungscode. |
| 25.4-PRE-01 | Sprint-24-/25-/25.1-/25.2-/25.3-Endzustände tatsächlich prüfen | PARTIAL | Einzelne aktuelle Audits liegen vor; offene RQ-04-01, RQ-13-01 und RQ-14-01/-02/-04/-05 widerlegen weiterhin eine vollständige Freigabe. RQ-16-01 ist repariert. |
| 25.4-A1-01 | `repository.yaml` vorhanden und valides YAML | PASS | Datei vorhanden; Ruby-YAML-Parser erfolgreich. |
| 25.4-A1-02 | Repositoryname, URL und Maintainer ohne Platzhalter/interne URL | PASS | `HA Legacy Dashboard Apps`, öffentliches GitHub-Repository, `tky <mbp@tky.cloud>`; kein Platzhalter/interner Host. |
| 25.4-A2-01 | App-`config.yaml` vorhanden und valides YAML | PASS | `ha_legacy_dashboard/config.yaml`; Parser und Sprint-24-Test grün. |
| 25.4-A2-02 | Name, Version, Slug, Beschreibung, Arch, Image, Startup, Boot, Stage und URL | PASS | Alle geforderten Metadaten vorhanden und syntaktisch plausibel. |
| 25.4-A2-03 | Ports, Beschreibung, WebUI und Watchdog/Health | PASS | `3000/tcp`, direkte LAN-Beschreibung, `http://[HOST]:[PORT:3000]/` und `/health`. |
| 25.4-A2-04 | Optionen/Schema ohne Defaultpasswort | PASS | Nur `admin_api_enabled:false` und optionales `admin_token`; kein Standardsecret. |
| 25.4-A3-01 | amd64 und aarch64 deklariert | PASS | `arch` enthält beide; aktuelles öffentliches OCI-Manifest enthält `linux/amd64` und `linux/arm64`. |
| 25.4-A4-01 | Generische Image-Referenz | PASS | `image: ghcr.io/tekky85/ha-legacy-dashboard`; entspricht aktueller HA-Publishing-Empfehlung. |
| 25.4-DOCKER-01 | Eine Dockerfile-Buildquelle | PASS | Release-/Testworkflow verwenden ausschließlich `ha_legacy_dashboard/Dockerfile` mit Root-Buildkontext. |
| 25.4-DOCKER-02 | RC-Checkliste beschreibt den tatsächlichen Dockerfile-Pfad | BROKEN | Checkliste behauptet „Root-Dockerfile“; im Repository existiert kein Root-`Dockerfile`. Teil von `RQ-17-01`. |
| 25.4-VERSION-01 | Paket, Lockfile, App, Releasemetadaten und Changelogs stimmen als String überein | PASS | `release/check-version.js --tag v1.0.0-rc.1` besteht. |
| 25.4-VERSION-02 | Version/Image repräsentieren den aktuell auditierten Quellstand | BROKEN | Tag/Image RC.1 = `741bba4`, HEAD = `593ba5a`; 36 Laufzeit-/Packagingdateien abweichend. `RQ-13-01`. |
| 25.4-VERSION-03 | Bestehenden RC-Tag nicht blind wiederverwenden | PASS | Audit empfiehlt einen neuen separaten Kandidaten erst nach Reparaturen; kein Tag/Publish erfolgt. |
| 25.4-IMAGE-01 | Versionierter öffentlicher Image-Tag verfügbar | PASS | Anonymer GHCR-Abruf für `1.0.0-rc.1` am 8. September 2026: HTTP 200, OCI Index. Gilt nur für `741bba4`. |
| 25.4-IMAGE-02 | Multi-Arch-Manifest enthält amd64/arm64 | PASS | Digest `sha256:1c5d4e…98e7c`; Plattformen `linux/amd64`, `linux/arm64` plus Attestierungsartefakte. |
| 25.4-IMAGE-03 | Image für aktuellen HEAD verfügbar | BROKEN | Kein neuer Release nach RC.1; App installiert weiterhin den alten Tag. `RQ-13-01`. |
| 25.4-IMAGE-04 | Aktuelles Image lokal gebaut und inspiziert | NOT TESTED | Docker ist auf dem Audit-Mac nicht installiert; kein Artefakt wurde gebaut oder veröffentlicht. |
| 25.4-RELEASE-01 | GitHub-Prerelease und Workflow existieren | PASS | Öffentliche API: Release `v1.0.0-rc.1`, prerelease=true; Runs 33203376391/33203376334 beide success auf `741bba4`. |
| 25.4-RELEASE-02 | Bundle und SHA256SUMS verfügbar | PASS | Öffentliche Release-API listet Tarball und Checksum; veröffentlichter Digest dokumentiert/verifiziert. |
| 25.4-RELEASE-03 | Standalone-Bundle ist aus sich heraus installier-/upgrade-/rollbackfähig | BROKEN | Bundle fehlt verlinkte Releaseanleitung und geforderte Git-Deployskripte passen nicht zum Archivmodell. `RQ-14-01`. |
| 25.4-RELEASE-04 | Upgradeprüfung verwendet zwei echte Versionen und Rollback | PARTIAL | Automatisierter Test lädt dieselbe Implementierung zweimal; reales N→N+1 fehlt. `RQ-14-02`, MT-52/56. |
| 25.4-PERM-01 | Nur benötigtes `homeassistant_api: true` | PASS | Config enthält genau diese HA-Berechtigung; kein `hassio_api`. |
| 25.4-PERM-02 | Kein full_access, Docker, host_pid, host_network, privileged oder HA-Config-Mount | PASS | Schlüssel fehlen; statischer Test und offizielle aktuelle App-Konvention bestätigen Minimalmodell. |
| 25.4-PERM-03 | AppArmor bleibt aktiv | PASS | `apparmor:true` nutzt das Supervisor-Defaultprofil; ein eigenes `apparmor.txt` ist nur für ein benutzerdefiniertes Profil nötig. |
| 25.4-TOKEN-01 | App nutzt ausschließlich backend-only `SUPERVISOR_TOKEN` | PASS | `runtime.js`, `run.sh`, REST-/WS-Service; keine Browserprojektion. |
| 25.4-TOKEN-02 | Standalone nutzt backend-only HA-URL/-Token | PASS | `.env`/Prozessumgebung nur serverseitig; Public-/Admin-Wall-Code enthält keine HA-Credentials. |
| 25.4-TOKEN-03 | Adminsecret getrennt und standardmäßig deaktiviert | PASS | Appoption false; Wrapper verweigert fehlendes/gleiches Supervisorsecret; Admin-Middleware prüft Bearer. |
| 25.4-TOKEN-04 | Keine Tokens in HTML, Payload, Config, Background oder Logs | PASS | Release-Secret-Scan, Logger-Redaktion, Public-Config-/Securitytests grün. |
| 25.4-APP-01 | Repository auf aktuellem realen HAOS hinzufügbar | NOT TESTED | Historisch für RC.1 bestätigt; aktueller HEAD/kein neues Image wurde nicht installiert. MT-52/55. |
| 25.4-APP-02 | App erscheint mit korrektem Namen/Icon/Beschreibung/Version | NOT TESTED | Statische Metadaten PASS, aktueller realer Storelauf fehlt. MT-52/55. |
| 25.4-APP-03 | Aktuelles Image lässt sich auf amd64 installieren | NOT TESTED | Historische RC.1-Installation ist kein Nachweis für HEAD. MT-52/55. |
| 25.4-APP-04 | Aktuelles Image lässt sich auf aarch64 installieren | NOT TESTED | Manifest vorhanden, keine reale aarch64-Hardwareabnahme. MT-53. |
| 25.4-START-01 | App startet ohne Long-Lived HA-Token | PASS | Lokaler Supervisor-Mockprozess startet ohne `HA_TOKEN`; `test/sprint-24.test.js`. Reale aktuelle App MT-52. |
| 25.4-START-02 | Startup-Logs sind informativ und secretfrei | PASS | Wrapper loggt Modus, Version, Port und Proxy, niemals Token; reale aktuelle Logs NOT TESTED über MT-50/52. |
| 25.4-HEALTH-01 | `/health` prüft Prozess und verhindert HA-Outage-Crashloop | PASS | Server liefert lokalen Healthstatus; App-Prozesstest bestätigt Healthy bei Mock-HA-Ausfall und SIGTERM. |
| 25.4-REST-01 | Supervisor Core REST funktioniert in lokaler Isolation | PASS | Sprint-24-Test lädt States über lokalen Supervisor-Mock ohne HA-Token. |
| 25.4-REST-02 | Supervisor REST funktioniert im aktuellen realen App-Container | NOT TESTED | Historisch RC.1 belegt; aktueller Build nicht veröffentlicht/installiert. MT-52. |
| 25.4-WS-01 | Supervisor Core WebSocket funktioniert in lokaler Isolation | PASS | Authentifizierung und normalisierte Registrymetadaten im Sprint-24-Test. |
| 25.4-WS-02 | Supervisor WebSocket funktioniert/recovert im aktuellen realen App-Container | NOT TESTED | Historische Checkliste selbst `BLOCKED`; MT-50. Error-only-Reconnect bleibt `RQ-09-01`. |
| 25.4-LAN-01 | App bindet nicht nur localhost | PASS | Wrapper setzt `BIND_ADDRESS=0.0.0.0`; Serverdefault ebenfalls; Portmapping 3000. |
| 25.4-LAN-02 | Keine Ingress-/Hostnetwork-/Hostname-Pflicht | PASS | Relative Browserpfade, direkter Port, kein Ingress/host_network/DNS-Hack. |
| 25.4-LAN-03 | Aktueller App-Build ist real per IP:Port und `/health` erreichbar | NOT TESTED | Historische IPv4-Evidenz gilt RC.1; Part 17 führt keinen Produktionsnetztest aus. MT-54. |
| 25.4-UI-01 | Default Dashboard funktioniert gegen lokalen Mock | PASS | Gateway-/Sprint-24-/vollständige Tests grün. Reale aktuelle App bleibt MT-52/54. |
| 25.4-UI-02 | Custom Dashboard und exaktes Returnziel funktionieren lokal | PASS | Multi-Dashboard-/Navigationstests grün; reale aktuelle App MT-54. |
| 25.4-UI-03 | Summary und Errors funktionieren lokal read-only | PASS | System-Frontend-/Gatewaytests grün. |
| 25.4-THEME-01 | Dark Mode bleibt über Refresh/System/Custom/Return | PASS | Automatisierte Sprint-25.1-/Theme-Regression grün. Physisches Release-Gate NOT TESTED: MT-13. |
| 25.4-FILTER-01 | Severityfilter sind exakt und Status verwendet dasselbe Child | PASS | Tabellenlauf in `test/system-frontend.test.js`; global Health bleibt unverändert. Physisch MT-34. |
| 25.4-HOME-01 | Interne Navigation bleibt same-window/same-origin und return-sicher | PASS | Sprint-25.2-Tests grün; kein `_blank`/`window.open`; reales HomeScreen-Gate MT-40/54. |
| 25.4-BG-01 | Dashboardbackground/Title funktionieren in lokaler Runtime | PASS | Sprint-25.3-, Admin-, Gateway- und Persistenztests grün. |
| 25.4-BG-02 | JPEG/PNG/SVG/MIME/Oversize/Traversal-Abnahme ist korrekt | PASS | JPEG bleibt gehärtet; PNG-Struktur, CRC, IDAT und IEND/EOF sowie sichere Dashboard-/Room-Replacements sind in Sprint 27.1-A direkt regressiert. |
| 25.4-BG-03 | Backgrounds über realen App-/LXC-Restart | NOT TESTED | MT-51/52/58/60. |
| 25.4-HEIGHT-01 | Full Height und normaler kompakter Footer funktionieren lokal | PASS | CSS-/Sprint-25.3-Test; keine feste Footerposition/Versionsnummer im Normaldashboard. |
| 25.4-HEIGHT-02 | 0/1/wenige/viele Karten auf realem iPad | NOT TESTED | MT-58. |
| 25.4-FOCUS-01 | Sensor/Binary/Light/Climate Focus bleibt lokal funktionsfähig | PASS | Focus-/Controltests und Gesamtsuite grün. |
| 25.4-CONTROL-01 | Nur enge Light-/Climate-Routen, keine generische Write API | PASS | Zentrale serverseitige Grants/Capabilities; kein Browser-Serviceparameter oder generischer Proxy. |
| 25.4-CONTROL-02 | Reale bestehende Controls auf dem Kandidaten-iPad | NOT TESTED | Historische Einzelbestätigung ersetzt nicht den zusammenhängenden aktuellen Gate-Lauf. MT-54. |
| 25.4-PERSIST-01 | Appdatenpfad `/data` und atomare Persistenz sind implementiert | PASS | Runtime/Wrapper/Config- und Assetstores; lokale Tests. |
| 25.4-PERSIST-02 | Theme, Config, Regeln und Background über realen App-Restart | NOT TESTED | Theme ist browserlokal, Serverdaten unter `/data`; aktueller HAOS-Lauf fehlt. MT-51/52. |
| 25.4-HA-RESTART-01 | HA-Neustart und automatische Recovery | PARTIAL | Grundlegender Retry/Stale-Pfad vorhanden; isolierter WS-Error ohne Close plant keinen Reconnect. `RQ-09-01`; realer Lauf MT-50/52. |
| 25.4-HOST-01 | HAOS-Host-Reboot und App-Autostart | NOT TESTED | `boot:auto` statisch vorhanden; realer Reboot MT-52. |
| 25.4-LXC-01 | Aktueller Standalone-Quellstand besteht lokale Regression | PASS | 92/92 Part-17-Fokus und 329/329 Gesamttests, ausschließlich lokale Mocks. |
| 25.4-LXC-02 | Aktuelles Releasebundle installiert/startet auf realem LXC | NOT TESTED | Öffentlicher Tarball ist alter RC.1-Stand und operativ unvollständig; MT-56. |
| 25.4-LOG-01 | Strukturierte Logs redigieren Secrets | PASS | `logger`-/Securitytest und Release-Secret-Scan. |
| 25.4-LOG-02 | Aktuelle reale App-/LXC-Logs ohne Crash-/Reconnect-Schleifen | NOT TESTED | Historische LXC-Logs gelten nicht als aktueller Kandidat; MT-50/52/56. |
| 25.4-PERF-01 | Aktuelle reale iPad-Ladezeiten ohne harte Regression | NOT TESTED | Kein physischer Lauf in Part 17; MT-54/58. |
| 25.4-BACKUP-01 | App `/data` ist Backupgegenstand und Backup wird empfohlen | PASS | `backup:cold`, DOCS/README empfehlen Backup; reale Sicherung MT-52. |
| 25.4-BACKUP-02 | Reales Backup/Restore bewahrt Config/Regeln/Background | NOT TESTED | MT-52. |
| 25.4-UPGRADE-01 | Reales RC-N→RC-N+1 bewahrt Daten | NOT TESTED | Nur ein veröffentlichtes RC vorhanden; MT-52/56. |
| 25.4-DOC-01 | README DE/EN trennt App und Standalone | PASS | Beide Fassungen beschreiben Repository/App/Port/LAN sowie Bundle/LXC getrennt. |
| 25.4-DOC-02 | Standalone-Artefakt enthält alle versprochenen Anleitungen | BROKEN | `docs/RELEASING.md` fehlt im Tar; Deployment verweist auf nicht enthaltene Git-Skripte. `RQ-14-01`. |
| 25.4-DOC-03 | Projektstatus/Roadmap bilden aktuellen Stand korrekt ab | PARTIAL | Historischer Sprintabschnitt vorhanden; globaler Status nennt weiter Schema 11 und veralteten Auditstand. `RQ-08-03`. |
| 25.4-TELEM-01 | Keine Telemetrie/Analytics/Crash-Uploads | PASS | Source-/Dependency-/Networkscan ohne entsprechende Integration. |
| 25.4-MATRIX-01 | RC Result Matrix vorhanden und verwendet nur PASS/FAIL/BLOCKED/NOT TESTED | PASS | `docs/RC_CHECKLIST.md`; 145 Statuszeilen, keine fremden Statuswerte. |
| 25.4-MATRIX-02 | Matrix ist ein commitbezogener, aktueller Kandidatennachweis | BROKEN | Kopf RC.1/741bba4, LXC 42d88f3, Tests 275/283/290, später angehängte Sprints; aktueller HEAD 329 Tests. `RQ-17-01`. |
| 25.4-MATRIX-03 | PASS-Aussagen entsprechen dem aktuellen Repositoryzustand | BROKEN | Falscher Dockerfile-Pfad und „0 Schwachstellen“ trotz aktuellem Moderate-Befund bleiben falsch. Der frühere PNG-Widerspruch ist repariert. `RQ-17-01`, RQ-14-05. |
| 25.4-BLOCK-01 | Expliziter Abschnitt `RC BLOCKERS` vorhanden | PASS | Fünf Punkte plus Abschlussreihenfolge; RC-Empfehlung ausdrücklich BLOCKED. |
| 25.4-BLOCK-02 | Blockerliste enthält alle aktuell offenen P1-Befunde | BROKEN | RQ-04-01, RQ-13-01 und RQ-14-01/-02/-04 sind nicht vollständig als heutige Gatebedingungen enthalten. `RQ-17-01`; RQ-16-01 ist geschlossen. |
| 25.4-MANUAL-01 | Reale HAOS-, LXC-, Netzwerk- und iPad-Punkte nicht künstlich PASS | PARTIAL | Alte Evidenz ist überwiegend korrekt begrenzt; einige Matrix-PASS-Zeilen werden aber ohne klare Buildgrenze neben späteren Ständen wiederverwendet. MT-Zuordnung und RQ-17-01. |
| 25.4-MANUAL-02 | Vollständige ausführbare Manuelltests vorhanden | PASS | MT-13/34/40/42 und MT-50 bis MT-56/58 bis MT-60 besitzen Voraussetzungen, Routen, Schritte, Expected, Fail, Evidence und Result. |
| 25.4-RC-01 | RC nur bei vollständigen Pflicht-PASS freigeben | PASS | Dokument empfiehlt ausdrücklich `BLOCKED`; kein Stable-/Tag-/Publish in Part 17. |
| 25.4-RC-02 | Aktueller HEAD ist RC-freigabefähig | BROKEN | Aktuelles Image fehlt, mehrere P1-Befunde und reale Pflichtgates sind offen; zusammengeführt in `RQ-17-01` mit Abhängigkeiten RQ-04-01/RQ-13-01/RQ-14-01/-02/-04. |

## Aktuelle RC Result Matrix

Diese Matrix bewertet den auditierten HEAD. Historische RC.1-Evidenz bleibt
ausdrücklich auf `741bba4` begrenzt.

| Bereich | Status | Blocker/Nachweis |
|---|---|---|
| Repository-Metadaten | PASS | YAML und Pflichtfelder valide. |
| App-Metadaten/Minimalrechte | PASS | Generisches Image, zwei Architekturen, `homeassistant_api`, direkter Port, keine breiten Rechte. |
| Versionsstrings | PASS | Alle Quellen nennen `1.0.0-rc.1`. |
| Version bildet aktuellen HEAD ab | FAIL | RC.1/Image zeigen auf `741bba4`, HEAD auf `593ba5a`; RQ-13-01. |
| Öffentlicher RC.1-Release | PASS | Historisches Prerelease samt Bundle/Checksum weiterhin verfügbar. |
| Öffentliches RC.1-Multi-Arch-Image | PASS | OCI-Index amd64/arm64, aber alter Quellstand. |
| Aktuelles Containerimage | BLOCKED | Vor Reparaturen keine neue unveränderliche Version veröffentlicht. |
| Aktueller lokaler Containerbuild | NOT TESTED | Docker nicht verfügbar; CI baut nur bei neuem Commit/Tag erneut. |
| Automatisierte Tests/Syntax | PASS | 92/92 fokussiert, 329/329 vollständig, 119 JS und 8 Shell-Dateien syntaktisch gültig. |
| Credential-/Permission-Sicherheit | PASS | Secret-Scan grün, backend-only Tokens, keine breiten Apprechte. |
| Uploadvalidierung | PASS | JPEG und PNG einschließlich Struktur-/CRC-Negativfällen sowie Last-valid-Replace automatisiert grün. Reale Runtime-Abnahme bleibt separat NOT TESTED. |
| Produktionsabhängigkeiten | FAIL | Eine moderate `qs`-Schwachstelle mit zwei Advisories; RQ-14-05. |
| RC-Evidenzdokument | FAIL | Mehrere Commit-/Teststände und veraltete PASS-Aussagen vermischt; RQ-17-01. |
| Standalone-Bundle | FAIL | Operativ nicht selbsttragende Dokumentation; RQ-14-01. |
| Standalone/LXC aktueller Kandidat | NOT TESTED | Kein aktuelles versioniertes Bundle/Real-LXC-Gate. |
| Home Assistant App aktueller Kandidat | BLOCKED | Aktuelles Image fehlt; reale Prüfung kann erst danach erfolgen. |
| Reale App-Installation/Startup | NOT TESTED | Nur historische RC.1-Evidenz. |
| Supervisor REST real | NOT TESTED | Nur historisch RC.1; aktueller Kandidat fehlt. |
| Supervisor WebSocket/Recovery real | NOT TESTED | MT-50; zusätzlich RQ-09-01. |
| Direct LAN/WebUI real | NOT TESTED | Statische Bind-/Portkonfiguration PASS; aktueller Kandidat nicht real geprüft. |
| App-`/data`, Restart, Backup/Upgrade | NOT TESTED | MT-51/52. |
| Default/Custom/Summary/Errors lokal | PASS | Aktuelle localhost-Regression grün. |
| Theme/Filter/Same-Window lokal | PASS | Aktuelle fokussierte Regression grün. |
| Background/Full Height/Focus lokal | PASS | Rendering und gehärtetes PNG-/Replace-Gate lokal grün. |
| iPad mini Pflichtlauf | NOT TESTED | MT-13/34/40/54/58. |
| Current-commit RC-Empfehlung | BLOCKED | Offene P1-Befunde und reale Pflichtgates. |

## RC BLOCKERS

1. `RQ-04-01`: routeabhängige immutable Cacheversionen beheben und re-auditieren.
2. `RQ-13-01`: erst nach Reparaturen eine neue unveränderliche Version aus
   genau dem Kandidatencommit veröffentlichen; RC.1 nicht überschreiben.
3. `RQ-14-01`: Standalone-Bundle mit tatsächlich enthaltenem Install-/Upgrade-/
   Rollbackpfad selbsttragend machen.
4. `RQ-14-02`: echten N→N+1-/Rollbacknachweis herstellen.
5. `RQ-14-04`: Stable technisch an commitbezogene Gates/offene P1-Befunde
   koppeln.
6. `RQ-17-01`: RC-Checkliste in einen commit-/artefaktkohärenten Nachweis
   überführen und alle aktuellen Blocker/Statuswerte synchronisieren.
7. Die zugeordneten realen HAOS-, LXC-, Netzwerk-, App-Restart-/Backup- und
   iPad-mini-Pflichtprüfungen auf genau dem neuen Kandidaten ausführen.

Bis alle P1-Befunde geschlossen/re-auditiert und alle Pflichtprüfungen für
denselben Kandidaten `PASS` sind, bleibt die Empfehlung **BLOCKED**.

## Superseded- und historische Evidenz

- Sprint 25.5 ersetzt den ursprünglichen JPEG-Parser und dokumentiert die
  Dual-Stack-/`.local`-Diagnose. Diese Anforderungen gehören zu Audit Part 18;
  Part 17 verwendet sie nur, um die heutige RC-Checkliste zeitlich einzuordnen.
- Sprint 25.6 erweitert die Card-Matrix und Testzahl. Seine Layoutanforderungen
  gehören ebenfalls zu Part 18 und werden hier nicht fachlich auditiert.
- Sprint 26/26.1/26.2 ergänzen Sections, Room Cards und zentrale Controls. Ihre
  Änderungen beweisen gerade, warum RC.1 nicht den heutigen Produktstand
  abbildet; eine Fachprüfung erfolgt erst in Part 19.
- Historische reale HAOS-/LXC-/iPad-Evidenz wird bewahrt, aber nur dem jeweils
  dokumentierten Commit/Image zugeordnet.

## Automatisierte und öffentliche Verifikation

- Sprint-27.1-A-Fokuslauf: **85/85 PASS**, 0 Fehler.
- Gesamtsuite: **330/330 PASS**, 0 Fehler.
- Release-Gate-Komponenten: 119 JavaScriptdateien mit `node --check`, acht
  Shell-Dateien mit `sh -n`, Versionscheck und Secret-Scan: **PASS**.
- `repository.yaml`, App-`config.yaml` und beide Übersetzungs-YAMLs: **PASS**.
- `npm audit --omit=dev --audit-level=high`: Exit 0, aber **eine moderate
  Schwachstelle mit zwei `qs@6.15.3`-Advisories**; `RQ-14-05`.
- Öffentliche GitHub-API: einziger Release `v1.0.0-rc.1`, Prerelease, nicht
  Draft; Release- und Testworkflow erfolgreich auf `741bba4`.
- Anonymer GHCR-Manifestabruf: HTTP 200, amd64 und arm64, Digest
  `sha256:1c5d4eeae461ce88b3775d0a6666d7a6f67774046102ac50c8a54e77fc498e7c`.
- Kein produktives HA/HAOS/LXC/Netzwerk/iPad wurde kontaktiert, kein Image
  gebaut und kein Artefakt veröffentlicht.

## Manuelle Evidenz und Repair-Mapping

Part 17 erzeugt keine redundanten neuen Test-IDs. Folgende bereits vollständig
ausformulierte Einträge werden Sprint 25.4 zusätzlich zugeordnet:

- MT-13: globale Theme-Persistenz auf dem iPad mini;
- MT-34: exakte Severity-/State-/Same-Child-Filter;
- MT-40: kompletter HomeScreen-/Return-/Health-Ablauf;
- MT-42: Desktop-Safari-Health-/Failure-/Langzeitlauf;
- MT-50: realer Supervisor-WebSocket, Outage/Recovery und App-Logs;
- MT-51: `/data`, Rechte und App-Restart;
- MT-52: Backup/Restore, Upgrade und HAOS-Reboot;
- MT-53: reale aarch64-App;
- MT-54: direkter App-LAN-/Legacy-iPad-Lauf;
- MT-55: nächster commitbezogener RC-Workflow/Image/Release;
- MT-56: Standalone-Fresh-Install, N→N+1 und Rollback;
- MT-58: Background/Title/Full Height/Footer/Focus auf iOS 9;
- MT-59: Safari-Admin-/Upload-/Replacement-Matrix;
- MT-60: Standalone-Background-/Restart-/Rechte-Persistenz.

Alle besitzen Gerät/System, Voraussetzungen, exakte Route und Testdaten,
Schrittfolge, erwartete visuelle/funktionale Resultate, Fail-Kriterien,
Evidenzvorgaben und `NOT TESTED` als Ergebnis.

Repair-Zuordnung:

- neu `RQ-17-01`: inkohärente/veraltete RC-Checkliste;
- zusätzliche Sprint-25.4-Evidenz für `RQ-04-01`, `RQ-08-03`, `RQ-09-01`,
  `RQ-13-01`, `RQ-14-01`, `RQ-14-02`, `RQ-14-04` und `RQ-14-05`;
  `RQ-16-01` ist im gezielten Re-Audit automatisiert geschlossen.

## Abschluss

Sprint 25.4 hat korrekt keine Freigabe behauptet und den damaligen Kandidaten
grundsätzlich nachvollziehbar als `BLOCKED` eingeordnet. Der heute vorhandene
lebende Checklist-Text ist jedoch kein verlässlicher aktueller Kandidatennachweis
mehr. Part 17 ist baseline-seitig abgeschlossen, der PNG-Pfad im gezielten
Sprint-27.1-A-Re-Audit repariert. Sprint 25.4 bleibt `PARTIAL` und der aktuelle
Stand für RC/Stable `BLOCKED`; es wurde kein Image oder Release veröffentlicht.
