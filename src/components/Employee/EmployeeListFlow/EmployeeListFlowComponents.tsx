import { ManagementEmployeeList } from '../EmployeeList/management/ManagementEmployeeList'
import { DashboardFlow } from '../Dashboard'
import { TerminationFlow } from '../Terminations/TerminationFlow/TerminationFlow'
import { OnboardingExecutionFlow } from '../OnboardingExecutionFlow/OnboardingExecutionFlow'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface EmployeeListFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface EmployeeListFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
}

export function EmployeeListContextual() {
  const { companyId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <ManagementEmployeeList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

export function DashboardFlowContextual() {
  const { employeeId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <DashboardFlow employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

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

export function OnboardingFlowContextual() {
  const { companyId, onEvent } = useFlow<EmployeeListFlowContextInterface>()
  return <OnboardingExecutionFlow companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
