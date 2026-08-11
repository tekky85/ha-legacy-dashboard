/*
 * Base widget.
 */

function Widget(config) {

    config = config || {};

    this.id =
        typeof config.id === "string" &&
        /^[a-z0-9][a-z0-9-]{0,62}$/.test(config.id)
            ? config.id
            : "";

    this.type =
        config.type || "";

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


Widget.prototype.getLayoutAttribute = function () {

    return this.id
        ? ' data-widget-id="' + this.id + '"'
        : "";

};


Widget.prototype.render = function () {

    return "";

};
