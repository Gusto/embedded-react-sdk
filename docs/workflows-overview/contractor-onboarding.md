---
title: Contractor Profile Component
order: 2
---

# Contractor Profile Component

The `ContractorProfile` component provides a comprehensive form for creating and editing contractor profiles. It supports both individual contractors and business contractors, with different field sets for each type.

## Features

- **Contractor Type Selection**: Toggle between Individual and Business contractor types
- **Conditional Fields**: Different form fields based on contractor type:
  - Individual: First name, middle initial, last name, social security number
  - Business: Business name, Federal EIN
- **Wage Type Options**: Hourly or Fixed wage types
- **Conditional Wage Fields**: Hourly rate field appears only for hourly contractors
- **Self-Onboarding Toggle**: Option to invite contractors to fill in their own details
- **Email Integration**: Email field for contractor invitations
- **Form Validation**: Comprehensive validation using Zod schema
- **Responsive Design**: Mobile-friendly form layout

## Usage

```tsx
import { ContractorProfile } from '@/components/Contractor'

function MyComponent() {
  return (
    <ContractorProfile
      companyId="company-123"
      onEvent={(event, data) => {
        if (event === 'contractor/profile/submitted') {
          console.log('Contractor profile submitted:', data)
        }
      }}
    />
  )
}
```

## Props

| Prop            | Type                                 | Required | Description                                            |
| --------------- | ------------------------------------ | -------- | ------------------------------------------------------ |
| `companyId`     | `string`                             | Yes      | The company ID for the contractor profile              |
| `contractorId`  | `string`                             | No       | Optional contractor ID for editing existing contractor |
| `defaultValues` | `Partial<ContractorProfileFormData>` | No       | Default form values                                    |
| `onEvent`       | `function`                           | No       | Event handler for form events                          |

## Form Fields

### Common Fields

- **Invite Contractor**: Toggle to enable contractor self-onboarding
- **Contractor Email**: Email address (required when invite is enabled)
- **Start Date**: Contractor's first day of work

### Individual Contractor Fields

- **Legal First Name**: Required
- **Middle Initial**: Optional
- **Legal Last Name**: Required
- **Social Security Number**: Required, format: XXX-XX-XXXX

### Business Contractor Fields

- **Business Name**: Required
- **Federal EIN**: Required, format: XX-XXXXXXX

### Wage Type Fields

- **Wage Type**: Radio selection between Hourly and Fixed
- **Hourly Rate**: Required for hourly contractors, number input with validation

## Events

The component emits the following events:

- `contractor/profile/submitted`: When the form is successfully submitted
- `CANCEL`: When the user cancels the form

## Validation

The component uses Zod for form validation with the following rules:

- Email validation for contractor email field
- Required field validation for all mandatory fields
- Format validation for SSN (XXX-XX-XXXX) and EIN (XX-XXXXXXX)
- Positive number validation for hourly rate
- Conditional validation based on contractor type and wage type

## Example with Default Values

```tsx
<ContractorProfile
  companyId="company-123"
  defaultValues={{
    inviteContractor: true,
    contractorEmail: 'contractor@example.com',
    type: 'individual',
    firstName: 'John',
    lastName: 'Doe',
    wageType: 'hourly',
    hourlyRate: 50.0,
  }}
/>
```
