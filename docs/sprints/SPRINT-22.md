# Sprint 22 – Rules, Grace Periods & Device Aggregation

## Status
Planned

## Einordnung

Sprint 22 baut auf Sprint 19, 20, 21, 21.1, 21.2, 21.3, 21.4 und 21.5 auf.

Ziel ist eine zentrale serverseitige Regelengine für realistischere Fehlerbewertung in Home-Assistant-Umgebungen.

Bisher werden Probleme im Wesentlichen sofort sichtbar. In realen Installationen entstehen dadurch unnötige Meldungen durch kurze Neustarts, Funkabbrüche, Schlafzustände batteriebetriebener Geräte, Integrations-Restarts und schnell wechselnde `unknown`/`unavailable`-Zustände.

---

# Hauptziele

1. zentrale serverseitige Rule Engine
2. Grace Periods für `unknown` und `unavailable`
3. Risk-Class-spezifische Grace Periods
4. Immediate/Short Grace für Safety/Security
5. Expected Offline / Expected Unavailable
6. Flapping Detection
7. Stable Recovery / Recovery Delay
8. verbesserte Device Aggregation
9. Entity-/Device-/Domain-/Risk-Class-Overrides
10. Admin-Erweiterung des Entity Rule Managers
11. klare Rule Priority
12. Integration in Global Health Indicator

---

# Sicherheitsgrundsätze

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu HA
- keine neue Write API
- keine generische Service API
- keine Registry-/Label-/Repair-/Matter-Writes
- Rule Engine verändert nur Darstellung/Klassifikation
- bestehende Light-/Climate-Allowlists unverändert
- bestehende Security Header, Rate Limits und Secret Redaction bleiben erhalten

Sprint 22 ist read-only gegenüber Home Assistant.

---

# Legacy-Kompatibilität

Weiterhin:

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

# Teil A – Zentrale Rule Engine

Bevorzugte Pipeline:

```text
Normalized Entity / Diagnostic Issue
        ↓
Risk Classification
        ↓
Rule Resolution
        ↓
Grace Period Evaluation
        ↓
Expected Offline Evaluation
        ↓
Flapping Evaluation
        ↓
Severity Resolution
        ↓
Device Aggregation
        ↓
Presentation Model
```

Konzeptuelles Ergebnis:

```javascript
{
    eligible: true,
    severity: "warning",
    riskClass: "normal",
    gracePeriodMs: 30000,
    graceActive: false,
    expectedOffline: false,
    flapping: false,
    recoveryPending: false,
    ruleSource: "domain"
}
```

Keine Business-Logik in den Browser verschieben.

---

# Teil B – Grace Periods

Issue wird erst sichtbar, wenn der problematische Zustand länger als die effektive Grace Period besteht.

Beispiel:

```text
unavailable
0–29 Sek.  -> noch kein sichtbares Issue
>= 30 Sek. -> Issue sichtbar
```

Mindestens getrennt:

```text
unknown
unavailable
```

Beispielhafte Defaults:

```text
unknownGraceMs     = 15000
unavailableGraceMs = 30000
```

Tatsächliche Defaults dokumentieren.

---

# Risk-Class-spezifische Grace

Mindestens:

```text
safety
security
normal
diagnostic
```

Bevorzugte Orientierung:

```text
safety:
unknown = 0
unavailable = 0

security:
unknown = 0
unavailable = 5000

normal:
unknown = 15000
unavailable = 30000

diagnostic:
unknown = 30000
unavailable = 60000
```

---

# Safety

Mindestens relevante Risk Classes aus Sprint 21.3:

```text
smoke
co
gas
moisture
safety
```

Keine lange Grace.

---

# Security

Mindestens:

```text
door
window
opening
garage_door
lock
```

Nur sehr kurze oder keine Grace.

---

# Teil C – Grace-Zeitbasis

Nicht Browserzeit verwenden.

Bevorzugt:

```text
HA last_changed
+
Gateway Beobachtungszeit
```

Beim Gateway-Restart darf ein seit Stunden unavailable Entity nicht erneut für 30 Sekunden unsichtbar werden, wenn `last_changed` zuverlässig ist.

Ungültige/negative Zeiten sicher behandeln.

---

# Teil D – Expected Offline

Bestimmte Devices/Entities dürfen bewusst unavailable sein.

Beispiele:

```text
Saugroboter ausgeschaltet
Gartensteckdose saisonal getrennt
mobiler Sensor außer Haus
Testgerät
Bluetooth-Gerät außerhalb Reichweite
```

Admin-Regel:

```text
Expected Offline
```

Wirkung:

