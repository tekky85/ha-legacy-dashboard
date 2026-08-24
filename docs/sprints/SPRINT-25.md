# Sprint 25 – Release & Distribution

## Status

Planned

## Einordnung

Sprint 25 ist der Release- und Distribution-Sprint der aktuellen Roadmap.

Er baut auf Sprint 24 auf:

```text
Sprint 24
Home Assistant App Packaging
        ↓
Sprint 25
Release & Distribution
```

Sprint 24 stellt sicher, dass HA Legacy Dashboard als:

```text
Standalone
und
Home Assistant App
```

technisch sauber gebaut und betrieben werden kann.

Sprint 25 macht daraus eine reproduzierbare, dokumentierte und für Nutzer
installierbare Distribution.

---

# Aktuelle Home-Assistant-Publishing-Grundlage

Aktuelle Home-Assistant-App-Publishing-Konvention:

- `Dockerfile` ist die zentrale Build-Quelle.
- Docker BuildKit / GitHub Actions werden für Builds verwendet.
- Der frühere Home-Assistant-Builder bzw. `build.yaml`-zentrierte Workflow ist
  nicht mehr die bevorzugte Strategie.
- Multi-Architecture-Images werden bevorzugt über einen generischen Image-Namen
  referenziert.
- `config.yaml` darf beispielsweise auf:

```text
ghcr.io/<owner>/<image>
```

zeigen.

- Das Multi-Arch-Manifest entscheidet automatisch zwischen unterstützten
  Plattformen.
- Ein installierbares App Repository besitzt `repository.yaml` im Repository-Root.
- Nutzer können ein App Repository über Home Assistant `Settings > Apps >
  App store` hinzufügen.
- Zusätzlich kann ein `my.home-assistant.io`-Link für eine komfortable
  Repository-Installation angeboten werden.

Sprint 25 soll sich an dieser aktuellen Struktur orientieren.

---

# Hauptziele

Sprint 25 implementiert:

1. reproduzierbare Release-Versionierung
2. GitHub Release Workflow
3. Multi-Architecture-Container-Build
4. `amd64` Release Image
5. `aarch64` Release Image
6. generisches Multi-Arch Manifest
7. GHCR Distribution
8. installierbares Home Assistant App Repository
9. Release-Artefakt für Standalone-Betrieb
10. Release Notes / Changelog
11. Upgrade-Pfad
12. Rollback-Dokumentation
13. Installationsdokumentation
14. my.home-assistant.io App-Repository-Link
15. Release Validation
16. Security-/Secret-Prüfungen
17. Checksums bzw. nachvollziehbare Artefakte
18. Release Candidate / Stable Prozess
19. Update-Test für die Home Assistant App
20. Abschluss der aktuellen Sprint-Roadmap

---

# Grundprinzip

> Ein Release wird nicht direkt aus einem Entwickler-Arbeitsverzeichnis gebaut.

Release-Artefakte müssen reproduzierbar aus:

```text
Git Tag / GitHub Release
```

erzeugt werden.

---

# Teil A – Version Source of Truth

## Problem

Historisch können Versionsangaben an mehreren Stellen liegen:

```text
package.json
Home Assistant App config.yaml
README
Docker Image Tag
Git Tag
CHANGELOG
```

Sprint 25 definiert eine eindeutige Release-Strategie.

---

# SemVer

Bevorzugt:

```text
MAJOR.MINOR.PATCH
```

Beispiele:

```text
1.0.0
1.0.1
1.1.0
2.0.0
```

---

# Git Tag

Bevorzugt:

```text
v1.0.0
```

---

# App Version

Home Assistant App:

```yaml
version: "1.0.0"
```

---

# package.json

```json
{
  "version": "1.0.0"
}
```

---

# Container Tag

```text
ghcr.io/tekky85/ha-legacy-dashboard:1.0.0
```

Optional zusätzlich:

```text
:latest
```

nur für Stable Releases.

---

# Keine Floating Version als einzige Referenz

Nicht nur:

```text
latest
```

verwenden.

Jeder Release muss unveränderlich über seine konkrete Version erreichbar sein.

