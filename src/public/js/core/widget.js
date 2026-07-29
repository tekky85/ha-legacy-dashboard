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

}


Widget.prototype.getIcon = function () {

    if (typeof LegacyIcons === "undefined") {
        return "";
    }

    return LegacyIcons.get(
        this.icon
    );

};


Widget.prototype.render = function () {

    return "";

};
