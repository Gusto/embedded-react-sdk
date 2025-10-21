# Release

This command runs a release for the React SDK. We want to do the following:

- Examine the git history and find the most recent release commit
- Calculate the next semantic version based on the conventional commit prefixes in the commits following the release commit (Also look at commit descriptions to see if there have been any breaking changes)
- Update `package.json` to use the updated version
- Run `npm install` from the root directory after updating `package.json`
- Update `CHANGELOG.md` with the commit descriptions as presently organized in that file. Note any breaking changes consistent with what is already in the changelog
- After changes are verified, ask if user would like to commit those changes. If they do, create a git commit formatted as "chore: release <version-number>"
