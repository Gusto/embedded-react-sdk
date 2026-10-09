# Docs publishing spike

## Goal and scope

Experiment with removing Docusaurus, MDX, and documentation-specific React
components from the SDK repository while preserving standalone TypeDoc
generation. This branch is a safe space to discover what breaks; it is not a
production publishing migration. Do not try to solve every gap in this pass.

The monorepo experiment starts by checking in the current Docusaurus site
configuration wholesale in a private static site app. That app owns website
builds and publication, and fetches SDK documentation content from git tags.

## Current direction: plain Markdown end to end

The SDK repository now owns authored Markdown, generated Markdown reference
pages, and content assets. It contains no authored or generated MDX and no
documentation-specific React components.

- `docs/getting-started/authentication.md` uses a fenced Mermaid diagram in place
  of `AuthFlowDiagram`. The publishing app owns Mermaid rendering and styling.
- TypeDoc generates ordinary `index.md` pages in place of `index.mdx` pages.
  Grouped Markdown lists preserve entry order, labels, descriptions, and footer
  summaries. Domain guide prose and its provenance comments remain included.
- Index links target relative files, such as `employee/index.md`, rather than
  website routes. Generated Blocks, Hooks, and Workflows tables also retain file
  extensions so source-link checks can validate their targets and anchors.
- Domain hub namespace anchors use explicit HTML anchors instead of custom
  heading syntax. The anchor IDs remain unchanged.
- The publishing app owns navigation, search, version selection, theme, SEO,
  consent, analytics, and publishing configuration. The website homepage also
  belongs to that app. The latest published version supplies the default
  documentation index.
- Keep TypeDoc configuration, its custom router/theme, and generation commands
  in `docs-site/` for now to avoid unrelated tooling path changes. That directory
  contains generation tooling only.

The intentional presentation tradeoff is losing the `DocCardList` card layout.
Try the readable Markdown indexes first. Introduce declarative index data only
if the publishing presentation needs it; its format and rendering adapter are
not part of this experiment.

## Sidebar ownership

TypeDoc no longer emits `_category_.json` files. The renderer-end category writer
and its hooks-directory tracking have been removed. All 16 previously generated
category files are removed from the reference tree; the Markdown pages remain
unchanged by this removal.

The publisher already owns the sidebar configuration. Its authored-doc sections
use an explicit page list; its Reference section starts with Docusaurus directory
autogeneration and then applies custom grouping from publisher-owned domain and
standalone-page configuration.

Docusaurus can infer a directory category's label and landing page from its
`index.md` title. Without category files, collapse behavior uses publisher
settings/defaults, and category ordering falls back to index-page metadata and
file/directory names. The previous `API models` category label becomes `APIModels`
unless the publisher supplies a display override. Namespace categories no longer
carry the SDK's explicit `collapsed: false` setting.

The current publisher still has a hardcoded domain/namespace list and standalone
page grouping. That is the next ownership question: derive the navigation tree
from each version's fetched files, then apply publisher-owned ordering, grouping,
and display overrides without silently dropping new pages. Authored sections'
explicit lists also need to account for which pages exist in each version.

Generated Markdown now contains only content frontmatter: `title`, `description`,
and `generated_by: typedoc`. TypeDoc's sidebar-position helper and explicit
position overrides have been removed, along with `sidebar_position`,
`custom_edit_url`, and `hide_table_of_contents`. The authored introduction no
longer sets `slug: /` or `displayed_sidebar: docs`. Authored `order` metadata
remains a separate, custom content convention.

The publisher owns page ordering, edit-link visibility, TOC visibility, sidebar
selection, and the docs landing route. It can use `generated_by` to identify
generated pages and index files to identify section landing pages. Removing the
introduction's slug changes its default route; the publisher must explicitly
assign the docs root if it wants to preserve `/docs/`.

The earlier publishing preview was built with category files. A publishing build
without category files or the removed frontmatter has not been verified; its previous sidebar-module
adapter remains a separate publisher issue.

## Local authoring and validation

Use regular Markdown previews for local authoring, with Mermaid support where
available. The experimental MDX preview launcher and its preview-only
`DocCardList` component have been removed. No preview-specific dependencies were
added to or removed from package manifests or lock files.

From the repository root, with dependencies installed:

```sh
npm run docs:api:generate
npm run docs:lint
npm run docs:lint:markdown
npm run docs:lint:spell
npm --prefix docs-site run test
```

The last command runs Vitest once and exits. It currently includes the known
router-test failure described below.

`docs:lint:markdown` uses existing Markdownlint rules; there is no custom checker
or separate link-check command. The existing docs CI step runs the same command.

