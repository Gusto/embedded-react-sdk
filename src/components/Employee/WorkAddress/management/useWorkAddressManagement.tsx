import { useMemo, useState } from 'react'
import type { EmployeeWorkAddress } from '@gusto/embedded-api-v-2026-02-01/models/components/employeeworkaddress'
import { useEmployeeAddressesDeleteWorkAddressMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeAddressesDeleteWorkAddress'
import { useEmployeeAddressesGetWorkAddresses } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeAddressesGetWorkAddresses'
import { useEmployeesGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
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
import { normalizeToSDKError, SDKInternalError } from '@/types/sdkError'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Params for {@link useWorkAddressManagement}.
 *
 * @public
 */
export interface UseWorkAddressManagementParams {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired when a work address is deleted. */
  onEvent: OnEventType<EventType, unknown>
}

interface UseWorkAddressManagementDataPendingForms extends Record<string, unknown> {
  employeeDisplayName: string
  employeeWorkAddresses: EmployeeWorkAddress[] | undefined
  editTargetUuid: string | undefined
  editWorkAddressForm: UseWorkAddressFormResult
  changeWorkAddressForm: UseWorkAddressFormResult
}

interface UseWorkAddressManagementDataReady extends Record<string, unknown> {
  employeeDisplayName: string
  employeeWorkAddresses: EmployeeWorkAddress[] | undefined
  editTargetUuid: string | undefined
  editWorkAddressForm: UseWorkAddressFormReady
  changeWorkAddressForm: UseWorkAddressFormReady
}

interface UseWorkAddressManagementStatusEmployeeError extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: true
}

interface UseWorkAddressManagementStatusSuccess extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: false
}

interface UseWorkAddressManagementActions {
  setEditTargetUuid: (workAddressUuid: string | undefined) => void
  confirmDeleteWorkAddress: (workAddressUuid: string) => Promise<boolean>
}

interface UseWorkAddressManagementReadyEmployeeError extends BaseHookReady<
  UseWorkAddressManagementDataPendingForms,
  UseWorkAddressManagementStatusEmployeeError
> {
  actions: UseWorkAddressManagementActions
}

/**
 * Ready state of {@link useWorkAddressManagement} when the employee was fetched successfully.
 *
 * @public
 */
export interface UseWorkAddressManagementReadySuccess extends BaseHookReady<
  UseWorkAddressManagementDataReady,
  UseWorkAddressManagementStatusSuccess
> {
  /** Actions for changing the edit target and confirming work address deletion. */
  actions: UseWorkAddressManagementActions
}

type UseWorkAddressManagementReady =
  | UseWorkAddressManagementReadyEmployeeError
  | UseWorkAddressManagementReadySuccess

/**
 * Return type of {@link useWorkAddressManagement}.
 *
 * @public
 */
export type UseWorkAddressManagementResult = HookLoadingResult | UseWorkAddressManagementReady

/**
 * Type guard for the success branch of {@link useWorkAddressManagement}.
 *
 * @param value - The hook result to narrow.
 * @returns `true` when the hook has finished loading and the employee fetch succeeded.
 * @public
 */
export function isUseWorkAddressManagementSuccess(
  value: UseWorkAddressManagementResult,
): value is UseWorkAddressManagementReadySuccess {
  if (value.isLoading) {
    return false
  }
  return !value.status.isEmployeeError
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

/**
 * Headless hook for managing an employee's work addresses.
 *
 * @remarks
 * Fetches the employee and their work addresses, exposes edit and change form hooks
 * for the address modal, and provides an action to delete a non-active address.
 * Use {@link isUseWorkAddressManagementSuccess} to narrow the ready state when the
 * employee fetch succeeded.
 *
 * @param params - {@link UseWorkAddressManagementParams}
 * @returns A {@link HookLoadingResult} while loading, or the ready state once data is available.
 * @public
 */
export function useWorkAddressManagement({
  employeeId,
  onEvent,
}: UseWorkAddressManagementParams): UseWorkAddressManagementResult {
  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.Management.WorkAddress')
  const deleteWorkAddressMutation = useEmployeeAddressesDeleteWorkAddressMutation()
  const [editTargetUuid, setEditTargetUuid] = useState<string | undefined>(undefined)

  const employeeQuery = useEmployeesGet({ employeeId }, { enabled: !!employeeId })
  const companyId = employeeQuery.data?.employee?.companyUuid

  const workAddressesQuery = useEmployeeAddressesGetWorkAddresses(
    { employeeId },
    { enabled: !!employeeId && !!companyId },
  )

  const employeeWorkAddresses = workAddressesQuery.data?.employeeWorkAddressesList

  const currentWorkAddress = useMemo<EmployeeWorkAddress | null>(() => {
    if (!employeeWorkAddresses?.length) {
      return null
    }
    return employeeWorkAddresses.find(w => w.active) ?? employeeWorkAddresses[0] ?? null
  }, [employeeWorkAddresses])

  const workAddressUuidForEdit = editTargetUuid ?? currentWorkAddress?.uuid

  const editInactiveRow = useMemo(() => {
    if (!editTargetUuid || !employeeWorkAddresses) {
      return undefined
    }
    return employeeWorkAddresses.find(w => w.uuid === editTargetUuid)
  }, [editTargetUuid, employeeWorkAddresses])

  const editingWorkAddressRow = workAddressUuidForEdit
    ? employeeWorkAddresses?.find(w => w.uuid === workAddressUuidForEdit)
    : undefined

  const withEffectiveDateOnEdit = editInactiveRow ? editInactiveRow.active !== true : false

  const editWorkAddressForm = useWorkAddressForm({
    companyId,
    employeeId,
    workAddressUuid: workAddressUuidForEdit,
    initialAddress: editingWorkAddressRow,
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

  const isMissingCompany = !!employeeQuery.data?.employee && !companyId

  const errorHandling: HookErrorHandling = composeErrorHandler(
    [
      employeeQuery,
      workAddressesQuery,
      editWorkAddressForm,
      changeWorkAddressForm,
      ...(isMissingCompany
        ? [
            {
              errorHandling: {
                errors: [
                  normalizeToSDKError(
                    new SDKInternalError(
                      'Employee record is missing companyUuid, which is required to load work address locations.',
                    ),
                  ),
                ],
                retryQueries: () => {},
                clearSubmitError: () => {},
              },
            },
          ]
        : []),
    ],
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
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED, snap)
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
    employeeWorkAddresses,
    editTargetUuid,
    editWorkAddressForm,
    changeWorkAddressForm,
  }

  if (employeeQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  if (employeeQuery.isError || isMissingCompany) {
    return {
      isLoading: false,
      data: dataPayloadPendingForms,
      status: {
        isDeletePending: deleteWorkAddressMutation.isPending,
        isEmployeeError: true,
      },
      errorHandling,
      actions,
    }
  }

  if (workAddressesQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  const isFormsLoading = editWorkAddressForm.isLoading || changeWorkAddressForm.isLoading
  if (isFormsLoading) {
    return { isLoading: true, errorHandling }
  }

  const { editWorkAddressForm: editReady, changeWorkAddressForm: changeReady } =
    workAddressFormsReady(editWorkAddressForm, changeWorkAddressForm)

  const dataReady: UseWorkAddressManagementDataReady = {
    employeeDisplayName,
    employeeWorkAddresses,
    editTargetUuid,
    editWorkAddressForm: editReady,
    changeWorkAddressForm: changeReady,
  }

  return {
    isLoading: false,
    data: dataReady,
    status: {
      isDeletePending: deleteWorkAddressMutation.isPending,
      isEmployeeError: false,
    },
    errorHandling,
    actions,
  }
}
