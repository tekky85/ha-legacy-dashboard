# Community Test-Center – Anleitung

Das Portal ist unter
https://tekky85.github.io/ha-legacy-dashboard/testing/ öffentlich erreichbar.
Der erfolgreiche Pages-Lauf ist im Projektstatus dokumentiert. Ein GitHub-Login und Zugriff auf
das Home Assistant des Projektbetreibers sind zum Lesen/Testen nicht nötig.
Das Portal läuft unabhängig von deiner installierten App. Verwende dafür
einen aktuellen Browser; die iOS-9-Prüfung erfolgt auf dem echten iPad.

## Vorbereiten und starten

Für Sprint 27.4 zuerst den [Pilotplan](PILOT_PLAN.de.md) lesen: elf bestehende
Test-IDs, sichere Voraussetzungen und Dauerklassen. Der Koordinator bestätigt
den Kandidaten; eine Veröffentlichung beweist nicht deine installierte Version.
Im Portal „Pilot 27.4: 11 ausgewählte bestehende Tests“ aktivieren; die Originalschritte
bleiben maßgeblich. Für echte Tests „Echte manuelle Beobachtungen“ wählen.
Eine reine Berichtsübung als „Synthetischer Übungslauf“ kennzeichnen, insbesondere
einen absichtlich erzeugten FAIL. Übungsberichte sind keine echte Abnahme.

1. Erstelle eine Sicherung deiner App-Daten und bereite ein separates
   Testdashboard sowie sichere Testgeräte vor. Keine gefährlichen Geräte oder
   produktiven Sicherheitsabläufe für Fehler-/Ausfalltests verwenden.
2. Lies die installierte **HA Legacy Dashboard App-Version** auf ihrer
   Informationsseite in Home Assistant ab. Nicht mit HA Core-Version oder
   angebotener Updateversion verwechseln. Bei Standalone die verwendete
   Releaseversion feststellen. Wenn die App nicht startet, bleibt das Portal
   erreichbar und der Startfehler kann dokumentiert werden.
3. Trage im Portal einen Alias, tatsächliche Dashboard-Version,
   Installationsart, Testgerät, OS und Browser ein. HA Core-Version und
   Architektur nur angeben, wenn bekannt; keine automatische Erkennung wird
   behauptet. Optional Laufnotiz hinzufügen und „Lauf starten“ wählen.
4. Standardmäßig ist „HA App relevant“ ausgewählt. Filter nach Sprint,
   Kategorie, Gerät, Ergebnis oder ID/Titel nutzen. Lies immer die vollständigen
   Voraussetzungen; ein Filter macht einen iPad-Test nicht zum Desktop-Test.
   Release-/Stable-Aktionen führt ausschließlich der Koordinator nach Freigabe
   aus. Aus dem Portal werden keine solchen Aktionen gestartet.
5. Test öffnen und die Originalschritte in Reihenfolge auf deinem eigenen
   System ausführen. Die Anleitungen stammen aus der deutschen Warteschlange;
   technische Platzhalter müssen am Testsystem bewusst ersetzt werden.

## Ergebnisse und Fortsetzen

- PASS: tatsächlich geprüftes erwartetes Verhalten. Notizen sind optional.
- FAIL: Erwartung, tatsächliche Beobachtung und genaue Reproduktion ausfüllen.
  Beispiel: „Sollwert per Plus erhöhen“ / „beide Tasten deaktiviert bei an
  und aus“ / „Compact-Climate öffnen, einschalten, Plus tippen, ausschalten,
  nochmals Plus tippen“. Das ist eine Beobachtung, noch keine Root Cause.
- BLOCKED: Grund nennen, etwa fehlendes Testgerät, eine Voraussetzung oder ein
  bekannter Produktrepair. Bereits bestandene Teilprüfungen in den Notizen
  festhalten. Nicht ausgeführte Folgeschritte nicht als FAIL markieren.
- N/A: begründen, warum der Test für diesen Lauf nicht anwendbar ist. N/A ist
  kein bestandener Test.
- NOT_TESTED: nicht ausgeführt. Es wird kein positives Ergebnis abgeleitet.

„Ergebnis speichern“ übernimmt den Eintrag. Katalogseitiges BLOCKED oder
NOT READY ist zusätzlich sichtbar und wird nicht mit deinem Resultat vermischt.
Kein PASS für katalogseitig blockierte Tests. Notiere optional anonymisierte
Evidenzdateinamen und die spätere GitHub-Issue-Nummer. Keine Bilddaten werden
im JSON eingebettet.

