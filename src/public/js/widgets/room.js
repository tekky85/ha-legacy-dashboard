/* Native ES5 Room Card using only sanitized gateway data. */

function RoomWidget(config) {
    Widget.call(this, config);
    this.room = config && config.room ? config.room : {entities: {}};
    this.expanded = Boolean(this.room.defaultExpanded);
}

RoomWidget.prototype = Object.create(Widget.prototype);
RoomWidget.prototype.constructor = RoomWidget;

RoomWidget.prototype.toggleExpanded = function () {
    if (this.room.collapsible) {
        this.expanded = !this.expanded;
    }
    return this.expanded;
};

RoomWidget.prototype.stateFor = function (states, entityId) {
    if (!entityId || !states || !states[entityId]) {
        return {entity_id: entityId || "", state: "unavailable", attributes: {}};
    }
    return states[entityId];
};

RoomWidget.prototype.entityName = function (state, fallback) {
    var attributes = state && state.attributes ? state.attributes : {};
    return attributes.friendly_name || fallback || state.entity_id || "Entity";
};

RoomWidget.prototype.numberText = function (state, fallbackUnit) {
    var attributes = state && state.attributes ? state.attributes : {};
    var value = state && state.state;
    var unit = attributes.unit_of_measurement || fallbackUnit || "";
    var number = parseFloat(value);

    if (!state || value === "unknown" || value === "unavailable" || isNaN(number)) {
        return "–";
    }
    return (Math.round(number) === number ? String(number) : number.toFixed(1)) + unit;
};

RoomWidget.prototype.stateText = function (state) {
    var value = state && state.state ? String(state.state) : "unavailable";
    var translations = {
        on: "An", off: "Aus", open: "Offen", closed: "Geschlossen",
        opening: "Öffnet", closing: "Schließt", locked: "Verriegelt",
        unlocked: "Entriegelt", playing: "Wiedergabe", paused: "Pause",
        idle: "Bereit", heat: "Heizen", cool: "Kühlen",
        unavailable: "Nicht verfügbar", unknown: "Unbekannt"
    };
    return translations[value] || value;
};

RoomWidget.prototype.openWindowCount = function (states) {
    var ids = this.room.entities.windows || [];
    var count = 0;
    var index;
    var value;

    for (index = 0; index < ids.length; index++) {
        value = this.stateFor(states, ids[index]).state;
        if (value === "on" || value === "open" || value === "opening") {
            count++;
        }
    }
    return count;
};

RoomWidget.prototype.lightControl = function (state, entityId) {
    var value = state.state || "unavailable";
    var capabilities = state.gateway_capabilities || {};
    var isOn = value === "on";
    var available = value === "on" || value === "off";
    var allowed = !this.controlsDisabled && (isOn
        ? capabilities.can_light_power_off === true
        : capabilities.can_light_power_on === true);

    return LegacyControls.powerButton({
        className: "light-control room-light-control",
        entity: entityId,
        state: value,
        available: available && allowed,
        disabled: !allowed,
        label: available
            ? isOn ? "Licht ausschalten" : "Licht einschalten"
            : "Licht nicht verfügbar"
    });
};

RoomWidget.prototype.stepButton = function (
    entityId, direction, target, step, minimum, maximum, available
) {
    var label = direction < 0
        ? "Zieltemperatur senken"
        : "Zieltemperatur erhöhen";

    return '<button type="button" ' +
        'class="dashboard-control dashboard-control-step climate-control room-climate-control" ' +
        'data-entity="' + Legacy.html.escape(entityId) + '" ' +
        'data-direction="' + direction + '" ' +
        'data-target="' + Legacy.html.escape(target) + '" ' +
        'data-step="' + Legacy.html.escape(step) + '" ' +
        'data-min="' + Legacy.html.escape(minimum) + '" ' +
        'data-max="' + Legacy.html.escape(maximum) + '" ' +
        'data-available="' + (available ? "true" : "false") + '" ' +
        'aria-label="' + label + '"' +
        (available ? "" : ' disabled="disabled"') + '>' +
        LegacyControls.controlContent(
            '<svg class="climate-control-icon" viewBox="0 0 24 24" aria-hidden="true">' +
                '<line x1="5" y1="12" x2="19" y2="12"></line>' +
                (direction > 0
                    ? '<line x1="12" y1="5" x2="12" y2="19"></line>'
                    : "") +
            '</svg>',
            "dashboard-control-step-content"
        ) + '</button>';
};

