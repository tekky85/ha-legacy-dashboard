# Sprint 23 – Automation Impact & Advanced Diagnostics

## Status
Planned

## Einordnung

Sprint 23 baut auf Sprint 20, 21.x und 22 auf.

Ziel ist eine read-only Analyse, welche Automationen möglicherweise von einem ausgefallenen Gerät oder einer ausgefallenen Entity betroffen sind, plus zusätzliche Diagnoseinformationen.

Home Assistant besitzt Automation Entities und Traces. Traces dokumentieren Schritt für Schritt, was bei einer Automation passiert ist. Sprint 23 verwendet solche Informationen ausschließlich read-only und nur capability-driven.

---

# Hauptziele

1. read-only Automation Inventory
2. statische Automation-Impact-Analyse
3. Zuordnung problematischer Entities/Devices zu Automationen
4. Automation Health Informationen
5. letzte Triggerzeit
6. Trace Summary, wenn unterstützt
7. Diagnosehinweise bei echten Automation-Ausführungsfehlern
8. Integration in Device Groups und Standalone Issues
9. Advanced Diagnostics im Error Dashboard
10. klare Trennung zwischen Fakt und heuristischer Impact-Aussage

---

# Sicherheitsgrundsätze

Verbindlich:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu HA
- keine generische HA-WebSocket-Weiterleitung
- keine generische Service-API
- keine Automation Trigger API
- keine Automation Enable/Disable API
- keine Automation Reload API
- keine Automation Edit API
- keine Trace-Löschfunktion
- keine Config-/Registry-/Label-/Repair-/Matter-Writes
- keine YAML-/Blueprint-Writes
- keine neue Write Capability

Sprint 23 ist vollständig read-only gegenüber Home Assistant.

---

# Legacy-Kompatibilität

Frontend weiterhin:

```text
iPad mini 1
iOS 9.3.5
Safari iOS 9
ECMAScript 5
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
- CSS Grid
- Flexbox gap
- ResizeObserver
- Container Queries

---

# Teil A – Automation Inventory

Gateway erstellt eine normalisierte Automation-Liste.

Konzeptuell:

```javascript
{
    entityId: "automation.flurlicht",
    name: "Flurlicht automatisch",
    state: "on",
    available: true,
    lastTriggered: "...",
    mode: "single",
    currentRuns: 0,
    maxRuns: 1,
    references: {...}
}
```

Tatsächliche verfügbare Felder anhand der installierten HA-Version prüfen.

---

# Automation State Semantik

Unterscheiden:

```text
on
off
unavailable
unknown
missing
```

Wichtig:

```text
off != defekt
```

Eine bewusst deaktivierte Automation ist nicht automatisch ein Error.

`automation.* unavailable` darf diagnostisch bewertet werden.

Fehlendes `last_triggered` ist ebenfalls nicht automatisch ein Fehler.

---

# Teil B – Automation References

Ziel ist die statische Erkennung expliziter Referenzen.

Mindestens prüfen, sofern read-only Automation-Konfiguration zuverlässig verfügbar ist:

```text
entity_id
device_id
area_id
label_id
```

in:

```text
triggers
conditions
actions / targets
```

Beispiel:

```yaml
target:
  entity_id: light.wohnzimmer
```

→ sichere explizite Referenz.

---

# Keine vollständige Template-Analyse

Nicht versuchen, beliebige Jinja-/Template-Ausdrücke vollständig zu verstehen.

Beispiel:

```yaml
entity_id: "{{ states('input_text.target') }}"
```

→ nicht statisch sicher auflösbar.

Intern:

```text
dynamicReferences = true
```

UI:

```text
Dynamische Referenzen vorhanden – Impact möglicherweise unvollständig.
```

---

# Teil C – Reference Index

Bevorzugte Maps:

```text
automationsByEntityId
automationsByDeviceId
automationsByAreaId
automationsByLabelId
```

Keine O(n²)-Suche.

---

# Teil D – Impact Confidence

Verbindlich unterscheiden:

```text
direct
indirect
unknown
```

## direct

Explizite Entity- oder Device-ID referenziert.

## indirect

Area-/Label-Referenz umfasst betroffenes Element.

## unknown

Dynamische/nicht auflösbare Referenz.

UI-Beispiele:

```text
Direkt referenziert
Über Area referenziert
Über Label referenziert
Dynamische Referenz – Analyse unvollständig
```

---

# Keine falsche Kausalität

Nicht behaupten:

```text
Automation verursacht den Gerätefehler
```

nur weil eine Referenz existiert.

Bevorzugt:

```text
Diese Automation referenziert die betroffene Entity.
```

oder:

```text
Möglicherweise betroffen.
```

---

# Teil E – Device Group Integration

Device Group darf anzeigen:

```text
2 Automationen möglicherweise betroffen
```

Beispiel:

```text
Fenster Schlafzimmer              KRITISCH
3 Entitäten betroffen
2 Automationen referenzieren dieses Gerät

