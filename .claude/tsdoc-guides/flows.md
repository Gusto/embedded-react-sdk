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

The flow's events table in `@remarks` must aggregate events from all child blocks — a partner consuming the flow sees one unified event surface. List every event the flow can emit, even if it originates in a child block.

## @components tag

Flows are the primary user of the `@components` block tag — it documents the blocks the flow composes and renders a "Sub-components" table on the generated reference page. One `{@link Name} - description` per line, listing each block (and any hook) the flow orchestrates:

```ts
@components
{@link EmployeeProfile} - Collects name, contact, and demographic details.
{@link CompensationForm} - Sets pay rate and schedule.
```

Place it after `@remarks` and before `@param`/`@returns` (the `tsdoc-sort-tags` rule enforces this grouping). Link names must resolve to documented exports for the table to link them; unresolved names still render as plain text rows.

## @example

Flows are always documented in `docs/workflows-overview/` — skip `@example` in TSDoc. Use a `@see` tag pointing to the relevant overview page.

## What requires product context

The business intent behind a flow's sequence (why these blocks, why this order) often isn't deducible from block names alone. Sources:

1. `docs/workflows-overview/` — typically has the narrative
2. Jira epic or feature ticket in the current conversation
3. Ask the human if the workflow page is missing or incomplete

Do not invent the purpose of a flow from its block structure.

## Long-form prose: GUIDE.md

Keep `@remarks` to concise observable behavior. Extended narrative for a flow — walkthroughs, sequencing rationale, integration notes — belongs in a `GUIDE.md` colocated in the flow's source directory; the doc engine slots it into the generated reference page. `GUIDE.md` is authored prose (Prettier-exempt), distinct from generated content. Don't migrate prose into `GUIDE.md` speculatively — the authoring conventions are still being established in the guide-content PRs; write the TSDoc, and leave narrative to the human unless directed otherwise.
