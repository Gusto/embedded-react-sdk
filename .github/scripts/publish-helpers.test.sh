#!/usr/bin/env bash
set -euo pipefail

script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
fixture=$(mktemp -d)
trap 'rm -rf "$fixture"' EXIT
mkdir "$fixture/bin" "$fixture/source"
export GIT_CONFIG_COUNT=2
export GIT_CONFIG_KEY_0=commit.gpgsign GIT_CONFIG_VALUE_0=false
export GIT_CONFIG_KEY_1=tag.gpgsign GIT_CONFIG_VALUE_1=false
export PATH="$fixture/bin:$PATH"

# Extract inline publish commands so tests exercise the workflow itself.
node --input-type=module - "$script_directory/../workflows" "$fixture" <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'
const [workflows, fixture] = process.argv.slice(2)
for (const [workflow, job, name, file] of [
  ['publish.yaml', 'npm-publish', 'Publish to NPM', 'publish-stable.sh'],
  ['publish-rc.yaml', 'publish', 'Publish RC version', 'publish-rc.sh'],
]) {
  const steps = parse(readFileSync(`${workflows}/${workflow}`, 'utf8')).jobs[job].steps
  writeFileSync(`${fixture}/${file}`, steps.find(step => step.name === name).run)
}
NODE

export NPM_CALLS="$fixture/npm-calls"
export GITHUB_OUTPUT="$fixture/output"
cd "$fixture/source"
printf '{"version":"1.2.3"}\n' > package.json

cat > "$fixture/bin/npm" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$NPM_CALLS"
case "$1" in
  view) printf '%s\n' "$REGISTRY_VERSIONS"; exit "${READ_STATUS:-0}" ;;
  version) exit "${VERSION_STATUS:-0}" ;;
  publish) exit "${PUBLISH_STATUS:-0}" ;;
  *) exit 1 ;;
esac
MOCK
chmod +x "$fixture/bin/npm"

run_prepare() {
  : > "$NPM_CALLS"
  : > "$GITHUB_OUTPUT"
  bash "$script_directory/prepare-rc.sh" "$@" > "$fixture/log" 2>&1
}
assert_no_version_change() {
  if grep -q '^version ' "$NPM_CALLS"; then
    echo 'FAIL: unexpected version change' >&2
    exit 1
  fi
  [ ! -s "$GITHUB_OUTPUT" ]
}

# RC preparation: version selection, input limits, and registry failures.
export REGISTRY_VERSIONS='["1.2.2", "1.2.3-rc.1", "1.2.3-rc.2", "1.2.3-rc.4"]'
run_prepare 1
grep -Fx 'version=1.2.3-rc.3' "$GITHUB_OUTPUT"
grep -Fx 'version 1.2.3-rc.3 --no-git-tag-version --ignore-scripts' "$NPM_CALLS"
[ "$(wc -l < "$NPM_CALLS" | tr -d ' ')" = 2 ]
run_prepare 4
grep -Fx 'version=1.2.3-rc.5' "$GITHUB_OUTPUT"
export REGISTRY_VERSIONS='[]'
run_prepare
grep -Fx 'version=1.2.3-rc.1' "$GITHUB_OUTPUT"
run_prepare 100
grep -Fx 'version=1.2.3-rc.100' "$GITHUB_OUTPUT"

for rc_number in 0 01 101 999999999999999999999999 '1; echo unsafe'; do
  if run_prepare "$rc_number"; then exit 1; fi
  assert_no_version_change
done
export REGISTRY_VERSIONS='["1.2.3-rc.100"]'
if run_prepare 100; then exit 1; fi
assert_no_version_change
for registry_versions in '' 'not json' 'null' '{}' '"1.2.3"' '[null]'; do
  export REGISTRY_VERSIONS="$registry_versions"
  if run_prepare 1; then exit 1; fi
  assert_no_version_change
done
export REGISTRY_VERSIONS='[]'
for READ_STATUS in 1 42; do
  export READ_STATUS
  if run_prepare 1; then exit 1; fi
  assert_no_version_change
