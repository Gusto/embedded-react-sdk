import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { WorkAddressView } from './WorkAddressView'
import { useWorkAddressForm } from '@/components/Employee/Profile/shared/useWorkAddressForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { normalizeToSDKError, SDKInternalError } from '@/types/sdkError'

export interface WorkAddressProps extends CommonComponentInterface<'Employee.WorkAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function WorkAddressRoot({ employeeId, dictionary }: WorkAddressProps) {
  useI18n(['Employee.WorkAddress.Management'])
  useComponentDictionary('Employee.WorkAddress.Management', dictionary)

  const employeeQuery = useEmployeesGet({ employeeId }, { enabled: !!employeeId })
  const companyId = employeeQuery.data?.employee?.companyUuid

  const workAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    withEffectiveDateField: false,
  })

  const errorHandling = composeErrorHandler([employeeQuery, workAddressForm])

  if (employeeQuery.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  if (employeeQuery.isError) {
    return <BaseLayout error={errorHandling.errors} />
  }

  if (employeeQuery.data?.employee && !employeeQuery.data.employee.companyUuid) {
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

  if (workAddressForm.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  return (
    <BaseLayout error={errorHandling.errors}>
      <WorkAddressView workAddressForm={workAddressForm} />
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
