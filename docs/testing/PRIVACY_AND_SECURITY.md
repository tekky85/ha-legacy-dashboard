# Privacy and security

The static portal has no HA access, backend, central result store, analytics,
telemetry or authenticated GitHub API. Two runtime requests load the
same-origin static catalog and German explanation file. It does not discover addresses, collect entity
IDs/logs, detect device details or read credentials. Enter aliases and known
environment details manually. The hosting provider still receives ordinary
HTTP requests when serving the site; opening GitHub is a deliberate navigation.

Drafts stay in localStorage under a portal-specific key. Other JavaScript
on the same Pages origin may share that storage boundary; do not enter secrets.
Shared machines, private mode, quota and browser cleanup can lose drafts.
Export is an explicit download, not an upload or a central backup. Import
validates bounded JSON and never executes its text. Notes and instructions are
inserted with textContent; no Markdown/HTML evaluation, external script/image
injection or generic file upload. CSP restricts scripts/styles/connections to
the site's own static resources and forbids form submission.

Before copying or submitting:

- remove HA/Supervisor/Admin tokens, passwords, `.env`, private keys;
- remove internal IPs/hostnames, personal entity/device/dashboard names;
- inspect photos, location, cameras, media, people and security-sensitive names;
- redact logs and error traces, keeping only necessary reproduction detail;
- use a tester alias and avoid legal name/email;
- assume public Issues and their uploaded files are publicly accessible;
- send sensitive evidence only through a separately agreed private channel;
- preserve a private original JSON backup; share a reviewed redacted copy.

The portal summary omits freeform notes by default. CLI exports escape
Markdown/CSV and omit general freeform notes. BLOCKED/N/A reasons are retained
as capability limitations with limited pattern redaction and a 200-character
bound; these may still contain private information and require review.
These are not guarantees against secret disclosure: humans must review every
public artifact. Raw input/output directories are ignored by Git. Synthetic
fixtures are clearly separate from real submissions. Imported data never
updates Repair Queue, approves a release or causes an automatic network upload.

GitHub references checked 2026-10-18:

- [Attaching files](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files): JSON is currently listed for comments; ZIP/TXT or a sanitized fenced code block remain practical fallbacks.
- [Issue form syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms).
- [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
