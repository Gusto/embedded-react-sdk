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
- Propose a conventional-commit PR title using the semver mapping below:

## Semver PR Title Guidelines

PR titles determine automatic version bumping on merge. Choose the type based on the change:

| Type | Version Bump | When to Use |
|------|--------------|-------------|
| `feat` | MINOR (0.1.0 → 0.2.0) | New features or functionality |
| `fix` | PATCH (0.1.0 → 0.1.1) | Bug fixes |
| `feat!` or `fix!` | MAJOR (0.1.0 → 1.0.0) | Breaking changes (add `!` before `:`) |
| `docs` | none | Documentation only |
| `chore` | none | Maintenance, dependencies |
| `refactor` | none | Code restructuring |
| `test` | none | Test changes |
| `ci` | none | CI/CD changes |
| `style` | none | Code style/formatting |
| `perf` | none | Performance improvements |
| `build` | none | Build system changes |
| `revert` | none | Reverting changes |

Examples:
- `feat: add new component` → MINOR bump
- `fix: resolve validation issue` → PATCH bump
- `feat!: redesign API interface` → MAJOR bump
- `feat(SDK-123): add payroll alerts` → MINOR bump with ticket scope
- `chore: update dependencies` → no version bump

- Show the final PR title and PR body for approval before creating the PR
- After approval, create the PR with `gh pr create --draft` using the approved title/body (skip `--draft` only if the user explicitly requests a non-draft PR)
- Return the created PR URL and confirm success
