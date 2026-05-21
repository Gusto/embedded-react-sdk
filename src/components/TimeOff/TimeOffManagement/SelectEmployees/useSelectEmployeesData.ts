import { useCallback, useMemo, useState } from 'react'
import {
  buildEmployeesListQuery,
  useEmployeesListSuspense,
} from '@gusto/embedded-api/react-query/employeesList'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useSuspenseQueries } from '@tanstack/react-query'
import { Include } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { PaidTimeOff } from '@gusto/embedded-api/models/components/paidtimeoff'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useClientPagination } from '@/hooks/useClientPagination/useClientPagination'

const SERVER_MAX_PER_PAGE = 100

// Employees whose primary job's hire_date is in the future are rejected by
// `POST /time_off_policies/:uuid/add_employees` as "ineligible" with no
// per-uuid reason in the response. We can detect this from the employees
// list response, so we drop them client-side to prevent the error.
export function isStartedByToday(hireDate: string | undefined): boolean {
  if (!hireDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return hireDate <= today
}

export function useSelectEmployeesData(companyId: string, excludeUuids?: Set<string>) {
  const gustoClient = useGustoEmbeddedContext()
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(() => new Set())

  // Fetch the full employees list up front so filter, search, and pagination
  // can all be applied client-side. include: all_compensations is required to
  // populate eligiblePaidTimeOff, which carries each employee's current
  // balance on their existing time-off policies — used to pre-fill carry-over
  // balances for selection.
  const { data: firstPage, isFetching: isFirstPageFetching } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: 1,
    per: SERVER_MAX_PER_PAGE,
    include: [Include.AllCompensations],
  })

  const totalServerPages = Number(firstPage.httpMeta.response.headers.get('x-total-pages') ?? 1)

  // For each additional server page we fire a suspense query in parallel.
  // No explicit concurrency cap: typical embedded customers are <100
  // employees (one server page, zero extra requests). For larger companies
  // the browser's per-origin connection limit (~6) acts as the natural
  // ceiling. If this flow ever needs to support thousands of employees,
  // reconsider — either a server-side eligibility filter or a paginated
  // fetch-as-you-scroll strategy would be the right escape hatches.
  const restPageResults = useSuspenseQueries({
    queries: Array.from({ length: Math.max(0, totalServerPages - 1) }, (_, i) =>
      buildEmployeesListQuery(gustoClient, {
        companyId,
        terminated: false,
        page: i + 2,
        per: SERVER_MAX_PER_PAGE,
        include: [Include.AllCompensations],
      }),
    ),
  })

  const eligibleEmployees = useMemo<EmployeeItem[]>(() => {
    const showEmployees = [
      ...(firstPage.showEmployees ?? []),
      ...restPageResults.flatMap(r => r.data.showEmployees ?? []),
    ]
    return showEmployees
      .filter(e => isStartedByToday((e.jobs?.find(job => job.primary) ?? e.jobs?.[0])?.hireDate))
      .filter(e => !excludeUuids?.has(e.uuid))
      .map(e => ({
        uuid: e.uuid,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobs?.find(job => job.primary)?.title ?? e.jobs?.[0]?.title ?? null,
        department: e.department ?? null,
        eligiblePaidTimeOff: e.eligiblePaidTimeOff as PaidTimeOff[] | undefined,
      }))
  }, [firstPage.showEmployees, restPageResults, excludeUuids])

  const {
    data: filteredEmployees,
    pagination,
    searchValue,
    actions: paginationActions,
  } = useClientPagination(eligibleEmployees, {
    searchPredicate: (employee, query) =>
      `${employee.firstName ?? ''} ${employee.lastName ?? ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  })

  const isRestFetching = restPageResults.some(r => r.isFetching)
  const isFetching = isFirstPageFetching || isRestFetching

  const handleSelect = useCallback((item: EmployeeItem, checked: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (checked) next.add(item.uuid)
      else next.delete(item.uuid)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean, visibleItems: EmployeeItem[]) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      for (const item of visibleItems) {
        if (checked) next.add(item.uuid)
        else next.delete(item.uuid)
      }
      return next
    })
  }, [])

  return {
    filteredEmployees,
    eligibleEmployees,
    eligibleCount: eligibleEmployees.length,
    selectedUuids,
    searchValue,
    pagination,
    isFetching,
    handleSelect,
    handleSelectAll,
    handleSearchChange: paginationActions.onSearchChange,
    handleSearchClear: paginationActions.onSearchClear,
  }
}
