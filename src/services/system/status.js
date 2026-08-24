const Issues = require("../issues/engine");


function number(value) {

    return Number.isFinite(value) && value >= 0
        ? value
        : 0;

}


function highestSeverity(summary) {

    if (summary.critical > 0) {
        return "critical";
    }

    if (summary.error > 0) {
        return "error";
    }

    if (summary.warning > 0) {
        return "warning";
    }

    if (summary.info > 0) {
        return "info";
    }

    return "none";

}


function build(snapshot, configuration) {

    const detected = Issues.buildIssues(
        snapshot,
        configuration
    );

    const source = detected.summary || {};

    const summary = {
        total: number(source.total),
        critical: number(source.critical),
        error: number(source.error),
        warning: number(source.warning),
        info: number(source.info)
    };


    return {
        total: summary.total,
        critical: summary.critical,
        error: summary.error,
        warning: summary.warning,
        info: summary.info,
        relevant:
            summary.critical +
            summary.error +
            summary.warning,
        highest_severity:
            highestSeverity(summary)
    };

}


module.exports = {
    build: build,
    highestSeverity: highestSeverity
};
