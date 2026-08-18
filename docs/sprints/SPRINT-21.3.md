# Sprint 21.3 – Error Filtering & Critical Device Detection Modes

## Status
Planned

## Ziel

Sprint 21.3 verbessert das Error Dashboard in zwei Bereichen:

1. Status und Kritikalität werden als zwei getrennte, kombinierbare Filterdimensionen dargestellt.
2. Der Benutzer kann wählen, ob kritische Geräte automatisch über definierte Home-Assistant-Geräteklassen oder über ein Home-Assistant-Label erkannt werden.

Der Sprint baut auf Sprint 20, 21, 21.1 und 21.2 auf.

---

# Verifizierte Home-Assistant-Grundlage

Home Assistant besitzt ein eigenes Label-System. Labels können unter anderem an Devices, Entities und Areas vergeben werden.

Das HA Legacy Dashboard soll dieses bestehende Label-System nur lesen und auswerten.

Es wird kein eigenes konkurrierendes Tag-System eingeführt.

Home Assistant definiert für Binary Sensors unter anderem Device Classes wie:

```text
co
door
garage_door
gas
lock
moisture
opening
problem
safety
smoke
tamper
window
```

Für Covers existieren unter anderem:

```text
door
garage
gate
shade
shutter
window
```

Sprint 21.3 leitet daraus eine eigene dokumentierte Risk Policy für das Error Dashboard ab.

---

# Sicherheit

Unverändert:

- HA-Token nur im Backend
- keine direkte Browser-Verbindung zu Home Assistant
- keine generische WebSocket-Weiterleitung
- keine generische Service-API
- keine Label-Writes
- keine Registry-Writes
- keine Repair-/Config-Entry-/Matter-Writes
- Admin-Auswahl eines Labels verändert Home Assistant nicht
- bestehende Write-Allowlists unverändert
- Filter erzeugen keine Schreibrechte

Sprint 21.3 ist gegenüber Home Assistant read-only.

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

# Teil A – Filtermodell

## Problem

`unknown` und `unavailable` sind Zustände.

`critical`, `error`, `warning` und `info` sind Kritikalitäten.

Diese Dimensionen dürfen in der UI nicht vermischt werden.

---

# Kritikalitätsfilter – links

Verbindlich:

```text
Kritikalität
[ Alle ] [ Kritisch ] [ Fehler ] [ Warnung ] [ Info ]
```

`Info` muss filterbar sein.

---

# Statusfilter – rechts

Verbindlich:

```text
Status
[ Alle ] [ Unavailable ] [ Unknown ]
```

Desktop/breiter Viewport:

```text
Kritikalität                                      Status
[Alle][Kritisch][Fehler][Warnung][Info]           [Alle][Unavailable][Unknown]
```

Auf schmalen Viewports dürfen beide Gruppen untereinander umbrechen.

Keine horizontale Scrollbar.

---

# Filter kombinierbar

Beispiele:

```text
Critical + Unknown
Warning + Unavailable
Info + Unknown
```

Ein Issue muss beide aktiven Bedingungen erfüllen.

Default nach Reload:

```text
Severity = All
Status   = All
```

Filter müssen nicht persistent sein. So werden beim Reload keine Issues unbemerkt verborgen.

---

# Counts

Beispiel:

```text
Critical 4
Error 2
Warning 6
Info 3

Unavailable 8
Unknown 7
```

Ein Issue kann gleichzeitig in einem Severity-Count und einem Status-Count vorkommen.

---

# Device Groups und Filter

Beispiel:

```text
Device A
- critical + unknown
- warning + unavailable
- info + unknown
```

`Critical + Unknown` zeigt Device A, weil mindestens ein Child beide Filterbedingungen erfüllt.

Bei geöffneten Details sollen bevorzugt nur passende Child-Issues gezeigt oder klar hervorgehoben werden.

---

# Standalone Issues

Dieselben Filterregeln gelten für Standalone Issues.

---

# Teil B – Critical Device Detection Mode

