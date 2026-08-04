#!/bin/sh

set -eu


PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SERVICE_NAME=${SERVICE_NAME:-ha-legacy-dashboard.service}

cd "$PROJECT_DIR"


if [ -n "$(git status --porcelain)" ]; then
    echo "Fehler: Der Arbeitsbaum ist nicht sauber." >&2
    exit 1
fi


CURRENT_BRANCH=$(git symbolic-ref --short -q HEAD || true)

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Wechsle für das Deployment auf main ..."
    git switch main
fi


PREVIOUS_REVISION=$(git rev-parse HEAD)


echo "Lade origin/main ..."

git fetch --prune origin main


if ! git merge-base --is-ancestor \
    "$PREVIOUS_REVISION" \
    origin/main; then

    echo "Fehler: origin/main ist kein Fast-Forward." >&2
    exit 1

fi


git merge --ff-only origin/main

DEPLOYED_REVISION=$(git rev-parse HEAD)


if ! git diff --quiet \
    "$PREVIOUS_REVISION" \
    "$DEPLOYED_REVISION" \
    -- package-lock.json; then

    echo "package-lock.json wurde geändert; installiere Abhängigkeiten ..."
    npm ci --omit=dev

fi


./deploy/check.sh


if ! sudo -n systemctl restart "$SERVICE_NAME"; then

    echo "Fehler: Der Dienst konnte nicht ohne Passwort neu gestartet werden." >&2
    echo "Installiere einmalig die dokumentierte sudoers-Regel." >&2
    echo "Vorherige Revision für Rollback: $PREVIOUS_REVISION" >&2
    exit 1

fi


ATTEMPT=1

while [ "$ATTEMPT" -le 10 ]; do

    if ./deploy/health-check.sh; then
        echo "Deployment erfolgreich: $DEPLOYED_REVISION"
        echo "Vorherige Revision: $PREVIOUS_REVISION"
        exit 0
    fi

    ATTEMPT=$((ATTEMPT + 1))
    sleep 1

done


echo "Fehler: Health-Check nach dem Deployment fehlgeschlagen." >&2
echo "Rollback:" >&2
echo "  ./deploy/rollback.sh $PREVIOUS_REVISION" >&2
exit 1
