# Sprint 21.4 Audit

## Audit Metadata

- Sprint: 21.4
- Sprint title: System Dashboard Configuration & Header Simplification
- Audit date: 7. September 2026
- Repository commit: `bbc30fa`
- Spec file: [`docs/sprints/SPRINT-21.4.md`](../../sprints/SPRINT-21.4.md)
- Working tree at Part-11 start: Anwendungscode unverändert; nicht committete
  Auditdokumente aus Parts 09/10 sowie die bereitgestellten Part-09-/10-/11-
  Prompts waren vorhanden und wurden vollständig bewahrt.

## Overall Result

PARTIAL

Der aktuelle Entity Rule Manager ersetzt die früheren drei Massendropdowns
durch genau einen clientseitig durchsuch- und filterbaren Index. Jede Entity
erscheint einmal und bearbeitet Summary-Ignore, Security Relevant und
Error-Ignore in demselben lokalen Admin-Entwurf. Speichern nutzt genau den
bestehenden geschützten Konfigurations-Write, Verwerfen stellt den gespeicherten
Entwurf wieder her. Summary und Errors teilen eine kompakte Headerstruktur und
zeigen die dominante Gesamtzahl nur einmal.

Der fachliche Endzustand ist vorhanden. `PARTIAL` entsteht durch den bekannten
P1-Cache-Buster-Befund `RQ-04-01`, die nicht vollständig einzeln
rückverfolgbare 75-Punkte-Testmatrix (`RQ-11-01`), veraltete Screenshots
(`RQ-08-02`) und noch ausstehende reale Safari-/Tablet-/iPad-Abnahmen. Kein
neuer fachlicher Laufzeit- oder Sicherheitsdefekt wurde gefunden.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 21.4-SEC1 | HA- und Supervisor-Token bleiben ausschließlich im Backend | PASS | `src/services/homeassistant.js`; `src/services/ha-connection.js`; `test/security.test.js` | Public- und Admin-Payloads enthalten keine HA-Credentials. |
| 21.4-SEC2 | Kein Browser-zu-HA-WebSocket, generischer Serviceproxy oder Registry-/Label-/Repair-Write | PASS | `src/routes/system-dashboards.js`; `src/routes/admin.js`; Security-Scan und -Tests | Systemrouten sind GET-only; Admin schreibt nur validierte Dashboardkonfiguration. |
| 21.4-SEC3 | Entity-Regeln erzeugen keine HA-Control-Freigabe | PASS | `src/admin/js/system-dashboards.js:setEntityRule()`; `src/services/control-authorization.js`; Sprint-26.2-Regression | `securityEntities` und Ignore-Listen bleiben von `controlGrants` getrennt. |
| 21.4-SEC4 | Admin-Auth, Rate-/Payload-Limits, Header und Secret-Redaction bleiben erhalten | PASS | `src/routes/admin.js`; `src/server.js`; `test/admin-api.test.js`; `test/security.test.js` | Bestehende geschützte Admin-API wird wiederverwendet. |
| 21.4-ARCH1 | Bestehende persistente Feldnamen und Konfigurationsstruktur bleiben erhalten | PASS | `systemDashboards.summary.ignoredEntities`; `systemDashboards.errors.securityEntities/ignoredEntities`; Config-Migrationstests | Keine parallele Datenstruktur und keine unnötige semantische Migration. |
| 21.4-ERM1 | Ein gemeinsamer Entity Rule Manager ersetzt drei große Dropdowns | PASS | `src/admin/index.html#entityRulesDialog`; `src/admin/js/app.js:renderEntityRules()` | Alte Einzel-Mehrfachauswahlfelder sind nicht mehr die Bearbeitungsoberfläche. |
| 21.4-ERM2 | Jede Entity erscheint genau einmal mit drei direkt zugeordneten Regeln | PASS | `createEntityRuleCard()`; `entity-rules.js:createIndex()` | Eine Karte enthält Summary Ignore, Security Relevant und Error Ignore. |
| 21.4-ERM3 | Friendly Name, Entity-ID, Area, Device und Domain werden kompakt angezeigt | PASS | `createEntityRuleCard()`; `test/sprint-21-4.test.js` | Keine Raw-Registry-Verbindungen, MACs, Seriennummern oder Identifier. |
| 21.4-ERM4 | Suche matcht Friendly Name, Entity-ID, Device, Area und Domain | PASS | `entity-rules.js:searchText()`/`filter()`; Sprint-21.4-Test | Case-insensitive, Leerstring lässt die übrigen Filter wirken. |
| 21.4-ERM5 | Area-Filter verwendet reale Registry-Areas ohne Heuristik | PASS | `entity-rules.js:options(..., "area")`; sanitisiertes Admin-Inventar | Nur tatsächlich vorhandene Area-Metadaten. |
| 21.4-ERM6 | Domain-Filter bietet nur tatsächlich vorhandene Domains | PASS | `entity-rules.js:options(..., "domain")` | Optionen werden aus dem aktuellen Index abgeleitet. |
| 21.4-ERM7 | Device-Filter bleibt auch bei vielen Devices nutzbar | PASS | `entityRuleDeviceFilter` ist ein Suchfeld; `filter()` vergleicht normalisierten Device-Namen | Kein zweites Massendropdown. |
| 21.4-ERM8 | Suche, Area, Domain, Device und Konfigurationsstatus sind kombinierbar | PASS | `entity-rules.js:filter()`; Test „sucht Metadaten und kombiniert Filter“ | Eine lineare Schleife wendet alle aktiven Kriterien an. |
| 21.4-ERM9 | „Nur konfigurierte“ erkennt jede der drei aktiven Regeln | PASS | `entity-rules.js:configured()`; `entityRulesConfiguredOnly` | Spätere Sprint-22-Regeln erweitern die Karte, verändern die drei historischen Kriterien nicht. |
| 21.4-ERM10 | Summary Ignore kann gesetzt und entfernt werden | PASS | `setEntityRule("summaryIgnored", ...)`; Admin-Entwurfstest | Änderung bleibt bis Save lokal. |
| 21.4-ERM11 | Security Relevant kann gesetzt und entfernt werden | PASS | `setEntityRule("securityRelevant", ...)`; Admin-Entwurfstest | Keine automatische Write-Capability. |
| 21.4-ERM12 | Error Ignore kann gesetzt und entfernt werden | PASS | `setEntityRule("errorIgnored", ...)`; Admin-Entwurfstest | Bestehende Error-Engine liest die persistierte Liste. |
| 21.4-ERM13 | Echte Labels, verständliche Controls und mindestens ca. 44 px Touchhöhe | PASS | `src/admin/index.html`; `.entity-rule-option` in `src/admin/css/admin.css` | Reale Tablet-Wirkung bleibt MT-38. |
| 21.4-ERM14 | Kein problematischer iOS-Style-Switch-Zwang | PASS | Native Checkboxen mit zugeordneten Textlabels in `createRuleInput()` | Aktiver Zustand ist nicht ausschließlich farbcodiert. |
| 21.4-BATCH1 | Änderungen bleiben zunächst im lokalen Admin-Entwurf | PASS | `src/admin/js/state.js`; `setEntityRule()` | Checkbox-Änderungen lösen keinen Request aus. |
| 21.4-BATCH2 | Dirty State wird sichtbar und Navigation kann warnen | PASS | `updateDirtyState()`; `beforeunload` in `src/admin/js/app.js` | Warnung ist an den gemeinsamen Draft gebunden. |
| 21.4-BATCH3 | Save überträgt alle Änderungen gesammelt | PASS | `saveConfiguration()` → `admin.Api.saveConfiguration()` | Genau ein bestehendes `PUT /api/admin/config`, kein generischer Config-Write. |
| 21.4-BATCH4 | Discard stellt den gespeicherten Zustand wieder her | PASS | `discardConfiguration()` → `admin.State.discard()` | Alle lokalen Regeländerungen werden gemeinsam verworfen. |
| 21.4-BATCH5 | Save-Fehler bleibt kontrolliert und Retry ist möglich | PASS | `saveConfiguration()` Fehlerpfad; Admin-API-Tests | Draft wird bei Fehler nicht als gespeichert übernommen. |
| 21.4-BACK1 | Bestehende Konfiguration bleibt nach Upgrade kompatibel | PASS | `src/config/dashboard.js`; `test/dashboard-persistence.test.js` | Historische Listen werden weiterhin gelesen, validiert und atomar gespeichert. |
| 21.4-PERF1 | 3000 Entities, 500 Devices und 50 Areas bleiben linear filterbar | PASS | `test/sprint-21-4.test.js`: großer Inventartest | Lauf blieb deutlich unter der Testgrenze; kein Request pro Tastendruck. |
| 21.4-PERF2 | DOM wird bei großer Trefferzahl begrenzt | PASS | `DEFAULT_LIMIT = 100`; `filter()`/`renderEntityRules()` | Statushinweis fordert Suche oder weitere Filter an. |
| 21.4-PERF3 | Kein O(n²)-Filtering oder N+1-HA-Zugriff | PASS | einmal erzeugter Suchindex; lineare Filterung; geladenes Admin-Inventar | Eventhandler filtern ausschließlich clientseitig. |
| 21.4-SUM1 | Summary-Gesamtzahl erscheint genau einmal dominant | PASS | `system.html#systemDashboardTotal`; `summary.js:render()`; Sprint-21.4-Test | Kein zweiter „aktiv“-Gesamtzähler. |
| 21.4-SUM2 | Summary-„Alle“ wiederholt den Gesamtcount nicht | PASS | `system.html#summaryFilterAll`; Header-Test | Teilfilter dürfen ihre eigenen Counts zeigen. |
| 21.4-SUM3 | Teilfilter-Counts, Stale/Offline und Empty State bleiben korrekt | PASS | `summary.js`; `common.js`; `test/system-frontend.test.js` | Qualitative Status-/Netzwerkhinweise bleiben zusätzliche Information. |
| 21.4-SUM4 | 1/2/3-Spaltenansicht bleibt erhalten | PASS | `createColumnController()`; `systemSummaryColumns` | Sprint-21.2-Verhalten unverändert. |
| 21.4-ERR1 | Error-Gesamtzahl erscheint genau einmal dominant | PASS | `system.html#systemDashboardTotal`; `errors.js:render()` | Kein zweiter Gesamtfehlercount in Filter-„Alle“. |
| 21.4-ERR2 | Severity- und State-Counts bleiben getrennte Dimensionen | PASS – superseded by Sprint 21.3/25.1 | `errors.js:visibleGroup()`/`issueMatches()`; System-Frontendtests | Heute exakt und child-first; intended end-state bleibt erfüllt. |
| 21.4-ERR3 | Info und Unknown bleiben als eigene Severity-/State-Werte erhalten | PASS | Error-Filterdefinitionen und `presentation.js` | Keine künstliche Summengleichheit. |
| 21.4-ERR4 | Device Groups sowie 1/2/3 Spalten bleiben erhalten | PASS | `errors.js`; `common.js`; Sprint-21.1-/21.2-Tests | Headervereinfachung ändert keine Gruppierungslogik. |
| 21.4-HDR1 | Summary und Errors verwenden gemeinsame Header-/Toolbar-Primitiven | PASS | `.system-dashboard-header`, `-title`, `-total`, `-toolbar`, `-filter-section`, `-column-switch` | Eine gemeinsame DOM-/CSS-Struktur für beide Seiten. |
| 21.4-HDR2 | Toolbar darf responsiv umbrechen und erzeugt keinen vorgesehenen Horizontal-Scroll | PASS | prefixed Flexbox und Media Queries in `system.css` | Physische iPad-Wirkung bleibt MT-39. |
| 21.4-EMPTY1 | Summary ohne Aktivitäten zeigt genau einen verständlichen Empty State | PASS | `summaryEmpty`; System-Frontendtests | Kein mehrfaches „0“. |
| 21.4-EMPTY2 | Errors ohne Issues zeigt qualitativen OK-Zustand und einen Empty State | PASS | `errorsEmpty`; `errors.js` | „OK“ ist Status, kein redundanter Gesamtcount. |
| 21.4-A11Y1 | Suche hat Label; Buttons/Filter haben Namen, Fokus und ARIA-Zustand | PASS | `src/admin/index.html`; `system.html`; Admin-/System-CSS | Reale Safari-/Tablet-Bedienung bleibt MT-37 bis MT-39. |
| 21.4-LEG1 | Legacy-Wall-JavaScript bleibt ES5-/iOS-9-kompatibel | PASS | `summary.js`, `errors.js`, `common.js`; `node --check`; Forbidden-Scan | Kein fetch, Promise, let/const, Arrow, Module oder modernes Event-API im Wall-Bundle. |
| 21.4-LEG2 | Wall-CSS benötigt kein Grid, Flex-gap, ResizeObserver oder Container Query | PASS | `style.css`, `system.css`; statischer Scan | Präfixierte Flexbox und Margins. |
| 21.4-LEG3 | Admin selbst darf gemäß Sprint-15-Architektur moderne Browsertechnik nutzen | N/A – governed by Sprint 15 architecture | [`SPRINT-15-AUDIT.md`](SPRINT-15-AUDIT.md); `src/admin/js/*.js` | Die verbindliche Trennung lautet: modernes Admin-Bundle, ES5-Wall-Bundle. |
| 21.4-REG1 | Sprint-21.3-Device-Class-/Label-Modi und Risk Severity bleiben erhalten | PASS | `test/sprint-21-3.test.js`; `system-dashboards.js` | Entity Rule Manager ergänzt, ersetzt aber keine Critical-Mode-Felder. |
| 21.4-REG2 | User-Dashboards, Focus, Light/Climate, Theme bleiben erhalten | PASS | vollständige Regression 329/329; fokussierter Lauf 165/165 | Kein Anwendungscode wurde im Audit verändert. |
| 21.4-T1 | Vollständige nummerierte 75-Punkte-Testmatrix ist einzeln rückverfolgbar | PARTIAL | 4 breite direkte Sprint-21.4-Tests plus Admin-/System-/Gateway-/Securityregressionen | Nicht jeder historische Einzelpunkt hat eine direkte Zuordnung; `RQ-11-01`. |
| 21.4-MAN1 | Entity Rule Manager im aktuellen Desktop-Safari | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-37 | Kein realer Safari-Lauf in Part 11. |
| 21.4-MAN2 | Entity Rule Manager auf modernem Touch-Tablet | NOT TESTED | MT-38 | Kein physischer Tablet-Test in Part 11. |
| 21.4-MAN3 | Summary-/Error-Header auf iPad mini/iOS 9 | NOT TESTED | MT-39 | Kein physischer Legacy-Gerätetest. |
| 21.4-SHOT1 | Aktuelle echte Admin-/Summary-/Error-Screenshots | PARTIAL | D1-Audit, `RQ-08-02`, MT-29 | Vorhandene Aufnahmen belegen den heutigen Entity-Rule-/Headerstand nicht zuverlässig. |
| 21.4-DOC1 | README DE/EN, Roadmap und Projektstatus dokumentieren die Funktion | PASS | `README.de.md`; `README.en.md`; `docs/SPRINT_ROADMAP.md`; `docs/PROJECT_STATUS.md` | Die Sprint-21.4-Fachbeschreibung ist semantisch vorhanden. |
| 21.4-CACHE1 | Geänderte gemeinsam genutzte Assets besitzen eine konsistente Cacheversion | PASS | Dashboard, System, Admin und Manifest verwenden v52; `test/asset-version.test.js`; immutable Static Cache unverändert. | RQ-04-01 code-seitig geschlossen. |

