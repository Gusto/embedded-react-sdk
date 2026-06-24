import { createMachine } from 'robot3'
import { useMemo } from 'react'
import { employeeOnboardingMachine } from './onboardingStateMachine'
import {
  type OnboardingDefaultValues,
  type OnboardingContextInterface,
  EmployeeListContextual,
} from './OnboardingFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'

/**
 * Props for {@link OnboardingFlow}.
 *
 * @public
 */
export interface OnboardingFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** Default values for individual flow step components. */
  defaultValues?: RequireAtLeastOne<OnboardingDefaultValues>
  /**
   * When true, presents the self-onboarding toggle allowing the admin to opt
   * the employee into self-onboarding. When false, the option to self-onboard
   * is not available. Defaults to `true`.
   */
  isSelfOnboardingEnabled?: boolean
  /**
   * When true, enables the Employee Documents step in the onboarding flow,
   * allowing the admin to configure I-9 document requirements. Defaults to
   * `false`.
   */
  withEmployeeI9?: boolean
  /**
   * Controls visibility of the Continue button in the employee list.
   *
   * When `true`, shows a Continue button allowing navigation to the next step.
   * Use this when the employee onboarding flow is embedded as a step within
   * a larger flow (e.g., company onboarding).
   *
   * When `false` (default), hides the Continue button. Use this for standalone
   * employee onboarding where the list is the terminal screen.
   *
   * @defaultValue `false`
   */
  showContinueButton?: boolean
}

/**
 * Complete workflow for onboarding an employee — profile, compensation, taxes, payment method, and document signing.
 *
 * @remarks
 * Renders a multi-step experience that collects every piece of information
 * required to add an employee to payroll. Begins on the employee list and
 * transitions into the onboarding execution flow when "Add employee" or a
 * row's "Edit"/"Review" action is invoked; returning from the execution flow
 * surfaces the list again. The flow is driven by an internal state machine
 * and wraps each step in error and suspense boundaries.
 *
 * The per-employee steps live in {@link OnboardingExecutionFlow}, which is also
 * exported as a standalone block — along with each individual step — for
 * composing a custom workflow when this orchestration is the wrong fit. See the
 * {@link https://sdk.gusto.com/docs/integration-guide/composition | Composition guide}
 * for how to recompose these blocks into your own flow.
 *
 * The flow forwards every event emitted by its sub-components to `onEvent`;
 * see the events table on each sub-component for the full set of events and
 * payloads observable from this flow.
 *
 * @components
 * - {@link EmployeeList}
 * - {@link OnboardingExecutionFlow}
 *
 * @param props - See {@link OnboardingFlowProps}.
 * @returns The multi-step onboarding flow with internal navigation between the employee list and the per-step screens.
 * @public
 * @group Flow Components
 *
 * @example
 * ```tsx
 * import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeOnboarding.OnboardingFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       withEmployeeI9
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export const OnboardingFlow = ({
  companyId,
  onEvent,
  defaultValues,
  isSelfOnboardingEnabled = true,
  withEmployeeI9 = false,
  showContinueButton = false,
}: OnboardingFlowProps) => {
  const manageEmployees = useMemo(
    () =>
      createMachine(
        'index',
        employeeOnboardingMachine,
        (initialContext: OnboardingContextInterface) => ({
          ...initialContext,
          component: EmployeeListContextual,
          companyId,
          isAdmin: true,
          defaultValues,
          isSelfOnboardingEnabled,
          withEmployeeI9,
          showContinueButton,
        }),
      ),
    [companyId, defaultValues, isSelfOnboardingEnabled, withEmployeeI9, showContinueButton],
  )
  return <Flow machine={manageEmployees} onEvent={onEvent} />
}
