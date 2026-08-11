(function () {

    var STATUS = {
        ok: {label: "OK", symbol: "\u2713"},
        warning: {label: "Warnung", symbol: "!"},
        error: {label: "Fehler", symbol: "\u00d7"},
        critical: {label: "Kritisch", symbol: "!!"},
        stale: {label: "Daten nicht aktuell", symbol: "?"},
        unknown: {label: "Unbekannt", symbol: "?"}
    };

    var SEVERITY = {
        critical: {label: "Kritisch", symbol: "!!"},
        error: {label: "Fehler", symbol: "\u00d7"},
        warning: {label: "Warnung", symbol: "!"},
        info: {label: "Info", symbol: "i"}
    };

    var MAX_RENDERED_ISSUES = 200;


    function createElement(tagName, className, text) {

        var element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }

        if (typeof text !== "undefined") {
            element.appendChild(
                document.createTextNode(String(text))
            );
        }

        return element;

    }


    function formatDuration(seconds) {

        if (typeof seconds !== "number" || seconds < 0) {
            return "Dauer unbekannt";
        }

        if (seconds < 60) {
            return "seit weniger als 1 Min.";
        }

        if (seconds < 3600) {
            return "seit " + Math.floor(seconds / 60) + " Min.";
        }

        if (seconds < 86400) {
            return "seit " + Math.floor(seconds / 3600) + " Std.";
        }

        return "seit " + Math.floor(seconds / 86400) + " Tagen";

    }


    function renderOverall(statusName) {

        var element = SystemDashboard.byId("errorOverall");
        var definition = STATUS[statusName] || STATUS.unknown;

        if (element) {
            element.className = "error-overall is-" + statusName;
        }

        SystemDashboard.setText("errorOverallSymbol", definition.symbol);
        SystemDashboard.setText("errorOverallLabel", definition.label);

    }


    function createIssue(issue) {

        var definition = SEVERITY[issue.severity] || SEVERITY.info;
        var row = createElement(
            "li",
            "error-item error-item-" + issue.severity
        );

        var badge = createElement(
            "span",
            "error-severity",
            definition.symbol
        );

        badge.setAttribute(
            "aria-label",
            "Severity " + definition.label
        );

        var body = createElement("div", "error-item-body");
        var heading = createElement("div", "error-item-heading");
        var title = createElement(
            "strong",
            "error-item-title",
            issue.title || issue.entityId || "Unbenannte Entity"
        );

        var severityLabel = createElement(
            "span",
            "error-severity-label",
            definition.label
        );

        var details = createElement("div", "error-item-details");


        heading.appendChild(title);
        heading.appendChild(severityLabel);
        body.appendChild(heading);

        if (issue.description) {
            body.appendChild(
                createElement(
                    "span",
                    "error-item-description",
                    issue.description
                )
            );
        }

        details.appendChild(
            createElement(
                "code",
                "error-entity-id",
                issue.entityId || "Unbekannte Entity"
            )
        );
        details.appendChild(
            createElement(
                "span",
                "error-state",
                "State: " + (issue.state || "unknown")
            )
        );
        details.appendChild(
            createElement(
                "span",
                "error-duration",
                formatDuration(issue.durationSeconds)
            )
        );

        if (issue.securityRelevant) {
            details.appendChild(
                createElement(
                    "span",
                    "error-security",
                    "Sicherheitsrelevant"
                )
            );
        }

        body.appendChild(details);
        row.appendChild(badge);
        row.appendChild(body);

        return row;

    }


    function render(payload, connectionState) {

        var overview = SystemDashboard.byId("errorsOverview");
        var groupsElement = SystemDashboard.byId("errorGroups");
        var summary = payload && payload.summary
            ? payload.summary
            : {};
        var groups = payload && Object.prototype.toString.call(
            payload.groups
        ) === "[object Array]"
            ? payload.groups
            : [];
        var index;
        var renderedIssues = 0;


        if (!overview || !groupsElement) {
            return;
        }

        overview.hidden = false;
        groupsElement.innerHTML = "";

        renderOverall(payload.overallStatus || "unknown");
        SystemDashboard.setText("errorCriticalCount", String(summary.critical || 0));
        SystemDashboard.setText("errorErrorCount", String(summary.error || 0));
        SystemDashboard.setText("errorWarningCount", String(summary.warning || 0));
        SystemDashboard.setText("errorInfoCount", String(summary.info || 0));
        SystemDashboard.setText("errorUnavailableCount", String(summary.unavailable || 0));
        SystemDashboard.setText("errorUnknownCount", String(summary.unknown || 0));

        for (index = 0; index < groups.length; index++) {

            if (
                !groups[index].issues ||
                groups[index].issues.length === 0 ||
                renderedIssues >= MAX_RENDERED_ISSUES
            ) {
                continue;
            }

            var section = createElement(
                "section",
                "error-group error-group-" + groups[index].severity
            );

            var heading = createElement(
                "h3",
                "error-group-title",
                groups[index].title
            );

            var list = createElement("ul", "error-list");
            var issueIndex;
            var issueLimit = Math.min(
                groups[index].issues.length,
                MAX_RENDERED_ISSUES - renderedIssues
            );


            heading.appendChild(
                createElement(
                    "span",
                    "error-group-count",
                    String(groups[index].issues.length)
                )
            );

            section.appendChild(heading);

            for (
                issueIndex = 0;
                issueIndex < issueLimit;
                issueIndex++
            ) {
                list.appendChild(
                    createIssue(groups[index].issues[issueIndex])
                );
                renderedIssues += 1;
            }

            section.appendChild(list);
            groupsElement.appendChild(section);

        }

        if (
            typeof summary.total === "number" &&
            summary.total > renderedIssues
        ) {
            groupsElement.appendChild(
                createElement(
                    "p",
                    "error-more",
                    (summary.total - renderedIssues) +
                        " weitere Störungen sind in den Gesamtzahlen enthalten."
                )
            );
        }

        if (
            connectionState === "online" ||
            connectionState === "recovered"
        ) {
            SystemDashboard.setMessage(
                (connectionState === "recovered"
                    ? "Verbindung wiederhergestellt. "
                    : "") +
                    (payload.message || "Systemstatus aktualisiert."),
                connectionState === "recovered" ? "recovered" : ""
            );
        }

    }


    if (
        /^\/system\/errors\/?$/.test(
            window.location.pathname || ""
        )
    ) {
        SystemDashboard.start({
            kind: "errors",
            title: "Systemstatus",
            endpoint: "/api/system-dashboards/errors",
            emptyMessage: "Systemstatus wird aktualisiert.",
            render: render
        });
    }

}());
