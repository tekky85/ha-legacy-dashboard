# Sprint 25.3 – Per-Dashboard Background Images & Optional Titles

## Status
Planned

## Ziel

Sprint 25.3 erweitert Default- und Custom-Dashboards um ein eigenes Hintergrundbild pro Dashboard.

Zusätzlich wird die Dashboard-Überschrift pro Dashboard optional.

System-Dashboards `/system/summary` und `/system/errors` sind in diesem Sprint nicht Bestandteil der Background-Funktion.

---

# Hauptziele

1. separates Hintergrundbild pro Dashboard
2. Default Dashboard unterstützen
3. alle Custom Dashboards unterstützen
4. Upload/Preview/Replace/Remove im Admin
5. sichere Bildspeicherung
6. Background Position
7. Cover/Contain
8. optionales Abdunklungs-Overlay
9. optionaler Dashboard-Titel
10. persistente Speicherung in Standalone und Home Assistant App
11. viewportfüllendes Dashboard unabhängig von der Card-Anzahl
12. Footer dauerhaft am unteren Seitenrand bei wenig Inhalt
13. einzeiliger Footer mit mittigem Aktualisierungszeitpunkt
14. Versionsangabe aus normalen Dashboards entfernen und in Admin/Summary/Errors verlagern
15. Legacy Safari / iOS 9 kompatibel

---

# Sicherheitsgrundsätze

- HA-Token nur im Backend
- SUPERVISOR_TOKEN nur im Backend
- keine neue HA Write API
- kein generischer File Upload
- Upload nur mit Admin-Authentifizierung
- keine SVG-Uploads
- keine Pfadtraversierung
- keine ausführbaren Dateien
- kein Directory Listing
- DATA_DIR nicht vollständig öffentlich freigeben

---

# Geltungsbereich

Unterstützt:

```text
Default Dashboard
Custom Dashboards
```

Nicht Bestandteil:

```text
/system/summary
/system/errors
```

---

# Dashboard-Konfiguration

Konzeptuell:

```javascript
{
    background: {
        enabled: true,
        imageId: "bg-...",
        position: "center center",
        size: "cover",
        overlay: 20
    },
    showTitle: false
}
```

Bestehende reale Konfigurationsstruktur bevorzugen.

Keine absoluten Dateisystempfade im Browser-/Dashboard-Modell.

---

# Per-Dashboard-Zuordnung

Beispiel:

```text
default     -> Bild A
wohnzimmer  -> Bild B
kueche      -> Bild C
```

Änderungen an Dashboard A dürfen B/C nicht beeinflussen.

---

# Admin UI

Im Dashboard-Editor neue Section:

```text
Darstellung

Hintergrundbild
[ Datei auswählen ]

[ Vorschau ]

Position:
[ Mitte ▼ ]

Darstellung:
[ Cover ▼ ]

Abdunklung:
[ 20 % ]

[ ] Dashboard-Titel anzeigen

[ Hintergrund entfernen ]
```

---

# Upload

Unterstützen:

```text
Upload
Vorschau
Ersetzen
Entfernen
```

Bei Upload-Fehler bleibt das alte Bild erhalten.

---

# Dateitypen

Für Legacy-Kompatibilität bevorzugt:

```text
JPEG
PNG
```

SVG nicht zulassen.

WebP in diesem Sprint nicht als Pflichtformat verwenden.

---

# Validierung

Nicht nur Dateiendung prüfen.

Mindestens:

```text
Content-Type
Dateisignatur/Magic Bytes soweit praktikabel
Dateigröße
```

Beispiel-Limit:

```text
max 10 MB
```

Tatsächlichen Wert dokumentieren.

---

# Speicherung

Bestehende Data-Directory-Abstraktion verwenden.

Home Assistant App:

```text
/data
```

Standalone:

```text
bestehender persistenter DATA_DIR
```

Bevorzugte Struktur:

```text
<data-dir>/backgrounds/<safe-id>.jpg
```

