# Sprint D1 Audit

## Audit Metadata

- Sprint: D1
- Sprint title: Bilingual Documentation & Screenshot Baseline
- Audit date: 7. September 2026
- Repository commit: `09422e0`
- Spec file: [`docs/sprints/SPRINT-D1.md`](../../sprints/SPRINT-D1.md)
- Working tree at Part-08 start: kein veränderter Anwendungscode; nur
  ausstehende Auditdokumente aus Part 06/07 und Part-Prompts.

## Overall Result

PARTIAL

Das dreiteilige README-Modell, die semantisch parallelen vollständigen
Sprachfassungen, die Screenshot-Verzeichnisstruktur, alle vorgesehenen
Baseline-Dateien, die Sicherheits-/Legacy-Erklärung und die dauerhafte
Wartungsregel sind vorhanden. Alle 29 geprüften README-Bildreferenzen lösen
auf existierende Dateien auf; die Sprachfassungen verwenden dieselben 14
Produktbilder und dieselben fachlichen Kapitel.

Die Baseline ist aktuell jedoch nicht releasefertig gepflegt. Mehrere Bilder
zeigen sichtbar einen älteren Produktstand, obwohl spätere Sprints Sections,
Room Cards, Entity Rule Manager, neue Navigation und Footer geändert haben.
Insbesondere `compact-cards.png` zeigt noch den später entfernten
Versionsfooter, und mehrere Adminbilder zeigen die alten großen Summary-/Error-
Auswahllisten statt des aktuellen Editors. Ein aktueller Sections-/Room-Card-
Nachweis fehlt. Vier Dateien tragen außerdem `.png`, enthalten aber JPEG-
Daten. Schließlich beschreibt `docs/PROJECT_STATUS.md` noch Schema 11 und
Auditfortschritt bis Part 02, obwohl der Code Schema 12 und der Auditindex
Parts 01–08 ausweist. Diese Befunde stehen als `RQ-08-02` und `RQ-08-03` in
der Reparaturwarteschlange.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| D1-R1 | Kompakte Root-README mit Projektname, Kurzbeschreibung und Sprachwahl | PASS | `README.md` | Verlinkt Deutsch, Englisch, Deployment, Releases und ein existierendes Leitbild. |
| D1-R2 | Vollständige `README.de.md` und gleichwertige `README.en.md` | PASS | beide Dateien; Kapitel-/Linkvergleich | Beide enthalten Überblick, Architektur, Features, Security, Legacy, Screenshots, Entwicklung, Tests, Deployment und Status. |
| D1-R3 | Deutsche README verlinkt Englisch und umgekehrt | PASS | `README.de.md:644`; `README.en.md:622` | Nur der jeweilige Gegenlink unterscheidet die ansonsten parallelen Linkmengen. |
| D1-R4 | Beide Sprachfassungen bleiben semantisch synchron | PASS | Kapitel-, Codeblock-, Link- und Bildpfadvergleich | 20 Links je Fassung; die einzige absichtliche Differenz ist der Gegenlink. |
| D1-R5 | Keine schnell veraltenden Testzahlen, Commit-IDs oder temporären Sprintstände im README | PASS | statischer README-Scan | Produktparameter wie Regelzeiten und Release-/Runtimeanforderungen sind fachliche Konfiguration, keine Laufstatistik. |
| D1-A1 | Externe Node.js-/Express-Gatewayarchitektur korrekt beschrieben | PASS | README DE/EN; aktueller `src/server.js`/HA-Adapter | Standalone und HA-App behalten Tokens backend-only. |
| D1-A2 | Zielplattform Safari iOS 9/ES5 korrekt beschrieben | PASS | README Legacy-Kapitel; AGENTS; Part-08-Legacy-Scan | Keine moderne Wall-Runtime versprochen. |
| D1-A3 | User Dashboard, Admin, Summary und Errors dokumentiert | PASS | README DE/EN Hauptfunktionen | Spätere Funktionen sind semantisch synchron ergänzt. |
| D1-A4 | Sicherheitsmodell entspricht aktueller Architektur | PASS | README Security-Kapitel; Gateway-/Securitytests | Keine generische HA-Service-API, Browser-HA-Verbindung oder implizite Write-Autorisierung behauptet. |
| D1-S1 | Verzeichnisstruktur `dashboards/`, `admin/`, `system/` existiert | PASS | `docs/screenshots/*` | Alle drei Verzeichnisse enthalten Bilder. |
| D1-S2 | Die neun geplanten Baseline-Dateien existieren | PASS | Dateiinventar und README-Linkcheck | Zusätzlich existieren fünf spätere Produktbilder. |
| D1-S3 | Screenshot-Dateinamen sind klein und bindestrichbasiert | PASS | `find docs/screenshots`; Namensscan | Keine Zeitstempel-/Leerzeichen-Namen. |
| D1-S4 | Bildreferenzen sind konsistent und nicht kaputt | PASS | automatisierter Existenzcheck: Root 1, DE 14, EN 14 | Alle referenzierten Pfade existieren. |
| D1-S5 | Produktbilder stammen aus echter Anwendung oder kontrolliertem Real-App-Mock | PARTIAL | Git-Historie der Bildcommits; README-/Projektstatus-Provenienz; visueller Abgleich | Dateien allein beweisen keine Laufzeitprovenienz; aktuelle kontrollierte Neuaufnahme wird als MT-29 dokumentiert. |
| D1-S6 | Keine generierten Mockups als Produkt-Screenshots | PARTIAL | dokumentierte Capture-Regel und Historie; visueller Abgleich mit realem UI | Keine Gegenevidenz, aber ohne reproduzierbaren Capture-Nachweis nicht vollständig unabhängig verifizierbar. |
| D1-S7 | Screenshots enthalten keine Tokens, IPs, privaten Namen, sensitiven Entities, Medien- oder Standortdaten | PASS | visuelle Prüfung aller 14 Bilder; String-/Metadatenscan | Sichtbar sind generische Demo-/Raumnamen; keine Secrets oder Adressen. |
| D1-S8 | Screenshot-Dateiendung entspricht dem tatsächlichen Bildformat | PARTIAL | `file`/`sips` | `entity-rules.png`, `system-diagnostics.png`, `errors.png`, `errors-automation-impact.png` sind tatsächlich JPEG. Teil von `RQ-08-02`. |
| D1-M1 | Sichtbare UI-Sprints prüfen/aktualisieren veraltete Bilder | BROKEN | Bild-Commit-Historie und visuelle Prüfung | Mehrere Bilder stammen von vor Sprint 21.4/21.5/25.3/26/26.1 und zeigen nachweislich entfernte/ersetzte UI. `RQ-08-02`. |
| D1-M2 | Sections und native Room Cards als spätere sichtbare Hauptfunktion auf Screenshot-Bedarf prüfen | BROKEN | README dokumentiert beide; Galerie enthält keinen Sections-/Room-Card-Screenshot | Dauerhafte Regel wurde bei Sprint 26/26.1 nicht vollständig umgesetzt. `RQ-08-02`. |
| D1-M3 | README-Bildtexte und empfohlene Struktur entsprechen der realen Galerie | PARTIAL | README Screenshot-/Strukturkapitel | Links funktionieren, aber die Galerie wird als „aktuell“ bezeichnet, obwohl einige Aufnahmen veraltet sind und vier Formate falsch benannt sind. |
| D1-D1 | Datenschutz- und Screenshot-Pflegeregeln sind dokumentiert | PASS | README DE/EN „Screenshot-Pflege/Maintenance“ | Enthält alle verlangten Datenschutzpunkte. |
| D1-D2 | Dauerhafte Codex-Regel lebt in `AGENTS.md` oder Handoff | PASS | `AGENTS.md:463-474` | Sichtbare UI → Screenshotprüfung; DE/EN synchron; keine generierten Mockups. |
| D1-D3 | `docs/PROJECT_STATUS.md` wurde als technische Statusquelle gepflegt | BROKEN | `PROJECT_STATUS.md:13-16,287-319`; `AUDIT_INDEX.md`; `src/config/dashboard.js:24` | Status nennt Audit nur bis Part 02 und Schema 11; aktuell sind Parts 01–08 abgeschlossen und Schema 12. `RQ-08-03`. |
| D1-N1 | D1 verändert keine Produktfunktion, API, Regeln, Layout oder Writefläche | PASS | historischer D1-Commit `0881705`; aktueller Part-08-Diff | D1 legte Dokumentation/Verzeichnisse an; Part 08 ändert ebenfalls nur Auditdokumente. |
| D1-T1 | Sprach-, Link-, Screenshot-, Secret-, Security- und Legacy-Prüfungen | PARTIAL | automatisierte Link-/Pfad-/Format-/Textscans plus visuelle Bildprüfung | Technische Checks bestanden; aktuelle Real-App-Neuaufnahme/Provenienz bleibt MT-29. |
| D1-MAN1 | Aktuelle reale/Mock-App-Galerie kontrolliert neu aufnehmen und freigeben | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-29 | Keine Screenshots wurden in diesem Baseline-Audit erfunden oder ersetzt. |

