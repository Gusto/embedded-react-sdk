# Flow Documentation Guide

Read this when documenting flow components (`XxxFlow`, `XxxFlowComponents`, flow state machines).

## What flows are

Flows are thin orchestrators. They compose independently-consumable blocks and sequence them via state machines. They contain no business logic — the blocks do.

## What to document

| Symbol                            | Tag         | Notes                                                           |
| --------------------------------- | ----------- | --------------------------------------------------------------- |
| `XxxFlow`                         | `@public`   | What it orchestrates; events table aggregating all block events |
| `XxxFlowComponents`               | `@public`   | Props interface; one `/** description */` per component slot    |
| State machine (`xxxStateMachine`) | `@internal` | No prose needed                                                 |

## Events table

The flow's `@events` block must aggregate events from all child blocks — a partner consuming the flow sees one unified event surface. List every event the flow can emit, even if it originates in a child block.

## @components tag

Flows are the primary user of the `@components` block tag — it documents the blocks the flow composes and renders a "Sub-components" table on the generated reference page. One `{@link Name} - description` per line, listing each block (and any hook) the flow orchestrates:

```ts
@components
{@link EmployeeProfile} - Collects name, contact, and demographic details.
{@link CompensationForm} - Sets pay rate and schedule.
```

Place `@components` after `@events` and before `@param`/`@returns` (the `tsdoc-sort-tags` rule enforces this grouping). Link names must resolve to documented exports for the table to link them; unresolved names still render as plain text rows.

**Correctness rules — get these wrong and the table is misleading:**

- **List what the machine actually renders.** Trace the `*Components.tsx` return statements. Do not list an umbrella name that is itself a standalone `<Flow>` the machine never directly mounts.
- **Wrapper flows collapse.** If the flow composes another separately-documented flow as a step (e.g. `OnboardingExecutionFlow`), list just that sub-flow as one entry — not its internal steps. The sub-flow's own `@components` owns its children.
- **Cross-namespace nodes need the namespace.** `{@link EmployeeOnboarding.OnboardingExecutionFlow}`, not just `{@link OnboardingExecutionFlow}`.
- **The diagram and `@components` must agree.** If the GUIDE.md diagram collapses a sub-flow to one node, the `@components` list must match.

## @example

Every flow needs a `@example`. Examples live in TSDoc as the source of truth.

**Hub/loop flows** (resting list with no terminal state, e.g. `PayrollFlow`, `EmployeeListFlow`) — show minimal wiring; `onEvent` is optional but useful for showing navigation events:

````ts
@example
```tsx
<PayrollFlow
  companyId={companyId}
  onEvent={(event) => {
    if (event.eventName === 'payroll/exit') navigate('/dashboard')
  }}
/>
```
````

**Guided flows** (linear steps with a real exit, e.g. `OnboardingExecutionFlow`, `TerminationFlow`) — `onEvent` is **required** in the example and must handle the exit event by name. A guided flow example that only shows `onDone` is incomplete:

````ts
@example
```tsx
<OnboardingExecutionFlow
  employeeId={employeeId}
  onEvent={(event) => {
    // The flow exits when the partner navigates away or cancels
    if (event.eventName === 'employee/onboarding/done') navigate('/employees')
  }}
/>
```
````

Pull the exact exit event string from `src/shared/constants.ts` componentEvents — don't guess. If the exit event bubbles via `onEvent` without a machine transition (the machine ignores it), note that in a comment in the example.

## Diagrams (GUIDE.md)

Every flow's `GUIDE.md` includes one Mermaid `flowchart` step-topology diagram (two only if genuinely distinct top-level paths don't converge — merge near-duplicates that differ by a single branch into one diagram with the branch drawn in). Draw it from the real state machine (`*StateMachine.ts`/`*Machine.ts`) — trace actual transition targets, don't reconstruct from memory of what the flow "should" do.

### Layout: match the diagram direction to the flow shape

- **Hub/loop flows** (resting screen that spokes route out from and return to — lists, dashboards) → `flowchart LR`. TB has been tried for this shape and reads worse — don't reach for it.
- **Guided flows** (linear step sequence with a real exit) → `flowchart TD` (equivalently `TB`).

### Start/stop markers

- `start@{ shape: sm-circ } --> <first>`
- `<last> --> done@{ shape: fr-circ, label: " " }`
- Hub/loop flows get `start` but no `done` — every path returns to the hub, there's no terminal state.
- An event that bubbles out via `onEvent` with no machine transition still counts as a `done` if it ends the flow (e.g. a "Save & exit" CTA the machine ignores). Trace whether the machine handles the event (loop back) or ignores it (bubbling exit) — don't infer from the event name. Names lie: an event named `.../exit` can still transition back to a hub state rather than leaving the flow.

### Edges

