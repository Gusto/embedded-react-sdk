# Hook model review checklist

Use this when a change touches a form hook, a data hook, or a component that uses one. The rules below are a summary for reviewing. The full rules live in these in-repo docs. When you need detail to confirm a finding, read the relevant doc and point the author to it:

| Doc                                                      | What it covers                                                                                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `.claude/hooks-implementation.md`                        | Schema, fields, hook internals, return shape, error handling, exports                               |
| `.claude/skills/migrate-sdk-component-to-hooks/SKILL.md` | How components use hooks: `BaseBoundaries`, `BaseLayout`, `SDKFormProvider`, `composeSubmitHandler` |
| `.claude/commands/create-hook.md`                        | Scaffolding a new `use*Form` hook                                                                   |
| `.claude/doc-guides/hooks.md`                            | TSDoc for hook exports                                                                              |
| `src/partner-hook-utils/types.ts`                        | `HookLoadingResult`, `BaseHookReady`, and other shared hook types                                   |

## Reference implementations

When a change looks different from the usual pattern, compare it with the closest of these before you flag it:

- `src/components/Company/PaySchedule/PayScheduleForm.tsx`: a screen with one form hook (`usePayScheduleForm`).
- `src/components/Employee/Profile/onboarding/EmployeeProfile.tsx`: a screen with two form hooks, ordered submits, and recovery when only part of a submit succeeds.
- `src/components/Employee/Compensation/onboarding/EditCompensation/EditCompensation.tsx`: a screen where one submit's result feeds the next.
- Hooks under `src/components/Employee/Profile/shared/`, `src/components/Employee/Compensation/shared/`, and `src/components/Company/PaySchedule/shared/`.

Don't use `AdminProfile.tsx` as a model. Its raw `useForm` for `startDate` is a documented exception.

## The core idea

**The hook owns the business logic. The component only renders what the hook returns.**

Partners use the same hooks to build their own UI, so they get only what the hook returns. If a component works out something that every partner would also need, that logic belongs in the hook. A good test: would a partner's version of this screen have to copy this code? If yes, it belongs in the hook.

## Components that use hooks

Flag these in components:

- **Business logic that belongs in the hook.** Examples: deciding which fields show, which are required, or what gets submitted; repeating the hook's required-field rules in `if` statements; working out create mode versus edit mode when the hook already reports it in `status.mode`.
- **Fetching data the hook already fetches.** If the hook exposes it through `data` or `status`, use that.
- **`useWatch` to decide which fields show.** The hook already returns a field as `undefined` when it shouldn't show. `useWatch` is only for display-only cases with no business meaning, such as a preview panel.
- **Reading values to drive logic** through `form.hookFormInternals.formMethods.*`. For read-only access at submit time, use `form.getFormSubmissionValues()`.
- **`SDKFormProvider` misuse.** Flag providers nested inside each other, a hook that uses both `SDKFormProvider` and the `formHookResult` prop, or fields from one hook rendered inside another hook's provider.
- **Multi-form screens that don't use `composeSubmitHandler`**, or that wrap its result or the active forms list in `useMemo`. Hook results change every render, so memoizing them does nothing.
- **Submits that don't stop on failure.** In a chain of submits, each step should check its result and return early if it failed.
- **Errors combined by hand** (spreading error arrays together) instead of `composeErrorHandler` or `composeSubmitHandler`.
- **Loading states that hide errors.** The loading branch should render `<BaseLayout isLoading error={errorHandling.errors} />`, so users see a retry option instead of an endless spinner.
- **`onEvent` taken from `useBase()`** instead of being passed in as a prop.
- **Hooks set up without `shouldFocusError: false`** on screens that use `composeSubmitHandler`, which handles focus itself.
- **A raw `SelectField` inside `SDKFormProvider`** to translate option labels. Use the hook field's `getOptionLabel` prop instead.

## Hook files

Flag these in `use*Form` hooks and their schema and field files:

- **A schema that doesn't follow the four parts in order**: error codes, then field validators, then required fields config, then the schema factory.
- **Field names or types declared twice.** Types should come from the `fieldValidators` object.
- **Validators that call `.optional()`.** `buildFormSchema` decides what is optional.
- **Hardcoded string unions for validation codes.** Derive them from the error codes constant.
- **`useEffect` plus `reset()` to sync server data into the form.** Use `values` with `resetOptions: { keepDirtyValues: true }`, which keeps the user's edits.
- **A `defaultValues` prop typed as a `Pick` of an API entity.** It should be `Partial<{Domain}FormData>`, so `null` doesn't leak into the partner-facing type.
- **A return value that isn't the loading/ready union.** The loading branch must still include `errorHandling`, so partners can show errors and a retry button.
- **`form.Fields` members typed as `typeof SomeField`.** Use `ComponentType<SomeFieldProps>`, with `| undefined` for fields that can be hidden.
- **A `*SubmitCallbacks` parameter on a hook that makes only one API call per submit.** Partners can read `result.data` and `result.mode` from the awaited result instead. Callbacks are only for hooks that chain several API calls in one submit.
- **A hook in the wrong place.** Form hooks live in `src/components/<Domain>/<Feature>/shared/use<Name>Form/`.

## Non-form data hooks

Flag data hooks that don't return the `HookLoadingResult | BaseHookReady<...>` union from `src/partner-hook-utils/types.ts`.

## Exports and the public surface

Keep the public surface small. Flag new additions to `src/index.ts` of:

- infrastructure such as `buildFormSchema`, `deriveFieldsMetadata`, `withOptions`, `FormFieldsMetadataProvider`, `composeErrorHandler`, `collectErrors`, generic `*HookField` components, `HookFormInternals`, or `BaseFormHookReady`
- domain `*Field` components (only their `*FieldProps` types should be public)
- `create{Domain}Schema`, `{Domain}SchemaOptions`, or `{Domain}FormOutputs`
- `@gusto/embedded-api` entity types re-exported directly

Each new public hook export needs TSDoc. The `/tsdoc` skill covers the details.

## Tests for hooks

- New or changed hook behavior should have a test in the hook folder (`use<Name>Form.test.tsx`).
- When a component moves to hooks, its behavior tests should still pass, so check that the change didn't delete or weaken existing tests to make them pass.
