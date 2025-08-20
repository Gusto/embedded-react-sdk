---
title: Error Handling in the React SDK
order: 7
---

# Error Handling in the React SDK

Error handling in the React SDK occurs across multiple layers:

1. **Top-Level Error Boundary** — in `GustoProviderCustomUIAdapter.tsx`
2. **Component-Level Error Boundary** — in `Base.tsx`
3. **Error Processing Logic** — in `Base.tsx`

---

## Known Errors

The `Base` component handles three main categories of known errors:

- **API client errors** caused by Zod validation failures on request or response schemas
- **Explicitly set errors** from descendants of the `Base` component
- **Errors returned directly by the API**

These known errors are rendered alongside the component’s children at the top level of `Base.tsx`. They differ in structure and are displayed with context-specific UI.

---

## Catastrophic Errors

Unexpected errors thrown by descendants of the `Base` component are caught by the error boundary in `Base.tsx` and rendered using the `InternalError` component or a custom `FallbackComponent` if provided. These are considered **catastrophic errors**, meaning the component cannot render itself.

In such cases, a **"Try again"** button is shown, which allows users to attempt a re-render of the component.

---

## Unrecognized Errors

Errors that are caught by `Base.tsx` but not recognized as known error types are re-thrown. These are then handled by the top-level error boundary in `GustoProviderCustomUIAdapter.tsx`, unless a partner provides additional error boundaries between `GustoProvider` and t
