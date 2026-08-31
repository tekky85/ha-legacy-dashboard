# Sprint 12 Audit

## Audit Metadata

- Sprint: 12
- Sprint title: UI Polish + Release Baseline
- Audit date: 31. August 2026
- Repository commit: `8d2295a`
- Spec file: [`docs/sprints/SPRINT-12.md`](../../sprints/SPRINT-12.md)

## Overall Result

PARTIAL

Die implementierten und automatisierbaren Anforderungen sind im aktuellen
Repository belegt. Die reale visuelle und interaktive Abnahme auf dem iPad mini
1 mit iOS 9.3.5 wurde in diesem Auditlauf nicht durchgeführt.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 12-A1 | Minus/Plus zentriert, mindestens 44 px, ohne Browser-Padding; Busy/Disabled und Themes erhalten | PASS | `src/public/css/style.css`: `.control-button`, `.climate-adjust`, `.card-controls`, `.control-cell`; `test/card-matrix.test.js`; `test/sprint-17.7.test.js` | Spätere 17.x-Härtungen superseden die ursprüngliche CSS-Ausprägung, erfüllen aber das Ziel weiterhin. |
| 12-A2 | Climate-Karte kompakt, Werte/Status/Controls klar; bestehende Climate-Logik, optimistische Anzeige, Refreshschutz und Meldungen erhalten | PASS | `src/public/js/widgets/climate.js`; `src/public/js/core/control-ui.js`; `src/public/js/app.js`; `test/climate-client.test.js`; `test/sprint-26-2.test.js` | Spätere Größen-/Focus-Sprints haben die Präsentation bewusst erweitert. |
| 12-A3 | Allgemeine Kartenabstände und Breakpoints schonend verdichten, keine individuelle Größe einführen | N/A | `src/public/css/style.css`; aktuelle Größenlogik in `src/config/dashboard.js` und `src/public/js/core/card-presentation.js` | Sprint 16/17/25.6 haben das damalige Nicht-Ziel individuelle Größen später ausdrücklich superseded. Die aktuellen Karten bleiben per Tests abgedeckt. |
| 12-A4 | Wall-Frontend bleibt ES5-/Safari-9-kompatibel | PASS | `test/legacy-compat.test.js`; `test/gateway.test.js`; Syntaxprüfung aller Frontend-JS-Dateien | Kein `fetch`, Promise-basierter Requestpfad, ES-Module oder CSS Grid als Voraussetzung gefunden. |
| 12-B1 | Projektversion an den relevanten Stellen vereinheitlichen | PASS | `package.json` und `/api/status` in `src/routes/api.js`; `test/release.test.js`; `test/sprint-25.test.js` | Aktueller, später supersedender Releasewert ist konsistent `1.0.0-rc.1`. Der sichtbare Footer wurde in Sprint 25.3 bewusst entfernt. |
| 12-B2 | Lizenzinkonsistenz nicht eigenmächtig entscheiden; andernfalls dokumentierter Blocker | PASS | `LICENSE`; `package.json` (`ISC`); `README.md`, `README.de.md`, `README.en.md`; `test/release.test.js` | Eine spätere explizite Releaseentscheidung hat den damaligen Blocker aufgelöst. |
| 12-B3 | Ungenutzte direkte `ws`-Abhängigkeit entfernen und Lockfile/Test prüfen | PASS | `package.json`, `package-lock.json`; `npm ls ws --depth=0` liefert keine direkte Abhängigkeit; vollständige Testsuite | Spätere transitive Abhängigkeiten wären kein Verstoß gegen diese Anforderung. |
| 12-B4 | Tote Hilfsfunktion `setClimateControlsBusy()` prüfen und gegebenenfalls entfernen | PASS | Kein Vorkommen außerhalb der Sprint-Spezifikation; Busy-State in `src/public/js/core/control-ui.js` und Widget-Renderern | Funktion ist nicht als toter Altcode vorhanden. |
| 12-B5 | Rate-Limit-Test isoliert, reihenfolgeunabhängig und nur gegen lokalen Mock | PASS | `test/write-rate-limit.test.js`: frischer Modulzustand und isolierter Limiter-Test; Gesamttestsuite mit lokalen Mocks | Keine echten Credentials oder Produktionsverbindung verwendet. |
| 12-B6 | Node-Runtime dokumentieren, sofern CI und Produktion übereinstimmen | PASS | `package.json` → `engines.node: >=22`; `.github/workflows/test.yml`; `test/release.test.js` | Lokaler Auditlauf nutzte Node `v22.15.0`. |
| 12-B7 | Changelog-Baseline ohne erfundene Releases/Daten | PASS | `CHANGELOG.md` mit Baseline und fortlaufender Projekthistorie | Spätere Sprints haben den Changelog fortgeschrieben. |
| 12-T1 | Vollständige Tests und Syntaxchecks ohne verlorene Abdeckung | PASS | 329/329 Tests; 119 JavaScript-Dateien mit `node --check` | Referenzwert 39 wurde deutlich erweitert. |
| 12-M1 | Visuelle/Touch-Abnahme auf dem realen Zielgerät | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-01 | Ohne reale iOS-9-Hardware kein PASS. |
| 12-N1 | Keine Multi-Dashboard-, Admin-, Persistenz-, Grid-, HA-App- oder Security-Erweiterung in Sprint 12 | N/A | Git-Historie: `c41784a` ist der Sprint-12-Commit; spätere Sprints implementieren diese Funktionen bewusst | Gegen den heutigen Gesamtstand wären die damaligen Nicht-Ziele irreführend; historisch wurden sie eingehalten. |

