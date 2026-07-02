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

## What requires product context

The business intent behind a flow's sequence (why these blocks, why this order) often isn't deducible from block names alone. Sources:

1. The GUIDE.md colocated with the flow component — typically has the narrative
2. Jira epic or feature ticket in the current conversation
3. Ask the human if both are missing or incomplete

Do not invent the purpose of a flow from its block structure.

## Long-form prose: GUIDE.md

Keep `@remarks` to concise observable behavior. Extended narrative for a flow — walkthroughs, sequencing rationale, integration notes — belongs in a `GUIDE.md` colocated in the flow's source directory; the doc engine slots it into the generated reference page. `GUIDE.md` is authored prose (Prettier-exempt), distinct from generated content.
