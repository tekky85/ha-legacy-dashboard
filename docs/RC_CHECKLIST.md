# RC Checklist

Stand: 14. September 2026

Diese Datei ist die lebende Einstiegseite für Release-Candidate-Abnahmen. Sie
vermischt keine Ergebnisse verschiedener Commits, Images oder Laufzeiten mehr.
Ein konkreter Kandidat gilt nur dann als identifiziert, wenn Version, Tag,
Source-Commit, Image-Manifestdigest, Standalone-Checksumme und Workflowlauf
gemeinsam in einem vom Releaseworkflow erzeugten Nachweis stehen.

Zulässige Ergebniswerte sind ausschließlich:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT TESTED`

`PASS` darf nur aus Evidenz für exakt denselben Kandidaten abgeleitet werden.
Lokale Mocks ersetzen weder LXC-/HAOS-Laufzeit noch das physische iPad.

## Veröffentlichte unveränderliche Historie

| Version | Tag | Source-Commit | Einordnung |
|---|---|---|---|
| `1.0.0-rc.1` | `v1.0.0-rc.1` | `741bba41d8ffc34cba4c7643f2e2b777f2e6501e` | Historischer erster Public Test Release |
| `1.0.0-rc.2` | `v1.0.0-rc.2` | `dd592da` | Historischer Public Test Release; plattformabhängiges gzip-Informationsbyte |
| `1.0.0-rc.3` | `v1.0.0-rc.3` | `771683b804f0b7c684eb3d457b58fb579a3ccdb6` | Aktueller veröffentlichter Public Test Release |

Kein bestehender Tag, Release oder GHCR-Versionstag darf verschoben,
überschrieben oder für einen neueren Quellstand wiederverwendet werden.

## Historische RC.1-Evidenz

Die ursprüngliche Sprint-25.4-Abnahme gehört ausschließlich zu:

| Merkmal | Historischer Wert |
|---|---|
| Version/Tag | `1.0.0-rc.1` / `v1.0.0-rc.1` |
| Source-Commit | `741bba41d8ffc34cba4c7643f2e2b777f2e6501e` |
| Image | `ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.1` |
| Release-Workflow | GitHub Actions Run `33203376391` |
| Test-Workflow | GitHub Actions Run `33203376334` |
| Standalone-Checksumme | `c7db4e1874334195aaf00147f5a58e6d46b31cc3c14cfbb04c93c3c96880d984` |

Der vollständige damalige Text bleibt unveränderlich im Git-Tag
`v1.0.0-rc.1` nachvollziehbar. Spätere LXC-Stände, höhere Testzahlen,
Sprint-25.5/25.6-Ergebnisse oder heutige Dependency-Audits sind keine
RC.1-Evidenz und werden hier nicht hineingerechnet.

Die reale Buildquelle war und ist
`ha_legacy_dashboard/Dockerfile` mit Root-Buildkontext. Die frühere Formulierung
„Root-Dockerfile“ war sachlich falsch. Aktuelle Aussagen über Dependencies
werden nur aus dem Gate des jeweiligen neuen Kandidaten übernommen.

## Aktueller Entwicklungsstand

Der aktive öffentliche Release bleibt `1.0.0-rc.3`. Der Repository-HEAD enthält
neuere Reparaturen. Er ist deshalb noch kein neuer veröffentlichter Kandidat
und darf nicht als RC.3 ausgegeben werden.

`release/check-version.js --check-source` erkennt diesen Zustand: Sobald
release-relevante Dateien nach dem bereits gebundenen Versionstag geändert
wurden, verlangt das Gate vor einer neuen Veröffentlichung eine neue Version.
Beim Tagworkflow muss der erwartete Tag exakt auf `HEAD` zeigen. Zusätzlich
bricht der Workflow ab, wenn GitHub Release oder GHCR-Manifest für die Version
bereits existieren.

Die nächste freie Versionsnummer nach RC.3 ist `1.0.0-rc.4`. Sie ist erst dann
ein Kandidat, wenn alle aktiven Versionsquellen in einem eigenen Releasecommit
konsistent aktualisiert und dieser Commit unveränderlich als
`v1.0.0-rc.4` getaggt wurde. Diese Checkliste behauptet weder einen noch nicht
existierenden Commit noch ein noch nicht veröffentlichtes Image.

## Commit- und artefaktgebundener Nachweis

Ein erfolgreicher künftiger Releaseworkflow erzeugt und veröffentlicht:

- `rc-result.json`
- `rc-result.md`

Beide werden erst nach Versions-, Source-, Test-, Manifest-, Smoke- und
Checksum-Gate erzeugt. Sie enthalten genau einen:

- Source-Commit,
- Git-Tag,
- versionierten Image-Namen,
- GHCR-Manifestdigest,
- Standalone-Artefaktnamen,
- Standalone-SHA256,
- GitHub-Actions-Workflowlauf.

LXC, HAOS amd64, HAOS aarch64 und iPad mini/iOS 9 beginnen im generierten
Nachweis immer als `NOT TESTED`. Reale Ergebnisse dürfen erst danach gegen
genau diese Identität ergänzt werden. Der generierte Ausgangsnachweis bleibt
als Release-Asset unverändert.

## RC Result Matrix – heutiger Stand

| Bereich | Status | Nachweis/Blocker |
|---|---|---|
| Veröffentlichte RC.3-Identität | PASS | Tag `v1.0.0-rc.3`, Commit `771683b`, publizierter Release bleibt unverändert. |
| Formale aktive Versionsstrings | PASS | Paket, Lockfile, App, Release-Metadaten und Anzeigen nennen weiterhin den veröffentlichten RC.3. |
| Aktueller Source-Stand entspricht RC.3 | FAIL | Release-relevante Reparaturen liegen nach dem unveränderlichen RC.3-Tag; Source-Gate weist Wiederverwendung ab. |
| Neuer Kandidatencommit und Tag | NOT TESTED | Für diesen Reparaturlauf wird kein neuer Releasecommit/Tag erzeugt. |
| Neues GHCR-Multi-Arch-Manifest | NOT TESTED | Keine Veröffentlichung in Sprint 27.1-J. |
| Neues Standalone-Artefakt/Checksumme | NOT TESTED | Keine Veröffentlichung in Sprint 27.1-J. |
| Kandidatenbezogener Workflowlauf | NOT TESTED | Wird erst durch einen neuen Tag gestartet. |
| Automatisches RC-Evidenzformat | PASS | Generator und Workflow binden Commit, Tag, Manifestdigest, Bundlechecksum und Workflow-ID; Negativtests vorhanden. |
| Standalone/LXC des nächsten Kandidaten | NOT TESTED | MT-55/56. |
| Home Assistant App amd64 | NOT TESTED | MT-50–52/55. |
| Home Assistant App aarch64 | NOT TESTED | MT-53/55. |
| iPad mini / iOS 9 | NOT TESTED | MT-54 sowie die zugeordneten UI-/Kiosktests. |
| Stable-Promotion | BLOCKED | Reale Pflichtresultate und geschütztes Stable-Gate müssen für denselben Kandidaten PASS sein. |
| Aktuelle RC-Empfehlung | BLOCKED | Noch kein neuer unveränderlicher Kandidat und keine kandidatenbezogene Realabnahme. |

## RC BLOCKERS

1. Die nächste freie Version in allen aktiven Versionsquellen konsistent setzen,
   als eigenen Commit reviewen und diesen exakten Commit einmalig taggen.
2. Den Releaseworkflow vollständig ausführen; `rc-result.json` und
   `rc-result.md` müssen dieselbe Commit-/Tag-/Image-/Bundleidentität tragen.
3. MT-55 gegen Workflow, GHCR-Manifest, GitHub-Prerelease und Checksummen
   durchführen.
4. MT-56 mit dem veröffentlichten Standalone-Artefakt durchführen.
5. MT-50 bis MT-54 und weitere betroffene HAOS-/iPad-Prüfungen mit exakt
   demselben Kandidaten durchführen.
6. Vor Stable müssen alle in `release/stable-gate-policy.json` geforderten
   Manuelltests `PASS` sein und die kanonische Repair Queue darf keine offenen
   P0/P1-Reparaturen enthalten.

Solange diese Punkte offen sind, bleibt die Empfehlung `BLOCKED`. Eine grüne
lokale Testsuite allein ist keine RC- oder Stable-Freigabe.

## Ablauf für den nächsten Kandidaten

1. Arbeitsbaum und geplanten Inhalt reviewen.
2. Nächste freie RC-Version in allen aktiven Versionsquellen setzen und eigene
   Release Notes erstellen.
3. `node release/check-version.js --check-source` ausführen; vor dem neuen Tag
   muss die neue Version noch ungebunden sein.
4. Den Versionscommit pushen und genau diesen Commit einmalig taggen.
5. Releaseworkflow abwarten und die erzeugten `rc-result.*`-Assets prüfen.
6. Erst danach die detaillierten manuellen Testanleitungen aus
   `docs/audits/MANUAL_TEST_QUEUE.md` ausführen.
7. Ergebnisse nicht in den historischen Ausgangsnachweis hineinändern, sondern
   kandidatenbezogen ergänzen und erst nach vollständigem Gate promoten.
