# Auto-generated reference — internals

Read this before touching anything under `docs/reference/**`, the typedoc-custom plugin,
or `GUIDE.md` files. `SKILL.md` covers hand-authored content; this covers the generated
half.

## How reference docs are produced

TypeDoc reads TSDoc from `src/`, and a custom plugin (`typedoc/typedoc-custom/`)
routes each symbol into the `docs/reference/` tree. Output is committed but never
hand-written. The plugin emits Markdown content only; category files and
website sidebar metadata belong to the publishing app.

Regenerate after any change to TSDoc, `router.config.ts`, or `typedoc.config.ts`:

```bash
test -d typedoc/node_modules || npm run docs:install   # one-time prerequisite
npm run docs:api:generate   # reference only (TypeDoc) — fast iterate path
npm run derive              # full pipeline when upstream generated artifacts changed
git diff docs/reference/    # confirm you changed only what you intended
```

## The reference IA config: `router.config.ts`

`typedoc/typedoc-custom/router.config.ts` is the single source of truth for
reference structure; its own TSDoc comments are the authoritative spec. Two exported
arrays matter. Their order affects generated indexes; website sidebar order
belongs to the publisher.

`DOMAINS` — the domain → namespace tree. Each entry defines a domain hub and its content
(e.g. **Employees**, **Payroll**):

- `label` — domain hub title and its label in the reference index.
- `path` — output slug **and** source-dir lookup (`employee` → `src/components/Employee`;
  `time-off` → `src/components/TimeOff`).
- `namespaces` — namespaces under the domain, in generated-content order. Add one with
  `{ id, subpath }` (id must match the namespace exported from `src/components/index.ts`).

`STANDALONE_PAGES` — symbols that don't belong to a domain, collected one page each
(for example, `theme-variables`, `component-inventory`, and `events`):

- `id` — output slug → `docs/reference/<id>.md`.
- `sources` — source-path fragments; a symbol routes here if its path contains any.
- `groups` — optional `@group` filter (e.g. `events` takes only the `Events` group).
- `displayName` — the page H1.

Reorder/relabel by editing the arrays, then regenerate.

## Ordering content within a generated page

You do **not** edit the generated `.md`. Order comes from two places:

- **`typedoc/typedoc.config.ts`** — `groupOrder` lists section names top-to-bottom (the
  constants live in `typedoc/typedoc-utils.ts`: `CUSTOM_GROUPS` and `GROUP_ORDER`); `sort: ['required-first', 'alphabetical']`
  orders members within a group.
- **`@group` tags** in the TSDoc decide which section a symbol falls into.

So: reorder _sections_ via `groupOrder` / the group-name arrays; reorder _items within a
section_ via `sort` or names; move an item between sections by changing its `@group` tag.

## Injecting hand-authored prose into a generated page: `GUIDE.md`

To make authored narrative read as part of a generated hub/flow page, the plugin slots a
`GUIDE.md`'s sections into the page. Where it looks:

- **Domain hub** → `src/components/<Domain>/GUIDE.md` (Domain = PascalCase of the domain
  `path`, e.g. `time-off` → `src/components/TimeOff/GUIDE.md`).
- **Flow page** → `GUIDE.md` beside the `*Flow` component's source.
- **Hook page** → `GUIDE.md` at the root of the hook's directory.

Format (parsed by `typedoc/typedoc-custom/utils.ts`): the leading `# H1` is
dropped as an author title; each `## section` is tagged with a slot comment.

```markdown
# My Guide (title — not rendered)

## Overview

<!-- slot: overview -->

Prose that lands at the top of the generated page.

## Notes

<!-- slot: appendix -->

Prose that lands at the bottom.
```

Recognized slots are **`overview`**, **`appendix`**, and **`advanced`** (`GUIDE_SLOTS` in
`utils.ts`). Flow and domain-hub pages use `overview` (top of page) and `appendix`
(bottom); hook pages use a single `advanced` slot, rendered wholesale under a trailing
`## Advanced` section with its headings bumped one level deeper.
Untagged/unknown-slot sections fall through to `appendix` with a build warning — content
is never silently dropped, but tag deliberately. Adding a slot means editing `GUIDE_SLOTS`
in `utils.ts` and the rendering in `theme.ts` — a code change beyond pure IA work, so
coordinate first.

## Website navigation

Grouping generated reference pages with authored guides in website navigation is
publishing-app work. This repository supplies the versioned Markdown tree and
index-page titles; it does not contain sidebar configuration or a rendered-site
build. Keep content routing and GUIDE.md injection here, and apply sidebar
presentation in the publisher.

## Verifying reference changes

```bash
npm run docs:api:generate   # use derive if upstream generated artifacts changed
git diff docs/reference/    # only the intended files changed
npm run docs:lint
npm run docs:lint:markdown
npm run docs:lint:spell
```

If you change routing _logic_ (not just config), run the typedoc tests
(`npm --prefix typedoc test`); the router suite is
`typedoc/typedoc-custom/sdk-router.test.ts`.