```text
unavailable -> kein normales Error Issue
```

`unknown` wird dadurch standardmäßig nicht unterdrückt.

---

# Expected Offline vs Ignore

Wichtig:

```text
Ignore:
Issue komplett aus Error Dashboard ausblenden.

Expected Offline:
unavailable ist erwarteter Zustand,
andere echte Probleme dürfen weiterhin erscheinen.
```

---

# Device-Level Expected Offline

Wenn ein gesamtes Device bewusst offline sein darf, Device-Regel bevorzugen.

Keine Notwendigkeit, jede Entity einzeln zu markieren.

---

# Safety/Security Schutz

Safety-/Security-Devices dürfen nicht versehentlich durch eine globale Expected-Offline-Regel entschärft werden.

Explizite bewusste Override-Regel erforderlich.

Admin muss warnen.

---

# Teil E – Flapping Detection

Problem:

```text
available
unavailable
available
unavailable
```

schnell hintereinander.

Beispielregel:

```text
>= 4 problematische Wechsel
innerhalb 10 Minuten
→ flapping
```

Konfigurierbar:

```text
flapWindowMs
flapThreshold
```

Issue:

```text
Verbindung instabil
```

statt ständigem Ein-/Ausblenden.

---

# Flapping Severity

Bevorzugt:

```text
normal -> warning
security/safety -> gemäß höherer Risk Policy
```

Nicht jedes Flapping pauschal critical.

---

# Flapping History

Nur begrenzter serverseitiger In-Memory-Ringbuffer.

Beispiel:

```text
max 10–20 relevante Transitionen pro Entity
```

Keine HA-History-Abfrage.

Keine unlimitierte Persistenz.

Restart darf Flapping-History verlieren.

---

# Teil F – Stable Recovery

Problem:

```text
unavailable
available für 2 Sek.
unavailable
```

Issue darf nicht flackern.

Beispiel:

```text
recoveryGraceMs = 10000
```

Issue gilt erst als behoben, wenn Entity über diese Zeit stabil gesund bleibt.

Währenddessen:

```text
recoveryPending = true
```

Optional UI:

```text
Wiederherstellung wird geprüft
```

---

# Global Health Indicator

Sprint 21.5 muss neue Regeln respektieren:

- Pending Grace -> kein Alarmindikator
- Expected Offline -> kein Alarmindikator
- aktives Warning/Error/Critical -> Indicator
- Recovery Pending darf nicht sofort Indicator verschwinden lassen
- stale/offline bleibt höher priorisiert

---

# Teil G – Device Aggregation

Sprint 21.1 gruppiert bereits nach `device_id`.

Sprint 22 erweitert dies.

Konzeptuell:

```javascript
{
    deviceId: "...",
    severity: "critical",
    issueCount: 4,
    unavailableCount: 2,
    unknownCount: 1,
    flappingCount: 1,
    recoveryPendingCount: 0
}
```

---

# Device-wide Failure Hint

Wenn viele Entities eines Devices gleichzeitig unavailable sind, kompakte Darstellung.

Beispiel:

```text
Mehrere Entitäten dieses Geräts sind nicht erreichbar
```

Nicht behaupten:

```text
Gerät definitiv offline
```

wenn Metadata dies nicht sicher belegt.

---

# Device-wide Heuristik

Konzeptuell:

```text
mindestens 2 relevante Entities
und >= 70 % unavailable
→ device_unreachable presentation hint
```

Tatsächliche Werte dokumentieren.

---

# Teil H – Rule Priority

Verbindlich:

```text
1. explizite Entity Override
2. explizite Device Override
3. bestehende securityEntities / Security Override
4. Critical Detection Mode aus Sprint 21.3
5. Risk-Class-Regel
6. Domain-Regel
7. globaler Default
```

Error Ignore bleibt wirksam.

---

# Teil I – Admin Rule Manager

Sprint 21.4 Entity Rule Manager erweitern.

Zusätzlich pro Entity/Device:

```text
Expected Offline
Grace Override
```

Bevorzugt:

```text
[ ] Summary ignorieren
[ ] Sicherheitsrelevant
[ ] Errors ignorieren
[ ] Expected Offline

[ Erweiterte Regeln ]
```

Advanced:

```text
Unknown Grace
Unavailable Grace
Recovery Delay
Flap Threshold
Flap Window
```

Nicht alle Advanced Options permanent offen anzeigen.

---

# Config Validation

Mindestens:

```text
Grace >= 0
Recovery >= 0
Flap Threshold >= 2
Flap Window > 0
```

Extreme Werte sinnvoll begrenzen.

---

# Teil J – Summary

