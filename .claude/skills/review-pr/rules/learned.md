---
version: 1
last_updated: 2026-05-14
---

# Learned Review Rules

Patterns from actual review feedback. Add new entries with `/learn-review <note>`.

---

## LEARNED-001: Avoid Unnecessary Memoization

- **Severity:** warning
- **Rule:** Do not add `useMemo`, `useCallback`, or `React.memo` unless there is a demonstrated or obvious performance problem. Memoization on deep objects with referential equality checks is especially risky — the equality check will almost always fail on re-render, making the memoization useless at best and a maintenance trap at worst.

### Bad Example

```tsx
// Object recreated every render anyway — memo check always fails
const config = useMemo(() => ({ filters: { status, page }, sort }), [status, page, sort])

// React.memo on a component with a complex object prop — not buying you anything
export const EmployeeList = React.memo(({ filters }: { filters: FilterConfig }) => { ... })
```

### Good Example

```tsx
// No memoization needed for simple derived values
const config = { filters: { status, page }, sort }

// Add memo only when a profiler shows a real problem
```

---

## LEARNED-002: Avoid Type Casts (`as`)

- **Severity:** warning
- **Rule:** Avoid `as SomeType` unless there is clearly no alternative. Every `as` cast bypasses TypeScript's safety checks. Instead, use type guards, discriminated union narrowing, or generics. If you spot an `as` cast, suggest the specific alternative that applies to that code.

### Bad Example

```tsx
const employee = data as Employee
const id = event.target.value as string
```

### Good Example

```tsx
// Use a type guard
function isEmployee(val: unknown): val is Employee {
  return typeof val === 'object' && val !== null && 'id' in val
}
if (isEmployee(data)) { /* data is Employee here */ }

// Use a generic to let the caller specify the type safely
function useFormField<T>(name: string): T { ... }
```

---

## LEARNED-003: Avoid Redundant Test Cases

- **Severity:** info
- **Rule:** Tests should verify meaningful, distinct behavior — not repeat the same assertion with minor variations. Prefer a small set of representative test cases that cover the real value (happy path, key error path, important edge case) over a large number of shallow tests that add noise. Flag test suites where multiple cases are asserting the same thing in slightly different ways.

### Bad Example

```tsx
it('renders with name "Alice"', () => { ... })
it('renders with name "Bob"', () => { ... })
it('renders with name "Charlie"', () => { ... })
// These all verify the same behavior — one parameterized test or a single representative case is enough
```

### Good Example

```tsx
it('renders the employee name', () => { ... })       // happy path
it('shows a placeholder when name is empty', () => { ... })  // meaningful edge case
```

---

## LEARNED-004: SDK Partner-Facing Component APIs Should Be Minimal

- **Severity:** warning
- **Rule:** Components in the SDK that are provided to partners should expose a minimal, stable API. The primary prop is typically an entity ID (e.g., `employeeId`, `companyId`). Feature flags and opt-in behaviors (e.g., `withI9`, `isSelfOnboardingEnabled`) are acceptable as named booleans. Internal implementation details — sub-component props, internal state shapes, handler signatures — should not be exposed. If a new prop doesn't clearly belong in a partner integration contract, question it.

### Bad Example

```tsx
// Exposing internal plumbing to partners
<EmployeeOnboarding
  employeeId={id}
  formConfig={{ sections: ['personal', 'tax'], layout: 'stacked' }}
  onStepChange={(step, data) => { ... }}
  internalFlowState={flowState}
/>
```

### Good Example

```tsx
// Minimal partner API: entity ID + opt-in feature flags
<EmployeeOnboarding employeeId={id} withI9={true} isSelfOnboardingEnabled={false} />
```

---

---

## LEARNED-005: Pass API Response Data in Component Events

- **Severity:** warning
- **Rule:** Any event emitted after an API call should include the API response data as the payload. This applies to all event types (DONE, BACK, ERROR, etc.) — not just DONE. The top-level mutation result includes transport-level fields like `httpMeta` that partners don't need — extract the inner data value (e.g. `result.data` or whichever property contains the updated resource) and pass that instead. Discarding the result leaves partners without the updated state they need to react to the operation.

### Bad Example

```tsx
await updateTimeOffPolicy({
  request: { timeOffPolicyUuid: policyId, requestBody: buildUpdateRequestBody(data, version) },
})
onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
```

### Good Example

```tsx
const result = await updateTimeOffPolicy({
  request: { timeOffPolicyUuid: policyId, requestBody: buildUpdateRequestBody(data, version) },
})
// Pass the inner data value — not the top-level result which includes httpMeta etc.
onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE, result.data)
```

---

## LEARNED-006: Partner-Facing Hooks Must Conform to the Canonical Spec

- **Severity:** warning
- **Rule:** Any new `use*Form` hook intended for the public partner surface — or any SDK component being migrated to consume one — must conform to the canonical specs in `.claude/commands/create-hook.md` (scaffolding/structure) and `.claude/skills/migrate-sdk-component-to-hooks/SKILL.md` (migration playbook). This means the hook lives at `src/components/<Domain>/<Feature>/shared/use<Name>Form/` with the five-file layout (`use*Form.tsx`, `<camelDomain>Schema.ts`, `fields.tsx`, `index.ts`, `use*Form.test.tsx`); the schema follows `ErrorCodes → fieldValidators → requiredFieldsConfig → buildFormSchema` (no inline `.optional()` except the documented enum-placeholder escape hatch); the hook returns the discriminated union with `errorHandling` in both branches and `HookSubmitResult<TEntity>` from `onSubmit`; field components are thin `*HookField` wrappers; partner-facing exports are wired through the feature barrel and `src/index.ts`; and the exported symbols carry TSDoc so the partner-facing reference under `docs/reference/**` regenerates (no hand-written `docs/hooks/` page). "Different but works" is not acceptable — partners rely on the consistency of these patterns. When flagging, cite the specific section of the canonical doc in the suggested fix.

