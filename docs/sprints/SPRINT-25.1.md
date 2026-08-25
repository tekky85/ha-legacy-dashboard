# Sprint 25.1 – Pre-Release UI State & Filter Correctness

## Status
Planned

## Ziel

Sprint 25.1 behebt zwei reale Release-Blocker auf dem iPad mini:

1. Dark Mode ist nicht persistent.
2. Severity-/Status-Filter im Error Dashboard filtern nicht exakt.

---

# Problem A – Dark Mode

Aktuell:

```text
Dark aktivieren -> Refresh -> Light
Dark aktivieren -> Summary -> Light
Dark aktivieren -> Errors -> Light
```

Ziel:

```text
Dark auswählen
-> Refresh: Dark
-> /system/summary: Dark
-> /system/errors: Dark
-> /d/<dashboard>: Dark
-> Zurück: Dark
```

Ein einmal gewähltes Theme bleibt aktiv, bis der Benutzer es bewusst ändert.

---

# Globale Theme Preference

Es darf nur eine gemeinsame persistente Theme Preference geben.

Konzeptuell:

```text
haLegacyTheme = dark
```

Bestehenden Repository-Key bevorzugen, falls bereits vorhanden.

Codex muss zuerst prüfen:

- welcher Storage Key aktuell geschrieben wird
- welcher Key gelesen wird
- ob Summary/Errors eigene Theme-Logik haben
- ob Light beim Initialisieren hart gesetzt wird
- ob Theme nach Route Load überschrieben wird
- ob der gemeinsame Legacy-Storage-Helper überall geladen wird

Keine zweite parallele Theme-Implementierung bauen.

---

# Theme Initialisierung

Bevorzugte Reihenfolge:

```text
1. gespeicherte Preference lesen
2. Wert validieren
3. Theme anwenden
4. UI rendern
```

Nicht erst Light rendern und danach Dark nachladen, wenn dies vermeidbar ist.

---

# Theme-Routen

Verbindlich:

```text
/
 /d/<dashboard>
 /system/summary
 /system/errors
 Admin, sofern dort Theme unterstützt wird
```

Sprint-21.5-Return-Navigation darf das Theme nicht verändern.

---

# Storage Failure

Falls Legacy Safari Storage nicht verfügbar ist:

- kein Crash
- laufende Session behält aktuellen Theme-State
- sicherer Fallback

---

# Problem B – Error Severity Filter

Aktuell beobachtet:

```text
Info -> Warning wird ebenfalls angezeigt
Warning -> Critical wird ebenfalls angezeigt
Critical -> nur Critical
```

Das ist falsch.

---

# Exact Match Semantik

Severity Filter müssen exakt sein:

```text
Critical -> nur critical
Error    -> nur error
Warning  -> nur warning
Info     -> nur info
All      -> alle
```

Nicht als Schwellenfilter implementieren:

```text
severity >= warning
```

Severity-Rangfolge bleibt nur für:

- Group Severity
- Overall Health
- Global Health Indicator

relevant.

---

# Device Groups

Beispiel:

```text
Device
- Child A -> critical
- Child B -> warning
- Child C -> info
```

Ungefiltert:

```text
Group Severity = critical
```

Filter `Info`:

```text
sichtbar:
- Child C -> info

sichtbare Group Severity = info
```

Filter `Warning`:

```text
sichtbar:
- Child B -> warning

sichtbare Group Severity = warning
```

Filter `Critical`:

```text
sichtbar:
- Child A -> critical

sichtbare Group Severity = critical
```

Die ursprüngliche Group Severity darf intern erhalten bleiben, aber die gefilterte Darstellung benötigt eine eigene `visibleSeverity` oder äquivalente Presentation-Semantik.

---

# Child Details

Bei aktivem Severity-/Status-Filter sollen nur passende Child-Issues angezeigt werden.

Nicht passende Children dürfen nicht weiterhin sichtbar bleiben und dadurch eine falsche Severity suggerieren.

---

# Status Filter

Status bleibt exakt:

```text
All
Unavailable
Unknown
```

Semantik:

```text
Unknown     -> state == unknown
Unavailable -> state == unavailable
All         -> alle
```

---

# Kombinierte Filter

Severity und Status werden mit AND kombiniert.

Beispiel:

```text
Severity = Info
Status = Unknown
```

Ein einzelnes Child muss beides erfüllen:

```text
severity == info
AND
state == unknown
```

Nicht zulässig:

