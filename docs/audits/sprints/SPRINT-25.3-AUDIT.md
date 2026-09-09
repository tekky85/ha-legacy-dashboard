# Sprint-25.3-Audit – Per-Dashboard Background Images & Optional Titles

## Auditrahmen

- Audit-Part: 16
- Auditdatum: 8. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.3.md`](../../sprints/SPRINT-25.3.md)
- Gezielter Re-Audit: Sprint 27.1-A, Basiscommit `dec0c54`
- Anwendungscode im Baseline-Audit geändert: nein; Sprint 27.1-A: zentraler
  PNG-Parser gehärtet
- Produktives Home Assistant, HAOS, LXC oder physisches iPad kontaktiert: nein

## Gesamtergebnis

**Sprint 25.3: PARTIAL**

Der vollständige Background-Pfad ist im aktuellen Code vorhanden: Jede
Default-/Custom-Dashboardkonfiguration besitzt unabhängig `background` und
`showTitle`; die geschützte Admin-Oberfläche kann JPEG/PNG hochladen,
voranzeigen, ersetzen und entfernen; Assets werden unter dem Runtime-`DATA_DIR`
mit zufälliger ID atomar gespeichert und ausschließlich über eine kontrollierte
referenzgeprüfte GET-Route ausgeliefert. Das Wall-Display rendert Bild,
Position, `cover`/`contain`, Overlay und optionalen Titel ES5-kompatibel. Der
Flex-/Viewport-Aufbau hält Background, Inhalt und nicht fixierten Footer über
die volle sichtbare Höhe; Focus liegt deterministisch darüber.

Der in Part 16 gefundene Parserdefekt ist in Sprint 27.1-A gezielt repariert.
Der begrenzte PNG-Parser verifiziert nun die CRC jedes Chunks, gültige
IHDR-Felder, die Reihenfolge und Einmaligkeit kritischer Chunks, mindestens
einen zusammenhängenden `IDAT`-Block sowie ein sauberes `IEND` am Dateiende.
Fehlendes `IDAT`, falsche CRC, Truncation, Daten nach `IEND`, doppelte Header
und unbekannte kritische Chunks werden abgewiesen. Dashboard- und Room-
Replacementtests bestätigen, dass dabei die letzte gültige Konfiguration und
Datei erhalten bleiben und keine Temp-/Waisendatei entsteht. `RQ-16-01` ist
damit automatisiert geschlossen; JPEG bleibt durch Sprint 25.5 gehärtet.

Zusätzlich sind die 84 nummerierten Prüfpunkte der Spezifikation nicht
vollständig direkt rückverfolgbar (`RQ-16-02`) und die bereits bekannte
routeabhängige immutable Assetversion (`RQ-04-01`) betrifft auch Theme,
Admin-Preview und Wall-Runtime. Reale iPad-, LXC-Restart- und HAOS-`/data`-
Abnahmen stehen aus. Daher bleibt Sprint 25.3 trotz des bestandenen Re-Audits
und 330/330 vollständigen Tests bis zu den bestehenden Matrix-/Realgerätegates
`PARTIAL`.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.3-MODEL-01 | Pro Default-/Custom-Dashboard genau eine unabhängig konfigurierbare Background-Darstellung | PASS | `src/config/dashboard.js:validateDashboardAppearance()` validiert `background` pro Dashboard; `toPublicConfig()` gibt es dashboardbezogen aus. Duplikate übernehmen absichtlich kein Asset. |
| 25.3-MODEL-02 | Bestehendes Dashboardmodell erweitern, kein Parallelformat | PASS | Schema 12 führt die Felder im bestehenden Dashboardobjekt; `DashboardConfigStore` bleibt alleinige Konfigurationspersistenz. |
| 25.3-MODEL-03 | `background` ist optional und besitzt Bild, Position, Größe und Overlay | PASS | Erlaubte Werte: fünf Positionen, `cover`/`contain`, Overlay 0/10/20/30/40/50; `null` bleibt gültig. |
| 25.3-MODEL-04 | `showTitle` ist pro Dashboard boolesch und standardmäßig aktiv | PASS | Validation verlangt Boolean; Migration aus Schema 8 setzt `showTitle: true`. |
| 25.3-MODEL-05 | Bestehende Konfiguration migriert verlustfrei | PASS | `migrateSchema8To9()` ergänzt nur Appearance-Defaults; Persistenztests und Sprint-25.3-Migrationstest sind grün. |
| 25.3-MODEL-06 | Public API enthält nur sanitisierten Assetpfad, keine interne Dateiablage | PASS | `toPublicConfig()` liefert `image_url=/assets/backgrounds/<id>` und Appearance-Metadaten, weder `DATA_DIR` noch absoluten Pfad. |
| 25.3-ADMIN-01 | Geschützte Admin UI zeigt Backgroundbereich pro Dashboard | PASS | `src/admin/index.html`, `src/admin/js/dashboards.js` und `src/admin/js/app.js`; Dashboardeditor bindet Preview und Appearance-Felder. |
| 25.3-ADMIN-02 | Upload, Preview, Replace und Remove | PASS | `AdminApi.uploadDashboardBackground()`/`removeDashboardBackground()` und Dashboardeditor; Fokus- und Admin-API-Tests grün. |
| 25.3-ADMIN-03 | JPEG/JPG und PNG wählbar, SVG/generischer Upload nicht angeboten | PASS | File-Input akzeptiert `.jpg,.jpeg,.png` und die zugehörigen MIME-Typen; Server entscheidet abschließend. |
| 25.3-ADMIN-04 | Position, Cover/Contain, Overlay und `showTitle` editierbar | PASS | Select-/Range-/Checkbox-Controls und Live-Preview; serverseitig dieselben Enum-/Rangegrenzen. |
| 25.3-ADMIN-05 | Admin-Preview nutzt dieselbe gespeicherte Konfiguration wie die Runtime | PASS | Preview liest Dashboard-Draft/gespeicherte `imageId`; Runtime erhält daraus die sanitisierten Felder. Der Bildpfad ist dieselbe `/assets/backgrounds/`-Route. Routeübergreifendes Cache-Risiko separat 25.3-CACHE-02. |
| 25.3-ADMIN-06 | Ungespeicherter Draft wird vor Assetoperation kontrolliert behandelt | PASS | Editor blockiert Upload/Remove bei dirty Config und fordert zuerst Save/Discard; verhindert versteckte Mischzustände. |
| 25.3-AUTH-01 | Admin API standardmäßig aus und Bearer-geschützt | PASS | Globale `requireAdmin`-Middleware liegt vor Background-Parser/-Routen; bestehende Admin-Auth-Tests grün. |
| 25.3-AUTH-02 | Write-Rate-Limit gilt auch für Upload/Remove | PASS | `router.use(limitAdminWrites)` liegt vor den Backgroundrouten. |
| 25.3-UPLOAD-01 | Server akzeptiert nur JPEG/PNG und prüft tatsächlichen Inhalt | PASS | MIME und Binärformat werden geprüft. JPEG ist gehärtet; PNG prüft Signatur, IHDR-Inhalt, CRC, Critical-Chunk-Reihenfolge, IDAT und IEND/EOF. |
| 25.3-UPLOAD-02 | Malformed/truncated/manipulierte Bilder werden abgewiesen | PASS | Gezielte Regressionen weisen fehlendes `IDAT`, CRC-Manipulation, Truncation, Daten nach `IEND`, doppeltes `IHDR` und unbekannte kritische Chunks ab. |
| 25.3-UPLOAD-03 | SVG/HTML als JPEG/PNG getarnt werden abgewiesen | PASS | Signatur-/Segmentprüfung lehnt Textpayloads ab; Sprint-25.5-Regressionen sind grün. |
| 25.3-UPLOAD-04 | Dateigröße und Bilddimensionen/Pixelfläche sind begrenzt | PASS | 10 MiB Raw-Parserlimit sowie 4096 px je Achse und 16.777.216 Pixel in `dashboard-backgrounds.js`. |
| 25.3-UPLOAD-05 | Pfadmanipulation und nutzerbestimmte Dateinamen sind ausgeschlossen | PASS | 128-Bit-Random-ID plus feste Endung; strikter ID-RegEx; `resolveImagePath()` akzeptiert keine Pfadbestandteile. |
| 25.3-UPLOAD-06 | Tokens, Dateinamen und private Payloads werden nicht geloggt | PASS | Adminroute loggt nur kontrollierten `error_type`; strukturierte Logger redigieren Secrets; kein Body-/Tokenlogging. |
| 25.3-JPEG-01 | Normale Baseline-/Progressive-/JFIF-/EXIF-/ICC-JPEGs funktionieren | PASS | Durch Sprint 25.5 superseded: `test/sprint-25-5.test.js` prüft Baseline, Progressive, APP0, APP1, Orientation, Thumbnail und APP2. |
| 25.3-STORE-01 | Assets liegen im Runtime-`DATA_DIR` | PASS | `DashboardBackgroundStore` verwendet `<DATA_DIR>/backgrounds`; Runtimekonfiguration akzeptiert `DATA_DIR`. |
| 25.3-STORE-02 | HA-App-Modus verwendet `/data` | PASS | `src/config/runtime.js` und `ha_legacy_dashboard/run.sh`; reale HAOS-Persistenz bleibt MT-51/52. |
| 25.3-STORE-03 | Standalone behält den bestehenden Datenpfad bzw. Override | PASS | Ohne App-Modus wird `<repo>/data` verwendet; `DATA_DIR` überschreibt kontrolliert. Reale LXC-Abnahme MT-60. |
| 25.3-STORE-04 | Verzeichnis/Datei besitzen restriktive Rechte | PASS | Store erzeugt Verzeichnis `0700`, temporäre/finale Datei `0600`; automatisierter Storetest grün. |
| 25.3-STORE-05 | Assetwrite ist atomar und hinterlässt bei Schreibfehler keine Teildatei | PASS | exklusives Tempfile, `fsync`, `rename`, Directory-`fsync`; Fehlerpfad entfernt Tempfile. |
| 25.3-STORE-06 | Konfigurationswrite bleibt validiert, atomar und mit Backup | PASS | `DashboardConfigStore.save()` validiert vor Tempwrite/rename und hält genau `.bak`; Persistenzsuite grün. |
| 25.3-STORE-07 | Abgewiesener/fehlgeschlagener Ersatz bewahrt altes Asset und Config | PASS | Validierung erfolgt vor dem Store. Dashboard- und Room-API-Regressionen prüfen ungültige PNG-Replacements und finden danach ausschließlich die unveränderte Altdatei samt alter Public-Config. |
| 25.3-STORE-08 | Entfernen aktualisiert zuerst Config und löscht danach nur das alte Asset | PASS | DELETE-Route speichert `background:null`, anschließend `remove(oldImageId)`; fehlgeschlagener Configwrite bewahrt das Asset. |
| 25.3-STORE-09 | Verwaiste Assets werden nach Configänderungen kontrolliert bereinigt | PASS | `cleanupUnusedBackgrounds()` vergleicht Referenzen; Room-Card-Erweiterung berücksichtigt später beide Referenzarten. |
| 25.3-ROUTE-01 | Assetroute ist read-only, referenzgeprüft und ohne Directory Listing | PASS | `GET /assets/backgrounds/:imageId` prüft aktuelle Configreferenz und sicheren Pfad; Datenroot wird nicht statisch veröffentlicht. |
| 25.3-ROUTE-02 | Richtiger MIME-Typ, `nosniff` und restriktive CSP | PASS | Route setzt JPEG/PNG-Type, `X-Content-Type-Options: nosniff`; CSP erlaubt Bilder nur von `self`/`data:`. |
| 25.3-ROUTE-03 | Fehlendes/unreferenziertes Asset liefert kontrolliert 404 | PASS | Serverroute gibt generischen 404; Wall-Renderer bleibt bedienbar und behält keine vorherige Bilddarstellung. |
| 25.3-CACHE-01 | Ersatz verwendet eine neue Asset-ID und umgeht alten Bildcache | PASS | Jeder Upload erzeugt neue Random-ID; Public URL ändert sich, Assetantwort ist immutable cachebar. |
| 25.3-CACHE-02 | Gemeinsame UI-Assets werden auf allen Routen konsistent versioniert | PASS | Dashboard, Systemseite, Admin und Manifest laden v52; `test/asset-version.test.js` prüft zusätzlich die geteilten Presentation-/Icon- und Theme-/Navigationsassets. | RQ-04-01 code-seitig geschlossen; reale Background-/Preview-Abnahme bleibt `NOT TESTED`. |
| 25.3-RUNTIME-01 | Wall-Display rendert das jeweilige Dashboardbild | PASS | `src/public/js/app.js:applyDashboardAppearance()` setzt Body-Background aus ausschließlich validiertem `image_url`. |
| 25.3-RUNTIME-02 | Position, Cover/Contain und Overlay werden angewendet | PASS | Enumprüfung im Client, Body-Position/-Size/-Repeat und separate Overlay-Opacity; Sprint-25.3-Test grün. |
| 25.3-RUNTIME-03 | Dashboardwechsel entfernt alte Appearance vollständig | PASS | `applyDashboardAppearance()` löscht Image/Position/Size und versteckt Overlay, wenn kein gültiger Background vorliegt. |
| 25.3-RUNTIME-04 | Dark/Light bleibt unabhängig und persistent | PASS | Body-Background liegt unter der bestehenden Themefarbwelt; Sprint-25.1-Themehelper unverändert. Physisches iPad bleibt MT-58. |
| 25.3-TITLE-01 | Titel ist pro Dashboard optional, nicht global entfernt | PASS | `show_title` toggelt nur `header.is-title-hidden`; Dashboardkonfiguration bleibt unabhängig. |
| 25.3-TITLE-02 | Bei `showTitle=false` verschwindet ungenutzter Titelraum | PASS | Brandblock wird `display:none`, Header richtet verbleibende Meta-/Nav-Controls neu aus. |
| 25.3-TITLE-03 | Summary-Navigation und Health Indicator bleiben sichtbar | PASS | Nur `.brand` wird versteckt; Systemnavigation, Connection, Clock und Theme bleiben im Header. |
| 25.3-HEIGHT-01 | Dashboard füllt mindestens den sichtbaren Viewport | PASS | `html/body` und `.app` min-height 100%; `applyDashboardViewportHeight()` setzt sicheren `innerHeight`-Pixelwert und reagiert auf Resize. |
| 25.3-HEIGHT-02 | 0/1/wenige Karten lassen keinen Hintergrund-/Footerspalt | PASS | `.app` ist Flexspalte, `.grid` wächst mit `flex:1 0 auto`, Footer bleibt danach. Kontrollierte frühere Browsermessung und CSS-Test; echte iOS-Abnahme MT-58. |
| 25.3-HEIGHT-03 | Viele Karten wachsen normal und erzeugen keinen künstlichen internen Scrollcontainer | PASS | Kein festes Grid-Height/Overflow-Scrolling; Dokumentfluss wächst über den Viewport. Reale Extremmatrix MT-58. |
| 25.3-FOOTER-01 | Normaldashboard zeigt nur einen kompakten Aktualisiert-Status | PASS | `index.html` enthält ausschließlich `.updated`; `app.js` schreibt lokalen Aktualisiert-/Status-Text, keine Versionsnummer. |
| 25.3-FOOTER-02 | Footer ist mittig, nicht fixed/sticky und kollidiert nicht mit Karten | PASS | `.updated` ist normales Flexkind `flex:0 0 auto`, ohne `position:fixed/sticky`; Grid wächst davor. |
| 25.3-FOOTER-03 | Versionshinweis bleibt auf Admin/Systemseiten verfügbar | PASS | Admin- und Systemfooter zeigen `1.0.0-rc.1`; Versionsdrift ist separat `RQ-13-01`, nicht Sprint-25.3-Footerlogik. |
| 25.3-FOCUS-01 | Background/Overlay blockieren Focus oder Controls nicht | PASS | Overlay `z-index:0; pointer-events:none`, App `z-index:1`, Focus `position:fixed; z-index:1000`; Focusregressionen grün. |
| 25.3-FOCUS-02 | Focus/Grid-Trennung aus Sprint 17.5 bleibt erhalten | PASS | Background wird auf Body/Overlay angewendet, nicht in Grid- oder Focus-DOM kopiert; `test/sprint-17-5.test.js` grün. |
| 25.3-NAV-01 | HomeScreen Same-Window-/Return-Navigation bleibt erhalten | PASS | Sprint-25.2-Helfer unverändert; relative Routen und Systemnavigationstests grün. Physisches iOS bleibt MT-58. |
| 25.3-SEC-01 | Keine HA-/Supervisor-Credentials gelangen in Browser/Assetpfad | PASS | Public Config enthält nur relative Asset-URL; kein Token in Wall-Code/JSON; Backgroundroute benötigt kein HA-Credential. |
| 25.3-SEC-02 | Keine neue HA-Write-Fähigkeit oder generischer Serviceproxy | PASS | Backgroundwrites enden ausschließlich in Config-/Assetstore; `test/sprint-25-3.test.js` und Securitytests prüfen unveränderte HA-Routen. |
| 25.3-SEC-03 | Upload erzeugt keine Skript-/SVG-Ausführungsfläche | PASS | SVG nicht akzeptiert, nur JPEG/PNG-MIME, `nosniff`, CSP und Contentparser. PNG-Defekt betrifft Strukturvalidität, nicht eine neue Script-Origin. |
| 25.3-LEG-01 | Wall-JavaScript bleibt ES5/iOS-9-kompatibel | PASS | `var`/Funktionen/Callbacks; Scan ohne `let`, `const`, Arrow, Template Literal, fetch, Promise, async/await, Optional Chaining oder Module. |
| 25.3-LEG-02 | Layout benötigt kein CSS Grid, Flex-gap, ResizeObserver oder Container Query | PASS | Wall-CSS nutzt prefixed Flexbox und Media Queries; statischer Scan grün. |
| 25.3-LEG-03 | Moderne Admin-APIs bleiben auf die moderne Admin UI begrenzt | PASS | `fetch`/async befinden sich nur unter `src/admin`; Wall-Display lädt diese Dateien nicht. |
| 25.3-DOC-01 | README DE/EN und technische Dokumentation beschreiben Backgrounds synchron | PASS | Beide Sprachfassungen dokumentieren Upload, Felder, `DATA_DIR` und Sicherheit; Roadmap/Projektstatus enthalten Sprint 25.3. Globaler Statusdrift bleibt `RQ-08-03`. |
| 25.3-DOC-02 | Echte/kontrollierte Screenshots für Dashboard und Admin vorhanden | PASS | `docs/screenshots/dashboards/background-image.png` und `docs/screenshots/admin/dashboard-background.png` sind echte PNGs aus kontrollierter Real-App, ohne sichtbare Tokens/IPs. Die allgemeine spätere D1-Galerielücke bleibt `RQ-08-02`. |
| 25.3-TEST-01 | Kernpfad besitzt isolierte automatisierte Regressionen | PASS | `test/sprint-25-3.test.js` enthält neun direkte Tests; Admin-, Gateway-, Persistenz-, JPEG-, Focus-, Navigation-, Security- und Deploymenttests ergänzen den Pfad. |
| 25.3-TEST-02 | Alle 84 nummerierten Testfälle sind direkt nachvollziehbar | PARTIAL | Die zuvor fehlenden PNG-Struktur-/CRC-/Replace-Fälle sind jetzt direkt regressiert. Nicht jede Größen-/Viewport-/Restart-/Failure-Kombination ist jedoch einzeln zugeordnet; `RQ-16-02` bleibt offen. |
| 25.3-MAN-01 | Reales iPad mini: Background, Titel, Full Height, Footer, Focus, Theme, Cache und HomeScreen | NOT TESTED | MT-58; Part 16 führte keine physische Prüfung aus. |
| 25.3-MAN-02 | Aktuelles Safari/Admin: Uploadmatrix, Preview/Runtime, Validierung und Ersatz | NOT TESTED | MT-59. |
| 25.3-MAN-03 | Standalone/LXC: DATA_DIR, Rechte, Restart und Backup | NOT TESTED | MT-60. |
| 25.3-MAN-04 | HAOS: `/data`, App-Restart, Backup/Upgrade und direkter iPad-LAN-Zugriff | NOT TESTED | Vorhandene MT-51, MT-52 und MT-54 wurden Sprint 25.3 mit zugeordnet. |

## Daten-, Upload- und Renderingpfad

```text
Admin-Bearer-Auth + Write-Limit
  -> Raw-Uploadlimit
  -> JPEG-/PNG-Inspektion
  -> zufällige bg-<128-bit>.<ext>-ID
  -> atomare Datei in <DATA_DIR>/backgrounds
  -> vollständige Config validieren und atomar speichern
  -> erst danach altes, unreferenziertes Asset entfernen

