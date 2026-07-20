import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type {
  SelfOnboardingContextInterface,
  SelfOnboardingFlowProps,
} from './SelfOnboardingComponents'
import { Landing } from './SelfOnboardingComponents'
import { contractorSelfOnboardingMachine } from './selfOnboardingMachine'
import { Flow } from '@/components/Flow/Flow'

export type { SelfOnboardingFlowProps } from './SelfOnboardingComponents'

/**
 * Guided flow for contractors to complete their own onboarding.
 *
 * @remarks
 * Hands the contractor responsibility for submitting their own profile, address, payment, and document-signing information. Drives a multi-step flow keyed to the contractor being self-onboarded, starting from the self-onboarding landing page and ending on a confirmation summary.
 *
 * Each step is also exported as a standalone block (see the Blocks table) for composing a custom workflow when this orchestration is the wrong fit.
 *
 * The flow forwards every event emitted by its blocks to `onEvent`; see the events table on each block for the full set of events and payloads observable from this flow.
 *
 * @components
 * - {@link Landing}
 * - {@link ContractorProfile}
 * - {@link Address}
 * - {@link PaymentMethod}
 * - {@link DocumentSigner}
 * - {@link OnboardingSummary}
 *
 * @param props - See {@link SelfOnboardingFlowProps}.
 * @returns The multi-step self-onboarding flow.
 * @public
 * @group Flow components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { ContractorOnboarding, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <ContractorOnboarding.SelfOnboardingFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'contractor/selfOnboarding/done') {
 *           // Onboarding complete — navigate to your next screen
 *         }
 *       }}
 *     />
 *   )
 * }
 * ```
 */
export const SelfOnboardingFlow = ({
  companyId,
  contractorId,
  onEvent,
}: SelfOnboardingFlowProps) => {
  const machine = useMemo(
    () =>
      createMachine(
        'index',
        contractorSelfOnboardingMachine,
        (initialContext: SelfOnboardingContextInterface) => ({
          ...initialContext,
          component: Landing,
          companyId,
          contractorId,
        }),
      ),
    [companyId, contractorId],
  )
  return <Flow machine={machine} onEvent={onEvent} />
}
