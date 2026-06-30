import { createMachine } from 'robot3'
import { useMemo } from 'react'
import type {
  SelfOnboardingContextInterface,
  SelfOnboardingFlowProps,
} from './SelfOnboardingComponents'
import { Landing } from './SelfOnboardingComponents'
import { employeeSelfOnboardingMachine } from './selfOnboardingMachine'
import { Flow } from '@/components/Flow/Flow'

export type { SelfOnboardingFlowProps } from './SelfOnboardingComponents'

/**
 * Guided flow for employees to complete their own onboarding.
 *
 * @remarks
 * Hands the employee responsibility for submitting their own profile, tax, payment, and document-signing information. Drives a multi-step flow keyed to the employee being self-onboarded; when `withEmployeeI9` is enabled, the Document Signer step checks whether the employee has I-9 enabled and, if so, routes them through the employment-eligibility form before presenting the I-9 form alongside other required documents.
 *
 * Each step is also exported as a standalone block (see the Blocks table) for composing a custom workflow when this orchestration is the wrong fit.
 *
 * The flow forwards every event emitted by its blocks to `onEvent`; see the events table on each block for the full set of events and payloads observable from this flow.
 *
 * @components
 * - {@link Landing}
 * - {@link Profile}
 * - {@link FederalTaxes}
 * - {@link StateTaxes}
 * - {@link PaymentMethod}
 * - {@link DocumentSigner}
 * - {@link OnboardingSummary}
 *
 * @param props - See {@link SelfOnboardingFlowProps}.
 * @returns The multi-step self-onboarding flow.
 * @public
 * @group Flow Components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { EmployeeOnboarding, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeOnboarding.SelfOnboardingFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       withEmployeeI9
 *       onEvent={(eventType: EventType) => {
 *         if (eventType === 'employee/onboarding/done') {
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
  employeeId,
  withEmployeeI9 = false,
  onEvent,
}: SelfOnboardingFlowProps) => {
  const manageEmployees = useMemo(
    () =>
      createMachine(
        'index',
        employeeSelfOnboardingMachine,
        (initialContext: SelfOnboardingContextInterface) => ({
          ...initialContext,
          component: Landing,
          companyId,
          employeeId,
          withEmployeeI9,
        }),
      ),
    [companyId, employeeId, withEmployeeI9],
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
