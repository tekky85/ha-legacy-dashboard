# Sprint-25.1-Audit – Pre-Release UI State & Filter Correctness

## Auditrahmen

- Audit-Part: 15
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.1.md`](../../sprints/SPRINT-25.1.md)
- Anwendungscode geändert: nein
- Produktives Home Assistant, HAOS oder physisches iPad kontaktiert: nein

Zu Beginn lagen ausschließlich die noch nicht committeten Auditdokumente aus
Parts 12 bis 14 und die bereitgestellten Auditprompts im Arbeitsbaum. Diese
Änderungen wurden bewahrt; der Anwendungscode entspricht Commit `593ba5a`.

## Gesamtergebnis

**Sprint 25.1: PARTIAL**

Die fachliche Implementierung des globalen Themes und der exakten Errorfilter
ist vorhanden und durch aktuelle Tests belegt. `Theme` verwendet genau eine
nicht sensitive Preference `ha-legacy-theme`, wendet sie vor dem sichtbaren
Rendern an und fällt bei fehlerhaftem `localStorage` auf ein rootweites Cookie
bzw. einen sicheren Sitzungszustand zurück. Severity und State matchen exakt
auf demselben Child; Device Groups werden erst auf Childebene gefiltert und
erhalten eine ausschließlich aus den sichtbaren Children abgeleitete Severity,
Counts und Details. Der globale ungefilterte Healthzustand bleibt davon
getrennt.

`PARTIAL` entsteht nicht aus einem fachlichen Filter- oder Themefehler.
Sprint 27.1-B hat die früher inkonsistenten immutable Cacheversionen aus
`RQ-04-01` mit der aktuellen gemeinsamen Version v53 und einem Gleichheitstest
code-seitig geschlossen. Es fehlt
weiterhin eine lückenlose direkte Zuordnung aller 74
Spezifikationsfälle (`RQ-15-01`), und die vorgeschriebene reale iPad-/Safari-
Abnahme steht aus.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.1-THEME-01 | Eine globale Dark/Light-Preference für alle Wall-Routen | PASS | `src/public/js/core/theme.js:3` definiert ausschließlich `ha-legacy-theme`; kein zweiter Wall-Storage-Key gefunden. |
| 25.1-THEME-02 | Default Dashboard behält das Theme nach Reload | PASS | `Theme.readStoredTheme()`, `loadEarly()` und `load()`; `test/sprint-17-2.test.js` prüft Dark→Reload und Light→Reload. |
| 25.1-THEME-03 | Custom Dashboards verwenden dieselbe Preference | PASS | Alle `/d/<id>`-Routen rendern `src/public/index.html` mit demselben `Theme`; Cookie-Test umfasst einen Custom-Pfad. |
| 25.1-THEME-04 | Summary verwendet dieselbe Preference | PASS | `src/public/system.html` lädt dasselbe `theme.js`; Routen-Harness prüft `/system/summary`. |
| 25.1-THEME-05 | Errors verwendet dieselbe Preference | PASS | Derselbe System-Entry-Point; Routen-Harness prüft `/system/errors`. |
| 25.1-THEME-06 | Rücknavigation bewahrt das globale Theme | PASS | Theme ist rootweit, unabhängig vom `returnTo`; Theme- und Return-Regressionen sind grün. Physische HomeScreen-Wirkung bleibt MT-13/40. |
| 25.1-THEME-07 | Admin übernimmt das globale Wall-Theme, soweit anwendbar | N/A | Admin besitzt bewusst nur eine moderne Card-Preview-Themeauswahl, keine globale Wall-Theme-Umschaltung; es existiert daher keine zweite Admin-Preference zu synchronisieren. |
| 25.1-THEME-08 | Initialisierung liest, validiert, wendet an und rendert dann UI | PASS | `readStoredTheme()` akzeptiert nur `dark`/`light`; `Theme.loadEarly()` läuft im Script sofort und `index.html`/`system.html` laden es vor CSS und App-Render. |
| 25.1-THEME-09 | Kein längeres falsches Initial-Theme/Flackern | PASS | Klasse wird vor CSS auf `document.documentElement` gesetzt; DOM-Load ergänzt `body` und Button. Visuelle reale iOS-Wirkung bleibt NOT TESTED in MT-13. |
| 25.1-THEME-10 | `localStorage`-Lesefehler verursacht keinen Crash | PASS | `readStoredValue()` fängt Zugriffsfehler; Test deckt Storage-Ausfall ab. |
| 25.1-THEME-11 | `localStorage`-Schreibfehler verursacht keinen Crash | PASS | `storeValue()` fängt Schreibfehler; Cookie und In-Memory-`current` erhalten Bedienbarkeit. |
| 25.1-THEME-12 | Persistenter Fallback auf Legacy Safari | PASS | `storeCookieValue()` setzt dasselbe Preference-Cookie mit `path=/`; Cookie-Harness prüft alle geforderten Routen. Physischer iOS-9-Nachweis bleibt MT-13. |
| 25.1-THEME-13 | Ungültiger gespeicherter Wert fällt sicher zurück | PASS | Nur `dark`/`light` werden akzeptiert; Tests mit `sepia`/`contrast` starten sicher in Light. |
| 25.1-THEME-14 | Totaler Storage-Ausfall lässt Umschaltung in der Sitzung zu | PASS | `Theme.current` und Klassenänderung hängen nicht vom Erfolg der Persistenz ab; gezielter Test ist grün. |
| 25.1-THEME-15 | Keine Secrets in der Theme-Preference | PASS | Gespeichert wird ausschließlich der String `dark` oder `light`; kein Token-/Entityinhalt. |
| 25.1-CACHE-01 | Aktuelle Theme-/Systemlogik wird routeübergreifend konsistent ausgeliefert | PASS | `index.html`, `system.html`, Admin und Manifest verwenden v53; `test/asset-version.test.js` prüft insbesondere Theme/Style/Compat/Systemnavigation. | RQ-04-01 code-seitig geschlossen; reale HomeScreen-Abnahme bleibt `NOT TESTED`. |
| 25.1-SEV-01 | `All` zeigt alle Severity-Stufen | PASS | `activeSeverityFilter === "all"` umgeht nur die Severity-Bedingung; System-Frontendtest prüft die vollständige Fixture. |
| 25.1-SEV-02 | `Critical` zeigt ausschließlich Critical | PASS | `issue.severity === activeSeverityFilter`; Test prüft sichtbares Critical-Child und schließt Nachbarstufen aus. |
| 25.1-SEV-03 | `Error` zeigt ausschließlich Error | PASS | Exakter Stringvergleich; keine kumulative Ranglogik im Filter. |
| 25.1-SEV-04 | `Warning` zeigt ausschließlich Warning | PASS | Exakter Stringvergleich; Critical/Error/Info bleiben verborgen. |
| 25.1-SEV-05 | `Info` zeigt ausschließlich Info | PASS | Exakter Stringvergleich; Warning/Error/Critical bleiben verborgen. |
| 25.1-STATE-01 | `All` zeigt Unknown und Unavailable | PASS | `activeStateFilter === "all"`; Fixture und Countprüfung sind grün. |
| 25.1-STATE-02 | `Unknown` zeigt ausschließlich Unknown | PASS | `issue.state === activeStateFilter`; exakte Fixtureprüfung. |
| 25.1-STATE-03 | `Unavailable` zeigt ausschließlich Unavailable | PASS | Exakter Statevergleich; keine Kategorien-/Truthy-Näherung. |
| 25.1-COMB-01 | Severity und State werden mit AND kombiniert | PASS | `issueMatches()` verbindet beide exakten Bedingungen mit `&&`. |
| 25.1-COMB-02 | Beide Dimensionen müssen auf demselben Child matchen | PASS | `visibleGroup()` ruft `issueMatches()` je einzelnem Child auf; Test verwirft `Critical + Unknown` und `Warning + Unavailable` trotz Cross-Child-Vorkommen. |
| 25.1-GROUP-01 | Device Groups werden child-first gefiltert | PASS | `visibleGroup()` bildet zuerst `matchingIssues`; eine Group ohne Match wird entfernt. |
| 25.1-GROUP-02 | Ungefilterte Group zeigt ihre kanonische höchste Severity | PASS | Bei `all/all` bleiben alle Children erhalten; der Renderer nutzt die sichtbare, daraus höchste Severity. |
| 25.1-GROUP-03 | Sichtbare Gruppenseverity stammt nur aus passenden Children | PASS | `highestVisibleSeverity(matchingIssues, ...)` setzt `visibleSeverity`; Card-Klasse und Text werden im Test für alle vier Stufen geprüft. |
| 25.1-GROUP-04 | Sichtbare Counts stammen nur aus passenden Children | PASS | `visibleCounts(matchingIssues)` rekonstruiert Severity-, State-, Flapping- und Recovery-Counts. |
| 25.1-GROUP-05 | Child-Details enthalten nur passende Children | PASS | `result.issues = matchingIssues`; der geöffnete Detailtext wird im System-Frontendtest geprüft. |
| 25.1-GROUP-06 | Source-Payload und kanonische Gruppe werden nicht mutiert | PASS | Eigenschaften werden in ein neues Objekt kopiert; der Test vergleicht den ursprünglichen Payload nach allen Kombinationen. |
| 25.1-GROUP-07 | Group ohne passendes Child wird vollständig verborgen | PASS | `matchingIssues.length === 0` liefert `null`; Filter-Empty-State getestet. |
| 25.1-GROUP-08 | Standalone-Issues verwenden dieselbe exakte Semantik | PASS | Gruppen ohne Children werden direkt mit `issueMatches(group)` geprüft. |
| 25.1-HEALTH-01 | Error-UI-Filter ändern den globalen Error-/Healthzustand nicht | PASS | `render(payload)` setzt `renderOverall(payload.overallStatus)` aus dem ungefilterten Payload; Filteränderung rendert nur Gruppen neu. Dashboard-Health lädt separat `/api/system-dashboards/status`. |
| 25.1-HEALTH-02 | Filter lösen keine Backend-Severity-Neuberechnung aus | PASS | Severity-/State-Controller arbeiten rein clientseitig auf `lastPayload`; Test belegt nur einen Request über alle Filterwechsel. |
| 25.1-BUSINESS-01 | Sprint-20/21-Detection und Severity bleiben unverändert | PASS | Änderungen liegen in Theme und sichtbarer Filterprojektion; Issue-/Risk-Services werden nicht vom Filter aufgerufen. Aktuelle Sprint-22/23-Auditbefunde sind separate Altbefunde. |
| 25.1-REG-01 | Device Grouping, Columns, Critical Modes und Entity Rules bleiben erhalten | PASS | Part-09- bis Part-11-Regressionen und Gesamtsuite 329/329 grün. |
| 25.1-REG-02 | Grace, Expected Offline, Flapping, Recovery, Automation Impact und Diagnostics bleiben erhalten | PASS | Relevante Regressionstests sind grün; Part-12-Befunde `RQ-12-01` bis `RQ-12-03` wurden nicht durch 25.1 verursacht oder verdeckt. |
| 25.1-REG-03 | Default/Custom, Focus und Light/Climate Controls bleiben erhalten | PASS | Gesamtsuite 329/329; keine Anwendungscodeänderung im Audit. |
| 25.1-LEG-01 | Wall-JavaScript bleibt ES5-/iOS-9-kompatibel | PASS | Syntax- und Forbidden-Scan: kein `let`/`const`, Arrow, Template Literal, `fetch`, Promise, async/await, Optional Chaining oder Nullish Coalescing in den relevanten Wall-Dateien. |
| 25.1-LEG-02 | CSS benötigt kein Grid/Flex-gap/ResizeObserver/Container Query | PASS | Relevanter CSS-/Source-Scan ohne diese harten Abhängigkeiten. |
| 25.1-SEC-01 | HA_TOKEN und SUPERVISOR_TOKEN bleiben backend-only | PASS | Kein Treffer in Public/Admin-Assets; Theme und Filter benötigen keine Credentials. |
| 25.1-SEC-02 | Keine neue Write- oder generische HA-Service-/WebSocket-API | PASS | Route-/Frontendscan ohne neue System-Writefläche; bestehende Controls bleiben eng serverseitig autorisiert. |
| 25.1-SEC-03 | Filter erteilen keine Write-Berechtigung | PASS | Filterzustand bleibt rein lokal und wird nicht an Control-Authorization übergeben. |
| 25.1-TEST-01 | Alle 74 nummerierten Fälle sind direkt rückverfolgbar | PASS | Theme-/Filter-/System-/Gateway-/Securitytests plus maschinengeprüfte Sprint-27.1-F-Traceability | Jede Nummer besitzt direkte oder dokumentiert äquivalente Evidenz; reale Gates bleiben MT-13/34/40/42. |
| 25.1-MAN-01 | Theme auf iPad mini/iOS 9 HomeScreen vollständig abgenommen | NOT TESTED | MT-13; in Part 15 wurde kein physisches Gerät verwendet. |
| 25.1-MAN-02 | Exakte Filter und Device Groups auf iPad mini vollständig abgenommen | NOT TESTED | MT-34; vollständige Schritte und Expected/Fail-Kriterien vorhanden. |
| 25.1-MAN-03 | HomeScreen-Health-/Return-Nichtregression auf iPad mini | NOT TESTED | MT-40. |
| 25.1-MAN-04 | Aktuelles macOS Safari: Theme, Filter und Failure-Fallback | NOT TESTED | MT-42. |
| 25.1-DOC-01 | README DE/EN und technische Statusdokumentation beschreiben den Endzustand | PASS | Synchronisierte Theme-/Filterbeschreibung in README DE/EN; Sprintabschnitt in Roadmap/Projektstatus vorhanden. Allgemeiner Status-Drift bleibt separat `RQ-08-03`. |
| 25.1-SHOT-01 | Sichtbarer Endzustand mit aktuellen echten Produktbildern belegt | PARTIAL | D1-Galerie existiert, ist laut Part-08-Audit jedoch teilweise veraltet; `RQ-08-02`/MT-29. |

## Theme- und Filterarchitektur

```text
theme.js vor CSS
  -> localStorage("ha-legacy-theme")
  -> bei Fehler rootweites Cookie mit demselben Schlüssel
  -> nur dark/light akzeptieren
  -> Klasse auf html, danach body und Button

