---
name: docs-change-ia
description: >-
  Reorganize documentation content: move or split authored Markdown pages, change
  generated reference routing, or inject GUIDE.md prose. Use for page placement,
  reference structure, or "reorganize docs"/"move this page". Website navigation
  changes belong in the separate publishing app.
argument-hint: '[what documentation content to reorganize]'
---

# Reorganize documentation content

See [docs-shared.md](../../doc-guides/docs-shared.md) for commands, content ownership,
and source-check coverage. Read `REFERENCE.md` before touching generated reference
structure, TypeDoc configuration, or `GUIDE.md` files. Follow the partner-facing
writing rules in root `CLAUDE.md`.

## Where things live

- `docs/`: authored Markdown and generated content.
- `typedoc/typedoc-custom/router.config.ts`: reference page structure and routing.
- `typedoc/typedoc.config.ts` and `typedoc/typedoc-utils.ts`: TypeDoc configuration
  and group ordering.
- The separate publishing app: sidebar grouping, website routes, search,
  version selection, and presentation.

## Create a standalone page

Create `docs/<section>/<slug>.md` with required frontmatter:

```markdown
---
title: Your Page Title
description: One-sentence summary of the content.
---
```

Link to it with relative Markdown file paths. Registration in website navigation
is publishing-app work; adding a file here does not guarantee a sidebar entry.

## Move or split a page

1. Move authored content into its new Markdown file, preserving required frontmatter.
2. Update inbound relative links and affected anchors. For links emitted by a
   generator, update its source and regenerate instead of editing its output.
3. Identify any website routes or navigation entries that need corresponding
   changes in the publisher. Source-file checks cannot validate those entries.

## Change generated reference structure

Never hand-edit `docs/reference/**`. Change source TSDoc or the TypeDoc plugin's
configuration and regenerate. Domain and standalone-page configuration controls
which pages exist and how indexes group their content; it does not emit website
sidebar positions or category files.

Fold authored prose into a generated domain, flow, or hook page through `GUIDE.md`
slots. Change on-page ordering through TypeDoc group configuration and `@group`
tags. Both mechanisms are documented in `REFERENCE.md`.

## Verify the change

After changing reference content or structure, run `npm run docs:api:generate`
and inspect `git diff -- docs/reference/`. Use the full `npm run derive` pipeline
when upstream generated artifacts also changed.

```bash
npm run docs:lint
npm run docs:lint:markdown
npm run docs:lint:spell
```

Run `npm --prefix typedoc run test` when changing plugin logic. See the publishing
spike for the known router-test failure. Rendered navigation, routes, Mermaid,
and historical versions require separate publishing-app verification.
