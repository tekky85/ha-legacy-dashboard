# Sprint 25.5 – HAOS Network Access & Background Upload Hardening

## Status
Planned

## Charakter
RC-Hardening-Sprint. Keine neue Produktfunktion.

## Bestätigter Ist-Stand
- Home Assistant App / HAOS installierbar und startbar
- `/admin` erreichbar
- Default- und Custom-Dashboards auf iPad mini erreichbar
- Light Power funktioniert
- Climate Power funktioniert
- `http://192.168.1.16:3000/` funktioniert
- `http://homeassistant.local:3000/` funktioniert nicht
- JPEG/JPG-Background-Upload schlägt mit `JPEG-Segment ist ungültig` fehl

## Ziele
1. Hostname-/mDNS-Problem technisch klassifizieren
2. App-Port-/Binding-Fehler ausschließen
3. keine falsche App-Lösung für ein Netzwerk-/mDNS-Problem bauen
4. robuste JPEG-Validierung
5. typische reale JPEG-Varianten akzeptieren
6. Upload-Sicherheit aus Sprint 25.3 erhalten

## A – Hostname / mDNS Diagnose
Da IP:3000 funktioniert, zunächst trennen:

```text
A. homeassistant.local wird nicht aufgelöst
B. falsche Adresse
C. IPv6/IPv4-Unterschied
D. WLAN/VLAN/mDNS/Bonjour
E. Container Binding
F. WebUI/URL-Konfiguration
```

Pflichtprüfungen auf Mac/LAN soweit möglich:

```text
ping homeassistant.local
dscacheutil -q host -a name homeassistant.local
dns-sd -G v4v6 homeassistant.local
curl -v http://homeassistant.local:3000/health
curl -v http://192.168.1.16:3000/health
```

Auf iPad prüfen:

```text
http://homeassistant.local/
http://homeassistant.local:8123/
http://homeassistant.local:3000/
http://192.168.1.16:3000/
```

Wenn `homeassistant.local` generell nicht auflösbar ist:
`NETWORK / mDNS ISSUE`, nicht Dashboard-Bug.

Keine künstliche DNS-/mDNS-Lösung in der App bauen und keine breiten Netzwerkprivilegien hinzufügen.

Für stabile Wall Displays bei unzuverlässigem `.local` dokumentieren:
- reservierte/statische HAOS-IP oder
- eigener lokaler DNS-Hostname.

## B – Container Binding
Prüfen, dass Express im App-Modus korrekt auf einer container-erreichbaren Adresse lauscht und das App-Port-Mapping stimmt.

## C – JPEG Root Cause
Konkrete Validator-/Parser-Stelle finden. Validator nicht deaktivieren.

Reale JPEG-Varianten testen:
- Baseline JPEG
- Progressive JPEG
- EXIF / Orientation
- ICC Profile
- APP0/JFIF
- APP1/Exif
- APP2/ICC
- Thumbnail-Metadaten
- ohne EXIF
- `.jpg`
- `.jpeg`

Optional CMYK, falls Decoder unterstützt.

Sicher ablehnen:
- HTML als JPG
- SVG als JPG
- truncated JPEG
- oversized payload
- Path Traversal

## D – Failure Safety
Bei Fehler bleibt altes Background erhalten; keine halben Dateien/Orphan Configs.

## Tests
1. IP:3000 health
2. Hostname:3000 health
3. hostname resolution separat dokumentiert
4. IPv4/IPv6 dokumentiert
5. keine neuen breiten Privilegien
6. baseline JPEG accepted
7. progressive JPEG accepted
8. EXIF accepted
9. ICC accepted
10. .jpg accepted
11. .jpeg accepted
12. invalid rejected
13. HTML disguised rejected
14. SVG disguised rejected
15. truncated rejected
16. oversize rejected
17. replace failure preserves old image
18. image visible on iPad mini
19. portrait/landscape
20. App restart persistence

## Definition of Done
- DNS/mDNS Problem klassifiziert
- IP-Zugriff weiterhin funktionsfähig
- keine unnötigen HAOS-Privilegien
- valide übliche JPEGs funktionieren
- `JPEG-Segment ist ungültig` bei validen Testbildern behoben
- Upload-Sicherheit bleibt
- iPad mini zeigt JPEG Background
- PROJECT_STATUS aktualisiert

## Codex-Prompt

```text
Implement Sprint 25.5 exactly as specified in docs/sprints/SPRINT-25.5.md.

Inspect the actual repository first.

Investigate separately:
1. homeassistant.local:3000 not working while 192.168.1.16:3000 works
2. valid JPEG uploads failing with "JPEG-Segment ist ungültig"

Do not assume the hostname problem is an application bug. Separate mDNS/DNS
resolution from container binding and port mapping.

Do not add broad Home Assistant App network privileges.

Find the exact JPEG parser/validator root cause and accept normal
baseline/progressive/EXIF/ICC JPEGs while retaining upload security.

Do not disable validation.

Preserve all Sprint 25.1–25.4 behavior, Home Assistant security boundaries and
Safari iOS 9 compatibility.

Do not commit or push until I review the result.
```