ungefiltertes Error-Payload
  -> pro Child: exact severity AND exact state
  -> nur passende Children kopieren
  -> visibleSeverity/Counts/Details neu ableiten
  -> Gruppen ohne Match entfernen
  -> overallStatus und globaler /status bleiben unverändert
```

## Superseded-Beziehungen

- Sprint 25.1 härtet die in Sprint 17.2 eingeführte Theme-Persistenz. Die
  aktuelle gemeinsame Implementierung lebt weiterhin in `theme.js`; der
  ursprüngliche globale Endzustand bleibt erfüllt.
- Sprint 25.1 ersetzt die frühere sichtbare Filterprojektion aus Sprint
  21.2/21.3 durch exact-match und child-first `visibleGroup()`. Device Grouping,
  Kritikalitätsmodi und globale serverseitige Severity bleiben erhalten.
- Sprint 22 erweitert die kanonische Issuebildung später um Regeln, Grace,
  Flapping und Recovery. Der Sprint-25.1-Filter arbeitet weiterhin nur auf dem
  daraus gelieferten Payload und ist deshalb kein paralleler Risk-Engine-Pfad.

## Automatisierte Verifikation

- Part-15-Fokuslauf: **65/65 PASS**, nachdem ausschließlich localhost-Mockports
  freigegeben wurden; der erste eingeschränkte Lauf hatte einen `listen EPERM`-
  Infrastrukturfehler, keinen Assertionsfehler.
- Gesamtsuite: **329/329 PASS**, 0 Fehler.
- Neun relevante JavaScript-Dateien bestanden `node --check`.
- Legacy-, CSS-, Same-Origin- und Securityscans: **PASS**.
- Kein produktives Home Assistant, HAOS oder physisches iPad kontaktiert.

## Manuelle Evidenz und Repair-Mapping

- MT-13: globales Theme im iPad-mini-HomeScreen;
- MT-34: exakte Severity-/State-Filter und child-first Device Groups;
- MT-40: Theme/Health/Return im HomeScreen;
- MT-42: Desktop-Safari, Failure-Fallback und Langzeitlauf;
- `RQ-04-01`: in Sprint 27.1-B code-seitig geschlossen;
- `RQ-08-02`: veraltete Produktbilder;
- `RQ-15-01`: in Sprint 27.1-F code-seitig geschlossen; reale Gates bleiben
  `NOT TESTED`.

## Abschluss

Die aktuelle fachliche Theme- und Filterlogik erfüllt den spezifizierten
Endzustand. Die Testtraceability ist geschlossen; wegen der ausstehenden
realen Safari-/iPad-Abnahme kann Sprint 25.1 noch nicht als vollständig
freigegeben gelten. Es wurde kein Anwendungscode repariert.

## Sprint-27.1-F-Re-Audit

`RQ-15-01` ist für Sprint 25.1 **CODE CLOSED / MANUAL PENDING**. Alle 74
Nummern sind lückenlos zugeordnet. Globale Theme-Persistenz einschließlich
Storage-Fallback und exakte Severity-/State-/Same-Child-Filter bleiben
automatisiert grün. Fokuslauf 151/151 und Gesamtsuite 377/377 bestanden;
MT-13, MT-34, MT-40 und MT-42 bleiben `NOT TESTED`.
