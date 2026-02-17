import type { SelfOnboardingFlowProps } from './SelfOnboardingComponents'
import { useEmployeeSelfOnboardingFlow } from './useEmployeeSelfOnboardingFlow'
import { Flow } from '@/components/Flow/Flow'

export const SelfOnboardingFlow = ({ companyId, employeeId, onEvent }: SelfOnboardingFlowProps) => {
  const {
    meta: { machine },
  } = useEmployeeSelfOnboardingFlow({ companyId, employeeId })

  return <Flow machine={machine} onEvent={onEvent} />
}
