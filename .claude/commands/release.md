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

## Steps

1. Make sure you're on a clean, up-to-date `main` branch:
   ```bash
   git checkout main && git pull origin main
   ```
2. Run `npm run release`
3. Review the proposed version and confirm (or type a different version)
4. After `release-it` finishes, push the branch and open a PR:
   ```bash
   git push -u origin chore/release-<version>
   gh pr create --title "chore: release <version>"
   ```
5. Once the PR is merged, trigger the [Publish to NPM](https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml) GitHub action

## Alternatively: trigger from CI

The [Prepare Release](https://github.com/Gusto/embedded-react-sdk/actions/workflows/prepare-release.yaml) workflow accepts a `workflow_dispatch` trigger. Run it from the GitHub Actions UI — it auto-detects the version from commits, creates the branch, and opens a PR without any local setup.
