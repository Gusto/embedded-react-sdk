import { Dashboard } from './Dashboard'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface DashboardContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
}

export function DashboardViewContextual() {
  const { companyId, employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <Dashboard
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}
