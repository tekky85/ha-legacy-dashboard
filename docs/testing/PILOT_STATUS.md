# Sprint 27.4 – Pilotstatus und Übergabe

Basis: Branch `main`, Commit `f027eeb` (vollständiger Startcommit im Git-Protokoll).
Datum: 18. Oktober 2026.

**IMPLEMENTATION READY FOR HUMAN PILOT** nach bestandener automatisierter
Werkzeugprüfung. **REAL HUMAN PILOT: NOT TESTED / PENDING.**
Die Slots sind Platzhalter, keine behaupteten Personen oder Zusagen.

## A. TOOLING VERIFIED BY CODEX

| Prüfung | Status / Evidenz |
|---|---|
| Existierende Sprint-27.3-Implementierung | PASS – `testing/`, `scripts/testing/`, Schemata und bestehender Pages-Workflow sind committed vorhanden |
| Single Source / Katalog | PASS – versionierte `MANUAL_TEST_QUEUE.md` → `testing/data/test-catalog.json`, 72 → 72 eindeutige vollständige Definitionen, keine ausgeschlossenen IDs; unveränderter Hash `1c6d7088096c68bfd4758fb85e882ec06b56131ad68f7ca7c8683beea9a2976a` |
| Lokaler Owner-Arbeitsbaum | Sechs vorbestehende manuelle Ergebnis-/Auditdokumente und 27.1-K-Datei bleiben separat erhalten. Der publizierte Quellsnapshot enthält diese uncommitteten Ergebnisse nicht. |
| Pilotwahl | 11 bestehende MT-IDs in `testing/js/pilot.js`, nur Auswahl; vollständige Schritte weiterhin kanonisch |
| Format / Rückwärtskompatibilität | Bericht 1.0, optionale additive Export-/Tool-/Provenienzfelder; Legacy-Dateien akzeptiert mit sichtbaren Hinweisen, unbekannte Versionen kontrolliert abgewiesen |
| Zählfehler bestätigt | Vor Reparatur: ein Run, zwei widersprüchliche/abweichende Dateien, Konflikt gemeldet, PASS trotzdem zweimal gezählt. `RQ-21-01` dokumentiert diese verifizierte Tooling-Lücke. |
| Sichere Auswertung | Konfliktvarianten vollständig erhalten und aus Zählungen quarantiniert; identische Beobachtung nur einmal; synthetische Berichte standardmäßig ausgeschlossen; App-/Katalogversionen getrennt |
| Offline-Pilotprobe | `node scripts/testing/run-pilot-validation.js test-results/pilot-27-4-001` erzeugt ausschließlich künstliche Daten und prüft Validator → Aggregator → JSON/CSV/Markdown. Erwartete Ablehnung einer korrupten Datei wird ausdrücklich geprüft. |
| GitHub-Verfahren | Bestehende Run- und Bug-Formulare, Label `bug` vorhanden; keine zusätzlichen Formulare/Labels oder öffentlichen Dummy-Issues erzeugt |
| Produktgrenzen | Kein Runtime-/HA-/LXC-/App-Release, keine HA-Schreibaktionen, kein Produktions-`.env`, keine Rohreports veröffentlicht |

Automatische Ergebniszahlen und geänderte Dateien stehen unten. Kein künstlicher
Bericht in Abschnitt B oder der manuellen Abnahmewarteschlange wird als PASS verbucht.

## B. REAL HUMAN PILOT TESTS PENDING

