import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
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
import { componentEvents } from '@/shared/constants'

export interface HomeAddressProps extends CommonComponentInterface<'Employee.HomeAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function HomeAddressRoot({ employeeId, onEvent, dictionary }: HomeAddressProps) {
  useI18n(['Employee.HomeAddress.Management', 'Employee.HomeAddress'])
  useComponentDictionary('Employee.HomeAddress.Management', dictionary)
  const homeAddressForm = useHomeAddressForm({ employeeId })

  if (homeAddressForm.isLoading) {
    return <BaseLayout isLoading error={homeAddressForm.errorHandling.errors} />
  }

  const handleSaved = (result: HookSubmitResult<EmployeeAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, result.data)
    }
  }

  return (
    <BaseLayout error={homeAddressForm.errorHandling.errors}>
      <HomeAddressView
        homeAddressForm={homeAddressForm}
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
