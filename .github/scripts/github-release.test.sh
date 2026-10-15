#!/usr/bin/env bash
# Unit test for github-release.sh
set -euo pipefail

script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT
export GH_REPO=example/sdk
export GH_CALLS="$fixture/calls"
export PATH="$fixture:$PATH"

cat > "$fixture/gh" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GH_CALLS"
if [ "$1" = api ]; then
  case "$RELEASE_STATE" in
    exists) exit 0 ;;
    missing) echo 'gh: Not Found (HTTP 404)' >&2; exit 1 ;;
    forbidden) echo 'gh: Forbidden (HTTP 403)' >&2; exit 1 ;;
    unavailable) echo 'gh: Service Unavailable (HTTP 503)' >&2; exit 1 ;;
  esac
fi
exit "${RELEASE_OPERATION_STATUS:-0}"
MOCK
chmod +x "$fixture/gh"
printf 'Release notes\n' > "$fixture/notes.md"

run_release() {
  : > "$GH_CALLS"
  bash "$script_directory/github-release.sh" "$@" > "$fixture/output" 2>&1
}

export RELEASE_STATE=missing
run_release 1.2.3 "$fixture/notes.md"
grep -Fx "release create v1.2.3 --verify-tag --title v1.2.3 --notes-file $fixture/notes.md" "$GH_CALLS"

export RELEASE_STATE=exists
run_release 1.2.3 "$fixture/notes.md"
if grep -q 'release create' "$GH_CALLS"; then exit 1; fi
for RELEASE_STATE in forbidden unavailable; do
  export RELEASE_STATE
  if run_release 1.2.3 "$fixture/notes.md"; then
    echo "FAIL: ignored $RELEASE_STATE API error" >&2
    exit 1
  fi
  if grep -q 'release create' "$GH_CALLS"; then exit 1; fi
done

export RELEASE_STATE=missing
export RELEASE_OPERATION_STATUS=1
if run_release 1.2.3 "$fixture/notes.md"; then exit 1; fi
unset RELEASE_OPERATION_STATUS

if run_release '1.2.3; echo unsafe' "$fixture/notes.md"; then exit 1; fi
if [ -s "$GH_CALLS" ]; then exit 1; fi

echo 'All GitHub Release creation checks passed.'
