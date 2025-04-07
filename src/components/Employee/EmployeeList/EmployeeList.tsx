import { useState } from 'react'
import {
  useEmployeesListSuspense,
  invalidateEmployeesList,
} from '@gusto/embedded-api/react-query/employeesList'
import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base/Base'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { Head } from '@/components/Employee/EmployeeList/Head'
import { List } from '@/components/Employee/EmployeeList/List'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { useFlow } from '@/components/Flow/Flow'

//Interface for component specific props
interface EmployeeListProps extends CommonComponentInterface {
  companyId: string
}

//Interface for context passed down to component slots
type EmployeeListContextType = {
  handleEdit: (uuid: string, onboardingStatus?: string) => void
  handleDelete: (uuid: string) => Promise<void>
  handleCancelSelfOnboarding: (employeeId: string) => Promise<void>
  handleReview: (employeeId: string) => Promise<void>
  handleNew: () => void
  handleFirstPage: () => void
  handlePreviousPage: () => void
  handleNextPage: () => void
  handleLastPage: () => void
  handleItemsPerPageChange: (newCount: number) => void
  currentPage: number
  totalPages: number
  employees: Employee[]
}

const [useEmployeeList, EmployeeListProvider] =
  createCompoundContext<EmployeeListContextType>('EmployeeListContext')
export { useEmployeeList }

export function EmployeeList(props: EmployeeListProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}
function Root({ companyId, className, children }: EmployeeListProps) {
  //Using i18n hook to directly load necessary namespace
  useI18n('Employee.EmployeeList')
  //Getting props from base context
  const { onEvent, baseSubmitHandler } = useBase()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const queryClient = useQueryClient()

  const { data } = useEmployeesListSuspense({ companyId, page: currentPage, per: itemsPerPage })
  const { httpMeta, employeeList } = data
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

      await invalidateEmployeesList(queryClient, [companyId])
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
  const updateOnboardingStatus = async (data: { employeeId: string; status: string }) => {
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

  const handleEdit = (uuid: string, onboardingStatus?: string) => {
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
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <List />
          </Flex>
        )}
      </EmployeeListProvider>
    </section>
  )
}

EmployeeList.Head = Head
EmployeeList.List = List

/**
 * Wrapper used inside Flows -> exposes flow context for required parameters
 */
export const EmployeeListContextual = () => {
  const { companyId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  return <EmployeeList companyId={companyId} onEvent={onEvent} />
}