| Slot / Alias | Eigenes HA-System / Geräteumfang | Zugewiesene Test-IDs | App-Version | Bericht erwartet / erhalten | Eingang am | Issues | Ergebnis |
|---|---|---|---|---|---|---|---|
| Pilot-A (unbesetzter Slot) | Unabhängige HA-App-Testinstanz; amd64/macOS und Legacy-Gerät nur nach Bestätigung | MT-02, MT-04, MT-13, MT-15, MT-16, MT-40, MT-50, MT-52, MT-53, MT-58, MT-69; einzelne N/A/BLOCKED begründen | Noch vom Koordinator freizugeben; tatsächlich installierte Version zwingend eintragen | Erwartet nach Einladung / NICHT ERHALTEN | – | – | NOT TESTED / PENDING |
| Pilot-B (unbesetzter Slot) | Zweites unabhängiges HA-System; aarch64 bevorzugt, kein Hardwarebesitz unterstellt | Gleiche 11 IDs für unabhängige Überlappung; MT-50/52 auf ARM-only gemäß Quelle N/A, MT-53 nur bei bestätigter Hardware | Noch vom Koordinator freizugeben | Erwartet nach Einladung / NICHT ERHALTEN | – | – | NOT TESTED / PENDING |
| Pilot-C (optional, unbesetzter Slot) | Drittes unabhängiges HA-System; Legacy-iPad nach Bestätigung | Gleiche Auswahl; Fokus MT-02/13/15/16/40/58/69 nur bei passender Hardware, sonst begründen | Noch vom Koordinator freizugeben; kein Altversionswechsel zum Zweck der Statistik | Optional erwartet / NICHT ERHALTEN | – | – | NOT TESTED / PENDING |

Kein Datum, tatsächlicher Alias, Issue oder PASS wird ohne Eingangsnachweis
ergänzt. Echte JSON-Dateien bleiben im ignorierten privaten Eingangsordner.
Kandidatenzuweisung ist wegen der bekannten Produktdependency-Befunde noch
eine separate Koordinatorentscheidung; eine öffentliche RC.7-Referenz ist
keine automatische Freigabe für produktive Systeme.

## Pilot-Exit nach echten Eingängen

| Kriterium | Aktueller Status |
|---|---|
| Mindestens zwei unabhängige echte HA-App-Tester, jeweils validierter JSON-Bericht | PENDING |
| Tatsächliche App-Version und Katalogversion/hash in jedem echten Bericht | PENDING |
| Ein echter Bericht exportiert, erneut importiert und vollständig erhalten | PENDING |
| Mehrere echte Berichte ohne Kollision/Versionsverlust aggregiert | PENDING |
| Rückmeldung, dass Menschen Anleitung und Statusdefinitionen verstanden haben | PENDING |
| Defekte nachvollziehbar an Issue/Repair Queue gebunden, Dubletten geprüft | PENDING |
| Keine kritische verbleibende Datenschutz-/Reportinglücke | PENDING – Werkzeugchecks ersetzen keine menschliche Evidenzprüfung |
| Koordinator reproduziert Befehle an echten, privaten Eingängen | PENDING |

Vollständige manuelle Abnahme: **PENDING**. Finales RC-/Stable-Gate:
**PENDING / BLOCKED BY EXISTING PRODUCT REQUIREMENTS**. Nach den Eingängen
zuerst Versionen/Kataloge und Datenschutz prüfen, Konflikte manuell klären,
Defekte zuordnen und erst dann über einen gezielten Hotfix oder die volle
manuelle Abnahme entscheiden. Kein weiterer Sprint startet automatisch.

## Manuelle Portal-/Übergabechecks

### PILOT-MANUAL-01 – echtes GitHub-Issue und Koordinatorübergabe

Status: **NOT TESTED**. Nur mit echtem, geprüften Pilotbericht ausführen.

1. Im Portal den echten Lauf fortsetzen, JSON exportieren und lokal sichern.
2. Bericht/Screenshots gemäß Datenschutzliste redigieren; Bestätigung setzen.
3. Zusammenfassung erstellen und „Testlauf auf GitHub melden“ öffnen.
4. Als berechtigter menschlicher Tester anmelden, tatsächliche Run-ID/Version/
   Umgebung/Zahlen eintragen und geprüfte Datei anhängen. Falls JSON abgelehnt:
   ZIP/TXT oder redigierter JSON-Codeblock. Keine Testdaten nur zum Prüfen posten.
5. Echtes Issue absenden, dessen URL beim Lauf hinterlegen und erneut exportieren.
6. Koordinator lädt denselben Bericht privat herunter, validiert ihn und ordnet
   vorhandene Defekt-Issues anhand Test-ID/Version/Reproduktion zu.

