# Create branch

This command creates a new branch for the current task using our naming convention.

- Resolve `usr` automatically from the authenticated GitHub handle:
  - `github_handle=$(gh api user -q .login)`
  - Derive `usr` from `github_handle` as follows:
    - Start with `github_handle` lowercased.
    - If it contains hyphens, create a short alias by taking the first letter of each hyphen-separated part (for example `xiao-hu` -> `xh`, `john-smith` -> `js`).
    - If the resulting alias is longer than 8 characters or looks unclear, ask the user to confirm or provide a preferred short lowercase alias.
  - If `gh` is unavailable or unauthenticated, ask the user for `usr`
- Ask for inputs before creating the branch:
  - Jira ticket URL or ID (optional, for example `SDK-343`)
  - Branch type (`feat`, `fix`, `chore`, `docs`, `refactor`)
  - Short branch slug describing the work
- Use branch format:
  - With Jira: `<usr>/<type>/<JIRA-ID>-<slug>`
  - Without Jira: `<usr>/<type>/<slug>`
- Keep `<slug>` short and descriptive (target: under 20 characters)
- Normalize naming:
  - `<usr>` should be lowercase and concise
  - `<type>` should be lowercase
  - `<JIRA-ID>` (if provided) should stay uppercase (for example `SDK-343`)
  - `<slug>` should be lowercase kebab-case
- Create and switch in one step:
  - `git checkout -b "<usr>/<type>/<JIRA-ID>-<slug>"` or `git checkout -b "<usr>/<type>/<slug>"`
- Verify and report the current branch with:
  - `git branch --show-current`
