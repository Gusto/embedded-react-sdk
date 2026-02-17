import type { OnboardingDefaultValues } from './OnboardingFlowComponents'
import { useEmployeeOnboardingFlow } from './useEmployeeOnboardingFlow'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  isSelfOnboardingEnabled?: boolean
}

export const OnboardingFlow = ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled = true,
}: OnboardingFlowProps) => {
  const {
    meta: { machine },
  } = useEmployeeOnboardingFlow({ companyId, defaultValues, isSelfOnboardingEnabled })

  return <Flow machine={machine} onEvent={onEvent} />
}
