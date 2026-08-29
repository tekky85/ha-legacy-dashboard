# iPad mini als Wall-Display-Kiosk

Stand: 29. August 2026

Diese Anleitung gilt ausdrücklich für:

- Apple iPad mini 1
- iOS 9.3.5
- mechanische Home-Taste
- HA Legacy Dashboard als vom Home-Bildschirm gestartete Web-App

Die dokumentierten iOS-Menüpfade stammen aus dem Apple-iPad-
Benutzerhandbuch für iOS 9.3. Moderne iPadOS-Anleitungen verwenden andere
Menüs und Tasten und sind deshalb keine verlässliche Schrittfolge für dieses
Gerät.

## Empfehlung

| Einsatz | Empfehlung |
|---|---|
| Ein privates Wall-Display | **Geführter Zugriff** |
| Mehrere zentral verwaltete Geräte | **Supervision + Single App Mode/App Lock über Apple Configurator oder MDM** |

Geführter Zugriff hält das iPad während einer laufenden Sitzung in einer App
und kann Hardwaretasten, Touch und Bewegung einschränken. Er ist die
praktikable Lösung für ein einzelnes Gerät, aber weder Geräteverwaltung noch
ein garantierter automatischer Kioskstart nach einem Neustart.

## 1. HomeScreen-Web-App vorbereiten

1. Die direkte LAN-Adresse des Dashboards in Safari öffnen. Für den realen
   Betrieb eine reservierte IPv4 oder einen lokalen DNS-Namen verwenden, der
   zuverlässig auf die erreichbare Adresse und Port 3000 zeigt.
2. In Safari die Teilen-Taste und danach **„Zum Home-Bildschirm“** wählen.
3. Safari schließen und HA Legacy Dashboard ausschließlich über das neue
   Symbol auf dem Home-Bildschirm starten.
4. Prüfen, dass die Web-App ohne normale Safari-Adress- und Tab-Leisten
   startet.
5. Light oder Dark wählen und einmal zwischen Standard-/Custom-Dashboard,
   Summary und Errors navigieren. Alle internen Seiten müssen im selben
   Vollbildkontext bleiben.

Sprint 25.2 stellt dafür root-relative, Same-Origin- und Same-Window-
Navigation bereit. Die Anwendung verwendet intern weder `target="_blank"`
noch `window.open()`. Diese Codeeigenschaft ersetzt den Test auf dem echten
iPad nicht.

## 2. Dauerbetrieb vor der Sitzung vorbereiten

Vor dem Start des Geführten Zugriffs:

1. Das iPad an ein für Dauerbetrieb geeignetes Netzteil anschließen.
2. Die Helligkeit so niedrig wie praktisch möglich einstellen.
3. Unter **Einstellungen > Allgemein > Automatische Sperre** für den
   beabsichtigten Dauerbetrieb **Nie** wählen.
4. Die gewünschte Ausgangsausrichtung einstellen.
5. WLAN-Empfang und Erreichbarkeit des Dashboards prüfen.

Die historische iOS-9-Dokumentation beschreibt keine separate moderne Option
„Display autom. sperren“ innerhalb des Geführten Zugriffs. Die Sleep/Wake-
Option steuert die Benutzbarkeit der Taste; sie garantiert nicht allein, dass
das Display dauerhaft eingeschaltet bleibt. Deshalb muss auf dem echten iPad
geprüft werden, dass es über einen längeren Zeitraum tatsächlich aktiv bleibt.

Dauerstrom und dauerhaftes Display können Alterung, Wärmeentwicklung und
Akkuverschleiß erhöhen. Netzteil, Kabel, Gehäusetemperatur und Akku müssen
regelmäßig kontrolliert werden.

## 3. Geführten Zugriff aktivieren und Code setzen

Auf iOS 9.3.5:

1. **Einstellungen > Allgemein > Bedienungshilfen > Geführter Zugriff**
   öffnen.
2. **Geführter Zugriff** einschalten.
3. **Codeeinstellungen** öffnen und einen eigenen Code für den Geführten
   Zugriff festlegen.
4. Den Code sicher außerhalb des iPads aufbewahren.

Der Code ist kein Admin-Token und darf nicht mit `ADMIN_TOKEN`, einem
Home-Assistant-Token oder einem Gerätecode gleichgesetzt oder im Dashboard
gespeichert werden. Das iPad mini 1 besitzt kein Touch ID; für diesen
Zielworkflow ist daher der eingerichtete Code maßgeblich.

## 4. Sitzung starten und Optionen setzen

1. HA Legacy Dashboard über das HomeScreen-Symbol öffnen.
2. Die Home-Taste dreimal kurz hintereinander drücken
   (**Home-Dreifachklick**).
3. Falls iOS eine Auswahl der Bedienungshilfen zeigt, **Geführter Zugriff**
   auswählen.
4. Vor dem ersten Start **Optionen** öffnen.
5. Keine Bildschirmbereiche einkreisen oder sperren. Solche Sperrflächen
   können nach Rotation über Navigation oder Controls liegen.
6. Die Optionen bewusst festlegen:

