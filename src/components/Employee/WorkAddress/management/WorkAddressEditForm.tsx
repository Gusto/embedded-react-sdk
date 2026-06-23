import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2026-02-01/models/components/employeeworkaddress'
import { WorkAddressView } from './WorkAddressView'
import {
  isUseWorkAddressManagementSuccess,
  useWorkAddressManagement,
} from './useWorkAddressManagement'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link WorkAddressEditForm}.
 *
 * @public
 */
export interface WorkAddressEditFormProps extends CommonComponentInterface<'Employee.Management.WorkAddress'> {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired on form save, cancel, and delete actions. */
  onEvent: BaseComponentInterface['onEvent']
}

function WorkAddressEditFormRoot({ employeeId, dictionary, onEvent }: WorkAddressEditFormProps) {
  useI18n(['Employee.Management.WorkAddress'])
  useComponentDictionary('Employee.Management.WorkAddress', dictionary)

  const management = useWorkAddressManagement({ employeeId, onEvent })

  if (management.isLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  if (!isUseWorkAddressManagementSuccess(management)) {
    return <BaseLayout error={management.errorHandling.errors} />
  }

  const handleWorkAddressSaved = (result: HookSubmitResult<EmployeeWorkAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={management.errorHandling.errors}>
      <WorkAddressView
        editWorkAddressForm={management.data.editWorkAddressForm}
        changeWorkAddressForm={management.data.changeWorkAddressForm}
        workAddresses={management.data.employeeWorkAddresses}
        editTargetUuid={management.data.editTargetUuid}
        onEditTargetUuidChange={management.actions.setEditTargetUuid}
        employeeDisplayName={management.data.employeeDisplayName}
        onConfirmDelete={management.actions.confirmDeleteWorkAddress}
        onWorkAddressSaved={handleWorkAddressSaved}
        onBack={() => {
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED)
        }}
        isDeletePending={management.status.isDeletePending}
      />
    </BaseLayout>
  )
}

/**
 * Standalone employee work address edit form for creating, updating, and deleting addresses.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/management/workAddress/created` | A new work address was created | {@link EmployeeWorkAddress} |
 * | `employee/management/workAddress/updated` | An existing work address was updated | {@link EmployeeWorkAddress} |
 * | `employee/management/workAddress/deleted` | A work address was deleted | {@link EmployeeWorkAddress} |
 * | `employee/management/workAddress/editCancelled` | User backed out of the edit form | — |
 *
 * @public
 */
export function WorkAddressEditForm({
  FallbackComponent,
  ...props
}: WorkAddressEditFormProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      componentName="Employee.Management.WorkAddress"
      FallbackComponent={FallbackComponent}
    >
      <WorkAddressEditFormRoot {...props} />
    </BaseBoundaries>
  )
}
