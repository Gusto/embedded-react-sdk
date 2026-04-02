import type { OnboardingStatus } from '@gusto/embedded-api/models/operations/putv1employeesemployeeidonboardingstatus'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import { EmployeeListView } from './EmployeeListView'
import { useEmployeeList } from './useEmployeeList'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useI18n, useComponentDictionary } from '@/i18n'
import { componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'
import { useFlow } from '@/components/Flow/useFlow'

interface EmployeeListProps extends CommonComponentInterface<'Employee.EmployeeList'> {
  companyId: string
  onEvent: BaseComponentInterface['onEvent']
}

function EmployeeListRoot({ companyId, onEvent, dictionary }: EmployeeListProps) {
  useI18n('Employee.EmployeeList')
  useComponentDictionary('Employee.EmployeeList', dictionary)

  const employeeList = useEmployeeList({
    companyId,
    isOnboarding: true,
  })

  if (employeeList.isLoading) {
    return <BaseLayout isLoading error={employeeList.errorHandling.errors} />
  }

  if (employeeList.mode !== 'onboarding') {
    return null
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
        mode="onboarding"
        employees={employeeList.employees}
        isFetching={employeeList.isFetching}
        pagination={employeeList.pagination}
        status={employeeList.status}
        onEdit={handleEdit}
        onDelete={async (employeeId: string) => {
          await employeeList.actions.onDelete(employeeId, {
            onDelete: (id: string) => {
              onEvent(componentEvents.EMPLOYEE_DELETED, { employeeId: id })
            },
          })
        }}
        onCancelSelfOnboarding={async (employeeId: string) => {
          await employeeList.actions.onCancelSelfOnboarding(employeeId, {
            onCancelSelfOnboarding: (id: string) => {
              onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, {
                employeeId: id,
                onboardingStatus: EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
              })
            },
          })
        }}
        onReview={async (employeeId: string) => {
          await employeeList.actions.onReview(employeeId, {
            onReview: (id: string) => {
              onEvent(componentEvents.EMPLOYEE_UPDATE, {
                employeeId: id,
                onboardingStatus: EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
              })
            },
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

export function EmployeeListContextual() {
  const { companyId, onEvent } = useFlow<OnboardingContextInterface>()
  return <EmployeeList companyId={companyId} onEvent={onEvent} />
}