[ Details anzeigen ]
```

Expanded:

```text
Automationen

Flurlicht automatisch
Direkt referenziert
Letzter Trigger: vor 14 Min.

Alarm bei offenem Fenster
Direkt referenziert
Letzter Trigger: gestern
```

Automation Impact Details standardmäßig collapsed.

---

# Standalone Issues

Auch einzelne Entity-Issues dürfen Automation Impact erhalten.

---

# Teil F – Automation Health

## off

```text
Deaktiviert
```

Kontext/Info, nicht automatisch Warning/Error.

## unavailable

Darf ein Diagnostic Issue erzeugen.

Bevorzugt:

```text
warning
```

sofern keine explizite Regel etwas anderes definiert.

## unknown

Nach bestehender Rule Engine behandeln.

---

# Teil G – Trace Summary

Wenn die installierte HA-Version einen zuverlässigen read-only Trace-Zugriff bietet, darf Sprint 23 eine kleine Trace Summary verwenden.

Capability:

```text
automationInventory: true/false
automationConfigRead: true/false
automationTraceRead: true/false
```

Unsupported ist kein Fehler.

Keine fest verdrahtete Annahme eines internen Commands ohne Capability-Probe.

---

# Trace Summary

Nur normalisierte Felder, beispielsweise:

```text
runId
timestamp/start
finish
duration
result/state
error
triggerDescription
```

Keine vollständigen Raw Trace Payloads an den Browser.

---

# Trace Error Semantik

Ein echter Trace-Fehler darf als Diagnosehinweis erscheinen.

Nicht als Fehler behandeln:

```text
Condition false
Not triggered
bewusst übersprungene Ausführung
```

Eine Automation, die aufgrund einer Condition nicht weiterläuft, arbeitet normal.

---

# Trace Age

Alter darf angezeigt werden:

```text
Letzte Ausführung vor 2 Stunden
```

Keine Severity allein aufgrund hohen Alters.

---

# Teil H – Privacy / Minimization

Automation Config und Traces können sensible Informationen enthalten.

Browser erhält nicht:

- vollständige Automation YAML/JSON Config
- Raw Trace Variables
- Raw Action Data
- Raw Service Data
- vollständige States aus Trace

Nur normalisierte Diagnosezusammenfassung.

Bestehende Secret Redaction anwenden.

Keine Trace-Variablen ungefiltert loggen.

---

# Teil I – Advanced Diagnostics

Error Dashboard erhält optional einen einklappbaren Abschnitt:

```text
Advanced Diagnostics
```

Beispiel:

```text
Automation Impact
2 möglicherweise betroffene Automationen

Integration
Matter

Config Entry
loaded

Device
Aqara Window Sensor

Area
Schlafzimmer

Diagnostic Sources
Registry: OK
Repairs: OK
Automation Traces: verfügbar
```

Keine JSON-Dumps.

---

# Teil J – Neue Diagnostic Types

Mögliche interne Typen:

```text
automation_unavailable
automation_trace_error
automation_reference_impact
```

`automation_reference_impact` ist Kontext und nicht automatisch ein eigenes Error Issue.

---

# Wiederholte Trace Errors

Optional kompakt:

```text
3 letzte Traces mit Fehler
```

wenn zuverlässig verfügbar.

Kein großes Statistiksystem.

---

# Teil K – Disabled Automation Kontext

Wenn eine deaktivierte Automation eine aktuell problematische Entity referenziert:

```text
Automation referenziert dieses Gerät, ist aber deaktiviert.
```

Dies ist Kontext, nicht automatisch ein Fehler.

---

# Teil L – Caching

Bevorzugte Richtwerte:

```text
Automation Entity State:
bestehender State Snapshot

Automation Config/Reference Index:
30–120 Sekunden