Entwürfe bleiben nur in diesem Browser/Profil. „Gespeicherte Läufe“ auswählen
und „Lauf fortsetzen“ nutzen. „Neuen Lauf vorbereiten“ bewahrt alte gespeicherte
Läufe. Für eine andere Softwareversion einen neuen Lauf beginnen. Bei vollem,
gesperrtem oder privatem Browserspeicher erscheint eine Warnung: sofort JSON
exportieren, bevor die Seite geschlossen wird. Ungespeicherte Formulareingaben
sind kein gespeicherter Entwurf. „Alle lokalen Läufe löschen“ fragt vorher
nach; erst jeden benötigten Lauf exportieren.

## Exportieren, importieren und melden

1. „JSON exportieren“ lädt den validierten UTF-8-Bericht herunter. Bewahre die
   Datei als eigenes Backup auf; das Portal hat keine zentrale Datenbank.
2. Zum Weiterarbeiten „JSON importieren“ wählen (max. 2 MiB), Vorschau prüfen
   und bestätigen. Ein Katalogunterschied wird deutlich angezeigt und nur
   lesend importiert. Gleiche Run-ID mit anderem Inhalt wird nicht überschrieben:
   beide Dateien behalten und dem Koordinator geben.
3. Vor jedem öffentlichen Teilen die Datenschutzliste prüfen: Tokens,
   Passwörter, `.env`, Keys, private Entity-/Personennamen, Adressen, Fotos,
   Medieninhalte, Standorte und Logs redigieren. Bei sensiblen Belegen nur eine
   bereinigte Reproduktion öffentlich melden; private Übermittlung vorher mit
   dem Koordinator vereinbaren.
4. Datenschutzbestätigung setzen, Zusammenfassung erstellen/kopieren und
   „Testlauf auf GitHub melden“ öffnen. Zum Erstellen des öffentlichen Issues
   brauchst du ein GitHub-Konto. Das Portal legt kein Issue automatisch an.
   Einen Bericht pro Lauf senden, keine Issues für jeden PASS.
5. Zusammenfassung ins Formular einfügen, JSON anhängen. GitHub dokumentiert
   inzwischen `.json` für Kommentare; falls das Formular den Typ ablehnt:
   `.zip` oder `.txt` verwenden, alternativ bereinigtes JSON als Codeblock
   einfügen. Niemals den ganzen Bericht in eine URL schreiben.
6. Einzelne Fehler bei Bedarf im vorhandenen Bug-Formular mit Test-ID,
   Version, Run-ID/Issue, Reproduktion, Erwartung und Beobachtung verknüpfen.
   Danach Issue-Nummer beim Lauf oder Ergebnis speichern und erneut exportieren.
7. Ohne GitHub-Konto: JSON über einen vorher vereinbarten Kanal an den
   Koordinator geben. Lesen, Testen und Exportieren erfordern keinen Login.

Fotos/Screenshots stammen nur vom echten Produkt oder einer kontrollierten
Demo. Vor Weitergabe private Details prüfen; keine generierten Produktmockups.
Ein leerer/unvollständiger Lauf ist keine Freigabe und keine „100 % bestanden“.

## Wenn etwas nicht erreichbar ist

Bei App-Ausfall keine Folgetests erfinden: beobachteten Startfehler als FAIL
mit Reproduktion dokumentieren, abhängige Tests begründet BLOCKED lassen.
Bei Pages-Ausfall vorhandenen JSON-Export sichern, Zeitpunkt/Fehlermeldung
notieren und den Koordinator über den vereinbarten Kanal kontaktieren. Ohne
geladenes Portal gibt es keine garantierte Offline-App. Bei GitHub-Ausfall
bleibt der lokale Export möglich: JSON privat sichern und später übergeben.
Kein zusätzlicher Account, Passwort oder Token wird hierfür benötigt.

Neue Exporte enthalten Test-Center-Version, Katalogidentität und Exportzeit.
Ältere 1.0-Berichte ohne diese Zusatzmetadaten bleiben importierbar; Hinweise
prüfen und Originaldatei behalten. Lokaler Entwurf und Datei sind kein gemeinsames
Serverbackup. Empfang und echte Ergebnisse stehen im [Pilotstatus](PILOT_STATUS.md);
alle realen Slots starten mit NOT TESTED.
