# Sprint-27-Reparaturwarteschlange

## Regeln

Hier werden alle umsetzbaren `PARTIAL`-, `MISSING`- und `BROKEN`-Befunde aus
den Baseline-Audits gesammelt. Manuelle oder reale Abnahmen gehören stattdessen
in [`MANUAL_TEST_QUEUE.md`](MANUAL_TEST_QUEUE.md). Reparaturen erfolgen erst
nach Review des jeweiligen Audit-Parts und erhalten anschließend einen
nachvollziehbaren Re-Audit-Eintrag.

## Konsolidierte Zusammenfassung

- Stand: 10. September 2026
- Auditabdeckung: Parts 01 bis 19 vollständig
- Nicht-PASS-Anforderungszeilen geprüft: 139
- Davon umsetzbare, auf Repairs abgebildete Findings: 121
- Rein manuelle/nicht umsetzbare Findings: 18
- Total canonical repairs: 25
- Code repairs completed: 6 (`RQ-16-01`, `RQ-04-01`, `RQ-09-01`,
  `RQ-12-01`, `RQ-12-02`, `RQ-12-03`)
- Open code repairs: 19
- P0: 0
- P1 open: 5
- P1 code-closed/manual-pending: 2
- P2 open: 14
- P2 code-closed/manual-pending: 4
- P3: 0
- RC Blocker `YES` open: 4
- RC Blocker code-closed/manual-pending: 2
- RC Blocker `CONDITIONAL`: 5
- Security-sensitive repairs open: 7; code-closed/manual-pending: 4
- Repairs blocking manual tests: 8
- Repairs with dependencies: 8
- Status: **SPRINT 27.1-A BIS 27.1-C COMPLETE – MANUAL PENDING**

Der geordnete Reparaturbacklog bleibt die Grundlage für Sprint 27.1. Der
Abschluss eines automatisierten Codebatches bedeutet weder RC-ready noch, dass
eine reale iPad-/HAOS-/LXC-/Home-Assistant-Abnahme bestanden wurde.

## Offene Reparaturen