## Current Entity Rule Flow

```text
sanitized GET /api/admin/entities
  -> one in-memory search index
  -> client-side query + area + domain + device + configured-only filters
  -> at most 100 rendered entity cards
  -> three checkboxes mutate only the shared local draft
  -> one authenticated PUT /api/admin/config on explicit Save
```

Der Datenfluss erweitert weder `controlGrants` noch Light-/Climate-
Autorisierung und löst beim Suchen oder Umschalten keinen HA-Aufruf aus.

## Superseded Requirements

- Sprint 15 ist die verbindliche Architekturentscheidung, dass `/admin` moderne
  Browsertechnik verwenden darf, während nur das Wall-/System-Bundle ES5 sein
  muss. Die allgemein formulierten Legacy-Verbote aus Sprint 21.4 werden daher
  auf das Legacy-Bundle angewendet.
- Sprint 21.3 und Sprint 25.1 ersetzen die frühere kombinierte Error-
  Filterdarstellung durch getrennte, exakte Severity-/State-Dimensionen mit
  same-child-AND und child-first Device Groups.
- Sprint 22 erweitert dieselbe Entity-Rule-Manager-Karte um Expected Offline
  und zentrale Regelparameter. Die drei Sprint-21.4-Listen und ihr Batch-
  Verhalten bleiben erhalten.

