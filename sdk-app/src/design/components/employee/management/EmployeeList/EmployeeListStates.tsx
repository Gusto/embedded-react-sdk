import { useState } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { EmployeeList, type EmployeeListTab } from './EmployeeList'

export function EmployeeListDemo({
  employees,
  initialTab,
}: {
  employees: Employee[]
  initialTab: EmployeeListTab
}) {
  const [tab, setTab] = useState<EmployeeListTab>(initialTab)
  return (
    <EmployeeList
      employees={employees}
      selectedTab={tab}
      onSelectTab={setTab}
      onAddEmployee={() => {}}
      onEditEmployee={() => {}}
      onDismissEmployee={() => {}}
      onRehireEmployee={() => {}}
    />
  )
}
