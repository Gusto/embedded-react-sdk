import { Industry } from '../Industry'
import { BankAccountFlow } from '../BankAccount/BankAccountFlow'
import { PaySchedule } from '../PaySchedule'
import { StateTaxesFlow } from '../StateTaxes/StateTaxesFlow'
import { DocumentSignerFlow } from '../DocumentSignerFlow'
import { OnboardingOverview } from '../OnboardingOverview/OnboardingOverview'
import { EmployeeOnboardingFlow } from '@/components/Flow'
import { LocationsFlow } from '@/components/Company/Locations/LocationsFlow'
import type { UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { useFlowParams } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export interface OnboardingFlowContextInterface extends FlowContextInterface {
  companyId: string
}

function useOnboardingFlowParams(props: UseFlowParamsProps<OnboardingFlowContextInterface>) {
  return useFlowParams(props)
}

export function LocationsContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'Locations',
    requiredParams: ['companyId'],
  })
  return <LocationsFlow onEvent={onEvent} companyId={companyId} />
}

export function IndustryContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'Industry',
    requiredParams: ['companyId'],
  })
  return <Industry onEvent={onEvent} companyId={companyId} />
}

export function BankAccountContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'BankAccount',
    requiredParams: ['companyId'],
  })
  return <BankAccountFlow onEvent={onEvent} companyId={companyId} />
}
export function EmployeesContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'Employees',
    requiredParams: ['companyId'],
  })
  return <EmployeeOnboardingFlow onEvent={onEvent} companyId={companyId} />
}
export function PayScheduleContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'PaySchedule',
    requiredParams: ['companyId'],
  })
  return <PaySchedule onEvent={onEvent} companyId={companyId} />
}
export function StateTaxesFlowContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'StateTaxes',
    requiredParams: ['companyId'],
  })
  return <StateTaxesFlow onEvent={onEvent} companyId={companyId} />
}
export function DocumentSignerFlowContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'DocumentSigner',
    requiredParams: ['companyId'],
  })
  return <DocumentSignerFlow onEvent={onEvent} companyId={companyId} />
}
export function OnboardingOverviewContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'OnboardingOverview',
    requiredParams: ['companyId'],
  })
  return <OnboardingOverview companyId={companyId} onEvent={onEvent} />
}
