import { createMachine } from 'robot3'
import type {
  SelfOnboardingContextInterface,
  SelfOnboardingFlowProps,
} from './SelfOnboardingComponents'
import { Landing } from './SelfOnboardingComponents'
import { employeeSelfOnboardingMachine } from './selfOnboardingMachine'
import { Flow } from '@/components/Flow/Flow'

export const SelfOnboardingFlow = ({ companyId, employeeId, onEvent }: SelfOnboardingFlowProps) => {
  const manageEmployees = createMachine(
    'index',
    employeeSelfOnboardingMachine,
    (initialContext: SelfOnboardingContextInterface) => ({
      ...initialContext,
      component: Landing,
      companyId,
      employeeId,
    }),
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
