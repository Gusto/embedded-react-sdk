#!/usr/bin/env bash
# Summarize CHANGELOG_CONTENT with Anthropic; writes text to GITHUB_OUTPUT.
# Usage: bash .github/scripts/release-summary.sh (env: VERSION, CHANGELOG_CONTENT, ANTHROPIC_API_KEY, GITHUB_OUTPUT)
set -euo pipefail

VERSION="${VERSION:?VERSION required}"
RESPONSE=$(curl -fsS https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d "$(jq -n \
    --arg changelog "$CHANGELOG_CONTENT" \
    --arg version "$VERSION" \
    '{
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: ("Summarize this changelog for v" + $version + " of the @gusto/embedded-react-sdk npm package. Write 2-4 concise bullet points covering the meaningful changes (features and fixes). Skip dependency bumps and chores unless they affect partners. Use plain language aimed at engineers integrating the SDK. No heading, just bullets.\n\n" + $changelog)
      }]
    }'
  )")
SUMMARY=$(echo "$RESPONSE" | jq -r '.content[0].text // empty')
if [ -z "$SUMMARY" ]; then
  SUMMARY="See the full changelog for details."
fi
{
  delimiter="SUMMARY_$(openssl rand -hex 16)"
  echo "text<<$delimiter"
  echo "$SUMMARY"
  echo "$delimiter"
} >> "$GITHUB_OUTPUT"
