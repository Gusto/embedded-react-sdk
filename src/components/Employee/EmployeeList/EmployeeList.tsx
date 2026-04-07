import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import { EmployeeListView } from './EmployeeListView'
import { useEmployeeList } from './useEmployeeList'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface EmployeeListProps extends BaseComponentInterface<'Employee.EmployeeList'> {
  companyId: string
}

function EmployeeListRoot({ companyId, onEvent, dictionary }: EmployeeListProps) {
  useI18n('Employee.EmployeeList')
  useComponentDictionary('Employee.EmployeeList', dictionary)

  const employeeList = useEmployeeList({
    companyId,
  })

  if (employeeList.isLoading) {
    return <BaseLayout isLoading error={employeeList.errorHandling.errors} />
  }

  const handleEdit = (employeeId: string, onboardingStatus?: OnboardingStatus) => {
    onEvent(componentEvents.EMPLOYEE_UPDATE, { employeeId, onboardingStatus })
  }

  const handleAddEmployee = () => {
    onEvent(componentEvents.EMPLOYEE_CREATE)
  }

  const handleSkip = () => {
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_DONE)
  }

  return (
    <BaseLayout error={employeeList.errorHandling?.errors}>
      <EmployeeListView
        employees={employeeList.data.employees}
        isFetching={employeeList.status.isFetching}
        pagination={employeeList.pagination}
        status={employeeList.status}
        onEdit={handleEdit}
        onDelete={async (employeeId: string) => {
          await employeeList.actions.onDelete(employeeId)
          onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId })
        }}
        onCancelSelfOnboarding={async (employeeId: string) => {
          const result = await employeeList.actions.onCancelSelfOnboarding(employeeId)
          onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, result)
        }}
        onReview={async (employeeId: string) => {
          const result = await employeeList.actions.onReview(employeeId)
          onEvent(componentEvents.EMPLOYEE_UPDATE, result)
        }}
        onAddEmployee={handleAddEmployee}
        onSkip={handleSkip}
      />
    </BaseLayout>
  )
}

export function EmployeeList({
  FallbackComponent,
  ...props
}: EmployeeListProps & BaseComponentInterface) {
  return (
    <BaseBoundaries componentName="Employee.EmployeeList" FallbackComponent={FallbackComponent}>
      <EmployeeListRoot {...props} />
    </BaseBoundaries>
  )
}
