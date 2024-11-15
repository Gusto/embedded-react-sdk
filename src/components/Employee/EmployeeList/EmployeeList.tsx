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
import { componentEvents } from '@/shared/constants'
import { Schemas } from '@/types'
import { useDeleteEmployee, useGetEmployeesByCompany } from '@/api/queries/company'
import { ApiError } from '@/api/queries/helpers'
import { Head } from '@/components/Employee/EmployeeList/Head'
import { List } from '@/components/Employee/EmployeeList/List'

//Interface for component specific props
interface EmployeeListProps extends CommonComponentInterface {
  companyId: string
}

//Interface for context passed down to component slots
type EmployeeListContextType = {
  handleEdit: (uuid: string) => void
  handleDelete: (uuid: string) => void
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
  const { setError, onEvent, throwError } = useBase()

  const { data: employees } = useGetEmployeesByCompany(companyId)
  const deleteEmployeeMutation = useDeleteEmployee(companyId)

  const handleDelete = async (uuid: string) => {
    try {
      const deleteEmployeeResponse = await deleteEmployeeMutation.mutateAsync(uuid)
      onEvent(componentEvents.EMPLOYEE_DELETED, deleteEmployeeResponse)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err)
      } else throwError(err)
    }
  }
  const handleNew = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleEdit = (uuid: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId: uuid })
  }
  return (
    <section className={className}>
      <EmployeeListProvider value={{ handleEdit, handleNew, handleDelete, employees }}>
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
