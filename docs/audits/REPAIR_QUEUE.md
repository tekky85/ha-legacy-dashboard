# Sprint-27-Reparaturwarteschlange

## Regeln

Hier werden alle umsetzbaren `PARTIAL`-, `MISSING`- und `BROKEN`-Befunde aus
den Baseline-Audits gesammelt. Manuelle oder reale Abnahmen gehören stattdessen
in [`MANUAL_TEST_QUEUE.md`](MANUAL_TEST_QUEUE.md). Reparaturen erfolgen erst
nach Review des jeweiligen Audit-Parts und erhalten anschließend einen
nachvollziehbaren Re-Audit-Eintrag.

## Konsolidierte Zusammenfassung

- Stand: 14. September 2026
- Auditabdeckung: Parts 01 bis 19 vollständig
- Nicht-PASS-Anforderungszeilen geprüft: 139
- Davon umsetzbare, auf Repairs abgebildete Findings: 121
- Rein manuelle/nicht umsetzbare Findings: 18
- Total canonical repairs: 25
- Code repairs completed: 23 (`RQ-16-01`, `RQ-04-01`, `RQ-09-01`,
  `RQ-12-01`, `RQ-12-02`, `RQ-12-03`, `RQ-13-02`, `RQ-14-01`,
  `RQ-14-02`, `RQ-14-05`, `RQ-07-01`, `RQ-08-01`, `RQ-09-02`,
  `RQ-10-01`, `RQ-11-01`, `RQ-12-04`, `RQ-15-01`, `RQ-16-02`,
  `RQ-18-01`, `RQ-14-04`, `RQ-14-03`, `RQ-08-02`, `RQ-08-03`)
- Open code repairs: 2
- P0: 0
- P1 open: 2
- P1 code-closed/manual-pending: 5
- P2 open: 0
- P2 code-closed/manual-pending: 18
- P3: 0
- RC Blocker `YES` open: 2
- RC Blocker code-closed/manual-pending: 5
- RC Blocker `CONDITIONAL` open: 0; code-closed/manual-pending: 3
- Security-sensitive repairs open: 1; code-closed/manual-pending: 10
- Repairs blocking manual tests: 2
- Repairs with dependencies: 8
- Status: **SPRINT 27.1-A BIS 27.1-I COMPLETE – MANUAL PENDING**

Der geordnete Reparaturbacklog bleibt die Grundlage für Sprint 27.1. Der
Abschluss eines automatisierten Codebatches bedeutet weder RC-ready noch, dass
eine reale iPad-/HAOS-/LXC-/Home-Assistant-Abnahme bestanden wurde.

## Offene Reparaturen

