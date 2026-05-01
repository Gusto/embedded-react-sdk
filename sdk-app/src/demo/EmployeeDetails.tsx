import { Suspense } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useEmployeeDetailsForm } from '@/components/Employee/Profile/shared/useEmployeeDetailsForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'

interface EmployeeDetailsProps {
  companyId: string
  employeeId: string
  onEvent: (event: string, payload?: unknown) => void
}

function EmployeeDetailsRoot({ companyId, employeeId, onEvent }: EmployeeDetailsProps) {
  const Components = useComponentContext()
  const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })

  if (employeeDetails.isLoading) {
    const loadingErrorHandling = composeErrorHandler([employeeDetails])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const DetailsFields = employeeDetails.form.Fields

  return (
    <BaseLayout error={employeeDetails.errorHandling.errors}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await employeeDetails.actions.onSubmit({
            onEmployeeUpdated: (employee: Employee) => {
              onEvent('employee:updated', employee)
            },
            onEmployeeCreated: (employee: Employee) => {
              onEvent('employee:created', employee)
            },
          })
        }}
      >
        <SDKFormProvider formHookResult={employeeDetails}>
          <DetailsFields.FirstName label="First name" />
          <DetailsFields.MiddleInitial label="Middle initial" />
          <DetailsFields.LastName label="Last name" />
          <DetailsFields.Email label="Email" />
          <DetailsFields.DateOfBirth label="Date of birth" />
          <DetailsFields.Ssn label="SSN" />
        </SDKFormProvider>
        <Components.Button type="submit" variant="primary">
          Save
        </Components.Button>
      </form>
    </BaseLayout>
  )
}

export function EmployeeDetails(props: EmployeeDetailsProps) {
  return (
    <Suspense>
      <EmployeeDetailsRoot {...props} />
    </Suspense>
  )
}
