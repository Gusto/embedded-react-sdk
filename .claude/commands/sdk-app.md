# Start the SDK Dev App and open it in the preview

This command starts `npm run sdk-app` as a managed terminal process and opens it in the
embedded browser preview, so the user doesn't have to re-explain the setup each time.

**Optional argument:** the user may pass a component route to land on directly, e.g.
`/sdk-app employeemanagement/EmployeeList`. If omitted, just land on the app root.

## Step 1 — Ensure dependencies are installed for _this_ worktree

Check for `node_modules/.package-lock.json` in the repo root (the current working
directory, not a parent). npm writes this file as the marker of a completed install.

**Why this exact check matters:** a worktree living under `.claude/worktrees/<slug>` is
physically nested inside the main checkout. Node's module resolution walks up parent
directories looking for `node_modules`, so tools will happily run using the _parent_
repo's fully-installed `node_modules` even when this worktree's own is empty (or only
contains stray `.cache`/`.vite`/`.vite-temp` dirs from a partial run) — with no error,
no warning, just silent dependency sharing across worktrees. That's exactly what we
don't want: a worktree whose branch bumped or added a dependency would silently keep
resolving the parent's stale version instead of its own, and two worktrees running
concurrently could subtly interfere by racing writes into the same shared
`node_modules`.

If `node_modules/.package-lock.json` is missing in this worktree, run `npm install`
here (in the worktree root) before proceeding. This is a normal, fully self-contained
install — this repo has no `workspaces` field and no `.npmrc` linking behavior, so it
cannot merge with or mutate any parent/sibling worktree's `node_modules`. Once
populated, Node's resolution naturally prefers this worktree's own `node_modules` over
any parent's, since it's the closest match — no further configuration needed.

Skip this step if the marker file is already present.

## Step 2 — Ensure `.claude/launch.json` has an `sdk-app` entry

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

## Step 3 — Start (or reuse) the server

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

## Step 4 — Resolve the real port

**Important:** the port the preview tool assigns for its own proxy (shown in its
`preview_start` result) is not necessarily the port the Vite dev server actually bound
to. The `sdk-app` start script does its own port fallback search (5200 → 5201 → 5202 →
...) independent of the preview tool's port assignment, so the two can diverge. Always
parse the **actual** `Local: http://localhost:<PORT>/` line from the server logs and use
that port for navigation — never assume it matches the port the start-tool reported.

## Step 5 — Navigate the preview to the right page

Point the preview browser at `http://localhost:<real-port>/<route>` where `<route>` is
the optional argument the user passed (e.g. `employeemanagement/EmployeeList`), or just
the root if none was given. Confirm the page loaded (check for the "SDK Dev App" title
or take a screenshot) rather than assuming navigation succeeded.

## Step 6 — Report status

Tell the user:

- The real local URL (`http://localhost:<PORT>/...`) — the sdk-app script also opens
  this in their default OS browser automatically, so they have two ways to look at it.
- Whether this was a fresh start (with provisioning) or an existing session that was
  reused.
- That the process stays alive across turns — only mention stopping it if the user asks,
  since restarting means re-provisioning delay if the env file was removed.
- If Step 1 ran `npm install`, mention that too — it's a one-time cost per worktree, not
  something that will repeat on the next `/sdk-app` invocation here.
