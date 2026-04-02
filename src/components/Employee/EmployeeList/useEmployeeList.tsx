import { useMemo } from 'react'
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

export interface EmployeeActionCallbacks {
  onDelete?: (employeeId: string) => void
  onReview?: (employeeId: string) => void
  onCancelSelfOnboarding?: (employeeId: string) => void
}

export interface UseEmployeeListProps {
  companyId: string
  getTerminatedEmployees?: boolean
}

export interface UseEmployeeListResult {
  isLoading: boolean
  employees: Employee[]
  isFetching: boolean
  pagination: PaginationControlProps
  status: {
    isPending: boolean
  }
  actions: {
    onDelete: (employeeId: string, callbacks?: EmployeeActionCallbacks) => Promise<void>
    onReview: (employeeId: string, callbacks?: EmployeeActionCallbacks) => Promise<void>
    onCancelSelfOnboarding: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<void>
  }
  errorHandling: ReturnType<typeof useErrorHandling>
}

export function useEmployeeList({
  companyId,
  getTerminatedEmployees = false,
}: UseEmployeeListProps): UseEmployeeListResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const employeesQuery = useEmployeesList(
    {
      companyId,
      page: currentPage,
      per: itemsPerPage,
      terminated: getTerminatedEmployees,
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
    return data?.showEmployees ?? []
  }, [data?.showEmployees])

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

  const isLoading = !data && isFetching

  return {
    isLoading,
    employees,
    isFetching,
    pagination: paginationProps,
    status: { isPending },
    actions: { onDelete, onReview, onCancelSelfOnboarding },
    errorHandling,
  }
}
