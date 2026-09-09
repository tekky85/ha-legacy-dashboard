# Sprint-26-Audit – Dashboard Sections & Room Model Foundation

## Auditrahmen

- Audit-Part: 19
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-26.md`](../../sprints/SPRINT-26.md)
- Anwendungscode geändert: nein
- Physisches iPad, produktiver LXC, HAOS oder produktives Home Assistant geprüft: nein

## Gesamtergebnis

**Sprint 26: PARTIAL**

Das additive Section-Modell ist im aktuellen Schema 12 vollständig erhalten.
Dashboards dürfen null oder mehrere Sections besitzen; Widgets referenzieren
optional eine Section. Nicht zugeordnete Karten bleiben in einem
deterministischen Fallback sichtbar. Admin-CRUD, persistente Reihenfolge,
Titelanzeige, Kartenverschiebung und das sichere Löschen einer Section sind
implementiert. Das Layout rendert Sections vertikal und wendet das bestehende
Flexbox-Raster getrennt je Section an, sodass identische lokale Koordinaten in
verschiedenen Sections nicht kollidieren.

Das Ergebnis bleibt `PARTIAL`, weil die reale iPad-/LXC-Abnahme noch aussteht
und gemeinsam verwendete Legacy-Assets weiterhin unterschiedliche immutable
Cache-URLs besitzen (`RQ-04-01`). Es wurde kein neuer Section-Produktdefekt
gefunden.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 26-A1 | Persistentes `sections`-Array pro Dashboard | PASS | `src/config/dashboard.js`: Schema 10 führte `dashboard.sections` additiv ein; Schema 12 bewahrt es. |
| 26-A2 | Stabile eindeutige Section-ID | PASS | Section-Normalisierung/-Validierung prüft Format und Eindeutigkeit; Admin erzeugt `section-*`-IDs. |
| 26-A3 | `title`, numerisches `order`, boolesches `showTitle` | PASS | Vollständige Schema-Normalisierung und Validierung; Admin-Formular bearbeitet alle drei Felder. |
| 26-A4 | Optionale read-only `areaId` | PASS | String oder `null`; keine Gleichsetzung mit Section-ID. |
| 26-A5 | Optionales Widget-`sectionId` | PASS | Schemafeld, Validierung auf vorhandene Section oder `null`, Persistenz und Public Payload. |
| 26-A6 | Bestehende Dashboards ohne Sections bleiben gültig | PASS | Migration `<10` ergänzt `sections: []` und `sectionId: null`; Tests laden Altconfig ohne disruptive Migration. |
| 26-A7 | Sichere Defaults/Normalisierung | PASS | Fehlende Arrays/Felder werden additiv normalisiert; ungültige Referenzen werden kontrolliert abgewiesen. |
| 26-B1 | Section erstellen | PASS | `src/admin/js/sections.js::createSection`; geschütztes Batch-Speichern über bestehende Admin-Config-API. |
| 26-B2 | Section umbenennen | PASS | `updateSection` und Section-Editor; Save/Discard-Modell bleibt erhalten. |
| 26-B3 | Sections neu ordnen | PASS | `moveSection` ändert deterministische numerische Orderwerte; Renderer sortiert Order, dann ID. |
| 26-B4 | Section-Titel ein-/ausblenden | PASS | `showTitle` im Editor und bedingter `.dashboard-section-title`-Renderer. |
| 26-B5 | Karten einer Section zuordnen | PASS | Widgeteditor und `assignWidget`; Section-ID wird persistent gespeichert. |
| 26-B6 | Karten zwischen Sections verschieben | PASS | Zuordnung plus `Layout.relocateWidget` im neuen Section-Kontext. |
| 26-B7 | Nicht zugeordnete Karten unterstützen | PASS | `sectionId:null`; eigene Unassigned-Gruppe nur wenn nötig. |
| 26-B8 | Section löschen | PASS | `removeSection` entfernt nur die Section. |
| 26-B9 | Section-Löschung erhält alle Karten | PASS | Betroffene Widgets werden auf `sectionId:null` gesetzt und sicher neu platziert; Admin-/Persistenztest prüft unveränderte Widget-IDs/Anzahl. |
| 26-C1 | Sections vertikal anordnen | PASS | `src/public/css/style.css`: `.dashboard-sections` als Flex-Spalte; keine CSS-Grid-Abhängigkeit. |
| 26-C2 | Bestehendes Raster innerhalb jeder Section | PASS | `src/public/js/core/dashboard.js` erzeugt je Gruppe ein `.dashboard-grid`; `LegacyLayout.apply()` läuft je Grid separat. |
| 26-C3 | Leere Sections sicher darstellen | PASS | Header/Section-Container bleiben valide; leeres Grid erzeugt keine fremde Kartenposition. |
| 26-C4 | Section-lokale Kollisionsprüfung | PASS | `src/services/layout.js::sectionKey`; Kollisionen werden nur bei gleichem `sectionId` geprüft. |
| 26-C5 | Globale x/y-Werte nicht beschädigen | PASS | Profile/Koordinaten bleiben Widgetfelder; Wechsel relocatiert nur im Ziel-Section-Raster. |
| 26-C6 | Kein Überlappen/horizontales Scrollen lokal | PASS | Layouttests und früherer kontrollierter 768×1024-/1024×768-Browserlauf grün. Physisch: MT-67. |
| 26-D1 | Optionaler Section Header | PASS | `showTitle:false` entfernt Header, ohne das interne Grid oder Karten zu entfernen. |
| 26-E1 | Section ist beliebige logische Gruppe | PASS | Modell verlangt keine Area; Titel/ID sind anwendungsintern. |
| 26-E2 | Section ist nicht HA Area | PASS | `areaId` ist unabhängiges optionales Metadatum; Section-ID/Lifecycle bleiben lokal. |
| 26-F1 | Vorhandene HA Area Registry read-only verwenden | PASS | Admin-Inventar liefert sanitisiertes Area-Metadatum; keine neue HA-Abfrage pro Section. |
| 26-F2 | Keine Area create/rename/delete/write Route | PASS | Route-/Securityscan: keine Registry-/Area-Writefläche; Backend-WS besitzt nur fest definierte read-only Commands. |
| 26-F3 | Fehlende/gelöschte Area bricht Section nicht | PASS | `areaId` ist keine Renderbedingung; lokale Section und Karten bleiben erhalten. |
| 26-F4 | HA-Area-Änderung löscht keine Section | PASS | Kein Synchronisations-/Writepfad; Section-Persistenz ist unabhängig. |
| 26-G1 | Grundlage für Room Cards | PASS – superseded by Sprint 26.1 | `room.areaId` und Widget-`sectionId` sind unabhängig; aktuelle native Room Card nutzt diese Grundlage. |
| 26-H1 | Default Dashboard | PASS | Config-/Route-/Rendererregressionen grün. |
| 26-H2 | Custom Dashboards | PASS | Dasselbe additive Modell und dieselbe Route `/d/:id`. |
| 26-H3 | Background, Dashboardtitel, Full Height, Footer, Theme, Navigation, Summary/Errors, Focus bleiben erhalten | PASS | Sprint-25.x-/26-/Focus-/Theme-/Systemtests im Fokus- und Gesamtlauf grün. |
| 26-H4 | Safari iOS 9 / ES5 | PASS | Wall-JS besteht `node --check` und Legacy-Scan; kein fetch/Promise/Arrow/let/const/async/optional chaining. |
| 26-H5 | Kein CSS Grid/Flex-gap als Voraussetzung | PASS | Wall-CSS nutzt Flexbox mit Margins/Fallbacks; statischer Scan grün. |
| 26-SEC1 | Sicherheitsgrenzen unverändert | PASS | Keine neue Write-Route; HA-/Supervisor-/Admin-Token bleiben serverseitig; Area read-only. |
| 26-CACHE1 | Geänderte/geteilte Assets konsistent versioniert | PASS | Dashboard, System, Admin und Manifest verwenden v52; `test/asset-version.test.js` deckt geteilte Layout-/Presentation-Assets ab. | RQ-04-01 code-seitig geschlossen; reales iOS bleibt manuell. |
| 26-T1 | Section-Normalisierung, CRUD, Reorder, Assignment, Delete, Persistenz und Migration automatisiert | PASS | `test/sprint-26.test.js`, `dashboard-config`, `dashboard-persistence`, `layout`, `admin-api`, `admin-ui`; Part-19-Fokuslauf 95/95. |
| 26-M1 | Reale Section-Darstellung auf iPad mini | NOT TESTED | MT-67. |
| 26-M2 | Reales Admin-CRUD und Standalone-Persistenz | NOT TESTED | MT-68. |
| 26-DOD1 | Vollständige reale Abnahme | NOT TESTED | Keine physische/produktive Runtime wurde in Part 19 verwendet. |
| 26-DOD2 | Sprint vollständig RC-freigabefähig | PARTIAL | Implementierung/Testbasis grün und RQ-04-01 code-seitig geschlossen; reale MT-67/68-Abnahmen bleiben `NOT TESTED`. |

## Architektur- und Sicherheitsbefund

Sections sind eine rein lokale Struktur im vorhandenen, atomar persistenten
Dashboardmodell. Das Raster wird nicht kopiert oder neu erfunden, sondern pro
Section auf dieselben Widgetkoordinaten angewandt. Area-Metadaten werden nur
als Referenz aus dem bereits vorhandenen read-only Registrysnapshot verwendet.
Es existiert kein HA-Area-Write und die Section-Zuordnung erteilt keine
Control-Berechtigung.

## Testevidenz

- Part-19-Section/Room/Control-Fokuslauf: 95/95 Tests bestanden.
- Ergänzender Gateway-/Cross-Surface-Lauf: 72/72 Tests bestanden.
- Vollständige Suite: 329/329 Tests bestanden.
- Kontrollierter Room-Harness: 4/4 Tierszenarien ohne Fehler; dieser Lauf
  ersetzt nicht die physische Section-Abnahme.
- Syntax-, Legacy-, CSS- und Securityscan: grün.

## Reparatur- und Manuelltestbezug

- `RQ-04-01`: Section-/Layout-/Theme-Dateien sind seit Sprint 27.1-B über alle
  Legacy-Routen konsistent als v52 versioniert.
- MT-67: physische Section-Darstellung, Rotation und Reload auf iPad mini.
- MT-68: vollständiges Section-CRUD samt Persistenz auf Admin/Standalone.