Trace Summaries:
15–60 Sekunden oder on-demand
```

Bestehende Cache-Architektur bevorzugen.

Inflight Deduplication verwenden.

---

# On-demand Trace Loading

Trace Summary bevorzugt nur laden, wenn:

- Error Dashboard geöffnet
- Advanced Diagnostics geöffnet
- betroffene Automation vorhanden

Keine Trace-Abfrage für normale Dashboard-Header.

---

# Teil M – Sprint-22-Integration

Sprint 22 Rule Engine bleibt vorgelagert.

Automation Impact wird erst an ein Issue gehängt, wenn dieses nach:

```text
Grace
Expected Offline
Flapping
Recovery
Severity
```

tatsächlich aktiv ist.

Global Health Indicator soll nicht allein wegen Automation-Impact-Kontext anschlagen.

---

# Teil N – Admin Diagnostics

Diagnostic Sources erweitern:

```text
Automation Inventory      available/unsupported
Automation Config Read    available/unsupported
Automation Trace Read     available/unsupported
```

Keine Controls:

```text
Trigger
Enable
Disable
Reload
Edit
```

---

# Partial Failure

Beispiel:

```text
Registry OK
Automation Inventory OK
Trace API unavailable
```

→ restliche Impact-Analyse funktioniert weiter.

Trace Unsupported zerstört Error Dashboard nicht.

---

# Tests – Inventory

1. automation on
2. automation off
3. automation unavailable
4. last_triggered vorhanden
5. last_triggered null
6. Friendly Name
7. keine Raw Config im Browser
8. keine Secrets im Log

---

# Tests – References

9. entity_id in trigger
10. entity_id in condition
11. entity_id in action target
12. device_id
13. area_id
14. label_id, wenn unterstützt
15. doppelte Referenz dedupliziert
16. dynamisches Template nicht falsch aufgelöst
17. dynamicReferences markiert
18. keine Name-Heuristik

---

# Tests – Impact

19. direct entity impact
20. direct device impact
21. area indirect impact
22. label indirect impact
23. unrelated automation nicht angezeigt
24. Device Group Impact Count
25. Standalone Entity Impact
26. Confidence korrekt
27. keine falsche Kausalität

---

# Tests – Automation Health

28. off nicht automatisch warning
29. unavailable diagnostic issue
30. unknown nach bestehender Regel
31. last_triggered Alter erzeugt keine Severity
32. disabled als Kontext

---

# Tests – Traces

33. Trace capability available
34. Trace capability unsupported
35. erfolgreicher Trace
36. Trace mit Error
37. Condition false nicht als Error
38. Not Triggered nicht als Error
39. Duration normalisiert
40. keine Raw Trace Payloads
41. Trace Variables nicht geloggt
42. wiederholte Fehler optional aggregiert

---

# Tests – Failure / Cache

43. Inventory timeout
44. Config timeout
45. Trace timeout
46. Partial Failure
47. Last-known metadata
48. Inflight Deduplication
49. Trace on-demand
50. keine Trace-Abfrage im normalen Dashboard-Header

---

# Regression Sprint 22

51. Grace Period
52. Expected Offline
53. Flapping
54. Recovery
55. Device Aggregation
56. Rule Priority
57. Global Health Indicator

---

# Regression Sprint 21.x

58. Severity Filter
59. Status Filter
60. 1/2/3 Columns
61. Device Groups
62. Device-Class Mode
63. HA-Label Mode
64. Entity Rule Manager
65. Summary Navigation
66. Error Navigation
67. Return Target

---

# Regression übrige Anwendung

68. Default Dashboard
69. Custom Dashboards
70. Focus
71. Light Controls
72. Climate Controls
73. Theme Persistenz
74. Legacy Safari Alignment

---

# Security Regression

75. HA-Token Backend-only
76. keine Automation Trigger API
77. keine Automation Enable/Disable API
78. keine Automation Reload API
79. keine Automation Edit API
80. keine generische WS API
81. keine Raw Automation Config
82. keine Raw Traces
83. keine Secret-Leaks
84. keine neue HA Write Capability

---

# Performance

Test mindestens:

```text
3000 Entities
500 Devices
500 Automations
200 aktive Issues
2000 explizite Automation References
100 Trace Summaries
```

Prüfen:

- Referenzindex über Maps/Sets
- keine O(n²)-Entity-Automation-Suche
- Config Cache
- Trace Cache
- on-demand Trace Loading
- kompakter Browser Payload

---

# Manuelle Abnahme

Error Dashboard:

```text
Device Group
→ Automation Impact Count
→ Details
→ Automation-Liste
→ Confidence
→ Last Triggered
→ Trace Summary falls verfügbar
```

iPad:

```text
iPad mini / iOS 9
iPad Air 2 / iPadOS 15.8.5
```

Prüfen:

- collapsed Details
- Expand/Collapse
- keine horizontale Scrollbar
- lange Automation-Namen
- 1/2/3 Column Error View
- Advanced Diagnostics

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/system/errors.png
docs/screenshots/admin/system-diagnostics.png
```

prüfen/aktualisieren.

Optional:

```text
docs/screenshots/system/errors-automation-impact.png
```

Nur echte Produkt-/Demo-Screenshots.

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

