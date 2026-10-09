# Docs publishing spike

## Goal and scope

Experiment with removing Docusaurus from the SDK repository while preserving
standalone TypeDoc generation. This branch is a safe space to discover what
breaks; it is not a production publishing migration. Do not try to solve every
gap in this first pass.

The monorepo experiment starts by checking in the current Docusaurus site
configuration wholesale in a private static site app. That app owns website
builds and publication, and fetches SDK documentation content from git tags.

## Ownership rules

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
and anchors; record the gap until a replacement exists. Compilation alone does
not provide those checks.

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
- Local MDX preview and replacement page/anchor checking are not implemented
  in the initial removal.
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
