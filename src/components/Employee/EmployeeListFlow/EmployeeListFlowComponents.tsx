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
export interface EmployeeListFlowProps extends BaseComponentInterface {
  /** The associated company identifier. */
  companyId: string
}

/** @internal */
export interface EmployeeListFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
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
  const { companyId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <OnboardingExecutionFlow companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
