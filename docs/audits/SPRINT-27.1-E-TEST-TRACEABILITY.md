# Sprint 27.1-E – Test-Traceability

Stand: 12. September 2026. Diese Matrix schließt die automatisierbaren
Traceability-Lücken aus `RQ-07-01`, `RQ-08-01`, `RQ-09-02` und `RQ-10-01`.
Sie ändert keine Produktlogik. Die maschinenlesbare Quelle liegt in
`test/fixtures/sprint-27-1-e-traceability.js`; der Test
`test/sprint-27-1-e.test.js` liest die historischen Spezifikationen selbst,
expandiert alle Bereiche auf einzelne Anforderungsnummern und verhindert
Lücken, Dopplungen, ungültige Evidenzmarker oder fehlende Manual-Test-IDs.

## Statusregeln

- `direct`: Verhalten wird in einem gezielten automatisierten Test geprüft.
- `equivalent`: Eine heutige, später gehärtete Regression prüft denselben
  beabsichtigten Endzustand.
- `manual`: Das nummerierte Layout-/Realbrowserverhalten bleibt mit einer
  vollständigen Anleitung in der manuellen Queue `NOT TESTED`.
- `N/A`: Die Anforderung war ausdrücklich capability-abhängig und die
  verlässliche Capability existiert im aktuellen Adapter nicht.

Manuelle Einträge werden dadurch weder ausgeführt noch auf `PASS` gesetzt.
Alle Tests verwenden lokale/synthetische Daten oder localhost-Mocks; es
werden keine Produktionszugänge verwendet.

## Sprint 19 – 70 Anforderungen (`RQ-07-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–31 | direct | `test/summary.test.js`: vollständige Domain-/State-Tabelle einschließlich Door, Window off, Cover closing, Vacuum returning/paused, Climate cooling, Media idle, numerischem Power-Sensor und unknown/unavailable |
| 32–35 | direct | Summary-Dauer-/Sortier-/Tie-Breaker-Test |
| 36–38 | direct | explizite Ignore-Tabelle einschließlich unbekannter ID |
| 39 | direct | `test/sprint-27-1-e.test.js`: Summary-/Error-Regeln verändern Control Grants nicht |
| 40–45 | equivalent | Gateway-Systempayload plus Summary Online/Stale/Offline/Recovery |
| 46–51 | equivalent | Admin-Draft und persistente Schema-Migration/-Validierung |
| 52–62 | equivalent | System-Frontend-VM und Legacy-Quellscan |
| 63–70 | equivalent | Gateway-, Security-, Grid-/Focus-/Control-Regressionssuite |

Zusätzliche reale Abnahme bleibt in MT-24 bis MT-26 `NOT TESTED`.

## Sprint 20 – 82 Anforderungen (`RQ-08-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–18 | direct | Issue-State-/Security-Matrix und explizite Trennung von Regeln und Control Grants |
| 19–28 | direct | vollständige Severity-Reihenfolge, Security-/Dauer-/Titel-/Entity-Tie-Breaker und fehlende Zeitwerte |
| 29–42 | direct | eigener OK-/Warning-/Error-/Critical-/Stale-/Offline-/Recovery-Nachweis |
| 43–49 | equivalent | normalisierte, reduzierte und `no-store` geschützte Gatewayantwort |
| 50–57 | equivalent | Admin Save/Discard, Persistenz/Reload und Write-Trennung |
| 58–68 | equivalent | Error-System-Frontend für Loading, Severity, State, Empty, Stale, Offline und Recovery |
| 69 | direct | statischer Schutz langer Titel/Children durch schrumpfbare Flex-Elemente und Umbruch |
| 70–72 | direct | Legacy-Quellscan ohne fetch/Promise/moderne Syntax |
| 73–82 | equivalent | Summary-, Dashboard-, Admin-, Grid-, Theme-, Control- und Securityregressionen |

Zusätzliche reale Abnahme bleibt in MT-27, MT-28, MT-34 und MT-42
`NOT TESTED`.

