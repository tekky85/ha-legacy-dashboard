# Sprint-27-Warteschlange für manuelle Tests

## Sprint-27.2-Testkandidat

Der öffentliche Teststand ist `1.0.0-rc.3` / `v1.0.0-rc.3` mit
dem Image `ghcr.io/tekky85/ha-legacy-dashboard:1.0.0-rc.3` und dem Archiv
`ha-legacy-dashboard-1.0.0-rc.3.tar.gz`. Das bereits veröffentlichte `rc.2`
wurde wegen eines plattformabhängigen, rein informativen gzip-Headerbytes bei
identischem Tar-Inhalt als Reproduzierbarkeitskandidat ersetzt. `rc.3` ist
veröffentlicht und kann als feste Referenz für die bereits beschriebenen
HAOS-, Standalone-/LXC- und iPad-Prüfungen verwendet werden. Dieser Hinweis
ändert kein Resultat:
Alle nicht real ausgeführten Tests bleiben `NOT TESTED`, und vorhandene
Repair-Abhängigkeiten bleiben bestehen.

Automatisierte Tests ersetzen keine reale iPad-, HomeScreen- oder
Home-Assistant-Abnahme. Ein Eintrag bleibt `NOT TESTED`, bis die beschriebene
Prüfung tatsächlich durchgeführt und mit Datum/System dokumentiert wurde.

Sprint 27.1-E ordnet die verbleibenden realen Anforderungen der Testmatrizen
aus Sprint 19 bis 21.3 ausdrücklich MT-24 bis MT-28, MT-30 bis MT-36 und MT-42
zu. Keiner dieser Tests war durch `RQ-07-01`, `RQ-08-01`, `RQ-09-02` oder
`RQ-10-01` als Produktrepair blockiert; ihre Ausführungszustände bleiben daher
unverändert `CAN RUN NOW` und alle Resultate ehrlich `NOT TESTED`.

Sprint 27.1-F ordnet die verbliebenen realen Anforderungen aus Sprint 21.4,
21.5, 22, 23, 25.1, 25.2 und 25.3 konkret MT-13, MT-34, MT-37 bis MT-49,
MT-51, MT-52, MT-54 und MT-58 bis MT-62 zu. Die vier geschlossenen
Traceability-Repairs blockierten keine Ausführung. Alle zugeordneten
Realgeräte-/Runtime-Ergebnisse bleiben unverändert `NOT TESTED`.

| ID | Sprint | Requirement | Gerät/System | Prüfschritte | Status |
|---|---|---|---|---|---|
| MT-01 | 12 | Climate-Controls, kompakte Karte und allgemeine Kartengeometrie auf der Zielhardware | iPad mini 1, iOS 9.3.5, Safari/HomeScreen | Portrait und Landscape sowie Light/Dark öffnen; Minus/Plus zentriert und mindestens ca. 44 px prüfen; Busy/Disabled, Erfolgs-/Fehlerstatus, Refreshschutz, lange Werte und Clipping prüfen. | NOT TESTED |
| MT-02 | 13 | Dashboardrouting und Darstellung auf der Zielhardware | iPad mini 1, iOS 9.3.5, Safari/HomeScreen | `/`, `/d/default` und `/d/esszimmer` öffnen; Inhalt/Titel, Portrait/Landscape, Light/Dark, Auto-Refresh, Verbindungsstatus, Uhr/Datum und Verbleib im HomeScreen-Modus prüfen. | NOT TESTED |
| MT-03 | 13 | Multi-Dashboard-Schreibpfad mit realen Geräten | reales Home Assistant, autorisiertes Light und Climate | Dieselben ausdrücklich autorisierten Light-/Climate-Entities aus Default- und zweitem Dashboard schalten; prüfen, dass Sichtbarkeit keine Berechtigung erzeugt und nicht autorisierte Entities abgewiesen werden. | NOT TESTED |
| MT-04 | 15, 16 | Admin UI in aktuellem Safari | macOS Safari, aktuelle verfügbare Version | `/admin` öffnen; Login/Session/Logout, Dashboard-CRUD/-Duplikat/-Default, Entity-Suche/-Filter, Widget Add/Edit/Remove/Reorder/Visible/Size, Save/Discard, Reload, Fehlermeldungen, Tastaturfokus und Kontrast prüfen. | NOT TESTED |
| MT-05 | 15 | Wall-Display-Regression nach Adminänderung | iPad mini 1, iOS 9.3.5, Safari/HomeScreen | Konfiguration im Admin ändern und speichern; `/` und Custom-Dashboard am iPad laden; Darstellung, Auto-Refresh, Theme sowie ausdrücklich autorisierte Light-/Climate-Controls prüfen. Kann mit MT-01 bis MT-03 kombiniert werden. | NOT TESTED |
| MT-06 | 16 | Alle Größen-Presets auf Zielhardware | iPad mini 1, iOS 9.3.5, Safari/HomeScreen | `compact`, `normal`, `wide`, `tall`, `large` in Portrait/Landscape und Light/Dark prüfen: keine horizontale Scrollbar, kein Clipping/Overlap, sinnvolle Umbrüche, zentrierte Plus/Minus, bedienbares Light, kompakter Header. Aktuelle Sprint-17-Layoutkoordinaten berücksichtigen. | NOT TESTED |
| MT-07 | 16 | Größenpersistenz über produktiven Service-Neustart | Standalone-LXC `ha-legacy-dashboard`, systemd | Größe eines Testwidgets speichern, Seite neu laden, Dienst kontrolliert neu starten und Größe erneut prüfen; Backup-/Fehlerverhalten nicht destruktiv beobachten. | NOT TESTED |
| MT-08 | 17, 17.1 | Reale Pointer-/Maus-Abnahme des Admin-Rastereditors | aktueller macOS Safari und ein Pointer-/Touch-fähiger moderner Browser | `/admin` öffnen; Portrait und Landscape wählen; je eine Kachel per Maus/Pointer links/rechts/oben/unten ziehen; Zielvorschau und Zell-Snapping prüfen; Resize-Handle verwenden; Kollision, Bounds und Mindestgröße provozieren; Save/Discard/Reload sowie Dashboardduplikat mit neuen Widget-IDs und gleicher Geometrie prüfen. | NOT TESTED |
| MT-09 | 17, 17.1 | Grid-, Präsentations-, Rotation- und Control-Abnahme auf der Zielhardware | iPad mini 1, iOS 9.3.5, Safari/HomeScreen | Default und Custom Dashboard in Portrait/Landscape öffnen; Portrait→Landscape→Portrait drehen; keine Überlappung, horizontale Scrollbar, Hintergrundlücke oder Footer-Verschiebung prüfen; kleinste/normal/breite/hohe/große Sensor-, Binary-, Light- und Climate-Karten mit langen Namen/Werten sowie Light/Dark prüfen; Climate-Focus öffnen und Ist/Soll, HVAC, Minus/Plus/Power, Zentrierung und Touchziele prüfen; Summary/Errors öffnen und unveränderte Darstellung/Navigation prüfen. | NOT TESTED |
| MT-10 | 17, 17.1 | Layoutpersistenz und Backup über produktiven Dienstneustart | Standalone-LXC `ha-legacy-dashboard`, systemd | Ein Testwidget in beiden Profilen verschieben und vergrößern, speichern, Dashboard neu laden, Dienst kontrolliert neu starten und beide Profile erneut prüfen; sicherstellen, dass `dashboards.json.bak` gültig bleibt und keine Position doppelt skaliert wird. | NOT TESTED |
| MT-11 | 17.2 | Kartenidentität und Compact-Inhalte auf realer Zielhardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-12 | 17.2 | Proportionale Grid-Geometrie, Rotation und Text-Overflow | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-13 | 17.2, 25.1, 25.4 | Globale Theme-Persistenz über alle Legacy-Routen | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-14 | 17.3 | Focus-Overlay, Karteninhalte und Grid-Trennung | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-15 | 17.3 | Unified Light Control und Event-Trennung | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-16 | 17.3 | Climate Power, Sollwertsteuerung und Fehlerzustände im Focus | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-17 | 17.3 | Admin-Live-Preview mit realen Pointer-/Resize-Gesten | aktueller macOS Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-18 | 17.4, 17.5 | Focus-Viewport, Scroll, Rotation und native Renderer auf Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-19 | 17.5 | Bestätigte Focus-Kompressionsregression auf iPad Air 2 | iPad Air 2, iPadOS 15.8.5, Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-20 | 17.5 | Native-Focus-Nichtregression in macOS Safari | macOS 13.7.8 Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-21 | 17.6, 17.7 | Vollständige Power-/Climate-Control-Hierarchie auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-22 | 17.6, 17.7 | Power-/Climate-Control-Nichtregression auf iPad Air 2 | iPad Air 2, iPadOS 15.8.5, Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-23 | 17.6, 17.7 | Power-/Climate-Control-Nichtregression in Desktop Safari | macOS 13.7.8 Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-24 | 18, 19 | Systemrouten, Summary, Stale/Offline/Recovery, Theme und sichere Navigation im modernen Browser | macOS 13.7.8 Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-25 | 18, 19 | System-Shell und Summary MVP auf realer Legacy-Zielhardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-26 | 19 | Persistente Summary-Ignore-/Media-Privacy-Konfiguration und Write-Trennung | macOS 13.7.8 Safari plus Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-27 | 20 | Error MVP, Adminregeln, stale/offline/Recovery und Theme im modernen Safari | macOS 13.7.8 Safari plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-28 | 20 | Error Dashboard auf realem Legacy-Zielgerät in Portrait/Landscape und HomeScreen | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-29 | D1 | Aktuelle, reale Produkt-Screenshot-Galerie einschließlich Sections und Room Card | macOS-Browser plus kontrollierter lokaler Real-App-Mock | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-30 | 21 | Registry-/Diagnoseanreicherung, Partial Failure und Admin-Quellenstatus gegen reales Test-HA | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-31 | 21.1 | Echte Device-ID-Gruppierung, Filter, Details und responsive Cards im modernen Safari | macOS 13.7.8 Safari plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-32 | 21, 21.1 | Registry-Kontext und Device Groups auf realem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-33 | 21.2 | Summary-Filter und persistente 1/2/3-Spaltenansicht auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-34 | 21.2, 21.3, 25.1, 25.4 | Exakte Error-Severity-/State-Filter, child-first Device Groups und Spalten auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-35 | 21.3 | Device-Class- und HA-Label-Kritikalitätsmodi gegen ein kontrolliertes reales HA | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-36 | 21.3 | Label-Rename, stale/unsupported, Löschung und Recovery ohne stillen Fallback | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-37 | 21.4 | Entity Rule Manager, kombinierte Filter und Batch Save/Discard im Desktop-Safari | aktuelle macOS-Safari-Version plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-38 | 21.4 | Entity Rule Manager, Touchziele und große Inventare auf modernem Touch-Tablet | iPad Air 2, iPadOS 15.8.5, Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-39 | 21.4 | Vereinfachte Summary-/Error-Header und Count-Semantik auf der Legacy-Zielhardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-40 | 21.5, 25.1, 25.2, 25.4 | Globale Health-/Summary-Navigation und sichere Rückkehr im Legacy-HomeScreen | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-41 | 21.5, 25.2 | Same-Window-Systemnavigation und Return-Nichtregression auf iPad Air 2 | iPad Air 2, iPadOS 15.8.5, Safari/HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-42 | 21.5, 25.1, 25.2, 25.4 | Healthzustände, Filterunabhängigkeit, Failure-Fallback und Langzeitlauf in Desktop-Safari | aktuelle macOS-Safari-Version plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-43 | 22 | Reale Grace-/Expected-Offline-/Flapping-/Recovery- und Health-Semantik | macOS Safari plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-44 | 22 | Persistenz, `last_changed` und Prozesslokalität auf Standalone/LXC | Standalone-LXC `ha-legacy-dashboard` plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-45 | 22 | Sprint-22-Error-/Health-Darstellung auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-46 | 23 | Reales Automation Inventory, Referenzen, Capabilities, Partial Failure und Traces | macOS Safari plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-47 | 23 | Automation Impact und Advanced Diagnostics im Desktop-Safari | aktuelle macOS-Safari-Version plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-48 | 23 | Automation Impact und Advanced Diagnostics auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-49 | 23 | Automation-Impact-Nichtregression auf iPad Air 2 | iPad Air 2, iPadOS 15.8.5, Safari/HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-50 | 24, 25.4 | Reale Supervisor-Core-WebSocket-, Outage-/Recovery- und Log-Abnahme | Home Assistant OS auf amd64 plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-51 | 24, 25.3, 25.4 | `/data`-Persistenz, Rechte, Backgrounds und App-Restart | Home Assistant OS auf amd64 | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-52 | 24, 25.3, 25.4 | Cold Backup/Restore, Versionsupgrade, Backgrounds und HAOS-Reboot/Autostart | Home Assistant OS auf amd64 | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-53 | 24, 25.4 | Reale aarch64-App-Installation und Laufzeit | Home Assistant OS auf aarch64 | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-54 | 24, 25.3, 25.4 | Direkter App-LAN-Zugriff, Background und Legacy-Routen auf dem Ziel-iPad | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-55 | 25, 25.4 | Nächster RC: öffentlicher Releaseworkflow, GHCR-Multi-Arch-Manifest, Prerelease und Checksums | GitHub Actions/GHCR/GitHub Release plus isolierter amd64-Testhost | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-56 | 25, 25.4 | Standalone-Fresh-Install, echtes N→N+1-Upgrade und Rollback aus Releasearchiven | isolierter Debian-LXC/VM auf amd64 | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-57 | 25 | Stable-Promotion und kontrollierte `latest`-Aktualisierung nach vollständiger Freigabe | GitHub Actions/GHCR/GitHub Release | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-58 | 25.3, 25.4 | Dashboard-Background, optionaler Titel, Vollhöhe, Footer, Focus und Cacheersatz auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-59 | 25.3, 25.4 | Geschützter Upload, Preview-/Runtime-Parität, Validierung und Ersatz im modernen Safari | aktuelle macOS-Safari-Version plus kontrollierte Real-App | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-60 | 25.3, 25.4 | Standalone-`DATA_DIR`, Rechte, Persistenz, Backup und Dienstneustart | isolierter Standalone-LXC `ha-legacy-dashboard` | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-61 | 25.5 | Direkter LAN-, Hostname-, mDNS-, IPv4-/IPv6- und Portpfad des aktuellen HA-App-Kandidaten | Mac plus iPad mini 1/iOS 9.3.5 und aktuelles Test-HAOS | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-62 | 25.3, 25.5 | Reale JPEG-/PNG-Uploads, sichere Ablehnung, Replace/Rollback und `/data`-Persistenz | aktueller macOS Safari, Test-HAOS und iPad mini 1/iOS 9.3.5 | Vollständige Anleitung weiter unten; das automatisierte RQ-16-01-Gate ist erfüllt. | NOT TESTED |
| MT-63 | 25.6 | Card Type × Valid Size × Representative State auf realer Legacy-Hardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten; aktuellen Room-Typ und Tall-Fälle einschließen. | NOT TESTED |
| MT-64 | 25.7 | HomeScreen, Guided Access, Home-Taste, Same-Context-Navigation, Theme und Rotation | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-65 | 25.7 | Sleep/Wake, Volume, Touch, Auto-Lock, Dauerstrom sowie WLAN-/HA-/App-Recovery | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-66 | 25.7 | Guided-Access-Exit, Gerätereboot, Post-Reboot-Relaunch und erneute Kiosksperre | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-67 | 26 | Section-Rendering, unassigned Fallback, Titel, Rotation und Reload auf Legacy-Hardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-68 | 26 | Vollständiges Section-CRUD, Kartenbewahrung und Persistenz | aktuelle macOS-Safari-Version plus isolierter Standalone-LXC | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-69 | 26.1 | Native Room Card, Area-Vorschlag, Collapse, Background, Größen, Alerts und Controls | iPad mini 1, iOS 9.3.5, HomeScreen plus macOS-Safari für Admin | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-70 | 26.1 | Room-Background, Konfiguration und Assets über HAOS-App-Restart | Home Assistant OS Test-App plus macOS Safari | Vollständige Anleitung weiter unten; das automatisierte RQ-16-01-Gate ist erfüllt. | NOT TESTED |
| MT-71 | 26.2 | Reale HA-Controlmatrix mit drei Lights und mehreren Climate-Capabilities | macOS Safari plus isoliertes Test-HA/Standalone | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-72 | 26.2 | Gemeinsame Light-/Climate-Controls in Grid, Focus und Room auf dem Legacy-iPad | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |

## Reparaturabhängigkeiten der manuellen Tests

Diese Zuordnung entscheidet nur, wann ein Ergebnis als verbindliche Abnahme
gewertet werden darf. `CAN RUN NOW` bedeutet, dass kein bekannter Produkt-
Repair den Test blockiert; ein Explorationslauf darf dokumentiert werden.
`BLOCKED` verlangt vorherige Reparatur und gezielten Re-Audit der genannten
IDs. Release-/Stable-Tests verwenden zusätzlich immer einen exakten,
commitbezogenen Kandidaten.

Sprint 27.1-B entfernte `RQ-04-01` aus allen Abhängigkeiten. Sprint 27.1-C
entfernt zusätzlich `RQ-09-01` und `RQ-12-01/-02/-03`. Sprint 27.1-E schließt
vier Test-Traceability-Repairs, die selbst keine Ausführung blockierten. Die
dadurch allein blockierten Tests sind nun `CAN RUN NOW`; kombinierte Einträge
bleiben nur von ihren übrigen Repairs blockiert. Sämtliche 72 Resultate bleiben
`NOT TESTED`.

Sprint 27.1-F schließt weitere vier Traceability-Repairs. Auch diese waren
keine Produktrepair-Abhängigkeiten und verändern deshalb weder Execution State
noch Ergebnis eines manuellen Tests.

| Manual Test | Execution State | Blocked By Repairs |
|---|---|---|
| MT-01 | CAN RUN NOW | – |
| MT-02 | CAN RUN NOW | – |
| MT-03 | CAN RUN NOW | – |
| MT-04 | CAN RUN NOW | – |
| MT-05 | CAN RUN NOW | – |
| MT-06 | CAN RUN NOW | – |
| MT-07 | CAN RUN NOW | – |
| MT-08 | CAN RUN NOW | – |
| MT-09 | BLOCKED | RQ-18-01 |
| MT-10 | CAN RUN NOW | – |
| MT-11 | CAN RUN NOW | – |
| MT-12 | CAN RUN NOW | – |
| MT-13 | CAN RUN NOW | – |
| MT-14 | CAN RUN NOW | – |
| MT-15 | CAN RUN NOW | – |
| MT-16 | CAN RUN NOW | – |
| MT-17 | CAN RUN NOW | – |
| MT-18 | CAN RUN NOW | – |
| MT-19 | CAN RUN NOW | – |
| MT-20 | CAN RUN NOW | – |
| MT-21 | CAN RUN NOW | – |
| MT-22 | CAN RUN NOW | – |
| MT-23 | CAN RUN NOW | – |
| MT-24 | CAN RUN NOW | – |
| MT-25 | CAN RUN NOW | – |
| MT-26 | CAN RUN NOW | – |
| MT-27 | CAN RUN NOW | – |
| MT-28 | CAN RUN NOW | – |
| MT-29 | RUN AFTER ALL VISIBLE REPAIRS | RQ-18-01 |
| MT-30 | CAN RUN NOW | – |
| MT-31 | CAN RUN NOW | – |
| MT-32 | CAN RUN NOW | – |
| MT-33 | CAN RUN NOW | – |
| MT-34 | CAN RUN NOW | – |
| MT-35 | CAN RUN NOW | – |
| MT-36 | CAN RUN NOW | – |
| MT-37 | CAN RUN NOW | – |
| MT-38 | CAN RUN NOW | – |
| MT-39 | CAN RUN NOW | – |
| MT-40 | CAN RUN NOW | – |
| MT-41 | CAN RUN NOW | – |
| MT-42 | CAN RUN NOW | – |
| MT-43 | CAN RUN NOW | – |
| MT-44 | CAN RUN NOW | – |
| MT-45 | CAN RUN NOW | – |
| MT-46 | CAN RUN NOW | – |
| MT-47 | CAN RUN NOW | – |
| MT-48 | CAN RUN NOW | – |
| MT-49 | CAN RUN NOW | – |
| MT-50 | BLOCKED | RQ-13-01 |
| MT-51 | BLOCKED | RQ-13-01 |
| MT-52 | BLOCKED | RQ-13-01 |
| MT-53 | BLOCKED | RQ-13-01 |
| MT-54 | BLOCKED | RQ-13-01 |
| MT-55 | BLOCKED | RQ-13-01, RQ-14-04, RQ-17-01 |
| MT-56 | CAN RUN NOW | – |
| MT-57 | RUN AFTER ALL REPAIRS | RQ-13-01, RQ-14-04, RQ-17-01 |
| MT-58 | CAN RUN NOW | – |
| MT-59 | CAN RUN NOW | – |
| MT-60 | CAN RUN NOW | – |
| MT-61 | BLOCKED | RQ-13-01 |
| MT-62 | BLOCKED | RQ-13-01 |
| MT-63 | BLOCKED | RQ-18-01 |
| MT-64 | BLOCKED | RQ-13-01 |
| MT-65 | BLOCKED | RQ-13-01 |
| MT-66 | BLOCKED | RQ-13-01 |
| MT-67 | CAN RUN NOW | – |
| MT-68 | CAN RUN NOW | – |
| MT-69 | BLOCKED | RQ-18-01 |
| MT-70 | BLOCKED | RQ-13-01 |
| MT-71 | CAN RUN NOW | – |
| MT-72 | BLOCKED | RQ-18-01 |

## Detaillierte Anleitungen aus Audit Part 19

## MT-67

Test ID: TEST-IPAD-SECTION-001

Sprint: 26

Requirement: Dashboards ohne und mit mehreren Sections auf dem Legacy-Zielgerät
ohne Überlappung, Koordinatenverlust, horizontales Scrollen oder
Footer-/Background-/Focus-Regression darstellen.

Device/System: iPad mini 1 mit iOS 9.3.5 im HomeScreen-Modus; aktueller
isolierter Standalone- oder HA-App-Testkandidat.

Preconditions:

- Kandidatencommit und Deploymentmodus sind notiert;
- ein Dashboard ohne Sections sowie ein Custom-Dashboard mit zwei benannten
  Sections und mindestens einer unassigned Karte sind vorbereitet;
- beide Sections enthalten je Sensor, Light oder Climate mit teilweise gleichen
  lokalen `x/y`-Koordinaten;
- ein Sectiontitel ist sichtbar, der andere verborgen; Dashboardbackground,
  Footer, Summary/Errors und eine Focus-fähige Karte sind vorhanden;
- keine privaten Entitynamen oder Tokens werden als Evidenz erfasst.

Exact route/page: `http://<TEST-IP>:3000/`, `/d/<section-dashboard-id>`,
`/system/summary` und `/system/errors`.

Exact dashboard/section/card: Dashboard `section-audit`; Sections
`section-ground`/`section-upper`; unassigned Sensor; Climate für Focus.

Entity state/capabilities: read-only Sensor plus ausdrücklich autorisiertes
Test-Light/Climate; Climate verfügbar mit Target-Capability.

Card size/orientation: mindestens Compact, Wide und Large; Portrait,
Landscape und Portrait→Landscape→Portrait.

### Steps

1. Starte das sectionslose Dashboard im Hochformat und notiere Kartenposition,
   Hintergrund und Footer; prüfe, dass kein leerer Sectionheader erscheint.
2. Öffne `/d/section-audit` und prüfe die vertikale Reihenfolge beider Sections,
   den sichtbaren/verborgenen Titel sowie alle Karten.
3. Verifiziere, dass identische lokale Koordinaten in verschiedenen Sections
   keine Überlappung erzeugen und jede Karte innerhalb ihres Rasters bleibt.
4. Prüfe die unassigned Karte im eindeutig erkennbaren Fallbackbereich.
5. Scrolle vom ersten bis zum letzten Abschnitt; prüfe Seitenbreite,
   Hintergrundkontinuität und Footerposition.
6. Öffne Focus aus beiden Sections nacheinander und schließe ihn per Control,
   Außenfläche und Zurücknavigation; prüfe unveränderte Gridgeometrie.
7. Drehe Portrait→Landscape→Portrait und wiederhole Schritte 2 bis 6.
8. Lade die Seite neu und wiederhole Sectionreihenfolge, Titel und unassigned
   Karte.
9. Öffne Summary und Errors und kehre jeweils zum exakten Section-Dashboard
   zurück.

### Expected Visual Result

- Sections stehen vertikal; jedes interne Grid ist separat und überlappt nicht.
- Verborgene Sectiontitel hinterlassen keinen unnötigen Titelabstand.
- Keine horizontale Scrollbar, Backgroundlücke oder Footerverlagerung.
- Focus bleibt zentriert und verändert keine Sectionkoordinaten.

### Expected Functional Result

- Alle Karten einschließlich unassigned bleiben sichtbar und erhalten ihre
  Position nach Rotation, Reload und Systemseiten-Rückkehr.
- Autorisierte Controls funktionieren, ohne Sectionwechsel auszulösen.

### Fail If

- eine Karte fehlt, überlappt oder in eine andere Section wandert;
- gleiche lokale Koordinaten kollidieren über Sectiongrenzen;
- Titel, Footer, Background, Focus oder Returnziel brechen;
- horizontales Scrollen oder eine leere Lücke entsteht.

### Evidence

- Fotos von sectionslosem Dashboard und beiden Sections in Portrait/Landscape;
- Foto der unassigned Karte, des Focus und des Footers;
- Kandidatencommit, Route und Ergebnis je Schritt, ohne private Daten.

### Result

NOT TESTED

## Detaillierte Anleitungen für MT-01 bis MT-10 (Konsistenzkorrektur Part 19)

Die Kurzzeilen MT-01 bis MT-10 besaßen vor dem finalen Baseline-Abgleich noch
keine vollständigen Einzelanleitungen. Die folgenden Einträge vervollständigen
nur die Testdokumentation; kein Ergebnis wurde ausgeführt oder auf `PASS`
gesetzt.

## MT-01

Test ID: TEST-IPAD-BASELINE-01

Sprint: 12

Requirement: Climate-Controls, kompakte Kartengeometrie, Theme und
Fehler-/Refreshverhalten auf der Legacy-Zielhardware.

Device/System: iPad mini 1, iOS 9.3.5, Safari und HomeScreen; isolierter
Dashboard-Testkandidat.

Preconditions: Testdashboard mit langem Sensorwert, Binary, autorisiertem Light
und Climate; Climate verfügbar mit Min/Max/Step und kontrolliert auslösbarem
Backendfehler; Kandidatencommit notiert.

Exact route/page: `http://<TEST-IP>:3000/` und `/d/default`.

Exact test data/card: Compact Sensor/Binary/Light/Climate, lange Namen/Units,
Climate active/off/unavailable.

### Steps

1. Öffne `/` in Safari im Hochformat und danach über das HomeScreen-Icon.
2. Prüfe alle Compact Cards in Light und Dark auf lesbare Identität/Werte.
3. Betätige Climate Minus und Plus einzeln, dann rasch nacheinander; beobachte
   Busy/Disabled und den bestätigten Sollwert.
4. Löse den vorbereiteten Backendfehler aus und prüfe Meldung sowie Rollback.
5. Setze Climate unavailable und prüfe deaktivierte Controls.
6. Drehe ins Querformat und zurück; wiederhole Minus/Plus und Light Power.
7. Warte mindestens zwei Refreshintervalle und prüfe, dass kein alter Zustand
   einen neu bestätigten Sollwert überschreibt.

### Expected Result

- Visual: keine Überlappung/Clipping/horizontale Scrollbar; Controls zentriert
  und ungefähr mindestens 44 px; Theme konsistent.
- Functional: genau ein Request je Tap, Busy verhindert Doppelaktion, Fehler
  stellt bestätigten Wert her, unavailable bleibt disabled.

### Fail If

- Wert/Unit/Control verlässt die Karte, Sollwert springt zurück, doppelter
  Request entsteht, Fehler bleibt optimistisch stehen oder HomeScreen verlässt
  den Kontext.

### Evidence

- Fotos Portrait/Landscape und Light/Dark; anonymisierte Sollwert-/Fehlertabelle;
  Kandidatencommit und iOS-Version, keine Tokens/private Namen.

### Result

NOT TESTED

## MT-02

Test ID: TEST-IPAD-MULTI-DASHBOARD-01

Sprint: 13

Requirement: Default-/Custom-Routing, Darstellung, Refresh und HomeScreen-
Kontext auf iOS 9.

Device/System: iPad mini 1, iOS 9.3.5, HomeScreen; isolierter Kandidat.

Preconditions: Default-Dashboard und Custom-Dashboard `esszimmer` mit
unterschiedlichen Titeln/Karten; direkte LAN-Origin; Light/Dark verfügbar.

Exact route/page: `http://<TEST-IP>:3000/`, `/d/default`, `/d/esszimmer`.

Exact test data/card: mindestens Sensor, Binary, Light und Climate auf beide
Dashboards verteilt; Zustandsänderung im Test-HA möglich.

### Steps

1. Starte `/` vom HomeScreen und notiere aufgelöste Dashboard-ID/Titel.
2. Öffne `/d/default` und vergleiche Inhalt mit `/`.
3. Öffne `/d/esszimmer`; prüfe ausschließlich dessen konfigurierte Karten.
4. Ändere einen Mockzustand und warte auf Auto-Refresh auf beiden Routen.
5. Schalte Theme, lade jede Route neu und prüfe Persistenz.
6. Drehe auf jeder Route Portrait/Landscape; prüfe Header, Uhr/Datum und Status.
7. Navigiere zwischen Routen und prüfe, dass keine Safari-UI/neues Fenster
   erscheint.

### Expected Result

- Visual: korrekter Titel/Inhalt je Route, responsiv ohne Überlauf; Metadaten
  dezent und Theme stabil.
- Functional: `/` und `/d/default` zeigen Default, Custom bleibt getrennt,
  Refresh aktualisiert Zustände im selben HomeScreen-Kontext.

### Fail If

- falsches Dashboard/Title, vermischte Karten, HTTP-Fehler, fehlender Refresh,
  Themeverlust oder normales Safari/neuer Tab erscheint.

### Evidence

- Fotos aller drei Routen in beiden Orientierungen; Zeit-/State-Protokoll und
  Kandidatencommit ohne interne/private Details.

### Result

NOT TESTED

## MT-03

Test ID: TEST-HA-RUNTIME-MULTI-DASHBOARD-WRITE-01

Sprint: 13

Requirement: Multi-Dashboard-Sichtbarkeit bleibt von expliziter
serverseitiger Light-/Climate-Autorisierung getrennt.

Device/System: macOS Safari plus kontrolliertes Test-Home-Assistant und
isolierter Standalone-Kandidat.

Preconditions: dieselben autorisierten Light-/Climate-Entities erscheinen im
Default- und Custom-Dashboard; je eine sichtbare nicht autorisierte Entity;
Fake-/Testcredentials, keine Produktion.

Exact route/page: `/`, `/d/esszimmer`, `/api/status`; Controls nur über UI.

Exact test data/card: autorisiertes Light/Climate und nicht autorisierte
Light/Climate, jeweils verfügbar.

### Steps

1. Notiere Grants serverseitig und öffne Default-Dashboard.
2. Schalte autorisiertes Light und ändere Climate-Target; bestätige im Test-HA.
3. Wiederhole dieselben Entities im Custom-Dashboard.
4. Prüfe nicht autorisierte sichtbare Karten: kein bedienbares Control.
5. Sende über lokale Testfixture einen engen Request für die nicht autorisierte
   Entity und prüfe serverseitige Ablehnung ohne HA-Service.
6. Entferne eine Entity nur aus einem Dashboard und prüfe, dass dies keine
   Rechteänderung der verbleibenden expliziten Konfiguration vortäuscht.

### Expected Result

- Visual: Controls sind auf beiden Dashboards konsistent; unauthorized disabled.
- Functional: autorisierte Writes funktionieren routenunabhängig; Sichtbarkeit
  erzeugt nie Write-Recht; Backend bleibt maßgeblich.

### Fail If

- Entity funktioniert nur auf einer Route/Test-ID, unauthorized erreicht HA,
  Dashboardwechsel ändert Grant oder Browser kann Domain/Service bestimmen.

### Evidence

- anonymisierte Grant-/Route-/Aktionstabelle und redigiertes HA-Serviceprotokoll;
  keine Tokens.

### Result

NOT TESTED

## MT-04

Test ID: TEST-ADMIN-CONFIG-01

Sprint: 15, 16

Requirement: Geschützte Admin UI, Dashboard-/Widget-Editor, Preview,
Save/Discard und Größenwahl im aktuellen Safari.

Device/System: aktuelle macOS-Safari-Version; isolierter Kandidat mit
kontrolliertem Entityinventar.

Preconditions: Admin API aktiv, separater Testtoken, mindestens zwei
Dashboards/mehrere Entitydomains; letzte gültige Config/Backup vorhanden.

Exact route/page: `http://<TEST-IP>:3000/admin`, Previewroute innerhalb Admin,
`/d/<test-dashboard>`.

Exact test data/card: Sensor/Binary/Light/Climate; Größen compact/normal/wide/
tall/large; lange Namen; authorized und read-only Karten.

### Steps

1. Öffne `/admin` ohne Token, mit falschem Token und mit gültigem Testtoken.
2. Erstelle, benenne, dupliziere und lösche ein Testdashboard; setze Default.
3. Suche/filtere Entityinventar und füge alle vier Kartentypen hinzu.
4. Ändere Sichtbarkeit, Reihenfolge und jede Größe; vergleiche Live Preview.
5. Verwirf Änderungen und prüfe unveränderte Runtime.
6. Wiederhole, speichere, lade Admin/Runtime neu und vergleiche.
7. Provoziere kontrollierten Savefehler; prüfe Meldung, Draft und letzte Config.
8. Prüfe Tastaturfokus, Labels, Kontrast und Logout/erneute Authentifizierung.

### Expected Result

- Visual: Editor/Preview ohne abgeschnittene Controls, klare Fehler/Fokuszustände.
- Functional: Auth schützt Admin; CRUD/Größen/Save/Discard/Reload sind konsistent;
  Fehler zerstört keine Config.

### Fail If

- Admin ohne Token erreichbar, Secret im URL/Log, Preview weicht nach Save von
  Runtime ab, Discard speichert oder Fehler überschreibt letzte gültige Config.

### Evidence

- anonymisierte Screenshots der Editorzustände; CRUD-/Save-Ergebnistabelle;
  keine Tokenwerte oder privaten Entities.

### Result

NOT TESTED

## MT-05

Test ID: TEST-IPAD-ADMIN-WALL-REGRESSION-01

Sprint: 15

Requirement: Im modernen Admin gespeicherte Konfiguration rendert und steuert
auf dem Legacy-iPad korrekt.

Device/System: macOS Safari für Admin; iPad mini 1/iOS 9.3.5 HomeScreen;
isolierter Kandidat/Test-HA.

Preconditions: MT-04-Testdashboard gespeichert; autorisiertes Light/Climate;
Admincredential verbleibt ausschließlich am Mac.

Exact route/page: Mac `/admin`; iPad `/` und `/d/<custom-dashboard>`.

Exact test data/card: geänderte Reihenfolge/Sichtbarkeit/Größe für Sensor,
Binary, Light und Climate; lange Werte.

### Steps

1. Speichere am Mac eine eindeutig erkennbare Konfigurationsänderung.
2. Öffne Default und Custom am iPad neu; vergleiche Karten/Order/Visibility.
3. Warte zwei Refreshintervalle und prüfe aktuelle Zustände.
4. Schalte Light und ändere Climate-Target auf beiden vorgesehenen Routen.
5. Prüfe Light/Dark sowie Portrait/Landscape.
6. Verifiziere, dass `/admin` nicht automatisch authentifiziert ist und kein
   Adminsecret auf dem iPad gespeichert wurde.

