# Docs publishing spike

## Goal and scope

Experiment with removing Docusaurus from the SDK repository while preserving
standalone TypeDoc generation. This branch is a safe space to discover what
breaks; it is not a production publishing migration. Do not try to solve every
gap in this first pass.

The monorepo experiment starts by checking in the current Docusaurus site
configuration wholesale in a private static site app. That app owns website
builds and publication, and fetches SDK documentation content from git tags.

## Recommended direction after the preview experiment

The local MDX preview is clunky and adds an awkward authoring workflow. Do not
pursue it as the recommended docs development experience. The long-term goal is
Markdown-only documentation here, with no authored or generated MDX and no
documentation-specific React components in the SDK repository.

- Replace the one-off `AuthFlowDiagram` component with a Mermaid diagram inside
  `authentication.md`. The diagram remains versioned documentation content;
  the publishing app owns its rendering and styling.
- Consider replacing generated `index.mdx` pages with declarative index data.
  Preserve entries, headings/groups, ordering, labels, descriptions, relative
  links, and summary/footer content alongside each SDK version.
- Have TypeDoc emit that content data here and let the web app's build turn it
  into MDX using the app-owned presentation components. Generated presentation
  MDX would exist only in the publishing build, not in this repository.
- The data format is still undecided. Structured frontmatter in `index.md` could
  keep documentation files Markdown-only; a YAML/JSON manifest is another option
  if separate content data files are acceptable. The web build would need an
  explicit adapter for whichever format we choose.
- Use regular Markdown previews for local authoring, with Mermaid support where
  available. Use the Markdownlint link checks described below.

These are recommendations to investigate, not implemented changes. They
supersede the initial React/MDX ownership assumptions below. The preview is
stopped; its code remains as a record of the experiment.

## Initial spike ownership rules

- The SDK repository owns authored Markdown/MDX, generated reference docs,
  content-specific React components, and their styles/assets.
- Keep TypeDoc configuration, its custom router/theme, and generation commands
  here. Preserve generated content and its current structure during the spike.
- Documentation index pages belong to the versioned content. The latest
  published version supplies the default documentation index.
- The website homepage belongs to the web app, along with navigation, search,
  version selection, theme, SEO, consent, analytics, and publishing configuration.
- Content-specific components such as `AuthFlowDiagram` belong beside the
  document that uses them and travel with its git tag. Use relative imports,
  rather than site aliases such as `@site`.
- Presentation components such as `DocCardList` belong to the web app. Their
  names and props form a rendering contract with generated MDX. Preserve that
  contract initially rather than redesigning generated content.
- The web app compiles fetched component source and styles. The SDK does not
  need to publish a separate compiled documentation component package.

## Preview and validation

React components and MDX can compile without Docusaurus. A local preview may use
a lightweight renderer; it need not reproduce the full website theme.

The first preview target is the authentication MDX and its colocated diagram.
A complete preview would also need frontmatter, supplied MDX components,
Markdown tables, Mermaid, and document route/anchor handling. Do not build all
of that as part of the initial removal.

Keep existing frontmatter, Markdown, and spelling checks. TypeDoc's
`validation.invalidLink` remains enabled, but does not replace rendered-site
link checking. We want errors on broken internal page links, Markdown links,
and anchors; the Markdownlint rules below cover ordinary Markdown links.
Compilation alone does not provide those checks.

## Initial removal

- Remove the Docusaurus configuration, site UI, static website assets, site
  plugins, commands, and dependencies.
- Preserve TypeDoc in `docs-site/` for now to avoid unrelated path changes in
  generation and lint tooling. The directory becomes generation tooling only.
- Colocate the auth diagram and its CSS with the authentication document.
- Remove the PR site build while retaining the independent docs linters.
- Remove the legacy source-sync workflow and snapshot script on this spike
  branch. They copy the SDK's site configuration downstream and cannot work
  with the new ownership boundary. This branch has no replacement publishing
  path; release automation is outside this first pass.

## Findings and open gaps

- TypeDoc previously loaded `typedoc-docusaurus-theme` indirectly through
  `docusaurus-plugin-typedoc`. Our custom theme extends the Markdown theme,
  so the Docusaurus adapter can be removed if its Markdown defaults are
  preserved explicitly and generated output is verified.
- Generated reference content still contains Docusaurus-compatible frontmatter,
  category files, and `DocCardList` MDX. These are content conventions, not a
  retained Docusaurus runtime dependency.
- The auth diagram uses an Infima border variable and a `data-theme="dark"`
  styling convention. Preserve dark-mode selectors and add a border fallback
  so it can render outside the website theme.
- A limited local MDX preview is now available through the npx experiment below.
  Markdown source-link checking is now available as described below.
- Older git tags still contain the original `@site` import. The web app must
  account for those historical paths when fetching earlier releases.

## First-pass verification

- Standalone TypeDoc generation succeeds without any Docusaurus dependencies.
  All 99 generated reference files are byte-for-byte identical to the output
  generated before removal. Both runs report the same 41 existing warnings.
- The colocated auth diagram and CSS bundle successfully with esbuild, using
  React as an external dependency and no Docusaurus tooling.
