---
name: docs-regen
description: >-
  Regenerate the auto-generated reference docs (docs/reference/**) from TSDoc +
  reference config. Use after editing TSDoc in src/** or the reference router
  config, or on "regen the reference". Dev server doesn't hot-reload these.
---

# Regenerate the reference docs

Everything under `docs/reference/**` is generated from TSDoc in `src/` by a TypeDoc
plugin — committed to the repo, never hand-edited. Regenerate when the source TSDoc or
reference config changes. Hand-authored markdown (`docs/**` except `docs/reference/**`)
doesn't need this; the dev server hot-reloads it.

## When to regenerate

After changing any of:

- **TSDoc** in `src/` (descriptions, `@group` tags, params, examples).
- `docs-site/plugins/typedoc-custom/router.config.ts` (reference IA — domains, pages).
- `docs-site/typedoc.config.ts` or `docs-site/typedoc-utils.mjs` (grouping / ordering).

## Steps

Run from the repo root:

```bash
test -d docs-site/node_modules || npm run docs:install   # one-time prerequisite
npm run docs:api:generate                                # fast path: reference only
git diff docs/reference/                                 # confirm only intended changes
npm run docs:build                                       # broken links/anchors throw
```

- `docs:api:generate` (TypeDoc only) is the quick loop while iterating.
- `npm run derive` is the full pipeline (SDK build + endpoint inventory + api report +
  reference) — run it for the final pass before a PR.
- The generated `_category_.json` sidebar files come from the plugin too, so they may
  legitimately change when you reorder reference IA.

## Going deeper

Reference *structure* — domains, standalone pages, on-page ordering, folding prose into
generated pages via `GUIDE.md` — is documented in `docs-change-ia/REFERENCE.md`. Read it
before changing structure rather than just refreshing content. If you changed routing
*logic* (not just config), run the router tests: `npm --prefix docs-site test`.

Script map and content model: [`docs-shared.md`](../docs-shared.md).
