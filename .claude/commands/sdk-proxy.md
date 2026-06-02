# Hit the Gusto API via the SDK Dev App proxy

This command lets you test API behavior end-to-end against the demo company you already have running in the SDK Dev App. It teaches the agent the SDK app's auth-and-proxy setup, points it at the `gusto-payroll` MCP for endpoint discovery, and has it run real `curl` requests through the same Vite proxy the browser uses.

The user's free-form arguments after `/sdk-proxy` describe the request in plain language. Examples:

- `/sdk-proxy create an employee named Alice Johnson`
- `/sdk-proxy list payrolls for the current company`
- `/sdk-proxy add a home address to the current employee`
- `/sdk-proxy show me what a "submit payroll" request body looks like` (discovery only — no execution)

## How the proxy works

The SDK Dev App runs a Vite dev-server proxy that rewrites `/api/*` to `${GWS_FLOWS_HOST}/fe_sdk/${FLOW_TOKEN}/*` using whatever `FLOW_TOKEN` the app currently holds in memory. gws-flows then handles OAuth and forwards to ZenPayroll.

From [sdk-app/vite.config.ts](sdk-app/vite.config.ts):

```ts
rewrite: (path: string) => path.replace(/^\/api/, `/fe_sdk/${env.FLOW_TOKEN}`),
```

**Always curl through the SDK app's local proxy, not directly to the gws-flows host.** The proxy's in-memory token is the source of truth — it stays in sync when the user clicks "Refresh Token" / "Set Manual Token" / "Create New Demo" in the SDK app Settings panel. The on-disk env file does not always match (e.g., "Set Manual Token" only updates memory).

## Step 0 — Try the cache first (fast path)

Port and company UUID are stable for the lifetime of a demo session, so we cache them in `${TMPDIR}` per repo. On a cache hit, you skip the `lsof` walk in Step 1 and the companies-list curl in Step 2 — roughly a 1-second savings per invocation, which adds up across a chain of calls.

Cache lookup snippet (run first, before Step 1):

```bash
SDK_APP_REPO="$(git rev-parse --show-toplevel)"
CACHE_DIR="${TMPDIR:-/tmp}"
SDK_PROXY_CACHE="${CACHE_DIR%/}/sdk-proxy-cache-$(echo "$SDK_APP_REPO" | shasum -a 1 | cut -c1-8).env"

# Clear inherited shell state so a missing key in the cache file (or a stale
# value left over from an earlier invocation in the same shell) can't leak into
# Step 1 if we end up taking the rediscovery path.
unset SDK_APP_PORT COMPANY_ID CACHED_AT
CACHE_HIT=""

if [ -f "$SDK_PROXY_CACHE" ]; then
  # shellcheck disable=SC1090
  source "$SDK_PROXY_CACHE"
  AGE_SECS=$(( $(date +%s) - ${CACHED_AT:-0} ))
  if [ "$AGE_SECS" -lt 120 ] && [ -n "$SDK_APP_PORT" ] && [ -n "$COMPANY_ID" ]; then
    # Verify the cached port + company are still live before trusting them
    VERIFY_STATUS=$(curl -sS -m 2 -o /dev/null -w '%{http_code}' \
      "http://localhost:$SDK_APP_PORT/api/v1/companies/$COMPANY_ID/locations" 2>/dev/null || echo 000)
    if [ "$VERIFY_STATUS" = "200" ]; then
      CACHE_HIT=1
      echo "Cache hit (age ${AGE_SECS}s): SDK_APP_PORT=$SDK_APP_PORT COMPANY_ID=$COMPANY_ID"
    else
      echo "Cache stale (verify returned $VERIFY_STATUS); rediscovering"
      rm -f "$SDK_PROXY_CACHE"
      unset SDK_APP_PORT COMPANY_ID CACHED_AT
    fi
  else
    echo "Cache expired (age ${AGE_SECS}s); rediscovering"
    rm -f "$SDK_PROXY_CACHE"
    unset SDK_APP_PORT COMPANY_ID CACHED_AT
  fi
fi
```

> **Author note for future edits:** the `unset … ; source … ; <rm + unset on every failure path>` ordering is load-bearing. If you drop the post-failure `unset`, a stale `COMPANY_ID` lingers in the shell environment and Step 1's discovery will silently reuse it on the next iteration. If you drop the pre-`source` `unset`, a cache file missing a key (e.g., from a partially-written file or an older schema) will inherit whatever value the surrounding shell already had. Both leaks are silent — symptom is "the agent confidently used the wrong company / port" — so keep all three `unset`s.