---

# Teil B – Version Consistency Check

CI muss vor Release prüfen:

```text
Git Tag
package.json
App config.yaml
CHANGELOG Release Heading
```

passen zusammen.

Bei Mismatch:

```text
Release abbrechen
```

---

# Teil C – Release Types

Mindestens:

```text
Development
Release Candidate
Stable
```

---

# Development

Nicht als normaler Endnutzer-Release.

Optional:

```text
main / dev image
```

aber kein Pflichtpunkt.

---

# Release Candidate

Beispiel:

```text
1.0.0-rc.1
```

oder Home-Assistant-App-kompatible äquivalente Version.

RC darf:

- GitHub Prerelease sein
- separates Container Tag verwenden
- nicht `latest` überschreiben

---

# Stable

Beispiel:

```text
1.0.0
```

Erzeugt:

```text
GitHub Release
GHCR versioned image
Multi-Arch manifest
optional latest tag
Standalone artifact
```

---

# Teil D – GitHub Actions Release Workflow

Bevorzugt:

```text
.github/workflows/release.yml
```

Trigger:

```text
GitHub Release published
```

oder:

```text
version tag pushed
```

Eine Variante klar festlegen.

---

# Empfohlener Ablauf

```text
Release vorbereiten
↓
Versionen synchronisieren
↓
Tests
↓
Tag
↓
GitHub Release
↓
Build amd64
↓
Build aarch64
↓
Push Arch Images
↓
Publish Multi-Arch Manifest
↓
Validate Image
↓
Attach Standalone Artifact
```

---

# Teil E – BuildKit

Aktuelle Home-Assistant-Empfehlung verwenden:

```text
Docker BuildKit
```

Nicht auf den historischen `home-assistant/builder`-Workflow zurückfallen.

---

# Kein build.yaml als primäre Buildquelle

Wenn Sprint 24 noch ein `build.yaml` nur für Abwärtskompatibilität enthält:

- prüfen, ob er entfernt werden kann
- Dockerfile bleibt Source of Truth

Keine doppelte Build-Konfiguration, die auseinanderlaufen kann.

---

# Teil F – Multi-Architecture Build

Mindestens:

```text
linux/amd64
linux/arm64
```

Home Assistant App Architecture Mapping:

```text
amd64
aarch64
```

---

# Image Naming

Bevorzugt generischer Name:

```text
ghcr.io/tekky85/ha-legacy-dashboard
```

`config.yaml`:

```yaml
image: "ghcr.io/tekky85/ha-legacy-dashboard"
```

Multi-Arch Manifest löst die Plattform auf.

---

# Keine Arch-Prefix-Pflicht

Nicht als Hauptstrategie:

```text
ghcr.io/.../amd64-ha-legacy-dashboard
ghcr.io/.../aarch64-ha-legacy-dashboard
```

Per-Arch Images dürfen intern existieren, aber öffentliche App-Referenz soll
bevorzugt generisch sein.

---

# Teil G – GHCR

Registry:

```text
GitHub Container Registry
ghcr.io
```

---

# Package Visibility

Für öffentlich installierbare App:

```text
public
```

---

# Least Privilege CI

GitHub Actions benötigt nur notwendige Rechte.

Beispiel:

```yaml
permissions:
  contents: read
  packages: write
```

Release-Erstellung ggf.:

```text
contents: write
```

nur im Release-Job, wenn nötig.

---

# Kein PAT wenn GITHUB_TOKEN reicht

Bevorzugt:

```text
GITHUB_TOKEN
```

Keine unnötigen langlebigen Registry-Secrets.

---

# Teil H – Supply Chain Basics

Release Workflow soll mindestens:

- Checkout auf exakten Tag
- keine unversionierten lokalen Dateien
- Dockerfile aus Repository
- Lockfile verwenden
- Dependencies reproduzierbar installieren

---

# npm

Bevorzugt:

```text
npm ci
```

statt:

```text
npm install
```

im Release-Build, wenn Lockfile vorhanden.

---

# Teil I – Container Labels

OCI Labels sinnvoll setzen:

