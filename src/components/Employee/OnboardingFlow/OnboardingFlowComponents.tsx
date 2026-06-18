import { OnboardingExecutionFlow } from '../OnboardingExecutionFlow/OnboardingExecutionFlow'
import { EmployeeList } from '../EmployeeList/onboarding/EmployeeList'
import type { OnboardingContextInterface } from '../OnboardingExecutionFlow/OnboardingExecutionFlowComponents'
import { useFlow, type FlowHeaderConfig } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

const backToEmployeeListHeader: FlowHeaderConfig = {
  indicator: 'none',
  back: {
    labelKey: 'backToListCta',
    namespace: 'Employee.EmployeeList',
    event: componentEvents.EMPLOYEES_LIST,
  },
}

export type {
  OnboardingContextInterface,
  OnboardingDefaultValues,
} from '../OnboardingExecutionFlow/OnboardingExecutionFlowComponents'

/** @internal */
export const EmployeeListContextual = () => {
  const { companyId, onEvent } = useFlow<OnboardingContextInterface>()
  return <EmployeeList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function OnboardingExecutionFlowContextual() {
  const {
    companyId,
    employeeId,
    onEvent,
    onboardingStatus,
    defaultValues,
    isAdmin,
    isSelfOnboardingEnabled,
    withEmployeeI9,
  } = useFlow<OnboardingContextInterface>()

  return (
    <OnboardingExecutionFlow
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      initialEmployeeId={employeeId}
      initialOnboardingStatus={onboardingStatus}
      defaultValues={defaultValues}
      isAdmin={isAdmin}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
      withEmployeeI9={withEmployeeI9}
      initialBackHeader={backToEmployeeListHeader}
    />
  )
}