| iOS-9-Sitzungsoption | Empfehlung für dieses Dashboard | Wirkung |
|---|---|---|
| Standby-Taste (Sleep/Wake) | Aus | Die Taste kann die laufende Sitzung nicht normal sperren. Das ist für ein öffentlich erreichbares Wall-Display am geschlossensten. |
| Lautstärketasten | Aus | Das Dashboard benötigt derzeit keine Lautstärkesteuerung. |
| Bewegung | Ein für automatische Rotation; Aus für feste Ausrichtung | Aus verhindert den Wechsel zwischen Portrait und Landscape. Vorher in die gewünschte Ausrichtung drehen. |
| Tastaturen | Aus | Für den normalen Wall-Betrieb ist keine Tastatureingabe erforderlich. |
| Berührung | **Ein** | Muss für Summary, Errors sowie Light-/Climate-Controls aktiv bleiben. |
| Zugriffszeit | Aus | Die Kiosk-Sitzung soll nicht automatisch enden. |

7. **Starten** wählen und beim ersten Mal den eingerichteten Code bestätigen,
   falls iOS dazu auffordert.
8. Die Home-Taste einmal drücken. Die Dashboard-Web-App darf dadurch nicht
   verlassen werden.

Bei bewusst erlaubtem manuellem Standby kann die Sleep/Wake-Taste stattdessen
eingeschaltet bleiben. Das ist weniger geschlossen, erlaubt aber das Display
ohne Beenden der Sitzung schlafen und wieder aufwachen zu lassen. Beide
Varianten müssen am realen Gerät getestet werden.

## 5. Sitzung sicher beenden

1. Die Home-Taste dreimal kurz hintereinander drücken.
2. Den für Geführten Zugriff eingerichteten Code eingeben.
3. Auf dem eingeblendeten Bildschirm die Sitzung mit der dort angezeigten
   Beenden-Funktion beenden.
4. Prüfen, dass ein falscher Code die Sitzung nicht beendet.

Für den normalen Betrieb darf der Code nicht am iPad angebracht oder in der
Web-App gespeichert werden. Vor einer festen Wandmontage sollte das Beenden
einmal vollständig getestet werden, damit das Gerät später sicher gewartet
werden kann.

## 6. Verhalten bei Unterbrechungen

| Ereignis | Erwartung und Betreiberaktion | Status vor Realgerätetest |
|---|---|---|
| iPad-Neustart | Geführter Zugriff ist nicht als verlässlicher Auto-Start belegt. Gerät entsperren, HomeScreen-Web-App öffnen und Geführten Zugriff erneut starten. | offen |
| Stromverlust | Nach vollständiger Entladung gilt derselbe manuelle Wiederanlauf wie nach einem Neustart. | offen |
| WLAN-Unterbrechung | Die Anwendung soll Offline/Stale anzeigen und nach Wiederkehr erneut verbinden. WLAN und Seite bei Bedarf manuell neu laden. | offen |
| Home-Assistant-Neustart | Die Web-App soll in ihrem Kontext bleiben, Offline/Stale anzeigen und nach Verfügbarkeit wieder Daten laden. | offen |
| HA-Legacy-Dashboard-App-/Dienstneustart | Die Web-App soll den Gateway-Ausfall anzeigen und nach dem Neustart wieder verbinden. | offen |
| HomeScreen-Web-App von iOS beendet | iOS 9 kann eine Web-App aus dem Speicher entfernen. Automatisches erneutes Öffnen ist durch Geführten Zugriff nicht garantiert; manueller Start kann erforderlich sein. | offen |
| Automatische Sperre | Mit „Nie“ und Dauerstrom soll das Display aktiv bleiben; tatsächliches iOS-9.3.5-Verhalten über längere Zeit prüfen. | offen |

Geführter Zugriff darf deshalb nicht als unbeaufsichtigter Auto-Start-Kiosk
nach Reboot oder Stromausfall beschrieben werden. Wer einen garantierten,
zentral administrierten Wiederanlauf benötigt, muss den verwalteten Ansatz
prüfen.

## 7. Strengere Alternative: Supervision und Single App Mode

Apple Single App Mode beziehungsweise ein App-Lock-Payload zwingt ein
**beaufsichtigtes** Gerät in eine ausgewählte App. Apple dokumentiert für den
verwalteten Modus außerdem Einschränkungen für Home-, Sleep/Wake- und
Lautstärketasten, Touch, Bewegung und automatische Sperre. Ein aktives
App-Lock-Payload kann die gewählte App nach einem Geräteneustart wieder öffnen
und ist deshalb der strengere Kioskansatz.

Für mehrere zentral betreute Geräte lautet die Empfehlung:

```text
Supervision
-> verwalteter Vollbild-Webclip bzw. geeigneter App-Container
-> Single App Mode/App Lock über Apple Configurator oder MDM
```

Dabei gelten wichtige Grenzen:

- Supervision kann eine Vorbereitung beziehungsweise Löschung des Geräts
  erfordern. Vorher vollständig sichern.
- Aktuelle Apple-Configurator-/MDM-Menüs und heutige Enrollment-Verfahren
  dürfen nicht ungeprüft auf iOS 9 übertragen werden.
