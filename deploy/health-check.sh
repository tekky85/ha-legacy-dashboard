#!/bin/sh

set -eu


SERVICE_NAME=${SERVICE_NAME:-ha-legacy-dashboard.service}
BASE_URL=${BASE_URL:-http://127.0.0.1:3000}

CHECK_DIR=$(mktemp -d)


cleanup() {
    rm -rf "$CHECK_DIR"
}


trap cleanup EXIT HUP INT TERM


systemctl is-active --quiet "$SERVICE_NAME"

curl -fsS \
    -D "$CHECK_DIR/status.headers" \
    -o "$CHECK_DIR/status.json" \
    "$BASE_URL/api/status"

curl -fsS \
    -o "$CHECK_DIR/config.json" \
    "$BASE_URL/api/dashboard/config"

curl -fsS \
    -o "$CHECK_DIR/dashboard.json" \
    "$BASE_URL/api/dashboard"

curl -fsS \
    -D "$CHECK_DIR/index.headers" \
    -o /dev/null \
    "$BASE_URL/"


node -e '
const fs = require("fs");
const status = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (
    status.service !== "ha-dashboard-gateway" ||
    !status.home_assistant ||
    ["online", "offline"].indexOf(
        status.home_assistant.status
    ) === -1
) {
    throw new Error("Ungültige Statusantwort");
}
console.log("Gateway:", status.status);
console.log("Home Assistant:", status.home_assistant.status);
' "$CHECK_DIR/status.json"

node -e '
const fs = require("fs");
const config = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (!config.widgets || !config.widgets.length) {
    throw new Error("Keine Dashboard-Widgets konfiguriert");
}
console.log("Widgets:", config.widgets.length);
' "$CHECK_DIR/config.json"

node -e '
const fs = require("fs");
const dashboard = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
if (!dashboard._meta || !dashboard._meta.home_assistant) {
    throw new Error("Dashboard-Metadaten fehlen");
}
console.log("Dashboard:", dashboard._meta.home_assistant);
' "$CHECK_DIR/dashboard.json"


grep -qi \
    '^cache-control: no-store' \
    "$CHECK_DIR/status.headers"

grep -qi \
    '^x-content-type-options: nosniff' \
    "$CHECK_DIR/index.headers"

grep -qi \
    '^x-frame-options: DENY' \
    "$CHECK_DIR/index.headers"


if grep -qi '^x-powered-by:' "$CHECK_DIR/index.headers"; then
    echo "Fehler: X-Powered-By darf nicht ausgeliefert werden." >&2
    exit 1
fi


echo "Produktiver Health-Check war erfolgreich."
