# Sprint-25.7-Audit – Legacy iPad Kiosk Deployment & Guided Access

## Auditrahmen

- Audit-Part: 18
- Auditdatum: 9. September 2026
- Auditierter Branch: `main`
- Auditierter Repository-Commit: `593ba5a2660121f6d4af9340499c6d860e754524`
- Sprint-Spezifikation: [`SPRINT-25.7.md`](../../sprints/SPRINT-25.7.md)
- Zentrale Betriebsanleitung: [`docs/IPAD_KIOSK.md`](../../IPAD_KIOSK.md)
- Anwendungscode geändert: nein
- Physisches iPad/Guided Access geprüft: nein

## Gesamtergebnis

**Sprint 25.7: PARTIAL**

Die Dokumentation setzt die richtige praktische Priorität: Für ein einzelnes
unverwaltetes iPad mini 1 mit iOS 9.3.5 wird die HomeScreen-Web-App plus
Geführter Zugriff empfohlen; Supervision plus Single App Mode/App Lock wird
als strengere verwaltete Alternative beschrieben, nicht als Voraussetzung.
Die Anleitung behandelt direkten LAN-Zugriff, HomeScreen-Installation,
separaten Guided-Access-Code, Hardwaretasten, Touch, Motion/Rotation,
Auto-Lock, Dauerstrom, Exit, Neustart, WLAN-/HA-/App-Recovery und die
Sicherheitsgrenzen.

Entscheidend: Guided Access wird nicht als Autostart-Kiosk verkauft. Nach
Neustart oder Stromverlust kann eine manuelle HomeScreen-Wiederöffnung und
erneute Guided-Access-Aktivierung nötig sein. Kioskmodus ersetzt weder Admin-
Authentifizierung noch HA-Write-Autorisierung. Die technischen HomeScreen-
Voraussetzungen aus Sprint 25.2 sind vorhanden: Apple-Standalone-Metatags,
relative same-origin Navigation, `_self`, validiertes `returnTo`, kein
`window.open()` und kein Ingresszwang.

Die Definition of Done verlangt jedoch reale iPad-mini-Tests. Diese wurden in
Part 18 bewusst nicht ausgeführt. Die exakten deutschen iOS-9-Menütexte und
das reale Verhalten von Home-/Sleep-/Volume-/Motion-/Touch-/Auto-Lock-Optionen
bleiben daher `NOT TESTED`. MT-64 bis MT-66 bilden eine vollständige spätere
Abnahme. Der bestehende P1-Cachebefund `RQ-04-01` ist für eine aggressive
HomeScreen-Safari-Cacheumgebung besonders relevant.

## Requirement-Matrix