| ID | Sprint | Requirement | Ausgangsstatus | Priorität | Evidence | Vorgeschlagene Reparatur | RC-Relevanz | Re-Audit |
|---|---|---|---|---|---|---|---|---|
| – | – | Für Part 01 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 12–14 | keine | keine | N/A |
| – | – | Für Part 02 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 15–16 | keine; offene Abnahmen stehen in der manuellen Testwarteschlange | keine | N/A |
| – | – | Für Part 03 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17 und 17.1; Fokuslauf 114/114; Gesamtsuite 329/329 | keine; offene Pointer-, iPad- und LXC-Abnahmen stehen in der manuellen Testwarteschlange | keine | N/A |
| RQ-04-01 | 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 18, 19, 20, 21, 21.1, 21.2, 21.3, 21.4, 21.5, 22, 23, 24, 25, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 26, 26.1, 26.2 | Gemeinsam genutzte Legacy-Assets besaßen zwischen Dashboard, Systemseiten, Admin und Manifest unterschiedliche Cache-Buster. | PARTIAL | P1 | Ausgangsstand auf `3830259`: Dashboard v51, System v44, Admin v50 und Manifesticons v44 bei immutable Public-Assets. Sprint 27.1-B setzte sämtliche Assetreferenzen zunächst auf v52. Sprint 27.1-C erhöht wegen der sichtbaren Diagnoseänderung alle Entry Points gemeinsam auf v53. `test/asset-version.test.js` erzwingt weiterhin Gleichheit und Parität der gemeinsam genutzten Assets. Gesamtsuite 336/336 PASS. | **UMGESETZT.** Alle Entry Points und das Manifest verwenden aktuell v53; die Gleichheitsregression verhindert erneut routeabhängige Abweichungen. Immutable Header und Anwendungslogik bleiben unverändert. | Code-/Automationsgate erfüllt. Reale iOS-9-/HomeScreen-/Safari-Cache-, LXC- und HAOS-Abnahmen bleiben `NOT TESTED`; keine RC-Freigabe abgeleitet. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-B; in Sprint 27.1-C regressiert |
| – | – | Für Part 05 wurde kein zusätzlicher umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17.4 und 17.5; Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierter Viewport-Lauf | keine; reale iPad-/Safari-Abnahmen stehen als MT-18 bis MT-20 in der manuellen Testwarteschlange. RQ-04-01 wurde später in 27.1-B geschlossen. | keine zusätzliche | N/A |
| – | – | Für Part 06 wurde kein zusätzlicher umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17.6 und 17.7; Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierte Control-Hierarchie-Messung | keine; reale iPad-/Safari-Abnahmen stehen als MT-21 bis MT-23 in der manuellen Testwarteschlange. RQ-04-01 wurde später in 27.1-B geschlossen. | keine zusätzliche | N/A |
| RQ-07-01 | 19 | Die vorgeschriebene Summary-Aktivitätsmatrix ist funktional implementiert, aber mehrere ausdrücklich verlangte Zustandsvarianten besitzen keine gezielte Regression. | PARTIAL | P2 | `test/summary.test.js` enthält sechs breite Tests. Direkte Assertions fehlen unter anderem für Door `on`, Window `off`, Cover `closing`, Vacuum `returning`/`paused`, Climate `cooling`, Media `idle`, numerischen Power-Sensor, `unknown`, unbekannte Ignore-ID sowie den expliziten Nachweis „Ignore verändert keine Control Grants“. Breite Gateway-/Securitytests liefern nur indirekte Evidenz. | Tabellengetriebene Summary-Tests für sämtliche Sprint-19-Zustands-, Ignore-, API- und Abgrenzungsvarianten ergänzen; weiterhin ausschließlich lokale Mockdaten verwenden. | Sollte vor/um RC geschlossen werden, damit Aktivitätsregressionen nicht trotz grüner Aggregattests unentdeckt bleiben; kein bestätigter Laufzeitdefekt. | offen |
| RQ-08-01 | 20 | Die 82 nummerierten Sprint-20-Testanforderungen sind fachlich weitgehend durch breite Regressionen belegt, aber nicht vollständig als gezielte, nachvollziehbare Einzelmatrix abgesichert. | PARTIAL | P2 | `test/issues.test.js` besitzt acht direkte Tests; Gateway, Admin, Persistenz, System-Frontend und spätere Risk-/Rule-Tests ergänzen breite Evidenz. Direkte Zuordnungen fehlen u. a. für einen eigenen Error-Gesamtstatus, mehrere Tie-Breaker, Security-Light/-Climate gegen unveränderte Grants, Admin Save→Reload/Nichtänderung des User-Dashboards sowie jeden einzelnen Loading-/Severity-/State-/Recovery-/Long-Name-UI-Fall. | Tabellengetriebene Sprint-20-Matrix ergänzen und alle 82 historischen Anforderungen entweder mit direktem Test oder dokumentiert äquivalenter aktueller Regression verknüpfen; ausschließlich localhost-Mocks/Fake-Credentials. | Testhärtung vor RC; kein bestätigter Laufzeitdefekt. | offen |
| RQ-08-02 | D1 | Die Produktbild-Galerie wurde nach späteren sichtbaren Sprints nicht vollständig gepflegt und vier `.png`-Dateien enthalten tatsächlich JPEG-Daten. | BROKEN | P2 | Visuelle Prüfung und Git-Historie: `compact-cards.png` zeigt den in Sprint 25.3 entfernten Versionsfooter und keine spätere Summary-Navigation; `focus-card.png` stammt vor 17.6/17.7; `dashboard-management.png`, `layout-editor.png` und `live-preview.png` zeigen alte Summary-/Error-Editoren und keine Sections/Room Cards. Ein aktueller Sections-/Room-Card-Nachweis fehlt. `file`/`sips` erkennen `entity-rules.png`, `system-diagnostics.png`, `errors.png`, `errors-automation-impact.png` als JPEG. Parts 09–12 bestätigen zusätzlich, dass die vorhandenen System-/Adminaufnahmen Registry-/Device-Group-, Filter-/Spalten-/Critical-Label-, Entity-Rule-/Health-, Flapping-/Recovery- sowie aktuelle Automation-Impact-/Advanced-Diagnostics-Zustände nicht belastbar belegen. | Aktuelle echte Anwendung gegen kontrollierten Mock/Fake-Credentials aufnehmen; mindestens Dashboard/Focus/Admin/Sections/Room Card sowie Systemregeln/Automation-Diagnostik aktualisieren; Format und Endung konsistent machen; DE/EN/root Links synchron prüfen; Datenschutzcheck dokumentieren. | Benutzer- und Release-Dokumentation zeigt sonst einen nachweislich älteren Produktstand; vor öffentlichem RC-Dokumentationsabschluss beheben. | offen |
| RQ-08-03 | D1 | Die als technische Statusquelle verlinkte `docs/PROJECT_STATUS.md` beschreibt nicht mehr den aktuellen Schema-, Verpackungs- und Auditstand. | BROKEN | P2 | `PROJECT_STATUS.md` erklärt im Auditabschnitt nur Parts 01/02 und Sprint 17+ als noch nicht bewertet; `AUDIT_INDEX.md` weist inzwischen Parts 01–13 aus. Der Statusüberblick nennt Schema 11, während `src/config/dashboard.js` `SCHEMA_VERSION = 12` definiert. Part 12 bestätigt zudem, dass die historischen Sprint-22-/23-Abschnitte aktuelle Auditbefunde (`ruleSource`, Dynamic-Confidence, Cacheindex) naturgemäß noch nicht enthalten. Part 13 findet außerdem eine weiterhin als App-Bestandteil genannte `build.yaml`, die Sprint 25 bewusst entfernt hat. | Kopf, Auditprogramm, Verpackungsstruktur und aktuellen Schemaüberblick in `PROJECT_STATUS.md` korrigieren, historische Sprintabschnitte erhalten und Aussagen gegen Code/Auditindex prüfen. | Verhindert falsche technische Auskunft aus dem README-Hauptlink; vor finaler RC-Bewertung korrigieren. | offen |
| RQ-09-01 | 21, 21.3, 23, 24 | Ein isoliertes Backend-WebSocket-`error`-Event ohne nachfolgendes `close` verwirft zwar den Verbindungsversuch, plant aber keinen automatischen Reconnect. | PARTIAL | P2 | Ausgangsprobe auf `7fa67a8`: Request endet mit `ha_websocket_unavailable`, `reconnectAttempts=0`, eine Socketinstanz. Sprint 27.1-C bindet Events an die konkrete Socketinstanz und führt Error/Close idempotent über denselben Disconnectpfad. Der isolierte Gatewaylauf fand zusätzlich ein synchron werfendes natives `close()` nach fehlgeschlagenem Handshake; auch dieser Pfad ist nun kontrolliert. `test/sprint-21.test.js` belegt Error-only, Error+Close ohne Doppeltimer, Backoff-Limit, werfendes `close()` und explizites Client-`close()` ohne Reconnect. | **UMGESETZT.** Error-only plant genau einen begrenzten Reconnect; spätes Close oder Events alter Sockets können keinen zweiten Versuch beziehungsweise keine neue Verbindung verwerfen. Ein Socket-`close()`-Fehler beendet den Gateway-Prozess nicht. Keine Command-, Token- oder Browsergrenze geändert. | Kein RC-Blocker. MT-30/32/35/36/46/48 sind ausführbar; MT-50 bleibt wegen RQ-13-01/-02 blockiert. Reale Recovery bleibt `NOT TESTED`. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprints 21, 21.3, 23, 24 und 25.4 re-auditiert |
| RQ-09-02 | 21, 21.1 | Die umfangreichen 93-/77-Punkte-Spezifikationsmatrizen sind fachlich breit abgedeckt, aber nicht vollständig als gezielte, nachvollziehbare Einzelanforderungen abgesichert. | PARTIAL | P2 | `test/sprint-21.test.js` enthält 15 breite Tests, `test/sprint-21-1.test.js` fünf. Ergänzende Gateway-/System-Frontend-/Issue-/Securitytests sind grün. Direkt fehlen u. a. vollständige Backoff-/Error-only-Matrix, einzelne Registry-/Area-/Repair-/Adminstatusvarianten sowie Long-Name-/Card-Höhen-/Overflow-/Active-Filter- und fehlende-Metadaten-Renderfälle. | Tabellengetriebene Zuordnung aller 93 bzw. 77 Anforderungen zu direkten Tests oder dokumentiert äquivalenten aktuellen Regressionen ergänzen; bedingte Matter-Supported-Fälle klar als N/A markieren; ausschließlich localhost-Mocks/Fake-Credentials. | Testhärtung vor/um RC; verhindert, dass Metadata-/Grouping-/Legacy-Regressionen von grünen Aggregattests verdeckt werden. Kein weiterer bestätigter Laufzeitdefekt. | offen |
| RQ-10-01 | 21.2, 21.3 | Die nummerierten 92-/96-Punkte-Spezifikationsmatrizen sind fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | `test/sprint-21-2.test.js` besitzt sieben und `test/sprint-21-3.test.js` elf breite Tests; ergänzende System-Frontend-, Admin-, Persistenz-, Issue-, Security- und spätere Sprint-25.1-/22-Regressionen sind grün. Nicht jeder Filterbutton/Count/Empty-/Stale-/Storage-/Viewportfall, jede Risk-/Cover-/Mode-Prioritätsvariante sowie Rename-/First-Failure-/Recovery-/Long-Name-/Realbrowseranforderung ist als eigener direkter Fall zugeordnet. | Tabellengetriebene 92-/96-Punkte-Zuordnung mit direktem Test oder dokumentiert äquivalenter aktueller Regression ergänzen; Browser-/iPad-Fälle explizit auf MT-33 bis MT-36 verweisen; nur localhost-Mocks/Fake-Credentials. | Testhärtung vor/um RC; kein bestätigter fachlicher Laufzeitdefekt. | offen |
| RQ-11-01 | 21.4, 21.5 | Die nummerierten 75-/73-Punkte-Spezifikationsmatrizen sind fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | `test/sprint-21-4.test.js` besitzt vier, `test/sprint-21-5.test.js` acht breite Tests. Part-11-Fokuslauf 165/165 und Gesamtsuite 329/329 belegen Entity-Suche/-Filter, Batch Draft, Header-Count, globalen Status, Healthzustände, sichere Return Targets, Same-Window, Filterunabhängigkeit, Legacy und Security. Nicht jeder einzelne Add/Remove-, Save-Fehler/Retry-, Empty-/Count-/Touch-/Viewport-, Timeout-/Malformed-, Severity-Visual-, Refresh-/Recovery-, Langzeit- und Realbrowserpunkt besitzt eine direkte Zuordnung. | Tabellengetriebene Zuordnung aller 75 bzw. 73 Anforderungen zu direkten Tests oder dokumentiert äquivalenten Regressionen ergänzen; reale Browser-/iPad-Punkte auf MT-37 bis MT-42 verweisen; ausschließlich localhost-Mocks/Fake-Credentials. | Testhärtung vor/um RC; verhindert, dass Entity-Rule-, Health- oder Return-Regressionen trotz grüner Aggregattests verdeckt bleiben. Kein bestätigter Laufzeitdefekt. | offen |
| RQ-12-01 | 22 | `ruleSource` bezeichnet bei gemischten Domain-/Risk-Regeln nicht zuverlässig die tatsächlich wirksame Feldquelle. | BROKEN | P2 | Ausgangsprobe auf `7fa67a8`: Domain setzt `expectedOffline=true`, gemeldet wird `risk_class`. Sprint 27.1-C führt `ruleSources` pro Feld und wählt in der Evaluation die Quelle von Expected Offline, zustandsspezifischer Grace, Flapping oder Recovery. Der Mischtest deckt Domain/Risk/Device/Entity/Security/Critical Detection ab. | **UMGESETZT.** Öffentliches `ruleSource` erklärt das im aktuellen Pfad wirksame Feld; die bestehende Wert- und Security-Priorität wurde nicht verändert. | Kein RC-Blocker. MT-43 bis MT-45 sind ausführbar und bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 22 re-auditiert |
| RQ-12-02 | 23 | Rein dynamische/nicht auflösbare Automationreferenzen erhalten keinen produktiven Impact mit Confidence `unknown`. | MISSING | P2 | Ausgangsprobe auf `7fa67a8`: `dynamicCount=1`, aber kein produktiver Unknown-Kontext. Sprint 27.1-C liefert in `automationAnalysis.unknownImpacts` maximal 50 sanitizierte Automationen und rendert sie global in Advanced Diagnostics mit Confidence `unknown` und dem Hinweis „keinem konkreten Problem zugeordnet“. Backend-/Frontendtests belegen Begrenzung, Sanitization und Kausalitätsfreiheit. | **UMGESETZT.** Dynamische Unsicherheit ist sichtbar, wird aber ohne statischen Nachweis keinem konkreten Issue als Ursache/Impact zugeordnet. Keine Raw Config/Trace und kein zusätzlicher HA-Aufruf. | Kein RC-Blocker. MT-46 bis MT-49 sind ausführbar, bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 23 re-auditiert |
| RQ-12-03 | 23 | Der Reference-Cache liefert für Automation Impact bis zum TTL veralteten Automation-State/Disabled-Kontext und `lastTriggered`. | BROKEN | P2 | Ausgangsprobe auf `7fa67a8`: Public Inventory `off`/neuer Name, Impactindex `on`/alter Name/alte Triggerzeit. Sprint 27.1-C baut bei Cache-Hit und Inflight-Rückgabe den Index aus frischem Inventory plus gecachten Referenzen neu. Regression deckt `on→off→on`, Name und `lastTriggered` innerhalb 60 s ab. | **UMGESETZT.** Statische Referenzen behalten ihren TTL; State-, Availability-/Disabled-, Name- und Triggerkontext folgen jedem aktuellen Snapshot atomar. | Kein RC-Blocker. MT-46 bis MT-49 sind ausführbar, bleiben `NOT TESTED`; RQ-12-04 bleibt nachgelagert offen. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-C; Sprint 23 re-auditiert |
| RQ-12-04 | 22, 23 | Die nummerierten 80-/84-Punkte-Spezifikationsmatrizen sind fachlich breit, aber nicht vollständig als gezielte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | `test/sprint-22.test.js` enthält 11 und `test/sprint-23.test.js` 12 breite Tests. Part-12-Fokuslauf 118/118 und Gesamtsuite 329/329 belegen Kernpipeline, Admin/Persistenz, Health, Impact, Traces, Legacy und Security. Nicht jeder Grenz-, Timeout-, Partial-/Inflight-, UI-/Viewport-, Restart-, Failure- und Realbrowserpunkt besitzt eine direkte Zuordnung; die falsche `ruleSource`, der fehlende Unknown-Pfad und der veraltete Cacheindex blieben trotz grüner Suite unentdeckt. | Tabellengetriebene 80-/84-Punkte-Zuordnung mit direkten Tests oder dokumentiert äquivalenten Regressionen ergänzen; RQ-12-01 bis -03 explizit regressieren; reale Punkte auf MT-43 bis MT-49 verweisen; nur localhost-Mocks/Fake-Credentials. | Testhärtung vor/um RC und Voraussetzung für belastbaren Re-Audit. | offen |
| RQ-13-01 | 24, 25 | Die konfigurierte App-Version und das veröffentlichte GHCR-Image bilden nicht den aktuell auditierten Repositorycode ab. | BROKEN | P1 | `package.json` und `ha_legacy_dashboard/config.yaml` nennen weiter `1.0.0-rc.1`; die generische Image-Referenz lädt somit `ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.1`. Der immutable Tag `v1.0.0-rc.1` zeigt auf `741bba4`, aktueller HEAD ist `593ba5a`; danach liegen mehrere laufzeitrelevante Commits für JPEG, Präsentation, Sections, Room Cards und zentrale Control-Autorisierung. Part 14 bestätigt, dass genau dieser alte Tag am 28. August 2026 als erfolgreiches öffentliches Prerelease mit Multi-Arch-Image, Bundle und Checksum veröffentlicht wurde. `docs/RELEASING.md` nennt denselben bereits existierenden RC weiterhin als „ersten geplanten Release“. `release/check-version.js` prüft nur übereinstimmende Versionsstrings und erkennt Source-/Tag-Drift nicht. | Neue unveränderliche Version für den aktuellen reparierten Stand vergeben, aus genau diesem Commit Multi-Arch-Image/Manifest und Release erzeugen, App-Metadaten/Changelogs synchronisieren und Release-Gate ergänzen, das Tag-/Commit-Identität sowie app-relevante Änderungen nach dem letzten Versionstag erkennt. Releaseanleitung auf den tatsächlichen Lebenszyklus aktualisieren. | RC-Blocker: eine aktuelle App-Repository-Installation liefert sonst nachweislich alten Code trotz aktueller Dokumentation und aktuellem Git-Stand. | offen |
| RQ-13-02 | 24 | Der dokumentierte lokale Supervisor-App-Build verwendet wegen der mitkopierten `image:`-Angabe nicht zuverlässig die vorbereiteten lokalen Quellen. | BROKEN | P2 | `deploy/prepare-home-assistant-app.sh` kopiert Root-Quellen und `ha_legacy_dashboard/config.yaml` unverändert. Der erzeugte kontrollierte Kontext enthielt weiterhin `image: ghcr.io/tekky85/ha-legacy-dashboard`. Nach aktueller Home-Assistant-App-Semantik wählt `image` ein vorgebautes Registry-Image; `docs/DEPLOYMENT.md` und die App-Dokumentation stellen den Ablauf dennoch als lokalen Build des kopierten Kontexts dar. | Im nur lokal erzeugten Supervisor-Entwicklungskontext `image:` kontrolliert entfernen oder einen offiziell unterstützten getrennten Dev-Metadatensatz erzeugen; Tracking-Paket nicht mutieren. Dokumentation und Tests müssen verifizieren, dass lokale Sourceänderungen wirklich gebaut werden und Production weiterhin das versionierte Image nutzt. | Verhindert belastbare lokale App-Validierung und kann Entwickler über den tatsächlich getesteten Code täuschen; vor aktuellem HAOS-RC-Test beheben. | offen |
| RQ-14-01 | 25 | Das Standalone-Releasebundle enthält keine in sich verwendbare Installations-, Upgrade- und Rollbackdokumentation. | BROKEN | P1 | `release/create-standalone-bundle.js` nimmt `README*` und `docs/DEPLOYMENT.md`, aber nicht `docs/RELEASING.md` auf. Die enthaltenen READMEs verweisen auf die fehlende Datei. `docs/DEPLOYMENT.md` verlangt `deploy/deploy.sh`, `check.sh`, `health-check.sh` und `rollback.sh`; im öffentlichen RC.1-Tar und der aktuellen Include-Liste ist nur die systemd-Unit enthalten. Die Skripte setzen zudem einen Git-Arbeitsbaum voraus, den das Bundle bewusst nicht enthält. | Eine bundle-spezifische Fresh-Install-/Upgrade-/Rollbackanleitung aufnehmen und README-Links auf tatsächlich enthaltene Dateien ausrichten; alle im Bundle versprochenen lokalen Links/Pfade/Befehle automatisiert gegen den Tar-Inhalt prüfen. Keine Git-Deployskripte als scheinbare Archivlösung beilegen, solange deren Modell nicht passt. | Muss vor dem nächsten RC behoben werden, sonst ist das veröffentlichte Standalone-Artefakt trotz korrekter Bits operativ irreführend. | offen |
| RQ-14-02 | 25 | Die automatisierten Standalone-/App-Upgradeprüfungen führen keinen echten Versionswechsel oder Rollback aus. | PARTIAL | P1 | `test/sprint-25.test.js::verifyPersistentUpgrade()` initialisiert und lädt dieselbe aktuelle `DashboardConfig`-Implementierung zweimal. Weder ein vorheriges Release/Schema noch zwei entpackte Laufzeiten/Prozesse, App-Image N→N+1, Theme-Persistenz oder Rollback werden ausgeführt. Der Test kann daher trotz inkompatibler Cross-Version-Migration grün bleiben. | Reproduzierbare N→N+1-Fixtures oder zwei tatsächliche Releaseartefakte mit gemeinsamem Datenverzeichnis testen; Standalone-Prozesswechsel, Konfiguration/Regeln/Admin, Backup und Rollback automatisieren. HAOS-`/data`-Update bleibt zusätzlich als reale MT-52/MT-57-Abnahme bestehen. | Muss vor Stable, vorzugsweise vor dem nächsten RC, geschlossen werden, weil Update-/Rollbackfähigkeit ein ausdrückliches Release-Gate ist. | offen |
| RQ-14-03 | 25 | Die 60 nummerierten Release-Testanforderungen sind nicht vollständig als direkte, commitbezogene Nachweismatrix abgesichert. | PARTIAL | P2 | `test/sprint-25.test.js` enthält sieben breite Tests. Gesamtsuite, öffentlicher RC.1-Workflow und manuelle Queues liefern viel Evidenz, aber Source-/Tag-Drift, nicht selbsttragende Bundle-Dokumentation, Same-Version-„Upgrade“ und Stable-Gate-Kopplung blieben trotz grünem Gate unentdeckt. | Alle 60 Fälle einem direkten automatisierten Test, einem versionierten öffentlichen Workflowartefakt oder einem konkreten manuellen Test mit Commit/Version zuordnen; die Befunde RQ-13-01 und RQ-14-01/-02/-04 regressieren. | Testhärtung vor/um RC und Voraussetzung für belastbare Releasefreigabe; kein zusätzlicher Runtimecodefehler. | offen |
| RQ-14-04 | 25, 25.1, 25.2, 25.3 | Ein Stable-Tag kann technisch veröffentlicht werden, ohne dass die dokumentierten iPad-/HAOS-Gates und bekannten P1-Blocker für genau diesen Commit freigegeben wurden. | PARTIAL | P1 | `.github/workflows/release.yml` prüft Tests, Build, Manifest und Smoke, liest aber weder eine commitbezogene RC-/Manual-Result-Matrix noch offene Repair-Blocker und nutzt kein geschütztes Approval-Environment. `docs/RELEASING.md` führt die Pflichtpunkte nur als nicht ausgefüllte Markdown-Checkliste. Theme-/Filter-, HomeScreen- sowie Background-/Vollhöhen-/Footer-/Cache-/Persistenz-Gates stehen mit MT-13, MT-34, MT-40 bis MT-42 und MT-51/52/54/58 bis MT-60 weiterhin auf `NOT TESTED`. `RQ-16-01` ist code-seitig geschlossen, aber Stable erkennt weder dessen manuelle Restabnahme noch andere offene Blocker technisch. | Einen überprüfbaren Stable-Freigabeschritt einführen, etwa geschütztes GitHub Environment plus versioniertes, commit-/artefaktbezogenes RC-Gate-Dokument; Stable bei offenen P0/P1-Befunden oder fehlenden Pflichtabnahmen blockieren. RC-Veröffentlichungen dürfen weiterhin als Testartefakte möglich sein. | Muss vor Stable und vor einer Behauptung „RC ready“ behoben werden; verhindert die Veröffentlichung eines technisch grünen, aber real ungeprüften Legacy-/HAOS-Builds. | offen |
| RQ-14-05 | 25 | Der aktuelle Produktionsabhängigkeits-Audit meldet zwei moderate DoS-Advisories in `qs@6.15.3`. | PARTIAL | P2 | `npm ls qs --omit=dev`: Express 5.2.1/body-parser 2.3.0 ziehen `qs@6.15.3`. `npm audit --omit=dev --audit-level=high` besteht, meldet jedoch GHSA-x5fp-wj9c-mxmx und GHSA-4mjr-xmp4-gh2g mit verfügbarer Korrektur. Keine High/Critical-Schwachstelle und keine bestätigte Ausnutzung im Projekt. | Verfügbare kompatible Dependency-/Lockfile-Aktualisierung kontrolliert prüfen, vollständige Tests und Request-Limit-/Parserregression ausführen; nicht blind einen Major-Upgrade anwenden. Releasepolicy für Moderate explizit dokumentieren. | Sollte vor/um RC bewertet und möglichst geschlossen werden; kein P0/P1 nach der definierten High/Critical-Policy, aber öffentlich erreichbarer HTTP-Dienst. | offen |
| RQ-15-01 | 25.1, 25.2 | Die nummerierten 74-/51-Punkte-Release-Gate-Matrizen sind fachlich breit, aber nicht vollständig als direkte Einzelanforderungen rückverfolgbar. | PARTIAL | P2 | `test/sprint-17-2.test.js` prüft Theme-Persistenz, `test/system-frontend.test.js` exakte Filter und `test/sprint-25-2.test.js` Navigation. Sprint 27.1-B ergänzt `test/asset-version.test.js`; die früh unerkannte routeabhängige Abweichung aus RQ-04-01 ist damit regressiert und die Gesamtsuite 331/331 grün. Reale HomeScreen-/Safari-Punkte bleiben nur über MT-13/34/40–42 abgedeckt, und nicht jeder nummerierte Fall ist direkt rückverfolgbar. | Alle 74 bzw. 51 Anforderungen einem direkten Test, einer dokumentiert äquivalenten Regression oder einem konkreten Manual-Test zuordnen; den vorhandenen Assetversions-Test einbeziehen; HomeScreen-Resultate commit-/versionbezogen dokumentieren. Nur localhost-Mocks/Fake-Credentials verwenden. | Testhärtung und belastbares Release Gate vor Stable; kein zusätzlich bestätigter fachlicher Laufzeitdefekt. | offen |
| RQ-16-01 | 25.3, 25.5, 26.1 | Der PNG-Validator akzeptierte strukturell ungültige oder manipulierte PNG-Dateien; beim Ersatz konnte dadurch das letzte gültige Background-Asset verloren gehen. | BROKEN | P1 | Ausgangsdefekt auf `dec0c54` reproduziert: PNG ohne `IDAT` und mit manipulierter CRC wurden akzeptiert. Sprint 27.1-A ergänzt in `src/services/dashboard-backgrounds.js` CRC32 je Chunk, gültige IHDR-Felder, strikte bekannte Critical-Chunk-Reihenfolge, zusammenhängende IDATs und sauberes IEND/EOF. `test/fixtures/png-samples.js`, `test/sprint-25-3.test.js` und `test/admin-api.test.js` regressieren fehlendes IDAT, CRC-Tamper, Truncation, trailing data, unknown critical, duplicate IHDR sowie Dashboard-/Room-Last-valid-Replace. Fokus 85/85 und Gesamtsuite 330/330 PASS. | **UMGESETZT.** Gemeinsamer begrenzter PNG-Parser gehärtet; keine Validierung abgeschaltet, kein Room-Sonderpfad. Ungültige Uploads werden vor dem Store abgewiesen, Altconfig/Altasset bleiben allein erhalten. | Code-/Automationsgate erfüllt. Reale iPad-/LXC-/HAOS-Background-, Restart- und `/data`-Abnahmen bleiben `NOT TESTED`; keine RC-Freigabe abgeleitet. | CODE CLOSED / MANUAL PENDING – Sprint 27.1-A; Audits 25.3/25.4/25.5/26.1 re-auditiert |
| RQ-16-02 | 25.3 | Die 84 nummerierten Sprint-25.3-Testanforderungen sind fachlich breit, aber nicht vollständig als direkte Einzelmatrix rückverfolgbar. | PARTIAL | P2 | `test/sprint-25-3.test.js` besitzt neun breite Tests; Admin-, Gateway-, Persistenz-, JPEG-, Focus-, Navigation-, Security-, Standalone- und Deploymenttests ergänzen 96/96 fokussierte sowie 329/329 vollständige Evidenz. Nicht jeder 0/1/wenige/viele-Karten-, Position-/Overlay-, Rotation-/Viewport-, Restart-/Backup-, Cache-/Missing-Asset- und Invalid-Formatfall ist direkt zugeordnet. Insbesondere fehlendes PNG-IDAT und falsche CRC wurden nie geprüft, wodurch `RQ-16-01` unentdeckt blieb. | Alle 84 Anforderungen einem direkten Test, dokumentiert äquivalenten aktuellen Test oder MT-51/52/54/58–60 zuordnen; PNG-Struktur-/CRC- und Replacement-Rollback-Fälle automatisieren; reine reale Geräte-/Runtimepunkte commitbezogen dokumentieren. Nur lokale Mocks/Fake-Credentials. | Testhärtung vor/um RC und Voraussetzung für belastbaren Re-Audit nach `RQ-16-01`; kein zusätzlicher Laufzeitdefekt. | offen |
| RQ-17-01 | 25.4 | Die lebende RC-Checkliste ist kein commit- und artefaktkohärenter Nachweis mehr und enthält veraltete beziehungsweise aktuell falsche PASS-Aussagen. | BROKEN | P1 | `docs/RC_CHECKLIST.md` nennt im Kopf RC.1/Commit `741bba4`, verwendet für LXC später `42d88f3` und für Gates 275, 283 beziehungsweise 290 Tests, während der aktuelle Reparaturstand 330 Tests besitzt. Sie behauptet ein Root-`Dockerfile`, obwohl die Workflows `ha_legacy_dashboard/Dockerfile` nutzen, sowie null npm-Schwachstellen, obwohl der Audit eine moderate `qs@6.15.3`-Schwachstelle mit zwei Advisories meldet. Der frühere PNG-Widerspruch ist mit `RQ-16-01` behoben; die nachträglich angehängte Sprint-25.5-/25.6-Evidenz besitzt weiterhin keine eigene Kandidaten-/Commitgrenze und aktuelle P1-Befunde sind nicht vollständig in `RC BLOCKERS` synchronisiert. | Historische RC.1-Evidenz unverändert und klar auf `741bba4` begrenzen. Für den nächsten Kandidaten eine neue datierte Matrix mit exakt einem Sourcecommit, Tag, Image-/Manifestdigest, Bundlechecksum, Workflow, LXC-/HAOS-Build und Geräteteststand erzeugen. PASS-Zeilen aus automatischer/realer Evidenz ableiten, Repair-Queue-P0/P1 synchron als Blocker übernehmen und falsche Dockerfile-/Auditangaben korrigieren. | Muss vor dem nächsten RC behoben werden: Eine gemischte Matrix kann einen alten oder unvollständig geprüften Build fälschlich freigabefähig erscheinen lassen. | offen |
| RQ-18-01 | 25.6, 26.1, 26.2 | Card-Matrix-Inventar, Dokumentation und ausführbarer Browser-Harness bilden die aktuelle Renderer-/Capability-Oberfläche nicht vollständig und fehlerfrei ab. | BROKEN | P2 | `docs/CARD_MATRIX.md` und `test/fixtures/card-matrix.js` inventarisieren nur Sensor, Binary, Light und Climate; der seit Sprint 26.1 produktive Typ `room` fehlt in der vollständigen Typ×Größe×State-Matrix. `test/fixtures/room-card-matrix-harness.js` deckt nur compact/standard/wide/large-Beispiele ab, nicht alle gültigen Größen/Zustände und kein gezieltes Tall-Szenario. Zusätzlich erwartet `card-matrix-harness.js` für jedes Climate pauschal drei Controls. Kontrollierter Chromium-Lauf in Part 18: 1.128 Fälle, fünf Tiers, keine Overflow-/Clipping-/Touch-/Tierfehler, aber 120 `missing-control`-False-Positives ausschließlich für `unknown`/`unavailable`, bei denen Sprint 26.2 korrekt keinen unbestätigten Power-Control rendert. Der Node-Test prüft nur, dass die Prüfschlüssel im Harnessquelltext vorkommen, nicht dass der Harness grün läuft. Part 19 führte den separaten Room-Harness tatsächlich aus: vier Compact/Standard/Wide/Large-Fälle bestanden einschließlich Background und Collapse, bestätigen aber weder Tall noch die vollständige gültige Room×Size×State×Capability-Matrix. | Aktuelles Renderer-Inventar aus der produktiven Registry ableiten oder synchron halten; Room in eine vollständige gültige Type×Size×Representative-State-Matrix inklusive Tall, Background, Collapsed/Expanded und Capabilities integrieren; erwartete Controls pro Zustand aus denselben Gateway-Capabilities ableiten; Browser-Harness als tatsächlich ausgeführtes CI-Gate anbinden und `docs/CARD_MATRIX.md` aktualisieren. | P2 vor/um RC: Kein bestätigter visueller Produktdefekt, aber das zentrale visuelle Gate ist rot und lässt aktuelle Room-/Capabilityregressionen unzuverlässig erkennen. | offen |