### Bad Example

```tsx
// New "partner-facing" hook authored ad hoc:
// - lives at src/hooks/useNewThingForm.ts (wrong location)
// - inlines z.object(...) instead of using buildFormSchema
// - returns { isLoading, isReady, errors, submit } (custom shape, not the discriminated union)
// - exports buildFormSchema-style internals from the public barrel
// - no TSDoc on the exported symbols (partner-facing reference can't regenerate)
export function useNewThingForm(props: Props) {
  const schema = z.object({ name: z.string().min(1), startDate: z.string().optional() })
  const { handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
  return {
    isLoading: false,
    isReady: true,
    errors: formState.errors,
    submit: handleSubmit(/* ... */),
  }
}
```

### Good Example

```tsx
// src/components/Employee/NewThing/shared/useNewThingForm/useNewThingForm.tsx
// Follows the five-file layout, buildFormSchema-based schema, and the
// canonical discriminated-union return shape. See create-hook.md for the
// full template.
export function useNewThingForm(
  props: UseNewThingFormProps,
): HookLoadingResult | UseNewThingFormReady {
  const [schema, metadataConfig] = useMemo(
    () => createNewThingSchema({ mode, optionalFieldsToRequire }),
    [mode, optionalFieldsToRequire],
  )
  const formMethods = useForm<NewThingFormData, unknown, NewThingFormOutputs>({
    resolver: zodResolver(schema),
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
    shouldFocusError,
  })
  const errorHandling = composeErrorHandler(queriesForErrors, { submitError, setSubmitError })
  const hookFormInternals = useHookFormInternals(formMethods)

  if (isDataLoading) {
    return { isLoading: true as const, errorHandling }
  }
  return {
    isLoading: false as const,
    data: { newThing },
    status: { isPending, mode },
    actions: { onSubmit },
    errorHandling,
    form: { Fields, fieldsMetadata, hookFormInternals, getFormSubmissionValues },
  }
}
```

---

## LEARNED-007: No react-hook-form Internals in SDK Components (Non-Negotiable)

- **Severity:** error
- **Rule:** SDK components must consume form hooks only through their documented partner-facing surface (`data`, `status`, `actions`, `errorHandling`, `form.Fields`, `form.fieldsMetadata`, `form.getFormSubmissionValues`). Reaching for raw `useForm`, `useWatch`, `setValue`, `watch`, `getValues`, `trigger`, `register`, or `hookResult.form.hookFormInternals.formMethods.*` from the component is non-negotiable — partners should never need to know about `react-hook-form` to consume the SDK. Each such use is a signal the hook is missing functionality; the only acceptable resolutions are (a) move the logic into the hook (existing or newly-scaffolded — see `.claude/commands/create-hook.md`), or (b) a written, reviewer-approved justification that no hook can own the case without side effects. Flag every occurrence as Critical and surface it explicitly to the user; never let it slide silently. `AdminProfile.tsx`'s screen-local `useForm` for `startDate` is a documented historical exception, not a template — do not cite it as precedent for new code.

### Bad Example

```tsx
// Component pulls react-hook-form internals to drive cross-field behavior
function CompensationStep() {
  const job = useJobForm({ employeeId })
  const compensation = useCompensationForm({ employeeId })

  if (job.isLoading || compensation.isLoading) return <Spinner />

  // Anti-pattern: reading form values out of the hook to compute requiredness
  // and submit payload in the component.
  const hireDate = useWatch({
    control: job.form.hookFormInternals.formMethods.control,
    name: 'hireDate',
  })

  // Anti-pattern: standing up a raw useForm for a field the hook should own
  const { register, handleSubmit } = useForm<{ startDate: string }>()

  const onSubmit = handleSubmit(async ({ startDate }) => {
    await job.actions.onSubmit()
    await compensation.actions.onSubmit({
      effectiveDate: hireDate ?? startDate, // logic that belongs in the hook
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <SDKFormProvider hookResult={job}>
        <job.form.Fields.Title />
      </SDKFormProvider>
      <input {...register('startDate')} />
    </form>
  )
}
```

### Good Example

```tsx
// Component consumes only the documented hook surface; cross-field logic
// lives in the hooks themselves.
function CompensationStep() {
  const job = useJobForm({ employeeId, shouldFocusError: false })
  const compensation = useCompensationForm({
    employeeId,
    withEffectiveDateField: false, // hook derives effectiveDate from hireDate
    shouldFocusError: false,
  })

  const { handleSubmit, errorHandling } = composeSubmitHandler({
    activeForms: [
      { hookResult: job },
      {
        hookResult: compensation,
        // Pass the just-created job's hireDate as a submit-time option.
        // No useWatch / formMethods access needed — the hook reads it from
        // its own form state.
      },
    ],
  })

  if (job.isLoading || compensation.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  return (
    <BaseLayout error={errorHandling.errors}>
      <form onSubmit={handleSubmit}>
        <SDKFormProvider hookResult={job}>
          <job.form.Fields.Title />
          <job.form.Fields.HireDate />
        </SDKFormProvider>
        <SDKFormProvider hookResult={compensation}>
          <compensation.form.Fields.Rate />
        </SDKFormProvider>
      </form>
    </BaseLayout>
  )
}
```

## Adding New Patterns

Use `/learn-review <note>` to append a new entry. The next entry should be `LEARNED-008`.
