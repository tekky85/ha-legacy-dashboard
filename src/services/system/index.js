const Cache = require("./cache");
const Collector = require("./collector");
const Diagnostics = require("../diagnostics");

const cache = Cache.createSnapshotCache({
    collector: Collector.createCollector({
        diagnostics: Diagnostics
    }),
    ttlMs: Cache.DEFAULT_TTL_MS
});


module.exports = {
    CACHE_TTL_MS: Cache.DEFAULT_TTL_MS,
    getDiagnosticsStatus: function () {
        return Diagnostics.getPublicStatus();
    },
    getSnapshot: function () {
        return cache.getSnapshot();
    }
};
