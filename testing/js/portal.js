/* Modern, isolated static portal. Never loaded by src/public or the HA App. */
(function () {
    "use strict";
    const Model = window.TestReports;
    const KEY = "ha-legacy-community-runs-v1";
    const $ = id => document.getElementById(id);
    let catalog, runs = [], active = null, selected = null, pending = null, storageOK = true;
    let newDraft = true;
    const message = text => { $("message").textContent = text; };
    const resetSharing = () => { $("issue-summary").value = ""; $("redaction").checked = false; };
    const clone = value => JSON.parse(JSON.stringify(value));
    function readonly() { return active && Model.validate(active, catalog).mismatch; }
    function persist() {
        try { localStorage.setItem(KEY, JSON.stringify(runs)); storageOK = true; }
        catch (_) { storageOK = false; }
        $("storage-message").textContent = storageOK ? "Nur in diesem Browser gespeichert. Für ein Backup JSON exportieren." : "Browserspeicher nicht verfügbar oder voll. Änderungen liegen nur im Arbeitsspeicher: jetzt JSON exportieren, bevor du die Seite schließt.";
    }
    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                if (new TextEncoder().encode(raw).length > 10 * Model.MAX_BYTES) throw new Error("Local store too large");
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed) || parsed.length > 100) throw new Error("Invalid local store");
                const seen = new Set();
                parsed.forEach(run => {
                    const check = Model.validate(run, catalog);
                    if (!check.valid || seen.has(run.testRunId)) throw new Error("Invalid local draft; original storage preserved");
                    seen.add(run.testRunId);
                });
                runs = parsed;
            }
            $("storage-message").textContent = "Entwürfe werden ausschließlich in diesem Browser gespeichert. Regelmäßig JSON exportieren.";
        } catch (_) {
            storageOK = false;
            $("storage-message").textContent = "Lokaler Speicher konnte nicht gelesen werden. Vorhandene Daten bleiben erhalten; exportiere neue Läufe. Lösche alte Daten nur ausdrücklich nach eigener Sicherung.";
        }
    }
    function saveActive() {
        resetSharing();
        const index = runs.findIndex(run => run.testRunId === active.testRunId);
        if (index < 0) runs.push(active); else runs[index] = active;
        if (storageOK) persist();
        else $("storage-message").textContent = "Nicht dauerhaft gespeichert. Bitte jetzt JSON exportieren. Alte unlesbare lokale Daten werden nicht überschrieben.";
        renderRuns(); renderList();
    }
    function renderRuns() {
        const select = $("runs"); select.replaceChildren();
        const placeholder = document.createElement("option"); placeholder.value = ""; placeholder.textContent = "Lauf auswählen"; select.append(placeholder);
        runs.forEach(run => {
            const option = document.createElement("option"); option.value = run.testRunId;
            option.textContent = run.environment.dashboardVersion + " · " + run.testerId + " · " + run.testRunId;
            option.selected = active?.testRunId === run.testRunId; select.append(option);
        });
        $("active-run").textContent = active ? "Aktiv: " + active.testRunId + " · " + active.environment.dashboardVersion + (readonly() ? " · anderer Katalog: nur lesend" : "") : "Neuen Lauf vorbereiten oder einen gespeicherten Lauf fortsetzen.";
        $("save-run").disabled = Boolean(readonly());
        $("export").disabled = !active;
        $("make-summary").disabled = !active;
        $("copy-summary").disabled = !active;
        $("save-result").disabled = !active || Boolean(readonly());
    }
    function fillForm() {
        const form = $("run-form"); form.reset();
        if (!active) return;
        ["testerId", "notes", "issueUrl"].forEach(key => { form.elements[key].value = active[key]; });
        Object.keys(active.environment).forEach(key => { form.elements[key].value = active.environment[key]; });
    }
    function options(id, values) {
        [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, {numeric: true})).forEach(value => {
            const option = document.createElement("option"); option.value = value; option.textContent = value; $(id).append(option);
        });
    }
    function renderList() {
        const filters = Object.fromEntries(["search", "category", "sprint", "deployment", "device", "readiness"].map(id => [id, $(id).value]));
        filters.status = $("filter-status").value;
        const tests = Model.select(catalog, active, filters);
        $("test-list").replaceChildren();
        tests.forEach(test => {
            const li = document.createElement("li"), button = document.createElement("button");
            button.type = "button"; button.dataset.testId = test.id;
            const result = active?.results.find(item => item.testId === test.id);
            button.textContent = test.id + " · " + test.title;
            const badge = document.createElement("span"); badge.className = "badge";
            badge.textContent = (result?.status || "NOT_TESTED") + " · " + test.readiness + (test.executionState === "BLOCKED" ? " · BLOCKED: " + test.blockedBy.join(", ") : "");
            button.append(badge); button.addEventListener("click", () => showTest(test.id)); li.append(button); $("test-list").append(li);
        });
        $("visible-count").textContent = tests.length + " von " + catalog.testCount + " Tests im Filter";
        const empty = {results: []};
        const totals = Model.counts(active || empty, catalog);
        $("counts").textContent = "Gesamter Lauf (unabhängig vom Filter): " + Object.entries(totals).map(([status, number]) => status + " " + number).join(" · ") + ". N/A zählt nicht als bestanden.";
    }
    function showTest(id) {
        selected = catalog.tests.find(test => test.id === id);
        if (!selected) return;
        $("detail").hidden = false; $("test-title").textContent = selected.id + " · " + selected.title;
        $("test-state").textContent = selected.readiness + " · " + selected.executionState + " · " + selected.deployments.join(", ") + "\nQuelle: " + selected.source.file + ":" + selected.source.line + " · " + selected.sourceTestId + "\nRepairs: " + (selected.repairs.join(", ") || "keine dokumentiert") + (readonly() ? "\nImportierter Katalog weicht ab: Ergebnisse bleiben unverändert, diese aktuellen Schritte gelten nicht als äquivalent." : "");
        const content = $("test-content"); content.replaceChildren();
        const meta = document.createElement("p"); meta.className = "source-text"; meta.textContent = selected.metadata; content.append(meta);
        selected.sections.forEach(section => {
            const heading = document.createElement("h3"); heading.textContent = section.title; content.append(heading);
            if (section.title === "Steps") {
                const list = document.createElement("ol"); selected.steps.forEach(step => { const li = document.createElement("li"); li.textContent = step; list.append(li); }); content.append(list);
            } else { const text = document.createElement("p"); text.className = "source-text"; text.textContent = section.text; content.append(text); }
        });
        const result = active?.results.find(item => item.testId === id) || Model.blank(id);
        const form = $("result-form"); form.reset();
        ["status", "expected", "actual", "reproductionSteps", "notes", "issueUrl", "evidence"].forEach(key => { form.elements[key].value = result[key]; });
        $("save-result").disabled = !active || Boolean(readonly()) || selected.readiness !== "READY";
        $("test-title").focus();
    }
    function setup() {
        options("category", catalog.tests.map(test => test.category)); options("sprint", catalog.tests.flatMap(test => test.sprints)); options("device", catalog.tests.map(test => test.device));
        ["search", "category", "sprint", "deployment", "device", "filter-status", "readiness"].forEach(id => $(id).addEventListener("input", renderList));
        $("new-run").addEventListener("click", () => {
            if (active && !confirm("Neuen Lauf vorbereiten? Der bisher gespeicherte Lauf bleibt erhalten. Ungespeicherte Eingaben im Formular gehen verloren.")) return;
            active = null; newDraft = true; selected = null; resetSharing(); $("detail").hidden = true; fillForm(); renderRuns(); renderList(); message("Neuer Lauf: Angaben ausfüllen und starten.");
        });
        $("resume").addEventListener("click", () => {
            const run = runs.find(item => item.testRunId === $("runs").value);
            if (!run) return message("Bitte einen gespeicherten Lauf auswählen.");
            active = run; newDraft = false; selected = null; resetSharing(); $("detail").hidden = true; fillForm(); renderRuns(); renderList(); message("Lauf fortgesetzt: " + active.testRunId);
        });
        $("run-form").addEventListener("submit", event => {
            event.preventDefault(); if (readonly()) return;
            if (newDraft && runs.length >= 100) return message("Maximal 100 lokale Läufe. Zuerst benötigte Läufe exportieren und lokale Daten bewusst bereinigen.");
            const form = event.currentTarget, now = new Date().toISOString();
            const environment = Object.fromEntries(["deployment", "dashboardVersion", "homeAssistantVersion", "architecture", "device", "os", "browser"].map(key => [key, form.elements[key].value.trim()]));
            const candidate = newDraft ? Model.create(catalog, form.elements.testerId.value.trim(), environment, "RUN-" + crypto.randomUUID(), now) : clone(active);
            if (newDraft && runs.some(run => run.testRunId === candidate.testRunId)) return message("Run-ID-Kollision: bitte erneut starten. Bestehende Ergebnisse bleiben erhalten.");
            if (!newDraft && candidate.environment.dashboardVersion !== environment.dashboardVersion && candidate.results.some(result => result.status !== "NOT_TESTED")) return message("Eine andere Softwareversion benötigt einen neuen Lauf. Der bisherige Lauf bleibt erhalten.");
            candidate.environment = environment; candidate.testerId = form.elements.testerId.value.trim(); candidate.notes = form.elements.notes.value.trim(); candidate.issueUrl = form.elements.issueUrl.value.trim(); candidate.updatedAt = now;
            const check = Model.validate(candidate, catalog);
            if (!check.valid) return message(check.errors.join("\n"));
            active = candidate; newDraft = false; saveActive(); if (selected) showTest(selected.id); message("Lauf gespeichert: " + active.testRunId);
        });
        $("result-form").addEventListener("submit", event => {
            event.preventDefault(); if (!active || !selected || readonly()) return message("Zuerst einen passenden Lauf starten.");
            const candidate = clone(active), form = event.currentTarget;
            const result = Model.blank(selected.id);
            ["status", "expected", "actual", "reproductionSteps", "notes", "issueUrl", "evidence"].forEach(key => { result[key] = form.elements[key].value.trim(); });
            candidate.updatedAt = new Date().toISOString(); result.testedAt = result.status === "NOT_TESTED" ? null : candidate.updatedAt;
            const index = candidate.results.findIndex(item => item.testId === selected.id);
            if (index < 0) candidate.results.push(result); else candidate.results[index] = result;
            const check = Model.validate(candidate, catalog); if (!check.valid) return message(check.errors.join("\n"));
            if (result.status === "PASS" && selected.executionState === "BLOCKED") return message("Dieser Katalogtest ist durch einen Produktrepair blockiert. BLOCKED dokumentieren oder einen aktualisierten Katalog verwenden.");
            active = candidate; saveActive(); message(selected.id + ": " + result.status + " gespeichert.");
        });
        $("export").addEventListener("click", () => {
            if (!active) return;
            const check = Model.validate(active, catalog); if (!check.valid) return message(check.errors.join("\n"));
            const blob = new Blob([JSON.stringify(active, null, 2) + "\n"], {type: "application/json;charset=utf-8"});
            const link = document.createElement("a"), url = URL.createObjectURL(blob); link.href = url;
            link.download = "test-" + active.environment.dashboardVersion.replace(/[^a-zA-Z0-9.-]/g, "-") + "-" + active.testRunId + ".json";
            link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); message("JSON exportiert. Die Datei ist dein Backup; bitte sicher aufbewahren.");
        });
        $("import-file").addEventListener("change", async event => {
            pending = null; $("import-preview").hidden = true;
            const file = event.target.files[0]; if (!file) return;
            try {
                if (file.size > Model.MAX_BYTES || !/\.json$/i.test(file.name)) throw new Error("Nur .json bis 2 MiB importieren.");
                pending = Model.parse(await file.text(), catalog);
                const existing = runs.find(run => run.testRunId === pending.report.testRunId);
                pending.conflict = Boolean(existing && JSON.stringify(existing) !== JSON.stringify(pending.report));
                $("import-summary").textContent = Model.summary(pending.report, catalog) + "\n" + pending.warnings.join("\n") + (pending.conflict ? "\nKONFLIKT: gleiche Run-ID mit anderem Inhalt. Kein Überschreiben oder Mischen. Beide Dateien sichern und Koordinator zur Prüfung geben." : "\nSeparater Lauf; andere Läufe bleiben unverändert.");
                $("accept-mismatch").checked = false; $("confirm-import").disabled = pending.conflict; $("import-preview").hidden = false;
            } catch (error) { message(error.message); }
            event.target.value = "";
        });
        $("confirm-import").addEventListener("click", () => {
            if (!pending || pending.conflict) return;
            if (runs.length >= 100 && !runs.some(run => run.testRunId === pending.report.testRunId)) return message("Maximal 100 lokale Läufe. Vor weiterem Import zuerst exportieren und bewusst bereinigen.");
            if (pending.warnings.length && !$("accept-mismatch").checked) return message("Importabweichungen zuerst ausdrücklich bestätigen.");
            active = clone(pending.report); newDraft = false; saveActive(); fillForm(); selected = null; $("detail").hidden = true; $("import-preview").hidden = true; pending = null; message("Import als eigenständiger Lauf übernommen. Katalogabweichungen bleiben nur lesend.");
        });
        $("cancel-import").addEventListener("click", () => { pending = null; $("import-preview").hidden = true; });
        $("clear").addEventListener("click", () => {
            if (!confirm("ALLE lokalen Testläufe löschen? Diese Aktion ist nicht rückgängig zu machen. Zuerst jeden benötigten Lauf als JSON exportieren.")) return;
            try { localStorage.removeItem(KEY); storageOK = true; } catch (_) { message("Lokale Daten konnten nicht gelöscht werden."); return; }
            runs = []; active = null; selected = null; newDraft = true; resetSharing(); $("detail").hidden = true; fillForm(); renderRuns(); renderList(); message("Lokale Testläufe gelöscht.");
        });
        const review = () => { if (!$("redaction").checked) { message("Vor dem Teilen die Datenschutzprüfung bestätigen."); return false; } return true; };
        $("make-summary").addEventListener("click", () => { if (active && review()) $("issue-summary").value = Model.summary(active, catalog); });
        $("copy-summary").addEventListener("click", async () => {
            if (!active || !review()) return;
            const text = Model.summary(active, catalog); $("issue-summary").value = text;
            try { await navigator.clipboard.writeText(text); message("Zusammenfassung kopiert."); }
            catch (_) { $("issue-summary").focus(); $("issue-summary").select(); message("Bitte die markierte Zusammenfassung manuell kopieren."); }
        });
        ["issue-link", "bug-link"].forEach(id => $(id).addEventListener("click", event => { if (!review()) event.preventDefault(); }));
        renderRuns(); renderList();
    }
    // Only a same-origin static catalog request. No HA, GitHub API or telemetry calls.
    const request = new XMLHttpRequest(); request.open("GET", "data/test-catalog.json");
    request.timeout = 10000;
    request.onload = () => {
        try {
            if (request.status !== 200) throw new Error("Katalog konnte nicht geladen werden.");
            catalog = JSON.parse(request.responseText);
            if (catalog.schemaVersion !== "1.0" || !Array.isArray(catalog.tests) || catalog.testCount !== catalog.tests.length) throw new Error("Ungültiger Katalog.");
            load(); setup(); $("catalog-info").textContent = catalog.catalogVersion + " · " + catalog.testCount + " Tests";
            message("Bereit. Gespeicherten Lauf fortsetzen oder neue Laufdaten eintragen.");
        } catch (error) { message(error.message); }
    };
    request.onerror = request.ontimeout = () => message("Katalog nicht erreichbar. Seite über HTTP(S) öffnen und neu laden.");
    request.send();
}());
