# Sprint 16 Audit

## Audit Metadata

- Sprint: 16
- Sprint title: Configurable Tile Sizes
- Audit date: 31. August 2026
- Repository commit: `8d2295a`
- Spec file: [`docs/sprints/SPRINT-16.md`](../../sprints/SPRINT-16.md)
- Working tree at Part-02 start: Part-01 audit documentation was intentionally
  still uncommitted; no application-code modification was present.

## Overall Result

PARTIAL

Das Größenfeld, die fünf erlaubten Werte, Migration, Validierung, Admin-
Bearbeitung, Public-Ausgabe, sichere Legacy-Klassen und Tests sind weiterhin
vorhanden. Sprint 17/17.1 ersetzte die direkte Flexbox-Geometrie bewusst durch
persistente 6-/12-Spalten-Layouts; das Größen-Preset dient heute als sichere
Fallback-/Initialgeometrie und als Präsentationshinweis. Die aktuelle
Endlösung wurde im kontrollierten Browser ohne horizontalen Overflow geprüft.
Die vollständige visuelle Abnahme aller Presets auf dem realen iPad mini in
Portrait/Landscape und Light/Dark fehlt, daher `PARTIAL`.

## Requirement Matrix

| ID | Requirement | Status | Evidence | Notes |
|---|---|---|---|---|
| 16-F1 | Sprint-15-Admin-UI und Sprint-14-Persistenz als Grundlage | PASS | [`SPRINT-15-AUDIT.md`](SPRINT-15-AUDIT.md); `src/admin/`; `src/services/dashboard-config-store.js` | Die noch offene Sprint-15-Hardwareabnahme blockiert das Größenmodell nicht. |
| 16-M1 | Exakt fünf Presets `compact`, `normal`, `wide`, `tall`, `large` | PASS | `src/config/dashboard.js`: `SUPPORTED_WIDGET_SIZES`; `src/admin/js/widgets.js`; `src/public/js/core/widget.js`; `test/tile-size.test.js` | Unbekannte Werte werden nicht als Klassen übernommen. |
| 16-M2 | Persistentes `size` pro Widget, Default `normal` | PASS | `src/config/dashboard.js`: `SIZE_SCHEMA_VERSION`, `cloneWidget()`; `src/admin/js/widgets.js`: `create()`; `test/dashboard-persistence.test.js` | Das aktuelle Gesamtschema ist Version 12; die Sprint-16-Einführung bleibt als Migrationsstufe 2 erhalten. |
| 16-M3 | Bestehende Widgets ohne `size` zu `normal` migrieren, ohne ID/Entity/Order/Visible zu ändern | PASS | `src/config/dashboard.js`: Migrationspfad und `cloneWidget()`; `test/dashboard-persistence.test.js`: Schema-1-Migration | Der Test vergleicht Identität, Entity, Reihenfolge, Sichtbarkeit und ergänzt nur kompatible Defaults. |
| 16-V1 | Nur erlaubte Stringwerte akzeptieren; kontrollierter `invalid_widget_size`-Fehler | PASS | `src/config/dashboard.js`: `validateConfiguration()`; `test/dashboard-persistence.test.js`, `test/admin-api.test.js` | Leere, freie CSS- und Scriptwerte werden abgewiesen. |
| 16-V2 | Ungültige Größen ändern die persistierte Konfiguration nicht | PASS | `src/routes/admin.js`: `persistConfiguration()`; `src/services/dashboard-config-store.js`; `test/admin-api.test.js` | Vollvalidierung erfolgt vor dem atomaren Schreiben. |
| 16-P1 | Public Dashboard API liefert nur validierte Größen | PASS | `src/config/dashboard.js`: `publicWidget()`; `test/admin-api.test.js`, `test/gateway.test.js` | `control` und andere interne Felder bleiben getrennt. |
| 16-L1 | Legacy-Widget normalisiert Preset und bildet ausschließlich bekannte `card-size-*`-Klassen | PASS | `src/public/js/core/widget.js`: Konstruktor, `getSizeClass()`; `test/tile-size.test.js` | Unsicherer/alter Wert fällt auf `card-size-normal` zurück. |
| 16-L2 | Alle damaligen Renderer verwenden die gemeinsame sichere Größenklasse | PASS | `src/public/js/widgets/sensor.js`, `binary.js`, `light.js`, `climate.js`; `test/tile-size.test.js` | Später ergänzte Renderer folgen dem zentralen Widget-/Präsentationsmodell. |
| 16-L3 | Direkte Flexboxbreiten und Mindesthöhen je Preset nach den Sprint-16-Breakpoints | N/A | `src/public/css/style.css`: erhaltene `.card-size-*`-Fallbackregeln; Sprint 17/17.1; `src/services/layout.js`, `src/public/js/core/layout.js` | Sprint 17 ersetzte die alleinige presetgesteuerte Flex-Geometrie ausdrücklich durch persistente Gridkoordinaten. Das aktuelle Layout nutzt weiterhin kein CSS Grid. |
| 16-L4 | Presets erzeugen im heutigen Layout sinnvolle sichere Initial-/Fallbackgrößen | PASS | `src/services/layout.js`: `SIZE_DIMENSIONS`, `preferredSize()`; `src/public/js/core/layout.js`: `preferredSize()`; `test/layout.test.js`, `test/legacy-layout.test.js` | Zuordnung: compact 2×1, normal/tall 3×1/3×2, wide/large 6×1/6×2; vorhandene valide Layoutkoordinaten haben seit Sprint 17 Vorrang. |
| 16-L5 | Kein horizontaler Overflow und responsive Darstellung | PASS | `src/public/css/style.css`; kontrollierter Browserlauf bei 768×1024 und 1024×768 | Fünf Presetklassen waren vorhanden; `scrollWidth` entsprach jeweils `clientWidth`. Reale iPad-Sichtprüfung bleibt MT-06. |
| 16-L6 | Climate bleibt bedienbar, Controls passen und Plus/Minus bleiben touchfreundlich | PASS | `src/public/js/widgets/climate.js`; `src/public/css/style.css`; `test/gateway.test.js`, `test/legacy-layout.test.js`, `test/sprint-26-2.test.js` | Spätere Sprints 17.5–17.7 und 26.2 ersetzten/zentralisierten Focus- und Control-Details; reale iPad-Geometrie ist NOT TESTED. |
| 16-L7 | Light bleibt bedienbar und kompakte Darstellung bricht Controls nicht | PASS | `src/public/js/widgets/light.js`; gemeinsame Controls; `test/gateway.test.js`, `test/sprint-26-2.test.js` | Write-Autorisierung bleibt serverseitig. |
| 16-L8 | Sensor/Binary-Werte, lange Texte und Units werden begrenzt dargestellt | PASS | `src/public/js/widgets/sensor.js`, `binary.js`; `src/public/css/style.css`; `test/sprint-25-6.test.js`, `test/legacy-layout.test.js` | Sprint 25.6 härtete die Präsentation später anhand echter Pixelmaße weiter. |
| 16-A1 | Admin bietet genau die fünf Größenoptionen | PASS | `src/admin/index.html`: `widgetSize`; `src/admin/js/widgets.js`: `SIZES`; `test/tile-size.test.js` | Kontrollierter Browserlauf zeigte das Größenfeld. |
| 16-A2 | Aktuelle Größe in Liste und Editor anzeigen und vorselektieren | PASS | `src/admin/js/app.js`: `renderWidgetCard()`, `openWidgetForm()`; kontrollierter Browserlauf | „Normal“ war korrekt ausgewählt und als Listenmetadatum sichtbar. |
| 16-A3 | Neue Widgets starten mit `normal`; Änderung wird gespeichert; Verwerfen stellt Ausgangswert her | PASS | `src/admin/js/widgets.js`: `create()`, `update()`; `src/admin/js/state.js`; `test/admin-ui.test.js`; kontrollierter Browserlauf | Normal→Compact wurde im Entwurf sichtbar und mit Verwerfen wieder Normal. |
| 16-A4 | Dashboardduplikat übernimmt Größen bei neuen Widget-IDs | PASS | `src/admin/js/dashboards.js`: `duplicate()`; `test/admin-ui.test.js`, `test/dashboard-persistence.test.js` | Spätere Layoutinformationen werden ebenfalls korrekt auf die neuen IDs abgebildet. |
| 16-A4b | Widget-Duplizieren kopiert `size`, falls Sprint 15 diese Funktion besitzt | N/A | `src/admin/js/widgets.js`; Sprint-15-Spezifikation und -Audit | Sprint 15 besaß keine eigenständige Widget-Duplizieren-Funktion; Sprint 16 verlangte ausdrücklich keine Neueinführung. |
| 16-A5 | Sichtbarkeit und Reihenfolge bleiben unabhängig von `size` | PASS | `src/admin/js/widgets.js`: `setVisibility()`, `move()`, `update()`; Tests in `test/admin-ui.test.js` | Größenänderung schreibt weder `visible` noch `order` um. |
| 16-A6 | Kein Live-Preview in Sprint 16 erforderlich | N/A | Sprint 17.3; `src/admin/js/app.js`: `renderLivePreview()` | Das damalige Nicht-Ziel wurde später ausdrücklich superseded. |
| 16-API1 | Admin CRUD unterstützt Größenänderung und liefert 400 bei ungültigem Wert | PASS | `src/routes/admin.js`; `test/admin-api.test.js`: alle fünf Größen und `invalid_widget_size` | Admin-Bearer-Schutz bleibt aktiv. |
| 16-P2 | Größe über atomare Sprint-14-Persistenz und Backup erhalten | PASS | `src/services/dashboard-config-store.js`; `test/dashboard-persistence.test.js` | Neu laden und Migration aus Schema 1/2 sind automatisiert geprüft. Produktiver systemd-Neustart bleibt MT-07. |
| 16-R1 | Rollback/Migration verlangt keine Neukonfiguration | PASS | `src/config/dashboard.js`; `test/dashboard-persistence.test.js`; Sprint-16-Dokumentation/Git-Historie | Komplexe Downgrade-Migration war nicht gefordert; ältere Software müsste unbekannte Felder ignorieren. |
| 16-S1 | Größe verändert keine Write-Allowlist und erlaubt keine CSS-Injektion | PASS | `src/config/dashboard.js`; `src/services/control-authorization.js`; `test/admin-api.test.js`, `test/tile-size.test.js` | Daten- und Berechtigungsmodell bleiben getrennt. |
| 16-I1 | Wall-Code bleibt ES5/iOS-9-tauglich; kein CSS Grid, `gap` oder moderner Pflichtpfad | PASS | `src/public/js/`; `src/public/css/style.css`; `test/admin-ui.test.js`, `test/system-frontend.test.js`, `test/tile-size.test.js` | Moderne Admin-Technik ist zulässig und nicht im Legacy-Bundle. |
| 16-T1 | Geforderte Schema-, API-, Public-, Admin- und Legacy-Größentests | PASS | `test/tile-size.test.js`, `test/dashboard-persistence.test.js`, `test/admin-api.test.js`, `test/admin-ui.test.js`, `test/legacy-layout.test.js` | Fokussierter Lauf 92/92; Gesamtsuite 329/329. |
| 16-T2 | Bestehende Regressionstests bleiben grün | PASS | `npm test` am 31. August 2026 | 329/329 mit localhost-Mocks und Fake-Credentials. |
| 16-MAN1 | Admin-Größenwechsel, Save/Discard/Reload/Duplikat manuell prüfen | PARTIAL | Kontrollierter Chromium-Lauf; [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-04/MT-07 | Größenfeld, Change/Discard und Reload sind belegt; Safari und realer LXC-Neustart fehlen. |
| 16-MAN2 | Alle Presets auf iPad mini Portrait/Landscape sowie Light/Dark visuell prüfen | NOT TESTED | [`MANUAL_TEST_QUEUE.md`](../MANUAL_TEST_QUEUE.md), MT-06 | Keine reale Zielgeräteprüfung in Part 02. |
| 16-C1 | Frontend-Cacheversion nach sichtbarer Änderung erhöhen | PASS | Historischer Sprint-16-Commit `9c44cd5`; aktuelle `src/public/index.html` | Aktuell verwenden alle Wall-Assets konsistent `v=51`. |
| 16-DOC1 | Projektstatus/README mit Größenmodell aktualisieren | PASS | `docs/PROJECT_STATUS.md`; `README.md`, `README.de.md`, `README.en.md`; Git-Historie (`4a556e7`) | Dokumentation wurde in späteren Sprints semantisch erweitert. |
| 16-N1 | Kein Drag-and-drop, freie x/y-Position, freie Maße, CSS Grid, DB oder HA-App in Sprint 16 | N/A | Historischer Commit `9c44cd5`; spätere Sprints 17, 17.1 und 24 | Diese damaligen Nicht-Ziele wurden später ausdrücklich ersetzt; CSS Grid bleibt auch heute ausgeschlossen. |

## Automated Tests

- Fokussierter Part-02-Lauf: 92 Tests, 92 bestanden, 0 fehlgeschlagen.
- Größenrelevant: `test/tile-size.test.js`,
  `test/dashboard-persistence.test.js`, `test/admin-api.test.js`,
  `test/admin-ui.test.js`, `test/layout.test.js`,
  `test/legacy-layout.test.js`, `test/gateway.test.js` und
  `test/security.test.js`.
- Vollständige Suite: 329 Tests, 329 bestanden, 0 fehlgeschlagen.
- Der zunächst sandboxbedingt fehlgeschlagene localhost-Bind ist als
  Testumgebungsgrenze eingeordnet; der identische freigegebene Lauf war grün.
- Kein produktives Home Assistant wurde kontaktiert.

## Manual Tests

- Kontrollierter Chromium-Lauf: PASS für das Größenfeld, Normal→Compact,
  Verwerfen, Speichern/Reload sowie alle fünf Klassen ohne horizontalen
  Overflow bei 768×1024 und 1024×768.
- Aktuelles Safari/Admin: NOT TESTED, MT-04.
- Reales iPad mini mit allen Presets/Orientierungen/Themes: NOT TESTED, MT-06.
- Produktiver LXC-/systemd-Neustart nach Größenänderung: NOT TESTED, MT-07.

## Security Review

PASS – Presets werden serverseitig streng allowgelistet, im Legacy-Client
nochmals normalisiert und niemals als freie CSS-Klasse übernommen. `size`
verändert weder Sichtbarkeit noch Write-Grants. Admin API, Bearer-Schutz,
atomare Persistenz und die bestehenden HA-Sicherheitsgrenzen bleiben intakt.

## Legacy Safari / iPad Review

PARTIAL – ES5, gemeinsame sichere Klassen, Flexbox-Fallbacks, kein CSS Grid und
kein horizontaler Overflow sind statisch, automatisiert und im kontrollierten
Browser belegt. Die reale iOS-9-Render-/Touch-Abnahme ist offen.

## Home Assistant App Review

N/A – App-Verpackung war in Sprint 16 ausdrücklich ausgeschlossen und wurde
erst in Sprint 24 spezifiziert. Das Größenmodell ist speicherpfadunabhängig;
eine HAOS-Abnahme gehört in den späteren Audit-Part.

## Standalone/LXC Review

PARTIAL – lokaler Standalone-Betrieb, API, Persistenz und Reload sind grün.
Der produktive LXC wurde nicht verändert; die reale Persistenz über einen
systemd-Service-Neustart ist als MT-07 vorgemerkt.

## Findings

- Kein aktuelles `MISSING` oder `BROKEN`.
- `PARTIAL`: vollständige reale Admin-/LXC-Abnahme.
- `NOT TESTED`: alle Presets auf dem iPad mini in beiden Orientierungen und
  Themes.
- Die Sprint-16-Flexgeometrie und damaligen Nicht-Ziele wurden bewusst durch
  Sprint 17/17.1 ersetzt. Das sichere Presetmodell bleibt als
  Initial-/Fallback- und Präsentationsmodell erhalten.

## Repair Required

Keine Code- oder Dokumentationsreparatur. Die verbleibenden Punkte sind reale
Laufzeit-/Geräteabnahmen und stehen in der manuellen Warteschlange.

## Final Assessment

Sprint 16 erfüllt alle weiterhin anwendbaren implementierbaren Anforderungen.
Wegen der fehlenden realen iPad-/Safari-/LXC-Abnahme bleibt der
Sprint-27-Gesamtstatus `PARTIAL`.
