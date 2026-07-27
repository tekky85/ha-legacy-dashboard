var Theme = {

    storageKey: "ha-legacy-theme",

    current: "light",


    readStoredTheme: function () {

        try {

            if (window.localStorage) {

                return window.localStorage.getItem(
                    this.storageKey
                );

            }

        } catch (error) {

            return null;

        }

        return null;

    },


    storeTheme: function (name) {

        try {

            if (window.localStorage) {

                window.localStorage.setItem(
                    this.storageKey,
                    name
                );

            }

        } catch (error) {

            /*
             * Einige ältere Safari-Versionen können bei
             * LocalStorage im privaten Modus Fehler werfen.
             * Das Dashboard funktioniert trotzdem weiter.
             */

        }

    },


    updateBodyClass: function () {

        var className = document.body.className || "";

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

        document.body.className = className;

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

        this.updateBodyClass();
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


    toggle: function () {

        if (this.current === "dark") {

            this.set("light", true);

        } else {

            this.set("dark", true);

        }

    }

};
