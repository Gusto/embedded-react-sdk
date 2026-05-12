#!/bin/bash
# Installs global Claude Code skills to ~/.claude/skills/.
# Run once per machine. Safe to re-run — only overwrites if you confirm.
#
# These global skills complement the repo-local skills in .claude/skills/:
#   - When you open Claude Code inside this repo, the repo-local skills
#     take over automatically (no install needed).
#   - These global versions add the same repo-detection logic for use
#     in other repos and so the auto-learn flow works from any context.

set -e

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GLOBAL_SKILLS_DIR="$HOME/.claude/skills"

install_skill() {
  local skill_name="$1"
  local src="$INSTALL_DIR/skills/$skill_name"
  local dest="$GLOBAL_SKILLS_DIR/$skill_name"

  if [ -d "$dest" ]; then
    read -r -p "  $skill_name already exists at $dest — overwrite? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "  Skipped $skill_name."
      return
    fi
  fi

  mkdir -p "$dest"
  cp -r "$src/." "$dest/"
  echo "  Installed $skill_name → $dest"
}

echo "Installing Claude Code skills to $GLOBAL_SKILLS_DIR..."
echo ""
install_skill "review-pr"
install_skill "learn-review"
echo ""
echo "Done. Restart Claude Code if it is currently open."
