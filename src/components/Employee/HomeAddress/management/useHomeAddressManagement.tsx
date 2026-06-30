import { useMemo, useState } from 'react'
import type { EmployeeAddress } from '@gusto/embedded-api-v-2025-11-15/models/components/employeeaddress'
import { useEmployeeAddressesDeleteMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesDelete'
import { useEmployeeAddressesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeAddressesGet'
import { useEmployeesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
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

/**
 * Params for {@link useHomeAddressManagement}.
 *
 * @public
 */
export interface UseHomeAddressManagementParams {
  /** The associated employee identifier. */
  employeeId: string
  /** Event handler fired when a home address is deleted. */
  onEvent: OnEventType<EventType, unknown>
}

interface UseHomeAddressManagementDataPendingForms extends Record<string, unknown> {
  employeeDisplayName: string
  employeeHomeAddresses: EmployeeAddress[] | undefined
  editingHomeAddressUuid: string | undefined
  editHomeAddressForm: UseHomeAddressFormResult
  createHomeAddressForm: UseHomeAddressFormResult
}

interface UseHomeAddressManagementDataReady extends Record<string, unknown> {
  employeeDisplayName: string
  employeeHomeAddresses: EmployeeAddress[] | undefined
  editingHomeAddressUuid: string | undefined
  editHomeAddressForm: UseHomeAddressFormReady
  createHomeAddressForm: UseHomeAddressFormReady
}

interface UseHomeAddressManagementStatusEmployeeError extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: true
}

interface UseHomeAddressManagementStatusSuccess extends Record<string, unknown> {
  isDeletePending: boolean
  isEmployeeError: false
}

interface UseHomeAddressManagementActions {
  setEditAddressTarget: (homeAddressUuid: string | undefined) => void
  confirmDeleteHomeAddress: (homeAddressUuid: string) => Promise<boolean>
}

interface UseHomeAddressManagementReadyEmployeeError extends BaseHookReady<
  UseHomeAddressManagementDataPendingForms,
  UseHomeAddressManagementStatusEmployeeError
> {
  actions: UseHomeAddressManagementActions
}

/**
 * Ready state of {@link useHomeAddressManagement} when the employee was fetched successfully.
 *
 * @public
 */
export interface UseHomeAddressManagementReadySuccess extends BaseHookReady<
  UseHomeAddressManagementDataReady,
  UseHomeAddressManagementStatusSuccess
> {
  /** Actions for changing edit target and confirming home address deletion. */
  actions: UseHomeAddressManagementActions
}

type UseHomeAddressManagementReady =
  | UseHomeAddressManagementReadyEmployeeError
  | UseHomeAddressManagementReadySuccess

/**
 * Return type of {@link useHomeAddressManagement}.
 *
 * @public
 */
export type UseHomeAddressManagementResult = HookLoadingResult | UseHomeAddressManagementReady

/**
 * Type guard for the success branch of {@link useHomeAddressManagement}.
 *
 * @param value - The hook result to narrow.
 * @returns `true` when the hook has finished loading and the employee fetch succeeded.
 * @public
 */
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

/**
 * Headless hook for managing an employee's home addresses.
 *
 * @remarks
 * Fetches the employee and their home addresses, exposes edit and create form hooks
 * for the address modal, and provides an action to delete a non-active address.
 * Use {@link isUseHomeAddressManagementSuccess} to narrow the ready state when the
 * employee fetch succeeded.
 *
 * @param params - {@link UseHomeAddressManagementParams}
 * @returns A {@link HookLoadingResult} while loading, or the ready state once data is available.
 * @public
 */
export function useHomeAddressManagement({
  employeeId,
  onEvent,
}: UseHomeAddressManagementParams): UseHomeAddressManagementResult {
  const {
    baseSubmitHandler,
    error: rootSubmitError,
    setError: setRootSubmitError,
  } = useBaseSubmit('Employee.Management.HomeAddress')
  const deleteHomeAddressMutation = useEmployeeAddressesDeleteMutation()

  const [editTargetUuid, setEditAddressTarget] = useState<string | undefined>(undefined)

  const homeAddressesQuery = useEmployeeAddressesGet({ employeeId }, { enabled: !!employeeId })
  const employeeHomeAddresses = homeAddressesQuery.data?.employeeAddressList
  const currentHomeAddress =
    employeeHomeAddresses?.find(a => a.active) ?? employeeHomeAddresses?.[0]

  const editingHomeAddressUuid = editTargetUuid ?? currentHomeAddress?.uuid

  const editingHomeAddressRow = editingHomeAddressUuid
    ? employeeHomeAddresses?.find(a => a.uuid === editingHomeAddressUuid)
    : undefined

  const editHomeAddressForm = useHomeAddressForm({
    employeeId,
    homeAddressUuid: editingHomeAddressUuid,
    initialAddress: editingHomeAddressRow,
    withEffectiveDateField: true,
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

  // Form hooks are intentionally excluded here so their submit errors don't render in the
  // page-level BaseLayout outside the edit/create modal (SDK-930). The view renders those
  // errors inside the modal directly via the form hook's own errorHandling.
  const errorHandling: HookErrorHandling = composeErrorHandler(
    [employeeQuery, homeAddressesQuery],
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
          onEvent(componentEvents.EMPLOYEE_MANAGEMENT_HOME_ADDRESS_DELETED, snap)
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