Original-Dateiname nicht als Dateisystempfad verwenden.

---

# Sichere Dateinamen

Bevorzugt generierte IDs:

```text
bg-<random-id>.jpg
```

Keine Benutzerpfade.

---

# Upload Endpoint

Explizit und eng.

Beispiel:

```text
POST /api/admin/dashboard-background
```

oder bestehende Admin-API erweitern.

Pflicht:

- Admin Auth
- Dashboard-ID validieren
- MIME validieren
- Größenlimit
- sichere ID
- atomare Speicherung
- keine Path Traversal

---

# Entfernen

Explizite, eng begrenzte Delete-Aktion.

Nur das dem Dashboard zugeordnete Background-Asset darf gelöscht werden.

---

# Ersetzen

Reihenfolge:

```text
neues Bild speichern
-> Config aktualisieren
-> altes Bild entfernen
```

Nur wenn neue Speicherung erfolgreich war.

---

# Serving

Backgrounds nur über kontrollierten Read-only Pfad.

Beispiel:

```text
/assets/backgrounds/<safe-id>
```

oder API-Route.

Nicht das gesamte DATA_DIR statisch freigeben.

---

# Cache

Beim Ersetzen neue `imageId` verwenden.

Damit wird verhindert, dass Legacy Safari ein altes Bild aus dem Cache zeigt.

---

# CSS

Legacy-safe:

```css
background-image: url(...);
background-position: center center;
background-repeat: no-repeat;
background-size: cover;
```

Kein CSS Grid, kein backdrop-filter, keine modern-only Effekte.

---

# Position

Mindestens:

```text
Mitte
Oben
Unten
Links
Rechts
```

Intern z. B.:

```text
center center
center top
center bottom
left center
right center
```

---

# Size

Mindestens:

```text
Cover
Contain
```

Default:

```text
Cover
```

---

# Overlay

Optional pro Dashboard:

```text
0 %
10 %
20 %
30 %
40 %
50 %
```

Bevorzugt separates Overlay-Layer.

Z-Reihenfolge:

```text
Background
-> Overlay
-> Dashboard/Cards
-> Focus Overlay
```

---

# Dashboard-Titel

Neue Einstellung:

```text
showTitle: true/false
```

Bestehende Dashboards ohne Feld:

```text
showTitle = true
```

für Backward Compatibility.

---

# Titel nicht automatisch ausblenden

Ein Background bedeutet nicht automatisch:

```text
showTitle=false
```

Der Benutzer entscheidet.

---

# Header bleibt

Wenn Titel verborgen:

```text
Header
├── Summary
└── Health Indicator
```

Der komplette Header darf nicht verschwinden.

Summary und Error Navigation müssen erhalten bleiben.

---

# Header ohne Titel

Wenn `showTitle=false`:

- Titel nicht rendern
- ungenutzten Platz entfernen
- Header kompakter
- Summary erreichbar
- Health Indicator erreichbar

---

# Theme

Sprint 25.1 bleibt erhalten.

Background unabhängig von:

```text
Light
Dark
```

Theme-Wechsel darf Background nicht entfernen.

---

# HomeScreen

Sprint 25.2 bleibt erhalten.

Background darf Same-window Navigation nicht beeinflussen.

---

# Focus

Focus Overlay bleibt über Background und Overlay.

---

# Responsive

Portrait und Landscape:

```text
background-size: cover
```

bzw. konfigurierte Size.

Kein verzerrtes Stretching.

---

# Performance

Auf iPad mini vermeiden:

- Video Background
- Animation
- Parallax
- Blur
- riesige Dateien
- ständiges Re-Decoding

Empfohlene Dokumentation:

```text
1920x1080 oder kleiner
```

---

# Backup/Persistenz

Home Assistant App:

```text
/data/backgrounds
```

gehört zu persistenten App-Daten.

Standalone: Background-Verzeichnis gehört zur Backup-Dokumentation.