| ID | Requirement | Status | Evidence / Begründung |
|---|---|---|---|
| 25.7-SCOPE-01 | Operational-/Dokumentationssprint ohne Featureänderung | PASS | Sprint 25.7 änderte Dokumentation/Metadaten, nicht HA-Funktionalität. |
| 25.7-TARGET-01 | iPad mini 1, iOS 9.3.5, Home-Taste, HomeScreen als Ziel | PASS | `docs/IPAD_KIOSK.md` nennt alle vier Voraussetzungen ausdrücklich. |
| 25.7-REC-01 | Single-Device-Empfehlung: Guided Access | PASS | Abschnitt „Empfohlene Betriebsart für ein einzelnes Gerät“. |
| 25.7-REC-02 | Managed/Multi-Device: Supervision + Single App Mode/MDM | PASS | Eigener Alternativabschnitt; nicht für Einzelgerät vorgeschrieben. |
| 25.7-HOME-01 | Stabile direkte LAN-URL dokumentieren | PASS | Generische Beispiele `http://<HA-IP>:3000/` und `/d/<dashboard-id>`; keine private Produktions-IP. |
| 25.7-HOME-02 | Standalone/LXC und HA App jeweils direkt per LAN-Port | PASS | Anleitung unterscheidet beide Bereitstellungsarten; kein Ingresszwang. |
| 25.7-HOME-03 | `.local` nicht als zuverlässig versprechen | PASS | Reservierte IPv4/lokaler DNS werden empfohlen; mDNS als umgebungsabhängig markiert. |
| 25.7-HOME-04 | HomeScreen-Verknüpfung aus Safari dokumentieren | PASS | Share → Zum Home-Bildschirm → Start vom Icon beschrieben. Exakte iOS-9-Labels: MT-64. |
| 25.7-META-01 | Apple-Standalone-Metadaten vorhanden | PASS | `src/public/index.html` und `system.html`: viewport, `apple-mobile-web-app-capable`, Statusbar, Icons. |
| 25.7-META-02 | Manifest nur progressive Verbesserung | PASS | Legacy-Startpfad hängt nicht vom Manifest ab; keine moderne PWA-Pflicht. |
| 25.7-NAV-01 | Interne Routen same-window/same-origin | PASS – depends on Sprint 25.2 | `system-navigation.js` validiert relative interne Ziele, setzt `_self`/`window.location.href`. |
| 25.7-NAV-02 | Kein `_blank`, `window.open()` oder fester Originwechsel | PASS | Statischer Scan und Sprint-25.2-Tests. |
| 25.7-NAV-03 | `returnTo` gegen Open Redirect absichern | PASS | Nur Root, gültige `/d/<id>` und interne Systemrouten; serverseitige Dashboardprüfung. |
| 25.7-GA-01 | Guided Access in Einstellungen aktivieren | PASS | iOS-9-Pfad ausdrücklich beschrieben und als real zu bestätigen gekennzeichnet. |
| 25.7-GA-02 | Separaten Guided-Access-Code konfigurieren | PASS | Dokument warnt vor Wiederverwendung von Admin-/HA-Secrets. |
| 25.7-GA-03 | Sitzung per dreifachem Home-Tastendruck starten | PASS | Ablauf beschrieben; entspricht Apples Grundmodell für Geräte mit Home-Taste. Reales iOS 9: MT-64. |
| 25.7-GA-04 | Normales Verlassen über Home-Taste verhindern | NOT TESTED | Nur physisch nachweisbar; MT-64. |
| 25.7-GA-05 | Sleep/Wake-Option bewusst konfigurieren | PASS | Tabelle erklärt Auswirkung und Betriebsentscheidung. Physisches Verhalten: MT-65. |
| 25.7-GA-06 | Volume-Option dokumentieren | PASS | Optionales Freigeben/Sperren erklärt. Physisches Verhalten: MT-65. |
| 25.7-GA-07 | Touch aktiv lassen bzw. Bereiche bewusst sperren | PASS | Vollständige Dashboardbedienung erfordert Touch; keine pauschale Touchsperre. Physisch: MT-64. |
| 25.7-GA-08 | Motion/Rotation bewusst wählen | PASS | Unterschied zwischen responsive App und Gerätesperre klar; physisch: MT-64. |
| 25.7-GA-09 | Guided Access sicher mit Code beenden | PASS | Dreifacher Home-Druck, Code und Beenden dokumentiert. Physisch: MT-66. |
| 25.7-IOS9-01 | Keine erfundenen modernen iPadOS-Menütexte | PASS | Anleitung nennt iOS 9.3.5 und warnt, aktuelle Apple-Bezeichnungen nicht ungeprüft zu übertragen. |
| 25.7-IOS9-02 | Exakte deutsche Menülabels auf realem iOS 9 verifizieren | NOT TESTED | MT-64/65/66. |
| 25.7-POWER-01 | Auto-Lock und manuelle Geräteeinstellung | PASS | iOS-Pfad, „Nie“ nur wenn verfügbar/gewünscht, Verhalten außerhalb Guided Access erklärt. |
| 25.7-POWER-02 | Dauerstrom, Ladegerät, Wärme und Helligkeit | PASS | Dauerbetrieb mit geeignetem Netzteil, kontrollierter Helligkeit und Wärmebeobachtung dokumentiert. |
| 25.7-POWER-03 | Web-App verspricht keine Power-Management-Kontrolle | PASS | Kein Wake Lock; Geräteeinstellungen bleiben maßgeblich. |
| 25.7-POWER-04 | Reales Sleep/Wake/Auto-Lock/Dauerstromverhalten | NOT TESTED | MT-65. |
| 25.7-ROT-01 | Portrait/Landscape und Motion nicht verwechseln | PASS | Anleitung trennt responsive Dashboarddarstellung und optional unterbundene Rotation. |
| 25.7-ROT-02 | Reale Rotation bei aktiver Sitzung | NOT TESTED | MT-64. |
| 25.7-BOOT-01 | Guided Access nicht als Auto-Start nach Reboot darstellen | PASS | Explizite Einschränkung und manuelle Recovery beschrieben. |
| 25.7-BOOT-02 | Stromverlust/iPad-Neustart | PASS | Dokument erklärt, dass Dashboard und Guided Access gegebenenfalls manuell neu gestartet werden. |
| 25.7-BOOT-03 | WLAN-Reconnect | PASS | Retry/Stale-Verhalten und manuelle Netzprüfung beschrieben. Reales Langzeitverhalten: MT-65. |
| 25.7-BOOT-04 | HA-/Dashboard-App-Restart | PASS | Seite bleibt geöffnet und soll sich wieder verbinden; Reload/HomeScreen-Neustart als Recovery. Physisch: MT-65. |
| 25.7-BOOT-05 | Reale Post-Reboot-Wiederaufnahme | NOT TESTED | MT-66. |
| 25.7-MANAGED-01 | Supervision/Single App Mode fachlich unterscheiden | PASS | Lokaler manueller Guided Access versus verwaltetes/supervised App Lock klar getrennt. |
| 25.7-MANAGED-02 | Single App Mode kann App nach Neustart wieder öffnen | PASS | Als Eigenschaft des aktiven supervised Payloads und nicht von Guided Access beschrieben. |
| 25.7-MANAGED-03 | Keine unvalidierte iOS-9-MDM-Kompatibilität versprechen | PASS | Dokument verlangt Prüfung mit konkretem Gerät/Configurator/MDM. |
| 25.7-SEC-01 | Guided Access ersetzt keine Adminauthentifizierung | PASS | Eigener Sicherheitsabschnitt. |
| 25.7-SEC-02 | Keine Admincredentials automatisch auf dem iPad | PASS | Anleitung verbietet gespeicherte/automatisch bereitgestellte Adminsecrets. |
| 25.7-SEC-03 | HA-/Supervisor-Token backend-only | PASS | Dokumentation und Frontendscan; keine Tokenwerte im Kioskpfad. |
| 25.7-SEC-04 | Explizite Write-Autorisierung/generischer Proxy unverändert | PASS | Kiosk erzeugt keine neue Route oder Berechtigung. |
| 25.7-LEGACY-01 | Kein fetch/Promise/modernes Modul/Wake Lock/Service Worker | PASS | Statischer Scan des Wall-Frontends; Manifest ist nicht obligatorisch. |
| 25.7-LEGACY-02 | Kein CSS Grid/Flex-gap im Wall-Display | PASS | Statischer Scan; modernes Admin-CSS ist nicht Teil des Wall-Clients. |
| 25.7-DOC-01 | README DE/EN semantisch synchron | PASS | Beide verlinken dieselbe Kioskanleitung und dieselbe Ein-/Mehrgeräteempfehlung. |
| 25.7-DOC-02 | Projektstatus/Roadmap aktualisiert | PASS | Sprint-25.7-Abschnitte vorhanden; globaler Statusdrift bleibt separat `RQ-08-03`. |
| 25.7-DOC-03 | Keine erfundenen Produkt-/Gerätescreenshots | N/A | Sprint fügte keine vermeintliche Realgeräteaufnahme hinzu. |
| 25.7-CACHE-01 | Kiosk erhält aktuelle gemeinsame Assets zuverlässig | PASS | Dashboard, System, Admin und Manifest verwenden die erhöhte Version v52; `test/asset-version.test.js` verhindert routeabhängige Abweichungen. | RQ-04-01 code-seitig geschlossen; ein echter iOS-9-Cache-/Kiosklauf bleibt `NOT TESTED`. |
| 25.7-MANUAL-01 | HomeScreen/Guided Access/Home-Taste real | NOT TESTED | MT-64. |
| 25.7-MANUAL-02 | Sleep/Wake/Auto-Lock/Power/Restart real | NOT TESTED | MT-65. |
| 25.7-MANUAL-03 | Exit, Reboot und Post-Reboot-Relaunch real | NOT TESTED | MT-66. |
| 25.7-DOD-01 | Guided Access auf realem iPad mini getestet | NOT TESTED | Definition of Done noch nicht erfüllt. |
| 25.7-DOD-02 | Sprint vollständig abgeschlossen | PARTIAL | Dokumentation und technische Voraussetzungen sind vorhanden; RQ-04-01 ist code-seitig geschlossen, das physische Pflichtgate MT-64 bis MT-66 bleibt `NOT TESTED`. |

