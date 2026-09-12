# Sprint-25.2-Audit – HomeScreen Standalone Navigation Correctness

## Auditrahmen

- Audit-Part: 15
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.2.md`](../../sprints/SPRINT-25.2.md)
- Anwendungscode geändert: nein
- Produktives Home Assistant, HAOS oder physisches iPad kontaktiert: nein

## Gesamtergebnis

**Sprint 25.2: PARTIAL**

Die aktuelle Navigation ist zentralisiert und sicher: Alle Wall-Display-
Systemlinks erhalten interne relative Ziele, `target="_self"` und einen
ES5-kompatiblen Click-Handler, der ausschließlich nach erfolgreicher interner
Pfadprüfung `window.location.href` setzt. Das genaue Default-/Custom-
Dashboard wird als validiertes `returnTo` erhalten. Der Server prüft zusätzlich,
dass die Dashboard-ID tatsächlich existiert. Absolute, externe,
protocol-relative und Script-/Data-Ziele werden abgewiesen; ein ungültiges
Queryziel wird auf die queryfreie interne Systemroute bereinigt.

Die Sprintursache ist im heutigen Code nachvollziehbar: Gewöhnliche Links
allein überließen die Browsing-Context-Entscheidung Mobile Safari. Die aktuelle
explizite Same-Window-Navigation vermeidet diese Interpretation. Der Quellcode
enthält kein internes `window.open()`, kein `_blank`, keinen festen Host/Port
und keine `navigator.standalone`-Sonderlogik.

`PARTIAL` ist zwingend, weil der bestätigte Fehler nur auf einem echten
iPad-mini-HomeScreen abschließend widerlegt werden kann. Dieser Lauf wurde im
Audit nicht ausgeführt. Die früheren Code-/Traceability-Befunde `RQ-04-01` und
`RQ-15-01` sind inzwischen geschlossen.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.2-ROOT-01 | Reale Ursache statt oberflächlichem CSS-Fix identifiziert | PASS | Aktuelle Architektur adressiert den Browsing-Context: explizites `_self` plus `window.location.href`; keine Layoutänderung. Physische Bestätigung bleibt MT-40/41. |
| 25.2-AUDIT-01 | `target="_blank"` in internen Links auditiert und entfernt | PASS | Public-/Admin-/HTML-Scan ohne internes `_blank`; `test/sprint-25-2.test.js` prüft statisch. |
| 25.2-AUDIT-02 | `window.open()` in interner Navigation auditiert und entfernt | PASS | Kein Treffer in `src/public`/`src/admin`; gezielter Regressionstest. |
| 25.2-AUDIT-03 | Absolute URLs, Origin-/Portwechsel und feste Hosts auditiert | PASS | Systemziele werden nur als relative Pfade konstruiert; kein fester Host, IP, Protokoll oder Port im Wall-Code. |
| 25.2-AUDIT-04 | Click-/Touchpfad auditiert | PASS | Ein nativer `onclick` mit `preventDefault()`; kein paralleler `touchend`-/Pointerpfad und damit kein Doppeltap-Mechanismus. Physische Touchwirkung bleibt NOT TESTED. |
| 25.2-NAV-01 | Eine zentrale interne Navigationsfunktion | PASS | `src/public/js/core/system-navigation.js:navigateInternal()` validiert und setzt `window.location.href`. |
| 25.2-NAV-02 | Interne Ziele bleiben same-window | PASS | `setLink()` setzt `target="_self"` und ruft ausschließlich `navigateInternal()`. Reales HomeScreen-Fenster bleibt MT-40. |
| 25.2-NAV-03 | Interne Ziele bleiben same-origin | PASS | `validateInternalPath()` akzeptiert ausschließlich relative `/`, `/d/...`, `/system/summary` und `/system/errors`; absolute/protocol-relative Ziele scheitern. |
| 25.2-NAV-04 | Navigation funktioniert unabhängig von `navigator.standalone` | PASS | Der Code liest `navigator.standalone` nicht; Browser und HomeScreen verwenden denselben Pfad. |
| 25.2-NAV-05 | Kein modernes Router-/History-API als Pflicht | PASS | Normale Location-Navigation und optional sicheres `history.back()`; kein SPA-Router. |
| 25.2-ROUTE-01 | Default Dashboard → Summary intern | PASS | `initializeDashboard()` erzeugt `/system/summary?returnTo=%2F`; Test grün. |
| 25.2-ROUTE-02 | Default Dashboard → Errors intern | PASS | Health-Link verwendet `/system/errors?returnTo=%2F`; Test grün. |
| 25.2-ROUTE-03 | Custom Dashboard → Summary intern | PASS | `currentDashboardPath()` übernimmt gültiges `/d/<id>`; Harness prüft `/d/kitchen/`. |
| 25.2-ROUTE-04 | Custom Dashboard → Errors intern | PASS | Gleiches exaktes Custom-Returnziel; Harness und Sprint-21.5-Tests grün. |
| 25.2-ROUTE-05 | Summary ↔ Errors bleiben intern | PASS | `initializeSystemPage()` setzt beide Systemlinks aus demselben validierten Context. |
| 25.2-ROUTE-06 | Summary/Errors → Back bleibt intern | PASS | Back-Link nutzt validiertes `returnTo`, sichere same-origin History oder `/`. |
| 25.2-ROUTE-07 | Admin-/Preview-interne Links öffnen nicht unnötig ein neues Fenster | PASS | Admin-Preview verwendet relative `/d/<id>`-Links ohne `_blank`; statischer Audit grün. Admin-Anmeldung bleibt getrennt. |
| 25.2-RET-01 | Default-Rückziel bleibt exakt `/` | PASS | `validateDashboardPath("/")`; Tests für Default Return. |
| 25.2-RET-02 | Custom-Rückziel bleibt exakt `/d/<id>` | PASS | Client erhält den Pfad, Server prüft zusätzlich die reale Dashboardexistenz. |
| 25.2-RET-03 | Query wird korrekt kodiert und beim Systemseitenwechsel erhalten | PASS | `systemUrl()` nutzt `encodeURIComponent`; Summary/Errors setzen denselben `returnTo`. |
| 25.2-RET-04 | Reload einer Systemseite verliert das sichere Rückziel nicht | PASS | Ziel bleibt im Query; Initialisierung liest und validiert es neu. Physische HomeScreen-Wirkung bleibt MT-40. |
| 25.2-RET-05 | Direktaufruf ohne Rückziel fällt sicher auf `/` zurück | PASS | `returnContext()` defaultet auf `/`; optional nur sichere same-origin Referrer-History. |
| 25.2-RET-06 | Unbekannte Dashboard-ID wird serverseitig abgewiesen | PASS | `dashboard-return-target.js:resolve()` verlangt `dashboardExists(id) === true`; Gatewaytest erwartet Redirect. |
| 25.2-SEC-01 | Externes `returnTo` wird abgewiesen | PASS | Clientvalidator und Express-Route; Tests mit `https://external.example`. |
| 25.2-SEC-02 | Protocol-relative Ziel wird abgewiesen | PASS | `pathname.indexOf("//") === 0`; Securitytest. |
| 25.2-SEC-03 | `javascript:`, `data:` und `blob:` werden abgewiesen | PASS | Nicht erlaubte Pfade; gezielte Tests. |
| 25.2-SEC-04 | Fragmente, Zusatzquery und malformed Encoding werden sicher abgewiesen | PASS | `#`, `&`, falscher Queryaufbau und Decodefehler liefern `null`; serverseitig queryfreier Fallback. |
| 25.2-SEC-05 | Same-origin absolute URL wird nicht als interner Pfad akzeptiert | PASS | Validator akzeptiert keine Schemen/Hosts; Test schließt auch absolute same-origin URL aus. |
| 25.2-SEC-06 | Kein Open Redirect | PASS | Client- und Servervalidierung sind unabhängig; Gatewaytest belegt 302 ausschließlich auf `/system/...` ohne unsicheres Query. |
| 25.2-SEC-07 | HA-/Supervisor-/Admin-Credentials bleiben getrennt und backend-only | PASS | Navigation sendet keinen Token; Publicscan ohne HA-/Supervisor-Token. Admin-Bearer-Token bleibt nur in der geschützten Admin-App. |
| 25.2-SEC-08 | Keine neue Write- oder generische HA-API | PASS | Navigation nutzt nur GET-Seitenwechsel; Systemendpunkte bleiben read-only, Control-Routen unverändert eng. |
| 25.2-META-01 | HomeScreen-Metadaten bleiben vorhanden | PASS | `index.html` und `system.html` enthalten `apple-mobile-web-app-capable`, Statusbar-Style, Viewport und Format-Detection. |
| 25.2-META-02 | Systemseiten verwenden dieselben Standalone-relevanten Metadaten | PASS | Beide Entry-Points besitzen die relevanten Apple-/Viewport-Metatags. |
| 25.2-TOUCH-01 | Ein Tap erzeugt höchstens eine Navigation | PASS | Nur Clickhandler; kein zusätzliches Touch-/Pointerevent. Automatisierter Harness grün, physisches iOS bleibt MT-40/41. |
| 25.2-TOUCH-02 | Native Links behalten Fallback-Semantik | PASS | `href` wird stets auf denselben validierten internen Pfad gesetzt; JS-Handler ist zusätzliche Härtung. |
| 25.2-REG-01 | Sprint-25.1-Theme bleibt auf Summary/Errors/Back erhalten | PASS | Gemeinsames `Theme` plus Theme-Routentests; physischer Nachweis MT-13/40. Cache-Risiko separat `25.2-CACHE-01`. |
| 25.2-REG-02 | Exakte Info/Warning/Error/Critical-Filter und Kombinationen bleiben korrekt | PASS | Part-15-System-Frontendtest prüft alle Severities, States und Same-Child-AND. |
| 25.2-REG-03 | Default/Custom, Focus, Controls, Columns, Device Groups, Automation Impact und Admin bleiben erhalten | PASS | Vollständige Regression 329/329; keine Anwendungscodeänderung im Audit. Bestehende spätere Auditbefunde bleiben separat dokumentiert. |
| 25.2-LEG-01 | Wall-Navigation bleibt ES5-kompatibel | PASS | `var`, Funktionen, Callbacks; kein `let`/`const`, Arrow, Template Literal, fetch, Promise, async/await, Optional Chaining oder Module. |
| 25.2-LEG-02 | Keine moderne Browser-API ist Navigationsvoraussetzung | PASS | `window.location.href`, normale Links und DOM-Level-Events; kein PointerEvent-/Service-Worker-/Router-Zwang. |
| 25.2-LEG-03 | CSS benötigt kein Grid/Flex-gap/ResizeObserver/Container Query | PASS | Relevanter Wall-CSS-/Source-Scan grün. |
| 25.2-DEP-01 | Standalone/LXC funktioniert ohne Hostannahme | PASS | Relative Pfade folgen dem ausgelieferten Origin einschließlich Host und Port; keine LXC-Adresse im Code. Reale Rollout-Abnahme ist nicht Teil des Auditlaufs. |
| 25.2-DEP-02 | Home Assistant App funktioniert bei direktem LAN-Port ohne Ingressannahme | PASS | Ebenfalls relative Pfade; keine Ingress-/Supervisor-Navigation oder originändernde WebUI-URL im Browsercode. Reale HAOS-Abnahme bleibt spätere Queue. |
| 25.2-CACHE-01 | Aktueller Navigationhelper wird auf allen Routen konsistent ausgeliefert | PASS | Dashboard und Systemseite laden `system-navigation.js?v=53`; Admin/Manifest sind ebenfalls v53; `test/asset-version.test.js`. | RQ-04-01 code-seitig geschlossen; HomeScreen-Same-Window bleibt real zu prüfen. |
| 25.2-TEST-01 | Alle 51 nummerierten Fälle sind direkt rückverfolgbar | PASS | Sprint-25.2-/21.5-/Gateway-/Theme-/Filtertests plus maschinengeprüfte Sprint-27.1-F-Traceability | Alle Nummern sind direkt/äquivalent zugeordnet; Touch/Portrait/Landscape bleiben MT-40/41. |
| 25.2-MAN-01 | iPad mini: Default→Summary→Back bleibt HomeScreen | NOT TESTED | MT-40; Part 15 verwendete kein physisches iPad. |
| 25.2-MAN-02 | iPad mini: Default/Custom→Errors→Back bleibt HomeScreen | NOT TESTED | MT-40. |
| 25.2-MAN-03 | iPad mini: Mehrfachwechsel, Portrait/Landscape und Theme | NOT TESTED | MT-40 kombiniert den vollständigen Ablauf. |
| 25.2-MAN-04 | iPad Air 2: Normal Safari und optional HomeScreen | NOT TESTED | MT-41. |
| 25.2-MAN-05 | macOS Safari: Same-Tab, Redirectabwehr und Langzeitlauf | NOT TESTED | MT-42. |
| 25.2-DOC-01 | README DE/EN, Roadmap und Projektstatus dokumentieren Same-Window/Return | PASS | Synchronisierte README-Abschnitte und Sprintabschnitte vorhanden; allgemeiner Status-Drift bleibt `RQ-08-03`. |

