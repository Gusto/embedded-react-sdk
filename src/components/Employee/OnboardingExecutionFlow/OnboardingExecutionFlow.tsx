import { createMachine } from 'robot3'
import { useMemo } from 'react'
import {
  onboardingExecutionMachine,
  INITIAL_COMPONENT_MAP,
  type OnboardingExecutionInitialState,
} from './onboardingExecutionStateMachine'
import {
  type OnboardingContextInterface,
  type OnboardingDefaultValues,
} from './OnboardingExecutionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType, EmployeeOnboardingStatus } from '@/shared/constants'

/**
 * Props for {@link OnboardingExecutionFlow}.
 *
 * @public
 */
export interface OnboardingExecutionFlowProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the flow emits an event. */
  onEvent: OnEventType<EventType, unknown>
  /** The step the flow starts on. Defaults to `employeeProfile`. */
  initialState?: OnboardingExecutionInitialState
  /** The associated employee identifier to resume onboarding for. Omit to begin onboarding a new employee. */
  initialEmployeeId?: string
  /** The current onboarding status of the employee being onboarded. Drives skip behavior for self-onboarding and document steps. */
  initialOnboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  /** Default values for individual flow step components. */
  defaultValues?: OnboardingDefaultValues
  /** When true, the flow renders in the admin context. When false, it is configured for employee self-onboarding. Defaults to `true`. */
  isAdmin?: boolean
  /** When true, presents the self-onboarding toggle on the profile step. Defaults to `true`. */
  isSelfOnboardingEnabled?: boolean
  /** When true, enables the Employee Documents step in the flow, allowing the admin to configure I-9 document requirements. Defaults to `false`. */
  withEmployeeI9?: boolean
}

/**
 * Guided flow to onboard an employee.
 *
 * @remarks
 * Drives the per-employee, admin-led onboarding steps used by {@link OnboardingFlow} and {@link EmployeeManagement.EmployeeListFlow}. ({@link SelfOnboardingFlow} is the separate employee-driven flow and runs its own state machine.) Each step is also exported as a standalone block (see the Blocks table) for composing a custom workflow when this orchestration is the wrong fit.
 *
 * Self-onboarding statuses cause the federal-taxes, state-taxes, and payment-method steps to be skipped (the employee fills those in themselves); the documents step is also skipped unless `withEmployeeI9` is true and the documents config has not yet been completed.
 *
 * The flow forwards every event emitted by its blocks to `onEvent`; see the events table on each block for the full set of events and payloads observable from this flow.
 *
 * @components
 * - {@link Profile}
 * - {@link Compensation}
 * - {@link FederalTaxes}
 * - {@link StateTaxes}
 * - {@link PaymentMethod}
 * - {@link Deductions}
 * - {@link EmployeeDocuments}
 * - {@link OnboardingSummary}
 *
 * @param props - See {@link OnboardingExecutionFlowProps}.
 * @returns The multi-step onboarding execution flow.
 * @public
 * @group Flow components
 *
 * @example
 * ```tsx title="App.tsx"
 * import { EmployeeOnboarding, type EventType } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeOnboarding.OnboardingExecutionFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
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
export function OnboardingExecutionFlow({
  companyId,
  onEvent,
  initialState = 'employeeProfile',
  initialEmployeeId,
  initialOnboardingStatus,
  defaultValues,
  isAdmin = true,
  isSelfOnboardingEnabled = true,
  withEmployeeI9 = false,
}: OnboardingExecutionFlowProps) {
  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        onboardingExecutionMachine,
        (initialContext: OnboardingContextInterface) => ({
          ...initialContext,
          component: INITIAL_COMPONENT_MAP[initialState],
          companyId,
          employeeId: initialEmployeeId,
          onboardingStatus: initialOnboardingStatus,
          defaultValues,
          isAdmin,
          isSelfOnboardingEnabled,
          withEmployeeI9,
        }),
      ),
    [
      companyId,
      initialState,
      initialEmployeeId,
      initialOnboardingStatus,
      defaultValues,
      isAdmin,
      isSelfOnboardingEnabled,
      withEmployeeI9,
    ],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