Sprint 22 definiert keine neuen großen Summary-Aktivitätsregeln.

Kurze State-Glitches sollen Summary jedoch möglichst nicht unnötig flackern lassen.

Keine neue Browser-Rule-Engine.

---

# Teil K – Tests Grace

1. unavailable 5s bei 30s Grace -> kein Issue
2. unavailable 31s -> Issue
3. unknown 5s bei 15s Grace -> kein Issue
4. unknown 16s -> Issue
5. safety unknown -> sofort critical
6. safety unavailable -> sofort critical
7. security unavailable -> kurze Grace
8. normal unavailable -> normale Grace
9. diagnostic unavailable -> längere Grace
10. Gateway Restart nutzt `last_changed`

---

# Tests Expected Offline

11. Entity Expected Offline + unavailable -> kein Issue
12. Entity Expected Offline + unknown -> normale Regel
13. Device Expected Offline -> Child unavailable unterdrückt
14. anderes echtes Problem bleibt sichtbar
15. Error Ignore bleibt wirksam
16. Safety Expected Offline erfordert bewusste Override
17. Security Expected Offline erfordert bewusste Override
18. Admin speichert korrekt

---

# Tests Flapping

19. unter Threshold -> kein Flapping
20. Threshold erreicht -> Flapping Issue
21. Window korrekt
22. alte Transitions fallen heraus
23. Ringbuffer begrenzt
24. normal Flapping -> warning
25. security Flapping -> höhere Policy
26. safety Flapping -> Risk Policy
27. Restart verliert History kontrolliert

---

# Tests Recovery

28. kurzer Healthy-Zustand -> recoveryPending
29. stabile Recovery -> Issue verschwindet
30. erneuter Fehler während Recovery -> Issue bleibt
31. Health Indicator flackert nicht
32. Device Group bleibt stabil

---

# Tests Device Aggregation

33. mehrere Issues gleiche device_id -> eine Group
34. viele unavailable Entities -> kompakte Group
35. Device-wide Hint
36. Prozentheuristik
37. kleines Device
38. Child Details vollständig
39. höchste Severity bleibt Group Severity
40. Flapping Child sichtbar
41. Expected Offline Child zählt nicht als aktives Issue

---

# Tests Rule Priority

42. Entity Override vor Device Override
43. Device Override vor Risk Class
44. securityEntities Priorität
45. Critical Detection Mode erhalten
46. Domain Rule
47. globaler Default
48. Error Ignore weiterhin wirksam

---

# Tests Admin

49. Entity Rule Manager erweitert
50. Expected Offline
51. Grace Override
52. Advanced Rules
53. Validation
54. Batch Save
55. Discard
56. Backward Compatibility

---

# Regression Sprint 21.x

57. Severity/State Filter
58. 1/2/3 Columns
59. Device Groups
60. HA Label Mode
61. Device-Class Mode
62. Header Simplification
63. Entity Rule Manager
64. Global Health Indicator
65. Return Navigation
66. Summary Navigation

---

# Regression übrige Anwendung

67. Default Dashboard
68. Custom Dashboards
69. Focus
70. Light Controls
71. Climate Controls
72. Theme Persistenz
73. Sprint 17.7 Alignment

---

# Security Regression

74. HA-Token Backend-only
75. keine neue Write API
76. keine generische Service API
77. keine Registry Writes
78. keine Label Writes
79. Rule Config schreibt nur Dashboard-Konfiguration
80. Expected Offline erzeugt keine HA Capability

---

# Performance

Test mindestens:

```text
3000 Entities
500 Devices
200 aktive Issues
100 flapping Entities
500 Rule Overrides
```

Prüfen:

- Maps für Rule Lookup
- keine O(n²)-Auswertung
- Ringbuffer begrenzt
- Device Aggregation performant
- kein HA History Request
- kein zusätzlicher HA Poll

---

# Manuelle Abnahme

Error Dashboard:

```text
kurzes unavailable -> kein Alarm
dauerhaft unavailable -> Alarm
Flapping -> verständliches Issue
Expected Offline -> kein unnötiges Issue
kritischer Sensor -> sofort kritisch
```

Global Health Indicator:

```text
Pending Grace -> kein Indicator
aktives Warning/Error/Critical -> Indicator
Recovery Pending -> kein Flackern
```

Admin:

