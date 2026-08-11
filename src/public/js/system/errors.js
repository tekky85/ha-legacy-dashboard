if (
    /^\/system\/errors\/?$/.test(
        window.location.pathname || ""
    )
) {
    SystemDashboard.start({
        kind: "errors",
        title: "Systemstatus",
        endpoint: "/api/system-dashboards/errors",
        emptyMessage: "Noch keine Fehlerauswertung aktiviert."
    });
}
