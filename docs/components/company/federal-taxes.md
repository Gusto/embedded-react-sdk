---
title: Company.FederalTaxes
sidebar_position: 7
---

Form for entering company federal tax information including EIN, tax payer type, filing form, and legal name.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.FederalTaxes
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                                                 | Required | Description                                                                                                                                       |
| --------------- | -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companyId`     | `string`                                                             | Yes      | The associated company identifier.                                                                                                                |
| `defaultValues` | `{ legalName?: string, taxPayerType?: string, filingForm?: string }` | No       | Default values for the federal taxes form fields. If company data for these fields is available via the API, `defaultValues` will be overwritten. |
| `onEvent`       | `(eventType: string, data?: unknown) => void`                        | Yes      | Callback invoked when events are emitted.                                                                                                         |

## Events

| Event                           | Description                                              | Data                                                                                                                                                  |
| ------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_FEDERAL_TAXES_UPDATED` | Fired when federal tax details are successfully updated. | [Response from the update federal tax details API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-federal_tax_details) |
| `COMPANY_FEDERAL_TAXES_DONE`    | Fired when the federal tax update process is complete.   | None                                                                                                                                                  |
