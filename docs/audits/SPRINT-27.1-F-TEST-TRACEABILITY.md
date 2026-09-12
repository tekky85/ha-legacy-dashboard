# Sprint 27.1-F – Test-Traceability

Stand: 12. September 2026. Diese Matrix schließt die automatisierbaren
Traceability-Lücken aus `RQ-11-01`, `RQ-12-04`, `RQ-15-01` und `RQ-16-02`.
Sie ändert keine Produktlogik. Die maschinenlesbare Quelle liegt in
`test/fixtures/sprint-27-1-f-traceability.js`; der Test
`test/sprint-27-1-f.test.js` liest die historischen Spezifikationen selbst,
erfasst jede Nummer genau einmal und validiert alle Evidenzmarker sowie den
weiterhin unveränderten Status der manuellen Tests.

## Statusregeln

- `direct`: Verhalten wird in einem gezielten automatisierten Test geprüft.
- `equivalent`: Eine heutige, später gehärtete Regression prüft denselben
  beabsichtigten Endzustand.
- `manual`: Echte Browser-, iPad-, LXC- oder HAOS-Wirkung bleibt mit einer
  vollständigen Anleitung in der manuellen Queue `NOT TESTED`.

Alle automatisierten Tests verwenden lokale/synthetische Daten oder
Localhost-Mocks. Keine Produktionszugänge werden verwendet.

## Sprint 21.4 – 75 Anforderungen (`RQ-11-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–21 | direct | Entity-Suche, kombinierte Filter und drei Regeln in einem Draft |
| 22–30 | direct | Dirty State, Batch Save/Discard und geschützte Admin-API |
| 31–38 | direct | 3000 Entities, 500 Devices, 50 Areas und 100er DOM-Limit |
| 39–56 | direct | einmaliger Headercount, Summary-/Errorfilter, Groups und Spalten |
| 57–62 | equivalent | heutige Device-Class-/HA-Label-/Risk-Regressionssuite |
| 63–68 | equivalent | Gateway-, Dashboard-, Focus- und zentrale Control-Regressionen |
| 69–75 | direct | Legacy-, Token-, Write-, Registry-/Label- und Grant-Grenzen |

Reale Admin-/Tablet-/iPad-Wirkung bleibt MT-37 bis MT-39 `NOT TESTED`.

## Sprint 21.5 – 73 Anforderungen (`RQ-11-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–13 | direct | Healthy/Info/Warning/Error/Critical sowie stale/unknown/last-known |
| 14–25 | direct | Default-/Custom-/Direct-Return-Navigation |
| 26–33 | direct | interne Returnziele und vollständige Open-Redirect-Abwehr |
| 34–40 | direct | kleiner Statuspayload, geteilter Cache und Recovery ohne Extra-Polling |
| 41–47 | direct | ES5, Legacy.http, kein Grid/Flex-gap |
| 48 | manual | MT-40/MT-41: reale Touchziel-/HomeScreen-Wirkung |
| 49–59 | equivalent | aktuelle Filter-, Group-, Column- und Entity-Rule-Regressionen |
| 60–67 | equivalent | Default/Custom/Grid/Focus/Controls/Theme/Alignment |
| 68–73 | direct | Token-, Service-, WebSocket-, Return- und Grant-Grenzen |

MT-40 bis MT-42 bleiben vollständig `NOT TESTED`.

## Sprint 22 – 80 Anforderungen (`RQ-12-04`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–10 | direct | State-/Risk-Grace und zuverlässiges `last_changed` |
| 11–18 | direct | Expected Offline, Ignore-Trennung und Critical-Schutz |
| 19–27 | direct | Window, Threshold, begrenzter Ringbuffer und Restart |
| 28–32 | direct | Recovery Pending, stabile Recovery und Healthstabilität |
| 33–41 | direct | echte Device-ID-Gruppierung und konservativer Failure Hint |
| 42–48 | direct | Entity/Device/Security/Critical/Risk/Domain/Default-Priorität |
| 49–56 | direct | Adminregeln, Validation, Batch Save/Discard und Migration |
| 57–66 | equivalent | aktuelle Sprint-21.x-Systemdashboardregressionen |
| 67–73 | equivalent | normale Dashboards, Focus, Controls, Theme und Alignment |
| 74–80 | direct | keine History-/Write-/Service-/Registry-/Label-/Grant-Erweiterung |

Die realen Timing-, Restart- und Legacy-UI-Prüfungen MT-43 bis MT-45 bleiben
`NOT TESTED`.

