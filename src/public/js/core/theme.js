var Theme = {

    storageKey: "ha-legacy-theme",

    current: "light",


    readStoredValue: function (key) {

        try {

            if (window.localStorage) {

                return window.localStorage.getItem(key);

            }

        } catch (error) {

            return null;

        }

        return null;

    },


    readCookieValue: function (key) {

        var cookies;
        var prefix;
        var index;
        var value;


        try {

            cookies = String(document.cookie || "").split(";");
            prefix = encodeURIComponent(key) + "=";

            for (index = 0; index < cookies.length; index++) {

                value = cookies[index].replace(/^\s+|\s+$/g, "");

                if (value.indexOf(prefix) === 0) {
                    return decodeURIComponent(
                        value.substring(prefix.length)
                    );
                }

            }

        } catch (error) {

            return null;

        }

        return null;

    },


    storeValue: function (key, value) {

        try {

            if (window.localStorage) {

                window.localStorage.setItem(key, value);

                return true;

            }

        } catch (error) {

            /* Safari private mode may reject storage writes. */

        }

        return false;

    },


    storeCookieValue: function (key, value) {

        try {

            document.cookie =
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(value) +
                "; path=/; max-age=31536000";

            return true;

        } catch (error) {

            return false;

        }

    },


    readStoredTheme: function () {

        var storedTheme =
            this.readStoredValue(this.storageKey);


        if (storedTheme === "dark" || storedTheme === "light") {
            return storedTheme;
        }

        storedTheme =
            this.readCookieValue(this.storageKey);

        return storedTheme === "dark" || storedTheme === "light"
            ? storedTheme
            : null;

    },


    storeTheme: function (name) {

        this.storeValue(this.storageKey, name);

        /*
         * Safari on older iOS versions can expose localStorage while
         * rejecting writes. The same non-sensitive preference is mirrored
         * in a root-path cookie so route changes still retain the theme.
         */
        this.storeCookieValue(this.storageKey, name);

    },


    updateElementClass: function (element) {

        var className;


        if (!element) {
            return;
        }


        className = element.className || "";

        className = className.replace(
            /(^|\s)theme-dark(?=\s|$)/g,
            " "
        );

        className = className.replace(
            /\s+/g,
            " "
        );

        className = className.replace(
            /^\s+|\s+$/g,
            ""
        );

        if (this.current === "dark") {

            if (className !== "") {
                className += " ";
            }

            className += "theme-dark";

        }

        element.className = className;

    },


    updateThemeClasses: function () {

        this.updateElementClass(
            document.documentElement
        );

        this.updateElementClass(
            document.body
        );

    },


    updateButton: function () {

        var button =
            document.getElementById("themeButton");

        var label =
            document.getElementById("themeButtonLabel");

        if (!button) {
            return;
        }

        if (this.current === "dark") {

            button.setAttribute(
                "aria-pressed",
                "true"
            );

            button.setAttribute(
                "aria-label",
                "Helle Darstellung aktivieren"
            );

            if (label) {
                label.innerHTML = "Hell";
            }

        } else {

            button.setAttribute(
                "aria-pressed",
                "false"
            );

            button.setAttribute(
                "aria-label",
                "Dunkle Darstellung aktivieren"
            );

            if (label) {
                label.innerHTML = "Dunkel";
            }

        }

    },


    set: function (name, save) {

        if (name !== "dark") {
            name = "light";
        }

        this.current = name;

        this.updateThemeClasses();
        this.updateButton();

        if (save !== false) {
            this.storeTheme(name);
        }

    },


    load: function () {

        var storedTheme =
            this.readStoredTheme();

        if (storedTheme === "dark") {

            this.set("dark", false);

        } else {

            this.set("light", false);

        }

    },


    loadEarly: function () {

        var storedTheme =
            this.readStoredTheme();


        this.current =
            storedTheme === "dark"
                ? "dark"
                : "light";

        this.updateElementClass(
            document.documentElement
        );

    },


    toggle: function () {

        if (this.current === "dark") {

            this.set("light", true);

        } else {

            this.set("dark", true);

        }

    }

};


Theme.loadEarly();
