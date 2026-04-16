import { useMemo } from 'react'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { HomeAddressView } from './HomeAddressView'
import { useHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { componentEvents } from '@/shared/constants'

export interface HomeAddressProps extends CommonComponentInterface<'Employee.HomeAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function HomeAddressRoot({ employeeId, onEvent, dictionary }: HomeAddressProps) {
  useI18n(['Employee.HomeAddress.Management', 'Employee.HomeAddress'])
  useComponentDictionary('Employee.HomeAddress.Management', dictionary)
  const editHomeAddressForm = useHomeAddressForm({
    employeeId,
    submissionMode: 'alwaysUpdate',
    withEffectiveDateField: false,
    defaultValuesStrategy: 'current',
  })
  const createHomeAddressForm = useHomeAddressForm({
    employeeId,
    submissionMode: 'alwaysCreate',
    withEffectiveDateField: true,
    defaultValuesStrategy: 'empty',
  })

  const employeeQuery = useEmployeesGet({ employeeId }, { enabled: !!employeeId })
  const employeeDisplayName = useMemo(() => {
    const employee = employeeQuery.data?.employee
    if (!employee) {
      return ''
    }
    return firstLastName({
      first_name: employee.firstName,
      last_name: employee.lastName,
    }).trim()
  }, [employeeQuery.data?.employee])

  if (editHomeAddressForm.isLoading || createHomeAddressForm.isLoading) {
    return <BaseLayout isLoading error={editHomeAddressForm.errorHandling.errors} />
  }

  const handleSaved = (result: HookSubmitResult<EmployeeAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={editHomeAddressForm.errorHandling.errors}>
      <HomeAddressView
        editHomeAddressForm={editHomeAddressForm}
        createHomeAddressForm={createHomeAddressForm}
        employeeDisplayName={employeeDisplayName}
        onSaved={handleSaved}
        onHistoryRowEdit={address => {
          onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_HISTORY_EDIT, address)
        }}
        onHistoryRowDelete={address => {
          onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_HISTORY_DELETE, address)
        }}
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
