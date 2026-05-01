---
title: Employee.Landing
sidebar_position: 16
---

## Description

Self-onboarding welcome page. Displays guidance on what to expect from the self-onboarding workflow and what information the employee will be required to have on hand and provide.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle landing events
  }

  return <Employee.Landing companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
}
```

## Props

| Name           | Type                                          | Default | Required | Description                               |
| -------------- | --------------------------------------------- | ------- | -------- | ----------------------------------------- |
| **employeeId** | `string`                                      |         | Yes      | The associated employee identifier.       |
| **companyId**  | `string`                                      |         | Yes      | The associated company identifier.        |
| **onEvent**    | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted. |

## Events

| Event                            | Description                                                                                     | Data |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ---- |
| `EMPLOYEE_SELF_ONBOARDING_START` | Fired when the employee selects the "Get started" CTA and is ready to navigate to the next step | None |
