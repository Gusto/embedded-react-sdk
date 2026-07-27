# Start the SDK Dev App and open it in the preview

This command starts `npm run sdk-app` as a managed terminal process and opens it in the
embedded browser preview, so the user doesn't have to re-explain the setup each time.

**Optional argument:** the user may pass a component route to land on directly, e.g.
`/sdk-app employeemanagement/EmployeeList`. If omitted, just land on the app root.

## Step 1 — Ensure `.claude/launch.json` has an `sdk-app` entry

Check for a `sdk-app` configuration in `.claude/launch.json`. If the file or entry doesn't
exist, create/add it:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "sdk-app",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "sdk-app"],
      "port": 5200,
      "autoPort": true
    }
  ]
}
```

`autoPort: true` is required — port 5200 is frequently already taken by another sdk-app
instance (this repo's worktrees, sibling checkouts, etc.), and the preview tool needs
permission to assign a different one for its own bookkeeping.

## Step 2 — Start (or reuse) the server

Call the browser preview tool's start action for the `sdk-app` configuration. If a
matching server is already running, it will be reused — no need to kill anything first.

On first run for a fresh `sdk-app/env/.env.*` file, the underlying script
auto-provisions a demo company against `flows.gusto-demo.com`. This can take
30–60 seconds (creating the demo, waiting for it to be ready, fetching entity IDs).
Poll the server logs until you see the Vite ready banner:

```text
VITE v...  ready in ... ms
➜  Local:   http://localhost:<PORT>/
```

Don't guess at timing with blind sleeps — use a background wait (`run_in_background`
with an `until`-style check, or repeated short log reads) until that line appears, or
until a reasonable timeout (~90s) is hit, in which case report the last log lines and stop.

When searching server logs for readiness, filter on `localhost` rather than `Local:` —
Vite's ANSI color codes inject escape sequences between "Local" and ":", so a literal
`"Local:"` substring match silently comes back empty even once the server is ready.

## Step 3 — Resolve the real port

**Important:** the port the preview tool assigns for its own proxy (shown in its
`preview_start` result) is not necessarily the port the Vite dev server actually bound
to. The `sdk-app` start script does its own port fallback search (5200 → 5201 → 5202 →
...) independent of the preview tool's port assignment, so the two can diverge. Always
parse the **actual** `Local: http://localhost:<PORT>/` line from the server logs and use
that port for navigation — never assume it matches the port the start-tool reported.

## Step 4 — Navigate the preview to the right page

Point the preview browser at `http://localhost:<real-port>/<route>` where `<route>` is
the optional argument the user passed (e.g. `employeemanagement/EmployeeList`), or just
the root if none was given. Confirm the page loaded (check for the "SDK Dev App" title
or take a screenshot) rather than assuming navigation succeeded.

## Step 5 — Report status

Tell the user:

- The real local URL (`http://localhost:<PORT>/...`) — the sdk-app script also opens
  this in their default OS browser automatically, so they have two ways to look at it.
- Whether this was a fresh start (with provisioning) or an existing session that was
  reused.
- That the process stays alive across turns — only mention stopping it if the user asks,
  since restarting means re-provisioning delay if the env file was removed.
