# Claude Code Skills — Setup

Skills in this repo work in two layers. Understanding both saves you time.

## Layer 1: Repo-local skills (automatic — no setup required)

When you open Claude Code inside this repo, it automatically picks up the skills in `.claude/skills/`:

| Skill           | What it does                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/review-pr`    | Full SDK-aware PR review — checks hook composition, `composeSubmitHandler` usage, `BaseBoundaries`, event payloads, validation messages, and more |
| `/learn-review` | Adds a new pattern to `rules/learned.md` in this repo so the whole team benefits                                                                  |

**No installation needed.** These work the moment you clone and open the repo in Claude Code.

## Layer 2: Global skills (one-time install per machine)

The global skills add the same repo-detection logic to your `~/.claude/skills/` so that:

- When you correct a review or flag something missed, the learning is written to **this repo's** `learned.md` automatically — even if the trigger happens outside a formal `/review-pr` session.
- When you use `/review-pr` in **other repos**, you still get the global baseline learned rules.

### Install

```bash
bash .claude/install/install-skills.sh
```

The script copies `review-pr` and `learn-review` to `~/.claude/skills/`. It prompts before overwriting if you already have versions there. Safe to re-run.

Restart Claude Code after installing.

## How the learning loop works

```
/review-pr                → reads repo-local learned.md + global learned.md
  │
  └─ you correct a finding or flag something missed
       │
       └─ /learn-review fires automatically
            │
            └─ writes new rule to .claude/skills/review-pr/rules/learned.md
                 │
                 └─ commit & push → teammates get the rule on next pull
```

`learned.md` is version-controlled. Rules accumulate over time and apply to every future review in this repo.

## Files

```
.claude/install/
├── README.md                         this file
├── install-skills.sh                 copies global skills to ~/.claude/skills/
└── skills/
    ├── review-pr/SKILL.md            global version (repo detection, standard checks)
    └── learn-review/SKILL.md         global version (writes to repo-local learned.md when present)
```