- Ob die konkret eingesetzte Configurator-/MDM-Version den iOS-9.3.5-Webclip
  als gesperrtes Ziel akzeptiert und nach Reboot korrekt startet, muss mit
  genau diesem Gerät praktisch geprüft werden.
- Ein verwalteter Webclip muss auf dieselbe direkte LAN-URL zeigen und darf
  keine Admin-Credentials enthalten.
- Für ein einzelnes privates Wall-Display ist dieser Verwaltungsaufwand nicht
  erforderlich; dort bleibt Geführter Zugriff die Empfehlung.

## 8. Sicherheitsgrenzen

Kioskmodus ist keine Anwendungsauthentifizierung. Unverändert gilt:

- Home-Assistant- und Supervisor-Tokens bleiben ausschließlich im Backend.
- Die Admin API ist standardmäßig deaktiviert und verwendet bei Aktivierung
  einen getrennten Bearer-Token.
- Auf dem iPad werden weder Admin-Token noch HA-Credentials automatisch
  hinterlegt.
- Der Guided-Access-Code ersetzt keine Admin-Autorisierung.
- Dashboard-Sichtbarkeit erteilt keine Home-Assistant-Schreibberechtigung.
- Nur die bestehenden expliziten Light-/Climate-Routen und Allowlists dürfen
  schreiben.

## 9. Manuelle Abnahme auf dem echten iPad mini

Datum, Tester, Ausrichtung und verwendete Dashboard-Version zusammen mit dem
Ergebnis notieren. Ein Punkt darf erst nach Prüfung auf dem iPad mini 1 mit
iOS 9.3.5 abgehakt werden.

- [ ] HomeScreen-Web-App startet ohne normale Safari-Leisten im Vollbild.
- [ ] Geführter Zugriff lässt sich per Home-Dreifachklick starten.
- [ ] Ein normaler Druck auf die Home-Taste verlässt das Dashboard nicht.
- [ ] Summary bleibt im selben HomeScreen-Web-App-Kontext.
- [ ] Errors bleibt im selben HomeScreen-Web-App-Kontext.
- [ ] Ein Custom Dashboard bleibt im selben HomeScreen-Web-App-Kontext.
- [ ] Rücknavigation führt zum exakten internen Ausgangs-Dashboard.
- [ ] Light-Control funktioniert mit aktivierter Berührung.
- [ ] Climate Minus, Plus und Power funktionieren mit aktivierter Berührung.
- [ ] Portrait/Landscape/Rotation verhält sich entsprechend der gewählten
      Bewegungsoption.
- [ ] Das Display bleibt mit der gewählten Auto-Lock-/Sleep-Wake-Konfiguration
      so lange aktiv wie beabsichtigt.
- [ ] Standby-Taste (Sleep/Wake) und Lautstärketasten verhalten sich wie
      konfiguriert.
- [ ] Beenden erfordert den eingerichteten Code; ein falscher Code genügt
      nicht.
- [ ] Nach WLAN-Ausfall und Wiederverbindung lädt das Dashboard wieder Daten.
- [ ] Ein Home-Assistant-Neustart wird mit Offline/Stale und anschließendem
      Reconnect verkraftet.
- [ ] Ein HA-Legacy-Dashboard-App-/Dienstneustart wird verkraftet.
- [ ] Verhalten nach Beenden und erneutem Start der HomeScreen-Web-App ist
      dokumentiert.
- [ ] Verhalten nach iPad-Neustart und nach Stromverlust ist dokumentiert;
      notwendige manuelle Schritte sind bekannt.
- [ ] Auf dem iPad sind keine Admin- oder Home-Assistant-Credentials
      gespeichert.

## 10. Quellen und Validierungsstand

- Apple, [*iPad-Benutzerhandbuch für iOS 9.3*](https://books.apple.com/mw/book/ipad-benutzerhandbuch-f%C3%BCr-ios-9-3/id1041614927):
  historische Menüpfade, HomeScreen-Webclip und Guided-Access-Ablauf.
- Apple Support, [*Geführten Zugriff mit dem iPad verwenden*](https://support.apple.com/de-de/guide/ipad/-ipada16d1374/ipados):
  Funktionsprinzip und heutige Referenz; aktuelle Menüpfade wurden nicht auf
  iOS 9 übertragen.
- Apple Platform Deployment, [*App Lock payload settings*](https://support.apple.com/guide/deployment/app-lock-payload-settings-dep80a981/web):
  verwalteter App-Lock-Ansatz und Neustartverhalten.
- Apple Configurator, [*Set Single App Mode*](https://support.apple.com/guide/apple-configurator-mac/set-single-app-mode-cadbf9c172/mac):
  Supervision als Voraussetzung.

Repositoryseitig validiert sind die Sprint-25.2-Same-Window-Navigation, die
Standalone-Metadaten und die weiterhin getrennten Sicherheitsgrenzen. Die
oben aufgeführte physische Abnahme ist mangels fernsteuerbarer iOS-9-Hardware
noch offen und darf nicht als bestanden gemeldet werden.
