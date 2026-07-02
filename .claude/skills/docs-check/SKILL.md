---
name: docs-check
description: >-
  Verify the docs site is publish-ready: frontmatter lint + production build
  (catches broken links/anchors the dev server tolerates). Use before finishing
  docs work or opening a docs PR, or on "check/verify the docs".
---

# Check the docs before you're done

Run from the repo root, in order. Stop at the first failure and report its output.

```bash
test -d docs-site/node_modules || npm run docs:install
npm run derive        # 1. regenerate reference so checks run against what publishes
npm run docs:lint     # 2. every docs/**/*.md needs title + description frontmatter
npm run docs:build    # 3. the real gate — broken links/anchors throw
```

- **`derive`** rebuilds the generated reference. If TSDoc or reference config changed
  since the last regen, the build would otherwise pass against stale content. After it
  runs, review `git diff docs/reference/` — unexpected churn is itself a finding.
  (`docs-regen` has the fast iterate-only path; for a publish check, `derive` is right.)
- **`docs:build`** is configured to throw on any broken link or anchor
  (`onBrokenLinks` / `onBrokenAnchors` / `onBrokenMarkdownLinks` are all `'throw'`), so
  it catches what the dev server tolerates. The release build fails the same way.

## When a build check fails

- **Broken link/anchor** — the error names the source page and bad target. Fix the
  relative markdown link, or the navbar/footer `to:` path in `docs-site/docusaurus.config.ts`.
- **Missing frontmatter** — add `title` and `description` to the named file.
- **Failure under `docs/reference/**`** — don't hand-edit generated files; see
  `docs-regen` and `docs-change-ia`.

## Verifying a Flow component's reference page

When a task touches a Flow component's generated page, check these by reading the source
(`*StateMachine.ts`, `*Components.tsx`, TSDoc on the flow function) — the build won't
catch them, but they're the difference between a good and a misleading reference.

### 1. Does it have a GUIDE.md with a step-flow diagram?

Every Flow needs a `GUIDE.md` beside its source with a Mermaid `flowchart` in an
`<!-- slot: overview -->` or `<!-- slot: appendix -->` section. After regenerating,
the diagram must appear on the generated flow page.

### 2. Is it a hub/loop or a guided flow?

**Hub/loop** — a resting list that routes to sub-flows and back with no terminal state
(e.g. `PayrollFlow`, `EmployeeListFlow`):

- `flowchart LR` with `<-->` bidirectional spokes between the hub node and each sub-flow.
- Start marker (`start@{ shape: sm-circ }`), **no done marker** — it's a loop.
- Thicken `<-->` edges: `linkStyle <indices> stroke-width:2.5px` at the end of the diagram.
- Drop edge labels when every spoke is the same interaction shape (hub→edit→hub); keep
  them when spokes route to distinct destinations via distinct events.

**Guided flow** — linear or branching steps with a real exit (e.g. `OnboardingExecutionFlow`,
`TerminationFlow`):

- Start marker **and** done marker: `done@{ shape: fr-circ, label: " " }`.
- The exit event must be labeled on the edge to `done` — pull the exact event string
  from `src/shared/constants.ts` componentEvents, not from memory.
- If the exit event bubbles via `onEvent` (the machine ignores it, it never transitions),
  note that in a prose line in the GUIDE.md. Example: "The flow exits when
  `payroll/saveAndExit` fires — it bubbles to the partner's `onEvent` handler."
- The TSDoc `@example` for a guided flow should show an `onEvent` handler that handles
  the exit event and navigates away. If the example only shows `onDone`, it's incomplete.

### 3. Is `@components` correct?

`@components` must list what the **state machine actually renders** — trace the
`*Components.tsx` return statements, not umbrella names. Common mistakes:

- **Umbrella trap** — listing a name that is itself a standalone `<Flow>` the machine
  never directly mounts (e.g. listing `Documents` when the machine mounts `DocumentManager`).
- **Wrapper collapse** — when the flow composes another separately-documented flow as a
  step, that sub-flow is ONE `@components` entry (the sub-flow's node), not an expansion
  of its steps. The sub-flow's own `@components` owns its children.
- **Cross-namespace nodes** — label them with their real namespace:
  `{@link EmployeeOnboarding.OnboardingExecutionFlow}`, not just `OnboardingExecutionFlow`.

The diagram and `@components` must agree: if the diagram collapses a sub-flow to one
node, the `@components` list must also show just that node.

### 4. Are exit events in the TSDoc events table?

Any event that exits the flow — whether via a machine terminal transition or by bubbling
through `onEvent` — must appear in the TSDoc `@example` and events `@remarks` table.
Check `*Components.tsx` for `onEvent` calls and `*StateMachine.ts` for terminal states.

Script map and content model: [`docs-shared.md`](../../doc-guides/docs-shared.md).