### Expected Result

- Visual: gespeicherte Konfiguration erscheint vollständig ohne Überlauf.
- Functional: Refresh/Controls funktionieren nur für Grants; Adminschutz bleibt.

### Fail If

- alte/teilweise Config durch Cache, Controls verlieren Funktion, Theme/Layout
  bricht oder Admincredential gelangt aufs iPad.

### Evidence

- Mac-Preview und iPad-Runtime-Fotos derselben anonymisierten Config;
  State-/Controlprotokoll.

### Result

NOT TESTED

## MT-06

Test ID: TEST-IPAD-TILE-SIZES-01

Sprint: 16

Requirement: Alle Größenpresets mit aktuellem Layoutmodell auf iPad mini
visuell und funktional prüfen.

Device/System: iPad mini 1, iOS 9.3.5, Safari/HomeScreen; isolierter Kandidat.

Preconditions: Matrixdashboard mit Sensor/Binary/Light/Climate in compact,
normal, wide, tall, large; lange Namen/Werte/Units; autorisierte Controls.

Exact route/page: `/d/size-audit`.

Exact test data/card: pro Typ alle fünf Presets, on/off/unknown/unavailable;
Climate mit Ist/Soll/HVAC.

### Steps

1. Öffne Matrix in Portrait und prüfe jede Karte auf Boundaries/Umbruch.
2. Betätige Light und Climate Minus/Plus/Power in jeder sinnvollen Größe.
3. Öffne Climate Focus aus kleinster und größter Karte.
4. Schalte Light/Dark und vergleiche Kontrast/Status.
5. Drehe Landscape und wiederhole Schritte 1 bis 4.
6. Lade neu und prüfe unveränderte Größen/Kartenreihenfolge.

### Expected Result

- Visual: kein Overlap/Clipping/Horizontal-Scroll; bewusste Inhalte je Größe,
  kompakter Header, zentrierte ca. 44-px-Controls.
- Functional: Controls/Focus bleiben unabhängig von Größe nutzbar.

### Fail If

- Preset streckt nur leere Card, versteckt Pflichtinhalt, überlappt oder macht
  Controls unbedienbar; Rotation/Reload verändert Größe.

### Evidence

- Fotos aller Presets in beiden Orientierungen/Themes; Ergebnismatrix je Typ.

### Result

NOT TESTED

## MT-07

Test ID: TEST-LXC-SIZE-PERSISTENCE-01

Sprint: 16

Requirement: Größenpersistenz und letzte gültige Konfiguration über realen
Standalone-Dienstneustart.

Device/System: isolierter Standalone-LXC `ha-legacy-dashboard` mit systemd.

Preconditions: aktueller Commit ausgerollt; Testdashboard/Backup; Restartrecht;
Fake-/Test-HA, keine Produktion.

Exact route/page: `/admin`, `/d/size-persistence`, `/health`.

Exact test data/card: zwei Widgets mit unterschiedlichen Größen in beiden
Layoutprofilen.

### Steps

1. Notiere Ausgangsgrößen und Config-/Backuphashes.
2. Ändere beide Größen im Admin, speichere und lade Runtime neu.
3. Starte den Dienst kontrolliert neu und prüfe `/health`.
4. Lade Admin/Runtime erneut und vergleiche Größen/Profile.
5. Provoziere einen ungültigen Größenwert über isolierte Configfixture; prüfe
   kontrollierte Ablehnung ohne Ersetzen der letzten gültigen Config.

### Expected Result

- Visual: Größen vor/nach Restart identisch.
- Functional: atomare Persistenz/Backup bleiben gültig; Invalid wird abgewiesen.

### Fail If

- Größe geht verloren, doppelt skaliert, Backup beschädigt oder Dienst lädt
  ungültige Config.

### Evidence

- Vorher-/Nachher-Screenshots, Hash-/Dienststatus ohne Configinhalt/Secrets.

### Result

NOT TESTED

## MT-08

Test ID: TEST-ADMIN-GRID-POINTER-01

Sprint: 17, 17.1

Requirement: Pointer-/Maus-Drag, Resize, Snapping, Kollision, Bounds,
Save/Discard und Duplikation im aktuellen Adminraster.

Device/System: aktuelle macOS-Safari-Version und ein weiterer moderner
Pointerbrowser; isolierter Kandidat.

Preconditions: Dashboard mit mindestens vier Karten, freie/gesperrte Zellen,
Portrait-/Landscapeprofil; Admin-Testtoken.

Exact route/page: `/admin` Layouteditor und `/d/grid-pointer`.

Exact test data/card: Sensor, Binary, Light, Climate mit stabilen IDs.

### Steps

1. Wähle Portrait; ziehe jede Karte nacheinander links/rechts/oben/unten und
   vergleiche Zielvorschau sowie Zell-Snapping.
2. Nutze Resize-Handle in beide Achsen; teste Mindestgröße und Bounds.
3. Ziehe auf belegte Zelle und außerhalb des Rasters; prüfe Ablehnung/Fallback.
4. Wiederhole in Landscape.
5. Discard und vergleiche Ausgang; danach Änderungen speichern und reloaden.
6. Dupliziere Dashboard und prüfe neue Widget-IDs bei gleicher Geometrie.
7. Vergleiche Runtime in beiden Profilen.

### Expected Result

- Visual: klare Drag-/Resize-Vorschau, kein Springen/Überlappen.
- Functional: Snapping/Kollision/Bounds deterministisch; Save/Discard korrekt;
  Duplikat mit eindeutigen IDs.

### Fail If

- Pointer bleibt hängen, Karte landet falsch, Collision wird gespeichert,
  Profile überschreiben sich oder IDs werden dupliziert.

### Evidence

- Video/Schrittbilder der Gesten; Koordinaten/IDs vor/nach Save/Discard/Duplikat.

### Result

NOT TESTED

## MT-09

Test ID: TEST-IPAD-GRID-PRESENTATION-01

Sprint: 17, 17.1

Requirement: Grid, Responsive Presentation, Rotation, Focus, Controls und
Systemnavigation auf iPad mini.

Device/System: iPad mini 1, iOS 9.3.5, HomeScreen; isolierter Kandidat.

Preconditions: Default/Custom mit compact/normal/wide/tall/large Sensor,
Binary, Light, Climate; lange Namen/Werte; Background/Footer; Summary/Errors.

Exact route/page: `/`, `/d/<custom>`, `/system/summary`, `/system/errors`.

Exact test data/card: on/off/unknown/unavailable und autorisierte Controls.

### Steps

1. Prüfe Default und Custom im Portrait auf Gridgrenzen/Informationshierarchie.
2. Drehe Landscape→Portrait und prüfe dieselben Karten/Koordinaten.
3. Betätige Light sowie Climate Minus/Plus/Power; prüfe Zentrierung/Touchziel.
4. Öffne Climate Focus, prüfe Ist/Soll/HVAC/Controls und drehe erneut.
5. Schalte Light/Dark und lade neu.
6. Öffne Summary/Errors und kehre zum exakten Dashboard zurück.

### Expected Result

- Visual: kein Overlap/Horizontal-Scroll/Backgroundgap/Footershift; Focus
  unabhängig von Gridgröße; lange Inhalte kontrolliert.
- Functional: Controls und Returnnavigation funktionieren im selben Web-App-
  Kontext; Rotation bewahrt Layout.

### Fail If

- Grid/Fokus komprimiert, Card überlappt, Control linksversetzt/klein, Theme
  oder Returnziel geht verloren.

### Evidence

- Fotos aller Größen und Focus in beiden Orientierungen/Themes; Control-/Return-
  Beobachtung ohne private Daten.

### Result

NOT TESTED

## MT-10

Test ID: TEST-LXC-LAYOUT-PERSISTENCE-01

Sprint: 17, 17.1

Requirement: Persistente Portrait-/Landscape-Koordinaten und Backup über
Standalone-Dienstneustart.

Device/System: isolierter Standalone-LXC mit systemd und aktueller Admin UI.

Preconditions: Testdashboard mit mindestens drei Widgets, gültiges Backup,
Admin-Testtoken; kontrollierter Test-HA.

Exact route/page: `/admin`, `/d/layout-persistence`, `/health`.

Exact test data/card: Sensor/Light/Climate; unterschiedliche Koordinaten und
Größen je Profil.

### Steps

1. Notiere IDs, x/y/w/h beider Profile und Config-/Backuphashes.
2. Verschiebe/vergrößere Widgets in Portrait; speichere.
3. Wiederhole mit anderen Koordinaten in Landscape; speichere.
4. Lade Admin und Runtime in beiden Profilen neu; vergleiche.
5. Starte Dienst kontrolliert neu und prüfe `/health` sowie beide Profile.
6. Prüfe, dass Koordinaten nicht doppelt skaliert und Backup/letzte Config
   gültig sind.
7. Provoziere isoliert eine Kollision/Out-of-bounds-Config und prüfe Ablehnung.

### Expected Result

- Visual: beide Profile behalten ihre unabhängige Geometrie ohne Überlappung.
- Functional: Reload/Restart erhalten Layout; ungültiger Save zerstört nichts.

### Fail If

- Profile überschreiben sich, x/y/w/h ändern nach Restart, Karten kollidieren,
  doppelte Skalierung oder Backupverlust entsteht.

### Evidence

- anonymisierte Koordinatentabelle, Screenshots beider Profile, Hash-/Dienststatus
  ohne Secrets.

### Result

NOT TESTED

## MT-68

Test ID: TEST-ADMIN-SECTION-001

Sprint: 26

Requirement: Section-CRUD, Kartenverschiebung, sichere Löschung und atomare
Persistenz auf der echten Standalone-Laufzeit bestätigen.

Device/System: aktuelle macOS-Safari-Version und isolierter Standalone-LXC mit
systemd; kontrollierter Test-HA-Datenbestand.

Preconditions:

- aktueller Kandidat ist im isolierten LXC ausgerollt, Commit/Datenpfad notiert;
- separater Admin-Testtoken, keine Produktionscredentials;
- Custom-Dashboard mit drei Karten und gültiger Config-Backupdatei;
- Dienstneustart ist im Testfenster erlaubt.

Exact route/page: `http://<TEST-IP>:3000/admin`, `/d/<section-crud-id>`,
`/api/admin/config` nur über den normalen Adminclient.

Exact dashboard/section/card: Dashboard `section-crud`; Karten A/B/C mit
stabilen Widget-IDs; Sections „Erdgeschoss“ und „Obergeschoss“.

Entity state/capabilities: lokale Mockentities reichen; Schreibcontrols sind
für diesen Test nicht erforderlich.

Card size/orientation: Admin Portrait- und Landscape-Profil; Runtime in beiden
Browserbreiten.

### Steps

1. Öffne `/admin`, authentifiziere dich und notiere die drei Widget-IDs.
2. Erstelle „Erdgeschoss“, speichere und prüfe Runtime sowie Reload.
3. Benenne in „EG“ um, schalte `showTitle` aus/ein und speichere jeweils.
4. Erstelle „Obergeschoss“, ändere die Sectionreihenfolge und speichere.
5. Weise Karte A „EG“, B „Obergeschoss“ und C `unassigned` zu; speichere und
   prüfe beide Layoutprofile.
6. Verschiebe B nach „EG“ und A nach „Obergeschoss“; kontrolliere, dass lokale
   Kollisionen sicher neu platziert werden und Widget-IDs gleich bleiben.
7. Lösche „EG“ mit darin befindlicher Karte B. Speichere und prüfe, dass B nun
   unassigned und nicht gelöscht ist.
8. Lade Admin und Runtime neu; vergleiche Section-/Widgetanzahl und IDs.
9. Starte nur den Dashboarddienst kontrolliert neu; prüfe erneut Config,
   Reihenfolge, Titelstatus, Zuordnung und Backupgültigkeit.
10. Erzeuge einen ungültigen Sectionentwurf (z. B. doppelte ID über eine lokale
    Testfixture, nicht durch Browser-Manipulation im Produktivsystem) und prüfe,
    dass Save kontrolliert scheitert und die letzte gültige Config bleibt.

### Expected Visual Result

- Editor und Runtime zeigen dieselben Sections, Reihenfolge und Titelzustände.
- Nach Löschung erscheint Karte B im unassigned Bereich; keine Karte verschwindet.

### Expected Functional Result

- Create/Rename/Reorder/Assign/Move/Delete persistieren atomar.
- Widget-IDs und Kartenanzahl bleiben über Delete, Reload und Restart identisch.
- Ungültige Config ersetzt weder aktive Datei noch Backup.

### Fail If

- Section-Löschung löscht eine Karte;
- Zuordnung/Reihenfolge geht nach Reload/Restart verloren;
- Kartenpositionen werden doppelt skaliert oder kollidieren;
- ungültiges Save beschädigt letzte gültige Config/Backup.

### Evidence

- bereinigte Vorher-/Nachher-Tabelle mit Section-/Widget-IDs und Reihenfolge;
- Screenshots von Admin und Runtime; Hash/Status von Config und Backup ohne Inhalt
  oder Secrets; Dienststatus ohne Tokenwerte.

### Result

NOT TESTED

## MT-69

Test ID: TEST-IPAD-ROOM-001

Sprint: 26.1

Requirement: Native Room Card von Admin-Auto-Setup bis echter iPad-Runtime,
Collapse/Expand, Background, Größen, Alerts und sicheren Controls prüfen.

Device/System: aktuelle macOS-Safari-Version für `/admin`; iPad mini 1 mit
iOS 9.3.5 im HomeScreen-Modus; isolierter aktueller Kandidat.

Preconditions:

- RQ-16-01 und RQ-18-01 sind repariert/re-auditiert;
- Test-HA-Area „Testraum“ mit stabilen Registry-IDs und Entities für Temperatur,
  Humidity, Climate, Presence, zwei Öffnungen, Light, Switch, Cover, Fan, Media,
  Lock, Battery und Safety Alert;
- eine manuell abweichende Entity ist zum Override vorbereitet;
- valides anonymes JPEG/PNG aus kontrollierter Quelle;
- Room Card liegt in einer Sprint-26-Section; Light/Climate explizit autorisiert,
  übrige Domains read-only.

Exact route/page: `http://<TEST-IP>:3000/admin` und
`http://<TEST-IP>:3000/d/room-audit`.

Exact dashboard/section/card: Dashboard `room-audit`, Section `floor-test`,
Room Widget `room-test`.

Entity state/capabilities: Temperatur/Humidity numerisch; Presence on/off;
eine/two open windows; Low Battery; Safety warning/critical; Climate off plus
unterstützter Nicht-Off-Modus und Target; Light on/off; optionale Entity
unavailable/missing.

Card size/orientation: Compact, Standard, Wide, Tall und Large; collapsed und
expanded; Portrait/Landscape/Rotation.

### Steps

1. Wähle „Testraum“ im Admin und löse Auto-Setup ausdrücklich aus; protokolliere
   jede vorgeschlagene Rolle.
2. Ersetze eine vorgeschlagene Entity manuell, speichere und prüfe nach Reload,
   dass Auto-Setup sie nicht still zurücksetzt.
3. Lade Room-Background, prüfe Adminpreview, speichere und öffne die Runtime.
4. Prüfe Collapsed: Raumname, primäre Temperatur, Humidity soweit Tier erlaubt,
   Presence/Openings und wichtigster Alert; optionale fehlende Daten auslassen.
5. Tippe den expliziten Toggle einmal: Details werden sichtbar, ARIA/Symbol
   stimmen; tippe erneut: Details werden verborgen.
6. Bediene im Expanded-Zustand Light sowie Climate Minus/Plus/Power und prüfe,
   dass kein Controltap Collapse auslöst oder doppelt schaltet.
7. Setze je eine optionale Entity unknown, unavailable und missing; lade neu und
   prüfe kontrollierte Darstellung ohne Kartenabbruch.
8. Prüfe ein und mehrere offene Fenster, Low Battery und Safety Alert; vergleiche
   Severity mit dem Error Dashboard derselben Momentaufnahme.
9. Prüfe nacheinander alle fünf Größen in Portrait und Landscape, einschließlich
   langem Raumnamen/langem Wert; drehe bei Expanded und offenem Controlstatus.
10. Lade Runtime neu, prüfe Background und Config; entferne danach das Bild im
    Admin und bestätige sicheren Fallback ohne Bild.
11. Entferne die HA Area aus dem kontrollierten Registryfixture, nicht aus einer
    Produktion; prüfe Warnung im Admin und erhaltene manuelle Rollen/Runtime.

### Expected Visual Result

- Preview und Runtime zeigen denselben Background hinter lesbarem Inhalt ohne
  Touchinterception.
- Jede Größe hat eine bewusste Informationshierarchie; keine Überläufe,
  abgeschnittenen Controls oder horizontale Scrollbar.
- Alerts stimmen visuell mit zentraler Severity überein.

### Expected Functional Result

- Auto-Setup ist Vorschlag, manuelle Overrides bleiben erhalten.
- Collapse/Expand reagiert genau einmal; Controls toggeln die Card nicht.
- Nur ausdrücklich autorisierte Light-/Climate-Controls schreiben; alle anderen
  Rollen bleiben read-only.
- Missing Area/Entity/Background bricht die Card nicht.

### Fail If

- Room kann nicht geöffnet/geschlossen werden oder toggelt doppelt;
- ein Controltap verändert Collapse oder eine read-only Domain schreibt;
- Runtimebackground fehlt trotz Preview oder fängt Touch ab;
- Area-Vorschlag überschreibt manuelle Auswahl still;
- Größe/Rotation erzeugt Überlauf, leere große Card oder unbedienbare Controls.

### Evidence

- anonymisierte Admin-/Runtime-Screenshots je Tier und Orientierung;
- Video/Beobachtungsfolge Toggle→Control→Toggle;
- Vorschlags-/Override-Tabelle und Alertvergleich, ohne private IDs/Tokens.

### Result

NOT TESTED

## MT-70

Test ID: TEST-HAOS-ROOM-001

Sprint: 26.1

Requirement: Room-Konfiguration und Backgroundassets unter `/data` über
App-Restart bewahren; Preview/Runtime/Replace/Remove sicher halten.

Device/System: Home Assistant OS Testsystem (amd64 oder aarch64) mit aktuellem
App-Kandidaten; macOS Safari für Admin/Runtime.

Preconditions:

- RQ-16-01 ist repariert/re-auditiert;
- exakter Image-/Manifestdigest, Appversion und Sourcecommit sind notiert;
- separater Admin-Testtoken; keine LLATs oder Supervisor-Tokens im Browser;
- Room Card mit Area, manueller Rolle und bekanntem gültigem Background;
- App-Restart und Einsicht in bereinigte App-Logs sind erlaubt.

Exact route/page: `http://<HA-IP>:3000/admin`, `/d/room-haos`, `/health`.

Exact dashboard/section/card: Custom-Dashboard `room-haos`, Section `test`,
Room `room-haos-card`.

Entity state/capabilities: lokales kontrolliertes Test-HA; Controls sind für
diesen Persistenztest optional.

Card size/orientation: Wide und Large im Desktopbrowser.

### Steps

1. Speichere Room-Konfiguration und Background; notiere anonymisierte IDs und
   Dateihashes unter `/data`, ohne Inhalte/Tokens zu exportieren.
2. Vergleiche Adminpreview und Runtime in Wide/Large und lade beide neu.
3. Starte nur die HA Legacy Dashboard App kontrolliert neu; prüfe `/health`,
   Admin und Runtime.
4. Verifiziere Configfelder, manuelle Override-Rolle, Sectionzuordnung,
   Background-ID/-hash und Dateirechte.
5. Ersetze das Background durch ein zweites valides Bild; prüfe, dass erst nach
   erfolgreichem Configsave das alte unreferenzierte Asset entfernt wird.
6. Simuliere einen validierten Uploadfehler; prüfe, dass Bild 2, Config und Hash
   erhalten bleiben und keine Temp-/Waisendatei entsteht.
7. Entferne den Room-Background regulär; prüfe Preview/Runtime ohne Bild und
   kontrollierte Entfernung nur wenn keine andere Referenz existiert.
8. Starte die App erneut und prüfe den bildlosen, weiterhin funktionsfähigen
   Room sowie secretfreie Logs.

### Expected Visual Result

- Preview und Runtime sind vor/nach Restart identisch.
- Nach Fehler bleibt das letzte gültige Bild; nach Remove rendert die Card ohne
  Lücke oder kaputtes Bildsymbol.

### Expected Functional Result

- Config und Assets liegen persistent unter `/data`; atomarer Replace/Rollback
  und Referenzschutz funktionieren.
- Logs/Browser enthalten weder HA-, Supervisor- noch Admin-Token.

### Fail If

- Restart verliert Room, Section, Override oder Background;
- Fehler ersetzt/löscht letztes gültiges Asset oder hinterlässt Teil-/Waisenfile;
- Remove löscht ein noch anderweitig referenziertes Asset;
- ganzer `/data`-Inhalt oder ein Secret wird öffentlich erreichbar/logged.

### Evidence

- Commit/Image/Appversion, redigierte Health-/Logausgabe;
- Config-/Asset-Hashes und Rechte vor/nach Restart/Replace/Failure/Remove;
- anonymisierte Preview-/Runtime-Screenshots.

### Result

NOT TESTED

## MT-71

Test ID: TEST-HA-RUNTIME-CONTROL-001

Sprint: 26.2

Requirement: Zentrale Autorisierung und echte Light-/Climate-Capabilities mit
mehreren Integrationen serverseitig und im Desktopbrowser verifizieren.

Device/System: aktuelle macOS-Safari-Version, isolierter Standalone-Kandidat
und ausdrücklich kontrolliertes Test-Home-Assistant.

Preconditions:

- Kandidatencommit/HA-Version/Integrationen notiert; keine Produktions-HA;
- drei Lights: historisches Test-Light, zweite und dritte unterschiedliche
  Entity/Integration; mindestens eine unavailable und eine sichtbare aber nicht
  autorisierte Light-Entity;
- Climates: historisches Thermostat, `off+heat`, `off+auto`, `off+heat+auto`,
  ohne `off`, unavailable; reale min/max/step dokumentiert;
- nur vorgesehene Testentities besitzen explizite Grants; bevorzugter Modus ist
  einmal gültig und kontrolliert einmal stale/unsupported;
- ein HA-Servicefehler kann im Test kontrolliert ausgelöst werden.

Exact route/page: `/admin`, `/d/control-audit`, `/api/status`; enge
Controlendpunkte ausschließlich über die UI.

Exact dashboard/section/card: Gridcards aller Entities plus Room Card mit
zweitem Light und zweitem Climate; eine Section; Focus-fähige Gridcards.

Entity state/capabilities: wie oben; Targettests active/off, exaktes Minimum,
Maximum, gültiger Step, below/above/invalid und Backendfailure.

Card size/orientation: Standard/Wide/Large im Desktopbrowser.

### Steps

1. Prüfe im Admin die Grants; ändere nur ausdrücklich vorgesehene Testentities
   und speichere. Verifiziere, dass Sichtbarkeit allein keinen Grant setzt.
2. Schalte jedes der drei autorisierten Lights Off→On und On→Off; prüfe State
   nach HA-Bestätigung.
3. Prüfe unavailable, nicht autorisiertes, falsche Domain und unbekannte Entity
   über kontrollierte Testfälle: UI disabled/kein Control und serverseitige
   Ablehnung ohne HA-Service.
4. Prüfe Climate `off+heat`, `off+auto` und `off+heat+auto`: Power erscheint und
   sendet jeweils einen tatsächlich unterstützten Nicht-Off-Modus.
5. Prüfe Last-known, gültige Preference und deterministic Fallback nacheinander;
   stale/unsupported Preference darf nie gesendet werden.
6. Prüfe Climate ohne `off`, unavailable und unauthorized: kein Fake-Power bzw.
   serverseitige Ablehnung.
7. Ändere Target im aktiven Zustand um einen gültigen Step und bestätige HA-
   Zustand.
8. Schalte Climate aus, ändere Target um einen gültigen Step und prüfe im HA-
   Zustand/Serviceprotokoll, dass kein Power-/HVAC-Aufruf erfolgte und State
   `off` bleibt.
9. Setze exakt Minimum und Maximum; versuche below, above und einen ungültigen
   Step sowie nicht numerische Eingabe über kontrollierte API-Testfixture.
10. Löse einen HA-Servicefehler im aktiven und Off-State aus; prüfe sicheren
    Fehler, Rollback auf bestätigten Targetwert und keinen Auto-Power.
11. Wiederhole repräsentative Light-/Climatefälle in Grid, Focus und Room und
    vergleiche Capability/Disabled-Entscheidungen.
12. Prüfe bereinigte Backendlogs auf feste Domain/Services, Ablehnungen und
    Abwesenheit aller Tokens/Payloadsecrets.

### Expected Visual Result

- Alle Oberflächen zeigen dieselbe capabilityabhängige Controlmenge.
- No-off/unavailable/unauthorized erhalten keinen irreführenden Powerbutton;
  Fehler stellen den bestätigten Targetwert wieder her.

### Expected Functional Result

- Mehrere IDs funktionieren unabhängig vom historischen Testentitynamen.
- Backend bleibt autoritativ und ruft nur `light.turn_on/off`,
  `climate.set_hvac_mode` oder `climate.set_temperature` mit validierten Daten.
- Targetänderung in `off` lässt Climate aus.

### Fail If

- nur historische Test-IDs funktionieren;
- UI-Sichtbarkeit erteilt Write-Rechte oder Browser kann Domain/Service wählen;
- `heat` wird gesendet, obwohl nicht unterstützt, oder no-off zeigt Power;
- Off-State-Target schaltet ein;
- Range/Step/invalid/unauthorized erreicht HA oder Fehler lässt falschen
  optimistischen Zustand stehen.

### Evidence

- anonymisierte Matrix Entity→Modes/Range/Grant→UI/API/HA-Ergebnis;
- redigiertes HA-Serviceprotokoll und Backendlog ohne Tokens;
- Screenshots Grid/Focus/Room vor/nach repräsentativen Aktionen.

### Result

NOT TESTED

## MT-72

Test ID: TEST-IPAD-CONTROL-001

Sprint: 26.2

Requirement: Gemeinsame Light-/Climate-Controlentscheidung und Touchverhalten
in Grid, Focus und Room auf dem iPad mini bestätigen.

Device/System: iPad mini 1, iOS 9.3.5, HomeScreen; aktueller isolierter
Standalone- oder HA-App-Kandidat mit kontrolliertem Test-HA.

Preconditions:

- MT-71-Datenbestand oder äquivalent: mindestens zwei autorisierte
  unterschiedliche Lights und zwei autorisierte Climates (`off+heat` und
  `off+auto`), plus no-off/unavailable/unauthorized Fälle;
- Gridcards und eine Room Card enthalten dieselben Testentities;
- Climategrenzen/Step sind dokumentiert; HomeScreen-Icon frisch für Kandidat;
- keine Admincredentials auf dem iPad.

Exact route/page: `http://<TEST-IP>:3000/d/control-audit` im HomeScreen;
Focus durch Tap auf jeweilige Gridcard.

Exact dashboard/section/card: Section `controls`; Grid Light 1/2, Grid Climate
1/2, Room `controls-room` mit Light 2/Climate 2.

Entity state/capabilities: beide Lights on/off; beide Climates active/off mit
Target; ein Climate ohne off; unavailable und unauthorized Vergleichskarten.

Card size/orientation: Standard und Large; Portrait/Landscape und Rotation bei
offenem Focus/expanded Room.

### Steps

1. Starte im Hochformat; prüfe Touchziele, Zentrierung und Disabledzustände
   aller Gridcontrols.
2. Schalte Light 1 und Light 2 jeweils Off→On→Off in Grid; warte auf bestätigten
   Zustand und prüfe Busy/Fehlerzustand.
3. Öffne beide Lights nacheinander in Focus und wiederhole; prüfe, dass nur das
   Control schaltet und Focus offen bleibt.
4. Expandiere Room, schalte Light 2 und prüfe, dass Room nicht collapsiert.
5. Prüfe beide Climates in Grid: Power Off→On wählt den jeweiligen echten Modus;
   On→Off funktioniert.
6. Lasse beide Climates aus und ändere Target per Minus/Plus; prüfe am sichtbaren
   State und über MT-71-Evidenz, dass sie aus bleiben.
7. Wiederhole Power und Target in Focus sowie Expanded Room; kein Controltap
   darf Focus schließen oder Room toggeln.
8. Prüfe no-off, unavailable und unauthorized: keine falsche bedienbare
   Oberfläche; UI darf nicht allein Autorisierung behaupten.
9. Drehe mit offenem Climate-Focus und expanded Room ins Querformat und zurück;
   wiederhole je einen Light- und Targettap.
10. Simuliere den vorbereiteten Backendfehler; prüfe lesbare generische Meldung,
    Rollback und weiter bedienbare übrige Karten.

### Expected Visual Result

- Power und Minus/Plus sind in Grid, Focus und Room zentriert, nicht geclippt
  und ungefähr mindestens 44×44 px.
- Busy/Disabled/Fehlerzustände sind konsistent; Rotation komprimiert keine Card.

### Expected Functional Result

- Beide Light- und Climate-IDs funktionieren auf allen vorgesehenen Flächen.
- Target in `off` verändert nur den Sollwert; Room/Focus bleiben offen.
- No-off/unavailable/unauthorized bleiben sicher nicht bedienbar.

### Fail If

- nur eine historische Entity funktioniert oder Buttons linksversetzt/unbrauchbar
  sind;
- ein Controltap toggelt Room, schließt Focus oder löst doppelt aus;
- Off-State-Target schaltet Climate ein;
- eine Oberfläche widerspricht der zentralen Capability/Authorization;
- Rotation/Fehler lässt Controls oder Karten in falschem Zustand.

### Evidence

- Fotos/kurzes Video Grid→Focus→Room in beiden Orientierungen;
- anonymisierte Ergebnistabelle pro Entity/Oberfläche/Aktion;
- keine privaten Entitynamen, IPs, Tokens oder Admincredentials aufnehmen.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 18

## MT-61

Test ID: TEST-HAOS-NETWORK-01

Sprint: 25.5

Requirement: Aktuellen direkten LAN-Zugriff getrennt nach IP, Hostname, mDNS,
IPv4, IPv6, Bind-Adresse, Protokoll und Port klassifizieren, ohne einen
Netzwerkfehler als Appfehler zu behandeln.

Device: Mac im selben LAN sowie iPad mini 1.

iOS: 9.3.5 auf dem iPad mini.

Preconditions:

- ein ausdrücklich als Testkandidat dokumentierter aktueller HA-App-Build ist
  auf HAOS installiert und gestartet;
- der Kandidatencommit, die Appversion und die HAOS-Version sind notiert;
- Port 3000 ist in der App-Metadatei gemappt;
- keine produktiven Tokens werden in Screenshots oder Notizen aufgenommen;
- IP-Adresse und optionaler lokaler DNS-/mDNS-Name des Testhosts sind bekannt.

Exact dashboard URL:

- `http://<HA-IP>:3000/`
- `http://<HA-IP>:3000/health`
- `http://<lokaler-hostname>:3000/`
- nur falls im Netz vorhanden: `http://<hostname>.local:3000/`

Deployment mode: Home Assistant App auf Test-HAOS, direkter gemappter LAN-Port;
kein Ingress.

Exact device settings required: Mac und iPad im selben WLAN/LAN; keine VPN-
oder Private-Relay-Umleitung; iPad-Safari zunächst normal, noch nicht Guided
Access.

### Steps

1. Notiere Kandidatencommit, Appversion, HAOS-Version, Host-IP und verwendeten
   Hostnamen, ohne interne Daten öffentlich zu teilen.
2. Prüfe auf dem Mac die A- und AAAA-Auflösung des Hostnamens und protokolliere
   getrennt IPv4- und IPv6-Ergebnis.
3. Rufe am Mac `http://<HA-IP>:3000/health` und anschließend `/` auf.
4. Rufe dieselben Pfade mit dem lokalen DNS-Namen und, falls eingerichtet, mit
   `.local` auf; notiere für jeden Versuch aufgelöste Adresse, Protokoll und
   Port.
5. Erzwinge am Mac getrennt IPv4 und IPv6 für Hostname:3000 und vergleiche mit
   Hostname:8123. Ändere keine Apprechte, wenn nur einer der Netzpfade fehlt.
6. Öffne am iPad zuerst die IP-URL und danach den Hostnamen jeweils in Safari.
7. Verifiziere, dass die IP-URL weiterhin Dashboard, Summary und Errors laden
   kann; melde getrennt, ob ausschließlich Hostname/mDNS oder IPv6 scheitert.
8. Prüfe die App-Info: Bind-Adresse `0.0.0.0`, Portmapping 3000 und WebUI-Port;
   vergleiche diese Daten mit dem beobachteten Netzpfad.

### Expected Visual Result

- Die funktionierende URL zeigt dasselbe Dashboard ohne Ingress-Chrome.
- Ein nicht funktionierender Hostname zeigt keinen anderen Dashboardstand und
  wird nicht durch eine UI-Sonderlösung kaschiert.

### Expected Functional Result

- `http://<HA-IP>:3000/health` antwortet und die IP-basierte LAN-Nutzung bleibt
  möglich.
- A/AAAA/mDNS und IPv4/IPv6 lassen sich eindeutig einem funktionierenden oder
  fehlenden Pfad zuordnen.
- Wenn IP:3000 funktioniert, aber Hostname nur auf eine nicht erreichbare
  Adresse auflöst, lautet die Klassifikation Netzwerk/mDNS/Dual-Stack, nicht
  Appberechtigung.

### Fail If

- IP:3000 ist trotz laufender App nicht erreichbar;
- der Container lauscht nur auf Loopback oder Port 3000 ist nicht gemappt;
- die Dokumentation führt zur falschen Origin, zum falschen Protokoll/Port
  oder erzwingt Ingress;
- zur Umgehung werden host_network, privileged oder breite Apprechte benötigt.

### Evidence

- datierte Tabelle mit Kandidatencommit, URL, A/AAAA, gewählter IP-Familie,
  HTTP-Ergebnis und Client;
- Screenshot/Foto des funktionierenden iPad-Dashboards ohne private Entitynamen;
- bereinigter Auszug aus App-Port-/WebUI-Konfiguration, niemals Tokens.

### Result

NOT TESTED

## MT-62

Test ID: TEST-BACKGROUND-UPLOAD-01

Sprint: 25.3, 25.5

Requirement: Reale JPEG-Varianten akzeptieren, getarnte/defekte/übergroße
Dateien sicher ablehnen, das letzte gültige Background bewahren und Assets
unter `/data` über Restart erhalten.

Device: Mac mit aktueller Safari-Version für `/admin`, Test-HAOS-App und iPad
mini 1.

iOS: 9.3.5 auf dem Anzeige-iPad.

Preconditions:

- RQ-16-01 ist repariert und re-auditiert;
- aktueller Testkandidat auf HAOS, separater Admin-Testtoken;
- Testdashboard ohne private Namen;
- Fixtures: Baseline JPEG, Progressive JPEG, JFIF/APP0, EXIF/APP1 mit
  Orientation, ICC/APP2, EXIF mit Thumbnail, JPEG ohne EXIF, je `.jpg` und
  `.jpeg`, valides PNG;
- Negativfixtures: truncated/malformed JPEG, HTML als JPG, SVG als JPG, PNG
  ohne IDAT, PNG mit falscher CRC, übergroße Datei und Dateiname mit
  Traversalzeichen.

Exact dashboard URL: `http://<HA-IP>:3000/admin` und
`http://<HA-IP>:3000/d/<test-dashboard-id>`.

Deployment mode: Home Assistant App auf Test-HAOS, Assets unter `/data`.

Exact device settings required: Mac und iPad im selben LAN; Admin nur am Mac;
iPad über direkten LAN-Port im HomeScreen-Modus.

### Steps

