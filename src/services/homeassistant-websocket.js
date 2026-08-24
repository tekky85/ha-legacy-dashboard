const logger = require("./logger");
const Runtime = require("../config/runtime");

const DEFAULT_CONNECT_TIMEOUT_MS = 10000;
const DEFAULT_REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RECONNECT_ATTEMPTS = 5;
const DEFAULT_MAX_RECONNECT_DELAY_MS = 10000;


function websocketUrl(httpUrl) {

    try {
        return Runtime.standaloneWebSocketUrl(
            httpUrl
        );
    } catch (error) {
        throw createError(
            "ha_websocket_unavailable",
            "Ungültige Home-Assistant-URL"
        );
    }

}


function createError(code, message) {

    const error = new Error(message || code);
    error.code = code;
    return error;

}


function commandError(message) {

    const details = message && message.error
        ? message.error
        : {};

    const upstreamCode =
        typeof details.code === "string"
            ? details.code
            : "unknown_error";

    const unsupportedCodes = [
        "unknown_command",
        "not_found",
        "unsupported"
    ];

    const error = createError(
        unsupportedCodes.indexOf(upstreamCode) !== -1
            ? "ha_command_unsupported"
            : "ha_command_failed",
        "Home-Assistant-WebSocket-Command fehlgeschlagen"
    );

    error.upstreamCode = upstreamCode;
    return error;

}


