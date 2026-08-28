# Sprint 25.7 – Legacy iPad Kiosk Deployment & Guided Access Validation

## Status
Planned

## Charakter
Operational / deployment hardening sprint.

## Ziel
Dokumentieren und validieren, wie ein altes iPad als möglichst geschlossenes HA-Legacy-Dashboard-Wall-Display betrieben wird.

## A – Bevorzugter einfacher Kiosk-Modus: Geführter Zugriff
Apple beschreibt Geführten Zugriff als Sperre auf eine einzelne App mit einschränkbaren Hardwaretasten.

Für ein einzelnes altes iPad ist dies der bevorzugte einfache Ansatz.

Zielworkflow:
```text
HA Legacy Dashboard über HomeScreen starten
-> Geführten Zugriff starten
-> iPad bleibt in dieser Web-App
-> Home-Taste verlässt die App nicht normal
-> Beenden nur über vorgesehenen Exit + Code
```

## B – HomeScreen Web-App
Prüfen, dass die HomeScreen-Web-App und nicht ein normaler Safari-Tab gesperrt wird. Sprint 25.2 ist Voraussetzung.

## C – Guided Access Einstellungen
Auf dem realen iOS-9-Gerät dokumentieren:
- Geführter Zugriff aktivieren
- separaten Code setzen
- Home-Taste sperren
- Sleep/Wake nach gewünschtem Betrieb
- Volume optional
- Motion/Rotation bewusst wählen
- Touch aktiv
- Auto-Lock passend

Keine modernen Menübezeichnungen erfinden; reale iOS-9-Oberfläche dokumentieren.

## D – Strengerer Kiosk: Supervision + Single App Mode
Für verwaltete/supervised Geräte kann Apple Single App Mode/App Lock über Apple Configurator bzw. MDM verwendet werden.

Das ist der strengere Kiosk-Ansatz. Machbarkeit für das konkrete alte iPad dokumentieren, ohne aktuelle Enrollment-Verfahren blind auf iOS 9 zu übertragen.

## E – Empfehlung
Ein einzelnes privates Wall Display:
```text
Guided Access
```

Mehrere zentral verwaltete Geräte:
```text
Supervision + Single App Mode / MDM
```

## F – Boot / Recovery
Prüfen:
- Stromverlust
- iPad-Neustart
- WLAN-Reconnect
- Dashboard-Reconnect
- HA-Restart
- App-Restart
- Auto-Lock

Grenze klar benennen: Guided Access ist nicht automatisch ein vollverwalteter Autostart-Kiosk nach Reboot.

## G – Display Betrieb
Dokumentieren:
- Auto-Lock
- Helligkeit
- Dauerstrom
- Rotation
- WLAN Stabilität

## H – Security
Kiosk ersetzt keine Admin-/Dashboard-Security.

## Manual Checklist
```text
[ ] HomeScreen Web-App startet fullscreen
[ ] Guided Access startet
[ ] Home-Button verlässt Dashboard nicht
[ ] Summary bleibt innerhalb Web-App
[ ] Errors bleibt innerhalb Web-App
[ ] Custom Dashboard bleibt innerhalb Web-App
[ ] Light/Climate Controls funktionieren
[ ] Rotation nach Policy
[ ] Display bleibt an wie gewünscht
[ ] Exit nur mit Code
[ ] HA Restart verkraftet
[ ] App Restart verkraftet
```

## Dokumentation
Neue Datei:
```text
docs/IPAD_KIOSK.md
```

## Definition of Done
- Guided Access auf realem iPad mini getestet
- Home-Taste-Verhalten getestet
- HomeScreen-Navigation getestet
- Exit/Passcode dokumentiert
- Auto-Lock/Power dokumentiert
- Single App Mode als Alternative bewertet
- Reboot-Grenzen dokumentiert
- Security unverändert
- PROJECT_STATUS aktualisiert

## Codex-Prompt

```text
Implement Sprint 25.7 exactly as specified in docs/sprints/SPRINT-25.7.md.

This is primarily an operational/documentation validation sprint.

Document and validate the real iPad mini kiosk workflow using Apple's Guided
Access with the HA Legacy Dashboard HomeScreen web-app.

Do not invent iOS 9 menu names; document the actual device steps from manual
validation.

Also document supervised Single App Mode / App Lock as the stronger managed
alternative, but do not require MDM for a single home wall display.

Preserve all product security boundaries.

Create docs/IPAD_KIOSK.md and update project status.

Do not commit or push until I review the result.
```
