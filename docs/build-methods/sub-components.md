---
title: Sub-components
description: The individual steps that make up each workflow — render them standalone or compose them into a custom multi-step experience.
order: 1
---

# Sub-components

Each workflow is assembled from a set of sub-components — Profile, Compensation, Federal Taxes, Documents, and so on. Every sub-component is also exported on its own, so you can render any single step in isolation or compose them into a multi-step experience of your own design.

Sub-components sit between [workflows](./workflows.md) and [hooks](./hooks.md): more control than a workflow, less work than a fully headless hook integration. Reach for them when the built-in workflow's order or set of steps doesn't match what you want to render, or when you only need part of a surface (for example, an in-app "Edit profile" page that reuses the Profile step without the rest of onboarding).

## What a sub-component gives you

- A standalone React component for one logical step
- The same data fetching, validation, and submission as the workflow uses
- Step-level events on `onEvent` (entity created, entity updated, "done" with that step)
- No assumption about what step comes next — that's yours to wire up

## Example

Render the Profile step in isolation:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function EditProfilePage({ companyId, employeeId }) {
  return (
    <Employee.Profile
      companyId={companyId}
      employeeId={employeeId}
      isAdmin
      onEvent={(eventType, data) => {
        // Handle EMPLOYEE_PROFILE_DONE here to advance,
        // close a modal, or refresh upstream state.
      }}
    />
  )
}
```

Each surface page lists every sub-component it exposes, the props each accepts, and the events each emits. For guidance on composing several sub-components into a custom multi-step flow, see the [composition guide](../integration-guide/composition.md).
