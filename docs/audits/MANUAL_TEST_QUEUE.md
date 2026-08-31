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