## Sprint 21 – 93 Anforderungen (`RQ-09-02`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–11 | direct | Backend-WebSocket-Authentifizierung, Korrelation, Timeout, Disconnect, Error-only-Reconnect und Tokenredaktion |
| 12–34 | direct | Entity-/Device-/Area-Registry-Normalisierung, Sanitization, Area-Priorität und unbekannte Area |
| 35–50 | direct | Config-Entry-/Repair-Normalisierung, Severity und read-only Grenze |
| 51–54 | direct | capability-driven read-only Matter-Adapter einschließlich unsupported/failure/credential boundary |
| 55–57 | N/A | Capability-abhängige Matter-Device-/Entity-Aggregation; die installierte HA-Schnittstelle bietet weiterhin keine belastbare read-only Diagnosequelle |
| 58–66 | direct | keine Matter-Writes, TTL, Deduplizierung, Partial Failure, stale und Recovery |
| 67–83 | equivalent | heutige Summary-/Error-/Admin-/Focus-/Control-/Theme-Regressionssuite |
| 84–93 | direct | Security-/Command-/Payload-Scan einschließlich Identifier-Sanitization |

Zusätzliche reale Standalone-/HA-/iPad-Abnahme bleibt in MT-30 und MT-32
`NOT TESTED`.

## Sprint 21.1 – 77 Anforderungen (`RQ-09-02`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–10 | direct | Filtercontroller ohne Reload einschließlich Count und Empty State |
| 11–30 | direct | echte `device_id`-Aggregation, Standalone-Regeln, Severity/Counts und deterministische Sortierung |
| 31–39 | direct | collapsed Details und sanitizierte Child-Daten |
| 40 | direct | langer Entity-/Device-Titel mit Flex-Shrink-/Wrap-Schutz |
| 41–43 | equivalent | responsiver 1/2/3-Spalten-Controller und Viewport-Caps |
| 44–47 | manual | MT-31/MT-32: reale Scrollbar-, Overlap-, variable Höhen- und Expanded-Details-Wirkung |
| 48–54 | direct | CSS-/Legacy-Scan ohne Grid, gap oder modernes Pflichtfeature |
| 55–64 | equivalent | Issue-/Registry-/Partial-Failure-Regressionssuite |
| 65–71 | equivalent | Summary, User-Dashboards, Admin, Focus, Controls und Theme |
| 72–77 | direct | Token-/Write-/Registry- und Grant-Abgrenzung |

## Sprint 21.2 – 92 Anforderungen (`RQ-10-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–20 | direct | alle Summaryfilter, Counts, Empty/Stale sowie Storage-/Reload-Spaltenverhalten |
| 21–22 | manual | MT-33: reale iPad-Portrait-/Landscape-Wirkung |
| 23–30 | direct | Error-Spalten, Persistenz, Groups/Details und kontrollierter responsiver Fallback |
| 31–32 | manual | MT-34: reale Error-Portrait-/Landscape-Wirkung |
| 33–65 | direct | Safety-/Security-/Normal-/Override-/Device-Group-Matrix |
| 66–79 | equivalent | Summary-/Error-/Registry-/Aggregation-Regressionssuite |
| 80–85 | equivalent | Dashboard-, Admin-, Focus-, Control- und Theme-Regressionssuite |
| 86–92 | direct | Read-only-/Token-/Grant-/Raw-Registry-Sicherheitsgrenzen |

## Sprint 21.3 – 96 Anforderungen (`RQ-10-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–19 | direct | exakte Severity-/State-Filter, Same-Child-AND, child-first Groups, Details und Empty State |
| 20 | manual | MT-34: reale horizontale Overflowprüfung |
| 21–55 | direct | Device-Class-, Cover- und Label-Modi einschließlich Mode-Isolation |
| 56–58 | direct | stabile Label-ID bei Rename, Missing und serverseitige Validation |
| 59–65 | direct | keine Area-Vererbung/Writes, Prioritäten und deterministischer Modewechsel |
| 66–74 | direct | available/unsupported/error/stale/first-failure/Recovery sowie Token-/Proxy-Grenze |
| 75–88 | equivalent | Registry-, Device-, Diagnostics-, Spalten-, Summary- und stale/offline-Regressionssuite |
| 89–96 | direct | vollständiger Label-/Registry-/WS-/Service-/Token-/Raw-Payload-Sicherheitscheck |

Die reale HA-Label-Abnahme bleibt in MT-35 und MT-36 `NOT TESTED`.

## Ergebnis

- exakt 510 nummerierte Anforderungen maschinell erfasst;
- keine unzugeordnete oder doppelt zugeordnete Nummer;
- bedingte Matter-Fälle 21-55 bis 21-57 ausdrücklich `N/A`;
- reale Layout-/iPad-/HA-Verhalten ausschließlich auf bestehende vollständige
  Manual-Tests abgebildet und weiterhin `NOT TESTED`;
- keine Produkt-, Route-, Persistenz-, Control- oder HA-Write-Funktion geändert.
