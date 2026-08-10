(function (admin) {
    "use strict";

    const STORAGE_KEY = "ha-legacy-dashboard-admin-token";
    let memoryToken = "";

    function readSessionToken() {
        try {
            return window.sessionStorage.getItem(STORAGE_KEY) || "";
        } catch (error) {
            return "";
        }
    }

    function removeSessionToken() {
        try {
            window.sessionStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            return;
        }
    }

    function getToken() {
        return memoryToken || readSessionToken();
    }

    function setToken(token, rememberForSession) {
        if (
            typeof token !== "string" ||
            token.length === 0 ||
            /\s/.test(token)
        ) {
            throw new Error("Bitte einen gültigen Admin-Token eingeben.");
        }

        memoryToken = token;

        if (rememberForSession) {
            try {
                window.sessionStorage.setItem(STORAGE_KEY, token);
            } catch (error) {
                removeSessionToken();
            }
        } else {
            removeSessionToken();
        }
    }

    function clearToken() {
        memoryToken = "";
        removeSessionToken();
    }

    admin.Auth = {
        getToken: getToken,
        setToken: setToken,
        clearToken: clearToken,
        hasToken: function () {
            return getToken() !== "";
        }
    };
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
