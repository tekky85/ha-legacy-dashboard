# Sprint 14 Audit

## Audit Metadata

- Sprint: 14
- Sprint title: Persistent Configuration & Admin API Foundation
- Audit date: 31. August 2026
- Repository commit: `8d2295a`
- Spec file: [`docs/sprints/SPRINT-14.md`](../../sprints/SPRINT-14.md)

## Overall Result

PASS

Das aktuelle Repository enthält eine erweiterte, rückwärtsmigrierbare Version
des Sprint-14-Schemas, atomare Persistenz, geschützte Admin-Routen und die
verlangte Trennung von Anzeige und Schreibrecht. Alle geforderten isolierten
Fehler- und Sicherheitsfälle sind weiterhin automatisiert abgedeckt.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 14-P1 | Versioniertes Dashboard-Schema und stabile global eindeutige Widget-IDs | PASS | `src/config/dashboard.js`: `CURRENT_SCHEMA_VERSION`, `validateConfiguration()`; `test/dashboard-persistence.test.js` | Aktuelles Schema 12 migriert ältere Versionen schrittweise. |
| 14-P2 | Standardpfad `data/dashboards.json`, Override per `DASHBOARD_CONFIG_PATH` | PASS | `src/config/dashboard.js`: `getDefaultConfigPath()`, `getConfigPath()`; `src/config/runtime.js` | HA-App-Modus verwendet später spezifiziert `/data`; Standalone-Default bleibt Repository-`data/`. |
| 14-P3 | Sprint-13-Multi-Dashboard erhalten und statische Konfiguration beim ersten Start automatisch migriert | PASS | `src/services/dashboard-config-store.js`: `load()`; `src/config/dashboard.js`: Initialisierung/Migration; `test/dashboard-persistence.test.js` | Erststart schreibt validierte Defaultkonfiguration. |
| 14-P4 | Gesamtkonfiguration vor Schreiben validieren | PASS | `src/config/dashboard.js`: `validateConfiguration()` und `replaceConfiguration()`; `src/routes/admin.js`: `persistConfiguration()` | Ungültige Eingaben liefern kontrollierte Fehler vor Persistenz. |
| 14-P5 | Atomarer Ersatz, eine `.bak`, letzter gültiger Stand bleibt bei Fehler erhalten | PASS | `src/services/dashboard-config-store.js`: exklusive Tempdatei, `fsync`, Rename, Backup und Cleanup; `test/dashboard-persistence.test.js` | Tests decken atomare Speicherung, Backup, Recovery und simulierten Schreibfehler ab. |
| 14-A1 | Geschützte Lese-/Schreibendpunkte für Konfiguration, Dashboards und Widgets | PASS | `src/routes/admin.js`: `/config`, `/dashboards`, Dashboard-/Widget-CRUD; `test/admin-api.test.js` | Route-Struktur entspricht dem vorgeschlagenen Modell. |
| 14-A2 | Sanitisiertes Entity-Inventar | PASS | `src/routes/admin.js`: `/entities`, Sanitizer; `test/admin-api.test.js` | Spätere Sprints ergänzten sichere Registry-Metadaten, aber keine rohen State-Attribute oder Tokens. |
| 14-S1 | Admin API standardmäßig deaktiviert, nur bei `ADMIN_API_ENABLED=true` | PASS | `src/routes/admin.js`: `requireAdmin()`; `test/admin-api.test.js` | Deaktivierter Pfad antwortet kontrolliert 404. |
| 14-S2 | Eigenes `ADMIN_TOKEN`, Bearer-Authentifizierung, nicht HA-/Supervisor-Token | PASS | `src/routes/admin.js`: Timing-safe Tokenprüfung und Gleichheitsablehnung; `test/admin-api.test.js` | Fehlendes/recyceltes Token ergibt 503, fehlendes/falsches Bearer-Token 401. |
| 14-S3 | Keine Tokens im Dashboard oder Log; keine Secrets committed | PASS | `src/services/logger.js` Redaction; Public-Config in `src/config/dashboard.js`; Secret-Regressionstests | Audit hat keine `.env` gelesen oder ausgegeben. |
| 14-S4 | Rate Limit auf Admin-Schreiboperationen | PASS | `src/routes/admin.js`: Admin-Write-Limiter; `test/admin-api.test.js` | GET bleibt lesbar, Mutationen sind begrenzt. |
| 14-S5 | Dashboard-Sichtbarkeit erteilt niemals automatisch Light-/Climate-Schreibrecht | PASS | `src/services/control-authorization.js`; `src/config/dashboard.js`: `control` nicht öffentlich; `test/admin-api.test.js`, `test/sprint-26-2.test.js` | Spätere explizite Control-Grants bleiben serverseitig und unabhängig von `visible`. |
| 14-V1 | Schema-Version, Dashboard-/Widget-IDs und Eindeutigkeit validieren | PASS | `validateConfiguration()`; `test/dashboard-persistence.test.js`, `test/dashboard-config.test.js` | IDs werden per Regex und globaler Widget-ID-Menge geprüft. |
| 14-V2 | Bekannte Typen, Entity-IDs, Widgetarrays, numerische Ordnung und boolesche Sichtbarkeit validieren | PASS | `src/config/dashboard.js`; Validierungs- und Admin-API-Tests | Heutige Typmenge enthält bewusst später ergänzte Typen. |
| 14-V3 | Refreshintervalle und existierendes Default-Dashboard validieren | PASS | `src/config/dashboard.js`; `test/dashboard-persistence.test.js`, `test/admin-api.test.js` | Ungültiger Default verändert die persistierte Konfiguration nicht. |
| 14-T1 | Migration, gültiges Laden, ungültiges JSON/Schema/IDs/Duplikate, Atomik/Backup isoliert testen | PASS | `test/dashboard-persistence.test.js` | Alle geforderten Persistenzfälle vorhanden. |
| 14-T2 | Disabled/missing/invalid/valid Admin-Auth, CRUD, Defaultkonsistenz und Inventarsanitizing testen | PASS | `test/admin-api.test.js` | Nur localhost-Mocks und Fake-Credentials. |
| 14-T3 | Unveränderte Write-Grenze und Multi-Dashboard-Regressionsschutz | PASS | `test/admin-api.test.js`, `test/gateway.test.js`, `test/sprint-26-2.test.js` | Sichtbare, nicht autorisierte Entity bleibt nicht schreibbar. |
| 14-N1 | Keine grafische Admin-UI, Drag-and-drop, Größen, Layoutprofile, DB, HA-App oder zusätzliche Write-Domänen in Sprint 14 | N/A | Historischer Sprint-14-Commit `af35fe4`; spätere Sprints 15–26 | Zeitlich begrenzte Nicht-Ziele wurden später ausdrücklich superseded, nicht versehentlich verletzt. |
| 14-DOC1 | Projektstatus nach Abschluss aktualisiert | PASS | `docs/PROJECT_STATUS.md` und Git-Historie | Der Status wurde seitdem fortlaufend erweitert. |

