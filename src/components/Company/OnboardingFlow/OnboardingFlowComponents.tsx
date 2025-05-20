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
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

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

export function LocationsContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <LocationsFlow onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function FederalTaxesContextual() {
  const { companyId, defaultValues, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return (
    <FederalTaxes
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      defaultValues={defaultValues?.federalTaxes}
    />
  )
}

export function IndustryContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <Industry onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function BankAccountContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <BankAccountFlow onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function EmployeesContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <EmployeeOnboardingFlow onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function PayScheduleContextual() {
  const { companyId, defaultValues, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return (
    <PaySchedule
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      defaultValues={defaultValues?.paySchedule}
    />
  )
}
export function StateTaxesFlowContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <StateTaxesFlow onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function DocumentSignerFlowContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <DocumentSignerFlow onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function OnboardingOverviewContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <OnboardingOverview companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