```text
Child A = info + unavailable
Child B = warning + unknown
```

und daraus trotzdem ein Treffer für `Info + Unknown` machen.

---

# Filter Pipeline

Bevorzugt:

```text
Original Issues
-> Severity Predicate
-> Status Predicate
-> matching Children
-> Group nur behalten wenn mindestens ein Child passt
-> visibleSeverity berechnen
-> visible counts berechnen
-> rendern
```

---

# Global Health bleibt ungefiltert

UI-Filter dürfen den globalen Health Status nicht verändern.

Beispiel:

```text
Critical Issue vorhanden
User filtert Info
```

Global Health Indicator bleibt:

```text
Critical
```

Filter sind ausschließlich Presentation State.

---

# Business Logic unverändert

Nicht verändern:

- ursprüngliche Severity-Berechnung
- Risk Classes
- Device-Class Mode
- HA-Label Mode
- Grace Periods
- Expected Offline
- Flapping
- Recovery
- Automation Impact

Sprint 25.1 korrigiert nur UI-State und Filter-Presentation.

---

# Tests – Theme

1. Dark auf Default aktivieren
2. Refresh -> Dark
3. Summary öffnen -> Dark
4. Summary Refresh -> Dark
5. Errors öffnen -> Dark
6. Errors Refresh -> Dark
7. Custom Dashboard öffnen -> Dark
8. Custom Dashboard Refresh -> Dark
9. Return aus Summary -> Dark
10. Return aus Errors -> Dark
11. Light aktivieren
12. Refresh -> Light
13. Light auf allen Routen
14. ungültiger Storage-Wert -> sicherer Default
15. Storage Failure -> kein Crash

---

# Tests – Severity

16. All -> alle
17. Critical -> nur Critical
18. Error -> nur Error
19. Warning -> nur Warning
20. Info -> nur Info
21. Warning zeigt kein Critical
22. Info zeigt kein Warning
23. Info zeigt kein Error
24. Info zeigt kein Critical
25. Error zeigt kein Critical
26. Error zeigt kein Warning

---

# Tests – Device Groups

27. mixed Group ungefiltert -> höchste Severity
28. Filter Info -> visibleSeverity info
29. Filter Warning -> visibleSeverity warning
30. Filter Error -> visibleSeverity error
31. Filter Critical -> visibleSeverity critical
32. nicht passende Children hidden
33. passende Children sichtbar
34. sichtbare Counts korrekt

---

# Tests – Status

35. Unknown -> nur unknown
36. Unavailable -> nur unavailable
37. All -> alle

---

# Tests – Combined

38. Info + Unknown
39. Info + Unavailable
40. Warning + Unknown
41. Warning + Unavailable
42. Error + Unknown
43. Error + Unavailable
44. Critical + Unknown
45. Critical + Unavailable
46. Match muss auf demselben Child liegen
47. Group ohne passendes Child hidden

---

# Regression

48. Device Groups
49. 1/2/3 Columns
50. Device-Class Mode
51. HA-Label Mode
52. Entity Rule Manager
53. Summary Navigation
54. Error Navigation
55. Return Target
56. Grace Periods
57. Expected Offline
58. Flapping
59. Recovery
60. Automation Impact
61. Advanced Diagnostics
62. Default Dashboard
63. Custom Dashboards
64. Focus
65. Light Controls
66. Climate Controls
67. Sprint 17.7 Control Alignment

---

# Security Regression

68. HA-Token Backend-only
69. SUPERVISOR_TOKEN Backend-only im App Mode
70. keine neue Write API
71. keine generische HA Service API
72. keine generische HA WS API
73. Theme Preference enthält keine Secrets
74. Filter verändern keine Backend-Severity

---

# Manuelle Abnahme – iPad mini

Gerät:

```text
iPad mini 1
iOS 9.3.5
Safari
```

Theme-Test:

```text
Dark aktivieren
-> Refresh
-> Summary
-> Refresh
-> zurück
-> Errors
-> Refresh
-> zurück
-> Custom Dashboard
```

Erwartung:

```text
Dark bleibt überall aktiv.
```

Danach Light aktivieren und dieselbe Route-Matrix testen.

---

# Manuelle Abnahme – Error Filter

Testdatensatz mit:

```text
Critical
Error
Warning
Info
Unknown
Unavailable
```

und mindestens einer Device Group mit gemischten Child-Severities.

Erwartung:

```text
Info     -> nur Info
Warning  -> nur Warning
Error    -> nur Error
Critical -> nur Critical
```

