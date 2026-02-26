# Full Dev Reset

This command drops and resets the Zenpayroll database, runs setup across all three repos (Zenpayroll, gws-flows, embedded-react-sdk), and finishes by linking the SDK for local development.

All three repos are expected to be sibling directories:

```
../zenpayroll/
../gws-flows/
./  (embedded-react-sdk — this repo)
```

**Abort immediately on any non-zero exit code and report which step failed.**

Execute the following steps in order:

## Step 1 — Pull latest Zenpayroll and drop/reset its database

Run in `../zenpayroll`:

```bash
git checkout main && git pull origin main
```

Then drop, create, and migrate the databases:

```bash
bundle exec rails db:drop db:create db:migrate
```

The seed task requires the test database schema to exist. Prepare it before seeding:

```bash
bundle exec rails db:test:prepare
```

Then seed:

```bash
bundle exec rails db:seed
```

If any part of this fails, stop and report the error. Do not continue to the next step.

## Step 2 — Run bin/setup on Zenpayroll

`bin/setup` wraps `scope doctor run` behind a TTY-dependent `script` call that doesn't work in non-interactive shells. Run the underlying command directly with auto-accept in `../zenpayroll`:

```bash
scope doctor run --progress=plain --yolo
```

Then mark setup as complete (same as `bin/setup` does on success):

```bash
mkdir -p tmp/dev_setup && date > tmp/dev_setup/last_complete
```

This handles dependency installation, config generation, and any remaining app setup after the fresh DB reset. If this fails, stop and report the error.

## Step 3 — Create dev accounts and partner setup in Zenpayroll

The partner setup rake task writes API tokens via the Hapii gRPC service, which must be running on `localhost:8888`. Start the Zenpayroll server in the background first in `../zenpayroll`:

```bash
bin/server
```

Wait for the line `Successfully started service: hapii` to appear in the server output before continuing (typically ~30-60 seconds on first launch, as Docker images may need to download).

Then run these scripts sequentially in `../zenpayroll` to generate the partner accounts required by gws-flows:

```bash
bundle exec rails runner "DevAccountCreator.new.create_dev_accounts"
```

```bash
rake partners_api:dev_setup_for_gws_onboarding
```

After both succeed, stop the background Zenpayroll server (kill the `bin/server` process). If either command fails, stop and report the error.

## Step 4 — Pull latest gws-flows and run bin/setup

Run in `../gws-flows`:

```bash
git checkout main && git pull origin main
```

Then:

```bash
bin/setup
```

If this fails, stop and report the error.

## Step 5 — Run dev:setup in the SDK

Run in this repo's root directory (embedded-react-sdk):

```bash
npm run dev:setup
```

This links React and connects the SDK to gws-flows for local development. If this fails, stop and report the error.

## Completion

After all steps succeed, report a summary confirming each step completed successfully.
