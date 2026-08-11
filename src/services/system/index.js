const Cache = require("./cache");
const Collector = require("./collector");

const cache = Cache.createSnapshotCache({
    collector: Collector.createCollector(),
    ttlMs: Cache.DEFAULT_TTL_MS
});


module.exports = {
    CACHE_TTL_MS: Cache.DEFAULT_TTL_MS,
    getSnapshot: function () {
        return cache.getSnapshot();
    }
};
