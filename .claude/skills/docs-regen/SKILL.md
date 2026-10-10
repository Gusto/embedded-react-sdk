---
name: docs-regen
description: >-
  Regenerate the auto-generated reference docs (docs/reference/**) from TSDoc +
  reference config. Use after editing TSDoc in src/** or the reference router
  config, or on "regen the reference".
---

# Regenerate the reference docs

Everything under `docs/reference/**` is generated from TSDoc in `src/` by a TypeDoc
plugin — committed to the repo, never hand-edited. Regenerate when the source TSDoc or
reference config changes. Hand-authored markdown (`docs/**` except `docs/reference/**`)
doesn't need reference generation; use a regular Markdown preview.

## When to regenerate

After changing any of:

- **TSDoc** in `src/` (descriptions, `@group` tags, params, examples).
- `typedoc/typedoc-custom/router.config.ts` (reference IA — domains, pages).
- `typedoc/typedoc.config.ts` or `typedoc/typedoc-utils.ts` (grouping / ordering).

## Steps

Run from the repo root:

```bash
test -d typedoc/node_modules || npm run docs:install   # one-time prerequisite
npm run docs:api:generate                                # fast path: reference only
git diff docs/reference/                                 # confirm only intended changes
npm run docs:lint
npm run docs:lint:markdown
npm run docs:lint:spell
```

- `docs:api:generate` (TypeDoc only) is the quick loop while iterating.
- `npm run derive` is the full pipeline. Use it when the task also changes models,
  translations, the SDK build, endpoint inventory, or API reports.
- The output is Markdown content. Sidebar metadata and category files belong to
  the separate publishing app; source checks do not validate its rendered site.

## Going deeper

Reference _structure_ — domains, standalone pages, on-page ordering, folding prose into
generated pages via `GUIDE.md` — is documented in `docs-change-ia/REFERENCE.md`. Read it
before changing structure rather than just refreshing content. If you changed routing
_logic_ (not just config), run the router tests: `npm --prefix typedoc test`.

Script map and content model: [`docs-shared.md`](../../doc-guides/docs-shared.md).
