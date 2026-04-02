import { useState, useMemo } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useErrorHandling } from '@/components/UNSTABLE_Hooks/useErrorHandling'
import { EmployeeOnboardingStatus } from '@/shared/constants'

export type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

export interface EmployeeActionCallbacks {
  onDelete?: (employeeId: string) => void
  onReview?: (employeeId: string) => void
  onCancelSelfOnboarding?: (employeeId: string) => void
}

export interface UseEmployeeListProps {
  companyId: string
  isOnboarding?: boolean
  initialTab?: EmployeeTab
}

interface UseEmployeeListBase {
  isLoading: false
  employees: Employee[]
  isFetching: boolean
  pagination: PaginationControlProps
  status: {
    isPending: boolean
  }
  errorHandling: ReturnType<typeof useErrorHandling>
}

export interface UseEmployeeListOnboardingReady extends UseEmployeeListBase {
  mode: 'onboarding'
  actions: {
    onDelete: (employeeId: string, callbacks?: EmployeeActionCallbacks) => Promise<void>
    onReview: (employeeId: string, callbacks?: EmployeeActionCallbacks) => Promise<void>
    onCancelSelfOnboarding: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<void>
  }
}

export interface UseEmployeeListManagementReady extends UseEmployeeListBase {
  mode: 'management'
  selectedTab: EmployeeTab
  onTabChange: (tab: EmployeeTab) => void
  actions: {
    onDelete: (employeeId: string, callbacks?: EmployeeActionCallbacks) => Promise<void>
  }
}

interface UseEmployeeListLoading {
  isLoading: true
  errorHandling: ReturnType<typeof useErrorHandling>
}

export type UseEmployeeListResult =
  | UseEmployeeListOnboardingReady
  | UseEmployeeListManagementReady
  | UseEmployeeListLoading

export interface UseEmployeeListProps {
  companyId: string
  isOnboarding?: boolean
  initialTab?: EmployeeTab
}

export function useEmployeeList({
  companyId,
  isOnboarding = false,
}: UseEmployeeListProps): UseEmployeeListResult {
  const [selectedTab, setSelectedTab] = useState<EmployeeTab>('active')
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const isTerminatedFilter = isOnboarding ? false : selectedTab === 'dismissed' ? true : false

  const employeesQuery = useEmployeesList(
    {
      companyId,
      page: currentPage,
      per: itemsPerPage,
      terminated: isTerminatedFilter,
    },
    { placeholderData: keepPreviousData },
  )

  const deleteEmployeeMutation = useEmployeesDeleteMutation()
  const updateOnboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('EmployeeList')

  const errorHandling = useErrorHandling([employeesQuery], { error: submitError, setError })

  const isPending = deleteEmployeeMutation.isPending || updateOnboardingStatusMutation.isPending

  const { data, isFetching } = employeesQuery

  const employees = useMemo(() => {
    if (!data?.showEmployees) return []

    const employeeList = data.showEmployees

    if (isOnboarding) {
      return employeeList
    }

    if (selectedTab === 'dismissed') {
      return employeeList
    }

    if (selectedTab === 'active') {
      return employeeList.filter((employee: Employee) => employee.onboarded === true)
    }

    return employeeList.filter((employee: Employee) => employee.onboarded === false)
  }, [data?.showEmployees, selectedTab, isOnboarding])

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

  const onDelete = async (employeeId: string, callbacks?: EmployeeActionCallbacks) => {
    await baseSubmitHandler(employeeId, async id => {
      await deleteEmployeeMutation.mutateAsync({
        request: { employeeId: id },
      })
      callbacks?.onDelete?.(id)
    })
  }

  const onReview = async (employeeId: string, callbacks?: EmployeeActionCallbacks) => {
    await baseSubmitHandler(employeeId, async id => {
      await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
          },
        },
      })
      callbacks?.onReview?.(id)
    })
  }

  const onCancelSelfOnboarding = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ) => {
    await baseSubmitHandler(employeeId, async id => {
      await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })
      callbacks?.onCancelSelfOnboarding?.(id)
    })
  }

  if (!data && isFetching) {
    return { isLoading: true as const, errorHandling }
  }

  if (isOnboarding) {
    return {
      isLoading: false as const,
      mode: 'onboarding' as const,
      employees,
      isFetching,
      pagination: paginationProps,
      status: { isPending },
      actions: { onDelete, onReview, onCancelSelfOnboarding },
      errorHandling,
    }
  }

  return {
    isLoading: false as const,
    mode: 'management' as const,
    selectedTab,
    onTabChange: handleTabChange,
    employees,
    isFetching,
    pagination: paginationProps,
    status: { isPending },
    actions: { onDelete },
    errorHandling,
  }
}
