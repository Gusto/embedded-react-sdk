import { useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { keepPreviousData } from '@tanstack/react-query'
import { useBase } from '@/components/Base'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'

interface UseEmployeeEmployeeListProps {
  companyId: string
}

export function useEmployeeEmployeeList({ companyId }: UseEmployeeEmployeeListProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(5)

  const { data, fetchStatus, isFetching } = useEmployeesList(
    {
      companyId,
      page: currentPage,
      per: itemsPerPage,
    },
    { placeholderData: keepPreviousData },
  )

  const { mutateAsync: deleteEmployeeMutation } = useEmployeesDeleteMutation()
  const { mutateAsync: updateEmployeeOnboardingStatusMutation } =
    useEmployeesUpdateOnboardingStatusMutation()

  const isInitialLoading = fetchStatus === 'fetching' && !data
  const employees = data?.showEmployees ?? []
  const totalPages = Number(data?.httpMeta.response.headers.get('x-total-pages') ?? 1)
  const totalCount = Number(data?.httpMeta.response.headers.get('x-total-count') ?? 0)

  const updateOnboardingStatus = async (statusData: {
    employeeId: string
    status: OnboardingStatus
  }) => {
    await baseSubmitHandler(statusData, async ({ employeeId, status }) => {
      const { employeeOnboardingStatus: responseData } =
        await updateEmployeeOnboardingStatusMutation({
          request: { employeeId, requestBody: { onboardingStatus: status } },
        })
      onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, responseData)
    })
  }

  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      await deleteEmployeeMutation({
        request: { employeeId: payload },
      })

      onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId: payload })
    })
  }

  const handleReview = async (data: string) => {
    await baseSubmitHandler(data, async employeeId => {
      await updateOnboardingStatus({
        employeeId,
        status: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
      })
      onEvent(componentEvents.EMPLOYEE_UPDATE, {
        employeeId,
        onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
      })
    })
  }

  const handleCancelSelfOnboarding = async (data: string) => {
    await baseSubmitHandler(data, async employeeId => {
      await updateOnboardingStatus({
        employeeId,
        status: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })
    })
  }

  const handleNew = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleSkip = () => {
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_DONE)
  }

  const handleEdit = (uuid: string, onboardingStatus?: OnboardingStatus) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId: uuid, onboardingStatus })
  }

  const handleItemsPerPageChange = (newCount: PaginationItemsPerPage) => {
    setItemsPerPage(newCount)
  }

  const handleFirstPage = () => {
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }

  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }

  return {
    data: {
      employees,
    },
    actions: {
      handleEdit,
      handleNew,
      handleReview,
      handleDelete,
      handleCancelSelfOnboarding,
      handleSkip,
    },
    meta: {
      isFetching,
      isInitialLoading,
    },
    pagination: {
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage,
      handleFirstPage,
      handlePreviousPage,
      handleNextPage,
      handleLastPage,
      handleItemsPerPageChange,
    },
  }
}
