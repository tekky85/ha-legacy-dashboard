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
| MT-30 | 21 | Registry-/Diagnoseanreicherung, Partial Failure und Admin-Quellenstatus gegen reales Test-HA | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-31 | 21.1 | Echte Device-ID-Gruppierung, Filter, Details und responsive Cards im modernen Safari | macOS 13.7.8 Safari plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-32 | 21, 21.1 | Registry-Kontext und Device Groups auf realem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-33 | 21.2 | Summary-Filter und persistente 1/2/3-Spaltenansicht auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-34 | 21.2, 21.3 | Exakte Error-Severity-/State-Filter, child-first Device Groups und Spalten auf dem Legacy-Zielgerät | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-35 | 21.3 | Device-Class- und HA-Label-Kritikalitätsmodi gegen ein kontrolliertes reales HA | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-36 | 21.3 | Label-Rename, stale/unsupported, Löschung und Recovery ohne stillen Fallback | macOS Safari plus Standalone-LXC/kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-37 | 21.4 | Entity Rule Manager, kombinierte Filter und Batch Save/Discard im Desktop-Safari | aktuelle macOS-Safari-Version plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-38 | 21.4 | Entity Rule Manager, Touchziele und große Inventare auf modernem Touch-Tablet | iPad Air 2, iPadOS 15.8.5, Safari | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-39 | 21.4 | Vereinfachte Summary-/Error-Header und Count-Semantik auf der Legacy-Zielhardware | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-40 | 21.5 | Globale Health-/Summary-Navigation und sichere Rückkehr im Legacy-HomeScreen | iPad mini 1, iOS 9.3.5, HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-41 | 21.5 | Same-Window-Systemnavigation und Return-Nichtregression auf iPad Air 2 | iPad Air 2, iPadOS 15.8.5, Safari/HomeScreen | Vollständige Anleitung weiter unten. | NOT TESTED |
| MT-42 | 21.5 | Healthzustände, Filterunabhängigkeit, Failure-Fallback und Langzeitlauf in Desktop-Safari | aktuelle macOS-Safari-Version plus kontrolliertes Test-HA | Vollständige Anleitung weiter unten. | NOT TESTED |

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

## Detaillierte Anleitungen aus Audit Part 11

## MT-37

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

Sprint: 21.5
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

Sprint: 21.5
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

Sprint: 21.5
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

Sprint: 21
Requirement: Reale read-only Registry-/Diagnoseanreicherung, Quellenstatus,
Partial Failure, stale Metadaten und Recovery über den Standalone-Transport.
Device: Mac mit macOS 13.7.8 und der dort installierten Safari-Version;
Standalone-LXC `ha-legacy-dashboard` gegen ein kontrolliertes Test-Home-
Assistant.
Preconditions: Auditstand ist auf einem separaten Test-/LXC-Dienst ausgerollt;
`RQ-04-01` und `RQ-09-01` sind vor der finalen Abnahme behoben; eigener
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

Sprint: 21, 21.1
Requirement: Registry-Kontext, echte Device Groups, Filter/Details, Theme,
Scroll und Partial-Failure-Verhalten auf Safari iOS 9 im HomeScreen-Modus.
Device: iPad mini 1, iOS 9.3.5, als HomeScreen-Web-App.
Preconditions: Aktueller Build ausgerollt; `RQ-04-01` und `RQ-09-01` behoben;
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

Sprint: 21.2, 21.3
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

Sprint: 21.3
Requirement: Stabile Label-ID bei Rename, Last-known-Verhalten, sichtbarer
unsupported/error/missing-Zustand und automatische Recovery ohne stillen
Device-Class-Fallback.
Device: macOS 13.7.8 Safari, Standalone-LXC und kontrolliertes Test-HA.
Preconditions: Separater Test-Admin-Token; HA-Label und Labelmodus aus MT-35;
ein gelabeltes Testdevice mit kritischem unknown/unavailable Child; Möglichkeit,
Label-Registry-WebSocket getrennt von REST-States zu unterbrechen; `RQ-09-01`
ist vor der finalen Recovery-Abnahme behoben.
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