1. Setze ein bekanntes gültiges Ausgangsbild und speichere; notiere dessen
   sichtbare Darstellung und Assetreferenz ohne interne Pfade zu veröffentlichen.
2. Lade nacheinander jede positive JPEG-Variante hoch, speichere, öffne das
   reale Dashboard neu und prüfe Position, Cover/Contain, Overlay und
   Orientierung.
3. Wiederhole mindestens einmal mit `.jpg` und einmal mit `.jpeg`.
4. Lade ein valides PNG hoch und prüfe dieselbe Preview-/Runtime-Parität.
5. Stelle das bekannte gültige Ausgangsbild wieder her.
6. Versuche jede Negativfixture einzeln. Verwerfe nach jeder Ablehnung den
   Entwurf beziehungsweise lade die Adminseite neu.
7. Prüfe nach jedem Fehler, dass das Ausgangsbild in Preview und Runtime
   unverändert bleibt und keine neue Assetreferenz gespeichert wurde.
8. Prüfe im App-Datenverzeichnis bereinigt, dass keine Temp-/Teil-/Waisendatei
   entstand und Dateinamen nicht aus dem Uploadnamen übernommen wurden.
9. Starte nur die Test-App kontrolliert neu und prüfe Config, Asset, Preview
   und Runtime erneut.
10. Öffne das Dashboard am iPad im Hoch- und Querformat und prüfe JPEG-
    Darstellung, Rotation und fehlendes horizontales Scrollen.

### Expected Visual Result

- Alle positiven JPEG-Varianten und das valide PNG erscheinen gleich in Admin-
  Preview und realem Dashboard; EXIF-Varianten werden nicht wegen ihrer
  Metadatensegmente abgelehnt.
- Nach jedem Negativupload bleibt das vorherige Bild sichtbar.
- Auf dem iPad entstehen keine Lücke, falsche Orientierung oder Footer-/Focus-
  Überlagerung.

### Expected Functional Result

- Positive Varianten speichern erfolgreich; alle Negativvarianten liefern
  kontrollierte Fehler.
- Kein Fehler verändert persistierte Config oder letztes gültiges Asset.
- Restart bewahrt das Bild unter `/data`.

### Fail If

- ein gültiges Baseline-/Progressive-/JFIF-/EXIF-/ICC-/Thumbnail-JPEG wird
  abgelehnt;
- HTML/SVG/truncated/oversized/path-traversal oder strukturell ungültiges PNG
  wird angenommen;
- ein Fehler entfernt oder ersetzt das gültige Background;
- Teil-/Waisendateien, inkonsistente Config oder Secret-Logs entstehen;
- Preview und Runtime weichen ab oder Restart verliert das Asset.

### Evidence

- bereinigte Ergebnistabelle pro Fixture;
- Preview-/Runtime-Screenshots ohne private Daten;
- Dateiliste vor/nach Negativfällen und Restart, ohne Secrets;
- iPad-Fotos Portrait/Landscape.

### Result

NOT TESTED

## MT-63

Test ID: TEST-IPAD-CARD-MATRIX-01

Sprint: 25.6

Requirement: Alle aktuell unterstützten Kartentypen in jeder gültigen Größe
mit repräsentativen Zuständen, Portrait/Landscape, Controls, Focus,
Background, Theme und HomeScreen physisch verifizieren.

Device: iPad mini 1.

iOS: 9.3.5.

Preconditions:

- RQ-18-01 ist repariert und der Test-Harness meldet lokal PASS;
- aktueller Kandidat auf isolierter LXC- oder HA-App-Testinstanz;
- kontrollierte Card-Matrix mit `sensor`, `binary`, `light`, `climate`, `room`;
- je Profil alle von `src/services/layout.js` erlaubten Breiten und Höhen 1–4;
- Zustände: kurz/lang, negative/dezimale Werte, Units, on/off, unknown,
  unavailable, verschiedene Control-Capabilities; Room collapsed/expanded,
  Alerts und Background;
- ausdrücklich autorisierte Test-Light/-Climate-Entities, keine Produktion.

Exact dashboard URL: `http://<TEST-IP>:3000/d/card-matrix` sowie der nur lokal
bereitgestellte Harness `http://<TEST-IP>:<TEST-PORT>/test/card-matrix-harness.html`.

Deployment mode: isolierte Standalone/LXC- oder HA-App-Testinstanz; direkter
LAN-Port, HomeScreen-Web-App.

Exact device settings required: Auto-Rotation zunächst aktiv; Safari-Zoom 100
Prozent; Test sowohl Light als auch Dark; Guided Access für diese Matrix nicht
erforderlich.

### Steps

1. Starte die Matrix im Hochformat und prüfe den Harnessstatus sowie jede
   gültige Portraitgröße der fünf aktuellen Typen.
2. Prüfe pro Typ kurze und lange Identität, lange Unit/Werte, unknown und
   unavailable auf Overlap, Clipping und horizontales Scrollen.
3. Prüfe Light on/off/unavailable und Climate Heating/Cooling/Off/Unknown/
   Unavailable; zähle sichtbare Controls entsprechend der tatsächlichen
   Capability, nicht pauschal.
4. Prüfe Climate Compact, Standard, Wide, Tall und Large: Ist, Soll, HVAC,
   Minus, Plus, Power, sekundäre Info und mindestens ca. 44×44-px-Touchziele.
5. Prüfe Room in allen gültigen Größen, besonders Tall: collapsed/expanded,
   Background, lange Raumnamen, Alerts und capabilityabhängige Controls.
6. Öffne Focus bei Sensor, Binary, Light und Climate; prüfe, dass Gridgröße die
   Focusgeometrie nicht komprimiert und Schaltflächen zentriert bleiben.
7. Wiederhole Schritte 1–6 im Querformat und drehe bei offenem Dashboard sowie
   offenem Focus Portrait→Landscape→Portrait.
8. Wiederhole repräsentative Compact/Large/Room/Climate-Fälle in Light und Dark.
9. Öffne die Matrix aus dem HomeScreen-Icon, navigiere Summary/Errors und
   zurück; prüfe Background, Footer und unveränderte Kartenkoordinaten.
10. Dokumentiere jeden fehlerhaften Case mit exakter ID, Profil, Größe,
    Zustand und Presentation Tier getrennt.

### Expected Visual Result

- Kein Typ überlappt, clippt oder erzeugt horizontales Scrollen;
- jede Größe hat eine bewusste Presentation, Climate Large nutzt den Raum und
  Room Tall bleibt lesbar;
- Controls und SVG-Inhalte sind optisch zentriert, Touchziele ausreichend;
- Rotation, Theme, Background, Footer und Focus bleiben stabil.

### Expected Functional Result

- Genau die capabilityabhängigen Controls sind vorhanden; keine Duplikate und
  keine Fake-Power-Buttons bei unknown/unavailable;
- autorisierte Light-/Climate-Controls funktionieren, unavailable bleibt
  deaktiviert;
- Room-Controls toggeln nicht versehentlich collapsed/expanded;
- HomeScreen-Navigation bleibt im selben Kontext.

### Fail If

- irgendein gültiger Case überläuft, clippt, fehlt oder die falsche Tierklasse
  nutzt;
- Climate Large wirkt wie eine Kleinkarte im leeren Rechteck;
- Room ist in Tall oder einer anderen gültigen Größe ungetestet/unbrauchbar;
- Controls fehlen trotz Capability, erscheinen ohne Capability, duplizieren
  sich, sind linksversetzt oder kleiner als ca. 44×44 px;
- Rotation zerbricht Grid, Focus, Background oder Footer.

### Evidence

- vollständige Ergebnisdatei/Checkliste mit Case-IDs;
- Fotos der fünf Tiers, Climate Large und Room Tall in beiden Orientierungen;
- Fehlerfoto plus Case-ID und Handlung für jeden FAIL.

### Result

NOT TESTED

## MT-64

Test ID: TEST-IPAD-KIOSK-01

Sprint: 25.7

Requirement: HomeScreen-Start, Guided-Access-Aktivierung, Home-Tasten-Sperre,
Same-Context-Navigation, sichere Rückkehr, Theme und Rotation.

Device: iPad mini 1 mit physischer Home-Taste.

iOS: 9.3.5.

Preconditions:

- aktueller Kandidat über direkte LAN-IP erreichbar;
- Default- und ein Custom-Dashboard vorhanden;
- Summary erreichbar und ein kontrollierter Warning-/Error-Testzustand für den
  Health-Link vorhanden;
- HomeScreen-Icon nach `docs/IPAD_KIOSK.md` neu angelegt;
- Guided Access aktiviert und separater Code gesetzt;
- Touch aktiv, Motion/Rotation für den ersten Durchlauf erlaubt, Home-Taste
  durch die Sitzung eingeschränkt.

Exact dashboard URL: `http://<TEST-IP>:3000/` und
`http://<TEST-IP>:3000/d/<custom-dashboard-id>`.

Deployment mode: aktueller Standalone/LXC- oder HA-App-Testkandidat über
direkten LAN-Port; kein Ingress.

Exact device settings required: Guided Access gemäß den auf diesem konkreten
iOS-9.3.5-Gerät sichtbaren Menüs; die tatsächlich angezeigten deutschen
Bezeichnungen werden wortgetreu notiert, nicht aus aktuellem iPadOS übernommen.

### Steps

1. Öffne die IP-URL in Safari und füge sie zum Home-Bildschirm hinzu; beende
   Safari und starte ausschließlich über das neue Icon.
2. Prüfe, dass das Dashboard ohne normale Safari-Adress-/Tab-Leiste startet.
3. Aktiviere Guided Access mit dem auf dem Gerät angebotenen dreifachen Home-
   Tastendruck; notiere die realen iOS-9-Menünamen und gewählten Optionen.
4. Drücke einmal und zweimal normal die Home-Taste und versuche den Appwechsel.
5. Öffne Summary, kehre zurück und vergleiche das exakte Ausgangsdashboard.
6. Öffne Errors über den Health-Indikator, kehre zurück und prüfe erneut das
   exakte Ausgangsziel.
7. Wechsel zum Custom-Dashboard, wiederhole Summary, Errors und Return.
8. Schalte Dark→Light→Dark, lade innerhalb des HomeScreen-Kontexts neu und
   wiederhole eine Systemroute samt Rückkehr.
9. Prüfe Dashboard im Hochformat, drehe ins Querformat und zurück; wiederhole
   mit offenem Focus. Danach starte eine zweite Guided-Access-Sitzung mit
   Motion deaktiviert und prüfe, dass die Gerätesperre wie dokumentiert wirkt.
10. Betätige je ein ausdrücklich autorisiertes Test-Light und Climate-Control;
    prüfe, dass Touch aktiv bleibt und keine Navigation ausgelöst wird.

### Expected Visual Result

- HomeScreen startet fullscreen ohne zusätzliche Safari-UI;
- Default/Custom/Summary/Errors/Return bleiben im selben Web-App-Fenster;
- Portrait/Landscape und Focus überlaufen nicht; Theme bleibt konsistent.

### Expected Functional Result

- Normaler Home-Tastendruck verlässt die aktive Guided-Access-Sitzung nicht;
- Summary und Errors kehren exakt zum aufrufenden Default-/Custom-Dashboard
  zurück;
- Theme persistiert; Light/Climate bleiben bedienbar;
- Motion erlaubt Rotation, Motion aus unterbindet sie entsprechend der
  tatsächlichen iOS-9-Option.

### Fail If

- normales Safari oder ein neues Fenster/Tab öffnet;
- Home-Taste verlässt die Sitzung;
- Return verliert Custom-Dashboard/Origin oder akzeptiert externes Ziel;
- Theme geht verloren, Layout/Focus bricht bei Rotation oder Controls reagieren
  nicht;
- die dokumentierten iOS-9-Schritte lassen sich mit den realen Menüs nicht
  nachvollziehen.

### Evidence

- Fotos von HomeScreen-Start, Guided-Access-Optionen, Default/Custom/System-
  Rückkehr und beiden Orientierungen;
- wortgetreue iOS-9-Menülabels und Ergebnis je Schritt;
- keine Codes, Tokens, privaten Entitynamen oder internen Daten aufnehmen.

### Result

NOT TESTED

## MT-65

Test ID: TEST-IPAD-POWER-01

Sprint: 25.7

Requirement: Sleep/Wake-, Volume-, Touch-, Auto-Lock-, Dauerstrom- und
Recoveryverhalten im realen Wandbetrieb.

Device: iPad mini 1.

iOS: 9.3.5.

Preconditions:

- MT-64-Grundsetup vorhanden;
- geeignetes Ladegerät/Kabel, sicher belüfteter Teststand und reduzierte
  Helligkeit;
- Auto-Lock-Einstellung und Guided-Access-Hardwareoptionen dokumentiert;
- Test-HA/App darf kontrolliert neu gestartet werden;
- keine Produktionsautomation wird verändert.

Exact dashboard URL: `http://<TEST-IP>:3000/d/<test-dashboard-id>`.

Deployment mode: aktueller Standalone/LXC- oder HA-App-Testkandidat über
direkten LAN-Port.

Exact device settings required: separater Guided-Access-Code; Touch an;
Sleep/Wake und Volume nacheinander in den dokumentierten Varianten testen;
Auto-Lock passend zum Dauerbetrieb; iPad durchgehend am Ladegerät für den
Langzeitschritt.

### Steps

1. Starte Guided Access mit Touch aktiv und prüfe alle Dashboardcontrols.
2. Teste die Sleep/Wake-Option einmal erlaubt und einmal gesperrt; betätige die
   physische Taste und notiere Bildschirm-/Sitzungsverhalten.
3. Teste Volume einmal erlaubt und einmal gesperrt; prüfe, dass weder Variante
   Dashboardlayout noch Guided Access beendet.
4. Prüfe Auto-Lock zunächst mit einem kurzen sicheren Testintervall und danach
   mit der für den Wandbetrieb gewählten Einstellung; berühre das Gerät nicht.
5. Lasse das Display am Ladegerät für die geplante Betriebsdauer aktiv;
   beobachte Helligkeit, Wärme, Ladevorgang und unbeabsichtigtes Sleep.
6. Trenne WLAN kurz und verbinde es wieder; prüfe sichtbaren Offline-/Stale-
   Zustand und selbständige Dashboard-Recovery.
7. Starte den kontrollierten Test-Home-Assistant neu; prüfe Stale/Health und
   anschließende Recovery ohne neues Fenster.
8. Starte anschließend nur die Dashboard-App/den LXC-Dienst neu; prüfe dieselbe
   Recovery und dass Guided Access/HomeScreen-Kontext erhalten bleibt oder die
   dokumentierte manuelle Aktion ausreicht.
9. Wecke den Bildschirm nach erlaubtem Sleep und prüfe Theme, Route, Returnziel
   und Controls erneut.

### Expected Visual Result

- Das Dashboard bleibt layoutstabil und zeigt bei Netzwerk/HA/App-Ausfall
  keinen falschen Healthy-Zustand;
- nach Recovery erscheinen aktuelle Daten ohne Safari-Chrome oder neue Seite.

### Expected Functional Result

- Hardwaretasten verhalten sich exakt gemäß den gewählten Guided-Access-
  Optionen;
- Touch bleibt nutzbar; Auto-Lock/Display-on entspricht der Geräteeinstellung,
  nicht einer erfundenen Web-API;
- WLAN-, HA- und App-Restart werden mit sichtbarem Zwischenzustand toleriert.

### Fail If

- eine gesperrte Taste beendet die Sitzung oder eine erlaubte Taste ist ohne
  Dokumentation wirkungslos;
- Display schläft trotz gewählter Dauerbetriebsoption unerwartet oder die
  Anleitung verspricht mehr als iOS 9 liefert;
- Touch/Controls fallen aus;
- Offlinezustand wird als healthy versteckt oder Recovery erfordert Löschen des
  HomeScreen-Icons;
- gefährliche Wärme-/Ladeauffälligkeiten auftreten (Test sofort beenden).

### Evidence

- Tabelle je Hardware-/Auto-Lock-Option mit realem iOS-9-Label;
- Zeitangaben und Fotos vor Ausfall, während Stale/Offline und nach Recovery;
- sichere Beobachtungsnotiz zu Ladezustand/Wärme, keine Secrets.

### Result

NOT TESTED

## MT-66

Test ID: TEST-IPAD-KIOSK-RECOVERY-01

Sprint: 25.7

Requirement: Beabsichtigter Guided-Access-Exit, Codepflicht, iPad-Reboot,
Post-Reboot-Relaunch und erneute Kiosksperre ohne falsches Autostartversprechen.

Device: iPad mini 1 mit Home-Taste.

iOS: 9.3.5.

Preconditions:

- MT-64 erfolgreich vorbereitet;
- Guided-Access-Code ist dem Tester bekannt, aber kein Admin-/HA-Secret;
- aktueller Testkandidat und direktes LAN verfügbar;
- iPad darf im Testfenster kontrolliert neu gestartet und einmal von der
  Stromversorgung getrennt werden.

Exact dashboard URL: `http://<TEST-IP>:3000/d/<test-dashboard-id>`.

Deployment mode: aktueller Standalone/LXC- oder HA-App-Testkandidat über
direkten LAN-Port.

Exact device settings required: Guided Access aktiv; Home-Taste eingeschränkt;
Touch aktiv; sicherer Zugriff auf den konfigurierten separaten Exitcode.

### Steps

1. Versuche während Guided Access den normalen Home-Tastendruck und danach den
   vorgesehenen dreifachen Druck.
2. Gib absichtlich einmal einen falschen Code ein und prüfe, dass die Sitzung
   nicht endet; beende danach mit dem korrekten Code.
3. Starte die HomeScreen-Web-App erneut und aktiviere Guided Access wieder.
4. Starte das iPad kontrolliert neu. Beobachte, ob irgendeine App automatisch
   startet, ohne dies vorauszusetzen.
5. Entsperre das Gerät, öffne die Dashboard-Web-App manuell vom HomeScreen und
   prüfe Route, Theme und Erreichbarkeit.
6. Prüfe, ob Guided Access nach Reboot aktiv ist; falls nicht, aktiviere es
   erneut und dokumentiere genau die notwendige manuelle Folge.
7. Wiederhole den Rebootpfad nach einem kurzen kontrollierten Stromverlust,
   sofern dies sicher möglich ist.
8. Simuliere eine festhängende/fehlerhafte Web-App durch Beenden/Neustart des
   HomeScreen-Kontexts; führe die dokumentierte sichere Recovery aus.
9. Prüfe abschließend, dass der normale Home-Tastendruck wieder eingeschränkt
   ist und Summary/Errors/Return funktionieren.

### Expected Visual Result

- Nach manuellem Relaunch erscheint das korrekte Dashboard mit persistentem
  Theme;
- kein Dokumentationsschritt behauptet einen unbeaufsichtigten Start, wenn das
  reale Gerät ihn nicht liefert.

### Expected Functional Result

- Exit verlangt den konfigurierten Code; falscher Code beendet die Sitzung
  nicht;
- nach Reboot/Stromverlust kann das Dashboard sicher manuell neu geöffnet und
  Guided Access erneut gestartet werden;
- die Recovery ist nachvollziehbar und verliert weder Origin noch Returnziel.

### Fail If

- Guided Access lässt sich normal ohne Code verlassen;
- der dokumentierte sichere Exit funktioniert nicht;
- Anleitung verspricht automatischen Relaunch/erneuten Guided Access, den das
  Gerät nicht liefert;
- HomeScreen-Shortcut oder Dashboard bleibt nach Reboot dauerhaft unbrauchbar;
- Recovery erfordert Admin-/HA-Credentials auf dem iPad.

### Evidence

- datierte Ablaufnotiz für Exit, falschen/richtigen Code, Reboot,
  Stromverlust, manuellen Relaunch und erneute Aktivierung;
- Fotos nach Reboot und nach erneuter Kiosksperre, ohne Codes oder Secrets.

### Result

NOT TESTED

## Zuordnung aus Audit Part 15

Part 15 erzeugt keine redundanten neuen Test-IDs. Die bereits vollständig
ausformulierten Tests wurden den zusätzlichen Sprints zugeordnet:

- MT-13 deckt das Sprint-25.1-Theme-Gate auf dem iPad mini ab;
- MT-34 deckt das Sprint-25.1-Exact-Filter-/Same-Child-Gate ab;
- MT-40 deckt Sprint 25.1 und 25.2 im realen iPad-mini-HomeScreen ab;
- MT-41 deckt Sprint 25.2 auf dem iPad Air 2 in Safari/HomeScreen ab;
- MT-42 deckt beide Sprints in aktuellem macOS Safari einschließlich
  Redirect-, Failure- und Langzeitverhalten ab.

Alle fünf Einträge enthalten Gerät, Voraussetzungen, exakte Routen/Testdaten,
Schrittfolge, visuell und funktional erwartetes Ergebnis, Fehlerkriterien,
zu erfassende Evidenz und das Ergebnisfeld `NOT TESTED`.

## Zuordnung aus Audit Part 17

Part 17 erzeugt keine redundanten neuen Test-IDs. Für Sprint 25.4 wurden die
bereits vollständig ausformulierten MT-13, MT-34, MT-40, MT-42, MT-50 bis
MT-56 und MT-58 bis MT-60 zusätzlich zugeordnet. Gemeinsam decken sie den
commitbezogenen nächsten RC, aktuelle HAOS-/Supervisor-/`/data`-/Restart-/
Backup-Abnahme, direkten LAN-Pfad, Standalone-Installation/Upgrade/Rollback,
Theme, exakte Filter, HomeScreen, Background, Full Height, Footer, Focus,
Uploadvalidierung und das reale iPad-mini-Gate ab.

Jeder Eintrag enthält weiterhin Gerät/System, Voraussetzungen, exakte Route,
konkrete Testdaten, einzelne Handlungen, erwartetes visuelles und funktionales
Resultat, Fehlerkriterien, Evidenzvorgaben und den Status `NOT TESTED`.

## Detaillierte Anleitungen aus Audit Part 12

## MT-43

Test ID: MT-43

Sprint: 22
Requirement: Reale serverseitige Grace-, Risk-, Expected-Offline-, Flapping-,
Stable-Recovery- und globale Health-Semantik.
Device: Mac mit aktueller macOS-Safari-Version und kontrolliertem Test-Home-
Assistant; keine Produktionsinstanz.
Preconditions: Aktueller Build; Admin API mit separatem Testtoken; ein normales
Test-Entity, ein Diagnostic-Entity, ein Security-Window und ein Safety-Smoke-
Entity mit kontrollierbaren `unknown`-/`unavailable`-/healthy-Zuständen; ein
zweites Entity am selben echten Test-`device_id`; kurze, dokumentierte
Test-Karenzen, damit der Ablauf ohne lange Wartezeiten reproduzierbar ist.
Exact route/page: `/admin`, `/system/errors` und `/d/<test-dashboard-id>`.
Test data/entity/card required: ausschließlich synthetische Testnamen; normale,
diagnostische, Security- und Safety-Risk-Class; Global Health Indicator auf
dem Testdashboard.
Configuration required: Testregeln gemäß Schritt 1, `device_class`-Modus,
separater Admin-Testtoken und unveränderte explizite Control Grants.

### Steps

1. Öffne `/admin`, notiere die Ausgangskonfiguration und setze für das normale
   Entity testweise 5 s Unknown Grace, 10 s Unavailable Grace und 5 s Recovery.
2. Speichere, lade `/system/errors` neu und setze das Entity auf `unknown`.
   Beobachte vor und nach Ablauf von 5 s Error Dashboard und Health Indicator.
3. Wiederhole mit `unavailable` vor und nach 10 s.
4. Setze Smoke auf `unknown` und anschließend `unavailable`; beobachte den
   Zustand ohne lange Karenz. Wiederhole Window `unavailable` mit der kurzen
   Security-Karenz.
5. Aktiviere Expected Offline nur für das normale Entity und setze es auf
   `unavailable`, danach auf `unknown`. Prüfe die unterschiedliche Wirkung.
6. Versuche Expected Offline für Smoke zunächst ohne, dann ausdrücklich mit
   `allowCriticalExpectedOffline`; dokumentiere Warnung, Validierung und
   Ergebnis. Stelle die sichere Ausgangsregel anschließend wieder her.
7. Erzeuge beim normalen Entity mindestens vier Wechsel healthy ↔ unavailable
   innerhalb des konfigurierten Fensters. Prüfe Flapping-Text und Warning-
   Severity; wiederhole kontrolliert mit einem Security-Entity.
8. Setze ein sichtbares unavailable Entity für weniger als 5 s healthy und
   wieder unavailable; prüfe `Recovery Pending`. Halte es danach länger als
   5 s healthy und prüfe das stabile Verschwinden.
9. Prüfe nach jedem Schritt, dass der globale Health Indicator nur bei
   tatsächlich aktivem Warning/Error/Critical sichtbar wird und lokale
   Errorfilter ihn nicht verändern.
10. Verwirf oder speichere die dokumentierte sichere Ausgangskonfiguration und
    kontrolliere, dass keine Testregel auf Produktions-Entities verbleibt.

### Expected Result

- Grace-Grenzen, Risk-Class-Verkürzung, Expected Offline und Ignore bleiben
  semantisch getrennt.
- Safety/Security wird ohne bewusste Ausnahme nicht verborgen.
- Flapping erscheint verständlich; Recovery Pending verhindert sichtbares
  Alarmflackern.
- Health folgt der ungefilterten serverseitigen Issue-Menge.

### Fail If

- Ein Safety-/Security-Problem bleibt hinter langer normaler Grace verborgen.
- Expected Offline verbirgt `unknown`, erteilt eine Control-Berechtigung oder
  verändert eine HA-Entity.
- Flapping/Recovery verschwindet zu früh oder lokale Filter setzen Health auf
  Healthy.
- Admin speichert ungültige Grenzwerte oder verliert den Ausgangsdraft.

### Evidence

- Zeitgestempelte Screenshots vor/an/nach jeder Karenz und während Recovery.
- Notiere Test-Entity-IDs anonymisiert, `device_id`, Regeln, Browser-/HA-
  Version, gemessene Zeiten und Endzustand der zurückgesetzten Konfiguration.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 16

## MT-58

Test ID: MT-58

Sprint: 25.3, 25.4
Requirement: Background, optionaler Dashboardtitel, Vollhöhe, normaler Footer,
Focus-Stacking, Theme, Same-Window-Navigation und Cacheersatz auf der realen
Legacy-Zielhardware.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App in Portrait und
Landscape.
Preconditions: Aktueller reparierter Build nach `RQ-04-01` und `RQ-16-01`;
direkt erreichbare Standalone- oder HA-App-LAN-URL; Adminzugriff nur auf einem
separaten modernen Gerät; drei kleine datenschutzgeprüfte Testbilder (JPEG,
PNG und deutlich unterscheidbares Ersatzbild); Default-Dashboard und zwei
Custom-Dashboards mit 0/1/wenigen/vielen Testkarten; keine Admin-Credentials
auf dem iPad.
Exact route/page: `/`, `/d/<background-a>`, `/d/<background-b>`,
`/system/summary`, `/system/errors` und die jeweilige Focus-Ansicht.
Test data/entity/card required: Ein read-only Sensor, eine Binary-Karte, ein
ausdrücklich autorisiertes ungefährliches Light und Climate, lange Kartentitel,
mindestens eine unavailable Entity; Dashboard A mit `showTitle=false`,
`contain` und Overlay 30; Dashboard B mit `showTitle=true`, `cover` und Overlay
0; Default mit dritter Position/Overlaykonfiguration.

### Steps

1. Leere den Web-App-Cache nur zu Beginn kontrolliert, lege die direkte URL auf
   den HomeScreen und starte sie von dort. Notiere App-/Commitversion und
   Bildschirmorientierung.
2. Öffne `/`, Dashboard A und Dashboard B nacheinander. Prüfe, dass jedes exakt
   sein eigenes Bild, Position, Cover/Contain und Overlay zeigt und kein Bild
   des vorherigen Dashboards stehen bleibt.
3. Prüfe auf Dashboard A mit `showTitle=false`, dass weder Titel noch leerer
   Titelplatz sichtbar ist, Summary, Health, Verbindungsstatus, Uhr und
   Theme-Schalter aber erhalten bleiben. Prüfe auf Dashboard B den sichtbaren
   Titel.
4. Prüfe die vorbereiteten 0-, 1-, wenige- und viele-Karten-Zustände in Portrait
   und Landscape. Drehe jeweils einmal Portrait→Landscape→Portrait.
5. Kontrolliere bei kurzem Inhalt, dass Bild/Overlay bis zum unteren Viewport
   reichen und der Aktualisiert-Footer unten im normalen Dokumentfluss steht.
   Kontrolliere bei vielen Karten, dass der Footer erst nach dem Inhalt kommt,
   nicht über Karten schwebt und keine horizontale Scrollleiste entsteht.
6. Schalte Dark→Light→Dark, lade neu und wechsle zwischen den Dashboards. Bild,
   Overlay, Titelzustand und Theme müssen unabhängig korrekt bleiben.
7. Öffne Focus für Sensor, Light und Climate. Bediene ausschließlich die
   freigegebenen Controls; prüfe, dass Focus samt Dimming über Background und
   Overlay liegt und kein Tap vom Background abgefangen wird.
8. Öffne Summary und Errors über die internen Controls und kehre jeweils zum
   exakten Default-/Custom-Dashboard zurück. Kontrolliere, dass kein normaler
   Safari-Tab entsteht und Origin/Port unverändert bleiben.
9. Lass das alte Bild auf dem iPad im Cache. Ersetze es im Admin auf dem
   separaten Gerät durch das deutlich unterscheidbare Bild, speichere und lade
   das Dashboard am iPad neu. Notiere alte und neue anonymisierte Asset-ID.
10. Prüfe in einer kontrollierten Umgebung ein fehlendes referenziertes Asset:
    Die Dashboardroute muss weiter laden, Controls/Navigation müssen nutzbar
    bleiben und nur das Bild fehlen. Stelle anschließend die gültige
    Konfiguration wieder her.

### Expected Result

- Jedes Dashboard zeigt ausschließlich seine gespeicherte Appearance; Wechsel,
  Rotation, Reload und Theme vermischen keine Zustände.
- `showTitle=false` entfernt nur Titel und Titelraum, nie Summary/Health oder
  andere globale Controls.
- Background und Overlay füllen bei kurzem Inhalt den Viewport; langer Inhalt
  wächst normal. Der kompakte Aktualisiert-Footer ist mittig, nicht fixed und
  überlappt keine Karte.
- Focus liegt vollständig und bedienbar über dem Hintergrund; interne Routen
  bleiben im HomeScreen-Fenster.
- Nach Ersatz erscheint ohne manuelles Cacheleeren die neue Asset-ID/das neue
  Bild. Ein fehlendes Asset bricht die Anwendung nicht.

### Fail If

- Falsches/älteres Bild, weißer Unterseitenstreifen, Backgroundlücke,
  horizontales Scrollen, Karten-/Footerüberlappung oder feststehender Footer.
- Titelraum bleibt leer stehen oder Summary/Health verschwindet zusammen mit
  dem Titel.
- Focus liegt hinter Overlay, ist kontrastarm oder Controls reagieren nicht.
- Summary/Errors öffnen normalen Safari, verlieren Returnziel, Theme oder
  Origin/Port.
- Ersatz bleibt wegen Cache unsichtbar oder ein fehlendes Bild verhindert
  Rendering/Bedienung.

### Evidence

- Fotos/Screenshots aller drei Dashboards in beiden Orientierungen, mindestens
  je eines mit/ohne Titel und mit kurzem/langem Inhalt.
- Focus-, Summary-/Errors-/Return- und Light/Dark-Aufnahmen.
- Redigierte alte/neue Asset-ID, App-/Commitversion, Zeitstempel und beobachtete
  Footer-/Scroll-/Rotationsergebnisse.

### Result

NOT TESTED

## MT-59

Test ID: MT-59

Sprint: 25.3, 25.4
Requirement: Geschützte Admin-End-to-End-Konfiguration, Uploadvalidierung,
Preview-/Runtime-Parität, sicherer Ersatz und sichere Entfernung.
Device: Aktuelle macOS-Safari-Version mit kontrollierter lokaler Real-App oder
isoliertem Test-LXC; kein produktives Home Assistant.
Preconditions: Build nach `RQ-04-01` und `RQ-16-01`; lokales Fake-HA und
separates Admin-Testtoken; Default plus zwei Custom-Dashboards; gültige kleine
Baseline-/Progressive-JPEGs, JFIF/EXIF/ICC-JPEGs, PNGs, `.jpg` und `.jpeg`;
Fixtures für truncated JPEG/PNG, PNG ohne IDAT, falsche PNG-CRC, HTML/SVG mit
Bildendung, Oversize, falschen MIME-Typ und Pfadmanipulation.
Exact route/page: `/admin`, `/`, `/d/<background-a>`, `/d/<background-b>` und
`/assets/backgrounds/<anonymisierte-id>`.
Test data/entity/card required: Generische Sensor-/Binary-Testkarten und
datenschutzgeprüfte Bilder ohne private EXIF-/Standort-/Personendaten.

### Steps

1. Öffne `/admin` ohne Token, mit falschem Token und danach mit gültigem
   Testtoken. Prüfe, dass nur die letzte Variante die Konfiguration liest oder
   schreibt; beobachte Write-Rate-Limit ohne es zu umgehen.
2. Lade nacheinander gültiges PNG, `.jpg`, `.jpeg`, Baseline, Progressive,
   JFIF/EXIF/ICC hoch. Prüfe je Upload Preview, gespeicherte Config, Runtimebild,
   Content-Type, `nosniff` und ausschließlich relative Asset-URL.
3. Prüfe alle fünf Positionen, `cover`, `contain`, Overlay 0/10/30/50 und
   `showTitle` an/aus. Vergleiche Admin-Preview und tatsächliche Dashboardroute
   nach Save/Reload.
4. Weise unterschiedliche Bilder/Einstellungen Default und beiden Custom-
   Dashboards zu; wechsle mehrfach und kontrolliere die Isolation.
5. Notiere anonymisiert Config und Asset-ID, dann versuche jede ungültige
   Fixture: truncated, fehlendes IDAT, falsche CRC, HTML, SVG, falscher MIME,
   Oversize und manipulierte ID/Pfad. Prüfe nach jedem Versuch Config, altes
   Bild, Verzeichnisinhalt und Logs.
6. Simuliere kontrolliert einen Config-Persistenzfehler nach gültigem neuen
   Upload. Prüfe, dass das neue Temp-/Assetfile entfernt und das alte Bild samt
   Config erhalten bleibt.
7. Ersetze anschließend erfolgreich ein Bild. Prüfe neue ID/URL und neues Bild;
   das alte unreferenzierte Asset darf nicht mehr ausgeliefert werden.
8. Entferne das Bild regulär. Prüfe `background:null`, weiterhin funktionierende
   Runtime, 404 für die alte ID und keine verwaiste Datei.
9. Prüfe Browsernetzwerk und redigierte Logs auf HA-, Supervisor- oder Admin-
   Token, absolute Dateipfade, Rohpayloads und nutzerbestimmte Dateinamen.

### Expected Result

- Nur authentifizierte, limitierte Adminwrites sind möglich; Public Browser
  sieht ausschließlich die relative referenzgeprüfte Assetroute.
- Alle gültigen JPEG-/PNG-Varianten zeigen in Preview und Runtime dieselbe
  Darstellung.
- Jede ungültige/manipulierte/übergroße Datei wird kontrolliert abgewiesen;
  bestehende Config und Bild bleiben unverändert, keine Teil-/Waisendatei
  entsteht.
- Erfolgreicher Ersatz verwendet eine neue ID; Remove entfernt nur das nicht
  mehr referenzierte Asset. Keine Credentials oder privaten Pfade erscheinen.

### Fail If

- Unauthentifizierter Upload/Remove gelingt oder Rate-Limit wird umgangen.
- Preview und Runtime unterscheiden sich nach Save/Reload.
- Eine invalid PNG/JPEG-/HTML-/SVG-/Oversize-/Traversal-Fixture wird akzeptiert,
  das alte Bild verschwindet oder eine Teil-/Waisendatei bleibt zurück.
