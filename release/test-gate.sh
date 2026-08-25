#!/bin/sh

set -eu

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
release_tag=${1:-}

cd "$project_dir"

find src test release \
    -type f \
    -name '*.js' \
    -exec node --check '{}' ';'

find deploy ha_legacy_dashboard release \
    -type f \
    -name '*.sh' \
    -exec sh -n '{}' ';'

if [ -n "$release_tag" ]; then
    node release/check-version.js --tag "$release_tag"
else
    node release/check-version.js
fi

node release/secret-scan.js
npm test

echo "Release test gate passed."
