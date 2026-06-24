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

Component props are declared as interfaces extending `BaseComponentInterface<'Namespace.Component'>`, pinning the component's i18n resource namespace as the type argument:

```ts
export interface ContractorSubmitProps extends BaseComponentInterface<'Contractor.Submit'> {
  /** UUID of the contractor being submitted. */
  contractorId: string
}
```

Document only the props **declared on this interface**. The members inherited from `BaseComponentInterface` / `CommonComponentInterface` — `children`, `className`, `defaultValues`, `dictionary`, `onEvent`, `FallbackComponent`, `LoadingIndicator` — are already documented on the base; do not redeclare or re-document them.

The one common exception is **narrowing**: a component may re-declare `defaultValues` with its own form-data shape (e.g. `defaultValues?: Partial<ContractorProfileFormData>`). When a member is re-declared to narrow its type, give it a `/** description */` describing that component's shape.

`require-member-comment` enforces a one-line `/** description */` on every own member. Use `interface` over `type = { ... }` — TypeDoc renders interfaces with full property tables, and IDE hover tooltips only show per-property docs for interfaces.

## The component function

Document the component itself separately from its props interface. The dominant convention delegates the param to the interface rather than repeating each prop:

```ts
/**
 * Summary of what the component does.
 *
 * @remarks
 * <events table>
 *
 * @param props - See {@link ContractorSubmitProps}.
 * @returns The rendered <thing>.
 * @public
 */
```

The component takes no `@typeParam` — the `TResourceKey` generic is pinned in the props interface, not re-exposed on the component.
