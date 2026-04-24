import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { WorkAddressView } from './WorkAddressView'
import {
  isUseWorkAddressManagementMissingCompany,
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
import { normalizeToSDKError, SDKInternalError } from '@/types/sdkError'
import { componentEvents } from '@/shared/constants'

export interface WorkAddressProps extends CommonComponentInterface<'Employee.WorkAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function WorkAddressRoot({ employeeId, dictionary, onEvent }: WorkAddressProps) {
  useI18n(['Employee.WorkAddress.Management'])
  useComponentDictionary('Employee.WorkAddress.Management', dictionary)

  const management = useWorkAddressManagement({ employeeId, onEvent })

  if (management.isLoading) {
    return <BaseLayout isLoading error={management.errorHandling.errors} />
  }

  if (isUseWorkAddressManagementMissingCompany(management)) {
    return (
      <BaseLayout
        error={normalizeToSDKError(
          new SDKInternalError(
            'Employee record is missing companyUuid, which is required to load work address locations.',
          ),
        )}
      />
    )
  }

  if (!isUseWorkAddressManagementSuccess(management)) {
    return <BaseLayout error={management.errorHandling.errors} />
  }

  const handleWorkAddressSaved = (result: HookSubmitResult<EmployeeWorkAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={management.errorHandling.errors}>
      <WorkAddressView
        editWorkAddressForm={management.data.editWorkAddressForm}
        changeWorkAddressForm={management.data.changeWorkAddressForm}
        editTargetUuid={management.data.editTargetUuid}
        onEditTargetUuidChange={management.actions.setEditTargetUuid}
        employeeDisplayName={management.data.employeeDisplayName}
        onConfirmDelete={management.actions.confirmDeleteWorkAddress}
        onWorkAddressSaved={handleWorkAddressSaved}
        isDeletePending={management.status.isDeletePending}
      />
    </BaseLayout>
  )
}

export function WorkAddress({
  FallbackComponent,
  ...props
}: WorkAddressProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      componentName="Employee.WorkAddress.Management"
      FallbackComponent={FallbackComponent}
    >
      <WorkAddressRoot {...props} />
    </BaseBoundaries>
  )
}
