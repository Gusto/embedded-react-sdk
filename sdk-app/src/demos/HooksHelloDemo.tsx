import { GustoProvider, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { Button, Loading, interfaceLibComponents } from '../InterfaceLib'
import { BASE_URL, COMPANY_ID, EMPLOYEE_ID } from './config'

function EmployeeDetailsForm() {
  const employeeDetails = useEmployeeDetailsForm({
    companyId: COMPANY_ID,
    employeeId: EMPLOYEE_ID,
  })

  if (employeeDetails.isLoading) {
    return (
      <div style={{ maxWidth: '480px' }}>
        <Loading />
      </div>
    )
  }

  const { Fields } = employeeDetails.form

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void employeeDetails.actions.onSubmit()
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}
    >
      <Fields.FirstName
        label="First name"
        formHookResult={employeeDetails}
        validationMessages={{
          REQUIRED: 'First name is required',
          INVALID_NAME: 'Enter a valid first name',
        }}
      />
      <Fields.LastName
        label="Last name"
        formHookResult={employeeDetails}
        validationMessages={{
          REQUIRED: 'Last name is required',
          INVALID_NAME: 'Enter a valid last name',
        }}
      />
      <Fields.Email
        label="Personal email"
        formHookResult={employeeDetails}
        validationMessages={{
          REQUIRED: 'Email is required',
          INVALID_EMAIL: 'Enter a valid email address',
          EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'Email is required when self-onboarding is enabled',
        }}
      />
      <Button type="submit" isLoading={employeeDetails.status.isPending}>
        Save
      </Button>
    </form>
  )
}

export default function HooksHelloDemo() {
  return (
    <GustoProvider config={{ baseUrl: BASE_URL }} components={interfaceLibComponents}>
      <EmployeeDetailsForm />
    </GustoProvider>
  )
}
