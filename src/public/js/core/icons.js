/*
 * HA Legacy Dashboard
 * Inline SVG icon library.
 *
 * No external requests.
 * ES5 and Safari iOS 9 compatible.
 */

var LegacyIcons = {

    icons: {

        temperature:

            '<svg ' +
                'viewBox="0 0 24 24" ' +
                'aria-hidden="true" ' +
                'focusable="false"' +
            '>' +

                '<path ' +
                    'd="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0z"' +
                '></path>' +

                '<line ' +
                    'x1="10" ' +
                    'y1="8" ' +
                    'x2="10" ' +
                    'y2="16"' +
                '></line>' +

            '</svg>',


        humidity:

            '<svg ' +
                'viewBox="0 0 24 24" ' +
                'aria-hidden="true" ' +
                'focusable="false"' +
            '>' +

                '<path ' +
                    'd="M12 2.5S5.5 10 5.5 15.2a6.5 6.5 0 0 0 13 0C18.5 10 12 2.5 12 2.5z"' +
                '></path>' +

                '<path ' +
                    'd="M9 16.2a3.4 3.4 0 0 0 3 2"' +
                '></path>' +

            '</svg>',


        window:

            '<svg ' +
                'viewBox="0 0 24 24" ' +
                'aria-hidden="true" ' +
                'focusable="false"' +
            '>' +

                '<rect ' +
                    'x="3.5" ' +
                    'y="3.5" ' +
                    'width="17" ' +
                    'height="17" ' +
                    'rx="1.5"' +
                '></rect>' +

                '<line ' +
                    'x1="12" ' +
                    'y1="4" ' +
                    'x2="12" ' +
                    'y2="20"' +
                '></line>' +

                '<line ' +
                    'x1="4" ' +
                    'y1="12" ' +
                    'x2="20" ' +
                    'y2="12"' +
                '></line>' +

            '</svg>',


        sensor:

            '<svg ' +
                'viewBox="0 0 24 24" ' +
                'aria-hidden="true" ' +
                'focusable="false"' +
            '>' +

                '<circle ' +
                    'cx="12" ' +
                    'cy="12" ' +
                    'r="8"' +
                '></circle>' +

                '<circle ' +
                    'cx="12" ' +
                    'cy="12" ' +
                    'r="2"' +
                '></circle>' +

                '<line ' +
                    'x1="12" ' +
                    'y1="4" ' +
                    'x2="12" ' +
                    'y2="7"' +
                '></line>' +

            '</svg>'

    },


    get: function (name) {

        if (name && this.icons[name]) {
            return this.icons[name];
        }

        return this.icons.sensor;

    }

};
