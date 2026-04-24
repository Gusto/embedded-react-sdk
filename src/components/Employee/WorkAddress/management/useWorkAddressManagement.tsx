import { useMemo, useState } from 'react'
import { useEmployeeAddressesDeleteWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesDeleteWorkAddress'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import type { OnEventType } from '@/components/Base/useBase'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useWorkAddressForm } from '@/components/Employee/Profile/shared/useWorkAddressForm'
import type {
  UseWorkAddressFormReady,
  UseWorkAddressFormResult,
} from '@/components/Employee/Profile/shared/useWorkAddressForm'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseHookReady,
  HookErrorHandling,
  HookLoadingResult,
} from '@/partner-hook-utils/types'
import { firstLastName } from '@/helpers/formattedStrings'
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents, type EventType } from '@/shared/constants'

export interface UseWorkAddressManagementParams {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
}

export interface UseWorkAddressManagementDataPendingForms extends Record<string, unknown> {
  employeeDisplayName: string
  editTargetUuid: string | undefined
  editWorkAddressForm: UseWorkAddressFormResult
  changeWorkAddressForm: UseWorkAddressFormResult
}

export interface UseWorkAddressManagementDataReady extends Record<string, unknown> {
  employeeDisplayName: string
  editTargetUuid: string | undefined
  editWorkAddressForm: UseWorkAddressFormReady
  changeWorkAddressForm: UseWorkAddressFormReady
}

export interface UseWorkAddressManagementStatusEmployeeError extends Record<string, unknown> {
  kind: 'employee_error'
  isDeletePending: boolean
}

export interface UseWorkAddressManagementStatusMissingCompany extends Record<string, unknown> {
  kind: 'missing_company'
  isDeletePending: boolean
}

export interface UseWorkAddressManagementStatusSuccess extends Record<string, unknown> {
  kind: 'success'
  isDeletePending: boolean
}

export interface UseWorkAddressManagementActions {
  setEditTargetUuid: (workAddressUuid: string | undefined) => void
  confirmDeleteWorkAddress: (workAddressUuid: string) => Promise<boolean>
}

export interface UseWorkAddressManagementReadyEmployeeError
  extends BaseHookReady<
    UseWorkAddressManagementDataPendingForms,
    UseWorkAddressManagementStatusEmployeeError
  > {
  actions: UseWorkAddressManagementActions
}

export interface UseWorkAddressManagementReadyMissingCompany
  extends BaseHookReady<
    UseWorkAddressManagementDataPendingForms,
    UseWorkAddressManagementStatusMissingCompany
  > {
  actions: UseWorkAddressManagementActions
}

export interface UseWorkAddressManagementReadySuccess
  extends BaseHookReady<UseWorkAddressManagementDataReady, UseWorkAddressManagementStatusSuccess> {
  actions: UseWorkAddressManagementActions
}

export type UseWorkAddressManagementReady =
  | UseWorkAddressManagementReadyEmployeeError
  | UseWorkAddressManagementReadyMissingCompany
  | UseWorkAddressManagementReadySuccess

export type UseWorkAddressManagementResult = HookLoadingResult | UseWorkAddressManagementReady

export function isUseWorkAddressManagementSuccess(
  value: UseWorkAddressManagementResult,
): value is UseWorkAddressManagementReadySuccess {
  if (value.isLoading) {
    return false
  }
  return value.status.kind === 'success'
}

export function isUseWorkAddressManagementMissingCompany(
  value: UseWorkAddressManagementResult,
): value is UseWorkAddressManagementReadyMissingCompany {
  if (value.isLoading) {
    return false
  }
  return value.status.kind === 'missing_company'
}

function workAddressFormsReady(
  editWorkAddressForm: UseWorkAddressFormResult,
  changeWorkAddressForm: UseWorkAddressFormResult,
): Pick<UseWorkAddressManagementDataReady, 'editWorkAddressForm' | 'changeWorkAddressForm'> {
  if (editWorkAddressForm.isLoading) {
    throw new SDKInternalError('Edit work address form is still loading')
  }
  if (changeWorkAddressForm.isLoading) {
    throw new SDKInternalError('Change work address form is still loading')
  }
  return {
    editWorkAddressForm,
    changeWorkAddressForm,
  }
}

