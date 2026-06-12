import { useState, useMemo } from 'react'
import { useEmployeeList, type EmployeeType } from '../shared/useEmployeeList'
import { ManagementEmployeeListView } from './ManagementEmployeeListView'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

type EmployeeTab = 'active' | 'onboarding' | 'dismissed'

interface ManagementEmployeeListProps extends CommonComponentInterface<'Employee.ManagementEmployeeList'> {
  companyId: string
  initialTab?: EmployeeTab
  onEvent: BaseComponentInterface['onEvent']
}

const mapTabToEmployeeType = (tab: EmployeeTab): EmployeeType => {
  switch (tab) {
    case 'active':
      return 'active'
    case 'onboarding':
      return 'onboarding'
    case 'dismissed':
      return 'terminated'
  }
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

  const employeeType = useMemo(() => mapTabToEmployeeType(selectedTab), [selectedTab])

  const employeeList = useEmployeeList({
    companyId,
    employeeType,
  })

  if (employeeList.isLoading) {
    return <BaseLayout isLoading error={employeeList.errorHandling.errors} />
  }

  const handleEdit = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleDismiss = (employeeId: string) => {
    onEvent(componentEvents.EMPLOYEE_DISMISS, { employeeId })
  }

  const handleTabChange = (tab: EmployeeTab) => {
    setSelectedTab(tab)
  }

  return (
    <BaseLayout error={employeeList.errorHandling.errors}>
      <ManagementEmployeeListView
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        employees={employeeList.data.employees}
        isFetching={employeeList.status.isFetching}
        pagination={employeeList.pagination}
        status={employeeList.status}
        onEdit={handleEdit}
        onDismiss={handleDismiss}
        onDelete={async (employeeId: string) => {
          await employeeList.actions.onDelete(employeeId)
          onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId })
        }}
        onAddEmployee={handleAddEmployee}
      />
    </BaseLayout>
  )
}

/**
 * Renders a tabbed list of a company's employees split across Active, Onboarding, and Dismissed
 * tabs, with per-row actions tailored to each tab (edit, delete, dismiss, rehire).
 *
 * @remarks
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/create` | Fired when the user clicks "Add employee". | — |
 * | `employee/update` | Fired when the user selects "Edit" on a row. | `{ employeeId: string }` |
 * | `employee/dismiss` | Fired when the user selects "Dismiss" on a row in the Active tab. | `{ employeeId: string }` |
 * | `employee/deleted` | Fired after a row's delete action completes. | `{ employeeId: string }` |
 *
 * @public
 */
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
