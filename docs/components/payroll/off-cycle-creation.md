---
title: Payroll.OffCycleCreation
sidebar_position: 16
---

Form for creating an off-cycle payroll with type selection and employee assignment.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.OffCycleCreation
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name          | Type                                          | Required | Description                                           |
| ------------- | --------------------------------------------- | -------- | ----------------------------------------------------- |
| `companyId`   | `string`                                      | Yes      | The associated company identifier.                    |
| `payrollType` | `string`                                      | No       | The type of off-cycle payroll. Defaults to `'bonus'`. |
| `onEvent`     | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.             |

## Events

| Event               | Description                                               | Data                      |
| ------------------- | --------------------------------------------------------- | ------------------------- |
| `OFF_CYCLE_CREATED` | Fired when the off-cycle payroll is successfully created. | `{ payrollUuid: string }` |
