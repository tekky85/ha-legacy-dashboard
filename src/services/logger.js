/*
 * Minimal structured logger.
 *
 * Only explicitly supplied fields are logged. Keys that look like secrets
 * are redacted as a second line of defence.
 */

function sanitize(fields) {

    const result = {};

    Object.keys(fields || {}).forEach(function (key) {

        if (
            /token|authorization|password|secret/i
                .test(key)
        ) {

            result[key] = "[redacted]";
            return;

        }

        result[key] = fields[key];

    });

    return result;

}


function write(level, event, fields) {

    const entry = Object.assign(
        {
            timestamp: new Date().toISOString(),
            level: level,
            event: event
        },
        sanitize(fields)
    );

    const output =
        JSON.stringify(entry);

    if (level === "error") {
        console.error(output);
        return;
    }

    console.log(output);

}


module.exports = {
    error: function (event, fields) {
        write("error", event, fields);
    },
    info: function (event, fields) {
        write("info", event, fields);
    },
    warn: function (event, fields) {
        write("warn", event, fields);
    }
};
