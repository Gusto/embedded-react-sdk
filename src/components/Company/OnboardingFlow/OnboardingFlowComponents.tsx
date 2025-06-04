import { Industry } from '../Industry'
import { BankAccount } from '../BankAccount/BankAccount'
import { PaySchedule } from '../PaySchedule'
import { StateTaxes } from '../StateTaxes/StateTaxes'
import { DocumentSigner } from '../DocumentSigner'
import { OnboardingOverview } from '../OnboardingOverview/OnboardingOverview'
import { FederalTaxes } from '../FederalTaxes'
import type { FederalTaxesDefaultValues } from '../FederalTaxes/useFederalTaxes'
import type { PayScheduleDefaultValues } from '../PaySchedule/usePaySchedule'
import { Locations } from '@/components/Company/Locations/Locations'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { OnboardingFlow as EmployeeOnboardingFlow } from '@/components/Employee/OnboardingFlow/OnboardingFlow'

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
  return <Locations onEvent={onEvent} companyId={ensureRequired(companyId)} />
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
  return <BankAccount onEvent={onEvent} companyId={ensureRequired(companyId)} />
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
export function StateTaxesContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <StateTaxes onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function DocumentSignerContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <DocumentSigner onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
export function OnboardingOverviewContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <OnboardingOverview companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