- Assetroute listet Dateien, liefert unreferenzierte IDs oder setzt unsicheren
  MIME-/Sniffing-Kontext.
- Token, Rohpayload oder lokaler Pfad erscheint im Browser oder Log.

### Evidence

- Redigierte Screenshots von Admin-Preview und korrespondierender Runtime je
  Hauptvariante; Statuscodes/Header und anonymisierte Asset-IDs.
- Tabelle jeder validen/invaliden Fixture mit Resultat, Config-/Dateihash vor
  und nachher sowie redigierte Logs.

### Result

NOT TESTED

## MT-60

Test ID: MT-60

Sprint: 25.3, 25.4
Requirement: Standalone-`DATA_DIR`, Dateirechte, atomare Persistenz, Backup,
Dienstneustart und fehlendes Asset im produktionsnahen LXC-Modell.
Device: Isolierter Standalone-Debian-LXC `ha-legacy-dashboard` mit systemd und
lokalem Fake-HA; nicht der produktive Dienst.
Preconditions: Aktueller reparierter Commit nach `RQ-16-01`; gesicherter
Test-LXC; Runtimeuser `dashboard`; separater persistenter Test-Datenpfad;
gültiges JPEG/PNG ohne private Daten; Admin-Testtoken; keine produktive `.env`.
Exact route/page: `/health`, `/api/status`, `/admin`, `/`,
`/d/<background-persistence>` und systemd-Status/Logs.
Test data/entity/card required: Custom-Dashboard mit einem Widget,
`showTitle=false`, Background plus eindeutigem Overlay-/Positionmarker.

### Steps

1. Konfiguriere den expliziten persistenten `DATA_DIR` und
   `DASHBOARD_CONFIG_PATH`, starte den Dienst und bestätige `/health` sowie den
   Runtimeuser.
2. Lege das Testdashboard im Admin an, lade das Bild hoch und speichere die
   Appearance. Dokumentiere Config-/Backup-/Assetpfad nur anonymisiert,
   Besitzer, Modi, Größen und Hashes.
3. Prüfe, dass Datenverzeichnis `0700`, Config/Backup/Assets restriktiv und
   keine Backgrounddatei im Gitbaum oder Webroot liegt.
4. Lade Dashboard/Asset, stoppe und starte den Dienst vollständig und prüfe
   danach Config, Background, Titelzustand, Hashes, `/health` und Logs.
5. Ersetze das Bild erfolgreich und prüfe neue ID/Hash sowie Entfernung des
   alten unreferenzierten Assets. Starte erneut und wiederhole die Prüfung.
6. Provoziere einen abgewiesenen ungültigen Upload und einen kontrollierten
   Config-Schreibfehler. Prüfe, dass Primärdatei, `.bak` und letztes gültiges
   Bild erhalten bleiben und keine Tempdatei existiert.
7. Entferne/verschiebe in der isolierten Umgebung nur das aktuelle Testasset,
   ohne Config anzupassen. Starte neu: Dashboard muss ohne Bild weiter
   funktionieren. Stelle danach die gültige Sicherung wieder her.
8. Entferne nur die angelegten Testdaten oder setze den LXC auf den vorherigen
   Snapshot zurück.

### Expected Result

- Alle persistenten Daten liegen ausschließlich am konfigurierten Datenpfad
  mit restriktiven Rechten und überleben Dienstneustarts.
- Configstore und Assetstore ersetzen atomar; `.bak` und letztes gültiges
  Asset bleiben bei Fehlern nutzbar, keine Temp-/Waisendatei entsteht.
- Ein fehlendes Asset führt nur zu fehlendem Background, nicht zu Dienst-,
  Dashboard-, Navigation- oder Controlausfall.
- Logs bleiben secretfrei und der Git-/Webroot enthält keine Uploads.

### Fail If

- Daten landen in einem flüchtigen, Git- oder öffentlich statischen Pfad,
  Rechte sind zu weit oder Restart verliert Appearance/Asset.
- Fehlgeschlagener Upload/Configwrite beschädigt Primärdatei, Backup oder
  gültiges Bild beziehungsweise lässt Tempdateien zurück.
- Fehlendes Asset verhindert Dienststart oder Dashboardbedienung.
- Credentials, private Pfade oder Bildinhalte erscheinen in Logs.

### Evidence

- Redigierte systemd-/Health-/Logausgaben, App-/Commitversion und Zeitstempel.
- Vor/nachher Hashes, Owner/Modi, anonymisierte Verzeichnisliste und
  Dashboard-Screenshots vor/nach Neustart, Ersatz und fehlendem Asset.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 13

## MT-50

Test ID: MT-50

Sprint: 24, 25.4
Requirement: Reale Supervisor-Core-WebSocket-Kommunikation, sichere
Teil-Ausfälle, autonome Recovery und secretfreie App-Logs.
Device: Home Assistant OS auf amd64 mit einer kontrollierten Testinstanz;
Desktop-Safari für die Beobachtung.
Preconditions: `RQ-09-01` und `RQ-13-02` sind automatisiert geschlossen;
`RQ-13-01` muss vor finaler Abnahme behoben und eine neue unveränderliche
Testversion installiert sein; mindestens je eine
Registry-/Area-/Label-/Config-Entry-/Repair- und Automation-Testinformation;
kein Long-Lived HA Token in den App-Optionen; separates Test-Admin-Token.
Exact route/page: App-Logansicht, `/health`, `/api/status`, `/admin`,
`/system/errors` und `/system/summary` über den direkten App-Port.
Test data/entity/card required: generische Test-Entities/Devices/Areas/Labels,
eine referenzierende Testautomation und ein ungefährlicher Test-Repair-Eintrag
oder klar dokumentierter Unsupported-Fall.
Configuration required: App-Modus, `homeassistant_api: true`, direkter Port,
Admin API nur für das Testfenster aktiviert; keine Produktionssecrets in
Screenshots oder Protokollen.

### Steps

1. Starte die App und notiere Version, Architektur, Startzeit und Port; prüfe
   `/health` sowie `/api/status` ohne Browser-HA-Credentials.
2. Öffne `/admin` und notiere die Quellenstatus für Entity-, Device-, Area-,
   Label-, Config-Entry-, Repair- und Automationdaten.
3. Öffne Summary und Errors und prüfe, dass ausschließlich normalisierte,
   reduzierte Daten erscheinen; öffne Advanced Diagnostics für eine
   Testautomation.
4. Kontrolliere die App-Logs vom Start bis zu diesem Punkt auf Tokenwerte,
   Authorization-Header, rohe Registries, rohe Automationkonfiguration und
   rohe Trace-Payloads.
5. Stoppe Home Assistant Core kontrolliert, ohne die App zu stoppen. Lade
   `/health`, `/api/status`, Summary und Errors mehrfach während des Ausfalls.
6. Starte Core wieder und beobachte ohne App-Neustart, ob REST-State und alle
   WebSocket-Quellen nach Backoff selbständig auf Fresh/Available wechseln.
7. Wiederhole, falls die Testumgebung dies gezielt erlaubt, mit einer
   WebSocket-Unterbrechung ohne absichtlich erzeugten normalen Close und prüfe
   die autonome Recovery nach der Reparatur von `RQ-09-01`.
8. Deaktiviere Admin API wieder und prüfe, dass der direkte Port keine
   Supervisor-/HA-Credentials oder generische HA-Kommandofläche bereitstellt.

### Expected Result

- REST und serverseitiger WebSocket authentifizieren ausschließlich über den
  Supervisorpfad; der Browser erhält keine Tokens und keine Rohdaten.
- `/health` bleibt während eines Core-Ausfalls verfügbar; fachliche Endpunkte
  zeigen kontrolliertes stale/offline/unsupported statt eines Crashs.
- Alle Quellen erholen sich nach Core-/Transport-Rückkehr ohne App-Neustart.
- Logs enthalten nur redigierte, diagnostisch notwendige Angaben.

### Fail If

- Ein Token, Authorization-Header, eine rohe Registry/Config oder ein roher
  Trace erscheint im Browser oder Log.
- `/health` hängt an der Core-Erreichbarkeit, die App beendet sich oder eine
  Quelle bleibt nach Rückkehr bis zu einem manuellen App-Neustart ausgefallen.
- Der Browser kann freie WebSocket-Commands, Domains oder HA-Services senden.

### Evidence

- Redigierte Screenshots von Health, Quellenstatus, stale/offline und Recovery.
- Redigierter Logauszug mit Zeitachse; App-/HAOS-/Core-Version und gemessene
  Recoveryzeiten, niemals Credentialwerte.

### Result

NOT TESTED

## MT-51

Test ID: MT-51

Sprint: 24, 25.3, 25.4
Requirement: Persistenz der App-Konfiguration und Background-Assets unter
`/data`, sichere Rechte und Erhalt über einen App-Restart.
Device: Home Assistant OS auf amd64.
Preconditions: Aktuelle Testversion nach `RQ-13-01`; Backup der vorhandenen
App-Daten; separates Admin-Testtoken; ein ausschließlich für die Abnahme
angelegtes Custom-Dashboard und ein unkritisches JPEG-/PNG-Testbild ohne private
Metadaten.
Exact route/page: `/admin`, `/d/<persistence-test-dashboard-id>`, App-Stop/
Start in Home Assistant und App-Logs.
Test data/entity/card required: Custom-Dashboard mit einem Widget, eigener
Section, Dashboard- oder Room-Background und `showTitle`-Einstellung.
Configuration required: App-Modus mit Standard-`DATA_DIR=/data`; keine
manuelle Umleitung auf `/tmp` oder einen Container-Image-Pfad.

### Steps

1. Erstelle im Admin das Testdashboard, die Section und das Widget, lade das
   Testbild hoch, weise es zu und speichere.
2. Lade die Dashboardroute neu und dokumentiere Konfiguration, Titelzustand,
   Section, Widget und sichtbaren Background.
3. Prüfe über eine sichere HAOS-App-Diagnose oder Shell nur Metadaten:
   Dashboarddatei, `.bak` und Background liegen unter `/data`; notiere Owner,
   Modus und Größe, aber keine privaten Dateiinhalte.
4. Stoppe die App vollständig, starte sie erneut und warte auf `/health`.
5. Öffne Admin und Dashboard erneut. Prüfe alle gespeicherten Werte, das Asset
   und die weiterhin gültige Backupdatei.
6. Ersetze das Testbild, provoziere kontrolliert einen ungültigen Upload und
   prüfe, dass die zuletzt gültige Datei/Konfiguration erhalten bleibt.
7. Entferne ausschließlich die angelegten Testdaten oder stelle das Backup
   kontrolliert wieder her.

### Expected Result

- Erforderliche Daten liegen unter `/data`, besitzen restriktive App-Rechte
  und überleben Stop/Start unverändert.
- Ungültige Writes beschädigen weder Primärdatei, Backup noch vorhandenes
  Background-Asset.
- Keine erforderliche Persistenz liegt nur in `/app`, `/tmp` oder einer
  flüchtigen Image-Schicht.

### Fail If

- Dashboard, Section, Widget, Einstellung oder Asset fehlt nach Restart.
- Dateien sind unerwartet weltlesbar, Backup/Primärdatei inkonsistent oder ein
  fehlgeschlagener Upload ersetzt den gültigen Background.
- Logs oder Evidence enthalten Admin-/Supervisor-Credentials.

### Evidence

- Vor-/Nachher-Screenshots von Admin und Dashboard.
- Redigierte Dateimetadaten unter `/data`, App-Version, Restartzeit und Ergebnis
  des Invalid-Upload-Checks.

### Result

NOT TESTED

## MT-52

Test ID: MT-52

Sprint: 24, 25.3, 25.4
Requirement: Cold Backup/Restore, Upgrade zwischen zwei unveränderlichen App-
Versionen sowie HAOS-Reboot und `boot: auto` ohne Datenverlust.
Device: Home Assistant OS auf amd64 in einer kontrollierten Testumgebung.
Preconditions: Zwei veröffentlichte und voneinander unterscheidbare Test-/RC-
Versionen aus exakten Commits; `RQ-13-01` behoben, `RQ-13-02` ist bereits
automatisiert geschlossen; MT-51-Datensatz
vorhanden; vollständige HAOS-Sicherungsmöglichkeit; Wartungsfenster.
Exact route/page: `/health`, `/admin`, `/d/<persistence-test-dashboard-id>`,
Home-Assistant-App-Verwaltung sowie Backup-/Restore-Oberfläche.
Test data/entity/card required: Persistenzdashboard aus MT-51 einschließlich
Background, Section, Widget und eindeutigem ungefährlichem Marker.
Configuration required: `backup: cold`, `boot: auto`, direkter Port 3000 oder
dokumentierter alternativer Host-Port; keine Produktionsinstanz.

### Steps

1. Starte Version A, bestätige `/health` und alle MT-51-Testdaten.
2. Erzeuge ein Cold Backup der App und notiere Version und Zeitstempel.
3. Ändere danach einen sichtbaren Testwert, damit Restore eindeutig erkennbar
   ist; stoppe/starte die App einmal.
4. Stelle das Cold Backup wieder her und prüfe, dass der Zustand exakt auf den
   gesicherten Marker zurückkehrt und die App sauber startet.
5. Aktualisiere auf Version B und prüfe `/health`, App-Log, Dashboarddaten,
   Background und Adminzugriff. Bestätige die tatsächlich laufende Version.
6. Starte Home Assistant Core separat neu und prüfe Recovery ohne App-Datenverlust.
7. Starte anschließend den kompletten HAOS-Host neu. Warte auf `boot: auto`,
   öffne `/health` und prüfe erneut alle Testdaten und Supervisorquellen.
8. Stelle die Testumgebung kontrolliert zurück und bewahre nur redigierte
   Nachweise.

### Expected Result

- Cold Backup/Restore ist reproduzierbar und verwendet die App-Daten.
- Upgrade A→B startet genau Version B und erhält `/data`.
- Core- und HAOS-Restart führen zur automatischen Recovery; `boot: auto`
  startet die App ohne manuelle Aktion.

### Fail If

- Restore liefert falsche/fehlende Daten, Upgrade läuft weiterhin mit Version
  A oder HAOS-Reboot erfordert manuellen App-Start.
- App hängt dauerhaft auf stale/offline, Backgrounds fehlen oder Logs enthalten
  Credentials.

### Evidence

- Redigierte Screenshots vor Backup, nach Änderung, nach Restore, nach Upgrade
  und nach Reboot; Versionen, Commit-/Image-Digests, Zeitstempel und Startdauer.

### Result

NOT TESTED

## MT-53

Test ID: MT-53

Sprint: 24, 25.4
Requirement: Reale aarch64-Kompatibilität von Image, Startup, Supervisor-
Transport, direktem Port und Persistenz.
Device: Home Assistant OS auf echter aarch64-Hardware.
Preconditions: Nach `RQ-13-01` veröffentlichtes Multi-Arch-Image mit
nachgewiesenem arm64-Manifest; kontrollierte HAOS-Testinstanz; separates
Admin-Testtoken; keine Produktionsdaten.
Exact route/page: App-Installation, `/health`, `/api/status`, `/admin`,
`/system/summary`, `/system/errors` und `/d/<arm64-test-dashboard-id>`.
Test data/entity/card required: je ein read-only Sensor/Binary, ein ausdrücklich
autorisiertes ungefährliches Test-Light/Climate und ein Background-Testasset.
Configuration required: Standard-App-Optionen, direkter Port, App-Modus ohne
Long-Lived HA Token.

### Steps

1. Prüfe vor Installation, dass das veröffentlichte Manifest einen
   `linux/arm64`-Digest besitzt; installiere genau diese App-Version.
2. Starte die App und kontrolliere `/health`, `/api/status`, Architektur und
   gestartete Version im redigierten Log.
3. Öffne Default-/Custom-Dashboard, Summary, Errors und Admin; prüfe States,
   Registrykontext und direkte LAN-Erreichbarkeit.
4. Schalte ausschließlich die beiden freigegebenen Test-Entities einmal und
   bestätige, dass nicht autorisierte Entities deaktiviert/abgewiesen bleiben.
5. Speichere ein Testdashboard samt Background, starte die App neu und prüfe
   den Erhalt unter `/data`.
6. Stoppe/Starte Core kontrolliert und prüfe REST-/WebSocket-Recovery.
7. Prüfe Logs auf native Modulfehler, Architekturfehler, Tokens oder rohe
   Supervisorpayloads; entferne die Testdaten.

### Expected Result

- Das arm64-Manifest wird nativ geladen; App startet ohne Emulation-/Native-
  Dependencyfehler.
- REST, WebSocket, direkter Port, Writesicherheitsgrenze und `/data` verhalten
  sich wie auf amd64.

### Fail If

- Image fehlt für arm64, startet nur emuliert oder scheitert an Architektur.
- Funktionen, Berechtigungen oder Persistenz unterscheiden sich sicherheits-
  oder funktionsrelevant von amd64.

### Evidence

- Manifestdigest, Hardware-/HAOS-Version, redigierte Startlogs und Screenshots
  jeder Route vor/nach Restart; keine Credentials oder privaten Entitynamen.

### Result

NOT TESTED

## MT-54

Test ID: MT-54

Sprint: 24, 25.3, 25.4
Requirement: Vollständiger direkter LAN-Zugriff auf die HA-App mit Safari iOS
9/HomeScreen ohne Ingress-/HA-Frontend-Abhängigkeit.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktuelle App-Version nach `RQ-13-01` auf HAOS; feste erreichbare
IPv4-Adresse und direkter App-Port; Cache-Buster `RQ-04-01` behoben; ein
generisch benanntes Default-/Custom-Dashboard mit Section, Sensor/Binary,
autorisiertem Test-Light und Climate; keine Admin-Credentials auf dem iPad.
Exact route/page: `http://<HAOS-IPv4>:<App-Port>/`, `/d/<test-dashboard-id>`,
`/system/summary` und `/system/errors` über interne Navigation.
Test data/entity/card required: Light und Climate mit ungefährlichen
Testzuständen, unavailable Entity, Healthzustände Healthy und Warning/Error,
lange Kartennamen und optionaler Background.
Configuration required: direkter Port aktiv; kein Ingress als Voraussetzung;
gültige Returnziele; Light-/Climate-Grants ausschließlich serverseitig.

### Steps

1. Lege die direkte IPv4-URL auf dem HomeScreen ab, starte sie von dort und
   bestätige Fullscreen ohne sichtbare Safari-Chrome.
2. Lade Default- und Custom-Dashboard in Portrait und Landscape; prüfe
   Background, Section, Karten, Footer, Light/Dark und fehlenden horizontalen
   Overflow.
3. Öffne Summary über den neutralen Link, Errors über den Health Indicator und
   kehre jeweils zum exakten internen Dashboard zurück.
4. Bestätige, dass alle Navigation im selben HomeScreen-Fenster und unter
   exakt derselben Origin/Port bleibt; kein HA-Frontend/Ingress/normaler Safari-
   Tab darf erscheinen.
5. Schalte das ausdrücklich autorisierte Light und Climate einmal in Grid und
   Focus; ändere Climate-Zielwert innerhalb der sicheren Grenzen.
6. Prüfe unavailable und nicht autorisierte Entities auf deaktivierte Controls;
   ein Control-Tap darf Focus nicht ungewollt öffnen/schließen.
7. Starte Home Assistant Core neu und beobachte stale/offline sowie Recovery,
   ohne die Web-App zu verlassen. Starte danach nur die App neu und wiederhole.
8. Schließe und öffne die HomeScreen-Web-App erneut; prüfe Route, Theme und
   Bedienbarkeit. Dokumentiere `.local` nur separat, ohne funktionierenden
   IPv4-Zugriff als Fehler zu behandeln.

### Expected Result

- Direkte IPv4-App-URL funktioniert ohne Ingress oder HA-Frontend und bleibt
  bei interner Navigation in derselben HomeScreen-Web-App.
- Layout, Theme, Systemrouten und enge autorisierte Controls funktionieren auf
  iOS 9; nicht autorisierte/unavailable Writes bleiben gesperrt.
- Core-/App-Restart wird mit kontrolliertem Status und anschließender Recovery
  toleriert.

### Fail If

- Eine interne Route öffnet normalen Safari, ändert Origin/Port oder verlangt
  moderne HA-Ingress-Anmeldung.
- Layout überläuft/überlappt, Controls sind nicht bedienbar oder Credentials/
  Adminzugriff werden auf dem iPad benötigt.
- Neustart hinterlässt dauerhaft falschen Healthy-, stale- oder offline-Status.

### Evidence

- Fotos/Screenshots von HomeScreen-Start, Default/Custom, Summary/Errors,
  Portrait/Landscape und Restart-Recovery; notiere iOS-/App-/HAOS-Version,
  verwendete Origin anonymisiert und Ergebnis jedes Controls.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 12 (Fortsetzung)

## MT-44

Test ID: MT-44

Sprint: 22
Requirement: Persistente Regeln, zuverlässiges HA-`last_changed`, atomare
Konfiguration und bewusst prozesslokale Flapping-Historie über LXC-Neustart.
Device: Standalone-LXC `ha-legacy-dashboard` mit systemd und kontrolliertem
Test-Home-Assistant.
Preconditions: Wartungsfenster; gültiges Backup der Dashboardkonfiguration;
ein normales Test-Entity seit mindestens zwei Minuten `unavailable`; eine
zweite Entity für Flapping; kein produktiver Credentialinhalt in Befehls-
oder Bildnachweisen.
Exact route/page: `/admin`, `/system/errors`, Service
`ha-legacy-dashboard.service`.
Test data/entity/card required: zwei isolierte Test-Entities und eine
Test-Device-Regel; `unavailableGraceMs=30000`, kurze Recovery für den Test.
Configuration required: persistierte Entity-/Device-Regeln in der vorhandenen
Dashboardkonfiguration; gültige Primärdatei und `.bak`; keine Produktionsregel
ändern.

### Steps

1. Speichere Entity-/Device-Regeln im Admin, lade `/system/errors` neu und
   bestätige ihre aktuelle Wirkung.
2. Stelle sicher, dass Entity A bereits länger als 30 s `unavailable` ist und
   als Issue sichtbar ist.
3. Starte ausschließlich `ha-legacy-dashboard.service` kontrolliert neu und
   warte auf erfolgreichen Dienststatus.
4. Lade `/system/errors` sofort neu und prüfe, dass Entity A aufgrund seines
   HA-`last_changed` nicht erneut 30 s unsichtbar wird.
5. Erzeuge bei Entity B vor dem Neustart Flapping und dokumentiere das Issue.
6. Starte den Dienst erneut; prüfe, dass die prozesslokale Flapping-Historie
   kontrolliert verloren sein darf, ohne Crash, persistierte Rohhistorie oder
   falsche Severity zu erzeugen.
7. Prüfe nach dem Neustart `/admin`: Regeln sind erhalten, die primäre
   Konfigurationsdatei und `.bak` sind gültig und Dateirechte unverändert.
8. Erzeuge erneut die nötigen Transitionen und prüfe, dass Flapping wieder
   erkannt wird; stelle alle Testzustände und Regeln anschließend zurück.

### Expected Result

- Konfiguration überlebt den Dienstneustart atomar; alte unavailable-Dauer
  nutzt HA-`last_changed`.
- Nur der flüchtige Ringbuffer wird verworfen und danach sauber neu aufgebaut.
- Service startet ohne Tokenausgabe, Datenverlust oder zusätzlichen HA-Poll.

### Fail If

- Ein lang ausgefallenes Entity wird nach Restart erneut für die volle Grace
  verborgen.
- Regeln/Backup gehen verloren oder Flapping-Historie wird unerwartet als
  ungebundene Datei persistiert.
- Logs enthalten Credentials oder der Dienst benötigt eine neue Berechtigung.

### Evidence

- Vor-/Nachher-Screenshots der Issues, redigierter Service-Status und
  Dateimetadaten von Konfiguration/Backup; keine Dateiinhalte mit privaten IDs.
- Notiere Neustartzeit, HA-`last_changed`, Softwareversionen und Reset-Erfolg.

### Result

NOT TESTED

## MT-45

Test ID: MT-45

Sprint: 22
Requirement: Verständliche Flapping-/Recovery-/Device-Hint-Darstellung und
stabiler Health Indicator auf Safari iOS 9.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Testdashboard mit neutralem Summary-Link und Health Indicator;
kontrolliertes Test-HA liefert eine Device Group mit mindestens drei Children,
davon mindestens zwei unavailable, ein Flapping- und ein Recovery-Pending-
Child; sichere generische Namen; MT-43-Regeln bereits serverseitig vorbereitet.
Exact route/page: `/d/<test-dashboard-id>` und `/system/errors?returnTo=...`.
Test data/entity/card required: echte gemeinsame Test-`device_id`, Warning-
und Critical-Beispiel, lange Entity-/Gerätenamen, 1-/2-/3-Spaltenpräferenz.
Configuration required: serverseitige Sprint-22-Testregeln aus MT-43,
vorbereitete Spalten-/Themepräferenz und gültiges Return Target.

### Steps

1. Starte das Dashboard vom HomeScreen in Portrait, warte auf frische Daten
   und öffne Errors über den Health Indicator.
2. Prüfe Device-Title, Issue-/Unavailable-/Unknown-/Flapping-/Recovery-Counts
   und den konservativen Device-Failure-Hinweis.
3. Klappe Childdetails auf und prüfe Flapping-/Recovery-Texte, Severity und
   lange Namen auf Clipping/Überlauf.
4. Wechsle Severity und State einzeln sowie kombiniert; bestätige, dass
   sichtbare Children/Group-Severity stimmen und Health unverändert global ist.
5. Teste 1/2/3 Columns im verfügbaren Viewport, Dark/Light und drehe nach
   Landscape; prüfe keine horizontale Seitenscrollbar oder Card-Überlappung.
6. Kehre über Back exakt zum Ausgangsdashboard zurück und prüfe, dass die
   HomeScreen-Web-App nicht in normales Safari wechselt.
7. Beobachte eine serverseitig ausgelöste Recovery über mindestens zwei
   Refreshzyklen; der Health Indicator darf nicht vorzeitig verschwinden.

### Expected Result

- Alle neuen Zustände sind ohne reine Farbcodierung verständlich und innerhalb
  ihrer Cards lesbar.
- Device-Hint bleibt vorsichtig formuliert; Controls/Navi bleiben mindestens
  ungefähr 44 px groß.
- Rotation, Theme und Return bleiben stabil im HomeScreen-Kontext.

### Fail If

- Text/Count überlappt, horizontales Scrollen entsteht oder Gruppenseverity
  passt nicht zu sichtbaren Children.
- Health flackert, verschwindet durch Filter oder HomeScreen wird verlassen.
- Touchziele reagieren doppelt/nicht oder die Systemseite benötigt moderne
  Browserfunktionen.

### Evidence

- Je ein Foto in Portrait/Landscape und Light/Dark; zusätzliche Aufnahme der
  geöffneten Childdetails und Recovery.
- Notiere iOS-Version, Viewportorientierung, Dashboard-ID und Resultat jedes
  Schritts ohne private Entitynamen im Bild.

### Result

NOT TESTED

## MT-46

Test ID: MT-46

Sprint: 23
Requirement: Automation Inventory, explizite Referenzindizes, Capabilities,
Partial Failure und sanitierte Trace Summaries gegen eine reale HA-Version.
Device: Mac mit aktueller Safari-Version, Gateway gegen kontrolliertes Test-
Home-Assistant; zusätzlich Backend-/Adminstatus beobachtbar.
Preconditions: Test-HA mit mindestens fünf Automationen: on, off, unavailable,
direkte Entity-/Device-Referenz, indirekte Area-/Label-Referenz, Template oder
Blueprint; mindestens eine Condition-false-, Not-triggered- und echte Error-
Trace; keine Produktionsgeheimnisse in Automationstexten.
Exact route/page: `/system/errors`, `/admin` → Diagnostic Sources und
`/api/system-dashboards/errors/automation-traces` nur über die UI auslösen.
Test data/entity/card required: problematische Test-Entity mit realer
`device_id`, `area_id`, `label_id`; Automation-Namen lang/kurz; bekannte letzte
Triggerzeiten.
Configuration required: read-only Registry-/Automation-/Trace-Zugriff des
Test-HA, `device_class`- oder dokumentierter Label-Modus, keine Automation-
Write-Berechtigung im Dashboard.

### Steps

1. Öffne Errors und prüfe, dass ohne Advanced-Diagnostics-Interaktion noch
   keine Trace-Abfrage erfolgt.
2. Erzeuge ein aktives Sprint-22-Issue für die referenzierte Entity und prüfe
   direkte Entity-/Device- sowie indirekte Area-/Label-Zuordnungen.
3. Prüfe, dass eine unbeteiligte Automation nicht erscheint und dynamische/
   Blueprint-Referenzen als unvollständige Analyse sichtbar werden, ohne als
   Ursache behauptet zu werden.
4. Prüfe on/off/unavailable/unknown, Friendly Name, Disabled-Kontext und
   Last-triggered-Anzeige; `off` darf kein eigenes Error erzeugen.
5. Öffne Advanced Diagnostics. Prüfe Inventory-/Config-/Trace-Capability und
   die drei Tracearten: Erfolg/Error, Condition false, Not triggered.
6. Kontrolliere im Browser-Netzwerkpayload, dass keine Raw Config, Trace-
   Variables, Actions, Services, vollständige States oder Tokens enthalten sind.
7. Simuliere kontrolliert unsupported oder Timeout nur für Trace; Registry,
   Inventory und statischer Impact müssen weiter funktionieren.
8. Simuliere einen einzelnen Config-Lesefehler und prüfe Partial-/Last-known-
   Verhalten. Stelle danach alle Quellen wieder her und prüfe Recovery.
9. Schalte eine referenzierte Automation innerhalb des 60-s-Config-TTL von on
   auf off und prüfe, ob Disabled-Kontext und Triggerzeit sofort dem aktuellen
   State-Snapshot folgen; dieser Schritt re-auditiert `RQ-12-03`.

### Expected Result

- Nur explizit belegte statische Treffer werden direct/indirect zugeordnet;
  dynamische Unsicherheit bleibt sichtbar und kausalitätsfrei.
- Trace wird capability-driven/on-demand geladen und vollständig reduziert.
- Teilfehler degradieren nur die betroffene Quelle; aktueller Automation-
  Zustand bleibt unabhängig vom Config-TTL aktuell.

### Fail If

- Browser erhält Rohkonfiguration/-trace, Token oder beliebige WS-Kommandos.
- Condition false/Not triggered wird als Fehler gewertet, `off` erzeugt Error
  oder Trace-Ausfall zerstört das Error Dashboard.
- State/Disabled/lastTriggered bleibt nach Schritt 9 bis zum Config-TTL alt.

### Evidence

- Screenshots von Impact/Advanced Diagnostics und redigierte Network-
  Feldliste; notiere HA-Version, Capabilitystatus und jede Referenzart.
- Keine Automation-YAML, Tracevariable, interne IP oder private Namen sichern.

### Result

NOT TESTED

## MT-47

Test ID: MT-47

Sprint: 23
Requirement: Desktop-Safari-Darstellung, Collapse/Expand, lange Automation-
Namen, Trace-On-Demand und Fehlerdegradation.
Device: Mac mit aktueller macOS-Safari-Version und kontrolliertem Test-HA.
Preconditions: MT-46-Testdaten; Errorpayload mit mindestens einer Device Group,
einem Standalone Issue, mehreren direkten/indirekten Automationtreffern und
langen Namen; Tracequelle verfügbar und separat störbar.
Exact route/page: `/system/errors?returnTo=%2Fd%2F<test-dashboard-id>`.
Test data/entity/card required: Device-/Standalone-Issue, disabled Automation,
lange Namen, 1-/2-/3-Spaltenansicht, Dark/Light.
Configuration required: Sprint-22-Testregeln lassen die beiden Issues aktiv;
Automationreferenzen/Traces entsprechen MT-46; gültiges internes Return Target.

### Steps

1. Öffne Errors in Light Mode bei breitem Fenster und prüfe Impact Counts für
   Device Group und Standalone Issue.
2. Klappe zuerst Childdetails, dann Automation Impact auf und zu; prüfe ARIA-
   Zustand, Fokus und dass beide Bereiche unabhängig bleiben.
3. Prüfe Direct-/Area-/Label-Labels, Disabled-/Unavailable-Kontext und letzte
   Triggerzeit bei langen Namen.
4. Öffne Advanced Diagnostics erst jetzt und beobachte genau eine gebündelte
   Trace-Abfrage; klappe den Bereich mehrfach, ohne unnötige Neuabfrage im TTL.
5. Prüfe Trace Error, Condition false und Not triggered sowie den Hinweis, dass
   Impact keine Ursache beweist.
6. Wechsle 1/2/3 Columns, verkleinere bis schmalen Viewport und prüfe
   Umbruch/Overflow; wiederhole in Dark Mode.
7. Unterbrich nur die Tracequelle, lade neu/öffne erneut und prüfe kontrollierte
   unsupported/error/stale-Anzeige bei weiterhin sichtbarem statischem Impact.
8. Kehre über Back exakt zum Testdashboard zurück.

### Expected Result

- Details sind initial collapsed, tastatur-/mausbedienbar und ohne horizontale
  Scrollbar; lange Namen brechen/kürzen kontrolliert.
- Trace lädt nur on-demand, ist reduziert und sein Ausfall isoliert.
- Theme, Columns und sicherer Return bleiben erhalten.

### Fail If

- Collapse-Zustände koppeln sich, Fokus geht verloren oder Inhalte überlaufen.
- Opening/Filtering löst HA-Write aus, Trace lädt bereits im Header oder Raw-
  Daten erscheinen.
- Traceausfall entfernt statischen Impact oder setzt global Health falsch.

### Evidence

- Screenshots der initial geschlossenen und geöffneten Bereiche in Light/Dark;
  Network-Requestzählung, Safari-Version und Partial-Failure-Resultat.

### Result

NOT TESTED

## MT-48

Test ID: MT-48

Sprint: 23
Requirement: Automation Impact und Advanced Diagnostics auf Safari iOS 9 in
Portrait/Landscape, HomeScreen und allen sinnvollen Spaltenansichten.
Device: iPad mini 1, iOS 9.3.5, HomeScreen-Web-App.
Preconditions: Datenschutzsichere MT-46-Testdaten; aktuelle Anwendung zum
HomeScreen hinzugefügt; mindestens eine Device Group und ein Standalone Issue
mit Impact; Trace verfügbar oder bewusst als unsupported vorbereitet.
Exact route/page: Ausgang `/d/<test-dashboard-id>`, danach
`/system/errors?returnTo=...`.
Test data/entity/card required: lange Automation-/Device-/Area-Namen,
direct/indirect, disabled, letzte Triggerzeit; 1-/2-/3-Column-Präferenz.
Configuration required: Testpayload aus MT-46, gültiges Return Target,
persistierbare Theme-/Spaltenpräferenz; kein Admin-Credential auf dem iPad.

### Steps

1. Starte das Dashboard vom HomeScreen in Portrait und öffne Errors über den
   Health Indicator.
2. Prüfe initial geschlossene Automation-Impact- und Advanced-Diagnostics-
   Bereiche; tippe Impact auf/zu und beobachte genau eine Zustandsänderung.
3. Klappe Device Children auf und prüfe, dass die Automationdetails weder
   verschwinden noch versehentlich Child-/Card-Aktionen auslösen.
4. Öffne Advanced Diagnostics, warte auf Trace/Unsupported-Status und prüfe
   alle Texte, lange Namen und Touchziele auf Lesbarkeit.
5. Schalte zwischen 1/2/3 Columns; akzeptiere responsiven Fallback, aber keine
   horizontale Seitenscrollbar oder überlappende Cards.
6. Wechsle Light/Dark, drehe nach Landscape und wiederhole Schritte 2 bis 5.
7. Navigiere Summary → Errors → zurück zum exakten Ausgangsdashboard und
   prüfe, dass der HomeScreen-Kontext erhalten bleibt.

