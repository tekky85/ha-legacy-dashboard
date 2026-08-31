# Sprint 15 Audit

## Audit Metadata

- Sprint: 15
- Sprint title: Admin Configuration UI
- Audit date: 31. August 2026
- Repository commit: `8d2295a`
- Spec file: [`docs/sprints/SPRINT-15.md`](../../sprints/SPRINT-15.md)
- Working tree at Part-02 start: Part-01 audit documentation was intentionally
  still uncommitted; no application-code modification was present.

## Overall Result

PARTIAL

Die grafische Admin-Oberfläche, ihre Authentifizierung, der lokale Entwurf,
Dashboard-/Widgetverwaltung, Entity-Browser und die Trennung vom
Legacy-Frontend sind im aktuellen Code vorhanden und automatisiert sowie in
einem kontrollierten Chromium-Lauf belegt. Die ausdrücklich verlangte aktuelle
Safari-Abnahme und der Regressionstest auf dem realen iPad mini mit iOS 9.3.5
wurden in Part 02 nicht durchgeführt. Das `PARTIAL` ist daher ein
Abnahmevorbehalt und kein festgestellter Codefehler.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 15-F1 | Sprint-14-Persistenz und geschützte Admin API als Grundlage verwenden | PASS | `src/routes/admin.js`; `src/services/dashboard-config-store.js`; [`SPRINT-14-AUDIT.md`](SPRINT-14-AUDIT.md) | Die UI speichert ausschließlich über die geschützte API; Sprint 14 ist mit `PASS` auditiert. |
| 15-A1 | Separate grafische `/admin`-Oberfläche für moderne Browser | PASS | `src/server.js`: `/admin` und `/admin/*`; `src/admin/index.html`; `src/admin/css/admin.css`; kontrollierter Browserlauf | Login und Editor wurden unter `/admin` real aus der lokalen Testlaufzeit geladen. |
| 15-A2 | Admin darf moderne Technik nutzen, Wall-Display bleibt getrennt und ES5-kompatibel | PASS | `src/admin/js/*.js`; `src/public/js/`; `test/admin-ui.test.js`: „Admin-Dateien leaken keine Secrets und das Wall-Display bleibt ES5“ | `fetch`/`async` bleiben auf das Admin-Bundle begrenzt; das Legacy-Bundle wurde nicht davon abhängig gemacht. |
| 15-A3 | Admin verwendet nur Sprint-14-API, keine direkte Datei- oder Browser-zu-HA-Kommunikation | PASS | `src/admin/js/api.js`: `request()`; alle Aufrufe unter `/api/admin`; `test/admin-ui.test.js` | Kein HA-Token, HA-WebSocket oder Dateizugriff im Browser. |
| 15-AUTH1 | Token-Login ohne URL-Parameter; klare Authentifizierungsfehler | PASS | `src/admin/index.html`; `src/admin/js/app.js`: `showLogin()`, `handleLogin()`; `src/admin/js/api.js`: `request()`; kontrollierter Browserlauf | Login mit Fake-Admin-Token funktionierte; Logout führte zurück zum Login. |
| 15-AUTH2 | Token nur im Speicher oder optional in `sessionStorage`, niemals `localStorage` | PASS | `src/admin/js/auth.js`: `readSessionToken()`, `setToken()`, `clearToken()`; `test/admin-ui.test.js` | „Für diesen Tab merken“ verwendet ausschließlich `sessionStorage` und fällt bei Storage-Fehlern auf Speicher zurück. |
| 15-AUTH3 | 401/403 leert die Sitzung; Logout entfernt Token und Adminzustand | PASS | `src/admin/js/api.js`; `src/admin/js/auth.js`; `src/admin/js/app.js`; `test/admin-ui.test.js` | Der Bearer-Token wird nicht in URL, HTML oder Public-Konfiguration geschrieben. |
| 15-H1 | Startseite zeigt Dashboards mit ID, Titel, Defaultstatus und Widgetanzahl | PASS | `src/admin/js/app.js`: `renderDashboardList()`; kontrollierter Browserlauf | Defaultmarkierung, Titel, ID und Widgetanzahl waren sichtbar. |
| 15-D1 | Dashboard erstellen mit validierter stabiler ID und Titel | PASS | `src/admin/js/dashboards.js`: `validateIdentity()`, `create()`; `test/admin-ui.test.js`; kontrollierter Browserlauf | `audit-dashboard` wurde als lokaler Entwurf erstellt, gespeichert und nach Reload wieder geladen. |
| 15-D2 | Dashboard umbenennen und Refreshintervall bearbeiten; ID schreibgeschützt | PASS | `src/admin/js/dashboards.js`: `update()`; `src/admin/js/app.js`: `renderEditor()`; Backendvalidierung in `src/config/dashboard.js` | Die stabile ID wird im Editor nur angezeigt, nicht nachträglich verändert. |
| 15-D3 | Dashboard duplizieren, alle Widgets übernehmen und neue Widget-IDs erzeugen | PASS | `src/admin/js/dashboards.js`: `duplicate()`, `uniqueDuplicateWidgetId()`; `test/admin-ui.test.js` | Spätere Layout-/Backgroundfelder werden ebenfalls sicher kopiert; Widget-IDs bleiben global eindeutig. |
| 15-D4 | Dashboard löschen mit Bestätigung; Default/letztes Dashboard geschützt | PASS | `src/admin/js/app.js`: `handleEditorClick()`; `src/admin/js/dashboards.js`: `remove()`; `src/routes/admin.js`; Tests in `test/admin-ui.test.js` und `test/admin-api.test.js` | Client und Server erzwingen die Konsistenzregeln. |
| 15-D5 | Existierendes Dashboard als Standard setzen | PASS | `src/admin/js/dashboards.js`: `setDefault()`; `src/admin/js/app.js`; `test/admin-ui.test.js` | Die Persistenz validiert weiterhin ein tatsächlich vorhandenes Default-Dashboard. |
| 15-W1 | Widgetliste zeigt Typ, Entity, Titel, Sichtbarkeit und Reihenfolge | PASS | `src/admin/js/app.js`: `renderWidgetCard()`; kontrollierter Browserlauf | Der heutige Editor zeigt zusätzlich Größe, Section und spätere Layoutinformationen. |
| 15-W2 | Reihenfolge ohne Drag-and-drop über Hoch/Runter ändern | PASS | `src/admin/js/widgets.js`: `move()`, `normalizeOrders()`; `src/admin/js/app.js`; `test/admin-ui.test.js` | Die Schaltflächen bleiben vorhanden; Sprint 17 ergänzte später Drag-and-drop. |
| 15-E1 | Sanitisiertes Entity-Inventar mit Entity-ID, Domain, Friendly Name, Device Class und Unit | PASS | `src/routes/admin.js`: `/entities`; `src/admin/js/entities.js`; `test/admin-api.test.js` | Keine unnötigen rohen HA-State-Attribute gelangen in den Browser. |
| 15-E2 | Suche über Friendly Name, Entity-ID, Domain und Device Class sowie Domainfilter | PASS | `src/admin/js/entities.js`: `filter()`; `src/admin/js/app.js`: `renderEntities()`; kontrollierter Browserlauf | Suche nach „audit temperatur“ blendete die nicht passende Light-Entity aus. |
| 15-E3 | Nur Sensor, Binary Sensor, Light und Climate als damalige Vorschläge; unbekannte Typen ablehnen | PASS | `src/admin/js/widgets.js`: `suggestionForEntity()`; `src/admin/js/entities.js`; `test/admin-ui.test.js` | Später spezifizierte Room Cards erweitern das Datenmodell bewusst, nicht den damaligen generischen Entity-Vorschlag. |
| 15-W3 | Widget mit sicheren Defaults hinzufügen | PASS | `src/admin/js/widgets.js`: `create()`; `src/admin/js/app.js`: `handleEntitySelection()`, `handleWidgetForm()`; `test/admin-ui.test.js` | IDs werden lokal eindeutig erzeugt und serverseitig erneut validiert. |
| 15-W4 | Titel, Untertitel, Icon, Unit, Sichtbarkeit und Reihenfolge bearbeiten; ID/Entity/Typ stabil | PASS | `src/admin/js/widgets.js`: `update()`; `src/admin/index.html`; `test/admin-ui.test.js` | Die aktuelle UI ergänzt Größe und Section, ohne die Identitätsfelder freizugeben. |
| 15-W5 | Widget entfernen, ohne Home-Assistant-Entity zu löschen | PASS | `src/admin/js/widgets.js`: `remove()`; `src/routes/admin.js` | Es wird ausschließlich Dashboardkonfiguration verändert. |
| 15-W6 | Sichtbarkeit unabhängig von Write-Allowlist umschalten | PASS | `src/admin/js/widgets.js`: `setVisibility()`; `src/services/control-authorization.js`; `test/admin-api.test.js`, `test/sprint-26-2.test.js` | Anzeige erteilt weiterhin keine Schreibberechtigung. |
| 15-W7 | Begrenzte bekannte Icon-Auswahl | PASS | `src/admin/js/widgets.js`: bekannte Iconliste; `src/admin/index.html`; Backendvalidierung in `src/config/dashboard.js` | Keine freie HTML-, URL- oder Script-Injektion über Icons. |
| 15-P1 | Preview-Link für das ausgewählte Dashboard auf `/d/:dashboardId` | PASS | `src/admin/js/app.js`: `previewLink.href`; kontrollierter Browserlauf | Das ausgewählte Dashboard bleibt aus dem Editor direkt erreichbar. |
| 15-P2 | Preview-Link vorzugsweise in neuem Tab | N/A | `src/admin/js/app.js`; Sprint 25.2 | Die ursprüngliche Präferenz wurde durch Sprint 25.2 absichtlich mit Same-Window-/Same-Origin-Navigation ersetzt, damit der HomeScreen-Kontext erhalten bleibt. |
| 15-S1 | Lokaler Entwurf, explizites Speichern und Verwerfen | PASS | `src/admin/js/state.js`: gespeicherter Zustand/Entwurf, `discard()`; `src/admin/js/app.js`: `saveConfiguration()`, `discardConfiguration()`; kontrollierter Browserlauf | Eine Größenänderung wurde verworfen und der gespeicherte Wert korrekt wiederhergestellt. |
| 15-S2 | Warnung beim Verlassen mit ungespeicherten Änderungen | PASS | `src/admin/js/app.js`: `beforeunload`; `test/admin-ui.test.js` | Warnung wird nur bei Dirty-State gesetzt. |
| 15-S3 | Kontrollierte, verständliche Anzeige für Auth-, Validierungs-, Rate-Limit-, HA- und Serverfehler | PASS | `src/admin/js/api.js`; `src/admin/js/app.js`: Fehlerabbildung und `showNotice()`; `test/admin-ui.test.js`, `test/admin-api.test.js` | Keine Backend-Stacks oder Secrets werden als UI-Fehler ausgegeben. |
| 15-S4 | HA-/Entity-Inventar-Ausfall blockiert lokale Konfigurationsbearbeitung nicht unnötig | PASS | `src/admin/js/app.js`: `loadAdministration()`, `loadEntityInventory()`, `loadPreviewEntities()` | Konfiguration wird zuerst geladen; nicht-authentifizierungsbedingte Inventar-/Previewfehler werden isoliert und als kontrollierter Zustand angezeigt. |
| 15-U1 | Moderner responsiver Editor mit nativen Labels/Buttons, Fokus und Kontrast | PASS | `src/admin/index.html`; `src/admin/css/admin.css`; `src/admin/js/app.js`: beschriftete Controls/ARIA-Labels; kontrollierter Chromium-Lauf | Die noch erforderliche Safari-/Tastatur-/Kontrastabnahme steht separat als `NOT TESTED` in MT-04. |
| 15-CSP1 | Strikte CSP, lokale Assets, kein `unsafe-eval` | PASS | `src/server.js`: `setSecurityHeaders()`, `setAdminHeaders()`; `test/security.test.js`, `test/admin-ui.test.js` | Keine externen CDN-Abhängigkeiten. |
| 15-JS1 | Fachlogik sinnvoll in Auth/API/State/Dashboards/Widgets/Entities aufgeteilt | PASS | `src/admin/js/auth.js`, `api.js`, `state.js`, `dashboards.js`, `widgets.js`, `entities.js` | `app.js` ist durch spätere Sprints größer geworden, die Sprint-15-Domänenmodule bestehen weiterhin. |
| 15-T1 | Geforderte Auth-, CRUD-, Widget-, Entity-, Sicherheits- und Regressionstests | PASS | `test/admin-ui.test.js`, `test/admin-api.test.js`, `test/dashboard-persistence.test.js`, `test/gateway.test.js`, `test/security.test.js` | Fokussierter Lauf: 92/92; Gesamtsuite: 329/329. |
| 15-B1 | Manueller Test in aktuellem Chromium | PASS | Kontrollierter lokaler Browserlauf am 31. August 2026 | Login, Dashboardliste, Erstellen/Speichern/Reload, Entity-Suche, Änderung/Verwerfen und Logout wurden geprüft. Nur lokale Mocks/Fake-Credentials. |
| 15-B2 | Manueller Test in aktuellem Safari | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-04 | In Part 02 stand kein realer Safari-Testnachweis zur Verfügung. |
| 15-B3 | Wall-Display-Regression auf iPad mini/iOS 9 | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-05 | Code-/Testnachweis ist grün, ersetzt aber keine reale Zielhardware. |
| 15-N1 | Keine zusätzlichen HA-Write-Domänen oder automatisch erweiterten Allowlists | PASS | `src/services/control-authorization.js`; `src/routes/api.js`; Security-Regressionstests | Kein generischer HA-Serviceproxy. |
| 15-N2 | Kein Drag-and-drop, freie Größe, Live-Preview, HA-App oder Paketierung in Sprint 15 | N/A | Historischer Commit `332d0a5`; spätere Sprints 16, 17, 17.3 und 24 | Die damaligen Nicht-Ziele wurden später ausdrücklich superseded und sind keine Sprint-15-Regression. |
| 15-DOC1 | Projektstatus und Deploymenthinweise aktualisiert | PASS | `docs/PROJECT_STATUS.md`, `README.md`, Git-Historie (`65f5e48`) | Dokumentation wurde in Folgesprints fortgeführt. |

