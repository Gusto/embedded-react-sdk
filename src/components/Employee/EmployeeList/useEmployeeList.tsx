import { useMemo } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { keepPreviousData } from '@tanstack/react-query'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { useErrorHandling } from '@/hooks/useErrorHandling'
import { EmployeeOnboardingStatus } from '@/shared/constants'
import type { HookLoadingResult, HookErrorHandling, HookSubmitResult } from '@/types/sdkHooks'

export interface EmployeeActionCallbacks {
  onDelete?: (employeeId: string) => void
  onReview?: (employeeId: string) => void
  onCancelSelfOnboarding?: (employeeId: string) => void
}

export interface UseEmployeeListProps {
  companyId: string
  getTerminatedEmployees?: boolean
  onboarded?: boolean
  onboardedActive?: boolean
}

interface UseEmployeeListReady {
  isLoading: false
  employees: Employee[]
  isFetching: boolean
  pagination: PaginationControlProps
  status: {
    isPending: boolean
  }
  actions: {
    onDelete: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<void> | undefined>
    onReview: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<string> | undefined>
    onCancelSelfOnboarding: (
      employeeId: string,
      callbacks?: EmployeeActionCallbacks,
    ) => Promise<HookSubmitResult<string> | undefined>
  }
  errorHandling: HookErrorHandling
}

export type UseEmployeeListResult = HookLoadingResult | UseEmployeeListReady

export function useEmployeeList({
  companyId,
  getTerminatedEmployees = false,
  onboarded,
  onboardedActive,
}: UseEmployeeListProps): UseEmployeeListResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination()

  const employeesQuery = useEmployeesList(
    {
      companyId,
      page: currentPage,
      per: itemsPerPage,
      terminated: getTerminatedEmployees,
      onboarded,
      onboardedActive,
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

  const onDelete = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<void> | undefined> => {
    let submitResult: HookSubmitResult<void> | undefined

    await baseSubmitHandler(employeeId, async id => {
      await deleteEmployeeMutation.mutateAsync({
        request: { employeeId: id },
      })
      callbacks?.onDelete?.(id)

      submitResult = {
        mode: 'update',
        data: undefined,
      }
    })

    return submitResult
  }

  const onReview = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<string> | undefined> => {
    let submitResult: HookSubmitResult<string> | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
          },
        },
      })
      callbacks?.onReview?.(id)

      submitResult = {
        mode: 'update',
        data: result.employeeOnboardingStatus?.onboardingStatus ?? '',
      }
    })

    return submitResult
  }

  const onCancelSelfOnboarding = async (
    employeeId: string,
    callbacks?: EmployeeActionCallbacks,
  ): Promise<HookSubmitResult<string> | undefined> => {
    let submitResult: HookSubmitResult<string> | undefined

    await baseSubmitHandler(employeeId, async id => {
      const result = await updateOnboardingStatusMutation.mutateAsync({
        request: {
          employeeId: id,
          requestBody: {
            onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
          },
        },
      })
      callbacks?.onCancelSelfOnboarding?.(id)

      submitResult = {
        mode: 'update',
        data: result.employeeOnboardingStatus?.onboardingStatus ?? '',
      }
    })

    return submitResult
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
    employees,
    isFetching,
    pagination: paginationProps,
    status: { isPending },
    actions: { onDelete, onReview, onCancelSelfOnboarding },
    errorHandling,
  }
}