## Automated Tests

- `npm test`: 329 Tests, 329 bestanden, 0 fehlgeschlagen.
- `node --check`: 119 JavaScript-Dateien unter `src/`, `test/` und `release/`,
  ohne Syntaxfehler.
- Tests verwenden lokale Mock-Home-Assistant-Dienste und Fake-Credentials.

## Manual Tests

- Reale iPad-mini-/iOS-9-Visual- und Touch-Abnahme: `NOT TESTED`, siehe MT-01.

## Security Review

PASS – Sprint 12 führte keine neue Write-Domäne und keinen generischen
Servicepfad ein. Die heutigen expliziten serverseitigen Control-Grants und
engen Endpunkte werden in `src/services/control-authorization.js` sowie den
Light-/Climate-Routen erzwungen; Tokens werden nicht an das Frontend gegeben.

## Legacy Safari / iPad Review

PARTIAL – statische Kompatibilitäts- und Syntaxprüfungen bestehen. Die reale
iPad-mini-1-Abnahme bleibt `NOT TESTED`.

## Home Assistant App Review

N/A – Home-Assistant-App-Verpackung war ausdrücklich kein Sprint-12-Ziel und
wurde erst in Sprint 24 eingeführt.

## Standalone/LXC Review

PASS – Sprint 12 änderte den Standalone-Grundpfad nicht; die aktuelle
Standalone-Konfiguration und vollständige Gateway-Tests bestehen. Ein
Produktiv-LXC wurde für diesen dokumentarischen Auditlauf nicht kontaktiert.

## Findings

- Keine aktuelle `MISSING`- oder `BROKEN`-Anforderung.
- Reale Zielgeräteabnahme ist offen.
- Mehrere damalige Nicht-Ziele wurden durch spätere, eigene Sprints bewusst
  ersetzt und deshalb nicht als Regression gewertet.

## Repair Required

Keine Code-Reparatur. Nur MT-01 durchführen und danach dieses Audit ergänzen.

## Final Assessment

Sprint 12 ist im Code vollständig nachvollziehbar, erhält aber bis zur realen
iOS-9-Abnahme den Gesamtstatus `PARTIAL`.