Erwartet: ein Run-Issue, unveränderte Test-IDs/Ergebnisse, korrelierbare Run-ID,
keine Secrets oder privaten Namen; keine automatische Issue-Erzeugung.
Fehler: Datei fehlt/beschädigt, falscher Lauf, verlorene Ergebnisse,
öffentliche Geheimnisse oder nicht nachvollziehbare Zuordnung.
Evidenz: bereinigte echte Issue-URL und lokales Validierungsprotokoll.
Ohne GitHub-Konto: vereinbarten privaten Übergabekanal verwenden und denselben
Validierungsschritt durchführen; keine erfundene E-Mail-Adresse.

### PILOT-MANUAL-02 – Gerätebrowser und menschliche Verständlichkeit

Status: **NOT TESTED** für reale macOS-Safari-/Tablet-/Telefonbedienung.

1. Öffne die öffentliche `/ha-legacy-dashboard/testing/`-Adresse im aktuellen
   Safari und auf einem verfügbaren modernen Tablet/Telefon.
2. Lege einen getrennten synthetischen Übungslauf an, aktiviere Pilot 27.4,
   suche MT-16 und lies Voraussetzungen, Schritte und Ergebnisregeln.
3. Speichere einen ausdrücklich künstlichen FAIL mit Erwartung, Beobachtung,
   Reproduktion und deutschen Umlauten; erfasse BLOCKED/N/A mit Begründung.
4. Lade neu, setze den Lauf fort, exportiere JSON, importiere und vergleiche.
5. Prüfe Hoch-/Querformat, Tastatur-/Touchbedienung und sichtbare Meldungen.
6. Gib dem Koordinator Rückmeldung zu unklaren Formulierungen. Kein öffentliches
   Issue für den Übungs-FAIL und keine HA-Steuerung aus diesem Übungslauf.

Erwartet: Schritte vollständig lesbar, Berichtsart erkennbar, keine
Ergebnisverluste, keine Überbreite, expliziter Export, kein Cloud-Backupversprechen.
Evidenz: anonymisierte Beobachtung, Browser/OS und private Exportdatei.

## Automatisierte Abschluss-Evidenz

Alle folgenden Ergebnisse sind **Tooling-Evidenz**, keine HA-App-/iPad-Abnahme.

| Befehl / Prüfung | Tatsächliches Ergebnis |
|---|---|
| `node scripts/testing/build-test-catalog.js --check` | PASS – 72 Quell-IDs = 72 generierte IDs; 72 vollständig, 0 ausgeschlossen/dupliziert; veröffentlichte Version `27.3-1c6d7088096c` unverändert |
| `node --test test/community-testing*.test.js` | PASS – 23/23, darunter Legacyformat, Metadaten, Roundtrip, Grenzwerte, feindliche Eingaben, Konfliktquarantäne, Dubletten, Provenienz, Querversionen und statische Links |
| `npm test` | PASS – 417/417 Tests, nur lokale Mocks/Fake-Credentials; kein Kontakt zu echtem HA |
| `node test/community-testing-browser.js` mit isoliertem Playwright 1.51.1 | PASS – Chromium 134.0.6998.35, 17 Prüfgruppen; Projekt-/Root-Pfad, elf Pilotfälle, fünf Status, Unicode, Reload, Import/Export, Bearbeitung importierter Exporte, getrennte Browserstores, XSS-/Konfliktschutz, Speicherfehler, 390/768/1280 px und Tastatur; 0 Seitenfehler/externen Requests |
| `node scripts/testing/run-pilot-validation.js test-results/pilot-27-4-001` | PASS – deterministischer Wrapper, erwartete Ablehnung beschädigter Fixture; Eingangs-/Ausgabedateien bleiben ignoriert/privat |
| `node --check` für zehn neue/geänderte JavaScript-Dateien | PASS |
| YAML-Parser: Pages-Workflow, bestehende Run-/Bug-Formulare | PASS; Formulare nicht doppelt angelegt oder öffentlich abgeschickt |
| `node release/secret-scan.js`, `node release/check-version.js`, `git diff --check` | PASS; unveränderter Produktversionsstand `1.0.0-rc.7` |

