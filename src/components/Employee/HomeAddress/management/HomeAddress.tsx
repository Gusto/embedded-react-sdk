import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { HomeAddressView } from './HomeAddressView'
import {
  isUseHomeAddressManagementSuccess,
  useHomeAddressManagement,
} from './useHomeAddressManagement'
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

  if (management.isLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  if (!isUseHomeAddressManagementSuccess(management)) {
    return <BaseLayout error={management.errorHandling.errors} />
  }

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
        editHomeAddressForm={management.data.editHomeAddressForm}
        createHomeAddressForm={management.data.createHomeAddressForm}
        employeeHomeAddresses={management.data.employeeHomeAddresses}
        employeeDisplayName={management.data.employeeDisplayName}
        editingHomeAddressUuid={management.data.editingHomeAddressUuid}
        onEditAddressTargetChange={management.actions.setEditAddressTarget}
        onSaved={handleSaved}
        onConfirmDelete={management.actions.confirmDeleteHomeAddress}
        isDeletePending={management.status.isDeletePending}
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
