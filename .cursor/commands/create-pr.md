# Create PR

This command prepares and creates a pull request using the repo template and concise, high-signal content.

- Use `.github/PULL_REQUEST_TEMPLATE.md` as the non-negotiable PR body structure
- Keep template intent true: concise and high-signal content, with no file-by-file changelog in `## Changes`
- Gather context before drafting: `git status`, `git log`, and `git diff <base>...HEAD`
- Verify branch safety before PR creation:
  - Do not create PRs from `main` or `master`
  - Confirm there are commits to include
- Fill relevant template sections with accurate details only; do not invent missing facts
- Follow template guidance for optional sections:
  - `## Demo`: include screenshots/recordings for UI work; otherwise delete the section
  - `## Related`: include Jira/Figma/related PR links when available
- In `## Testing`, include manual validation steps, exact commands run, and short results
- Propose a conventional-commit PR title (`feat/fix/chore/refactor/docs`, optional scope like `feat(SDK-123): ...`)
- Show the final PR title and PR body for approval before creating the PR
- After approval, create the PR with `gh pr create` using the approved title/body (use `--draft` only if requested)
- Return the created PR URL and confirm success
