/*
 * Base widget.
 */

function Widget(config) {

    config = config || {};

    this.entity =
        config.entity || "";

    this.title =
        config.title || "";

    this.subtitle =
        config.subtitle || "";

    this.icon =
        config.icon || "sensor";

    this.iconClass =
        config.iconClass || "";

    this.size =
        normalizeCardSize(
            config.size
        );

}


function normalizeCardSize(value) {

    if (
        value === "compact" ||
        value === "normal" ||
        value === "wide" ||
        value === "tall" ||
        value === "large"
    ) {
        return value;
    }

    return "normal";

}


Widget.prototype.getIcon = function () {

    if (typeof LegacyIcons === "undefined") {
        return "";
    }

    return LegacyIcons.get(
        this.icon
    );

};


Widget.prototype.getSizeClass = function () {

    return "card-size-" + this.size;

};


Widget.prototype.render = function () {

    return "";

};
