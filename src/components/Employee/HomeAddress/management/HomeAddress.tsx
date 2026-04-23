import { useMemo, useState } from 'react'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesDeleteMutation } from '@gusto/embedded-api/react-query/employeeAddressesDelete'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { HomeAddressView } from './HomeAddressView'
import { useHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useI18n, useComponentDictionary } from '@/i18n'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookSubmitResult } from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents } from '@/shared/constants'

export interface HomeAddressProps extends CommonComponentInterface<'Employee.HomeAddress.Management'> {
  employeeId: string
  onEvent: BaseComponentInterface['onEvent']
}

function HomeAddressRoot({ employeeId, onEvent, dictionary }: HomeAddressProps) {
  useI18n(['Employee.HomeAddress.Management', 'Employee.HomeAddress'])
  useComponentDictionary('Employee.HomeAddress.Management', dictionary)

  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.HomeAddress.Management')
  const deleteHomeAddressMutation = useEmployeeAddressesDeleteMutation()

  const [editTargetUuid, setEditTargetUuid] = useState<string | undefined>(undefined)

  const homeAddressesQuery = useEmployeeAddressesGet({ employeeId })
  const employeeHomeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress =
    employeeHomeAddresses?.find(a => a.active) ?? employeeHomeAddresses?.[0]

  const homeAddressUuidForEdit = editTargetUuid ?? currentHomeAddress?.uuid

  const editHomeAddressForm = useHomeAddressForm({
    employeeId,
    homeAddressUuid: homeAddressUuidForEdit,
    withEffectiveDateField: false,
  })
  const createHomeAddressForm = useHomeAddressForm({
    employeeId,
    homeAddressUuid: undefined,
    withEffectiveDateField: true,
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

  const errorHandling = composeErrorHandler(
    [employeeQuery, homeAddressesQuery, editHomeAddressForm, createHomeAddressForm],
    { submitError: rootSubmitError, setSubmitError: setRootSubmitError },
  )

  if (employeeQuery.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  if (employeeQuery.isError) {
    return <BaseLayout error={errorHandling.errors} />
  }

  if (editHomeAddressForm.isLoading || createHomeAddressForm.isLoading) {
    return <BaseLayout isLoading error={errorHandling.errors} />
  }

  const handleSaved = (result: HookSubmitResult<EmployeeAddress>) => {
    if (result.mode === 'create') {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, result.data)
    } else {
      onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, result.data)
    }
  }

  const handleConfirmDelete = async (homeAddressUuid: string): Promise<boolean> => {
    const snapshot = employeeHomeAddresses?.find(a => a.uuid === homeAddressUuid) ?? null

    let succeeded = false
    await baseSubmitHandler(
      { homeAddressUuid, snapshot },
      async ({ homeAddressUuid: uuid, snapshot: snap }) => {
        const target = employeeHomeAddresses?.find(a => a.uuid === uuid)
        if (!target) {
          throw new SDKInternalError('Home address not found')
        }
        if (target.active === true) {
          throw new SDKInternalError('Cannot delete the active home address')
        }

        await deleteHomeAddressMutation.mutateAsync({
          request: { homeAddressUuid: uuid },
        })
        succeeded = true
        if (snap) {
          onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_DELETED, snap)
        }
      },
    )
    return succeeded
  }

  return (
    <BaseLayout error={errorHandling.errors}>
      <HomeAddressView
        editHomeAddressForm={editHomeAddressForm}
        createHomeAddressForm={createHomeAddressForm}
        employeeHomeAddresses={employeeHomeAddresses}
        employeeDisplayName={employeeDisplayName}
        editingHomeAddressUuid={homeAddressUuidForEdit}
        onEditAddressTargetChange={setEditTargetUuid}
        onSaved={handleSaved}
        onConfirmDelete={handleConfirmDelete}
        isDeletePending={deleteHomeAddressMutation.isPending}
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