Public Dashboard Config
  -> nur /assets/backgrounds/<id> + Appearance-Metadaten
  -> referenzgeprüfte read-only Assetroute
  -> Body-Background + Overlay unter App/Focus
  -> Grid und normaler Footer im Flex-Dokumentfluss
```

Die Architektur und der Parserpfad sind im automatisierten Re-Audit sicher:
`inspectPng()` weist die bekannten Strukturmanipulationen vor dem Store ab.
Damit greifen die vorhandenen atomaren Store-/Config- und Rollbackgrenzen auch
für PNG zuverlässig.

## Superseded-Beziehungen

- Sprint 25.5 ersetzt den ursprünglichen Sprint-25.3-JPEG-Segmentparser durch
  einen realweltfähigen Parser für Baseline, Progressive, JFIF, EXIF,
  Orientation, Metadaten-Thumbnail und ICC. Der ursprüngliche Sicherheitszweck
  bleibt erfüllt.
- Sprint 26.1 nutzt denselben sicheren Assetstore zusätzlich für Room Cards.
  Das verändert die per-Dashboard-Konfiguration nicht; die Assetroute prüft
  aktuell beide zulässigen Referenzarten.
- Spätere Sections/Room Cards und Präsentationstiers ersetzen weder den
  Full-Height-Aufbau noch den Dashboardtitel-/Backgroundpfad.

## Automatisierte Verifikation

- Sprint-27.1-A-Fokuslauf: **85/85 PASS**, 0 Fehler. Abgedeckt waren Sprint 25.3,
  Sprint-25.5-JPEGs, Admin API, Gateway, Persistenz, Focus, HomeScreen-
  Navigation, Security, Standalone und Deployment.
- Gesamtsuite: **330/330 PASS**, 0 Fehler.
- Geänderte JavaScriptdateien bestanden `node --check`.
- `ha_legacy_dashboard/run.sh` und
  `deploy/prepare-home-assistant-app.sh` bestanden `sh -n`; der direkte
  Release-Versionscheck bestätigte den konsistenten String `v1.0.0-rc.1`.
  Dass dieses veröffentlichte RC-Tag nicht HEAD entspricht, bleibt getrennt
  als `RQ-13-01` offen.
- Wall-Legacy-/CSS-Scan: keine verbotene moderne Syntax, kein CSS Grid,
  Flexbox-`gap`, ResizeObserver oder Container Query als Voraussetzung.
- Security-Scan: kein HA-/Supervisor-Token im Public Payload, keine neue
  HA-Write-Route und kein generischer Service-/WebSocketproxy.
- Kontrollierte PNG-Proben: Der unveränderte Baselinecode akzeptierte fehlendes
  `IDAT` und manipulierte CRC; der reparierte Parser weist beide sowie
  Truncation, Daten nach `IEND`, doppeltes IHDR und unbekannte kritische Chunks
  kontrolliert ab.
- Tests verwendeten ausschließlich lokale Dateien, localhost-Mocks und
  Fake-Credentials; kein produktives System wurde kontaktiert.

## Manuelle Evidenz und Repair-Mapping

- MT-51: HAOS-`/data`, Rechte, App-Restart und ungültiger Ersatz;
- MT-52: Cold Backup/Restore, Upgrade und HAOS-Reboot;
- MT-54: direkter iPad-LAN-/HomeScreen-Pfad mit Background;
- MT-58: vollständige reale iPad-mini-Darstellung und Cacheersatz;
- MT-59: Desktop-Safari-Admin-/Runtime-/Uploadmatrix;
- MT-60: Standalone/LXC-Persistenz und Neustart;
- `RQ-16-01`: automatisiert geschlossen; reale Background-Abnahmen bleiben
  `NOT TESTED`;
- `RQ-16-02`: unvollständige direkte Zuordnung der 84 Testfälle;
- `RQ-04-01`: in Sprint 27.1-B code-seitig geschlossen;
- `RQ-13-01`: veröffentlichte RC.1-Artefakte enthalten nicht den heutigen Code;
- `RQ-14-04`: Stable-Pipeline erzwingt diese manuellen Gates nicht.

## Abschluss

Die per-Dashboard Background-/Titel-/Full-Height-/Footerarchitektur ist im
aktuellen Repository vorhanden und breit regressiert. Der nachgewiesene PNG-
Akzeptanz- und Erhaltsfehler ist repariert. Sprint 25.3 bleibt wegen
`RQ-16-02`, des offenen P1-Cachebefunds und fehlender realer Zielgeräte-/
Betriebsabnahmen `PARTIAL`; daraus folgt ausdrücklich noch keine RC-Freigabe.