### Expected Result

- Alle Toggle reagieren einmal pro Tap, Touchziele sind ungefähr 44 px und
  Details bleiben in Portrait/Landscape lesbar.
- Direct/Indirect/Disabled/Trace werden ohne reine Farbcodierung verständlich.
- Kein Overflow, kein Safari-Wechsel, kein UI-Absturz bei unsupported Trace.

### Fail If

- Doppelte Touchreaktion, eingefrorener Toggle, abgeschnittener Inhalt,
  horizontales Scrollen oder Verlassen der HomeScreen-App.
- Advanced Diagnostics benötigt moderne API, bleibt leer ohne Erklärung oder
  zeigt Rohdaten.

### Evidence

- Fotos in Portrait und Landscape, Light/Dark und mit geöffnetem Impact;
  notiere Column-Auswahl, Trace-Status, iOS-Version und jedes Einzelergebnis.

### Result

NOT TESTED

## MT-49

Test ID: MT-49

Sprint: 23
Requirement: Nichtregression der Automation-Impact-/Trace-Oberfläche auf dem
bekannten iPad-Air-2-Safari-Ziel.
Device: iPad Air 2, iPadOS 15.8.5, Safari und optional dieselbe HomeScreen-App.
Preconditions: Dieselben datenschutzsicheren Testdaten wie MT-48; kein Admin-
Token auf dem Gerät gespeichert; direct/indirect/disabled und Tracebeispiele.
Exact route/page: `/system/errors?returnTo=%2Fd%2F<test-dashboard-id>`.
Test data/entity/card required: eine Device Group und ein Standalone Issue mit
langen Automationnamen, 1-/2-/3-Column-Präferenz, Light/Dark.
Configuration required: dieselben Sprint-22-/23-Testregeln wie MT-48,
gültiges Return Target und keine Admin- oder HA-Credentials im Browser.

### Steps

1. Öffne Errors in Portrait und prüfe initial collapsed Impact/Diagnostics.
2. Tippe jeden Toggle auf und zu; prüfe Fokus, ARIA-Wirkung, genau eine
   Reaktion und unveränderte Childdetails.
3. Öffne Advanced Diagnostics, prüfe Trace-/Capabilitytexte und lange Namen.
4. Wechsle 1/2/3 Columns und Light/Dark, dann drehe nach Landscape.
5. Prüfe in beiden Orientierungen auf Überlauf, Clipping, Card-Kompression und
   erreichbare Touchziele.
6. Navigiere zum Custom-Dashboard zurück und wieder zu Errors; prüfe
   Same-Window-/Return- und Theme-/Column-Persistenz.

### Expected Result

- Impact und Advanced Diagnostics bleiben in beiden Orientierungen vollständig
  bedienbar; kein früherer Focus-/Flex-Kompressionseffekt tritt auf.
- Interne Navigation bleibt same-window; Theme/Columns bleiben persistent.

### Fail If

- Card oder Toggle ist komprimiert, links versetzt, abgeschnitten oder nicht
  bedienbar.
- Navigation öffnet normales Safari/neuen Tab oder verliert das Rückziel.
- Trace-/Impactanzeige verändert einen HA-Zustand.

### Evidence

- Je ein Screenshot Portrait/Landscape mit geöffneten Details; notiere Safari-
  Modus, Theme, Columns, Rückziel und Ergebnis.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 04

## MT-11

Test ID: MT-11

Sprint: 17.2
Requirement: Sichtbare Kartenidentität und primärer Compact-Inhalt für Sensor,
Binary, Light und Climate.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Ein Testdashboard mit je einer sichtbaren Sensor-, Binary-,
Light- und Climate-Karte in der jeweils kleinsten aktuell gültigen Größe; das
Light und Climate dürfen nur bei vorhandener expliziter Control-Freigabe
bedienbar sein. Verwende zusätzlich mindestens einen langen Kartentitel und
einen langen `friendly_name`-Fallback.
Exact route/page: `/d/<test-dashboard-id>` in der HomeScreen-Web-App.
Test data/entity/card required: Sensor mit Wert und Unit, Binary in aktivem und
inaktivem Zustand, verfügbares Light, verfügbares Climate mit Ist-/Sollwert;
keine privaten Namen auf dem späteren Beweisfoto.

### Steps

1. Öffne das Testdashboard im Portraitmodus und warte auf den Status `Online`.
2. Prüfe auf jeder der vier Karten die sichtbare Raum-/Kartenidentität.
3. Prüfe Sensorwert plus Unit und den ausgeschriebenen Binary-Zustand.
4. Prüfe Light-Zustand und sichtbaren Power-Control, ohne ihn zunächst zu
   betätigen.
5. Prüfe auf Climate die im kompakten Grid vorgesehene Primärinformation und
   öffne anschließend den Climate-Focus für Sollwert und Controls.
6. Wiederhole Schritt 2 bis 5 im Landscape-Modus.
7. Wiederhole die Sichtprüfung einmal in Light und einmal in Dark.

### Expected Result

- Jede Karte zeigt eine verständliche Identität; keine Karte besteht nur aus
  Icon, Wert oder Zustand.
- Wert, Unit und Zustand bleiben innerhalb der Kartengrenzen.
- Lange Identitäten werden einzeilig und kontrolliert gekürzt.
- Keine Karte überlappt eine Nachbarkarte; es entsteht keine horizontale
  Seitenscrollbar.
- Light-/Climate-Controls sind mindestens ungefähr 44 px groß und erreichbar.

### Fail If

- Identität fehlt, wird von Wert/Controls verdeckt oder läuft über die Karte.
- Text oder Control wird abgeschnitten, überlappt oder liegt außerhalb der
  Karte.
- Eine nicht autorisierte oder nicht verfügbare Entity erscheint bedienbar.
- Das Dashboard verlässt den HomeScreen-Modus.

### Evidence

- Je ein Foto/Screenshot in Portrait und Landscape sowie Notiz zu Light/Dark.
- Notiere Dashboard-ID, verwendete Kartengrößen, iOS-Version und Zeitpunkt.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 11

## MT-37

Test ID: MT-37

Sprint: 21.4
Requirement: Entity Rule Manager mit vollständiger Metadatensuche,
kombinierten Filtern, drei Regeln je Entity und gemeinsamem Save/Discard.
Device: Mac mit aktueller macOS-Safari-Version.
Preconditions: Aktueller Build; Admin API aktiviert; separater Test-Admin-
Token; kontrolliertes Test-HA mit mindestens 30 Entities aus mehreren Domains,
Areas und Devices; je eine bereits gesetzte Summary-Ignore-, Security- und
Error-Ignore-Regel; keine Produktions-Credentials im Browserbild.
Exact route/page: `/admin`, Dialog „Entity Rules“.
Required dashboard/system state: Eine gültige gespeicherte Konfiguration und
erreichbares sanitisiertes Admin-Entity-Inventar.
Required severity/state setup: Mindestens eine `unknown`- und eine
`unavailable`-Entity; diese Zustände dürfen die Regelbearbeitung nicht blockieren.
Orientation/mode: Desktopfenster einmal breit und einmal auf etwa Tabletbreite;
normaler Safari-Tab.

### Steps

1. Öffne `/admin`, melde dich mit dem separaten Admin-Token an und öffne
   „Entity Rules“.
2. Prüfe bei drei Entities Friendly Name, Entity-ID, Area, Device und Domain;
   kontrolliere, dass keine MAC, Seriennummer, Registry-Identifier oder rohe
   Attribute erscheinen.
3. Suche nacheinander nach Friendly Name, vollständiger Entity-ID, Device,
   Area und Domain und lösche zwischen den Suchen das Feld vollständig.
4. Kombiniere eine Suche mit Area-, Domain- und Device-Filter und vergleiche
   jeden Treffer mit den vorbereiteten Metadaten.
5. Aktiviere „Nur konfigurierte“ und bestätige, dass jede Entity mit mindestens
   einer der drei Regeln erscheint und unkonfigurierte Entities verschwinden.
6. Setze an drei unterschiedlichen Entities je eine der Regeln „In Summary
   ignorieren“, „Sicherheitsrelevant“ und „In Errors ignorieren“; entferne
   zusätzlich eine bereits gespeicherte Regel.
7. Prüfe den sichtbaren Dirty-State und kontrolliere in Safaris Netzwerkansicht,
   dass noch kein Speicherequest gesendet wurde.
8. Klicke „Änderungen verwerfen“ und bestätige die vollständige Rückkehr zum
   gespeicherten Stand.
9. Wiederhole die vier Änderungen, klicke einmal „Speichern“ und bestätige
   genau einen geschützten Konfigurationsrequest.
10. Lade `/admin` neu und prüfe alle vier persistierten Ergebnisse. Provoziere
    anschließend in einer kontrollierten Testinstanz einen Save-Fehler,
    bestätige verständliche Fehlermeldung und erfolgreichen Retry.

### Expected Result

- Suche und Filter sind case-insensitive, kombinierbar und arbeiten ohne
  Request pro Tastendruck.
- Jede Entity erscheint einmal und bietet alle drei klar beschrifteten Regeln.
- Änderungen bleiben bis Save lokal; Discard und Fehler bewahren den letzten
  gespeicherten Stand; Retry funktioniert.
- Speichern sendet genau einen authentifizierten Konfigurationswrite und
  erzeugt weder HA-Service- noch Registry-/Label-Write.
- Das schmalere Fenster erzeugt keine horizontale Seitenscrollbar und behält
  sichtbare Fokuszustände.

### Fail If

- Metadatensuche/-filter liefert falsche Treffer oder eine Entity erscheint
  mehrfach.
- Regelklick schreibt sofort, Discard verliert den gespeicherten Stand oder
  Save sendet mehrere Konfigurationsrequests.
- Secrets/Rohregistries erscheinen oder „Sicherheitsrelevant“ erteilt eine
  Control-Freigabe.
- Save-Fehler löscht Änderungen, meldet Erfolg oder verhindert Retry.

### Evidence

- Screenshots von kombinierter Suche, Dirty-State und gespeichertem Stand.
- Safari-Version und Netzwerkrequest-Zahl; keine Tokenwerte aufnehmen.
- Ergebnis je Suchdimension und je Regel notieren.

### Result

NOT TESTED

## MT-38

Test ID: MT-38

Sprint: 21.4
Requirement: Touchbedienbarer Entity Rule Manager ohne Massendropdowns bei
großem Inventar.
Device: iPad Air 2, iPadOS 15.8.5, Safari.
Preconditions: Aktueller Build und `RQ-04-01` vor finaler Abnahme behoben;
separater Test-Admin-Token; kontrolliertes Inventar mit 3000 Entities, ungefähr
500 Devices und 50 Areas; mindestens zehn konfigurierte Entities.
Exact route/page: `/admin`, Dialog „Entity Rules“.
Required dashboard/system state: Gültige Admin-Konfiguration; erster ungefilterter
Trefferumfang größer als 100.
Required severity/state setup: Nicht relevant für die Regelwirkung; gemischte
available/unknown/unavailable Entities im Inventar.
Orientation/mode: Safari, Portrait und Landscape; kein Legacy-HomeScreen-Zwang
für die moderne Admin UI.

### Steps

1. Öffne den Rule Manager im Portraitmodus und prüfe, dass die ungefilterte
   Ansicht höchstens 100 vollständige Karten plus einen verständlichen
   Begrenzungshinweis rendert.
2. Tippe Suchfeld, Area-, Domain- und Device-Filter nacheinander und prüfe
   Reaktion, Fokus und Bildschirmtastatur.
3. Kombiniere alle Filter, scrolle vom ersten bis zum letzten Treffer und
   kontrolliere Seiten- und Kartengeometrie.
4. Tippe jede der drei Checkboxzeilen mittig und nahe am Labelrand; bestätige,
   dass jeweils genau die beabsichtigte Regel umschaltet.
5. Aktiviere „Nur konfigurierte“, ändere fünf Regeln und prüfe Dirty-State,
   Discard und erneutes Setzen mit einem einzigen Save.
6. Drehe nach Landscape und zurück nach Portrait; wiederhole Suche, Scrollen
   und einen Checkbox-Tap.

### Expected Result

- Kein großes Device-/Entity-Massendropdown und höchstens 100 gerenderte
  Treffer; Suche/Filter bleiben ohne spürbare Mehrsekundenblockade nutzbar.
- Checkboxzeilen sind ungefähr 44 px hoch, eindeutig beschriftet und mit einem
  Tap bedienbar.
- Keine horizontale Seitenscrollbar, abgeschnittene Controls oder verlorener
  Dirty-State bei Rotation.
- Save/Discard entspricht MT-37 und löst keine HA-Schreibaktion aus.

### Fail If

- Tausende Vollkarten werden gleichzeitig gerendert, Safari friert ein oder
  Filter erzeugen Requests pro Tastendruck.
- Touchziel ist zu klein, falsche Checkbox schaltet oder Doppeltap ist nötig.
- Rotation verursacht horizontales Scrollen, überlappende Karten oder verliert
  ungespeicherte Änderungen.

### Evidence

- Fotos/Screenshots Portrait und Landscape, Trefferhinweis und Touchzeilen.
- Beobachtete Reaktionszeit, Trefferzahl und Safari/iPadOS-Version notieren.

### Result

NOT TESTED

## MT-39

Test ID: MT-39

Sprint: 21.4
Requirement: Kompakte gemeinsame Summary-/Error-Header mit genau einer
dominanten Gesamtzahl, klaren Filterdimensionen und responsiver Toolbar.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build; `RQ-04-01` behoben und Cache erneuert;
kontrollierter Snapshot mit 12 Summary-Items und 10 Error-Issues aus mehreren
Severity-/State-Klassen einschließlich Device Group.
Exact route/page: `/system/summary?returnTo=%2F` und
`/system/errors?returnTo=%2F`.
Required dashboard/system state: Fresh/online; Summary- und Error-Listen nicht
leer; Filtercounts vorab dokumentiert.
Required severity/state setup: Mindestens je ein critical, error, warning,
info, unavailable und unknown Issue; mindestens eine Gruppe mit mehreren
Children.
Orientation/mode: HomeScreen, Portrait und Landscape, Hell und Dunkel.

### Steps

1. Öffne Summary im Portraitmodus und zähle alle Stellen, an denen die
   Gesamtzahl 12 prominent erscheint.
2. Prüfe Titel, Back-Link, qualitative Online-/Stale-Anzeige, Teilfiltercounts
   und 1/2/3-Spaltensteuerung; „Alle“ darf 12 nicht erneut anzeigen.
3. Wähle zwei Teilfilter und jede Spaltenoption; prüfe Filter-Empty-State und
   unveränderte Headergesamtzahl.
4. Öffne Errors und wiederhole die Count-Prüfung für 10 Issues.
5. Prüfe getrennte Zeilen für Severity und State, überlappende Counts sowie
   erhaltene Device Groups; wähle kombinierte Filter.
6. Drehe beide Seiten nach Landscape, wechsle Hell/Dunkel und prüfe Toolbar,
   Back-Link, Filter und Karten auf Überlauf.
7. Wiederhole mit leerem Summary-/Error-Snapshot und bestätige einen einzigen
   verständlichen Empty State sowie qualitativen Error-Status `OK`.
8. Unterbrich die Datenquelle kontrolliert und bestätige, dass Stale-/Offline-
   Hinweise trotz Filter erhalten bleiben.

### Expected Result

- Pro Seite erscheint die dominante Gesamtsumme genau einmal; „Alle“ und eine
  redundante Statuszeile wiederholen sie nicht.
- Teilfiltercounts bleiben korrekt; Severity und State werden nicht künstlich
  zu einer Summe vermischt.
- Toolbar bricht ohne horizontale Seitenscrollbar um; Back, Filter und Columns
  bleiben ungefähr 44 px hoch und bedienbar.
- Empty, Stale und Offline bleiben verständlich und werden nicht durch die
  Headervereinfachung entfernt.

### Fail If

- Gesamtzahl erscheint mehrfach prominent oder relevante Counts fehlen/falsch
  sind.
- Toolbar, Titel oder Controls überlaufen/überlappen in einer Orientierung.
- Filter verstecken Stale/Offline oder Empty zeigt mehrfach Nullsummen.

### Evidence

- Je ein Foto Summary/Errors in Portrait und Landscape; zusätzlich Empty und
  Stale/Offline.
- Erwartete und sichtbare Counts tabellarisch notieren.

### Result

NOT TESTED

## MT-40

Test ID: MT-40

Sprint: 21.5, 25.1, 25.2, 25.4
Requirement: Summary-/Health-Navigation, fail-safe Healthzustände, exaktes
Return Target und Erhalt des HomeScreen-Kontexts auf der Legacy-Zielhardware.
Device: iPad mini 1, iOS 9.3.5, als vom HomeScreen gestartete Web-App.
Preconditions: Aktueller Build; `RQ-04-01` behoben und Cache erneuert; ein
Default- und ein Custom-Dashboard `/d/health-audit`; kontrollierbare Testdaten
für healthy, info-only, warning, error, critical, stale und API-Ausfall; keine
Admin-Credentials auf dem iPad.
Exact route/page: `/`, `/d/health-audit`, `/system/summary` und
`/system/errors` mit generiertem `returnTo`.
Required dashboard/system state: Für jeden Schritt exakt der genannte globale
Healthzustand; sichtbare Errorfilter dürfen den Backendstatus nicht verändern.
Required severity/state setup: Je ein isolierter warning-, error-, critical-
und info-Fall; stale healthy; stale last-known critical; nie gültiger/unknown
Status; kontrollierter Status-API-Fehler.
Orientation/mode: HomeScreen-Vollbild, kompletter Ablauf in Portrait und die
Custom-/Critical-/Stale-Schritte zusätzlich in Landscape.

### Steps

1. Starte die App vom HomeScreen auf `/` bei fresh healthy: Summary muss
   sichtbar, Health verborgen sein. Tippe Summary und danach `Zurück`.
2. Wiederhole fresh info-only; es darf weiterhin kein Alarmindikator erscheinen.
3. Stelle warning her, prüfe sichtbaren Indicator inklusive Symbol/zugänglicher
   Bedeutung und tippe ihn; Errors muss im selben Vollbildfenster öffnen.
4. Filtere auf der Error-Seite das Warning-Issue aus und wechsle die Spalten;
   kehre zurück. Der globale Indicator darf dadurch nicht verschwinden.
5. Wiederhole mit error und critical und bestätige die jeweilige höhere
   Darstellung sowie die Navigation zu Errors.
6. Öffne `/d/health-audit`, tippe Summary, wechsle dort zu Errors und tippe
   `Zurück`; bestätige exakt `/d/health-audit`. Lade Summary und Errors jeweils
   vor dem Back-Tap neu und wiederhole.
7. Stelle stale healthy und stale last-known critical her; beide müssen sichtbar
   bleiben und Errors öffnen. Prüfe danach no-initial/unknown.
8. Unterbrich nur den kleinen Status-Endpunkt bis zum Timeout bzw. Fehler und
   bestätige Unknown oder Last-known Stale statt Healthy; stelle ihn wieder her
   und prüfe Recovery ohne Seitenreload.
9. Drehe im Custom Dashboard mit critical Indicator nach Landscape und zurück;
   wiederhole Health-Tap und Back.
10. Prüfe nach jedem Navigationsschritt, dass keine normale Safari-Adress-/Tab-
    Ansicht geöffnet wurde und die HomeScreen-App dieselbe Instanz bleibt.

### Expected Result

- Summary ist immer neutral sichtbar; fresh healthy und info-only haben keinen
  Alarmindikator.
- Warning/Error/Critical sind sichtbar und unterscheidbar; stale/unknown/API-
  Fehler können niemals als unsichtbares Healthy erscheinen.
- Indicator öffnet Errors; Filter und Columns verändern den globalen Health-
  Zustand nicht.
- Default kehrt zu `/`, Custom exakt zu `/d/health-audit` zurück, auch nach
  Reload; alle Schritte bleiben im HomeScreen-Fenster.
- Touchziele sind ungefähr 44 × 44 px, kein Headerüberlauf in Portrait oder
  Landscape.

### Fail If

- Summary fehlt, Info-only alarmiert oder ein relevanter/stale/unknown Zustand
  zeigt keinen Indicator.
- Ausgefiltertes Critical/Warning macht den globalen Header fälschlich healthy.
- Back landet auf `/` statt Custom, auf externer URL oder öffnet normales Safari.
- API-Fehler löscht Last-known Critical oder zeigt falsche Entwarnung.

### Evidence

- Kurzes Video des vollständigen HomeScreen-Ablaufs; Fotos aller sieben
  Healthklassen und beider Orientierungen.
- Vor/nach jeder Navigation exakten sichtbaren Pfad und Zustand notieren, ohne
  private Entitynamen oder Tokens aufzunehmen.

### Result

NOT TESTED

## MT-41

Test ID: MT-41

Sprint: 21.5, 25.2
Requirement: Same-window-/same-origin-Navigation und Return-Nichtregression auf
dem bekannten iPad-Air-2-Safari-Ziel.
Device: iPad Air 2, iPadOS 15.8.5, Safari sowie optional dieselbe Seite als
HomeScreen-Web-App.
Preconditions: Aktueller Build; `/` und `/d/health-audit` vorhanden; fresh
warning und critical testbar; Cache erneuert.
Exact route/page: `/`, `/d/health-audit`, `/system/summary`, `/system/errors`.
Required dashboard/system state: Fresh warning, anschließend critical.
Required severity/state setup: Je mindestens ein warning und critical Issue.
Orientation/mode: Portrait und Landscape; normaler Safari-Tab, anschließend
HomeScreen falls installiert.

### Steps

1. Öffne `/d/health-audit` in Safari und notiere Tabanzahl und Origin.
2. Tippe Summary, wechsle zu Errors und `Zurück`; prüfe denselben Tab, Origin
   und exakten Custom-Pfad.
3. Tippe bei warning den Health Indicator und kehre zurück; wiederhole bei
   critical.
4. Wiederhole Schritte 2 und 3 in Landscape.
5. Falls HomeScreen installiert ist, starte die App dort und wiederhole den
   Custom→Summary→Errors→Back-Ablauf.
6. Rufe Summary direkt ohne `returnTo` auf und prüfe den sicheren Fallback `/`.

### Expected Result

- Kein neuer Tab/Fenster und kein Origin-/Host-/Portwechsel.
- Summary/Errors wechseln im selben Kontext und kehren exakt zum Custom-
  Dashboard zurück; Direktaufruf fällt auf `/` zurück.
- Warning/Critical bleiben sichtbar und bedienbar; Layout bleibt in beiden
  Orientierungen stabil.

### Fail If

- Navigation öffnet einen neuen Tab, normales Safari aus HomeScreen, einen
  anderen Origin oder verliert das Custom-Return-Ziel.
- Back hängt in einer Systemroute fest oder der Indicator ist nicht bedienbar.

### Evidence

- Bildschirmaufnahme mit sichtbarem Tab-/HomeScreen-Kontext sowie Portrait-
  und Landscape-Screenshots.
- Safari-/iPadOS-Version und exakte Routenfolge notieren.

### Result

NOT TESTED

## MT-42

Test ID: MT-42

Sprint: 21.5, 25.1, 25.2, 25.4
Requirement: Globale Healthberechnung, Failure-Fallback,
Filterunabhängigkeit, Open-Redirect-Abwehr und stabiler Langzeitbetrieb im
Desktop-Safari.
Device: Mac mit aktueller macOS-Safari-Version und kontrolliertem lokalen
Test-HA/Gateway.
Preconditions: Aktueller Build; Default/Custom Dashboard; kontrollierte
Snapshots für alle Severities; Möglichkeit, ausschließlich den Status-Endpunkt
mit Timeout, leerer und malformed Antwort zu simulieren; DevTools geöffnet.
Exact route/page: `/`, `/d/health-audit`, `/system/summary`, `/system/errors`.
Required dashboard/system state: nacheinander fresh healthy, info-only,
warning, error, critical, stale healthy, stale critical, unknown sowie API-
Timeout/empty/malformed.
Required severity/state setup: Mindestens eine Device Group mit critical Child,
das durch UI-Filter ausblendbar ist, während der globale Snapshot unverändert
bleibt.
Orientation/mode: Normaler Safari-Tab, Desktopbreite und schmales Fenster.

### Steps

1. Durchlaufe alle genannten Healthzustände und protokolliere Sichtbarkeit,
   Klasse, Symbol, Titel/zugänglichen Namen und Ziel des Indicators.
2. Bei critical öffne Errors, filtere das critical Child vollständig aus und
   ändere die Spaltenpräferenz; kehre zum Dashboard zurück und prüfe weiterhin
   critical Health.
3. Simuliere nacheinander Timeout, leere JSON-Antwort, syntaktisch gültige aber
   unvollständige Antwort und HTTP-Fehler. Prüfe bei initialem sowie last-known
   critical Zustand den fail-safe Fallback.
4. Stelle den Endpunkt wieder her und prüfe automatische Recovery ohne
   kompletten Browserreload.
5. Teste manuell Return-Queries mit externer URL, `//host`, `javascript:`,
   `data:`, unbekannter Dashboard-ID und malformed Encoding; keine Anfrage darf
   zu einem externen Origin navigieren.
6. Lass das Dashboard mindestens 60 Minuten mit normalem Refresh laufen,
   wechsle mehrfach warning→critical→healthy und beobachte CPU, Speicher,
   Requestzahl, doppelte Handler sowie Headerflackern.
7. Wiederhole Navigation und Headerprüfung bei schmalem Fenster und Dark Mode.

### Expected Result

- Sichtbarkeit folgt exakt globaler Severity; Info-only alarmiert nicht;
  stale/unknown/alle API-Fehler bleiben fail-safe sichtbar.
- Lokale Filter/Columns verändern weder globalen Status noch Serverdaten.
- Alle unsicheren Return Targets fallen intern zurück; kein Open Redirect.
- Nach 60 Minuten bleibt genau ein vorhandener Dashboard-Refresh aktiv, keine
  anwachsenden parallelen Requests/Handler und kein merklicher ungebremster
  Speicheranstieg.
- Recovery aktualisiert den Indicator ohne Seitenreload.

### Fail If

- irgendein Failure als Healthy verschwindet, Filter den globalen Health-
  Indicator ändert oder externe Navigation gelingt.
- Requests/Handler vervielfachen sich, Speicher wächst kontinuierlich ohne
  Stabilisierung oder Header flackert bei unverändertem Zustand.
- schmale/Dark-Darstellung verdeckt Navigation oder Fokus.

### Evidence

- Screenshots aller Statusklassen und unsicherer Return-Fallbacks.
- Safari-Netzwerk-/Speicheraufzeichnung zu Beginn und nach 60 Minuten;
  Requestanzahl und beobachtete Recovery notieren.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 09

## MT-30

Test ID: MT-30

Sprint: 21
Requirement: Reale read-only Registry-/Diagnoseanreicherung, Quellenstatus,
Partial Failure, stale Metadaten und Recovery über den Standalone-Transport.
Device: Mac mit macOS 13.7.8 und der dort installierten Safari-Version;
Standalone-LXC `ha-legacy-dashboard` gegen ein kontrolliertes Test-Home-
Assistant.
Preconditions: Auditstand ist auf einem separaten Test-/LXC-Dienst ausgerollt;
die automatisierten Gates `RQ-04-01` und `RQ-09-01` sind geschlossen; eigener
Test-Admin-Token; keine Produktions-`.env` oder Secrets im Browser/Screenshot;
ein Proxy oder Testnetz kann den HA-WebSocket getrennt von REST unterbrechen.
Exact route/page: `/system/errors`, `/system/summary`, `/admin` und
`/api/admin/system-diagnostics/status` derselben LXC-Origin.
Required Home Assistant state/data: eine verfügbare primäre Entity, je eine
`unavailable`- und `unknown`-Entity, eine `diagnostic`- und eine
`config`-Entity, ein `setup_error`- und ein `setup_retry`-Config Entry sowie
eine Repair-Warnung, falls die installierte HA-Version Repairs read-only
bereitstellt.
Required device/entity setup: mindestens zwei Testentities mit derselben
echten Device-ID; Device mit `name_by_user`, Area und Config Entry; zweite
Entity mit Entity-Area, die bewusst von der Device-Area abweicht; eine
disabled Entity; ein Registry-only-Eintrag ohne State.
Orientation: breites und schmales Safari-Fenster; Orientierung ist am Mac nur
als Viewportsimulation relevant.

### Steps

1. Öffne `/admin`, authentifiziere dich mit dem separaten Admin-Token und
   notiere Commit, LXC-URL, HA-Version und Safari-Version ohne Secrets.
2. Öffne den Bereich `Diagnostic Sources`. Prüfe Entity Registry, Device
   Registry, Area Registry und Config Entries auf `Verfügbar`; prüfe Repairs
   auf `Verfügbar` oder nachvollziehbar `Nicht unterstützt` und Matter auf
   kontrolliert `Nicht unterstützt`.
3. Öffne `/system/errors`. Prüfe bei den Testissues Device-Name, Area,
   Integration, Entity-ID, State und Dauer. Die explizite Entity-Area muss vor
   der Device-Area erscheinen; es darf keine Area aus einem Namen geraten
   werden.
4. Öffne `/system/summary`. Bestätige, dass primäre Aktivitäten unverändert
   erscheinen und `diagnostic`/`config` die normale Summary nicht stören.
5. Prüfe, dass disabled und Registry-only kein künstliches unavailable- oder
   orphaned-Issue erzeugen. Hidden darf allein kein Issue erzeugen; ein echter
   unknown/unavailable-State bleibt unabhängig davon auswertbar.
6. Prüfe Config Entry `setup_error` als Error, `setup_retry` kontrolliert als
   Warning und `loaded` ohne Issue. Falls Repairs verfügbar sind, prüfe
   Severity und den rein informativen Fixable-Hinweis; es darf keinen Fix-
   Button geben.
7. Unterbrich ausschließlich den HA-WebSocket, während REST `/api/states`
   erreichbar bleibt. Warte einen Diagnose-TTL-Zyklus und lade Errors,
   Summary sowie Adminstatus erneut.
8. Prüfe, dass State-Issues weiterlaufen, letzte gültige Metadaten als stale
   erhalten bleiben, ausgefallene Quellen gekennzeichnet sind und kein API-500
   oder falsches gesundes Ergebnis entsteht.
9. Stelle den WebSocket wieder her. Warte den nächsten kontrollierten Refresh
   ab und bestätige `Verfügbar`, aktualisierte Metadaten und entfernten stale-
   Zustand ohne Dienstneustart.
10. Öffne die Browser-Netzwerkanalyse nur für Gatewayantworten und prüfe, dass
    weder HA-/Supervisor-/Admin-Token noch Raw Registry, MAC, Seriennummer,
    Connections oder freie WebSocket-Commands enthalten sind.

### Expected Visual Result

- Diagnostic Sources unterscheiden Available, Unsupported, Stale und Error
  durch Text/Status, nicht nur Farbe.
- Error und Summary bleiben bei Teilfehlern lesbar; fehlende Area/Integration
  erzeugt weder kaputte Cards noch leere technische Platzhalter.
- Device-/Area-/Integration-Kontext ist korrekt und kompakt; Dark/Light bleibt
  beim Wechsel der Systemseiten konsistent.

### Expected Functional Result

- REST-State-Auswertung bleibt bei WebSocket-Ausfall aktiv; stale Metadaten
  werden erhalten und Recovery erfolgt automatisch.
- Config-/Repair-/Registry-Daten sind ausschließlich read-only und sanitisiert.
- Disabled/Registry-only erzeugen keine falschen Issues; keine Sichtbarkeit
  verändert einen Control Grant.

### Fail If

- WebSocket-Ausfall erzeugt API-500, leert bestehende State-Issues, behauptet
  gesund oder erholt sich nach der Reparatur nicht automatisch.
- Entity-Area verliert gegen Device-Area, Namen werden zur Area-/Device-
  Zuordnung benutzt oder gleichnamige Fremdgeräte werden vermischt.
- Token, Raw Registry, Identifier/Connection, Stacktrace oder Registry-/Repair-
  Aktion erscheint im Browser.
- Disabled/Registry-only wird als unavailable/orphaned gemeldet.

### Evidence

- Screenshots von Diagnostic Sources normal/stale/recovered sowie Errors und
  Summary vor/während/nach Partial Failure.
- Sanitisiertes Protokoll mit Commit, HA-/Safari-Version, Source-Status,
  Test-Entity-/Device-/Area-IDs und Zeitpunkten; keine Tokens oder privaten
  Produktionsdaten.

### Result

NOT TESTED

## MT-31

Test ID: MT-31

Sprint: 21.1
Requirement: Device-Gruppierung ausschließlich über echte `device_id`,
Standalone-Regeln, Filter/Counts, collapsed Childdetails und responsives
Layout im realen modernen Safari.
Device: Mac mit macOS 13.7.8 und der dort installierten Safari-Version gegen
ein kontrolliertes Test-Home-Assistant oder einen Real-App-Mock.
Preconditions: Aktueller Auditstand ausgerollt; `RQ-04-01` behoben und
Browsercache danach kontrolliert erneuert; keine privaten Namen/IDs in
Screenshots; System-Snapshot frisch.
Exact route/page: `/system/errors` derselben Origin, Rücknavigation zu einem
gültigen `/d/<device-group-test-dashboard-id>`.
Required Home Assistant state/data: mindestens ein critical, ein error, ein
warning und ein info Child; mindestens je ein unavailable und unknown;
frischer Empty-State-Datensatz.
Required device/entity setup: Device A mit vier problematischen Entities und
derselben realen Device-ID; Device B mit gleichem Friendly Name, aber anderer
Device-ID; eine Entity ohne Device-ID; je ein Config-Entry-, Repair- und
System-Issue; langer Device- und Child-Name.
Orientation: breites Desktopfenster und schmales Fenster unter 700 px.

### Steps

1. Öffne `/system/errors` breit und notiere Commit, Safari-/Assetversion und
   erwartete Child-/Gruppenzahlen.
2. Bestätige genau eine Device Group für die vier Children von Device A und
   eine getrennte Group für Device B trotz gleichen Namens. Prüfe, dass die
   Entity ohne Device-ID und System-/Config-/Repair-Issues Standalone bleiben.
3. Prüfe für Device A Titelpriorität, Area · Integration, `4 Entities
   betroffen`, höchste Child-Severity, propagiertes Security-Flag und Dauer
   des ältesten aktiven Child-Issues.
4. Prüfe den initial eingeklappten Zustand. Öffne `Details anzeigen` einmal,
   prüfe für alle vier Children Name/Entity-ID, State, Severity und Dauer und
   schließe mit genau einem Klick wieder. Beobachte `aria-expanded` in den
   Safari-Entwicklerwerkzeugen, falls verfügbar.
5. Betätige nacheinander Alle, jede Severity und Unknown/Unavailable. Prüfe
   Text/Active State, Counts, exakte sichtbare Children und einen echten Empty
   Filter State. Setze anschließend alle Filter zurück.
6. Verkleinere das Fenster unter 700 px. Prüfe eine Spalte, lange Namen,
   geöffnete Details, Scrollen bis zum Footer sowie fehlenden horizontalen
   Overflow. Verbreitere wieder und prüfe mindestens zwei Spalten.
7. Schalte Light/Dark, lade neu und prüfe dieselben Gruppen/Details. Öffne
   Summary und kehre über das validierte Return-Ziel exakt zum Testdashboard
   zurück.
8. Lade den frischen Datensatz ohne Issues und bestätige echten Empty State;
   anschließend stelle die Gruppenfixture wieder her.

### Expected Visual Result

- Gleiches `device_id` ergibt eine kompakte Group, gleiche Namen mit
  verschiedenen IDs bleiben sichtbar getrennt.
- Details starten eingeklappt, wachsen innerhalb der Card und enthalten nur
  reduzierte Childfelder; lange Namen überlappen keine Badge/Card/Footer.