```text
org.opencontainers.image.source
org.opencontainers.image.version
org.opencontainers.image.revision
org.opencontainers.image.title
org.opencontainers.image.description
```

---

# Git Revision

Image soll nachvollziehbar zum Git Commit gehören.

---

# Teil J – Release Validation

Nach Multi-Arch Publishing automatisiert prüfen:

```text
Manifest enthält amd64
Manifest enthält arm64
```

---

# Smoke Test Image

Mindestens auf verfügbarer CI-Architektur:

1. Container starten
2. Mock Supervisor oder Mock HA bereitstellen
3. `/health` prüfen
4. statische Assets prüfen
5. kein Crash

---

# Kein Produktions-HA im CI

CI darf nie:

- echte HA URL
- echte HA Tokens
- Produktions-Supervisor

kontaktieren.

---

# Teil K – Home Assistant App Repository

Repository muss für Nutzer als Custom App Repository installierbar sein.

Root:

```text
repository.yaml
```

App-Verzeichnis enthält vollständige App-Metadaten.

---

# Repository Installation

Dokumentieren:

```text
Home Assistant
Settings
→ Apps
→ App store
→ Repositories
→ GitHub Repository URL hinzufügen
```

Aktuelle reale Menübezeichnungen prüfen.

---

# my.home-assistant.io Link

README darf zusätzlich einen One-Click-Link anbieten, der das App Repository
zur Home-Assistant-Instanz hinzufügt.

Nur offizielle my.home-assistant.io-Syntax verwenden.

---

# Kein falsches "Official"

Dokumentation muss klar sagen:

```text
Custom Home Assistant App Repository
```

Nicht behaupten:

```text
Official Home Assistant App
```

solange keine offizielle Aufnahme erfolgt ist.

---

# Teil L – App Installation Documentation

README.de.md:

```text
Home Assistant App installieren
```

README.en.md:

```text
Install as Home Assistant App
```

---

# Ablauf

Mindestens:

1. Repository hinzufügen
2. App Store aktualisieren
3. HA Legacy Dashboard auswählen
4. installieren
5. Optionen prüfen
6. starten
7. Logs prüfen
8. Web UI öffnen
9. direkten LAN-Port konfigurieren
10. Legacy iPad URL öffnen

---

# Teil M – Standalone Distribution

Standalone bleibt First-Class Deployment.

Release soll eine einfache Distribution ermöglichen.

---

# Option A – Source Archive

GitHub erzeugt automatisch:

```text
Source code (zip)
Source code (tar.gz)
```

Das allein ist für Endnutzer eventuell nicht optimal.

---

# Option B – Standalone Release Bundle

Bevorzugt zusätzlich:

```text
ha-legacy-dashboard-1.0.0.tar.gz
```

mit nur runtime-relevanten Dateien.

---

# Bundle Inhalt

Beispiel:

```text
src/
package.json
package-lock.json
.env.example
README.md
README.de.md
README.en.md
LICENSE
VERSION
```

Keine:

```text
node_modules
.env
tests
coverage
Git metadata
private screenshots
```

---

# Checksums

Bevorzugt:

```text
SHA256SUMS
```

für Standalone-Artefakte.

---

# Teil N – Standalone Install / Upgrade

Dokumentieren:

```text
Fresh Installation
Upgrade Existing Installation
Rollback
```

---

# Upgrade

Beispielkonzept:

```text
Backup config
Stop service
Install new release
npm ci --omit=dev
Start service
Check health
```

Tatsächliche vorhandene systemd-/Deployment-Dokumentation verwenden.

---

# Keine automatischen destruktiven Migrationen

Wenn Config-Schema verändert wird:

- vorher Backup
- Migration versionieren
- Fehlerfall dokumentieren
- keine stille Datenlöschung

---

# Teil O – Home Assistant App Upgrade

Test:

```text
Version N
↓
App update
↓
Version N+1
```

Persistente `/data`-Konfiguration muss erhalten bleiben.

---

# Upgrade Test Cases