---

# Fehlendes Asset

Wenn Config auf fehlendes Bild zeigt:

```text
Dashboard lädt ohne Background weiter
```

Optional Admin-Warnung.

Kein harter Fehler.

---

# Admin Preview

Live Preview soll zeigen:

- Background
- Overlay
- Titel an/aus
- Cards

Bestehende Preview-Infrastruktur wiederverwenden.

---

# Tests Upload

1. JPEG erlaubt
2. PNG erlaubt
3. SVG abgelehnt
4. HTML abgelehnt
5. falsche MIME abgelehnt
6. zu große Datei abgelehnt
7. ungültige Dashboard-ID abgelehnt
8. Path Traversal abgelehnt
9. Upload nur mit Admin Auth
10. keine Secrets im Log

---

# Tests Zuordnung

11. Default -> Background A
12. Dashboard A -> B
13. Dashboard B -> C
14. A ändert B nicht
15. Remove
16. Replace
17. fehlendes Asset sicher

---

# Tests Persistenz

18. Refresh erhält Background
19. Gateway Restart erhält Background
20. App Restart erhält Background
21. Config/Asset konsistent
22. Theme-Wechsel erhält Background

---

# Tests Titel

23. bestehendes Dashboard ohne showTitle -> sichtbar
24. showTitle=true
25. showTitle=false
26. Summary bleibt erreichbar
27. Health Indicator bleibt erreichbar
28. Header kompakt ohne Titel

---

# Tests Layout

29. Portrait
30. Landscape
31. Center
32. Top
33. Bottom
34. Cover
35. Contain
36. Overlay 0
37. Overlay 30
38. Focus über Background

---

# Regression

39. Default Dashboard
40. Custom Dashboards
41. Grid
42. Focus
43. Summary Navigation
44. Error Navigation
45. HomeScreen Same-window Navigation
46. Dark Mode Persistenz
47. Exact Error Filtering
48. Light Controls
49. Climate Controls
50. Admin

---

# Security Regression

51. HA-Token Backend-only
52. SUPERVISOR_TOKEN Backend-only
53. Upload nur Admin
54. kein generischer Upload
55. kein SVG
56. keine Path Traversal
57. kein DATA_DIR Listing
58. keine neue HA Write API
59. keine ausführbaren Uploads
60. keine Secrets im Browser

---

# Manuelle Abnahme iPad mini

Prüfen:

```text
HomeScreen Start
Default Background
Custom Dashboard Background
Portrait
Landscape
Dark
Light
Titel an
Titel aus
Focus
Summary
Errors
Back
```

---

# Unterschiedliche Dashboards

Beispiel:

```text
Default -> Bild A
Wohnzimmer -> Bild B
Küche -> Bild C
```

Jedes Dashboard muss sein eigenes Bild anzeigen.

---

# Admin Abnahme

Prüfen:

```text
Upload
Preview
Position
Cover/Contain
Overlay
Titel an/aus
Speichern
Reload
Ersetzen
Entfernen
```

---

# Screenshots

