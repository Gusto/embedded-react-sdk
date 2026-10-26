import { useQueries } from '@tanstack/react-query'
import {
  buildEmployeesListQuery,
  useEmployeesList,
} from '@gusto/embedded-api/react-query/employeesList'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import type { ShowEmployees } from '@gusto/embedded-api/models/components/showemployees'
import { getPrimaryJob, getPrimaryCompensation } from './employeeJob'
import { isAssignmentAccessDenied } from './departmentAccess'

/**
 * Checks the employee eligibility rules used by pay schedule assignment.
 *
 * @param employee - Employee returned by the list endpoint.
 * @returns Whether the employee is onboarded, current, and has compensation data.
 * @internal
 */
export function isAssignableEmployee(employee: ShowEmployees): boolean {
  return Boolean(
    !employee.terminated &&
    !employee.historical &&
    employee.onboarded === true &&
    getPrimaryCompensation(employee),
  )
}

/**
 * Loads every employee page before exposing the assignable roster.
 *
 * @param companyId - Company whose employees are being assigned.
 * @returns Loading state or the complete roster and any missing access or compensation data.
 * @internal
 */
export function useAssignableEmployees(companyId: string) {
  const client = useGustoEmbeddedContext()
  const request = { companyId, terminated: false, page: 1, per: 100 }
  const first = useEmployeesList(request, {
    throwOnError: error => !isAssignmentAccessDenied(error),
  })
  const totalPages = Number(first.data?.httpMeta.response.headers.get('x-total-pages') ?? 1)
  const remaining = useQueries({
    queries: Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
      ...buildEmployeesListQuery(client, { ...request, page: index + 2 }),
      throwOnError: (error: unknown) => !isAssignmentAccessDenied(error),
    })),
  })
  if (first.isPending || remaining.some(result => result.isPending)) {
    return { status: 'loading' as const }
  }
  const roster = [
    ...(first.data?.showEmployees ?? []),
    ...remaining.flatMap(result => result.data?.showEmployees ?? []),
  ]
  const missingCompensationData = roster.some(employee => {
    if (employee.terminated || employee.historical || employee.onboarded !== true) return false
    const job = getPrimaryJob(employee)
    return Boolean(
      job &&
      (job.compensations === undefined ||
        (job.currentCompensationUuid && !getPrimaryCompensation(employee))),
    )
  })
  const accessDenied =
    missingCompensationData ||
    [first, ...remaining].some(result => isAssignmentAccessDenied(result.error))
  const employees = accessDenied ? [] : roster.filter(isAssignableEmployee)

  return { status: 'ready' as const, employees, accessDenied }
}