Admin erhält:

```text
Critical Device Detection

Mode:
(•) Device Classes
( ) Home Assistant Label
```

Verbindliche interne Modi:

```text
device_class
ha_label
```

---

# Modus A – Device Classes

Das Dashboard verwendet zuverlässige HA Device-Class-Metadaten.

## Safety Risk Set

Mindestens:

```text
co
gas
moisture
smoke
safety
```

## Security Risk Set

Mindestens:

```text
door
garage_door
lock
opening
window
```

Für diese Typen gilt standardmäßig:

```text
unknown     -> critical
unavailable -> critical
```

---

# problem / tamper

`problem` und `tamper` werden nicht automatisch ohne bewusste Policy critical.

Codex soll die bestehende Error-Semantik prüfen und dokumentieren.

---

# Cover Risk Policy

Wenn Cover-Issues betroffen sind, mindestens prüfen:

```text
door
garage
gate
window
```

Diese dürfen für unknown/unavailable als security-relevant behandelt werden.

Nicht automatisch critical:

```text
shade
shutter
```

außer bestehende explizite Konfiguration sagt etwas anderes.

---

# Keine pauschale Domain-Regel

Nicht:

```text
alle binary_sensor -> critical
alle cover -> critical
```

Nur zuverlässig klassifizierte Typen.

---

# Keine Namensheuristik

Nicht als primäre Regel:

```text
entity_id enthält "leak"
entity_id enthält "window"
```

Risk Classification muss aus zuverlässigen Metadaten oder expliziter Konfiguration kommen.

---

# Modus B – Home Assistant Label

Der Benutzer markiert in Home Assistant selbst kritische Devices oder Entities.

Beispiele:

```text
Haustür
Fenster Schlafzimmer
Wassermelder
Gefrierschrank
Aquarium-Pumpe
Heizung
Server-USV
```

Das Dashboard liest nur die Zuweisung.

---

# Admin UI – Label Mode

Beispiel:

```text
Critical Device Detection

Mode:
( ) Device Classes
(•) Home Assistant Label

Critical Label:
[ critical ▼ ]
```

Das Label wird in Home Assistant verwaltet.

---

# Kein festes Label

Nicht hart codieren:

```text
critical
```

Der Benutzer wählt ein vorhandenes HA Label.

Bevorzugt stabile interne Label-ID speichern.

---

# Label Registry

Falls Sprint 21 Labels bisher nicht sammelt:

- bestehenden serverseitigen HA-WebSocket-Metadata-Client erweitern
- fester read-only Label-Registry-Adapter
- keine generische WebSocket-API

Konzeptuelle Capability:

```text
labelRegistry: true / false
```

Unsupported darf Device-Class-Modus nicht beeinträchtigen.

---

# Label-Zuweisung

Im Label-Modus:

```text
Device trägt ausgewähltes Label
→ Device criticalEligible
```

Zusätzlich:

```text
Entity trägt ausgewähltes Label
→ Entity criticalEligible
```

Area-Labels werden in diesem Sprint bewusst nicht automatisch auf alle Devices einer Area vererbt.

---

# Label-Modus Severity

Für ein markiertes Device/eine markierte Entity:

```text
unknown     -> critical
unavailable -> critical
```

Andere Zustände behalten bestehende Error-Regeln.

---

# Device Group bei Device Label

Wenn das Device selbst das Critical Label trägt:

```text
unknown/unavailable Child Issue
→ critical
```

Die Device Group übernimmt weiter die höchste Child-Severity.

---

# Device Group bei Entity Label

Wenn nur eine Entity das Label trägt:

- nur deren unknown/unavailable Issue wird critical
- andere Child-Issues behalten normale Severity
- Device Group übernimmt höchste Severity

---

# Modus-Isolation

Wenn `ha_label` gewählt ist, darf Device-Class-Modus nicht heimlich parallel Geräte critical machen.

Ausnahme:

bestehende explizite Security-/Severity-Overrides.

---

# Priorität

Verbindlich:

```text
1. expliziter Entity-/Admin-Severity-Override
2. bestehende securityEntities / explizite Security-Konfiguration
3. ausgewählter Critical Detection Mode
4. bestehende Domain-/State-Regel
5. Fallback
```

---

# Optional später

Architektur darf später vorbereiten:

```text
device_class_or_label
```

Aber kein Pflichtbestandteil von Sprint 21.3.

---

# Label Metadata

Konzeptuelle Snapshot-Erweiterung:

```javascript
metadata: {
    entities: {...},
    devices: {...},
    areas: {...},
    labels: {...},
    configEntries: {...}
}
```

Intern bevorzugt Maps/Sets:

```text
labelsByDeviceId
labelsByEntityId
```

Keine O(n²)-Suche.

---

# Label Cache

Labels analog zu anderer Registry-Metadaten cachen.

Keine Label-Abfrage pro Browser-Poll.

---

# Partial Failure / Fail-Safe

Wenn Label-Metadaten temporär fehlschlagen:

- letzten erfolgreichen Metadata Snapshot gemäß Sprint-21-Stale-Policy weiterverwenden
- intern stale markieren
- zuvor bekannte gelabelte kritische Geräte nicht plötzlich herunterstufen

Wenn Label-Daten noch nie erfolgreich geladen wurden:

- Label-Modus klar als unavailable/unsupported behandeln
- nicht still auf Device-Class-Modus umschalten
- keine falsche Entwarnung

---

# Label gelöscht

Wenn gespeichertes Label nicht mehr existiert:

- nicht auf ein anderes Label mappen
- Admin-Warnung
- keine zufällige Critical-Auswahl

Bei Umbenennung:

- stabile ID weiterverwenden
- aktuellen Namen anzeigen

---

# Admin Validation

Label Mode ohne ausgewähltes Label:

- Save verhindern oder klar validieren

Admin speichert nur Dashboard/Gateway-Konfiguration.

Keine HA-Schreibaktion.

---

# Tests – Filter

1. Severity All
2. Critical
3. Error
4. Warning
5. Info
6. Status All
7. Unavailable
8. Unknown
9. Critical + Unknown
10. Critical + Unavailable
11. Warning + Unknown
12. Info + Unknown
13. Error + Unavailable
14. Reset
15. Counts korrekt
16. Empty State
17. Device Groups
18. Standalone Issues
19. Child Details zeigen passenden Treffer
20. keine horizontale Scrollbar

---

# Tests – Device-Class-Modus

21. mode=device_class
22. window unknown -> critical
23. window unavailable -> critical
24. door unknown -> critical
25. door unavailable -> critical
26. garage_door unknown -> critical
27. opening unknown -> critical
28. lock unavailable -> critical
29. smoke unknown -> critical
30. smoke unavailable -> critical
31. co unknown -> critical
32. gas unknown -> critical
33. moisture unknown -> critical
34. safety unknown -> critical
35. temperature unknown nicht automatisch critical
36. battery unknown nicht automatisch critical
37. connectivity unknown nicht automatisch critical
38. unbekannte Device Class sicherer Fallback

---

# Tests – Cover Policy

39. cover door unknown/unavailable -> critical
40. cover garage unknown/unavailable -> critical
41. cover gate unknown/unavailable -> critical
42. cover window unknown/unavailable -> critical
43. shade nicht automatisch critical
44. shutter nicht automatisch critical

---

# Tests – Label-Modus

45. mode=ha_label
46. Label-Liste geladen
47. Auswahl gespeichert
48. Device mit Label + unknown -> critical
49. Device mit Label + unavailable -> critical
50. Device ohne Label + unknown folgt normaler Regel
51. Entity mit Label + unknown -> critical
52. Entity mit Label + unavailable -> critical
53. nur markiertes Child wird critical
54. Device Group übernimmt höchste Severity
55. stabile Label-ID verwendet
56. Label-Umbenennung
57. Label gelöscht
58. kein Label gewählt -> Validation
59. Area Label vererbt nicht automatisch
60. keine Label Writes