1. Dashboards bleiben
2. Entity Rules bleiben
3. Critical Detection Mode bleibt
4. Labels-Konfiguration bleibt
5. Grace Rules bleiben
6. Theme bleibt
7. Admin Security bleibt

---

# Rollback

Dokumentieren, was Home Assistant App Rollback/Backup bedeutet.

Nicht behaupten, Supervisor unterstütze einen bestimmten Rollback-Mechanismus,
wenn nicht verifiziert.

Bevorzugt:

```text
Backup vor Upgrade
```

und getestete Wiederherstellung.

---

# Teil P – Changelog

`CHANGELOG.md` wird releasefähig.

Bevorzugtes Format:

```text
# Changelog

## 1.0.0 – YYYY-MM-DD

### Added
### Changed
### Fixed
### Security
```

---

# Kein Sprint-Dump

Release Notes sollen nutzerorientiert sein.

Nicht:

```text
Sprint 17.4 implemented
Sprint 21.3 implemented
```

sondern:

```text
Added Summary and Error system dashboards
Added device-level diagnostics
Improved legacy Safari controls
Added Home Assistant App deployment
```

---

# Teil Q – GitHub Release Notes

GitHub Release enthält:

- kurze Zusammenfassung
- Highlights
- Installation
- Upgrade Notes
- Breaking Changes
- Known Issues
- Security Notes falls relevant
- Checksums/Artifacts

---

# Teil R – README Release Badges

Optional:

```text
Latest Release
License
Docker/GHCR
```

Keine Badges, die nicht funktionieren oder unnötig externe Abhängigkeiten
erzeugen.

---

# Teil S – License

Vor öffentlichem Release muss Lizenzlage eindeutig sein.

Prüfen:

```text
LICENSE file
package.json license
README license statement
```

müssen zusammenpassen.

---

# Abhängigkeiten

Prüfen, dass verwendete Runtime-Dependencies mit der gewählten Distribution
lizenzrechtlich vereinbar sind.

Keine umfangreiche juristische Analyse nötig, aber offensichtliche Konflikte
nicht ignorieren.

---

# Teil T – Security Release Gate

Release darf nicht veröffentlicht werden, wenn:

```text
.env im Repository/Artifact
echter HA Token
SUPERVISOR_TOKEN
Admin Password
Private Key
Debug Dump mit Secrets
```

gefunden wird.

---

# Secret Scan

Mindestens CI-Prüfung oder Repository-Scan auf offensichtliche Secret-Muster.

Keine echte Secret-Werte in Tests.

---

# npm Audit

`npm audit` darf als zusätzlicher Hinweis genutzt werden.

Aber:

- Ergebnisse fachlich bewerten
- nicht automatisch blind Dependency-Major-Upgrades durchführen

Release Policy definieren für kritische/high Findings.

---

# Teil U – Test Gate

Stable Release nur wenn komplette Testsuite erfolgreich.

Mindestens:

```text
unit tests
integration tests
syntax checks
legacy frontend compatibility checks
App package validation
Docker build
smoke test
security regression
```

---

# Test Report

CI soll nachvollziehbar zeigen:

```text
Tests passed
Images built
Manifest published
Smoke test passed
Artifacts attached
```

---

# Teil V – Legacy Safari Release Gate

Da Legacy Safari Kernziel ist, darf Stable Release keine bekannte harte
Regression auf:

```text
iOS 9 Safari
```

enthalten.

---

# Praktische Regel

Automatisierte ES5-/Syntax-Checks plus dokumentierte manuelle Browser-Abnahme.

---

# Release Checklist

Vor Stable Release:

```text
[ ] iPad mini Dashboard
[ ] Focus
[ ] Power controls
[ ] Summary
[ ] Errors
[ ] Health Indicator
[ ] Admin
[ ] Theme
[ ] Custom Dashboard
```

---

# Teil W – Home Assistant App Release Gate

Vor Stable Release mindestens auf Test-HAOS prüfen:

```text
[ ] Repository wird erkannt
[ ] App wird angezeigt
[ ] Installation funktioniert
[ ] Start funktioniert
[ ] REST funktioniert
[ ] WebSocket funktioniert
[ ] direkte LAN WebUI funktioniert
[ ] Restart funktioniert
[ ] Update von vorheriger Version funktioniert
[ ] /data bleibt erhalten
[ ] Logs secret-free
```

