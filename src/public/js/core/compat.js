/*
 * HA Legacy Dashboard
 * Compatibility layer for legacy browsers.
 */

var Legacy = {

    http: {

        request: function (
            method,
            url,
            payload,
            success,
            error
        ) {

            var xhr =
                new XMLHttpRequest();

            var completed =
                false;


            function finishError(details) {

                if (completed) {

                    return;

                }

                completed = true;

                if (error) {

                    error(
                        details || {}
                    );

                }

            }


            xhr.onreadystatechange =
                function () {

                    var responseData =
                        null;


                    if (

                        xhr.readyState !== 4 ||

                        completed

                    ) {

                        return;

                    }


                    if (xhr.responseText) {

                        try {

                            responseData =
                                JSON.parse(

                                    xhr.responseText

                                );

                        } catch (parseError) {

                            responseData =
                                null;

                        }

                    }


                    if (

                        xhr.status >= 200 &&

                        xhr.status < 300

                    ) {

                        completed = true;

                        if (success) {

                            success(
                                responseData
                            );

                        }

                        return;

                    }


                    finishError({

                        status:
                            xhr.status,

                        message:

                            responseData &&
                            responseData.error

                                ? responseData.error

                                : "HTTP-Fehler",

                        response:
                            responseData

                    });

                };


            xhr.onerror =
                function () {

                    finishError({

                        status: 0,

                        message:
                            "Netzwerkfehler"

                    });

                };


            xhr.ontimeout =
                function () {

                    finishError({

                        status: 0,

                        message:
                            "Zeitüberschreitung"

                    });

                };


            xhr.open(

                method,

                url,

                true

            );


            xhr.timeout =
                10000;


            xhr.setRequestHeader(

                "Accept",

                "application/json"

            );


            if (

                payload !== null &&

                typeof payload !==
                    "undefined"

            ) {

                xhr.setRequestHeader(

                    "Content-Type",

                    "application/json"

                );


                xhr.send(

                    JSON.stringify(
                        payload
                    )

                );

            } else {

                xhr.send();

            }

        },


        get: function (
            url,
            success,
            error
        ) {

            this.request(

                "GET",

                url,

                null,

                success,

                error

            );

        },


        post: function (
            url,
            payload,
            success,
            error
        ) {

            this.request(

                "POST",

                url,

                payload,

                success,

                error

            );

        }

    },


    dom: {

        byId: function (id) {

            return document
                .getElementById(id);

        }

    },


    html: {

        escape: function (value) {

            if (

                value === null ||

                typeof value ===
                    "undefined"

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