---

# Tests – Mode Isolation

61. Label-Modus mischt Device-Class-Modus nicht hinzu
62. Device-Class-Modus benötigt kein Label
63. securityEntities Priorität
64. explizite Severity Override Priorität
65. Mode Change deterministisch

---

# Tests – Label Capability / Failure

66. Label Registry available
67. unsupported
68. timeout
69. reconnect
70. last-known Label Snapshot weiterverwendet
71. stale markiert
72. erster Load-Fehler erzeugt keine falsche Entwarnung
73. kein Token im Log
74. kein generischer WS-Proxy

---

# Regression

75. Device Registry
76. Entity Registry
77. Area Registry
78. Config Entries
79. Repairs
80. Matter Diagnostics
81. Device Aggregation
82. Standalone Issues
83. 1/2/3 Spalten
84. Column Preference
85. Summary Filter
86. /system/summary
87. stale/offline
88. unknown/unavailable bleiben getrennt

---

# Security Regression

89. HA-Token Backend-only
90. Browser erhält keinen HA-Token
91. keine Label Write API
92. keine Registry Write API
93. keine generische WS API
94. keine generische HA Service API
95. Admin Label-Auswahl verändert HA nicht
96. keine Raw Registry Dumps

---

# Performance

Test mindestens:

```text
3000 Entities
500 Devices
200 aktive Issues
100 Labels
500 Device/Entity Label Assignments
```

Prüfen:

- Maps/Sets für Label Lookup
- Filterwechsel ohne HA-Abfrage
- keine O(n²)-Label-Suche
- keine Label Registry Abfrage pro Poll
- Device Aggregation performant

---

# Manuelle Abnahme

## Error Dashboard

Desktop:
- Severity links
- Status rechts
- alle Filter
- Kombinationen
- 1/2/3 Spalten

iPad Portrait:
- sinnvoller Umbruch
- keine winzigen Buttons
- keine horizontale Scrollbar

iPad Landscape:
- Severity links
- Status möglichst rechts

## Admin

Prüfen:

```text
Device-Class-Modus
Label-Modus
Label Dropdown
Save
Reload
Label gelöscht
Label umbenannt
```

## Risk Policy

Explizit:

```text
window unknown -> critical
door unavailable -> critical
smoke unknown -> critical
moisture unknown -> critical
temperature unknown -> nicht automatisch critical
```

Label Mode:

```text
Gefrierschrank mit Critical Label + unavailable -> critical
Gefrierschrank ohne Label + unavailable -> normale Regel
```

---

