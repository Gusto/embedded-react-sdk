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

Then:

```bash
bundle exec rails db:drop db:create db:migrate db:seed
```

If any part of this fails, stop and report the error. Do not continue to the next step.

## Step 2 — Run bin/setup on Zenpayroll

Run in `../zenpayroll`:

```bash
bin/setup
```

This handles dependency installation, config generation, and any remaining app setup after the fresh DB reset. If this fails, stop and report the error.

## Step 3 — Create dev accounts and partner setup in Zenpayroll

These scripts generate the partner accounts required by gws-flows. Run in `../zenpayroll`:

```bash
bundle exec rails runner "DevAccountCreator.new.create_dev_accounts"
```

Then:

```bash
rake partners_api:dev_setup_for_gws_onboarding
```

Run these sequentially. If either fails, stop and report the error.

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