- Automation Impact read-only
- Direct vs Indirect
- dynamische Templates können Analyse unvollständig machen
- Automation off ist nicht automatisch Fehler
- Trace Summary
- keine Raw Trace-/Config-Daten im Browser
- Capability/Unsupported Verhalten

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- Automation Trigger
- Automation Enable/Disable
- Automation Reload
- Automation Edit
- YAML Edit
- Blueprint Edit
- automatische Reparatur
- vollständige Template-Auswertung
- vollständiger Dependency Graph für Jinja
- Recorder-/History-Analyse
- Machine Learning
- neue HA Write APIs
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 23 ist abgeschlossen, wenn:

- Automation Inventory read-only verfügbar ist
- Automation States normalisiert sind
- explizite Entity-/Device-Referenzen indexiert werden
- Area-/Label-Referenzen soweit zuverlässig unterstützt werden
- dynamische Referenzen als unvollständig markiert werden
- Device Groups Automation Impact anzeigen
- Standalone Issues Automation Impact anzeigen
- Direct/Indirect Confidence unterschieden wird
- Automation off nicht automatisch als Fehler gilt
- Automation unavailable diagnostisch behandelt wird
- last_triggered sinnvoll angezeigt wird
- Trace Summary capability-driven funktioniert
- echte Trace Errors von Condition-False/Not-Triggered unterschieden werden
- keine Raw Traces an Browser gelangen
- keine Raw Automation Config an Browser gelangt
- Partial Failure restliche Error-Funktion nicht zerstört
- Sprint-22-Regelengine vorgelagert bleibt
- keine Automation Write Capability entsteht
- Safari iOS 9 / ES5 erhalten bleibt
- alle Tests grün sind
- Performance geprüft wurde
- Screenshots geprüft/aktualisiert wurden
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. Automation Inventory Datenquelle
5. Capability-Probes
6. Automation Reference Parser
7. Reference Index
8. Dynamic Reference Handling
9. Impact Confidence
10. Device Group Integration
11. Standalone Issue Integration
12. Automation Health Semantik
13. Trace Adapter
14. Trace Summary
15. Datenschutz/Redaction
16. Cache/On-demand-Verhalten
17. Partial Failure
18. Tests
19. Performance
20. iPad-Abnahme
21. Sprint-22 Regression
22. Sprint-21.x Regression
23. Security Regression
24. Screenshot Review
25. verbleibende Einschränkungen
26. Voraussetzungen für Sprint 24
27. Commit-Vorschlag
28. Deploymentbefehle

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
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-21.3.md
- docs/sprints/SPRINT-21.4.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-22.md
- docs/sprints/SPRINT-23.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 23 exactly as specified in docs/sprints/SPRINT-23.md.

This sprint is read-only Automation Impact and Advanced Diagnostics.

Build a normalized Automation Inventory and a static reference index for
explicit automation references to:
- entity_id
- device_id
- area_id
- label_id where reliably available

Analyze explicit trigger, condition and action/target references when the
installed Home Assistant version exposes the required read-only configuration.

Do not attempt to fully evaluate arbitrary Jinja/templates.

If references are dynamic, mark impact analysis as potentially incomplete.

Distinguish:
- direct: explicit entity/device reference
- indirect: area/label reference
- unknown: dynamic/non-resolvable reference

Do not claim an automation caused a device problem merely because it references
that device.

Automation state semantics:
- off is not automatically an error
- unavailable may become a diagnostic issue
- missing last_triggered is not automatically an error

Add read-only Trace Summary support only when the installed HA version exposes
a reliable capability.

Use only a small normalized trace summary such as timestamp, duration,
result/error and trigger description.

Do not send raw automation configs or raw trace payloads to the browser.

Do not log trace variables/action data that may contain sensitive values.

Treat condition-false and intentionally-not-triggered traces as normal control
flow, not execution errors.

Use capability probes and fixed internal adapters.
Do not expose a generic HA WebSocket proxy.

Cache automation config/reference metadata.
Load trace summaries on-demand where practical.
Do not add trace polling to normal dashboard headers.

Integrate impact information into existing Device Groups and standalone Error
issues without replacing Sprint 22's rule/grace/flapping/recovery pipeline.

Preserve all Home Assistant security boundaries and Safari iOS 9 / ES5
compatibility.

Do not add:
- automation trigger
- automation enable/disable
- automation reload
- automation edit
- YAML writes
- Registry writes
- Label writes
- Repair writes
- generic service calls

Run large-data tests with at least:
- 3000 entities
- 500 devices
- 500 automations
- 200 active issues
- 2000 explicit automation references
- 100 trace summaries

Manually verify Error Dashboard Advanced Diagnostics and Automation Impact on
iPad.

If Sprint D1 exists, review/update real Error/Admin screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

Do not commit or push unless explicitly instructed.
```
