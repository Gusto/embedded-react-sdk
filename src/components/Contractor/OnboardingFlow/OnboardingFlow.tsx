import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { onboardingMachine } from './onboardingStateMachine'
import type { OnboardingFlowProps } from './OnboardingFlowComponents'
import {
  ContractorListContextual,
  type OnboardingFlowContextInterface,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'

/**
 * Guided flow for admins to onboard a contractor to the company.
 *
 * @remarks
 * Renders a multi-step experience that collects every piece of information
 * required to add a contractor to a company. Begins on the contractor list
 * and transitions into the per-step screens when "Add contractor" or a row's
 * "Edit"/"Continue" action is invoked; the submit step returns to the list.
 * The flow is driven by an internal state machine and wraps each step in
 * error and suspense boundaries.
 *
 * Each step of the flow is also exported as a standalone block (see the
 * Blocks table) for composing a custom workflow when this orchestration
 * is the wrong fit.
 *
 * The flow forwards every event emitted by its blocks to `onEvent`;
 * see the events table on each block for the full set of events and
 * payloads observable from this flow.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/create` | Fired when the user chooses to add a new contractor | — |
 * | `contractor/update` | Fired when the user selects a contractor to edit | `{ contractorId: string }` |
 * | `contractor/deleted` | Fired when a contractor is deleted | `{ contractorId: string }` |
 * | `contractor/onboarding/continue` | Fired when the user chooses to continue onboarding a contractor | — |
 * | `contractor/created` | Fired when a new contractor is created successfully | Create contractor API response |
 * | `contractor/updated` | Fired when an existing contractor is updated | Update contractor API response |
 * | `contractor/profile/done` | Fired when the contractor profile step is complete | The saved contractor extended with `selfOnboarding: boolean` |
 * | `contractor/address/updated` | Fired when the contractor address is updated | Create or update contractor address API response |
 * | `contractor/address/done` | Fired when the address step is complete | — |
 * | `contractor/bankAccount/created` | Fired when a bank account is created for the contractor | Create contractor bank account API response |
 * | `contractor/paymentMethod/updated` | Fired when the payment method is updated | Update contractor payment method API response |
 * | `contractor/paymentMethod/done` | Fired when the payment method step is complete | — |
 * | `contractor/newHireReport/updated` | Fired when the new hire report is updated | Update contractor API response |
 * | `contractor/newHireReport/done` | Fired when the new hire report step is complete | — |
 * | `contractor/onboardingStatus/updated` | Fired when the contractor's onboarding status is updated | Change contractor onboarding status API response |
 * | `contractor/submit/done` | Fired when the contractor submission is complete | `{ message: string }` or `{ onboardingStatus, message: string }` |
 * | `contractor/invite/selfOnboarding` | Fired when the contractor is invited for self-onboarding | `{ contractorId: string }` |
 *
 * @components
 * - {@link ContractorList}
 * - {@link ContractorProfile}
 * - {@link Address}
 * - {@link PaymentMethod}
 * - {@link NewHireReport}
 * - {@link ContractorSubmit}
 *
 * @param props - See {@link OnboardingFlowProps}.
 * @returns The multi-step onboarding flow with internal navigation between the contractor list and the per-step screens.
 * @public
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorOnboarding, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorOnboarding.OnboardingFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'contractor/submit/done') {
 *           // Contractor onboarding complete — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export const OnboardingFlow = ({ companyId, onEvent, defaultValues }: OnboardingFlowProps) => {
  const onboardingFlow = useMemo(
    () =>
      createMachine(
        'list',
        onboardingMachine,
        (initialContext: OnboardingFlowContextInterface) => ({
          ...initialContext,
          component: ContractorListContextual,
          companyId,
          defaultValues,
          selfOnboarding: false,
        }),
      ),
    [companyId, defaultValues],
  )
  return <Flow machine={onboardingFlow} onEvent={onEvent} />
}
