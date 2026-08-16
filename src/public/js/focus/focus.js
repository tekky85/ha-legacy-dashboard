/*
 * Viewport-aware focus-card overlay. The focused card is assembled from a
 * clone of the currently rendered card, so it uses the same state and never
 * starts another poll or gains capabilities of its own.
 */

var LegacyFocus = (function () {

    var overlay = null;
    var shell = null;
    var content = null;
    var closeButton = null;
    var focusedWidgetId = "";
    var resizeTimer = null;
    var scrollLocked = false;
    var savedScroll = null;
    var previousFocus = null;


    function hasClass(element, className) {

        return Boolean(
            element &&
            (" " + (element.className || "") + " ")
                .indexOf(" " + className + " ") !== -1
        );

    }


    function addClass(element, className) {

        if (!element || hasClass(element, className)) {
            return;
        }

        element.className =
            (element.className || "") + " " + className;

    }


    function removeClass(element, className) {

        var expression;


        if (!element) {
            return;
        }

        expression = new RegExp("(^|\\s)" + className + "(?=\\s|$)", "g");
        element.className = (element.className || "")
            .replace(expression, " ")
            .replace(/^\s+|\s+$/g, "")
            .replace(/\s{2,}/g, " ");

    }


    function firstByClass(element, className) {

        var matches;


        if (!element) {
            return null;
        }

        matches = element.getElementsByClassName(className);

        return matches.length ? matches[0] : null;

    }


    function createRegion(className) {

        var region = document.createElement("div");


        region.className = className;

        return region;

    }


    function appendRegion(card, region) {

        if (region && region.childNodes.length) {
            card.appendChild(region);
        }

    }


    function clearChildren(element) {

        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }

    }


    function cardForWidget(widgetId) {

        var dashboard = document.getElementById("dashboard");
        var cards;
        var index;


        if (!dashboard) {
            return null;
        }

        cards = dashboard.getElementsByClassName("card");

        for (index = 0; index < cards.length; index++) {
            if (
                cards[index].getAttribute("data-widget-id") ===
                    widgetId
            ) {
                return cards[index];
            }
        }

        return null;

    }


    function structureStandardCard(clone) {

        var cardHeader = firstByClass(clone, "card-header");
        var identity = firstByClass(clone, "card-identity");
        var value = firstByClass(clone, "value");
        var status = firstByClass(clone, "status");
        var lightControl = firstByClass(clone, "light-control");
        var subtitle = firstByClass(clone, "subtitle");
        var header = createRegion("focus-header");
        var primary = createRegion("focus-primary");
        var controls = createRegion("focus-controls");
        var secondary = createRegion("focus-secondary");


        if (identity) {
            header.appendChild(identity);
        }

        if (cardHeader) {
            primary.appendChild(cardHeader);
        }

        if (value) {
            primary.appendChild(value);
        }

        if (status) {
            primary.appendChild(status);
        }

        if (lightControl) {
            controls.appendChild(lightControl);
        }

        if (subtitle) {
            secondary.appendChild(subtitle);
        }

        clearChildren(clone);
        appendRegion(clone, header);
        appendRegion(clone, primary);
        appendRegion(clone, controls);
        appendRegion(clone, secondary);

    }


    function structureClimateCard(clone) {

        var cardHeader = firstByClass(clone, "card-header");
        var current = firstByClass(clone, "climate-current");
        var targetRow = firstByClass(clone, "climate-target-row");
        var header = createRegion("focus-header");
        var primary = createRegion("focus-primary");
        var controls = createRegion("focus-controls");


        if (cardHeader) {
            header.appendChild(cardHeader);
        }

        if (current) {
            primary.appendChild(current);
        }

        if (targetRow) {
            controls.appendChild(targetRow);
        }

        clearChildren(clone);
        appendRegion(clone, header);
        appendRegion(clone, primary);
        appendRegion(clone, controls);

    }


    function prepareClone(card) {

        var clone = card.cloneNode(true);
        var className = clone.className || "";


        className = className
            .replace(/\s*card-size-(compact|normal|wide|tall|large)/g, "")
            .replace(/\s*card-presentation-(compact|normal|expanded)/g, "");

        clone.className =
            className +
            " focus-card card-presentation-expanded";

        clone.removeAttribute("style");
        clone.setAttribute("role", "document");

        if (hasClass(clone, "card-climate")) {
            structureClimateCard(clone);
        } else {
            structureStandardCard(clone);
        }

        return clone;

    }


    function render(card) {

        var scrollTop;


        if (!content || !card) {
            return;
        }

        scrollTop = content.scrollTop || 0;
        content.innerHTML = "";
        content.appendChild(
            prepareClone(card)
        );
        content.scrollTop = scrollTop;

    }


    function getFocusViewportMetrics() {

        var documentElement = document.documentElement || {};
        var body = document.body || {};
        var width = window.innerWidth ||
            documentElement.clientWidth ||
            body.clientWidth ||
            0;
        var height = window.innerHeight ||
            documentElement.clientHeight ||
            body.clientHeight ||
            0;


        return {
            width: width,
            height: height
        };

    }


    function calculateFocusGeometry(metrics) {

        var width = metrics && metrics.width > 0
            ? metrics.width
            : 320;
        var height = metrics && metrics.height > 0
            ? metrics.height
            : 480;
        var margin = width <= 520 ? 8 : 16;
        var availableWidth = Math.max(0, width - (margin * 2));
        var availableHeight = Math.max(0, height - (margin * 2));


        return {
            width: width,
            height: height,
            margin: margin,
            maxWidth: Math.min(760, availableWidth),
            maxHeight: availableHeight,
            landscape: width > height,
            shortViewport: height < 480
        };

    }


    function applyViewportGeometry() {

        var geometry;


        if (!overlay || !shell || !focusedWidgetId) {
            return;
        }

        geometry = calculateFocusGeometry(
            getFocusViewportMetrics()
        );

        overlay.style.width = geometry.width + "px";
        overlay.style.height = geometry.height + "px";
        overlay.style.padding = geometry.margin + "px";
        shell.style.maxWidth = geometry.maxWidth + "px";
        shell.style.maxHeight = geometry.maxHeight + "px";

        removeClass(overlay, "focus-landscape");
        removeClass(overlay, "focus-portrait");
        removeClass(overlay, "focus-short");
        addClass(
            overlay,
            geometry.landscape
                ? "focus-landscape"
                : "focus-portrait"
        );

        if (geometry.shortViewport) {
            addClass(overlay, "focus-short");
        }

    }


    function getPageScroll() {

        var documentElement = document.documentElement || {};
        var body = document.body || {};


        return {
            x: typeof window.pageXOffset === "number"
                ? window.pageXOffset
                : documentElement.scrollLeft || body.scrollLeft || 0,
            y: typeof window.pageYOffset === "number"
                ? window.pageYOffset
                : documentElement.scrollTop || body.scrollTop || 0
        };

    }


    function lockPageScroll() {

        var body = document.body;
        var position;


        if (!body || scrollLocked) {
            return;
        }

        position = getPageScroll();
        savedScroll = {
            x: position.x,
            y: position.y,
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            right: body.style.right,
            width: body.style.width,
            overflow: body.style.overflow
        };

        addClass(body, "focus-page-locked");
        body.style.position = "fixed";
        body.style.top = (-position.y) + "px";
        body.style.left = (-position.x) + "px";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";
        scrollLocked = true;

    }


    function unlockPageScroll() {

        var body = document.body;
        var position = savedScroll;


        if (!body || !scrollLocked || !position) {
            return;
        }

        removeClass(body, "focus-page-locked");
        body.style.position = position.position;
        body.style.top = position.top;
        body.style.left = position.left;
        body.style.right = position.right;
        body.style.width = position.width;
        body.style.overflow = position.overflow;
        scrollLocked = false;
        savedScroll = null;

        if (typeof window.scrollTo === "function") {
            window.scrollTo(position.x, position.y);
        }

    }


    function open(card) {

        var widgetId;


        if (!overlay || !card || !hasClass(card, "card")) {
            return;
        }

        widgetId = card.getAttribute("data-widget-id") || "";

        if (!widgetId) {
            return;
        }

        if (!focusedWidgetId) {
            previousFocus = document.activeElement || null;
            lockPageScroll();
        }

        focusedWidgetId = widgetId;
        render(card);
        overlay.className = "focus-overlay is-visible";
        overlay.setAttribute("aria-hidden", "false");
        applyViewportGeometry();

        if (closeButton && typeof closeButton.focus === "function") {
            closeButton.focus();
        }

    }


    function close() {

        var restoreFocus = previousFocus;


        if (!overlay) {
            return;
        }

        focusedWidgetId = "";
        overlay.className = "focus-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.removeAttribute("style");

        if (shell) {
            shell.removeAttribute("style");
        }

        if (content) {
            content.innerHTML = "";
            content.scrollTop = 0;
        }

        unlockPageScroll();
        previousFocus = null;

        if (restoreFocus && typeof restoreFocus.focus === "function") {
            restoreFocus.focus();
        }

    }


    function refresh() {

        var card;


        if (!focusedWidgetId) {
            return;
        }

        card = cardForWidget(focusedWidgetId);

        if (card) {
            render(card);
        } else {
            close();
        }

    }


    function handleViewportChange() {

        if (!focusedWidgetId) {
            return;
        }

        if (resizeTimer !== null) {
            window.clearTimeout(resizeTimer);
        }

        resizeTimer = window.setTimeout(function () {
            resizeTimer = null;
            applyViewportGeometry();
        }, 60);

    }


    function initialize() {

        overlay = document.getElementById("focusOverlay");
        shell = document.getElementById("focusShell");
        content = document.getElementById("focusContent");

        if (!overlay || !shell || !content) {
            return;
        }

        closeButton = document.getElementById("focusClose");

        if (closeButton) {
            closeButton.onclick = close;
        }

        overlay.onclick = function (event) {
            event = event || window.event;

            if (
                (event.target || event.srcElement) === overlay
            ) {
                close();
            }
        };

        if (window.addEventListener) {
            window.addEventListener("resize", handleViewportChange, false);
            window.addEventListener(
                "orientationchange",
                handleViewportChange,
                false
            );
        }

    }


    return {
        initialize: initialize,
        open: open,
        close: close,
        refresh: refresh,
        getViewportMetrics: getFocusViewportMetrics,
        calculateGeometry: calculateFocusGeometry,
        isOpen: function () {
            return Boolean(focusedWidgetId);
        }
    };

}());
