import { useMemo } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Job } from '@gusto/embedded-api/models/components/job'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import type { HookLoadingResult, HookSubmitResult, BaseHookReady } from '@/partner-hook-utils/types'

export type EmployeeAction =
  | 'edit'
  | 'delete'
  | 'cancel_self_onboarding'
  | 'review'
  | 'dismiss'
  | 'rehire'

export interface EmployeeWithActions extends Employee {
  allowedActions: EmployeeAction[]
  primaryJob?: Job
}

export interface EmployeeActionCallbacks {
  onDelete?: (employeeId: string) => void
  onReview?: (employeeId: string) => void
  onCancelSelfOnboarding?: (employeeId: string) => void
}

export type EmployeeType = 'active' | 'onboarding' | 'terminated'

export interface UseEmployeeListProps {
  companyId: string
  employeeType?: EmployeeType
}

interface UseEmployeeListReady extends BaseHookReady<
  { employees: EmployeeWithActions[] },
  { isFetching: boolean; isPending: boolean }
> {
  pagination: PaginationControlProps
  actions: {
    onDelete: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<void> | undefined>
    onReview: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<string> | undefined>
    onCancelSelfOnboarding: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<string> | undefined>
  }
}

export type UseEmployeeListResult = HookLoadingResult | UseEmployeeListReady

function deriveAllowedActions(employee: Employee, employeeType?: EmployeeType): EmployeeAction[] {
  const actions: EmployeeAction[] = []

  // Edit action - available for certain onboarding statuses, but not for terminated employees
  if (
    employeeType !== 'terminated' &&
    (employee.onboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
      employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
      employee.onboardingStatus ===
        EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
      employee.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED)
  ) {
    actions.push('edit')
  }

  // Cancel self onboarding - available for employees in self-onboarding flow
  if (
    employee.onboardingStatus &&
    // @ts-expect-error: onboardingStatus during runtime can be one of self onboarding statuses
    EmployeeSelfOnboardingStatuses.has(employee.onboardingStatus)
  ) {
    actions.push('cancel_self_onboarding')
  }

  // Review action - available when employee completed self-onboarding
  if (
    employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
  ) {
    actions.push('review')
  }

  // Delete action - available for non-onboarded employees
  if (!employee.onboarded) {
    actions.push('delete')
  }

  // Tab-specific actions for ManagementEmployeeList
  if (employeeType === 'active') {
    actions.push('dismiss')
  }

  if (employeeType === 'terminated') {
    actions.push('rehire')
  }

  return actions
}

export function useEmployeeList({
  companyId,
  employeeType,
}: UseEmployeeListProps): UseEmployeeListResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const queryParams = useMemo(() => {
    const baseParams = {
      companyId,
      page: currentPage,
      per: itemsPerPage,
    }

    switch (employeeType) {
      case 'active':
        return { ...baseParams, onboardedActive: true }
      case 'onboarding':
        return { ...baseParams, onboarded: false }
      case 'terminated':
        return { ...baseParams, terminated: true }
      default:
        return baseParams
    }
  }, [companyId, currentPage, itemsPerPage, employeeType])

  const employeesQuery = useEmployeesList(queryParams, { placeholderData: keepPreviousData })

  const deleteEmployeeMutation = useEmployeesDeleteMutation()
  const updateOnboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('EmployeeList')

  const errorHandling = composeErrorHandler([employeesQuery], { submitError, setSubmitError })

  const isPending = deleteEmployeeMutation.isPending || updateOnboardingStatusMutation.isPending

  const { data, isFetching } = employeesQuery

  const employees = useMemo<EmployeeWithActions[]>(() => {
    return (data?.showEmployees ?? []).map(employee => {
      const primaryJob = employee.jobs?.find(job => job.primary === true)

      return {
        ...employee,
        allowedActions: deriveAllowedActions(employee, employeeType),
        primaryJob,
      }
    })
  }, [data?.showEmployees, employeeType])

  const paginationProps = data?.httpMeta.response.headers
    ? getPaginationProps(data.httpMeta.response.headers, isFetching)
    : {
        handleNextPage: () => {},
        handleFirstPage: () => {},
        handleLastPage: () => {},
        handlePreviousPage: () => {},
        handleItemsPerPageChange: () => {},
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        itemsPerPage: 5 as const,
      }

  const onDelete = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<void> | undefined> => {
    let submitResult: HookSubmitResult<void> | undefined

    await baseSubmitHandler(employeeId, async id => {
      await deleteEmployeeMutation.mutateAsync({
        request: { employeeId: id },
      })
      callbacks?.onDelete?.(id)

      submitResult = {
        mode: 'update',
        data: undefined,
      }
    })

    return submitResult
  }

  const onReview = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<string> | undefined> => {
    let submitResult: HookSubmitResult<string> | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
          },
        },
      })
      callbacks?.onReview?.(id)

      submitResult = {
        mode: 'update',
        data: result.employeeOnboardingStatus?.onboardingStatus ?? '',
      }
    })

    return submitResult
  }

  const onCancelSelfOnboarding = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<string> | undefined> => {
    let submitResult: HookSubmitResult<string> | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })
      callbacks?.onCancelSelfOnboarding?.(id)

      submitResult = {
        mode: 'update',
        data: result.employeeOnboardingStatus?.onboardingStatus ?? '',
      }
    })

    return submitResult
  }

  const isLoading = !data && isFetching

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      employees,
    },
    pagination: paginationProps,
    status: { isFetching, isPending },
    actions: { onDelete, onReview, onCancelSelfOnboarding },
    errorHandling,
  }
}
