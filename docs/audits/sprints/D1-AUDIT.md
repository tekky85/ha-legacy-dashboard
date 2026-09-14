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

PARTIAL – AUTOMATED REQUIREMENTS PASS / USER REVIEW NOT TESTED

Sprint 27.1-I hat die beiden Baselinebefunde behoben. Die semantisch parallelen
Sprachfassungen referenzieren dieselben 17 aktuellen PNGs; Sections, Room Card,
aktuelle Admin-/Systemansichten und Automation Diagnostics sind enthalten.
`test/capture-doc-screenshots.js` rendert die unveränderten produktiven
Frontenddateien reproduzierbar über localhost mit Demo-Payloads und Fake-
Credentials. Herkunft, Route, Viewport und Datenschutzprüfung sind in
`docs/screenshots/README.md` dokumentiert. `PROJECT_STATUS.md` bildet nun
Schema 12, Parts 01–19 und die aktuelle Dockerfile-/BuildKit-Verpackung ohne
`build.yaml` ab. Die ausdrücklich verlangte Nutzer-/Zweitsicht bleibt MT-29
`NOT TESTED`; deshalb bleibt die Gesamtbewertung formal `PARTIAL`.

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
| D1-S2 | Die neun geplanten Baseline-Dateien existieren | PASS | Dateiinventar und README-Linkcheck | Zusätzlich existieren acht spätere Produktbilder. |
| D1-S3 | Screenshot-Dateinamen sind klein und bindestrichbasiert | PASS | `find docs/screenshots`; Namensscan | Keine Zeitstempel-/Leerzeichen-Namen. |
| D1-S4 | Bildreferenzen sind konsistent und nicht kaputt | PASS | `test/sprint-27-1-i.test.js`: Root 1, DE 17, EN 17 | Alle referenzierten Pfade existieren; DE/EN-Mengen sind identisch. |
| D1-S5 | Produktbilder stammen aus echter Anwendung oder kontrolliertem Real-App-Mock | PASS | `test/capture-doc-screenshots.js`; `docs/screenshots/README.md` | Reproduzierbarer localhost-Harness verwendet unveränderte produktive Frontenddateien und normalisierte Demo-Payloads. |
| D1-S6 | Keine generierten Mockups als Produkt-Screenshots | PASS | Capture-Quellpfade und Manifest; visueller Abgleich | Die Anwendung wird im echten Browser gerendert; es werden keine Bildmockups erzeugt. |
| D1-S7 | Screenshots enthalten keine Tokens, IPs, privaten Namen, sensitiven Entities, Medien- oder Standortdaten | PASS | visuelle Prüfung aller 17 Bilder; String-/Privacy-Regression | Sichtbar sind ausschließlich generische Demo-Namen; keine Secrets oder Adressen. |
| D1-S8 | Screenshot-Dateiendung entspricht dem tatsächlichen Bildformat | PASS | PNG-Signatur-/Abmessungstest für 17 Dateien | Auch die vier früheren JPEG-in-PNG-Dateien sind echte PNGs. |
| D1-M1 | Sichtbare UI-Sprints prüfen/aktualisieren veraltete Bilder | PASS | 17 aktuelle Neuaufnahmen; Manifest | Footer, Navigation, aktuelle Admin-/Systemansichten und spätere UI sind enthalten. |
| D1-M2 | Sections und native Room Cards als spätere sichtbare Hauptfunktion auf Screenshot-Bedarf prüfen | PASS | `sections-room-card.png`, `sections.png`, `room-card-editor.png` | Runtime und Admin besitzen eigene aktuelle Nachweise. |
| D1-M3 | README-Bildtexte und empfohlene Struktur entsprechen der realen Galerie | PASS | README DE/EN plus Link-/Mengenprüfung | Bildtexte, Struktur und Dateien sind synchron. |
| D1-D1 | Datenschutz- und Screenshot-Pflegeregeln sind dokumentiert | PASS | README DE/EN „Screenshot-Pflege/Maintenance“ | Enthält alle verlangten Datenschutzpunkte. |
| D1-D2 | Dauerhafte Codex-Regel lebt in `AGENTS.md` oder Handoff | PASS | `AGENTS.md:463-474` | Sichtbare UI → Screenshotprüfung; DE/EN synchron; keine generierten Mockups. |
| D1-D3 | `docs/PROJECT_STATUS.md` wurde als technische Statusquelle gepflegt | PASS | aktueller Kopf/Schema-/Packagingabschnitt; `src/config/dashboard.js:24`; Auditindex | Schema 12, Parts 01–19, Batches A–I, Dockerfile/BuildKit und RC.3 stimmen mit dem aktuellen Stand überein. |
| D1-N1 | D1 verändert keine Produktfunktion, API, Regeln, Layout oder Writefläche | PASS | historischer D1-Commit `0881705`; aktueller Part-08-Diff | D1 legte Dokumentation/Verzeichnisse an; Part 08 ändert ebenfalls nur Auditdokumente. |
| D1-T1 | Sprach-, Link-, Screenshot-, Secret-, Security- und Legacy-Prüfungen | PASS | `test/sprint-27-1-i.test.js`, D1-/Security-/Legacytests, visuelle Erstprüfung | Technische Anforderungen und kontrollierte Neuaufnahme bestanden. |
| D1-MAN1 | Aktuelle reale/Mock-App-Galerie kontrolliert neu aufnehmen und freigeben | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-29 | Aufnahme und technische Erstprüfung sind erfolgt; ausdrückliche Nutzer-/Zweitsichtfreigabe steht aus. |

