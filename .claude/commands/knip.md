# Knip

Remove dead code (unused exports and files) using knip, then fix any resulting lint/type errors.

## Argument handling

`$ARGUMENTS` is an optional target directory. If provided:

- Normalise it: strip leading `./` or trailing `/`.
- Any files knip touches **outside** that directory will be reverted before lint/format run.

If `$ARGUMENTS` is empty, knip runs unrestricted and all its changes are kept.

## Step 1 — Run the knip-fix script

```bash
.claude/scripts/knip-fix.sh $ARGUMENTS
```

The script:

1. Snapshots the pre-knip dirty-file set.
2. Runs `npx knip --config .reports/config/knip.json -W . --fix --allow-remove-files`.
3. If a target directory was given, reverts (via `git checkout HEAD --`) every file knip touched that falls outside it.
4. Runs `npm run lint` (with `--fix`) and `npm run format` on the whole repo.

## Step 2 — Fix remaining errors

After the script exits, run the build to surface any type errors introduced by the export removal:

```bash
npm run build 2>&1
```

If there are errors, read the affected files and fix them. Common cases:

- An import referencing an export knip removed → delete or update the import.
- A re-export barrel that now re-exports nothing → remove the barrel entry.
- A type that was removed but is still referenced → inline the type or restore the export if it's genuinely public.

Repeat `npm run build` until the build is clean. If you get stuck after one retry, stop and explain what's blocking to the user.

## Step 3 — Report

Summarise:

- How many files/exports knip removed.
- Which files (if any) you reverted because they were outside the target directory.
- Any manual fixes you made to resolve build errors.
