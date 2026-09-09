# Sprint-26.2-Audit – Controllable Entity Authorization & Climate Hardening

## Auditrahmen

- Audit-Part: 19
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-26.2.md`](../../sprints/SPRINT-26.2.md)
- Anwendungscode geändert: nein
- Physisches iPad, produktiver LXC, HAOS oder produktives Home Assistant geprüft: nein

## Gesamtergebnis

**Sprint 26.2: PARTIAL**

Die frühere ID-gebundene Steuerung ist durch ein zentrales, persistentes und
serverseitig autoritatives Grant-/Capability-Modell ersetzt. Grid, Focus und
Room erhalten dieselbe öffentliche Capabilityprojektion und nutzen nur die
drei engen Endpunkte für Light Power, Climate Power und Climate Target.
Mehrere unterschiedliche Entity-IDs, Modekombinationen, Off-State-Sollwerte,
Range/Step sowie Ablehnungs- und Fehlerpfade sind mit lokalen HA-Mocks geprüft.

`PARTIAL` ist allein wegen ausstehender realer Home-Assistant-/iPad-Abnahmen
und der sprintübergreifenden Cache-/Matrixbefunde korrekt. Es wurde kein neuer
Control- oder Securitydefekt gefunden.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 26.2-A1 | Hardcoded Test-IDs/Allowlists auditieren | PASS | Historischer Root Cause dokumentiert; aktueller Runtimepfad nutzt `control-authorization.js`, nicht Esszimmer-ID-Vergleiche. |
| 26.2-A2 | Dashboard-/Card-Flags und UI-Gates auditieren | PASS | Schema-12-`widget.control`, Admineditor, Public Payload und Renderer geprüft. |
| 26.2-A3 | `hvac_modes`, `supported_features`, Availability, Min/Max/Step auditieren | PASS | Sanitizer, `climate-power.js`, Authorization und Routes verwenden reale Entityattribute. |
| 26.2-B1 | Sichtbarkeit bleibt getrennt von Write Authorization | PASS | Ein sichtbares Widget bleibt bei `control.enabled:false` read-only; Public Config entfernt das private Grantobjekt. |
| 26.2-B2 | Persistenter expliziter Grant je Widget | PASS | `control.enabled`; nur Light/Climate/Room dürfen aktiviert werden. |
| 26.2-B3 | Room-Grant nur für ausgewählte Room-Light/Climate | PASS | Zentrale Grantableitung traversiert ausschließlich explizite Roomrollen. |
| 26.2-B4 | Bestehende Custom-Widgets migrieren sicher read-only | PASS | Schema-11→12 setzt Grants nicht pauschal; Test verhindert implizite Custom-Writes. |
| 26.2-B5 | Historische Standardcontrols bleiben kompatibel | PASS | Migration erkennt integrierte stabile Widget-ID plus Typ; Runtime kennt keine feste Entity-ID-Ausnahme. |
| 26.2-C1 | Admin „Steuerung erlauben“ | PASS | Light-/Climate-/Room-Editor und Batch Preview/Save. |
| 26.2-C2 | Preferred On Mode auswählbar | PASS | Nur sanitisiert vorhandene Nicht-Off-Modi werden angeboten; Config validiert Form. |
| 26.2-C3 | Auto-Setup/Sichtbarkeit erteilen keine Rechte | PASS | Area-/Entitywahl verändert `control.enabled` nicht. |
| 26.2-D1 | Keine produktive Test-Entity-Sonderbehandlung | PASS | Authorization wird aus Config und Entitydomain erzeugt; Gatewaytests nutzen drei Light-/mehrere Climate-IDs. |
| 26.2-E1 | Nur Light Power, Climate Power, Climate Target | PASS | Exakte Routes `/api/light/state`, `/api/climate/power`, `/api/climate/temperature`. |
| 26.2-E2 | Kein weiterer schreibbarer Domainpfad | PASS | Switch/Cover/Fan/Media/Lock in Room read-only; kein generischer Serviceendpoint. |
| 26.2-F1 | Autorisierte verfügbare Lights beliebiger ID | PASS | Domain `light`, Grant, Zustand `on/off`; original plus zweite und dritte ID getestet. |
| 26.2-F2 | Light unavailable sicher deaktiviert | PASS | Capability false; Route liefert kontrollierten Fehler ohne Serviceaufruf. |
| 26.2-F3 | Unauthorized/wrong domain/unknown abgewiesen | PASS | Serverseitige 403/403/404-Pfade und Null-Serviceaufrufe im Gatewaytest. |
| 26.2-G1 | On→Off und Off→On | PASS | Fester Actionvalidator plus ausschließlich `light.turn_on/turn_off`; mehrere IDs. |
| 26.2-H1 | Climate Power aus echten `hvac_modes` | PASS | `ClimatePower.capabilities()` verlangt `off` plus unterstützten Nicht-Off-Modus. |
| 26.2-H2 | `supported_features`/Targetattribute bestimmen Sollwertsupport | PASS | Target nur mit Featurebit und vollständigem Temperaturmodell. |
| 26.2-H3 | Thermostat ohne `off` erhält keinen Fake-Power | PASS | `supports_power:false`; Grid/Focus/Room rendern keinen Powerbutton. |
| 26.2-H4 | unavailable/unknown sicher deaktiviert | PASS | Verfügbarkeit ist zentrale Capabilityvoraussetzung. |
| 26.2-I1 | Power On/Off nur capabilitybasiert sichtbar | PASS | Öffentliche `supports_power`, `can_power_on`, `can_power_off` steuern alle Oberflächen. |
| 26.2-J1 | Last-known non-off Mode zuerst | PASS | Prozesslokaler Mode-Speicher in `climate-power.js`; Regressionstest. |
| 26.2-J2 | Konfigurierter Preferred Mode danach | PASS | Wird nur gewählt, wenn aktuell real unterstützt und nicht `off`. |
| 26.2-J3 | Aktueller Nicht-Off-Modus danach | PASS | Resolver übernimmt zulässigen aktuellen State. |
| 26.2-J4 | Deterministischer unterstützter Fallback | PASS | Definierte Priorität plus stabile echte Modusliste; kein erfundenes `heat`. |
| 26.2-J5 | Unsupported Browsermode abgewiesen | PASS | Browser kann keinen Modus frei setzen; unerwartete/ungültige Payloadfelder werden verworfen. |
| 26.2-K1 | Stale/unsupported Preference nie senden | PASS | Resolver prüft gegen aktuelle `hvac_modes` und fällt sicher zurück. |
| 26.2-L1 | Target während `off` bedienbar, wenn unterstützt | PASS | Capability besitzt kein `state !== off`-Gate; Grid/Focus/Room übernehmen sie. |
| 26.2-L2 | Target während `off` schaltet nicht ein | PASS | Route ruft ausschließlich `climate.set_temperature`; Test bestätigt keinen HVAC-Poweraufruf und State bleibt off. |
| 26.2-M1 | Target Eligibility pro Entity | PASS | Grant, Domain, Availability, Featurebit, aktueller Targetwert, Min/Max/Step. |
| 26.2-N1 | HA lehnt Off-State-Setpoint ab | PASS | Kontrollierter 502/Frontendfehler; optimistischer Wert wird auf letzten bestätigten Stand zurückgesetzt. |
| 26.2-N2 | Sichere Fehlermeldung ohne Secret | PASS | Generische Clientantwort, bereinigtes Logging; Securitytests grün. |
| 26.2-O1 | Minimum exakt erlaubt | PASS | Gatewaytest mit Entitygrenze. |
| 26.2-O2 | Maximum exakt erlaubt | PASS | Gatewaytest mit Entitygrenze. |
| 26.2-O3 | Step pro Entity normalisiert/validiert | PASS | Zentraler Temperaturvalidator; Floating-Toleranz und exakte Schritte getestet. |
| 26.2-O4 | Unter Minimum abgewiesen | PASS | 400 vor HA-Service. |
| 26.2-O5 | Über Maximum abgewiesen | PASS | 400 vor HA-Service. |
| 26.2-O6 | Invalid/nicht numerisch abgewiesen | PASS | Strikte Payload-/Numberprüfung. |
| 26.2-O7 | Target-Capability fehlt | PASS | Kein UI-Control; Route lehnt serverseitig ab. |
| 26.2-P1 | Active Climate Target | PASS | UI-/Gatewaytest. |
| 26.2-P2 | Off Climate Target | PASS | UI-/Gatewaytest ohne Einschalten. |
| 26.2-Q1 | Grid Light/Climate | PASS | Widgetrenderer konsumieren Gatewaycapabilities. |
| 26.2-Q2 | Focus Light/Climate | PASS | Separates Focusviewmodel erhält dieselben Capabilities; keine Grid-Sonderentscheidung. |
| 26.2-Q3 | Room Light/Climate | PASS | Roomprojektion ruft zentrale Public-Capabilityhelper auf; keine zweite Grantlogik. |
| 26.2-Q4 | Admin Preview | PASS | Preview übernimmt aktuellen Draftgrant, führt aber keinen HA-Schreibaufruf aus. |
| 26.2-Q5 | Default/Custom/Section Dashboard | PASS | Grantauflösung ist dashboardkonfigurationsweit, Route-/Section-unabhängig. |
| 26.2-R1 | Entity-ID serverseitig validiert | PASS | Route prüft Format, Existenz und exakten Grant. |
| 26.2-R2 | Domain/Action serverseitig validiert | PASS | Fest verdrahtete Domainendpunkte und erlaubte Actions. |
| 26.2-R3 | Authorization serverseitig validiert | PASS | `ControlAuthorization` ist maßgeblich; UI disabled ist nur Darstellung. |
| 26.2-R4 | Payload/Capability/Range/Step serverseitig validiert | PASS | Alle Prüfungen liegen vor Serviceaufruf. |
| 26.2-R5 | Write Rate Limits erhalten | PASS | Gateway-/Rate-Limit-Regressionslauf grün. |
| 26.2-S1 | Kein generisches `/api/service` | PASS | Route-/Quellscan ohne Treffer. |
| 26.2-S2 | Keine browsergelieferte Domain/Service/WebSocket-Command | PASS | Browserpayload enthält nur Entity, enge Action/Temperatur; kein HA-WebSocket im Client. |
| 26.2-S3 | HA-/Supervisor-/Admin-Token getrennt und backend-only | PASS | Runtime-/Adminauth und Frontendscan; keine Tokenwerte im Public Payload. |
| 26.2-S4 | Keine Registry-/Area-/Label-Writes | PASS | Read-only Metadatenpfade unverändert. |
| 26.2-LEG1 | Safari iOS 9 / ES5 | PASS | Syntax-/Verbotscan über alle Wall-JS-Dateien grün. |
| 26.2-CACHE1 | Aktuelle Control-/Capability-UI konsistent ausgeliefert | PARTIAL | Geteilte Assets tragen v51/v44/v50; stale UI kann neue Servercapabilities falsch darstellen. `RQ-04-01`. |
| 26.2-MATRIX1 | Card-Matrix erwartet capabilityabhängige Controls korrekt | BROKEN | Alter Haupt-Harness verlangt bei Climate unknown/unavailable pauschal drei Controls. Bestehendes `RQ-18-01`; Produktlogik selbst korrekt. |
| 26.2-T1 | Lightfälle 1–10 automatisiert | PASS | `test/sprint-26-2.test.js` und `test/gateway.test.js`, mehrere IDs. |
| 26.2-T2 | Climate-Powerfälle 11–20 automatisiert | PASS | Mehrere Modusmatrizen, no-off, preferred/last/fallback/unavailable/unauthorized. |
| 26.2-T3 | Targetfälle 21–31 automatisiert | PASS | Active/off, no-auto-power, Grenzen, Step, invalid, unavailable und HA-Fehler. |
| 26.2-T4 | Cross-Surface 32–41 automatisiert | PASS | Grid/Focus/Room/Admin/Default/Custom/Sectiontests. |
| 26.2-M1 | Reale Integrationen mit mehreren Lights/Climates | NOT TESTED | MT-71. |
| 26.2-M2 | Reale iPad-Controls über Grid/Focus/Room | NOT TESTED | MT-72. |
| 26.2-DOD1 | Zentraler produktiver Endzustand | PASS | Kein verbleibender Code-/Securitydefekt im kontrollierten Audit gefunden. |
| 26.2-DOD2 | Reale Zielsystemabnahme | NOT TESTED | Keine Produktion/physische Hardware in Part 19. |
| 26.2-DOD3 | Vollständig RC-freigabefähig | PARTIAL | Reale Gates sowie RQ-04-01/RQ-18-01 und globale RC-P1-Blocker bleiben offen. |

## Root Causes und finale Architektur

Vor Sprint 26.2 autorisierte `src/routes/api.js` nur die statisch bekannten
Esszimmer-Testentities. Weitere sichtbare Lights erhielten dadurch keine
öffentliche Write-Capability. Climate Power besaß für das bekannte Thermostat
einen festen `heat`-Sonderfall; andere echte Modekombinationen konnten keinen
sicheren On-Mode ableiten. Zusätzlich band die Sollwertfreigabe in Backend und
Oberflächen die Capability fälschlich an `state !== "off"`.

Heute sammelt `src/services/control-authorization.js` ausschließlich explizite
persistente Grants aus der vollständigen Konfiguration. Es prüft Domain und
Entity und projiziert Capabilities aus dem aktuellen HA-State. `src/services/
climate-power.js` berechnet Power-/Targetfähigkeit, merkt den letzten echten
Nicht-Off-Modus und löst einen sicheren unterstützten On-Mode auf. Die drei
engen API-Routen validieren erneut Entity, Domain, Action, Grant, Availability,
Capability und Payload; erst danach rufen sie einen fest definierten HA-Service
auf.

## Testevidenz

- Part-19-Fokuslauf: 95/95 Tests bestanden.
- Ergänzender Gateway-/Cross-Surface-Lauf: 72/72 Tests bestanden.
- Vollständige Regression: 329/329 Tests bestanden.
- Sämtliche Wall-JavaScriptdateien: `node --check` bestanden.
- Legacy-/CSS-/Securityscan: keine verbotene moderne Wall-Syntax, kein CSS
  Grid/Flex-gap und keine generische Write-/WebSocket-/Credentialfläche.
- Ausschließlich localhost-Mocks und Fake-Credentials; kein reales HA.

## Reparatur- und Manuelltestbezug

- Kein neuer Part-19-Reparatureintrag.
- `RQ-04-01`: aktuelle Capability-/Controlassets konsistent ausliefern.
- `RQ-18-01`: Harnesserwartungen aus echten Capabilities ableiten.
- MT-71: reale HA-Integrationsmatrix mit drei Lights und mehreren Climates.
- MT-72: Grid-/Focus-/Room-Controlmatrix auf dem iPad mini.
