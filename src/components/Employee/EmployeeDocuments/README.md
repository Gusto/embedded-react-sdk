# EmployeeDocuments Component

## Overview
The `EmployeeDocuments` component allows partners to configure which documents an employee will sign during the onboarding process. It provides three distinct views based on whether the employee is self-onboarding and whether they should complete Form I-9.

## Props

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `employeeId` | `string` | Yes | The UUID of the employee |
| `isSelfOnboarding` | `boolean` | Yes | Whether the employee is self-onboarding |
| `onEvent` | `OnEventType` | Yes | Callback function for events |
| `dictionary` | `object` | No | Custom translations dictionary |

## States

### 1. Self-Onboarding (with I-9 option)
When `isSelfOnboarding={true}`, the component displays:
- A list of automatically included documents (W-4, federal withholding, direct deposit)
- A checkbox to opt-in to including Form I-9
- A conditional alert that changes based on checkbox state:
  - **Checked**: Info alert explaining the I-9 verification process
  - **Unchecked**: Warning alert asking if Form I-9 was completed already

### 2. Not Self-Onboarding (Admin-driven)
When `isSelfOnboarding={false}`, the component displays:
- Information about manually signing forms
- A list of required documents including employment eligibility (Form I-9)
- An info alert about government requirements

## Events

The component emits the following events:

- `EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED`: Fired when the I-9 configuration is successfully updated
- `EMPLOYEE_DOCUMENTS_CONTINUE`: Fired when the user clicks Continue

## API Integration

The component uses the `useEmployeesUpdateOnboardingDocumentsConfigMutation` hook to update the employee's onboarding documents configuration via the Gusto API endpoint:

```
PUT /v1/employees/{employee_id}/onboarding_documents_config
```

## Usage Example

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  const handleEvent = (event, data) => {
    console.log('Event:', event, data)
  }

  return (
    <Employee.EmployeeDocuments
      employeeId="employee-uuid"
      isSelfOnboarding={true}
      onEvent={handleEvent}
    />
  )
}
```

## Integration with OnboardingFlow

This component is designed to be integrated into the `OnboardingFlow` component as a step in the employee onboarding process. It should be placed after the Profile step and before other onboarding steps like taxes and payment methods.

## Files Created

- `src/components/Employee/EmployeeDocuments/EmployeeDocuments.tsx` - Main component
- `src/components/Employee/EmployeeDocuments/EmployeeDocuments.module.scss` - Styles
- `src/components/Employee/EmployeeDocuments/EmployeeDocuments.test.tsx` - Tests
- `src/components/Employee/EmployeeDocuments/EmployeeDocuments.stories.tsx` - Storybook stories
- `src/components/Employee/EmployeeDocuments/index.ts` - Barrel export
- `src/i18n/en/Employee.EmployeeDocuments.json` - Translations

## Next Steps

To integrate this component into the OnboardingFlow:

1. Add it to the onboarding state machine
2. Wire up the events to navigate to the next step
3. Update the flow logic to determine when to show this component based on the employee's onboarding status