## README Parity Review

Beide vollständigen Fassungen besitzen dieselbe fachliche Reihenfolge:

1. Überblick und externe Architektur;
2. Installation und Zielplattform;
3. User Dashboards einschließlich Sections, Room Cards, Focus, Controls,
   Backgrounds, Theme, Navigation und iPad-Kiosk;
4. Admin, Summary, Errors, Regeln und Diagnostik;
5. Sicherheits- und Legacy-Grenzen;
6. identische 17-Bild-Galerie und Wartungsregeln;
7. Entwicklung, Tests, Deployment, Releases, Status und Gegenlink.

Die Linkmengen sind bis auf den absichtlich entgegengesetzten Sprachlink
identisch. Es wurden keine schnelllebigen Testzahlen oder Commit-IDs in den
READMEs gefunden.

## Screenshot Audit – Ausgangsbefund Part 08

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

## Documentation Accuracy Finding – Ausgangsbefund Part 08

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

## Sprint-27.1-I-Re-Audit

- Reproduzierbarer Browserlauf: 17/17 PNG-Dateien erzeugt.
- Runtime: Light/Dark, Background, Compact, Focus, Sections und Room Card.
- Admin: Management, Background, Sections, Layout, Live Preview, Room Editor,
  Entity Rules und Diagnostic Sources.
- System: Summary, Errors sowie Automation Impact/Advanced Diagnostics.
- DE/EN: identische 17 Bildpfade; Root-README und Manifestlinks gültig.
- Datenschutz: keine Produktions-`.env`, kein reales HA, keine sichtbaren oder
  eingebetteten Token-/IP-/Privatmarker.
- `RQ-08-02`: **CODE CLOSED / MANUAL PENDING**.
- `RQ-08-03`: **CLOSED**.
- MT-29: ausdrückliche Nutzer-/Zweitsicht bleibt `NOT TESTED`.
- Tests: 4/4 I-spezifisch, 389/389 Gesamtsuite und 1.576/1.576
  Card-Matrix-Browserfälle PASS.

## Automated and Manual Evidence

- Root-README: 1/1 Bildpfad vorhanden;
- deutsche README: 17/17 Bildpfade vorhanden;
- englische README: 17/17 Bildpfade vorhanden;
- DE/EN: je 20 Links, identisch bis auf Gegenlink;
- alle 14 Bilder visuell auf sichtbare sensible Daten geprüft;
- String-/Metadatenscan ohne Token, interne URL oder Standortmetadaten;
- alle 17 Dateien besitzen echte PNG-Signatur und lesbare Abmessungen;
- Git-Historie ordnet jedes Bild einem dokumentierten UI-Commit zu;
- Aufnahme/automatische Prüfung abgeschlossen; Nutzer-/Zweitsicht bleibt
  MT-29 `NOT TESTED`.

## Findings

- `BROKEN`: keine verbleibende automatisierbare D1-Anforderung.
- `PARTIAL`: nur die noch ausstehende ausdrückliche Nutzer-/Zweitsicht.
- `MISSING`: keine.
- `NOT TESTED`: MT-29.

## Final Assessment

Sprint D1 erfüllt nach 27.1-I sämtliche automatisierbaren Dokumentations-,
Galerie-, Format-, Herkunfts- und Statusanforderungen. Die Gesamtbewertung
bleibt ausschließlich wegen MT-29 `PARTIAL`; nach ausdrücklicher Nutzer- oder
zweiter Sichtprüfung kann sie ohne weiteren Code-Repair auf `PASS` wechseln.
