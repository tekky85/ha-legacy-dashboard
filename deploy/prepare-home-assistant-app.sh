#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 TARGET_DIRECTORY" >&2
    exit 2
fi

project_path="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
source_path="$project_path/ha_legacy_dashboard"
target_path="$1"

case "$target_path" in
    ""|"/"|"$project_path")
        echo "Refusing unsafe target directory." >&2
        exit 2
        ;;
esac

mkdir -p "$target_path/translations" "$target_path/src"

cp "$source_path/config.yaml" "$target_path/config.yaml"
cp "$source_path/Dockerfile" "$target_path/Dockerfile"
cp "$source_path/.dockerignore" "$target_path/.dockerignore"
cp "$source_path/run.sh" "$target_path/run.sh"
cp "$source_path/README.md" "$target_path/README.md"
cp "$source_path/DOCS.md" "$target_path/DOCS.md"
cp "$source_path/CHANGELOG.md" "$target_path/CHANGELOG.md"
cp "$source_path/icon.png" "$target_path/icon.png"
cp "$source_path/logo.png" "$target_path/logo.png"
cp "$source_path/translations/en.yaml" "$target_path/translations/en.yaml"
cp "$source_path/translations/de.yaml" "$target_path/translations/de.yaml"
cp "$project_path/package.json" "$target_path/package.json"
cp "$project_path/package-lock.json" "$target_path/package-lock.json"
cp "$project_path/LICENSE" "$target_path/LICENSE"
cp -R "$project_path/src/." "$target_path/src/"

chmod 0755 "$target_path/run.sh"

echo "Prepared local Home Assistant App at $target_path"