## Automated Evidence

- Part-11-Fokuslauf: 165/165 Tests bestanden;
- vollständige Regression: 329/329 Tests bestanden;
- 14 relevante JavaScript-Dateien bestanden `node --check`;
- Legacy-/CSS-/Security-Scans ohne verbotene moderne Wall-Syntax, CSS Grid,
  Flex-gap, Browser-Credentials oder generische Write-Route;
- ausschließlich localhost-Mocks/Fake-Credentials, kein reales Home Assistant.

## Manual Evidence Required

- MT-37: Entity Rule Manager in aktuellem macOS Safari;
- MT-38: Rule Manager und Touchziele auf einem modernen Touch-Tablet;
- MT-39: kompakte Systemheader und Count-Semantik auf iPad mini/iOS 9;
- MT-29 bleibt für echte, datenschutzgeprüfte Produktaufnahmen maßgeblich.

## Repair Mapping

- `RQ-04-01` – in Sprint 27.1-B code-seitig geschlossen;
- `RQ-08-02` – veraltete bzw. formatinkonsistente Produktbilder;
- `RQ-11-01` – fehlende vollständige Einzelzuordnung der 75-/73-Punkte-
  Testmatrizen.

## Security and Deployment Review

PASS – Die UI verändert nur persistierte Gateway-Konfiguration hinter der
Admin-Authentifizierung. Tokens, HA-WebSocket und generische Services bleiben
dem Browser entzogen. Die relativen Routen und dieselben Express-Assets gelten
für Standalone/LXC und Home Assistant App; ein realer deployment-spezifischer
Lauf ist nicht Teil dieses Parts.

## Remaining Sprint 21.4 Gaps

Keine bestätigte fachliche Laufzeitlücke. Vor einer finalen RC-Freigabe sind
`RQ-08-02`, `RQ-11-01` sowie MT-37 bis MT-39 abzuarbeiten; `RQ-04-01` ist
code-seitig geschlossen.