Behavior:

- **`CACHE_HIT=1`** → skip Step 1 and Step 2; jump straight to Step 3 with `$SDK_APP_PORT` and `$COMPANY_ID` already populated. Mention the cache age in your summary to the user so they know it wasn't freshly verified beyond the locations probe.
- **`CACHE_HIT=""` and the cache file existed** → it was stale or invalid; the snippet deleted it. Proceed to Step 1.
- **`CACHE_HIT=""` and no cache file** → first invocation in this repo. Proceed to Step 1.

**TTL is 120 seconds.** Tokens last much longer, but the user might "Create New Demo" mid-session, which would silently invalidate the cached `COMPANY_ID`. 120s is short enough that drift is caught quickly during slow iteration, long enough that back-to-back calls in a single thought reuse the cache. The verify-curl catches mid-session demo swaps even within the TTL.

If the user explicitly says "use a fresh discovery" or "ignore the cache," skip this step and `rm -f "$SDK_PROXY_CACHE"` before running Steps 1–2.

## Step 1 — Discover the SDK app's port

The SDK app **defaults to 5200 but auto-increments** (5201, 5202, …) when that port is taken. The user often runs more than one SDK app at a time across sibling repos (`~/workspace/embedded-react-sdk`, `~/workspace/embedded-react-sdk-2`, `~/workspace/embedded-react-sdk-3`, …), so we need to resolve the port that belongs to **this** workspace's SDK app, not just any.

Run this discovery snippet from the repo root:

```bash
SDK_APP_REPO="$(git rev-parse --show-toplevel)"
SDK_APP_PORT=""

for pid in $(lsof -nP -iTCP:5200-5299 -sTCP:LISTEN -t 2>/dev/null); do
  cwd=$(lsof -p "$pid" -a -d cwd -Fn 2>/dev/null | grep '^n' | sed 's/^n//' | head -1)
  if [ "$cwd" = "$SDK_APP_REPO" ]; then
    SDK_APP_PORT=$(lsof -nP -iTCP:5200-5299 -sTCP:LISTEN -a -p "$pid" -Fn 2>/dev/null \
                   | grep '^n' | sed 's/.*://' | head -1)
    break
  fi
done

echo "SDK_APP_PORT=$SDK_APP_PORT"
```

This uses `lsof -iTCP:5200-5299` to list every PID owning a listening socket in the SDK app's port range, looks up each process's working directory via `lsof -p <pid> -a -d cwd -Fn`, and picks the port owned by the process whose cwd matches the current git repo root.

> **Author note for future edits:** the snippet deliberately uses **only named bash variables** (`$pid`, `$cwd`, `$port`, `$SDK_APP_PORT`, `$SDK_APP_REPO`). Do **not** introduce dollar-digit tokens (a literal dollar sign immediately followed by a single digit 0–9) anywhere in this file — Cursor's slash-command renderer interpolates them as positional arguments from the user's invocation, so an `awk` field reference like dollar-followed-by-2 silently becomes the second word of the user's message by the time the agent sees the prompt. This rules out `awk` positional fields in any snippet here; use `lsof -F` field records + `grep`/`sed` (as above) instead.

Robust against:

- Auto-incremented ports (5201, 5202, …)
- Multiple SDK apps running for different repos at once
- Other Vite apps that happen to land in the same port range

