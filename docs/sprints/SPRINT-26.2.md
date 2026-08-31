# Sprint 26.2 – Controllable Entity Authorization & Climate Capability Hardening

## Status
Planned – High Priority

## Charakter
Post-RC functional correctness / control-path hardening.

## Bestätigtes Problem

Neue beziehungsweise andere steuerbare Home-Assistant-Entities können zwar
im Dashboard angezeigt werden, sind aber teilweise nicht bedienbar.

Beispiele:

```text
Light:
- Esszimmer-Testlicht funktioniert
- andere Light-Entity wird angezeigt
- Power Button sichtbar
- Power Button disabled
```

```text
Climate:
- Esszimmer-Testthermostat funktioniert
- andere Climate-Entity wird angezeigt
- Power Button fehlt
- Zieltemperatur erst veränderbar, wenn Thermostat eingeschaltet ist
```

## Ziel

Unterstützte, bewusst konfigurierte Entities sollen über die vorhandenen
sicheren, domain-spezifischen Backend-Endpunkte steuerbar sein.

Nicht zulässig:

```text
generic HA service proxy
Browser -> HA token
Browser -> HA WebSocket
beliebige domain/service Calls
```

## A – Root Cause Analyse

Codex muss zuerst exakt ermitteln, warum die bisherigen Test-Entities steuerbar
sind und andere nicht.

Explizit prüfen:

```text
hardcoded entity IDs
allowlists
writableEntities
controlEntities
dashboard config write flags
domain checks
capability checks
supported_features
hvac_modes
available-state checks
registry metadata
```

Root Cause dokumentieren.

## B – Write Authorization Model

Anzeige und Schreibberechtigung bleiben getrennt.

Bevorzugtes Modell:

```text
Entity sichtbar
!=
automatisch beliebige HA-Schreibrechte
```

Aber:

```text
Admin fügt unterstützte steuerbare Entity als interaktive Card hinzu
+
explizite Control-Freigabe
=
domain-spezifische Steuerung erlaubt
```

## C – Admin Control Permission

Für steuerbare Cards eine klare persistente Option vorsehen oder bestehende
Architektur wiederverwenden:

```text
Steuerung erlauben
[x]
```

Die Freigabe muss serverseitig validiert werden.

## D – Keine Test-Entity-Sonderfälle

Keine Produktionslogik darf von festen Test-Entity-IDs abhängen.

## E – Supported Write Domains

Aus dem realen Repo ermitteln, welche expliziten Write APIs existieren.

Mindestens erwartet:

```text
Light Power
Climate Power
Climate Target Temperature
```

## F – Light Control Eligibility

Eine Light-Entity soll steuerbar sein, wenn:

```text
domain == light
AND entity exists
AND entity available
AND server-side control authorization permits it
```

Nicht abhängig von spezieller Integration oder Entity-ID.

## G – Light Power Button

Für autorisierte verfügbare Lights:

```text
off -> einschalten
on  -> ausschalten
```

Button darf nicht grundlos disabled sein.

## H – Climate Capability Detection

Prüfen pro Entity:

```text
hvac_modes
supported_features
min_temp
max_temp
target_temp_step
temperature
target_temp_low
target_temp_high
hvac_action
```

## I – Climate Power Button

Power Button anzeigen, wenn:

```text
hvac_modes enthält off
+
mindestens ein sinnvoller non-off mode
```

Thermostate ohne `off` dürfen keinen falschen Power Button zeigen.

## J – Safe On-Mode Resolution

Beim Einschalten Priorität:

```text
1. last known non-off mode
2. configured preferred on-mode
3. current non-off mode where applicable
4. deterministic supported fallback
```

Nicht pauschal `heat`, wenn unsupported.

## K – Preferred On Mode

Falls nötig im Admin:

```text
Einschaltmodus:
[ heat ▼ ]
```

Nur Werte aus tatsächlichen `hvac_modes`.

## L – Zieltemperatur im ausgeschalteten Zustand

UX-Ziel:

```text
Climate off
-> Zieltemperatur +/- möglich
-> Target Temperature wird gesetzt
-> Climate bleibt off
```

Das Setzen der Zieltemperatur darf das Gerät nicht automatisch einschalten.

## M – Target Temperature Eligibility

Nicht abhängig von:

```text
hvac mode != off
```

sondern von:

```text
target-temperature capability
server-side authorization
entity available
```

## N – Integration lehnt Off-State Setpoint ab

Falls Home Assistant/Integration ablehnt:

- UI nicht crashen
- verständlicher Fehler
- letzten bestätigten Wert wiederherstellen
- Gerät nicht automatisch einschalten

## O – Entity-spezifische Temperaturgrenzen

Validieren:

```text
min_temp
max_temp
target_temp_step
```

Keine globalen starren Werte.

## P – Availability

`off` ist kein Fehlerzustand.

Controls nur bei tatsächlich unsicherem Zustand wie `unavailable` deaktivieren.

## Q – Shared Capability Model

Grid, Focus und Room Card müssen dieselbe Capability-/Authorization-Logik
verwenden.

Kein separater Write-Stack für Sprint 26.1 Room Card.

## R – Server-side Enforcement

Backend validiert mindestens:

```text
entity ID
domain
authorization
allowed action
payload
capability/range
```

## S – No Generic Service Proxy

Weiterhin verboten:

```text
POST /api/service
{
  domain: "...",
  service: "...",
  data: ...
}
```

oder äquivalent.

## Tests – Light

