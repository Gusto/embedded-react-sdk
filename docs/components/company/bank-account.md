---
title: Company.BankAccount
sidebar_position: 11
---

Manages company bank account setup and verification. Handles creating a new bank account, viewing existing accounts, and verifying accounts via micro-deposits.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.BankAccount
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                                                                                                                   |
| --------------- | --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                                                                                                            |
| `defaultValues` | `object`                                      | No       | Default values for bank account form fields. **Note:** This prop is accepted by the type definition but is not currently forwarded by the BankAccount orchestrator component. |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                                                                                                                     |

## Events

| Event                           | Description                                                                         | Data                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_BANK_ACCOUNT_CHANGE`   | Fired when a user chooses to change the existing bank account.                      | None                                                                                                                                                    |
| `COMPANY_BANK_ACCOUNT_CREATED`  | Fired when a new bank account is created.                                           | [Response from the create company bank account API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-bank-accounts)       |
| `COMPANY_BANK_ACCOUNT_VERIFY`   | Fired when a user chooses to verify a bank account (after micro-deposits are made). | None                                                                                                                                                    |
| `COMPANY_BANK_ACCOUNT_VERIFIED` | Fired when a bank account has been successfully verified.                           | [Response from the verify company bank account API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-bank-accounts-verify) |
| `COMPANY_BANK_ACCOUNT_DONE`     | Fired when the user chooses to proceed to the next step.                            | None                                                                                                                                                    |
