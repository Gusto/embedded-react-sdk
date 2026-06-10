import type { OnboardingStatus } from '@gusto/embedded-api-v-2025-11-15/models/operations/putv1employeesemployeeidonboardingstatus'
import { useEmployeeList } from '../shared/useEmployeeList'
import { EmployeeListView } from './EmployeeListView'
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
    <BaseLayout error={employeeList.errorHandling.errors}>
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
          const onboardingStatus = await employeeList.actions.onCancelSelfOnboarding(employeeId)
          if (!onboardingStatus) return
          onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, onboardingStatus)
        }}
        onReview={async (employeeId: string) => {
          const onboardingStatus = await employeeList.actions.onReview(employeeId)
          if (!onboardingStatus) return
          onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, onboardingStatus)
          onEvent(componentEvents.EMPLOYEE_UPDATE, {
            employeeId,
            onboardingStatus: onboardingStatus.onboardingStatus,
          })
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
