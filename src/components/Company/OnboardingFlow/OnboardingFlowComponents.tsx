import { Industry } from '../Industry'
import { BankAccount } from '../BankAccount/BankAccount'
import { PaySchedule } from '../PaySchedule'
import { StateTaxes } from '../StateTaxes/StateTaxes'
import { DocumentSigner } from '../DocumentSigner'
import { OnboardingOverview } from '../OnboardingOverview/OnboardingOverview'
import { FederalTaxes } from '../FederalTaxes'
import type { FederalTaxesDefaultValues } from '../FederalTaxes/useFederalTaxes'
import type { PayScheduleDefaultValues } from '../PaySchedule/PaySchedule'
import { Locations } from '@/components/Company/Locations/Locations'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { RequireAtLeastOne } from '@/types/Helpers'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import { OnboardingFlow as EmployeeOnboardingFlow } from '@/components/Employee/OnboardingFlow/OnboardingFlow'

/**
 * Default values for the company onboarding flow's per-step form components.
 *
 * @remarks
 * At least one of the step-level keys must be provided. Per-step values are
 * forwarded to the matching step component. If company data is already
 * available via the API, the corresponding values are overwritten.
 *
 * @public
 */
export type OnboardingFlowDefaultValues = RequireAtLeastOne<{
  /** Default values forwarded to the federal taxes step. */
  federalTaxes?: FederalTaxesDefaultValues
  /** Default values forwarded to the pay schedule step. */
  paySchedule?: PayScheduleDefaultValues
}>

/**
 * Props for the company onboarding flow orchestrator.
 *
 * @public
 */
export interface OnboardingFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** Default values applied to individual flow step components (federal taxes, pay schedule). */
  defaultValues?: RequireAtLeastOne<OnboardingFlowDefaultValues>
}
/** @internal */
export interface OnboardingFlowContextInterface extends FlowContextInterface {
  companyId: string
  defaultValues?: OnboardingFlowDefaultValues
}

/** @internal */
export function LocationsContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <Locations onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
/** @internal */
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

/** @internal */
export function IndustryContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <Industry onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
export function BankAccountContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <BankAccount onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
/** @internal */
export function EmployeesContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return (
    <EmployeeOnboardingFlow
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      showContinueButton
    />
  )
}
/** @internal */
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
/** @internal */
export function StateTaxesContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <StateTaxes onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
/** @internal */
export function DocumentSignerContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <DocumentSigner onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
/** @internal */
export function OnboardingOverviewContextual() {
  const { companyId, onEvent } = useFlow<OnboardingFlowContextInterface>()
  return <OnboardingOverview companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