## README Parity Review

Beide vollständigen Fassungen besitzen dieselbe fachliche Reihenfolge:

1. Überblick und externe Architektur;
2. Installation und Zielplattform;
3. User Dashboards einschließlich Sections, Room Cards, Focus, Controls,
   Backgrounds, Theme, Navigation und iPad-Kiosk;
4. Admin, Summary, Errors, Regeln und Diagnostik;
5. Sicherheits- und Legacy-Grenzen;
6. identische 14-Bild-Galerie und Wartungsregeln;
7. Entwicklung, Tests, Deployment, Releases, Status und Gegenlink.

Die Linkmengen sind bis auf den absichtlich entgegengesetzten Sprachlink
identisch. Es wurden keine schnelllebigen Testzahlen oder Commit-IDs in den
READMEs gefunden.

## Screenshot Audit

### Vorhandene und weiterhin brauchbare Nachweise

- `main-light.png`, `main-dark.png` und `background-image.png` zeigen
  unterstützte User-Dashboard-Zustände ohne Produktionsdaten.
- `entity-rules.png`, `system-diagnostics.png`, `summary.png`, `errors.png`
  und `errors-automation-impact.png` bilden neuere Produktbereiche ab.
- Alle Bilder sind 768×720 bis 1440×1000 Pixel groß und visuell lesbar.

