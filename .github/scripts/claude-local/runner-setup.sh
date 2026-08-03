#!/usr/bin/env bash
# runner-setup.sh — one-time, per-person onboarding for @claude-local.
# Team-agnostic: detects YOUR GitHub login and registers a runner labeled with it,
# so @claude-local comments you make route to this machine and nobody else's.
#
# Usage:  REPO=Gusto/embedded-react-sdk ./runner-setup.sh
# Requires: macOS, admin on the repo (to mint a runner registration token).
set -euo pipefail

REPO="${REPO:?set REPO, e.g. REPO=Gusto/embedded-react-sdk}"
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "== 1/5  Dependencies =="
install_if_missing() { command -v "$1" >/dev/null || { echo ">> installing $1"; eval "$2"; }; }
command -v brew   >/dev/null || { echo "error: Homebrew required (https://brew.sh)"; exit 1; }
install_if_missing mise   "brew install mise"
install_if_missing gh     "brew install gh"
install_if_missing claude "curl -fsSL https://claude.ai/install.sh | bash"

echo "== 2/5  Auth checks =="
gh auth status >/dev/null 2>&1 || { echo ">> run 'gh auth login' then re-run"; exit 1; }
LOGIN="$(gh api user -q .login)"
echo ">> GitHub login: $LOGIN"
echo ">> make sure you're also logged into Claude Code (run 'claude' once interactively if unsure)"

echo "== 3/5  Install worker script =="
mkdir -p "$HOME/bin"
cp "$SCRIPT_DIR/claude-pr.sh" "$HOME/bin/claude-pr"
chmod +x "$HOME/bin/claude-pr"
echo ">> installed $HOME/bin/claude-pr  (ensure ~/bin is on your PATH)"

echo "== 4/5  Download GitHub Actions runner =="
mkdir -p "$RUNNER_DIR" && cd "$RUNNER_DIR"
if [ ! -x ./run.sh ]; then
  TAG="$(gh api repos/actions/runner/releases/latest -q .tag_name)"; VER="${TAG#v}"
  ARCH="$(uname -m)"; [ "$ARCH" = "arm64" ] && A=arm64 || A=x64
  curl -fsSLo runner.tar.gz "https://github.com/actions/runner/releases/download/${TAG}/actions-runner-osx-${A}-${VER}.tar.gz"
  tar xzf runner.tar.gz && rm runner.tar.gz
fi

echo "== 5/5  Register runner labeled '$LOGIN' =="
TOKEN="$(gh api -X POST "repos/${REPO}/actions/runners/registration-token" -q .token)"
./config.sh --url "https://github.com/${REPO}" --token "$TOKEN" \
  --labels "self-hosted,${LOGIN}" --name "${LOGIN}-local" --unattended --replace
./svc.sh install && ./svc.sh start

echo
echo ">> Done. Comment '@claude-local <task>' on a PR in ${REPO} to run it here."
echo ">> Manage the service:  (cd $RUNNER_DIR && ./svc.sh status|stop|start)"
