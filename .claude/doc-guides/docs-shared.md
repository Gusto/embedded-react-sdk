# Documentation — shared reference

Canonical facts shared by `docs-check`, `docs-regen`, and `docs-change-ia`.

## Commands from the repository root

| Command                         | Purpose                                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run docs:install`          | Install standalone TypeDoc dependencies in `typedoc/`                                                |
| `npm run docs:api:generate`     | Generate Markdown reference pages from TSDoc                                                         |
| `npm run docs:lint`             | Check `title` and `description` frontmatter                                                          |
| `npm run docs:lint:markdown`    | Check Markdown style, relative file links, and anchors                                               |
| `npm run docs:lint:spell`       | Check documentation spelling                                                                         |
| `npm --prefix typedoc run test` | Run the custom TypeDoc plugin tests once                                                             |
| `npm run derive`                | Run the full models, translations, SDK build, endpoint inventory, API report, and reference pipeline |

Reference generation requires TypeDoc dependencies:

```bash
test -d typedoc/node_modules || npm run docs:install
```

## Authored and generated content

|          | Authored documentation               | Generated reference                                         |
| -------- | ------------------------------------ | ----------------------------------------------------------- |
| Location | `docs/**` except generated artifacts | `docs/reference/**`                                         |
| Source   | Markdown files                       | TSDoc in `src/` and `typedoc/typedoc-custom/` configuration |
| Edit     | Edit the source Markdown             | Edit TSDoc or generation configuration, then regenerate     |

`docs/guides/endpoint-reference.md` and `endpoint-inventory.json` are also generated:
edit their source or `build/deriveEndpointInventory.ts`, then run `npm run endpoints:derive`.

Never hand-edit generated reference pages. Their `generated_by: typedoc` marker
identifies them; regeneration overwrites manual changes. Use `docs-regen` and
`docs-change-ia/REFERENCE.md` for generated content and structure.

Use a regular Markdown preview for authored files, with Mermaid support where
available. TypeDoc emits Markdown only, with titles, descriptions, and a generation
marker. It does not emit website navigation metadata or category files.

## Validation and publishing ownership

This repository owns documentation content, generation, and source checks. The
separate publishing app owns rendering, navigation, search, version selection,
Mermaid styling, and deployment. Website route, sidebar, and theme changes belong
in that app. This spike has no replacement release publishing workflow.

Markdownlint checks relative file links and `.md` anchors, including explicit
anchors. It skips external URLs and absolute paths; it does not validate HTML
links, rendered routes, or the publisher's member-scoped anchors. TypeDoc's symbol
validation is separate and currently reports warnings without failing generation.
A publishing-app build is needed to check the rendered site.

See [the publishing spike](../../DOCS-PUBLISHING-SPIKE.md) for current verification
and known gaps, including the existing router-test failure.

These docs are partner-facing. Follow the Documentation rules in root `CLAUDE.md`:
write neutrally or in second person, avoid assumptions about the integrating app,
and use only the published SDK surface in samples.
