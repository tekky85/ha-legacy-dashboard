# Sprint-25-Audit – Release & Distribution

## Auditrahmen

- Audit-Part: 14
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.md`](../../sprints/SPRINT-25.md)
- Anwendungscode geändert: nein
- Release, Tag oder Image erzeugt/veröffentlicht: nein
- Produktives Home Assistant, HAOS oder physisches iPad kontaktiert: nein

Der Arbeitsbaum enthielt zu Beginn ausschließlich die noch nicht committeten
Auditdokumente aus Parts 12 und 13 sowie die bereitgestellten Audit-Prompts.
Diese Änderungen wurden vollständig bewahrt. Der Anwendungscode entspricht
Commit `593ba5a`.

## Gesamtergebnis

**Sprint 25: PARTIAL**

Die Releasearchitektur ist real vorhanden und hat für `v1.0.0-rc.1` bereits
erfolgreich gearbeitet: Ein unveränderlicher Tag auf `741bba4`, ein öffentliches
GitHub-Prerelease, ein versioniertes amd64/aarch64-GHCR-Manifest, Smoke-Test,
Standalone-Archiv und `SHA256SUMS` sind nachweisbar. Das Dockerfile ist die
einzige aktive Container-Buildquelle; BuildKit/buildx, Lockfile, OCI-Labels,
SBOM/Provenance, lokaler HA-Mock und die RC-vs-Stable-Taglogik sind umgesetzt.

Der heutige Repositoryinhalt ist dennoch nicht releasebereit:

1. `1.0.0-rc.1` bezeichnet weiterhin den Stand `741bba4`, während HEAD
   `593ba5a` 19 Commits und zahlreiche Laufzeitänderungen später liegt. Das ist
   der bereits in Part 13 geführte RC-Blocker `RQ-13-01`.
2. Das Standalone-Archiv verweist auf `docs/RELEASING.md`, enthält diese Datei
   aber nicht. Seine enthaltene `docs/DEPLOYMENT.md` verlangt außerdem
   `deploy/deploy.sh`, `check.sh`, `health-check.sh` und `rollback.sh`, die
   ebenfalls fehlen und ohne Git-Arbeitsbaum nicht dem Bundle-Modell
   entsprechen (`RQ-14-01`).
3. Der automatisierte „Upgrade“-Test initialisiert zweimal dieselbe aktuelle
   Codeversion und prüft keinen echten N→N+1-/Rollbackpfad (`RQ-14-02`).
4. Die 60 ausdrücklich nummerierten Releasefälle sind nur über sieben breite
   Sprint-25-Tests, die Gesamtsuite, Workflow-Evidenz und manuelle Queues
   abgedeckt; eine vollständige rückverfolgbare Matrix fehlt (`RQ-14-03`).
5. Die Stable-Checkliste ist dokumentiert, aber nicht als Freigabeartefakt oder
   Environment-Gate an den Stable-Workflow gebunden. Ein technisch gültiger
   Stable-Tag könnte trotz offener P1-Befunde und nicht ausgeführter iPad-/HAOS-
   Abnahme veröffentlichen (`RQ-14-04`).
6. `npm audit --omit=dev --audit-level=high` besteht, meldet aber eine aktuelle
   moderate DoS-Schwachstelle in `qs@6.15.3` (`RQ-14-05`).

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25-SOURCE-01 | Eine aktuelle Container-Buildquelle | PASS | `ha_legacy_dashboard/Dockerfile` ist die einzige Dockerfile; CI und Release referenzieren sie explizit. |
| 25-SOURCE-02 | Dockerfile/BuildKit statt historischem HA-Builder | PASS | `.github/workflows/test.yml` und `release.yml` verwenden buildx/BuildKit; `build.yaml` und `home-assistant/builder` fehlen. |
| 25-SOURCE-03 | Eindeutiger Repository-Root-Kontext und kontrollierte Kopien | PASS | Workflow: `context: .`, `file: ha_legacy_dashboard/Dockerfile`; Dockerfile kopiert Lockfile, `src`, Lizenz und `run.sh` gezielt, niemals `COPY . .`. |
| 25-SOURCE-04 | Kein widersprüchlicher zweiter Releasepfad | PASS | Eine Releaseworkflowdatei, ein Bundle-Generator und ein Manifestvalidator; das Sprint-24-Dev-Vorbereitungsskript ist kein Veröffentlichungsworkflow. |
| 25-VERSION-01 | SemVer über Paket, Lockfile, App, Metadaten und Changelogs konsistent | PASS | `release/check-version.js`; lokaler Check für `v1.0.0-rc.1` grün. |
| 25-VERSION-02 | Falscher Tag oder Versionsabweichung bricht ab | PASS | `test/sprint-25.test.js`: falscher Git-Tag und abweichende App-Version werfen kontrollierte Fehler. |
| 25-VERSION-03 | Immutable Version bezeichnet den aktuellen Source-Stand | BROKEN | Tag `v1.0.0-rc.1` zeigt auf `741bba4`, HEAD auf `593ba5a`; Stringgleichheit erkennt 19 nachfolgende Commits nicht. `RQ-13-01`. |
| 25-VERSION-04 | Buildargumente, Image- und Archivnamen verwenden dieselbe Version | PASS | `release/metadata.json`, `release.yml`, `config.yaml`, Bundle-Generator und OCI-Buildargumente verwenden `1.0.0-rc.1`. |
| 25-TYPE-01 | Development, RC und Stable sind getrennt definiert | PASS | `docs/RELEASING.md`, `check-version.js` und `metadata.channel`; RC nur `-rc.N`, Stable ohne Suffix. |
| 25-TYPE-02 | RC ist Prerelease und aktualisiert niemals `latest` | PASS | Releaseworkflow setzt `--prerelease`; `latest`-Schritt besitzt `stable == 'true'`. Öffentlicher RC.1-Run ließ alle `latest`-Schritte aus. |
| 25-TYPE-03 | Stable veröffentlicht erst nach explizitem Promotionsschritt | PARTIAL | Neuer Stable-Tag ist explizit und folgt Smoke-Test; dokumentierte manuelle Gates/offene Blocker werden aber nicht technisch an die Freigabe gebunden. `RQ-14-04`. |
| 25-WF-01 | Tagworkflow checkt exakt den Tag aus | PASS | `.github/workflows/release.yml`: `ref: github.ref`, vollständige Historie und Main-Ancestor-Prüfung. |
| 25-WF-02 | Lockfilebasierte Installation und vollständiges Release-Gate | PASS | `npm ci`, `release/test-gate.sh`, Produktionsaudit und Bundleprüfung im Validate-Job. |
| 25-WF-03 | Failure Atomicity | PASS | Manifest benötigt beide Arch-Builds; Smoke benötigt Manifest; GitHub Release und `latest` benötigen erfolgreichen Smoke-Test. Interne Arch-Tags dürfen diagnostisch verbleiben. |
| 25-BUILD-01 | amd64-Image mit BuildKit | PASS | Öffentlicher RC.1-Job `build (amd64, amd64)` erfolgreich; Matrixpfad `linux/amd64`. |
| 25-BUILD-02 | aarch64-Image mit BuildKit | PASS | Öffentlicher RC.1-Job `build (arm64, aarch64)` erfolgreich; App-Metadaten verwenden HA-Bezeichnung `aarch64`. |
| 25-BUILD-03 | Generisches Multi-Arch-Manifest enthält beide Plattformen | PASS | Öffentlicher Job `publish-manifest` erfolgreich; `validate-manifest.js` verlangt `amd64` und `arm64`. |
| 25-BUILD-04 | Heutiger HEAD als aktuelles Image gebaut | NOT TESTED | Kein lokales Docker; der veröffentlichte Build gehört zum alten Tag. Erst nach `RQ-13-01` sinnvoll. |
| 25-GHCR-01 | Generischer Image-Name und unveränderlicher Versionstag | PASS | `ghcr.io/tekky85/ha-legacy-dashboard:<version>`; App-`config.yaml` referenziert den generischen Namen ohne Arch-Präfix. |
| 25-GHCR-02 | GITHUB_TOKEN statt separatem Registry-PAT | PASS | Login verwendet ausschließlich `${{ github.token }}`; keine `secrets.*`-Referenz. |
| 25-GHCR-03 | Minimale CI-/Workflowberechtigungen | PASS | Jobs besitzen gezielt `contents: read`, `packages: write/read`; nur finaler Releasejob besitzt `contents: write`. |
| 25-GHCR-04 | Paket öffentlich installierbar | PASS | Historische RC-Evidenz: Die reale HAOS-RC.1-Installation aus `docs/RC_CHECKLIST.md` konnte das Image beziehen. Die nächste Version wird über `MT-55` erneut geprüft. |
| 25-SUPPLY-01 | Definierte Node-Basis und `npm ci --omit=dev` | PASS | Dockerfile verwendet standardmäßig `node:22-alpine` und lockfilebasierte Produktionsinstallation. |
| 25-SUPPLY-02 | OCI-Labels mit Version, Revision, Datum, Quelle und Lizenz | PASS | Dockerfile definiert `org.opencontainers.image.*` sowie `io.hass.*`; Workflow übergibt feste Buildargumente. |
| 25-SUPPLY-03 | SBOM/Provenance, soweit praktikabel | PASS | `docker/build-push-action@v6` setzt `provenance: mode=max` und `sbom: true`. |
| 25-SMOKE-01 | Versioniertes Image startet gegen lokalen Mock | PASS | `release/smoke-container.sh`; öffentlicher RC.1-Smokejob erfolgreich; kein Produktions-HA. |
| 25-SMOKE-02 | Health, API-Status, statische Assets und Crashfreiheit geprüft | PASS | Smoke-Skript prüft `/health`, `/api/status`, `/`, CSS/JS und Containerzustand. |
| 25-APP-01 | Valides installierbares App-Repository | PASS | Historische RC-Evidenz: `repository.yaml`, App-Struktur und reale RC.1-Installation/Start sind dokumentiert; aktueller Source-Drift bleibt `RQ-13-01`. |
| 25-APP-02 | my.home-assistant.io-Repository-Link | PASS | Synchron in README DE/EN mit offiziellem Redirect-Schema; keine Behauptung eines offiziellen Core-Apps. |
| 25-APP-03 | App-Updateerkennung über Version und Image | PASS | App-`version` und versionierter GHCR-Tag sind gekoppelt; eine neue Version setzt ein neues Manifest voraus. Reale nächste Erkennung siehe `MT-57`. |
| 25-BUNDLE-01 | Reproduzierbares versioniertes Standalone-Archiv | PASS | `create-standalone-bundle.js`; zwei lokale Builds von HEAD hatten identischen SHA256 `0e74ee0b…456d0`. |
| 25-BUNDLE-02 | Laufzeitdateien, Lockfile, Beispielkonfiguration, Unit, Lizenz und Changelog | PASS | Öffentlicher und lokaler Tar-Inhalt geprüft; `src`, Paketdateien, `.env.example`, systemd-Unit, README, Lizenz, Changelog und `VERSION` vorhanden. |
| 25-BUNDLE-03 | Keine Secrets, `.env`, Nutzerdaten, Logs, Tests, Git oder `node_modules` | PASS | Explizite Include-Liste, Tar-Inhaltsprüfung und Secret-Scan; keine verbotenen Einträge im öffentlichen Artefakt. |
| 25-BUNDLE-04 | Archiv enthält verwendbare vollständige Install-/Upgrade-/Rollbackanleitung | BROKEN | Verweis auf fehlendes `docs/RELEASING.md`; enthaltenes `DEPLOYMENT.md` verlangt vier nicht enthaltene Git-Deployskripte. `RQ-14-01`. |
| 25-CHECKSUM-01 | SHA256 entsteht nach dem finalen Archiv | PASS | Generator komprimiert zuerst, hasht exakt diesen Buffer und schreibt danach `SHA256SUMS`. |
| 25-CHECKSUM-02 | Checksum-Name und Referenz sind eindeutig | PASS | `SHA256SUMS` nennt exakt `ha-legacy-dashboard-<version>.tar.gz`; Workflow führt `sha256sum --check` aus. |
| 25-CHECKSUM-03 | Öffentliches Artefakt verifiziert | PASS | Heruntergeladene RC.1-Datei stimmt mit `c7db4e1874334195aaf00147f5a58e6d46b31cc3c14cfbb04c93c3c96880d984` überein. |
| 25-UPGRADE-01 | Standalone-Konfiguration über Update erhalten | PARTIAL | Test bewahrt Konfiguration beim zweiten Initialisieren derselben Codeversion; kein echtes altes/neues Release, Prozesswechsel oder Rollback. `RQ-14-02`, `MT-56`. |
| 25-UPGRADE-02 | App-`/data` über Update erhalten | PARTIAL | Dieselbe simulierte Reinitialisierung nutzt einen App-ähnlichen Pfad; reales HAOS-Update/Backup steht in `MT-52` und `MT-57`. `RQ-14-02`. |
| 25-UPGRADE-03 | Dashboards, Regeln, Critical Mode, Labels, Grace und Admin-Konfiguration | PARTIAL | Reinitialisierung prüft zentrale Felder, aber kein N→N+1-Release und Theme liegt browserlokal. `RQ-14-02`. |
| 25-ROLLBACK-01 | Nichtdestruktiver Standalone-Rollback dokumentiert und geprüft | PARTIAL | `docs/RELEASING.md` beschreibt Verzeichnis-/Datensicherung; reale Archivkette und Rückweg nicht geprüft. `MT-56`. |
| 25-ROLLBACK-02 | App-Rollback behauptet keine ungetestete Supervisorfunktion | PASS | Dokumentation nennt Backup als verlässliche Grundlage und macht keine falsche Rollbackzusage. |
| 25-CHANGE-01 | Nutzerorientierte Root-/App-Changelogs | PASS | Beide Changelogs besitzen RC.1 Added/Changed/Fixed/Security statt eines Sprint-Dumps. |
| 25-NOTES-01 | GitHub Release Notes mit Installation, Upgrade, Breaking Changes, Security | PASS | `release/notes/1.0.0-rc.1.md`; öffentliches Prerelease verwendet diese Datei. |
| 25-LICENSE-01 | Repositorylizenz und Dependency-Lizenzen geklärt | PASS | ISC in `LICENSE`, `package.json` und OCI-Label; direkte Abhängigkeiten werden in `RELEASING.md` eingeordnet. |
| 25-SEC-01 | Secret-Gate über Quellen und Releaseartefakt | PASS | `release/secret-scan.js`, `.dockerignore`, explizite Bundle-Include-Liste und Tests; keine Token-/Key-Datei gefunden. |
| 25-SEC-02 | Keine Credentials als Buildargument/GitHub Secret erforderlich | PASS | Releaseworkflow verwendet keine HA-/Supervisor-/Admin-Secrets; Smoke nutzt festes Fake-Credential im lokalen Netz. |
| 25-SEC-03 | Produktionsabhängigkeiten ohne High/Critical-Befund | PASS | `npm audit --omit=dev --audit-level=high` Exit 0 am 8. September 2026. |
| 25-SEC-04 | Aktueller Produktionsaudit vollständig ohne Befund | PARTIAL | `qs@6.15.3` besitzt zwei moderate DoS-Advisories; bewusst kein blindes Major-Upgrade. `RQ-14-05`. |
| 25-TELEMETRY-01 | Keine Analytics, Crashuploads oder Phone-Home-Funktion | PASS | Source-/Dependency-/Workflow-Scan ohne Telemetrie-SDK oder externen Callback; nur HA/Supervisor- und Release-Infrastrukturzugriffe. |
| 25-GATE-01 | Tests, Syntax, Version, Secret, Paket und Checksum im Gate | PASS | `release/test-gate.sh`, Workflow und lokaler Part-14-Lauf: 329/329 Tests; Versions-/Syntax-/Secret-/Bundleprüfung grün. |
| 25-GATE-02 | Docker, beide Architekturen, Manifest und Smoke im Gate | PASS | Historische RC-Evidenz: öffentlicher RC.1-Workflow mit allen sechs Jobs erfolgreich; aktueller HEAD bleibt wegen `RQ-13-01` ungebaut. |
| 25-GATE-03 | Bekannte Blocker verhindern Stable | PARTIAL | Prozessdokumentation verlangt Abnahme, Workflow liest weder Repair-/RC-Checkliste noch geschützte Environment-Freigabe. `RQ-14-04`. |
| 25-GATE-04 | Legacy-iPad-Gate automatisiert plus manuell | PARTIAL | ES5-/CSS- und Regressionstests grün; reale aktuelle Release-Abnahme steht in `MT-54` und den früheren UI-Tests. |
| 25-GATE-05 | HA-App-Gate einschließlich realem Update | PARTIAL | Historischer RC.1-Fresh-Install/REST/LAN PASS; WS, Update, `/data`, Backup, Reboot und aarch64 in `MT-50` bis `MT-53`/`MT-57`. |
| 25-DOC-01 | README DE/EN semantisch synchron | PASS | Release-/Installationsabschnitte haben dieselbe Betriebsarten-, Image-, RC- und Securityaussage. |
| 25-DOC-02 | Standalone-Distribution aus dem Artefakt heraus korrekt dokumentiert | BROKEN | Das Bundle enthält die tatsächlich passende Releaseanleitung nicht und verweist auf fehlende Skripte. `RQ-14-01`. |
| 25-DOC-03 | Releaseanleitung entspricht dem aktuellen Lebenszyklus | PARTIAL | Sie nennt RC.1 noch als „ersten geplanten Release“ und zeigt denselben bereits existierenden Tag als nächsten Erzeugungsschritt. Zusatzbeleg zu `RQ-13-01`. |
| 25-DOC-04 | Technischer Projektstatus/Roadmap aktuell | PARTIAL | `PROJECT_STATUS.md` ist bereits über `RQ-08-03` als veraltet erfasst; Release-/Auditstand ist nicht vollständig nachgeführt. |
| 25-DOC-05 | Keine echten Secrets oder privaten lokalen Pfade in Beispielen | PASS | Nur generische Platzhalter/Testwerte; Bundle-/Dokumentationsscan ohne Credential oder privaten SSH-/Mac-Pfad. |
| 25-MATRIX-01 | Alle 60 Releasefälle gezielt rückverfolgbar | PARTIAL | Sieben breite Sprint-25-Tests plus Gesamtregression/Workflow/Manuellisten; mehrere Fälle nur indirekt oder noch manuell. `RQ-14-03`. |

## Die 60 Sprint-25-Releasefälle

| Nr. | Kurzanforderung | Status | Nachweis |
|---:|---|---|---|
| 1 | Versionen konsistent | PASS | Versioncheck lokal und im öffentlichen Run |
| 2 | Mismatch schlägt fehl | PASS | gezielter Unit-Test |
| 3 | Lockfile verwendet | PASS | `npm ci`, Dockerfile und Workflow |
| 4 | Gesamttests grün | PASS | 329/329 |
| 5 | Docker amd64 | PASS | öffentlicher RC.1-Job |
| 6 | Docker arm64 | PASS | öffentlicher RC.1-Job |
| 7 | Manifest mit beiden Architekturen | PASS | öffentlicher Manifestjob/Validator |
| 8 | Versioniertes Image vorhanden | PASS | historische RC.1-Installation und Smoke |
| 9 | RC verändert `latest` nicht | PASS | Workflowbedingung und öffentlicher Run |
| 10 | Stable darf `latest` aktualisieren | NOT TESTED | Kein Stable-Release; `MT-57` |
| 11 | App nutzt generisches Image | PASS | `config.yaml` |
| 12 | `repository.yaml` valide | PASS | Pakettests/Part 13 |
| 13 | App wird gefunden | PASS | reale historische RC.1-HAOS-Evidenz |
| 14 | Standalone-Archiv erzeugt | PASS | lokal und öffentlich |
| 15 | Archiv ohne `.env` | PASS | Tar-Inhaltsprüfung |
| 16 | Archiv ohne `node_modules` | PASS | Tar-Inhaltsprüfung |
| 17 | `SHA256SUMS` erzeugt | PASS | lokal und öffentlich |
| 18 | Health-Smoke | PASS | öffentlicher Job |
| 19 | Nur Mock HA/Supervisor | PASS | Workflow-/Skriptnachweis |
| 20 | Keine Produktionsnetzabhängigkeit | PASS | statischer Scan und Mocklauf |
| 21 | Standalone-Konfiguration über Update | PARTIAL | nur Same-Version-Reinitialisierung; `RQ-14-02` |
| 22 | App-`/data` über Update | PARTIAL | nur Same-Version-Reinitialisierung; `MT-52`/`MT-57` |
| 23 | Dashboards über Update | PARTIAL | kein echter Versionswechsel; `RQ-14-02` |
| 24 | Entity Rules über Update | PARTIAL | kein echter Versionswechsel; `RQ-14-02` |
| 25 | Critical Mode über Update | PARTIAL | kein echter Versionswechsel; `RQ-14-02` |
| 26 | Grace Rules über Update | PARTIAL | kein echter Versionswechsel; `RQ-14-02` |
| 27 | Admin-Konfiguration über Update | PARTIAL | kein echter Versionswechsel; `RQ-14-02` |
| 28 | Theme über Update | NOT TESTED | browserlokal und reale Releasekette offen |
| 29 | Kein HA-Token im Image | PASS | Docker-/Secret-/Frontendscan |
| 30 | Kein Supervisor-Token im Image | PASS | Docker-/Secret-/Frontendscan |
| 31 | Kein Token im GitHub-Artefakt | PASS | öffentliches Tar geprüft |
| 32 | Kein Token in Logs | PARTIAL | Logger-/Smoketests grün; reale Logs `MT-50` noch offen |
| 33 | Keine `.env` im Artefakt | PASS | öffentliches Tar geprüft |
| 34 | Minimale CI-Rechte | PASS | Jobberechtigungen |
| 35 | Kein unnötiger Registry-PAT | PASS | ausschließlich `github.token` |
| 36 | Kein Produktions-HA im CI | PASS | Mockskript/Workflow |
| 37 | Kein privater Schlüssel | PASS | Quellen- und Tar-Scan |
| 38 | Kein Default-Adminsecret | PASS | Appoption default aus, Token optional/leer |
| 39 | Deutsche Installationsdoku | PASS | README.de/Deployment/Releasing |
| 40 | Englische Installationsdoku | PASS | README.en; technische Detaildocs bewusst deutsch |
| 41 | App-Repository-Anleitung | PASS | README DE/EN und App-DOCS |
| 42 | Standalone-Anleitung | BROKEN | im Bundle nicht ausführbar; `RQ-14-01` |
| 43 | Upgradeanleitung | PARTIAL | richtige Datei fehlt im Bundle; `RQ-14-01` |
| 44 | Rollbackanleitung | PARTIAL | richtige Datei fehlt im Bundle; `RQ-14-01` |
| 45 | Release Notes | PASS | öffentliche RC.1-Notes |
| 46 | Changelog | PASS | Root und App |
| 47 | Supportlinks | PASS | GitHub-Issues/Repository |
| 48 | Keine veralteten Releaseaussagen | BROKEN | RC.1 wird noch als geplant beschrieben; `RQ-13-01` |
| 49 | Default Dashboard | PARTIAL | automatisiert PASS; Releasegerät in manuellen UI-Queues offen |
| 50 | Custom Dashboards | PARTIAL | automatisiert PASS; Releasegerät in manuellen UI-Queues offen |
| 51 | Focus | PARTIAL | automatisiert PASS; reales Gerät MT-18/19/20 offen |
| 52 | Summary | PARTIAL | automatisiert PASS; reales Gerät MT-24/25 offen |
| 53 | Errors | PARTIAL | automatisiert PASS; reales Gerät MT-27/28 offen |
| 54 | Global Health Indicator | PARTIAL | automatisiert PASS; reales Gerät MT-40/42 offen |
| 55 | Entity Rule Manager | PARTIAL | automatisiert PASS; reales Gerät MT-37/38 offen |
| 56 | Grace/Flapping | PARTIAL | automatisiert PASS; reales Gerät MT-43/45 offen |
| 57 | Automation Impact | PARTIAL | Tests grün, aktuelle Sprint-23-Befunde `RQ-12-02/-03`; MT-46–49 |
| 58 | Admin | PARTIAL | automatisiert PASS; reales Gerät MT-04/17 offen |
| 59 | Light/Climate Controls | PARTIAL | automatisiert PASS; reales Gerät MT-03/21–23 offen |
| 60 | Safari iOS 9 | NOT TESTED | Statischer Legacy-Scan grün; physisch MT-54 und UI-Queues |

## Öffentliche Releaseevidenz

- Tag `v1.0.0-rc.1`: Commit `741bba41d8ffc34cba4c7643f2e2b777f2e6501e`.
- GitHub Release: öffentliches Prerelease vom 28. August 2026 mit Standalone-
  Archiv und `SHA256SUMS`.
- Actions-Run `33203376391`: `validate`, beide Architektur-Builds,
  `publish-manifest`, `smoke-test` und `publish-release` erfolgreich;
  Stable-`latest`-Schritte beim RC übersprungen.
- Heruntergeladenes öffentliches Archiv: 204389 Byte, SHA256
  `c7db4e1874334195aaf00147f5a58e6d46b31cc3c14cfbb04c93c3c96880d984`.

Diese Evidenz beweist die Funktion der Pipeline für den damaligen Tag. Sie
beweist ausdrücklich nicht, dass HEAD `593ba5a` bereits veröffentlicht oder
auf HAOS/iPad geprüft ist.

## Standalone-Bundle-Befund

Die technische Include-Liste ist eng und sicher. Das Dokumentationsmodell ist
aber inkonsistent: Der enthaltene Root-README verweist auf
`docs/RELEASING.md`, die Include-Liste nimmt nur `docs/DEPLOYMENT.md` auf. Diese
Deployment-Datei ist auf den Git-Checkout-/LXC-Workflow zugeschnitten und
verlangt nicht enthaltene Skripte. Ein Nutzer kann deshalb aus dem Release-
Archiv heraus den zugesagten Install-/Upgrade-/Rollbackpfad nicht zuverlässig
ausführen. Einfach nur die Git-Deployskripte beizulegen wäre keine sichere
Reparatur, weil diese einen Git-Arbeitsbaum und Commit-/Tag-Rollbacks annehmen.

`RQ-14-01` verlangt deshalb eine eigenständige Bundle-Anleitung sowie einen
automatisierten Test aller aus dem Bundle referenzierten Pfade und Befehle.

## Release-Gate und Releasezustand

Das technische Gate ist gut sequenziert und sein öffentlicher RC.1-Lauf war
vollständig erfolgreich. Die manuelle Stable-Checkliste in
`docs/RELEASING.md` ist dagegen nur Text. Der Workflow kann weder erkennen,
ob sie für den konkreten Commit ausgefüllt wurde, noch ob P1-Befunde aus der
Audit-/RC-Checkliste offen sind. Ein geschütztes GitHub Environment, ein
versioniertes Freigabedokument oder eine gleichwertige explizite Approval-
Kopplung existiert nicht. `RQ-14-04` verlangt keine automatische iPad-
Simulation, sondern eine überprüfbare Stable-Freigabe für genau den zu
veröffentlichenden Commit.

## Sicherheit und Telemetrie

Es wurde keine Credentialoffenlegung gefunden. Releasebundle, Dockerkontext,
Frontend, Workflow und Beispielwerte enthalten keine produktiven HA-,
Supervisor- oder Admin-Tokens, keine `.env`, keine Schlüssel, keine Nutzerdaten
und keine Uploads. Das Workflowmodell benötigt keinen Registry-PAT. Es gibt
keine Analytics-, Crashreporting- oder Phone-Home-Komponente.

Der Online-Produktionsaudit meldet `qs@6.15.3` mit zwei moderaten DoS-
Advisories. Das konfigurierte High/Critical-Gate besteht; der Befund wird gemäß
Sprintvorgabe fachlich bewertet und als `RQ-14-05` nachgeführt, ohne in diesem
Baseline-Audit blind Abhängigkeiten zu aktualisieren.

## Automatisierte und lokale Verifikation

- Sprint-25-Fokustests: **19/19 PASS** nach Freigabe ausschließlich lokaler
  Mock-Ports; der erste Sandboxlauf hatte zwei `EPERM`-Infrastrukturfehler,
  keine Testassertionsfehler.
- Vollständiges `release/test-gate.sh`: **PASS**.
- Gesamtsuite: **329/329 PASS**, 0 Fehler.
- Versionskonsistenz und absichtliche Mismatch-Fälle: **PASS**.
- JavaScript-/Shellsyntax und Legacy-/Securityscan: **PASS**.
- Secret-Scan: **PASS**.
- Standalone-Bundle zweimal erzeugt: identische SHA256 **PASS**.
- Öffentliches RC.1-Archiv gegen `SHA256SUMS` geprüft: **PASS**.
- `npm audit --omit=dev --audit-level=high`: **PASS für High/Critical**, ein
  moderater `qs`-Befund (`RQ-14-05`).
- Aktueller lokaler Docker-Build: **NOT TESTED**, Docker ist auf dem Audit-Mac
  nicht installiert.
- Keine Produktions-HA-, HAOS-, Release-Publish- oder iPad-Prüfung erfolgte.

## Superseded- und Folgebeziehungen

- Sprint 25 supersediert den frühen Sprint-24-Builder-/`build.yaml`-Ansatz mit
  einem einzigen Dockerfile-/BuildKit-Pfad. Das Entfernen von `build.yaml` ist
  deshalb korrekt.
- Sprint 25.4 ergänzt die RC-Ergebnismatrix und reale HAOS-/LXC-Abnahme. Seine
  Anforderungen werden in Part 17 separat auditiert; historische Evidenz darf
  hier verwendet werden, ersetzt aber keine aktuelle Abnahme.
- Sprint 25.5 bis 25.7 härten Netzwerk/JPEG, Kartenlayouts und den iPad-Kiosk.
  Sie ändern nicht die Sprint-25-Releasearchitektur und werden erst in Part 18
  vollständig auditiert.
- Spätere Sprints 26/26.1/26.2 sind der Grund, warum das unveränderte RC.1-Tag
  nicht mehr den aktuellen Source-Endzustand repräsentiert.

## Manuelle Nachweise

Neu angelegt:

- `MT-55`: nächste RC-Pipeline, öffentliche GHCR-Plattformen, Prerelease,
  Checksum und RC-`latest`-Nichtänderung.
- `MT-56`: Standalone-Fresh-Install, echtes N→N+1-Upgrade und Rollback aus
  Releasearchiven auf einem isolierten LXC/VM.
- `MT-57`: Stable-Promotion und kontrollierte `latest`-Aktualisierung nach
  dokumentierter Freigabe.

Bereits vorhandene relevante Nachweise bleiben erhalten: `MT-50` bis `MT-54`
für Supervisor/HAOS, `/data`, Backup/Update, aarch64 und iPad-Direkt-LAN sowie
die UI-spezifischen MT-Einträge aus Parts 01–12.

## Reparaturbezug

Neu:

- `RQ-14-01` (BROKEN, P1): Bundle-Dokumentation und enthaltene Befehle sind
  nicht selbsttragend.
- `RQ-14-02` (PARTIAL, P1): Upgradeprüfung testet keinen Versionswechsel oder
  Rollback.
- `RQ-14-03` (PARTIAL, P2): 60-Punkte-Release-Testmatrix ist nicht vollständig
  direkt rückverfolgbar.
- `RQ-14-04` (PARTIAL, P1): Stable-Workflow ist nicht an nachgewiesene manuelle
  Freigabe und bekannte Blocker gekoppelt.
- `RQ-14-05` (PARTIAL, P2): moderate `qs@6.15.3`-DoS-Advisories.

Zusätzliche Evidenz erhielten:

- `RQ-13-01`: das reale RC.1-Release ist korrekt, aber unveränderlich alt;
  Releaseanleitung und aktueller HEAD verwenden weiter dieselbe Version.
- `RQ-13-02`: lokale Supervisor-Validierung ist für das nächste Release kein
  verlässlicher Ersatz für den öffentlichen Imagepfad.
- `RQ-04-01`: inkonsistente immutable Assetversionen sind bei einem
  distributionsorientierten RC ein P1-Blocker, weil die Releasepipeline den
  routeabhängigen Altcache nicht erkennt.
- `RQ-08-03`: Statusdokumentation bildet den tatsächlichen Release-/Auditstand
  nicht vollständig ab.

## Schlussfolgerung

Sprint 25 hat eine funktionsfähige und bereits einmal erfolgreiche Release-
und Distributionspipeline geschaffen. Sein heutiger Gesamtstatus ist dennoch
`PARTIAL`, weil das veröffentlichte RC nicht den heutigen Code abbildet, das
Standalone-Bundle keinen konsistenten eigenständigen Betriebsweg dokumentiert,
echte Upgrade-/Stable-Gates nicht hinreichend nachgewiesen sind und aktuelle
P1-Befunde offenstehen.

Audit Part 14 ist abgeschlossen. Audit Part 15 wurde nicht begonnen und
umfasst laut `AUDIT_INDEX.md` ausschließlich Sprint 25.1 und 25.2.

## Sprint-27.1-B-Re-Audit

Release-/Standalone-/App-Quellen enthalten dieselben v52-Referenzen. Der neue
Assetversions-Test und die Gesamtsuite 331/331 sind grün. RQ-04-01 ist
code-seitig geschlossen; daraus folgt keine Artefakt- oder RC-Freigabe.
