# Sprint 12 – UI Polish + Release Baseline

## Status

Planned

## Basis

Dieser Sprint basiert auf dem tatsächlich geprüften Repository-Stand aus
`docs/PROJECT_STATUS.md`.

Bekannter Ausgangsstand:

- Branch: `main`
- Commit: `da4ebb2`
- Commit-Betreff: `style: reduce wall display header`
- Teststand: `39 passed`, `0 failed`
- Cache-Version im Frontend: `v=14`

Codex muss den aktuellen Stand vor Beginn erneut prüfen.

---

# Ziel

Sprint 12 bereinigt den aktuellen Einzel-Dashboard-Stand visuell und technisch,
bevor Multi-Dashboard, Admin-Oberfläche und frei konfigurierbare Layouts
eingeführt werden.

Der Sprint besteht aus zwei klar begrenzten Bereichen:

1. UI Polish
2. Release-/Wartbarkeits-Baseline

---

# Nicht-Ziele

Nicht Bestandteil dieses Sprints:

- keine Multi-Dashboard-Unterstützung
- keine Admin- oder Konfigurationsoberfläche
- keine persistente Dashboardkonfiguration
- kein Drag-and-drop
- keine frei skalierbaren Kacheln
- keine Rasterkoordinaten
- keine neuen Home-Assistant-Domänen
- keine HACS-Integration
- keine Home-Assistant-App
- keine große Refaktorierung von `app.js`
- keine große Refaktorierung von `api.js`
- keine Änderung der Sicherheitsarchitektur
- keine Änderung der bestehenden Schreib-Allowlisten

---

# Teil A – UI Polish

## A1. Thermostat-Schaltflächen zentrieren

Aktuelles Problem:

Das Minus- und Pluszeichen der Climate-Steuerung sind innerhalb der Buttons
nicht sauber horizontal und vertikal zentriert.

### Anforderungen

- Minuszeichen horizontal und vertikal zentriert
- Pluszeichen horizontal und vertikal zentriert
- Touch-Ziel mindestens 44 × 44 Pixel
- kein unnötiger Browser-Button-Padding
- keine Verschiebung durch ungeeignetes `line-height`
- bestehender Disabled-/Busy-Zustand bleibt erhalten
- Light-/Dark-Mode bleibt erhalten
- Safari iOS 9 muss unterstützt bleiben

Erlaubte CSS-Techniken:

```css
display: -webkit-flex;
display: flex;
-webkit-align-items: center;
align-items: center;
-webkit-justify-content: center;
justify-content: center;
```

Nicht verwenden:

- CSS Grid
- Flexbox `gap`
- moderne Selektoren ohne Safari-9-Unterstützung

---

## A2. Climate-Kachel kompakter gestalten

### Ziel

Die Climate-Kachel soll deutlich platzsparender werden, ohne Lesbarkeit und
Touch-Bedienbarkeit zu verschlechtern.

Bevorzugte visuelle Richtung:

```text
Heizung Esszimmer              Heizen

21,8 °C                  −  22,5 °C  +
```

### Anforderungen

- Isttemperatur klar hervorgehoben
- Solltemperatur direkt erkennbar
- Minus und Plus unmittelbar am Zielwert
- HVAC-Status kompakt
- keine redundanten Leerflächen
- keine unnötig große Mindesthöhe
- mindestens 44-Pixel-Touchziele
- bestehende Climate-Logik unverändert
- optimistische Aktualisierung unverändert
- Refreshschutz unverändert
- Fehler- und Erfolgsmeldungen weiterhin funktionsfähig

---

## A3. Allgemeine Kachelgrößen prüfen

Codex soll vorhandene Mindesthöhen, Padding- und Margin-Werte prüfen und nur
dort reduzieren, wo Lesbarkeit und Bedienbarkeit erhalten bleiben.

Insbesondere prüfen:

- `.card`
- Sensor-Karten
- Binary-Karten
- Light-Karten
- Climate-Karten
- kleine Displays
- Landscape-Regeln
- Breakpoints bei 600 Pixeln
- Breakpoints bei 900 Pixeln

Dieser Sprint führt noch keine individuelle Kachelgröße ein.

---

## A4. iOS-9-Kompatibilität erhalten

Frontend weiterhin ES5-kompatibel.

Nicht verwenden:

