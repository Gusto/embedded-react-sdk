import { useState, useMemo } from 'react'
import { ManagementEmployeeListView } from './ManagementEmployeeListView'
import { useEmployeeList } from './useEmployeeList'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

interface ManagementEmployeeListProps
  extends CommonComponentInterface<'Employee.ManagementEmployeeList'> {
  companyId: string
  initialTab?: EmployeeTab
  onEvent: BaseComponentInterface['onEvent']
}

function ManagementEmployeeListRoot({
  companyId,
  initialTab = 'active',
  onEvent,
  dictionary,
}: ManagementEmployeeListProps) {
  useI18n('Employee.ManagementEmployeeList')
  useComponentDictionary('Employee.ManagementEmployeeList', dictionary)

  const [selectedTab, setSelectedTab] = useState<EmployeeTab>(initialTab)

  const employeeList = useEmployeeList({
    companyId,
    getTerminatedEmployees: selectedTab === 'dismissed',
  })

  if (employeeList.isLoading) {
    return <BaseLayout isLoading error={employeeList.errorHandling.errors} />
  }

  const filteredEmployees = useMemo(() => {
    if (selectedTab === 'dismissed') {
      return employeeList.employees
    }

    if (selectedTab === 'active') {
      return employeeList.employees.filter((employee: Employee) => employee.onboarded === true)
    }

    return employeeList.employees.filter((employee: Employee) => employee.onboarded === false)
  }, [employeeList.employees, selectedTab])

  const handleEdit = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleRehire = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_REHIRE, { employeeId })
  }

  const handleTabChange = (tab: EmployeeTab) => {
    setSelectedTab(tab)
  }

  return (
    <BaseLayout error={employeeList.errorHandling.errors}>
      <ManagementEmployeeListView
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        employees={filteredEmployees}
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