- Built-in `MD051` checks same-document heading fragments and explicit anchors.
- `markdownlint-rule-relative-links` checks that relative Markdown links and
  images target existing files, and validates cross-file anchors for `.md`
  targets. It skips external URLs and absolute paths.
- Generated reference docs receive only these link rules; authored docs retain
  their existing style rules as well. The previous exemptions for the generated
  Blocks, Hooks, and Workflows indexes have been removed.

This is source-file validation, not a replacement for every rendered-site check.
It does not validate HTML links, frontmatter slugs, or website routes without file
extensions. It does not reproduce the publishing app's member-scoped heading
plugin. The publishing app owns rendered routes, scoped anchors, navigation,
historical versions, and Mermaid rendering. TypeDoc's symbol-link validation
remains separate: `validation.invalidLink` is enabled, but generation currently
exits successfully with warnings.

## Markdown conversion verification

- Standalone TypeDoc generation succeeds, producing 83 Markdown reference files
  with no MDX or `_category_.json` files. It reports the same 41 existing warnings.
- All 94 former card entries retain their labels, descriptions, and footer text.
  Group headings, ordering, and domain guide prose remain intact.
- At the Markdown conversion checkpoint, the 87 reference files outside the
  converted indexes and three cross-domain link tables were byte-for-byte
  unchanged. Category removal subsequently deletes 16 JSON files and preserves
  all 83 Markdown reference files byte-for-byte. Subsequent frontmatter removal
  preserves all page bodies, titles, descriptions, and generation markers.
- Frontmatter validation passes across 117 files. Markdownlint passes across
  116 documents, including the converted authentication page and indexes.
  Spelling checks pass.
- The TypeDoc router suite now reports 133 passing tests and the same failing
  test: `hooks from different directories get separate pages`. Index URL
  expectations use `.md`; two tests of the removed edit-link metadata were
  deleted. Leave this unrelated failure outside the spike.

## Publishing-app verification

The converted docs were copied into a temporary copy of the monorepo publishing
app at `/private/tmp/sdk-docs-markdown-publishing-spike`. Its existing Mermaid
support, reference sidebar logic, and scoped-heading plugin were retained. No
publishing-app source files were changed in the monorepo.

- The production build succeeds with broken Markdown links, rendered links, and
  anchors configured to throw. This checks current content only; tagged fetching
  and historical-version builds were not exercised.
- The app's existing `sidebars.mjs` exports caused a sidebar normalization stack
  overflow in this local build. The temporary copy uses the same sidebar data
  serialized into `sidebars.cjs`, with only its `sidebarPath` adjusted. This
  adapter is outside the SDK repository and is not a production publishing fix.
- Visible Chrome verification using the look skill confirms the authentication
  Mermaid diagram and the Markdown reference index render. The index shows
  domain links, descriptions, and count summaries in a list instead of cards.
- Browser error history contained previous webpack development-server failures
  and the initial connection attempt before the preview server started. The
  rendered production preview added no new console errors.

The temporary preview uses port 5300. Build logs are saved in
`/private/tmp/docs-markdown-publishing-build.log`; generation and router-test logs
are saved in `/private/tmp/docs-markdown-generation.log` and
`/private/tmp/docs-markdown-router-tests.log`.

## Earlier experiments and historical versions

The first pass removed Docusaurus configuration, site UI, static website assets,
site plugins, commands, and dependencies. It also removed the PR site build,
legacy source-sync workflow, and snapshot script while retaining independent
docs linters. Those publishing scripts copied the SDK's site configuration
downstream and could not work with the new ownership boundary. This branch has
no replacement release publishing path; release automation remains outside the
spike.

TypeDoc previously loaded `typedoc-docusaurus-theme` indirectly through
`docusaurus-plugin-typedoc`. Our custom theme extends the Markdown theme, so the
Docusaurus adapter was removed while preserving its Markdown defaults. The first
pass generated all 99 reference files byte-for-byte identically to the original
output, with the same 41 warnings.

A local npx MDX preview successfully rendered authentication, its colocated React
diagram, and edits to both. It was clunky and required a separate authoring
workflow. Reference indexes required a supplied `DocCardList`; their browser
verification was unfinished. That experiment is now superseded by Markdown
previews and the Markdown-only conversion above.

Earlier source-link verification used temporary fixtures to confirm failures
for a missing file, a missing cross-file `.md` anchor, and a missing local anchor,
while a valid cross-file link passed.

Older git tags still contain MDX, `DocCardList`, and the original `@site` auth
diagram import. The publishing app must continue handling those historical
formats when fetching earlier releases. This conversion changes current content
only; it does not rewrite published tags. Historical category files remain in
older tags; the publisher can continue accepting them. Current content supplies
Markdown directories and page titles instead.

No changes to release automation, historical-version fetching, or the known
router-test failure are included in this experiment.
