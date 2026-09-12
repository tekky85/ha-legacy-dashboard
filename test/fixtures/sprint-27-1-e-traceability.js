/*
 * Machine-checked traceability for Sprint 27.1-E.
 *
 * Every numbered historical test requirement is covered exactly once by a
 * direct test, a documented equivalent regression, a manual queue entry or a
 * conditional N/A. The validator expands these ranges to individual IDs.
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
    "19": {
        total: 70,
        spec: "docs/sprints/SPRINT-19.md",
        blocks: [
            block(1, 31, "direct", [evidence("test/summary.test.js", "Sprint-19-Zustandsmatrix")], "Explizite Domain-/State-Tabelle einschließlich unknown/unavailable."),
            block(32, 35, "direct", [evidence("test/summary.test.js", "Priorität, Kategorie, Dauer und Titel")]),
            block(36, 38, "direct", [evidence("test/summary.test.js", "Sprint-19-Ignore-Matrix")]),
            block(39, 39, "direct", [evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")]),
            block(40, 45, "equivalent", [evidence("test/gateway.test.js", "System-Dashboard-APIs teilen einen reduzierten Snapshot"), evidence("test/system-frontend.test.js", "Summary-Shell zeigt Online, Stale und Recovery")]),
            block(46, 51, "equivalent", [evidence("test/admin-ui.test.js", "Admin-Entwurf verwaltet Summary-Privatsphäre"), evidence("test/dashboard-persistence.test.js", "Sprint-17.1-Schema 4 ergänzt persistente System-Dashboard-Einstellungen")]),
            block(52, 62, "equivalent", [evidence("test/system-frontend.test.js", "Summary-Shell zeigt Online, Stale und Recovery"), evidence("test/system-frontend.test.js", "System-Shell bleibt ES5 und frei von CSS Grid")]),
            block(63, 70, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder"), evidence("test/sprint-26-2.test.js", "Schema 12 trennt Sichtbarkeit")])
        ]
    },
    "20": {
        total: 82,
        spec: "docs/sprints/SPRINT-20.md",
        blocks: [
            block(1, 18, "direct", [evidence("test/issues.test.js", "unavailable und unknown bleiben getrennt"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")]),
            block(19, 28, "direct", [evidence("test/issues.test.js", "Severity-Sortierung ist vollständig"), evidence("test/issues.test.js", "Sprint-20-Grenzmatrix")]),
            block(29, 42, "direct", [evidence("test/issues.test.js", "Gesamtstatus unterscheidet OK, Warning, Error, Critical und stale"), evidence("test/issues.test.js", "Recovery berechnet Issues neu")]),
            block(43, 49, "equivalent", [evidence("test/gateway.test.js", "System-Dashboard-APIs teilen einen reduzierten Snapshot")]),
            block(50, 57, "equivalent", [evidence("test/admin-ui.test.js", "Admin-Entwurf verwaltet Error-Security"), evidence("test/dashboard-persistence.test.js", "Error-Einstellungen werden vollständig validiert"), evidence("test/sprint-27-1-e.test.js", "Anzeige- und Risikoregeln verändern keine Control Grants")]),
            block(58, 68, "equivalent", [evidence("test/system-frontend.test.js", "Error-Shell zeigt Status, Severity-Gruppen, States und Recovery"), evidence("test/system-frontend.test.js", "Error-Shell zeigt Offlinezustand und Gatewayfehler")]),
            block(69, 69, "direct", [evidence("test/sprint-27-1-e.test.js", "Legacy-Systemkarten besitzen Schutz für lange Namen")]),
            block(70, 72, "direct", [evidence("test/system-frontend.test.js", "System-Shell bleibt ES5 und frei von CSS Grid")]),
            block(73, 82, "equivalent", [evidence("test/system-frontend.test.js", "Summary-Shell zeigt Online, Stale und Recovery"), evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Schema 12 trennt Sichtbarkeit")])
        ]
    },
    "21": {
        total: 93,
        spec: "docs/sprints/SPRINT-21.md",
        blocks: [
            block(1, 11, "direct", [evidence("test/sprint-21.test.js", "Backend-WebSocket authentifiziert"), evidence("test/sprint-21.test.js", "WebSocket auth_invalid")]),
            block(12, 34, "direct", [evidence("test/sprint-21.test.js", "Registry-Normalisierung übernimmt"), evidence("test/sprint-21.test.js", "Area-Auflösung priorisiert"), evidence("test/sprint-27-1-e.test.js", "Registry- und Diagnose-Grenzmatrix")]),
            block(35, 50, "direct", [evidence("test/sprint-21.test.js", "Config-Entry- und Repair-Issues")], "Normalisierung, Severity und read-only Abgrenzung."),
            block(51, 54, "direct", [evidence("test/sprint-21.test.js", "Capability-Probes verwenden nur feste Read-only-Commands")]),
            block(55, 57, "n/a", [evidence("docs/audits/sprints/SPRINT-21-AUDIT.md", "Matter")], "Bedingte Matter-Aggregation: installierte Schnittstelle bietet keine verlässliche unterstützte Diagnosequelle."),
            block(58, 66, "direct", [evidence("test/sprint-21.test.js", "Source Cache dedupliziert"), evidence("test/sprint-21.test.js", "Partial Failure erhält State-Snapshot"), evidence("test/sprint-21.test.js", "Kompletter WebSocket-Ausfall")]),
            block(67, 83, "equivalent", [evidence("test/summary.test.js", "Sprint-19-Zustandsmatrix"), evidence("test/issues.test.js", "unavailable und unknown bleiben getrennt"), evidence("test/admin-ui.test.js", "Admin-Entwurf"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(84, 93, "direct", [evidence("test/sprint-21.test.js", "Security-Regression enthält keine Proxy- oder Write-Commands"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder")])
        ]
    },
    "21.1": {
        total: 77,
        spec: "docs/sprints/SPRINT-21.1.md",
        blocks: [
            block(1, 10, "direct", [evidence("test/system-frontend.test.js", "Error-Filter und Device-Details arbeiten ohne Reload")]),
            block(11, 30, "direct", [evidence("test/sprint-21-1.test.js", "Presentation aggregiert ausschließlich echte Device-IDs"), evidence("test/sprint-21-1.test.js", "Device Groups sortieren Severity")]),
            block(31, 39, "direct", [evidence("test/system-frontend.test.js", "Error-Filter und Device-Details arbeiten ohne Reload"), evidence("test/sprint-21-1.test.js", "Config Entry, Repair und Matter bleiben Standalone")]),
            block(40, 40, "direct", [evidence("test/sprint-27-1-e.test.js", "Legacy-Systemkarten besitzen Schutz für lange Namen")]),
            block(41, 43, "equivalent", [evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt und fallen responsiv zurück")]),
            block(44, 47, "manual", ["MT-31", "MT-32"], "Physische Überlauf-, Höhen- und Expanded-Details-Prüfung."),
            block(48, 54, "direct", [evidence("test/sprint-21-1.test.js", "Sprint 21.1 bleibt read-only, ES5 und frei von CSS Grid")]),
            block(55, 64, "equivalent", [evidence("test/issues.test.js", "unavailable und unknown bleiben getrennt"), evidence("test/sprint-21.test.js", "Partial Failure erhält State-Snapshot")]),
            block(65, 71, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(72, 77, "direct", [evidence("test/sprint-21-1.test.js", "Sprint 21.1 bleibt read-only, ES5 und frei von CSS Grid"), evidence("test/sprint-26-2.test.js", "Schema 12 trennt Sichtbarkeit")])
        ]
    },
    "21.2": {
        total: 92,
        spec: "docs/sprints/SPRINT-21.2.md",
        blocks: [
            block(1, 20, "direct", [evidence("test/system-frontend.test.js", "Summary-Filter nutzen Serverkategorien"), evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt")]),
            block(21, 22, "manual", ["MT-33"], "Reale iPad-Portrait-/Landscape-Wirkung."),
            block(23, 30, "direct", [evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt"), evidence("test/sprint-21-1.test.js", "Presentation aggregiert ausschließlich echte Device-IDs")]),
            block(31, 32, "manual", ["MT-34"], "Reale Error-Dashboard-Viewport-Wirkung."),
            block(33, 65, "direct", [evidence("test/sprint-21-2.test.js", "Safety Device Classes"), evidence("test/sprint-21-2.test.js", "Security Device Classes"), evidence("test/sprint-21-2.test.js", "Normale und diagnostische Entities"), evidence("test/sprint-21-2.test.js", "Device Group übernimmt Critical-Risiko")]),
            block(66, 79, "equivalent", [evidence("test/summary.test.js", "Sprint-19-Zustandsmatrix"), evidence("test/issues.test.js", "unavailable und unknown bleiben getrennt"), evidence("test/sprint-21-1.test.js", "Config Entry, Repair und Matter bleiben Standalone")]),
            block(80, 85, "equivalent", [evidence("test/gateway.test.js", "Gateway arbeitet vollständig gegen lokalen Mock-Home-Assistant"), evidence("test/admin-ui.test.js", "Admin-Authentifizierung bleibt"), evidence("test/sprint-26-2.test.js", "Grid, Focus und Room konsumieren")]),
            block(86, 92, "direct", [evidence("test/sprint-21-2.test.js", "Sprint 21.2 bleibt read-only, ES5 und ohne CSS Grid"), evidence("test/sprint-26-2.test.js", "Schema 12 trennt Sichtbarkeit")])
        ]
    },
    "21.3": {
        total: 96,
        spec: "docs/sprints/SPRINT-21.3.md",
        blocks: [
            block(1, 19, "direct", [evidence("test/system-frontend.test.js", "Error-Filter bilden exakte sichtbare Device Groups")]),
            block(20, 20, "manual", ["MT-34"], "Reale horizontale Überlaufprüfung."),
            block(21, 55, "direct", [evidence("test/sprint-21-3.test.js", "Device-Class- und Cover-Policy"), evidence("test/sprint-21-3.test.js", "Label-Modus berücksichtigt Device und Entity")]),
            block(56, 58, "direct", [evidence("test/sprint-27-1-e.test.js", "Label-Lifecycle behält stabile ID"), evidence("test/sprint-21-3.test.js", "Migration bewahrt Detection-Modus")]),
            block(59, 65, "direct", [evidence("test/sprint-21-3.test.js", "Label-Modus berücksichtigt Device und Entity"), evidence("test/sprint-21-3.test.js", "Explizite securityEntities behalten")]),
            block(66, 74, "direct", [evidence("test/sprint-21-3.test.js", "Label-Quelle nutzt festen Read-only-Command"), evidence("test/sprint-21.test.js", "WebSocket Error-only plant genau einen begrenzten Reconnect"), evidence("test/sprint-27-1-e.test.js", "Label-Lifecycle behält stabile ID")]),
            block(75, 88, "equivalent", [evidence("test/sprint-21.test.js", "Registry-Normalisierung übernimmt"), evidence("test/sprint-21-1.test.js", "Presentation aggregiert ausschließlich echte Device-IDs"), evidence("test/system-frontend.test.js", "Summary und Errors speichern Spalten getrennt")]),
            block(89, 96, "direct", [evidence("test/sprint-21-3.test.js", "Sprint 21.3 bleibt read-only, ES5 und ohne CSS Grid"), evidence("test/security.test.js", "strukturierte Logs redigieren Secret-Felder")])
        ]
    }
};
