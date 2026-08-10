(function (admin) {
    "use strict";

    const elements = {};
    let pendingEntity = null;
    let entityLoadError = "";

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
        elements.saveBar.hidden = !admin.State.isDirty();
    }

    function setSaving(saving) {
        elements.saveButton.disabled = saving;
        elements.discardButton.disabled = saving;
        elements.saveButton.textContent = saving
            ? "Speichert …"
            : "Änderungen speichern";
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
        renderDashboardList();
        renderEditor();
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

    async function loadEntities() {
        entityLoadError = "";

        try {
            const result = await admin.Api.getEntities();
            admin.State.setEntities(result.entities || []);
        } catch (error) {
            if (error.status === 401 || error.status === 403) {
                admin.Auth.clearToken();
                showLogin(errorMessage(error));
                return;
            }
            entityLoadError = errorMessage(error);
            admin.State.setEntities([]);
        }
    }

    async function loadAdministration() {
        const configuration = await admin.Api.getConfiguration();
        admin.State.setConfiguration(configuration);
        showAdministration();
        renderAll();
        await loadEntities();
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
            if (button.dataset.action === "dashboard-duplicate") {
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
            visible: true
        }, "create", entity);
    }

    function widgetFormValues() {
        return {
            title: elements.widgetTitleInput.value,
            subtitle: elements.widgetSubtitleInput.value,
            icon: elements.widgetIconInput.value,
            unit: elements.widgetUnitInput.value,
            order: elements.widgetOrderInput.value,
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
            "widgetUnitInput", "widgetOrderInput", "widgetVisibleInput",
            "widgetFormError"
        ].forEach(function (id) {
            elements[id] = byId(id);
        });
    }

    function bindEvents() {
        elements.loginForm.addEventListener("submit", handleLogin);
        elements.logoutButton.addEventListener("click", function () {
            admin.Auth.clearToken();
            admin.State.clear();
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
        elements.widgetForm.addEventListener("submit", handleWidgetForm);
        elements.saveButton.addEventListener("click", saveConfiguration);
        elements.discardButton.addEventListener("click", function () {
            admin.State.discard();
            hideNotice();
            renderAll();
        });
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