RoomWidget.prototype.climateControls = function (state, entityId) {
    var attributes = state.attributes || {};
    var capabilities = state.gateway_capabilities || {};
    var target = parseFloat(attributes.temperature);
    var step = parseFloat(attributes.target_temp_step);
    var minimum = parseFloat(attributes.min_temp);
    var maximum = parseFloat(attributes.max_temp);
    var available;
    var powerAvailable;

    if (isNaN(step) || step <= 0) { step = 0.5; }
    if (isNaN(minimum)) { minimum = 5; }
    if (isNaN(maximum)) { maximum = 35; }

    available = !this.controlsDisabled &&
        state.state !== "off" && state.state !== "unknown" &&
        state.state !== "unavailable" && !isNaN(target) &&
        capabilities.can_set_temperature === true;
    powerAvailable = !this.controlsDisabled && (state.state === "off"
        ? capabilities.can_power_on === true
        : capabilities.can_power_off === true);

    return LegacyControls.controlRow(
        this.stepButton(
            entityId, -1, target, step, minimum, maximum,
            available && target - step >= minimum - 0.000001
        ) +
        '<span class="room-climate-target">' +
            (isNaN(target) ? "–" : target.toFixed(1)) +
            '<small>°C</small></span>' +
        this.stepButton(
            entityId, 1, target, step, minimum, maximum,
            available && target + step <= maximum + 0.000001
        ) +
        LegacyControls.powerButton({
            className: "climate-power-control room-climate-power-control",
            entity: entityId,
            state: state.state === "off" ? "off" : "on",
            available: powerAvailable,
            disabled: !powerAvailable,
            label: state.state === "off"
                ? "Thermostat einschalten"
                : "Thermostat ausschalten"
        }),
        {className: "room-climate-control-row", groupClassName: "room-climate-control-group"}
    );
};

RoomWidget.prototype.entityRows = function (states, fieldName, heading) {
    var ids = this.room.entities[fieldName] || [];
    var html = "";
    var index;
    var state;

    if (!ids.length) { return ""; }

    html = '<div class="room-detail-group room-detail-' +
        Legacy.html.escape(fieldName) + '"><h4>' +
        Legacy.html.escape(heading) + '</h4>';

    for (index = 0; index < ids.length; index++) {
        state = this.stateFor(states, ids[index]);
        html += '<div class="room-entity-row"><span class="room-entity-name">' +
            Legacy.html.escape(this.entityName(state, ids[index])) +
            '</span><span class="room-entity-state">' +
            Legacy.html.escape(this.stateText(state)) + '</span>';
        if (fieldName === "lights") {
            html += this.lightControl(state, ids[index]);
        }
        html += '</div>';
    }
    return html + '</div>';
};

RoomWidget.prototype.alertMarkup = function (alerts) {
    var html = "";
    var index;
    var alert;

    for (index = 0; index < alerts.length; index++) {
        alert = alerts[index];
        html += '<span class="room-alert room-alert-' +
            Legacy.html.escape(alert.severity || "info") + '">' +
            Legacy.html.escape(alert.title || "Hinweis") + '</span>';
    }
    return html;
};

