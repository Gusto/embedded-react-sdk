# Hook Documentation Guide

Read this when documenting hook-related symbols — hooks, hook props, hook return types, and form field types.

## Hook export surface

Every partner-facing form hook has this export pattern — document all of them:

| Symbol                                        | Release tag | What to document                                           |
| --------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `useXxxForm`                                  | `@public`   | The hook: `@param`, `@returns` (both branches), `@example` |
| `UseXxxProps`                                 | `@public`   | Props interface — one `/** description */` per property    |
| `UseXxxFormOutputs` or equivalent return type | `@public`   | Partners type submit callbacks against this                |
| `UseXxxReady`                                 | `@public`   | Ready branch shape — document each member                  |

Always `@internal`, no prose needed (just `/** @internal */`):

- `createXxxSchema`, `XxxSchemaOptions`, `XxxMetadataConfig`
- Raw factory functions that have a `useXxx` wrapper (e.g. `createStateFields`)
- Internal mapping/resolution utilities (e.g. `getQuestionVariant`)

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
