import { Dashboard } from './Dashboard'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface DashboardContextInterface extends FlowContextInterface {
  employeeId: string
}

export function DashboardViewContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <Dashboard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