- Schmales Fenster ist einspaltig, breites mindestens zweispaltig; keine
  horizontale Scrollbar, keine Überlappung oder künstlich riesige Mindesthöhe.
- Aktiver Filter ist auch ohne Farbwahrnehmung erkennbar.

### Expected Functional Result

- Jeder Filter-/Detailklick reagiert genau einmal und ohne Reload/HA-Abfrage.
- Gruppenseverity/Counts werden aus den passenden Children abgeleitet;
  Standalone-Issues gehen nicht verloren.
- Theme und same-origin/same-window-Rücknavigation bleiben erhalten.

### Fail If

- Gruppierung erfolgt über Name/Area/Integration oder trennt identische echte
  Device-IDs.
- Child fehlt, Count/Severity/Dauer ist falsch oder Filter matcht ein anderes
  Child derselben Group quer.
- Details reagieren doppelt/nicht, rohe Registrydaten erscheinen oder Layout
  scrollt horizontal/überlappt.
- Filter/Details lösen eine HA-Schreibaktion oder zusätzliche Registryabfrage
  pro Klick aus.

### Evidence

- Screenshots breit/schmal, collapsed/expanded, je Filterdimension, Empty und
  Light/Dark; kurzes Video der Detail-/Filterbedienung.
- Tabelle mit erwarteten/realen Device-IDs, Childzahlen, Severity/State-Counts
  und Safari-/Assetversion, ohne private Produktionsdaten.

### Result

NOT TESTED

## MT-32

Test ID: MT-32

Sprint: 21, 21.1
Requirement: Registry-Kontext, echte Device Groups, Filter/Details, Theme,
Scroll und Partial-Failure-Verhalten auf Safari iOS 9 im HomeScreen-Modus.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build ausgerollt; die automatisierten Gates
`RQ-04-01` und `RQ-09-01` sind geschlossen;
HomeScreen-Link verwendet dieselbe HTTP-Origin; kontrollierte Testdaten aus
MT-30/31; kein Admin-Token auf dem iPad; Cache nach Rollout erneuert.
Exact route/page: `/d/<device-group-test-dashboard-id>`, `/system/errors` und
`/system/summary` innerhalb derselben HomeScreen-Web-App.
Required Home Assistant state/data: frischer Snapshot, Device Group mit vier
Children (critical/error/warning/info und unavailable/unknown), Standalone-
Issue, langer Name, sicher simulierbarer Metadaten-WebSocket-Ausfall bei
weiterhin erreichbaren REST-States.
Required device/entity setup: zwei reale Device-IDs mit gleichem Anzeigenamen,
vier Entities auf Device A, eine Entity auf Device B, eine Entity ohne
Device-ID; Area und Integration vorhanden.
Orientation: Portrait und Landscape.

### Steps

1. Starte das Testdashboard über das HomeScreen-Icon im Portraitmodus und
   öffne Errors über die interne Systemnavigation. Prüfe, dass normales Safari
   nicht geöffnet wird.
2. Warte auf frische Daten und prüfe Device A als eine Group mit vier
   Children, Device B als getrennte Group und die Entity ohne Device-ID als
   Standalone. Vergleiche Titel, Area, Integration, Severity, Count und Dauer
   mit der vorbereiteten Fixture.
3. Öffne und schließe die Details je einmal per Tap. Prüfe alle Childwerte,
   lange Namen, Touchziel, einmalige Reaktion und flüssiges Scrollen bis zum
   Footer.
4. Nutze Alle, Severity- und State-Filter nacheinander. Prüfe Active State,
   korrekte sichtbare Children/Group-Severity, Empty Filter State und Reset.
5. Schalte Dark, lade die HomeScreen-Web-App neu und navigiere Errors →
   Summary → Errors → Zurück. Prüfe Theme, dasselbe Fenster/dieselbe Origin
   und das exakte Rückziel. Wiederhole kurz in Light.
6. Drehe auf Landscape. Wiederhole Gruppen-, Detail-, Filter-, Long-Name-,
   Scroll- und Overflowprüfung; drehe anschließend zurück auf Portrait.
7. Unterbrich nur die Backend-Metadaten-/Registry-WebSocket-Verbindung, nicht
   REST-States. Warte mindestens einen Diagnose-TTL-Zyklus und prüfe, dass
   State-Issues sichtbar bleiben, letzter Kontext stale bleibt oder fehlender
   Kontext sicher entfällt und kein falsches OK erscheint.
8. Stelle den WebSocket wieder her und bestätige automatische Recovery der
   Quellen/Metadaten ohne HomeScreen-Neustart.

### Expected Visual Result

- Portrait zeigt eine sichere einspaltige bzw. zur realen Breite passende
  Ansicht; Landscape zeigt mindestens zwei nutzbare Spalten entsprechend der
  aktuellen Spaltenwahl.
- Cards, Filter, lange Namen, Details, Footer und Hintergrund überlappen nicht
  und erzeugen keine horizontale Seitenscrollbar.
- Status, Severity und Active Filter sind durch Text/Symbol/Zustand und nicht
  nur Farbe verständlich; Light/Dark bleibt konsistent.

### Expected Functional Result

- Touch reagiert genau einmal; Details und Filter benötigen keinen Reload und
  keine zusätzliche HA-Abfrage.
- Echte Device-IDs bestimmen die Gruppen; missing/stale Metadaten ändern nicht
  still die Child-Severity und zerstören keine REST-State-Auswertung.
- HomeScreen, gleiche Origin und exaktes Return-Ziel bleiben erhalten; keine
  Schreibaktion und kein Credential erscheint.

### Fail If

- Normales Safari öffnet sich, Origin/Port/Rückziel ändert sich oder Theme geht
  beim Routenwechsel verloren.
- Gleichnamige verschiedene Devices werden vermischt, gleiche Device-ID wird
  getrennt oder Child/Severity/Count verschwindet.
- Tap reagiert doppelt/nicht, Details/Filter sind unbedienbar, horizontaler
  Overflow/Overlap oder JavaScriptabbruch tritt auf.
- Metadatenfehler leert Issues, meldet gesund, senkt Security-Severity still
  ab oder erholt sich nicht.

### Evidence

- Fotos/Screenshots Portrait/Landscape, collapsed/expanded, Filter, Light/Dark,
  stale und recovered; kurzes Video von HomeScreen-Navigation und Touch.
- Notiere iOS-Version, Dashboard-ID, Commit, Assetversion, erwartete IDs/
  Counts und Zeitpunkte ohne private Namen oder Tokens.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 10

## MT-33

Test ID: MT-33

Sprint: 21.2
Requirement: Summary-Kategoriefilter, eigener Empty State, stale/offline-
Sichtbarkeit und getrennt persistierte responsive Spalten auf Safari iOS 9.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build ist ausgerollt; `RQ-04-01` ist vor der finalen
Abnahme behoben und der Safari-Cache wurde kontrolliert erneuert; kein
Admin-Token auf dem iPad; ein gültiges internes Rückziel ist vorbereitet.
Exact route/page: `/d/<system-test-dashboard-id>` und
`/system/summary?returnTo=%2Fd%2F<system-test-dashboard-id>` derselben Origin.
Test data/entity/card required: je mindestens ein Summary-Item für `open`,
`powered`, eine Aktivkategorie (`running`, `cleaning` oder `movement`),
`climate`, `media` und `security`; außerdem ein Filter ohne Treffer sowie ein
sicher simulierbarer stale/offline-Snapshot.

### Steps

1. Starte das Dashboard über das HomeScreen-Icon in Portrait und öffne
   Summary über die interne Navigation; normales Safari darf sich nicht
   öffnen.
2. Prüfe Gesamtzahl, alle sieben Filtertexte/Counts und dass `Alle` aktiv ist.
3. Wähle nacheinander `Offen`, `Eingeschaltet`, `Aktiv`, `Klima`, `Medien` und
   `Sicherheit`. Vergleiche jedes sichtbare Item mit der Fixture; beobachte,
   dass kein Seitenreload und kein zweiter HA-/Gateway-Datenabruf erfolgt.
4. Wähle den vorbereiteten Filter ohne Treffer. Prüfe den eigenen Filter-
   Empty-State; der globale Systemstatus darf dadurch nicht zu gesund werden.
5. Wähle eine Spalte, drehe nach Landscape und wähle dort nacheinander zwei
   und drei Spalten. Prüfe Cardbreiten, lange Namen, Footer und horizontalen
   Overflow.
6. Lass drei Spalten ausgewählt, drehe nach Portrait. Prüfe den sicheren
   einspaltigen Cap. Drehe zurück: die gespeicherte Drei-Spaltenpräferenz muss
   wieder wirksam werden.
7. Lade Summary neu, öffne Errors, kehre zu Summary zurück und prüfe, dass die
   Summary-Spaltenpräferenz erhalten und von der Error-Präferenz getrennt ist.
8. Schalte Light/Dark, wiederhole Reload und Rücknavigation und prüfe Theme
   sowie Filterbedienung.
9. Simuliere stale und anschließend offline. Wähle erneut einen Filter ohne
   Treffer und prüfe, dass stale/offline-Banner und Zeitpunkt sichtbar bleiben.
10. Stelle frische Daten wieder her, wähle `Alle` und kehre über das exakte
    Rückziel zum Dashboard zurück.

### Expected Visual Result

- Aktive Filter und Spalten sind durch Text/ARIA-Zustand erkennbar, nicht nur
  durch Farbe; Touchziele sind ungefähr 44 px groß.
- Portrait bleibt ohne horizontales Scrollen einspaltig; Landscape erlaubt
  nutzbare zwei/drei Spalten, ohne Cards, Footer oder Hintergrund zu brechen.
- Filter-Empty, stale und offline bleiben visuell unterscheidbar.
- Light/Dark und lange Texte bleiben lesbar.

### Expected Functional Result

- Filterung und Spaltenwechsel arbeiten ausschließlich clientseitig auf dem
  geladenen Payload und lösen keine HA-Schreibaktion aus.
- Summary-Kategorien entsprechen der Serverklassifikation; die UI
  klassifiziert States nicht erneut.
- Präferenz überlebt Reload/Routewechsel und wird responsiv nur begrenzt,
  nicht überschrieben.
- HomeScreen, Origin und validiertes Rückziel bleiben erhalten.

### Fail If

- Ein Filter zeigt eine falsche Kategorie, ändert den globalen Status oder
  benötigt einen Reload/neuen Datenabruf.
- Stale/offline verschwindet im Filter-Empty-State.
- Portrait versucht zwei/drei Spalten, erzeugt Overflow oder überschreibt die
  gespeicherte Landscape-Präferenz.
- Theme geht verloren oder normales Safari öffnet sich.

### Evidence

- Fotos/Screenshots Portrait/Landscape für alle Filter, 1/2/3 Spalten,
  Filter-Empty, stale/offline und Light/Dark.
- Kurzes Video von Filter-/Spaltenwechsel und HomeScreen-Rücknavigation.
- Notiere Commit, Assetversion, iOS-Version, erwartete Kategorien/Counts und
  Ergebnis ohne private Namen oder Tokens.

### Result

NOT TESTED

## MT-34

Test ID: MT-34

Sprint: 21.2, 21.3, 25.1, 25.4
Requirement: Exakte Severity- und State-Filter mit AND auf demselben Child,
child-first Geräteaggregation, sichtbare Gruppenseverity und responsive
1/2/3-Spaltenansicht auf Safari iOS 9.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build; `RQ-04-01` vor Abnahme behoben; Cache erneuert;
kein Admin-Token auf dem iPad; frischer kontrollierter Snapshot.
Exact route/page: `/system/errors?returnTo=%2Fd%2F<system-test-dashboard-id>`
innerhalb derselben HomeScreen-Web-App.
Test data/entity/card required: eine Device Group mit genau vier Children:
`critical+unavailable`, `error+unknown`, `warning+unknown` und
`info+unavailable`; je ein Standalone-Issue pro Severity soweit möglich;
langer Device-/Childname; erwartete Counts schriftlich vorbereitet.

### Steps

1. Öffne Errors in Portrait und prüfe unveränderten globalen Gesamtstatus,
   Gesamtzahl sowie getrennte Severity-/State-Filtercounts.
2. Öffne die Device-Details und vergleiche alle vier Children samt Severity,
   State und Anzahl mit der Fixture.
3. Wähle einzeln `Critical`, `Error`, `Warning` und `Info`. Bei jeder Auswahl
   darf ausschließlich die exakt gleiche Severity erscheinen; öffne jeweils
   die Details und prüfe die sichtbare Gruppenseverity.
4. Wähle `Alle` Severity und nacheinander `Unavailable` sowie `Unknown` State.
   Prüfe ausschließlich passende Children und Counts.
5. Prüfe die Kombinationen `Critical + Unknown` (kein Child), `Error +
   Unknown` (genau Error-Child), `Warning + Unavailable` (kein Child) und
   `Info + Unavailable` (genau Info-Child). Damit darf kein Cross-Child-Match
   innerhalb derselben Device Group entstehen.
6. Erzeuge den Filter-Empty-State und bestätige, dass der globale Status oben
   weiterhin der ungefilterten serverseitigen Lage entspricht.
7. Prüfe Standalone-Issues mit denselben Severity-/State-Kombinationen.
8. Wähle in Landscape drei Spalten, dann zwei und eine; öffne Details in jeder
   Ansicht und prüfe Cardhöhe, Footer, lange Texte und Overflow.
9. Drehe mit Drei-Spaltenpräferenz nach Portrait. Prüfe den einspaltigen Cap
   und nach Rückkehr zu Landscape die wiederhergestellte Präferenz.
10. Schalte Light/Dark, lade neu und prüfe Filter-/Spaltenpersistenz,
    HomeScreen-Verbleib und Rücknavigation.

### Expected Visual Result

- Severity links und State rechts sind als getrennte Dimensionen verständlich;
  aktiver Zustand ist nicht nur farblich markiert.
- Device Card zeigt nur gematchte Children und daraus abgeleitete Severity,
  Counts und State; leere Groups verschwinden.
- Portrait, Landscape, Details, lange Namen und Footer bleiben ohne Overlap
  oder horizontale Scrollbar.

### Expected Functional Result

- Severity ist exakt, nicht kumulativ; Severity und State verwenden AND auf
  demselben Child.
- Filter verändern weder Source-Payload noch globalen Error-/Health-Status
  und lösen keine HA-Abfrage oder Write-Aktion aus.
- Spaltenpräferenz bleibt getrennt von Summary und responsiv erhalten.

### Fail If

- `Critical` enthält Error/Warning/Info oder eine andere Severity enthält
  Nachbarstufen.
- Eine Group matcht Severity auf Child A und State auf Child B.
- Sichtbare Group-Severity/Counts kommen aus ausgeblendeten Children oder der
  globale Status sinkt wegen eines Filters.
- Touch reagiert doppelt/nicht, Layout läuft horizontal über oder die
  HomeScreen-Web-App wird verlassen.

### Evidence

- Screenshot jeder Severity, beider States und der vier genannten
  Kombinationen mit geöffneten Details; Portrait/Landscape sowie 1/2/3
  Spalten und Light/Dark.
- Kurzes Video der Touchfolge; Tabelle erwartete/angezeigte Children,
  Gruppenseverity, Counts und Gesamtstatus.
- Notiere Commit, Assetversion und iOS-Version ohne private IDs oder Tokens.

### Result

NOT TESTED

## MT-35

Test ID: MT-35

Sprint: 21.3
Requirement: Kritikalitätsmodi Device Classes und Home Assistant Labels,
stabile Entity-/Device-Zuweisungen, Mode-Isolation und persistente Admin-
Konfiguration gegen ein kontrolliertes reales Home Assistant.
Device: macOS 13.7.8 Safari, Standalone-LXC und kontrolliertes Test-HA.
Preconditions: Separater Test-Admin-Token; `RQ-04-01` behoben; Test-HA besitzt
ein vorab angelegtes Label mit stabiler ID; keine Produktions-Secrets oder
privaten Namen in Screenshots; Änderungen dürfen gespeichert und anschließend
auf Ausgangswert zurückgesetzt werden.
Exact route/page: `/admin` im Bereich System Dashboards sowie
`/system/errors` derselben LXC-Origin.
Test data/entity/card required: Safety-Entities smoke/CO/gas/moisture,
Security-Entities door/window/opening/garage_door/lock, Cover door/garage/gate/
window sowie shade/shutter/problem/tamper; ein Device mit Label, eine einzelne
Entity mit Label, ein ungelabeltes Window und eine nur über Area gelabelte
Entity; unknown und unavailable Zustände.

### Steps

1. Authentifiziere `/admin`, öffne System Dashboards und notiere aktuellen
   Modus/Labelstatus ohne den Token aufzuzeichnen.
2. Wähle `Home Assistant Device Classes`, speichere, lade Admin neu und prüfe
   die Persistenz.
3. Öffne Errors. Bestätige Safety-/Security-/definierte Cover-Varianten als
   critical bei unknown/unavailable; shade, shutter, problem und tamper dürfen
   ohne explizite Regel nicht automatisch critical werden.
4. Prüfe, dass Namen oder Entity-IDs mit Wörtern wie smoke/leak/window allein
   keine Kritikalität erzeugen.
5. Kehre zu Admin zurück, wähle `Home Assistant Labels`, wähle das vorbereitete
   Label über Name/ID, speichere und lade neu.
6. Prüfe Errors: Entity-Label und Device-Label machen ihre jeweiligen Issues
   critical; die übrigen Children desselben gelabelten Devices folgen der
   Device-Zuweisung.
7. Prüfe das ungelabelte Window: seine Device Class darf im Labelmodus nicht
   still greifen. Prüfe die ausschließlich Area-gelabelte Entity: Area-
   Vererbung darf nicht stattfinden.
8. Markiere eine ungelabelte Entity über die bestehende explizite
   Security-Rule, speichere und prüfe, dass diese höhere Priorität besitzt;
   verifiziere gleichzeitig, dass kein Control Grant entsteht.
9. Stelle die Ausgangskonfiguration über den Admin wieder her und prüfe Save,
   Reload und Error-Ausgabe.
10. Kontrolliere Browser-Netzwerkantworten: nur sanitisierte Label-ID/-Name und
    Source-Status; keine Raw Registry, Tokens oder Label-Write-Requests.

### Expected Visual Result

- Beide Modi und das ausgewählte Label sind eindeutig beschriftet und nach
  Reload identisch.
- Risk-/Severity-Badges entsprechen exakt der vorbereiteten Policy; Mode-
  Wechsel erzeugt keine versteckte Mischklassifikation.
- Labelauswahl zeigt sanitisierte Namen; fehlende optionale Metadaten brechen
  weder Admin noch Errors.

### Expected Functional Result

- Device Class und Label Mode sind gegenseitig isoliert.
- Label gilt direkt für Entity oder echtes Device, niemals automatisch über
  Area; explizite Security-Rule bleibt vorrangig.
- Es wird ausschließlich der feste read-only Label-Registry-Command genutzt;
  keine HA-Area-/Label-/Registry-Schreibaktion und kein Control Grant entsteht.

### Fail If

- Ungelabelte Device-Class-Entity wird im Labelmodus critical oder Area-Label
  vererbt sich.
- problem/tamper oder shade/shutter wird ohne explizite Regel critical.
- Modus/Label geht nach Save/Reload verloren, Admin akzeptiert ungültige ID
  oder Browser sieht Raw Registry/Token/Write-Request.
- Kritikalitätsauswahl autorisiert ein Light-/Climate-Control.

### Evidence

- Screenshots Admin beider Modi sowie Errors mit Policy-, Entity-, Device- und
  Area-Isolationsfällen.
- Sanitisiertes Testprotokoll mit Commit, HA-/Safari-Version, stabilen
  Test-IDs, erwarteter/realer Severity und Netzwerk-Requesttypen.

### Result

NOT TESTED

## MT-36

Test ID: MT-36

Sprint: 21.3
Requirement: Stabile Label-ID bei Rename, Last-known-Verhalten, sichtbarer
unsupported/error/missing-Zustand und automatische Recovery ohne stillen
Device-Class-Fallback.
Device: macOS 13.7.8 Safari, Standalone-LXC und kontrolliertes Test-HA.
Preconditions: Separater Test-Admin-Token; HA-Label und Labelmodus aus MT-35;
ein gelabeltes Testdevice mit kritischem unknown/unavailable Child; Möglichkeit,
Label-Registry-WebSocket getrennt von REST-States zu unterbrechen; `RQ-09-01`
ist automatisiert geschlossen.
Exact route/page: `/admin`, `/system/errors` und
`/api/admin/system-diagnostics/status` derselben Origin.
Test data/entity/card required: stabiles Label `critical-test` mit sichtbarem
Ausgangsnamen; gelabeltes Device/Entity; ungelabelte Security-Device-Class-
Entity als Fallback-Kontrolle; dokumentierter Source-TTL.

### Steps

1. Prüfe im Normalzustand Label-ID/Name, Source `available` und critical Issue
   der gelabelten Entity.
2. Benenne das bestehende Label im Test-HA um, ohne seine ID zu ändern. Warte
   einen TTL-Refresh und prüfe: Auswahl bleibt erhalten, neuer Name erscheint,
   Kritikalität bleibt identisch.
3. Unterbrich nur den Registry-WebSocket. Warte einen TTL-Refresh und prüfe
   Adminstatus und Errors auf `stale`; letzte bekannte Zuweisung und critical
   Severity müssen erhalten bleiben.
4. Starte den Dienst in einem separaten kontrollierten Durchlauf mit einer
   nicht unterstützten/unerreichbaren Labelquelle und ohne Last-known-Daten.
   Prüfe sichtbaren unsupported/error-Zustand und dass das ungelabelte Window
   nicht still per Device Class critical wird.
5. Stelle WebSocket/Labelquelle wieder her und prüfe automatische Recovery
   auf `available`, aktualisierten Namen/Zuweisung und entfernte Warnung ohne
   Dienstneustart.
6. Lösche das Testlabel im kontrollierten HA. Warte einen TTL-Refresh und
   prüfe `missing`: Admin und Errors müssen warnen; es darf kein anderes Label
   automatisch gewählt und kein Device-Class-Fallback aktiviert werden.
7. Lege das Label mit derselben Test-ID nur wieder an, falls das Testsystem
   dies zuverlässig erlaubt; andernfalls wähle über Admin bewusst ein neues
   Testlabel. Prüfe Recovery und stelle anschließend die Ausgangskonfiguration
   her.
8. Kontrolliere Logs und Browserantworten auf fehlende Tokens, Raw Registries,
   Stacktraces und Label-Write-Funktionen der Dashboard-Anwendung.

### Expected Visual Result

- `available`, `stale`, `unsupported/error` und `missing` sind in Admin/Errors
  als Textstatus unterscheidbar, nicht nur als Farbe.
- Rename aktualisiert nur den Namen; stabile Auswahl/Kritikalität bleibt.
- Fehlende Quelle oder gelöschtes Label wird sichtbar und niemals als gesund
  verschwiegen.

### Expected Functional Result

- Last-known Labeldaten bleiben bei stale aktiv; erster unsupported/error und
  missing erzeugen einen sichtbaren Fail-Safe-Hinweis.
- Recovery erfolgt nach Reparatur selbständig; kein stiller Device-Class-
  Fallback im Labelmodus.
- Das Dashboard selbst führt keine Label-/Registry-Schreibaktion aus.

### Fail If

- Rename verliert die Auswahl oder Severity.
- Stale verwirft letzte Zuweisungen; unsupported/error/missing wird verborgen
  oder meldet gesund.
- Ein ungelabeltes Security-Device-Class-Issue wird im Labelmodus critical.
- Recovery erfordert Dienstneustart oder Token/Raw Registry/Write erscheint.

### Evidence

- Screenshots Admin/Errors für available, renamed, stale, unsupported/error,
  missing und recovered.
- Sanitisiertes Zeitprotokoll mit Commit, HA-/Safari-Version, TTL, stabiler
  Label-ID, Source-Status und Severity; keine Secrets erfassen.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 08

## MT-27

Test ID: MT-27

Sprint: 20
Requirement: Error Dashboard MVP mit getrennter unavailable-/unknown-
Darstellung, Severity, Security-/Ignore-Konfiguration, stale/offline/Recovery,
Theme und unveränderter Write-Autorisierung im modernen Browser.
Device: Mac mit macOS 13.7.8 und der dort aktuell installierten Safari-Version.
Preconditions: Aktueller Auditstand ist auf einem Test-/LXC-System ausgerollt;
`RQ-04-01` wurde vor der endgültigen Abnahme behoben und Cacheversionen wurden
kontrolliert aktualisiert; geschützter Admin mit eigenem Test-Admin-Token;
kontrolliertes Test-HA oder localhost-Mock, dessen Erreichbarkeit sicher
unterbrochen werden kann. Keine Produktionssecrets im Browser oder Screenshot.
Exact route/page: `/admin`, `/system/errors`, `/system/summary`, `/` und ein
gültiges `/d/<error-test-dashboard-id>` derselben Origin.
Test data/entity/card required: normale verfügbare Entity; normale
`unavailable`; normale `unknown`; explizit sicherheitsrelevante
`unavailable` und `unknown`; eine zu ignorierende Entity; sehr langer
Friendly Name; autorisiertes und nicht autorisiertes Test-Light/Climate;
mindestens 205 reduzierte Test-Issues für die Listenbegrenzung.

### Steps

1. Öffne `/system/errors` direkt in Safari und notiere Safari-Version, Route,
   Build-/Assetversion sowie den sichtbaren Loading State.
2. Lade einen frischen Snapshot ohne Issues. Prüfe `OK`, Text und Symbol sowie
   den Empty State mit letzter Prüfung; es darf kein stale/offline-Hinweis
   sichtbar sein.
3. Aktiviere die normale unavailable- und unknown-Testentity. Prüfe getrennte
   State-Anzeige, Warning/Info, Titel, Beschreibung, Dauer und eindeutige
   Filtercounts.
4. Markiere im Entity Rule Manager die beiden Security-Testentities als
   sicherheitsrelevant, speichere und lade Admin neu. Prüfe in Errors die
   erhöhte Severity; markiere eine weitere Entity als „In Errors ignorieren“
   und bestätige ihr Verschwinden nach dem nächsten Poll.
5. Öffne das Testdashboard und prüfe, dass Security-/Ignore-Regeln weder
   Sichtbarkeit noch Control Grants verändert haben. Das nicht autorisierte
   Light/Climate muss weiterhin nicht schreibbar sein.
6. Schalte zwischen Light und Dark, lade Errors neu, wechsle zu Summary und
   über das validierte Return-Ziel zurück. Prüfe dasselbe Theme und dasselbe
   Fenster/dieselbe Origin.
7. Unterbrich nach einem erfolgreichen Issue-Snapshot den HA-Zugriff. Warte
   mindestens einen Pollzyklus und prüfe stale/offline, letzten erfolgreichen
   Zeitpunkt und unverändert sichtbare letzte Issues; ein grünes OK oder
   echter Empty State ist unzulässig.
8. Stelle HA wieder her. Prüfe die Recovery-Meldung, anschließenden frischen
   Status und das automatische Verschwinden behobener Issues ohne Reload.
9. Lade die 205-Issue-Testmenge, scrolle bis zum Ende der gerenderten Liste
   und prüfe die Begrenzungsanzeige, lange Namen, Footer und fehlenden
   horizontalen Overflow in schmalem sowie breitem Safari-Fenster.
10. Verwirf/entferne alle Testregeln und bestätige den gesicherten
    Ausgangszustand.

### Expected Visual Result

- Loading, OK, Warning/Info/Critical, stale/offline und Recovery sind durch
  Text und Symbol unterscheidbar, nicht nur durch Farbe.
- `unavailable` und `unknown` bleiben sichtbar getrennt; lange Namen und große
  Listen überlappen weder Cards noch Footer und erzeugen keine horizontale
  Seitenscrollbar.
- Light/Dark bleibt über Errors, Summary und Rückkehr konsistent.

### Expected Functional Result

- Security und Ignore überleben Save/Reload und ändern keine Write Grants.
- HA-Ausfall bewahrt letzte Issues, behauptet keine Gesundheit, und Recovery
  aktualisiert automatisch.
- Interne Navigation bleibt same-window/same-origin; keine Systemansicht
  bietet eine HA-Schreibaktion.

### Fail If

- Ein State wird als off/anderer State angezeigt oder Severity/Count ist
  falsch.
- Stale/offline leert Issues, meldet OK oder erholt sich nur nach Reload.
- Adminregel erteilt Schreibrecht, geht nach Reload verloren oder Discard
  schreibt trotzdem.
- Token, Rohattribute, Stacktrace, horizontaler Overflow oder veralteter
  routeabhängiger Stil erscheint.

### Evidence

- Screenshots von Loading, OK, unavailable/unknown, Security, stale und
  Recovery in Light/Dark sowie großer Liste.
- Bildschirmaufnahme der Admin-Save-/Reload-/Return-Navigation; notiere
  Safari-Version, Test-IDs, Assetversion und Pollzeiten ohne Secrets.

### Result

NOT TESTED

## MT-28

Test ID: MT-28

Sprint: 20
Requirement: Reale iPad-mini-/iOS-9-Abnahme des Error Dashboards in
Portrait/Landscape, Light/Dark und HomeScreen mit Touch, Scrollen und
stale/offline/Recovery.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build ist ausgerollt; `RQ-04-01` ist behoben und der
Legacy-Safari-Cache kontrolliert erneuert; HomeScreen-Link nutzt dieselbe
HTTP-Origin; separates Testdashboard und kontrollierbare Testdaten; kein
Admin-Token auf dem iPad.
Exact route/page: `/d/<error-test-dashboard-id>`, `/system/errors` und
`/system/summary` innerhalb derselben HomeScreen-Web-App.
Test data/entity/card required: mindestens je ein normales und
sicherheitsrelevantes `unavailable`/`unknown`, lange Namen und Dauern,
frischer leerer Zustand, sicher simulierbarer HA-Ausfall, mindestens 205
reduzierte Issues; Light und Dark.
Orientation: Portrait und Landscape.

### Steps

1. Starte das Testdashboard über das HomeScreen-Icon im Portraitmodus und
   öffne den Health-/Systemstatus-Link mit einem Tap.
2. Beobachte Loading und warte auf frische Daten. Prüfe Gesamtstatus, Text,
   Symbol, Counts, unavailable-/unknown-Unterscheidung, Severity-Badges,
   Entity-ID/Kontext und Dauer.
3. Nutze nacheinander alle Severity- und State-Filter. Prüfe, dass jeder Tap
   genau einmal reagiert und nur passende Issues sichtbar sind; öffne und
   schließe vorhandene Details mit einem Tap.
4. Lade den frischen leeren Zustand und bestätige den echten Empty State.
5. Lade die 205-Issue-Testmenge, scrolle vom Header bis zum letzten sichtbaren
   Eintrag/Footer und prüfe lange Namen, Begrenzung und Touchreaktion.
6. Schalte Dark ein, lade die Web-App neu, wechsle Errors → Summary → Errors →
   Zurück und bestätige Theme, exaktes Return-Ziel und Verbleib im
   HomeScreen-Vollbild. Wiederhole kurz in Light.
7. Drehe nach Landscape und wiederhole Status-, Filter-, Detail-, Scroll- und
   Overflowprüfung; drehe danach zurück nach Portrait.
8. Unterbrich nach einem erfolgreichen Snapshot kontrolliert den HA-Zugriff.
   Prüfe nach Polling stale/offline mit erhaltenen letzten Issues und letztem
   Erfolgszeitpunkt.
9. Stelle HA wieder her und prüfe Recovery sowie frische Neuberechnung ohne
   manuelles Reload.

### Expected Visual Result

- Alle Statusstufen sind in beiden Orientierungen lesbar und zusätzlich zu
  Farbe durch Text/Symbol erkennbar.
- Keine Card, Filterleiste, lange Entity oder große Liste überlappt, wird
  unbrauchbar abgeschnitten oder erzeugt horizontales Seitenscrolling.
- Footer und Hintergrund bleiben korrekt; Light/Dark wird früh und konsistent
  angewendet.

### Expected Functional Result

- HomeScreen-Modus bleibt bei Errors, Summary, Zurück, Filterung und Rotation
  erhalten.
- Touch reagiert genau einmal; Polling, stale-Erhalt und Recovery funktionieren
  ohne Browser-HA-Verbindung.
- Es gibt keine Schreibaktion oder implizite Control-Autorisierung.

### Fail If

- Normales Safari öffnet sich, Origin/Port oder Return-Ziel ändert sich.
- Filter/Details reagieren doppelt, falsch oder nicht; State/Severity wird
  verwechselt.
- Stale/offline zeigt OK/leer, Recovery bleibt hängen oder die Web-App stürzt
  bei der großen Liste ab.
- Horizontaler Overflow, überdeckter Footer, Themeblitz oder JavaScriptfehler
  erscheint.

### Evidence

- Fotos/Screenshots in Portrait und Landscape für Light/Dark, Empty, aktive
  Issues, große Liste, stale und Recovery.
- Kurzes Video der HomeScreen-Navigation, Filterung und Rotation; notiere
  iOS-Version, Dashboard-ID, Assetversion und Ergebnis ohne private Daten.

### Result

NOT TESTED

## MT-29

Test ID: MT-29

Sprint: D1
Requirement: Aktuelle Produkt-Screenshot-Galerie aus der real laufenden
Anwendung oder einem kontrollierten Real-App-Mock, semantisch synchron in
README DE/EN und frei von privaten/sensitiven Daten.
Device: macOS-Browser mit reproduzierbarer Screenshot-Funktion; optional reale
iPad-Aufnahme nur für einen ausdrücklich als solchen beschrifteten
Legacy-Nachweis.
Preconditions: Aktueller Build inklusive Sections und Room Card läuft gegen
einen kontrollierten localhost-HA-Mock mit ausschließlich Fake-Credentials und
generischen Demo-IDs/-Namen; keine Produktions-`.env`; `RQ-04-01` ist behoben,
damit keine alten routeabhängigen Assets aufgenommen werden.
Exact route/page: `/`, `/d/<demo-dashboard-id>`, `/admin`,
`/system/summary`, `/system/errors` derselben kontrollierten Origin.
Test data/entity/card required: generische Sensor/Binary/Light/Climate-/Room-
Cards; mindestens zwei Sections; Background; Admin-Sections-/Room-Editor;
Summary- und Error-Demodaten inklusive Device Group und Automation Impact.

### Steps

1. Starte die unveränderte reale Anwendung gegen den kontrollierten Mock und
   dokumentiere Commit, Startbefehl, Mockfixture und Browser/Viewport, ohne
   Secrets in die Dokumentation zu kopieren.
2. Prüfe vor jeder Aufnahme DOM/UI auf Produktionsnamen, interne IPs, Tokens,
   Medieninformationen, Standortdaten und sicherheitskritische Entity-Namen;
   ersetze Testdaten im Mock, nicht nachträglich im Bild.
3. Nimm User-Dashboard Light/Dark, Background, Compact Landscape und Focus im
   aktuellen Stand neu auf. Achte auf Summary/Health-Navigation und den
   aktuellen Footer ohne Versionszeile.
4. Nimm mindestens einen aktuellen Sections-/Room-Card-Nachweis auf, der
   Sectiontitel, Collapsed/Expanded Room Card und optionalen Room-Hintergrund
   fachlich verständlich zeigt.
5. Nimm Admin Dashboard Management, Layout Editor, Live Preview, Background,
   Entity Rule Manager, Diagnostic Sources sowie Sections-/Room-Editor auf.
   Kein Admin-Token darf sichtbar sein.
6. Nimm Summary und Errors mit aktuellem Header, Filtern, Device Group und
   Automation Impact/Advanced Diagnostics auf.
7. Speichere Dateien mit klein geschriebenen, bindestrichbasierten Namen und
   echter zur Endung passender PNG- oder JPEG-Codierung. Korrigiere insbesondere
   die vier derzeit als `.png` benannten JPEG-Dateien.
