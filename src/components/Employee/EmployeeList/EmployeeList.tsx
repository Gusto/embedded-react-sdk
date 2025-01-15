import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base/Base'
import { Flex } from '@/components/Common'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { Schemas } from '@/types/schema'
import { useDeleteEmployee, useGetEmployeesByCompany } from '@/api/queries/company'
import { Head } from '@/components/Employee/EmployeeList/Head'
import { List } from '@/components/Employee/EmployeeList/List'
import { useUpdateEmployeeOnboardingStatus } from '@/api/queries'

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
  employees: Schemas['Employee'][]
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

  const { data: employees } = useGetEmployeesByCompany(companyId)
  const deleteEmployeeMutation = useDeleteEmployee(companyId)
  const updateEmployeeOnboardingStatusMutation = useUpdateEmployeeOnboardingStatus(companyId)

  const handleDelete = async (uuid: string) => {
    await baseSubmitHandler(uuid, async payload => {
      const deleteEmployeeResponse = await deleteEmployeeMutation.mutateAsync(payload)
      onEvent(componentEvents.EMPLOYEE_DELETED, deleteEmployeeResponse)
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
      const updateEmployeeOnboardingStatusResult =
        await updateEmployeeOnboardingStatusMutation.mutateAsync({
          employeeId,
          body: { onboarding_status: status },
        })
      onEvent(
        componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
        updateEmployeeOnboardingStatusResult,
      )
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
          handleCancelSelfOnboarding,
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