## Finale Navigationsarchitektur

```text
aktueller Pfad `/` oder `/d/<id>`
  -> syntaktisch validieren
  -> relative Systemroute + encodeURIComponent(returnTo)
  -> Link-href + target=_self
  -> Click: preventDefault, internen Gesamtpfad erneut validieren
  -> window.location.href im selben Browsing Context

Systemseite
  -> returnTo clientseitig begrenzen
  -> serverseitig Dashboardexistenz prüfen
  -> Summary/Errors tragen dasselbe Ziel weiter
  -> Back: explizites Ziel, sichere same-origin History, sonst `/`
```

## Superseded-Beziehungen

- Sprint 25.2 ersetzt den gewöhnlichen Sprint-21.5-Linkmechanismus durch den
  aktuellen validierten `_self`-/`window.location.href`-Pfad. Summary-/Health-
  Semantik und das exakte Returnziel bleiben erhalten.
- Spätere Dashboard-Hintergründe, Sections und Room Cards ändern diesen
  zentralen Navigationshelper nicht; alle normalen Dashboards verwenden
  weiterhin denselben `index.html`-Entry-Point.

## Automatisierte Verifikation

- Part-15-Fokuslauf: **65/65 PASS** nach Freigabe ausschließlich lokaler
  Mockports; ein vorheriger `listen EPERM` war Sandboxinfrastruktur.
