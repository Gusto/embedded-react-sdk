import { Suspense } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseLayout } from '@/components/Base/Base'
import { composeSubmitHandler } from '@/partner-hook-utils/form/composeSubmitHandler'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { useEmployeeDetailsForm } from '@/components/Employee/Profile/shared/useEmployeeDetailsForm'
import { useCurrentHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'

interface EmployeeDetailsAndAddressCombinedProps {
  companyId: string
  employeeId: string
  onEvent: (event: string, payload?: unknown) => void
}

function EmployeeDetailsAndAddressCombinedRoot({
  companyId,
  employeeId,
  onEvent,
}: EmployeeDetailsAndAddressCombinedProps) {
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
        <DetailsFields.FirstName formHookResult={employeeDetails} label="First name" />
        <AddressFields.Street1 formHookResult={homeAddress} label="Street" />
        <DetailsFields.MiddleInitial formHookResult={employeeDetails} label="Middle initial" />
        <AddressFields.Street2 formHookResult={homeAddress} label="Apt, suite, etc." />
        <DetailsFields.LastName formHookResult={employeeDetails} label="Last name" />
        <AddressFields.City formHookResult={homeAddress} label="City" />
        <DetailsFields.Email formHookResult={employeeDetails} label="Email" />
        <AddressFields.State formHookResult={homeAddress} label="State" />
        <DetailsFields.DateOfBirth formHookResult={employeeDetails} label="Date of birth" />
        <AddressFields.Zip formHookResult={homeAddress} label="ZIP code" />
        <DetailsFields.Ssn formHookResult={employeeDetails} label="SSN" />

        <Components.Button type="submit" variant="primary">
          Save all
        </Components.Button>
      </form>
    </BaseLayout>
  )
}

export function EmployeeDetailsAndAddressCombined(props: EmployeeDetailsAndAddressCombinedProps) {
  return (
    <Suspense>
      <EmployeeDetailsAndAddressCombinedRoot {...props} />
    </Suspense>
  )
}