## Automated Tests

- Fokussierter Part-02-Lauf: 92 Tests, 92 bestanden, 0 fehlgeschlagen.
- Enthalten: `test/admin-ui.test.js`, `test/tile-size.test.js`,
  `test/dashboard-config.test.js`, `test/dashboard-persistence.test.js`,
  `test/admin-api.test.js`, `test/layout.test.js`,
  `test/legacy-layout.test.js`, `test/gateway.test.js` und
  `test/security.test.js`.
- Vollständige Suite: 329 Tests, 329 bestanden, 0 fehlgeschlagen.
- Der erste Gesamtlauf konnte vier localhost-Testserver in der Sandbox nicht
  binden (`EPERM`). Der identische Lauf mit freigegebener lokaler
  Mock-Kommunikation bestand vollständig; dies ist kein Produktfehler.
- Kein reales Home Assistant und keine produktiven Zugangsdaten wurden
  verwendet.

## Manual Tests

- Kontrollierter Chromium-Lauf: PASS für Login, Logout, Dashboardliste,
  Erstellen, Speichern/Reload, Entity-Suche und Verwerfen.
- Aktuelles Safari: NOT TESTED, siehe MT-04.
- Reales iPad mini 1/iOS 9.3.5: NOT TESTED, siehe MT-05.

