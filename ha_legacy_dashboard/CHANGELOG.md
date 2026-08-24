# Changelog

## 1.0.0

- Add local Home Assistant App packaging for amd64 and aarch64.
- Use the Supervisor Core REST and WebSocket proxies with the backend-only
  `SUPERVISOR_TOKEN`.
- Persist server configuration under `/data`.
- Expose a direct configurable LAN port and a process-only healthcheck.
- Preserve the existing standalone/LXC deployment mode.
