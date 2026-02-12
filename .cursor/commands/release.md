# Release

This command manages releases for the React SDK.

## Automatic Versioning and Changelog

Package versions and changelog are now automatically updated when PRs are merged to `main`, based on the PR title:

- `feat:` → MINOR bump (0.1.0 → 0.2.0) + "Features & Enhancements" changelog entry
- `fix:` → PATCH bump (0.1.0 → 0.1.1) + "Fixes" changelog entry
- `feat!:` or `fix!:` → MAJOR bump (0.1.0 → 1.0.0) + "Breaking Changes" changelog entry
- Other types (`docs`, `chore`, etc.) → no version bump + "Chores & Maintenance" changelog entry

## Publishing a Release

After PRs are merged and versions are bumped:

1. Verify the current version in `package.json` is correct
2. Verify `CHANGELOG.md` has been updated with recent changes
3. Run the `Publish to NPM` GitHub action at https://github.com/Gusto/embedded-react-sdk/actions/workflows/publish.yaml
4. Click `Run workflow` to publish to NPM

## Manual Release (if needed)

If automatic versioning didn't trigger or you need to manually adjust:

1. Examine the git history and find the most recent release commit
2. Calculate the next semantic version based on the conventional commit prefixes:
   - `feat` commits → MINOR bump
   - `fix` commits → PATCH bump
   - Breaking changes (with `!`) → MAJOR bump
3. Update `package.json` to use the calculated version
4. Run `npm install` from the root directory after updating `package.json`
5. Update `CHANGELOG.md` with the commit descriptions as presently organized in that file. Note any breaking changes consistent with what is already in the changelog
6. After changes are verified, ask if user would like to commit those changes. If they do, create a git commit formatted as "chore: release <version-number>"
