(function () {
    "use strict";

    var VALID_TIERS = [
        "compact",
        "standard",
        "wide",
        "tall",
        "large"
    ];


    function queryValue(name) {
        var expression = new RegExp(
            "(?:^|&)" + name + "=([^&]*)"
        );
        var match = expression.exec(
            window.location.search.replace(/^\?/, "")
        );

        return match
            ? decodeURIComponent(match[1])
            : "";
    }


    function widgetFor(entry) {
        var config = {
            id: entry.id,
            type: entry.type,
            entity: entry.type === "binary"
                ? "binary_sensor.matrix"
                : entry.type === "room"
                    ? ""
                    : entry.type + ".matrix",
            title: entry.state.title,
            subtitle: entry.state.subtitle,
            icon: entry.type === "binary"
                ? "window"
                : entry.type,
            iconClass: "",
            unit: entry.state.unit || "",
            size: "normal"
        };

        if (entry.type === "room") {
            config.icon = "room";
            config.room = entry.state.room;
            return new RoomWidget(config);
        }

        if (entry.type === "sensor") {
            return new SensorWidget(config);
        }
        if (entry.type === "binary") {
            return new BinaryWidget(config);
        }
        if (entry.type === "light") {
            return new LightWidget(config);
        }
        return new ClimateWidget(config);
    }


    function selectedCases() {
        var type = queryValue("type");
        var profile = queryValue("profile");
        var state = queryValue("state");

        return CardMatrixFixtures.cases().filter(function (entry) {
            return (
                (!type || entry.type === type) &&
                (!profile || entry.profile === profile) &&
                (!state || entry.state.id === state)
            );
        });
    }


    function renderCase(entry) {
        var profile =
            CardMatrixFixtures.PROFILES[entry.profile];
        var geometry =
            LegacyPresentation.calculateGridGeometry(
                profile.canvasWidth,
                profile.columns
            );
        var width =
            entry.size.w * geometry.columnWidth -
            geometry.gutter;
        var height =
            entry.size.h * geometry.rowHeight -
            geometry.gutter;
        var widget = widgetFor(entry);
        var hints = LegacyPresentation.getHints(
            widget,
            entry.state.data
        );
        var tier = LegacyPresentation.getMode(
            widget,
            entry.size.w,
            entry.size.h,
            width,
            height,
            hints
        );
        var fixture = document.createElement("article");
        var label = document.createElement("span");
        var card;

        fixture.className =
            "matrix-case grid grid-layout-active";
        fixture.setAttribute("data-case-id", entry.id);
        fixture.setAttribute("data-type", entry.type);
        fixture.setAttribute("data-tier", tier);
        fixture.innerHTML = entry.type === "room"
            ? widget.render(entry.state.data, entry.state.alerts || [])
            : widget.render(entry.state.data);

        card = fixture.getElementsByClassName("card")[0];
        card.className += " card-presentation-" + tier;
        card.style.width = width + "px";
        card.style.height = height + "px";
        card.style.minHeight = "0";

        fixture.style.width = width + "px";
        fixture.style.height = height + 18 + "px";

        label.className = "matrix-case-label";
        label.appendChild(document.createTextNode(
            entry.id + " · " + tier +
            " · " + Math.round(width) + "×" +
            Math.round(height) + "px"
        ));
        fixture.appendChild(label);

        return fixture;
    }


    function visible(element) {
        var style = window.getComputedStyle(element);
        var bounds = element.getBoundingClientRect();

        return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            bounds.width > 0 &&
            bounds.height > 0
        );
    }


    function addFailure(failures, fixture, code, detail) {
        var entry = fixture._matrixEntry;

        failures.push({
            caseId: fixture.getAttribute("data-case-id"),
            type: fixture.getAttribute("data-type"),
            profile: entry ? entry.profile : "",
            size: entry ? entry.size.w + "x" + entry.size.h : "",
            state: entry ? entry.state.id : "",
            code: code,
            detail: detail || ""
        });
    }


    function failureSummary(failures) {
        var summary = {};
        var index;
        var key;

        for (index = 0; index < failures.length; index += 1) {
            key = failures[index].code + ":" + failures[index].type + ":" +
                failures[index].profile + ":" + failures[index].size + ":" +
                failures[index].state;
            summary[key] = (summary[key] || 0) + 1;
        }
        return summary;
    }


    function analyzeFixture(fixture, failures) {
        var card = fixture.getElementsByClassName("card")[0];
        var type = fixture.getAttribute("data-type");
        var entry = fixture._matrixEntry;
        var expectedControls =
            CardMatrixFixtures.expectedControlCount(entry);
        var controls = card.querySelectorAll(
            ".climate-control, .dashboard-control-power"
        );
        var identity = card.querySelectorAll(
            type === "room" ? ".room-title" : ".card-identity"
        );
        var tierClasses = [];
        var semantic;
        var cardBounds;
        var index;
        var bounds;
        var background;
        var shouldHaveBackground;
        var shouldBeExpanded;

        VALID_TIERS.forEach(function (tier) {
            if (
                (" " + card.className + " ").indexOf(
                    " card-presentation-" + tier + " "
                ) !== -1
            ) {
                tierClasses.push(tier);
            }
        });

        if (tierClasses.length !== 1) {
            addFailure(
                failures,
                fixture,
                "invalid-tier",
                tierClasses.join(",")
            );
        }

        if (controls.length < expectedControls) {
            addFailure(
                failures,
                fixture,
                "missing-control",
                controls.length + "/" + expectedControls
            );
        } else if (controls.length > expectedControls) {
            addFailure(
                failures,
                fixture,
                "duplicate-control",
                controls.length + "/" + expectedControls
            );
        }

        if (identity.length !== 1) {
            addFailure(
                failures,
                fixture,
                identity.length > 1
                    ? "duplicate-identity"
                    : "missing-identity",
                String(identity.length)
            );
        }

        if (type === "room") {
            shouldHaveBackground = Boolean(
                entry.state.room.background
            );
            background = card.getElementsByClassName(
                "room-background-image"
            );
            if (
                shouldHaveBackground &&
                (
                    !background.length ||
                    window.getComputedStyle(background[0]).backgroundImage === "none"
                )
            ) {
                addFailure(
                    failures,
                    fixture,
                    "runtime-background-missing"
                );
            } else if (!shouldHaveBackground && background.length) {
                addFailure(
                    failures,
                    fixture,
                    "unexpected-background"
                );
            }

            shouldBeExpanded = entry.state.room.defaultExpanded === true;
            if (
                (shouldBeExpanded && card.className.indexOf("is-expanded") === -1) ||
                (!shouldBeExpanded && card.className.indexOf("is-collapsed") === -1)
            ) {
                addFailure(
                    failures,
                    fixture,
                    "room-state",
                    shouldBeExpanded ? "expanded" : "collapsed"
                );
            }
        }

        if (
            card.scrollWidth > card.clientWidth + 1 ||
            card.scrollHeight > card.clientHeight + 1
        ) {
            addFailure(
                failures,
                fixture,
                "overflow",
                card.scrollWidth + "×" + card.scrollHeight +
                "/" + card.clientWidth + "×" + card.clientHeight
            );
        }

        cardBounds = card.getBoundingClientRect();
        semantic = card.querySelectorAll(
            ".card-header, .value, .status, .card-identity, " +
            ".light-control-row, .climate-values, .climate-target-row, " +
            ".room-header, .room-primary-values, .room-status-line, .room-alerts"
        );

        for (index = 0; index < semantic.length; index += 1) {
            if (!visible(semantic[index])) {
                continue;
            }

            /* Expanded Room Cards intentionally expose their detail content
             * through the bounded .room-content scroll area. Content below
             * the current scroll viewport is reachable, not clipped. */
            if (
                type === "room" &&
                (" " + card.className + " ").indexOf(" is-expanded ") !== -1
            ) {
                continue;
            }

            bounds = semantic[index].getBoundingClientRect();
            if (
                bounds.left < cardBounds.left - 1 ||
                bounds.right > cardBounds.right + 1 ||
                bounds.top < cardBounds.top - 1 ||
                bounds.bottom > cardBounds.bottom + 1
            ) {
                addFailure(
                    failures,
                    fixture,
                    "clipped-content",
                    semantic[index].className + "@" +
                        Math.round(bounds.left) + "," +
                        Math.round(bounds.top) + "," +
                        Math.round(bounds.right) + "," +
                        Math.round(bounds.bottom) + "/" +
                        Math.round(cardBounds.left) + "," +
                        Math.round(cardBounds.top) + "," +
                        Math.round(cardBounds.right) + "," +
                        Math.round(cardBounds.bottom)
                );
            }
        }

        for (index = 0; index < controls.length; index += 1) {
            if (!visible(controls[index])) {
                continue;
            }

            bounds = controls[index].getBoundingClientRect();
            if (bounds.width < 43.5 || bounds.height < 43.5) {
                addFailure(
                    failures,
                    fixture,
                    "touch-target",
                    Math.round(bounds.width) + "×" +
                    Math.round(bounds.height)
                );
            }
        }
    }


    function run() {
        var board = document.getElementById("matrix-board");
        var result = document.getElementById("matrix-result");
        var cases = selectedCases();
        var failures = [];
        var tiers = {};

        cases.forEach(function (entry) {
            var fixture = renderCase(entry);

            fixture._matrixEntry = entry;
            board.appendChild(fixture);
        });

        Dashboard.applyRoomAppearances(board);

        window.setTimeout(function () {
            var fixtures = board.getElementsByClassName("matrix-case");
            var index;

            for (index = 0; index < fixtures.length; index += 1) {
                analyzeFixture(fixtures[index], failures);
                tiers[fixtures[index].getAttribute("data-tier")] = true;
            }

            window.CardMatrixResult = {
                cases: cases.length,
                failures: failures,
                tiers: Object.keys(tiers).sort()
            };

            document.body.setAttribute(
                "data-matrix-status",
                failures.length ? "failed" : "passed"
            );
            document.body.setAttribute(
                "data-matrix-cases",
                String(cases.length)
            );
            document.body.setAttribute(
                "data-matrix-failures",
                String(failures.length)
            );
            document.body.setAttribute(
                "data-matrix-diagnostics",
                encodeURIComponent(JSON.stringify(failures.slice(0, 50)))
            );
            document.body.setAttribute(
                "data-matrix-failure-summary",
                encodeURIComponent(JSON.stringify(failureSummary(failures)))
            );
            result.textContent = JSON.stringify(
                window.CardMatrixResult,
                null,
                2
            );
        }, 50);
    }


    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            run,
            false
        );
    } else {
        run();
    }
}());
