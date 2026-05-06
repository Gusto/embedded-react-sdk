import { useCallback, useMemo, useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { Include } from '@gusto/embedded-api/models/operations/getv1companiescompanyidemployees'
import type { PaidTimeOff } from '@gusto/embedded-api/models/components/paidtimeoff'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { usePagination } from '@/hooks/usePagination/usePagination'

export function useSelectEmployeesData(companyId: string, initialSelectedUuids?: Set<string>) {
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(
    () => new Set(initialSelectedUuids ?? []),
  )
  const [searchValue, setSearchValue] = useState('')
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()

  // include: all_compensations is required to populate eligiblePaidTimeOff,
  // which carries each employee's current balance on their existing time-off
  // policies — used to pre-fill carry-over balances for selection.
  const { data: employeesData, isFetching } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: currentPage,
    per: itemsPerPage,
    include: [Include.AllCompensations],
  })

  const employees = useMemo<EmployeeItem[]>(
    () =>
      (employeesData.showEmployees ?? []).map(e => ({
        uuid: e.uuid,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobs?.find(job => job.primary)?.title ?? null,
        department: e.department ?? null,
        eligiblePaidTimeOff: e.eligiblePaidTimeOff as PaidTimeOff[] | undefined,
      })),
    [employeesData.showEmployees],
  )

  const filteredEmployees = useMemo(() => {
    if (!searchValue) return employees
    const lower = searchValue.toLowerCase()
    return employees.filter(e =>
      `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(lower),
    )
  }, [employees, searchValue])

  const pagination = useMemo(
    () => getPaginationProps(employeesData.httpMeta.response.headers, isFetching),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeesData.httpMeta.response.headers, isFetching, currentPage, itemsPerPage],
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

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      resetPage()
    },
    [resetPage],
  )

  const handleSearchClear = useCallback(() => {
    setSearchValue('')
    resetPage()
  }, [resetPage])

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
