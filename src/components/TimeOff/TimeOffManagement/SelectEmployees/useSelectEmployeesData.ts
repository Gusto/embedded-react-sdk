import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import {
  buildEmployeesListQuery,
  useEmployeesListSuspense,
} from '@gusto/embedded-api/react-query/employeesList'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useSuspenseQueries } from '@tanstack/react-query'
import { Include } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { PaidTimeOff } from '@gusto/embedded-api/models/components/paidtimeoff'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

const SERVER_MAX_PER_PAGE = 100

// Employees whose primary job's hire_date is in the future are rejected by
// `POST /time_off_policies/:uuid/add_employees` as "ineligible" with no
// per-uuid reason in the response. We can detect this from the employees
// list response, so we drop them client-side to prevent the error.
function isStartedByToday(hireDate: string | undefined): boolean {
  if (!hireDate) return false
  const today = new Date().toISOString().slice(0, 10)
  return hireDate <= today
}

export function useSelectEmployeesData(companyId: string, excludeUuids?: Set<string>) {
  const gustoClient = useGustoEmbeddedContext()
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(() => new Set())
  const [searchValue, setSearchValue] = useState('')
  const deferredSearchValue = useDeferredValue(searchValue)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(5)

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

  const allEmployees = useMemo<EmployeeItem[]>(() => {
    const showEmployees = [
      ...(firstPage.showEmployees ?? []),
      ...restPageResults.flatMap(r => r.data.showEmployees ?? []),
    ]
    return showEmployees
      .filter(e => isStartedByToday(e.jobs?.find(job => job.primary)?.hireDate))
      .map(e => ({
        uuid: e.uuid,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobs?.find(job => job.primary)?.title ?? null,
        department: e.department ?? null,
        eligiblePaidTimeOff: e.eligiblePaidTimeOff as PaidTimeOff[] | undefined,
      }))
  }, [firstPage.showEmployees, restPageResults])

  const eligibleEmployees = useMemo<EmployeeItem[]>(
    () => allEmployees.filter(e => !excludeUuids?.has(e.uuid)),
    [allEmployees, excludeUuids],
  )

  const searchFilteredEmployees = useMemo<EmployeeItem[]>(() => {
    if (!deferredSearchValue) return eligibleEmployees
    const needle = deferredSearchValue.toLowerCase()
    return eligibleEmployees.filter(e =>
      `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(needle),
    )
  }, [eligibleEmployees, deferredSearchValue])

  const totalCount = searchFilteredEmployees.length
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const filteredEmployees = useMemo<EmployeeItem[]>(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage
    return searchFilteredEmployees.slice(start, start + itemsPerPage)
  }, [searchFilteredEmployees, safeCurrentPage, itemsPerPage])

  const isRestFetching = restPageResults.some(r => r.isFetching)
  const isFetching = isFirstPageFetching || isRestFetching

  const pagination = useMemo<PaginationControlProps>(
    () => ({
      currentPage: safeCurrentPage,
      totalPages,
      totalCount,
      itemsPerPage,
      isFetching,
      handleFirstPage: () => {
        setCurrentPage(1)
      },
      handleLastPage: () => {
        setCurrentPage(totalPages)
      },
      handleNextPage: () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
      },
      handlePreviousPage: () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
      },
      handleItemsPerPageChange: (value: PaginationItemsPerPage) => {
        if (value !== itemsPerPage) {
          setItemsPerPage(value)
          setCurrentPage(1)
        }
      },
    }),
    [safeCurrentPage, totalPages, totalCount, itemsPerPage, isFetching],
  )

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

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
    setCurrentPage(1)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchValue('')
    setCurrentPage(1)
  }, [])

  return {
    filteredEmployees,
    selectedUuids,
    searchValue,
    pagination,
    isFetching,
    handleSelect,
    handleSelectAll,
    handleSearchChange,
    handleSearchClear,
  }
}