## Kanonische Ausführungsmetadaten

Die bestehende Finding-Tabelle bleibt die historische Quelle für Status,
Evidence und vorgeschlagene Reparatur. Diese Matrix ergänzt die für Sprint
27.1 verbindlichen Ausführungsfelder. `–` bedeutet keine Reparaturabhängigkeit;
die vollständige Anwendungssuite und die Security-Baseline bleiben trotzdem
für jeden Batch Pflicht.

| ID | Betroffene Komponenten | RC Blocker | Security Sensitive | Depends On | Blocks | Manual Tests Affected | Audit Files To Re-Audit | Repair Batch |
|---|---|---|---|---|---|---|---|---|
| RQ-04-01 | Public HTML, gemeinsame Wall-CSS/JS, Static-Cache-Header, Admin-Preview | YES | NO | – | Codepfad geschlossen; verbindliche Legacy-Abnahme bleibt | MT-01/02/05/06/09/11–16/18–25/28/32–34/39–42/45/48/54/58/63–69/71/72 | Sprint 17.2–17.7, 18–26.2 soweit im Finding genannt – re-auditiert | 27.1-B COMPLETE |
| RQ-07-01 | Summary Engine und tabellengetriebene Tests | NO | NO | – | belastbarer Sprint-19-Re-Audit | MT-24–26 | Sprint 19 | 27.1-E |
| RQ-08-01 | Issue Engine, Adminregeln, Error UI/API und Tests | NO | NO | – | belastbarer Sprint-20-Re-Audit | MT-27/28/34/42 | Sprint 20 | 27.1-E |
| RQ-08-02 | README-Galerie, echte Screenshots, Dateiformate/Datenschutz | CONDITIONAL – vor öffentlicher RC-Dokumentation | YES | RQ-09-01, RQ-12-01/02/03, RQ-18-01 | finaler Dokumentationsstand | MT-29 | D1 sowie Screenshot-Findings in Sprint 21–23, 25.1, 26/26.1 | 27.1-I |
| RQ-08-03 | PROJECT_STATUS, Roadmap-/Auditstatus, Verpackungsstruktur | NO | NO | alle fachlichen Batches, damit Aussagen final sind | RQ-17-01 | keine; Dokumentabgleich | D1, Sprint 24/25 | 27.1-I |
| RQ-09-01 | Backend-HA-WebSocket-Lifecycle/Reconnect | NO | YES | – | RQ-09-02, RQ-12-04; reale Registry-/Automation-/HAOS-Recovery | MT-30/32/35/36/46/48/50 | Sprint 21, 21.3, 23, 24, 25.4 | 27.1-C COMPLETE |
| RQ-09-02 | Registry/Device/Area/Repair/Matter-Testmatrix | NO | NO | RQ-09-01 | Sprint-21/21.1-Re-Audit | MT-30–32 | Sprint 21/21.1 | 27.1-E |
| RQ-10-01 | Summary/Error-Filter, Spalten, Kritikalitätsmodi und Tests | NO | NO | – | Sprint-21.2/21.3-Re-Audit | MT-33–36 | Sprint 21.2/21.3 | 27.1-E |
| RQ-11-01 | Entity Rule Manager, Health/Return und Tests | NO | NO | – | Sprint-21.4/21.5-Re-Audit | MT-37–42 | Sprint 21.4/21.5 | 27.1-F |
| RQ-12-01 | Rule Engine `ruleSource`/Erklärbarkeit | NO | NO | – | RQ-12-04; reale Regelabnahme | MT-43–45 | Sprint 22 | 27.1-C COMPLETE |
| RQ-12-02 | Automation Impact, Dynamic-/Unknown-Kontext, Sanitizer/UI | NO | YES | – | RQ-12-04; reale Automation-Abnahme | MT-46–49 | Sprint 23 | 27.1-C COMPLETE |
| RQ-12-03 | Automation-Reference-Cache und frisches Inventory-Merge | NO | YES | – | RQ-12-04; reale Automation-Abnahme | MT-46–49 | Sprint 23 | 27.1-C COMPLETE |
| RQ-12-04 | Sprint-22-/23-Testmatrix | NO | NO | RQ-09-01, RQ-12-01/02/03 | belastbarer Regel-/Automation-Re-Audit | MT-43–49 | Sprint 22/23 | 27.1-F |
| RQ-13-01 | Versionen, Tag/Commit, GHCR, App-Image, Release Notes | YES | YES | RQ-13-02, RQ-14-01/02/04/05, RQ-18-01 | RQ-17-01; aktuelle HAOS-/Release-Abnahme | MT-50–62/64–66/70 | Sprint 24, 25, 25.4 | 27.1-J |
| RQ-13-02 | Supervisor-Dev-Kontext, App-Metadaten `image`, Build-Dokumentation | CONDITIONAL – vor lokaler HAOS-Source-Abnahme | YES | – | RQ-13-01; lokale HAOS-Validierung | MT-50–54/61/62/70 | Sprint 24 | 27.1-D |
| RQ-14-01 | Standalone-Bundle und enthaltene Install-/Upgrade-/Rollbackdocs | YES | YES | – | RQ-14-02/03, RQ-13-01, RQ-17-01 | MT-55/56 | Sprint 25/25.4 | 27.1-D |
| RQ-14-02 | Cross-Version-Upgrade-/Rollbackfixtures und Datenintegrität | YES | YES | RQ-14-01 | RQ-14-03, RQ-13-01, RQ-17-01 | MT-52/56 | Sprint 25/25.4 | 27.1-D |
| RQ-14-03 | vollständige commitbezogene Release-Testmatrix | NO | NO | RQ-13-01, RQ-14-01/02/04/05 | Release-Re-Audit | MT-55–57 | Sprint 25 | 27.1-H |
| RQ-14-04 | technisch erzwungenes Stable-Approval-/Blocker-Gate | CONDITIONAL – zwingend vor Stable | YES | – | MT-57 und Stable-Promotion | MT-57 | Sprint 25/25.1–25.4 | 27.1-H |
| RQ-14-05 | Produktionsdependency `qs`, Risikobewertung/Update | CONDITIONAL – falls keine dokumentierte Akzeptanz möglich | YES | – | RQ-13-01 und nächster Kandidat | MT-55/57 | Sprint 25/25.4 | 27.1-D |
| RQ-15-01 | Theme-/Exact-Filter-/HomeScreen-Testmatrix | NO | NO | – | belastbarer Sprint-25.1/25.2-Re-Audit | MT-13/34/40–42 | Sprint 25.1/25.2 | 27.1-F |
| RQ-16-01 | PNG-Parser, atomarer Background-Replace, Dashboard/Room Upload | YES | YES | – | Codepfad geschlossen; reale Background-Abnahmen bleiben | MT-51/54/58–62/69/70 | Sprint 25.3/25.4/25.5/26.1 – re-auditiert | 27.1-A COMPLETE |
| RQ-16-02 | vollständige Background-/Upload-Testmatrix | NO | NO | – | belastbarer Sprint-25.3-Re-Audit | MT-51/52/54/58–62 | Sprint 25.3 | 27.1-F |
| RQ-17-01 | commit-/artefaktkohärente RC-Checkliste und Blockerableitung | YES | NO | RQ-08-03, RQ-13-01, RQ-14-01/02/04/05 | finaler RC-Gate-Lauf | MT-50–57/61–66 | Sprint 25.4 | 27.1-J |
| RQ-18-01 | Card-/Room-Matrix, Capability-Erwartungen, Browser-CI-Gate | CONDITIONAL – vor visueller RC-/iPad-Abnahme | NO | – | RQ-08-02, RQ-13-01; visuelles Gate | MT-63/69/72 | Sprint 25.6/26.1/26.2 | 27.1-G |

