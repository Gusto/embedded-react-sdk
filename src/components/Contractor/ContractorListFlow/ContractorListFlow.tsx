import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { contractorListStateMachine } from './contractorListStateMachine'
import {
  ContractorListContextual,
  type ContractorListFlowContextInterface,
  type ContractorListFlowProps,
} from './ContractorListFlowComponents'
import { Flow } from '@/components/Flow/Flow'

/**
 * Hub for viewing and managing a company's contractors, including onboarding new ones.
 *
 * @remarks
 * Drop-in entry point for browsing a company's contractors. Begins on the
 * management contractor list and routes into {@link DashboardFlow} when the
 * admin selects "View details" on a row, or directly into the Profile step
 * of contractor onboarding — the same Profile → Address → Payment Method →
 * New Hire Report → Submit sequence used by
 * {@link ContractorOnboarding.OnboardingFlow | OnboardingFlow} — when the
 * admin clicks "Add contractor" or selects "Continue"/"Review" on an
 * onboarding-tab row. A "Back to contractors" header is added above the
 * dashboard; the onboarding steps show their own progress header instead,
 * matching `OnboardingFlow`'s own screens exactly. Submitting, or cancelling
 * from any step, returns to this list.
 *
 * "Dismiss" and "Rehire" have no corresponding sub-flow yet and are not
 * handled internally — they continue to fire their documented events
 * (`contractor/dismiss`, `contractor/rehire`) straight through `onEvent` for
 * the host app to handle, exactly as they do outside this flow.
 *
 * The flow forwards every event emitted by its blocks to `onEvent`;
 * see the events table on each block for the full set of events and
 * payloads observable from this flow.
 *
 * @components
 * - {@link ContractorList}
 * - {@link DashboardFlow}
 * - {@link ContractorOnboarding.ContractorProfile | ContractorProfile}
 * - {@link ContractorOnboarding.Address | Address}
 * - {@link ContractorOnboarding.PaymentMethod | PaymentMethod}
 * - {@link ContractorOnboarding.NewHireReport | NewHireReport}
 * - {@link ContractorOnboarding.ContractorSubmit | ContractorSubmit}
 *
 * @param props - See {@link ContractorListFlowProps}.
 * @returns The contractor list workflow with internal navigation to the dashboard and onboarding steps.
 * @public
 * @group Flow components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorManagement.ContractorListFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const ContractorListFlow = ({ companyId, onEvent }: ContractorListFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'list',
        contractorListStateMachine,
        (initialContext: ContractorListFlowContextInterface) => ({
          ...initialContext,
          component: ContractorListContextual,
          companyId,
          selfOnboarding: false,
        }),
      ),
    [companyId],
  )
  return <Flow machine={machine} onEvent={onEvent} />
}
