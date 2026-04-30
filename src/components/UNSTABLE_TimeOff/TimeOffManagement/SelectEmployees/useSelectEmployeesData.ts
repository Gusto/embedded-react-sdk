import { useCallback, useMemo, useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { usePagination } from '@/hooks/usePagination/usePagination'

export function useSelectEmployeesData(companyId: string) {
  const [selectedUuids, setSelectedUuids] = useState(new Set<string>())
  const [searchValue, setSearchValue] = useState('')
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()

  const { data: employeesData, isFetching } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: currentPage,
    per: itemsPerPage,
  })

  const employees = useMemo<EmployeeItem[]>(
    () =>
      (employeesData.showEmployees ?? []).map(e => ({
        uuid: e.uuid,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobs?.find(job => job.primary)?.title ?? null,
        department: e.department ?? null,
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
    handleSearchChange,
    handleSearchClear,
  }
}
