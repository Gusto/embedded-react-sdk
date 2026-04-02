import { useEmployeesDeleteMutation } from '@gusto/embedded-api/react-query/employeesDelete'
import { ManagementEmployeeListView } from './ManagementEmployeeListView'
import { useManagementEmployeeList } from './useManagementEmployeeList'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Loading } from '@/components/Common'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface ManagementEmployeeListProps extends CommonComponentInterface<'Employee.ManagementEmployeeList'> {
  companyId: string
}

export function ManagementEmployeeList(
  props: ManagementEmployeeListProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, className, dictionary }: ManagementEmployeeListProps) {
  useI18n('Employee.ManagementEmployeeList')
  useComponentDictionary('Employee.ManagementEmployeeList', dictionary)

  const { onEvent, baseSubmitHandler } = useBase()

  const managementList = useManagementEmployeeList({
    companyId,
  })

  const { mutateAsync: deleteEmployeeMutation, isPending: isDeleting } =
    useEmployeesDeleteMutation()

  if (managementList.isLoading) {
    return <Loading />
  }

  const handleEdit = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleDelete = async (employeeId: string) => {
    await baseSubmitHandler(employeeId, async id => {
      await deleteEmployeeMutation({
        request: {
          employeeId: id,
        },
      })
      onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId: id })
    })
  }

  const handleRehire = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_REHIRE, { employeeId })
  }

  return (
    <section className={className}>
      <ManagementEmployeeListView
        {...managementList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRehire={handleRehire}
        onAddEmployee={handleAddEmployee}
        isDeleting={isDeleting}
      />
    </section>
  )
}
