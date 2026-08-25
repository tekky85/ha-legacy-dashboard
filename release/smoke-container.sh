#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 IMAGE_REFERENCE" >&2
    exit 2
fi

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
image_reference=$1
suffix=$$
network_name="ha-legacy-release-$suffix"
mock_name="ha-legacy-mock-$suffix"
app_name="ha-legacy-app-$suffix"
check_dir=$(mktemp -d)
mock_token="ci-supervisor-token"

cleanup() {
    docker rm -f "$app_name" "$mock_name" >/dev/null 2>&1 || true
    docker network rm "$network_name" >/dev/null 2>&1 || true
    rm -rf "$check_dir"
}

trap cleanup EXIT HUP INT TERM

docker network create "$network_name" >/dev/null

docker run -d \
    --name "$mock_name" \
    --network "$network_name" \
    --network-alias supervisor \
    --entrypoint node \
    --mount "type=bind,src=$project_dir/release/mock-home-assistant.js,dst=/mock-home-assistant.js,readonly" \
    "$image_reference" \
    /mock-home-assistant.js 80 >/dev/null

docker run -d \
    --name "$app_name" \
    --network "$network_name" \
    -p 127.0.0.1::3000 \
    -e SUPERVISOR_TOKEN="$mock_token" \
    "$image_reference" >/dev/null

host_port=$(docker port "$app_name" 3000/tcp | sed -n '1s/.*://p')
if [ -z "$host_port" ]; then
    echo "Unable to resolve the smoke-test port." >&2
    exit 1
fi

attempt=1
while [ "$attempt" -le 30 ]; do
    if curl -fsS "http://127.0.0.1:$host_port/health" \
        >"$check_dir/health.json"; then
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

curl -fsS "http://127.0.0.1:$host_port/" \
    >"$check_dir/index.html"
curl -fsS "http://127.0.0.1:$host_port/js/app.js" \
    >"$check_dir/app.js"
curl -fsS "http://127.0.0.1:$host_port/api/status" \
    >"$check_dir/status.json"
docker logs "$app_name" >"$check_dir/app.log" 2>&1

node -e '
const fs = require("fs");
const health = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const status = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (health.status !== "ok") throw new Error("health check failed");
if (!status.home_assistant || status.home_assistant.status !== "online") {
    throw new Error("mock Home Assistant is not online");
}
' "$check_dir/health.json" "$check_dir/status.json"

grep -q '<main id="dashboard"' "$check_dir/index.html"
grep -q 'Legacy' "$check_dir/app.js"

if grep -F "$mock_token" "$check_dir/app.log" >/dev/null; then
    echo "Container log exposed the mock credential." >&2
    exit 1
fi

echo "Container smoke test passed against the local mock."
