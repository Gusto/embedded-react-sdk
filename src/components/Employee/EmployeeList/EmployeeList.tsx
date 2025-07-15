import { useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlow'
import { EmployeeListProvider } from './useEmployeeList'
import { Actions } from './Actions'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { Head } from '@/components/Employee/EmployeeList/Head'
import { List } from '@/components/Employee/EmployeeList/List'
import { useFlow } from '@/components/Flow/useFlow'

//Interface for component specific props
interface EmployeeListProps extends CommonComponentInterface<'Employee.EmployeeList'> {
  companyId: string
}

export function EmployeeList(props: EmployeeListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children, dictionary }: EmployeeListProps) {
  //Using i18n hook to directly load necessary namespace
  useI18n('Employee.EmployeeList')
  useComponentDictionary('Employee.EmployeeList', dictionary)
  //Getting props from base context
  const { onEvent, baseSubmitHandler } = useBase()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  const { data } = useEmployeesListSuspense({ companyId, page: currentPage, per: itemsPerPage })
  const { httpMeta, showEmployees: employeeList } = data
  const employees = employeeList!

  const { mutateAsync: deleteEmployeeMutation } = useEmployeesDeleteMutation()
  const { mutateAsync: updateEmployeeOnboardingStatusMutation } =
    useEmployeesUpdateOnboardingStatusMutation()

  const totalPages = Number(httpMeta.response.headers.get('x-total-pages') ?? 1)

  const handleItemsPerPageChange = (newCount: number) => {
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
  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      await deleteEmployeeMutation({
        request: { employeeId: payload },
      })

      onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId: payload })
    })
  }
  /**Set onboarding status to self_onboarding_awaiting_admin_review and proceed to edit */
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
  /**Update employee onboarding status reverting it back to admin_onboarding_incomplete */
  const handleCancelSelfOnboarding = async (data: string) => {
    await baseSubmitHandler(data, async employeeId => {
      await updateOnboardingStatus({
        employeeId,
        status: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
      })
    })
  }
  const updateOnboardingStatus = async (data: { employeeId: string; status: OnboardingStatus }) => {
    await baseSubmitHandler(data, async ({ employeeId, status }) => {
      const { employeeOnboardingStatus: responseData } =
        await updateEmployeeOnboardingStatusMutation({
          request: { employeeId, requestBody: { onboardingStatus: status } },
        })
      onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, responseData)
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
  return (
    <section className={className}>
      <EmployeeListProvider
        value={{
          handleEdit,
          handleNew,
          handleReview,
          handleDelete,
          employees,
          currentPage,
          totalPages,
          handleFirstPage,
          handlePreviousPage,
          handleNextPage,
          handleLastPage,
          handleCancelSelfOnboarding,
          handleItemsPerPageChange,
          handleSkip,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <List />
            <Actions />
          </Flex>
        )}
      </EmployeeListProvider>
    </section>
  )
}

EmployeeList.Head = Head
EmployeeList.List = List
EmployeeList.Actions = Actions

/**
 * Wrapper used inside Flows -> exposes flow context for required parameters
 */
export const EmployeeListContextual = () => {
  const { companyId, onEvent } = useFlow<OnboardingContextInterface>()
  return <EmployeeList companyId={companyId} onEvent={onEvent} />
}
