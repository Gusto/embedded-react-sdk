import { Dashboard } from './Dashboard'
import { HomeAddress } from '@/components/Employee/HomeAddress/management/HomeAddress'
import { WorkAddress } from '@/components/Employee/WorkAddress/management/WorkAddress'
import { FederalTaxes } from '@/components/Employee/FederalTaxes/management/FederalTaxes'
import { StateTaxes } from '@/components/Employee/StateTaxes/management/StateTaxes'
import { Profile } from '@/components/Employee/Profile/management/Profile'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface DashboardContextInterface extends FlowContextInterface {
  employeeId: string
}

export function DashboardViewContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <Dashboard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function HomeAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <HomeAddress employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function WorkAddressContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <WorkAddress employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <FederalTaxes employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function StateTaxesContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <StateTaxes employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function ProfileContextual() {
  const { employeeId, onEvent } = useFlow<DashboardContextInterface>()
  return <Profile employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
