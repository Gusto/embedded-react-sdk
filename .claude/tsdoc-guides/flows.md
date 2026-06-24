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

## @example

Flows are always documented in `docs/workflows-overview/` — skip `@example` in TSDoc. Use a `@see` tag pointing to the relevant overview page.

## What requires product context

The business intent behind a flow's sequence (why these blocks, why this order) often isn't deducible from block names alone. Sources:

1. `docs/workflows-overview/` — typically has the narrative
2. Jira epic or feature ticket in the current conversation
3. Ask the human if the workflow page is missing or incomplete

Do not invent the purpose of a flow from its block structure.
