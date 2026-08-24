const DASHBOARD_PATH_PATTERN =
    /^\/d\/([a-z0-9][a-z0-9-]{0,62})\/?$/;


function resolve(target, dashboardExists) {

    let match;


    if (target === "/") {
        return target;
    }


    if (typeof target !== "string") {
        return null;
    }


    match = DASHBOARD_PATH_PATTERN.exec(target);

    if (!match) {
        return null;
    }


    if (
        typeof dashboardExists !== "function" ||
        dashboardExists(match[1]) !== true
    ) {
        return null;
    }


    return target;

}


module.exports = {
    DASHBOARD_PATH_PATTERN: DASHBOARD_PATH_PATTERN,
    resolve: resolve
};