```text
Expected Offline
Grace Override
Advanced Rules
Save
Discard
```

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/system/errors.png
docs/screenshots/admin/entity-rules.png
```

prüfen/aktualisieren.

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

- Grace Periods
- Risk-Class Defaults
- Expected Offline
- Expected Offline vs Ignore
- Flapping
- Stable Recovery
- Device Aggregation
- Rule Priority

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- Automation Impact
- automatische Reparaturen
- automatische Geräte-Neustarts
- HA History Queries
- persistente Flapping-Historie
- Machine Learning
- Kalender-/Maintenance-Zeitpläne
- neue Write-Aktionen
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 22 ist abgeschlossen, wenn:

- zentrale Rule Engine existiert
- Grace Periods funktionieren
- Safety/Security kurze oder keine Grace erhalten
- normale Sensoren passende Grace erhalten
- Expected Offline auf Entity-/Device-Ebene funktioniert
- Ignore und Expected Offline getrennte Semantik haben
- Flapping erkannt wird
- Stable Recovery Issue-Flackern reduziert
- Device Groups sauber aggregieren
- Device-wide Hint funktioniert
- Rule Priority dokumentiert und getestet ist
- Admin Rule Manager erweitert wurde
- Global Health Indicator Grace/Recovery respektiert
- stale/offline nicht unterdrückt wird
- keine HA History Abfrage entsteht
- keine neue Write-Funktion entsteht
- iOS-9-/ES5-Kompatibilität erhalten bleibt
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
4. Rule-Engine-Architektur
5. Rule Priority
6. Default Grace Periods
7. Safety/Security Verhalten
8. Expected Offline
9. Entity-/Device Overrides
10. Flapping Detection
11. Ringbuffer
12. Recovery Delay
13. Device Aggregation
14. Device-wide Failure Hint
15. Admin Erweiterung
16. Config Validation
17. Health Indicator Integration
18. Tests
19. Performance
20. iPad-Abnahme
21. Sprint-21.x Regression
22. Security Regression
23. Screenshot Review
24. verbleibende Einschränkungen
25. Voraussetzungen für Sprint 23
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
- docs/sprints/SPRINT-19.md
- docs/sprints/SPRINT-20.md
- docs/sprints/SPRINT-21.md
- docs/sprints/SPRINT-21.1.md
- docs/sprints/SPRINT-21.2.md
- docs/sprints/SPRINT-21.3.md
- docs/sprints/SPRINT-21.4.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-22.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 22 exactly as specified in docs/sprints/SPRINT-22.md.

Build a central server-side rule engine for System Dashboard issue evaluation.

Implement:
- unknown grace periods
- unavailable grace periods
- risk-class-specific grace periods
- immediate or near-immediate handling for safety/security entities
- expected-offline rules
- flapping detection
- stable recovery/recovery delay
- improved device-level aggregation
- device-wide failure hints
- entity/device/risk/domain/default rule priority
- Admin Rule Manager extensions

Do not implement business rules in the browser.

Safety/security entities must not be hidden behind long grace periods.

Expected Offline and Ignore must remain different concepts.

Ignore:
- removes an issue from Error Dashboard handling.

Expected Offline:
- treats unavailable as expected,
- but other genuine problems may still be shown.

Do not automatically treat unknown as expected merely because unavailable is expected.

Use a bounded in-memory transition history for flapping.
Do not query Home Assistant history.
Do not persist an unbounded state history.

Use last_changed/known server timing so gateway restarts do not incorrectly restart grace periods for entities already unavailable for a long time.

Add a configurable recovery delay so short recoveries do not make issues and the global Health Indicator flicker.

Preserve Sprint 21.1 device grouping and extend it rather than replacing it.

When multiple entities of one device fail together, present a compact device group and optionally a conservative device-wide failure hint.

Do not claim the physical device is definitely offline unless metadata truly supports that conclusion.

Extend the Sprint 21.4 Entity Rule Manager rather than creating an unrelated second configuration UI.

Preserve:
- Sprint 21.2 Severity/Risk behavior
- Sprint 21.3 Device-Class/HA-Label critical modes
- Sprint 21.4 Entity Rule Manager
- Sprint 21.5 Global Health Indicator/navigation
- Summary business logic
- Error severity/state filters
- 1/2/3 column views
- all Home Assistant security boundaries
- Safari iOS 9 / ES5 compatibility

Do not add:
- Home Assistant write APIs
- HA History queries
- Registry writes
- Label writes
- repair actions
- generic service calls

Run large-data tests with at least:
- 3000 entities
- 500 devices
- 200 active issues
- 100 flapping entities
- 500 rule overrides

Manually verify on iPad:
- short unavailable
- long unavailable
- safety/security immediate critical behavior
- expected offline
- flapping
- recovery pending
- device aggregation
- global Health Indicator behavior

If Sprint D1 exists, review/update real Error/Admin screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

Do not commit or push unless explicitly instructed.
```
