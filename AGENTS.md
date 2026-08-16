# HA Legacy Dashboard – Codex Instructions

## Project overview

HA Legacy Dashboard is a lightweight, modern Home Assistant dashboard designed
for legacy devices whose browsers can no longer display the current Home
Assistant frontend.

The initial target device is:

- Apple iPad mini first generation
- iOS 9.3.5
- Safari included with iOS 9.3.5

The project must remain usable on this target device while still presenting a
modern, touch-friendly interface.

## Primary goals

- Display selected Home Assistant entities on legacy browsers.
- Allow selected Home Assistant entities to be controlled safely.
- Keep the Home Assistant access token exclusively on the backend.
- Provide a modern responsive interface.
- Support portrait and landscape orientation.
- Support light and dark mode.
- Avoid external frontend dependencies.
- Keep the frontend compatible with Safari on iOS 9.
- Keep the project simple enough to deploy in a small Proxmox LXC.

## Non-goals

Do not turn the project into a full replacement for Home Assistant Lovelace.

Do not add a frontend framework unless the project requirements change
explicitly.

Do not expose the complete Home Assistant API to the browser.

Do not permit arbitrary entities or arbitrary Home Assistant services to be
controlled from the frontend.

## Architecture

The application consists of three layers:

```text
Legacy browser
    |
    | HTTP
    v
HA Legacy Dashboard Gateway
    |
    | Home Assistant REST API
    v
Home Assistant
```

### Backend

- Runtime: Node.js
- Web framework: Express
- Home Assistant communication: REST API
- Authentication: Home Assistant long-lived access token stored in `.env`
- Production process manager: systemd

### Frontend

- HTML
- CSS
- plain JavaScript
- no frontend package manager
- no frontend framework
- no external CDN dependencies
- inline SVG icons
- XMLHttpRequest-based API communication

### Production environment

- Host type: Proxmox LXC
- Runtime user: `dashboard`
- Project path: `/home/dashboard/ha-legacy-dashboard`
- Service name: `ha-legacy-dashboard.service`
- Default HTTP port: `3000`

## Repository structure

Expected important paths:

```text
ha-legacy-dashboard/
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── deploy/
│   └── systemd/
│       └── ha-legacy-dashboard.service
├── docs/
│   └── CODEX_HANDOFF.md
└── src/
    ├── server.js
    ├── routes/
    │   └── api.js
    ├── services/
    │   └── homeassistant.js
    └── public/
        ├── index.html
        ├── css/
        │   └── style.css
        └── js/
            ├── app.js
            ├── core/
            │   ├── compat.js
            │   ├── dashboard.js
            │   ├── icons.js
            │   ├── theme.js
            │   └── widget.js
            └── widgets/
                ├── binary.js
                ├── climate.js
                └── sensor.js
```

## Frontend compatibility requirements

Frontend JavaScript must remain compatible with ECMAScript 5 and Safari on
iOS 9.

### Do not use

- `let`
- `const`
- arrow functions
- JavaScript classes
- template literals
- destructuring
- spread syntax
- `for...of`
- `fetch`
- native `Promise`
- `async`
- `await`
- optional chaining
- nullish coalescing
- modern module syntax
- dynamic imports
- Web Components
- Shadow DOM

### Use instead

- `var`
- constructor functions
- prototypes
- callbacks
- classical `for` loops
- string concatenation
- `XMLHttpRequest`
- `src/public/js/core/compat.js`

Do not assume that APIs available in modern Safari also exist in Safari on
iOS 9.

## CSS compatibility requirements

The interface must remain usable on Safari on iOS 9.

### Prefer

- Flexbox
- `-webkit-` prefixed properties where required
- media queries
- ordinary CSS selectors
- fixed color declarations
- inline SVG icons
- touch targets of at least approximately 44 pixels

### Do not rely on

- CSS Grid
- Flexbox `gap`
- CSS custom properties without fallback
- unsupported modern selectors
- container queries
- modern color functions
- backdrop filters
- browser-specific behavior that has not been tested on iOS 9

The interface should look modern, but compatibility takes precedence over
decorative effects that break on the target device.

## Design requirements

The UI should not resemble an outdated technical status page.

Use:

- spacious card layouts
- large values
- clear typography
- restrained status colors
- rounded cards
- subtle shadows
- touch-friendly controls
- responsive portrait and landscape layouts
- light mode
- dark mode

Avoid:

- dense tables
- small controls
- excessive animation
- unnecessary gradients
- external icon fonts
- emoji as primary interface icons

## Browser communication

All browser-to-gateway communication must go through the compatibility layer:

```text
src/public/js/core/compat.js
```

Use:

```javascript
Legacy.http.get(...)
Legacy.http.post(...)
```

Do not call `XMLHttpRequest` directly from individual widgets unless there is
a documented reason.

## Security requirements

