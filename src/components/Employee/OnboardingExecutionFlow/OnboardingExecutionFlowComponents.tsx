import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import { Deductions } from '../Deductions/onboarding/Deductions'
import { FederalTaxes } from '../FederalTaxes/onboarding/FederalTaxes'
import { StateTaxes } from '../StateTaxes/onboarding/StateTaxes'
import type { ProfileDefaultValues } from '../Profile/onboarding/Profile'
import type { CompensationDefaultValues } from '../Compensation'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { EmployeeOnboardingStatus } from '@/shared/constants'
import type { RequireAtLeastOne } from '@/types/Helpers'

/**
 * Default values for the onboarding flow's per-step form components.
 *
 * @remarks
 * At least one of the step-level keys must be provided. Per-step values are
 * forwarded to the matching step component (e.g. `profile` to {@link Profile},
 * `compensation` to {@link Compensation}). If employee data is available via
 * the API, the corresponding values are overwritten.
 *
 * @public
 */
export type OnboardingDefaultValues = RequireAtLeastOne<{
  /** Default values for the profile step. */
  profile?: ProfileDefaultValues
  /** Default values for the compensation step. */
  compensation?: CompensationDefaultValues
}>

/** @internal */
export interface OnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId?: string
  isAdmin?: boolean
  onboardingStatus?: (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus]
  startDate?: string
  paymentMethod?: PaymentMethodBankAccount
  defaultValues?: OnboardingDefaultValues
  isSelfOnboardingEnabled?: boolean
  withEmployeeI9?: boolean
  showContinueButton?: boolean
}

/** @internal */
export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  return <FederalTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

/** @internal */
export function StateTaxesContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return <StateTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} isAdmin={isAdmin} />
}

/** @internal */
export function DeductionsContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  return <Deductions onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}
