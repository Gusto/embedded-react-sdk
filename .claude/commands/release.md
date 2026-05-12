# Release

Prepares a release PR for the React SDK using `release-it`.

## How it works

`release-it` reads all commits since the last release, groups them by conventional commit type, proposes the next semver version, and then:

1. Bumps `package.json` to the new version
2. Updates `package-lock.json`
3. Prepends a new section to `CHANGELOG.md`
4. Commits all three files as `chore: release <version>`
5. Checks out a `chore/release-<version>` branch automatically

Version bump rules (during 0.x.x):

- `feat` → MINOR (0.1.0 → 0.2.0)
- `fix` → PATCH (0.1.0 → 0.1.1)
- `feat!` / `fix!` (breaking) → MINOR (0.1.0 → 0.2.0) — enforced via `preMajor: true` in `.release-it.json`; remove that flag when intentionally releasing 1.0.0
- `docs`, `chore`, `build`, etc. → no version bump

## Dry run

If `--dry-run` is passed to this skill, run:

```bash
npm run release -- --dry-run
```

Capture the full terminal output. Extract the proposed version and the generated changelog block (everything between `Changelog:` and the next blank section), then apply the curation rules below to produce a polished preview. Present:

1. The target version (e.g. `0.44.2`)
2. The curated changelog section as it would appear in `CHANGELOG.md`

Do not make any file changes or git operations in dry-run mode.

## Steps

1. Fetch latest remote state (no branch switch needed):
   ```bash
   git fetch origin
   ```
2. Run `npm run release -- --ci`
   - The version is auto-detected from commits (see version bump rules above)
   - To override: `npm run release -- --ci --increment=<version>` (e.g. `--increment=0.45.0`)
3. `release-it` will create and check out `chore/release-<version>` branched from `origin/main` automatically — no manual branch setup needed
4. **Review and improve the generated changelog** (see below)
5. After `release-it` finishes and the changelog is polished, push the branch and open a PR:
   ```bash
   git push -u origin chore/release-<version>
   gh pr create --title "chore: release <version>"
   ```
6. Once the PR is merged, trigger the [Publish to NPM](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) GitHub action

## Changelog curation (step 4)

After `release-it` commits, the generated `CHANGELOG.md` entry is a mechanical draft — correct but not consumer-friendly. Before pushing, rewrite it to match the style of existing entries.

Read the newly added section at the top of `CHANGELOG.md`, then amend the release commit with an improved version.

### Formatting rules

Match the style of existing entries in `CHANGELOG.md`:

- Blank line after the version header (`## 0.44.2`) and after each section header (`### Fixes`)
- Use `-` bullets, not `*`
- No commit hash links (e.g. `([bb3913c](...))`) — remove them
- Keep PR links (e.g. `([#1774](...))`) if present — they are useful
- Use backticks for component names, hook names, prop names, type names, and npm packages

### Content rules

Write for SDK consumers (partners integrating the SDK), not for internal contributors:

- **Features**: Describe what the feature enables from the consumer's perspective. If a new component or hook is exported, name it.
- **Fixes**: Describe the user-visible symptom that was fixed, not the internal cause.
- **Breaking changes**: Always include a before/after code example showing the migration path. Name the old and new APIs explicitly.
- **Chores & Maintenance**: Collapse multiple dependency bumps into a single grouped line (e.g. "Bump dev dependencies (`vitest`, `typescript-eslint`, `@playwright/test`)"). Only call out a dep bump individually if it has meaningful consumer impact.
- Omit entries that have zero consumer relevance (internal tooling, CI config, docs-only changes).

### Example transformation

Generated:

```
### Fixes

* **SDK-828:** utc roundtrip bug in date picker field ([#1767](...)) ([82b158b](...))
* prevent skeleton/gap pop-in for empty TransitionPayrollAlert ([#1773](...)) ([8601f51](...))
```

After curation:

```
### Fixes

- Fix UTC roundtrip bug in date picker field where dates near midnight would shift by one day ([#1767](...))
- Prevent layout shift (skeleton flash) when `TransitionPayrollAlert` has no content to display ([#1773](...))
```

### Amending the commit

Once the changelog is edited to your satisfaction:

```bash
git add CHANGELOG.md
git commit --amend --no-edit
```

## Alternatively: trigger from CI

The [Prepare Release](https://github.com/Gusto/embedded-react-sdk/actions/workflows/prepare-release.yaml) workflow accepts a `workflow_dispatch` trigger. Run it from the GitHub Actions UI — it auto-detects the version from commits, creates the branch, and opens a PR without any local setup. The changelog curation step still applies — edit `CHANGELOG.md` and push an additional commit to the PR branch before merging.