| ID | Sprint | Requirement | Ausgangsstatus | Priorität | Evidence | Vorgeschlagene Reparatur | RC-Relevanz | Re-Audit |
|---|---|---|---|---|---|---|---|---|
| – | – | Für Part 01 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 12–14 | keine | keine | N/A |
| – | – | Für Part 02 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 15–16 | keine; offene Abnahmen stehen in der manuellen Testwarteschlange | keine | N/A |
| – | – | Für Part 03 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17 und 17.1; Fokuslauf 114/114; Gesamtsuite 329/329 | keine; offene Pointer-, iPad- und LXC-Abnahmen stehen in der manuellen Testwarteschlange | keine | N/A |
| RQ-04-01 | 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 18, 19, 20, 21, 21.1, 21.2, 21.3, 21.4, 21.5, 22, 23, 24, 25, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 26, 26.1, 26.2 | Gemeinsam genutzte Legacy-Assets besaßen zwischen Dashboard, Systemseiten, Admin und Manifest unterschiedliche Cache-Buster. | PARTIAL | P1 | Ausgangsstand auf `3830259`: Dashboard v51, System v44, Admin v50 und Manifesticons v44 bei immutable Public-Assets. Sprint 27.1-B setzte sämtliche Assetreferenzen zunächst auf v52, Sprint 27.1-C gemeinsam auf v53 und Sprint 27.1-G wegen der sichtbaren Room-Presentationänderung gemeinsam auf v54. `test/asset-version.test.js` erzwingt weiterhin Gleichheit und Parität der gemeinsam genutzten Assets; Batch H bestätigt dies in der 385/385-Gesamtsuite. | **UMGESETZT.** Alle Entry Points und das Manifest verwenden aktuell v54; die Gleichheitsregression verhindert erneut routeabhängige Abweichungen. Immutable Header und Anwendungslogik bleiben unverändert. | Code-/Automationsgate erfüllt. Reale iOS-9-/HomeScreen-/Safari-Cache-, LXC- und HAOS-Abnahmen bleiben `NOT TESTED`; keine RC-Freigabe abgeleitet. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-B; bis Sprint 27.1-G gemeinsam fortgeschrieben |
| – | – | Für Part 05 wurde kein zusätzlicher umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17.4 und 17.5; Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierter Viewport-Lauf | keine; reale iPad-/Safari-Abnahmen stehen als MT-18 bis MT-20 in der manuellen Testwarteschlange. RQ-04-01 wurde später in 27.1-B geschlossen. | keine zusätzliche | N/A |
| – | – | Für Part 06 wurde kein zusätzlicher umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17.6 und 17.7; Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierte Control-Hierarchie-Messung | keine; reale iPad-/Safari-Abnahmen stehen als MT-21 bis MT-23 in der manuellen Testwarteschlange. RQ-04-01 wurde später in 27.1-B geschlossen. | keine zusätzliche | N/A |
| RQ-07-01 | 19 | Die vorgeschriebene Summary-Aktivitätsmatrix ist funktional implementiert, aber mehrere ausdrücklich verlangte Zustandsvarianten besitzen keine gezielte Regression. | PARTIAL | P2 | Sprint 27.1-E ergänzt in `test/summary.test.js` die vollständige Domain-/State-Tabelle einschließlich aller zuvor fehlenden Varianten und unbekannter Ignore-ID. `test/sprint-27-1-e.test.js` belegt die Trennung von Summary/Error-Regeln und Control Grants. Die maschinengeprüfte Traceability ordnet 70/70 Nummern lückenlos zu; Fokuslauf 178/178 und Gesamtsuite 375/375 PASS. | **UMGESETZT.** Direkte Zustands-/Ignore-/Grant-Regressionen plus dokumentiert äquivalente API-/Admin-/Legacy-/Securityevidenz. Ausschließlich lokale/synthetische Daten und localhost-Mocks. | Kein RC-Blocker. MT-24 bis MT-26 bleiben `NOT TESTED`; kein Produktdefekt und keine Security-/Writeänderung. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-E; Sprint 19 re-auditiert |
| RQ-08-01 | 20 | Die 82 nummerierten Sprint-20-Testanforderungen sind fachlich weitgehend durch breite Regressionen belegt, aber nicht vollständig als gezielte, nachvollziehbare Einzelmatrix abgesichert. | PARTIAL | P2 | Sprint 27.1-E ergänzt echten `error`-Gesamtstatus, fehlendes `last_changed`, vollständige Severity-Tie-Breaker, Security-Light/-Climate-vs.-Grant und statischen Long-Name-Schutz. 82/82 Nummern sind maschinengeprüft direkt oder äquivalent zugeordnet; Fokuslauf 178/178 und Gesamtsuite 375/375 PASS. | **UMGESETZT.** Die historische Matrix ist vollständig rückverfolgbar, ohne Error-Fachlogik, Adminpfad oder Controls zu ändern. | Kein RC-Blocker. MT-27, MT-28, MT-34 und MT-42 bleiben `NOT TESTED`; aktuelle Produktbilder wurden separat in Sprint 27.1-I geschlossen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-E; Sprint 20 re-auditiert |
| RQ-08-02 | D1 | Die Produktbild-Galerie wurde nach späteren sichtbaren Sprints nicht vollständig gepflegt und vier `.png`-Dateien enthielten tatsächlich JPEG-Daten. | BROKEN | P2 | Sprint 27.1-I nimmt 17 aktuelle Ansichten aus den unveränderten produktiven Frontenddateien über `test/capture-doc-screenshots.js` gegen einen ausschließlich lokalen Real-App-Mock mit Demo-Payloads/Fake-Credentials auf. Dashboard/Focus/Background/Sections/Room Card, Admin/Preview/Rules/Diagnostics und Summary/Errors/Automation Diagnostics sind enthalten. `docs/screenshots/README.md` dokumentiert Basiscommit, Route, Viewport und Datenschutz; alle Dateien besitzen echte PNG-Signatur und lesbare Abmessungen. README DE/EN referenzieren identische 17 Dateien, Root verlinkt das Manifest. 27.1-I-Fokus 4/4, Gesamtsuite 389/389 und Card-Matrix-Browser 1.576/1.576 PASS. | **UMGESETZT.** Reproduzierbarer `npm run docs:screenshots`-Pfad, aktueller Galerieinhalt, formatkonsistente PNGs sowie automatischer Link-/Format-/Privacy-Scan. Keine Produktions-`.env`, kein reales HA und keine sichtbaren Secrets. | Automatischer Dokumentations-/Security-Gate erfüllt. Die ausdrückliche Nutzer-/Zweitsichtprüfung bleibt MT-29 `NOT TESTED`; deshalb keine vollständige manuelle Freigabe oder RC-Ableitung. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-I; D1 und Screenshotanforderungen re-auditiert |
| RQ-08-03 | D1 | Die als technische Statusquelle verlinkte `docs/PROJECT_STATUS.md` beschrieb nicht mehr den aktuellen Schema-, Verpackungs- und Auditstand. | BROKEN | P2 | Sprint 27.1-I gleicht den Kopf und aktuellen Überblick gegen `src/config/dashboard.js` (`SCHEMA_VERSION = 12`), `AUDIT_INDEX.md` (Parts 01–19), das aktuelle App-Verzeichnis und die Releasehistorie ab. Der aktuelle Paketstand nennt Dockerfile/BuildKit und die seit Sprint 25 entfernte `build.yaml`; historische Sprintabschnitte bleiben ausdrücklich als zeitgebundene Evidenz erhalten. Der Status enthält Batches A–I und trennt sie vom unveränderten Public-Test-Tag `v1.0.0-rc.3`. 27.1-I-Fokus 4/4 und Gesamtsuite 389/389 PASS. | **UMGESETZT.** Aktuelle Schema-, Verpackungs-, Audit-, Repair- und Releaseübersicht korrigiert; historische Test-/Sprintnachweise nicht umgeschrieben. Eine Regression prüft die entscheidenden Aussagen gegen den Quellstand. | Kein eigenständiger RC-Blocker. Abhängigkeit für `RQ-17-01` erfüllt; das commit-/artefaktbezogene RC-Gate selbst bleibt 27.1-J. | CLOSED – Sprint 27.1-I; D1 und Sprints 24/25 re-auditiert |
| RQ-09-01 | 21, 21.3, 23, 24 | Ein isoliertes Backend-WebSocket-`error`-Event ohne nachfolgendes `close` verwirft zwar den Verbindungsversuch, plant aber keinen automatischen Reconnect. | PARTIAL | P2 | Ausgangsprobe auf `7fa67a8`: Request endet mit `ha_websocket_unavailable`, `reconnectAttempts=0`, eine Socketinstanz. Sprint 27.1-C bindet Events an die konkrete Socketinstanz und führt Error/Close idempotent über denselben Disconnectpfad. Der isolierte Gatewaylauf fand zusätzlich ein synchron werfendes natives `close()` nach fehlgeschlagenem Handshake; auch dieser Pfad ist nun kontrolliert. `test/sprint-21.test.js` belegt Error-only, Error+Close ohne Doppeltimer, Backoff-Limit, werfendes `close()` und explizites Client-`close()` ohne Reconnect. | **UMGESETZT.** Error-only plant genau einen begrenzten Reconnect; spätes Close oder Events alter Sockets können keinen zweiten Versuch beziehungsweise keine neue Verbindung verwerfen. Ein Socket-`close()`-Fehler beendet den Gateway-Prozess nicht. Keine Command-, Token- oder Browsergrenze geändert. | Kein RC-Blocker. MT-30/32/35/36/46/48 sind ausführbar; MT-50 bleibt nach Sprint 27.1-D nur wegen RQ-13-01 blockiert. Reale Recovery bleibt `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprints 21, 21.3, 23, 24 und 25.4 re-auditiert |
| RQ-09-02 | 21, 21.1 | Die umfangreichen 93-/77-Punkte-Spezifikationsmatrizen sind fachlich breit abgedeckt, aber nicht vollständig als gezielte, nachvollziehbare Einzelanforderungen abgesichert. | PARTIAL | P2 | Sprint 27.1-E ergänzt Registry-/Diagnose-Grenzen für unbekannte Area, sanitisierte Device-/Config-Entry-Felder und fehlertolerante Repair-Antworten. 93/93 und 77/77 Nummern sind maschinengeprüft direkt, äquivalent, manuell oder N/A zugeordnet; Matter 55–57 sind ausdrücklich capability-abhängig N/A. RQ-09-01-Recovery ist eingebunden; Fokus 178/178 und Gesamtsuite 375/375 PASS. | **UMGESETZT.** Lückenlose Traceability ohne neue HA-Abfrage oder Matter-/Registry-Writefläche; reale Layoutwirkung bleibt in MT-31/32. | Abhängigkeit RQ-09-01 erfüllt. Kein RC-Blocker. MT-30 bis MT-32 bleiben `NOT TESTED`; aktuelle Bilder bleiben separat `RQ-08-02`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-E; Sprints 21/21.1 re-auditiert |
| RQ-10-01 | 21.2, 21.3 | Die nummerierten 92-/96-Punkte-Spezifikationsmatrizen sind fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | Sprint 27.1-E ergänzt den direkten Label-Lifecycle für First Failure und Rename bei stabiler ID. 92/92 und 96/96 Nummern sind maschinengeprüft zugeordnet; exakte Filter, Same-Child-AND, child-first Groups, Storage/Viewport, Risk/Cover/Mode, Recovery und Security verweisen auf konkrete aktuelle Tests. Fokus 178/178 und Gesamtsuite 375/375 PASS. | **UMGESETZT.** Browser-/iPad-Punkte sind ausdrücklich MT-33 bis MT-36 zugeordnet; alle übrigen Fälle besitzen direkte oder dokumentiert äquivalente Automatisierung. | Kein RC-Blocker. MT-33 bis MT-36 bleiben `NOT TESTED`; die separate Screenshotlücke wurde in Sprint 27.1-I geschlossen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-E; Sprints 21.2/21.3 re-auditiert |
| RQ-11-01 | 21.4, 21.5 | Die nummerierten 75-/73-Punkte-Spezifikationsmatrizen waren fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | Sprint 27.1-F ordnet 75/75 und 73/73 Anforderungen in `test/fixtures/sprint-27-1-f-traceability.js` maschinengeprüft direkter, dokumentiert äquivalenter oder manueller Evidenz zu. Entity Rules, Health, Return Targets, Same-Window, Legacy- und Securitygrenzen verweisen auf konkrete aktuelle Tests; reale Punkte bleiben MT-37 bis MT-42. | **UMGESETZT.** Vollständige Traceability ohne Produktcode-, HA-Aufruf- oder Write-Änderung; ausschließlich lokale/synthetische Daten und Localhost-Mocks. | Kein RC-Blocker. MT-37 bis MT-42 bleiben `NOT TESTED`; kein manueller Befund wurde zu `PASS` hochgestuft. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-F; Sprints 21.4/21.5 re-auditiert |
| RQ-12-01 | 22 | `ruleSource` bezeichnet bei gemischten Domain-/Risk-Regeln nicht zuverlässig die tatsächlich wirksame Feldquelle. | BROKEN | P2 | Ausgangsprobe auf `7fa67a8`: Domain setzt `expectedOffline=true`, gemeldet wird `risk_class`. Sprint 27.1-C führt `ruleSources` pro Feld und wählt in der Evaluation die Quelle von Expected Offline, zustandsspezifischer Grace, Flapping oder Recovery. Der Mischtest deckt Domain/Risk/Device/Entity/Security/Critical Detection ab. | **UMGESETZT.** Öffentliches `ruleSource` erklärt das im aktuellen Pfad wirksame Feld; die bestehende Wert- und Security-Priorität wurde nicht verändert. | Kein RC-Blocker. MT-43 bis MT-45 sind ausführbar und bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 22 re-auditiert |
| RQ-12-02 | 23 | Rein dynamische/nicht auflösbare Automationreferenzen erhalten keinen produktiven Impact mit Confidence `unknown`. | MISSING | P2 | Ausgangsprobe auf `7fa67a8`: `dynamicCount=1`, aber kein produktiver Unknown-Kontext. Sprint 27.1-C liefert in `automationAnalysis.unknownImpacts` maximal 50 sanitizierte Automationen und rendert sie global in Advanced Diagnostics mit Confidence `unknown` und dem Hinweis „keinem konkreten Problem zugeordnet“. Backend-/Frontendtests belegen Begrenzung, Sanitization und Kausalitätsfreiheit. | **UMGESETZT.** Dynamische Unsicherheit ist sichtbar, wird aber ohne statischen Nachweis keinem konkreten Issue als Ursache/Impact zugeordnet. Keine Raw Config/Trace und kein zusätzlicher HA-Aufruf. | Kein RC-Blocker. MT-46 bis MT-49 sind ausführbar, bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 23 re-auditiert |
| RQ-12-03 | 23 | Der Reference-Cache liefert für Automation Impact bis zum TTL veralteten Automation-State/Disabled-Kontext und `lastTriggered`. | BROKEN | P2 | Ausgangsprobe auf `7fa67a8`: Public Inventory `off`/neuer Name, Impactindex `on`/alter Name/alte Triggerzeit. Sprint 27.1-C baut bei Cache-Hit und Inflight-Rückgabe den Index aus frischem Inventory plus gecachten Referenzen neu. Regression deckt `on→off→on`, Name und `lastTriggered` innerhalb 60 s ab. | **UMGESETZT.** Statische Referenzen behalten ihren TTL; State-, Availability-/Disabled-, Name- und Triggerkontext folgen jedem aktuellen Snapshot atomar. | Kein RC-Blocker. MT-46 bis MT-49 sind ausführbar, bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 23 re-auditiert |
| RQ-12-04 | 22, 23 | Die nummerierten 80-/84-Punkte-Spezifikationsmatrizen waren fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | Sprint 27.1-F ordnet 80/80 und 84/84 Anforderungen lückenlos zu. Die Regressionen für `RQ-09-01` und `RQ-12-01/-02/-03` sind ausdrücklich eingebunden; Grace/Flapping/Recovery, Impact, Trace-Sanitization, Cachefrische, Legacy und Security verweisen auf aktuelle Tests. Reale Punkte bleiben MT-43 bis MT-49. | **UMGESETZT.** Vollständige Rule-/Automation-Traceability mit maschineller Nummern-, Evidenz- und Manual-Statusprüfung; keine Produktions-HA-Verbindung und keine Produktlogikänderung. | Kein RC-Blocker. MT-43 bis MT-49 bleiben `NOT TESTED`; die früheren fachlichen Abhängigkeiten sind code-seitig geschlossen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-F; Sprints 22/23 re-auditiert |
| RQ-13-01 | 24, 25 | Die konfigurierte App-Version und das veröffentlichte GHCR-Image bilden nicht den aktuell auditierten Repositorycode ab. | BROKEN | P1 | Ausgangsstand `a5d433c`: aktive Version `1.0.0-rc.3` ist korrekt und unveränderlich an `771683b` gebunden, während spätere release-relevante Reparaturen auf HEAD liegen; der reine Stringcheck blieb trotzdem grün. Sprint 27.1-J ergänzt `release/check-release-source.js`: Wiederverwendung von RC.3, falsche Tag-/HEAD-Identität, nicht monotone Folgetags und app-/release-relevante Änderungen ohne neue Version werden kontrolliert abgewiesen. Der Workflow verweigert zusätzlich bereits vorhandene GitHub-Releases und GHCR-Manifeste vor dem ersten Image-Push. Fokuslauf und negative Git-Fixtures sind grün. | **AUTOMATABLE UMGESETZT.** Source-/Tag-/Versions- und Immutable-Target-Gate sowie aktualisierter Releaseablauf sind vorhanden. Die nächste freie Version ist RC.4; sie wird absichtlich erst in einem eigenen, vollständig reviewten Releasecommit aktiv gesetzt und veröffentlicht, damit die derzeit installierbare RC.3-App nicht vorzeitig auf ein noch fehlendes Image zeigt. | Direkter RC-Blocker bleibt bis zum ausdrücklich separaten RC.4-Releaseworkflow: erst dessen Tag, Multi-Arch-Manifest, Bundle, Checksummen und generierter Kandidatennachweis schließen die Distributionsseite. Keine bestehende Version wurde überschrieben. | CODE CLOSED / RELEASE EVIDENCE PENDING – Sprint 27.1-J; Sprints 24/25/25.4 re-auditiert |
| RQ-13-02 | 24 | Der dokumentierte lokale Supervisor-App-Build verwendete wegen der mitkopierten `image:`-Angabe nicht zuverlässig die vorbereiteten lokalen Quellen. | BROKEN | P2 | Ausgangsstand `c20f7b7`: vorbereiteter Kontext enthielt weiterhin das GHCR-Image. Sprint 27.1-D entfernt `image:` ausschließlich aus der erzeugten Development-Kopie; die getrackte Produktions-`config.yaml` behält das generische Image und minimale `homeassistant_api`-Berechtigung. Test vergleicht kopierten `src/server.js`, beide Metadatensätze und verbotene Rechte. | **UMGESETZT.** Lokaler Supervisor-Kontext baut die kopierten Quellen; Produktionsmetadaten bleiben unverändert registrybasiert. Dokumentation trennt beide Wege ausdrücklich. | Code-/Automationsgate erfüllt. Aktuelle reale HAOS-Source-/Image-Abnahme bleibt wegen `RQ-13-01` blockiert und `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-D; Sprint 24 re-auditiert |
| RQ-14-01 | 25 | Das Standalone-Releasebundle enthielt keine in sich verwendbare Installations-, Upgrade- und Rollbackdokumentation. | BROKEN | P1 | Ausgangsstand `c20f7b7`: Repository-README/-Deployment verwiesen im Tar auf fehlende Dateien und Git-Skripte. Sprint 27.1-D mappt bundle-spezifische README-/INSTALL-Dateien in das Archiv. Sie verwenden ausschließlich enthaltene Runtime/Unit/Lockfile-Dateien, versionierte Verzeichnisse und getrennten persistenten Zustand. Ein Tar-Test löst jeden lokalen Markdown-Link auf und verbietet Git-Deployskriptreferenzen. | **UMGESETZT.** Fresh Install, N→N+1, Backup und Rollback sind deutsch/englisch aus dem Archiv ausführbar; das Git-Checkout-Modell bleibt separat dokumentiert. | Automatisches Artefaktgate erfüllt. Reale isolierte LXC-Abnahme bleibt MT-56 `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-D; Sprints 25/25.4 re-auditiert |
| RQ-14-02 | 25 | Die automatisierten Standalone-/App-Upgradeprüfungen führten keinen echten Versionswechsel oder Rollback aus. | PARTIAL | P1 | Ausgangsstand `c20f7b7`: dieselbe aktuelle Config-Implementierung wurde zweimal geladen. Sprint 27.1-D startet eine eingefrorene Release-0.9-/Schema-4-Fixture als separaten Prozess, baut/entpackt den aktuellen Tarball, startet dessen Dashboard-Persistenz in einem zweiten Prozess mit gemeinsamem Standalone- beziehungsweise App-Datenpfad und prüft Migration, Dashboards, Regeln, Critical/Label, Admin-Konfiguration, Background, Backup und Wiederherstellung mit der alten Fixture. | **UMGESETZT.** Reproduzierbarer N→N+1-Prozesswechsel und Rollback sind automatisiert. Theme bleibt korrekt als browserlokaler Zustand getrennt. | Automatisches Gate erfüllt. Reales HAOS-`/data`-Update/Restore bleibt MT-52, reales Bundle/LXC MT-56; beide `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-D; Sprints 25/25.4 re-auditiert |
| RQ-14-03 | 25 | Die 60 nummerierten Release-Testanforderungen waren nicht vollständig als direkte, commitbezogene Nachweismatrix abgesichert. | PARTIAL | P2 | Ausgangsstand `a70cc96`: zehn breite Sprint-25-Tests ohne maschinenlesbare Einzelzuordnung. Sprint 27.1-H führt `release/sprint-25-test-matrix.json` mit exakt 60 eindeutigen Fällen und `docs/RELEASE_TEST_MATRIX.md` ein. `test/sprint-27-1-h.test.js` gleicht Nummern gegen die Spezifikation ab und verlangt für jede Nummer einen existierenden Test-/Workflowmarker oder einen vollständigen versions-/commit-/artefaktbezogenen MT-Eintrag. RQ-14-01/-02 und das neue RQ-14-04-Gate sind direkt eingebunden. | **UMGESETZT.** Alle 60 Fälle sind einzeln als `direct`, `workflow` oder `manual` nachvollziehbar; Mapping bedeutet ausdrücklich nicht, dass reale Resultate bestanden sind. | Traceability-Gate erfüllt. `RQ-13-01` und reale MT-55 bis MT-57 bleiben für den nächsten Kandidaten/Stable-Lauf offen beziehungsweise `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-H; Sprint 25 re-auditiert |
| RQ-14-04 | 25, 25.1, 25.2, 25.3 | Ein Stable-Tag konnte technisch veröffentlicht werden, ohne dass die dokumentierten iPad-/HAOS-Gates und bekannten P1-Blocker für genau diesen Commit freigegeben wurden. | PARTIAL | P1 | Ausgangsstand `a70cc96`: kein Environment-, Approval-, Repair- oder Manual-Result-Gate vor den Image-Pushes. Sprint 27.1-H ergänzt vor `build-images` getrennte RC-/Stable-Gates. Stable benötigt das GitHub-Environment `stable-release`, eine versionierte Freigabe mit unveränderlichen RC-Commit-/Image-/Bundle-Digests, `PASS` für alle 13 Pflicht-Manuelltests und eine leere offene P0/P1-Menge aus der kanonischen Queue. Ein commitgebundenes `stable-gate-result.json` wird erzeugt und dem Stable-Release beigefügt. Negative Tests blockieren fehlendes Approval, P0, P1, fehlende Manuellabnahme, falsche Version, Digest und Evidenz. | **UMGESETZT.** Stable stoppt vor jedem Image-Push; RCs bleiben als getrennte Prereleases ohne Stable-Approval möglich und verändern weiterhin kein `latest`. Das Environment muss in GitHub mit Required Reviewers/Self-Review-Schutz administrativ konfiguriert und in MT-57 real bestätigt werden. | Code-Gate geschlossen, Stable bleibt bis zu RQ-13-01/RQ-17-01, allen Pflichtresultaten und MT-57 ausdrücklich blockiert. Kein Release/Tag/Image wurde erzeugt. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-H; Sprints 25/25.1–25.4 re-auditiert |
| RQ-14-05 | 25 | Der Produktionsabhängigkeits-Audit meldete zwei moderate DoS-Advisories in `qs@6.15.3`. | PARTIAL | P2 | Ausgangsstand `c20f7b7`: GHSA-x5fp-wj9c-mxmx und GHSA-4mjr-xmp4-gh2g. Sprint 27.1-D aktualisiert ausschließlich die kompatible indirekte Abhängigkeit auf `qs@6.16.0`; Express bleibt 5.2.1. `npm audit --omit=dev --audit-level=moderate` meldet null Befunde. Lock-/Parser-/Prototype-Regressionscheck und bestehendes 16-kB-Requestlimit sind grün. CI/Release und Policy blockieren künftig Moderate oder höher ohne versionierte Ausnahme. | **UMGESETZT.** Kein Major-Upgrade, keine Laufzeit- oder Requestgrenze gelockert; null bekannte Produktionsadvisories. | Dependency-/Security-Gate erfüllt; nächste veröffentlichte Kandidatenpipeline bleibt wegen anderer Findings ausstehend. | CODE CLOSED – Sprint 27.1-D; Sprints 25/25.4 re-auditiert |
| RQ-15-01 | 25.1, 25.2 | Die nummerierten 74-/51-Punkte-Release-Gate-Matrizen waren fachlich breit, aber nicht vollständig als direkte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | Sprint 27.1-F ordnet 74/74 und 51/51 Anforderungen Theme-, Exact-Filter-, Same-Child-, Same-Window-, Return-Target-, Assetversions-, Legacy- und Securitytests oder MT-13/34/40–42 zu. `test/sprint-27-1-f.test.js` prüft Nummern und Evidenzmarker. | **UMGESETZT.** Vollständige Release-Gate-Traceability einschließlich `RQ-04-01`-Assetregression; keine Navigation-, Theme-, Filter- oder Runtimeänderung. | Kein RC-Blocker. Die commitbezogene reale HomeScreen-/Safari-Abnahme bleibt MT-13/34/40–42 `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-F; Sprints 25.1/25.2 re-auditiert |
| RQ-16-01 | 25.3, 25.5, 26.1 | Der PNG-Validator akzeptierte strukturell ungültige oder manipulierte PNG-Dateien; beim Ersatz konnte dadurch das letzte gültige Background-Asset verloren gehen. | BROKEN | P1 | Ausgangsdefekt auf `dec0c54` reproduziert: PNG ohne `IDAT` und mit manipulierter CRC wurden akzeptiert. Sprint 27.1-A ergänzt in `src/services/dashboard-backgrounds.js` CRC32 je Chunk, gültige IHDR-Felder, strikte bekannte Critical-Chunk-Reihenfolge, zusammenhängende IDATs und sauberes IEND/EOF. `test/fixtures/png-samples.js`, `test/sprint-25-3.test.js` und `test/admin-api.test.js` regressieren fehlendes IDAT, CRC-Tamper, Truncation, trailing data, unknown critical, duplicate IHDR sowie Dashboard-/Room-Last-valid-Replace. Fokus 85/85 und Gesamtsuite 330/330 PASS. | **UMGESETZT.** Gemeinsamer begrenzter PNG-Parser gehärtet; keine Validierung abgeschaltet, kein Room-Sonderpfad. Ungültige Uploads werden vor dem Store abgewiesen, Altconfig/Altasset bleiben allein erhalten. | Code-/Automationsgate erfüllt. Reale iPad-/LXC-/HAOS-Background-, Restart- und `/data`-Abnahmen bleiben `NOT TESTED`; keine RC-Freigabe abgeleitet. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-A; Audits 25.3/25.4/25.5/26.1 re-auditiert |
| RQ-16-02 | 25.3 | Die 84 nummerierten Sprint-25.3-Testanforderungen waren fachlich breit, aber nicht vollständig als direkte Einzelmatrix rückverfolgbar. | PARTIAL | P2 | Sprint 27.1-F ordnet 84/84 Anforderungen sicheren Upload-/Asset-, Admin-, Persistenz-, Preview-/Runtime-, Layout-, Theme-, Focus-, Navigation-, Standalone-/App- und Legacytests oder MT-51/52/54/58–62 zu. Die in 27.1-A ergänzten PNG-Struktur-/CRC- und Last-valid-Replacement-Regressionsfälle aus `RQ-16-01` sind Bestandteil der Evidenz. | **UMGESETZT.** Vollständige Background-/Upload-Traceability mit maschineller Evidenzprüfung; kein zweiter Uploadpfad und keine Produktänderung. | Kein RC-Blocker. Reale `/data`-, LXC-, iPad-, Viewport- und Uploadabnahmen bleiben MT-51/52/54/58–62 `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-F; Sprint 25.3 re-auditiert |
| RQ-17-01 | 25.4 | Die lebende RC-Checkliste ist kein commit- und artefaktkohärenter Nachweis mehr und enthält veraltete beziehungsweise aktuell falsche PASS-Aussagen. | BROKEN | P1 | Ausgangsstand `a5d433c`: RC.1/741bba4, späterer LXC-Stand und 275/283/290 Tests standen in einer gemeinsamen lebenden Matrix; Dockerfile- und Dependency-Aussagen waren zeitlich vermischt. Sprint 27.1-J begrenzt RC.1 auf seine unveränderliche Taghistorie, weist RC.2/RC.3 getrennt aus und bewertet den heutigen Nicht-Kandidaten ehrlich als `BLOCKED`. `release/create-rc-result.js` erzeugt erst nach Source-, Test-, Manifest-, Smoke- und Checksum-Gate ein JSON-/Markdown-Paar mit genau einem Sourcecommit, Tag, Image-/Manifestdigest, Bundlechecksum und Workflowlauf; LXC, HAOS und iPad starten immer `NOT TESTED`. Der Workflow hängt beide Nachweise an genau den erzeugten Release. | **AUTOMATABLE UMGESETZT.** Keine gemischten PASS-Aussagen mehr; tatsächlicher Pfad `ha_legacy_dashboard/Dockerfile`, aktueller Moderate-Audit pro Kandidatenworkflow, gültige Statusmenge und explizite `RC BLOCKERS`. Generatorvalidierung weist falsche Version, Commit-/Tagidentität und Digests kontrolliert ab. | Das Evidenzformat ist code-seitig geschlossen. Kandidatenbezogene Werte und reale Ergebnisse dürfen erst vom separaten RC.4-Workflow beziehungsweise MT-50 bis MT-57/61–66 stammen; bis dahin bleibt die RC-Empfehlung `BLOCKED`. | CODE CLOSED / CANDIDATE EVIDENCE PENDING – Sprint 27.1-J; Sprint 25.4 re-auditiert |
| RQ-18-01 | 25.6, 26.1, 26.2 | Card-Matrix-Inventar, Dokumentation und ausführbarer Browser-Harness bildeten die aktuelle Renderer-/Capability-Oberfläche nicht vollständig und fehlerfrei ab. | BROKEN | P2 | Ausgangsstand `50d481e`: Room fehlte in Dokument/Hauptmatrix, Climate erwartete pauschal drei Controls, und der Node-Test führte keinen Browser aus. Sprint 27.1-G synchronisiert exakt fünf produktive Renderer, 316 gültige Größenkombinationen und 1.576 Zustandsfälle. 448 Room-Fälle enthalten alle 64 Größen, fünf Tiers, sieben Collapsed-/Expanded-/Background-/Capabilityvarianten. Control-Anzahlen stammen je Zustand aus Gateway-Capabilities. Der erste echte Browserlauf deckte zusätzlich einen realen einzeiligen Room-Clippingfehler auf; die Presentation priorisiert nun Compact/Standard/Wide korrekt, Expanded-Inhalt bleibt scrollbar. Finale Chrome-for-Testing-Ausführung: 1.576/1.576, 0 Befunde. | **UMGESETZT.** `npm run test:card-matrix-browser` ist verpflichtendes Test-/Release-CI-Gate; Dokument, Fixture, produktive Registry und capabilityabhängige Erwartungen sind regressiert. Gemeinsame sichtbare Assets konsistent auf v54. | Automatisches visuelles Gate erfüllt. MT-63/69/72 und weitere physische iPad-/HAOS-Prüfungen bleiben `NOT TESTED`; keine RC-/Realgerätefreigabe abgeleitet. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-G; Sprints 25.6/26.1/26.2 re-auditiert |

## Kanonische Ausführungsmetadaten

Die bestehende Finding-Tabelle bleibt die historische Quelle für Status,
Evidence und vorgeschlagene Reparatur. Diese Matrix ergänzt die für Sprint
27.1 verbindlichen Ausführungsfelder. `–` bedeutet keine Reparaturabhängigkeit;
die vollständige Anwendungssuite und die Security-Baseline bleiben trotzdem
für jeden Batch Pflicht.

| ID | Betroffene Komponenten | RC Blocker | Security Sensitive | Depends On | Blocks | Manual Tests Affected | Audit Files To Re-Audit | Repair Batch |
|---|---|---|---|---|---|---|---|---|
| RQ-04-01 | Public HTML, gemeinsame Wall-CSS/JS, Static-Cache-Header, Admin-Preview | YES | NO | – | Codepfad geschlossen; verbindliche Legacy-Abnahme bleibt | MT-01/02/05/06/09/11–16/18–25/28/32–34/39–42/45/48/54/58/63–69/71/72 | Sprint 17.2–17.7, 18–26.2 soweit im Finding genannt – re-auditiert | 27.1-B COMPLETE |
| RQ-07-01 | Summary Engine und tabellengetriebene Tests | NO | NO | – | belastbarer Sprint-19-Re-Audit | MT-24–26 | Sprint 19 | 27.1-E COMPLETE |
| RQ-08-01 | Issue Engine, Adminregeln, Error UI/API und Tests | NO | NO | – | belastbarer Sprint-20-Re-Audit | MT-27/28/34/42 | Sprint 20 | 27.1-E COMPLETE |
| RQ-08-02 | README-Galerie, echte Screenshots, Dateiformate/Datenschutz | CLOSED – Nutzer-/Zweitsicht ausstehend | YES | RQ-09-01, RQ-12-01/02/03 und RQ-18-01 erfüllt | automatischer Dokumentationsstand erfüllt | MT-29 | D1 sowie Screenshot-Findings in Sprint 21–23, 25.1, 26/26.1 – re-auditiert | 27.1-I COMPLETE |
| RQ-08-03 | PROJECT_STATUS, Roadmap-/Auditstatus, Verpackungsstruktur | CLOSED | NO | fachliche Batches A–I berücksichtigt | RQ-17-01-Abhängigkeit erfüllt | keine; Dokumentabgleich | D1, Sprint 24/25 – re-auditiert | 27.1-I COMPLETE |
| RQ-09-01 | Backend-HA-WebSocket-Lifecycle/Reconnect | NO | YES | – | RQ-09-02, RQ-12-04; reale Registry-/Automation-/HAOS-Recovery | MT-30/32/35/36/46/48/50 | Sprint 21, 21.3, 23, 24, 25.4 | 27.1-C COMPLETE |
| RQ-09-02 | Registry/Device/Area/Repair/Matter-Testmatrix | NO | NO | RQ-09-01 | Sprint-21/21.1-Re-Audit | MT-30–32 | Sprint 21/21.1 | 27.1-E COMPLETE |
| RQ-10-01 | Summary/Error-Filter, Spalten, Kritikalitätsmodi und Tests | NO | NO | – | Sprint-21.2/21.3-Re-Audit | MT-33–36 | Sprint 21.2/21.3 | 27.1-E COMPLETE |
| RQ-11-01 | Entity Rule Manager, Health/Return und Tests | NO | NO | – | belastbarer Sprint-21.4/21.5-Re-Audit | MT-37–42 | Sprint 21.4/21.5 | 27.1-F COMPLETE |
| RQ-12-01 | Rule Engine `ruleSource`/Erklärbarkeit | NO | NO | – | RQ-12-04; reale Regelabnahme | MT-43–45 | Sprint 22 | 27.1-C COMPLETE |
| RQ-12-02 | Automation Impact, Dynamic-/Unknown-Kontext, Sanitizer/UI | NO | YES | – | RQ-12-04; reale Automation-Abnahme | MT-46–49 | Sprint 23 | 27.1-C COMPLETE |
| RQ-12-03 | Automation-Reference-Cache und frisches Inventory-Merge | NO | YES | – | RQ-12-04; reale Automation-Abnahme | MT-46–49 | Sprint 23 | 27.1-C COMPLETE |
| RQ-12-04 | Sprint-22-/23-Testmatrix | NO | NO | RQ-09-01, RQ-12-01/02/03 erfüllt | belastbarer Regel-/Automation-Re-Audit | MT-43–49 | Sprint 22/23 | 27.1-F COMPLETE |
| RQ-13-01 | Versionen, Tag/Commit, GHCR, App-Image, Release Notes | YES – bis RC.4-Publish | YES | RQ-14-04; RQ-18-01 erfüllt | RC.4-Releaseworkflow; aktuelle HAOS-/Release-Abnahme | MT-50–55/57/61/62/64–66/70 | Sprint 24, 25, 25.4 – re-auditiert | 27.1-J CODE CLOSED / RELEASE PENDING |
| RQ-13-02 | Supervisor-Dev-Kontext, App-Metadaten `image`, Build-Dokumentation | CLOSED | YES | – | RQ-13-01; lokale HAOS-Validierung | MT-50–54/61/62/70 | Sprint 24 | 27.1-D COMPLETE |
| RQ-14-01 | Standalone-Bundle und enthaltene Install-/Upgrade-/Rollbackdocs | CLOSED | YES | – | RQ-14-03, RQ-13-01, RQ-17-01 | MT-55/56 | Sprint 25/25.4 | 27.1-D COMPLETE |
| RQ-14-02 | Cross-Version-Upgrade-/Rollbackfixtures und Datenintegrität | CLOSED | YES | RQ-14-01 erfüllt | RQ-14-03, RQ-13-01, RQ-17-01 | MT-52/56 | Sprint 25/25.4 | 27.1-D COMPLETE |
| RQ-14-03 | vollständige commitbezogene Release-Testmatrix | CLOSED – Kandidaten-/Manuellevidenz ausstehend | NO | RQ-14-04 erfüllt; RQ-13-01 für neuen Kandidaten offen | Release-Re-Audit mechanisch erfüllt | MT-55–57 | Sprint 25 – re-auditiert | 27.1-H COMPLETE |
| RQ-14-04 | technisch erzwungenes Stable-Approval-/Blocker-Gate | CLOSED – Environment-/Stable-Promotion manuell ausstehend | YES | – | RQ-13-01, RQ-17-01 und MT-57; Stable technisch blockiert | MT-57 | Sprint 25/25.1–25.4 – re-auditiert | 27.1-H COMPLETE |
| RQ-14-05 | Produktionsdependency `qs`, Risikobewertung/Update | CLOSED | YES | – | RQ-13-01 und nächster Kandidat | MT-55/57 | Sprint 25/25.4 | 27.1-D COMPLETE |
| RQ-15-01 | Theme-/Exact-Filter-/HomeScreen-Testmatrix | NO | NO | – | belastbarer Sprint-25.1/25.2-Re-Audit | MT-13/34/40–42 | Sprint 25.1/25.2 | 27.1-F COMPLETE |
| RQ-16-01 | PNG-Parser, atomarer Background-Replace, Dashboard/Room Upload | YES | YES | – | Codepfad geschlossen; reale Background-Abnahmen bleiben | MT-51/54/58–62/69/70 | Sprint 25.3/25.4/25.5/26.1 – re-auditiert | 27.1-A COMPLETE |
| RQ-16-02 | vollständige Background-/Upload-Testmatrix | NO | NO | RQ-16-01 erfüllt | belastbarer Sprint-25.3-Re-Audit | MT-51/52/54/58–62 | Sprint 25.3 | 27.1-F COMPLETE |
| RQ-17-01 | commit-/artefaktkohärente RC-Checkliste und Blockerableitung | YES – bis Kandidatennachweis | NO | RQ-08-03 und RQ-14-04 erfüllt; RQ-13-01-Codegate erfüllt | RC.4-Kandidatennachweis; finaler RC-Gate-Lauf | MT-50–57/61–66 | Sprint 25.4 – re-auditiert | 27.1-J CODE CLOSED / EVIDENCE PENDING |
| RQ-18-01 | Card-/Room-Matrix, Capability-Erwartungen, Browser-CI-Gate | CLOSED – manuelle Zielgeräteabnahme ausstehend | NO | – | RQ-08-02/RQ-13-01-Voraussetzung erfüllt; visuelles Automatengate grün | MT-63/69/72 | Sprint 25.6/26.1/26.2 – re-auditiert | 27.1-G COMPLETE |

## Prioritätsbegründung

- **P0: 0.** Die Baseline fand keine Tokenoffenlegung, keinen generischen
  Serviceproxy, keine unsichere Control-Autorisierung und keinen derzeit nicht
  startfähigen Runtimepfad.
- **P1 evidenzseitig offen: 2.** RQ-13-01 und RQ-17-01 sind seit Sprint
  27.1-J code-seitig geschlossen. Sie bleiben bis zum separat autorisierten
  RC.4-Releaseworkflow und dessen commit-/artefaktgebundenem Nachweis als
  Releaseblocker offen. Alle übrigen P1-Repairs sind code-seitig geschlossen
  und bleiben bis zu den zugeordneten Realtests als `MANUAL PENDING` sichtbar.
- **P2 offen: 0.** RQ-08-02 und RQ-08-03 sind seit Sprint 27.1-I
  code-/dokumentationsseitig geschlossen; MT-29 bleibt als ausdrückliche
  Nutzer-/Zweitsichtprüfung `NOT TESTED`.
- **P3: 0.** Kein kanonischer Befund ist lediglich optionale Politur; eine
  spätere Zurückstellung einzelner P2 bleibt nach dokumentierter Risikoannahme
  möglich.

## Security-sensitive Repairs

`Security Sensitive: YES` bezeichnet Änderungen, die direkt an einer
Credential-, HA-Transport-, Sanitizing-, App-Permission-, Releaseartefakt-,
Update-/Datenintegritäts-, Dependency- oder Uploadgrenze liegen:

- RQ-08-02, RQ-09-01, RQ-12-02, RQ-12-03;
- RQ-13-01, RQ-13-02;
- RQ-14-01, RQ-14-02, RQ-14-04, RQ-14-05;
- RQ-16-01.

Für diese Reparaturen sind zusätzlich zu den fachlichen Acceptance Criteria
Token-/Log-/Payload-Redaktion, feste read-only WebSocket-/Registrybefehle,
fehlender generischer Serviceproxy, unveränderte explizite Write-Grants,
Traversal-/DATA_DIR-Schutz beziehungsweise secretfreie Artefakte – je nach
betroffener Fläche – gezielt zu regressieren.

## Zusätzliche Evidenz aus Audit Part 17

- `RQ-04-01` betrifft Sprint 25.4 direkt: Ein RC-Gate mit Dashboard v51,
  System v44 und Admin v50 kann den realen Legacy-Cachezustand nicht als
  konsistent bewerten.
- `RQ-08-03` betrifft die 25.4-Dokumentationspflicht: Der aktuelle
  `PROJECT_STATUS.md`-Kopf nennt weiterhin Schema 11 und einen veralteten
  Auditstand.
- `RQ-09-01` betrifft HA-Restart/Recovery: Der isolierte WebSocket-Error-only-
  Pfad plant weiterhin keinen selbständigen Reconnect.
- `RQ-13-01` betrifft das zentrale 25.4-Image-Gate: RC.1/GHCR zeigen auf
  `741bba4`, während HEAD `593ba5a` ist und 36 Laufzeit-/Packagingdateien
  abweichen.
- `RQ-14-01` und `RQ-14-02` betreffen Standalone-Install/Upgrade/Rollback;
  `RQ-14-04` das commitbezogene Stable-Gate.
- `RQ-14-05` widerspricht der aktuellen Checklisten-Aussage „0
  Schwachstellen“: Der Part-17-Audit meldet eine moderate `qs`-Schwachstelle
  mit zwei Advisories.
- `RQ-16-01` widerspricht dem Upload-PASS der RC-Checkliste: PNG ohne `IDAT`
  beziehungsweise mit falscher CRC wird akzeptiert und kann beim Replace das
  letzte gültige Bild verdrängen.

## Zusätzliche Evidenz aus Audit Part 18

- `RQ-04-01` betrifft den realen Sprint-25.7-Kioskpfad besonders: Die
  HomeScreen-Web-App auf iOS 9 kann routeabhängig `v=51`, `v=44` und `v=50`
  aus einem als immutable ausgelieferten Cache mischen. Das gefährdet genau die
  nachträglich gehärteten Theme-, Navigation-, Return-, Presentation- und
  Controlpfade. Die Priorität P1 bleibt unverändert.
- `RQ-16-01` verletzt neben Sprint 25.3 auch die Sprint-25.5-Vorgabe, beim
  JPEG-Fix die bestehende Upload-/PNG-Sicherheit zu erhalten. Die JPEG-
  Regression selbst ist behoben; der kontrollierte Part-18-Probecheck nahm das
  45-Byte-PNG ohne IDAT erneut an.
- `RQ-18-01` ist der einzige neue Part-18-Reparatureintrag. Er trennt die
  korrekte capabilityabhängige Produktlogik aus Sprint 26.2 von einem
  veralteten, dadurch rot meldenden Sprint-25.6-Browser-Harness und erfasst
  zusätzlich die fehlende aktuelle Room-Gesamtmatrix.

## Abgeschlossene Reparaturen

- `RQ-09-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-C):
  idempotenter Socket-gebundener Error-/Close-Pfad mit genau einem begrenzten
  Reconnect; Error-only, Error+Close, Backoff-Limit, synchron werfendes
  Socket-`close()` und explizites Client-`close()` sind regressiert. Reale
  Standalone-/Label-/Automation-/HAOS-Recovery bleibt `NOT TESTED`.
