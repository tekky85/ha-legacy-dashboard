if (
    /^\/system\/summary\/?$/.test(
        window.location.pathname || ""
    )
) {
    SystemDashboard.start({
        kind: "summary",
        title: "Summary",
        endpoint: "/api/system-dashboards/summary",
        emptyMessage: "Noch keine Summary-Regeln aktiviert."
    });
}
