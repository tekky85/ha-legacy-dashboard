/*
 * Machine-checked traceability for Sprint 27.1-F.
 *
 * Every numbered historical test requirement is covered exactly once by a
 * direct test, a documented equivalent regression or a manual queue entry.
 */

function evidence(file, contains) {
    return {file: file, contains: contains || null};
}

function block(from, to, coverage, evidenceItems, note) {
    return {
        from: from,
        to: to,
        coverage: coverage,
        evidence: evidenceItems || [],
        note: note || ""
    };
}

module.exports = {
    "21.4": {
        total: 75,
        spec: "docs/sprints/SPRINT-21.4.md",
        start: "# Tests – Entity Rule Manager",
        blocks: [
            block(1, 21, "direct", [evidence("test/sprint-21-4.test.js", "Entity Rule Manager sucht Metadaten und kombiniert Filter"), evidence("test/sprint-21-4.test.js", "Drei Entity-Regeln teilen einen lokalen Batch-Entwurf")]),
            block(22, 30, "direct", [evidence("test/sprint-21-4.test.js", "Drei Entity-Regeln teilen einen lokalen Batch-Entwurf"), evidence("test/admin-api.test.js", "Admin-API ist geschützt")]),
            block(31, 38, "direct", [evidence("test/sprint-21-4.test.js", "3000 Entities bleiben auf 100 DOM-Kandidaten begrenzt")]),
            block(39, 56, "direct", [evidence("test/sprint-21-4.test.js", "System-Header zeigt Total nur einmal"), evidence("test/system-frontend.test.js", "Summary-Filter nutzen Serverkategorien"), evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups")]),
            block(57, 62, "equivalent", [evidence("test/sprint-21-3.test.js", "Device-Class- und Cover-Policy"), evidence("test/sprint-21-3.test.js", "Label-Modus berücksichtigt Device und Entity")]),
            block(63, 68, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(69, 75, "direct", [evidence("test/sprint-21-4.test.js", "System-Header zeigt Total nur einmal"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder")])
        ]
    },
    "21.5": {
        total: 73,
        spec: "docs/sprints/SPRINT-21.5.md",
        start: "# Teil I – Tests Health Indicator",
        blocks: [
            block(1, 13, "direct", [evidence("test/sprint-21-5.test.js", "Status fasst Issues klein zusammen"), evidence("test/sprint-21-5.test.js", "Health Indicator blendet nur frisches Healthy"), evidence("test/sprint-21-5.test.js", "Stale, unbekannt und Last-known Critical")]),
            block(14, 25, "direct", [evidence("test/sprint-21-5.test.js", "Summary bleibt auf Default und Custom Dashboard"), evidence("test/sprint-21-5.test.js", "System-Dashboards erhalten exaktes Return Target")]),
            block(26, 33, "direct", [evidence("test/sprint-21-5.test.js", "Return Target verhindert Open Redirects")]),
            block(34, 40, "direct", [evidence("test/sprint-21-5.test.js", "Health nutzt vorhandenen Dashboard-Refresh"), evidence("test/gateway.test.js", "System-Dashboard-APIs teilen einen reduzierten Snapshot")]),
            block(41, 47, "direct", [evidence("test/sprint-21-5.test.js", "Sprint 21.5 bleibt ES5, Grid-frei")]),
            block(48, 48, "manual", ["MT-40", "MT-41"], "Reale Touchziel- und HomeScreen-Wirkung."),
            block(49, 59, "equivalent", [evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups"), evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt"), evidence("test/sprint-21-4.test.js", "Entity Rule Manager sucht Metadaten")]),
            block(60, 67, "equivalent", [evidence("test/sprint-25-2.test.js", "Dashboard-Navigation bleibt in normalem Safari"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(68, 73, "direct", [evidence("test/sprint-21-5.test.js", "Sprint 21.5 bleibt ES5, Grid-frei"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")])
        ]
    },
    "22": {
        total: 80,
        spec: "docs/sprints/SPRINT-22.md",
        start: "# Teil K – Tests Grace",
        blocks: [
            block(1, 10, "direct", [evidence("test/sprint-22.test.js", "Grace Periods unterscheiden Zustand und Risk Class"), evidence("test/sprint-22.test.js", "Gateway-Neustart respektiert zuverlässiges last_changed")]),
            block(11, 18, "direct", [evidence("test/sprint-22.test.js", "Expected Offline bleibt von Ignore getrennt und schützt Critical Risks"), evidence("test/admin-ui.test.js", "Admin-Entwurf verwaltet Entity- und Device-Regeln")]),
            block(19, 27, "direct", [evidence("test/sprint-22.test.js", "Flapping nutzt nur einen begrenzten In-Memory-Ringbuffer")]),
            block(28, 32, "direct", [evidence("test/sprint-22.test.js", "Stable Recovery hält Issues bis zur stabilen Wiederherstellung"), evidence("test/sprint-22.test.js", "Health Status respektiert Grace")]),
            block(33, 41, "direct", [evidence("test/sprint-22.test.js", "Device Aggregation ergänzt Counts und konservativen Failure Hint")]),
            block(42, 48, "direct", [evidence("test/sprint-22.test.js", "Regelauflösung folgt Entity, Device, Security, Risk, Domain und Default")]),
            block(49, 56, "direct", [evidence("test/sprint-22.test.js", "Altes Schema migriert Regeln und validiert Grenzen"), evidence("test/admin-ui.test.js", "Admin-Entwurf verwaltet Entity- und Device-Regeln")]),
            block(57, 66, "equivalent", [evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups"), evidence("test/sprint-21-3.test.js", "Label-Modus berücksichtigt Device und Entity"), evidence("test/sprint-21-5.test.js", "Health nutzt vorhandenen Dashboard-Refresh")]),
            block(67, 73, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(74, 80, "direct", [evidence("test/sprint-22.test.js", "Sprint 22 bleibt read-only und fragt keine HA-History ab"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")])
        ]
    },
    "23": {
        total: 84,
        spec: "docs/sprints/SPRINT-23.md",
        start: "# Tests – Inventory",
        blocks: [
            block(1, 8, "direct", [evidence("test/sprint-23.test.js", "Automation Inventory normalisiert Zustände")]),
            block(9, 18, "direct", [evidence("test/sprint-23.test.js", "Reference Parser indexiert explizite Trigger")]),
            block(19, 27, "direct", [evidence("test/sprint-23.test.js", "Reference Index und Impact unterscheiden direct"), evidence("test/sprint-23.test.js", "Globaler Unknown-Kontext bleibt sanitisiert")]),
            block(28, 32, "direct", [evidence("test/sprint-23.test.js", "Automation off ist kein Issue")]),
            block(33, 42, "direct", [evidence("test/sprint-23.test.js", "Trace Summary trennt Fehler"), evidence("test/sprint-23.test.js", "Trace Capability unsupported")]),
            block(43, 50, "direct", [evidence("test/sprint-23.test.js", "Config Adapter nutzt feste Commands, Cache und Inflight-Deduplizierung"), evidence("test/sprint-23.test.js", "Reference Cache kombiniert gecachte Referenzen"), evidence("test/system-frontend.test.js", "Advanced Diagnostics lädt Trace Summaries ausschließlich on-demand")]),
            block(51, 57, "equivalent", [evidence("test/sprint-22.test.js", "Grace Periods unterscheiden Zustand und Risk Class"), evidence("test/sprint-22.test.js", "Expected Offline bleibt von Ignore getrennt"), evidence("test/sprint-22.test.js", "Flapping nutzt nur einen begrenzten"), evidence("test/sprint-22.test.js", "Stable Recovery hält Issues")]),
            block(58, 67, "equivalent", [evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups"), evidence("test/sprint-21-3.test.js", "Label-Modus berücksichtigt Device und Entity"), evidence("test/sprint-25-2.test.js", "Summary, Errors und Zurück verwenden dieselbe interne Navigation")]),
            block(68, 74, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(75, 84, "direct", [evidence("test/sprint-23.test.js", "Sprint 23 bleibt read-only, minimiert Payloads"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder")])
        ]
    },
    "25.1": {
        total: 74,
        spec: "docs/sprints/SPRINT-25.1.md",
        start: "# Tests – Theme",
        blocks: [
            block(1, 15, "direct", [evidence("test/sprint-17-2.test.js", "Dark und Light Theme überleben Reload"), evidence("test/sprint-17-2.test.js", "Theme-Fallback bleibt bei LocalStorage-Fehlern"), evidence("test/sprint-17-2.test.js", "Ungültige Theme-Werte")]),
            block(16, 47, "direct", [evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups ohne Cross-Child-Matches")]),
            block(48, 61, "equivalent", [evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt"), evidence("test/sprint-22.test.js", "Health Status respektiert Grace"), evidence("test/sprint-23.test.js", "Reference Index und Impact unterscheiden")]),
            block(62, 67, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(68, 74, "direct", [evidence("test/sprint-17-2.test.js", "Legacy-Routen laden dasselbe Theme früh"), evidence("test/sprint-25-2.test.js", "Sprint 25.2 bleibt ES5 und ändert keine Home-Assistant-Schreibfläche"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")])
        ]
    },
    "25.2": {
        total: 51,
        spec: "docs/sprints/SPRINT-25.2.md",
        start: "# Tests",
        blocks: [
            block(1, 21, "direct", [evidence("test/sprint-25-2.test.js", "Dashboard-Navigation bleibt in normalem Safari und im HomeScreen-Fenster"), evidence("test/sprint-25-2.test.js", "Summary, Errors und Zurück verwenden dieselbe interne Navigation"), evidence("test/sprint-25-2.test.js", "Alle produktinternen Links sind frei von neuen Tabs")]),
            block(22, 27, "direct", [evidence("test/sprint-25-2.test.js", "Interne Navigation lehnt Origins, Protokolle und ungültige Return Targets ab")]),
            block(28, 34, "equivalent", [evidence("test/sprint-17-2.test.js", "Theme-Fallback bleibt bei LocalStorage-Fehlern"), evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups")]),
            block(35, 45, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/system-frontend.test.js", "Advanced Diagnostics lädt Trace Summaries ausschließlich on-demand"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(46, 48, "direct", [evidence("test/sprint-25-2.test.js", "Sprint 25.2 bleibt ES5 und ändert keine Home-Assistant-Schreibfläche")]),
            block(49, 51, "manual", ["MT-40", "MT-41"], "Reale Touch-, Portrait- und Landscape-HomeScreen-Prüfung.")
        ]
    },
    "25.3": {
        total: 84,
        spec: "docs/sprints/SPRINT-25.3.md",
        start: "# Tests Upload",
        blocks: [
            block(1, 10, "direct", [evidence("test/sprint-25-3.test.js", "Bildprüfung akzeptiert ausschließlich stimmige JPEG- und PNG-Dateien"), evidence("test/sprint-25-5.test.js", "manipulierte, getarnte, unvollständige und übergroße JPEGs"), evidence("test/admin-api.test.js", "Dashboard-Hintergründe sind geschützt")]),
            block(11, 17, "direct", [evidence("test/sprint-25-3.test.js", "Öffentliche Konfiguration trennt Dashboard-Hintergründe"), evidence("test/admin-api.test.js", "Dashboard-Hintergründe sind geschützt, typgeprüft und sicher ersetzbar")]),
            block(18, 18, "equivalent", [evidence("test/sprint-25-3.test.js", "Öffentliche Konfiguration trennt Dashboard-Hintergründe")]),
            block(19, 19, "manual", ["MT-60"], "Realer Standalone-Gateway-Neustart."),
            block(20, 20, "manual", ["MT-51", "MT-52"], "Realer Home-Assistant-App-Neustart und Restore."),
            block(21, 28, "direct", [evidence("test/sprint-25-3.test.js", "Dashboard-Hintergründe und optionale Titel werden vollständig validiert"), evidence("test/sprint-25-3.test.js", "Wall-Display nutzt ES5-Flexbox, Vollhöhe und optionale Titel")]),
            block(29, 30, "manual", ["MT-58"], "Reale Portrait-/Landscape-Geometrie auf iOS 9."),
            block(31, 38, "direct", [evidence("test/sprint-25-3.test.js", "Wall-Display nutzt ES5-Flexbox, Vollhöhe und optionale Titel")]),
            block(39, 50, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-25-2.test.js", "Dashboard-Navigation bleibt in normalem Safari"), evidence("test/sprint-17-2.test.js", "Dark und Light Theme überleben Reload"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(51, 60, "direct", [evidence("test/sprint-25-3.test.js", "Hintergrundfunktion erweitert keine Home-Assistant-Schreibrechte"), evidence("test/sprint-25-3.test.js", "PNG-Prüfung erzwingt CRC"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder")]),
            block(61, 76, "manual", ["MT-51", "MT-52", "MT-54", "MT-58", "MT-60"], "Reale Viewport-, Footer-, Rotation-, HomeScreen- und Runtime-Persistenzmatrix."),
            block(77, 84, "direct", [evidence("test/sprint-25-3.test.js", "Wall-Display nutzt ES5-Flexbox, Vollhöhe und optionale Titel"), evidence("test/asset-version.test.js", "Dashboard, System, Admin und Manifest verwenden eine gemeinsame Assetversion")])
        ]
    }
};
