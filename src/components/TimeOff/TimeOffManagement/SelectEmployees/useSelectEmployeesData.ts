import { useCallback, useMemo, useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { Include } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PaidTimeOff } from '@gusto/embedded-api/models/components/paidtimeoff'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useClientPagination } from '@/hooks/useClientPagination/useClientPagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady } from '@/partner-hook-utils/types'

const EMPLOYEES_PER_REQUEST = 100

// Employees whose primary job's hire_date is in the future are rejected by
// `POST /time_off_policies/:uuid/add_employees` as "ineligible" with no
// per-uuid reason in the response. We can detect this from the employees
// list response, so we drop them client-side to prevent the error.
export function isStartedByToday(hireDate: string | undefined): boolean {
  if (!hireDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return hireDate <= today
}

function mapEmployeeToItem(employee: Employee): EmployeeItem {
  return {
    uuid: employee.uuid,
    firstName: employee.firstName,
    lastName: employee.lastName,
    jobTitle: employee.jobs?.find(job => job.primary)?.title ?? null,
    department: employee.department ?? null,
    eligiblePaidTimeOff: employee.eligiblePaidTimeOff as PaidTimeOff[] | undefined,
  }
}

function eligibleForAdd(employee: Employee): boolean {
  return isStartedByToday(employee.jobs?.find(job => job.primary)?.hireDate)
}

function matchesEmployeeName(item: EmployeeItem, query: string): boolean {
  const needle = query.toLowerCase()
  return `${item.firstName ?? ''} ${item.lastName ?? ''}`.toLowerCase().includes(needle)
}

/**
 * Returns the eligible employees for the time-off Add Employees flow,
 * shaped for the SelectEmployees presentation: paginated and searchable
 * client-side, with selection and submit-state mirroring the ready branch
 * of `useEmployeeList`.
 *
 * Single `useEmployeesListSuspense` fetch + `useClientPagination` for the
 * in-memory paginate/search. Adds employee-specific shaping: future-hire
 * filter, exclude-by-uuid filter, and selection state.
 */
export interface UseSelectEmployeesDataResult extends BaseHookReady<
  {
    employees: EmployeeItem[]
    selectedUuids: Set<string>
    searchValue: string
  },
  { isFetching: boolean; isPending: boolean }
> {
  pagination: PaginationControlProps
  actions: {
    onSelect: (item: EmployeeItem, checked: boolean) => void
    onSelectAll: (checked: boolean, visibleItems: EmployeeItem[]) => void
    onSearchChange: (value: string) => void
    onSearchClear: () => void
  }
}

export function useSelectEmployeesData(
  companyId: string,
  excludeUuids?: Set<string>,
): UseSelectEmployeesDataResult {
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(() => new Set())

  // include: all_compensations populates eligiblePaidTimeOff, which carries
  // each employee's current balance on their existing time-off policies —
  // used to pre-fill carry-over balances.
  const employeesQuery = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: 1,
    per: EMPLOYEES_PER_REQUEST,
    include: [Include.AllCompensations],
  })

  const eligibleEmployees = useMemo<EmployeeItem[]>(() => {
    const all = employeesQuery.data.showEmployees ?? []
    return all
      .filter(eligibleForAdd)
      .filter(employee => !(excludeUuids && employee.uuid && excludeUuids.has(employee.uuid)))
      .map(mapEmployeeToItem)
  }, [employeesQuery.data.showEmployees, excludeUuids])

  const {
    data: employees,
    pagination: basePagination,
    searchValue,
    actions: { onSearchChange, onSearchClear },
  } = useClientPagination(eligibleEmployees, { searchPredicate: matchesEmployeeName })

  const isFetching = employeesQuery.isFetching

  // Re-attach `isFetching` to the pagination shape so PaginationControl
  // can reflect background refetches.
  const pagination = useMemo<PaginationControlProps>(
    () => ({ ...basePagination, isFetching }),
    [basePagination, isFetching],
  )

  const onSelect = useCallback((item: EmployeeItem, checked: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (checked) next.add(item.uuid)
      else next.delete(item.uuid)
      return next
    })
  }, [])

  const onSelectAll = useCallback((checked: boolean, visibleItems: EmployeeItem[]) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      for (const item of visibleItems) {
        if (checked) next.add(item.uuid)
        else next.delete(item.uuid)
      }
      return next
    })
  }, [])

  const errorHandling = composeErrorHandler([employeesQuery])

  return {
    isLoading: false,
    data: { employees, selectedUuids, searchValue },
    pagination,
    status: { isFetching, isPending: false },
    actions: { onSelect, onSelectAll, onSearchChange, onSearchClear },
    errorHandling,
  }
}
