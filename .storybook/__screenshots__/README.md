# Storybook visual baselines

This directory holds PNG baselines used by the visual diff check in
`.storybook/test-runner.ts`. One file per story **file** (CSF title), named
after a slugified version of the title (for example `common-button.png` for a
file titled `Common/Button`). The runner snapshots the first story it sees
for each title and skips the rest — this is a smoke test, not exhaustive
per-story coverage.

## Threshold

Comparisons use a deliberately loose threshold:

- per-pixel color tolerance: `0.2` (default, can be overridden per-story)
- allowed pixel-ratio difference: `0.5` (50% of pixels, can be overridden per-story)

The check is meant to catch catastrophic regressions — a wrong design system,
broken theme, or missing CSS — not small visual changes. For tighter visual
testing prefer Chromatic or per-component snapshot tests.

## Per-story configuration

Stories can customize their visual test behavior via parameters:

```tsx
export const MyStory = {
  parameters: {
    visualTest: {
      // Skip visual diffing for this story
      skip: true,
      // Override per-pixel color tolerance (0-1)
      threshold: 0.1,
      // Override allowed pixel difference ratio (0-1)
      maxDiffPixelRatio: 0.2,
    },
  },
}
```

## Updating baselines

Baselines are sensitive to the host OS, browser version, and font rendering.
Generate and commit them from CI (Linux) — never from a local macOS or
Windows workstation, since those PNGs will not match the CI runtime.

### From CI (Recommended)

The `visual` CI job automatically commits new baselines on the first run when
none exist. If you need to regenerate all baselines:

1. Delete the existing baseline PNGs
2. Commit and push the deletion
3. CI will regenerate and auto-commit them back to the branch

### Locally (Debugging only)

```bash
npm run storybook &        # serve Storybook on :6006
npm run test:visual        # compare against existing baselines
npm run test:visual:update # regenerate all baselines (USE WITH CAUTION)
```

⚠️ **Warning**: Locally-generated baselines from macOS/Windows will not match
CI and will cause test failures. Only use this for local debugging, then
regenerate from CI before committing.

## Diff output

When a story exceeds the threshold the runner writes the actual screenshot
and the pixel diff to `__diff_output__/`. That directory is git-ignored.

Files generated on failure:

- `<baselineId>-actual.png` - The current screenshot that failed
- `<baselineId>-diff.png` - Visual diff highlighting changed pixels

In CI, these files are uploaded as an artifact for 7 days.
