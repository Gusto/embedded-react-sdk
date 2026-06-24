# Component Documentation Guide

Read this when documenting React component symbols — block components, UI components, and their props interfaces.

## Events table

Every exported React component's `@remarks` must include an events table listing every `onEvent` the component can emit:

```text
| Event | Description | Data |
| ----- | ----------- | ---- |
| `event/name` | What triggers it | {@link DataType} or — |
```

**Finding events:** The `tsdoc-stub` tool emits an `EVENTS:` section when it detects `onEvent` calls — use those entries directly. Without the stub, grep for `onEvent(` in the component file and its direct children. For the Data column, use plain text or `—` when the event carries no data.

## @example

- **Skip** for components documented in `docs/workflows-overview/` — that page is the canonical integration example. Add a `@see` tag pointing to it instead.
- **Include** for standalone blocks and utilities without a workflow page.

## Release tags

- Block components exported from domain barrels → `@public`
- Flow components exported from domain barrels → `@public`
- Presentation-only subcomponents not in any barrel → `@internal`

## Props interfaces

For `@public` components, every property on the props interface needs at minimum a one-line `/** description */` inline comment — ESLint's `require-member-comment` rule will catch any missing ones.

Use `interface` over `type = { ... }` for props types — TypeDoc renders interfaces with full property tables, and IDE hover tooltips only show per-property docs when the type is declared as an `interface`.
