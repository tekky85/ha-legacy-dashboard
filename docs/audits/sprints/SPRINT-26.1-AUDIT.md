# Sprint-26.1-Audit – Native Room Card MVP

## Auditrahmen

- Audit-Part: 19
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-26.1.md`](../../sprints/SPRINT-26.1.md)
- Anwendungscode geändert: nein
- Physisches iPad, produktiver LXC, HAOS oder produktives Home Assistant geprüft: nein

## Gesamtergebnis

**Sprint 26.1: PARTIAL**

Die native Room Card ist im aktuellen Code end-to-end vorhanden. Die zwei
historisch bestätigten Defekte sind nicht mehr reproduzierbar: Collapse/
Expand verwendet einen expliziten ES5-Clickpfad mit direkter DOM-/ARIA-
Aktualisierung; Controls werden vorher abgefangen. Der Runtime-Hintergrund
wird aus derselben persistierten `imageId` wie die Admin-Vorschau abgeleitet
und nach der früheren CSP-Divergenz über eine dedizierte Ebene plus CSSOM
gesetzt. Der kontrollierte Browser-Harness meldet vier repräsentative Größen
ohne Fehler.

`PARTIAL` bleibt korrekt, weil die zentrale aktuelle Card Matrix Room/Tall/
Capability-Fälle nicht vollständig als ausführbares Gate enthält
(`RQ-18-01`), der wiederverwendete PNG-Uploadpfad strukturell ungültige PNGs
akzeptiert (`RQ-16-01`) und reale iPad-/HAOS-Prüfungen fehlen. JPEG, Persistenz,
Runtime-URL und Rendererpfad selbst sind nicht erneut gebrochen.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 26.1-ARCH1 | Native Implementierung, kein RoomCard-Fork/Embed | PASS | Eigene Schema-, Service-, Admin- und ES5-Rendererdateien; kein Lovelace-/Custom-Card-Runtimeimport. |
| 26.1-ARCH2 | Externer Node/Express-Gateway bleibt erhalten | PASS | Room wird über normale Dashboard-API und bestehende System-Snapshotservices projiziert. |
| 26.1-A1 | Widgettyp `room` | PASS | `SUPPORTED_WIDGET_TYPES` und Widgetfactory enthalten `room`. |
| 26.1-A2 | Roomtitel und optionale `areaId` | PASS | Persistentes `room.title`, `room.areaId`; leere Area zulässig. |
| 26.1-A3 | Einzelrollen Temperatur, Humidity, Climate, Presence | PASS | Normalisierung, Adminselector und `src/services/rooms.js` projizieren alle vier Rollen. |
| 26.1-A4 | Listen für Windows, Lights, Switches, Covers, Fans, Media, Locks | PASS | Persistente Entity-ID-Arrays, Domainvalidierung und read-only Projektion; Light ggf. kontrollierbar. |
| 26.1-A5 | Batteries, Alerts und Secondary | PASS | Eigene Rollenlisten; Alerts nutzen zentrale Issues/Riskdaten. |
| 26.1-A6 | Optionales Background | PASS | `room.background.imageId/position/size/overlay`; öffentliche URL wird serverseitig erzeugt. |
| 26.1-A7 | Collapse-Konfiguration | PASS | `collapsible` und `defaultExpanded` mit sicheren Defaults. |
| 26.1-A8 | Ungültige/fehlende Entity sicher | PASS | Entity-ID-/Domainvalidierung; fehlende Snapshotentities werden ausgelassen oder unavailable dargestellt. |
| 26.1-A9 | Keine Demo-/Test-ID-Abhängigkeit | PASS | Rollen sind Konfigurationswerte; keine produktive Room-Sonderliste. |
| 26.1-B1 | HA Area auswählbar | PASS | Native Area-Auswahl im Admin aus sanitisiertem Inventory. |
| 26.1-B2 | Vorschläge nach stabiler `area_id` | PASS | `src/admin/js/rooms.js` filtert Inventory-Metadaten nach Area, Domain und Device Class, nicht nach Gerätenamen. |
| 26.1-B3 | Temperatur-/Humidity-/Climate-/Presence-Vorschlag | PASS | Rollenmapping und Sprint-26.1-Auto-Setup-Tests. |
| 26.1-B4 | Windows/Lights/Switches/Covers/Fans/Media/Locks-Vorschlag | PASS | Listenmapping nach tatsächlicher Domain/Device Class. |
| 26.1-B5 | Battery-/Diagnostic-Vorschlag | PASS | Sensor-Metadaten/Device Class werden read-only eingeordnet. |
| 26.1-B6 | Vorschläge bleiben überprüfbar/änderbar | PASS | Alle Rollen verwenden durchsuchbare Entityauswahl; Draft bleibt editierbar. |
| 26.1-B7 | Auto-Setup überschreibt manuelle Werte nicht still | PASS | Explizite Aktion und Bestätigung bei bestehenden Zuordnungen; Test prüft manuelle Abweichung. |
| 26.1-B8 | Fehlende Area erhält manuelle Konfiguration | PASS | Admin warnt, Renderer benötigt Area nicht. |
| 26.1-B9 | Keine Area-/Registry-Writes | PASS | Kein entsprechender Endpoint/Command; Area ist read-only Metadata. |
| 26.1-C1 | Collapsed priorisiert Identität, Temperatur, Humidity, Presence/Open und Alerts | PASS | Room-Viewmodel/Renderer und tierabhängige CSS-Sichtbarkeit. |
| 26.1-C2 | Target/HVAC wo sinnvoll | PASS | Climate-Teilmodell zeigt Status/Target capabilityabhängig. |
| 26.1-C3 | Expanded zeigt zusätzliche Rollen/Controls | PASS | `.room-expanded-content` mit Entitygruppen und sicheren Controls. |
| 26.1-C4 | Fehlende optionale Daten werden ausgelassen | PASS | Leere Rollen erzeugen keine kaputten Platzhalter; unavailable bleibt kontrolliert. |
| 26.1-D1 | Secure Background-Infrastruktur von Sprint 25.3 wiederverwenden | PASS | Dieselbe `dashboard-backgrounds`-Ablage, Adminauth, Größenlimit, atomare Persistenz und referenzierte Assetroute. |
| 26.1-D2 | PNG-Strukturvalidierung und Last-valid-Replace sicher | BROKEN | Der gemeinsame Parser akzeptiert PNG ohne `IDAT` bzw. mit falscher CRC; Room Replace erbt das Risiko. Bestehendes `RQ-16-01`. |
| 26.1-D3 | JPEG/Runtime-URL/Persistenz | PASS | JPEG-Parser gehärtet; `publicRoomConfiguration()` liefert nur kontrollierte `/assets/backgrounds/<id>`-URL. |
| 26.1-D4 | Missing Background fällt sicher zurück | PASS | Fehlende/ungültige URL erzeugt Karte ohne Bild; Layout und Inhalt bleiben. |
| 26.1-E1 | Alerts verwenden zentrale Risk-/Issue-Logik | PASS | `Rooms.build()` filtert den bereits erzeugten Issue-/Summary-Snapshot; keine zweite Engine. |
| 26.1-E2 | Openings, Safety und Low Battery | PASS | Zentrale Issuearten/Severity plus Roomrollen werden projiziert. |
| 26.1-F1 | Nur bestehende sichere Controls | PASS – superseded by Sprint 26.2 | Light/Climate nutzen zentrale Grants/Capabilities und drei enge Endpunkte. |
| 26.1-F2 | Switch/Cover/Fan/Media/Lock read-only | PASS | Keine neuen Domain-Write-Routen oder Buttons mit generischem Serviceaufruf. |
| 26.1-F3 | Kein generischer HA Service Proxy | PASS | Browser wählt weder Domain noch Service; Securityscan grün. |
| 26.1-G1 | Expliziter Collapse-/Expand-Listener | PASS | `src/public/js/app.js::handleDashboardInteraction` findet Toggle über Elternkette; klassische ES5-Events. |
| 26.1-G2 | Klasse, ARIA, Symbol und Inhalt ändern | PASS | `Dashboard.toggleRoom()` aktualisiert `is-expanded`, `aria-expanded`, Symbol und Scrollposition ohne Griddish-Re-render. |
| 26.1-G3 | Kein Touchend+Click-Doppeltoggle | PASS | Nur synthetisierter `click`-Pfad; kein paralleler Room-`touchend`-Listener. |
| 26.1-G4 | Controls toggeln Room nicht | PASS | Light-/Climate-Handler laufen vor Room-Toggle und beenden Event; direkter Regressionstest grün. |
| 26.1-G5 | Collapse-Zustand verhält sich konsistent | PASS | Initial aus Config, danach lokaler Laufzeitzustand; Persistenz über Reload war nicht spezifiziert. |
| 26.1-G6 | Grid bleibt nach Toggle intakt | PASS | Toggle verändert keine `x/y/w/h`- oder Sectiondaten. |
| 26.1-H1 | Default-/Custom-Dashboard | PASS | Gemeinsamer Renderer und Routes; Regressionstests grün. |
| 26.1-H2 | Section-Integration | PASS | Room ist normales Widget mit optionalem `sectionId`; Section und `room.areaId` unabhängig. |
| 26.1-I1 | Compact bewusste Darstellung | PASS | Identität/Primärwert/wichtigster Status; Browser-Harness grün. |
| 26.1-I2 | Standard bewusste Darstellung | PASS | Ergänzt Humidity/Presence/Openings; Browser-Harness grün. |
| 26.1-I3 | Wide bewusste Darstellung | PASS | Mehr Alerts/Details/Controls; Browser-Harness grün. |
| 26.1-I4 | Large bewusste Darstellung | PASS | Vollständige Raumzusammenfassung; Browser-Harness grün. |
| 26.1-I5 | Aktuelle vollständige Room-Größen-/State-Matrix inklusive Tall | PARTIAL | Separater Harness deckt vier Tiers ab, nicht die vollständige aktuelle Room×Size×State-Matrix/Tall. Bestehendes `RQ-18-01`. |
| 26.1-I6 | Lange Namen/Werte ohne lokalen Overflow | PASS | `min-width:0`, Ellipsis/Wrap und Sprint-26.1-Tests; Browser-Harness ohne Fehler. Physisch: MT-69. |
| 26.1-J1 | ES5/Safari iOS 9 | PASS | Kein fetch/Promise/Arrow/let/const/async/optional chaining; `node --check` grün. |
| 26.1-J2 | Kein CSS Grid/Flex-gap/ResizeObserver/Container Query | PASS | Wall-CSS-/Quellscan grün. |
| 26.1-J3 | Kein Lit/Lovelace/Shadow DOM/HA-Frontend-Modul | PASS | Native klassische JS-/DOM-Implementierung. |
| 26.1-P1 | Kein N+1-HA-Abruf | PASS | Dashboardroute lädt einen gemeinsamen `System.getSnapshot()` und projiziert alle Rooms daraus. |
| 26.1-P2 | Cache/normalisierte Snapshots wiederverwenden | PASS | `src/services/rooms.js` enthält keine HA-Clientaufrufe. |
| 26.1-ADMIN1 | Native Room-Editor vollständig | PASS | Titel, Area, Auto-Setup, Rollen, Collapse, Size, Section, Background, Preview und Controlgrant vorhanden. |
| 26.1-ADMIN2 | Preview und gespeicherter Runtimepfad entsprechen einander | PASS | Test persistiert Draft, liest Public Dashboard und prüft identische Backgroundreferenz/Roomdaten. |
| 26.1-RUNTIME1 | Früherer Collapse-Defekt | PASS | Root Cause behoben: Expanded-Flexinhalt scrollt und schrumpft nicht mehr auf 0 px; direkter DOM-/Browser-Test. |
| 26.1-RUNTIME2 | Früherer Background-Defekt | PASS | Root Cause behoben: CSP blockierte Inline-Style; dedizierte Backgroundebene wird per CSSOM gesetzt. |
| 26.1-CACHE1 | Aktuelle Room-/Collapse-/Backgroundassets auf allen Routen | PARTIAL | Immutable Cache-Buster v51/v44/v50 können alte Shared-CSS-/Controllerzustände mischen. `RQ-04-01`. |
| 26.1-M1 | Room Card auf realem iPad mini | NOT TESTED | MT-69. |
| 26.1-M2 | Room Background und `/data` auf HAOS | NOT TESTED | MT-70. |
| 26.1-DOD1 | Alle automatisierbaren Kernfälle | PASS | Fokus 95/95, Ergänzung 72/72, Gesamtsuite 329/329; Room-Harness 4/4. |
| 26.1-DOD2 | Vollständige Release-/Realgeräteabnahme | PARTIAL | RQ-16-01, RQ-18-01, RQ-04-01 und MT-69/70 bleiben offen. |

## Bekannte Defekte: Root Cause und aktueller Fix

### Collapse/Expand

Die erste Umsetzung setzte zwar `is-expanded`, aber der umfangreiche innere
Flexbereich blieb in Mobile-WebKit auf 0 Pixel Höhe komprimiert. Der aktuelle
Renderer hält Grid- und Room-Innengeometrie getrennt; Expanded-Inhalt scrollt
in der verfügbaren Fläche. Der Controller toggelt ausschließlich die betroffene
Card und Controls werden vor dem Toggle abgefangen.

### Runtime-Hintergrund

Persistenz, `imageId`, Public Payload und Renderer waren vorhanden. Die strenge
`style-src 'self'`-CSP blockierte jedoch den initial als Inline-Style erzeugten
Runtime-Hintergrund, während die Admin-Vorschau bereits CSSOM verwendete. Die
aktuelle Card rendert eine nicht interaktive Backgroundebene, überträgt nur
validierte `data-*`-Werte und setzt Bild/Position/Größe/Overlay anschließend
per ES5-CSSOM. Damit stimmen Preview und Runtimepfad wieder überein.

## Sicherheits- und Leistungsbefund

Room erhält Daten aus genau einem normalisierten System-Snapshot pro
Dashboardantwort. Area-Vorschläge sind read-only; keine Zuordnung erteilt
automatisch Schreibrechte. Grid, Focus und Room verwenden nach Sprint 26.2
dieselbe serverseitige Grant-/Capabilityentscheidung. Tokens, rohe Registries
und generische HA-Commands gelangen nicht in den Browser. Der einzige aktuelle
Background-Sicherheitsbefund ist der bereits zentrale PNG-Befund `RQ-16-01`.

## Reparatur- und Manuelltestbezug

- `RQ-04-01`: Cacheversionen für Room-/Shared-Assets vereinheitlichen.
- `RQ-16-01`: gemeinsamen PNG-Validator reparieren; kein Room-Sonderpfad.
- `RQ-18-01`: vollständige aktuelle Room-Matrix inklusive Tall und
  capabilityabhängigen Controls in das echte Browser-Gate integrieren.
- MT-69: Room Card, Collapse, Background, Größen, Alerts und Controls auf iPad.
- MT-70: Room-Persistenz/Background/Restart auf HAOS.