Der Offline-Satz enthält A/B mit RC.7, C mit RC.3 und altem Katalog,
unterschiedliche fiktive Core-/Architekturangaben, eine identische Dublette,
einen zusätzlichen Negativreport mit unbekannter MT-999 und eine kaputte Datei.
Die vier gültigen unabhängigen **synthetischen** Runs ergeben nur mit explizitem
Übungsflag PASS 8 / FAIL 5 / BLOCKED 2 / N/A 3 / NOT_TESTED 271. Das ist eine
Prüfsumme der Fixture, keine Community-Statistik. Der Normalaufruf zählt 0 Runs
und 0 PASS/FAIL. MT-16 hat in RC.7 getrennte PASS-/FAIL-Beobachtungen; MT-58
zwei künstliche FAIL-Runs. RC.3/Katalogabweichung und unbekannte ID bleiben sichtbar.
Eine Variante mit abweichendem Inhalt derselben Run-ID wird separat getestet:
alle Varianten erhalten, 0 gezählte Ergebnisse. Re-Export/Schlüsselreihenfolge
derselben Beobachtung zählt genau einmal. N/A/fehlende Hardware wird nie PASS.

Datenschutzgrenzen: keine Telemetrie, GitHub-PATs, HA-Abfragen, neue App-Rechte,
Rohzustandsuploads oder Reports in URLs. Eingaben sind Text, Issue-URLs auf das
Repository begrenzt; CLI-Ausgaben kontextuell escaped. Begrenzte BLOCKED/N/A-
Gründe können trotz Musterredaktion privat sein und erfordern menschliche Prüfung.
Alias/`manual` ist eine Selbstauskunft, keine verifizierte Identität.

### Geänderte Bereiche

- Portal: `testing/index.html`, `testing/js/report.js`, `testing/js/portal.js`,
  neue reine Auswahl `testing/js/pilot.js`; kein Legacy-Produktcode.
- Vertrag/Tools: `schemas/test-report.schema.json`,
  `scripts/testing/aggregate-test-reports.js`, `scripts/testing/build-site.js`,
  neuer `scripts/testing/run-pilot-validation.js`.
- Tests: `test/community-testing.test.js`, `test/community-testing-pilot.test.js`,
  `test/community-testing-browser.js`, zwei Dateien unter
  `test/fixtures/community-testing/`; vorhandener Pages-Workflow um Pilotchecks erweitert.
- Dokumentation: Sprint-27.4-Spezifikation, README DE/EN, Roadmap, ausschließlich
  neue Sprint-27.4-Abschnitte in Projektstatus/Repair Queue, Testeranleitungen,
  Koordinator, Datenformat, Datenschutz und neue Pilotplan-/Statusdateien.

Vorbestehende Owner-WIP in sechs Ergebnis-/Auditdokumenten und die 27.1-K-Datei
werden nicht mitcommittet. Keine Produktbilder ersetzt: sichtbare Änderung nur
im separaten Testportal, kein Produkt-Screenshotbedarf nach D1.

### Git / öffentliche Bereitstellung

