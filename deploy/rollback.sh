#!/bin/sh

set -eu


PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SERVICE_NAME=${SERVICE_NAME:-ha-legacy-dashboard.service}
TARGET_REVISION=${1:-}

cd "$PROJECT_DIR"


if [ -z "$TARGET_REVISION" ]; then
    echo "Verwendung: ./deploy/rollback.sh <commit-oder-tag>" >&2
    exit 2
fi


if [ -n "$(git status --porcelain)" ]; then
    echo "Fehler: Der Arbeitsbaum ist nicht sauber." >&2
    exit 1
fi


if ! git cat-file -e "$TARGET_REVISION^{commit}"; then
    echo "Fehler: Zielrevision ist kein lokaler Git-Commit." >&2
    exit 1
fi


CURRENT_REVISION=$(git rev-parse HEAD)


echo "Wechsle auf Rollback-Revision $TARGET_REVISION ..."

git switch --detach "$TARGET_REVISION"


if ! git diff --quiet \
    "$CURRENT_REVISION" \
    "$TARGET_REVISION" \
    -- package-lock.json; then

    echo "package-lock.json wurde geändert; installiere Abhängigkeiten ..."
    npm ci --omit=dev

fi


if ! ./deploy/check.sh; then
    echo "Rollback-Prüfung fehlgeschlagen." >&2
    echo "Rückkehr: git switch --detach $CURRENT_REVISION" >&2
    exit 1
fi


sudo -n systemctl restart "$SERVICE_NAME"


if ! ./deploy/health-check.sh; then
    echo "Health-Check der Rollback-Revision ist fehlgeschlagen." >&2
    echo "Rückkehr: git switch --detach $CURRENT_REVISION" >&2
    exit 1
fi


echo "Rollback erfolgreich: $(git rev-parse HEAD)"
echo "Rückkehr zu main beim nächsten Deployment erfolgt automatisch."
