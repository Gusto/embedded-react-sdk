#!/usr/bin/env bash
#
# e2e-verify-success.sh — Aggregate gate for branch protection.
#
# Used by the `e2e-success` job in .github/workflows/ci.yaml. Treats every
# contributing job as required: success or skipped passes, anything else
# (failure, cancelled, timed_out, action_required, etc.) fails the gate.
#
# Skipped counts as success on purpose so PRs that scope down to a subset
# of shards (or skip e2e entirely on docs-only changes) still satisfy the
# branch-protection check.
#
# Inputs (env vars set by the workflow from needs.<job>.result):
#   SCENARIOS, E2E_DISCOVER, E2E_SETUP, E2E
#
# This script must run inside a job with `if: !cancelled()` — without it,
# a failed upstream short-circuits the whole chain to `skipped`, which
# branch protection treats as passing (the bug we're guarding against).

set -euo pipefail

echo "scenarios=$SCENARIOS e2e-discover=$E2E_DISCOVER e2e-setup=$E2E_SETUP e2e=$E2E"

for r in "$SCENARIOS" "$E2E_DISCOVER" "$E2E_SETUP" "$E2E"; do
  case "$r" in
    success|skipped) ;;
    *) echo "Required job result was '$r'"; exit 1 ;;
  esac
done
