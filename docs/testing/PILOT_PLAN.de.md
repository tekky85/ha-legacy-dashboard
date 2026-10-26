# Pilot 27.4 – Auswahl aus dem vorhandenen Testkatalog

Status: **IMPLEMENTATION READY FOR HUMAN PILOT**. Reale Tests: **NOT TESTED**.
Dieser Plan wählt 11 vorhandene Test-IDs aus. Die vollständigen Schritte,
Erwartungen und Fehlerkriterien bleiben ausschließlich in
`docs/audits/MANUAL_TEST_QUEUE.md` und deren generiertem Portal-Katalog.
Die Auswahl ist keine zweite Testfall-Datenbank und verändert keine Test-ID.

Portal: https://tekky85.github.io/ha-legacy-dashboard/testing/

Für Teilnehmer zuerst die [einfache Anleitung](TESTER_GUIDE.de.md) und die
[Hilfe mit Ausfüllbeispiel](https://tekky85.github.io/ha-legacy-dashboard/testing/help.html)
verwenden. Die elf Pilotprüfungen plus MT-01 haben dort eigene deutsche
Durchführungshilfen. Dieser Plan enthält zusätzlich technische Aufgaben für
die Betreuung; Teilnehmer müssen sie nicht selbst entschlüsseln. Ausfälle,
Testzustände und Protokollkontrollen gemeinsam vorbereiten. Ohne nötige
Betreuung kein vollständiges Erfolgsergebnis. Die Kandidatenangabe im folgenden
Abschnitt ist der historische Sprintstart, keine Aufforderung zum Rückbau;
für einen neuen Bericht die aktuell vereinbarte und tatsächlich installierte
Version angeben.

## Kandidat, Zustimmung und sichere Vorbereitung

Der zum Sprintstart tatsächlich veröffentlichte App-Testrelease ist
`v1.0.0-rc.7` (Quellcommit `2507f6955b17740da8edbd36925b3338ca080383`).
Das ist eine Referenz, keine Behauptung zur installierten Version eines
Testers und keine automatische Installations-/Updatefreigabe. Der Koordinator
muss den Kandidaten pro Slot ausdrücklich bestätigen. Der zuletzt beobachtete
Produktdependency-Audit meldet High/Critical-Befunde; deren Risikoprüfung/
Behebung bleibt vor der Kandidatenverteilung separat offen. Das statische
Portal selbst benötigt diese Produktabhängigkeiten nicht.

- Zwei unabhängige HA-App-Testinstallationen, bevorzugt ein dritter Tester.
  Ein anderer Browser auf derselben HA-Instanz ist kein unabhängiges HA-System.
- Keine Ausfall-, Reboot-, Restore-, Registryfixture- oder Fehlertests auf
  produktiven Sicherheitsabläufen. Backup, Rückweg und Wartungsfenster vorher
  bestätigen. Unsichere oder nicht vorbereitete Prüfungen bleiben BLOCKED.
- Light-/Climate-Aktionen nur nach ausdrücklicher Zustimmung des Gerätebesitzers,
  mit ungefährlichen Testgeräten und bereits explizit autorisierten Entities.
  Dashboard-Sichtbarkeit erteilt keine Schreibrechte. Der Koordinator und das
  Portal lösen keine HA-Aktionen automatisch aus.
- Separate Test-Admin-Anmeldung auf modernem Gerät; keine Admin-Credentials
  auf dem alten iPad, keine Tokens in Notizen, URLs, Screenshots oder Reports.
- Vorgesehenes Zielgerät beachten. Ein Desktop-Eindruck ersetzt kein iOS-9-
  Ergebnis. Wer das geforderte Gerät nicht hat, dokumentiert den Umfang
  ausdrücklich als N/A oder die fehlende zugewiesene Voraussetzung als BLOCKED.

Im Portal zuerst einen Lauf mit tatsächlicher App-Version und **Echte manuelle
Beobachtungen** anlegen, dann **Pilot 27.4** aktivieren. Weitere Filter dürfen
die sichtbare Auswahl einschränken; die Voraussetzungen jedes Tests gelten
unverändert. Aufgewendete Zeit wird nicht erfunden: kurz/mittel/lang bezeichnet
nur den relativen Aufwand. Insbesondere Restore/Reboot ist nicht „kurz“.

## Testauswahl

| Test-ID | Zweck / erforderliche Fähigkeit | Vorbereitung / sicheres HA-Setup | Aufwand | HA-Writes und weitere Eingriffe | Evidenz und Einordnung |
|---|---|---|---|---|---|
| MT-50 | App-Version/Start, REST-/Registryquellen und Recovery; laut Quelle HAOS amd64 plus Desktop-Safari | Kontrollierte amd64-Test-App, vorhandene Diagnoseinformationen, separater Test-Admin-Token; Core-Ausfallfenster freigegeben | lang | Keine Gerätewrites vorgeschrieben; Core Stop/Start und App-Optionen sind manuelle Betriebs-/Konfigurationseingriffe | Tatsächliche Version/Architektur, Health/Recovery-Zeitleiste und bereinigte Beobachtungen. Start scheitert trotz erfüllter Voraussetzungen: FAIL. Nur Version angesehen: noch kein PASS des vollständigen Tests. ARM-only außerhalb dieses Testumfangs: N/A mit Begründung. |
| MT-04 | Geschützter Admin, Default/Custom CRUD, Entitysuche und Preview | macOS Safari, Testdashboards, gültige Sicherung, separater Testtoken und kontrolliert auslösbarer Savefehler | mittel | Dashboard-Konfiguration wird geändert; keine HA-Geräteservices vorgeschrieben | Bereinigte Save/Discard-/Auth-Beobachtung. Fehlende vorbereitete Adminumgebung: BLOCKED. Unberechtigter Zugriff oder Datenverlust: FAIL. |
| MT-02 | Default/Custom-Routen, Refresh und HomeScreen-Kontext | iPad mini 1/iOS 9.3.5, isoliertes Default- und Custom-Dashboard `esszimmer`, kontrollierter Mock-State | mittel | Keine Gerätesteuerung vorgeschrieben; Mock-State nur im Testsystem | Route/Titel/Theme je Schritt, Portrait/Landscape. Ohne vorgesehenes Legacy-Gerät außerhalb vereinbartem Umfang: N/A; vorübergehend fehlendes zugewiesenes Gerät: BLOCKED. |
| MT-40 | Summary-/Error-Navigation, Healthzustände und validierte Rückkehr | Legacy-iPad, Custom-Dashboard `health-audit`, kontrollierbare Statusfixture und Status-Endpunkt-Ausfall | lang | Keine Geräteservices; ausschließlich kontrollierte Testzustände/Mock-Ausfälle | Returnroute und HomeScreen-Verbleib, globale Healthanzeige unabhängig vom UI-Filter. Fehlende Statusfixture: BLOCKED, keine Entwarnungs-/Severity-Annahme. |
| MT-15 | Autorisiertes Light in Grid/Focus, Eventtrennung | Legacy-iPad; verfügbares autorisiertes Test-Light plus nicht autorisierter/unavailable Vergleich | mittel | **Ja: Light On/Off**, nur nach expliziter Zustimmung; optional sicherer Servicefehlertest | Beobachtung pro Aktion/Oberfläche, Busy und bestätigter Zustand. Kein Light im vereinbarten Scope: N/A; zugesagtes Light nicht vorbereitet/keine Zustimmung: BLOCKED; autorisiertes verfügbares Light schaltet nicht: FAIL. |
| MT-16 | Climate-Power, Sollwert inklusive OFF und sichere Capabilityentscheidung | Legacy-iPad; autorisiertes Test-Climate mit `off` und Nicht-Off-Modus, no-off/unavailable Vergleiche; dokumentierte Min/Max/Step und sicherer Sollwert | mittel | **Ja: Climate Power und Sollwert**; OFF-Sollwert nur wenn Integration unterstützt; keine blind erzwungenen Modi | Soll-/Istwert, Modus und Reproduktion pro Schritt. Fehlende Fähigkeit ist nicht automatisch FAIL. Optional nicht unterstützten OFF-Sollwert als nicht anwendbaren Teilschritt begründen; übrige verpflichtende Schritte müssen trotzdem vollständig belegt sein. |
| MT-69 | Room Card, Area-Vorschlag/Override, Collapse, Hintergrund und sichere Controls | macOS-Safari plus Legacy-iPad; Room Card in Section, kontrollierte Testraum-Area/Entity-/Registryfixture und anonymes JPEG/PNG gemäß Quelle | lang | **Ja: autorisierte Light-/Climate-Controls**; App-Konfiguration. Area-Löschung nur im isolierten Fixture, niemals im produktiven HA | Preview/Runtime, Toggle→Control→Toggle, fünf Größen/Orientierungen. Fehlende komplette Room-/Fixture-Vorbereitung: BLOCKED. Kein echtes Area-Schreiben durch die App zulässig. |
| MT-58 | Dashboard-Hintergründe, Titel, Vollhöhe/Footer, Focus und Cacheersatz | Legacy-iPad, modernes Admin-Gerät, drei geprüfte Bilder, Default und zwei Custom-Dashboards plus kontrolliertes Missing-Asset-Szenario | lang | App-Konfiguration; **Light-/Climate-Writes** im Focus-Schritt nur mit Zustimmung | Anonymisierte Bilder/Assetreferenzen, Rotation/Theme/Footer. Teilweise nur Upload angesehen: kein Gesamt-PASS; unvorbereitetes Missing-Asset-Szenario: BLOCKED. |
| MT-13 | Theme-/Reload-/Rückkehr-Persistenz | Legacy-iPad, Custom-Dashboard und Summary/Errors, aktueller Cache; keine Admin-Anmeldedaten auf iPad | mittel | Keine HA-Writes | Light/Dark vor/nach Reload und HomeScreen-Neustart, exakte Route. Nicht gefordertes Gerät nicht als Ersatz-PASS verwenden. |
| MT-52 | Optional: Update, Cold Backup/Restore, Persistenz und HAOS-Reboot | Zwei kompatible veröffentlichte Versionen mit freigegebenem Wechsel, vollständiger MT-51-Testdatensatz, verifizierbarer Backup-/Restore-Rückweg, kontrollierte amd64-Testinstanz | lang | Keine Gerätesteuerung vorgeschrieben; **erhebliche Betriebs-/Datenänderungen**, ausdrücklich freigeben | Version A/B und redigierte Vorher/Nachher-Marker. Kein kompatibler Altstand bei vereinbartem Updateziel: BLOCKED; reiner Fresh-Install-Pilot ohne Updateumfang: N/A. Keinen riskanten Versionswechsel erzwingen. |
| MT-53 | Architekturspezifische aarch64-Installation; zugleich begründetes N/A auf amd64 prüfen | Echte aarch64-Testhardware, exakt veröffentlichtes arm64-Image, Test-Admin und freigegebene Test-Entities | lang (N/A-Einordnung kurz) | **Ja: zwei freigegebene Test-Entities**; Installation, Konfiguration, App-/Core-Neustart | Architektur, Version und Funktionsbeobachtung. Ausschließlich amd64 in diesem Slot: N/A, keine Produktstörung. Zugewiesene ARM-Hardware vorübergehend nicht verfügbar: BLOCKED. |

Die Tabelle ergänzt nur Sicherheits-/Auswahlhinweise. Originalschritte nicht
verkürzen und danach das ganze MT als PASS markieren. Bei Abbruch bestandene
Teilschritte und nicht ausgeführte Folgeschritte notieren; Ergebnis BLOCKED
bei fehlender Voraussetzung, FAIL bei tatsächlich beobachteter Abweichung
unter erfüllten Voraussetzungen. NOT_TESTED bleibt für nicht begonnene Tests.
N/A ist eine begründete Nichtanwendbarkeit und zählt niemals als bestanden.

## Übungsfehler ohne echte HA-Beobachtung

Das Fixture `test/fixtures/community-testing/pilot-reports.js` verwendet
dieselben offiziellen IDs, darunter einen **synthetischen FAIL bei MT-16**.
Es ist keine weitere Testdefinition und kein realer Produktfehler. Der
Koordinator erzeugt die klar markierten JSON-Dateien mit dem unten verlinkten
Validierungslauf. Zum Üben einen separaten synthetischen Bericht importieren;
keine künstlichen FAILs in einen echten Lauf übernehmen und keine öffentlichen
Dummy-Issues anlegen. Das Portal zeigt die Berichtsart, und die Auswertung
schließt `dataKind=synthetic` standardmäßig aus echten Zusammenfassungen aus.

## Ablauf und Übergabe

1. Kandidat, Zustimmung, Geräteumfang und sicherer Testbetrieb pro Slot klären.
2. Portal in aktuellem Browser öffnen; App selbst auf vorgeschriebenem Gerät testen.
3. Alias, tatsächliche App-/HA-Version, Architektur soweit bekannt, OS und
   Browser eintragen; Pilotfilter aktivieren und passende Fälle auswählen.
4. Vollständige Schritte einzeln abarbeiten, Beobachtungen speichern; bei
   fehlender Voraussetzung abbrechen und BLOCKED begründen.
5. JSON exportieren, lokal sichern, wieder öffnen/importieren und prüfen, dass
   alle gespeicherten Ergebnisse erhalten bleiben. Versionen nicht vermischen.
6. Datenschutzliste prüfen. Einen Testlauf pro Bericht über das GitHub-Formular
   melden oder JSON über einen vereinbarten Kanal an den Koordinator geben.
   Einzelne Defekte separat verlinken; keine Issue-Flut für PASS.
7. Koordinator erfasst Eingänge in [PILOT_STATUS.md](PILOT_STATUS.md), validiert
   und aggregiert gemäß [TEST_COORDINATOR.md](TEST_COORDINATOR.md). Erst nach
   mindestens zwei unabhängigen echten Berichten über Vollabnahme entscheiden.
