(function (admin) {
    "use strict";

    class AdminApiError extends Error {
        constructor(message, status, code) {
            super(message);
            this.name = "AdminApiError";
            this.status = status;
            this.code = code || "request_failed";
        }
    }

    async function request(endpoint, options) {
        const settings = options || {};
        const token = admin.Auth.getToken();

        if (!token) {
            throw new AdminApiError(
                "Eine Anmeldung ist erforderlich.",
                401,
                "admin_authentication_required"
            );
        }

        const headers = {
            "Authorization": "Bearer " + token,
            "Accept": "application/json"
        };

        if (typeof settings.body !== "undefined") {
            headers["Content-Type"] = "application/json";
        }

        let response;

        try {
            response = await window.fetch(
                "/api/admin" + endpoint,
                {
                    method: settings.method || "GET",
                    headers: headers,
                    body:
                        typeof settings.body !== "undefined"
                            ? JSON.stringify(settings.body)
                            : undefined,
                    cache: "no-store",
                    credentials: "same-origin"
                }
            );
        } catch (error) {
            throw new AdminApiError(
                "Das Gateway ist nicht erreichbar.",
                0,
                "network_error"
            );
        }

        let payload = null;
        const responseText = await response.text();

        if (responseText) {
            try {
                payload = JSON.parse(responseText);
            } catch (error) {
                payload = null;
            }
        }

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                admin.Auth.clearToken();
            }

            throw new AdminApiError(
                payload && payload.message
                    ? payload.message
                    : payload && payload.error
                        ? payload.error
                        : "Die Anfrage ist fehlgeschlagen.",
                response.status,
                payload && payload.error
            );
        }

        return payload;
    }

    admin.Api = {
        AdminApiError: AdminApiError,
        getConfiguration: function () {
            return request("/config");
        },
        saveConfiguration: function (configuration) {
            return request("/config", {
                method: "PUT",
                body: configuration
            });
        },
        getEntities: function () {
            return request("/entities");
        },
        getPreview: function () {
            return request("/preview");
        },
        getDiagnosticsStatus: function () {
            return request("/system-diagnostics/status");
        },
        getLabels: function () {
            return request("/labels");
        }
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
