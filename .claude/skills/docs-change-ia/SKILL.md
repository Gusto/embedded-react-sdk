---
name: docs-change-ia
description: >-
  Reorganize docs content — move/split pages, restructure the generated reference.
  Use when a docs task touches page placement or reference structure, or on
  "reorganize docs"/"move this page".
argument-hint: '[what you want to reorganize — e.g. "move theming guide next to the reference"]'
---

# Reorganize the docs content

Docs publishing exists in an internal, private repo. This repo owns only the docs content;
any routing, IA, sidebar, or other logic about how the docs site is navigated & rendered
belongs in the private repo.

For the script map and the hand-authored-vs-generated content model (which everything
below hinges on), see [`docs-shared.md`](../../doc-guides/docs-shared.md). Deep reference
internals are in `REFERENCE.md` in this folder. The docs are **partner-facing** — follow
the writing rules in the root `CLAUDE.md`.

**Never hand-edit a file under `docs/reference/`** — it's regenerated and your changes
are overwritten. To change generated content or structure, see `REFERENCE.md`.

## Where things live

- `docs/` — all content (hand-authored markdown + generated reference output).
- `typedoc/typedoc-custom/router.config.ts` — the reference IA (see `REFERENCE.md`).

## Verify before you're done

```bash
npx run-s 'docs:lint:*'   # frontmatter, relative links, markdownlint, cspell
```

If you touched reference _structure_, also run `npm run derive` first — see
`REFERENCE.md`.

## Common tasks

### Create a standalone page

Create `docs/<section>/<slug>.md` with required frontmatter (both fields, or lint
fails):

```markdown
---
title: Your Page Title
description: One-sentence summary — shows in search results and link previews.
---
```

### Move content into a standalone page

1. Create the new page (above) and cut the content over.
2. **Fix every inbound link** — relative markdown links and cross-references in other
   pages. `npm run docs:lint:links` finds the ones that broke.

### Fold prose into a generated reference page

Fold hand-authored prose _into_ a generated hub/flow page via a `GUIDE.md` slot, so
narrative and generated API tables read as one page (mechanism in `REFERENCE.md`).

### Order content within a generated reference page

Pages like `reference/theme-variables` are generated; on-page order comes from TypeDoc
config and `@group` tags in source, not from editing the page. See `REFERENCE.md`.

---

Read `REFERENCE.md` before any task touching `docs/reference/**`, `router.config.ts`, or
`GUIDE.md` files.