Wenn Sprint D1 vorhanden:

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
docs/screenshots/admin/dashboard-management.png
```

prüfen/aktualisieren.

Optional:

```text
docs/screenshots/dashboards/background-image.png
docs/screenshots/admin/dashboard-background.png
```

Nur echte Produkt-/Demo-Screenshots.

---

# Dokumentation

Aktualisieren:

```text
README.de.md
README.en.md
docs/PROJECT_STATUS.md
docs/SPRINT_ROADMAP.md
```

Dokumentieren:

- Background pro Dashboard
- Dateitypen
- Größenlimit
- empfohlene Auflösung
- Position
- Cover/Contain
- Overlay
- optionaler Titel
- Persistenz/Backup

---

# Nicht-Ziele

Nicht Bestandteil:

- Background für Summary
- Background für Errors
- getrennte Light/Dark Backgrounds
- Video Background
- Parallax
- Blur
- Remote-Bild-URLs
- automatische HA-Bildimporte
- komplette PWA-Neuentwicklung

---

# Definition of Done

Sprint 25.3 ist abgeschlossen, wenn:

- Default Dashboard eigenes Background unterstützt
- jedes Custom Dashboard eigenes Background unterstützt
- JPEG/PNG sicher uploadbar sind
- SVG und ungültige Dateien abgelehnt werden
- Upload nur im Admin möglich ist
- Speicherung unter DATA_DIR erfolgt
- App-Modus /data verwendet
- Replace/Remove funktioniert
- fehlendes Asset Dashboard nicht zerstört
- Position funktioniert
- Cover/Contain funktioniert
- Overlay funktioniert
- Titel pro Dashboard optional ist
- bestehende Dashboards Titel behalten
- Header ohne Titel kompakt bleibt
- Summary/Health Indicator erhalten bleiben
- Focus über Background liegt
- Theme-Persistenz erhalten bleibt
- HomeScreen-Navigation erhalten bleibt
- Safari iOS 9 / ES5 erhalten bleibt
- Security Tests grün sind
- iPad-mini-Abnahme erfolgreich ist
- Screenshots geprüft/aktualisiert wurden
- docs/PROJECT_STATUS.md aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. bestehende Dashboard-Konfiguration
4. neue Background-Konfiguration
5. Storage/Data-Directory-Konzept
6. Upload Endpoint
7. MIME-/Typvalidierung
8. Größenlimit
9. sichere Dateinamen
10. Asset Serving
11. Cache-Verhalten
12. Background CSS
13. Overlay
14. showTitle
15. Header ohne Titel
16. Admin Preview
17. Persistenz
18. App-/Standalone-Verhalten
19. iPad mini Test
20. HomeScreen Regression
21. Theme Regression
22. Error Filter Regression
23. Security Regression
24. Tests
25. Screenshot Review
26. verbleibende Einschränkungen
27. Release-Gate-Empfehlung
28. Commit-Vorschlag
29. Deploymentbefehle

---


---

# Ergänzung – Viewport-Füllung & Footer-Stabilisierung

## Problem

Aktuell wird die sichtbare Dashboard-Höhe im Wesentlichen durch den Inhalt
beziehungsweise die Anzahl und Position der Cards bestimmt.

Dadurch kann auf Geräten mit größerem Viewport folgendes entstehen:

```text
Header
Cards
Footer
Leerfläche bis Displayende
```

oder der Footer endet direkt nach der letzten Card und nicht am unteren Rand
des Displays.

Mit einem sichtbaren Hintergrundbild wird dieser Effekt deutlich stärker
auffallen.

---

# Ziel: Dashboard füllt mindestens den Viewport

Die normale Dashboard-Seite muss unabhängig von der Anzahl der Cards mindestens
die verfügbare Displayhöhe ausfüllen.

Konzeptuell:

```text
Viewport
┌────────────────────────────┐
│ Header                     │
│                            │
│ Dashboard / Cards          │
│                            │
│                            │
│                            │
│ Footer                     │
└────────────────────────────┘
```

Bei wenig Inhalt:

```text
Footer bleibt unten.
```

Bei viel Inhalt:

```text
Dashboard wächst normal
Footer folgt nach dem Inhalt.
```

---

# Kein Fixed Footer

Der Footer soll nicht mit:

```css
position: fixed;
```

über den Cards schweben.

Bevorzugt ist ein echtes Full-Height-Layout:

```text
Page
├── Header
├── Main / Dashboard wächst
└── Footer
```

Dabei nimmt der Main-Bereich den verbleibenden Platz ein.

---

# Legacy-kompatible Layoutstrategie

Da iOS 9 / Safari unterstützt werden muss:

- kein CSS Grid
- kein `gap`
- keine moderne `100dvh`-Abhängigkeit
- keine Container Queries

Bevorzugt:

```text
min-height: 100%;
```

beziehungsweise ein bestehendes legacy-kompatibles Flexbox-Column-Layout.

Wenn Flexbox verwendet wird, iOS-9-/WebKit-Kompatibilität prüfen und bei Bedarf
Prefixe beziehungsweise robuste Fallbacks verwenden.

---

# HTML / BODY Höhe

Codex muss prüfen, ob aktuell:

```css
html
body
app/root
```

die vollständige Viewport-Höhe weitergeben.

Bevorzugtes Konzept:

```css
html,
body {
    min-height: 100%;
}
```

und:

```text
Page Container
min-height: 100vh
```

nur sofern das reale iOS-9-Verhalten zuverlässig ist.

---

# iOS HomeScreen Besonderheit

Im HomeScreen-/Standalone-Modus muss die tatsächlich verfügbare Höhe geprüft
werden.

Nicht blind davon ausgehen, dass:

```text
100vh
```

auf allen iOS-Versionen exakt der sichtbaren Fläche entspricht.

Sprint 17.4/17.5 vorhandene Viewport-Erfahrungen berücksichtigen.

Ziel ist:

```text
Footer sichtbar am unteren Rand
ohne abgeschnittene Inhalte
ohne unnötige vertikale Scrollbar
```

---

# Hintergrundbild muss Viewport füllen

Wenn ein Background konfiguriert ist, muss er mindestens die gesamte sichtbare
Dashboard-Fläche abdecken.

Bei wenig Cards darf das Hintergrundbild nicht nach dem Footer enden.

Bevorzugt:

```text
Background Layer
→ vollständiger Page-/Viewport-Container
```

---

# Background bei langen Dashboards

Wenn Dashboard-Inhalt höher als der Viewport ist:

```text
Background wächst mit der Seite
```

beziehungsweise bleibt visuell konsistent über den vollständigen
Dashboard-Bereich.

Keine harte Höhe, die bei Scroll-Inhalt endet.

---

# Footer – neue Rolle

Der normale Dashboard-Footer wird deutlich reduziert.

Bisherige Informationen wie:

```text
Version
Update-Zeitpunkt
weitere technische Angaben
```

sollen nicht mehr mehrzeilig auf dem normalen Dashboard dargestellt werden.

---

# Einzeiliger Footer

Gewünscht:

```text
             Aktualisiert: 07:23:14
