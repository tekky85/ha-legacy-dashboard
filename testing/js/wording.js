/* Presentation only: no test definitions, IDs, results or acceptance rules. */
(function (root, factory) {
    "use strict";
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.TestWording = factory();
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";
    const labels = {PASS: "Hat wie erwartet funktioniert", FAIL: "Etwas stimmt nicht",
        BLOCKED: "Ich komme nicht weiter", NOT_TESTED: "Noch nicht ausprobiert", "N/A": "Passt nicht zu meinem System"};
    const glossary = [
        ["Dashboard", "Die Seite mit deinen Karten, zum Beispiel für Licht und Temperatur."],
        ["Admin", "Die Verwaltungsseite deines Dashboards. Dort stellst du Karten und Ansichten ein. Sie ist nicht das Test-Center."],
        ["Entity / Entität", "Ein einzelner Eintrag aus Home Assistant, zum Beispiel eine Lampe, ein Temperatursensor oder ein Thermostat."],
        ["Light / Climate", "Eine Lichtkarte / eine Heizungs- oder Klimakarte. Bei der Farbauswahl bedeutet Light dagegen Hell und Dark bedeutet Dunkel."],
        ["Grid", "Die normale Übersicht mit mehreren Karten."],
        ["Focus", "Die große Einzelansicht einer Karte. Tippe auf die Kartenfläche neben den Tasten, um sie zu öffnen."],
        ["Summary / Errors", "Die Seiten für die Übersicht und für Probleme. Die Bezeichnungen der App bleiben zum Wiederfinden genannt."],
        ["Theme", "Die helle oder dunkle Darstellung."],
        ["Portrait / Landscape", "Hochformat / Querformat: Halte das Gerät hochkant oder drehe es zur Seite."],
        ["HomeScreen", "Start über das Dashboard-Symbol auf dem Home-Bildschirm statt über ein normales Safari-Fenster."],
        ["unknown / unavailable", "Ein Wert ist unbekannt / ein Gerät ist nicht erreichbar. Solche Zustände nicht ohne sichere Testumgebung absichtlich erzeugen."],
        ["Mock / Fixture", "Vorbereitete künstliche Testdaten. Wenn du sie nicht bekommen hast, bitte den Ansprechpartner um Hilfe. Keine echten Sicherheitsgeräte dafür ausschalten."],
        ["Logs / Evidenz", "Protokoll / Beleg, zum Beispiel eine genaue Beobachtung oder ein von privaten Daten bereinigtes Bildschirmfoto."],
        ["JSON / Export / Import", "Deine Berichtsdatei / Datei herunterladen / zuvor gespeicherte Datei wieder laden. Du musst den Dateiinhalt nicht verstehen oder bearbeiten."],
        ["Koordinator", "Die Person, die dich zum Testen eingeladen hat und deine Ergebnisse entgegennimmt."],
        ["Architektur / amd64 / aarch64", "Die Art des Rechners, auf dem Home Assistant läuft. Wenn du sie nicht kennst, lass das freiwillige Feld leer."],
        ["Endpunkt / REST / WebSocket", "Technische Verbindungen der App. Diese Prüfungen mit jemandem durchführen, der die Testumgebung vorbereitet hat."],
        ["RQ / Sprint / Kataloghash", "Interne Zuordnung und Kennungen für die Entwicklung. Du musst sie nicht selbst ermitteln oder bearbeiten."]
    ];
    function error(text) {
        const value = String(text || "");
        if (/FAIL requires/.test(value)) return "Bitte beschreibe alle drei Punkte: Was sollte passieren? Was ist tatsächlich passiert? Wie kann man es wiederholen?";
        if (/explanation required/.test(value)) return "Bitte schreibe unter Warum kann ich nicht weitermachen?, was fehlt oder warum der Test nicht zu deinem System passt.";
        if (/dashboardVersion/.test(value)) return "Bitte trage die tatsächlich installierte App-Version ein, zum Beispiel 1.0.0-rc.8. Du findest sie auf der Informationsseite der App in Home Assistant oder unten in der Dashboard-Verwaltung.";
        if (/testerId|environment\.(browser|device|os)/.test(value)) return "Bitte fülle dein Kürzel, Testgerät, Betriebssystem und Browser aus. Bei fehlender genauer Versionsnummer reicht zum Beispiel Safari; bitte nicht raten.";
        if (/issueUrl/.test(value)) return "Der optionale GitHub-Verweis muss zu diesem Projekt gehören, zum Beispiel #123. Wenn du keinen hast, lass das Feld leer.";
        if (/Unsupported schemaVersion/.test(value)) return "Diese Berichtsdatei hat ein nicht unterstütztes Format. Behalte die Originaldatei und gib sie deinem Ansprechpartner; sie wird nicht verändert.";
        if (/Invalid JSON|Unsafe|unexpected field|invalid or duplicate|nesting|results must/.test(value)) return "Die Berichtsdatei ist beschädigt oder enthält nicht erlaubte Angaben. Sie wurde nicht übernommen. Deine vorhandenen Berichte bleiben erhalten. Gib die Originaldatei deinem Ansprechpartner.";
        if (/2 MiB|Report exceeds/.test(value)) return "Die Berichtsdatei ist zu groß. Erlaubt sind höchstens 2 MiB. Vorhandene Berichte bleiben erhalten.";
        if (/Catalog mismatch/.test(value)) return "Dieser Bericht gehört zu einer anderen Fassung der Testanleitungen. Du kannst ihn ansehen und herunterladen, aber hier nicht verändern. Originaldatei aufbewahren und mit deinem Ansprechpartner abstimmen.";
        if (/Unknown test ID/.test(value)) return "Der Bericht enthält eine Testnummer, die hier nicht bekannt ist. Die Ergebnisse werden nicht gelöscht; bitte mit deinem Ansprechpartner prüfen.";
        if (/Incomplete submission/.test(value)) return "Der Bericht enthält nicht alle Tests. Fehlende Tests bleiben Noch nicht ausprobiert und zählen nicht als bestanden.";
        if (/Legacy|export time/.test(value)) return "Älterer Bericht oder Entwurf: Einige zusätzliche Angaben fehlen. Die vorhandenen Ergebnisse bleiben erhalten; bitte die Hinweise mit deinem Ansprechpartner prüfen.";
        return "Eine Angabe ist ungültig. Prüfe die ausgefüllten Felder und die Längenangaben. Falls das nicht hilft, behalte die Datei und frage deinen Ansprechpartner. Bereits gespeicherte Ergebnisse bleiben erhalten.";
    }
    function summary(report, catalog, Model) {
        const counts = Model.counts(report, catalog);
        return [(report.dataKind === "synthetic" ? "NUR ÜBUNG – KEINE ECHTEN TESTERGEBNISSE\n" : "") + "Testbericht " + report.testRunId,
            "App-Version: " + report.environment.dashboardVersion, "Mein Kürzel: " + report.testerId,
            "Testgerät: " + report.environment.device + " / " + report.environment.os + " / " + report.environment.browser,
            "Ergebnisse: " + Object.keys(labels).map(key => labels[key] + ": " + counts[key]).join("; "),
            "Tests mit beobachteten Fehlern: " + (report.results.filter(item => item.status === "FAIL").map(item => item.testId).join(", ") || "keine"),
            "Testanleitungen: " + report.catalogVersion + " / " + report.catalogHash,
            "Dieser Bericht ersetzt keine vollständige Freigabe. Nicht geprüfte Tests zählen nicht als bestanden."] .join("\n");
    }
    return {labels, glossary, error, summary};
}));
