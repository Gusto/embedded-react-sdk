import { useMemo, useState } from 'react'
import type { EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesDeleteMutation } from '@gusto/embedded-api/react-query/employeeAddressesDelete'
import { useEmployeeAddressesGet } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import type { OnEventType } from '@/components/Base/useBase'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useHomeAddressForm } from '@/components/Employee/Profile/shared/useHomeAddressForm'
import type {
  UseHomeAddressFormReady,
  UseHomeAddressFormResult,
} from '@/components/Employee/Profile/shared/useHomeAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseHookReady,
  HookErrorHandling,
  HookLoadingResult,
} from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents, type EventType } from '@/shared/constants'

export interface UseHomeAddressManagementParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UseHomeAddressManagementDataPendingForms extends Record<string, unknown> {
  employeeDisplayName: string
  employeeHomeAddresses: EmployeeAddress[] | undefined
  editingHomeAddressUuid: string | undefined
  editHomeAddressForm: UseHomeAddressFormResult
  createHomeAddressForm: UseHomeAddressFormResult
}

export interface UseHomeAddressManagementDataReady extends Record<string, unknown> {
  employeeDisplayName: string
  employeeHomeAddresses: EmployeeAddress[] | undefined
  editingHomeAddressUuid: string | undefined
  editHomeAddressForm: UseHomeAddressFormReady
  createHomeAddressForm: UseHomeAddressFormReady
}

export interface UseHomeAddressManagementStatusEmployeeError extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: true
}

export interface UseHomeAddressManagementStatusSuccess extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: false
}

export interface UseHomeAddressManagementActions {
  setEditAddressTarget: (homeAddressUuid: string | undefined) => void
  confirmDeleteHomeAddress: (homeAddressUuid: string) => Promise<boolean>
}

export interface UseHomeAddressManagementReadyEmployeeError extends BaseHookReady<
  UseHomeAddressManagementDataPendingForms,
  UseHomeAddressManagementStatusEmployeeError
> {
  actions: UseHomeAddressManagementActions
}

export interface UseHomeAddressManagementReadySuccess extends BaseHookReady<
  UseHomeAddressManagementDataReady,
  UseHomeAddressManagementStatusSuccess
> {
  actions: UseHomeAddressManagementActions
}

export type UseHomeAddressManagementReady =
  | UseHomeAddressManagementReadyEmployeeError
  | UseHomeAddressManagementReadySuccess

export type UseHomeAddressManagementResult = HookLoadingResult | UseHomeAddressManagementReady

export function isUseHomeAddressManagementSuccess(
  value: UseHomeAddressManagementResult,
): value is UseHomeAddressManagementReadySuccess {
  if (value.isLoading) {
    return false
  }
  return !value.status.isEmployeeError
}

function homeAddressFormsReady(
  editHomeAddressForm: UseHomeAddressFormResult,
  createHomeAddressForm: UseHomeAddressFormResult,
): Pick<UseHomeAddressManagementDataReady, 'editHomeAddressForm' | 'createHomeAddressForm'> {
  if (editHomeAddressForm.isLoading) {
    throw new SDKInternalError('Edit home address form is still loading')
  }
  if (createHomeAddressForm.isLoading) {
    throw new SDKInternalError('Create home address form is still loading')
  }
  return {
    editHomeAddressForm,
    createHomeAddressForm,
  }
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

  const errorHandling: HookErrorHandling = composeErrorHandler(
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

  const actions: UseHomeAddressManagementActions = {
    setEditAddressTarget,
    confirmDeleteHomeAddress,
  }

  const dataPayloadPendingForms: UseHomeAddressManagementDataPendingForms = {
    employeeDisplayName,
    employeeHomeAddresses,
    editingHomeAddressUuid,
    editHomeAddressForm,
    createHomeAddressForm,
  }

  if (employeeQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  if (employeeQuery.isError) {
    return {
      isLoading: false,
      data: dataPayloadPendingForms,
      status: {
        isDeletePending: deleteHomeAddressMutation.isPending,
        isEmployeeError: true,
      },
      errorHandling,
      actions,
    }
  }

  const isFormsLoading = editHomeAddressForm.isLoading || createHomeAddressForm.isLoading
  if (isFormsLoading) {
    return { isLoading: true, errorHandling }
  }

  const { editHomeAddressForm: editReady, createHomeAddressForm: createReady } =
    homeAddressFormsReady(editHomeAddressForm, createHomeAddressForm)

  const dataReady: UseHomeAddressManagementDataReady = {
    employeeDisplayName,
    employeeHomeAddresses,
    editingHomeAddressUuid,
    editHomeAddressForm: editReady,
    createHomeAddressForm: createReady,
  }

  return {
    isLoading: false,
    data: dataReady,
    status: {
      isDeletePending: deleteHomeAddressMutation.isPending,
      isEmployeeError: false,
    },
    errorHandling,
    actions,
  }
}
