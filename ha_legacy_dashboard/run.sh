#!/bin/sh

set -eu

OPTIONS_FILE="/data/options.json"


read_option() {
    option_name="$1"

    node -e '
const fs = require("fs");
const fileName = process.argv[1];
const optionName = process.argv[2];
let options = {};

try {
    options = JSON.parse(fs.readFileSync(fileName, "utf8"));
} catch (error) {
    if (error.code !== "ENOENT") {
        process.exit(2);
    }
}

const value = options[optionName];

if (typeof value === "boolean") {
    process.stdout.write(value ? "true" : "false");
} else if (typeof value === "string") {
    process.stdout.write(value);
}
' "$OPTIONS_FILE" "$option_name"
}


umask 077
mkdir -p /data

if [ -z "${SUPERVISOR_TOKEN:-}" ]; then
    echo "HA Legacy Dashboard cannot start: Supervisor access is unavailable." >&2
    exit 1
fi

admin_api_enabled="$(read_option admin_api_enabled)"
admin_token="$(read_option admin_token)"

if [ "$admin_api_enabled" = "true" ]; then
    if [ -z "$admin_token" ]; then
        echo "HA Legacy Dashboard cannot start: Admin API is enabled without an Admin token." >&2
        exit 1
    fi

    if [ "$admin_token" = "$SUPERVISOR_TOKEN" ]; then
        echo "HA Legacy Dashboard cannot start: Admin and Supervisor credentials must differ." >&2
        exit 1
    fi

    export ADMIN_API_ENABLED=true
    export ADMIN_TOKEN="$admin_token"
else
    export ADMIN_API_ENABLED=false
    unset ADMIN_TOKEN || true
fi

export HA_RUNTIME_MODE=home_assistant_app
export DATA_DIR=/data
export DASHBOARD_CONFIG_PATH=/data/dashboards.json
export BIND_ADDRESS=0.0.0.0
export PORT=3000

echo "HA Legacy Dashboard starting"
echo "Runtime mode: Home Assistant App"
echo "Version: ${APP_VERSION:-development}"
echo "Port: 3000"
echo "Home Assistant API: Supervisor proxy"

exec node /app/src/server.js