## Prioritätsbegründung

- **P0: 0.** Die Baseline fand keine Tokenoffenlegung, keinen generischen
  Serviceproxy, keine unsichere Control-Autorisierung und keinen derzeit nicht
  startfähigen Runtimepfad.
- **P1 offen: 5.** RQ-13-01 verteilt alten Code; RQ-14-01/-02 betreffen installierbare und
  nichtdestruktiv aktualisierbare Artefakte; RQ-14-04 betrifft das verbindliche
  Stable-Gate; RQ-17-01 kann einen falschen Kandidaten freigabefähig erscheinen
  lassen. RQ-04-01 und RQ-16-01 sind code-seitig geschlossen, bleiben aber bis
  zu den zugeordneten Realtests als `MANUAL PENDING` sichtbar.
- **P2: 18.** Es handelt sich um reproduzierbare, aber begrenzte Diagnose-/
  Recoveryfehler, unvollständige Testmatrizen oder Dokumentations-/Screenshot-
  Drift. RQ-08-02 wurde von P1 auf P2 normalisiert: veraltete Bilder sind
  release-relevant, brechen aber keinen Kernruntimepfad.
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

- Offene Code-Repair-Einträge: 19; zusätzlich sechs code-seitig geschlossene,
  manuell noch nicht abgenommene Einträge (`RQ-04-01`, `RQ-09-01`,
  `RQ-12-01/-02/-03`, `RQ-16-01`).
- Offene Prioritäten: P0 0, P1 5, P2 14, P3 0.
- Jeder Eintrag besitzt Finding/Requirement, Evidence, vorgeschlagene
  Reparatur, RC-Relevanz und Re-Audit-Status.
- Alle aus Auditdateien referenzierten Repair-IDs sind definiert; jeder
  definierte Repair-Eintrag wird von mindestens einem Audit referenziert.
- Kein offensichtlicher doppelter Root Cause wurde gefunden. Part 19 hat daher
  keine neue ID angelegt, sondern RQ-04-01, RQ-16-01 und RQ-18-01 erweitert.
- Reine reale/physische Abnahmen verbleiben in `MANUAL_TEST_QUEUE.md` und sind
  keine Reparaturen.
