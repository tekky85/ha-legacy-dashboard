# Sprint-27-Reparaturwarteschlange

## Regeln

Hier werden alle umsetzbaren `PARTIAL`-, `MISSING`- und `BROKEN`-Befunde aus
den Baseline-Audits gesammelt. Manuelle oder reale Abnahmen gehören stattdessen
in [`MANUAL_TEST_QUEUE.md`](MANUAL_TEST_QUEUE.md). Reparaturen erfolgen erst
nach Review des jeweiligen Audit-Parts und erhalten anschließend einen
nachvollziehbaren Re-Audit-Eintrag.

## Offene Reparaturen

| ID | Sprint | Requirement | Ausgangsstatus | Priorität | Evidence | Vorgeschlagene Reparatur | Re-Audit |
|---|---|---|---|---|---|---|---|
| – | – | Für Part 01 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 12–14 | keine | N/A |
| – | – | Für Part 02 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 15–16 | keine; offene Abnahmen stehen in der manuellen Testwarteschlange | N/A |
| – | – | Für Part 03 wurde kein umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17 und 17.1; Fokuslauf 114/114; Gesamtsuite 329/329 | keine; offene Pointer-, iPad- und LXC-Abnahmen stehen in der manuellen Testwarteschlange | N/A |
| RQ-04-01 | 17.2, 17.3 | Gemeinsam genutzte Legacy-Assets besitzen zwischen Dashboard und Systemseiten unterschiedliche Cache-Buster. | PARTIAL | hoch | `src/public/index.html`: `theme.js` und `style.css` mit `v=51`; `src/public/system.html`: dieselben Dateien mit `v=44`; statische Assets werden `immutable` ausgeliefert. | Gemeinsame Wall-/System-Assets auf einen konsistent erhöhten Wert setzen; Tests ergänzen, die versionsgleiche Referenzen aller gemeinsam genutzten Assets verlangen; Auditbehauptung in Index/Status nach Reparatur aktualisieren. | offen |
| – | – | Für Part 05 wurde kein zusätzlicher umsetzbarer Code- oder Dokumentationsdefekt gefunden. | N/A | – | Audits 17.4 und 17.5; Fokuslauf 99/99; Gesamtsuite 329/329; kontrollierter Viewport-Lauf | keine; reale iPad-/Safari-Abnahmen stehen als MT-18 bis MT-20 in der manuellen Testwarteschlange. RQ-04-01 bleibt unverändert offen. | N/A |

## Abgeschlossene Reparaturen

Noch keine Reparaturen im Sprint-27-Auditprogramm.
