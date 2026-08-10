# Sprint 14 – Persistent Configuration & Admin API Foundation

## Status

Implemented

Read `AGENTS.md`, `README.md`, `docs/CODEX_HANDOFF.md`,
`docs/SPRINT_ROADMAP.md`, `docs/PROJECT_STATUS.md`,
`docs/sprints/SPRINT-12.md` and `docs/sprints/SPRINT-13.md`.

Inspect the actual repository state and verify the completed Sprint 13
implementation before changing anything.

## Goal

Introduce a safe persistent configuration layer and a protected Admin API for
the multi-dashboard implementation.

Do not implement the graphical Admin UI yet.

## Required functionality

- Introduce a versioned dashboard configuration schema.
- Add a stable unique ID for every widget.
- Persist configuration to `data/dashboards.json` by default.
- Allow overriding the path through `DASHBOARD_CONFIG_PATH`.
- Preserve the existing Sprint 13 multi-dashboard model.
- Migrate the existing static configuration automatically when no persistent
  configuration exists.
- Validate the complete configuration before writing it.
- Use atomic file replacement.
- Keep one previous backup as `dashboards.json.bak`.
- Never destroy the last valid configuration when validation or writing fails.

## Admin API

Provide protected endpoints for reading and modifying:

- dashboard configuration,
- dashboards,
- widgets.

Also provide a sanitized Home Assistant entity inventory for the future
configuration UI.

A possible API design is:

- `GET /api/admin/config`
- `PUT /api/admin/config`
- `GET /api/admin/dashboards`
- `POST /api/admin/dashboards`
- `PUT /api/admin/dashboards/:id`
- `DELETE /api/admin/dashboards/:id`
- `POST /api/admin/dashboards/:id/widgets`
- `PUT /api/admin/dashboards/:id/widgets/:widgetId`
- `DELETE /api/admin/dashboards/:id/widgets/:widgetId`
- `GET /api/admin/entities`

You may simplify this route structure if a smaller API avoids duplicate logic.

## Admin security

The Admin API must be disabled by default.

Enable only through:

`ADMIN_API_ENABLED=true`

Require a dedicated secret:

`ADMIN_TOKEN`

Requests must authenticate using a Bearer token.

Requirements:

- never use the Home Assistant token as the Admin token,
- never expose either token to the normal dashboard,
- never log tokens,
- do not commit secrets,
- apply rate limiting to Admin write operations.

Do not implement a graphical login or session system in this sprint.

## Critical security boundary

Dashboard visibility must remain completely separate from Home Assistant write
authorization.

Adding an entity to a dashboard must never automatically add it to the Climate
or Light write allowlists.

Preserve all existing write allowlists.

## Entity inventory

`GET /api/admin/entities` should return only sanitized metadata useful for the
future Admin UI, such as:

- entity_id,
- domain,
- friendly_name,
- device_class,
- unit_of_measurement.

Do not expose unnecessary raw Home Assistant state attributes.

## Validation

Validate at least:

- schema version,
- dashboard IDs,
- unique dashboard IDs,
- widget IDs,
- unique widget IDs,
- known widget types,
- valid entity IDs,
- widget arrays,
- numeric order values,
- boolean visibility,
- refresh intervals,
- valid existing default dashboard.

Invalid configuration must return a controlled error and must not modify the
persisted configuration.

## Explicit non-goals

Do not implement:

- graphical `/admin` UI,
- drag-and-drop,
- free tile positioning,
- tile width/height,
- layout profiles,
- a database,
- Home Assistant App packaging,
- HACS integration,
- additional writable Home Assistant domains,
- automatic write permissions based on dashboard configuration.

## Tests

Add isolated tests for:

- initial configuration migration,
- valid configuration loading,
- invalid JSON,
- unsupported schema version,
- duplicate dashboard IDs,
- duplicate widget IDs,
- invalid dashboard IDs,
- atomic persistence,
- backup behavior,
- Admin API disabled by default,
- missing Admin token,
- invalid Admin token,
- valid Admin token,
- dashboard creation/update/deletion,
- widget creation/update/deletion,
- default dashboard consistency,
- sanitized entity inventory,
- unchanged write allowlists,
- all existing multi-dashboard functionality.

Use only localhost mock Home Assistant services and fake credentials.

Do not contact the real Home Assistant instance.

Run all JavaScript syntax checks and the complete test suite.

Update `docs/PROJECT_STATUS.md` when finished.

Report:

1. start commit,
2. changed files,
3. final configuration schema,
4. persistence behavior,
5. migration behavior,
6. Admin API routes,
7. authentication behavior,
8. tests and results,
9. syntax-check results,
10. remaining work for Sprint 15.
