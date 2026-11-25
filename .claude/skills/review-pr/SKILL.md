---
name: review-pr
description: >-
  Review a pull request or local diff against the Embedded React SDK's
  conventions and hook architecture, and write the feedback in plain, simple
  English. Use when the user says "review this PR", "review PR 1234", "review
  my branch", "check my changes against our conventions", "pre-review before I
  open a PR", or passes a PR number, PR URL, or branch name to review. Covers
  the ComponentsContext pattern, no react-hook-form internals, date-only
  helpers, i18n namespaces, test assertion style, form hook models, and
  public-repo hygiene.
---

# Review a PR against SDK conventions

This skill reviews a change and writes feedback that a busy teammate can read once and act on. Two things matter most:

1. **Only flag real convention problems.** Linters, the type checker, and human reviewers cover everything else.
2. **Write every comment in plain, simple English.** See [Writing the feedback](#writing-the-feedback). This is not optional polish. A correct comment that the author has to read three times is a bad comment.

This repository is public, and so are its PR comments. Never mention internal repositories, internal tools, ticket numbers, customer names, or partner names in feedback. See [Public repository rules](#public-repository-rules).

## Step 1: Get the change

Work out what to review from the user's request:

| The user gave you  | Run                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| A PR number or URL | `gh pr view <n> --json number,title,body,baseRefName,headRefName,files` then `gh pr diff <n>`        |
| A branch name      | `git fetch origin main` then `git diff origin/main...<branch>`                                       |
| Nothing            | `git fetch origin main` then `git diff origin/main...HEAD` plus `git diff HEAD` for uncommitted work |

Skip these paths. They are generated or vendored, so convention feedback on them is noise:

- `package-lock.json` and any other lockfile
- `**/*.snap`
- `dist/**`, `docs/reference/**`, `openapi/**`, `src/generated/**`
- `src/types/i18nresources.d.ts`
- `sdk-app/src/generated-registry-data.ts`

Still look at `src/i18n/es_US/**` and other non-English locale files, but only to check whether they were edited by hand (convention 4).

If the diff is very large, tell the user how big it is and ask whether to review all of it or a part. Don't quietly skip files.

## Step 2: Load the rules that apply

Always read [references/conventions.md](references/conventions.md). It is the checklist for every review.

If the diff touches any of the following, also read [references/hooks.md](references/hooks.md):

- a `use*Form` hook, or anything under a `shared/use*Form/` folder
- `src/partner-hook-utils/`
- a component that calls a form hook, `SDKFormProvider`, `composeSubmitHandler`, or `composeErrorHandler`
- `BaseBoundaries` or `BaseLayout`

[references/hooks.md](references/hooks.md) points to the in-repo hook docs and reference implementations. When a finding depends on how a hook works, read that hook's source before you write the finding.

## Step 3: Check each candidate finding against the code

The diff alone is not enough to be sure. Before you keep a finding:

1. Open the file and read the code around the changed lines.
2. Confirm that the rule really applies there. For example, `new Date(value)` is only a bug if `value` is a date-only `YYYY-MM-DD` string. If it's a full timestamp, it's fine.
3. Check whether the code already handles the problem nearby, for example with a guard a few lines up, or because the hook already provides the value.
4. Only review lines the change adds or modifies. Don't flag older code nearby unless the change makes an existing problem worse.

Drop any finding you can't confirm. A wrong finding costs the author more time than a missed small issue.

## Step 4: Writing the feedback

Write for a reader who is busy, may be new to the codebase, and may not speak English as a first language. Plain English is the rule for every finding, summary, and suggestion.

### Plain English rules

- **Use short sentences.** Aim for under 20 words. One idea per sentence.
- **Use common words.** Write "use" not "utilize", "because" not "due to the fact that", "change" not "refactor" when you just mean change.
- **Write in the active voice.** Write "This call shifts the date by a day", not "The date may be shifted by this call".
- **Say what, why, and how to fix it**, in that order. Keep it to two or three sentences.
- **Explain the reason in everyday words.** Write "This shows the wrong day for users in US time zones", not "This violates the date-handling invariant".
- **Name things exactly.** Use the real file, function, and prop names in backticks. Don't write "this thing" or "the helper".
- **Show the fix when it is short.** A small code block often says more than a paragraph.
- **Define a term the first time you use it**, or avoid it. Spell out abbreviations: write "react-hook-form", not "RHF".
- **Don't use reviewer slang.** Avoid "nit", "LGTM", "IMO", "FWIW", "bikeshed", and "+1".
- **Don't use words that make the reader feel slow.** Avoid "just", "simply", "obviously", "clearly", and "of course".
- **Be direct and kind.** Talk about the code, not the person. Write "This prop exposes internal state", not "You exposed internal state". Don't be sarcastic or add exclamation marks.
- **Ask a real question when you're unsure.** Write "Is this date always a `YYYY-MM-DD` string? If so, `normalizeToDate()` avoids an off-by-one day." Don't present a guess as a fact.

### Example

Hard to read:

> This leaks RHF internals into the component layer, which breaks the hook encapsulation contract; consider hoisting the derived-state logic into the hook's return surface instead.

Plain English:

> `EmployeeForm.tsx:42` calls `setValue` from react-hook-form directly. Components should only use what the hook returns, so partners can build the same form without react-hook-form. Move this logic into `useEmployeeDetailsForm` and expose the result through its `status` or `data`.

### Output format

Show the review in the chat using this structure. Leave out any heading that has no findings.

```markdown
## Convention review: <PR title or branch>

### Must fix

- **`path/to/file.tsx:42`** (Date-only values): What is wrong. Why it matters. How to fix it.

### Should fix

- **`path/to/file.test.tsx:88`** (Assertion style): ...

### Consider

- **`path/to/file.ts:10`** (Public API surface): ...
```

How to choose a severity:

- **Must fix**: public-repo hygiene problems, date bugs, hand-edited translations, react-hook-form internals in components, and final states in standalone components.
- **Should fix**: other clear breaks of the conventions.
- **Consider**: judgment calls, questions, and suggestions.

Use the line number from the new version of the file.

If you find nothing, say so in one sentence, for example: "No convention issues found in this change." Don't list the rules you checked.

End with one short line that says what you did not check, if anything. For example: "I didn't run the tests or check the Storybook stories."

## Step 5: Posting to GitHub (only if asked)

By default, the review stays in the chat. Post it to the PR only when the user asks, and show them the exact text first. Post it as a comment (`gh pr comment <n> --body-file <file>` or `gh pr review <n> --comment --body-file <file>`). Never approve a PR or request changes on the user's behalf.

Before posting, check the text once more against the [public repository rules](#public-repository-rules).

## Public repository rules

This repository and its PR comments are public. In anything you write for a review:

- Don't name internal repositories, internal services, internal hostnames, or internal tools.
- Don't include ticket numbers or links to internal trackers, chat, or docs.
- Don't name the company's customers or business partners.
- If the diff contains personal data or secrets, give only the file and line. Never quote the value.

If a finding can only be explained by pointing to something internal, explain the rule in general terms instead.