---

# Teil X – Release Candidate Prozess

Bevor erstem Stable Release bevorzugt:

```text
v1.0.0-rc.1
```

---

# RC Ziele

- reale HAOS-Installation
- reale iPad-Abnahme
- Upgrade testen
- Distribution testen
- Dokumentation testen

---

# RC Feedback

Bugs werden vor Stable behoben.

Kein automatischer RC→Stable Retag desselben unveränderlichen Artefakts ohne
klaren Prozess.

---

# Teil Y – Stable Release Prozess

Beispiel:

```text
main clean
↓
Version bump
↓
CHANGELOG
↓
Tests
↓
Commit
↓
Tag v1.0.0
↓
GitHub Release publish
↓
CI builds/publishes
↓
Validation
↓
Documentation final check
```

---

# Teil Z – Branch Protection / Release Hygiene

Empfehlung:

- Release nur aus `main`
- Working Tree clean
- Tag zeigt auf Main-Commit
- keine Release-Builds aus zufälligen Feature Branches

---

# Teil AA – GitHub Actions Files

Bevorzugt:

```text
.github/workflows/ci.yml
.github/workflows/release.yml
```

Optional:

```text
.github/workflows/app-validation.yml
```

Nicht unnötig viele fragmentierte Workflows.

---

# Teil AB – CI vs Release

## CI

Bei Push/PR:

```text
tests
lint/syntax
security basics
Docker build validation
App metadata validation
```

Keine Veröffentlichung.

## Release

Bei Release/Tag:

```text
alles aus CI
+
Registry login
+
publish images
+
multi-arch manifest
+
release artifacts
```

---

# Teil AC – Failure Atomicity

Wenn:

```text
amd64 published
aarch64 failed
```

darf kein fehlerhaftes generisches Stable Manifest erzeugt werden.

Multi-Arch Manifest erst nach erfolgreichen Arch-Builds veröffentlichen.

---

# latest Tag

`latest` erst setzen, wenn kompletter Stable Release validiert ist.

RC niemals `latest`.

---

# Teil AD – Container Retention

Keine aggressive Löschung alter versionierter Images.

Nutzer benötigen ältere Versionen für Diagnose/Rollback.

---

# Teil AE – App Update Detection

Home Assistant erkennt neue App-Versionen anhand Repository/App-Metadaten.

Sprint 25 muss prüfen:

```text
config.yaml version
Image tag/version
Repository update
```

funktionieren konsistent.

---

# Keine Version ohne Image

Nicht Repository auf:

```text
1.0.1
```

setzen, bevor:

```text
ghcr.io/...:1.0.1
```

verfügbar ist.

Release-Reihenfolge entsprechend planen.

---

# Teil AF – Release Automation Safety

GitHub Workflow niemals:

- Produktions-HA verändern
- Home Assistant Instanz remote bedienen
- echte Dashboard-Konfiguration überschreiben

Release Automation endet bei:

```text
Artifacts / Registry / GitHub Release
```

---

# Teil AG – Documentation URLs

Alle Links prüfen:

```text
GitHub Repository
Issues
Releases
App Repository
GHCR Package
Documentation
```

Keine toten Platzhalter.

---

# Support / Issues

README klar:

```text
Bug reports → GitHub Issues
```

Falls kein anderes Support-System existiert.

---

# Teil AH – Public Repository Check

Vor Veröffentlichung:

- keine internen Hostnamen
- keine privaten IPs als notwendige Default-Konfiguration
- keine persönlichen Tokens
- keine lokalen Pfade
- keine Debug-Dateien
- keine vertraulichen Screenshots

Beispielwerte dürfen dokumentiert sein, aber klar generisch.

---

# Teil AI – Release Testmatrix

Mindestens:

```text
Standalone amd64
Home Assistant App amd64
Home Assistant App aarch64 build
Legacy Safari/iOS 9
Modern Safari
```

Wenn reales aarch64 HAOS-Testgerät vorhanden:

```text
Home Assistant App aarch64 runtime
```

sonst Build/Manifest-Test dokumentieren.

---

# Teil AJ – Release 1.0 Scope

Codex soll anhand aktuellem Repo prüfen, ob Version `1.0.0` sinnvoll ist.

Sprint 25 darf nicht blind `1.0.0` erzwingen, wenn Repository bereits eine
andere semantische Versionshistorie besitzt.

---

# Existing Version Preservation

Wenn aktuelle Version z. B.:

```text
0.9.0
```

ist:

nächsten Release anhand tatsächlicher Historie planen.

Wenn bereits:

```text
1.x
```

existiert:

keine Rücksetzung.

---

# Teil AK – Migration Notes

Falls Sprint 24 neue App-spezifische Datenpfade einführt:

Release Notes erklären:

```text
Standalone-Konfiguration wird nicht automatisch in Home Assistant App importiert.
```

---

# Teil AL – Breaking Changes Gate

Jede Breaking Change muss ausdrücklich in Release Notes stehen.

Beispiele:

```text
Environment variable renamed
Config format changed
Port behavior changed
Admin auth changed
```

---

# Teil AM – Release Documentation

Neue Datei empfohlen:

```text
docs/RELEASING.md
```

Inhalt:

1. Voraussetzungen
2. Version bestimmen
3. Changelog aktualisieren
4. Tests ausführen
5. RC erstellen
6. Stable erstellen
7. Container prüfen
8. App Repository prüfen
9. Standalone Artifact prüfen
10. Rollback bei Release-Fehler

---

# Kein Wissen nur im Kopf

Release-Prozess muss dokumentiert sein und darf nicht nur aus manuellen,
nicht dokumentierten Schritten bestehen.

---

# Teil AN – Release Checklist Datei

Optional:

```text
docs/RELEASE_CHECKLIST.md
```

oder Checkliste direkt in `RELEASING.md`.

---

# Teil AO – Distribution Dokumentation

README Startbereich soll Nutzer schnell entscheiden lassen:

```text
Installationsart wählen:

Home Assistant OS?
→ Home Assistant App

LXC / VM / eigener Linux Server?
→ Standalone
```

---

# Teil AP – Home Assistant App Install Button

Wenn aktuelle my.home-assistant.io-Syntax korrekt integriert werden kann:

README:

```text
[ Add Repository to Home Assistant ]
```

Kein selbstgebautes proprietäres Install-Schema.

---

# Teil AQ – Release Artifacts

Stable Release mindestens:

```text
Container Image
Standalone tar.gz
SHA256SUMS
GitHub Source Archives
```

Optional:

```text
SBOM
```

---

# SBOM

Wenn ohne unverhältnismäßige Komplexität möglich:

```text
SPDX
oder CycloneDX
```

als Release-/Container-Artefakt.

Kein Pflichtpunkt für Sprintabschluss.

---

# Teil AR – Provenance

Optional moderne GitHub Artifact Attestation / Provenance nutzen, falls
bestehende GitHub Actions dies unkompliziert unterstützen.

Nicht Pflicht.

---

# Teil AS – Update / Rollback Manual Test

Standalone:

```text
current release
↓ update
new release
↓ verify
rollback old release
↓ verify
```

Home Assistant App:

```text
old test version
↓ update
new test version
↓ verify /data
```

---

# Teil AT – Observability After Release

Keine Telemetrie hinzufügen.

HA Legacy Dashboard sendet keine Nutzungsdaten an Entwickler.

---

# Keine Phone-Home-Funktion

Nicht:

```text
Analytics
Crash Upload
Tracking
External telemetry
```

ohne separaten späteren bewussten Entwurf und Opt-in.

---

# Teil AU – Release Security Notes

Dokumentation darf klar sagen:

```text
HA credentials remain server-side.
```

Im App-Modus:

```text
SUPERVISOR_TOKEN never reaches the browser.
```

Standalone:

```text
Long-Lived Access Token remains backend-only.
```

---

# Teil AV – Release Tests