- `RQ-12-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-C):
  Herkunft wird pro effektivem Regelfeld geführt und passend zu Expected
  Offline, Grace, Flapping oder Recovery veröffentlicht; Priorität unverändert.
- `RQ-12-02` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-C):
  begrenzter sanitizierter globaler Unknown-Kontext für dynamische Automationen,
  ausdrücklich ohne Zuordnung zu einem konkreten Issue.
- `RQ-12-03` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-C):
  Reference-Indizes werden aus aktuellem Inventory und gecachten Referenzen
  neu gebaut; State, Name und `lastTriggered` bleiben innerhalb des TTL frisch.
- `RQ-04-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-B):
  Dashboard, System, Admin und Manifest ursprünglich auf v52 vereinheitlicht,
  für die sichtbare Sprint-27.1-C-Diagnoseänderung konsistent auf v53 erhöht und durch
  `test/asset-version.test.js` geschützt; Fokus 46/46 in Batch B und
  Gesamtsuite 336/336 in Batch C.
  Verknüpfte reale Cache-/HomeScreen-/LXC-/HAOS-Tests bleiben `NOT TESTED`.
- `RQ-16-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-A):
  zentraler PNG-Parser und Dashboard-/Room-Replace-Regressionspfad repariert;
  Fokus 85/85, Gesamtsuite 330/330. Die verknüpften Realtests bleiben
  `NOT TESTED` und entscheiden später über die Betriebs-/Geräteabnahme.
- `RQ-11-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-F):
  148/148 Anforderungen aus Sprint 21.4/21.5 sind maschinengeprüft direkter,
  äquivalenter oder manueller Evidenz zugeordnet; MT-37 bis MT-42 bleiben
  `NOT TESTED`.
