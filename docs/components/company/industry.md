---
title: Company.Industry
sidebar_position: 8
---

Industry selection component for the company. Allows users to search for and select the company's industry classification.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.Industry
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name        | Type                                          | Required | Description                               |
| ----------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `companyId` | `string`                                      | Yes      | The associated company identifier.        |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |

## Events

| Event                       | Description                                            | Data                   |
| --------------------------- | ------------------------------------------------------ | ---------------------- |
| `COMPANY_INDUSTRY_SELECTED` | Fired when an industry is selected.                    | Selected industry data |
| `COMPANY_INDUSTRY`          | Fired when the industry selection process is complete. | None                   |
