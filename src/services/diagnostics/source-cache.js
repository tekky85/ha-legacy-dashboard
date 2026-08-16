const logger = require("../logger");


function unsupportedResult() {
    return {
        supported: false,
        ok: false,
        stale: false,
        lastSuccessfulAt: null,
        errorCode: "unsupported",
        data: []
    };
}


function createSourceCache(options) {

    const settings = options || {};
    const name = settings.name;
    const fetchSource = settings.fetch;
    const normalize = settings.normalize || function (value) {
        return value;
    };
    const log = settings.logger || logger;
    const clock = settings.clock || Date.now;
    const ttlMs = settings.ttlMs;

    let cached = null;
    let expiresAt = 0;
    let inFlight = null;
    let lastSuccessful = null;


    function get() {

        const now = clock();

        if (cached && now < expiresAt) {
            return Promise.resolve(cached);
        }

        if (inFlight) {
            return inFlight;
        }

        log.info(name + "_refresh_started", {});

        inFlight = Promise.resolve()
            .then(fetchSource)
            .then(function (raw) {
                const collectedAt = new Date(clock()).toISOString();

                cached = {
                    supported: true,
                    ok: true,
                    stale: false,
                    lastSuccessfulAt: collectedAt,
                    errorCode: null,
                    data: normalize(raw)
                };
                lastSuccessful = cached;
                expiresAt = clock() + ttlMs;

                log.info(name + "_refresh_succeeded", {
                    item_count: Array.isArray(cached.data)
                        ? cached.data.length
                        : 0
                });

                return cached;
            })
            .catch(function (error) {
                const errorCode = error && error.code
                    ? error.code
                    : name + "_fetch_failed";

                if (errorCode === "ha_command_unsupported") {
                    cached = unsupportedResult();
                } else if (lastSuccessful) {
                    cached = {
                        supported: true,
                        ok: false,
                        stale: true,
                        lastSuccessfulAt:
                            lastSuccessful.lastSuccessfulAt,
                        errorCode: errorCode,
                        data: lastSuccessful.data
                    };
                } else {
                    cached = {
                        supported: null,
                        ok: false,
                        stale: false,
                        lastSuccessfulAt: null,
                        errorCode: errorCode,
                        data: []
                    };
                }

                expiresAt = clock() + ttlMs;

                log.warn(name + "_refresh_failed", {
                    error_code: errorCode,
                    stale: cached.stale
                });

                return cached;
            })
            .finally(function () {
                inFlight = null;
            });

        return inFlight;

    }


    return {
        get: get,
        getState: function () {
            return {
                cached: cached,
                expiresAt: expiresAt,
                inFlight: Boolean(inFlight),
                ttlMs: ttlMs
            };
        }
    };

}


module.exports = {
    createSourceCache: createSourceCache,
    unsupportedResult: unsupportedResult
};
