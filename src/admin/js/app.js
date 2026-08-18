(function (admin) {
    "use strict";

    const elements = {};
    let pendingEntity = null;
    let entityLoadError = "";
    let activeLayoutProfile = "portrait";
    let previewTheme = "light";
    let layoutDragState = null;
    let layoutResizeState = null;
    let previewRefreshTimer = null;
    let criticalLabels = {labels: [], source: {status: "error"}};
    let entityRuleIndex = [];
    let entityRuleLoadError = "";
    let entityRulesConfiguredOnly = false;

    function byId(id) {
        return document.getElementById(id);
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);

        if (className) {
            element.className = className;
        }
        if (typeof text !== "undefined") {
            element.textContent = text;
        }

        return element;
    }

    function createButton(label, action, identifier, className) {
        const button = createElement(
            "button",
            className || "button secondary compact",
            label
        );
        button.type = "button";
        button.dataset.action = action;

        if (identifier) {
            button.dataset.id = identifier;
        }

        return button;
    }

    function openDialog(dialog) {
        if (typeof dialog.showModal === "function") {
            dialog.showModal();
        } else {
            dialog.setAttribute("open", "open");
        }
    }

    function closeDialog(dialog) {
        if (typeof dialog.close === "function") {
            dialog.close();
        } else {
            dialog.removeAttribute("open");
        }
    }

    function errorMessage(error) {
        if (!error) {
            return "Ein unbekannter Fehler ist aufgetreten.";
        }

        if (error.status === 0) {
            return "Das Gateway ist nicht erreichbar.";
        }
        if (error.status === 401 || error.status === 403) {
            return "Die Anmeldung ist nicht mehr gültig. Bitte erneut anmelden.";
        }
        if (error.code === "admin_api_disabled") {
            return "Die Admin API ist auf dem Gateway deaktiviert.";
        }
        if (error.code === "admin_api_not_configured") {
            return "Die Admin API ist noch nicht vollständig konfiguriert.";
        }
        if (error.status === 409) {
            return "Die Änderung steht im Konflikt mit der aktuellen Konfiguration.";
        }
        if (error.status === 429) {
            return "Zu viele Änderungen in kurzer Zeit. Bitte kurz warten.";
        }
        if (error.status === 404) {
            return "Das angeforderte Dashboard oder Widget wurde nicht gefunden.";
        }
        if (error.status === 502 || error.status === 503) {
            return "Home Assistant ist derzeit nicht erreichbar. Die lokale Konfiguration kann weiter bearbeitet werden.";
        }
        if (error.status >= 500) {
            return "Das Gateway konnte die Änderung nicht speichern.";
        }

        return error.message || "Die Anfrage ist fehlgeschlagen.";
    }

    function showNotice(message, isError) {
        elements.globalNotice.textContent = message;
        elements.globalNotice.className = isError
            ? "notice error"
            : "notice";
        elements.globalNotice.hidden = false;
    }

    function hideNotice() {
        elements.globalNotice.hidden = true;
        elements.globalNotice.textContent = "";
    }

    function updateDirtyState() {
        const dirty = admin.State.isDirty();

        elements.saveBar.hidden = !dirty;
        elements.entityRulesDirtyState.textContent = dirty
            ? "Ungespeicherte Änderungen"
            : "Keine ungespeicherten Änderungen.";
        elements.entityRulesDirtyState.className = dirty
            ? "entity-rules-dirty is-dirty"
            : "entity-rules-dirty";
        elements.entityRulesDiscardButton.disabled = !dirty;
        elements.entityRulesSaveButton.disabled = !dirty;
    }

    function setSaving(saving) {
        elements.saveButton.disabled = saving;
        elements.discardButton.disabled = saving;
        elements.entityRulesDiscardButton.disabled =
            saving || !admin.State.isDirty();
        elements.entityRulesSaveButton.disabled =
            saving || !admin.State.isDirty();
        elements.saveButton.textContent = saving
            ? "Speichert …"
            : "Änderungen speichern";
        elements.entityRulesSaveButton.textContent = saving
            ? "Speichert …"
            : "Speichern";
    }

    function showLogin(message) {
        elements.adminView.hidden = true;
        elements.loginView.hidden = false;
        elements.loginError.textContent = message || "";
        elements.adminToken.value = "";
        window.setTimeout(function () {
            elements.adminToken.focus();
        }, 0);
    }

    function showAdministration() {
        elements.loginView.hidden = true;
        elements.adminView.hidden = false;
        elements.loginError.textContent = "";
    }

    function slugify(value) {
        return String(value || "")
            .toLocaleLowerCase("de")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 63);
    }

    function sortedWidgets(dashboard) {
        return dashboard.widgets.slice().sort(function (first, second) {
            return first.order - second.order;
        });
    }

    function renderDashboardList() {
        const draft = admin.State.getDraft();
        const selectedId = admin.State.getSelectedDashboardId();
        elements.dashboardList.textContent = "";

        if (!draft) {
            return;
        }

        draft.dashboards.forEach(function (dashboard) {
            const button = createElement("button", "dashboard-list-button");
            const title = createElement(
                "span",
                "dashboard-list-title",
                dashboard.title || "Ohne Titel"
            );
            const meta = createElement("span", "dashboard-list-meta");
            const count = createElement(
                "span",
                "",
                dashboard.widgets.length === 1
                    ? "1 Widget"
                    : dashboard.widgets.length + " Widgets"
            );

            button.type = "button";
            button.dataset.dashboardId = dashboard.id;
            button.classList.toggle("active", dashboard.id === selectedId);
            button.setAttribute(
                "aria-current",
                dashboard.id === selectedId ? "page" : "false"
            );
            button.appendChild(title);
            meta.appendChild(count);

            if (draft.defaultDashboardId === dashboard.id) {
                meta.appendChild(
                    createElement("span", "default-badge", "Standard")
                );
            }

            button.appendChild(meta);
            elements.dashboardList.appendChild(button);
        });
    }

    function renderWidgetCard(dashboard, widget, index, total) {
        const card = createElement(
            "article",
            widget.visible ? "widget-card" : "widget-card is-hidden"
        );
        const content = createElement("div");
        const actions = createElement("div", "widget-actions");
        const title = createElement("h3", "", widget.title);
        const meta = createElement("p", "widget-meta");
        const entity = createElement("code", "", widget.entity);

        meta.appendChild(entity);
        meta.appendChild(createElement("span", "", widget.type));
        meta.appendChild(createElement("span", "", "Icon: " + widget.icon));
        meta.appendChild(createElement(
            "span",
            "",
            "Größe: " + admin.Widgets.sizeLabel(widget.size)
        ));
        meta.appendChild(createElement(
            "span",
            "",
            widget.visible ? "Sichtbar" : "Ausgeblendet"
        ));
        content.appendChild(title);

        if (widget.subtitle) {
            content.appendChild(createElement("p", "muted", widget.subtitle));
        }
        content.appendChild(meta);

        const upButton = createButton("↑", "widget-up", widget.id, "icon-button");
        upButton.disabled = index === 0;
        upButton.setAttribute("aria-label", widget.title + " nach oben");
        actions.appendChild(upButton);

        const downButton = createButton("↓", "widget-down", widget.id, "icon-button");
        downButton.disabled = index === total - 1;
        downButton.setAttribute("aria-label", widget.title + " nach unten");
        actions.appendChild(downButton);

        actions.appendChild(
            createButton(
                widget.visible ? "Ausblenden" : "Einblenden",
                "widget-visible",
                widget.id
            )
        );
        actions.appendChild(createButton("Bearbeiten", "widget-edit", widget.id));
        actions.appendChild(
            createButton(
                "Entfernen",
                "widget-remove",
                widget.id,
                "button danger compact"
            )
        );

        card.appendChild(content);
        card.appendChild(actions);
        return card;
    }

    function appendLabeledInput(container, labelText, input) {
        const label = createElement("label", "", labelText);
        label.htmlFor = input.id;
        container.appendChild(label);
        container.appendChild(input);
    }

    function layoutButton(label, action, widgetId, title) {
        const button = createButton(
            label,
            action,
            widgetId,
            "layout-control-button"
        );
        button.setAttribute("aria-label", title);
        return button;
    }

    function previewPowerButton(label) {
        const button = createElement(
            "button",
            "admin-preview-power",
            ""
        );
        button.type = "button";
        button.disabled = true;
        button.setAttribute("aria-label", label);
        button.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
                '<path d="M12 2v10"></path>' +
                '<path d="M6.3 5.7a8 8 0 1 0 11.4 0"></path>' +
            '</svg>';
        return button;
    }

    function previewGeometry(profileName, item) {
        const canvasWidth = profileName === "portrait" ? 768 : 1024;
        const columns = admin.Layout.COLUMNS[profileName];
        const geometry = LegacyPresentation.calculateGridGeometry(
            canvasWidth,
            columns
        );

        return {
            width: Math.max(0, item.w * geometry.columnWidth - geometry.gutter),
            height: Math.max(0, item.h * geometry.rowHeight - geometry.gutter)
        };
    }

    function renderLivePreview(widget, item, profileName) {
        const entity = admin.State.getPreviewEntity(widget.entity) || {
            entity_id: widget.entity,
            state: "unavailable"
        };
        const geometry = previewGeometry(profileName, item);
        const mode = LegacyPresentation.getMode(
            widget,
            item.w,
            item.h,
            geometry.width,
            geometry.height
        );
        const card = createElement(
            "div",
            "layout-card-preview admin-preview-" + widget.type +
                " admin-preview-" + mode
        );
        const header = createElement("div", "admin-preview-header");
        const icon = createElement("span", "admin-preview-icon");
        const identity = createElement(
            "strong",
            "admin-preview-identity",
            LegacyPresentation.getIdentity(widget, entity)
        );
        const content = createElement("div", "admin-preview-content");
        const controls = createElement("div", "admin-preview-controls");
        const modeLabel = createElement(
            "span",
            "admin-preview-mode",
            mode + " · " + item.w + "×" + item.h
        );
        const state = entity.state || "unknown";

        card.dataset.previewWidgetId = widget.id;
        icon.innerHTML = LegacyIcons.get(widget.icon);
        header.appendChild(icon);
        header.appendChild(identity);
        header.appendChild(modeLabel);
        card.appendChild(header);

        if (widget.type === "sensor") {
            content.textContent =
                state === "unknown" || state === "unavailable"
                    ? "Nicht verfügbar"
                    : state + (entity.unit_of_measurement || widget.unit
                        ? " " + (entity.unit_of_measurement || widget.unit)
                        : "");
        } else if (widget.type === "binary") {
            content.textContent = state === "on"
                ? "Offen"
                : state === "off"
                    ? "Geschlossen"
                    : "Nicht verfügbar";
        } else if (widget.type === "light") {
            content.textContent = state === "on"
                ? "An"
                : state === "off"
                    ? "Aus"
                    : "Nicht verfügbar";
            controls.appendChild(previewPowerButton("Light-Vorschau"));
        } else if (widget.type === "climate") {
            const current = entity.current_temperature;
            const target = entity.target_temperature;
            content.textContent =
                (current === null || typeof current === "undefined" ? "–" : current) +
                "° → " +
                (target === null || typeof target === "undefined" ? "–" : target) +
                "°";
            controls.appendChild(createElement("button", "admin-preview-step", "−"));
            controls.appendChild(createElement("button", "admin-preview-step", "+"));
            controls.appendChild(previewPowerButton("Climate-Vorschau"));
            Array.prototype.forEach.call(
                controls.getElementsByTagName("button"),
                function (button) {
                    button.type = "button";
                    button.disabled = true;
                }
            );
        }

        card.appendChild(content);
        if (controls.childNodes.length) {
            card.appendChild(controls);
        }
        return card;
    }

    function renderLayoutTile(dashboard, widget, profileName) {
        const item = dashboard.layouts[profileName].items[widget.id];
        const tile = createElement("article", "layout-tile");
        const meta = createElement(
            "span",
            "layout-tile-meta",
            "x" + item.x + " · y" + item.y + " · " + item.w + "×" + item.h
        );
        const controls = createElement("div", "layout-controls");
        const resizeHandle = createElement("button", "layout-resize-handle", "↘");

        tile.dataset.layoutWidgetId = widget.id;
        tile.style.gridColumn = (item.x + 1) + " / span " + item.w;
        tile.style.gridRow = (item.y + 1) + " / span " + item.h;
        tile.appendChild(
            renderLivePreview(widget, item, profileName)
        );
        tile.appendChild(meta);

        controls.appendChild(layoutButton("←", "layout-left", widget.id, widget.title + " nach links"));
        controls.appendChild(layoutButton("→", "layout-right", widget.id, widget.title + " nach rechts"));
        controls.appendChild(layoutButton("↑", "layout-up", widget.id, widget.title + " nach oben"));
        controls.appendChild(layoutButton("↓", "layout-down", widget.id, widget.title + " nach unten"));
        controls.appendChild(layoutButton("−B", "layout-narrower", widget.id, widget.title + " schmaler"));
        controls.appendChild(layoutButton("+B", "layout-wider", widget.id, widget.title + " breiter"));
        controls.appendChild(layoutButton("−H", "layout-shorter", widget.id, widget.title + " niedriger"));
        controls.appendChild(layoutButton("+H", "layout-taller", widget.id, widget.title + " höher"));
        tile.appendChild(controls);

        resizeHandle.type = "button";
        resizeHandle.draggable = false;
        resizeHandle.dataset.layoutResize = widget.id;
        resizeHandle.setAttribute("aria-label", widget.title + " am Raster vergrößern oder verkleinern");
        tile.appendChild(resizeHandle);

        return tile;
    }

    function renderLayoutEditor(dashboard) {
        admin.Layout.ensureDashboard(dashboard);

        const section = createElement("section", "layout-section");
        const heading = createElement("div", "layout-heading");
        const headingText = createElement("div");
        const tabs = createElement("div", "layout-profile-tabs");
        const themeTabs = createElement("div", "layout-theme-tabs");
        const grid = createElement("div", "layout-editor-grid");
        const profileName = activeLayoutProfile;
        const columns = admin.Layout.COLUMNS[profileName];
        const rows = admin.Layout.rowCount(dashboard, profileName) + 1;
        const preview = createElement("div", "layout-preview");

        headingText.appendChild(createElement("h2", "", "Layout"));
        headingText.appendChild(createElement(
            "p",
            "muted",
            "Kacheln ziehen, am Raster einrasten oder über die Tasten anpassen."
        ));

        [
            {id: "portrait", label: "Portrait"},
            {id: "landscape", label: "Landscape"}
        ].forEach(function (profile) {
            const button = createButton(
                profile.label,
                "layout-profile",
                profile.id,
                profile.id === profileName
                    ? "button primary compact"
                    : "button secondary compact"
            );
            button.setAttribute("aria-pressed", profile.id === profileName ? "true" : "false");
            tabs.appendChild(button);
        });

        heading.appendChild(headingText);
        [
            {id: "light", label: "Hell"},
            {id: "dark", label: "Dunkel"}
        ].forEach(function (theme) {
            const button = createButton(
                theme.label,
                "preview-theme",
                theme.id,
                theme.id === previewTheme
                    ? "button primary compact"
                    : "button secondary compact"
            );
            button.setAttribute("aria-pressed", theme.id === previewTheme ? "true" : "false");
            themeTabs.appendChild(button);
        });
        const viewControls = createElement("div", "layout-view-controls");
        viewControls.appendChild(tabs);
        viewControls.appendChild(themeTabs);
        heading.appendChild(viewControls);
        section.appendChild(heading);

        grid.classList.add("preview-theme-" + previewTheme);
        grid.dataset.layoutGrid = profileName;
        grid.dataset.rowHeight = "194";
        grid.style.setProperty("--layout-columns", String(columns));
        grid.style.gridTemplateRows = "repeat(" + rows + ", 184px)";

        sortedWidgets(dashboard).forEach(function (widget) {
            if (widget.visible) {
                grid.appendChild(
                    renderLayoutTile(dashboard, widget, profileName)
                );
            }
        });

        preview.hidden = true;
        preview.setAttribute("aria-hidden", "true");
        grid.appendChild(preview);
        section.appendChild(grid);
        section.appendChild(createElement(
            "p",
            "layout-help muted",
            profileName === "portrait"
                ? "Portrait verwendet 6 Spalten. Mindestbreite: 2 Spalten."
                : "Landscape verwendet 12 Spalten. Climate benötigt mindestens 3 Spalten."
        ));
        return section;
    }

    function renderEditor() {
        const dashboard = admin.State.getSelectedDashboard();
        const draft = admin.State.getDraft();
        elements.dashboardEditor.textContent = "";

        if (!dashboard || !draft) {
            const empty = createElement("div", "editor-empty");
            empty.appendChild(createElement("h2", "", "Dashboard auswählen"));
            empty.appendChild(createElement(
                "p",
                "muted",
                "Wählen Sie links ein Dashboard zur Bearbeitung."
            ));
            elements.dashboardEditor.appendChild(empty);
            return;
        }

        const heading = createElement("div", "editor-heading");
        const headingText = createElement("div");
        const actions = createElement("div", "editor-heading-actions");
        const dashboardTitle = createElement("h2", "", dashboard.title || "Ohne Titel");
        const url = createElement("p", "dashboard-url");
        const previewLink = createElement("a", "", "/d/" + dashboard.id);

        dashboardTitle.id = "editorTitle";
        previewLink.href = "/d/" + encodeURIComponent(dashboard.id);
        previewLink.target = "_blank";
        previewLink.rel = "noopener";
        previewLink.textContent = "Dashboard öffnen: /d/" + dashboard.id;
        url.appendChild(previewLink);
        headingText.appendChild(dashboardTitle);
        headingText.appendChild(url);
        actions.appendChild(createButton("Duplizieren", "dashboard-duplicate"));
        actions.appendChild(
            createButton(
                "Löschen",
                "dashboard-delete",
                "",
                "button danger compact"
            )
        );
        heading.appendChild(headingText);
        heading.appendChild(actions);
        elements.dashboardEditor.appendChild(heading);

        const settings = createElement("div", "settings-grid");
        const titleField = createElement("div");
        const titleInput = createElement("input");
        titleInput.id = "dashboardEditorTitle";
        titleInput.type = "text";
        titleInput.maxLength = 120;
        titleInput.required = true;
        titleInput.value = dashboard.title;
        titleInput.dataset.field = "dashboard-title";
        appendLabeledInput(titleField, "Titel", titleInput);

        const idField = createElement("div");
        const idInput = createElement("input");
        idInput.id = "dashboardEditorId";
        idInput.type = "text";
        idInput.readOnly = true;
        idInput.value = dashboard.id;
        appendLabeledInput(idField, "Technische ID", idInput);

        const refreshField = createElement("div");
        const refreshInput = createElement("input");
        refreshInput.id = "dashboardRefreshInterval";
        refreshInput.type = "number";
        refreshInput.min = "3000";
        refreshInput.max = "300000";
        refreshInput.step = "1000";
        refreshInput.required = true;
        refreshInput.value = String(dashboard.refreshIntervalMs);
        refreshInput.dataset.field = "dashboard-refresh";
        appendLabeledInput(refreshField, "Refresh-Intervall in ms", refreshInput);

        const defaultLabel = createElement("label", "checkbox-row");
        const defaultInput = createElement("input");
        defaultInput.type = "checkbox";
        defaultInput.checked = draft.defaultDashboardId === dashboard.id;
        defaultInput.disabled = defaultInput.checked;
        defaultInput.dataset.field = "dashboard-default";
        defaultLabel.appendChild(defaultInput);
        defaultLabel.appendChild(createElement("span", "", "Als Standard-Dashboard verwenden"));

        settings.appendChild(titleField);
        settings.appendChild(idField);
        settings.appendChild(refreshField);
        settings.appendChild(defaultLabel);
        elements.dashboardEditor.appendChild(settings);
        elements.dashboardEditor.appendChild(
            renderLayoutEditor(dashboard)
        );

        const widgetSection = createElement("section", "widget-section");
        const widgetHeading = createElement("div", "widget-heading");
        const widgetTitle = createElement("h2", "", "Widgets");
        const addWidget = createButton(
            "+ Widget hinzufügen",
            "widget-add",
            "",
            "button primary compact"
        );
        const list = createElement("div", "widget-list");
        const widgets = sortedWidgets(dashboard);

        widgetHeading.appendChild(widgetTitle);
        widgetHeading.appendChild(addWidget);
        widgetSection.appendChild(widgetHeading);

        if (widgets.length === 0) {
            list.appendChild(createElement(
                "p",
                "empty-state",
                "Dieses Dashboard enthält noch keine Widgets."
            ));
        } else {
            widgets.forEach(function (widget, index) {
                list.appendChild(
                    renderWidgetCard(dashboard, widget, index, widgets.length)
                );
            });
        }

        widgetSection.appendChild(list);
        elements.dashboardEditor.appendChild(widgetSection);
    }

    function renderAll() {
        layoutDragState = null;
        layoutResizeState = null;
        renderDashboardList();
        renderSummarySettings();
        renderErrorSettings();
        renderEntityRules();
        renderEditor();
        updateDirtyState();
    }

    function renderSummarySettings() {
        const settings = admin.SystemDashboards.getSummarySettings();

        elements.summaryShowMediaTitles.checked = settings.showMediaTitles;
    }

    function renderErrorSettings() {
        const settings = admin.SystemDashboards.getErrorSettings();
        const labelMode = settings.criticalDetectionMode === "ha_label";

        elements.criticalModeDeviceClass.checked = !labelMode;
        elements.criticalModeLabel.checked = labelMode;
        elements.criticalLabelControls.hidden = !labelMode;
        elements.criticalLabelSelect.textContent = "";

        const labelPlaceholder = createElement("option", "", "Label auswählen …");
        labelPlaceholder.value = "";
        elements.criticalLabelSelect.appendChild(labelPlaceholder);

        (criticalLabels.labels || []).forEach(function (label) {
            const option = createElement("option", "", label.name);
            option.value = label.id;
            option.selected = label.id === settings.criticalLabelId;
            elements.criticalLabelSelect.appendChild(option);
        });

        const selectedExists = (criticalLabels.labels || []).some(function (label) {
            return label.id === settings.criticalLabelId;
        });
        let warning = "";

        if (labelMode && criticalLabels.source.status === "unsupported") {
            warning = "Die Home-Assistant-Label-Registry wird nicht unterstützt.";
        } else if (labelMode && criticalLabels.source.status === "error") {
            warning = "Die Label-Registry ist derzeit nicht verfügbar.";
        } else if (labelMode && criticalLabels.source.status === "stale") {
            warning = "Es werden zuletzt erfolgreich geladene Labels angezeigt.";
        } else if (labelMode && settings.criticalLabelId && !selectedExists) {
            warning = "Das gespeicherte Label existiert nicht mehr.";
            const missing = createElement(
                "option",
                "",
                "Gelöschtes Label (" + settings.criticalLabelId + ")"
            );
            missing.value = settings.criticalLabelId;
            missing.selected = true;
            elements.criticalLabelSelect.appendChild(missing);
        } else if (labelMode && !settings.criticalLabelId) {
            warning = "Bitte vor dem Speichern ein Label auswählen.";
        }

        elements.criticalLabelWarning.textContent = warning;
        elements.criticalLabelSelect.disabled =
            criticalLabels.source.status === "unsupported" ||
            criticalLabels.source.status === "error";
    }

    function entityRuleSettings() {
        const summary = admin.SystemDashboards.getSummarySettings();
        const errors = admin.SystemDashboards.getErrorSettings();

        return {
            summaryIgnoredEntities: summary.ignoredEntities,
            securityEntities: errors.securityEntities,
            errorIgnoredEntities: errors.ignoredEntities
        };
    }

    function rebuildEntityRuleIndex(entities) {
        const inventory = (entities || []).slice();
        const known = Object.create(null);
        const configured = entityRuleSettings();

        inventory.forEach(function (entity) {
            known[entity.entity_id] = true;
        });

        [
            configured.summaryIgnoredEntities,
            configured.securityEntities,
            configured.errorIgnoredEntities
        ].forEach(function (entityIds) {
            entityIds.forEach(function (entityId) {
                if (!known[entityId]) {
                    inventory.push({
                        entity_id: entityId,
                        domain: entityId.split(".")[0],
                        friendly_name: entityId,
                        area_name: null,
                        device_name: null,
                        inventory_missing: true
                    });
                    known[entityId] = true;
                }
            });
        });

        entityRuleIndex = admin.EntityRules.createIndex(inventory);
    }

    function configuredEntityCount() {
        const lookup = admin.EntityRules.createLookup(entityRuleSettings());
        const configured = Object.create(null);

        [lookup.summaryIgnore, lookup.securityRelevant, lookup.errorIgnore]
            .forEach(function (rules) {
                Object.keys(rules).forEach(function (entityId) {
                    configured[entityId] = true;
                });
            });

        return Object.keys(configured).length;
    }

    function renderEntityRuleSummary() {
        const count = configuredEntityCount();

        elements.entityRulesConfiguredCount.textContent = count === 0
            ? "Keine Entity konfiguriert."
            : count === 1
                ? "1 Entity mit mindestens einer Regel."
                : count + " Entities mit mindestens einer Regel.";
    }

    function populateEntityRuleFilter(select, values, emptyLabel) {
        const selected = select.value;
        select.textContent = "";

        const empty = createElement("option", "", emptyLabel);
        empty.value = "";
        select.appendChild(empty);

        values.forEach(function (value) {
            const option = createElement("option", "", value);
            option.value = value;
            select.appendChild(option);
        });

        select.value = values.indexOf(selected) !== -1 ? selected : "";
    }

    function populateEntityRuleFilters() {
        populateEntityRuleFilter(
            elements.entityRuleAreaFilter,
            admin.EntityRules.options(entityRuleIndex, "area"),
            "Alle Bereiche"
        );
        populateEntityRuleFilter(
            elements.entityRuleDomainFilter,
            admin.EntityRules.options(entityRuleIndex, "domain"),
            "Alle Domains"
        );
    }

    function createEntityRuleOption(entity, ruleName, label, checked) {
        const wrapper = createElement("label", "entity-rule-option");
        const input = createElement("input");

        input.type = "checkbox";
        input.checked = checked;
        input.dataset.entityRule = ruleName;
        input.dataset.entityId = entity.entity_id;
        wrapper.appendChild(input);
        wrapper.appendChild(createElement("span", "", label));
        return wrapper;
    }

    function createEntityRuleCard(entity) {
        const card = createElement("article", "entity-rule-card");
        const identity = createElement("div", "entity-rule-identity");
        const rules = createElement("div", "entity-rule-options");
        const current = admin.SystemDashboards.getEntityRules(entity.entity_id);
        const context = [];

        identity.appendChild(createElement(
            "strong",
            "entity-rule-name",
            entity.friendly_name || entity.entity_id
        ));
        identity.appendChild(createElement(
            "code",
            "entity-rule-id",
            entity.entity_id
        ));

        if (entity.area_name) {
            context.push(entity.area_name);
        }
        if (entity.device_name) {
            context.push(entity.device_name);
        }
        identity.appendChild(createElement(
            "span",
            "entity-rule-context",
            context.length > 0
                ? context.join(" · ")
                : "Kein Bereich/Gerät zugeordnet"
        ));
        identity.appendChild(createElement(
            "span",
            "entity-rule-domain",
            entity.domain
        ));

        rules.appendChild(createEntityRuleOption(
            entity,
            "summaryIgnore",
            "In Summary ignorieren",
            current.summaryIgnore
        ));
        rules.appendChild(createEntityRuleOption(
            entity,
            "securityRelevant",
            "Sicherheitsrelevant",
            current.securityRelevant
        ));
        rules.appendChild(createEntityRuleOption(
            entity,
            "errorIgnore",
            "In Errors ignorieren",
            current.errorIgnore
        ));

        card.appendChild(identity);
        card.appendChild(rules);
        return card;
    }

    function renderEntityRules() {
        const result = admin.EntityRules.filter(
            entityRuleIndex,
            entityRuleSettings(),
            {
                query: elements.entityRuleSearch.value,
                area: elements.entityRuleAreaFilter.value,
                domain: elements.entityRuleDomainFilter.value,
                device: elements.entityRuleDeviceFilter.value,
                configuredOnly: entityRulesConfiguredOnly
            }
        );

        elements.entityRuleList.textContent = "";
        elements.entityRulesShowAll.classList.toggle(
            "is-active",
            !entityRulesConfiguredOnly
        );
        elements.entityRulesShowAll.setAttribute(
            "aria-pressed",
            entityRulesConfiguredOnly ? "false" : "true"
        );
        elements.entityRulesShowConfigured.classList.toggle(
            "is-active",
            entityRulesConfiguredOnly
        );
        elements.entityRulesShowConfigured.setAttribute(
            "aria-pressed",
            entityRulesConfiguredOnly ? "true" : "false"
        );

        if (entityRuleLoadError) {
            elements.entityRuleStatus.textContent = entityRuleLoadError;
        } else if (result.limited) {
            elements.entityRuleStatus.textContent =
                result.entities.length + " von " + result.total +
                " Treffern angezeigt. Suche oder Filter weiter eingrenzen.";
        } else {
            elements.entityRuleStatus.textContent = result.total === 1
                ? "1 Entity gefunden."
                : result.total + " Entities gefunden.";
        }

        if (result.entities.length === 0) {
            elements.entityRuleList.appendChild(createElement(
                "p",
                "entity-rule-empty",
                entityRuleLoadError || "Keine passende Entity gefunden."
            ));
        } else {
            result.entities.forEach(function (entity) {
                elements.entityRuleList.appendChild(createEntityRuleCard(entity));
            });
        }

        renderEntityRuleSummary();
        updateDirtyState();
    }

    function openDashboardForm(mode) {
        const dashboard = admin.State.getSelectedDashboard();
        elements.dashboardDialogMode.value = mode;
        elements.dashboardSourceId.value = mode === "duplicate" && dashboard
            ? dashboard.id
            : "";
        elements.dashboardDialogTitle.textContent = mode === "duplicate"
            ? "Dashboard duplizieren"
            : "Dashboard erstellen";
        elements.dashboardTitleInput.value = mode === "duplicate" && dashboard
            ? dashboard.title + " Kopie"
            : "";
        elements.dashboardIdInput.value = mode === "duplicate" && dashboard
            ? slugify(dashboard.id + "-kopie")
            : "";
        elements.dashboardFormError.textContent = "";
        elements.dashboardIdInput.dataset.automatic = "true";
        openDialog(elements.dashboardDialog);
        elements.dashboardTitleInput.focus();
    }

    function populateIconSelect() {
        elements.widgetIconInput.textContent = "";
        admin.Widgets.ICONS.forEach(function (iconName) {
            const option = createElement("option", "", iconName);
            option.value = iconName;
            elements.widgetIconInput.appendChild(option);
        });
    }

    function openWidgetForm(widget, mode, entity) {
        pendingEntity = entity || null;
        elements.widgetDialogMode.value = mode;
        elements.widgetIdInput.value = widget.id || "";
        elements.widgetDialogTitle.textContent = mode === "create"
            ? "Widget hinzufügen"
            : "Widget bearbeiten";
        elements.widgetEntityValue.textContent = widget.entity;
        elements.widgetTypeValue.textContent = widget.type;
        elements.widgetTitleInput.value = widget.title;
        elements.widgetSubtitleInput.value = widget.subtitle;
        elements.widgetIconInput.value = widget.icon;
        elements.widgetUnitInput.value = widget.unit;
        elements.widgetOrderInput.value = String(widget.order);
        elements.widgetSizeInput.value = widget.size || "normal";
        elements.widgetVisibleInput.checked = widget.visible;
        elements.widgetFormError.textContent = "";
        openDialog(elements.widgetDialog);
        elements.widgetTitleInput.focus();
    }

    function openWidgetEditor(widgetId) {
        const dashboard = admin.State.getSelectedDashboard();
        const widget = dashboard.widgets.find(function (item) {
            return item.id === widgetId;
        });

        if (!widget) {
            showNotice("Widget wurde nicht gefunden.", true);
            return;
        }

        openWidgetForm(widget, "edit", null);
    }

    function renderEntities() {
        const filtered = admin.Entities.filter(
            admin.State.getEntities(),
            elements.entitySearch.value,
            elements.entityDomainFilter.value
        );
        elements.entityList.textContent = "";

        if (entityLoadError) {
            elements.entityStatus.textContent = entityLoadError;
        } else {
            elements.entityStatus.textContent = filtered.length === 1
                ? "1 unterstützte Entity"
                : filtered.length + " unterstützte Entities";
        }

        if (filtered.length === 0) {
            elements.entityList.appendChild(createElement(
                "p",
                "empty-state",
                entityLoadError || "Keine passende Entity gefunden."
            ));
            return;
        }

        filtered.forEach(function (entity) {
            const button = createElement("button", "entity-button");
            const details = [
                entity.domain,
                entity.device_class,
                entity.unit_of_measurement
            ].filter(Boolean).join(" · ");

            button.type = "button";
            button.dataset.entityId = entity.entity_id;
            button.appendChild(createElement(
                "span",
                "entity-name",
                entity.friendly_name || entity.entity_id
            ));
            button.appendChild(createElement(
                "span",
                "entity-id",
                entity.entity_id
            ));
            button.appendChild(createElement(
                "span",
                "entity-details",
                details
            ));
            elements.entityList.appendChild(button);
        });
    }

    function refreshVisiblePreviews() {
        const dashboard = admin.State.getSelectedDashboard();

        if (!dashboard || layoutDragState || layoutResizeState) {
            return;
        }

        elements.dashboardEditor
            .querySelectorAll("[data-layout-widget-id]")
            .forEach(function (tile) {
                const widget = dashboard.widgets.find(function (item) {
                    return item.id === tile.dataset.layoutWidgetId;
                });
                const layoutItem = dashboard.layouts[activeLayoutProfile]
                    .items[tile.dataset.layoutWidgetId];
                const current = tile.querySelector(".layout-card-preview");

                if (widget && layoutItem && current) {
                    tile.replaceChild(
                        renderLivePreview(widget, layoutItem, activeLayoutProfile),
                        current
                    );
                }
            });
    }

    async function loadEntityInventory() {
        entityRuleLoadError = "";

        try {
            const result = await admin.Api.getEntities();
            const entities = result.entities || [];

            admin.State.setEntities(entities);
            rebuildEntityRuleIndex(entities);
            populateEntityRuleFilters();
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                throw error;
            }
            entityRuleLoadError = errorMessage(error);
            admin.State.setEntities([]);
            rebuildEntityRuleIndex([]);
            populateEntityRuleFilters();
        }
    }

    async function loadPreviewEntities() {
        entityLoadError = "";

        try {
            const result = await admin.Api.getPreview();
            admin.State.setPreviewEntities(result.entities || []);
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                if (previewRefreshTimer !== null) {
                    window.clearInterval(previewRefreshTimer);
                    previewRefreshTimer = null;
                }
                admin.Auth.clearToken();
                showLogin(errorMessage(error));
                return;
            }
            entityLoadError = errorMessage(error);
            admin.State.setPreviewEntities([]);
        }
    }

    async function loadEntities() {
        await loadEntityInventory();
        await loadPreviewEntities();
    }

    function renderDiagnosticsStatus(payload) {
        const names = [
            ["entityRegistry", "Entity Registry"],
            ["deviceRegistry", "Device Registry"],
            ["areaRegistry", "Area Registry"],
            ["labelRegistry", "Label Registry"],
            ["configEntries", "Config Entries"],
            ["repairs", "Repairs"],
            ["matter", "Matter Diagnostics"]
        ];
        const labels = {
            available: "Verfügbar",
            unsupported: "Nicht unterstützt",
            stale: "Veraltet",
            error: "Fehler"
        };
        const sources = payload && payload.sources
            ? payload.sources
            : {};

        elements.diagnosticSourcesList.textContent = "";

        names.forEach(function (definition) {
            const source = sources[definition[0]] || {status: "error"};
            const row = createElement("div", "diagnostic-source-row");
            const title = createElement("dt", "", definition[1]);
            const status = createElement(
                "dd",
                "diagnostic-source-status is-" + source.status,
                labels[source.status] || labels.error
            );

            row.appendChild(title);
            row.appendChild(status);
            elements.diagnosticSourcesList.appendChild(row);
        });
    }

    async function loadDiagnosticsStatus() {
        try {
            renderDiagnosticsStatus(
                await admin.Api.getDiagnosticsStatus()
            );
        } catch (error) {
            renderDiagnosticsStatus(null);
        }
    }

    async function loadCriticalLabels() {
        try {
            criticalLabels = await admin.Api.getLabels();
        } catch (error) {
            criticalLabels = {labels: [], source: {status: "error"}};
        }
    }

    async function loadAdministration() {
        const configuration = await admin.Api.getConfiguration();
        admin.State.setConfiguration(configuration);
        showAdministration();
        renderAll();
        await loadEntities();
        await loadCriticalLabels();
        await loadDiagnosticsStatus();
        renderSummarySettings();
        renderErrorSettings();
        renderEntityRules();
        refreshVisiblePreviews();

        if (previewRefreshTimer !== null) {
            window.clearInterval(previewRefreshTimer);
        }

        previewRefreshTimer = window.setInterval(
            async function () {
                await loadPreviewEntities();
                refreshVisiblePreviews();
            },
            15000
        );
    }

    async function handleLogin(event) {
        event.preventDefault();
        elements.loginError.textContent = "";
        elements.loginButton.disabled = true;
        elements.loginButton.textContent = "Prüft …";

        try {
            admin.Auth.setToken(
                elements.adminToken.value,
                elements.rememberToken.checked
            );
            await loadAdministration();
        } catch (error) {
            admin.Auth.clearToken();
            showLogin(errorMessage(error));
        } finally {
            elements.loginButton.disabled = false;
            elements.loginButton.textContent = "Anmelden";
        }
    }

    async function saveConfiguration() {
        hideNotice();
        setSaving(true);

        try {
            const saved = await admin.Api.saveConfiguration(
                admin.State.clone(admin.State.getDraft())
            );
            admin.State.setConfiguration(saved);
            rebuildEntityRuleIndex(admin.State.getEntities());
            renderAll();
            showNotice("Änderungen wurden gespeichert.", false);
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                showLogin(errorMessage(error));
            } else {
                showNotice(errorMessage(error), true);
            }
        } finally {
            setSaving(false);
        }
    }

    function discardConfiguration() {
        admin.State.discard();
        rebuildEntityRuleIndex(admin.State.getEntities());
        hideNotice();
        renderAll();
    }

    function handleEditorInput(event) {
        const dashboard = admin.State.getSelectedDashboard();

        if (!dashboard || !event.target.dataset.field) {
            return;
        }

        if (event.target.dataset.field === "dashboard-title") {
            dashboard.title = event.target.value;
            admin.State.markDirty();
            updateDirtyState();
        }
    }

    function handleEditorChange(event) {
        const dashboard = admin.State.getSelectedDashboard();

        if (!dashboard) {
            return;
        }

        try {
            if (event.target.dataset.field === "dashboard-title") {
                admin.Dashboards.update(dashboard.id, {
                    title: event.target.value
                });
                renderDashboardList();
                renderEditor();
            } else if (event.target.dataset.field === "dashboard-refresh") {
                admin.Dashboards.update(dashboard.id, {
                    refreshIntervalMs: event.target.value
                });
                renderEditor();
            } else if (
                event.target.dataset.field === "dashboard-default" &&
                event.target.checked
            ) {
                admin.Dashboards.setDefault(dashboard.id);
                renderAll();
            }
        } catch (error) {
            showNotice(error.message, true);
        }

        updateDirtyState();
    }

    function handleEditorClick(event) {
        const button = event.target.closest("button[data-action]");
        const dashboard = admin.State.getSelectedDashboard();

        if (!button || !dashboard) {
            return;
        }

        hideNotice();

        try {
            if (button.dataset.action === "layout-profile") {
                activeLayoutProfile = button.dataset.id;
                renderEditor();
            } else if (button.dataset.action === "preview-theme") {
                previewTheme = button.dataset.id === "dark"
                    ? "dark"
                    : "light";
                renderEditor();
            } else if (button.dataset.action.indexOf("layout-") === 0) {
                let changed = false;

                if (button.dataset.action === "layout-left") {
                    changed = admin.Layout.move(dashboard.id, button.dataset.id, activeLayoutProfile, -1, 0);
                } else if (button.dataset.action === "layout-right") {
                    changed = admin.Layout.move(dashboard.id, button.dataset.id, activeLayoutProfile, 1, 0);
                } else if (button.dataset.action === "layout-up") {
                    changed = admin.Layout.move(dashboard.id, button.dataset.id, activeLayoutProfile, 0, -1);
                } else if (button.dataset.action === "layout-down") {
                    changed = admin.Layout.move(dashboard.id, button.dataset.id, activeLayoutProfile, 0, 1);
                } else if (button.dataset.action === "layout-narrower") {
                    changed = admin.Layout.resize(dashboard.id, button.dataset.id, activeLayoutProfile, -1, 0);
                } else if (button.dataset.action === "layout-wider") {
                    changed = admin.Layout.resize(dashboard.id, button.dataset.id, activeLayoutProfile, 1, 0);
                } else if (button.dataset.action === "layout-shorter") {
                    changed = admin.Layout.resize(dashboard.id, button.dataset.id, activeLayoutProfile, 0, -1);
                } else if (button.dataset.action === "layout-taller") {
                    changed = admin.Layout.resize(dashboard.id, button.dataset.id, activeLayoutProfile, 0, 1);
                }

                if (changed) {
                    renderAll();
                } else {
                    showNotice("Diese Rasteränderung ist wegen Grenze, Mindestgröße oder Kollision nicht möglich.", true);
                }
            } else if (button.dataset.action === "dashboard-duplicate") {
                openDashboardForm("duplicate");
            } else if (button.dataset.action === "dashboard-delete") {
                if (window.confirm(
                    "Dashboard „" + dashboard.title + "“ wirklich löschen?"
                )) {
                    admin.Dashboards.remove(dashboard.id);
                    renderAll();
                }
            } else if (button.dataset.action === "widget-add") {
                elements.entitySearch.value = "";
                elements.entityDomainFilter.value = "";
                renderEntities();
                openDialog(elements.entityDialog);
                elements.entitySearch.focus();
            } else if (button.dataset.action === "widget-edit") {
                openWidgetEditor(button.dataset.id);
            } else if (button.dataset.action === "widget-visible") {
                const widget = dashboard.widgets.find(function (item) {
                    return item.id === button.dataset.id;
                });
                admin.Widgets.setVisibility(
                    dashboard.id,
                    button.dataset.id,
                    !widget.visible
                );
                renderAll();
            } else if (button.dataset.action === "widget-up") {
                admin.Widgets.move(dashboard.id, button.dataset.id, "up");
                renderAll();
            } else if (button.dataset.action === "widget-down") {
                admin.Widgets.move(dashboard.id, button.dataset.id, "down");
                renderAll();
            } else if (button.dataset.action === "widget-remove") {
                const widget = dashboard.widgets.find(function (item) {
                    return item.id === button.dataset.id;
                });
                if (window.confirm(
                    "Widget „" + widget.title + "“ wirklich entfernen?"
                )) {
                    admin.Widgets.remove(dashboard.id, button.dataset.id);
                    renderAll();
                }
            }
        } catch (error) {
            showNotice(error.message, true);
        }
    }

    function layoutGridFromEvent(event) {
        return event.target.closest("[data-layout-grid]");
    }

    function layoutCandidate(grid, clientX, clientY, item, offsetX, offsetY) {
        const cell = admin.Layout.cellFromPoint(
            grid,
            activeLayoutProfile,
            clientX,
            clientY
        );

        return {
            x: cell.x + (offsetX || 0),
            y: cell.y + (offsetY || 0),
            w: item.w,
            h: item.h
        };
    }

    function showLayoutPreview(grid, candidate, valid, widget) {
        const preview = grid.querySelector(".layout-preview");
        const previewWidth = Math.max(1, candidate.w);
        const previewHeight = Math.max(1, candidate.h);
        preview.hidden = false;
        preview.className = valid
            ? "layout-preview is-valid"
            : "layout-preview is-invalid";
        preview.style.gridColumn = (candidate.x + 1) + " / span " + previewWidth;
        preview.style.gridRow = (candidate.y + 1) + " / span " + previewHeight;
        preview.textContent = "";
        if (widget) {
            preview.appendChild(
                renderLivePreview(widget, candidate, activeLayoutProfile)
            );
        }
    }

    function hideLayoutPreview(grid) {
        const preview = grid && grid.querySelector(".layout-preview");
        if (preview) {
            preview.hidden = true;
        }
    }

    function handleLayoutPointerDown(event) {
        const grid = layoutGridFromEvent(event);
        const dashboard = admin.State.getSelectedDashboard();
        const resizeHandle = event.target.closest("[data-layout-resize]");
        const tile = event.target.closest("[data-layout-widget-id]");

        if (!grid || !tile || event.target.closest(".layout-control-button")) {
            return;
        }

        const widgetId = tile.dataset.layoutWidgetId;
        const item = admin.State.clone(
            dashboard.layouts[activeLayoutProfile].items[widgetId]
        );

        if (resizeHandle) {
            layoutResizeState = {
                pointerId: event.pointerId,
                widgetId: widgetId,
                item: item,
                startX: event.clientX,
                startY: event.clientY,
                grid: grid
            };
        } else {
            const grabCell = admin.Layout.cellFromPoint(
                grid,
                activeLayoutProfile,
                event.clientX,
                event.clientY
            );
            layoutDragState = {
                pointerId: event.pointerId,
                widgetId: widgetId,
                item: item,
                grid: grid,
                offsetX: item.x - grabCell.x,
                offsetY: item.y - grabCell.y
            };
        }

        event.preventDefault();
        if (typeof tile.setPointerCapture === "function") {
            tile.setPointerCapture(event.pointerId);
        }
    }

    function handleLayoutPointerMove(event) {
        const dashboard = admin.State.getSelectedDashboard();
        let state;
        let candidate;

        if (layoutResizeState && layoutResizeState.pointerId === event.pointerId) {
            state = layoutResizeState;
            const columns = admin.Layout.COLUMNS[activeLayoutProfile];
            const columnWidth = state.grid.getBoundingClientRect().width / columns;
            const rowHeight = Number(state.grid.dataset.rowHeight) || 194;
            candidate = {
                x: state.item.x,
                y: state.item.y,
                w: state.item.w + Math.round((event.clientX - state.startX) / columnWidth),
                h: state.item.h + Math.round((event.clientY - state.startY) / rowHeight)
            };
        } else if (layoutDragState && layoutDragState.pointerId === event.pointerId) {
            state = layoutDragState;
            candidate = layoutCandidate(
                state.grid,
                event.clientX,
                event.clientY,
                state.item,
                state.offsetX,
                state.offsetY
            );
        } else {
            return;
        }

        state.candidate = candidate;
        showLayoutPreview(
            state.grid,
            candidate,
            admin.Layout.canPlace(
                dashboard.id,
                state.widgetId,
                activeLayoutProfile,
                candidate
            ),
            dashboard.widgets.find(function (widget) {
                return widget.id === state.widgetId;
            })
        );
    }

    function finishLayoutPointer(event) {
        const dashboard = admin.State.getSelectedDashboard();
        const state = layoutResizeState && layoutResizeState.pointerId === event.pointerId
            ? layoutResizeState
            : layoutDragState && layoutDragState.pointerId === event.pointerId
                ? layoutDragState
                : null;

        if (!state) {
            return;
        }

        const changed = state.candidate && admin.Layout.place(
            dashboard.id,
            state.widgetId,
            activeLayoutProfile,
            state.candidate
        );
        hideLayoutPreview(state.grid);
        layoutResizeState = null;
        layoutDragState = null;

        if (changed) {
            renderAll();
        } else if (state.candidate) {
            showNotice("Die Rasteränderung ist dort nicht möglich.", true);
        }
    }

    function handleDashboardForm(event) {
        event.preventDefault();
        elements.dashboardFormError.textContent = "";

        try {
            if (elements.dashboardDialogMode.value === "duplicate") {
                admin.Dashboards.duplicate(
                    elements.dashboardSourceId.value,
                    elements.dashboardIdInput.value,
                    elements.dashboardTitleInput.value
                );
            } else {
                admin.Dashboards.create(
                    elements.dashboardIdInput.value,
                    elements.dashboardTitleInput.value
                );
            }

            closeDialog(elements.dashboardDialog);
            renderAll();
        } catch (error) {
            elements.dashboardFormError.textContent = error.message;
        }
    }

    function handleEntitySelection(event) {
        const button = event.target.closest("button[data-entity-id]");

        if (!button) {
            return;
        }

        const entity = admin.State.getEntities().find(function (item) {
            return item.entity_id === button.dataset.entityId;
        });
        const suggestion = admin.Widgets.suggestionForEntity(entity);

        if (!suggestion) {
            elements.entityStatus.textContent =
                "Diese Entity-Domain wird nicht unterstützt.";
            return;
        }

        const dashboard = admin.State.getSelectedDashboard();
        const maxOrder = dashboard.widgets.reduce(function (maximum, widget) {
            return Math.max(maximum, widget.order);
        }, 0);

        closeDialog(elements.entityDialog);
        openWidgetForm({
            id: "",
            entity: entity.entity_id,
            type: suggestion.type,
            title: suggestion.title,
            subtitle: suggestion.subtitle,
            icon: suggestion.icon,
            unit: suggestion.unit,
            order: maxOrder + 10,
            visible: true,
            size: "normal"
        }, "create", entity);
    }

    function widgetFormValues() {
        return {
            title: elements.widgetTitleInput.value,
            subtitle: elements.widgetSubtitleInput.value,
            icon: elements.widgetIconInput.value,
            unit: elements.widgetUnitInput.value,
            order: elements.widgetOrderInput.value,
            size: elements.widgetSizeInput.value,
            visible: elements.widgetVisibleInput.checked
        };
    }

    function handleWidgetForm(event) {
        event.preventDefault();
        elements.widgetFormError.textContent = "";

        const dashboard = admin.State.getSelectedDashboard();

        try {
            if (elements.widgetDialogMode.value === "create") {
                admin.Widgets.create(
                    dashboard.id,
                    pendingEntity,
                    widgetFormValues()
                );
            } else {
                admin.Widgets.update(
                    dashboard.id,
                    elements.widgetIdInput.value,
                    widgetFormValues()
                );
            }

            closeDialog(elements.widgetDialog);
            pendingEntity = null;
            renderAll();
        } catch (error) {
            elements.widgetFormError.textContent = error.message;
        }
    }

    function collectElements() {
        [
            "loginView", "loginForm", "adminToken", "rememberToken",
            "loginButton", "loginError", "adminView", "logoutButton",
            "connectionStatus", "globalNotice", "dashboardList",
            "newDashboardButton", "dashboardEditor", "saveBar",
            "saveButton", "discardButton", "dashboardDialog",
            "dashboardForm", "dashboardDialogMode", "dashboardSourceId",
            "dashboardDialogTitle", "dashboardTitleInput", "dashboardIdInput",
            "dashboardFormError", "entityDialog", "entitySearch",
            "entityDomainFilter", "entityStatus", "entityList",
            "widgetDialog", "widgetForm", "widgetDialogMode", "widgetIdInput",
            "widgetDialogTitle", "widgetEntityValue", "widgetTypeValue",
            "widgetTitleInput", "widgetSubtitleInput", "widgetIconInput",
            "widgetUnitInput", "widgetOrderInput", "widgetSizeInput",
            "widgetVisibleInput",
            "widgetFormError", "summaryShowMediaTitles",
            "entityRulesConfiguredCount", "openEntityRulesButton",
            "entityRulesDialog", "entityRuleSearch",
            "entityRuleAreaFilter", "entityRuleDomainFilter",
            "entityRuleDeviceFilter", "entityRulesShowAll",
            "entityRulesShowConfigured", "entityRuleStatus",
            "entityRuleList", "entityRulesDirtyState",
            "entityRulesDiscardButton", "entityRulesSaveButton",
            "criticalModeDeviceClass",
            "criticalModeLabel", "criticalLabelControls",
            "criticalLabelSelect", "criticalLabelWarning",
            "diagnosticSourcesList"
        ].forEach(function (id) {
            elements[id] = byId(id);
        });
    }

    function bindEvents() {
        elements.loginForm.addEventListener("submit", handleLogin);
        elements.logoutButton.addEventListener("click", function () {
            if (previewRefreshTimer !== null) {
                window.clearInterval(previewRefreshTimer);
                previewRefreshTimer = null;
            }
            admin.Auth.clearToken();
            admin.State.clear();
            entityRuleIndex = [];
            entityRuleLoadError = "";
            hideNotice();
            showLogin("");
        });
        elements.dashboardList.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-dashboard-id]");
            if (button) {
                admin.State.selectDashboard(button.dataset.dashboardId);
                renderAll();
            }
        });
        elements.newDashboardButton.addEventListener("click", function () {
            openDashboardForm("create");
        });
        elements.dashboardEditor.addEventListener("click", handleEditorClick);
        elements.dashboardEditor.addEventListener("input", handleEditorInput);
        elements.dashboardEditor.addEventListener("change", handleEditorChange);
        elements.dashboardEditor.addEventListener("pointerdown", handleLayoutPointerDown);
        elements.dashboardEditor.addEventListener("pointermove", handleLayoutPointerMove);
        elements.dashboardEditor.addEventListener("pointerup", finishLayoutPointer);
        elements.dashboardEditor.addEventListener("pointercancel", finishLayoutPointer);
        elements.dashboardForm.addEventListener("submit", handleDashboardForm);
        elements.dashboardTitleInput.addEventListener("input", function () {
            if (elements.dashboardIdInput.dataset.automatic === "true") {
                elements.dashboardIdInput.value = slugify(
                    elements.dashboardTitleInput.value
                );
            }
        });
        elements.dashboardIdInput.addEventListener("input", function () {
            elements.dashboardIdInput.dataset.automatic = "false";
        });
        elements.entitySearch.addEventListener("input", renderEntities);
        elements.entityDomainFilter.addEventListener("change", renderEntities);
        elements.entityList.addEventListener("click", handleEntitySelection);
        elements.summaryShowMediaTitles.addEventListener("change", function () {
            admin.SystemDashboards.setShowMediaTitles(
                elements.summaryShowMediaTitles.checked
            );
            updateDirtyState();
        });
        elements.openEntityRulesButton.addEventListener("click", function () {
            renderEntityRules();
            openDialog(elements.entityRulesDialog);
            elements.entityRuleSearch.focus();
        });
        elements.entityRuleSearch.addEventListener("input", renderEntityRules);
        elements.entityRuleAreaFilter.addEventListener("change", renderEntityRules);
        elements.entityRuleDomainFilter.addEventListener("change", renderEntityRules);
        elements.entityRuleDeviceFilter.addEventListener("input", renderEntityRules);
        elements.entityRulesShowAll.addEventListener("click", function () {
            entityRulesConfiguredOnly = false;
            renderEntityRules();
        });
        elements.entityRulesShowConfigured.addEventListener("click", function () {
            entityRulesConfiguredOnly = true;
            renderEntityRules();
        });
        elements.entityRuleList.addEventListener("change", function (event) {
            const input = event.target;

            if (!input.dataset || !input.dataset.entityRule) {
                return;
            }

            if (admin.SystemDashboards.setEntityRule(
                input.dataset.entityId,
                input.dataset.entityRule,
                input.checked
            )) {
                if (entityRulesConfiguredOnly) {
                    renderEntityRules();
                } else {
                    renderEntityRuleSummary();
                    updateDirtyState();
                }
            }
        });
        elements.criticalModeDeviceClass.addEventListener("change", function () {
            if (elements.criticalModeDeviceClass.checked) {
                admin.SystemDashboards.setCriticalDetectionMode("device_class");
                renderErrorSettings();
                updateDirtyState();
            }
        });
        elements.criticalModeLabel.addEventListener("change", function () {
            if (elements.criticalModeLabel.checked) {
                admin.SystemDashboards.setCriticalDetectionMode("ha_label");
                renderErrorSettings();
                updateDirtyState();
            }
        });
        elements.criticalLabelSelect.addEventListener("change", function () {
            admin.SystemDashboards.setCriticalLabelId(
                elements.criticalLabelSelect.value
            );
            renderErrorSettings();
            updateDirtyState();
        });
        elements.widgetForm.addEventListener("submit", handleWidgetForm);
        elements.saveButton.addEventListener("click", saveConfiguration);
        elements.entityRulesSaveButton.addEventListener("click", saveConfiguration);
        elements.discardButton.addEventListener("click", discardConfiguration);
        elements.entityRulesDiscardButton.addEventListener(
            "click",
            discardConfiguration
        );
        document.querySelectorAll("[data-close-dialog]").forEach(function (button) {
            button.addEventListener("click", function () {
                closeDialog(byId(button.dataset.closeDialog));
            });
        });
        window.addEventListener("beforeunload", function (event) {
            if (!admin.State.isDirty()) {
                return;
            }
            event.preventDefault();
            event.returnValue = "";
        });
    }

    async function initialize() {
        collectElements();
        populateIconSelect();
        bindEvents();

        if (admin.Auth.hasToken()) {
            try {
                await loadAdministration();
                return;
            } catch (error) {
                admin.Auth.clearToken();
                showLogin(errorMessage(error));
                return;
            }
        }

        showLogin("");
    }

    document.addEventListener("DOMContentLoaded", initialize);
}(window.HALegacyAdmin = window.HALegacyAdmin || {}));
