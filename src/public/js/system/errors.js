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

    var SEVERITY_FILTERS = [
        {name: "all", buttonId: "errorFilterAll", countId: "errorAllCount"},
        {name: "critical", buttonId: "errorFilterCritical", countId: "errorCriticalCount"},
        {name: "error", buttonId: "errorFilterError", countId: "errorErrorCount"},
        {name: "warning", buttonId: "errorFilterWarning", countId: "errorWarningCount"},
        {name: "info", buttonId: "errorFilterInfo", countId: "errorInfoCount"}
    ];

    var STATE_FILTERS = [
        {name: "all", buttonId: "errorStateAll", countId: "errorStateAllCount"},
        {name: "unavailable", buttonId: "errorStateUnavailable", countId: "errorUnavailableCount"},
        {name: "unknown", buttonId: "errorStateUnknown", countId: "errorUnknownCount"}
    ];

    var MAX_RENDERED_ISSUES = 200;
    var activeSeverityFilter = "all";
    var activeStateFilter = "all";
    var expandedGroups = {};
    var lastPayload = null;
    var severityFilterController = null;
    var stateFilterController = null;


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


    function issueMatches(issue) {

        return (
            activeSeverityFilter === "all" ||
            issue.severity === activeSeverityFilter
        ) && (
            activeStateFilter === "all" ||
            issue.state === activeStateFilter
        );

    }


    function groupMatches(group) {
        var index;

        if (!group.issues || group.issues.length === 0) {
            return issueMatches(group);
        }

        for (index = 0; group.issues && index < group.issues.length; index++) {
            if (issueMatches(group.issues[index])) {
                return true;
            }
        }

        return false;

    }


    function legacyGroups(groups) {

        var result = [];
        var groupIndex;
        var issueIndex;

        for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            for (
                issueIndex = 0;
                groups[groupIndex].issues &&
                    issueIndex < groups[groupIndex].issues.length;
                issueIndex++
            ) {
                var issue = groups[groupIndex].issues[issueIndex];
                var counts = {
                    critical: 0,
                    error: 0,
                    warning: 0,
                    info: 0,
                    unavailable: issue.state === "unavailable" ? 1 : 0,
                    unknown: issue.state === "unknown" ? 1 : 0
                };

                if (typeof counts[issue.severity] === "number") {
                    counts[issue.severity] = 1;
                }

                result.push({
                    id: issue.id || "legacy-" + groupIndex + "-" + issueIndex,
                    type: "standalone",
                    title: issue.title,
                    description: issue.description,
                    entityId: issue.entityId,
                    state: issue.state,
                    areaName: issue.areaName,
                    deviceName: issue.deviceName,
                    integration: issue.integration,
                    severity: issue.severity,
                    securityRelevant: issue.securityRelevant === true,
                    issueCount: 1,
                    durationSeconds: issue.durationSeconds,
                    counts: counts,
                    fixable: issue.fixable === true,
                    issues: [issue]
                });
            }
        }

        return result;

    }


    function presentationGroups(payload) {

        var groups = payload && Object.prototype.toString.call(
            payload.groups
        ) === "[object Array]"
            ? payload.groups
            : [];

        if (groups.length === 0 || groups[0].type) {
            return groups;
        }

        return legacyGroups(groups);

    }


    function filterCounts(payload) {

        var summary = payload && payload.summary
            ? payload.summary
            : {};

        if (payload && payload.filters && payload.filters.severity) {
            return payload.filters;
        }

        return {
            severity: {
                all: summary.total || 0,
                critical: summary.critical || 0,
                error: summary.error || 0,
                warning: summary.warning || 0,
                info: summary.info || 0
            },
            state: {
                all: summary.total || 0,
                unavailable: summary.unavailable || 0,
                unknown: summary.unknown || 0
            }
        };

    }


    function updateFilterButtons(counts) {

        if (severityFilterController) {
            severityFilterController.update(counts.severity);
        }
        if (stateFilterController) {
            stateFilterController.update(counts.state);
        }

    }


    function childIssueRow(issue) {

        var definition = SEVERITY[issue.severity] || SEVERITY.info;
        var row = createElement("li", "error-child");
        var title = createElement(
            "strong",
            "error-child-title",
            issue.title || issue.entityId || "Unbenannte Entity"
        );
        var details = createElement("div", "error-child-details");

        row.appendChild(title);

        if (issue.entityId && issue.entityId !== issue.title) {
            row.appendChild(
                createElement("code", "error-child-entity", issue.entityId)
            );
        }

        if (issue.state) {
            details.appendChild(
                createElement("span", "error-state", issue.state)
            );
        }

        details.appendChild(
            createElement(
                "span",
                "error-child-severity",
                definition.label
            )
        );

        if (typeof issue.durationSeconds === "number") {
            details.appendChild(
                createElement(
                    "span",
                    "error-duration",
                    formatDuration(issue.durationSeconds)
                )
            );
        }

        if (issue.securityRelevant) {
            details.appendChild(
                createElement(
                    "span",
                    "error-security",
                    "Sicherheitsrelevant"
                )
            );
        }

        row.appendChild(details);
        return row;

    }


    function renderChildren(container, group, limit) {

        var list = createElement("ul", "error-child-list");
        var rendered = 0;
        var index;

        container.innerHTML = "";

        for (
            index = 0;
            index < group.issues.length && rendered < limit;
            index++
        ) {
            if (!issueMatches(group.issues[index])) {
                continue;
            }
            list.appendChild(childIssueRow(group.issues[index]));
            rendered += 1;
        }

        container.appendChild(list);

    }


    function createDeviceCard(group, childLimit) {

        var definition = SEVERITY[group.severity] || SEVERITY.info;
        var expanded = expandedGroups[group.id] === true;
        var card = createElement(
            "article",
            "error-card error-device-card error-card-" + group.severity +
                (expanded ? " is-expanded" : "")
        );
        var header = createElement("div", "error-card-header");
        var heading = createElement(
            "h3",
            "error-card-title",
            group.title || "Gerät mit Störungen"
        );
        var severity = createElement(
            "span",
            "error-card-severity",
            definition.label
        );
        var summary = createElement("div", "error-device-summary");
        var context = [];
        var details = createElement("div", "error-device-details");
        var button = createElement(
            "button",
            "error-details-toggle",
            expanded ? "Details ausblenden" : "Details anzeigen"
        );

        button.setAttribute("type", "button");
        button.setAttribute("aria-expanded", expanded ? "true" : "false");
        details.setAttribute("aria-hidden", expanded ? "false" : "true");

        header.appendChild(heading);
        header.appendChild(severity);
        card.appendChild(header);

        summary.appendChild(
            createElement(
                "strong",
                "error-device-count",
                group.issueCount === 1
                    ? "1 Entity betroffen"
                    : group.issueCount + " Entities betroffen"
            )
        );

        if (group.areaName) {
            context.push(group.areaName);
        }
        if (group.integration) {
            context.push(group.integration);
        }
        if (context.length > 0) {
            summary.appendChild(
                createElement(
                    "span",
                    "error-device-context",
                    context.join(" \u00b7 ")
                )
            );
        }
        if (typeof group.durationSeconds === "number") {
            summary.appendChild(
                createElement(
                    "span",
                    "error-duration",
                    formatDuration(group.durationSeconds)
                )
            );
        }
        if (group.securityRelevant) {
            summary.appendChild(
                createElement(
                    "span",
                    "error-security",
                    "Sicherheitsrelevant"
                )
            );
        }

        card.appendChild(summary);
        card.appendChild(details);
        card.appendChild(button);

        if (expanded) {
            renderChildren(details, group, childLimit);
        }

        button.onclick = function () {
            var isExpanded = expandedGroups[group.id] === true;

            expandedGroups[group.id] = !isExpanded;
            card.className =
                "error-card error-device-card error-card-" +
                group.severity +
                (!isExpanded ? " is-expanded" : "");
            button.innerHTML = Legacy.html.escape(
                !isExpanded ? "Details ausblenden" : "Details anzeigen"
            );
            button.setAttribute(
                "aria-expanded",
                !isExpanded ? "true" : "false"
            );
            details.setAttribute(
                "aria-hidden",
                !isExpanded ? "false" : "true"
            );

            if (!isExpanded) {
                renderChildren(details, group, childLimit);
            } else {
                details.innerHTML = "";
            }
        };

        return card;

    }


    function createStandaloneCard(group) {

        var definition = SEVERITY[group.severity] || SEVERITY.info;
        var card = createElement(
            "article",
            "error-card error-standalone-card error-card-" + group.severity
        );
        var header = createElement("div", "error-card-header");
        var heading = createElement(
            "h3",
            "error-card-title",
            group.title || group.entityId || "Unbenannte Störung"
        );
        var severity = createElement(
            "span",
            "error-card-severity",
            definition.label
        );
        var details = createElement("div", "error-standalone-details");

        header.appendChild(heading);
        header.appendChild(severity);
        card.appendChild(header);

        if (group.description) {
            card.appendChild(
                createElement(
                    "p",
                    "error-item-description",
                    group.description
                )
            );
        }

        if (group.areaName) {
            details.appendChild(
                createElement("span", "error-area", "Raum: " + group.areaName)
            );
        }
        if (group.deviceName) {
            details.appendChild(
                createElement("span", "error-device", "Gerät: " + group.deviceName)
            );
        }
        if (group.integration) {
            details.appendChild(
                createElement(
                    "span",
                    "error-integration",
                    "Integration: " + group.integration
                )
            );
        }
        if (group.entityId) {
            details.appendChild(
                createElement("code", "error-entity-id", group.entityId)
            );
        }
        if (group.state) {
            details.appendChild(
                createElement("span", "error-state", "Status: " + group.state)
            );
        }
        if (typeof group.durationSeconds === "number") {
            details.appendChild(
                createElement(
                    "span",
                    "error-duration",
                    formatDuration(group.durationSeconds)
                )
            );
        }
        if (group.fixable) {
            details.appendChild(
                createElement(
                    "span",
                    "error-fixable",
                    "In Home Assistant reparierbar"
                )
            );
        }
        if (group.securityRelevant) {
            details.appendChild(
                createElement(
                    "span",
                    "error-security",
                    "Sicherheitsrelevant"
                )
            );
        }

        card.appendChild(details);
        return card;

    }


    function matchingIssueCount(groups) {

        var total = 0;
        var index;

        for (index = 0; index < groups.length; index++) {
            if (!groupMatches(groups[index])) {
                continue;
            }
            for (
                var issueIndex = 0;
                groups[index].issues && issueIndex < groups[index].issues.length;
                issueIndex++
            ) {
                if (issueMatches(groups[index].issues[issueIndex])) {
                    total += 1;
                }
            }
            if (!groups[index].issues || groups[index].issues.length === 0) {
                total += 1;
            }
        }

        return total;

    }


    function renderGroups(payload) {

        var groupsElement = SystemDashboard.byId("errorGroups");
        var emptyElement = SystemDashboard.byId("errorFilterEmpty");
        var groups = presentationGroups(payload);
        var totalMatching = matchingIssueCount(groups);
        var representedIssues = 0;
        var renderedCards = 0;
        var index;

        if (!groupsElement) {
            return;
        }

        groupsElement.innerHTML = "";

        for (index = 0; index < groups.length; index++) {
            var group = groups[index];
            var groupSize = 0;
            var remaining = MAX_RENDERED_ISSUES - representedIssues;
            var issueIndex;

            for (issueIndex = 0; group.issues && issueIndex < group.issues.length; issueIndex++) {
                if (issueMatches(group.issues[issueIndex])) {
                    groupSize += 1;
                }
            }
            if (!group.issues || group.issues.length === 0) {
                groupSize = 1;
            }

            if (!groupMatches(group) || remaining <= 0) {
                continue;
            }

            groupsElement.appendChild(
                group.type === "device"
                    ? createDeviceCard(group, remaining)
                    : createStandaloneCard(group)
            );

            representedIssues += Math.min(groupSize, remaining);
            renderedCards += 1;
        }

        if (emptyElement) {
            emptyElement.hidden = renderedCards !== 0;
        }

        if (totalMatching > representedIssues) {
            groupsElement.appendChild(
                createElement(
                    "p",
                    "error-more",
                    (totalMatching - representedIssues) +
                        " weitere Störungen sind in den Gesamtzahlen enthalten."
                )
            );
        }

    }


    function selectSeverityFilter(filterName) {

        activeSeverityFilter = filterName;

        if (lastPayload) {
            updateFilterButtons(filterCounts(lastPayload));
            renderGroups(lastPayload);
        }

    }


    function selectStateFilter(filterName) {

        activeStateFilter = filterName;

        if (lastPayload) {
            updateFilterButtons(filterCounts(lastPayload));
            renderGroups(lastPayload);
        }

    }


    function render(payload, connectionState) {

        var overview = SystemDashboard.byId("errorsOverview");

        if (!overview) {
            return;
        }

        lastPayload = payload;
        overview.hidden = false;

        renderOverall(payload.overallStatus || "unknown");
        updateFilterButtons(filterCounts(payload));
        renderGroups(payload);

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
        severityFilterController = SystemDashboard.createFilterController(
            SEVERITY_FILTERS,
            selectSeverityFilter
        );
        stateFilterController = SystemDashboard.createFilterController(
            STATE_FILTERS,
            selectStateFilter
        );
        SystemDashboard.createColumnController(
            "errors",
            "errorGroups",
            ["errorColumn1", "errorColumn2", "errorColumn3"]
        );
        SystemDashboard.start({
            kind: "errors",
            title: "Systemstatus",
            endpoint: "/api/system-dashboards/errors",
            emptyMessage: "Systemstatus wird aktualisiert.",
            render: render
        });
    }

}());
