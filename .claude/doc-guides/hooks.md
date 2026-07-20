# Hook Documentation Guide

Read this when documenting hook-related symbols — hooks, hook props, hook return types, and form field types.

## Hook export surface

Every partner-facing form hook has this export pattern — document all of them:

| Symbol              | Release tag | What to document                                                                                                        |
| ------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `useXxxForm`        | `@public`   | The hook: `@param`, `@returns` (both branches), `@example`                                                              |
| `UseXxxProps`       | `@public`   | Props interface — one `/** description */` per property                                                                 |
| `XxxFormData`       | `@public`   | The form-values shape — partners type `defaultValues` against it, and it's the return of `form.getFormSubmissionValues` |
| `UseXxxReady`       | `@public`   | Ready branch shape — document each member                                                                               |
| `XxxFormFields`     | `@public`   | The `form.Fields` interface — **this is the documentation home for each field's behavior** (see below)                  |
| `{Field}FieldProps` | `@public`   | One per field — partners type `getOptionLabel` / `validationMessages` against these                                     |

Always `@internal`, no prose needed (just `/** @internal */`):

- `XxxFormOutputs` — the resolver-output type. It's an internal seam between the form's input and parsed-output shapes (today they coincide; `XxxFormOutputs` is defined as `= XxxFormData`). Partners don't need the seam: they type `defaultValues` against `XxxFormData` and read parsed values from `form.getFormSubmissionValues`, which is typed as the form-data shape. Keep `XxxFormOutputs` defined (the hook uses it as `useForm`'s third generic) but don't export it from `src/index.ts`.
- `createXxxSchema`, `XxxSchemaOptions`, `XxxMetadataConfig`
- Raw factory functions that have a `useXxx` wrapper (e.g. `createStateFields`)
- Internal mapping/resolution utilities (e.g. `getQuestionVariant`)
- The domain `*Field` components themselves (`NameField`, `TypeField`, …). They are implementation detail reached only via `form.Fields`, not exported from `src/index.ts`, so they get just `/** @internal */` — no summary, no `@remarks`. The field's behavior is documented on the `XxxFormFields` member instead (see below).

  ```ts
  /** @internal */
  export function NameField(props: NameFieldProps) {
    return <TextInputHookField {...props} name="name" />
  }
  ```

## Field behavior goes on the `XxxFormFields` members

The `*Field` components are `@internal`, so anything documented only on them is invisible to partners. Put each field's observable behavior — validation pattern, available options and default, value masking, whether `getOptionLabel` translates labels — on the corresponding **public** `XxxFormFields` member, which is what partners see when they inspect `form.Fields`. Type members as `ComponentType<{Field}FieldProps>` (not `typeof {Field}Field`) so the public interface doesn't reference the internal function.

```ts
/**
 * Field components exposed by {@link useXxxForm} on `form.Fields`.
 *
 * @public
 */
export interface XxxFormFields {
  /** Bound to `routingNumber`. Validated against a 9-digit numeric pattern. */
  RoutingNumber: ComponentType<RoutingNumberFieldProps>
  /**
   * Bound to `accountType`. Options are `Checking` and `Savings`; defaults to
   * `Checking`. Supply `getOptionLabel` to translate the option labels.
   */
  AccountType: ComponentType<AccountTypeFieldProps>
}
```

`useContractorBankAccountForm` / `useContractorPaymentMethodForm` are the reference examples.

## Loading/ready discriminated union

Every data-fetching hook returns a discriminated union. Document both branches in `@returns`:

```ts
@returns A {@link HookLoadingResult} while loading, or a {@link UseXxxReady} once ready.
```

The ready branch typically exposes: `data`, `status`, `actions`, `errorHandling`, and (for form hooks) a `form` object with `Fields`, `fieldsMetadata`, and `getFormSubmissionValues`.

## Form hooks: fields.tsx and error codes

For hooks that expose `form.Fields`, read the sibling `fields.tsx` file — it defines:

- Each field name and its input type
- Error codes per field (typed constants like `ErrorCodes.REQUIRED`)
- Which fields are conditionally available (undefined when not applicable)

This is not inferrable from the hook alone. Read `fields.tsx` before writing `@remarks`.

## Usage patterns

Two integration patterns exist — use the one that matches existing usage in `src/components/` or the flow's GUIDE.md for this hook:

**`SDKFormProvider` pattern** — partner wraps a group of fields from one hook:

```tsx
<SDKFormProvider formHookResult={useXxxFormResult}>
  <XxxFields.FieldName label="..." validationMessages={{ REQUIRED: '...' }} />
</SDKFormProvider>
```

**`formHookResult` prop pattern** — partner passes the hook result per-field:

```tsx
<XxxFields.FieldName formHookResult={useXxxFormResult} label="..." />
```

When the hook's fields are scattered across a layout (interleaved with other hooks), use `formHookResult` prop on all of that hook's fields.

## What requires product context

These cannot be inferred from code alone and need human context before writing `@remarks`:

- Business rules behind field validation (why a rule exists, not just that it does)
- Error code meanings to the end user
- What the hook enables (the feature, not just the API shape)
- When fields are conditionally visible and why

**Sources in priority order:**

1. Jira ticket or PR description in the current conversation
2. GUIDE.md colocated with the flow that uses this hook
3. MCP: Jira, Confluence, or Notion if linked
4. Ask the human — do not invent business rules

If none are available, write the structural parts (`@param`, `@returns`, release tag, field list) and add a comment:

```ts
// TODO: add @remarks with product context — see [ticket/page]
```

## Long-form prose: GUIDE.md

Like flows, each hook directory can carry a `GUIDE.md` whose authored prose the doc engine slots into the hook's generated reference page. Keep `@remarks` to concise observable behavior; longer walkthroughs go in `GUIDE.md`. Don't create or backfill `GUIDE.md` speculatively without direction.