1. versions consistent
2. invalid version mismatch fails
3. package lock used
4. complete tests pass
5. Docker amd64 build
6. Docker arm64 build
7. multi-arch manifest contains both
8. versioned image exists
9. RC does not update latest
10. stable may update latest
11. app config points to generic image
12. repository.yaml valid
13. app discovered from repository
14. standalone archive generated
15. archive contains no `.env`
16. archive contains no node_modules
17. SHA256SUMS generated
18. health smoke test
19. mock HA/Supervisor only
20. no production network dependency

---

# Upgrade Tests

21. standalone config survives update
22. App `/data` survives update
23. dashboards survive
24. entity rules survive
25. critical mode survives
26. grace rules survive
27. admin config survives
28. theme survives

---

# Security Tests

29. no HA token in image
30. no SUPERVISOR_TOKEN in image
31. no token in GitHub artifact
32. no token in logs
33. no `.env` artifact
34. CI permissions minimal
35. no registry PAT when unnecessary
36. no production HA access
37. no private key
38. no admin secret default

---

# Documentation Tests

39. German install docs
40. English install docs
41. App repository instructions
42. Standalone instructions
43. upgrade instructions
44. rollback instructions
45. release notes
46. changelog
47. support links
48. no stale URLs

---

# Browser / Product Regression

49. Default Dashboard
50. Custom Dashboards
51. Focus
52. Summary
53. Errors
54. Global Health Indicator
55. Entity Rule Manager
56. Grace/Flapping
57. Automation Impact
58. Admin
59. Light/Climate controls
60. Safari iOS 9

---

# Definition of Done

Sprint 25 ist abgeschlossen, wenn:

- Release-Versionierung eindeutig definiert ist
- Git Tag/package/App-Version konsistent geprüft werden
- reproduzierbarer GitHub Release Workflow existiert
- Docker BuildKit verwendet wird
- alte Builder-Abhängigkeit nicht primäre Strategie ist
- amd64 Image gebaut werden kann
- aarch64 Image gebaut werden kann
- generisches Multi-Arch Manifest veröffentlicht werden kann
- `config.yaml` generisches Image referenziert
- GHCR Distribution funktioniert
- App Repository installierbar ist
- repository.yaml valide ist
- Home Assistant App Update erkannt werden kann
- my.home-assistant.io Repository-Link dokumentiert ist, sofern korrekt möglich
- Standalone Release Bundle erzeugt wird
- SHA256 Checksums erzeugt werden
- Release Notes vorhanden sind
- CHANGELOG releasefähig ist
- docs/RELEASING.md vorhanden ist
- Fresh Install dokumentiert ist
- Upgrade dokumentiert ist
- Rollback/Backup dokumentiert ist
- App `/data` Update-Test erfolgreich ist
- Standalone Config Update-Test erfolgreich ist
- Release-Artefakte keine Secrets enthalten
- CI keine Produktions-HA-Verbindung benötigt
- Stable Release nur nach erfolgreichem Test Gate möglich ist
- Legacy Safari Release Gate dokumentiert ist
- App Release Gate dokumentiert ist
- alle Regressionstests grün sind
- README.de.md und README.en.md synchron sind
- docs/PROJECT_STATUS.md aktualisiert ist
- docs/SPRINT_ROADMAP.md Sprint 25 als abgeschlossen markieren kann

---

# Erwartetes Codex-Ergebnis

Codex berichtet:

1. Startcommit
2. tatsächlicher Repo-Stand
3. bestehende Versionshistorie
4. gewählte Release-Versionierungsstrategie
5. geänderte Dateien
6. GitHub Actions Struktur
7. BuildKit-Implementierung
8. amd64 Build
9. aarch64 Build
10. Multi-Arch Manifest
11. GHCR Image Naming
12. App config image reference
13. App Repository Validation
14. my.home-assistant.io Link
15. Standalone Release Bundle
16. Checksums
17. Upgrade-Test
18. App Persistenz-Test
19. Release Candidate Ablauf
20. Stable Release Ablauf
21. CI Permissions
22. Secret Scan
23. Test Gate
24. Legacy Safari Gate
25. HA App Gate
26. Dokumentation
27. Security Regression
28. bekannte Einschränkungen
29. noch offene Release-Schritte, die echte GitHub-/HAOS-Zugriffe erfordern
30. Commit-Vorschlag
31. Release-/Tag-Befehle