function createClient(options) {

    const settings = options || {};
    const log = settings.logger || logger;
    let connection = settings.connection || null;

    if (
        !connection &&
        !settings.url &&
        !settings.homeAssistantUrl
    ) {
        connection =
            Runtime.resolveHomeAssistantConnection();
    }

    const token = settings.token ||
        (connection ? connection.token : "");

    const url = settings.url ||
        (settings.homeAssistantUrl
            ? websocketUrl(settings.homeAssistantUrl)
            : connection
                ? connection.websocketUrl
                : "");
    const WebSocketImplementation =
        settings.WebSocketImplementation || global.WebSocket;
    const connectTimeoutMs =
        Number.isFinite(settings.connectTimeoutMs)
            ? settings.connectTimeoutMs
            : DEFAULT_CONNECT_TIMEOUT_MS;
    const requestTimeoutMs =
        Number.isFinite(settings.requestTimeoutMs)
            ? settings.requestTimeoutMs
            : DEFAULT_REQUEST_TIMEOUT_MS;
    const maxReconnectAttempts =
        Number.isFinite(settings.maxReconnectAttempts)
            ? settings.maxReconnectAttempts
            : DEFAULT_MAX_RECONNECT_ATTEMPTS;
    const maxReconnectDelayMs =
        Number.isFinite(settings.maxReconnectDelayMs)
            ? settings.maxReconnectDelayMs
            : DEFAULT_MAX_RECONNECT_DELAY_MS;
    const schedule = settings.setTimeout || setTimeout;
    const cancel = settings.clearTimeout || clearTimeout;

    let socket = null;
    let connectionPromise = null;
    let connectionResolve = null;
    let connectionReject = null;
    let connectionTimer = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;
    let authenticated = false;
    let authenticationFailed = false;
    let shouldReconnect = false;
    let nextRequestId = 1;
    const pending = new Map();


    if (
        typeof token !== "string" ||
        token === "" ||
        typeof WebSocketImplementation !== "function"
    ) {
        throw createError(
            "ha_websocket_unavailable",
            "Home-Assistant-WebSocket ist nicht konfiguriert"
        );
    }


    function clearConnectionTimer() {
        if (connectionTimer !== null) {
            cancel(connectionTimer);
            connectionTimer = null;
        }
    }


    function rejectConnection(error) {
        if (connectionReject) {
            connectionReject(error);
        }
        connectionResolve = null;
        connectionReject = null;
        connectionPromise = null;
        clearConnectionTimer();
    }


    function rejectPending(error) {
        pending.forEach(function (entry) {
            cancel(entry.timer);
            entry.reject(error);
        });
        pending.clear();
    }


    function sendAuthentication() {
        try {
            socket.send(JSON.stringify({
                type: "auth",
                access_token: token
            }));
        } catch (error) {
            const connectionError = createError(
                "ha_websocket_unavailable",
                "Home-Assistant-WebSocket-Authentifizierung konnte nicht gesendet werden"
            );
            rejectConnection(connectionError);
            rejectPending(connectionError);
            if (socket && typeof socket.close === "function") {
                socket.close();
            }
        }
    }


    function parseMessage(event) {

        try {
            return JSON.parse(String(event && event.data));
        } catch (error) {
            return null;
        }

    }


    function handleMessage(event) {

        const message = parseMessage(event);

        if (!message || typeof message.type !== "string") {
            return;
        }

        if (message.type === "auth_required") {
            sendAuthentication();
            return;
        }

        if (message.type === "auth_ok") {
            authenticated = true;
            authenticationFailed = false;
            reconnectAttempts = 0;
            clearConnectionTimer();

            log.info("ha_ws_connected", {});

            if (connectionResolve) {
                connectionResolve();
            }

            connectionResolve = null;
            connectionReject = null;
            return;
        }

        if (message.type === "auth_invalid") {
            authenticationFailed = true;
            shouldReconnect = false;
            const error = createError(
                "ha_websocket_auth_failed",
                "Home-Assistant-WebSocket-Authentifizierung fehlgeschlagen"
            );

            log.warn("ha_ws_auth_failed", {});
            rejectConnection(error);
            rejectPending(error);

            if (socket && typeof socket.close === "function") {
                socket.close();
            }
            return;
        }

        if (
            message.type === "result" &&
            Number.isInteger(message.id) &&
            pending.has(message.id)
        ) {
            const entry = pending.get(message.id);
            pending.delete(message.id);
            cancel(entry.timer);

            if (message.success === true) {
                entry.resolve(message.result);
            } else {
                entry.reject(commandError(message));
            }
        }

    }


    function reconnectDelay() {
        return Math.min(
            1000 * Math.pow(2, Math.max(0, reconnectAttempts - 1)),
            maxReconnectDelayMs
        );
    }


    function scheduleReconnect() {

        if (
            reconnectTimer !== null ||
            !shouldReconnect ||
            authenticationFailed ||
            reconnectAttempts >= maxReconnectAttempts
        ) {
            return;
        }

        reconnectAttempts += 1;
        reconnectTimer = schedule(function () {
            reconnectTimer = null;
            connect().catch(function () {
                scheduleReconnect();
            });
        }, reconnectDelay());

    }


    function handleDisconnect() {

        const wasAuthenticated = authenticated;
        authenticated = false;
        socket = null;
        clearConnectionTimer();

        const error = createError(
            "ha_websocket_unavailable",
            "Home-Assistant-WebSocket-Verbindung getrennt"
        );

        rejectConnection(error);
        rejectPending(error);

        log.warn("ha_ws_disconnected", {
            authenticated: wasAuthenticated
        });

        scheduleReconnect();

    }


    function connect() {

        if (authenticated && socket) {
            return Promise.resolve();
        }

        if (connectionPromise) {
            return connectionPromise;
        }

        shouldReconnect = true;
        authenticationFailed = false;

        connectionPromise = new Promise(function (resolve, reject) {
            connectionResolve = resolve;
            connectionReject = reject;
        });

        try {
            socket = new WebSocketImplementation(url);
        } catch (error) {
            const failedConnection = connectionPromise;
            const connectionError = createError(
                "ha_websocket_unavailable",
                "Home-Assistant-WebSocket konnte nicht geöffnet werden"
            );
            rejectConnection(connectionError);
            scheduleReconnect();
            return failedConnection;
        }

        socket.addEventListener("message", handleMessage);
        socket.addEventListener("close", handleDisconnect);
        socket.addEventListener("error", function () {
            if (!authenticated) {
                rejectConnection(createError(
                    "ha_websocket_unavailable",
                    "Home-Assistant-WebSocket-Verbindungsfehler"
                ));
            }
        });

        connectionTimer = schedule(function () {
            const error = createError(
                "ha_websocket_timeout",
                "Home-Assistant-WebSocket-Verbindungs-Timeout"
            );
            rejectConnection(error);
            rejectPending(error);
            if (socket && typeof socket.close === "function") {
                socket.close();
            }
        }, connectTimeoutMs);

        return connectionPromise;

    }


    function request(command) {

        if (
            !command ||
            typeof command !== "object" ||
            typeof command.type !== "string"
        ) {
            return Promise.reject(createError(
                "ha_command_invalid",
                "Ungültiger interner WebSocket-Command"
            ));
        }

        return connect().then(function () {
            return new Promise(function (resolve, reject) {
                const id = nextRequestId;
                nextRequestId += 1;

                const timer = schedule(function () {
                    pending.delete(id);
                    reject(createError(
                        "ha_websocket_timeout",
                        "Home-Assistant-WebSocket-Command-Timeout"
                    ));
                }, requestTimeoutMs);

                pending.set(id, {
                    resolve: resolve,
                    reject: reject,
                    timer: timer
                });

                try {
                    socket.send(JSON.stringify(
                        Object.assign({id: id}, command)
                    ));
                } catch (error) {
                    cancel(timer);
                    pending.delete(id);
                    reject(createError(
                        "ha_websocket_unavailable",
                        "Home-Assistant-WebSocket-Command konnte nicht gesendet werden"
                    ));
                }
            });
        });

    }


    function close() {
        shouldReconnect = false;
        if (reconnectTimer !== null) {
            cancel(reconnectTimer);
            reconnectTimer = null;
        }
        rejectPending(createError(
            "ha_websocket_unavailable",
            "Home-Assistant-WebSocket wurde geschlossen"
        ));
        if (socket && typeof socket.close === "function") {
            socket.close();
        }
        socket = null;
        authenticated = false;
    }


    return {
        close: close,
        connect: connect,
        request: request,
        getState: function () {
            return {
                authenticated: authenticated,
                nextRequestId: nextRequestId,
                pendingRequests: pending.size,
                reconnectAttempts: reconnectAttempts
            };
        }
    };

}


module.exports = {
    DEFAULT_CONNECT_TIMEOUT_MS: DEFAULT_CONNECT_TIMEOUT_MS,
    DEFAULT_REQUEST_TIMEOUT_MS: DEFAULT_REQUEST_TIMEOUT_MS,
    createClient: createClient,
    createError: createError,
    websocketUrl: websocketUrl
};
