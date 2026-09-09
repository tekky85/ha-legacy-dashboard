# Sprint-25.5-Audit – HAOS Network Access & Background Upload Hardening

## Auditrahmen

- Audit-Part: 18
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.5.md`](../../sprints/SPRINT-25.5.md)
- Gezielter Re-Audit: Sprint 27.1-A, Basiscommit `dec0c54`
- Anwendungscode im Baseline-Audit geändert: nein; Sprint 27.1-A: zentraler
  PNG-Parser gehärtet
- Produktives Home Assistant, HAOS, LXC, Netzwerk oder physisches iPad
  kontaktiert: nein

## Gesamtergebnis

**Sprint 25.5: PARTIAL**

Der konkrete JPEG-Fehler ist im aktuellen Code nachvollziehbar behoben. Der
Parser scannt Entropiedaten nach `SOS`, behandelt Byte-Stuffing und Restart-
Marker korrekt und setzt die Segmentanalyse erst an einem echten Marker fort.
Reale Baseline-, Progressive-, JFIF-/APP0-, EXIF-/APP1-, Orientation-,
Thumbnail- und ICC-/APP2-Fixtures sowie `.jpg` und `.jpeg` bestehen. Getarnte,
abgeschnittene, strukturell falsche und übergroße JPEGs werden abgewiesen; ein
Fehler bewahrt das bestehende Asset und hinterlässt keine Teildatei.

Der Hostnamenbefund wurde sachgerecht als Dual-Stack-/mDNS-/Netzwerkpfad
klassifiziert: Die dokumentierte reale Sprint-25.5-Evidenz zeigte funktionalen
IPv4-IP-Zugriff auf Port 3000, aber einen nicht funktionierenden IPv6-Pfad für
denselben App-Port. Binding, Portmapping und WebUI sind korrekt; es wurden
keine breiten HAOS-Rechte oder DNS-Hacks hinzugefügt. Diese historische
Evidenz ist kein aktueller Runtime-PASS; die Wiederholung steht in MT-61.

Der gemeinsame PNG-Validator ist im gezielten Sprint-27.1-A-Re-Audit ebenfalls
gehärtet: CRC, IHDR-Inhalt, Critical-Chunk-Reihenfolge, IDAT und IEND/EOF werden
validiert; ungültiger Dashboard-/Room-Ersatz bewahrt das letzte gültige Asset.
`RQ-16-01` ist automatisiert geschlossen. Reale HAOS-Persistenz und Anzeige
der JPEG-/PNG-Hintergründe auf dem iPad bleiben `NOT TESTED`.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.5-SCOPE-01 | RC-Härtung ohne neue Produktfunktion | PASS | Änderungen liegen in Parser, Tests und Betriebsdokumentation; keine neue HA-Funktion oder Write-Domain. |
| 25.5-NET-01 | DNS/mDNS-Problem von Appfehler trennen | PASS | `docs/PROJECT_STATUS.md` dokumentiert A/AAAA-Auflösung, IPv4-/IPv6-Portvergleich und funktionierenden IP-Zugriff. |
| 25.5-NET-02 | IPv4 und IPv6 getrennt prüfen | PASS | Historische reale Evidenz: IPv4 Port 3000 erreichbar; IPv6 Port 3000 nicht erreichbar, während HA-Port 8123 über IPv6 antwortete. Aktueller Lauf: NOT TESTED, MT-61. |
| 25.5-NET-03 | Hostname, Protokoll und Port getrennt prüfen | PASS | `docs/DEPLOYMENT.md` trennt `http`, IP/Hostname, Port 3000, A/AAAA und mDNS. |
| 25.5-NET-04 | Fehler bei nicht auflösbarem `.local` als Netzwerkproblem klassifizieren | PASS | Dokumentation verspricht keine `.local`-Zuverlässigkeit und empfiehlt reservierte IPv4 oder lokalen DNS-A-Record. |
| 25.5-NET-05 | Direkten funktionierenden IP-LAN-Pfad unverändert lassen | PASS | App bleibt auf `http://<HA-IP>:3000/`; kein Ingress- oder Hostnamezwang. |
| 25.5-NET-06 | Aktuellen Hostname-/IP-Pfad real wiederholen | NOT TESTED | Kein Produktionsnetz in Part 18; vollständige Schritte in MT-61. |
| 25.5-BIND-01 | Container lauscht auf allen Interfaces | PASS | `ha_legacy_dashboard/run.sh` exportiert `BIND_ADDRESS=0.0.0.0`; `src/server.js` verwendet denselben sicheren Default. |
| 25.5-PORT-01 | App-Portmapping 3000/tcp bleibt korrekt | PASS | `ha_legacy_dashboard/config.yaml`: `3000/tcp: 3000`. |
| 25.5-WEBUI-01 | WebUI enthält Host und gemappten Port | PASS | `webui: http://[HOST]:[PORT:3000]/`. |
| 25.5-PERM-01 | Keine unnötigen Netzwerk-/Supervisor-/Hostrechte | PASS | Nur `homeassistant_api: true`, AppArmor aktiv; kein host_network, privileged, Docker- oder Config-Mount. |
| 25.5-JPEG-ROOT-01 | Exakte Parserursache beheben, Validierung nicht abschalten | PASS | `src/services/dashboard-backgrounds.js::inspectJpeg()` erkennt Scan-Daten nach SOS statt sie als Längensegmente zu interpretieren. |
| 25.5-JPEG-01 | Baseline JPEG | PASS | Reale Fixture und Test `reale Baseline- und Progressive-JPEGs mit Scandaten werden akzeptiert`. |
| 25.5-JPEG-02 | Progressive JPEG | PASS | Dieselbe Fixture-/Testgruppe. |
| 25.5-JPEG-03 | JFIF / APP0 | PASS | `test/fixtures/background-images.js`; Sprint-25.5-Test. |
| 25.5-JPEG-04 | EXIF / APP1 und Orientation | PASS | Fixture enthält Orientation-Metadaten; Parser überspringt APP1 sicher. |
| 25.5-JPEG-05 | ICC Profile / APP2 | PASS | ICC-Fixture und Sprint-25.5-Test. |
| 25.5-JPEG-06 | JPEG mit Metadaten-Thumbnail | PASS | EXIF-Thumbnail-Fixture wird akzeptiert. |
| 25.5-JPEG-07 | JPEG ohne EXIF | PASS | Baseline-/JFIF-Fixtures benötigen kein EXIF. |
| 25.5-JPEG-08 | `.jpg` und `.jpeg` | PASS | Admin-Dateiauswahl und MIME-Pfad akzeptieren beide Endungen als `image/jpeg`; Speicherung normalisiert auf `.jpg`. |
| 25.5-JPEG-09 | CMYK, sofern Fixture verfügbar | N/A | Sprint kennzeichnet dies als optional; keine CMYK-Fixture im Repository. |
| 25.5-REJECT-01 | Malformed/truncated JPEG ablehnen | PASS | Segmentlängen, Marker, SOF/SOS/EOI und vollständiges Ende werden geprüft; negative Fixtures grün. |
| 25.5-REJECT-02 | HTML als JPG ablehnen | PASS | Magische Bytes/Struktur statt Dateiname; Testfixture abgewiesen. |
| 25.5-REJECT-03 | SVG als JPG ablehnen | PASS | SVG-Signatur erfüllt weder JPEG- noch PNG-Prüfung. |
| 25.5-REJECT-04 | Oversized Payload/Dimensionen ablehnen | PASS | Multer-/Store-Limit und Dimensionsgrenzen; Sprint-25.5- und Admin-API-Tests. |
| 25.5-REJECT-05 | Path Traversal verhindern | PASS | Zufällige interne Asset-ID, feste erlaubte Endung, `path.join` nur mit servergeneriertem Namen; Originaldateiname wird nicht als Pfad verwendet. |
| 25.5-SAFE-01 | Uploadfehler bewahrt vorhandenes Background | PASS | Store schreibt erst Tempdatei; Admin entfernt Altasset erst nach erfolgreichem Configwrite und entfernt Neuasset bei Persistenzfehler. |
| 25.5-SAFE-02 | Keine Teil-/Waisendateien bei JPEG-Fehler | PASS | Validierung vor Persistenz; Tempdatei, `fsync`, atomisches Rename und Cleanup im Fehlerpfad. |
| 25.5-SAFE-03 | Config und Asset bleiben konsistent | PASS | `src/routes/admin.js` ordnet Store → Configpersistenz → Referenzbereinigung transaktional an. |
| 25.5-SAFE-04 | Bestehende PNG-Funktion und Uploadsicherheit unverändert korrekt | PASS | `inspectPng()` prüft CRC, IHDR, Critical-Chunk-Reihenfolge, IDAT und sauberes IEND/EOF; direkte Negativ- und API-Replace-Regressionen sind grün. |
| 25.5-SEC-01 | Keine Credentials/Secrets im Browser oder Log | PASS | Frontendscan ohne Werte/Tokenzugriff; Logger- und Securitytests grün. Dokumentierte Variablennamen sind keine Secrets. |
| 25.5-SEC-02 | Keine HA-Write-Erweiterung | PASS | Upload ist lokale Adminfunktion; HA-Write-Pfade bleiben explizit Light/Climate. |
| 25.5-LEGACY-01 | Safari iOS 9 / ES5 bleibt erhalten | PASS | Wall-Frontendscan und `node --check`; Uploadeditor darf moderner Browser sein. |
| 25.5-TEST-01 | Geforderte JPEG-Varianten lokal automatisiert | PASS | `test/sprint-25-5.test.js`, alle relevanten Fälle im 89/89-Fokuslauf grün. |
| 25.5-TEST-02 | Gemeinsame Uploadvalidierung vollständig regressiert | PASS | JPEG-Varianten sowie PNG ohne IDAT, CRC-Tamper, Truncation, trailing data, unknown critical, duplicate IHDR und Dashboard-/Room-Rollback sind direkt regressiert. |
| 25.5-IPAD-01 | JPEG-Background real auf iPad mini sichtbar | NOT TESTED | Kein physisches Gerät in Part 18; MT-62. |
| 25.5-IPAD-02 | Portrait/Landscape und Replace/Remove real | NOT TESTED | MT-62. |
| 25.5-APP-01 | Asset über realen App-Neustart unter `/data` persistent | NOT TESTED | Architektur und lokale Persistenztests PASS; aktuelle HAOS-Laufzeit MT-62/MT-51. |
| 25.5-DOC-01 | Projektstatus und Betriebsdokumentation aktualisiert | PASS | Sprintabschnitt in `docs/PROJECT_STATUS.md`; Diagnose/Fallback in `docs/DEPLOYMENT.md`. |
| 25.5-DOD-01 | Sprint vollständig releasefähig | PARTIAL | JPEG-/PNG-Härtung und Netzklassifikation sind vorhanden; aktuelle HAOS-/iPad-Abnahmen MT-61/62 bleiben offen. |