Zusätzlich kombinierte Severity-/Status-Filter testen.

---

# Release Gate

Sprint 25.1 blockiert einen Stable Release, solange mindestens einer dieser Punkte fehlschlägt:

```text
Dark Mode bleibt auf dem iPad mini nicht persistent
oder
Severity Filter zeigt andere Severities
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

Falls Sprint D1 vorhanden, relevante echte Screenshots prüfen.

---

# Definition of Done

Sprint 25.1 ist abgeschlossen, wenn:

- Dark Mode nach Refresh erhalten bleibt
- Dark Mode in Summary erhalten bleibt
- Dark Mode in Errors erhalten bleibt
- Dark Mode in Custom Dashboards erhalten bleibt
- Return Navigation Theme nicht verändert
- Light Mode ebenfalls persistent funktioniert
- genau eine globale Theme Preference verwendet wird
- Storage Failure sicher behandelt wird
- Info ausschließlich Info zeigt
- Warning ausschließlich Warning zeigt
- Error ausschließlich Error zeigt
- Critical ausschließlich Critical zeigt
- Device Groups unter Filter passende visibleSeverity verwenden
- nicht passende Children verborgen werden
- Severity + Status exakt per AND kombiniert werden
- Cross-Child-Matches ausgeschlossen sind
- Filter den globalen Health Status nicht verändern
- bestehende Error Business Logic unverändert bleibt
- Safari iOS 9 / ES5 erhalten bleibt
- reale iPad-mini-Abnahme erfolgreich ist
- alle Tests grün sind
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. Theme Root Cause
4. bisherige Theme Storage Keys
5. finale globale Theme Preference
6. Theme Init Reihenfolge
7. iOS-9-Storage-Verhalten
8. Error Filter Root Cause
9. bisherige Filtersemantik
10. neue Exact-Match-Semantik
11. Device-Group-Filterarchitektur
12. visibleSeverity Lösung
13. kombinierte Severity-/Status-Logik
14. Cross-Child-Match-Schutz
15. Health Indicator Regression
16. geänderte Dateien
17. Testanzahl und Ergebnis
18. iPad mini Theme Test
19. iPad mini Filter Test
20. iPad Air 2 Test, falls verfügbar
21. macOS Safari Test
22. Security Regression
23. Screenshot Review
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
- docs/sprints/SPRINT-17.2.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-21.3.md
- docs/sprints/SPRINT-21.4.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-22.md
- docs/sprints/SPRINT-23.md
- docs/sprints/SPRINT-25.md
- docs/sprints/SPRINT-25.1.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 25.1 exactly as specified in docs/sprints/SPRINT-25.1.md.

This is a focused pre-release correctness sprint with two confirmed
real-device regressions.

1. Global theme persistence

On iPad mini, Dark Mode is lost after refresh and when navigating to Summary
or Errors.

Find the root cause first.

Use one global persistent theme preference shared by default dashboards,
custom dashboards, Summary, Errors and Admin where applicable.

Do not create route-specific theme states.

A selected Dark theme must remain active until the user explicitly changes it.

Use the existing legacy-safe storage abstraction where practical.

Handle storage failures without crashing.

2. Exact Error Dashboard filtering

Current incorrect behavior:
- Info still shows Warning
- Warning still shows Critical

Severity filters must use exact-match semantics:

Critical -> only critical
Error -> only error
Warning -> only warning
Info -> only info

Do not implement the UI filter as a severity threshold.

For Device Groups:
- filter child issues first
- keep the group only when at least one child matches
- derive a visible/presentation severity from matching children
- hide non-matching children in filtered details
- preserve the original unfiltered group severity for All view

Severity and Status filters combine with AND.

A single child must satisfy both active filters.
Do not allow cross-child matches.

The UI filter must never alter the global Error health state or the Sprint
21.5 Health Indicator.

Preserve Sprint 21.x behavior, Sprint 22 rule/grace/flapping/recovery,
Sprint 23 Automation Impact, all Home Assistant security boundaries and
Safari iOS 9 / ES5 compatibility.

Do not add new write capabilities.

Run complete regressions and manually verify on the real iPad mini.

Treat this sprint as a Release Gate.

Do not recommend Stable Release if either theme persistence or exact Severity
filtering still fails.

Update docs/PROJECT_STATUS.md and docs/SPRINT_ROADMAP.md.

Do not commit or push until I review the result.
```
