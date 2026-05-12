---
version: 1
last_updated: 2026-04-22
---

# Learned Review Rules

Patterns from actual review feedback. Add new entries with `/learn-review <note>`.

---

### LEARNED-001: Avoid Unnecessary Memoization

- **Severity:** warning
- **Rule:** Do not add `useMemo`, `useCallback`, or `React.memo` unless there is a demonstrated or obvious performance problem. Memoization on deep objects with referential equality checks is especially risky — the equality check will almost always fail on re-render, making the memoization useless at best and a maintenance trap at worst.

#### Bad Example

```tsx
// Object recreated every render anyway — memo check always fails
const config = useMemo(() => ({ filters: { status, page }, sort }), [status, page, sort])

// React.memo on a component with a complex object prop — not buying you anything
export const EmployeeList = React.memo(({ filters }: { filters: FilterConfig }) => { ... })
```

#### Good Example

```tsx
// No memoization needed for simple derived values
const config = { filters: { status, page }, sort }

// Add memo only when a profiler shows a real problem
```

---

### LEARNED-002: Avoid Type Casts (`as`)

- **Severity:** warning
- **Rule:** Avoid `as SomeType` unless there is clearly no alternative. Every `as` cast bypasses TypeScript's safety checks. Instead, use type guards, discriminated union narrowing, or generics. If you spot an `as` cast, suggest the specific alternative that applies to that code.

#### Bad Example

```tsx
const employee = data as Employee
const id = event.target.value as string
```

#### Good Example

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

### LEARNED-003: Avoid Redundant Test Cases

- **Severity:** info
- **Rule:** Tests should verify meaningful, distinct behavior — not repeat the same assertion with minor variations. Prefer a small set of representative test cases that cover the real value (happy path, key error path, important edge case) over a large number of shallow tests that add noise. Flag test suites where multiple cases are asserting the same thing in slightly different ways.

#### Bad Example

```tsx
it('renders with name "Alice"', () => { ... })
it('renders with name "Bob"', () => { ... })
it('renders with name "Charlie"', () => { ... })
// These all verify the same behavior — one parameterized test or a single representative case is enough
```

#### Good Example

```tsx
it('renders the employee name', () => { ... })       // happy path
it('shows a placeholder when name is empty', () => { ... })  // meaningful edge case
```

---

### LEARNED-004: SDK Partner-Facing Component APIs Should Be Minimal

- **Severity:** warning
- **Rule:** Components in the SDK that are provided to partners should expose a minimal, stable API. The primary prop is typically an entity ID (e.g., `employeeId`, `companyId`). Feature flags and opt-in behaviors (e.g., `withI9`, `isSelfOnboardingEnabled`) are acceptable as named booleans. Internal implementation details — sub-component props, internal state shapes, handler signatures — should not be exposed. If a new prop doesn't clearly belong in a partner integration contract, question it.

#### Bad Example

```tsx
// Exposing internal plumbing to partners
<EmployeeOnboarding
  employeeId={id}
  formConfig={{ sections: ['personal', 'tax'], layout: 'stacked' }}
  onStepChange={(step, data) => { ... }}
  internalFlowState={flowState}
/>
```

#### Good Example

```tsx
// Minimal partner API: entity ID + opt-in feature flags
<EmployeeOnboarding employeeId={id} withI9={true} isSelfOnboardingEnabled={false} />
```

---

---

### LEARNED-005: Pass API Response Data in Component Events

- **Severity:** warning
- **Rule:** Any event emitted after an API call should include the API response data as the payload. This applies to all event types (DONE, BACK, ERROR, etc.) — not just DONE. The top-level mutation result includes transport-level fields like `httpMeta` that partners don't need — extract the inner data value (e.g. `result.data` or whichever property contains the updated resource) and pass that instead. Discarding the result leaves partners without the updated state they need to react to the operation.

#### Bad Example

```tsx
await updateTimeOffPolicy({
  request: { timeOffPolicyUuid: policyId, requestBody: buildUpdateRequestBody(data, version) },
})
onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE)
```

#### Good Example

```tsx
const result = await updateTimeOffPolicy({
  request: { timeOffPolicyUuid: policyId, requestBody: buildUpdateRequestBody(data, version) },
})
// Pass the inner data value — not the top-level result which includes httpMeta etc.
onEvent(componentEvents.TIME_OFF_POLICY_SETTINGS_DONE, result.data)
```

## Adding New Patterns

Use `/learn-review <note>` to append a new entry. The next entry should be `LEARNED-006`.
