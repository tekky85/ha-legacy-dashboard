# Deployment und Betrieb

## Ziel

Der Produktionsstand liegt im LXC unter:

```text
/home/dashboard/ha-legacy-dashboard
```

Der Dienst läuft als Benutzer `dashboard`:

```text
ha-legacy-dashboard.service
```

Die Deployment-Skripte verändern weder `.env` noch die systemd-Unit. Sie
akzeptieren keinen nicht-linearen Git-Verlauf und führen keinen Force-Push oder
`git reset --hard` aus.

## Einmalige Neustartfreigabe

Für vollständig automatisierte Deployments darf `dashboard` ausschließlich
diesen einen Dienst ohne Passwort neu starten. Die mitgelieferte Regel enthält
keine Shell und keine Platzhalter.

Im LXC zunächst die Quelldatei prüfen:

```bash
cd /home/dashboard/ha-legacy-dashboard
sudo visudo -cf deploy/sudoers/ha-legacy-dashboard
```

Danach installieren und erneut prüfen:

```bash
sudo install -o root -g root -m 0440 \
  deploy/sudoers/ha-legacy-dashboard \
  /etc/sudoers.d/ha-legacy-dashboard

sudo visudo -cf /etc/sudoers.d/ha-legacy-dashboard
```

Funktionsprüfung:

```bash
sudo -n systemctl restart ha-legacy-dashboard.service
```

## Automatisches Deployment

Als Benutzer `dashboard`:

```bash
cd /home/dashboard/ha-legacy-dashboard
./deploy/deploy.sh
```

Das Skript:

1. verweigert einen schmutzigen Arbeitsbaum,
2. wechselt bei Bedarf zurück auf `main`,
3. lädt `origin/main`,
4. akzeptiert ausschließlich einen Fast-Forward,
5. installiert Abhängigkeiten nur bei geänderter `package-lock.json`,
6. prüft alle JavaScript-Dateien,
7. führt die vollständigen Mock- und Integrationstests aus,
8. startet ausschließlich `ha-legacy-dashboard.service` neu,
9. prüft Dienst, APIs, Dashboard-Metadaten und Sicherheitsheader,
10. meldet die neue und die vorherige Revision.

## Einzelne Prüfungen

Vor einem Neustart:

```bash
./deploy/check.sh
```

Produktiver read-only Health-Check:

```bash
./deploy/health-check.sh
```

Der Health-Check akzeptiert einen erreichbaren Gateway-Prozess auch dann, wenn
Home Assistant vorübergehend `offline` meldet. Dieser Zustand wird sichtbar
ausgegeben, aber nicht mit einem defekten Gateway verwechselt.

## Rollback

Ein Rollback benötigt immer eine explizite lokale Commit-ID oder einen Tag:

```bash
./deploy/rollback.sh <commit-oder-tag>
```

Das Skript verweigert lokale Änderungen, prüft die Zielrevision und wechselt
mit `git switch --detach` auf den gewünschten Stand. Dadurch wird kein Branch
zurückgesetzt oder überschrieben. Anschließend laufen dieselben Tests, der
Dienstneustart und der Health-Check.

Das nächste erfolgreiche `./deploy/deploy.sh` wechselt automatisch zurück auf
`main`.

## Manuelles Notfallverfahren

```bash
cd /home/dashboard/ha-legacy-dashboard
git status
git fetch origin main
git merge --ff-only origin/main
./deploy/check.sh
sudo systemctl restart ha-legacy-dashboard.service
./deploy/health-check.sh
```

## Release-Tags

Tags werden erst nach erfolgreicher Prüfung auf einem sauberen `main` erzeugt:

```bash
./deploy/check.sh
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Ein veröffentlichter Tag wird nicht nachträglich verschoben oder erzwungen.

## GitHub-CI

`.github/workflows/test.yml` führt bei Pushes und Pull Requests aus:

- `npm ci`
- Syntaxprüfung aller JavaScript-Dateien
- vollständige lokale Mock- und Integrationstests

Die CI benötigt keine Home-Assistant-Zugangsdaten.

## Wall-Display-Intervall

Ohne weitere Einstellung aktualisiert das Dashboard alle fünf Sekunden. Ein
anderes Intervall kann ausschließlich im Backend in `.env` gesetzt werden:

```ini
DASHBOARD_REFRESH_INTERVAL_MS=10000
```

Erlaubt sind 3000 bis 300000 Millisekunden. Ungültige Werte fallen auf 5000
Millisekunden zurück. Nach einer Änderung ist ein Dienstneustart erforderlich.
Der Browser erhält nur den validierten Zahlenwert, keine Zugangsdaten.