---

# Codex-Prompt

```text
Read:

- AGENTS.md
- README.md
- README.de.md
- README.en.md
- CHANGELOG.md if present
- package.json
- package-lock.json
- repository.yaml if present
- the Home Assistant App config.yaml
- docs/CODEX_HANDOFF.md
- docs/SPRINT_ROADMAP.md
- docs/PROJECT_STATUS.md
- docs/sprints/SPRINT-24.md
- docs/sprints/SPRINT-25.md
- docs/sprints/SPRINT-D1.md if present

Inspect the actual repository state and existing version history first.

Implement Sprint 25 exactly as specified in docs/sprints/SPRINT-25.md.

Do not blindly reset the project to version 1.0.0.
Determine the correct next release version from the actual repository history.

Create a reproducible Release & Distribution pipeline for both:
- Home Assistant App
- Standalone deployment

Use the current Home Assistant App publishing approach:
- Dockerfile as the build source of truth
- Docker BuildKit / current GitHub Actions
- generic multi-architecture image reference
- amd64 + aarch64
- GHCR
- multi-arch manifest

Do not use the retired historical Home Assistant builder workflow as the
primary release strategy.

The Home Assistant App config should prefer a generic image reference such as:

ghcr.io/tekky85/ha-legacy-dashboard

with platform resolution through the multi-arch manifest.

Implement strict version consistency checks between:
- Git tag/release version
- package.json
- Home Assistant App config.yaml
- changelog/release metadata

A mismatch must fail the release.

Create a GitHub release workflow with minimum required permissions.

Prefer GITHUB_TOKEN rather than long-lived registry PATs where possible.

Release workflow must:
- run the complete test gate
- build amd64
- build aarch64
- publish versioned images
- create the generic multi-arch manifest only after all architecture builds
  succeed
- validate the manifest
- run a container smoke test against mocks only
- produce Standalone release artifacts
- produce SHA256 checksums

Never contact a real Home Assistant instance in CI.

Never read production .env files or real credentials.

Do not put into images/artifacts/logs:
- HA tokens
- SUPERVISOR_TOKEN
- admin secrets
- .env
- private keys

Release Candidate and Stable releases must be distinct.

RC releases must not overwrite the stable/latest tag.

Do not publish `latest` until the complete Stable release has passed validation.

Make the repository usable as a Custom Home Assistant App Repository.

Verify:
- repository.yaml
- App config
- version
- generic image reference
- installation instructions

Add a correct my.home-assistant.io repository-install link if supported by the
current official syntax.

Do not claim this is an official Home Assistant App unless it is actually
accepted into an official repository.

Create/update:
- CHANGELOG.md
- docs/RELEASING.md
- README.md
- README.de.md
- README.en.md
- docs/PROJECT_STATUS.md
- docs/SPRINT_ROADMAP.md

Document separately:
- Home Assistant App fresh install
- Home Assistant App upgrade
- Standalone fresh install
- Standalone upgrade
- backup/rollback

Preserve the existing Standalone/LXC deployment as a supported first-class
installation method.

Run update/persistence tests so App `/data` and Standalone dashboard
configuration survive an upgrade.

Preserve all Sprint 21-24 functionality, all Home Assistant security
boundaries, and Safari iOS 9 / ECMAScript 5 compatibility.

Do not add telemetry, analytics, crash reporting, or any phone-home behavior.

Do not perform an actual public release, Git tag, GitHub Release, package
publication, commit or push until I review the implementation.

At the end report:
- actual version history
- proposed next version
- changed files
- CI/release workflow
- BuildKit strategy
- multi-arch image strategy
- GHCR naming
- version consistency checks
- App repository validation
- Standalone artifact structure
- checksums
- upgrade/persistence test results
- security/secret scan
- release gates
- documentation
- manual steps still required for the first real release
- exact proposed commit/tag/release commands
```