done
unset READ_STATUS
export VERSION_STATUS=1
if run_prepare 1; then exit 1; fi
[ ! -s "$GITHUB_OUTPUT" ]
unset VERSION_STATUS
printf '{"version":"1.2.3-rc.1"}\n' > package.json
if run_prepare 1; then exit 1; fi
assert_no_version_change
printf '{"version":"1.2.3"}\n' > package.json

# Stable publishing: new versions, safe reruns, and failure handling.
run_publish() {
  : > "$NPM_CALLS"
  bash -euo pipefail "$fixture/publish-$1.sh" > "$fixture/log" 2>&1
}

export REGISTRY_VERSIONS='["1.2.2"]'
run_publish stable
grep -Fx 'publish --access public --ignore-scripts' "$NPM_CALLS"
export REGISTRY_VERSIONS='["1.2.2", "1.2.3"]'
run_publish stable
if grep -q '^publish ' "$NPM_CALLS"; then exit 1; fi
for registry_versions in '' 'not json' 'null' '{}' '[null]'; do
  export REGISTRY_VERSIONS="$registry_versions"
  if run_publish stable; then exit 1; fi
  if grep -q '^publish ' "$NPM_CALLS"; then exit 1; fi
done
export REGISTRY_VERSIONS='["1.2.2"]' READ_STATUS=1
if run_publish stable; then exit 1; fi
if grep -q '^publish ' "$NPM_CALLS"; then exit 1; fi
unset READ_STATUS
export PUBLISH_STATUS=1
if run_publish stable; then exit 1; fi
unset PUBLISH_STATUS

# RC publishing: dry runs and publish failures.
export RC_VERSION=1.2.3-rc.1
for INPUT_DRY_RUN in true false; do
  export INPUT_DRY_RUN
  run_publish rc
  expected='publish --access public --tag rc --ignore-scripts'
  if [ "$INPUT_DRY_RUN" = true ]; then expected="$expected --dry-run"; fi
  [ "$(cat "$NPM_CALLS")" = "$expected" ]
done
export PUBLISH_STATUS=1
if run_publish rc; then exit 1; fi
if grep -q 'Install with:' "$fixture/log"; then exit 1; fi
unset PUBLISH_STATUS

# Changelog extraction: exact version boundaries and missing notes.
cat > CHANGELOG.md <<'CHANGELOG'
# Changelog
## [1.2.30]
Wrong prefix
## [1.2.3] - 2026-10-14

- A change with "quotes" and $shell text.
CHANGELOG_EOF

## [1.2.2]
Previous version
CHANGELOG
: > "$GITHUB_OUTPUT"
bash "$script_directory/release-changelog.sh"
notes_file=$(sed -n 's/^notes_file=//p' "$GITHUB_OUTPUT")
grep -Fx -- "- A change with \"quotes\" and \$shell text." "$notes_file"
if grep -qE 'Wrong prefix|Previous version|^##' "$notes_file"; then exit 1; fi
grep -Fx 'version=1.2.3' "$GITHUB_OUTPUT"
rm -f "$notes_file"
for changelog in '## [1.2.30]' '## [1.2.3]'; do
  printf '%s\n\n' "$changelog" > CHANGELOG.md
  : > "$GITHUB_OUTPUT"
  if bash "$script_directory/release-changelog.sh" > "$fixture/log" 2>&1; then exit 1; fi
  [ ! -s "$GITHUB_OUTPUT" ]
done

# Release summaries: request payloads, fallback text, and API failures.
export CURL_PAYLOAD="$fixture/payload"
cat > "$fixture/bin/curl" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
while [ "$#" -gt 0 ]; do
  if [ "$1" = -d ]; then printf '%s' "$2" > "$CURL_PAYLOAD"; shift; fi
  shift
