# Reproduzierbare Produkt-Screenshots

Die Galerie wurde am 14. September 2026 aus den unveränderten produktiven
HTML-, CSS- und JavaScript-Dateien auf Basis von Commit `f406bf7` aufgenommen.
`test/capture-doc-screenshots.js` stellt dafür ausschließlich auf `127.0.0.1`
einen kontrollierten Real-App-Mock mit generischen Demo-Daten und Fake-
Credentials bereit. Die Aufnahme liest keine `.env`, kontaktiert kein Home
Assistant und baut keine Oberfläche nach.

Aufnahme:

```bash
CHROME_BIN=/pfad/zu/chrome npm run docs:screenshots
```

Der Browserlauf verwendet für jeden Screenshot ein frisches temporäres Profil.
Alle Dateien wurden als echte PNGs neu geöffnet, auf lesbare Abmessungen sowie
auf Tokens, interne IP-Adressen, private Namen, Orts-/Medieninformationen und
Credential-Muster geprüft. Eine ausdrückliche Nutzerfreigabe der Galerie bleibt
als `MT-29` dokumentiert und wird nicht durch diese technische Prüfung ersetzt.

| Datei | Route/Ansicht | Viewport | Gezeigter aktueller Stand |
|---|---|---:|---|
| `dashboards/main-light.png` | `/` | 1280×720 | Light Theme, Sections, Room Card, Summary/Health |
| `dashboards/main-dark.png` | `/?theme=dark` | 1280×720 | Dark Theme, Sections, Room Card |
| `dashboards/background-image.png` | `/d/background` | 768×1024 | Dashboard-Hintergrund, Portrait |
| `dashboards/compact-cards.png` | `/d/compact` | 1024×768 | Compact Cards, aktueller Footer |
| `dashboards/focus-card.png` | `/d/focus?...` | 768×1024 | native Climate-Focus-Ansicht und Controls |
| `dashboards/sections-room-card.png` | `/?view=room` | 1024×1024 | Sections und ausgeklappte Room Card |
| `admin/dashboard-management.png` | `/admin/` | 1440×1000 | Dashboard-Verwaltung |
| `admin/dashboard-background.png` | `/admin/?view=background` | 1440×1000 | Hintergrund-Vorschau und Einstellungen |
| `admin/sections.png` | `/admin/` | 1440×1400 | Section-Verwaltung und Zuordnung |
| `admin/layout-editor.png` | `/admin/` | 1440×2500 | section-isolierter Layout-Editor |
| `admin/live-preview.png` | `/admin/?view=preview` | 1440×2500 | Live Preview, Landscape/Dark |
| `admin/room-card-editor.png` | `/admin/?view=room` | 1440×1000 | nativer Room-Card-Editor |
| `admin/entity-rules.png` | `/admin/?view=rules` | 1440×1000 | Entity Rule Manager |
| `admin/system-diagnostics.png` | `/admin/` | 1280×1700 | read-only Diagnostic Sources |
| `system/summary.png` | `/system/summary` | 1280×720 | Summary mit aktuellen Filtern |
| `system/errors.png` | `/system/errors?theme=dark` | 1280×720 | Error Dashboard mit Critical/Warning |
| `system/errors-automation-impact.png` | `/system/errors?...` | 1280×900 | Device Details, Automation Impact und Advanced Diagnostics |

Der Mock liefert nur die bereits normalisierten Browser-Payloads. Admin-
Authentifizierung bleibt der echten Anwendung entsprechend aktiv; das lokale
Fake-Token wird ausschließlich im temporären Browserprofil hinterlegt und ist
weder im Bild noch in den Bildmetadaten enthalten.
