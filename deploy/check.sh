#!/bin/sh

set -eu


PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

cd "$PROJECT_DIR"


echo "Prüfe Shell-Syntax ..."

find deploy ha_legacy_dashboard \
    -type f \
    -name '*.sh' \
    -exec sh -n '{}' ';'


if [ "${SKIP_ENV_CHECK:-0}" != "1" ]; then

    if [ ! -r .env ]; then
        echo "Fehler: .env ist nicht lesbar." >&2
        exit 1
    fi

fi


echo "Prüfe JavaScript-Syntax ..."

find src test \
    -type f \
    -name '*.js' \
    -exec node --check '{}' ';'


echo "Prüfe Git-Diffs ..."

git diff --check
git diff --cached --check


echo "Starte Mock- und Integrationstests ..."

npm test


echo "Alle Deployment-Prüfungen waren erfolgreich."
