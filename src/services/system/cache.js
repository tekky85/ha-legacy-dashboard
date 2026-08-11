const logger = require("../logger");
const Snapshot = require("./snapshot");

const DEFAULT_TTL_MS = 3000;


function createSnapshotCache(options) {

    const settings = options || {};
    const collector = settings.collector;
    const log = settings.logger || logger;
    const clock = settings.clock || Date.now;
    const ttlMs =
        Number.isFinite(settings.ttlMs) &&
        settings.ttlMs > 0
            ? settings.ttlMs
            : DEFAULT_TTL_MS;

    let cachedSnapshot = null;
    let expiresAt = 0;
    let inFlight = null;
    let lastSuccessfulSnapshot = null;
    let lastCollectionAttemptAt = null;


    if (!collector || typeof collector.collect !== "function") {
        throw new Error("System-Snapshot-Collector fehlt");
    }


    function getSnapshot() {

        const now = clock();


        if (cachedSnapshot && now < expiresAt) {

            log.info(
                "system_snapshot_cache_hit",
                {
                    stale: cachedSnapshot.stale
                }
            );

            return Promise.resolve(cachedSnapshot);

        }


        if (inFlight) {

            log.info(
                "system_snapshot_cache_hit",
                {
                    in_flight: true
                }
            );

            return inFlight;

        }


        lastCollectionAttemptAt =
            new Date(now).toISOString();

        inFlight = collector.collect()
            .then(function (snapshot) {

                lastSuccessfulSnapshot = snapshot;
                cachedSnapshot = snapshot;
                expiresAt = clock() + ttlMs;

                return cachedSnapshot;

            })
            .catch(function (error) {

                cachedSnapshot = Snapshot.createStale(
                    lastSuccessfulSnapshot,
                    new Date(clock()).toISOString(),
                    error && error.code
                        ? error.code
                        : "system_snapshot_unavailable"
                );

                expiresAt = clock() + ttlMs;

                log.warn(
                    "system_snapshot_cache_stale",
                    {
                        has_last_successful_snapshot:
                            Boolean(lastSuccessfulSnapshot),
                        error_code:
                            cachedSnapshot
                                .sources.states.error
                    }
                );

                return cachedSnapshot;

            })
            .finally(function () {
                inFlight = null;
            });


        return inFlight;

    }


    return {
        getSnapshot: getSnapshot,
        getState: function () {
            return {
                cachedSnapshot: cachedSnapshot,
                lastSuccessfulSnapshot:
                    lastSuccessfulSnapshot,
                lastCollectionAttemptAt:
                    lastCollectionAttemptAt,
                ttlMs: ttlMs
            };
        }
    };

}


module.exports = {
    DEFAULT_TTL_MS: DEFAULT_TTL_MS,
    createSnapshotCache: createSnapshotCache
};
