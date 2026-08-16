const Snapshot = require("./snapshot");
const Enrichment = require("./enrichment");


function createCollector(options) {

    const settings = options || {};
    const ha = settings.homeAssistant || require("../homeassistant");
    const log = settings.logger || require("../logger");
    const clock = settings.clock || Date.now;
    const diagnostics = settings.diagnostics || null;


    return {
        collect: async function () {

            const startedAt = clock();

            log.info(
                "system_snapshot_collection_started",
                {}
            );


            try {

                const states = await ha.getAllEntities();
                let snapshot = Snapshot.createSuccessful(
                    states,
                    new Date(clock()).toISOString()
                );

                if (
                    diagnostics &&
                    typeof diagnostics.getSnapshot === "function"
                ) {
                    try {
                        snapshot = Enrichment.attach(
                            snapshot,
                            await diagnostics.getSnapshot()
                        );
                    } catch (diagnosticError) {
                        snapshot = Enrichment.attach(
                            snapshot,
                            Enrichment.unavailable(
                                diagnosticError && diagnosticError.code
                                    ? diagnosticError.code
                                    : "metadata_unavailable"
                            )
                        );

                        log.warn(
                            "system_metadata_enrichment_failed",
                            {
                                error_code:
                                    diagnosticError && diagnosticError.code
                                        ? diagnosticError.code
                                        : "metadata_unavailable"
                            }
                        );
                    }
                }

                log.info(
                    "system_snapshot_collection_succeeded",
                    {
                        entity_count: snapshot.entities.length,
                        duration_ms:
                            Math.max(0, clock() - startedAt)
                    }
                );

                return snapshot;

            } catch (error) {

                const collectionError = new Error(
                    "Home Assistant ist nicht erreichbar"
                );

                collectionError.code =
                    "home_assistant_unavailable";

                collectionError.upstreamStatus =
                    error.response && error.response.status
                        ? error.response.status
                        : null;

                log.error(
                    "system_snapshot_collection_failed",
                    {
                        upstream_status:
                            collectionError.upstreamStatus,
                        error_type:
                            error && error.name
                                ? error.name
                                : "unknown"
                    }
                );

                throw collectionError;

            }

        }
    };

}


module.exports = {
    createCollector: createCollector
};