done
printf '%s\n' "$CURL_RESPONSE"
exit "${CURL_STATUS:-0}"
MOCK
chmod +x "$fixture/bin/curl"
export VERSION=1.2.3 ANTHROPIC_API_KEY=fake SLACK_BOT_TOKEN=fake
export CHANGELOG_CONTENT=$'- A "quoted" change\n- Another change'
export CURL_RESPONSE='{"content":[{"text":"- Summary\nSUMMARY_EOF\n- More"}]}'
: > "$GITHUB_OUTPUT"
bash "$script_directory/release-summary.sh"
grep -Fx 'SUMMARY_EOF' "$GITHUB_OUTPUT"
jq -e --arg changelog "$CHANGELOG_CONTENT" '.messages[0].content | endswith($changelog)' "$CURL_PAYLOAD" >/dev/null
export CURL_RESPONSE='{"content":[]}'
bash "$script_directory/release-summary.sh"
grep -Fx 'See the full changelog for details.' "$GITHUB_OUTPUT"
export CURL_RESPONSE='not json'
if bash "$script_directory/release-summary.sh" > "$fixture/log" 2>&1; then exit 1; fi
export CURL_RESPONSE='{}' CURL_STATUS=22
if bash "$script_directory/release-summary.sh" > "$fixture/log" 2>&1; then exit 1; fi
unset CURL_STATUS

# Slack notifications: payloads, fallback text, and API failures.
export SUMMARY=$'- Summary with "quotes"\n- Another change' CURL_RESPONSE='{"ok":true}'
bash "$script_directory/release-notification.sh"
jq -e --arg summary "$SUMMARY" '.channel == "C04JMFQ001K" and (.text | contains($summary)) and (.text | contains("releases/tag/v1.2.3")) and .unfurl_links == false' "$CURL_PAYLOAD" >/dev/null
export SUMMARY=''
bash "$script_directory/release-notification.sh"
jq -e '.text | contains("A new version has been published.")' "$CURL_PAYLOAD" >/dev/null
export CURL_RESPONSE='{"ok":false,"error":"invalid_auth"}'
if bash "$script_directory/release-notification.sh" > "$fixture/log" 2>&1; then exit 1; fi
export CURL_RESPONSE='{"ok":true}' CURL_STATUS=22
if bash "$script_directory/release-notification.sh" > "$fixture/log" 2>&1; then exit 1; fi

# Real local repositories cover annotated tags, shallow checkouts and reruns.
git init --bare --quiet "$fixture/remote.git"
git init --quiet .
git config user.name 'Test'
git config user.email 'test@example.com'
git add package.json
git commit --quiet -m 'Initial release'
git remote add origin "$fixture/remote.git"
bash "$script_directory/tag-release.sh" > "$fixture/log" 2>&1
[ "$(git cat-file -t refs/tags/v1.2.3)" = tag ]
git clone --quiet --depth 1 --branch v1.2.3 "file://$fixture/remote.git" "$fixture/shallow" 2> "$fixture/log"
cd "$fixture/shallow"
git update-ref -d refs/tags/v1.2.3
bash "$script_directory/tag-release.sh" > "$fixture/log" 2>&1
printf 'changed\n' > change.txt
git config user.name Test
git config user.email test@example.com
git add change.txt
git commit --quiet -m 'Different commit'
if bash "$script_directory/tag-release.sh" > "$fixture/log" 2>&1; then exit 1; fi
grep -F 'already points to a different commit' "$fixture/log"
printf '{"version":"1.2.4"}\n' > package.json
cat > "$fixture/remote.git/hooks/pre-receive" <<'HOOK'
#!/usr/bin/env bash
exit 1
HOOK
chmod +x "$fixture/remote.git/hooks/pre-receive"
if bash "$script_directory/tag-release.sh" > "$fixture/log" 2>&1; then exit 1; fi
[ -z "$(git ls-remote origin refs/tags/v1.2.4)" ]
git remote set-url origin "$fixture/missing.git"
if bash "$script_directory/tag-release.sh" > "$fixture/log" 2>&1; then exit 1; fi

echo 'All publishing helper checks passed.'