### Veraltet oder unvollständig

- `compact-cards.png` zeigt noch `HA Legacy Dashboard v1.0.0` im Wall-Footer;
  der sichtbare Versionsfooter wurde in Sprint 25.3 entfernt. Außerdem fehlt
  die später verpflichtende Summary-Navigation.
- `focus-card.png` stammt vor den 17.6/17.7-Control-Härtungen und vor der
  späteren Headernavigation; die aktuelle Geometrie ist neu aufzunehmen.
- `dashboard-management.png`, `layout-editor.png` und `live-preview.png`
  zeigen die großen alten Summary-/Error-Auswahlfelder und keinen aktuellen
  Sections-/Room-Card-Editor.
- `dashboard-background.png` zeigt zwar Entity Rule Manager und Background,
  aber nicht die späteren Sections/Room Cards.
- Ein eigener aktueller Nachweis für Sections und native Room Cards fehlt.

### Formatabweichung

Die folgenden `.png`-Pfade enthalten JPEG/JFIF-Bytes:

- `docs/screenshots/admin/entity-rules.png`
- `docs/screenshots/admin/system-diagnostics.png`
- `docs/screenshots/system/errors.png`
- `docs/screenshots/system/errors-automation-impact.png`

Browser können diese Dateien derzeit anzeigen, die Erweiterung ist aber für
Content-Type-Prüfung, Download, Bildwerkzeuge und dauerhafte Wartung
irreführend. Die Reparatur soll entweder echte PNGs erzeugen oder Dateien und
README-Links konsistent auf `.jpg` umstellen.

## Documentation Accuracy Finding

`docs/PROJECT_STATUS.md` ist historisch ausführlich, aber sein aktueller Kopf
ist nicht mehr verlässlich:

- Er erklärt weiterhin, Part 01/02 seien auditiert und Sprint 17+ noch nicht,
  während der Auditindex Parts 01–08 abgeschlossen hat.
- Der Überblick beschreibt Schema 11, während
  `src/config/dashboard.js:24` aktuell Schema 12 definiert.
- Der Root-/Sprach-README verweist diese Datei als „Technical status“;
  dadurch ist die Abweichung benutzerrelevant.

Das wird als `RQ-08-03` dokumentiert und in diesem Baseline-Audit nicht
repariert.

## Automated and Manual Evidence

- Root-README: 1/1 Bildpfad vorhanden;
- deutsche README: 14/14 Bildpfade vorhanden;
- englische README: 14/14 Bildpfade vorhanden;
- DE/EN: je 20 Links, identisch bis auf Gegenlink;
- alle 14 Bilder visuell auf sichtbare sensible Daten geprüft;
- String-/Metadatenscan ohne Token, interne URL oder Standortmetadaten;
- vier Format-/Endungsabweichungen gefunden;
- Git-Historie ordnet jedes Bild einem dokumentierten UI-Commit zu;
- aktuelle Real-App-Neuaufnahme bleibt MT-29 `NOT TESTED`.

## Findings

- `BROKEN`: Screenshotpflege nach späteren sichtbaren Sprints und aktueller
  Projektstatus (`RQ-08-02`, `RQ-08-03`).
- `PARTIAL`: nachweisbare aktuelle Screenshot-Provenienz, vier falsche
  Dateiendungen und die Aussage „aktuelle Galerie“.
- `MISSING`: kein Pflichtpfad aus der ursprünglichen Neun-Bild-Baseline; ein
  aktueller Sections-/Room-Card-Nachweis fehlt als spätere Wartungsanforderung.
- `NOT TESTED`: MT-29.

## Final Assessment

Sprint D1 hat ein brauchbares zweisprachiges Dokumentationsfundament, erfüllt
aber seine eigene dauerhafte Pflegepflicht im heutigen Repository nicht
vollständig. Nach aktueller Neuaufnahme/Formatkorrektur und Aktualisierung der
technischen Statusquelle kann D1 erneut auf `PASS` geprüft werden.