8. Öffne jede Datei aus dem Repository erneut, prüfe Abmessung/Lesbarkeit und
   führe einen Metadaten-/Stringscan auf interne URLs, Tokens, GPS und private
   Namen aus.
9. Aktualisiere README.de.md und README.en.md semantisch parallel sowie die
   kompakte Root-README nur soweit nötig. Prüfe jeden Bildlink lokal.
10. Lass eine zweite Sichtprüfung oder explizite Nutzerfreigabe dokumentieren
    und notiere für jedes Bild Herkunft, Commit, Route und Ergebnis.

### Expected Visual Result

- Galerie zeigt die aktuelle Anwendung einschließlich Sections, Room Cards,
  aktuellem Entity Rule Manager, Navigation, Footer und System-Dashboards.
- Keine Aufnahme enthält alte entfernte Controls oder UI, abgeschnittene
  Inhalte, private Daten oder sichtbar veraltete Assets.
- Bildformat und Dateiendung stimmen überein; alle README-Bilder rendern.

### Expected Functional Result

- Aufnahmen stammen nachweisbar aus der unveränderten Anwendung/dem
  kontrollierten Real-App-Mock, nicht aus generierten Mockups.
- Deutsch und Englisch referenzieren dieselben fachlich gleichwertigen Bilder
  und Beschreibungen; alle Links sind gültig.

### Fail If

- Ein Bild wurde generiert/nachgebaut statt aus der Anwendung aufgenommen.
- Token, Adminsecret, interne IP, Produktionsname, private Medien-/Standortinfo
  oder sicherheitskritische Entity wird sichtbar oder bleibt in Metadaten.
- Ein Screenshot zeigt den entfernten Versionsfooter/alten Editor oder lässt
  Sections/Room Cards trotz Dokumentation ohne aktuellen Nachweis.
- Dateiendung und tatsächliches Format oder DE-/EN-Verweise weichen ab.

### Evidence

- Tabelle je Screenshot mit Pfad, Commit, Route, Browser/Viewport,
  Mockfixture, Datenschutzprüfung und Freigabe.
- Kontaktbogen oder PR-/Reviewansicht aller finalen Bilder; keine Secrets in
  Logs oder Anhängen.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 07

## MT-24

Test ID: MT-24

Sprint: 18, 19
Requirement: System-Dashboard-Routen, gemeinsamer Online-/Stale-/Offline-/
Recovery-Zustand, Summary-Darstellung, Theme und sichere interne Navigation im
modernen Browser.
Device: Mac mit macOS 13.7.8 und der dort aktuell installierten Safari-Version.
Preconditions: Aktueller Part-07-Build auf einem Test-/LXC-System; lokales Mock-
HA oder gefahrloses Test-HA mit mindestens einem aktiven Summary Item;
`RQ-04-01` ist vor der endgültigen Abnahme behoben und ausgerollt; Browsercache
wurde danach kontrolliert aktualisiert. Keine Secrets im Browser oder in
Screenshots öffnen.
Exact route/page: `/system/summary`, `/system/errors`, `/` und ein gültiges
`/d/<summary-test-dashboard-id>` derselben Origin.
Test data/entity/card required: mindestens Light `on`, Window `on`, Climate mit
`hvac_action=heating`, ein `unavailable`-Objekt für Errors und ein sicher
simulierbarer HA-Ausfall; Light und Dark Theme.
Orientation: schmales/hohes und breites/flaches Safari-Fenster.

### Steps

1. Öffne `/system/summary` direkt und notiere URL, Safari-Version,
   Assetversion und sichtbaren Loading State vor der ersten Antwort.
2. Warte auf frische Daten. Prüfe Titel `Summary`, Onlineanzeige, Gesamtzahl,
   die nichtleeren Gruppen Offen, Klima aktiv und Eingeschaltet sowie je Item
   Icon, Name, Beschreibung und Dauer.
3. Öffne `/system/errors` über die interne Navigation. Bestätige, dass dieselbe
   Seite/Origin/Fensterinstanz verwendet wird und der Errorinhalt unabhängig
   von Summary dargestellt wird.
4. Navigiere zurück zu Summary und danach über das validierte Rückkehrziel zum
   Ausgangsdashboard. Prüfe, dass der exakte interne `/d/...`-Pfad erhalten
   bleibt und kein neuer Tab/Fenster geöffnet wird.
5. Schalte auf Dark, lade Summary neu, wechsle zu Errors und zurück zum
   Dashboard. Wiederhole danach in Light.
6. Unterbrich im kontrollierten Testsystem den HA-Zugriff nach einem
   erfolgreichen Snapshot. Warte mindestens einen Pollzyklus und prüfe, dass
   letzte Summary Items sichtbar bleiben, aber Stale/Offline und letzter
   erfolgreicher Zeitpunkt eindeutig erscheinen.
7. Stelle HA wieder her und warte auf den nächsten Poll. Prüfe die sichtbare
   Recovery-Meldung und anschließend wieder frischen Onlinezustand.
8. Wiederhole die Layoutprüfung mit schmalem/hohem und breitem/flachem Fenster;
   scrolle von Header bis Footer und achte auf horizontalen Overflow.
9. Öffne `/system/does-not-exist` und bestätige einen kontrollierten 404 ohne
   Stacktrace oder sensible Daten.

### Expected Visual Result

- Loading, Online, Stale/Offline und Recovery sind unterscheidbar; stale Daten
  verschwinden nicht fälschlich.
- Summary zeigt nur nichtleere Gruppen; Items, Dauer und lange Namen bleiben
  lesbar, ohne horizontales Scrolling oder überlappenden Footer.
- Light/Dark gilt auf Dashboard, Summary und Errors ohne auffälligen
  routeabhängigen Stilwechsel.

### Expected Functional Result

- Alle internen Links bleiben same-window/same-origin und das validierte
  Rückkehrziel führt exakt zum Ausgangsdashboard.
- Polling erholt sich automatisch; keine manuelle Seitenaktualisierung ist für
  Recovery nötig.
- Unbekannte Systemroute liefert kontrolliert 404.

### Fail If

- Summary/Errors öffnen einen neuen Tab, wechseln Origin/Port oder verlieren
  das Rückkehrziel.
- HA-Ausfall leert die Seite oder behauptet einen frischen gesunden Zustand.
- Recovery bleibt dauerhaft stale/offline, Theme wechselt unerwartet oder
  eine Route lädt sichtbar alte Assets.
- JavaScriptfehler, horizontaler Overflow, Stacktrace oder Secret erscheint.

### Evidence

- Screenshots von Loading, frischem Summary, stale Summary, Recovery und Error
  in Light/Dark; Bildschirmaufnahme der Navigationsfolge.
- Notiere Safari-/macOS-Version, Route, Assetversion, Pollzeiten und Ergebnis;
  keine Tokens, privaten Namen oder internen Adressen erfassen.

### Result

NOT TESTED

## MT-25

Test ID: MT-25

Sprint: 18, 19
Requirement: Reale Legacy-Abnahme der System-Shell und des Summary MVP auf
iPad mini 1/iOS 9.3.5 in HomeScreen-Web-App, Portrait und Landscape.
Device: iPad mini 1, iOS 9.3.5, Safari/HomeScreen-Web-App.
Preconditions: Aktueller Part-07-Build ist ausgerollt; `RQ-04-01` ist behoben;
HomeScreen-Link zeigt auf dieselbe HTTP-Origin; ein separates Testdashboard und
sichere Testdaten sind vorbereitet. Kein Admin-Token auf dem iPad speichern.
Exact route/page: `/d/<summary-test-dashboard-id>`, `/system/summary` und
`/system/errors` innerhalb der HomeScreen-Web-App.
Test data/entity/card required: Light on/off, Switch on, Window und Door on,
Cover open/opening/closing, Vacuum cleaning/returning/paused, Climate heating
und cooling, Media playing ohne/mit erlaubtem Titel, Fan on, Lock unlocked,
Alarm armed; zusätzlich inaktive, unknown/unavailable, lange Namen und
mindestens 50 sichtbare Summary Items für Scrollprüfung.
Orientation: Portrait und Landscape; Light und Dark Theme.

### Steps

1. Starte das Testdashboard über das HomeScreen-Icon im Portraitmodus und
   öffne den immer sichtbaren Summary-Link. Beobachte Loading und warte auf
   `Online`.
2. Prüfe Header, Gesamtzahl und die Gruppen Sicherheit, Offen, In Bewegung,
   Reinigung, Klima aktiv, Medien und Eingeschaltet. Vergleiche jede
   vorbereitete aktive Entity mit der erwarteten Gruppe.
3. Bestätige, dass off/closed/docked/idle/locked, numerische Sensoren,
   Motion sowie unknown/unavailable nicht als normale Aktivität erscheinen.
4. Prüfe lange Namen, Einheiten/Beschreibungen und Dauern auf lesbare Kürzung
   oder Umbruch. Scrolle bei der großen Liste bis zum letzten Item und Footer.
5. Wechsle über die interne Navigation zu Errors und zurück zu Summary. Nutze
   anschließend `Zurück` und bestätige den exakten Ausgangspfad sowie den
   Verbleib in der HomeScreen-Web-App.
6. Schalte auf Dark, lade die Web-App neu und wiederhole Summary → Errors →
   Zurück. Wiederhole die Sichtprüfung in Light.
7. Drehe in Landscape, wiederhole Gruppen-, Scroll-, Header- und
   Navigationsprüfung; drehe danach zurück nach Portrait.
8. Unterbrich nach einem erfolgreichen Snapshot kontrolliert den HA-Zugriff.
   Prüfe nach Polling Stale/Offline mit erhaltenen letzten Items und Zeitpunkt.
9. Stelle HA wieder her; prüfe Recovery und frische Neuberechnung ohne Reload.
10. Wiederhole einen kurzen Wechsel Summary ↔ Errors und stelle sicher, dass
    Touchziele mit einem Tap reagieren und keine doppelten Navigationsereignisse
    auftreten.

### Expected Visual Result

- Summary ist in beiden Orientierungen modern, lesbar und touchfreundlich;
  keine überlappenden Gruppen, abgeschnittenen Items, horizontale Scrollbar,
  Hintergrundlücke oder Footer-Verschiebung.
- Nur aktive, fachlich passende Zustände erscheinen; unknown/unavailable sind
  nicht als normale Summary-Aktivität dargestellt.
- Stale/Offline/Recovery und Light/Dark bleiben eindeutig lesbar.

### Expected Functional Result

- HomeScreen-Vollbild bleibt bei Summary, Errors, Zurück und Rotation erhalten.
- Navigation reagiert genau einmal; Polling, Stale-Erhalt und Recovery
  funktionieren ohne Browser-HA-Verbindung.
- Keine Systemseite bietet eine Schreibaktion oder verändert Control Grants.

### Fail If

- Normales Safari öffnet sich, Origin/Port wechselt oder Rückkehrpfad geht
  verloren.
- Eine spezifizierte aktive Entity fehlt/falsch gruppiert ist oder ein klar
  inaktiver/unknown/unavailable Zustand als Aktivität erscheint.
- Lange/große Liste verursacht Absturz, unbedienbares Scrollen, Überlauf oder
  Footer-/Header-Fehler.
- Polling stoppt, stale Daten werden geleert, Recovery verlangt Reload oder
  ein JavaScriptfehler erscheint.

### Evidence

- Fotos/Screenshots je Gruppe in Portrait und Landscape, jeweils Light/Dark;
  zusätzlich große Liste, stale und Recovery.
- Kurzes Video der HomeScreen-Navigation und Rotation; notiere iOS-Version,
  Dashboard-ID, Assetversion und beobachtete Pollzeiten ohne private Daten.

### Result

NOT TESTED

## MT-26

Test ID: MT-26

Sprint: 19
Requirement: Reale Admin-Konfiguration von Summary Ignore und Media-Privacy
einschließlich persistiertem Reload, manueller Überschreibung und Trennung von
normalen Dashboard-/Write-Rechten.
Device: Mac mit macOS 13.7.8 und der dort aktuell installierten Safari-Version.
Preconditions: Admin API nur im Testsystem aktiviert; eigenes Test-Admin-Token;
sanitiertes Inventar mit einem aktiven Switch und Media Player; mindestens ein
explizit autorisiertes und ein nicht autorisiertes Test-Light. Vorherige
Konfiguration gesichert; Änderungen werden nach Evidenz zurückgesetzt.
Exact route/page: `/admin`, `/system/summary` und
`/d/<summary-test-dashboard-id>` derselben Origin.
Test data/entity/card required: `switch.summary_ignore_test=on`,
`media_player.summary_media_test=playing` mit unkritischem Testtitel,
autorisiertes/nicht autorisiertes Light; keine produktionskritischen Geräte.
Orientation: normales Desktopfenster.

### Steps

1. Melde dich auf `/admin` mit dem Testtoken an und öffne den Entity Rule
   Manager. Suche den Test-Switch nach ID/Friendly Name.
2. Aktiviere `In Summary ignorieren`, speichere den Batch und öffne Summary.
   Prüfe, dass der Switch fehlt, andere aktive Items aber bleiben.
3. Lade `/admin` vollständig neu, melde dich falls nötig erneut an und prüfe,
   dass die Ignore-Regel weiterhin ausgewählt ist.
4. Entferne die Ignore-Regel, speichere und prüfe, dass der Switch nach dem
   nächsten Summary-Poll wieder erscheint.
5. Aktiviere die Medientitel-Option zunächst nicht. Prüfe beim spielenden
   Media Player, dass der Testtitel weder in DOM noch sichtbarer Beschreibung
   erscheint.
6. Aktiviere Medientitel explizit, speichere, lade Admin neu und prüfe Summary:
   Der harmlose Testtitel darf nun erscheinen. Deaktiviere anschließend wieder
   und speichere.
7. Öffne das normale Testdashboard und prüfe, dass Karten, Sichtbarkeit und
   vorhandene Light-Controls unverändert sind. Das nicht autorisierte Light
   darf durch keine Summary-Einstellung schreibbar werden.
8. Ändere eine Regel, wähle vor dem Speichern `Verwerfen` und bestätige, dass
   Summary und persistierte Konfiguration unverändert bleiben.
9. Stelle die gesicherte Ausgangskonfiguration wieder her und verifiziere den
   finalen Summaryzustand.

### Expected Visual Result

- Entity Rule Manager zeigt Suchtreffer und lokalen Dirty-/Save-/Discard-
  Zustand eindeutig; Summary aktualisiert nur die betroffenen Items.
- Medientitel bleibt standardmäßig verborgen und erscheint nur nach bewusstem
  Opt-in.

### Expected Functional Result

- Ignore und Privacy überleben Save plus Reload; Discard schreibt nichts.
- Summary-Einstellungen verändern weder normale Dashboards noch serverseitige
  Light-/Climate-Control-Grants.
- Admin-Token bleibt nur in der Adminsitzung und erscheint nicht in Summary.

### Fail If

- Regel geht nach Reload verloren, überschreibt andere Entityregeln oder
  Discard persistiert versehentlich.
- Medientitel erscheint ohne Opt-in oder bleibt nach Deaktivierung sichtbar.
- Ein nicht autorisiertes Gerät wird schreibbar, normales Dashboard ändert
  sich fachlich oder Token/Secret erscheint im Browserinhalt/Log.

### Evidence

- Screenshots Entity Rule vor/nach Save und nach Reload; Summary mit verborgenem
  und bewusst sichtbarem Testtitel; Notiz der Control-Grant-Nichtänderung.
- Erfasse nur Test-IDs/-Titel, Safari-Version, Zeitpunkt und Resultat; keine
  Tokens oder privaten Entities.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 06

## MT-21

Test ID: MT-21

Sprint: 17.6, 17.7
Requirement: Gemeinsames SVG-Power-Control und vollständige Hierarchie
`Row → Group → Button → Content → SVG/Icon → Label` für Light und Climate in
Grid und Focus auf dem primären Legacy-Zielgerät.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Part-06-Build ist ausgerollt und der HomeScreen-Link
zeigt auf dieselbe Origin; Safari-Cache wurde nach dem Rollout kontrolliert
aktualisiert. Ein separates Testdashboard enthält je ein verfügbares und ein
`unavailable` Light sowie ein Climate mit `off` und mindestens einem sicheren
Nicht-Off-Modus. Light und Climate sind ausdrücklich serverseitig für Writes
freigegeben; keine produktionskritischen Geräte verwenden.
Exact route/page: `/d/<control-alignment-test-dashboard-id>` in der
HomeScreen-Web-App.
Test data/entity/card required: Light in `on` und `off`; Climate in `off` und
aktiv mit Ist-/Solltemperatur, Minus, Plus und Power; lange Kartenbezeichnung;
mindestens eine Compact- und eine Standard-/Wide-Karte; Light und Dark Theme.

### Steps

1. Starte das Testdashboard über das HomeScreen-Icon im Portraitmodus und
   warte auf den frischen Status `Online`.
2. Prüfe die normale Light-Karte: Der Power-Button muss innerhalb seiner
   vorgesehenen Control-Zone horizontal und vertikal zentriert erscheinen.
   SVG und gegebenenfalls Label dürfen nicht links- oder nach oben versetzt
   sein.
3. Tippe Light Power einmal von `off` nach `on` und einmal von `on` nach
   `off`. Beobachte Normal-, Busy- und bestätigten Endzustand; Buttonmaß und
   Mittelpunkt dürfen sich zwischen den Zuständen nicht verändern.
4. Öffne den Light-Focus über eine nicht interaktive Kartenfläche. Prüfe Row,
   Power-Gruppe, Button und den gemeinsamen Inhalt aus SVG plus Label optisch
   auf denselben Mittelpunkt. Betätige Power einmal; der Focus muss offen
   bleiben.
5. Schließe den Focus und prüfe die normale Climate-Karte. Wenn die Capability
   Power erlaubt, muss das Power-SVG in seiner Control-Zone intern zentriert
   sein; fehlende Capability darf keinen künstlichen Button erzeugen.
6. Öffne Climate Focus. Prüfe, dass Minus und Plus in einer gemeinsamen,
   zentrierten Zeile symmetrisch links/rechts liegen. In jedem 56×56-px-
   Touchziel muss das 26×26-px-SVG horizontal und vertikal mittig sitzen.
7. Prüfe die separate Power-Zeile darunter. Button sowie SVG-plus-Label müssen
   auf der horizontalen Focus-Mitte liegen und dürfen nicht von der ±-Zeile
   nach links gezogen werden.
8. Tippe Minus und Plus je einmal und Power einmal im sicheren Testsystem.
   Prüfe Busy/Disabled, dass kein Tap den Focus schließt oder einen zweiten
   Focus öffnet und dass jede Aktion höchstens einmal ausgelöst wird.
9. Prüfe das `unavailable` Light und Climate in Grid und Focus. Die Controls
   müssen an derselben Position bleiben, klar deaktiviert sein und dürfen
   keinen Write senden.
10. Wiederhole Schritte 2 bis 9 nach Drehung in Landscape. Prüfe zusätzlich,
    dass keine horizontale Seitenscrollbar, Kartenüberlappung oder
    Footer-Verschiebung entsteht.
11. Wiederhole die reine Sichtprüfung in Light und Dark sowie mit der langen
    Kartenbezeichnung. Label darf ellipsieren, aber SVG, Touchziel und
    Control-Gruppe nicht verschieben.
12. Kehre nach Portrait zurück, schließe Focus und bestätige unveränderte
    Gridpositionen sowie Verbleib in der HomeScreen-Web-App.

### Expected Visual Result

- Grid-Light, Grid-Climate-Power, Light-Focus-Power, Climate-Focus-Power und
  Climate-Focus-± sind in ihrer jeweiligen Control-Zone vollständig zentriert.
- Icon-only sowie Icon-plus-Label verwenden dieselbe sichtbare SVG-Geometrie;
  es erscheint kein Unicode-Powerglyph und kein fontabhängiger Baselineversatz.
- Zustände und lange Labels ändern weder Buttonmaß noch Mittelpunkt.
- Portrait und Landscape bleiben ohne horizontalen Overflow, Clipping,
  Control-Überlappung, Kartenverschiebung oder Footer-Sprung.

### Expected Functional Result

- Jedes erlaubte Control reagiert mit genau einem Tap; Busy verhindert
  Doppelauslösung und Focus bleibt bei Control-Taps offen.
- Touchziele sind mindestens ungefähr 44×44 px; Focus ± ungefähr 56×56 px.
- `unavailable`/nicht autorisiert bleibt deaktiviert und sendet keinen Write.
- Das Dashboard verbleibt in derselben HomeScreen-Web-App und Origin.

### Fail If

- Row oder Group füllt/zentriert die vorgesehene Zone nicht, Buttoninhalt oder
  SVG sitzt sichtbar links/oben oder ± sind nicht symmetrisch.
- Normal-, Busy-, Disabled- oder unavailable-Zustand verschiebt oder verkleinert
  ein Control.
- Ein Control ist abgeschnitten, überlappt Text, benötigt Mehrfachtaps, löst
  doppelt aus oder öffnet/schließt Focus unbeabsichtigt.
- Unicode statt SVG, horizontales Scrolling, Karten-/Footer-Reflow oder ein
  Verlassen der HomeScreen-Web-App tritt auf.

### Evidence

- Fotos/Screenshots von Light Grid, Climate Grid, Light Focus und Climate
  Focus jeweils Portrait und Landscape; Climate Focus mit ± und Power.
- Kurzes Video für Light Power, Climate Minus/Plus/Power und Busy-Zustand.
- Notiere iPad-Modell, iOS-Version, Dashboard-ID, Kartenformate, Theme,
  Zeitpunkt und Ergebnis; keine Tokens, privaten Namen oder Standortdaten.

### Result

NOT TESTED

## MT-22

Test ID: MT-22

Sprint: 17.6, 17.7
Requirement: Nichtregression des gemeinsamen SVG-Power-Controls und der
vollständigen Control-Hierarchie auf der Plattform der bestätigten Focus-
Kompressions- und Alignment-Regressionsserie.
Device: iPad Air 2, iPadOS 15.8.5, Safari.
Preconditions: Aktueller Part-06-Build; Safari-Cache kontrolliert aktualisiert;
dasselbe sichere Testdashboard und dieselben explizit autorisierten Light-/
Climate-Testentities wie MT-21. Keine produktionskritischen Geräte verwenden.
Exact route/page: `/d/<control-alignment-test-dashboard-id>` direkt in Safari.
Test data/entity/card required: verfügbares Light on/off, Climate off/aktiv
mit ± und Power, unavailable-Fälle, lange Bezeichnung, Compact und
Standard/Wide, Light/Dark, Portrait/Landscape.

### Steps

1. Öffne die Route in Safari im Portraitmodus und notiere Safari-Version sowie
   sichtbare Viewportgröße einschließlich Browserleisten.
2. Prüfe und schalte Light Power in der normalen Karte. Vergleiche optisch
   Control-Zone, Buttonrahmen, SVG und Label in off, busy und on.
3. Öffne Light Focus, prüfe die gemeinsame Mittellinie von Row, Group, Button
   und SVG-plus-Label und schalte einmal. Focus muss offen bleiben.
4. Prüfe Climate Grid mit sichtbarem Power-Control. Das SVG muss innerhalb des
   Buttons zentriert sein; die gesamte Control-Zone darf je Presentation-Tier
   bewusst positioniert, aber nicht intern linksbündig sein.
5. Öffne Climate Focus und prüfe die separate ±-Zeile: Minus/Plus symmetrisch,
   Inhalte in den Touchzielen zentriert. Prüfe danach die separate Power-Zeile
   einschließlich SVG-plus-Label auf Focus-Mitte.
6. Betätige Minus, Plus und Power je einmal. Beobachte Busy/Disabled und
   bestätige, dass kein Tap Focus öffnet, schließt oder dupliziert.
7. Drehe mit offenem Climate Focus nach Landscape und zurück. Blende die
   Safari-Leisten durch normales Scrollverhalten ein/aus, soweit möglich, und
   prüfe nach jeder Viewportänderung erneut alle Mittelpunkte und Panelgrenzen.
8. Prüfe unavailable Light/Climate und eine lange Bezeichnung; Geometrie muss
   stabil bleiben, Writes müssen deaktiviert sein.
9. Wiederhole die Sichtprüfung in Dark und schließe Focus per Button sowie
   Außenklick; Gridposition und Scrollposition müssen erhalten bleiben.

### Expected Visual Result

- Der historische Eindruck eines linksbündigen Buttons/Icons tritt weder im
  Grid noch im Focus auf; jede Ebene bleibt in ihrer vorgesehenen Zone mittig.
- Climate ± sind symmetrisch und Power ist unabhängig davon separat zentriert.
- Browserleisten, Rotation, Statusklasse, Theme und lange Labels verändern
  weder Touchzielgröße noch interne Zentrierung.
- Kein Overlay ist gestaucht; kein horizontaler Overflow oder Grid-Reflow.

### Expected Functional Result

- Light und Climate reagieren mit einem Tap und genau einer Aktion.
- Controls schließen/öffnen Focus nicht versehentlich; Busy blockiert
  Doppelauslösung; unavailable sendet keinen Write.
- Rotation hält genau einen funktionsfähigen Focus offen.

### Fail If

- Power oder Climate ± erscheinen linksbündig, intern versetzt, asymmetrisch,
  abgeschnitten oder kleiner als ungefähr 44×44 px.
- Rotation/Browserleisten verursachen Kompression, Überlauf oder unbedienbare
  Controls.
- Ein Tap löst doppelt aus, benötigt Wiederholung, verändert Focus oder sendet
  aus unavailable einen Write.

### Evidence

- Screenshots der vier Control-Surfaces in Portrait und Climate Focus in
  Landscape; zusätzlich unavailable und Dark.
- Kurzes Video für Control-Taps plus Rotation/Browserleistenänderung.
- Notiere iPadOS-/Safari-Version, Viewport, Dashboard-ID, Kartenformate,
  Cacheversion und Ergebnis ohne Zugangsdaten.

### Result

NOT TESTED

## MT-23

Test ID: MT-23

Sprint: 17.6, 17.7
Requirement: Desktop-Safari-Nichtregression der gemeinsamen SVG-/Control-
Hierarchie sowie Vergleichsbasis für die beiden mobilen Safari-Geräte.
Device: Mac mit macOS 13.7.8 und der dort aktuell installierten Safari-Version.
Preconditions: Aktueller Part-06-Build; dasselbe sichere Testdashboard wie
MT-21/MT-22; explizit autorisierte Light-/Climate-Testentities; Cacheversion
kontrolliert aktualisiert.
Exact route/page: `/d/<control-alignment-test-dashboard-id>` in Safari.
Test data/entity/card required: Light on/off, Climate off/aktiv, unavailable,
lange Bezeichnung, Compact und Standard/Wide, Light/Dark; schmales/hohes und
breites/flaches Browserfenster.

### Steps

1. Öffne das Testdashboard in Safari in einem schmalen, hohen Fenster und
   notiere macOS-, Safari-, Fenster- und Assetversion.
2. Prüfe normale Light- und Climate-Karten: Control-Zone, Buttonrahmen, SVG
   und gegebenenfalls Label müssen jeweils intern zentriert sein.
3. Schalte Light off→on→off und beobachte off, busy, on sowie Buttonmaße.
4. Öffne Light Focus, prüfe Row/Group/Button/Content/SVG-plus-Label und
   betätige Power einmal.
5. Öffne Climate Focus, prüfe die symmetrische ±-Zeile sowie die separate,
   zentrierte Power-Zeile. Betätige Minus, Plus und Power je einmal.
6. Ändere bei offenem Climate Focus die Fensterform von schmal/hoch zu
   breit/flach und zurück. Prüfe nach jeder Änderung Control-Mittelpunkte,
   Touchgrößen, Panelgrenzen und fehlenden Overflow.
7. Wiederhole die Sichtprüfung für unavailable, lange Bezeichnung und Dark.
8. Schließe per Close-Button und Außenklick; Grid und Scrollposition müssen
   unverändert bleiben.

### Expected Visual Result

- Desktop Safari zeigt dieselbe stabile Hierarchie wie die kontrollierte
  lokale Messung: keine fontabhängige Power-Glyphe, kein Baselineversatz und
  kein linksbündiger anonymer Buttoninhalt.
- Grid- und Focus-Controls bleiben in allen Zuständen und Fensterformen
  intern zentriert; ± sind symmetrisch, Power mit Label als Einheit mittig.
- Kein Clipping, horizontaler Overflow oder Grid-/Footer-Reflow.

### Expected Functional Result

- Erlaubte Controls reagieren genau einmal und halten Focus offen; Busy
  verhindert Doppelauslösung.
- Resize hält genau einen Focus offen; unavailable bleibt schreibgeschützt.

### Fail If

- Desktop Safari weicht sichtbar von den erwarteten Mittelpunkten ab, SVG oder
  Label verschiebt sich zwischen Zuständen oder ein Control schrumpft.
- Resize erzeugt Overflow, Kompression, Doppel-Focus oder abgeschnittene
  Controls.
- Control-Tap beeinflusst Focus unerwartet oder unavailable sendet Writes.

### Evidence

- Screenshots Light/Climate Grid und Focus in beiden Fensterformen, plus Dark
  und unavailable; kurzes Video der Controls während Resize.
- Notiere macOS-/Safari-Version, Fenstermaße, Assetversion, Dashboard-ID und
  Ergebnis ohne Tokens oder private Gerätedaten.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 05

## MT-18

Test ID: MT-18

Sprint: 17.4, 17.5
Requirement: Viewportbasierter nativer Focus, priorisierte Inhalte,
Scroll-Lock, Rotation und sichere Controls auf der Legacy-Zielplattform.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Part-05-Build ist ausgerollt; Testdashboard mit je
einer Sensor-, Binary-, Light- und Climate-Karte, mindestens einer langen
Identität, einer unavailable Entity und ausdrücklich autorisierten
Test-Entities für Light/Climate. Keine produktionskritischen Geräte verwenden.
Exact route/page: `/d/<focus-test-dashboard-id>` in der HomeScreen-Web-App.
Test data/entity/card required: Sensor mit Wert/Unit, Binary aktiv und inaktiv,
Light On/Off, Climate mit Ist/Soll, `off` und mindestens einem Nicht-Off-Modus,
Min/Max/Step; Portrait und Landscape.

### Steps

1. Öffne das Testdashboard im Portraitmodus, warte auf `Online` und scrolle zu
   einer Position, die nicht am Seitenanfang liegt.
2. Tippe außerhalb interaktiver Elemente auf die Sensor-Karte. Prüfe Identity,
   Icon, Wert, Unit, Panelbreite und den sichtbaren Close-Button.
3. Schließe per Close-Button und bestätige, dass das Dashboard an derselben
   Scrollposition bleibt.
4. Öffne Sensor erneut und schließe durch einen einzelnen Tap außerhalb des
   Panels. Prüfe, dass der Hintergrund während des offenen Focus nicht scrollt.
5. Wiederhole Öffnen und Inhaltsprüfung für Binary. Teste dabei einmal `on`
   und einmal `off`; Zustand darf nicht ausschließlich über Farbe erkennbar
   sein.
6. Öffne Light über die nicht interaktive Kartenfläche. Prüfe Identity, State
   und Power. Betätige Power einmal und bestätige, dass genau ein Focus offen
   bleibt und kein Hintergrundtap ausgelöst wird.
7. Öffne Climate. Prüfe Identity, Isttemperatur, Solltemperatur, HVAC/action,
   Minus, Plus und Power. Alle Kerninhalte müssen ohne unnötiges Scrollen
   erreichbar sein.
8. Tippe Minus und Plus je einmal sowie Power nur im sicheren Testsystem.
   Prüfe Busy/Disabled, anschließende Aktualisierung und dass Focus offen bleibt.
9. Lass Climate Focus offen und drehe Portrait → Landscape. Warte bis das
   Layout ruhig steht, prüfe alle Controls und drehe Landscape → Portrait
   zurück.
10. Prüfe lange Identity sowie unavailable/stale: Text darf nicht horizontal
    überlaufen; alle Write-Controls müssen deaktiviert sein.
11. Wiederhole Sensor, Binary, Light und Climate im Dark Mode und prüfe
    Kontrast, Grenzen und Touchflächen.
12. Schließe den Focus und prüfe Gridpositionen, Footer, Hintergrund und
    horizontales Seitenscrolling gegen den Ausgangszustand.

### Expected Visual Result

- Focus ist deutlich größer als die Gridkarte, bleibt innerhalb des real
  sichtbaren Viewports und erzeugt keine Mini-Card im Overlay.
- Sensor/Binary/Light/Climate zeigen jeweils alle priorisierten Inhalte;
  Climate ± und Power sowie Light Power sind ohne unnötigen Scroll erreichbar.
- Rotation hält genau einen Focus offen und wechselt nachvollziehbar zwischen
  Portrait-/Landscape-Geometrie.
- Light/Dark bleiben lesbar; Grid, Footer und Hintergrund zeigen keinen
  sichtbaren Reflow oder Zwischenraum.

### Expected Functional Result

- Minus/Plus sind ungefähr 56×56 px, Power mindestens ungefähr 44 px hoch und
  mit einem einzelnen Tap bedienbar.
- Hintergrund bleibt gesperrt; Close/Außenklick restaurieren Dashboardposition
  und Grid ohne Reflow.
- Control-Taps öffnen keinen zweiten Focus und schließen den bestehenden nicht.
- unavailable/stale sendet keinen Write.

### Fail If

- Focus ist gestaucht, kleiner als sinnvoll, außerhalb des Viewports oder hat
  horizontales Scrolling.
- Identity, primärer Wert, Sollwert oder ein erlaubtes Control ist abgeschnitten,
  überlappt oder nur nach unnötigem Scrollen erreichbar.
- Rotation schließt/dupliziert Focus oder lässt Controls außerhalb des Panels.
- Hintergrund scrollt, Seite springt nach Close nach oben oder Grid/Footer
  verändern ihre Geometrie.
- Ein Control-Tap öffnet/schließt Focus zusätzlich oder unavailable bleibt
  bedienbar.
- Die Navigation verlässt die HomeScreen-Web-App.

### Evidence

- Je ein Foto/Screenshot aller vier Typen in Portrait und Landscape; Climate
  zusätzlich vor/nach Rotation.
- Kurzes Video für Control-Tap, Außenklick und Scrollpositions-Restaurierung.
- Notiere iPad-Modell, iOS-Version, Dashboard-ID, Theme, Zeitpunkt und genaue
  betroffene Entity-/Widget-ID ohne Token oder private Standortdaten.

### Result

NOT TESTED

## MT-19

Test ID: MT-19

Sprint: 17.5
Requirement: Bestätigte Mobile-Safari-Kompressionsregression ist auf dem
Referenzgerät durch die native Focus-Architektur behoben.
Device: iPad Air 2, iPadOS 15.8.5, Safari.
Preconditions: Aktueller Part-05-Build; Safari-Cache für die Anwendung wurde
nach dem Rollout kontrolliert aktualisiert; Testdashboard mit Sensor, Binary,
Light und Climate, langer Identity sowie autorisierten Light-/Climate-
Testcontrols.
Exact route/page: `/d/<focus-test-dashboard-id>` direkt in Safari.
Test data/entity/card required: dieselben vier Typen wie MT-18; Climate mit
Ist/Soll/HVAC, ± und Power; Light On/Off; Portrait und Landscape.

### Steps

1. Öffne die Route in Safari im Portraitmodus und notiere sichtbare
   Viewportbreite/-höhe einschließlich Browserleisten.
2. Öffne Sensor Focus und prüfe, dass Panel und Widget den verfügbaren Raum
   sinnvoll nutzen und nicht als kleine Gridkarte erscheinen.
3. Wiederhole für Binary und Light; betätige Light Power einmal.
4. Öffne Climate und prüfe Identity, Ist, Soll, HVAC/action, Minus, Plus und
   Power auf Größe, Abstand und Bedienbarkeit.
