# Start Local API Backend

This command starts the ZenPayroll and gws-flows servers needed for local SDK development, validating they come up healthy.

Both repos are expected as sibling directories:

```
~/workspace/zenpayroll
~/workspace/gws-flows  (or ../gws-flows relative to this repo)
```

**Abort immediately on any non-zero exit code and report which step failed.**

## Step 1 — Check if servers are already running

Run health checks for both servers before attempting to start them:

**ZenPayroll (port 8888):**

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:8888
```

**gws-flows (port 7777):**

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:7777/demos
```

If both return a response, report that servers are already running and exit. Otherwise, proceed to start whichever server(s) are not responding.

## Step 2 — Start ZenPayroll (if not running)

Run in `~/workspace/zenpayroll`:

```bash
bin/server
```

This starts the full ZenPayroll stack including the Hapii gRPC service on port 8888. Wait for the line `Successfully started service: hapii` to appear in the output before continuing. This typically takes 30-60 seconds on first launch.

## Step 3 — Start gws-flows (if not running)

Run in `~/workspace/gws-flows` (or `../gws-flows`):

```bash
bin/rails s -p 7777
```

Wait for the Rails server to report it is listening on port 7777.

## Step 4 — Validate both servers are healthy

Retry health checks for both servers, up to 5 attempts with 5 seconds between each:

**ZenPayroll:**

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:8888
```

**gws-flows:**

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:7777/demos
```

A successful response (any HTTP status) means the server is running. If either server fails all 5 attempts, report the failure.

## Step 5 — Report status

Report the status of both servers:

```
ZenPayroll (port 8888): ✅ Running / ❌ Not responding
gws-flows (port 7777):  ✅ Running / ❌ Not responding
```

If either server failed to start, suggest running the `update-servers` command to pull latest code and re-run setup, then retrying this command.

If both are healthy, confirm: "Local API backend is ready. Demo available at http://localhost:7777/demos?react_sdk=true"
