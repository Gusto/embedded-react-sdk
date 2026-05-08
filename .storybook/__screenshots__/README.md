# Storybook visual baselines

This directory holds PNG baselines used by the visual diff check in
`.storybook/test-runner.ts`. One file per story, named after the story id
(for example `common-button--primary.png`).

## Threshold

Comparisons use a deliberately loose threshold:

- per-pixel color tolerance: `0.2`
- allowed pixel-ratio difference: `0.5` (50% of pixels)

The check is meant to catch catastrophic regressions — a wrong design system,
broken theme, or missing CSS — not small visual changes. For tighter visual
testing prefer Chromatic or per-component snapshot tests.

## Updating baselines

Baselines are sensitive to the host OS, browser version, and font rendering.
Generate and commit them from CI (Linux) — never from a local macOS or
Windows workstation, since those PNGs will not match the CI runtime.

To regenerate locally for debugging:

```bash
npm run storybook &        # serve Storybook on :6006
UPDATE_SCREENSHOTS=1 npm run test:visual
```

To regenerate from CI, run the workflow with `UPDATE_SCREENSHOTS=1` and
commit the produced PNGs.

## Diff output

When a story exceeds the threshold the runner writes the actual screenshot
and the pixel diff to `__diff_output__/`. That directory is git-ignored.