## Root Cause und sichere Fehlersemantik

Der alte JPEG-Validator setzte nach dem Start-of-Scan seine normale
Segmentlängenlogik fort. Entropiedaten sind jedoch kein gewöhnlicher
Markerstrom; insbesondere `FF 00` und Restart-Marker dürfen dort nicht als
neues Segment mit Längenfeld behandelt werden. Der aktuelle Parser trennt diese
Phasen. JPEG-Validierung bleibt aktiv und prüft weiterhin Struktur,
Dimensionen, Vollständigkeit und Limits.

Der bestätigte Restdefekt lag nicht im JPEG-Pfad, sondern in der gemeinsamen
PNG-Prüfung. Sprint 27.1-A behebt ihn im wiederverwendeten zentralen Parser,
ohne JPEG-Validierung oder Uploadgrenzen abzuschwächen.

## Testevidenz

- Sprint-27.1-A-Fokuslauf: 85/85 Tests bestanden, ausschließlich Localhost-Mocks,
  Fake-Credentials und lokale Filesystem-Fixtures.
- Die ursprünglichen Direktproben reproduzierten die Akzeptanz von PNG ohne
  IDAT und mit falscher CRC. Nach der Reparatur werden beide sowie weitere
  Strukturfehler abgewiesen.
- Gesamtsuite: 330/330 Tests bestanden.

## Offene reale Abnahme

- MT-61: aktuelle IP-/Hostname-/IPv4-/IPv6-/mDNS-/Port-Matrix.
- MT-62: reale JPEG-Varianten, Negativfälle, Replace/Rollback, `/data`-
  Persistenz und iPad-Anzeige.

## Sicherheitsbewertung

Keine Credential-, HA-Write-, Adminauthentifizierungs- oder Privilegien-
Regression wurde gefunden. Der frühere PNG-Datenintegritätsbefund ist
automatisiert geschlossen; die realen HAOS-/iPad-Abnahmen bleiben ausstehend.

## Sprint-27.1-B-Re-Audit

Die unveränderten Netzwerk-/JPEG-Pfade werden nun mit konsistenten v52-
Frontendreferenzen ausgeliefert. Assetversions-Test und Gesamtsuite 331/331
sind grün; keine Netzwerkberechtigung wurde ergänzt. Reale HAOS-/iPad-Abnahme
bleibt `NOT TESTED`.