## Sprint 23 – 84 Anforderungen (`RQ-12-04`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–8 | direct | minimiertes Automation Inventory einschließlich States/Triggerzeit |
| 9–18 | direct | feste Entity/Device/Area/Label-Referenzen, Deduplizierung, Dynamic |
| 19–27 | direct | direct/indirect/unknown Impact ohne falsche Kausalität |
| 28–32 | direct | Automation Health und Disabled-/Trigger-Kontext |
| 33–42 | direct | capability-driven Trace Summary ohne Raw Payload/Variables |
| 43–50 | direct | Timeout/Partial/Last-known/Inflight/On-demand und frischer Cacheindex |
| 51–57 | equivalent | Sprint-22-Regel-/Grace-/Flapping-/Recoveryregressionen |
| 58–67 | equivalent | Filter, Groups, Modes, Entity Rules und sichere Navigation |
| 68–74 | equivalent | Dashboard-, Focus-, Control-, Theme- und Alignmentregressionen |
| 75–84 | direct | read-only Automation-/WebSocket-/Payload-/Secret-Grenzen |

MT-46 bis MT-49 bleiben reale HA-/Browser-/iPad-Prüfungen mit Resultat
`NOT TESTED`.

## Sprint 25.1 – 74 Anforderungen (`RQ-15-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–15 | direct | globale Dark/Light-Persistenz, Cookie-Fallback und Storage-Fehler |
| 16–47 | direct | exakte Severity-/State-Filter, child-first Groups und Same-Child-AND |
| 48–61 | equivalent | Groups, Columns, Critical Modes, Rules und Automation Diagnostics |
| 62–67 | equivalent | Default/Custom/Focus/Light/Climate/Alignment |
| 68–74 | direct | Backend-only Tokens, keine neue Writefläche, Filter-/Grant-Trennung |

MT-13, MT-34, MT-40 und MT-42 bleiben die commitbezogenen realen Gates und
`NOT TESTED`.

## Sprint 25.2 – 51 Anforderungen (`RQ-15-01`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–21 | direct | Default/Custom/Summary/Errors/Back im selben Fensterkontext |
| 22–27 | direct | Origin-, Protokoll-, Dashboard-ID- und Open-Redirect-Abwehr |
| 28–34 | equivalent | globale Theme- und exakte Filterregressionen |
| 35–45 | equivalent | Dashboard-, Focus-, Control-, System- und Diagnosticsregressionen |
| 46–48 | direct | ES5, kein fetch/Promise und keine neue HA-Writefläche |
| 49–51 | manual | MT-40/MT-41: realer Touch-/Portrait-/Landscape-HomeScreen-Lauf |

Die bestätigte historische iPad-Regression kann erst mit MT-40/MT-41 auf dem
exakten Kandidaten real freigegeben werden; beide bleiben `NOT TESTED`.

## Sprint 25.3 – 84 Anforderungen (`RQ-16-02`)

| Nummern | Abdeckung | Primäre Evidenz |
|---|---|---|
| 1–10 | direct | JPEG/PNG, Typ, Größe, Auth, Traversal und Secret-Redaction |
| 11–18 | direct/equivalent | Dashboardzuordnung, Remove/Replace/Missing und Refresh |
| 19 | manual | MT-60: echter Standalone-Gateway-Neustart |
| 20 | manual | MT-51/MT-52: echter App-Neustart/Restore |
| 21–28 | direct | Config-/Assetkonsistenz, Theme und optionale Titel/Navigationscontrols |
| 29–30 | manual | MT-58: echte Portrait-/Landscape-Geometrie |
| 31–38 | direct | Position, Cover/Contain, Overlay und Focus-Layer |
| 39–50 | equivalent | Dashboard-, Grid-, Focus-, Navigation-, Theme-, Filter- und Controlsuite |
| 51–60 | direct | Token-, Admin-, Parser-, Traversal-, Listing-, Write- und Secret-Grenzen |
| 61–76 | manual | MT-51/52/54/58/60: Viewport, Footer, Rotation, HomeScreen, Runtimepersistenz |
| 77–84 | direct | Footerinhalt, Versionsplatzierung, Aktualisierung und ES5/Assetversion |

Die bereits geschlossene PNG-Härtung `RQ-16-01` ist direkt eingebunden.
MT-59 und MT-62 bleiben zusätzlich für die reale Upload-/Preview-/JPEG-
Abnahme `NOT TESTED`.

## Ergebnis

- exakt 521 nummerierte Anforderungen maschinell erfasst;
- keine unzugeordnete oder doppelt zugeordnete Nummer;
- frühere Root-Cause-Reparaturen aus Sprint 27.1-A bis E explizit eingebunden;
- reale Browser-, iPad-, LXC- und HAOS-Wirkung bleibt ausschließlich in der
  manuellen Queue und unverändert `NOT TESTED`;
- keine Produkt-, Route-, Persistenz-, Control- oder HA-Write-Funktion geändert.
