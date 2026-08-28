# Sprint 25.2 – HomeScreen Standalone Navigation Correctness

## Status
Planned

## Ziel

Sprint 25.2 behebt einen realen Pre-Release-Navigationsfehler auf dem iPad mini.

Aktuell:

```text
Dashboard als HomeScreen-Link gestartet
-> Summary oder Errors
-> iOS verlässt den Fullscreen-/Standalone-Modus
-> normaler Safari öffnet sich
-> neuer Tab / Safari-UI sichtbar
```

Gewünscht:

```text
HomeScreen Dashboard
-> Summary / Errors
-> gleiche Web-App-Instanz
-> gleicher Browsing Context
-> kein neuer Tab
-> kein Verlassen des Fullscreen-Modus
```

---

# Release Gate

Kein Stable Release, solange interne Navigation aus dem HomeScreen-Modus Safari öffnet.

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token nur im Backend
- SUPERVISOR_TOKEN nur im Backend
- keine neue Write API
- keine generische HA Service API
- keine generische HA WebSocket API
- Return Targets bleiben intern validiert
- kein Open Redirect

---

# Legacy-Kompatibilität

Ziel:

```text
iPad mini 1
iOS 9.3.5
Safari HomeScreen / standalone mode
ECMAScript 5
```

Zusätzlich prüfen:

```text
iPad Air 2 / iPadOS 15.8.5
macOS Safari
normaler Safari-Tab
```

Nicht verwenden:

- let / const
- arrow functions
- template literals
- fetch
- Promise
- async/await
- optional chaining
- nullish coalescing
- moderne Navigation APIs ohne Legacy-Fallback

---

# Teil A – Root Cause Analyse

Codex muss zuerst prüfen:

```text
<a href>
target="_blank"
target
window.open()
window.location
location.href
location.assign()
absolute URL
relative URL
same-origin URL
returnTo
onclick
preventDefault()
touch handlers
```

Zusätzlich:

```text
Hostname-Wechsel
Port-Wechsel
Protokoll-Wechsel
Ingress-Wechsel
absolute URL auf andere Origin
```

Nicht nur einen einzelnen Button patchen.

---

# Teil B – Zentrale Internal Navigation

Bevorzugt eine gemeinsame ES5-kompatible Funktion:

```javascript
function navigateInternal(path) {
    window.location.href = path;
}
```

oder äquivalent mit `location.assign()`.

Ziel:

```text
same browsing context
same web-app instance
same origin
```

---

# Keine window.open()-Navigation

Interne Dashboard-Routen dürfen nicht über:

```javascript
window.open(...)
```

geöffnet werden.

---

# Kein target="_blank"

Interne Navigation darf kein:

```html
target="_blank"
```

verwenden.

Wenn echte Links genutzt werden, maximal `_self`.

---

# Teil C – Interne Routen

Mindestens:

```text
/
/d/<valid-dashboard-id>
/system/summary
/system/errors
```

Interne Navigation bevorzugt als relative Pfade.

Nicht unnötig:

```text
http://host:port/system/errors
```

konstruieren.

---

# Same-Origin Pflicht

Interne Navigation muss dieselbe Origin behalten:

```text
protocol
host
port
```

---

# Home Assistant App Modus

Bei direktem App-Port:

```text
http://host:port/
-> http://host:port/system/errors
```

Nicht ungewollt auf Ingress oder eine andere HA-Origin wechseln.

---

# Teil D – navigator.standalone

`navigator.standalone` darf zur Diagnose genutzt werden.

Aber:

> Die Navigation darf nicht ausschließlich davon abhängen.

Eine gemeinsame same-window Navigation soll in normalem Safari und HomeScreen-Modus funktionieren.

---

# Teil E – Summary Navigation

Default:

```text
/
-> /system/summary
```

Custom:

```text
/d/kitchen
-> /system/summary
```

Beides im selben HomeScreen-Kontext.

---

# Teil F – Error Navigation

Default:

```text
/
-> /system/errors
```

Custom:

```text
/d/kitchen
-> /system/errors
```

Beides im selben HomeScreen-Kontext.

---

# Teil G – Return Navigation

Sprint 21.5 Return Target bleibt erhalten.

Beispiele:

```text
/d/kitchen
-> /system/errors
-> zurück
-> /d/kitchen
```

und:

```text
/d/kitchen
-> /system/summary
-> zurück
-> /d/kitchen
```

Auch die Rücknavigation bleibt im HomeScreen-Modus.

---

# Return Target

Bevorzugt nur internen Pfad speichern:

```text
/d/kitchen
```

statt vollständiger URL.

---

# Open Redirect Schutz

Weiterhin ablehnen:

```text
http://external.example
https://external.example
//external.example
javascript:
data:
blob:
```

---

# Teil H – Alle internen Links auditieren

Mindestens:

```text
Summary Button
Health Indicator / Errors Button
Summary Back
Errors Back
Home/Dashboard Navigation
Custom Dashboard Navigation
Admin interne Links
```

Wenn gleiche Fehlerklasse vorhanden ist, zentrale Helper verwenden.

---

# Teil I – HomeScreen Metadaten Audit

Bestehende Head-Metadaten prüfen:

```text
apple-mobile-web-app-capable
apple-mobile-web-app-status-bar-style
viewport
```

Keine komplette PWA-Neuentwicklung.

Keine Service-Worker-Pflicht.

---

# Teil J – Touch / Click Handling

Prüfen:

- `preventDefault()`
- kein doppeltes touchend + click
- kein Event Bubbling in falschen Handler
- kein zweimaliges Öffnen

---

# Teil K – Regression Guards

Automatisierte Tests sollen nach Möglichkeit verhindern:

```text
target="_blank" für interne System-Routen
window.open("/system/...")
```

---

# Teil L – Theme Regression

Sprint 25.1 bleibt erhalten:

```text
Dark
-> Summary
-> Back
-> Errors
-> Back
```

muss Dark bleiben.

---

# Teil M – Error Filter Regression

Sprint 25.1 Exact Filter bleibt erhalten:

```text
Info -> nur Info
Warning -> nur Warning
Error -> nur Error
Critical -> nur Critical
```

---

# Teil N – Normaler Safari

Im normalen Safari-Tab:

```text
Summary
Errors
Back
```

ebenfalls im selben Tab.

Keine Regression.

---

# Tests

1. Default -> Summary same window
2. Default -> Errors same window
3. Custom -> Summary same window
4. Custom -> Errors same window
5. Summary -> Back same window
6. Errors -> Back same window
7. kein target="_blank" intern
8. kein window.open intern
9. same-origin bleibt
10. relative/internal routes

11. HomeScreen Summary bleibt standalone
12. HomeScreen Errors bleibt standalone
13. HomeScreen Back bleibt standalone
14. kein Safari UI
15. kein neuer Tab
16. mehrfaches Summary/Errors Wechseln
17. Custom Dashboard Return
18. Default Dashboard Return

19. normaler Safari Summary same tab
20. normaler Safari Errors same tab
21. normaler Safari Back same tab

22. external returnTo reject
23. protocol-relative reject
24. javascript reject
25. data reject
26. valid internal route erlaubt
27. kein Open Redirect

28. Dark bleibt bei Summary
29. Dark bleibt bei Errors
30. Dark bleibt bei Back
31. Info Filter weiterhin exakt
32. Warning Filter weiterhin exakt
33. Critical Filter weiterhin exakt
34. kombinierte Filter weiterhin korrekt

35. Default Dashboard
36. Custom Dashboard
37. Focus
38. Light Controls
39. Climate Controls
40. Summary
41. Errors
42. Admin
43. 1/2/3 Columns
44. Device Groups
45. Automation Impact

46. ES5 Syntax
47. kein fetch
48. kein Promise
49. Touch funktioniert
50. Portrait
51. Landscape

---

# Manuelle Abnahme – iPad mini

Gerät:

```text
iPad mini 1
iOS 9.3.5
HomeScreen Link
```

## Test 1

```text
HomeScreen Dashboard starten
-> Summary
```

Erwartung:

```text
Summary öffnet im selben Fullscreen-Fenster.
Keine Safari-UI.
Kein neuer Tab.
```

## Test 2

```text
Summary
-> Zurück
```

Erwartung:

```text
ursprüngliches Dashboard
weiterhin Fullscreen
```

## Test 3

```text
Dashboard
-> Errors
```

Erwartung:

```text
Errors im selben Fullscreen-Fenster
```

## Test 4

```text
Errors
-> Zurück
```

Erwartung:

```text
ursprüngliches Dashboard
weiterhin Fullscreen
```

---

# Custom Dashboard Test

```text
/d/kitchen
-> Summary
-> zurück
-> /d/kitchen

/d/kitchen
-> Errors
-> zurück
-> /d/kitchen
```

Alles in derselben HomeScreen-Web-App.

---

# Mehrfachnavigation

```text
Dashboard
-> Summary
-> Back
-> Errors
-> Back
-> Summary
-> Back
```

Kein Übergang in normalen Safari.

---

# iPad Air 2

Zusätzlich prüfen:

```text
HomeScreen Modus
Safari normal
Portrait
Landscape
```

---

# Root Cause Pflicht

Codex muss konkret dokumentieren:

```text
welche Navigation bisher verwendet wurde
ob target="_blank" beteiligt war
ob window.open beteiligt war
ob absolute URL / Origin-Wechsel beteiligt war
welche Änderung same-window navigation sicherstellt
```

---

# Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- HomeScreen-/Standalone-Navigation
- interne Navigation bleibt im selben Web-App-Kontext
- direkte LAN-WebUI für Legacy iPads
- keine Ingress-Abhängigkeit

---

# Nicht-Ziele

Nicht Bestandteil:

- vollständige PWA-Neuentwicklung
- Service Worker
- Offline-Modus
- Web App Manifest Redesign
- neues Navigation-Menü
- neue Write-Funktionen
- tatsächliches Release Publishing

---

# Definition of Done

Sprint 25.2 ist abgeschlossen, wenn:

- Summary im HomeScreen-Modus im selben Fenster öffnet
- Errors im HomeScreen-Modus im selben Fenster öffnet
- Back im HomeScreen-Modus im selben Fenster bleibt
- kein Safari UI automatisch geöffnet wird
- kein neuer Tab geöffnet wird
- Default Dashboard funktioniert
- Custom Dashboards funktionieren
- Return Target erhalten bleibt
- Same-Origin erhalten bleibt
- interne System-Routen kein window.open verwenden
- interne System-Routen kein _blank verwenden
- Open Redirect Schutz erhalten bleibt
- Dark Mode Persistenz aus Sprint 25.1 erhalten bleibt
- Exact Error Filtering aus Sprint 25.1 erhalten bleibt
- normaler Safari-Tab nicht regressiert
- reale iPad-mini-Abnahme erfolgreich ist
- Safari iOS 9 / ES5 erhalten bleibt
- alle Tests grün sind
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. Root Cause
4. bisherige Summary-Navigation
5. bisherige Error-Navigation
6. target/window.open Befund
7. absolute/relative URL Befund
8. finale Internal Navigation Architektur
9. Same-Origin Verhalten
10. Return-Target Verhalten
11. Open-Redirect Regression
12. navigator.standalone Befund
13. iPad mini Summary Test
14. iPad mini Errors Test
15. iPad mini Back Test
16. Custom Dashboard Test
17. normaler Safari Test
18. iPad Air 2 Test, falls verfügbar
19. Theme Regression
20. Error Filter Regression
21. geänderte Dateien
22. Testanzahl und Ergebnis
23. Security Regression
24. verbleibende Einschränkungen
25. Release-Gate-Empfehlung
26. Commit-Vorschlag
27. Deploymentbefehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- README.de.md
- README.en.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-24.md
- docs/sprints/SPRINT-25.md
- docs/sprints/SPRINT-25.1.md
- docs/sprints/SPRINT-25.2.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 25.2 exactly as specified in docs/sprints/SPRINT-25.2.md.

Confirmed real-device regression:

When HA Legacy Dashboard is launched from an iOS HomeScreen icon on the iPad
mini, tapping Summary or Errors leaves the standalone/fullscreen web-app and
opens normal Safari with browser UI/new tab.

When used directly inside Safari, Summary/Errors correctly reuse the current
tab.

Required behavior:

All internal HA Legacy Dashboard navigation must remain in the same browsing
context and same web-app instance.

Audit:
- target="_blank"
- window.open()
- target attributes
- location.href / location.assign
- absolute vs relative URLs
- same-origin handling
- returnTo generation
- hostname/port/protocol changes
- Ingress switching
- click/touch handlers
- preventDefault behavior

Do not patch only one button if the same pattern exists elsewhere.

Create/reuse one ES5-compatible internal navigation helper.

Internal routes must use same-window navigation.

Do not use window.open() for internal routes.
Do not use target="_blank" for internal routes.

Prefer validated relative/internal paths:
- /
- /d/<valid-id>
- /system/summary
- /system/errors

Do not switch from the direct LAN dashboard origin to Home Assistant Ingress
during internal navigation.

Do not rely solely on navigator.standalone.

Preserve Sprint 21.5 validated return-target behavior and open-redirect
protection.

Preserve Sprint 25.1 global theme persistence and exact Error filtering.

Preserve all Home Assistant security boundaries and Safari iOS 9 / ES5
compatibility.

Do not add any new write capability.

Add regression tests rejecting internal system links using target="_blank" or
window.open where practical.

Manually verify on the real iPad mini HomeScreen installation:

1. Launch from HomeScreen.
2. Open Summary.
3. Confirm Safari UI does not appear.
4. Return to original dashboard.
5. Open Errors.
6. Confirm Safari UI does not appear.
7. Return to original dashboard.
8. Repeat from a custom dashboard.
9. Repeat several Summary/Errors round trips.
10. Verify Dark Mode remains persistent.

Also verify normal Safari does not open new tabs.

Treat this sprint as a Release Gate.

Do not recommend Stable Release if Summary/Error navigation still leaves the
HomeScreen/fullscreen context.

Update docs/PROJECT_STATUS.md and docs/SPRINT_ROADMAP.md.

Do not commit or push until I review the result.
```
