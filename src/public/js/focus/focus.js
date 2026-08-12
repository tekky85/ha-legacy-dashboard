/*
 * Temporary focus-card overlay. The focused card is a clone of the currently
 * rendered card, so it uses the same state and never starts another poll.
 */

var LegacyFocus = (function () {

    var overlay = null;
    var content = null;
    var focusedWidgetId = "";


    function hasClass(element, className) {

        return Boolean(
            element &&
            (" " + (element.className || "") + " ")
                .indexOf(" " + className + " ") !== -1
        );

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

        return clone;

    }


    function render(card) {

        if (!content || !card) {
            return;
        }

        content.innerHTML = "";
        content.appendChild(
            prepareClone(card)
        );

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

        focusedWidgetId = widgetId;
        render(card);
        overlay.className = "focus-overlay is-visible";
        overlay.setAttribute("aria-hidden", "false");

    }


    function close() {

        if (!overlay) {
            return;
        }

        focusedWidgetId = "";
        overlay.className = "focus-overlay";
        overlay.setAttribute("aria-hidden", "true");

        if (content) {
            content.innerHTML = "";
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


    function initialize() {

        var closeButton;


        overlay = document.getElementById("focusOverlay");
        content = document.getElementById("focusContent");

        if (!overlay || !content) {
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

    }


    return {
        initialize: initialize,
        open: open,
        close: close,
        refresh: refresh,
        isOpen: function () {
            return Boolean(focusedWidgetId);
        }
    };

}());
