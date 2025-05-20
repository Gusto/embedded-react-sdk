import { Industry } from '../Industry'
import { BankAccountFlow } from '../BankAccount/BankAccountFlow'
import { PaySchedule } from '../PaySchedule'
import { StateTaxesFlow } from '../StateTaxes/StateTaxesFlow'
import { DocumentSignerFlow } from '../DocumentSignerFlow'
import { OnboardingOverview } from '../OnboardingOverview/OnboardingOverview'
import { FederalTaxes } from '../FederalTaxes'
import type { FederalTaxesDefaultValues } from '../FederalTaxes/useFederalTaxes'
import type { PayScheduleDefaultValues } from '../PaySchedule/usePaySchedule'
import { EmployeeOnboardingFlow } from '@/components/Flow'
import { LocationsFlow } from '@/components/Company/Locations/LocationsFlow'
import type { UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { useFlowParams } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'

export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  federalTaxes?: FederalTaxesDefaultValues
  paySchedule?: PayScheduleDefaultValues
}>
export interface OnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
export interface OnboardingFlowContextInterface extends FlowContextInterface {
  companyId: string
  defaultValues?: OnboardingFlowDefaultValues
}

function useOnboardingFlowParams(props: UseFlowParamsProps<OnboardingFlowContextInterface>) {
  return useFlowParams<OnboardingFlowContextInterface>(props)
}

export function LocationsContextual() {
  const { companyId, onEvent } = useOnboardingFlowParams({
    component: 'Locations',
    requiredParams: ['companyId'],
  })
  return <LocationsFlow onEvent={onEvent} companyId={companyId} />
}
export function FederalTaxesContextual() {
  const { companyId, defaultValues, onEvent } = useOnboardingFlowParams({
    component: 'FederalTaxes',
    requiredParams: ['companyId'],
  })
  return (
    <FederalTaxes
      onEvent={onEvent}
      companyId={companyId}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      defaultValues={defaultValues?.federalTaxes}
    />
  )
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
  const { companyId, defaultValues, onEvent } = useOnboardingFlowParams({
    component: 'PaySchedule',
    requiredParams: ['companyId'],
  })
  return (
    <PaySchedule
      onEvent={onEvent}
      companyId={companyId}
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      defaultValues={defaultValues?.paySchedule}
    />
  )
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
