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
        {name: "all", buttonId: "errorFilterAll", countId: null},
        {name: "critical", buttonId: "errorFilterCritical", countId: "errorCriticalCount"},
        {name: "error", buttonId: "errorFilterError", countId: "errorErrorCount"},
        {name: "warning", buttonId: "errorFilterWarning", countId: "errorWarningCount"},
        {name: "info", buttonId: "errorFilterInfo", countId: "errorInfoCount"}
    ];

    var STATE_FILTERS = [
        {name: "all", buttonId: "errorStateAll", countId: null},
        {name: "unavailable", buttonId: "errorStateUnavailable", countId: "errorUnavailableCount"},
        {name: "unknown", buttonId: "errorStateUnknown", countId: "errorUnknownCount"}
    ];

    var MAX_RENDERED_ISSUES = 200;
    var activeSeverityFilter = "all";
    var activeStateFilter = "all";
    var expandedGroups = {};
    var expandedAutomationImpacts = {};
    var traceSummaries = {};
    var traceSourceStatus = "unknown";
    var traceLoading = false;
    var traceLoaded = false;
    var advancedExpanded = false;
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


    function formatAge(value) {

        var parsed = Date.parse(value || "");
        var seconds;

        if (isNaN(parsed)) {
            return "Noch nie ausgelöst";
        }

        seconds = Math.max(0, Math.floor((new Date().getTime() - parsed) / 1000));

        if (seconds < 60) {
            return "Letzter Trigger: vor weniger als 1 Min.";
        }
        if (seconds < 3600) {
            return "Letzter Trigger: vor " + Math.floor(seconds / 60) + " Min.";
        }
        if (seconds < 86400) {
            return "Letzter Trigger: vor " + Math.floor(seconds / 3600) + " Std.";
        }

        return "Letzter Trigger: vor " + Math.floor(seconds / 86400) + " Tagen";

    }


    function impactConfidence(impact) {

        if (impact.confidence === "direct") {
            if (impact.reasons && impact.reasons.indexOf("device") !== -1) {
                return "Gerät direkt referenziert";
            }
            return "Entity direkt referenziert";
        }

        if (impact.confidence === "indirect") {
            if (impact.reasons && impact.reasons.indexOf("label") !== -1) {
                return "Über Label referenziert";
            }
            return "Über Area referenziert";
        }

        return "Dynamische Referenz – Analyse unvollständig";

    }


    function traceDescription(automationEntityId) {

        var trace = traceSummaries[automationEntityId];
        var latest;

        if (!trace) {
            return null;
        }

        latest = trace.summaries && trace.summaries[0];

        if (latest && latest.hasError) {
            return "Letzter Trace mit Ausführungsfehler";
        }
        if (trace.errorCount > 0) {
            return trace.errorCount + " der letzten " +
                trace.summaries.length + " Traces mit Fehler";
        }
        if (latest) {
            return latest.result === "condition_false"
                ? "Letzter Trace: Bedingung nicht erfüllt (normal)"
                : latest.result === "not_triggered"
                    ? "Letzter Trace: nicht ausgelöst (normal)"
                    : "Letzter Trace: " + latest.result;
        }

        return "Keine Trace Summary vorhanden";

    }


    function automationImpactItem(impact) {

        var item = createElement("li", "automation-impact-item");
        var title = createElement(
            "strong",
            "automation-impact-name",
            impact.name || impact.entityId
        );
        var confidence = createElement(
            "span",
            "automation-impact-confidence is-" + impact.confidence,
            impactConfidence(impact)
        );
        var traceText = traceDescription(impact.entityId);

        item.appendChild(title);
        item.appendChild(confidence);
        item.appendChild(
            createElement(
                "span",
                "automation-impact-triggered",
                formatAge(impact.lastTriggered)
            )
        );

        if (impact.disabled) {
            item.appendChild(
                createElement(
                    "span",
                    "automation-impact-disabled",
                    "Automation ist deaktiviert"
                )
            );
        } else if (!impact.available) {
            item.appendChild(
                createElement(
                    "span",
                    "automation-impact-unavailable",
                    "Automation ist nicht verfügbar"
                )
            );
        }

        if (impact.dynamicReferences) {
            item.appendChild(
                createElement(
                    "span",
                    "automation-impact-dynamic",
                    "Zusätzliche dynamische Referenzen – Analyse möglicherweise unvollständig"
                )
            );
        }

        if (traceText) {
            item.appendChild(
                createElement("span", "automation-impact-trace", traceText)
            );
        }

        return item;

    }


    function automationImpactSection(group) {

        var impacts = group.affectedAutomations || [];
        var expanded = expandedAutomationImpacts[group.id] === true;
        var section;
        var button;
        var details;
        var list;
        var index;

        if (impacts.length === 0) {
            return null;
        }

        section = createElement("section", "automation-impact");
        button = createElement(
            "button",
            "automation-impact-toggle",
            expanded ? "Automation Impact ausblenden" : "Automation Impact anzeigen"
        );
        details = createElement("div", "automation-impact-details");

        button.setAttribute("type", "button");
        button.setAttribute("aria-expanded", expanded ? "true" : "false");
        details.setAttribute("aria-hidden", expanded ? "false" : "true");

        if (expanded) {
            list = createElement("ul", "automation-impact-list");
            for (index = 0; index < impacts.length; index++) {
                list.appendChild(automationImpactItem(impacts[index]));
            }
            details.appendChild(list);
        }

        button.onclick = function () {
            expandedAutomationImpacts[group.id] = !expanded;
            if (lastPayload) {
                renderGroups(lastPayload);
            }
        };

        section.appendChild(button);
        section.appendChild(details);
        return section;

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

        if (issue.flapping) {
            details.appendChild(
                createElement(
                    "span",
                    "error-flapping",
                    "Verbindung instabil"
                )
            );
        }

        if (issue.recoveryPending) {
            details.appendChild(
                createElement(
                    "span",
                    "error-recovery-pending",
                    "Wiederherstellung wird geprüft"
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

        var impact = automationImpactSection(group);
        if (impact) {
            container.appendChild(impact);
        }

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
        if (group.deviceFailureHint) {
            summary.appendChild(
                createElement(
                    "span",
                    "error-device-failure-hint",
                    group.deviceFailureHint
                )
            );
        }
        if (group.flappingCount > 0) {
            summary.appendChild(
                createElement(
                    "span",
                    "error-flapping",
                    group.flappingCount === 1
                        ? "1 instabile Verbindung"
                        : group.flappingCount + " instabile Verbindungen"
                )
            );
        }
        if (group.recoveryPendingCount > 0) {
            summary.appendChild(
                createElement(
                    "span",
                    "error-recovery-pending",
                    "Wiederherstellung wird geprüft"
                )
            );
        }
        if (group.affectedAutomationCount > 0) {
            summary.appendChild(
                createElement(
                    "span",
                    "automation-impact-count",
                    group.affectedAutomationCount === 1
                        ? "1 Automation möglicherweise betroffen"
                        : group.affectedAutomationCount +
                            " Automationen möglicherweise betroffen"
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
        if (group.flapping) {
            details.appendChild(
                createElement("span", "error-flapping", "Verbindung instabil")
            );
        }
        if (group.recoveryPending) {
            details.appendChild(
                createElement(
                    "span",
                    "error-recovery-pending",
                    "Wiederherstellung wird geprüft"
                )
            );
        }

        if (group.affectedAutomationCount > 0) {
            details.appendChild(
                createElement(
                    "span",
                    "automation-impact-count",
                    group.affectedAutomationCount === 1
                        ? "1 Automation möglicherweise betroffen"
                        : group.affectedAutomationCount +
                            " Automationen möglicherweise betroffen"
                )
            );
        }

        card.appendChild(details);
        var impact = automationImpactSection(group);
        if (impact) {
            card.appendChild(impact);
        }
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


    function sourceLabel(source) {

        if (!source) {
            return "Unbekannt";
        }
        if (source.supported === false) {
            return "Nicht unterstützt";
        }
        if (source.stale) {
            return "Veraltet";
        }
        if (source.ok) {
            return "Verfügbar";
        }

        return "Fehler";

    }


    function traceSourceLabel() {

        if (traceLoading) {
            return "Wird geladen …";
        }
        if (traceSourceStatus === "available") {
            return "Verfügbar";
        }
        if (traceSourceStatus === "unsupported") {
            return "Nicht unterstützt";
        }
        if (traceSourceStatus === "stale") {
            return "Veraltet";
        }
        if (traceSourceStatus === "error") {
            return "Fehler";
        }

        return "Noch nicht geladen";

    }


    function affectedAutomationCount(payload) {

        var seen = {};
        var groups = presentationGroups(payload);
        var groupIndex;
        var automationIndex;

        for (groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            for (
                automationIndex = 0;
                groups[groupIndex].affectedAutomations &&
                    automationIndex < groups[groupIndex].affectedAutomations.length;
                automationIndex++
            ) {
                seen[groups[groupIndex].affectedAutomations[automationIndex].entityId] = true;
            }
        }

        return Object.keys(seen).length;

    }


    function renderAdvancedDiagnostics(payload) {

        var details = SystemDashboard.byId("advancedDiagnosticsDetails");
        var toggle = SystemDashboard.byId("advancedDiagnosticsToggle");
        var analysis = payload && payload.automationAnalysis
            ? payload.automationAnalysis
            : {};
        var meta = payload && payload.meta ? payload.meta : {};
        var sources = meta.sources || {};
        var affected = affectedAutomationCount(payload);

        SystemDashboard.setText(
            "advancedDiagnosticsSummary",
            affected === 1
                ? "1 möglicherweise betroffene Automation"
                : affected + " möglicherweise betroffene Automationen"
        );
        SystemDashboard.setText(
            "advancedAutomationInventory",
            typeof analysis.inventoryCount === "number"
                ? analysis.inventoryCount + " Automationen"
                : "Unbekannt"
        );
        SystemDashboard.setText(
            "advancedAutomationConfig",
            analysis.configStatus === "available"
                ? "Verfügbar"
                : analysis.configStatus === "unsupported"
                    ? "Nicht unterstützt"
                    : analysis.configStatus === "stale"
                        ? "Veraltet"
                        : analysis.configStatus === "unknown"
                            ? "Noch nicht geprüft"
                            : "Teilweise/Fehler"
        );
        SystemDashboard.setText(
            "advancedAutomationTrace",
            traceSourceLabel()
        );
        SystemDashboard.setText(
            "advancedAutomationDynamic",
            analysis.dynamicCount > 0
                ? analysis.dynamicCount === 1
                    ? "1 Automation – Analyse möglicherweise unvollständig"
                    : analysis.dynamicCount +
                        " Automationen – Analyse möglicherweise unvollständig"
                : "Keine erkannt"
        );
        SystemDashboard.setText(
            "advancedRegistryStatus",
            sourceLabel(sources.entityRegistry)
        );
        SystemDashboard.setText(
            "advancedRepairsStatus",
            sourceLabel(sources.repairs)
        );
        SystemDashboard.setText(
            "advancedDiagnosticsNote",
            "Read-only Diagnose. Referenzen beschreiben möglichen Impact, keine Fehlerursache."
        );

        if (details) {
            details.setAttribute(
                "aria-hidden",
                advancedExpanded ? "false" : "true"
            );
        }
        if (toggle) {
            toggle.setAttribute(
                "aria-expanded",
                advancedExpanded ? "true" : "false"
            );
        }

    }


    function loadTraceSummaries() {

        if (traceLoading || traceLoaded || !lastPayload) {
            return;
        }

        if (affectedAutomationCount(lastPayload) === 0) {
            traceLoaded = true;
            return;
        }

        traceLoading = true;
        renderAdvancedDiagnostics(lastPayload);

        Legacy.http.get(
            "/api/system-dashboards/errors/automation-traces",
            function (payload) {
                var items = payload && payload.automations
                    ? payload.automations
                    : [];
                var index;

                traceSummaries = {};
                for (index = 0; index < items.length; index++) {
                    traceSummaries[items[index].entityId] = items[index];
                }
                traceSourceStatus = payload && payload.source
                    ? payload.source.status
                    : "error";
                traceLoading = false;
                traceLoaded = true;
                renderGroups(lastPayload);
                renderAdvancedDiagnostics(lastPayload);
            },
            function () {
                traceSourceStatus = "error";
                traceLoading = false;
                renderAdvancedDiagnostics(lastPayload);
            }
        );

    }


    function initializeAdvancedDiagnostics() {

        var toggle = SystemDashboard.byId("advancedDiagnosticsToggle");
        var details = SystemDashboard.byId("advancedDiagnosticsDetails");

        if (!toggle || !details) {
            return;
        }

        toggle.onclick = function () {
            advancedExpanded = !advancedExpanded;
            details.className = "advanced-diagnostics-details" +
                (advancedExpanded ? " is-expanded" : "");
            toggle.setAttribute(
                "aria-expanded",
                advancedExpanded ? "true" : "false"
            );
            details.setAttribute(
                "aria-hidden",
                advancedExpanded ? "false" : "true"
            );

            if (advancedExpanded) {
                loadTraceSummaries();
            }
        };

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
        var counts = filterCounts(payload);
        var total = counts.severity && typeof counts.severity.all === "number"
            ? counts.severity.all
            : 0;

        if (!overview) {
            return;
        }

        lastPayload = payload;
        overview.hidden = false;

        SystemDashboard.setText(
            "systemDashboardTotal",
            connectionState === "offline"
                ? ""
                : total === 1
                    ? " · 1 Problem"
                    : " · " + total + " Probleme"
        );

        renderOverall(payload.overallStatus || "unknown");
        updateFilterButtons(counts);
        renderGroups(payload);
        renderAdvancedDiagnostics(payload);

        if (connectionState === "recovered") {
            SystemDashboard.setMessage(
                "Verbindung wiederhergestellt.",
                "recovered"
            );
        } else if (connectionState === "online") {
            SystemDashboard.setMessage(
                total === 0
                    ? (payload.message || "Keine aktuellen Probleme.")
                    : "",
                ""
            );
        }

    }


    if (
        /^\/system\/errors\/?$/.test(
            window.location.pathname || ""
        )
    ) {
        initializeAdvancedDiagnostics();
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
            title: "Errors",
            endpoint: "/api/system-dashboards/errors",
            emptyMessage: "Systemstatus wird aktualisiert.",
            render: render
        });
    }

}());
