---
title: Hooks
description: Headless React hooks that handle data fetching, validation, submission, and error handling — you own the layout, copy, and ordering around them.
order: 2
---

# Hooks

Hooks are the headless layer of the SDK. They handle data fetching, validation, submission, and error handling, and hand back exactly what's needed to render a step — but no layout, no chrome, no fixed copy. You decide how the markup is arranged and what the labels say.

Hooks are the deepest level of control the SDK exposes. Reach for them when [sub-components](./sub-components.md) don't give you enough say over layout or copy, when you need to slot fields into an existing form shell, or when you're building a screen that doesn't map cleanly onto a single sub-component.

## Two kinds of hooks

- **Form hooks** return pre-bound Field components, form actions, and metadata. You arrange the fields, label them, and decide when to call submit. Validation, submission, and error handling are wired up for you.
- **Data hooks** return fetched, decorated data plus the actions valid for it. You render it however you like.

Both follow the same loading/error conventions: a discriminated `isLoading` union plus a shared `errorHandling` contract that surfaces server validation back into the form.

## Example

A form hook returns pre-bound Field components and a `handleSubmit` action — drop them into whatever layout you want:

```jsx
import { GustoProvider, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'

function App({ companyId }) {
  return (
    <GustoProvider config={{ apiToken: '...' }}>
      <EmployeeDetails companyId={companyId} />
    </GustoProvider>
  )
}

function EmployeeDetails({ companyId }) {
  const form = useEmployeeDetailsForm({ companyId })

  if (form.isLoading) return null

  return (
    <form onSubmit={form.handleSubmit}>
      <form.FirstNameField />
      <form.LastNameField />
      <form.EmailField />
      <button type="submit">Save</button>
    </form>
  )
}
```

See the [hooks reference](../hooks/hooks.md) for the full list of available form and data hooks, along with the return shape, props, and events for each.
