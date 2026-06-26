import type { EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import { HomeAddressView } from './HomeAddressView'
import {
  isUseHomeAddressManagementSuccess,
  useHomeAddressManagement,
} from './useHomeAddressManagement'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link HomeAddressEditForm}.
 *
 * @public
 */
export interface HomeAddressEditFormProps extends BaseComponentInterface<'Employee.Management.HomeAddress'> {
  /** The associated employee identifier. */
  employeeId: string
}

function HomeAddressEditFormRoot({ employeeId, onEvent, dictionary }: HomeAddressEditFormProps) {
  useI18n('Employee.Management.HomeAddress')
  useComponentDictionary('Employee.Management.HomeAddress', dictionary)

  const management = useHomeAddressManagement({ employeeId, onEvent })

  if (management.isLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  if (!isUseHomeAddressManagementSuccess(management)) {
    return <BaseLayout error={management.errorHandling.errors} />
  }

  const handleSaved = (result: HookSubmitResult<EmployeeAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_UPDATED, result.data)
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
        onBack={() => {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_EDIT_CANCELLED)
        }}
        isDeletePending={management.status.isDeletePending}
      />
    </BaseLayout>
  )
}

/**
 * Standalone employee home address edit form for creating, updating, and deleting addresses.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/homeAddress/created` | A new home address was created | {@link EmployeeAddress} |
 * | `employee/management/homeAddress/updated` | An existing home address was updated | {@link EmployeeAddress} |
 * | `employee/management/homeAddress/deleted` | A home address was deleted | {@link EmployeeAddress} |
 * | `employee/management/homeAddress/editCancelled` | User backed out of the edit form | — |
 *
 * @public
 */
export function HomeAddressEditForm({ FallbackComponent, ...props }: HomeAddressEditFormProps) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.HomeAddress"
      FallbackComponent={FallbackComponent}
    >
      <HomeAddressEditFormRoot {...props} />
    </BaseBoundaries>
  )
}
