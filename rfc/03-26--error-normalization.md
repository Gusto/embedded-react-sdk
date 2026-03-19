# Error Normalization for the React SDK

This document proposes a unified error type for all SDK error scenarios, replacing the multiple inconsistent shapes partners currently encounter. This is foundational prep work for the hooks-based architecture ([#1254](https://github.com/Gusto/embedded-react-sdk/pull/1254)) where partners will interact with errors directly as React state.

The implementation is in [PR #1286](https://github.com/Gusto/embedded-react-sdk/pull/1286).

## Requirements

### Partner

- Partner should receive a single, well-typed error shape regardless of how the error originated (API failure, validation, network, unexpected crash)
- Partner should be able to identify what went wrong at a glance via a high-level category
- Partner should have access to field-level error details for rendering inline form errors
- Partner should be able to route errors to observability tools (Sentry, Datadog) with component-level context

### SDK

- All error classes from `@gusto/embedded-api` should normalize into one shape
- The normalization function should be pure — classification based on the error type, no options or side effects
- Observability context (component name, stack trace, timestamp) should not pollute the partner-facing type
- Existing component error handling should continue to work without regressions

### SDK Considerations

- The `@gusto/embedded-api` package defines ~10 error classes with varying shapes, but all HTTP errors share the same `{ errors: EntityErrorObject[] }` response structure from the Gusto API
- Today, field errors are only extracted from `UnprocessableEntityErrorObject` — other classes with identical `errors[]` arrays are shown as generic "An error was encountered"
- `SDKValidationError` (Zod) and `HTTPClientError` (network) extend `Error` directly, not `GustoEmbeddedError`, so they follow different `instanceof` paths
- The observability system (`ObservabilityError`) currently loses field-level detail that would be useful for error tracking
- With hooks, `useQuery` (non-suspense) replaces `useSuspenseQuery`, so query errors become state instead of exceptions — partners need a type to build their UI against

## Background

### Errors are an internal concern today

In the current component-based SDK, partners don't interact with errors directly. The SDK handles everything internally:

- **Form validation errors** (422) render as an alert banner inside the Base component — the partner never touches the error object
- **Boundary errors** (network failures, unexpected crashes) replace the component with an "Something went wrong" fallback — the partner sees a UI, not a type
- **Observability** (`observability.onError`) was recently introduced as an opt-in telemetry hook, but it's for error _reporting_, not error _handling_

Partners don't need to know about error shapes because they never build error UI — the SDK does it for them.

### Hooks change this fundamentally

With hooks, errors become partner-facing. The SDK no longer owns the UI, so it can't render alert banners or fallback cards on the partner's behalf. Instead:

- `useQuery` returns `{ error }` as state — the partner decides what to render for a failed data fetch
- `useMutation` returns `{ error }` as state — the partner decides what to render for a failed form submit
- ErrorBoundary is reserved for unexpected JavaScript bugs only

This means errors go from being an internal implementation detail to a first-class part of the partner API. Without normalization, partners would be doing `instanceof` checks against internal `@gusto/embedded-api` classes — leaking our implementation details into their code. They need a single, well-documented type to build against.

### What errors reach the SDK

The `@gusto/embedded-api` package catches API failures and network issues, constructing typed error objects. The problem is that each error class has a different shape:

- **Typed HTTP errors** like `UnprocessableEntityErrorObject` and `NotFoundErrorObject` parse the API response and expose an `errors[]` array with field-level detail (`errorKey`, `category`, `message`, `metadata`), plus `httpMeta` with the status code.
- **`APIError`** (the fallback for unmapped status codes like 403, 429, 500) does _not_ parse the response body — the error detail is only available as a raw string inside `httpMeta.body`.
- **`SDKValidationError`** has no HTTP response at all — it's a client-side Zod validation failure with a `cause: ZodError`.
- **`HTTPClientError`** subclasses have no HTTP response either — they represent network failures with a `cause` chain.

This is where the shape fragmentation happens. The same kind of information (what went wrong, which fields are affected) is represented differently depending on which error class you're holding. The normalization pipeline collapses all of these into a single `SDKError`.

For the full catalog of every error class, their runtime shapes, and real captured examples, see the [Error Inventory](../docs/research/error-inventory.md).

## Current error shapes

These are the error objects the SDK receives from `@gusto/embedded-api`. Each class has a different shape, which is what partners would have to deal with without normalization.

### Typed HTTP errors (`UnprocessableEntityErrorObject`, `NotFoundErrorObject`, etc.)

These classes parse the API response body and expose a structured `errors[]` array alongside `httpMeta`. This is the shape used for 422, 404, 409, and similar responses:

```json
{
  "name": "UnprocessableEntityErrorObject",
  "message": "API error occurred: ...",
  "httpMeta": {
    "response": { "status": 422, "statusText": "Unprocessable Content" },
    "request": { "method": "PUT", "url": ".../v1/employees/e7837f39-..." }
  },
  "errors": [
    { "errorKey": "first_name", "category": "invalid_attribute_value", "message": "First name is required" },
    { "errorKey": "email", "category": "invalid_attribute_value", "message": "Email is not a valid email address" }
  ]
}
```

The `errors[]` entries vary by scenario — field validation (`invalid_attribute_value`), business rules (`invalid_operation`), version conflicts (`invalid_resource_version`), payroll blockers (`payroll_blocker` with `metadata.key`), and deeply nested structures (`nested_errors`) — but the class shape is the same. `NotFoundErrorObject` (404) has the same structure with different `errorKey`/`category` values.

### Fallback HTTP errors (`APIError`)

`APIError` is the fallback for unmapped status codes (403, 429, 500). It does **not** parse the response body — the error detail is buried as a raw string in `httpMeta.body`:

```json
{
  "name": "APIError",
  "message": "Unexpected status code: 500: {\"errors\":[{\"error_key\":\"base\",\"category\":\"internal_error\",\"message\":\"Something went wrong.\"}]}",
  "httpMeta": { "response": { "status": 500 } }
}
```

No `errors[]` property. The structured data is in the `message` and `httpMeta.body` strings but not accessible programmatically. Today this information is lost.

### Client-side validation (`SDKValidationError`)

Thrown when request data fails Zod schema validation _before_ an HTTP call is made. No `httpMeta`, no `errors[]`.

```json
{
  "name": "SDKValidationError",
  "message": "Input validation failed: [{\"code\":\"invalid_type\",\"expected\":\"string\",\"received\":\"undefined\",\"path\":[\"requestBody\",\"version\"],\"message\":\"Required\"}]",
  "rawMessage": "Input validation failed",
  "cause": {
    "name": "ZodError",
    "issues": [
      { "code": "invalid_type", "expected": "string", "received": "undefined", "path": ["requestBody", "version"], "message": "Required" }
    ]
  }
}
```

### Network errors (`HTTPClientError` subclasses)

No `httpMeta`, no `errors[]`. The error shape varies by failure type.

**Connection refused** (`ConnectionError`):

```json
{
  "name": "ConnectionError",
  "message": "Unable to make request: TypeError: fetch failed",
  "cause": { "name": "TypeError", "message": "fetch failed", "cause": { "code": "ECONNREFUSED" } }
}
```

**Request timeout** (`RequestTimeoutError`):

```json
{
  "name": "RequestTimeoutError",
  "message": "Request timed out: TimeoutError: The operation was aborted due to timeout",
  "cause": { "name": "TimeoutError", "message": "The operation was aborted due to timeout" }
}
```

**Request aborted** (`RequestAbortedError`):

```json
{
  "name": "RequestAbortedError",
  "message": "Request aborted by client: AbortError: This operation was aborted",
  "cause": { "name": "AbortError", "message": "This operation was aborted" }
}
```

### The problem this illustrates

A partner trying to handle errors today would need to check `instanceof` against multiple classes, know which ones have `errors[]` vs. `cause` vs. neither, handle nesting traversal themselves, and deal with different `message` formats across classes. The unified `SDKError` type absorbs all of this complexity so the partner writes:

```typescript
if (error.category === 'api_error' && error.fieldErrors.length > 0) {
  // Show field errors — works for 422, 404, 409, nested state taxes, payroll blockers
}
```

Instead of:

```typescript
if (error instanceof UnprocessableEntityErrorObject && Array.isArray(error.errors)) {
  const fieldErrors = error.errors.flatMap(e => getFieldErrors(e))
  // ...
} else if (error instanceof NotFoundErrorObject) {
  // Different extraction...
} else if (error instanceof APIError) {
  // Parse httpMeta.body as JSON? Maybe?
} else if (error instanceof SDKValidationError) {
  // Use error.pretty()? Or error.cause.issues?
} else if (error instanceof ConnectionError) {
  // ...
}
```

For the full catalog of error shapes including all subclasses, field mapping behavior, and edge cases, see the [Error Inventory](../docs/research/error-inventory.md).

## Solution

### `SDKError` — the partner-facing type

```typescript
type SDKErrorCategory = 'api_error' | 'validation_error' | 'network_error' | 'internal_error'

interface SDKError {
  category: SDKErrorCategory
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}

interface SDKFieldError {
  field: string
  category: string
  message: string
  metadata?: Record<string, unknown>
}
```

This is the type partners build their error UI against. A partner using hooks would write:

```tsx
const { error } = useEmployeeProfile({ employeeId, companyId })

if (error) {
  // Route by category
  if (error.category === 'network_error') {
    return <RetryBanner onRetry={refetch} />
  }

  // Show field-level errors inline
  const fieldErrors = error.fieldErrors.filter(
    e => e.category === 'invalid_attribute_value'
  )

  // Show operation-level errors as a banner
  const operationErrors = error.fieldErrors.filter(
    e => e.category === 'invalid_operation'
  )

  return (
    <>
      {operationErrors.map(e => <Banner key={e.field}>{e.message}</Banner>)}
      <Form>
        {fieldErrors.map(e => <FieldError key={e.field} field={e.field}>{e.message}</FieldError>)}
      </Form>
    </>
  )
}
```

#### Design decisions

**Four categories, not per-class mapping.** Partners route on broad classification, not SDK internals. `api_error` covers 404, 422, 409, 500 — `httpStatus` disambiguates when a partner needs to differentiate a "not found" from a "validation failure."

**`fieldErrors` is always an array, never undefined.** Partners can always `.map()` without null checks. Non-field errors (network, validation, internal) have `fieldErrors: []`. This is a small thing but eliminates a whole class of "did I check for null" bugs in partner code.

**`raw` carries the original error for advanced use.** Partners who need to inspect the underlying `GustoEmbeddedError` or `SDKValidationError` can access it. Observability sanitization can strip it via `sanitization.includeRawError: false` for PII safety.

**No `stack`, `componentName`, or `timestamp`.** These are internal telemetry concerns. A partner building error UI doesn't need to know which SDK component failed or when — that's for Sentry. See `ObservabilityError` below.

### `ObservabilityError` — the telemetry extension

```typescript
interface ObservabilityError extends SDKError {
  timestamp: number
  componentName?: string
  componentStack?: string
}
```

Partners implementing `observability.onError` receive this enriched type. The additional fields are added at the emission site (not in `normalizeToSDKError`) via object spread:

```typescript
// In useBaseSubmit, when emitting to observability:
observability?.onError?.({ ...sdkError, timestamp: Date.now(), componentName })

// In ErrorBoundary, when emitting to observability:
observability?.onError?.({ ...sdkError, timestamp: Date.now(), componentName, componentStack })
```

This keeps `normalizeToSDKError` pure and `SDKError` clean. The observability fields are context that only error-tracking tools care about:

- `timestamp` — for time-series correlation in Datadog/Sentry
- `componentName` — for grouping errors by SDK component (e.g. "Employee.Profile")
- `componentStack` — React's component tree trace, only present for ErrorBoundary catches

### `normalizeToSDKError` — classification function

```typescript
function normalizeToSDKError(error: unknown): SDKError
```

Pure function, no options, no side effects. Classification is based on `instanceof` checks:

| Input type | → `category` | Field error extraction |
|---|---|---|
| `SDKInternalError` | Uses error's own `category` (default: `internal_error`) | None |
| `SDKValidationError` | `validation_error` | None (Zod error, no API fields) |
| `HTTPClientError` (ConnectionError, TimeoutError, AbortError) | `network_error` | None (no HTTP response) |
| `GustoEmbeddedError` (and all subclasses) | `api_error` | Extracts from `errors[]` via `getFieldErrors` traversal |
| `Error` | `internal_error` | None |
| Non-Error value | `internal_error` | None |

For `api_error`, the function extracts field errors from _any_ error class that carries an `errors[]` array — not just `UnprocessableEntityErrorObject`. This means `NotFoundErrorObject` (404) and `APIError` (500) now surface their API messages instead of showing a generic fallback.

### `SDKInternalError` — throwable error for SDK guard clauses

```typescript
class SDKInternalError extends Error {
  readonly category: SDKErrorCategory

  constructor(message: string, category: SDKErrorCategory = 'internal_error') {
    super(message)
    this.name = 'SDKInternalError'
    this.category = category
  }
}
```

Internal SDK code throws this instead of plain `Error` when a guard clause fails inside a `baseSubmitHandler` callback. The distinction matters because `baseSubmitHandler` routes errors by `instanceof`:

- Recognized error classes (`GustoEmbeddedError`, `SDKValidationError`, `SDKInternalError`) → **inline error banner**
- Unrecognized errors (plain `Error`, `TypeError`, etc.) → **ErrorBoundary fallback**

Without `SDKInternalError`, guards like "missing payroll ID in response" crash to the boundary with a generic "Something went wrong" — even though the error has a clear, displayable message. With it, the user sees the actual message in the inline banner.

**Examples of converted throw sites:**

```typescript
// OffCycleCreation — API succeeded but response missing payroll UUID
throw new SDKInternalError(t('errors.missingPayrollId'))

// ContractorProfile — missing version before update attempt
throw new SDKInternalError('Contractor version is required for updates')

// Profile — employee UUID missing after mutations
throw new SDKInternalError('Employee id is not available')
```

All default to `category: 'internal_error'`. The optional `category` parameter exists as an escape hatch if future use cases need different classification, but we haven't needed it yet.

`normalizeToSDKError` checks for `SDKInternalError` before the generic `Error` branch, using the error's own `category` field instead of always defaulting to `internal_error`.

### Partner guidance by error category

The `category` field drives broad routing decisions. The `message` and `fieldErrors` provide specificity within each category.

| Category | What happened | Partner action |
|---|---|---|
| `api_error` + `fieldErrors.length > 0` | API rejected the input — field-level validation failures | Show field errors inline, user corrects and resubmits |
| `api_error` + `httpStatus === 409` | Stale data — version conflict | Refetch to get fresh data, then retry |
| `api_error` + `httpStatus === 404` | Resource doesn't exist | Show "not found" message, navigate elsewhere |
| `api_error` + `httpStatus >= 500` | Server error (transient) | Show error message, user can retry |
| `api_error` + other | Operation-level rejection (e.g. business rule violation) | Show `message` as a banner |
| `validation_error` | Client-side Zod schema failed before HTTP call | SDK bug — show generic error, shouldn't happen in production |
| `network_error` | Connection refused, timeout, or abort | Show retry UI — "Check your connection and try again" |
| `internal_error` | SDK hit an unexpected state (guard clause, missing data) | Show `message` as a generic error, user can retry |

For most partners, the simple version is: if `fieldErrors` has items, show them inline on the form. Otherwise, show `message` as a banner. The category and httpStatus are there for partners who want finer control.

**Note on field error display:** In the current hooks proposal, SDK-provided field components will automatically map `fieldErrors` to the corresponding form fields and display validation messages inline — partners using SDK field components won't need to handle this themselves.

### What this replaces

| Removed | Replacement |
|---|---|
| `ObservabilityErrorType` enum | `SDKErrorCategory` (same concept, minus `boundary_error`) |
| `ObservabilityErrorContext` interface | `componentName` and `componentStack` promoted to top-level on `ObservabilityError` |
| `createObservabilityError()` utility | `normalizeToSDKError()` + object spread at emission site |
| `SanitizationConfig.includeOriginalError` | `SanitizationConfig.includeRawError` (already existed, now the only option) |

## How it flows through the system

### Current component architecture (mutations)

```
Form submit → baseSubmitHandler catches error
  → normalizeToSDKError(error)      → SDKError stored as component state
  → { ...sdkError, timestamp, componentName } → observability.onError(ObservabilityError)
  → BaseLayout renders SDKError.message + SDKError.fieldErrors as Alert banner
```

### Current component architecture (ErrorBoundary)

```
Unexpected error → React ErrorBoundary catches (error, errorInfo)
  → normalizeToSDKError(error)      → SDKError
  → { ...sdkError, timestamp, componentName, componentStack } → observability.onError
  → InternalError fallback UI
```

### Hooks architecture (upcoming)

```
useQuery / useMutation → returns { error } as state
  → normalizeToSDKError(error)      → SDKError returned to partner
  → Partner renders their own UI based on category + fieldErrors + message
  → Observability still enriches at emission site
```

The normalization function doesn't change between these paths — only where and how the output is consumed.

## What improves

| Before | After |
|---|---|
| 404 errors show generic "An error was encountered" | 404 produces `SDKError` with `message: "The requested resource was not found."` and `httpStatus: 404` |
| Field errors only extracted from `UnprocessableEntityErrorObject` | Field errors extracted from any error with an `errors[]` array |
| `SDKValidationError` renders raw Zod in a `<pre>` tag | Clean `message` string via `rawMessage` fallback |
| Partners receive `unknown` from `onEvent('ERROR')` | Partners will receive typed `SDKError` from hooks |
| Three different error shapes depending on path | One shape regardless of source |
| Internal guard clause errors crash to ErrorBoundary | `SDKInternalError` routes them to the inline banner with the actual message |
| Observability loses field-level detail | `ObservabilityError` inherits `fieldErrors` from `SDKError` |

## Tradeoffs

### Advantages

- Partners get a single, predictable type for all error scenarios — no `instanceof` checks against internal classes
- Field errors are extracted from more error classes, improving the information shown to users
- The `SDKError` / `ObservabilityError` separation keeps the partner-facing type clean while giving telemetry tools the context they need
- `normalizeToSDKError` is a pure function that's easy to test and reason about
- Compatible with both current component architecture and upcoming hooks — no infrastructure rewrite needed

### Limitations

**Field validation messages are English-only.** The Gusto API returns pre-baked messages like "First name is required." There's no error code that would let partners provide their own i18n translations. The `error_key` + `category` pair identifies _which field_ has _what kind_ of problem but can't distinguish "required" from "too long" from "invalid format" for the same field. For initial hooks launch, partners display the API message. Supporting partner i18n for server-side errors is a separate effort requiring API changes.

**Payroll blockers are the exception that works.** They carry `metadata.key` (e.g. `"missing_bank_info"`) which the SDK already maps to i18n translations. This could serve as a model for other error types if the API adds similar identifiers.

**The `raw` field creates a PII surface.** Raw error objects from the API can contain sensitive data (SSNs, bank details passed in request bodies). The sanitization layer strips `raw` by default (`includeRawError: false`), but partners who opt in need to handle it carefully.

## Scope

### In scope (this PR)

- `SDKError`, `SDKFieldError`, and `SDKErrorCategory` type definitions and exports
- `ObservabilityError extends SDKError` type definition
- `normalizeToSDKError` pure function
- `SDKInternalError` class for internal SDK guard clauses
- Base infrastructure updated (`useBaseSubmit`, `Base.tsx`, `GustoProviderCustomUIAdapter`)
- `baseSubmitHandler` catches `SDKInternalError` alongside API/validation errors
- Internal guard clause throws converted to `SDKInternalError` in `OffCycleCreation`, `Profile`, `ContractorProfile`, `PayrollConfiguration`
- Components consuming field errors updated to use `SDKError.fieldErrors`
- Deprecated types and functions removed (`ObservabilityErrorType`, `ObservabilityErrorContext`, `createObservabilityError`, `includeOriginalError`)
- Documentation rewritten

### Out of scope (future work)

- **Hooks integration** — wiring `SDKError` into hook return types happens in [#1254](https://github.com/Gusto/embedded-react-sdk/pull/1254)
- **Partner i18n for API errors** — requires stable error codes from the API
- **Query error normalization in hooks** — the normalization function already handles all error classes; hooks just need to call it
- **Error code registry** — would need API team involvement

## References

- **Research:** [Error Inventory](../docs/research/error-inventory.md) — comprehensive catalog of all error classes, runtime shapes, routing paths, and field mapping behavior
- **Implementation:** [PR #1286](https://github.com/Gusto/embedded-react-sdk/pull/1286)
- **Hooks RFC:** [PR #1254](https://github.com/Gusto/embedded-react-sdk/pull/1254)
- **Ticket:** SDK-509