5. Tippe Minus, Plus und Power je einmal im sicheren Testsystem. Bestätige,
   dass die Touchflächen nicht schrumpfen und Focus offen bleibt.
6. Drehe mit geöffnetem Climate Focus nach Landscape und wieder zurück.
7. Blende Safari-Browserleisten durch normales Scrollverhalten ein/aus, soweit
   iPadOS dies erlaubt, und prüfe erneut Panelgrenzen sowie Close-Button.
8. Wiederhole den Climate-Fall mit langer Identity und unavailable State.
9. Schließe per Close und Außenklick und prüfe die unveränderte Gridposition.

### Expected Visual Result

- Der historische Fehler „Overlay groß, Focus Card klein/gestaucht“ tritt nicht
  auf; Focus nutzt in beiden Orientierungen einen großen, stabilen Bereich.
- Kein Focus-Element trägt sichtbare Gridabmessungen oder Compact-Verhalten.
- Browserleisten-/Viewportänderung und Rotation schneiden keine Controls ab
  und erzeugen keinen Doppel-Focus.
- unavailable bleibt gleich groß und zeigt den Zustand.

### Expected Functional Result

- Light-/Climate-Controls bleiben mindestens ungefähr 44 px groß, zentriert
  und mit einem Tap bedienbar.
- Rotation und Browserleistenänderung halten genau einen Focus offen.
- unavailable deaktiviert Writes.

### Fail If

- Panel ist deutlich kleiner als der verfügbare Viewport, Inhalte sind
  komprimiert oder Controls unbedienbar.
- Grid-Presentation scheint im Focus weiterzuwirken, Text/Controls überlappen
  oder horizontales Scrollen entsteht.
- Rotation/Browserleisten schließen Focus, duplizieren ihn oder verschieben
  Close/Controls aus dem sichtbaren Bereich.
- Control-Tap benötigt Mehrfachtaps oder löst Focus zusätzlich aus.

### Evidence

- Foto/Screenshot aller vier Typen in Portrait; Climate zusätzlich Landscape.
- Kurzes Video für Climate-Control und Rotation.
- Notiere iPadOS-/Safari-Version, reale Viewportbeobachtung, Cacheversion und
  Ergebnis; keine Tokens oder privaten Gerätenamen aufnehmen.

### Result

NOT TESTED

## MT-20

Test ID: MT-20

Sprint: 17.5
Requirement: Das vor Sprint 17.5 gute Desktop-Safari-Verhalten regressiert
durch den nativen Focus-Renderer nicht.
Device: Mac mit macOS 13.7.8 und Safari der dort aktuell installierten Version.
Preconditions: Aktueller Part-05-Build; Testdashboard mit Sensor, Binary, Light
und Climate; lange Identity, unavailable State und sichere autorisierte
Testcontrols.
Exact route/page: `/d/<focus-test-dashboard-id>` in Safari.
Test data/entity/card required: vier Focus-Typen, Light On/Off, Climate mit
Ist/Soll/HVAC/±/Power, Light und Dark Theme.

### Steps

1. Öffne das Testdashboard in einem normalen Safari-Fenster und notiere
   Fenstergröße, Safari-Version und aktuelle Assetversion.
2. Öffne nacheinander Sensor, Binary, Light und Climate über nicht interaktive
   Kartenflächen.
3. Prüfe für jeden Typ Panelgröße, Identity, Primärwert/Zustand, Close-Button
   und fehlenden horizontalen Overflow.
4. Betätige Light Power sowie Climate Minus/Plus/Power im sicheren Testsystem;
   Focus muss offen bleiben und Status/Busy muss nachvollziehbar sein.
5. Verändere die Fenstergröße von schmal/hoch zu breit/flach, während Climate
   Focus offen ist. Prüfe Neuvermessung und Controls.
6. Schließe einmal per Button und einmal per Außenklick; prüfe Scrollposition
   und unverändertes Grid.
7. Wiederhole Climate im Dark Mode und unavailable State.

### Expected Visual Result

- Das bisher gute macOS-Safari-Layout bleibt erhalten; Focus ist weder
  gestaucht noch überdimensioniert.
- Alle typgerechten Inhalte und Controls sind sichtbar und zentriert.
- Dark und unavailable bleiben lesbar.

### Expected Functional Result

- Alle erlaubten Controls sind bedienbar; Resize hält genau einen Focus offen.
- Control-Taps sind von Focus-Open/Close getrennt; Close/Außenklick bewahren
  Grid und Scrollposition.
- unavailable bleibt sicher und sendet keinen Write.

### Fail If

- Native Renderer verschlechtern das frühere Safari-Layout, erzeugen Overflow,
  doppelte Overlays oder abgeschnittene Controls.
- Resize schließt Focus oder übernimmt Gridabmessungen.
- Control-Tap öffnet/schließt Focus, unavailable sendet Writes oder Theme ist
  unlesbar.

### Evidence

- Screenshots Sensor/Binary/Light/Climate; Climate vor/nach Fenster-Resize und
  im Dark Mode.
- Notiere macOS-/Safari-Version, Fenstergrößen, Dashboard-ID und Ergebnis ohne
  Zugangsdaten.

### Result

NOT TESTED

## Fortsetzung der detaillierten Anleitungen aus Audit Part 04

## MT-12

Test ID: MT-12

Sprint: 17.2
Requirement: Proportionale, gutter-aware Grid-Geometrie und sichere
Neuberechnung bei Rotation.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Testdashboard mit mehreren gültigen Größen, mindestens
`2×1`, `3×1`, `3×2`, `6×1` und einer großen/hohen Variante, verteilt auf
Sensor, Binary, Light und Climate; ein langer Name, ein langer Wert und eine
lange Unit.
Exact route/page: `/d/<geometry-test-dashboard-id>`.
Test data/entity/card required: stabile Fake-/Testzustände oder nicht private
reale Entities; Footer und Dashboardhintergrund müssen sichtbar sein.

### Steps

1. Öffne das Dashboard im Portraitmodus und scrolle einmal vom Header bis zum
   Footer.
2. Vergleiche bei jeder Karte sichtbare Breite und Höhe mit ihrer Rastergröße;
   eine doppelt hohe Karte muss erkennbar höher sein als `h=1`.
3. Prüfe Gutter zwischen benachbarten Karten und den Abstand zum Seitenrand.
4. Prüfe langen Namen, langen Wert und Unit auf Kürzung/Umbruch ohne Overflow.
5. Drehe Portrait → Landscape und warte, bis das Layout ruhig steht.
6. Prüfe alle Karten, Abstände, Footer und Hintergrund erneut.
7. Drehe Landscape → Portrait zurück und wiederhole die Prüfung.
8. Öffne eine Karte im Focus und bestätige, dass das Grid darunter seine
   Position und Höhe nicht verändert; schließe den Focus wieder.

### Expected Result

- Kartenhöhen folgen Rasterhöhe und verfügbarer Breite nachvollziehbar.
- Kein Kartenpaar überlappt; Gutter bleiben gleichmäßig.
- Keine horizontale Scrollbar, Hintergrundlücke oder Footer-Verschiebung.
- Rotation wendet das richtige Profil an, ohne Zwischenzustand dauerhaft zu
  hinterlassen oder Daten neu zu platzieren.
- Focus verändert die Grid-Geometrie nicht.

### Fail If

- Hohe Karten wirken wie kleine Karten in leerem Rechteck oder werden
  unproportional flach.
- Karten springen aufeinander, verlassen den Container oder erzeugen
  horizontales Scrollen.
- Footer/Hintergrund verschiebt sich oder erhält sichtbare Lücken.
- Rotation verändert persistierte Positionen oder Focus löst Reflow aus.

### Evidence

- Fotos/Screenshots vor Rotation, nach Landscape und nach Rückkehr zu Portrait.
- Notiere jede betroffene Karten-ID, Größe und den beobachteten Fehler.

### Result

NOT TESTED

## MT-13

Test ID: MT-13

Sprint: 17.2, 25.1, 25.4
Requirement: Globale Theme-Persistenz über Reload, Default-/Custom- und
System-Dashboards.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Mindestens ein Custom-Dashboard; Summary und Errors sind
erreichbar; Cache-Buster-Reparatur RQ-04-01 ist ausgerollt; keine gespeicherten
Admin-Credentials auf dem iPad.
Exact route/page: `/`, `/d/default`, `/d/<custom-id>`, `/system/summary` und
`/system/errors`.
Test data/entity/card required: sichtbare helle und dunkle Kartenflächen sowie
ein System-Dashboard mit Inhalt.

### Steps

1. Öffne `/` und schalte auf Light; lade die Seite über die HomeScreen-Web-App
   neu.
2. Öffne das Custom-Dashboard über die interne Navigation und prüfe Light.
3. Öffne Summary, danach Errors, und prüfe jeweils Light.
4. Nutze das validierte Rückkehrziel und prüfe das Theme erneut.
5. Schließe die HomeScreen-Web-App vollständig, öffne sie wieder und prüfe
   Light auf `/`.
6. Schalte auf Dark und wiederhole Schritte 1 bis 5.
7. Falls auf diesem iOS-Gerät reproduzierbar möglich, wiederhole einen Wechsel
   mit eingeschränktem/gelöschtem Website-Speicher und dokumentiere, dass die
   Seite trotzdem bedienbar startet.

### Expected Result

- Das gewählte Theme bleibt nach Reload, Routewechsel, Rückkehr und erneutem
  Öffnen konsistent.
- Theme wird bereits beim ersten sichtbaren Render angewendet; kein längeres
  hell/dunkel Aufblitzen.
- Summary und Errors verwenden dasselbe globale Wall-Theme.
- Ein Storage-Fehler verhindert weder Start noch Theme-Umschaltung der
  aktuellen Sitzung.

### Fail If

- Eine Route fällt ohne Nutzeraktion auf ein anderes Theme zurück.
- Nach Reload/Neustart wird das vorherige Theme verloren.
- Summary/Errors zeigen veraltete Styles oder einen anderen Themezustand.
- Die Seite bleibt wegen Storage-Ausfall leer oder unbedienbar.

### Evidence

- Foto/Screenshot je Route im Light- und Dark-Durchlauf.
- Notiere Cache-/Deploymentversion, iOS-Version und Ergebnis nach Web-App-
  Neustart.

### Result

NOT TESTED

## MT-14

Test ID: MT-14

Sprint: 17.3
Requirement: Focus-Overlay, typgerechte Inhalte, Schließen und fehlender
Grid-Reflow.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Testdashboard mit je einer Sensor-, Binary-, Light- und
Climate-Karte; lange Identität; verfügbare und eine unavailable Testentity.
Exact route/page: `/d/<focus-test-dashboard-id>`.
Test data/entity/card required: Sensor mit Unit, Binary aktiv/inaktiv,
autorisiertes Light, autorisiertes Climate mit Ist/Soll/HVAC.

### Steps

1. Öffne das Dashboard im Portraitmodus und merke Positionen der Karten und
   des Footers.
2. Tippe die Sensor-Kartenfläche außerhalb interaktiver Elemente.
3. Prüfe Overlay, Identität, Wert, Unit und 44-px-Schließen-Button.
4. Schließe über den Button, öffne erneut und schließe durch Tippen außerhalb
   der Focus-Card.
5. Wiederhole Öffnen/Inhaltsprüfung für Binary, Light und Climate.
6. Prüfe Climate auf Ist, Soll, HVAC/action und Controls; prüfe unavailable auf
   deaktivierte Writes.
7. Öffne Focus, drehe nach Landscape und zurück; schließe ihn anschließend.
8. Vergleiche Gridpositionen und Footer vor/nach allen Focus-Aktionen.

### Expected Result

- Immer höchstens ein Focus-Overlay; Focus ist deutlich größer als die Grid-
  Karte und bleibt innerhalb des Viewports scrollbar.
- Jeder Typ zeigt die vorgesehenen Informationen; unavailable bleibt lesbar,
  aber nicht schreibbar.
- Schließen-Button und Außenklick funktionieren mit einem einzelnen Tap.
- Grid, Karten und Footer behalten Position/Größe; keine horizontale Scrollbar.
- Rotation komprimiert Focus nicht und verliert den geöffneten Inhalt nicht.

### Fail If

- Focus ist leer, komprimiert, mehrfach vorhanden oder außerhalb des Viewports.
- Außenklick/Close reagiert doppelt oder gar nicht.
- Grid verschiebt sich, Controls werden abgeschnitten oder unavailable bleibt
  aktiv.
- HomeScreen-Web-App öffnet normales Safari.

### Evidence

- Foto/Screenshot je Kartentyp, zusätzlich Climate Portrait/Landscape.
- Notiere Close- und Außenklickverhalten sowie jede Layoutabweichung.

### Result

NOT TESTED

## MT-15

Test ID: MT-15

Sprint: 17.3
Requirement: Gemeinsamer Light-Power-Control, Busy/Error/Unavailable und
Event-Trennung.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Ein explizit autorisiertes verfügbares Light, ein explizit
nicht autorisiertes Light und ein unavailable Light; Backend mit lokal
beobachtbaren Testlogs, keine produktionskritische Leuchte.
Exact route/page: `/d/<control-test-dashboard-id>` und Light-Focus derselben
Route.
Test data/entity/card required: drei eindeutig benannte Light-Karten.

### Steps

1. Tippe beim autorisierten Light den Grid-Power-Control einmal auf Off und
   beobachte Busy sowie bestätigten Zustand.
2. Tippe erneut auf On und prüfe dasselbe.
3. Tippe die Kartenfläche neben dem Control, öffne Focus und schalte dort Off
   und On.
4. Tippe im geöffneten Focus ausschließlich den Power-Control und prüfe, dass
   Focus offen bleibt.
5. Tippe im Grid ausschließlich den Power-Control und prüfe, dass Focus nicht
   geöffnet wird.
6. Prüfe nicht autorisiertes und unavailable Light auf deaktivierte Controls.
7. Erzeuge, wenn gefahrlos im Testsystem möglich, einen kontrollierten
   Servicefehler und prüfe Meldung sowie anschließende Erholung.

### Expected Result

- Grid und Focus verwenden denselben klar zentrierten Power-Control mit
  mindestens ungefähr 44 px Touchfläche.
- On/Off, Busy, Fehler und bestätigter Zustand sind eindeutig.
- Control-Taps öffnen/schließen Focus nicht versehentlich.
- Nicht autorisierte und unavailable Lights bleiben deaktiviert; Backend
  erhält nur den engen Light-Endpunkt.

### Fail If

- Control ist linksversetzt, kleiner als ungefähr 44 px oder benötigt
  Mehrfachtaps.
- Grid und Focus zeigen widersprüchliche Zustände.
- Control-Tap öffnet Focus oder schließt das Overlay.
- Nicht autorisierte/unavailable Entity lässt sich schalten.

### Evidence

- Kurzes Video oder Fotos von Grid/Focus in On, Off und Disabled.
- Notiere Entity-Rollen (autorisiert/nicht autorisiert/unavailable) und den
  beobachteten Fehlerpfad, ohne Tokens zu erfassen.

### Result

NOT TESTED

## MT-16

Test ID: MT-16

Sprint: 17.3
Requirement: Climate Power, Sollwertsteuerung, sichere Capability-Auswertung
und Focus-Control-Geometrie.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Ein autorisiertes Climate mit `off` plus mindestens einem
Nicht-Off-Modus, ein Climate ohne `off`, ein unavailable Climate; sichere
Testtemperatur und bekannte Min/Max/Step-Grenzen.
Exact route/page: `/d/<climate-test-dashboard-id>` und Climate-Focus.
Test data/entity/card required: mindestens die drei genannten Climate-Karten;
keine produktionskritische Heizungsänderung.

### Steps

1. Öffne Focus des autorisierten Climate und prüfe Ist, Soll, HVAC/action,
   Minus, Plus und Power.
2. Tippe Minus und Plus je einmal; prüfe Busy, Schrittweite und bestätigten
   Sollwert.
3. Schalte Climate über Power aus und prüfe den Off-Zustand.
4. Ändere den Sollwert im Off-Zustand, sofern die Integration dies unterstützt,
   und bestätige, dass dadurch nicht eingeschaltet wird.
5. Schalte wieder ein und prüfe, dass nur ein tatsächlich unterstützter
   Nicht-Off-Modus gewählt wird.
6. Prüfe das Climate ohne `off`: es darf keinen falschen Power-Control zeigen.
7. Prüfe unavailable auf vollständig deaktivierte Writes.
8. Wiederhole die Focus-Geometrie in Portrait und Landscape und tippe Controls
   nahe ihren Rändern, um Touchziel und Zentrierung zu prüfen.
9. Erzeuge, falls gefahrlos möglich, einen kontrollierten Servicefehler und
   prüfe verständliche Fehlermeldung und Recovery.

### Expected Result

- Minus/Plus und Power sind symmetrisch zentriert, mindestens ungefähr 44 px
  groß und mit einem Tap bedienbar.
- Sollwertschritte respektieren Entity-Minimum, -Maximum und -Step.
- Sollwertänderung im Off-Zustand schaltet nicht automatisch ein.
- Power On nutzt ausschließlich einen unterstützten Modus; Climate ohne `off`
  zeigt keinen Power-Control.
- Busy, Fehler und unavailable sind kontrolliert und führen nicht zu einem
  falschen bestätigten UI-Zustand.

### Fail If

- Controls sind linksversetzt, abgeschnitten oder überlappen Inhalte.
- Power erzwingt einen nicht unterstützten Modus oder Sollwertänderung schaltet
  ungewollt ein.
- Climate ohne `off` zeigt einen funktionslosen Power-Control.
- Fehler hinterlässt dauerhaften Busy- oder falschen Sollwertzustand.

### Evidence

- Fotos/Video von Portrait und Landscape, inklusive Off-/On-/Disabled-Zustand.
- Notiere HVAC-Modi, Min/Max/Step und Ergebnisse ohne Token-/Secret-Anzeige.

### Result

NOT TESTED

## MT-17

Test ID: MT-17

Sprint: 17.3
Requirement: Reale Admin-Live-Preview mit aktuellen Daten, Profil-/Theme-
Umschaltung und Preview während Pointer-Drag/Resize.
Device: macOS Safari in der aktuell verfügbaren Version.
Preconditions: Admin API aktiviert; separates Test-Admin-Token; Dashboard mit
Sensor, Binary, Light und Climate; keine echten Secrets auf Screenshot;
Teständerungen werden am Ende verworfen.
Exact route/page: `/admin`, Layoutbereich des Testdashboards.
Test data/entity/card required: aktuelle Testzustände, lange Identität und
mindestens eine unavailable Entity.

### Steps

1. Melde dich an `/admin` an und öffne das Testdashboard.
2. Prüfe für jede Previewkarte Identität, Typ, Größe, Presentation Mode und
   aktuellen Wert/Zustand.
3. Prüfe, dass Light-/Climate-Controls sichtbar, aber deaktiviert sind; tippe
   sie und bestätige, dass kein Gerät geschaltet wird.
4. Schalte Portrait/Landscape und Hell/Dunkel um und prüfe Preview nach jeder
   Kombination.
5. Ziehe eine Karte mit der Maus/Pointer in eine freie Rasterposition und
   beobachte die Zielvorschau während der Bewegung.
6. Vergrößere/verkleinere eine Karte über das Resize-Handle und prüfe den
   Presentation-Wechsel während der Geste.
7. Provoziere Kollision und Bounds-Verletzung; prüfe, dass Preview/Draft nicht
   ungültig übernommen werden.
8. Wähle `Verwerfen` und prüfe die Rückkehr zur gespeicherten Geometrie.

### Expected Result

- Preview zeigt aktuelle bereinigte Daten und reagiert auf Profil, Theme,
  Größe und Zustand.
- Preview-Controls führen niemals einen HA-Write aus.
- Zielvorschau bleibt während Drag/Resize sichtbar und nutzt das gesnappte
  Candidate-Layout.
- Kollisionen/Bounds werden kontrolliert abgewiesen; Verwerfen stellt den
  Ausgangszustand her.

### Fail If

- Preview bleibt Platzhalter, zeigt veraltete/falsche Werte oder verschwindet
  während Drag/Resize.
- Preview-Control schaltet ein echtes Gerät.
- Presentation passt sich nach Resize nicht an.
- Ungültiges Layout wird übernommen oder Verwerfen verliert den Ausgangszustand.

### Evidence

- Screenshots von Portrait/Light, Landscape/Dark und laufender Resize-Preview.
- Notiere Safari-Version, Dashboard-ID und Ergebnis jeder Gestenprüfung.

### Result

NOT TESTED

## Detaillierte Anleitungen aus Audit Part 14

## MT-55

Test ID: MT-55

Sprint: 25, 25.4
Requirement: Ein neuer Release Candidate wird aus genau einem freigegebenen
Commit reproduzierbar als öffentliches Prerelease, Standalone-Artefakt und
generisches amd64/aarch64-GHCR-Manifest veröffentlicht, ohne `latest` zu
verändern.
System: GitHub Actions, GHCR, GitHub Release und isolierter Linux-Testhost mit
Docker/Buildx; kein produktives Home Assistant.
Preconditions: Alle P1-Reparaturen des vorgesehenen RC sind re-auditiert; ein
neuer, noch nicht existierender RC-Versionsstring und Tag wurden in allen
Versionsquellen vorbereitet; CI auf dem exakten Commit ist grün; GHCR-Paket ist
öffentlich; der vor dem Test existierende `latest`-Digest wurde notiert oder
`latest` existiert nachvollziehbar noch nicht.
Exact version/tag/artifact under test: Der konkret zu veröffentlichende neue
`v<version>-rc.<n>`-Tag, `ghcr.io/tekky85/ha-legacy-dashboard:<version>-rc.<n>`,
`ha-legacy-dashboard-<version>-rc.<n>.tar.gz` und `SHA256SUMS`; Werte vor dem
Start im Ergebnisprotokoll eintragen.
Exact route/page: GitHub Actions Release-Run, GitHub Release-Seite, GHCR-
Paketansicht sowie lokal `/health`, `/api/status` und `/` am Testcontainer.
Test data/entity/card required: Ausschließlich der mitgelieferte lokale
Supervisor-/HA-Mock und Fake-Credentials aus dem Release-Smoke-Test.

### Steps

1. Notiere Releasecommit, vollständigen Tag, erwarteten Image-/Archivnamen und
   den bisherigen `latest`-Digest beziehungsweise „nicht vorhanden“.
2. Prüfe am Commit einen sauberen Arbeitsbaum, die vollständige CI und die
   Gleichheit von Paket-, Lockfile-, App-, Metadaten-, Changelog- und
   Release-Notes-Version.
3. Erzeuge und pushe erst nach der dokumentierten Freigabe den neuen RC-Tag.
4. Öffne den genau durch diesen Tag gestarteten Releaseworkflow und verifiziere
   die Jobs `validate`, amd64, arm64, Manifest, Smoke und Publish einzeln.
5. Prüfe, dass beide Architekturjobs dasselbe Dockerfile und den exakten
   Releasecommit verwenden und keine Produktions-HA-URL/-Credentials erhalten.
6. Inspiziere das versionierte GHCR-Manifest; protokolliere Digest und die
   Plattformen `linux/amd64` sowie `linux/arm64`.
7. Ziehe das versionierte Image auf dem isolierten amd64-Testhost und starte
   den vorgesehenen localhost-Mock-Smoke-Test; prüfe `/health`, `/api/status`,
   `/` und mindestens ein statisches CSS-/JS-Asset.
8. Öffne den GitHub Release und prüfe `prerelease`, Release Notes, Archiv und
   `SHA256SUMS`.
9. Lade beide Dateien in ein leeres Verzeichnis, führe
   `sha256sum --check SHA256SUMS` aus und liste den Tar-Inhalt.
10. Prüfe, dass das Tar keine `.env`, Keys, Logs, Tests, `node_modules`,
    `data`, Uploads oder lokale Pfade enthält und alle versprochenen
    Installationsdokumente/Pfade tatsächlich vorhanden sind.
11. Vergleiche den `latest`-Digest mit Schritt 1. Ein RC darf ihn nicht ändern
    und bei vorher fehlendem `latest` keinen neuen Tag anlegen.
12. Prüfe, dass App-`config.yaml`, GitHub Release, Image-Label/Tag und Archiv-
    `VERSION` genau dieselbe RC-Version/Revision bezeichnen.

### Expected Result

- Alle Releasejobs gehören zum exakten freigegebenen Commit und sind grün.
- Das versionierte öffentliche Manifest enthält genau die unterstützten
  amd64-/arm64-Plattformen; der Container besteht den isolierten Smoke-Test.
- GitHub kennzeichnet den Release als Prerelease und hängt Archiv plus gültige
  Checksum an.
- Das Bundle ist secretfrei, selbsttragend dokumentiert und reproduzierbar.
- `latest` bleibt bei einem RC unverändert.

### Fail If

- Eine Version, Revision, Architektur oder ein Artefakt fehlt/abweicht.
- Ein Job verwendet einen anderen Commit, ein altes Image oder Produktions-HA.
- Checksum, Manifest, Health/API/Assets oder Bundle-Inhalt schlagen fehl.
- Das RC verändert/erzeugt `latest` oder erscheint als Stable-Release.
- Credential, Nutzerdatum, Upload, Log, Schlüssel oder nicht auflösbarer
  Installationspfad ist im öffentlichen Artefakt enthalten.

### Evidence

- Workflow-URL und Job-Screenshots/-Logs ohne Secrets.
- Tag, Commit-SHA, Release-URL, Manifest-/Arch-Digests.
- Ausgabe der Manifest-, Checksum- und Tar-Inhaltsprüfung.
- Container-Smoke-Ausgabe und vor/nachher `latest`-Digest.

### Result

NOT TESTED

## MT-56

Test ID: MT-56

Sprint: 25, 25.4
Requirement: Das Standalone-Releaseartefakt unterstützt einen echten Fresh
Install, ein N→N+1-Upgrade und einen kontrollierten Rollback, ohne Konfiguration,
Regeln, Hintergründe, Adminschutz oder Daten zu verlieren.
System: Isolierter Debian-LXC oder VM auf amd64 mit systemd und Node.js 22;
nicht der produktive Dashboard-LXC und kein produktives Home Assistant.
Preconditions: Zwei tatsächlich veröffentlichte, aufeinanderfolgende
Standalone-Releases N und N+1 samt gültiger `SHA256SUMS`; lokaler Fake-HA oder
isoliertes Test-HA; eigener Testbenutzer; freie Testports; keine echte `.env`.
Exact version/tag/artifact under test: Im Ergebnis die konkreten Tags,
`ha-legacy-dashboard-<N>.tar.gz` und
`ha-legacy-dashboard-<N+1>.tar.gz` eintragen.
Exact route/page: `/health`, `/api/status`, `/admin`, `/`, ein Custom-Dashboard,
`/system/summary` und `/system/errors` auf der isolierten LAN-Adresse.
Test data/entity/card required: Mindestens Default- und Custom-Dashboard,
Section, Room Card, Entity Rule, Grace-Regel, Critical Mode/Label, ein
Hintergrundbild und separate Fake-Admin-/HA-Credentials.

### Steps

1. Lade Release N und N+1 jeweils mit zugehöriger Checksum in getrennte leere
   Verzeichnisse und verifiziere beide mit `sha256sum --check`.
2. Entpacke N in ein versionsbezogenes Runtimeverzeichnis. Befolge nur die im
   Archiv enthaltene Anleitung; notiere jede fehlende Datei oder unauflösbare
   Befehlsreferenz.
3. Erzeuge aus `.env.example` eine ausschließlich lokale Test-`.env`, setze
   Modus `0600`, installiere mit Lockfile und passe die systemd-Unit an den
   Testpfad/-benutzer an.
4. Starte Release N und prüfe Dienststatus, secretfreie Logs, `/health`,
   `/api/status`, Dashboard und Adminzugang.
5. Lege die Testkonfiguration an: Custom-Dashboard, Section, Room Card,
   Hintergrund, Summary-/Error-Entity-Regeln, Critical Mode/Label, Grace-Regel
   und unveränderte explizite Control-Freigabe. Notiere Konfigurations- und
   Hintergrundhashes sowie die Dateirechte.
6. Schalte Light/Dark und prüfe Default, Custom, Summary, Errors sowie Rückkehr;
   notiere, dass Theme browserlokal erhalten bleibt.
7. Sichere `.env`, den vollständigen Datenordner und das aktive
   Runtimeverzeichnis. Stoppe den Dienst.
8. Entpacke N+1 in ein neues Verzeichnis, übernimm `.env` und Daten gemäß der
   Bundle-Anleitung, installiere die gesperrten Produktionsabhängigkeiten und
   schalte die Unit kontrolliert auf N+1 um.
9. Starte N+1, prüfe Health/API/Logs und verifiziere jedes Testobjekt aus
   Schritt 5, Hintergrunddatei/-hash, Adminschutz, Theme und Controls.
10. Starte den Dienst und danach den LXC/die VM neu; wiederhole die
    Persistenzprüfung.
11. Simuliere einen fehlgeschlagenen Upgrade-Start kontrolliert, ohne Daten zu
    löschen; verifiziere, dass die Sicherung und letzte gültige Konfiguration
    erhalten bleiben.
12. Stoppe N+1, stelle den dokumentierten Rollback auf Release N samt passender
    Datensicherung her und prüfe erneut Health, API, UI, Daten, Adminschutz und
    Logs.
13. Vergleiche alle vor/nachher Hashes und dokumentiere gegebenenfalls
    notwendige, ausdrücklich angekündigte Migrationen.

### Expected Result

- Beide Checksums sind gültig und jede Anleitung ist vollständig aus dem
  jeweiligen Archiv heraus ausführbar.
- Fresh Install, N→N+1, Neustart und Rollback starten kontrolliert.
- Dashboards, Sections, Room Cards, Regeln, Modi, Hintergründe, Adminschutz und
  Theme bleiben entsprechend der dokumentierten Persistenz erhalten.
- `.env` bleibt `0600`, Tokens erscheinen weder im Browser noch in Logs.
- Ein Fehler zerstört weder Daten noch die letzte gültige Konfiguration.

### Fail If

- Die Anleitung verlangt eine fehlende Datei/einen Git-Arbeitsbaum oder der
  Dienst startet nur mit undokumentierten Schritten.
- Checksum, Lockfileinstallation, Health/API oder ein Runtimewechsel scheitert.
- Konfiguration, Upload, Regel, Theme, Adminschutz oder Datei-/Secretgrenze
  verändert sich unerwartet.
- Rollback ist nicht möglich oder überschreibt die letzte gültige Datenkopie.

### Evidence

- Verwendete Versionen, Commit-/Artefaktdigests und Checksum-Ausgaben.
- Redigierte Install-/systemd-/Health-/API-/Logausgaben.
- Vor/nachher Konfigurations- und Hintergrundhashes, Dateirechte und
  Screenshots der relevanten Routen.
- Protokoll von Fresh Install, Upgrade, Neustart, Fehlerfall und Rollback.

### Result

NOT TESTED

## MT-57

Test ID: MT-57

Sprint: 25
Requirement: Ein Stable-Release wird erst nach vollständiger, commitbezogener
Freigabe erzeugt und aktualisiert `latest` kontrolliert auf exakt das geprüfte
versionierte Multi-Arch-Manifest.
System: GitHub Actions, GHCR und GitHub Release; keine Produktions-HA-Instanz.
Preconditions: Mindestens ein erfolgreich abgenommener RC; alle P0/P1-
Reparaturen geschlossen und re-auditiert; alle verbindlichen iPad-/HAOS-/
Standalone-Manuelltests für den Stable-Kandidaten dokumentiert PASS; neue
Stable-SemVer ohne Suffix in allen Quellen; CI grün; keine bestehende
widersprüchliche Stable-Version.
Exact version/tag/artifact under test: Der konkrete neue `v<stable>`-Tag,
`ghcr.io/tekky85/ha-legacy-dashboard:<stable>`, `:latest`, Standalone-Tar und
`SHA256SUMS`; alle Werte vor Start eintragen.
Exact route/page: Commitbezogenes Freigabedokument/geschütztes Environment,
GitHub Actions Release-Run, GHCR-Paketansicht und GitHub Release-Seite.
Test data/entity/card required: Keine Produktionsdaten; die Runtimeabnahme muss
bereits durch die referenzierten manuellen Tests mit kontrollierten Daten belegt
sein.

### Steps

1. Prüfe, dass die Freigabematrix den exakten Stable-Commit, RC-Digests,
   abgeschlossene Pflicht-Manuelltests und keine offenen P0/P1-Befunde nennt.
2. Notiere den bisherigen `latest`-Digest und den Digest des geprüften
   versionierten Stable-Kandidaten.
3. Prüfe die Stable-Version in Paket, Lockfile, App, Metadaten, Changelogs und
   Release Notes; sie darf kein `-rc.N` enthalten.
4. Erzeuge/pushe den Stable-Tag erst nach dem überprüfbaren Approval.
5. Beobachte den Workflow und stelle sicher, dass `latest` vor erfolgreichem
   Test, beiden Arch-Builds, Manifestvalidator und Smoke-Test unverändert bleibt.
6. Nach erfolgreichem Gate prüfe, dass der `latest`-Manifestdigest exakt dem
   versionierten Stable-Manifest entspricht und beide Plattformen enthält.
7. Prüfe, dass GitHub einen normalen Release, kein Prerelease, mit finalen
   Notes, Archiv und gültiger Checksum erstellt.
8. Prüfe, dass der vorherige RC-Tag, sein Manifest und seine Artefakte
   unverändert bleiben und nicht überschrieben wurden.
9. Dokumentiere einen kontrollierten fehlgeschlagenen Testlauf oder eine
   Workflow-Fixture: vor dem finalen Gate dürfen weder neuer `latest`-Tag noch
   GitHub Release entstehen.

### Expected Result

- Stable wird nur für den vollständig freigegebenen Commit veröffentlicht.
- `latest` ändert sich erst nach allen Gates und zeigt exakt auf das geprüfte
  versionierte amd64/aarch64-Manifest.
- GitHub Release ist stable, vollständig und checksum-validiert.
- RC-/ältere unveränderliche Tags und Artefakte bleiben unverändert.
- Ein fehlgeschlagenes Gate veröffentlicht weder `latest` noch Release.

### Fail If

- Tag/Release kann ohne dokumentierte commitbezogene Pflichtabnahme entstehen.
- `latest` ändert sich vor dem Smoke-Test, zeigt auf einen anderen Digest oder
  enthält nicht beide Plattformen.
- GitHub kennzeichnet Stable als Prerelease oder überschreibt RC-Artefakte.
- Ein fehlerhafter Lauf hinterlässt öffentliches `latest`/Release.

### Evidence

- Freigabedokument/Approval mit Commit und Resultaten.
- Workflow-URL und Jobstatus, Stable-/`latest`-/Arch-Digests vor und nachher.
- GitHub-Release-URL, Releaseart, Checksumausgabe und Artefaktliste.
- Nachweis, dass frühere RC-Tags/Artefakte unverändert sind.

### Result

NOT TESTED

## Finale Strukturprüfung aus Audit Part 19

- 72 Tabellenzeilen und 72 eindeutige Detailüberschriften sind vorhanden;
  keine ID fehlt und keine ist doppelt.
- Jeder Eintrag enthält explizit Test ID, Sprint, Requirement, Device/System,
  Preconditions, exakte Schritte, Expected Result, Fail If, Evidence und
  Result `NOT TESTED`.
- MT-01 bis MT-10 wurden in Part 19 ausschließlich dokumentarisch
  vervollständigt; kein manueller Test wurde ausgeführt oder umbewertet.
- MT-67 bis MT-72 decken Sections, Room Cards, HAOS-Room-Persistenz, reale
  Control-Integrationen und die iPad-Controlmatrix aus Part 19 ab.
- Primäre, überschneidungsfreie Systemzuordnung: iPad mini/HomeScreen 31,
  iPad Air 2 5, macOS-/Browser-/kontrolliertes Test-HA 18, Standalone/LXC 9,
  HAOS 7, Release/GitHub 2.
