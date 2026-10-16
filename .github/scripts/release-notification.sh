#!/usr/bin/env bash
# Post the release to Slack, using SUMMARY or a fallback message.
# Usage: bash .github/scripts/release-notification.sh (env: VERSION, SUMMARY, SLACK_BOT_TOKEN)
set -euo pipefail

RELEASE_URL="https://github.com/Gusto/embedded-react-sdk/releases/tag/v${VERSION}"
if [ -z "$SUMMARY" ]; then
  SUMMARY="A new version has been published. See the changelog for details."
fi
response=$(curl -fsS -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg version "$VERSION" \
    --arg summary "$SUMMARY" \
    --arg url "$RELEASE_URL" \
    '{
      channel: "C04JMFQ001K",
      text: (":package: *@gusto/embedded-react-sdk v" + $version + " published*\n\n" + $summary + "\n\n<" + $url + "|View full changelog>"),
      unfurl_links: false
    }'
  )")
jq -e '.ok == true' <<< "$response" >/dev/null
