import { DashboardView } from './DashboardView'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface DashboardContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
}

export function DashboardViewContextual() {
  const { companyId, employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return (
    <DashboardView
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}