## Automated Tests

- `npm test`: 329 Tests, alle bestanden.
- Besonders relevant: `test/dashboard-persistence.test.js`,
  `test/admin-api.test.js`, `test/dashboard-config.test.js`,
  `test/gateway.test.js` und `test/sprint-26-2.test.js`.
- 119 JavaScript-Dateien bestanden `node --check`.

## Manual Tests

N/A – Sprint 14 verlangt für seine Persistenz-/Admin-API-Abnahme keine reale
HAOS- oder iPad-Prüfung. Produktive Deployments werden in späteren Sprints
separat auditiert.

## Security Review

PASS – Admin standardmäßig aus, eigener Bearer-Token, timing-safe Vergleich,
Ablehnung wiederverwendeter HA-/Supervisor-Tokens, Write-Rate-Limit, zentrale
Validierung, kontrollierte Fehler, Log-Redaction und getrennte Write-Grants sind
im Code und in Tests belegt. Es gibt keinen generischen HA-Serviceproxy.

## Legacy Safari / iPad Review

N/A – die neuen Sprint-14-Funktionen sind Backend-/Admin-API-Grundlagen. Das
Wall-Frontend wurde nicht auf moderne Browserfunktionen umgestellt.

## Home Assistant App Review

N/A – App-Verpackung war ein ausdrückliches Nicht-Ziel und wurde erst in
Sprint 24 ergänzt. Der heutige `/data`-Pfad ist eine bewusste spätere
Erweiterung.

## Standalone/LXC Review

PASS – der Standalone-Default bleibt `data/dashboards.json`; Override,
Erststart, Laden, Backup, Recovery und Fehlererhalt sind mit temporären lokalen
Verzeichnissen getestet. Kein Produktions-LXC wurde für diesen Auditlauf
verändert.

## Findings

- Keine `PARTIAL`-, `MISSING`- oder `BROKEN`-Anforderung.
- Die grafische Admin-UI und spätere Layout-/App-Funktionen sind dokumentierte
  Superseding-Sprints und keine Sprint-14-Regression.

## Repair Required

Keine.

## Final Assessment

Sprint 14 erfüllt die weiterhin anwendbaren Anforderungen am auditierten
Commit und kann mit `PASS` bewertet werden.
