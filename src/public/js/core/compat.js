/*
 * HA Legacy Dashboard
 * Compatibility layer for legacy browsers.
 */

var Legacy = {

    http: {

        get: function (url, success, error) {

            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {

                if (xhr.readyState !== 4) {
                    return;
                }

                if (xhr.status === 200) {

                    try {

                        var data =
                            JSON.parse(xhr.responseText);

                        if (success) {
                            success(data);
                        }

                    } catch (exception) {

                        if (error) {
                            error(exception);
                        }

                    }

                } else {

                    if (error) {

                        error({
                            status: xhr.status,
                            message: "HTTP error"
                        });

                    }

                }

            };

            xhr.open(
                "GET",
                url,
                true
            );

            xhr.send();

        }

    },


    dom: {

        byId: function (id) {

            return document.getElementById(id);

        }

    },


    html: {

        escape: function (value) {

            if (
                value === null ||
                typeof value === "undefined"
            ) {
                return "";
            }

            return String(value)

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#39;"
                );

        }

    }

};