## Quellen- und Plausibilitätsprüfung

Die Anleitung verweist auf Apple-Dokumentation und überträgt aktuelle Begriffe
nicht ungeprüft auf iOS 9. Apples aktueller Guided-Access-Leitfaden bestätigt
das Grundmodell aus einzelner App, Passcode, Hardwaretasten, Motion, Touch,
Zeitlimit und dreifachem Home-Tastendruck bei Geräten ohne Face ID. Apples
Configurator-Leitfaden bestätigt, dass Single App Mode ein supervised Gerät
voraussetzt und die App bei aktivem Payload nach Neustart erneut öffnet. Die
konkreten deutschen iOS-9-Menübezeichnungen bleiben absichtlich manuell.

## Kioskgrenzen

Guided Access ist eine lokale manuelle Bedienungssperre. Es liefert weder
unbeaufsichtigten Boot noch Remote-Flottenverwaltung oder
Unternehmensauthentifizierung. Nach Reboot/Stromverlust muss der Betreiber mit
einer manuellen Wiederöffnung und erneuter Aktivierung rechnen. Für strengere
verwaltete Szenarien ist Supervision + Single App Mode/App Lock die passendere
Architektur, deren konkrete iOS-9-/Toolkompatibilität vor Einsatz geprüft
werden muss.

## Testevidenz und offene Abnahme

- Repositorytests für HomeScreen-Metadaten, Manifest, same-window Navigation,
  Returnvalidierung, Theme und Legacysyntax sind im 89/89-Fokuslauf grün.
- Keine physische Guided-Access-Funktion wurde in Part 18 als PASS markiert.
- MT-64: HomeScreen, Guided Access, Home-Taste, interne Routen, Theme und
  Rotation.
- MT-65: Sleep/Wake, Volume, Touch, Auto-Lock, Dauerstrom, WLAN/HA/App-Restart.
- MT-66: Exit/Passcode, Gerätereboot, Post-Reboot-Relaunch und erneuter Guided
  Access.
