import { useMemo } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { EmployeeOnboardingStatus as EmployeeOnboardingStatusEntity } from '@gusto/embedded-api/models/components/employeeonboardingstatus'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import type { HookLoadingResult, BaseHookReady } from '@/partner-hook-utils/types'

/**
 * Action that may be performed on an employee row, determined by the employee's onboarding state
 * and the `employeeType` filter passed to {@link useEmployeeList}.
 *
 * @public
 */
export type EmployeeAction =
  'edit' | 'delete' | 'cancel_self_onboarding' | 'review' | 'dismiss' | 'rehire'

/**
 * An employee entity extended with the actions permitted on it and a reference to its primary job.
 *
 * @public
 */
export interface EmployeeWithActions extends Employee {
  /** Actions permitted for this employee given its onboarding status and the active filter. */
  allowedActions: EmployeeAction[]
  /** The employee's primary job, if one is marked primary. */
  primaryJob?: Job
}

/**
 * Filter applied to {@link useEmployeeList} that scopes the result set and tailors the per-row action list.
 *
 * @public
 */
export type EmployeeType = 'active' | 'onboarding' | 'terminated'

/**
 * Props for {@link useEmployeeList}.
 *
 * @public
 */
export interface UseEmployeeListProps {
  /** The associated company identifier. */
  companyId: string
  /** Filters the list and tailors the allowed actions. Omit to list all employees. */
  employeeType?: EmployeeType
}

/**
 * Ready state of {@link useEmployeeList}.
 *
 * @public
 */
export interface UseEmployeeListReady extends BaseHookReady<
  { employees: EmployeeWithActions[] },
  { isFetching: boolean; isPending: boolean }
> {
  /** Pagination controls for the current employee list page. */
  pagination: PaginationControlProps
  /** Actions that mutate an employee's state, gated by the entry's `allowedActions`. */
  actions: {
    /** Deletes the employee. */
    onDelete: (employeeId: string) => Promise<void>
    /** Moves the employee into the admin-review onboarding status. Resolves to the updated record, or `undefined` if the call failed. */
    onReview: (employeeId: string) => Promise<EmployeeOnboardingStatusEntity | undefined>
    /** Reverts a self-onboarding employee to admin-driven onboarding. Resolves to the updated record, or `undefined` if the call failed. */
    onCancelSelfOnboarding: (
      employeeId: string,
    ) => Promise<EmployeeOnboardingStatusEntity | undefined>
  }
}

/**
 * Return type of {@link useEmployeeList}.
 *
 * @public
 */
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

/**
 * Fetches a paginated list of a company's employees and decorates each entry with the actions
 * allowed for its current onboarding state.
 *
 * @remarks
 * `employeeType` maps to a server-side filter and changes which actions appear on each row:
 * `'active'` adds `dismiss`, `'terminated'` adds `rehire`, `'onboarding'` adds none. Omit it
 * to list every employee.
 *
 * Page changes use placeholder data: the previous page stays rendered while the next one loads,
 * and `status.isFetching` flips to `true` during the request.
 *
 * @param input - Company and optional filter for the list.
 * @returns A {@link HookLoadingResult} while the first page is in flight, or a {@link UseEmployeeListReady} once data has arrived.
 * @public
 *
 * @example
 * ```tsx
 * import { useEmployeeList } from '@gusto/embedded-react-sdk'
 *
 * function EmployeeListPage({ companyId }: { companyId: string }) {
 *   const employeeList = useEmployeeList({ companyId, employeeType: 'onboarding' })
 *
 *   if (employeeList.isLoading) return <div>Loading...</div>
 *
 *   return (
 *     <ul>
 *       {employeeList.data.employees.map(employee => (
 *         <li key={employee.uuid}>
 *           {employee.firstName} {employee.lastName}
 *           {employee.allowedActions.includes('delete') && (
 *             <button onClick={() => employeeList.actions.onDelete(employee.uuid)}>Delete</button>
 *           )}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
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

  const onDelete = async (employeeId: string): Promise<void> => {
    await baseSubmitHandler(employeeId, async id => {
      await deleteEmployeeMutation.mutateAsync({
        request: { employeeId: id },
      })
    })
  }

  const onReview = async (
    employeeId: string,
  ): Promise<EmployeeOnboardingStatusEntity | undefined> => {
    let onboardingStatus: EmployeeOnboardingStatusEntity | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
          },
        },
      })

      onboardingStatus = result.employeeOnboardingStatus
    })

    return onboardingStatus
  }

  const onCancelSelfOnboarding = async (
    employeeId: string,
  ): Promise<EmployeeOnboardingStatusEntity | undefined> => {
    let onboardingStatus: EmployeeOnboardingStatusEntity | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })

      onboardingStatus = result.employeeOnboardingStatus
    })

    return onboardingStatus
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
