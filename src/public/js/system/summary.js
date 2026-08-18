(function () {

    var ICONS = {
        security: "<path d=\"M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z\"></path><path d=\"M9 12l2 2 4-5\"></path>",
        open: "<path d=\"M4 3h12v18H4z\"></path><path d=\"M16 6l4 2v10l-4 2\"></path><circle cx=\"13\" cy=\"12\" r=\"1\"></circle>",
        running: "<path d=\"M5 12h14\"></path><path d=\"M14 7l5 5-5 5\"></path>",
        cleaning: "<circle cx=\"12\" cy=\"12\" r=\"8\"></circle><path d=\"M8 15h8M9 9h.01M15 9h.01\"></path>",
        climate: "<path d=\"M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z\"></path><path d=\"M12 9v8\"></path>",
        media: "<path d=\"M8 5v14l11-7z\"></path>",
        powered: "<path d=\"M12 2v10\"></path><path d=\"M6.3 5.7a8 8 0 1 0 11.4 0\"></path>",
        movement: "<circle cx=\"12\" cy=\"5\" r=\"2\"></circle><path d=\"M8 21l2-7-3-3 4-3 3 3 3 1M14 21l-2-7\"></path>",
        other: "<circle cx=\"5\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"19\" cy=\"12\" r=\"1\"></circle>"
    };

    var FILTERS = [
        {name: "all", buttonId: "summaryFilterAll", countId: null},
        {name: "open", buttonId: "summaryFilterOpen", countId: "summaryOpenCount"},
        {name: "powered", buttonId: "summaryFilterPowered", countId: "summaryPoweredCount"},
        {name: "active", buttonId: "summaryFilterActive", countId: "summaryActiveFilterCount"},
        {name: "climate", buttonId: "summaryFilterClimate", countId: "summaryClimateCount"},
        {name: "media", buttonId: "summaryFilterMedia", countId: "summaryMediaCount"},
        {name: "security", buttonId: "summaryFilterSecurity", countId: "summarySecurityCount"}
    ];

    var filterController = null;
    var lastPayload = null;


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
            return "";
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


    function createIcon(category) {

        var wrapper = createElement(
            "span",
            "summary-icon summary-icon-" + category
        );

        var svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML = ICONS[category] || ICONS.other;
        wrapper.appendChild(svg);

        return wrapper;

    }


    function createItem(item) {

        var row = createElement("li", "summary-item");
        var body = createElement("div", "summary-item-body");
        var heading = createElement("div", "summary-item-heading");
        var title = createElement(
            "strong",
            "summary-item-title",
            item.title || "Unbenannte Entity"
        );

        var duration = formatDuration(item.durationSeconds);


        heading.appendChild(title);

        if (duration) {
            heading.appendChild(
                createElement(
                    "span",
                    "summary-item-duration",
                    duration
                )
            );
        }

        body.appendChild(heading);

        if (item.description) {
            body.appendChild(
                createElement(
                    "span",
                    "summary-item-description",
                    item.description
                )
            );
        }

        var metadata = item.metadata || {};
        var context = createElement("div", "summary-item-context");

        if (metadata.areaName) {
            context.appendChild(
                createElement(
                    "span",
                    "summary-item-area",
                    "Raum: " + metadata.areaName
                )
            );
        }

        if (metadata.integration) {
            context.appendChild(
                createElement(
                    "span",
                    "summary-item-integration",
                    "Integration: " + metadata.integration
                )
            );
        }

        if (context.childNodes.length > 0) {
            body.appendChild(context);
        }

        row.appendChild(createIcon(item.category || "other"));
        row.appendChild(body);

        return row;

    }


    function filterDefinitions(payload) {

        return payload && Object.prototype.toString.call(
            payload.filters
        ) === "[object Array]"
            ? payload.filters
            : [];

    }


    function activeFilterDefinition(payload) {

        var definitions = filterDefinitions(payload);
        var selected = filterController
            ? filterController.getSelected()
            : "all";
        var index;

        for (index = 0; index < definitions.length; index++) {
            if (definitions[index].id === selected) {
                return definitions[index];
            }
        }

        return {
            id: "all",
            categories: []
        };

    }


    function filterCounts(payload) {

        var counts = {};
        var definitions = filterDefinitions(payload);
        var index;

        for (index = 0; index < definitions.length; index++) {
            counts[definitions[index].id] = definitions[index].count || 0;
        }

        return counts;

    }


    function categoryMatches(category, definition) {

        if (definition.id === "all") {
            return true;
        }

        return Object.prototype.toString.call(
            definition.categories
        ) === "[object Array]" &&
            definition.categories.indexOf(category) !== -1;

    }


    function renderGroups(payload) {

        var groupsElement = SystemDashboard.byId("summaryGroups");
        var emptyElement = SystemDashboard.byId("summaryFilterEmpty");
        var groups = payload && Object.prototype.toString.call(
            payload.groups
        ) === "[object Array]"
            ? payload.groups
            : [];
        var definition = activeFilterDefinition(payload);
        var renderedItems = 0;
        var index;

        if (!groupsElement) {
            return;
        }

        groupsElement.innerHTML = "";

        for (index = 0; index < groups.length; index++) {

            if (
                !groups[index].items ||
                groups[index].items.length === 0 ||
                !categoryMatches(groups[index].category, definition)
            ) {
                continue;
            }

            var section = createElement(
                "section",
                "summary-group summary-group-" + groups[index].category
            );

            var heading = createElement(
                "h3",
                "summary-group-title",
                groups[index].title
            );

            var list = createElement("ul", "summary-list");
            var itemIndex;


            heading.appendChild(
                createElement(
                    "span",
                    "summary-group-count",
                    String(groups[index].items.length)
                )
            );

            section.appendChild(heading);

            for (
                itemIndex = 0;
                itemIndex < groups[index].items.length;
                itemIndex++
            ) {
                list.appendChild(
                    createItem(groups[index].items[itemIndex])
                );
                renderedItems += 1;
            }

            section.appendChild(list);
            groupsElement.appendChild(section);

        }

        if (emptyElement) {
            emptyElement.hidden = renderedItems !== 0;
        }

    }


    function render(payload, connectionState) {

        var overview = SystemDashboard.byId("summaryOverview");
        var count = payload && typeof payload.activeCount === "number"
            ? payload.activeCount
            : 0;


        if (!overview) {
            return;
        }

        if (connectionState === "offline") {
            SystemDashboard.setText("systemDashboardTotal", "");
            overview.hidden = true;
            return;
        }

        lastPayload = payload;
        overview.hidden = false;
        SystemDashboard.setText(
            "systemDashboardTotal",
            count === 1
                ? " · 1 aktiver Zustand"
                : " · " + count + " aktive Zustände"
        );
        if (filterController) {
            filterController.update(filterCounts(payload));
        }
        renderGroups(payload);

        if (connectionState === "recovered") {
            SystemDashboard.setMessage(
                "Verbindung wiederhergestellt.",
                "recovered"
            );
        } else if (connectionState === "online") {
            SystemDashboard.setMessage(
                count === 0 ? "Keine aktiven Zustände." : "",
                ""
            );
        }

    }


    if (
        /^\/system\/summary\/?$/.test(
            window.location.pathname || ""
        )
    ) {
        filterController = SystemDashboard.createFilterController(
            FILTERS,
            function () {
                if (lastPayload) {
                    filterController.update(filterCounts(lastPayload));
                    renderGroups(lastPayload);
                }
            }
        );
        SystemDashboard.createColumnController(
            "summary",
            "summaryGroups",
            ["summaryColumn1", "summaryColumn2", "summaryColumn3"]
        );
        SystemDashboard.start({
            kind: "summary",
            title: "Summary",
            endpoint: "/api/system-dashboards/summary",
            emptyMessage: "Keine aktiven Zustände.",
            render: render
        });
    }

}());
