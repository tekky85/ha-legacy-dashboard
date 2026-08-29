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
            id: entry.type + "-matrix",
            type: entry.type,
            entity: entry.type === "binary"
                ? "binary_sensor.matrix"
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
        fixture.innerHTML = widget.render(entry.state.data);

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
        failures.push({
            caseId: fixture.getAttribute("data-case-id"),
            code: code,
            detail: detail || ""
        });
    }


    function analyzeFixture(fixture, failures) {
        var card = fixture.getElementsByClassName("card")[0];
        var type = fixture.getAttribute("data-type");
        var expectedControls = type === "climate"
            ? 3
            : type === "light"
                ? 1
                : 0;
        var controls = card.querySelectorAll(
            ".climate-control, .dashboard-control-power"
        );
        var identity = card.querySelectorAll(".card-identity");
        var tierClasses = [];
        var semantic;
        var cardBounds;
        var index;
        var bounds;

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
            ".light-control-row, .climate-values, .climate-target-row"
        );

        for (index = 0; index < semantic.length; index += 1) {
            if (!visible(semantic[index])) {
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
                    semantic[index].className
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
            board.appendChild(renderCase(entry));
        });

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
