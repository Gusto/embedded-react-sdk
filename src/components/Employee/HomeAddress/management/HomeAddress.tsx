import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { HomeAddressView } from './HomeAddressView'
import { useHomeAddressManagement } from './useHomeAddressManagement'
import type { UseHomeAddressFormReady } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { componentEvents } from '@/shared/constants'

export interface HomeAddressProps extends CommonComponentInterface<'Employee.HomeAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function HomeAddressRoot({ employeeId, onEvent, dictionary }: HomeAddressProps) {
  useI18n(['Employee.HomeAddress.Management', 'Employee.HomeAddress'])
  useComponentDictionary('Employee.HomeAddress.Management', dictionary)

  const management = useHomeAddressManagement({ employeeId, onEvent })

  if (management.isEmployeeLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  if (management.isEmployeeError) {
    return <BaseLayout error={management.errorHandling.errors} />
  }

  if (management.isFormsLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  const editHomeAddressForm = management.editHomeAddressForm as UseHomeAddressFormReady
  const createHomeAddressForm = management.createHomeAddressForm as UseHomeAddressFormReady

  const handleSaved = (result: HookSubmitResult<EmployeeAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={management.errorHandling.errors}>
      <HomeAddressView
        editHomeAddressForm={editHomeAddressForm}
        createHomeAddressForm={createHomeAddressForm}
        employeeHomeAddresses={management.employeeHomeAddresses}
        employeeDisplayName={management.employeeDisplayName}
        editingHomeAddressUuid={management.editingHomeAddressUuid}
        onEditAddressTargetChange={management.setEditAddressTarget}
        onSaved={handleSaved}
        onConfirmDelete={management.confirmDeleteHomeAddress}
        isDeletePending={management.isDeletePending}
      />
    </BaseLayout>
  )
}

export function HomeAddress({
  FallbackComponent,
  ...props
}: HomeAddressProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      componentName="Employee.HomeAddress.Management"
      FallbackComponent={FallbackComponent}
    >
      <HomeAddressRoot {...props} />
    </BaseBoundaries>
  )
}
