# Gemeinsam testen – ohne Entwicklerwissen

Öffne das [Test-Center](https://tekky85.github.io/ha-legacy-dashboard/testing/).
Die [Hilfe mit Ausfüllbeispiel](https://tekky85.github.io/ha-legacy-dashboard/testing/help.html)
erklärt den gesamten Ablauf direkt im Browser. Du brauchst zum Testen kein Git,
Codex oder GitHub-Konto. Das Test-Center läuft in einem aktuellen Browser,
während du dein Dashboard auf dem jeweils genannten Prüfgerät ausprobierst.

## Vor dem ersten Test

1. Vereinbare mit deinem Ansprechpartner, welche installierte App-Version,
   welches Gerät und welche Tests du prüfen sollst. Die App-Version steht auf
   der Informationsseite der installierten App in Home Assistant oder unten
   in der Dashboard-Verwaltung. Nicht die angebotene Updateversion oder die
   Home-Assistant-Version eintragen. Falls unklar, frage nach statt zu raten.
2. Verwende ungefährliche Testgeräte und eine getrennte vorbereitete
   Dashboardseite. Eine sichtbare Lampe oder Heizung ist nicht automatisch
   zur Steuerung freigegeben: Dein Ansprechpartner richtet das ausdrücklich ein.
   Technische Ausfälle, künstliche Zustände und Sicherungen nur mit Betreuung
   in einer sicheren Testumgebung durchführen, nie am Alltagssystem erzwingen.
3. Trage Kürzel, tatsächliche App-Version, Installationsart, Prüfgerät,
   Betriebssystem und Browser ein. Kürzel frei wählen, kein echter Name nötig.
   Weitere Versionen/Rechnerart nur nennen, wenn bekannt. „Bericht beginnen“
   speichert diese Angaben.
4. Standardmäßig siehst du zwölf einfach erklärte Prüfungen: die elf bestehenden
   Pilotprüfungen und MT-01. Andere technische Prüfungen sind über „Alle Tests“
   weiterhin erreichbar, brauchen aber Betreuung. Es gibt weiterhin insgesamt
   72 unveränderte Testnummern, keine neue Teilprüfung.
5. Lies „Das brauchst du – und wer hilft“, dann die nummerierten Schritte.
   Teste im eigenen Dashboard, nicht im Test-Center. Ein Mac ersetzt keinen
   vorgeschriebenen iPad-Test. Du musst nicht alle Prüfungen durchführen.
   Der Pilotfilter wählt nur die elf vereinbarten Prüfungen aus.

## Was trage ich ein?

- **Hat wie erwartet funktioniert:** Alle erforderlichen Schritte und Ergebnisse
  tatsächlich geprüft, nötige technische Kontrollen durch die Betreuung
  eingeschlossen. Bestätigung anhaken; bedingte entfallene Schritte begründen.
  Ein Teilerfolg ist kein vollständig erfolgreicher Test.
- **Etwas stimmt nicht:** Du hast einen Fehler beobachtet. Erwartung, tatsächliche
  Beobachtung und Reihenfolge aufschreiben. Ursache musst du nicht kennen.
  Nicht ausgeführte Folgeschritte in den Notizen nennen.
- **Ich komme nicht weiter:** Gerät, Testkarte, Vorbereitung oder verständliche
  Anleitung fehlt. Testnummer, Schrittnummer und Hindernis notieren.
- **Passt nicht zu meinem System:** Nach Absprache grundsätzlich nicht für diesen
  Lauf vorgesehen. Begründen; eine bloß fehlende Vorbereitung ist ein Hindernis.
- **Noch nicht ausprobiert:** Noch nicht durchgeführt, zählt nicht als bestanden.

Beispiel für MT-01, Schritt 3 (nur ein Ausfüllbeispiel):

- Was sollte passieren? „Einmal Plus erhöht die Zieltemperatur um einen Schritt.“
- Was ist passiert? „Plus und Minus bleiben grau, bei an und aus.“
- Was hast du gemacht? „Dashboard über das iPad-Symbol gestartet, Heizkarte
  gesucht, Minus und Plus bei eingeschaltetem und ausgeschaltetem Gerät versucht.“
- Notizen: „Schritte 4–7 danach nicht ausgeführt. Schnelles Tippen vergrößert
  außerdem die Seite.“

Wähle dafür „Etwas stimmt nicht“, nicht „Ich komme nicht weiter“: Du hast einen
konkreten Produktfehler gesehen. Fehlt dagegen nur die vorbereitete Testkarte,
ist es ein Hindernis. Auf „Dieses Ergebnis speichern“ klicken; ungespeicherte
Formulareingaben gehören noch nicht zum Bericht.

## Fortsetzen, sichern und weitergeben

1. Ergebnisse bleiben nur in diesem Browser/Profil. Regelmäßig „Bericht
   herunterladen“ wählen: Die .json-Datei ist deine Sicherung, kein Upload.
   Du musst sie nicht öffnen oder bearbeiten.
2. Zum Fortsetzen „Ich habe schon einen Bericht …“ öffnen, gespeicherten Bericht
   auswählen oder Datei laden. Vorschau prüfen und bestätigen. Andere
   Testanleitungen werden nur lesend übernommen; widersprüchliche Dateien mit
   derselben Berichtskennung überschreiben sich nicht. Originale aufbewahren.
3. Für eine andere App-Version einen neuen Bericht beginnen. Frühere Berichte
   bleiben erhalten. Übungen unter den freiwilligen Angaben ausdrücklich als
   Übung kennzeichnen; erfundene Ergebnisse zählen nicht als echte Beobachtung.
4. Bericht und Bilder vor Weitergabe auf private Namen, Adressen, Fotos,
   Zugangsdaten und ungeprüfte Protokolle prüfen. Keine Passwörter, Schlüssel
   oder .env-Dateien. Vertrauliche Belege nur über vereinbarten privaten Weg.
   Bildhinweise laden keine Bilder hoch; bereinigte Bilder separat beifügen.
5. Datenschutz bestätigen, Zusammenfassung kopieren, „Bericht auf GitHub
   abgeben“ öffnen. Zusammenfassung einfügen und geprüfte Datei anhängen.
   Lehnt GitHub .json ab, .txt/.zip anhängen oder bereinigten Inhalt als Codeblock
   einfügen. Ein Bericht kann viele Prüfungen enthalten; keine Meldung für
   jeden Erfolg.
6. Ohne GitHub-Konto oder bei Störung die Datei über den vereinbarten Weg an
   deinen Ansprechpartner geben. Nichts wird automatisch übertragen.

Bei gesperrtem oder vollem Browserspeicher sofort herunterladen, bevor du die
Seite schließt. Alte Berichte erst nach Sicherung bewusst löschen. Bei einem
App-Startfehler die Beobachtung melden; abhängige Prüfungen nicht erfinden.
Bei Test-Center-Ausfall vorhandene Dateien sichern, Zeitpunkt/Fehler notieren
und Ansprechpartner informieren. Eine garantierte Offline-App gibt es nicht.

Die technische Originalanleitung bleibt aufklappbar. Begriffe werden am Ende
der Seite erklärt. Dateiformat, technische Kennungen und bisherige Berichte
bleiben kompatibel; nicht geprüfte Ergebnisse werden niemals als bestanden
gewertet. [Pilotplan](PILOT_PLAN.de.md) und [Pilotstatus](PILOT_STATUS.md)
beschreiben Vorbereitung und tatsächliche Eingänge; die sprachliche Überarbeitung
ist kein Nachweis für reale iPad-/HAOS-Tests oder Verständlichkeit bei der Community.
