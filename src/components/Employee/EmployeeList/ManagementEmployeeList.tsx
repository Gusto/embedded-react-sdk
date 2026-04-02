import { ManagementEmployeeListView } from './ManagementEmployeeListView'
import { useEmployeeList } from './useEmployeeList'
import type { EmployeeTab } from './useEmployeeList'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface ManagementEmployeeListProps extends CommonComponentInterface<'Employee.ManagementEmployeeList'> {
  companyId: string
  initialTab?: EmployeeTab
  onEvent: BaseComponentInterface['onEvent']
}

function ManagementEmployeeListRoot({
  companyId,
  initialTab,
  onEvent,
  dictionary,
}: ManagementEmployeeListProps) {
  useI18n('Employee.ManagementEmployeeList')
  useComponentDictionary('Employee.ManagementEmployeeList', dictionary)

  const employeeList = useEmployeeList({
    companyId,
    isOnboarding: false,
    initialTab,
  })

  if (employeeList.isLoading) {
    return <BaseLayout isLoading error={employeeList.errorHandling.errors} />
  }

  if (employeeList.mode !== 'management') {
    return null
  }

  const handleEdit = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleRehire = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_REHIRE, { employeeId })
  }

  return (
    <BaseLayout error={employeeList.errorHandling.errors}>
      <ManagementEmployeeListView
        mode={employeeList.mode}
        selectedTab={employeeList.selectedTab}
        onTabChange={employeeList.onTabChange}
        employees={employeeList.employees}
        isFetching={employeeList.isFetching}
        pagination={employeeList.pagination}
        status={employeeList.status}
        onEdit={handleEdit}
        onDelete={async (employeeId: string) => {
          await employeeList.actions.onDelete(employeeId, {
            onDelete: (id: string) => onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId: id }),
          })
        }}
        onRehire={handleRehire}
        onAddEmployee={handleAddEmployee}
      />
    </BaseLayout>
  )
}

export function ManagementEmployeeList({
  FallbackComponent,
  ...props
}: ManagementEmployeeListProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      componentName="Employee.ManagementEmployeeList"
      FallbackComponent={FallbackComponent}
    >
      <ManagementEmployeeListRoot {...props} />
    </BaseBoundaries>
  )
}
