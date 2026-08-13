# Sprint D1 – Bilingual Documentation & Screenshot Baseline

## Status
Planned

## Ziel

GitHub-Dokumentation zweisprachig und visuell nachvollziehbar machen.

Erstellt beziehungsweise gepflegt werden:

```text
README.md
README.de.md
README.en.md
docs/screenshots/dashboards/
docs/screenshots/admin/
docs/screenshots/system/
```

## README-Modell

### `README.md`
Kurze sprachneutrale/englische Startseite mit Projektname, Kurzbeschreibung und Sprachwahl.

### `README.de.md`
Vollständige deutsche Dokumentation.

### `README.en.md`
Inhaltlich gleichwertige englische Dokumentation.

Die beiden vollständigen Sprachversionen müssen semantisch synchron gehalten werden.

## Screenshot-Baseline

Geplante Dateien:

```text
docs/screenshots/dashboards/main-light.png
docs/screenshots/dashboards/main-dark.png
docs/screenshots/dashboards/compact-cards.png
docs/screenshots/dashboards/focus-card.png

docs/screenshots/admin/dashboard-management.png
docs/screenshots/admin/layout-editor.png
docs/screenshots/admin/live-preview.png

docs/screenshots/system/summary.png
docs/screenshots/system/errors.png
```

## Screenshot-Grundsatz

Nur echte Screenshots aus der tatsächlich laufenden Anwendung oder einer kontrollierten Demo-/Mock-Instanz der echten Anwendung.

Keine generierten Mockups als Produkt-Screenshots.

## Screenshot-Pflege

Bei jedem Sprint mit sichtbaren UI-Änderungen muss Codex prüfen:

```text
Does this change make any repository screenshot outdated?
```

Wenn ja:

- betroffene Screenshots auflisten
- neue Aufnahme erforderlich markieren
- README-Verweise prüfen

Wenn Codex keine reale Browser-/Screenshot-Umgebung zur Verfügung hat, darf es keine Screenshots erfinden. Stattdessen exakt dokumentieren, welche Screenshots manuell neu aufgenommen werden müssen.

## Datenschutz

Vor Commit eines Screenshots prüfen:

- keine Tokens
- keine ungewollten internen IP-Adressen
- keine privaten Personen-/Gerätenamen
- keine sicherheitskritischen Entity-Namen
- keine privaten Medieninformationen
- keine Standortdaten

Bevorzugt Demo-Entities oder bewusst freigegebene Namen.

## README-Inhalte

Beide vollständigen README-Versionen enthalten mindestens:

1. Projektüberblick
2. externe Gateway-Architektur
3. Zielplattform / Legacy-Kompatibilität
4. Hauptfunktionen
5. User Dashboards
6. Admin-Bereich
7. Summary Dashboard
8. Error Dashboard
9. Sicherheitsmodell
10. Screenshots
11. Entwicklung
12. Tests
13. Deployment
14. Projektstatus / Roadmap
15. Sprachlink

## Dauerhafte Codex-Regel

`AGENTS.md` oder `docs/CODEX_HANDOFF.md` ergänzen um:

```text
If a sprint changes visible UI, evaluate whether repository screenshots
and README image references must be updated.

If product documentation changes, keep README.de.md and README.en.md
semantically synchronized.

Never use generated mockups as product screenshots. Product screenshots
must come from the real running application or a controlled demo/mock
instance of the real application.
```

## Keine schnell veraltenden Angaben

README soll keine schnell veraltenden exakten Testzahlen, Commit-IDs oder temporären Sprintzustände enthalten.

Diese Informationen gehören in:

```text
docs/PROJECT_STATUS.md
```

## Screenshot-Namen

Kleinbuchstaben und Bindestriche:

```text
main-light.png
layout-editor.png
errors.png
```

Nicht:

```text
Screenshot 2026-08-13 at 22.15.42.png
```

## Nicht-Ziele

Keine Produktfunktion ändern:

- keine neuen APIs
- keine neuen Write-Funktionen
- keine Summary-/Error-Regeln
- keine Layoutlogik
- keine Home Assistant App
- kein HACS

## Prüfungen

Mindestens:

1. Root README verlinkt Deutsch und Englisch
2. deutsche README verlinkt Englisch
3. englische README verlinkt Deutsch
4. Inhalte sind semantisch synchron
5. Screenshot-Pfade konsistent
6. keine Secrets
7. keine Produktionscredentials
8. Security-Grundsätze stimmen mit Projektarchitektur überein
9. iOS-9-Kompatibilitätsaussagen stimmen mit Projektregeln überein
10. kaputte Bildlinks werden vermieden, solange Dateien noch fehlen

## Definition of Done

Sprint D1 ist abgeschlossen, wenn:

- `README.md` existiert
- `README.de.md` existiert
- `README.en.md` existiert
- beide Sprachversionen synchron sind
- Screenshot-Verzeichnisstruktur existiert
- Screenshot-Namenskonvention dokumentiert ist
- Datenschutzregeln dokumentiert sind
- UI-Sprints künftig Screenshot-Pflege prüfen
- Codex-Regel dauerhaft dokumentiert ist
- vorhandene reale Screenshots eingebunden sind
- fehlende Screenshots klar als ausstehend behandelt werden
- keine generierten Mockups als Produkt-Screenshot verwendet werden

## Codex-Prompt

```text
Implement Sprint D1 exactly as specified in docs/sprints/SPRINT-D1.md.

Create and maintain:

- README.md
- README.de.md
- README.en.md
- docs/screenshots/dashboards/
- docs/screenshots/admin/
- docs/screenshots/system/

Use the actual current repository state as the source of truth.

README.de.md and README.en.md must remain semantically synchronized.

The root README.md should stay compact and provide language selection and a
short project introduction.

Document the external Node.js/Express gateway architecture accurately.

Preserve and document all existing Home Assistant security boundaries.

Clearly document Safari iOS 9 / ECMAScript 5 compatibility.

Do not invent screenshots.

Product screenshots must come from the real running application or a
controlled demo/mock instance of the real application.

If real screenshots cannot be captured in the current environment, create the
directory structure and documentation and report exactly which screenshots
still need manual capture.

Add a durable rule to AGENTS.md or docs/CODEX_HANDOFF.md:
- visible UI changes require screenshot review,
- README.de.md and README.en.md must remain synchronized,
- generated mockups must not be used as product screenshots.

Do not change application behavior.

Update docs/PROJECT_STATUS.md with the documentation changes.

Do not commit or push unless explicitly instructed.
```
