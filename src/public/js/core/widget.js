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

    this.sectionId =
        typeof config.sectionId === "string" &&
        /^[a-z0-9][a-z0-9-]{0,62}$/.test(config.sectionId)
            ? config.sectionId
            : null;

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


Widget.prototype.getPresentationAttribute = function (data) {

    var hints =
        typeof LegacyPresentation !== "undefined"
            ? LegacyPresentation.getHints(this, data)
            : {
                available: false,
                contentDensity: "normal",
                controlCount: 0,
                hasSecondary: Boolean(this.subtitle)
            };


    return ' data-card-density="' +
        hints.contentDensity +
        '" data-card-controls="' +
        hints.controlCount +
        '" data-card-secondary="' +
        (hints.hasSecondary ? "true" : "false") +
        '" data-card-state="' +
        (hints.available ? "available" : "unavailable") +
        '"';

};


Widget.prototype.getCardIdentity = function (data) {

    if (typeof LegacyPresentation !== "undefined") {
        return LegacyPresentation.getIdentity(
            this,
            data
        );
    }

    var attributes =
        data && data.attributes
            ? data.attributes
            : {};

    var candidates = [
        this.title,
        this.subtitle,
        attributes.friendly_name,
        this.entity
    ];

    var index;
    var value;


    for (index = 0; index < candidates.length; index++) {

        if (typeof candidates[index] !== "string") {
            continue;
        }

        value = candidates[index].replace(
            /^\s+|\s+$/g,
            ""
        );

        if (value) {
            return value;
        }

    }


    return "Widget";

};


Widget.prototype.render = function () {

    return "";

};
