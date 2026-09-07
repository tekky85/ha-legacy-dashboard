# Sprint-27-Warteschlange für manuelle Tests

Automatisierte Tests ersetzen keine reale iPad-, HomeScreen- oder
Home-Assistant-Abnahme. Ein Eintrag bleibt `NOT TESTED`, bis die beschriebene
Prüfung tatsächlich durchgeführt und mit Datum/System dokumentiert wurde.

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
| MT-13 | 17.2 | Globale Theme-Persistenz über alle Legacy-Routen | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
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

## Detaillierte Anleitungen aus Audit Part 04

## MT-11

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

## Detaillierte Anleitungen aus Audit Part 08

## MT-27

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

Sprint: 17.2
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
