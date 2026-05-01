import { Suspense } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseLayout } from '@/components/Base/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useEmployeeDetailsForm } from '@/components/Employee/Profile/shared/useEmployeeDetailsForm'
import { useCurrentHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'

interface EmployeeDetailsAndAddressProps {
  companyId: string
  employeeId: string
  onEvent: (event: string, payload?: unknown) => void
}

function EmployeeDetailsAndAddressRoot({
  companyId,
  employeeId,
  onEvent,
}: EmployeeDetailsAndAddressProps) {
  const Components = useComponentContext()

  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    employeeId,
    shouldFocusError: false,
  })

  const homeAddress = useCurrentHomeAddressForm({
    employeeId,
    shouldFocusError: false,
  })

  if (employeeDetails.isLoading || homeAddress.isLoading) {
    const loadingErrorHandling = composeErrorHandler([employeeDetails, homeAddress])
    return <BaseLayout isLoading error={loadingErrorHandling.errors} />
  }

  const DetailsFields = employeeDetails.form.Fields
  const AddressFields = homeAddress.form.Fields

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [employeeDetails, homeAddress],
    async () => {
      await employeeDetails.actions.onSubmit({
        onEmployeeUpdated: (employee: Employee) => {
          onEvent('employee:updated', employee)
        },
        onEmployeeCreated: (employee: Employee) => {
          onEvent('employee:created', employee)
        },
      })
      await homeAddress.actions.onSubmit()
    },
  )

  return (
    <BaseLayout error={errorHandling.errors}>
      <form onSubmit={handleSubmit}>
        <SDKFormProvider formHookResult={employeeDetails}>
          <Components.Heading as="h3">Employee Details</Components.Heading>
          <DetailsFields.FirstName label="First name" />
          <DetailsFields.MiddleInitial label="Middle initial" />
          <DetailsFields.LastName label="Last name" />
          <DetailsFields.Email label="Email" />
          <DetailsFields.DateOfBirth label="Date of birth" />
          <DetailsFields.Ssn label="SSN" />
        </SDKFormProvider>

        <SDKFormProvider formHookResult={homeAddress}>
          <Components.Heading as="h3">Home Address</Components.Heading>
          <AddressFields.Street1 label="Street" />
          <AddressFields.Street2 label="Apt, suite, etc." />
          <AddressFields.City label="City" />
          <AddressFields.State label="State" />
          <AddressFields.Zip label="ZIP code" />
        </SDKFormProvider>

        <Components.Button type="submit" variant="primary">
          Save all
        </Components.Button>
      </form>
    </BaseLayout>
  )
}

export function EmployeeDetailsAndAddress(props: EmployeeDetailsAndAddressProps) {
  return (
    <Suspense>
      <EmployeeDetailsAndAddressRoot {...props} />
    </Suspense>
  )
}