```

beziehungsweise die bestehende benutzerfreundliche Formulierung.

Der Footer ist:

- einzeilig
- horizontal zentriert
- kompakt
- ruhig
- am unteren Rand der Seite

---

# Aktualisierungszeitpunkt

Der Aktualisierungszeitpunkt bleibt im normalen Dashboard erhalten.

Er wird horizontal zentriert.

Beispiel:

```text
Zuletzt aktualisiert: 07:23
```

oder vorhandene bestehende Formulierung.

Keine technische Timestamp-Darstellung, wenn bereits eine lesbare Variante
existiert.

---

# Versionsangabe entfernen

Die Versionsnummer wird aus dem normalen Dashboard-Footer entfernt.

Beispiel aktuell:

```text
Version 1.0.0
```

→ nicht mehr im normalen Dashboard anzeigen.

---

# Versionsangabe verschieben

Die Version soll weiterhin auffindbar sein.

Mindestens prüfen beziehungsweise ergänzen in:

```text
Admin
Summary
Errors
```

---

# Admin

Bevorzugter Hauptort für vollständige technische Versionsinformation.

Beispiel:

```text
HA Legacy Dashboard
Version 1.0.0
```

Optional mit:

```text
Build / Commit
Runtime Mode
```

nur wenn diese Informationen bereits vorhanden und sinnvoll sind.

---

# Summary / Errors

Version darf dort dezent im Footer oder Diagnostics-Bereich stehen.

Sie soll die eigentliche System-Dashboard-Information nicht dominieren.

Bevorzugt:

```text
kleine technische Footer-/Infozeile
```

---

# Keine Versionsduplizierung im normalen Dashboard

Default- und Custom-Dashboards zeigen keine Version mehr.

---

# Footer bei Titel aus

Wenn:

```text
showTitle = false
```

bleibt das Full-Height-Layout unverändert korrekt.

Das Ausblenden der Überschrift darf nicht dazu führen, dass:

```text
Footer nach oben springt
```

wenn wenig Cards vorhanden sind.

---

# Footer bei wenigen Cards

Testfall:

```text
1 Card
```

Erwartung:

```text
Header oben
Card
freie Dashboard-Fläche
Footer unten
```

---

# Footer bei vielen Cards

Testfall:

```text
Dashboard höher als Viewport
```

Erwartung:

```text
normales Scrollen
Footer nach letztem Dashboard-Inhalt
kein Overlay
keine Card wird vom Footer verdeckt
```

---

# Footer bei leerem Dashboard

Auch bei:

```text
0 Cards
```

muss die Seite sinnvoll den Viewport füllen.

Footer bleibt am unteren Rand.

---

# Portrait / Landscape

Auf iPad mini testen:

```text
Portrait
Landscape
```

Rotation darf nicht zu:

- falscher Höhe
- Footer mitten im Bildschirm
- abgeschnittenem Footer
- dauerhaftem unnötigem Leerraum unter Footer

führen.

---

# HomeScreen Regression

Im HomeScreen-Modus aus Sprint 25.2:

```text
Dashboard
→ Summary
→ Back
```

und:

```text
Dashboard
→ Errors
→ Back
```

muss nach Rückkehr wieder korrekt viewportfüllend dargestellt werden.

---

# Theme Regression

Light/Dark aus Sprint 25.1:

```text
Light
Dark
```

dürfen Footer-Geometrie und Page-Höhe nicht verändern.

---

# Tests Viewport / Footer

Zusätzlich zu den bisherigen Sprint-25.3-Tests:

61. Dashboard mit 0 Cards füllt Viewport
62. Dashboard mit 1 Card füllt Viewport
63. Dashboard mit wenigen Cards füllt Viewport
64. Dashboard mit vielen Cards wächst über Viewport
65. Footer bei wenig Inhalt am unteren Rand
66. Footer bei langem Inhalt nach Content
67. Footer verdeckt keine Card
68. kein fixed-footer Overlay
69. Background füllt Viewport bei wenig Content
70. Background bleibt bei langem Content konsistent
71. showTitle=false verändert Footer-Unterkante nicht
72. Portrait korrekt
73. Landscape korrekt
74. Rotation korrekt
75. HomeScreen-Modus korrekt
76. normaler Safari korrekt

---

# Tests Footer Content

77. normaler Dashboard-Footer einzeilig
78. Aktualisierungszeitpunkt zentriert
79. keine Versionsangabe im Default Dashboard
80. keine Versionsangabe im Custom Dashboard
81. Version im Admin auffindbar
82. Version in Summary/Errors sinnvoll auffindbar
83. Update-Zeitpunkt aktualisiert sich weiterhin korrekt
84. Footer bleibt iOS-9-kompatibel

---

# Ergänzung Definition of Done

Sprint 25.3 ist zusätzlich erst abgeschlossen, wenn:

- normales Dashboard mindestens die sichtbare Viewport-Höhe ausfüllt
- Hintergrundbild die vollständige Dashboard-/Viewport-Fläche abdeckt
- Footer bei wenig Inhalt am unteren Displayrand steht
- Footer bei langem Inhalt nicht fixed über Cards liegt
- Footer nur noch einzeilig ist
- Aktualisierungszeitpunkt mittig dargestellt wird
- Versionsangabe aus normalen Dashboards entfernt wurde
- Version im Admin verfügbar ist
- Version in Summary/Errors sinnvoll verfügbar ist
- 0/1/wenige/viele Cards getestet wurden
- Portrait/Landscape auf dem iPad mini geprüft wurden
- HomeScreen-Rücknavigation das Layout nicht beschädigt

---

# Ergänzung Codex-Anweisung

```text
Also include the viewport/full-height dashboard cleanup in Sprint 25.3.

