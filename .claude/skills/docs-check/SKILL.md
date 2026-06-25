---
name: docs-check
description: >-
  Verify the docs site is publish-ready: frontmatter lint + production build
  (catches broken links/anchors the dev server tolerates). Use before finishing
  docs work or opening a docs PR, or on "check/verify the docs".
---

# Check the docs before you're done

Run from the repo root, in order. Stop at the first failure and report its output.

```bash
test -d docs-site/node_modules || npm run docs:install
npm run derive        # 1. regenerate reference so checks run against what publishes
npm run docs:lint     # 2. every docs/**/*.md needs title + description frontmatter
npm run docs:build    # 3. the real gate — broken links/anchors throw
```

- **`derive`** rebuilds the generated reference. If TSDoc or reference config changed
  since the last regen, the build would otherwise pass against stale content. After it
  runs, review `git diff docs/reference/` — unexpected churn is itself a finding.
  (`docs-regen` has the fast iterate-only path; for a publish check, `derive` is right.)
- **`docs:build`** is configured to throw on any broken link or anchor
  (`onBrokenLinks` / `onBrokenAnchors` / `onBrokenMarkdownLinks` are all `'throw'`), so
  it catches what the dev server tolerates. The release build fails the same way.

## When a check fails

- **Broken link/anchor** — the error names the source page and bad target. Fix the
  relative markdown link, or the navbar/footer `to:` path in `docs-site/docusaurus.config.ts`.
- **Missing frontmatter** — add `title` and `description` to the named file.
- **Failure under `docs/reference/**`** — don't hand-edit generated files; see
  `docs-regen` and `docs-change-ia`.

Script map and content model: [`docs-shared.md`](../docs-shared.md).
