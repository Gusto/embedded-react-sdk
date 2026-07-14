---
title: Configuring form fields
description: Tune form-hook field behavior — required fields, default values, and validation messages.
order: 1
---

Form hooks expose several ways to control field behavior — which fields are required, what values they start with, and how validation errors read.

## Required Fields

Hooks let you declare which form fields are required beyond the built-in defaults. Each hook has built-in requiredness rules based on the form mode (create vs. update), and you can override optional fields to be required.

The API varies by hook. Some hooks use `requiredFields` (flat array or per-mode object), while newer hooks use `optionalFieldsToRequire` with type-safe, mode-aware overrides.

### `requiredFields` (useEmployeeDetailsForm, useWorkAddressForm)

Pass a flat array (applies to both modes) or an object with per-mode arrays:

```tsx
// Flat array: same requirements for both create and update
useEmployeeDetailsForm({
  companyId,
  requiredFields: ['email', 'dateOfBirth'],
})

// Per-mode object: different requirements per mode
useEmployeeDetailsForm({
  companyId,
  requiredFields: {
    create: ['email'],
    update: ['ssn', 'dateOfBirth'],
  },
})
```

### `optionalFieldsToRequire` (useJobForm, useCompensationForm)

Override specific fields that are optional in a given mode to be required. The type constrains which fields can be listed per mode — only fields that are actually optional in that mode are allowed:

```tsx
useJobForm({
  employeeId,
  jobId,
  optionalFieldsToRequire: {
    update: ['title'],
  },
})

useCompensationForm({
  employeeId,
  jobId,
  compensationId,
  optionalFieldsToRequire: {
    update: ['rate'],
  },
})
```

Each hook's reference page documents which fields are available to require and which are required by default in each mode.

---

## Default Values

All form hooks accept a `defaultValues` prop to pre-fill the form. Pass a partial object matching the hook's form data shape — any fields you omit use built-in fallbacks (typically empty strings or `false`).

```tsx
useEmployeeDetailsForm({
  companyId,
  defaultValues: {
    firstName: 'Jane',
    email: 'jane@acme.com',
  },
})

useJobForm({
  employeeId,
  defaultValues: {
    title: 'Software Engineer',
    hireDate: '2025-01-15',
  },
})

useCompensationForm({
  defaultValues: {
    rate: 85000,
    paymentUnit: 'Year',
    flsaStatus: 'Exempt',
    effectiveDate: '2025-01-15',
  },
})
```

### Resolution order

In **create mode** (no existing entity), `defaultValues` populate the form directly. In **update mode**, server data always takes precedence — `defaultValues` only fill in fields the server doesn't provide.

Each hook's reference page documents the full form data shape accepted by `defaultValues`.

---

## Validation Messages

Each field component accepts a `validationMessages` prop that maps error codes to human-readable strings. Error codes are defined as typed constants, and TypeScript enforces that you provide a message for every code the field can produce.

```tsx
import { EmployeeDetailsErrorCodes } from '@gusto/embedded-react-sdk'

<Fields.FirstName
  label="First name"
  validationMessages={{
    REQUIRED: 'First name is required',
    INVALID_NAME: 'Enter a valid first name',
  }}
/>

<Fields.Email
  label="Email"
  validationMessages={{
    REQUIRED: 'Email is required',
    INVALID_EMAIL: 'Please enter a valid email address',
  }}
/>
```

If you omit `validationMessages`, validation still runs and the field is marked as invalid, but the displayed text falls back to the raw error code (e.g., `REQUIRED`, `INVALID_EMAIL`, `INVALID_AMOUNT`). Always supply `validationMessages` for production UI so you control the user-facing copy.

Error codes for each hook are exported alongside the hook — check each hook's [reference page](../../reference/hooks.md) for the full list of codes per field.