The current dashboard height follows the amount of card content, which causes
the footer to appear above the bottom edge of the display on devices such as
the iPad mini.

This will become visually obvious once per-dashboard background images are
introduced.

Change the normal dashboard page layout so it fills at least the available
viewport height.

Required behavior:

Few/no cards:
- header at top
- dashboard/main area expands
- footer stays at the bottom edge of the visible page

Many cards:
- page grows naturally
- normal vertical scrolling
- footer follows content
- footer must not overlay cards

Do not implement the footer as a fixed overlay.

Use a legacy-Safari-compatible full-height layout.
Do not rely on CSS Grid, modern viewport units such as dvh, or unsupported
layout APIs.

Audit html/body/root/page height propagation and existing Flexbox behavior,
including iOS 9 / WebKit requirements.

The configured dashboard background must cover the complete visible dashboard
area, not merely the height occupied by cards.

Simplify the normal dashboard footer to one line.

Keep only the last-update information in the normal dashboard footer and center
it horizontally.

Remove the version number from Default and Custom Dashboard footers.

Move/version-display technical information to:
- Admin as the primary technical location
- Summary
- Errors

in a compact/non-dominant form.

Test:
- 0 cards
- 1 card
- few cards
- many cards
- title enabled
- title disabled
- background enabled
- background disabled
- portrait
- landscape
- rotation
- iOS HomeScreen mode
- normal Safari
- Dark/Light

