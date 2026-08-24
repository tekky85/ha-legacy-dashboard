const path = require("path");


const STANDALONE_MODE = "standalone";
const HOME_ASSISTANT_APP_MODE = "home_assistant_app";

const SUPERVISOR_REST_URL =
    "http://supervisor/core/api";

const SUPERVISOR_WEBSOCKET_URL =
    "ws://supervisor/core/websocket";


function withoutTrailingSlash(value) {

    return String(value || "")
        .replace(/\/+$/, "");

}


function standaloneWebSocketUrl(baseUrl) {

    const base = withoutTrailingSlash(baseUrl);

    if (/^https:\/\//i.test(base)) {
        return "wss://" + base.slice(8) + "/api/websocket";
    }

    if (/^http:\/\//i.test(base)) {
        return "ws://" + base.slice(7) + "/api/websocket";
    }

    throw new Error(
        "Ungültige Home-Assistant-URL"
    );

}


function detectRuntimeMode(environment) {

    const env = environment || process.env;
    const configured = String(
        env.HA_RUNTIME_MODE || ""
    ).toLowerCase();

    if (
        configured === HOME_ASSISTANT_APP_MODE ||
        configured === "app"
    ) {
        return HOME_ASSISTANT_APP_MODE;
    }

    if (configured === STANDALONE_MODE) {
        return STANDALONE_MODE;
    }

    if (configured !== "") {
        throw new Error(
            "Unbekannter Home-Assistant-Runtime-Modus"
        );
    }

    if (
        typeof env.SUPERVISOR_TOKEN === "string" &&
        env.SUPERVISOR_TOKEN !== ""
    ) {
        return HOME_ASSISTANT_APP_MODE;
    }

    return STANDALONE_MODE;

}


function resolveHomeAssistantConnection(options) {

    const settings = options || {};
    const env = settings.environment || process.env;
    const mode = detectRuntimeMode(env);

    if (mode === HOME_ASSISTANT_APP_MODE) {

        if (
            typeof env.SUPERVISOR_TOKEN !== "string" ||
            env.SUPERVISOR_TOKEN === ""
        ) {
            throw new Error(
                "Supervisor-Zugriff ist nicht konfiguriert"
            );
        }

        return {
            mode: mode,
            restBaseUrl:
                settings.supervisorRestUrl ||
                SUPERVISOR_REST_URL,
            websocketUrl:
                settings.supervisorWebSocketUrl ||
                SUPERVISOR_WEBSOCKET_URL,
            token: env.SUPERVISOR_TOKEN
        };
    }

    const homeAssistantUrl =
        withoutTrailingSlash(env.HA_URL);

    if (
        homeAssistantUrl === "" ||
        typeof env.HA_TOKEN !== "string" ||
        env.HA_TOKEN === ""
    ) {
        throw new Error(
            "HA_URL oder HA_TOKEN fehlt in der .env-Datei"
        );
    }

    return {
        mode: mode,
        restBaseUrl:
            homeAssistantUrl + "/api",
        websocketUrl:
            standaloneWebSocketUrl(homeAssistantUrl),
        token: env.HA_TOKEN
    };

}


function resolveDataDirectory(environment) {

    const env = environment || process.env;

    if (
        typeof env.DATA_DIR === "string" &&
        env.DATA_DIR !== ""
    ) {
        return path.resolve(env.DATA_DIR);
    }

    if (
        detectRuntimeMode(env) ===
        HOME_ASSISTANT_APP_MODE
    ) {
        return "/data";
    }

    return path.join(
        __dirname,
        "..",
        "..",
        "data"
    );

}


module.exports = {
    HOME_ASSISTANT_APP_MODE:
        HOME_ASSISTANT_APP_MODE,
    STANDALONE_MODE: STANDALONE_MODE,
    SUPERVISOR_REST_URL: SUPERVISOR_REST_URL,
    SUPERVISOR_WEBSOCKET_URL:
        SUPERVISOR_WEBSOCKET_URL,
    detectRuntimeMode: detectRuntimeMode,
    resolveDataDirectory: resolveDataDirectory,
    resolveHomeAssistantConnection:
        resolveHomeAssistantConnection,
    standaloneWebSocketUrl:
        standaloneWebSocketUrl
};