## Security Review

PASS – Admin-Token bleibt im Speicher bzw. optional in `sessionStorage`, wird
nur als Bearer-Header an `/api/admin` gesendet und bei Authfehler/Logout
entfernt. CSP, lokale Assets, serverseitige Validierung, Write-Rate-Limit und
die Trennung von Sichtbarkeit und Write-Grants bleiben wirksam. Weder HA- noch
Supervisor-Token werden an den Browser ausgeliefert; ein generischer
Serviceproxy existiert nicht.

## Legacy Safari / iPad Review

PARTIAL – der Legacy-Code ist nach statischer und automatisierter Prüfung ES5
und bleibt vom modernen Admin-Bundle getrennt. Der reale iPad-Test fehlt und
wird deshalb nicht als `PASS` ausgegeben.

## Home Assistant App Review

N/A – die Home-Assistant-App war ein ausdrückliches Sprint-15-Nicht-Ziel und
wurde erst in Sprint 24 eingeführt. Ihre Laufzeitabnahme gehört nicht in Part
02.

## Standalone/LXC Review

PASS für den anwendbaren Anwendungspfad – `/admin`, API, Persistenz und
Wall-Display wurden in einer kontrollierten lokalen Standalone-Laufzeit
geprüft. Der produktive LXC wurde nicht kontaktiert oder verändert.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- `NOT TESTED`: aktuelle Safari-Abnahme und reales iPad-Wall-Display.
- Der heutige Same-Window-Preview-Link und die späteren Layout-/Preview-
  Funktionen sind dokumentierte Superseding-Änderungen.

## Repair Required

Keine Code- oder Dokumentationsreparatur. Die offenen Punkte stehen in der
manuellen Testwarteschlange.

## Final Assessment

Sprint 15 ist funktional und sicher implementiert, kann wegen der fehlenden
verlangten Safari-/iPad-Abnahme im Sprint-27-Baseline-Audit aber nur mit
`PARTIAL` bewertet werden.