- Frontmatter, Markdown (now including authored MDX), spelling (now including
  authored MDX and the diagram), formatting, and diff whitespace checks pass.
- The existing TypeDoc router suite reports 135 passing tests and one failing
  test: `hooks from different directories get separate pages`. The same failure
  reproduces against the original committed plugin/test source with unchanged
  TypeDoc, Markdown plugin, Vite, and Vitest versions. Leave this unrelated
  failure outside the spike.
- Local MDX rendering, rendered page/anchor validation, and the web app's tagged
  content build remain unverified. Bundling the diagram does not verify those
  behaviors.

## npx MDX preview experiment

From the repository root, with its existing dependencies installed:

```sh
npx --yes --package=@mdx-js/rollup@3.1.1 --package=remark-frontmatter@5.0.0 -- node build/previewMdx.mjs docs/getting-started/authentication.mdx
```

Open <http://127.0.0.1:5300/>. Stop the server with Ctrl+C. Supply another `.mdx`
path as the last argument to preview a different document; omit it to default
to authentication.

The two temporary packages are fetched into npm's npx cache. The preview uses
the repository's existing Vite, React, React DOM, and YAML dependencies. It adds
no dependencies and changes no package manifest or lockfile. The launcher finds
the temporary packages through the executable directories npx adds to `PATH`;
npx does not automatically make those packages importable from repository files.
Vite's generated cache goes into the system temporary directory.

The small preview script handles frontmatter, provides a title and basic page
styles, and compiles MDX plus relative TSX/CSS imports. It has no website
navigation, Docusaurus theme, Mermaid renderer, syntax highlighting, or
route/anchor checking. Cross-document links are not rewritten into preview
routes. The title is read at startup; restart after changing it.

Verified in visible Chrome using the look skill:

- The authentication document renders with its colocated, styled diagram.
- Frontmatter is hidden and its title appears as the page heading.
- Temporary edits to both MDX text and the imported React component update the
  preview. Those edits were restored afterward.
- An initial React root warning during updates was fixed by disposing of the
  previous root. Subsequent document/component updates produce no new errors.

This verifies the authentication page only. Loading the reference index failed
because its generated MDX requires a supplied `DocCardList`. A basic preview-only
renderer was added, but browser verification was stopped before completion.
Other MDX files may require extra components or rendering plugins.

## Markdown link checking

Run `npm run docs:lint:markdown` from the repository root. The existing docs CI
step runs the same command. Link validation uses existing Markdownlint rules;
there is no custom checker or separate link-check command.

- Built-in `MD051` checks same-document heading fragments and explicit anchors.
- `markdownlint-rule-relative-links` checks that relative Markdown links and
  images target existing files, and validates cross-file anchors for `.md`
  targets. It skips external URLs and absolute paths.
- Generated reference docs are included with only these link rules enabled;
  authored docs retain their existing style rules as well.
- The generated `reference/blocks.md`, `hooks.md`, and `workflows.md` indexes
  receive only `MD051`: their website routes without file extensions are not filesystem
  links and must be validated by the publishing app.

Verification: Markdownlint passes across 116 documents. A temporary fixture
confirmed failures for a missing file, a missing cross-file `.md` anchor, and a
missing local anchor, while a valid cross-file link passed.

This is source-file validation, not a replacement for every Docusaurus build
check. The rule does not validate cross-file anchors on `.mdx` targets, HTML/JSX
links, `DocCardList` data, frontmatter slugs, or website routes without file extensions.
It does not reproduce the deleted scoped-heading plugin's member anchors.
The publishing app owns rendered routes, scoped anchors, navigation, historical
versions, and any pages built from index data. TypeDoc's symbol-link validation
remains separate.

This fits the recommended Markdown-only direction: replace MDX presentation with
versioned index data and render it in the publishing app. Converting that content
is still future work; the link-check change does not remove current MDX files.

## Original handoff: broken internal links

Read this file first when resuming. Work next on replacing the removed
Docusaurus build's failures for broken internal page links, Markdown links,
and anchors. Do not restart the preview experiment or implement the Mermaid
and index-data recommendations as part of that work.

- At handoff the repository had no replacement page/anchor checker. The existing
  frontmatter, Markdown, and spelling commands do not provide that guarantee.
- TypeDoc's `validation.invalidLink` is enabled, but its current generation run
  exits successfully with warnings. Treat symbol-link validation separately
  from checking links between documentation files and their anchors.
- Begin by inspecting actual link forms in authored and generated docs. Account
  for relative `.md`/`.mdx` links, paths without file extensions, directory indexes,
  frontmatter slugs, explicit HTML anchors, and heading-derived anchors where
  those occur. Current MDX also embeds link targets in `DocCardList` data.
- The deleted scoped-heading Remark plugin supplied additional member-scoped
  anchors at site-build time. Its original source is available in git history;
  determine how those conventions affect validation without bringing the
  Docusaurus site build back into this repository.
- Keep the first implementation focused on internal links in the current docs
  tree. Checking remote websites or the web app's historical-version builds is
  a separate concern. Make any coverage limitations explicit.
- Preserve TypeDoc generation and avoid unrelated router-test cleanup. The
  existing router-test failure is documented above.

The remaining preview experiment and recommendations are saved together for
reference. No servers or browser review sessions are running.