Preserve Sprint 25.1 theme persistence and Sprint 25.2 same-window HomeScreen
navigation.

Do not commit or push until I review the result.
```

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- README.de.md
- README.en.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-21.5.md
- docs/sprints/SPRINT-24.md
- docs/sprints/SPRINT-25.1.md
- docs/sprints/SPRINT-25.2.md
- docs/sprints/SPRINT-25.3.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state first.

Implement Sprint 25.3 exactly as specified in docs/sprints/SPRINT-25.3.md.

Add one independently configurable background image per:
- default dashboard
- custom dashboard

Do not add backgrounds to Summary/Errors in this sprint.

Add secure Admin upload/preview/replace/remove.

Prefer JPEG/PNG.
Do not allow SVG.
Do not create a generic file-upload API.

Validate Admin auth, dashboard ID, MIME/type, size and path traversal.

Store assets in the existing persistent DATA_DIR.
Home Assistant App mode must use /data.
Do not expose the whole DATA_DIR publicly.

Serve backgrounds only via a controlled read-only route.
Use a new image ID on replacement to avoid stale Legacy Safari caches.

Add per-dashboard settings:
- background image
- position
- cover/contain
- optional dark overlay
- showTitle

The dashboard title becomes optional, not globally removed.

Existing dashboards without showTitle must remain backward compatible with the
title visible.

When showTitle=false, remove unused title spacing but preserve:
- Summary navigation
- global Health Indicator
- header functionality

Preserve Sprint 25.1 theme persistence, Sprint 25.1 exact Error filtering,
Sprint 25.2 HomeScreen same-window navigation, all Home Assistant security
boundaries and Safari iOS 9 / ES5 compatibility.

Run malicious-upload/path-traversal/security tests and full dashboard
regressions.

Manually verify on the real iPad mini:
- different backgrounds per dashboard
- portrait/landscape
- title on/off
- Dark/Light
- Focus
- Summary/Errors/Back
- HomeScreen mode

If Sprint D1 exists, update real Dashboard/Admin screenshots.

Update README.de.md and README.en.md semantically in sync.
Update docs/PROJECT_STATUS.md and docs/SPRINT_ROADMAP.md.

Do not commit or push until I review the result.
```