- `let`
- `const`
- arrow functions
- template literals
- `fetch`
- `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing

---

# Teil B – Release-/Wartbarkeits-Baseline

## B1. Versionsnummer vereinheitlichen

Aktuell laut Statusbericht:

- `package.json`: `1.0.0`
- `/api/status`: `0.1.0`
- Footer: `v0.1`

### Ziel

Eine einzige verbindliche Projektversion verwenden.

Bevorzugt:

```text
1.0.0
```

sofern die bestehende Releasepolitik nicht dagegen spricht.

Folgende Stellen müssen konsistent sein:

- `package.json`
- `/api/status`
- sichtbarer Footer
- README
- Changelog, falls erstellt

---

## B2. Lizenzinkonsistenz bereinigen

Aktuell:

- `package.json` nennt `ISC`
- README sagt, dass noch keine Lizenz gewählt wurde
- `LICENSE` fehlt

Codex darf keine Lizenzentscheidung selbst treffen.

Falls keine explizite Entscheidung des Projektinhabers vorliegt:

- keine neue Lizenz erfinden
- Inkonsistenz dokumentieren
- Punkt als Blocker ausweisen

---

## B3. Ungenutzte `ws`-Abhängigkeit prüfen

Prüfen, ob `ws` tatsächlich nirgendwo verwendet wird.

Wenn eindeutig ungenutzt:

```bash
npm uninstall ws
```

Danach:

- `package.json` prüfen
- `package-lock.json` prüfen
- `npm test`

---

## B4. Tote Hilfsfunktion prüfen

Der Statusbericht nennt:

```text
setClimateControlsBusy()
```

als definiert, aber nicht aufgerufen.

Wenn eindeutig tot:

- entfernen
- zugehörigen ungenutzten Code bereinigen

Wenn funktional relevant:

- nicht in diesem Sprint neu verdrahten
- als separaten Befund dokumentieren

---

## B5. Rate-Limit-Test isolieren

Der Rate-Limit-Test darf nicht von Schreibaufrufen vorheriger Untertests
abhängen.

### Anforderungen

- definierter Ausgangszustand
- keine Testreihenfolge-Abhängigkeit
- isoliert ausführbar
- nur lokaler Mock
- keine echten HA-Zugangsdaten
- kein Kontakt zum produktiven Home Assistant

---

## B6. Node-Version dokumentieren

CI verwendet aktuell Node 22.

Wenn dies auch der produktiven Runtime entspricht, in `package.json`
dokumentieren:

```json
{
  "engines": {
    "node": ">=22"
  }
}
```

Nur ergänzen, wenn dies mit Produktiv-LXC und CI übereinstimmt.

---

## B7. Changelog-Baseline

Falls `CHANGELOG.md` noch nicht existiert, einen kompakten Changelog erstellen.

Mindestens enthalten:

- Initial Gateway
- Legacy Dashboard
- Theme
- Widgets
- Climate
- Standalone
- Light
- Security/Robustness
- Tests
- Deployment
- Wall Display
- Sprint 12 UI Polish

Keine erfundenen Datumsangaben oder Release-Tags.

---

# Voraussichtlich betroffene Dateien

```text
src/public/css/style.css
src/public/js/widgets/climate.js
src/public/js/app.js
src/public/index.html
src/server.js
package.json
package-lock.json
test/
README.md
CHANGELOG.md
```

Nur tatsächlich notwendige Dateien ändern.

---

# Tests

Vor Abschluss:

```bash
npm ci
npm test
```

Referenzstand:

```text
39 passed
0 failed
```

Die Zahl darf steigen, aber nicht durch verlorene Abdeckung sinken.

---

# JavaScript-Syntaxprüfung

Für jede geänderte JavaScript-Datei:

```bash
node --check <datei>
```

Mindestens prüfen, falls verändert:

```bash
node --check src/server.js
node --check src/public/js/app.js
node --check src/public/js/widgets/climate.js
```

---

# Frontend-Cache

Referenzstand:

```text
v=14
```

Wenn CSS oder Frontend-JavaScript geändert werden, Cache-Version in
`src/public/index.html` konsistent erhöhen, z. B. auf:

```text
v=15
```

---

# Manuelle visuelle Abnahme

Auf dem iPad mini / iOS 9 prüfen:

- Portrait
- Landscape
- Light Mode
- Dark Mode
- Climate Plus
- Climate Minus
- Zieltemperatur
- Fehlermeldung
- Erfolgsmeldung
- automatische Aktualisierung
- Header
- Uhr
- Verbindungsstatus

Besonders prüfen:

- Plus exakt mittig
- Minus exakt mittig
- Climate-Karte sichtbar kompakter
- keine abgeschnittenen Texte
- keine überlappenden Elemente
- mindestens 44-Pixel-Touchziele

---

# Deployment

Der bestehende Fast-Forward-, Test-, Restart- und Health-Check-Ablauf bleibt
unverändert.

Keine destruktiven Git-Kommandos verwenden.

---

# Definition of Done

Sprint 12 ist abgeschlossen, wenn:

- Plus und Minus optisch zentriert sind
- Climate-Karte kompakter ist
- allgemeine Kachelabstände sinnvoll reduziert wurden
- iOS-9-Kompatibilität erhalten bleibt
- Versionsnummern konsistent sind
- `ws` geprüft und gegebenenfalls entfernt wurde
- tote Climate-Hilfsfunktion geprüft wurde
- Rate-Limit-Test isoliert ist
- Node-Runtime dokumentiert ist, sofern eindeutig
- bestehende Tests vollständig grün sind
- Cache-Version bei Frontendänderungen erhöht wurde
- keine Multi-Dashboard-Funktion eingeführt wurde
- keine Admin-Oberfläche eingeführt wurde
- keine Secrets oder `.env`-Inhalte committed wurden
- `docs/PROJECT_STATUS.md` nach Abschluss aktualisiert wurde

---

# Erwartetes Codex-Ergebnis

Codex soll berichten:

1. geänderte Dateien
2. UI-Änderungen
3. Wartbarkeitsbereinigungen
4. bewusst nicht geänderte Punkte
5. Ergebnis von `npm test`
6. Ergebnis der `node --check`-Prüfungen
7. neue Cache-Version
8. Commit-Vorschlag
9. Deploymentbefehle
10. verbleibende Blocker für Sprint 13

---

# Codex-Prompt für Sprint 12

```text
Read:

- AGENTS.md
- README.md
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-12.md

Then inspect the current repository state.

Implement Sprint 12 exactly as specified in docs/sprints/SPRINT-12.md.

Do not implement multi-dashboard support, an admin UI, persistent dashboard
configuration, drag-and-drop or free tile sizing in this sprint.

Keep the legacy dashboard compatible with Safari on iOS 9 and ECMAScript 5.

Preserve all existing Home Assistant security boundaries and write
allowlists.

Run all required syntax checks and the full test suite.

Use only local mock services for integration tests. Do not contact the real
Home Assistant instance and do not use production credentials.

At the end:

- summarize every changed file,
- report test results,
- report the frontend cache version,
- identify any blocked decisions,
- update docs/PROJECT_STATUS.md,
- do not commit or push unless explicitly instructed.
```