# Screenshot-Pflege

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/system/errors.png
docs/screenshots/admin/system-diagnostics.png
```

prüfen/aktualisieren.

Optional zusätzlicher Admin-Screenshot für Critical Device Detection.

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

- getrennte Severity-/Status-Filter
- kombinierbare Filter
- Info-Filter
- Device-Class-Modus
- HA-Label-Modus
- Labels werden in HA verwaltet
- Dashboard liest Labels nur
- unknown/unavailable Semantik
- Mode-Priorität

README-Sprachen synchron halten.

---

# Nicht-Ziele

Nicht Bestandteil:

- Labels in HA erstellen/ändern/löschen
- eigenes Dashboard-Tag-System
- Area-Label Critical Inheritance
- verpflichtender Hybrid-Modus
- Filter nach Area/Integration
- neue Write-Aktionen
- neue Summary-Aktivitätsregeln
- Grace Periods
- Flapping
- Maintenance Mode
- Automation Impact
- Home Assistant App
- HACS

---

# Definition of Done

Sprint 21.3 ist abgeschlossen, wenn:

- Severity und Status getrennt filterbar sind
- All/Critical/Error/Warning/Info vorhanden sind
- All/Unavailable/Unknown vorhanden sind
- beide Filter kombinierbar sind
- Unknown nicht mehr als scheinbare Severity dargestellt wird
- Info filterbar ist
- Device Groups korrekt gefiltert werden
- Device-Class-Modus funktioniert
- HA-Label-Modus funktioniert
- vorhandenes HA Label im Admin auswählbar ist
- Dashboard keine HA Labels schreibt
- Device-/Entity-Labels berücksichtigt werden
- Area-Labels nicht automatisch vererbt werden
- stabile Label-ID verwendet wird
- Label-Fehler fail-safe behandelt werden
- Safety/Security unknown/unavailable critical werden
- normale Sensoren nicht pauschal critical werden
- bestehende Overrides Priorität behalten
- keine neue Write-Funktion entsteht
- keine generische WS-Schnittstelle entsteht
- iOS-9-/ES5-Kompatibilität erhalten bleibt
- alle Tests grün sind
- Screenshot Review erfolgt ist
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. geänderte Dateien
4. getrenntes Filtermodell
5. Severity Filter
6. Status Filter
7. kombinierte Filter
8. Device-Class Risk Policy
9. Cover Risk Policy
10. Label Registry Adapter
11. Capability Handling
12. Device-/Entity-Label Lookup
13. Admin Mode Selection
14. Label Persistenz
15. Failure/Stale-Verhalten
16. Override-Priorität
17. Tests
18. Performance
19. iPad-Abnahme
20. Admin-Abnahme
21. Error Regression
22. Summary Regression
23. Security Regression
24. Screenshot Review
25. verbleibende Einschränkungen
26. Voraussetzungen für Sprint 17.7 / Sprint 22
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
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 21.3 exactly as specified in
docs/sprints/SPRINT-21.3.md.

Separate Error Dashboard filtering into two independent dimensions.

Severity, left:
- All
- Critical
- Error
- Warning
- Info

State, right:
- All
- Unavailable
- Unknown

The two dimensions must be combinable.

Unknown is a state, not a severity.

Preserve Sprint 21.1 Device Groups and Sprint 21.2 column selection.

Add two critical-device detection modes:

A) device_class

Use reliable Home Assistant metadata and a central documented risk policy.

At minimum evaluate relevant binary sensor classes:
- co
- gas
- moisture
- smoke
- safety
- door
- garage_door
- lock
- opening
- window

For relevant security/safety types:
- unknown -> critical
- unavailable -> critical

Also evaluate relevant cover classes:
- door
- garage
- gate
- window

Do not automatically make shade/shutter critical.
Do not make all binary sensors/covers critical.
Do not use entity-name matching as primary classification.

B) ha_label

Use Home Assistant's existing label system.
Do not invent a second dashboard tag system.

Add a fixed read-only Label Registry adapter to the existing backend WebSocket
metadata layer if labels are not already collected.

Do not expose generic WebSocket access.

Admin must allow:
- Device Classes mode OR Home Assistant Label mode
- selecting one existing HA label in Label mode

Prefer stable label IDs.

The dashboard must never create, modify or delete HA labels.

In Label mode:
- selected label on a device makes it critical-eligible
- selected label on an entity makes that entity critical-eligible
- area labels do not automatically mark all devices critical

For critical-eligible devices/entities:
- unknown -> critical
- unavailable -> critical

Do not silently mix Device-Class mode into Label mode.

Existing explicit securityEntities and severity overrides retain higher priority.

If label metadata temporarily fails, preserve last-known good metadata according
to the Sprint 21 stale/cache policy and do not silently downgrade previously
known critical devices.

If labels were never successfully available, show Label mode as unavailable/
error rather than falsely treating everything as non-critical.

Preserve all existing Home Assistant security boundaries.

Do not add:
- Label writes
- Registry writes
- Repair writes
- generic HA WebSocket access
- generic HA service calls

Keep Safari iOS 9 / ES5 compatibility.

Run complete regressions and a large mock test with devices, entities, issues
and labels.

Manually verify Error Dashboard and Admin on iPad portrait and landscape.

If Sprint D1 exists, review/update real Error/Admin screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md.

Do not commit or push unless explicitly instructed.
```
