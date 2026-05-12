---
name: review-pr
description: Review a GitHub pull request. Use when asked to review a PR or pull request.
argument-hint: '<PR number or GitHub URL>'
allowed-tools: [Bash, Read]
---

# PR Review

Review a GitHub pull request and report findings with severity tiers and suggested fixes.

## Arguments

`$ARGUMENTS` — PR number, GitHub URL (`https://github.com/owner/repo/pull/123`), or empty to auto-detect the current branch's open PR.

## Steps

### Step 1: Fetch PR

Parse `$ARGUMENTS`:

- GitHub URL → extract `owner/repo` and number
- Plain number → detect repo via `gh repo view --json nameWithOwner -q .nameWithOwner`
- Empty → use `gh pr view --json number,title,body,author,url,baseRefName,headRefName`

```bash
gh pr view <number> [--repo <owner/repo>] --json number,title,body,author,url,baseRefName,headRefName
gh pr diff <number> [--repo <owner/repo>]
```

### Step 2: Load Learned Rules

Check whether a repo-local learned rules file exists:

```bash
test -f .claude/skills/review-pr/rules/learned.md && echo "exists"
```

- **If it exists**: read both `.claude/skills/review-pr/rules/learned.md` (repo-local) and `~/.claude/skills/review-pr/rules/learned.md` (global), and apply rules from both. Repo-local rules take precedence if there is a conflict.
- **If it does not exist**: read `~/.claude/skills/review-pr/rules/learned.md` only.

Apply every rule found. Each rule has a severity (error → Critical, warning → Important, info → Suggestion).

### Step 3: Review the Diff

Analyze the diff for the following, in addition to the learned rules:

**Always check:**

- Correctness: logic errors, off-by-ones, unhandled promise rejections, missing null checks
- Security: user-controlled input reaching dangerous sinks, missing sanitization, exposed secrets
- TypeScript: the learned rules cover `as` casts; also flag implicit `any` and unsafe non-null assertions
- Tests: the learned rules cover redundancy; also flag new logic with zero test coverage

**Check when relevant (skip if no UI/component files changed):**

- Accessibility: interactive elements missing `aria-label` or role, focus management issues, missing keyboard handlers on clickable non-button elements

**Check when relevant (skip if not an SDK component):**

- Apply the partner-facing API rule from learned rules

### Step 4: Output

````
# PR Review: <title>

**PR:** #<number> · **Author:** <author> · **Branch:** `<head>` → `<base>`

---

## Critical
<!-- Must fix before merge: bugs, security issues, broken a11y on interactive elements -->

- **[rule or category]** `path/to/file.tsx:42` — <what's wrong and why it matters>
  ```ts
  // Fix:
  <corrected snippet>
````

## Important

<!-- Significant quality concerns: unsafe types, missing tests on non-trivial code, API design issues -->

- **[rule or category]** `path/to/file.ts:88` — <description>
  ```ts
  // Fix:
  <corrected snippet>
  ```

## Suggestions

<!-- Nice-to-have: minor improvements that aren't blocking -->

- **[rule or category]** `path/to/file.ts:12` — <description>

## Strengths

<!-- What's well done — always include at least one observation -->

---

## Assessment

<One paragraph: what the PR accomplishes, main quality signal, merge recommendation.>

```

### Step 5: Learn from Feedback

After delivering the review, stay alert for follow-up messages where the user:
- Corrects a finding ("that's not actually a problem because…", "this is intentional")
- Points out something the review missed ("you didn't flag…", "what about…")
- Describes a pattern to watch for going forward

When this happens, **immediately** invoke the `learn-review` skill with a concise summary of the new pattern or correction. Do not wait for the user to explicitly ask — treat any correction or missed-pattern note as a learning trigger.

## Rules

- Include a fix snippet for every Critical and Important finding
- Cite `file:line` for every finding — no vague descriptions
- If the diff is large (600+ lines), focus on Critical and Important only
- Never omit the Strengths section
- Tag each finding with the LEARNED-NNN rule ID when one applies (e.g., `[LEARNED-002]`)
```