- Never expose the Home Assistant token to the browser.
- Never commit `.env`.
- Never log the complete Home Assistant token.
- Never send the token as part of frontend JSON.
- Validate every value received from the browser.
- Explicitly allowlist every writable Home Assistant entity.
- Explicitly define every writable Home Assistant service.
- Do not accept arbitrary domains, services, or entity IDs from the browser.
- Do not allow path traversal.
- Do not add shell execution based on browser input.
- Return generic frontend errors while logging useful backend diagnostics.
- Preserve secure file permissions for `.env`.

## Home Assistant integration

Read operations use Home Assistant state endpoints.

Control operations must use Home Assistant service endpoints.

Do not attempt to control devices by writing directly to a Home Assistant
state representation.

Current or planned entity types include:

- sensor
- binary_sensor
- climate
- light
- switch
- cover
- weather
- media_player
- camera

Only add a new writable entity after adding an explicit backend allowlist.

## Current known entities

Current project entities include:

```text
sensor.badezimmer_smart_indoor_module_temperatur
sensor.badezimmer_smart_indoor_module_luftfeuchtigkeit
binary_sensor.kuche_fenster_rechts
binary_sensor.kuche_fenster_mitte
climate.esszimmer_thermostate
```

Codex must inspect the actual repository before assuming that all listed
entities are currently enabled.

## Climate control requirements

The climate widget may display:

- current temperature
- target temperature
- HVAC state
- HVAC action
- minimum target temperature
- maximum target temperature
- target temperature step

Climate writes must use:

```text
climate.set_temperature
```

The gateway endpoint must validate:

- entity allowlist
- numeric target temperature
- minimum target temperature
- maximum target temperature
- target temperature step

The frontend should avoid overwriting a newly selected target temperature with
an older state returned immediately after the service call.

## Theme requirements

The interface supports:

- light mode
- dark mode
- manual switching
- local persistence where supported

Older Safari versions can throw errors when localStorage is unavailable or
restricted. Theme code must fail safely.

## Cache handling

Safari on iOS 9 caches JavaScript and CSS aggressively.

After frontend changes, increment the cache version parameters in:

```text
src/public/index.html
```

Example:

```html
<link rel="stylesheet" href="css/style.css?v=8">
<script src="js/app.js?v=8"></script>
```

Use one consistent version number for all frontend assets changed in the same
release.

## Validation requirements

Before committing JavaScript changes, run:

```bash
node --check <changed-javascript-file>
```

Examples:

```bash
node --check src/server.js
node --check src/routes/api.js
node --check src/services/homeassistant.js
node --check src/public/js/app.js
node --check src/public/js/widgets/climate.js
```

Backend API checks:

```bash
curl http://localhost:3000/api/status
curl http://localhost:3000/api/dashboard
```

When `jq` is available:

```bash
curl -s http://localhost:3000/api/dashboard | jq
```

## Deployment requirements

Backend changes require a service restart:

```bash
systemctl restart ha-legacy-dashboard.service
```

Check service status:

```bash
systemctl status ha-legacy-dashboard.service --no-pager -l
```

Read recent logs:

```bash
journalctl -u ha-legacy-dashboard.service -n 100 --no-pager
```

Follow logs:

```bash
journalctl -u ha-legacy-dashboard.service -f
```

Frontend-only changes normally do not require a service restart, but asset
cache versions must be incremented.

## Git workflow

Before changing files:

```bash
git status
git log --oneline -10
```

Do not overwrite uncommitted user changes.

Do not use force push unless explicitly requested and justified.

Keep commits small and descriptive.

Preferred commit prefixes:

```text
feat:
fix:
refactor:
docs:
style:
test:
chore:
```

Examples:

```text
feat: add climate widget controls
fix: preserve climate target after service call
docs: update Codex handoff
chore: add systemd service
```

## Required working method for Codex

Before modifying the project:

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read `docs/CODEX_HANDOFF.md`.
4. Run `git status`.
5. Inspect recent commits.
6. Inspect the actual implementation.
7. Do not assume that previously proposed patches were applied.
8. Identify the smallest reliable change.
9. Preserve Safari iOS 9 compatibility.
10. Run syntax checks for all modified JavaScript files.
11. Summarize changed files.
12. Provide deployment and verification commands.

## Documentation and screenshot maintenance

If a sprint changes visible UI, evaluate whether repository screenshots and
README image references must be updated.

If product documentation changes, keep `README.de.md` and `README.en.md`
semantically synchronized.

Never use generated mockups as product screenshots. Product screenshots must
come from the real running application or a controlled demo/mock instance of
the real application.

Before committing screenshots, verify that they contain no tokens, unwanted
internal IP addresses, private person/device names, security-sensitive entity
names, private media information, or location data.

## Definition of done

A change is complete only when:

- the implementation is present in the actual repository,
- frontend compatibility rules are preserved,
- backend security rules are preserved,
- modified JavaScript files pass `node --check`,
- relevant API endpoints are tested,
- frontend cache versions are increased when necessary,
- deployment instructions are provided,
- no secret is committed,
- `git status` is understood and reported.
