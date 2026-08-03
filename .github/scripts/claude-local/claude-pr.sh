#!/usr/bin/env bash
# claude-pr.sh — run local Claude Code against a GitHub PR in an isolated worktree.
# Usage: claude-pr.sh <pr-number> <instruction…>
# Example: claude-pr.sh 2493 "rebase onto main and resolve any conflicts"
set -euo pipefail

PR="${1:?usage: claude-pr.sh <pr-number> <instruction…>}"; shift
INSTRUCTION="$*"
[ -n "${INSTRUCTION}" ] || { echo "error: no instruction given" >&2; exit 1; }

command -v gh     >/dev/null || { echo "error: gh CLI not found" >&2; exit 1; }
command -v claude >/dev/null || { echo "error: claude CLI not found" >&2; exit 1; }
gh auth status    >/dev/null 2>&1 || { echo "error: run 'gh auth login' first" >&2; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
BRANCH="$(gh pr view "$PR" --json headRefName -q .headRefName)"
WORKTREE="${REPO_ROOT}/.claude/worktrees/pr-${PR}"

# git must never drop into an interactive editor in headless mode (rebase todo, merge msg)
export GIT_EDITOR=true GIT_SEQUENCE_EDITOR=true

echo ">> fetching PR #$PR (branch: $BRANCH)"
git -C "$REPO_ROOT" fetch origin "$BRANCH"
git -C "$REPO_ROOT" worktree remove --force "$WORKTREE" 2>/dev/null || true
git -C "$REPO_ROOT" worktree add "$WORKTREE" "origin/$BRANCH"
cd "$WORKTREE"

# The `claude` shim resolves node via mise from the repo's .nvmrc; make sure that
# pinned toolchain is actually installed or the shim dies before Claude starts.
# Idempotent: instant no-op once the version exists.
if command -v mise >/dev/null; then
  echo ">> ensuring pinned toolchain (mise install)…"
  mise install
fi

read -r -d '' PROMPT <<EOF || true
You are working on GitHub PR #$PR (branch: $BRANCH), checked out fresh in the current worktree directory.

Use the gh CLI to pull any context you need — do not assume, look it up:
  gh pr view $PR             # title, body, state, checks
  gh pr diff $PR             # the diff
  gh pr view $PR --comments  # review + conversation comments

Requested task (from the triggering GitHub comment):
$INSTRUCTION

Work only in this worktree. Do NOT push or comment on the PR unless the task explicitly says to.
When finished, summarize what you changed and flag anything that needs a human.
EOF

echo ">> handing off to Claude Code…"
# Scoped allowlist (not bypassPermissions): permits git ops, gh reads, and file edits
# without prompting, while keeping the blast radius bounded.
claude -p "$PROMPT" \
  --allowedTools "Bash(git:*),Bash(gh pr view:*),Bash(gh pr diff:*),Read,Edit,Grep,Glob"

echo
echo ">> done. Worktree left for inspection at: $WORKTREE"
echo ">> remove with: git -C \"$REPO_ROOT\" worktree remove --force \"$WORKTREE\""
