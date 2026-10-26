/* Modern, isolated static portal. Never loaded by src/public or the HA App. */
(function () {
    "use strict";
    const Model = window.TestReports;
    const Words = window.TestWording;
    const KEY = "ha-legacy-community-runs-v1";
    const $ = id => document.getElementById(id);
    let catalog, guides, runs = [], active = null, selected = null, pending = null, storageOK = true;
    let newDraft = true;
    const message = text => { $("message").textContent = text; };
    const resetSharing = () => { $("issue-summary").value = ""; $("redaction").checked = false; };
    const clone = value => JSON.parse(JSON.stringify(value));
    const explain = errors => errors.map(Words.error).join("\n");
    const guideFor = test => guides.guides.find(guide => guide.testId === test.id);
    function readonly() { return active && Model.validate(active, catalog).mismatch; }
    function persist() {
        try { localStorage.setItem(KEY, JSON.stringify(runs)); storageOK = true; }
        catch (_) { storageOK = false; }
        $("storage-message").textContent = storageOK ? "Nur in diesem Browser gespeichert. Lade die Berichtsdatei regelmäßig als Sicherung herunter." : "Browserspeicher nicht verfügbar oder voll. Jetzt die Berichtsdatei herunterladen, bevor du die Seite schließt. Sonst gehen neue Angaben verloren.";
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
            $("storage-message").textContent = "Entwürfe bleiben nur in diesem Browser. Deine Berichtsdatei ist die Sicherung: regelmäßig herunterladen.";
        } catch (_) {
            storageOK = false;
            $("storage-message").textContent = "Browserspeicher konnte nicht gelesen werden. Vorhandene Daten bleiben erhalten. Neue Berichte bitte herunterladen. Alte Daten nur nach eigener Sicherung bewusst löschen.";
        }
    }
    function saveActive() {
        resetSharing();
        const index = runs.findIndex(run => run.testRunId === active.testRunId);
        if (index < 0) runs.push(active); else runs[index] = active;
        if (storageOK) persist();
        else $("storage-message").textContent = "Nicht dauerhaft gespeichert. Bitte jetzt Bericht herunterladen. Alte unlesbare Daten werden nicht überschrieben.";
        renderRuns(); renderList();
    }
    function renderRuns() {
        const select = $("runs"); select.replaceChildren();
        const placeholder = document.createElement("option"); placeholder.value = ""; placeholder.textContent = "Bericht auswählen"; select.append(placeholder);
        runs.forEach(run => {
            const option = document.createElement("option"); option.value = run.testRunId;
            option.textContent = run.environment.dashboardVersion + " · " + run.testerId + " · " + run.testRunId;
            option.selected = active?.testRunId === run.testRunId; select.append(option);
        });
        $("active-run").textContent = active ? "Dein Bericht: " + active.testRunId + " · " + active.environment.dashboardVersion + (readonly() ? " · andere Testanleitungen: nur ansehen" : "") : "Angaben ausfüllen und Bericht beginnen – oder einen gespeicherten Bericht fortsetzen.";
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
        form.elements.dataKind.value = active.dataKind || "manual";
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
        filters.testIds = $("pilot-only").checked ? window.TestPilot.testIds : null;
        const scope = $("help-scope").value;
        const tests = Model.select(catalog, active, filters).filter(test => scope === "all" || (scope === "community" ? Boolean(guideFor(test)) : !guideFor(test)));
        $("test-list").replaceChildren();
        tests.forEach(test => {
            const li = document.createElement("li"), button = document.createElement("button");
            button.type = "button"; button.dataset.testId = test.id;
            const result = active?.results.find(item => item.testId === test.id);
            const guide = guideFor(test);
            button.textContent = test.id + " · " + (guide ? guide.title : "Technische Prüfung – gemeinsam mit der Betreuung");
            const badge = document.createElement("span"); badge.className = "badge";
            badge.textContent = Words.labels[result?.status || "NOT_TESTED"] + (test.readiness !== "READY" ? " · Anleitung unvollständig" : "") + (test.executionState === "BLOCKED" ? " · wartet auf Fehlerbehebung: " + test.blockedBy.join(", ") : "");
            button.append(badge); button.addEventListener("click", () => showTest(test.id)); li.append(button); $("test-list").append(li);
        });
        $("visible-count").textContent = tests.length + " von " + catalog.testCount + " Prüfungen sichtbar. Zwölf haben eine Schritt-für-Schritt-Erklärung; weitere technische Prüfungen findest du unter Alle Tests." + ($("pilot-only").checked ? " Die elf Pilotprüfungen sind ausgewählt; ihre Voraussetzungen gelten weiterhin." : "");
        const empty = {results: []};
        const totals = Model.counts(active || empty, catalog);
        $("counts").textContent = "Dein ganzer Bericht – unabhängig vom Filter: " + Object.entries(totals).map(([status, number]) => Words.labels[status] + ": " + number).join(" · ") + ". Nicht passende und nicht geprüfte Tests zählen nicht als bestanden.";
    }
    function resultHelp() {
        const status = $("result-form").elements.status.value;
        const help = {
            PASS: "Nur wählen, wenn alle erforderlichen Schritte und erwarteten Ergebnisse geprüft sind – einschließlich nötiger Kontrollen durch die Betreuung. Einzelne erfolgreiche Schritte reichen nicht. Entfallene bedingte Schritte begründen.",
            FAIL: "Du hast etwas ausprobiert und ein Problem gesehen. Beschreibe unten Erwartung, Beobachtung und deine Schritte. Die Ursache musst du nicht kennen. Nicht ausgeführte Folgeschritte in den Notizen nennen.",
            BLOCKED: "Du kannst nicht beginnen oder weitermachen, zum Beispiel weil eine Karte, ein Gerät, technische Hilfe oder eine verständliche Anleitung fehlt. Schreibe, bei welchem Schritt du hängenbleibst. Bereits gesehene Produktfehler stattdessen als Etwas stimmt nicht melden.",
            NOT_TESTED: "Diesen Test hast du noch nicht ausprobiert. Es wird kein Erfolg daraus abgeleitet.",
            "N/A": "Dieser Test ist nach Absprache grundsätzlich nicht für dein System vorgesehen. Bitte begründen. Fehlt nur eine vereinbarte Vorbereitung, wähle Ich komme nicht weiter."
        };
        $("status-help").textContent = help[status];
        $("complete-confirm").hidden = status !== "PASS";
        $("notes-label").textContent = status === "BLOCKED" || status === "N/A" ? "Warum kannst du nicht weitermachen oder warum passt der Test nicht? *" : "Notizen – auch nicht ausgeführte Schritte nennen (freiwillig)";
        document.querySelectorAll("[data-result-field]").forEach(label => { label.hidden = status !== "FAIL"; });
    }
    function showTest(id) {
        selected = catalog.tests.find(test => test.id === id);
        if (!selected) return;
        const guide = guideFor(selected);
        $("detail").hidden = false; $("test-title").textContent = selected.id + " · " + (guide ? guide.title : "Technische Prüfung mit Betreuung");
        $("test-state").textContent = (selected.readiness === "READY" ? "Anleitung vollständig beschrieben. " : "Anleitung noch unvollständig – nicht als erfolgreich abschließen. ") + (selected.executionState === "BLOCKED" ? "Wartet auf Fehlerbehebung – kein vollständiger Erfolg möglich. " : "") + "Prüfe das vorgeschriebene Gerät und alle Voraussetzungen." + (readonly() ? " Andere Testanleitungen im geladenen Bericht: nur ansehen, nicht verändern." : "");
        const content = $("test-content"); content.replaceChildren();
        const paragraph = (title, text) => {
            const heading = document.createElement("h3"), body = document.createElement("p");
            heading.textContent = title; body.textContent = text; content.append(heading, body);
        };
        if (guide) {
            paragraph("Darum geht es", guide.goal); paragraph("Das brauchst du – und wer hilft", guide.preparation);
            const heading = document.createElement("h3"); heading.textContent = "So gehst du vor"; content.append(heading);
            const list = document.createElement("ol"); guide.steps.forEach(step => { const li = document.createElement("li"); li.textContent = step; list.append(li); }); content.append(list);
            paragraph("So sieht ein richtiges Ergebnis aus", guide.expected);
            paragraph("Das wäre ein Fehler", guide.failIf); paragraph("Das schreibst du auf", guide.record);
        } else paragraph("Diese Prüfung braucht technische Begleitung", "Für diese Prüfung gibt es noch keine einfache Durchführungshilfe. Bitte vereinbare die Vorbereitung und den Ablauf mit deinem Ansprechpartner. Die vollständigen technischen Originalanforderungen stehen unten. Nichts erraten, keine Ausfälle oder Datenlöschungen auf deinem Alltagssystem auslösen. Fehlt Hilfe oder ist ein Schritt unklar, notiere Ich komme nicht weiter und die betroffene Testnummer.");
        paragraph("Belege festhalten", "Notiere Gerät, installierte Version, Schrittnummer und genaue Beobachtung. Falls sicher möglich, ein bereinigtes Bildschirmfoto machen. Manche Prüfungen benötigen zusätzliche technische Nachweise durch die Betreuung; siehe Originalanforderungen. Keine Zugangsdaten oder privaten Namen weitergeben.");
        const original = document.createElement("details"), label = document.createElement("summary"), source = document.createElement("pre");
        label.textContent = "Vollständige technische Originalanforderungen und Zuordnung";
        source.textContent = selected.title + "\n" + selected.metadata + "\n\n" + selected.sections.map(section => section.title + "\n" + section.text).join("\n\n") + "\nQuelle: " + selected.source.file + ":" + selected.source.line + "\nFehlerbehebungen: " + (selected.repairs.join(", ") || "keine dokumentiert");
        original.append(label, source); content.append(original);
        const result = active?.results.find(item => item.testId === id) || Model.blank(id);
        const form = $("result-form"); form.reset();
        ["status", "expected", "actual", "reproductionSteps", "notes", "issueUrl", "evidence"].forEach(key => { form.elements[key].value = result[key]; });
        resultHelp();
        $("save-result").disabled = !active || Boolean(readonly()) || selected.readiness !== "READY";
        $("test-title").focus();
    }
    function setup() {
        options("category", catalog.tests.map(test => test.category)); options("sprint", catalog.tests.flatMap(test => test.sprints)); options("device", catalog.tests.map(test => test.device));
        ["search", "category", "sprint", "deployment", "device", "filter-status", "readiness", "pilot-only", "help-scope"].forEach(id => $(id).addEventListener("input", renderList));
        $("result-form").elements.status.addEventListener("change", () => { $("complete-check").checked = false; resultHelp(); });
        Words.glossary.forEach(([term, explanation]) => { const dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = term; dd.textContent = explanation; $("glossary").append(dt, dd); });
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
            if (!newDraft && (candidate.dataKind || "manual") !== form.elements.dataKind.value && candidate.results.some(result => result.status !== "NOT_TESTED")) return message("Eine andere Berichtsart benötigt einen neuen Lauf. Synthetische Ergebnisse dürfen nicht als manuelle Beobachtungen umdeklariert werden.");
            candidate.dataKind = form.elements.dataKind.value;
            delete candidate.exportedAt;
            candidate.environment = environment; candidate.testerId = form.elements.testerId.value.trim(); candidate.notes = form.elements.notes.value.trim(); candidate.issueUrl = form.elements.issueUrl.value.trim(); candidate.updatedAt = now;
            const check = Model.validate(candidate, catalog);
            if (!check.valid) return message(explain(check.errors));
            active = candidate; newDraft = false; $("deployment").value = environment.deployment; saveActive(); if (selected) showTest(selected.id); message("Bericht gespeichert: " + active.testRunId);
        });
        $("result-form").addEventListener("submit", event => {
            event.preventDefault(); if (!active || !selected || readonly()) return message("Zuerst einen passenden Lauf starten.");
            const candidate = clone(active), form = event.currentTarget;
            const result = Model.blank(selected.id);
            ["status", "expected", "actual", "reproductionSteps", "notes", "issueUrl", "evidence"].forEach(key => { result[key] = form.elements[key].value.trim(); });
            if (selected.readiness !== "READY") return message("Diese Anleitung ist unvollständig. Bitte deinen Ansprechpartner informieren; vorhandene Ergebnisse bleiben erhalten.");
            if (result.status === "PASS" && !$("complete-check").checked) return message("Bitte bestätige erst, dass du alle erforderlichen Schritte und Ergebnisse geprüft hast. Ein Teilerfolg ist noch kein vollständig erfolgreicher Test.");
            candidate.updatedAt = new Date().toISOString(); result.testedAt = result.status === "NOT_TESTED" ? null : candidate.updatedAt;
            delete candidate.exportedAt;
            const index = candidate.results.findIndex(item => item.testId === selected.id);
            if (index < 0) candidate.results.push(result); else candidate.results[index] = result;
            const check = Model.validate(candidate, catalog); if (!check.valid) return message(explain(check.errors));
            if (result.status === "PASS" && selected.executionState === "BLOCKED") return message("Dieser Test wartet auf eine Fehlerbehebung und kann nicht vollständig erfolgreich abgeschlossen werden. Bitte das Hindernis dokumentieren.");
            active = candidate; saveActive(); message(selected.id + ": " + Words.labels[result.status] + " gespeichert.");
        });
        $("export").addEventListener("click", () => {
            if (!active) return;
            const exported = Model.prepareExport(active, new Date().toISOString());
            const check = Model.validate(exported, catalog); if (!check.valid) return message(explain(check.errors));
            const blob = new Blob([JSON.stringify(exported, null, 2) + "\n"], {type: "application/json;charset=utf-8"});
            const link = document.createElement("a"), url = URL.createObjectURL(blob); link.href = url;
            link.download = "test-" + active.environment.dashboardVersion.replace(/[^a-zA-Z0-9.-]/g, "-") + "-" + active.testRunId + ".json";
            link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); message("Bericht heruntergeladen. Bewahre die Datei als Sicherung auf und gib sie nach deiner Datenschutzprüfung weiter.");
        });
        $("import-file").addEventListener("change", async event => {
            pending = null; $("import-preview").hidden = true;
            const file = event.target.files[0]; if (!file) return;
            try {
                if (file.size > Model.MAX_BYTES || !/\.json$/i.test(file.name)) throw new Error("Nur .json bis 2 MiB importieren.");
                pending = Model.parse(await file.text(), catalog);
                const existing = runs.find(run => run.testRunId === pending.report.testRunId);
                pending.conflict = Boolean(existing && Model.observationJSON(existing) !== Model.observationJSON(pending.report));
                $("import-summary").textContent = Words.summary(pending.report, catalog, Model) + "\n" + explain(pending.warnings) + (pending.conflict ? "\nKONFLIKT: dieselbe Berichtskennung mit anderem Inhalt. Nichts wird überschrieben oder gemischt. Beide Dateien sichern und deinem Ansprechpartner geben." : "\nEigenständiger Bericht; andere Berichte bleiben unverändert.");
                $("accept-mismatch").checked = false; $("confirm-import").disabled = pending.conflict; $("import-preview").hidden = false;
            } catch (error) { message(Words.error(error.message)); }
            event.target.value = "";
        });
        $("confirm-import").addEventListener("click", () => {
            if (!pending || pending.conflict) return;
            if (runs.length >= 100 && !runs.some(run => run.testRunId === pending.report.testRunId)) return message("Maximal 100 lokale Läufe. Vor weiterem Import zuerst exportieren und bewusst bereinigen.");
            if (pending.warnings.length && !$("accept-mismatch").checked) return message("Importabweichungen zuerst ausdrücklich bestätigen.");
            const existing = runs.find(run => run.testRunId === pending.report.testRunId);
            active = clone(existing || pending.report); newDraft = false; saveActive(); fillForm(); selected = null; $("detail").hidden = true; $("import-preview").hidden = true; pending = null; message(existing ? "Identischer Lauf fortgesetzt; gespeicherte Ergebnisse bleiben erhalten." : "Import als eigenständiger Lauf übernommen. Katalogabweichungen bleiben nur lesend.");
        });
        $("cancel-import").addEventListener("click", () => { pending = null; $("import-preview").hidden = true; });
        $("clear").addEventListener("click", () => {
            if (!confirm("ALLE lokalen Testläufe löschen? Diese Aktion ist nicht rückgängig zu machen. Zuerst jeden benötigten Lauf als JSON exportieren.")) return;
            try { localStorage.removeItem(KEY); storageOK = true; } catch (_) { message("Lokale Daten konnten nicht gelöscht werden."); return; }
            runs = []; active = null; selected = null; newDraft = true; resetSharing(); $("detail").hidden = true; fillForm(); renderRuns(); renderList(); message("Lokale Testläufe gelöscht.");
        });
        const review = () => { if (!$("redaction").checked) { message("Vor dem Teilen die Datenschutzprüfung bestätigen."); return false; } return true; };
        $("make-summary").addEventListener("click", () => { if (active && review()) $("issue-summary").value = Words.summary(active, catalog, Model); });
        $("copy-summary").addEventListener("click", async () => {
            if (!active || !review()) return;
            const text = Words.summary(active, catalog, Model); $("issue-summary").value = text;
            try { await navigator.clipboard.writeText(text); message("Zusammenfassung kopiert."); }
            catch (_) { $("issue-summary").focus(); $("issue-summary").select(); message("Bitte die markierte Zusammenfassung manuell kopieren."); }
        });
        ["issue-link", "bug-link"].forEach(id => $(id).addEventListener("click", event => { if (!review()) event.preventDefault(); }));
        renderRuns(); renderList();
    }
    // Two same-origin static files only. No HA, GitHub API or telemetry calls.
    const request = new XMLHttpRequest(); request.open("GET", "data/test-catalog.json?v=" + Model.TEST_CENTER_VERSION);
    request.timeout = 10000;
    request.onload = () => {
        try {
            if (request.status !== 200) throw new Error("Katalog konnte nicht geladen werden.");
            catalog = JSON.parse(request.responseText);
            if (catalog.schemaVersion !== "1.0" || !Array.isArray(catalog.tests) || catalog.testCount !== catalog.tests.length) throw new Error("Ungültiger Katalog.");
            const help = new XMLHttpRequest(); help.open("GET", "data/test-guides.de.json?v=" + Model.TEST_CENTER_VERSION); help.timeout = 10000;
            help.onload = () => {
                try {
                    if (help.status !== 200) throw new Error("Erklärungen konnten nicht geladen werden. Bitte neu laden; gespeicherte Berichte bleiben erhalten.");
                    guides = JSON.parse(help.responseText);
                    if (guides.schemaVersion !== "1.0" || guides.catalogHash !== catalog.catalogHash || !Array.isArray(guides.guides)) throw new Error("Erklärungen passen nicht zur Testliste. Bitte neu laden; vorhandene Berichte bleiben unverändert.");
                    load(); setup(); $("catalog-info").textContent = "Test-Center " + Model.TEST_CENTER_VERSION + " · " + catalog.catalogVersion + " · " + catalog.testCount + " Tests";
                    message("Bereit. Angaben eintragen oder bisherigen Bericht fortsetzen. Die Schritt-für-Schritt-Prüfungen sind vorausgewählt.");
                } catch (error) { message(error.message); }
            };
            help.onerror = help.ontimeout = () => message("Erklärungen nicht erreichbar. Bitte neu laden; deine gespeicherten Berichte bleiben erhalten.");
            help.send();
        } catch (error) { message(error.message); }
    };
    request.onerror = request.ontimeout = () => message("Katalog nicht erreichbar. Seite über HTTP(S) öffnen und neu laden.");
    request.send();
}());
