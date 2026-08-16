/*
 * Native Focus interaction view lifecycle.
 *
 * A source provider supplies widget definition + current sanitized state.
 * The dedicated Focus View Model and renderer create independent DOM; Grid
 * DOM, layout coordinates and presentation classes are never consumed.
 */

var LegacyFocus = (function () {

    var overlay = null;
    var panel = null;
    var content = null;
    var closeButton = null;
    var sourceProvider = null;
    var focusedWidgetId = "";
    var resizeTimer = null;
    var scrollLocked = false;
    var savedScroll = null;
    var previousFocus = null;
    var lastModel = null;


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
        var panelWidth = Math.min(760, availableWidth);


        return {
            width: width,
            height: height,
            margin: margin,
            panelWidth: panelWidth,
            maxWidth: panelWidth,
            maxHeight: availableHeight,
            minimumPanelHeight: Math.min(260, availableHeight),
            landscape: width > height,
            shortViewport: height < 480
        };

    }


    function applyViewportGeometry() {

        var geometry;


        if (!overlay || !panel || !focusedWidgetId) {
            return;
        }

        geometry = calculateFocusGeometry(
            getFocusViewportMetrics()
        );

        overlay.style.width = geometry.width + "px";
        overlay.style.height = geometry.height + "px";
        overlay.style.padding = geometry.margin + "px";

        panel.style.width = geometry.panelWidth + "px";
        panel.style.maxWidth = geometry.panelWidth + "px";
        panel.style.maxHeight = geometry.maxHeight + "px";
        panel.style.minHeight = geometry.minimumPanelHeight + "px";

        removeClass(overlay, "focus-layout-landscape");
        removeClass(overlay, "focus-layout-portrait");
        removeClass(overlay, "focus-layout-short");
        addClass(
            overlay,
            geometry.landscape
                ? "focus-layout-landscape"
                : "focus-layout-portrait"
        );

        if (geometry.shortViewport) {
            addClass(overlay, "focus-layout-short");
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


    function sourceForWidget(widgetId) {

        if (typeof sourceProvider !== "function") {
            return null;
        }

        return sourceProvider(widgetId);

    }


    function render() {

        var source;
        var model;
        var markup;
        var scrollTop;


        if (!content || !focusedWidgetId) {
            return false;
        }

        source = sourceForWidget(focusedWidgetId);

        if (!source) {
            return false;
        }

        model = LegacyFocusViewModel.create(source);
        markup = LegacyFocusRenderer.render(model);

        if (!model || !markup) {
            return false;
        }

        scrollTop = content.scrollTop || 0;

        if (content.innerHTML !== markup) {
            content.innerHTML = markup;
            content.scrollTop = scrollTop;
        }

        lastModel = model;

        return true;

    }


    function open(widgetId) {

        if (
            !overlay ||
            typeof widgetId !== "string" ||
            !/^[a-z0-9][a-z0-9-]{0,62}$/.test(widgetId)
        ) {
            return;
        }

        if (!sourceForWidget(widgetId)) {
            return;
        }

        if (!focusedWidgetId) {
            previousFocus = document.activeElement || null;
            lockPageScroll();
        }

        focusedWidgetId = widgetId;

        if (!render()) {
            close();
            return;
        }

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
        lastModel = null;
        overlay.className = "focus-overlay";
        overlay.setAttribute("aria-hidden", "true");
        overlay.removeAttribute("style");

        if (panel) {
            panel.removeAttribute("style");
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

        if (!focusedWidgetId) {
            return;
        }

        if (!render()) {
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


    function initialize(provider) {

        overlay = document.getElementById("focusOverlay");
        panel = document.getElementById("focusShell");
        content = document.getElementById("focusContent");
        sourceProvider = typeof provider === "function"
            ? provider
            : null;

        if (!overlay || !panel || !content) {
            return;
        }

        closeButton = document.getElementById("focusClose");

        if (closeButton) {
            closeButton.onclick = close;
        }

        overlay.onclick = function (event) {
            event = event || window.event;

            if ((event.target || event.srcElement) === overlay) {
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
        getModel: function () {
            return lastModel;
        },
        isOpen: function () {
            return Boolean(focusedWidgetId);
        }
    };

}());