- Solid `-->` = a named event transition. Dotted `-.->` = a condition/branch outcome (true/false), auto-colored via the `branch` class.
- A dotted condition edge can't carry an event label. When a branch outcome must then fire an event before reaching its target, insert an `f-circ` junction node between them: `cond{{...}} -.->|"yes"| j@{ shape: f-circ }` then `j -->|"some/event"| Target`.
- Multiple events transitioning from the same source to the same target go on **one** edge, joined with `<br/>` (`|"contractor/create<br/>contractor/update"|`) — never a comma, never parallel edges.
- Return/back-navigation edges (breadcrumb nav, summary→list) are **solid**, not dotted — dotted is reserved for conditions.
- A `CANCEL`-style transition from one specific state belongs on that state's existing return edge. A cancel/exit reachable from _every_ step does not — see "What not to draw."

### Nodes

- Node id = the component name as it appears in `@components`, not the raw machine state name. Hub node id = the resting component, not the machine's initial state.
- Cross-namespace node: label with the real namespace, e.g. `Employees["EmployeeOnboarding.OnboardingFlow"]`. Same-namespace nodes stay bare.
- `class X branch` — hexagon decision nodes.
- `class X flow` — a node representing a sub-flow that has its **own dedicated reference page** (renders as border-only accent, not filled). Apply this only to sub-flows with a real page to link to, not to every component that happens to internally render a `<Flow>`.

### Wrapper / collapsed flows

If this flow composes another separately-documented flow as one step, draw that sub-flow as a **single** node (`class X flow`) — don't re-expand its internal steps; its own diagram owns that detail. Keep the diagram and `@components` in sync: if the diagram collapses a sub-flow to one node, `@components` must collapse to match (see the `@components` correctness rules above).

### Edge labels: keep or drop

The deciding question is whether labels _discriminate_ between destinations, not diagram size:

- **Keep labels** when a handful of spokes each have a distinct event routing to a distinct destination (e.g. three spokes with `create`/`update`/`dismiss` entry events).
- **Drop labels** to unlabeled `Hub <--> Spoke` when every spoke is the same interaction shape, so labeling all of them is redundant noise (e.g. a dozen identical card↔edit-form spokes). Carry the event detail in prose and each block's own events table instead.

### What not to draw

- **A global "from any step" cancel/exit.** Floating edges from every node, or a subgraph wrapping "any step," render badly — subgraphs in particular show as heavy hatched boxes in the handDrawn theme. Keep it in prose instead.
  - Exception: a small, enumerable set of exit-capable states. Draw a dashed edge from each to one shared `done`, style all of them identically (`linkStyle <indices> stroke-dasharray:6 4`, standard color — not grey), and label **only one** of them with the real event name.
- **Anything needing a horizontal-scroll workaround.** A diagram that's too wide means the labels are too wide — fix the labels (below), don't fight it with CSS.

### Fixing "the diagram renders tiny"

Mermaid sizes the SVG to its content width, then scales down to fit the column — long edge labels are almost always the cause. In order of preference:

1. **Arrows-only** — drop edge labels entirely; move event detail to prose and each sub-component's events table.
2. **Wrap at a slash** with `<br/>` (`contractor/payments/<br/>view/details`) — keeps the full text, roughly halves rendered width.
3. **Lengthen a specific edge** (`-->` → `--->` → `---->`) to give a cramped label routing room, or to pull a shared sink (e.g. `done`) away from a cluster it's crowding against the diagram edge.
4. **Wrap a long node label** with `<br/>` inside the label string.

Don't reach for: prefix-stripping event names (breaks the verbatim-event convention), `useMaxWidth: false` plus scroll (reads as broken, not a fix), or switching to `stateDiagram-v2` or the ELK layout engine (same underlying width problem, or too much infra cost for the win).

### Styling

- Double round-trip edges (`<-->`) get a slightly thicker stroke: `linkStyle <indices> stroke-width:2.5px`.
- Color vars, the handDrawn theme, and the `branch`/`flow` classes are centralized in `docs-site/docusaurus.config.ts` — don't add per-diagram `classDef`s.

### Verify before finalizing

Re-derive the diagram from the actual state machine file, not from the previous diagram or from intuition. Specifically confirm:

- Every edge's transition target — does the event actually go where the label implies?
- Whether an event handled by every state is a loop-back or a bubbling exit (see start/stop markers above).
- That `@components` lists the same set of rendered pieces the diagram shows.

## What requires product context

The business intent behind a flow's sequence (why these blocks, why this order) often isn't deducible from block names alone. Sources:

1. The GUIDE.md colocated with the flow component — typically has the narrative
2. Jira epic or feature ticket in the current conversation
3. Ask the human if both are missing or incomplete

Do not invent the purpose of a flow from its block structure.

## Long-form prose: GUIDE.md

Keep `@remarks` to concise observable behavior. Extended narrative for a flow — walkthroughs, sequencing rationale, integration notes — belongs in a `GUIDE.md` colocated in the flow's source directory; the doc engine slots it into the generated reference page. `GUIDE.md` is authored prose (Prettier-exempt), distinct from generated content.
