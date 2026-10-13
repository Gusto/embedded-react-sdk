import { ManagementEmployeeList } from '../EmployeeList/management/ManagementEmployeeList'
import { DashboardFlow } from '../Dashboard'
import { TerminationFlow } from '../Terminations/TerminationFlow/TerminationFlow'
import { OnboardingExecutionFlow } from '../OnboardingExecutionFlow/OnboardingExecutionFlow'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link EmployeeListFlow}.
 *
 * @public
 */
export interface EmployeeListFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** When true, presents the self-onboarding toggle in the onboarding flow. Defaults to `true`. */
  isSelfOnboardingEnabled?: boolean
  /** When true, enables the Employee Documents step in the onboarding flow, allowing the admin to configure I-9 document requirements. Defaults to `false`. */
  withEmployeeI9?: boolean
}

/** @internal */
export interface EmployeeListFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  isSelfOnboardingEnabled?: boolean
  withEmployeeI9?: boolean
}

/** @internal */
export function EmployeeListContextual() {
  const { companyId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <ManagementEmployeeList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function DashboardFlowContextual() {
  const { employeeId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <DashboardFlow employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function TerminationFlowContextual() {
  const { companyId, employeeId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return (
    <TerminationFlow
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function OnboardingExecutionFlowContextual() {
  const { companyId, onEvent, isSelfOnboardingEnabled, withEmployeeI9 } =
    useFlow<EmployeeListFlowContextInterface>()
  return (
    <OnboardingExecutionFlow
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
      withEmployeeI9={withEmployeeI9}
    />
  )
}
