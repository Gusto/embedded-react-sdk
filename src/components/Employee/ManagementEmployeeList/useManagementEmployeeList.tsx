import { useState, useMemo } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

export type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

export interface UseManagementEmployeeListProps {
  companyId: string
  initialTab?: EmployeeTab
}

export interface UseManagementEmployeeListResult {
  selectedTab: EmployeeTab
  onTabChange: (tab: EmployeeTab) => void
  employees: Employee[]
  isFetching: boolean
  isLoading: boolean
  pagination: PaginationControlProps
}

export function useManagementEmployeeList({
  companyId,
  initialTab = 'active',
}: UseManagementEmployeeListProps): UseManagementEmployeeListResult {
  const [selectedTab, setSelectedTab] = useState<EmployeeTab>(initialTab)
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const isTerminatedFilter = selectedTab === 'dismissed' ? true : false

  const { data, isFetching } = useEmployeesList(
    {
      companyId,
      page: currentPage,
      per: itemsPerPage,
      terminated: isTerminatedFilter,
    },
    { placeholderData: keepPreviousData },
  )

  const isLoading = isFetching && !data

  const employees = useMemo(() => {
    if (!data?.showEmployees) return []

    const employeeList = data.showEmployees

    if (selectedTab === 'dismissed') {
      return employeeList
    }

    if (selectedTab === 'active') {
      return employeeList.filter((employee: Employee) => employee.onboarded === true)
    }

    return employeeList.filter((employee: Employee) => employee.onboarded === false)
  }, [data?.showEmployees, selectedTab])

  const handleTabChange = (tab: EmployeeTab) => {
    setSelectedTab(tab)
  }

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

  return {
    selectedTab,
    onTabChange: handleTabChange,
    employees,
    isFetching,
    isLoading,
    pagination: paginationProps,
  }
}
