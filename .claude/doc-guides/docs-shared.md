# Docs — shared reference

Canonical facts shared by the docs skills (`docs-check`, `docs-regen`,
`docs-change-ia`) so they don't drift. Read whichever skill matches your task.

## Scope

This repo owns only the **content** under `docs/` (guides, examples, generated
reference). Site rendering, navigation, and publishing are handled elsewhere.

## npm scripts (run from the repo root)

| Script                          | What it does                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `npm run docs:install`          | Install `typedoc/` deps                                                         |
| `npm run docs:lint:frontmatter` | Verify every `docs/**/*.md` has `title` + `description` frontmatter             |
| `npm run docs:lint:links`       | Verify every relative link in `docs/**/*.md` resolves to a file                 |
| `npm run docs:lint:markdown`    | markdownlint over `docs/**/*.md`                                                |
| `npm run docs:lint:spell`       | cspell over `docs/**/*.md`                                                      |
| `npm run docs:api:generate`     | Regenerate **reference docs only** (TypeDoc, via `typedoc/`). Fast iterate path |
| `npm run derive`                | Full derived pipeline: SDK build + endpoint inventory + api report + reference  |

`docs:api:generate`/`derive` need `typedoc/` deps installed:

```bash
test -d typedoc/node_modules || npm run docs:install
```

## Two kinds of content — know which you're touching

Get this wrong and edits either don't stick or break links.

|         | **Hand-authored**                      | **Auto-generated reference**                          |
| ------- | -------------------------------------- | ----------------------------------------------------- |
| Where   | `docs/**` _except_ `docs/reference/**` | `docs/reference/**` only                              |
| Source  | the `.md`/`.mdx` file itself           | TSDoc in `src/` + reference config                    |
| Edit by | editing the file                       | editing TSDoc + `router.config.ts`, then regenerating |

**Never hand-edit a file under `docs/reference/`** — the next regeneration overwrites it
(its frontmatter carries `generated_by: typedoc`, `custom_edit_url: null`). To change
generated content or structure, use `docs-regen` and `docs-change-ia` → `REFERENCE.md`.

Reference changes need regenerating (`docs-regen`); hand-authored content doesn't.

## Publishing and writing rules

Source of truth for content is **this repo** (`embedded-react-sdk`); it is published to
`sdk.gusto.com` from release tags.

These docs are **partner-facing**. The writing rules (second person, don't speculate
about the reader's app, no internal `@/` import aliases in code samples) live in the
root `CLAUDE.md` under **Documentation** — follow them there.
