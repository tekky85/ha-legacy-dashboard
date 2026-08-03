/*
 * Small in-memory limiter for allowlisted Home Assistant writes.
 * Read requests are not limited.
 */

const WINDOW_MS = 10000;
const MAX_WRITES = 10;

const buckets = Object.create(null);


function consume(key) {

    const now = Date.now();

    let bucket =
        buckets[key];


    if (
        !bucket ||
        now - bucket.startedAt >= WINDOW_MS
    ) {

        bucket = {
            count: 0,
            startedAt: now
        };

        buckets[key] = bucket;

    }


    if (bucket.count >= MAX_WRITES) {

        return {
            allowed: false,
            limit: MAX_WRITES,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil(
                    (
                        WINDOW_MS -
                        (now - bucket.startedAt)
                    ) / 1000
                )
            )
        };

    }


    bucket.count += 1;


    return {
        allowed: true,
        limit: MAX_WRITES,
        remaining:
            MAX_WRITES - bucket.count
    };

}


module.exports = {
    consume: consume
};