RoomWidget.prototype.render = function (states, alerts, controlsDisabled) {
    var entities = this.room.entities || {};
    var temperature = this.stateFor(states, entities.temperature);
    var humidity = this.stateFor(states, entities.humidity);
    var climate = this.stateFor(states, entities.climate);
    var presence = this.stateFor(states, entities.presence);
    var openWindows = this.openWindowCount(states);
    var roomAlerts = alerts || [];
    var controlCount = entities.climate ? 3 : 0;
    var background = this.room.background;
    var backgroundStyle = "";
    var expanded = !this.room.collapsible || this.expanded;
    var lists;

    this.controlsDisabled = Boolean(controlsDisabled);

    if (background && typeof background.image_url === "string" &&
        /^\/assets\/backgrounds\/bg-[a-f0-9]{32}\.(?:jpg|png)$/.test(
            background.image_url
        )) {
        backgroundStyle = ' style="background-image:url(&quot;' +
            Legacy.html.escape(background.image_url) +
            '&quot;);background-position:' +
            Legacy.html.escape(background.position || "center center") +
            ';background-size:' + Legacy.html.escape(background.size || "cover") + '"';
    }

    (entities.lights || []).forEach(function (entityId) {
        var state = states && states[entityId];
        var capabilities = state && state.gateway_capabilities || {};
        if (capabilities.can_light_power_on === true ||
            capabilities.can_light_power_off === true) {
            controlCount++;
        }
    });

    lists = this.entityRows(states, "lights", "Licht") +
        this.entityRows(states, "switches", "Schalter") +
        this.entityRows(states, "covers", "Abdeckungen") +
        this.entityRows(states, "fans", "Ventilatoren") +
        this.entityRows(states, "mediaPlayers", "Medien") +
        this.entityRows(states, "locks", "Schlösser") +
        this.entityRows(states, "batteries", "Batterien") +
        this.entityRows(states, "secondary", "Weitere Sensoren");

    return '<section class="card card-room ' + this.getSizeClass() +
        (expanded ? ' is-expanded' : ' is-collapsed') +
        (backgroundStyle ? ' has-room-background' : '') + '"' +
        this.getLayoutAttribute() +
        ' data-card-density="' + (this.title.length > 24 ? "dense" : "normal") +
        '" data-card-controls="' + Math.min(3, controlCount) +
        '" data-card-secondary="true" data-card-state="available"' +
        backgroundStyle + '>' +
        '<div class="room-background-overlay" style="opacity:' +
            (background ? (Number(background.overlay) || 0) / 100 : 0) + '"></div>' +
        '<div class="room-content"><div class="room-header"><div class="room-heading">' +
        '<span class="room-icon">' + this.getIcon() + '</span><div>' +
        '<h3 class="room-title">' + Legacy.html.escape(this.title) + '</h3>' +
        (this.room.areaId ? '<span class="room-area-reference">HA Area</span>' : '') +
        '</div></div>' +
        (this.room.collapsible
            ? '<button type="button" class="room-expand-control" data-room-widget="' +
                Legacy.html.escape(this.id) + '" aria-expanded="' +
                (expanded ? "true" : "false") + '" aria-label="' +
                (expanded ? "Raumdetails einklappen" : "Raumdetails ausklappen") +
                '"><span aria-hidden="true">' + (expanded ? "−" : "+") + '</span></button>'
            : '') + '</div>' +
        '<div class="room-primary-values">' +
        (entities.temperature
            ? '<div class="room-primary room-temperature"><strong>' +
                Legacy.html.escape(this.numberText(temperature, "°C")) +
              '</strong><span>Temperatur</span></div>' : '') +
        (entities.humidity
            ? '<div class="room-primary room-humidity"><strong>' +
                Legacy.html.escape(this.numberText(humidity, "%")) +
              '</strong><span>Luftfeuchte</span></div>' : '') +
        (entities.climate
            ? '<div class="room-primary room-target"><strong>' +
                Legacy.html.escape(this.numberText({
                    state: climate.attributes && climate.attributes.temperature,
                    attributes: {unit_of_measurement: "°C"}
                }, "°C")) + '</strong><span>Ziel</span></div>' : '') +
        '</div><div class="room-status-line">' +
        (entities.presence
            ? '<span class="room-status room-presence">' +
                (presence.state === "on" ? "Anwesend" :
                    presence.state === "off" ? "Keine Präsenz" : "Präsenz unbekannt") +
              '</span>' : '') +
        ((entities.windows || []).length
            ? '<span class="room-status room-windows ' +
                (openWindows ? "is-open" : "is-closed") + '">' +
                (openWindows
                    ? openWindows + (openWindows === 1 ? " Öffnung offen" : " Öffnungen offen")
                    : "Alles geschlossen") + '</span>' : '') +
        '</div>' +
        (roomAlerts.length
            ? '<div class="room-alerts">' + this.alertMarkup(roomAlerts) + '</div>' : '') +
        '<div class="room-expanded-content">' +
        (entities.climate
            ? '<div class="room-detail-group room-detail-climate"><h4>Klima</h4>' +
                '<div class="room-climate-summary">' +
                    Legacy.html.escape(this.stateText(climate)) + '</div>' +
                this.climateControls(climate, entities.climate) + '</div>' : '') +
        lists + '</div></div></section>';
};
