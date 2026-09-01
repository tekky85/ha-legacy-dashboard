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