1. bekannte Test-Light weiterhin steuerbar
2. zweite Light-Entity steuerbar
3. dritte Light-Entity steuerbar
4. off -> on
5. on -> off
6. unavailable -> disabled
7. unauthorized -> server-side rejected
8. falsche Domain rejected
9. unbekannte Entity rejected
10. keine hardcoded Entity-ID-Abhängigkeit

## Tests – Climate Power

11. bekannte Test-Climate weiterhin steuerbar
12. zweite Climate mit off/heat
13. Climate mit off/auto
14. Climate mit off/heat/auto
15. Climate ohne off
16. preferred on-mode
17. last non-off mode
18. unsupported mode rejected
19. unavailable disabled
20. unauthorized rejected

## Tests – Target Temperature

21. active climate target temp
22. off climate target temp
23. target set while off does NOT power on
24. min temp
25. max temp
26. step
27. below min rejected
28. above max rejected
29. invalid number rejected
30. unavailable rejected/disabled
31. HA backend failure handled cleanly

## Cross-Surface Regression

32. Grid Light
33. Focus Light
34. Grid Climate
35. Focus Climate
36. Room Card Light
37. Room Card Climate
38. Admin Preview
39. Default Dashboard
40. Custom Dashboard
41. Section Dashboard

## iPad mini Manual Test

Mindestens:

```text
Light A on/off
Light B on/off

Climate A off/on
Climate B off/on

Climate off:
target temperature +/-
climate remains off

Climate on:
target temperature +/-
```

## Security Regression

Prüfen:

- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- kein generic service proxy
- keine browser-supplied arbitrary services
- server-side authorization
- Entity-ID-Validierung
- Payload-Validierung
- keine Privilege Expansion durch Room Card
- Logs secret-free

## Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- steuerbare Entity-Typen
- Control Authorization
- Climate Power Capability
- Target Temperature while off
- Grenzen bei Integrationen, die Setpoint im Off-State ablehnen

## Definition of Done

Sprint 26.2 ist abgeschlossen, wenn:

- Root Cause für nicht steuerbare neue Lights dokumentiert
- Root Cause für fehlenden Climate Power Button dokumentiert
- keine Produktionslogik von Test-Entity-IDs abhängt
- autorisierte Lights unabhängig von Entity-ID schaltbar
- Climate Power aus realen hvac_modes/capabilities abgeleitet
- sichere On-Mode-Auswahl implementiert
- Thermostate ohne off keinen falschen Power Button zeigen
- Zieltemperatur im Off-State veränderbar, wenn unterstützt
- Target-Temperature-Änderung Gerät nicht automatisch einschaltet
- Entity-spezifische Temperaturgrenzen berücksichtigt
- Grid/Focus/Room Card dieselbe Capability-/Authorization-Logik nutzen
- Backend Write Authorization erzwingt
- kein generic service proxy eingeführt
- iPad mini mit mehreren echten Light-/Climate-Entities getestet
- Security Regression grün
- PROJECT_STATUS aktualisiert

## Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. Root Cause Light
4. Root Cause Climate
5. bisherige Authorization-Architektur
6. finale Authorization-Architektur
7. serverseitige Enforcement-Punkte
8. Light Capability Logic
9. Climate Power Capability Logic
10. On-Mode Resolution
11. Target Temperature while off
12. Temperature Range Validation
13. gemeinsame Grid/Focus/Room-Card Capability-Logik
14. geänderte Dateien
15. Testresultate
16. Security Regression
17. reale iPad-Tests noch erforderlich
18. Integrationseinschränkungen
19. verbleibende Blocker
20. Commit-Vorschlag
21. Deployment-/Testbefehle

## Codex-Prompt

```text
Implement Sprint 26.2 exactly as specified in docs/sprints/SPRINT-26.2.md.

Inspect the actual repository state first.

This is a high-priority control-path correctness sprint.

Confirmed behavior:
- the existing Esszimmer test Light is controllable
- other Light entities render but their Power button is disabled
- the existing Esszimmer test Thermostat is controllable
- other Climate entities may have no Power button
- target temperature currently becomes editable only after Climate is powered on

Find the real root cause first.

Audit hardcoded test entity IDs, write allowlists, authorization logic,
capability checks, hvac_modes, supported_features and UI disable rules.

Do not solve this by adding a generic Home Assistant service proxy.

Supported controllable entities must use explicit narrow backend endpoints and
server-side authorization.

Do not let production control behavior depend on specific test entity IDs.

For Light:
- an authorized available light must support Power On/Off independent of which
  entity ID/integration it uses

For Climate:
- derive Power support from actual hvac_modes/capabilities
- if off plus a valid non-off mode exists, show Power
- select a safe supported on-mode, preferably last known non-off mode or an
  explicitly configured preferred mode
- never blindly force heat if unsupported
- Climate entities without an off mode must not show a fake Power button

Target temperature:
- allow adjustment while Climate is off when supported
- setting target temperature while off must NOT automatically power on
- validate per-entity min_temp, max_temp and target_temp_step
- handle integrations that reject off-state setpoints gracefully

Unify capability/authorization logic across:
- Grid cards
- Focus cards
- Sprint 26.1 Room Cards

Room Card must not introduce a separate write-permission model.

Preserve:
- HA token backend-only
- SUPERVISOR_TOKEN backend-only
- no browser-to-HA WebSocket
- no generic service proxy
- Safari iOS 9 / ES5 compatibility
- existing security boundaries
- all previously working test entities

Add tests with multiple distinct Light and Climate entities so tests cannot
pass merely because the original test IDs are allowed.

Manually identify the real iPad tests required with at least two different
Lights and two different Thermostats.

Update README.de.md, README.en.md, docs/PROJECT_STATUS.md and
docs/SPRINT_ROADMAP.md.

Do not commit or push until I review the result.
```