- Gesamtsuite: **329/329 PASS**, 0 Fehler.
- Neun relevante JavaScript-Dateien bestanden `node --check`.
- Kein `_blank`, kein `window.open()`, kein fester Host/IP/Port und keine
  absolute interne Systemroute gefunden.
- Open-Redirect-, malformed-Query-, unbekannte-Dashboard-, Default-/Custom-
  Return-, Theme- und Exact-Filter-Regressionen: **PASS**.
- Kein produktives HA, HAOS, LXC oder physisches iPad kontaktiert.

## Manuelle Evidenz und Repair-Mapping

- MT-13: Theme über die Systemnavigation;
- MT-34: Filter-/HomeScreen-Nichtregression;
- MT-40: vollständiger iPad-mini-HomeScreen-Default-/Custom-Ablauf;
- MT-41: iPad Air 2 in Safari und optional HomeScreen;
- MT-42: macOS Safari, Redirectabwehr und Langzeitlauf;
- `RQ-04-01`: in Sprint 27.1-B code-seitig geschlossen;
- `RQ-15-01`: in Sprint 27.1-F code-seitig geschlossen;
- `RQ-14-04`: Stable-Gate erzwingt die realen 25.1/25.2-Abnahmen noch nicht.

## Abschluss

Der aktuelle Quellcode erfüllt das sichere Same-Window-/Same-Origin- und
Return-Target-Enddesign. Ohne echte iPad-mini-HomeScreen-Abnahme und vor
der commitbezogenen Release-Gate-Freigabe darf die bestätigte reale Regression
dennoch nicht als endgültig geschlossen gelten. Der routeabhängige immutable
Cachezustand ist code-seitig bereits behoben. Es wurde kein Anwendungscode
repariert.

## Sprint-27.1-F-Re-Audit

`RQ-15-01` ist für Sprint 25.2 **CODE CLOSED / MANUAL PENDING**. Alle 51
Nummern sind lückenlos zugeordnet; `_self`/`window.location.href`, relative
same-origin Routen, sichere Returnziele, Theme und exakte Filter sind
automatisiert belegt. Fokuslauf 151/151 und Gesamtsuite 377/377 bestanden. Der
reale Touch-/Portrait-/Landscape-HomeScreen-Lauf MT-40/MT-41 bleibt
`NOT TESTED`.
