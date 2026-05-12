---
name: learn-review
description: Add a new rule to the review-pr skill's learned patterns. Use when you notice something in a code review that the skill missed or should catch in the future.
argument-hint: '<note about what to catch>'
allowed-tools: [Read, Edit]
---

# Add a Learned Review Rule

Append a new entry to the `review-pr` skill's learned patterns based on `$ARGUMENTS`.

## Steps

### Step 1: Locate and read the current learned rules

Check whether a repo-local learned rules file exists:

```bash
test -f .claude/skills/review-pr/rules/learned.md && echo "exists"
```

- **If it exists**: use `.claude/skills/review-pr/rules/learned.md` as the target file for both reading and writing.
- **If it does not exist**: use `~/.claude/skills/review-pr/rules/learned.md` as the target file.

Read the target file and determine the next LEARNED-NNN number from the existing entries.

### Step 2: Draft the new rule

From `$ARGUMENTS`, extract:

- A short title (5–8 words)
- The rule itself (1–3 sentences: what to avoid and why)
- A severity: `error` → Critical, `warning` → Important, `info` → Suggestion
- A bad example (if the note contains enough detail to write one)
- A good example (if the note contains enough detail)

Use this format:

```markdown
---

### LEARNED-NNN: <Title>

- **Severity:** warning
- **Rule:** <Clear rule statement.>

#### Bad Example

\`\`\`tsx
// code showing what to avoid
\`\`\`

#### Good Example

\`\`\`tsx
// code showing the correct approach
\`\`\`
```

If the note doesn't have enough detail to write good/bad examples, omit those sections and include just the rule statement. Do not invent examples.

### Step 3: Append to the target learned.md

Insert the new entry before the `## Adding New Patterns` footer section at the bottom of the target file identified in Step 1.

Also update the footer line that says "The next entry should be `LEARNED-NNN`" to reflect the new next number.

### Step 4: Confirm

Report back:

- The rule ID assigned (e.g., `LEARNED-006`)
- The rule title
- The severity
- One sentence summarizing what was added
