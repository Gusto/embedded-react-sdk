---
name: docs-start
description: >-
  Boot the SDK docs site locally (Docusaurus dev server, hot reload). Use before
  previewing or editing hand-authored docs (docs/** except docs/reference/**), or
  on "start/run the docs". Installs deps if missing.
---

# Start the docs site

The docs site is a [Docusaurus](https://docusaurus.io) site in `docs-site/`, driven by
root-level npm scripts (full map in [`docs-shared.md`](../docs-shared.md)).

Run from the repo root, starting the dev server in the background:

```bash
test -d node_modules || npm run install                  # install project deps if missing
test -d docs-site/node_modules || npm run docs:install   # install deps if missing
npm run docs                                             # dev server, hot reload, :3000
```

- Hot reload covers **hand-authored** markdown only (`docs/**` except `docs/reference/**`).
  Reference docs (`docs/reference/**`) need regenerating — use `docs-regen`.
- The dev server tolerates broken links; the production build does not. Verify with
  `docs-check` before calling docs work done.
- If port 3000 is taken it's likely a docs server already running — confirm with the
  user before stopping it or picking another port.
- Reorganizing the site (sidebar, page placement, reference IA) — use `docs-change-ia`.