Automatisches/Tooling-Gate bestanden. Implementierungscommit
`b497ad3303ea0df9112e376eb428c0267b33c12d`, Nachricht
`test: prepare community Test-Center pilot and report validation`, ist auf
`origin/main` gepusht. Das bestehende Pages-Verfahren
[39157990028](https://github.com/tekky85/ha-legacy-dashboard/actions/runs/39157990028)
bestand **Build und Deploy** auf genau diesem Commit. Kein zweites Hosting
oder App-Release. Öffentliche Adresse:
https://tekky85.github.io/ha-legacy-dashboard/testing/.

Nach Deployment geprüft: HTML, `js/report.js`, `js/portal.js`, `js/pilot.js`
und `data/test-catalog.json` liefern HTTP 200 und sind bytegenau identisch
mit dem getesteten lokalen Stand. Tool-Version 27.4 und die elf Pilot-IDs
sind damit öffentlich vorhanden. Das ist ein Live-HTTP-/Artefaktnachweis,
kein realer Safari-/iPad-/HAOS-/menschlicher Verständlichkeitstest.

Die getrennte normale [Produkt-CI 39157990015](https://github.com/tekky85/ha-legacy-dashboard/actions/runs/39157990015)
bestand Release-Testgate und reale Browser-Card-Matrix, scheiterte aber beim
unveränderten Produktionsdependency-Audit. Bundle/Container-Folgeschritte
wurden übersprungen. Dieser bekannte Produktblocker wird nicht verschwiegen,
nicht durch Portal-PASS aufgehoben und nicht in Sprint 27.4 repariert.

### Abschlussdaten und Quellen

- Ausgangspunkt: `main` auf `f027eebefce4a8aedb1f69424310b24cdac31852`.
- Kanonische Definitionen: `docs/audits/MANUAL_TEST_QUEUE.md` (committeter
  Snapshot, nicht die vorbestehenden lokalen Testergebnisänderungen).
  Generat: `testing/data/test-catalog.json`, 72 → 72, keine Ausschlüsse.
  Source-Commit `ea293c1343cf26a7320619db9f4aafc7cc9d483b`, Source-SHA256
  `e6ec859d2e31437f04ef347d4b8c1f0aa64bb871d22b7a4ecae92aab573d2265`;
  der davon verschiedene Definitionshash steht oben.
- Ausgewählte IDs: MT-02, MT-04, MT-13, MT-15, MT-16, MT-40, MT-50, MT-52,
  MT-53, MT-58, MT-69. Gründe, Aufwand, Zustimmung und N/A/BLOCKED-Regeln
  stehen im [Pilotplan](PILOT_PLAN.de.md), nicht in einem zweiten Katalog.
- Exportvertrag: Bericht 1.0 mit optionalen Zusatzfeldern; Aggregate 1.1.
  Alte 1.0-Berichte bleiben akzeptiert, andere Schemaversionen werden hilfreich
  abgewiesen. Unbekannte IDs/alte Kataloge bleiben mit Warnung erhalten.
- Übergabe: bestehendes Manual-Test-Run-Formular für den Lauf, Bug-Formular
  für einen unabhängig reproduzierbaren Defekt; manueller Privatkanal als
  Fallback ohne erfundene Kontaktadresse. Öffentliches Absenden noch NOT TESTED.
- [Deutsche Anleitung](TESTER_GUIDE.de.md), [englische Anleitung](TESTER_GUIDE.en.md),
  [Koordination/Befehle](TEST_COORDINATOR.md), [Datenvertrag](DATA_FORMAT.md),
  [Datenschutz](PRIVACY_AND_SECURITY.md); echte Eingänge in Abschnitt B hier.
- 27 Sprintdateien gezielt committed; die sechs fremden WIP-Dokumente und
  27.1-K-Datei bleiben uncommittet. Keine Rohreports, Secrets oder Produktbilder
  im Commit. Die Implementierungsdateien sind oben nach Bereichen aufgelistet.
- Tooling: **IMPLEMENTATION READY FOR HUMAN PILOT**. Echte Testpersonen,
  HA-App-/iPad-Abnahme, menschliche Verständlichkeit und vollständige
  RC-/Stable-Freigabe: **NOT TESTED / PENDING**, nicht „Pilot bestanden“.

Nächster Schritt: Kandidatenrisiko und sicheren Umfang mit dem Koordinator
klären, mindestens zwei echte unabhängige Tester einladen, tatsächliche
Versionen festhalten, geprüfte JSON-Dateien privat entgegennehmen. Danach
Validierung/Aggregation wiederholen und erst nach realer Rückmeldung über volle
manuelle Abnahme entscheiden. Bekannte Produktdependency-Befunde und der reale
Climate-/Touch-Befund werden nicht in diesem Sprint repariert oder geschlossen.
