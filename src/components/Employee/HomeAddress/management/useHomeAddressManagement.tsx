import { useMemo, useState } from 'react'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesDeleteMutation } from '@gusto/embedded-api/react-query/employeeAddressesDelete'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import type { OnEventType } from '@/components/Base/useBase'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import type { UseHomeAddressFormResult } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { HookErrorHandling } from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents, type EventType } from '@/shared/constants'

export interface UseHomeAddressManagementParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UseHomeAddressManagementResult {
  employeeDisplayName: string
  employeeHomeAddresses: EmployeeAddress[] | undefined
  editingHomeAddressUuid: string | undefined
  editHomeAddressForm: UseHomeAddressFormResult
  createHomeAddressForm: UseHomeAddressFormResult
  errorHandling: HookErrorHandling
  isEmployeeLoading: boolean
  isEmployeeError: boolean
  isFormsLoading: boolean
  setEditAddressTarget: (homeAddressUuid: string | undefined) => void
  confirmDeleteHomeAddress: (homeAddressUuid: string) => Promise<boolean>
  isDeletePending: boolean
}

export function useHomeAddressManagement({
  employeeId,
  onEvent,
}: UseHomeAddressManagementParams): UseHomeAddressManagementResult {
  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.HomeAddress.Management')
  const deleteHomeAddressMutation = useEmployeeAddressesDeleteMutation()

  const [editTargetUuid, setEditAddressTarget] = useState<string | undefined>(undefined)

  const homeAddressesQuery = useEmployeeAddressesGet({ employeeId }, { enabled: !!employeeId })
  const employeeHomeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress =
    employeeHomeAddresses?.find(a => a.active) ?? employeeHomeAddresses?.[0]

  const editingHomeAddressUuid = editTargetUuid ?? currentHomeAddress?.uuid

  const editHomeAddressForm = useHomeAddressForm({
    employeeId,
    homeAddressUuid: editingHomeAddressUuid,
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

  const confirmDeleteHomeAddress = async (homeAddressUuid: string): Promise<boolean> => {
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

  return {
    employeeDisplayName,
    employeeHomeAddresses,
    editingHomeAddressUuid,
    editHomeAddressForm,
    createHomeAddressForm,
    errorHandling,
    isEmployeeLoading: employeeQuery.isLoading,
    isEmployeeError: employeeQuery.isError,
    isFormsLoading: editHomeAddressForm.isLoading || createHomeAddressForm.isLoading,
    setEditAddressTarget,
    confirmDeleteHomeAddress,
    isDeletePending: deleteHomeAddressMutation.isPending,
  }
}