- `RQ-12-04` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-F):
  164/164 Anforderungen aus Sprint 22/23 sind einschließlich der Reparaturen
  `RQ-09-01` und `RQ-12-01/-02/-03` vollständig rückverfolgbar; MT-43 bis
  MT-49 bleiben `NOT TESTED`.
- `RQ-15-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-F):
  125/125 Anforderungen aus Sprint 25.1/25.2 besitzen belastbare Theme-,
  Filter-, Navigation-, Legacy- oder Manual-Evidenz; MT-13/34/40–42 bleiben
  `NOT TESTED`.
- `RQ-16-02` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-F):
  84/84 Anforderungen aus Sprint 25.3 sind einschließlich der gehärteten PNG-
  und Last-valid-Replacement-Pfade lückenlos zugeordnet; MT-51/52/54/58–62
  bleiben `NOT TESTED`.
- `RQ-18-01` – **CODE CLOSED / MANUAL PENDING** (Sprint 27.1-G):
  fünf produktive Renderer, 316 Größenkombinationen und 1.576 Zustandsfälle
  einschließlich vollständiger Room-/Tall-/Capability-Matrix; ausführbarer
  Chrome-Gate in Test und Release, lokal 1.576/1.576 ohne Befund. MT-63/69/72
  bleiben `NOT TESTED`.
- `RQ-13-01` – **CODE CLOSED / RELEASE EVIDENCE PENDING** (Sprint 27.1-J):
  Git-basiertes Source-/Tag-/Monotonie-Gate und Fail-closed-Schutz gegen
  vorhandene GitHub-Releases/GHCR-Manifeste. RC.3 bleibt unverändert; RC.4
  wird erst in einem eigenen Releasecommit aktiv und publiziert.
- `RQ-17-01` – **CODE CLOSED / CANDIDATE EVIDENCE PENDING** (Sprint 27.1-J):
  historische RC.1-Evidenz strikt begrenzt, heutiger Nicht-Kandidat ehrlich
  `BLOCKED`; künftiger Workflow erzeugt ein einziges commit-/tag-/digest-/
  checksum-/workflowgebundenes `rc-result` mit Realumgebungen `NOT TESTED`.

## Zusätzliche Evidenz aus Audit Part 19

- `RQ-04-01` betrifft nun ausdrücklich Sprint 26, 26.1 und 26.2: Ein alter
  Shared-CSS-/Controllerstand kann trotz neuer Serverkonfiguration Sections,
  Room Background/Collapse und capabilityabhängige Light-/Climate-/Target-
  Controls routeabhängig falsch darstellen. Priorität P1 und Root Cause bleiben
  unverändert.
- `RQ-16-01` gilt auch für Room Card Backgrounds, weil Sprint 26.1 korrekt den
  vorhandenen sicheren Assetstore statt eines zweiten Uploadpfads verwendet.
  Der zentrale PNG-Defekt darf deshalb ebenfalls nur zentral repariert werden.
- `RQ-18-01` erhielt kontrollierte positive Evidenz: Der separate Room-Harness
  bestand 4/4 Compact-/Standard-/Wide-/Large-Fälle einschließlich Background
  und Collapse. Er bleibt dennoch unvollständig, weil Tall und die gesamte
  gültige Room×Size×State×Capability-Matrix fehlen und der Haupt-Harness die
  Sprint-26.2-Capabilities weiterhin falsch erwartet.

## Finale Baseline-Konsistenz

- Offene Code-Repair-Einträge: 4; zusätzlich 21 code-seitig geschlossene,
  teils manuell noch nicht abgenommene Einträge.
- Offene Prioritäten: P0 0, P1 2, P2 2, P3 0.
- Jeder Eintrag besitzt Finding/Requirement, Evidence, vorgeschlagene
  Reparatur, RC-Relevanz und Re-Audit-Status.
- Alle aus Auditdateien referenzierten Repair-IDs sind definiert; jeder
  definierte Repair-Eintrag wird von mindestens einem Audit referenziert.
- Kein offensichtlicher doppelter Root Cause wurde gefunden. Part 19 hat daher
  keine neue ID angelegt, sondern RQ-04-01, RQ-16-01 und RQ-18-01 erweitert.
- Reine reale/physische Abnahmen verbleiben in `MANUAL_TEST_QUEUE.md` und sind
  keine Reparaturen.

## Sprint-27.1-J-Ergebnis

- Automatisierbare Reparaturpfade für `RQ-13-01` und `RQ-17-01`: **PASS**.
- Testevidenz: 35/35 fokussiert, 394/394 vollständig; JavaScript-/Shellsyntax,
  Secret-Scan und Produktionsaudit PASS. Lokaler Card-Matrix-Browser mangels
  installiertem Chromium `NOT TESTED`, im CI weiterhin verpflichtend.
- Veröffentlichtes RC.3-Tag, GitHub Release und GHCR-Image: unverändert.
- Neue Version, Tag, Image, Bundle oder GitHub Release: nicht erzeugt.
- Release-/Kandidatenevidenz: **PENDING** bis zum separat autorisierten
  RC.4-Workflow; beide P1-Einträge bleiben deshalb als RC-Blocker sichtbar.
- Reale LXC-/HAOS-/iPad-Ergebnisse: weiterhin `NOT TESTED`.
