import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeworkaddress'
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

export interface WorkAddressEditFormProps extends CommonComponentInterface<'Employee.Management.WorkAddress'> {
  employeeId: string
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
