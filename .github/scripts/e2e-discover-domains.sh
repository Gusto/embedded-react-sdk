#!/usr/bin/env bash
#
# e2e-discover-domains.sh — Decide which e2e domain shards should run.
#
# Used by the `e2e-discover` job in .github/workflows/ci.yaml. Writes the
# selected domain list as a JSON array to $GITHUB_OUTPUT under the key
# `domains`. Downstream `e2e-setup` and `e2e` jobs consume that output via
# fromJson() to drive matrix expansion.
#
# Inputs (env vars set by the workflow):
#   EVENT_NAME      github.event_name
#   REF             github.ref
#   BASE_REF        github.base_ref (empty on plain push events)
#   GITHUB_OUTPUT   path to the per-step output file (provided by Actions)
#
# Outputs (written to $GITHUB_OUTPUT):
#   domains=<JSON array>  e.g. ["payroll","time-off"] or [] or ["company",...]
#
# Selection rules:
#   1. push to main / workflow_dispatch  → all domains (always exhaustive)
#   2. PR with only non-runtime files    → []           (skip e2e entirely)
#   3. PR touching a path outside any domain's surface
#      (e.g. src/components/Common/, src/hooks/, package.json, this script)
#      → all domains (safe default for cross-cutting changes)
#   4. PR touching only domain-owned paths
#      → exactly the domains whose surface was touched
#
# Domain naming contract:
#   e2e/tests/<kebab>  ↔  src/components/<Pascal>     (e.g. time-off ↔ TimeOff)
# The list is discovered from disk on every run; no maintenance needed.
#
# Portability: written for POSIX-ish bash 3.2+ and either GNU or BSD find,
# so it runs natively on the GitHub-hosted ubuntu-latest runner AND on
# macOS for local debugging. Required tools: bash, find, sed, awk, jq, git.

set -euo pipefail

if [[ -z "${GITHUB_OUTPUT:-}" ]]; then
  echo "ERROR: GITHUB_OUTPUT is not set — set it to a writable file path" >&2
  echo "       (GitHub Actions sets this automatically; locally use a tempfile)" >&2
  exit 2
fi

# Discover domains. `find ... | sed 's|.*/||'` is the portable equivalent
# of GNU find's `-printf '%f\n'` — strip everything up to and including
# the last slash to get the basename. The `while read` loop is the
# bash 3.2-compatible equivalent of `mapfile -t`.
domains=()
while IFS= read -r domain; do
  domains+=("$domain")
done < <(find e2e/tests -mindepth 1 -maxdepth 1 -type d | sed 's|.*/||' | sort)
all_domains_json=$(printf '%s\n' "${domains[@]}" | jq -R . | jq -sc .)

EVENT_NAME="${EVENT_NAME:-}"
REF="${REF:-}"

if [[ "$EVENT_NAME" == "workflow_dispatch" || "$REF" == "refs/heads/main" ]]; then
  echo "Running all domains (event=$EVENT_NAME ref=$REF)"
  echo "domains=$all_domains_json" >> "$GITHUB_OUTPUT"
  exit 0
fi

base="${BASE_REF:-main}"
git fetch --no-tags --depth=0 origin "$base" >/dev/null 2>&1 || git fetch origin "$base"
all_changed=$(git diff --name-only "origin/${base}...HEAD")
echo "All changed files vs origin/${base}:"
echo "$all_changed" | sed 's/^/  /'

# Filter to extensions that can actually affect SDK runtime or test behavior.
# Markdown, license files, gitignore, editorconfig, images, etc. are dropped —
# they can't change what the e2e suite exercises, so a docs-only PR shouldn't
# burn CI minutes running the full Playwright matrix. Anything *new* with one
# of these extensions in an unfamiliar location still falls through to the
# cross-cutting branch below, preserving the safe default.
changed=$(echo "$all_changed" | grep -E '\.(ts|tsx|js|jsx|cjs|mjs|json|ya?ml|s?css|html|svg|env)$' || true)

if [[ -z "$changed" ]]; then
  echo "No code/config changes detected (only non-runtime files)"
  echo "domains=[]" >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "Filtered changed files (runtime-affecting):"
echo "$changed" | sed 's/^/  /'

# Build the regex that matches "this file is part of some domain's owned
# surface area" — i.e. lives under either src/components/<Pascal>/ or
# e2e/tests/<kebab>/ for a known domain. kebab→Pascal converts time-off →
# TimeOff so the single discovered name covers both ends.
kebab_to_pascal() {
  local kebab="$1"
  echo "$kebab" | awk -F- '{ for (i=1;i<=NF;i++) printf "%s%s", toupper(substr($i,1,1)), substr($i,2); print "" }'
}

domain_owned_regex=""
for domain in "${domains[@]}"; do
  pascal=$(kebab_to_pascal "$domain")
  entry="^(src/components/${pascal}/|e2e/tests/${domain}/)"
  if [[ -z "$domain_owned_regex" ]]; then
    domain_owned_regex="$entry"
  else
    domain_owned_regex="${domain_owned_regex}|${entry}"
  fi
done

# Any file in the diff that ISN'T claimed by a domain is by definition
# cross-cutting — run everything. Default-safe policy: unknown locations
# fan out instead of silently producing an empty matrix.
unowned=$(echo "$changed" | grep -vE "$domain_owned_regex" || true)
if [[ -n "$unowned" ]]; then
  echo "Cross-cutting changes detected (not under any domain):"
  echo "$unowned" | sed 's/^/  /'
  echo "Running all domains"
  echo "domains=$all_domains_json" >> "$GITHUB_OUTPUT"
  exit 0
fi

selected=()
for domain in "${domains[@]}"; do
  pascal=$(kebab_to_pascal "$domain")
  if echo "$changed" | grep -qE "^(src/components/${pascal}/|e2e/tests/${domain}/)"; then
    selected+=("$domain")
  fi
done

domains_json=$(printf '%s\n' "${selected[@]}" | jq -R . | jq -sc .)
echo "Running selected domains: $domains_json"
echo "domains=$domains_json" >> "$GITHUB_OUTPUT"
