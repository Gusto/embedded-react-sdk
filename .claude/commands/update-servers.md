# Update Local API Backend

This command pulls the latest code and runs setup for ZenPayroll and gws-flows to keep the local API backend up to date.

Both repos are expected as sibling directories:

```
~/workspace/zenpayroll
~/workspace/gws-flows  (or ../gws-flows relative to this repo)
```

**Abort immediately on any non-zero exit code and report which step failed.**

## Step 1 — Pre-flight check for uncommitted changes

Before pulling, verify neither repo has uncommitted changes that would cause `git pull` to fail.

**Check ZenPayroll:**

```bash
cd ~/workspace/zenpayroll && git status --porcelain
```

**Check gws-flows:**

```bash
cd ~/workspace/gws-flows && git status --porcelain
```

If either command produces output (meaning there are uncommitted changes), **abort immediately** and report which repo(s) have unsaved changes. Do not proceed with the update.

## Step 2 — Update ZenPayroll

Run in `~/workspace/zenpayroll`:

```bash
git checkout main && git pull origin main
```

Then run the non-interactive equivalent of `bin/setup`:

```bash
scope doctor run --progress=plain --yolo
```

Mark setup as complete (same as `bin/setup` does on success):

```bash
mkdir -p tmp/dev_setup && date > tmp/dev_setup/last_complete
```

If any part of this fails, stop and report the error. Do not continue to gws-flows.

## Step 3 — Update gws-flows

Run in `~/workspace/gws-flows` (or `../gws-flows`):

```bash
git checkout main && git pull origin main
```

Then run setup. This may prompt for interactive input, so pipe `yes` to auto-accept:

```bash
yes | bin/setup
```

If `yes | bin/setup` fails, try running `bin/setup` directly and note that it may require interactive input from the user.

## Step 4 — Report results

Report success or failure for each repo:

```
ZenPayroll: ✅ Updated and setup complete / ❌ Failed at [step]
gws-flows:  ✅ Updated and setup complete / ❌ Failed at [step]
```

If both succeeded, suggest running the `/start-servers` command to bring the servers up.
