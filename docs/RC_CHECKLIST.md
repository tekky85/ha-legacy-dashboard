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
| `1.0.0-rc.3` | `v1.0.0-rc.3` | `771683b804f0b7c684eb3d457b58fb579a3ccdb6` | Historischer vollständiger Public Test Release |
| `1.0.0-rc.4` | `v1.0.0-rc.4` | `fe99fd6f046a8db87835b03757c9b4d292b768ea` | Taghistorie; Validierung fehlgeschlagen, kein Release/Image |
| `1.0.0-rc.5` | `v1.0.0-rc.5` | `188db0def88cdd5b315e3036b82fc53463a508e6` | Taghistorie; Publish-Jobs übersprungen, kein Release/Image |
| `1.0.0-rc.6` | `v1.0.0-rc.6` | `5ab15ae774c0d5b2a6d3b01607c4290f79222a41` | Taghistorie; Architekturimages ohne Manifest/Release |
| `1.0.0-rc.7` | `v1.0.0-rc.7` | `2507f6955b17740da8edbd36925b3338ca080383` | Aktueller vollständiger Public Test Release |

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

Der aktive öffentliche Release ist `1.0.0-rc.7`. Der Tag zeigt exakt auf den
aktuellen Releasecommit. GitHub-Prerelease, Multi-Arch-Manifest,
Standalone-Artefakt und der generierte Kandidatennachweis wurden im Workflow
`34838365619` gemeinsam erzeugt.

`release/check-version.js --check-source` erkennt diesen Zustand: Sobald
release-relevante Dateien nach dem bereits gebundenen Versionstag geändert
wurden, verlangt das Gate vor einer neuen Veröffentlichung eine neue Version.
Beim Tagworkflow muss der erwartete Tag exakt auf `HEAD` zeigen. Zusätzlich
bricht der Workflow ab, wenn GitHub Release oder GHCR-Manifest für die Version
bereits existieren.

RC.4 bis RC.6 bleiben unverändert als Nachweis der beim realen Publish
gefundenen Pipelinefehler. Kein Tag wurde verschoben oder wiederverwendet.

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
| Veröffentlichte RC.7-Identität | PASS | Tag `v1.0.0-rc.7`, Commit `2507f6955b17740da8edbd36925b3338ca080383`. |
| Formale aktive Versionsstrings | PASS | Paket, Lockfile, App, Release-Metadaten und Anzeigen nennen RC.7. |
| Aktueller Source-Stand entspricht RC.7 | PASS | Source-/Tag-Gate bestätigt die exakte Bindung. |
| Neuer Kandidatencommit und Tag | PASS | Unveränderlicher Tag RC.7 auf dem geprüften Commit. |
| Neues GHCR-Multi-Arch-Manifest | PASS | Digest `sha256:050044307676e5263652e609379bd8eb331bc76a41a8341fb06f88320380037e`; amd64 und arm64 validiert. |
| Neues Standalone-Artefakt/Checksumme | PASS | SHA256 `eac0df3c709d4663819167fe0eb1eff23164b40e92f103f691d7550f7eccfa10`; heruntergeladen und erneut geprüft. |
| Kandidatenbezogener Workflowlauf | PASS | GitHub Actions `34838365619`, alle Releasejobs erfolgreich. |
| Automatisches RC-Evidenzformat | PASS | Generator und Workflow binden Commit, Tag, Manifestdigest, Bundlechecksum und Workflow-ID; Negativtests vorhanden. |
| Standalone/LXC des nächsten Kandidaten | NOT TESTED | MT-55/56. |
| Home Assistant App amd64 | NOT TESTED | MT-50–52/55. |
| Home Assistant App aarch64 | NOT TESTED | MT-53/55. |
| iPad mini / iOS 9 | NOT TESTED | MT-54 sowie die zugeordneten UI-/Kiosktests. |
| Stable-Promotion | BLOCKED | Reale Pflichtresultate und geschütztes Stable-Gate müssen für denselben Kandidaten PASS sein. |
| Aktuelle RC-Empfehlung | BLOCKED | Der Kandidat ist vollständig veröffentlicht; reale LXC-/HAOS-/iPad-Abnahmen fehlen noch. |

## RC BLOCKERS

1. MT-55 gegen Workflow, GHCR-Manifest, GitHub-Prerelease und Checksummen
   durchführen.
2. MT-56 mit dem veröffentlichten Standalone-Artefakt durchführen.
3. MT-50 bis MT-54 und weitere betroffene HAOS-/iPad-Prüfungen mit exakt
   demselben Kandidaten durchführen.
4. Vor Stable müssen alle in `release/stable-gate-policy.json` geforderten
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