export function useWorkAddressManagement({
  employeeId,
  onEvent,
}: UseWorkAddressManagementParams): UseWorkAddressManagementResult {
  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.WorkAddress.Management')
  const deleteWorkAddressMutation = useEmployeeAddressesDeleteWorkAddressMutation()
  const [editTargetUuid, setEditTargetUuid] = useState<string | undefined>(undefined)

  const employeeQuery = useEmployeesGet({ employeeId }, { enabled: !!employeeId })
  const companyId = employeeQuery.data?.employee?.companyUuid

  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { enabled: !!employeeId && !!companyId },
  )

  const employeeWorkAddresses = workAddressesQuery.data?.employeeWorkAddressesList

  const activeWorkAddressUuid = useMemo(() => {
    if (!employeeWorkAddresses?.length) {
      return undefined
    }
    return employeeWorkAddresses.find(w => w.active)?.uuid ?? employeeWorkAddresses[0]?.uuid
  }, [employeeWorkAddresses])

  const workAddressUuidForEdit = editTargetUuid ?? activeWorkAddressUuid

  const editInactiveRow = useMemo(() => {
    if (!editTargetUuid || !employeeWorkAddresses) {
      return undefined
    }
    return employeeWorkAddresses.find(w => w.uuid === editTargetUuid)
  }, [editTargetUuid, employeeWorkAddresses])

  const withEffectiveDateOnEdit = editInactiveRow ? editInactiveRow.active !== true : false

  const editWorkAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    workAddressUuid: workAddressUuidForEdit,
    withEffectiveDateField: withEffectiveDateOnEdit,
  })

  const changeWorkAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    withEffectiveDateField: true,
  })

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
    [employeeQuery, workAddressesQuery, editWorkAddressForm, changeWorkAddressForm],
    { submitError: rootSubmitError, setSubmitError: setRootSubmitError },
  )

  const confirmDeleteWorkAddress = async (workAddressUuid: string): Promise<boolean> => {
    const snapshot = employeeWorkAddresses?.find(w => w.uuid === workAddressUuid) ?? null

    let succeeded = false
    await baseSubmitHandler(
      { workAddressUuid, snapshot },
      async ({ workAddressUuid: uuid, snapshot: snap }) => {
        const target = employeeWorkAddresses?.find(w => w.uuid === uuid)
        if (!target) {
          throw new SDKInternalError('Work address not found')
        }
        if (target.active === true) {
          throw new SDKInternalError('Cannot delete the active work address')
        }

        await deleteWorkAddressMutation.mutateAsync({
          request: { workAddressUuid: uuid },
        })
        succeeded = true
        if (snap) {
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_DELETED, snap)
        }
      },
    )
    return succeeded
  }

  const actions: UseWorkAddressManagementActions = {
    setEditTargetUuid,
    confirmDeleteWorkAddress,
  }

  const dataPayloadPendingForms: UseWorkAddressManagementDataPendingForms = {
    employeeDisplayName,
    editTargetUuid,
    editWorkAddressForm,
    changeWorkAddressForm,
  }

  if (employeeQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  if (employeeQuery.isError) {
    return {
      isLoading: false,
      data: dataPayloadPendingForms,
      status: {
        kind: 'employee_error' as const,
        isDeletePending: deleteWorkAddressMutation.isPending,
      },
      errorHandling,
      actions,
    }
  }

  if (employeeQuery.data?.employee && !employeeQuery.data.employee.companyUuid) {
    return {
      isLoading: false,
      data: dataPayloadPendingForms,
      status: {
        kind: 'missing_company' as const,
        isDeletePending: deleteWorkAddressMutation.isPending,
      },
      errorHandling,
      actions,
    }
  }

  const isFormsLoading = editWorkAddressForm.isLoading || changeWorkAddressForm.isLoading
  if (isFormsLoading) {
    return { isLoading: true, errorHandling }
  }

  const { editWorkAddressForm: editReady, changeWorkAddressForm: changeReady } =
    workAddressFormsReady(editWorkAddressForm, changeWorkAddressForm)

  const dataReady: UseWorkAddressManagementDataReady = {
    employeeDisplayName,
    editTargetUuid,
    editWorkAddressForm: editReady,
    changeWorkAddressForm: changeReady,
  }

  return {
    isLoading: false,
    data: dataReady,
    status: {
      kind: 'success' as const,
      isDeletePending: deleteWorkAddressMutation.isPending,
    },
    errorHandling,
    actions,
  }
}
