#!/usr/bin/env bash
set -euo pipefail

script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT
export NPM_CALLS="$fixture/calls"
export PATH="$fixture:$PATH"

cat > "$fixture/npm" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$NPM_CALLS"
case "$*" in
  'view @gusto/embedded-react-sdk dist-tags --json')
    printf '%s\n' "$REGISTRY_TAGS"
    exit "${READ_STATUS:-0}"
    ;;
  'dist-tag rm @gusto/embedded-react-sdk rc') exit "${REMOVE_STATUS:-0}" ;;
  *) echo "Unexpected npm operation: $*" >&2; exit 1 ;;
esac
MOCK
chmod +x "$fixture/npm"

run_retirement() {
  : > "$NPM_CALLS"
  bash "$script_directory/retire-rc.sh" "$@" > "$fixture/output" 2>&1
}

assert_no_mutation() {
  if grep -q '^dist-tag' "$NPM_CALLS"; then
    echo 'FAIL: unexpected registry mutation' >&2
    exit 1
  fi
}

export REGISTRY_TAGS='{"latest":"1.2.3","rc":"1.2.4-rc.1"}'
run_retirement 1.2.4-rc.1 true
assert_no_mutation
run_retirement 1.2.4-rc.1 false
grep -Fx 'dist-tag rm @gusto/embedded-react-sdk rc' "$NPM_CALLS"
[ "$(wc -l < "$NPM_CALLS" | tr -d ' ')" = 2 ]

if run_retirement 1.2.4-rc.2 false; then exit 1; fi
assert_no_mutation

for registry_tags in '{}' '{"latest":"1.2.3"}'; do
  export REGISTRY_TAGS="$registry_tags"
  run_retirement 1.2.4-rc.1 false
  assert_no_mutation
done

for registry_tags in '' 'not json' 'null' '[]' '{"rc":null}' '{"rc":""}' '{"rc":42}' '{"rc":"absent"}' '{"rc":"1.2.4"}'; do
  export REGISTRY_TAGS="$registry_tags"
  if run_retirement 1.2.4-rc.1 false; then exit 1; fi
  assert_no_mutation
done

export REGISTRY_TAGS='{}'
for READ_STATUS in 1 403 503; do
  export READ_STATUS
  if run_retirement 1.2.4-rc.1 false; then exit 1; fi
  assert_no_mutation
done
unset READ_STATUS

export REGISTRY_TAGS='{"rc":"1.2.4-rc.1"}'
export REMOVE_STATUS=1
if run_retirement 1.2.4-rc.1 false; then exit 1; fi
unset REMOVE_STATUS

for invalid_version in '1.2.4' 'latest' '1.2.4-rc.1; echo unsafe'; do
  if run_retirement "$invalid_version" false; then exit 1; fi
  [ ! -s "$NPM_CALLS" ]
done
if run_retirement 1.2.4-rc.1 'false; echo unsafe'; then exit 1; fi
[ ! -s "$NPM_CALLS" ]

echo 'All RC retirement checks passed.'
