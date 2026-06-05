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
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { useI18n } from '@/i18n'

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
  /**
   * Optional header shown above the initial step. When supplied, the back
   * affordance is preserved if the user navigates back to step one from a
   * later step. Use this to expose an "exit" path when the flow is rendered
   * inside a parent flow (e.g. back to an employee list).
   */
  initialBackHeader?: FlowHeaderConfig
}

/**
 * The multi-step onboarding execution flow — profile, compensation, taxes, payment method, deductions, documents, and summary.
 *
 * @remarks
 * Drives the per-employee onboarding experience used by both {@link OnboardingFlow} (admin) and {@link SelfOnboardingFlow} (employee). Each step is also exported as a standalone block — see {@link Profile}, {@link Compensation}, {@link FederalTaxes}, {@link StateTaxes}, {@link PaymentMethod}, {@link Deductions}, {@link EmployeeDocuments}, and {@link OnboardingSummary} — for composing a custom workflow when this orchestration is the wrong fit.
 *
 * Self-onboarding statuses cause the federal-taxes, state-taxes, and payment-method steps to be skipped (the employee fills those in themselves); the documents step is also skipped unless `withEmployeeI9` is true and the documents config has not yet been completed.
 *
 * The flow forwards every event emitted by its sub-components to `onEvent`; see the events table on each sub-component for the full set of events and payloads observable from this flow.
 *
 * @param props - See {@link OnboardingExecutionFlowProps}.
 * @returns The multi-step onboarding execution flow.
 * @public
 * @group Flow Components
 *
 * @example
 * ```tsx
 * import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function MyApp() {
 *   return (
 *     <EmployeeOnboarding.OnboardingExecutionFlow
 *       companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
 *       onEvent={() => {}}
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
  initialBackHeader,
}: OnboardingExecutionFlowProps) {
  useI18n('Employee.OnboardingExecutionFlow')
  const machine = useMemo(
    () =>
      createMachine(
        initialState,
        onboardingExecutionMachine,
        (initialContext: OnboardingContextInterface) => ({
          ...initialContext,
          component: INITIAL_COMPONENT_MAP[initialState],
          header: initialBackHeader ?? null,
          initialHeader: initialBackHeader ?? null,
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
      initialBackHeader,
    ],
  )

  return <Flow machine={machine} onEvent={onEvent} />
}