If `SDK_APP_PORT` is empty after the loop, fall back to a signature-endpoint scan to confirm whether any SDK app is reachable at all (for diagnostics — never silently target a different repo's app):

```bash
for p in 5200 5201 5202 5203 5204 5205; do
  if curl -sS -m 1 -o /dev/null -w '%{http_code}' "http://localhost:$p/sdk-app/api/validate-token" 2>/dev/null | grep -q 200; then
    echo "Found an SDK app on port $p (verify it belongs to the intended repo before using)"
  fi
done
```

`/sdk-app/api/validate-token` is the SDK app's own middleware route — no other Vite app responds `200` to it.

Use the resolved `SDK_APP_PORT` for every subsequent call. **Do not hardcode `5200`.**

## Step 2 — Confirm the token is live and discover the company

Probe the proxy with the companies-list endpoint. It's cheap, returns the live company, and confirms the token is valid in one shot. Use the temp-file pattern (see Step 4 for the full rationale) so the body and status code don't collide in `jq`:

```bash
SDK_PROXY_OUT=$(mktemp -t sdk-proxy.XXXXXX)
curl -sS -o "$SDK_PROXY_OUT" -w "HTTP %{http_code}\n" "http://localhost:$SDK_APP_PORT/api/v1/companies"
# On HTTP 200: extract company id
COMPANY_ID=$(jq -r '.[0].uuid' < "$SDK_PROXY_OUT")
echo "COMPANY_ID=$COMPANY_ID"
```

Possible outcomes:

| Outcome                                                                             | What it means                                                    | What to do                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTP 200` + JSON array in temp file                                                | SDK app running for this repo, token valid, company discoverable | Take `[0].uuid` as the current `company_id`; proceed to Step 3                                                                                                                                                                      |
| Step 1 found no port and the fallback scan found nothing either                     | SDK app not running for any repo                                 | Tell the user to run `npm run sdk-app` in another terminal, then re-invoke `/sdk-proxy ...`                                                                                                                                         |
| Step 1 found no port for this repo but the fallback scan found other SDK apps       | SDK app(s) running, but none for this workspace                  | Tell the user which port(s) you found and (when possible, via `lsof -p <pid> -a -d cwd`) which repo each belongs to. Don't auto-pick — ask.                                                                                         |
| `HTTP 404` with an HTML body (`<!DOCTYPE html>` "Page Not Found") **or** `HTTP 401` | Flow token expired or invalid in the running app                 | Tell the user to open the SDK app Settings panel and click "Refresh Token" or "Create New Demo." Don't run `npm run sdk-app:setup` unless they explicitly ask — that re-provisions a fresh demo and replaces their working session. |

**Why a stale flow token surfaces as 404 (not 401):** gws-flows maps an invalid `fe_sdk/<token>` path to its generic Rails 404 page, since the route only matches when the token resolves to a live OAuth grant. Treat 404-with-HTML-body identically to 401.

**Do not read [sdk-app/env/.env.demo](sdk-app/env/.env.demo) to grab IDs or the token.** That file can lag behind the running app's in-memory state. Always discover IDs from the proxy.

### Discovering downstream entity ids

For `employee_id`, `contractor_id`, `payroll_id`, etc., follow the same pattern: hit the proxy's list endpoint and pick the first result (or filter by the user's hint, e.g., "the John Lewis employee"). Note: dropping `-w` here is fine — you only need the body for `jq`, and a non-zero `curl` exit will surface failure:

```bash
curl -sS "http://localhost:$SDK_APP_PORT/api/v1/companies/<company_id>/employees" | jq '.[0].uuid'
curl -sS "http://localhost:$SDK_APP_PORT/api/v1/companies/<company_id>/payrolls" | jq '.[0].uuid'
```

### Write the cache

After Step 1 + Step 2 succeed (and only when `CACHE_HIT` was empty), persist the discovered values so the next invocation hits the fast path:

```bash
cat > "$SDK_PROXY_CACHE" <<EOF
# Auto-generated by /sdk-proxy on $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Repo: $SDK_APP_REPO
SDK_APP_PORT=$SDK_APP_PORT
COMPANY_ID=$COMPANY_ID
CACHED_AT=$(date +%s)
EOF
```

**Only cache `SDK_APP_PORT` and `COMPANY_ID`.** Don't cache entity ids (`EMPLOYEE_ID`, `PAYROLL_ID`, etc.). Mutating operations (create / delete / submit) routinely change which entity is "first," and a cached stale id leads to operating on the wrong entity. Entity ids cost one cheap curl to rediscover — not worth the foot-gun.

If the user's call mutates state and you observe a 401 / 404 / company-mismatch response, blow away the cache before retrying: `rm -f "$SDK_PROXY_CACHE"`.

## Step 3 — Discover the endpoint via the `gusto-payroll` MCP

Never guess paths from memory. The MCP exposes:

| Tool                  | Use for                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `find_endpoint`       | Fuzzy search by intent (`"create employee"` → `POST /v1/companies/{company_id}/employees`)   |
| `generate_curl`       | Produce a templated curl with the right headers and body shape                               |
| `check_scopes`        | Confirm the demo flow token covers the operation                                             |
| `validate_workflow`   | For multi-step flows (onboarding, payroll), confirm the call order before running them       |
| `generate_typescript` | Mirror the call in SDK code afterwards (only when the goal is to wire it into the React app) |

Typical flow: `find_endpoint` → `generate_curl` → adapt to the proxy URL → run.

For onboarding or payroll sequences, run `validate_workflow` first so you don't fire half a sequence and leave entities in a broken state.

## Step 4 — Build and run the curl

Canonical template (note `localhost:$SDK_APP_PORT/api`, never the gws-flows host). Use a temp file so the response body and the status code don't fight over the same stdout stream:

```bash
SDK_PROXY_OUT=$(mktemp -t sdk-proxy.XXXXXX)
curl -sS \
  -o "$SDK_PROXY_OUT" \
  -w "HTTP %{http_code}\n" \
  -X <METHOD> \
  "http://localhost:$SDK_APP_PORT/api/v1/companies/<company_id>/<path>" \
  -H "Content-Type: application/json" \
  -H "X-Gusto-API-Version: 2024-04-01" \
  -d '<body>'
jq . < "$SDK_PROXY_OUT"
```

This prints the status code from `curl -w` (cleanly, with no extra trailing newline), then `jq` parses just the body file. No interleaving, no parse errors.

**Why not the simpler `curl -w '...HTTP_STATUS...' | jq`?** `curl -w` appends its output to stdout after the body, so the status footer ends up in `jq`'s parse stream. `jq` emits the body successfully but then errors on the trailing footer text. The data appears, but every call is noisy. The temp-file pattern is the only clean fix.

Rules when adapting the MCP's generated curl:

- **Replace the host.** The MCP emits `https://api.gusto-demo.com/...` — swap that whole prefix for `http://localhost:$SDK_APP_PORT/api` and the proxy handles the rest.
- **Strip any `Authorization: Bearer ...` header.** The proxy injects OAuth from the flow token; an extra `Authorization` header confuses it.
- Keep the API version header if the MCP includes one (e.g. `X-Gusto-API-Version`); the SDK and the proxy both honor it.

### Skip the temp file for binary success/failure checks

When you only care about the status code (e.g., a quick liveness probe, or a follow-up `GET` you're not going to display), drop the body to `/dev/null` and read `-w`:

```bash
curl -sS -o /dev/null -w "HTTP %{http_code}\n" "http://localhost:$SDK_APP_PORT/api/v1/companies"
```

This is also the right shape for the Step 2 token probe.

If the request mutates state, report the response payload back to the user including the new entity's `uuid` and `version` (most Gusto resources are version-locked).

## Step 5 — Interpret and report

Summarize what happened in 2–4 lines:

- Verb + path that ran (so it's reproducible)
- Status code
- Key fields from the response (created uuid, validation errors, etc.)

If the response was a validation error (`422`), surface the `errors[].error_key` and `errors[].message` instead of dumping the raw JSON — those are the actionable bits.

## Worked example

```
User: /sdk-proxy create an employee named Alice Johnson
Agent:
  1. Runs the discovery snippet → SDK_APP_PORT=5201 (5200 was taken by a sibling repo)
  2. Curls http://localhost:5201/api/v1/companies → 200, picks [0].uuid as company_id
  3. Calls gusto-payroll find_endpoint("create employee") → POST /v1/companies/{company_id}/employees
  4. Calls generate_curl, swaps the host for http://localhost:5201/api, strips Authorization
  5. POSTs { first_name: "Alice", last_name: "Johnson", ... } via the proxy
  6. Parses 201 response, reports new employee UUID + version
  7. Optionally suggests follow-up calls (add home address, create job, etc.)
```

## Escape hatches

- **Large or chained output** — if the response will be huge (list endpoints with no filter, full payroll dumps) or you're chaining 5+ calls, run the work in a subagent via the Task tool so the raw curl output doesn't pollute conversation context. Return only the summary.
- **Discovery-only requests** — if the user is asking what a request _looks like_ (not asking you to send it), stop after `find_endpoint` + `generate_curl` and show the template. Don't fire.
- **Destructive operations** — for `DELETE` requests or operations that finalize payroll, repeat the resolved URL back to the user and ask for confirmation before running.
- **SDK app not running** — never auto-start it; that would block this command for ~30s and steal a terminal. Tell the user to start it themselves.
- **Token refresh** — never run `npm run sdk-app:setup` automatically. It re-provisions a brand-new demo, throwing away the company the user is working with. Always ask first.
- **Multiple SDK apps running for different repos** — never auto-pick a port for a different repo. Surface the candidates with their cwds and ask which to target.
- **Force cache bust** — if the user says "fresh discovery," "ignore the cache," "the demo changed," or you've just observed a 401 / 404 / company-mismatch response, `rm -f "$SDK_PROXY_CACHE"` (path computed in Step 0) before re-running Steps 1–2.
