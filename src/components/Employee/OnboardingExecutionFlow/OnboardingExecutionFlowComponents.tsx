import type { PaymentMethodBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/paymentmethodbankaccount'
import { Deductions } from '../Deductions/onboarding/Deductions'
import { FederalTaxes } from '../FederalTaxes/onboarding/FederalTaxes'
import { StateTaxes } from '../StateTaxes/onboarding/StateTaxes'
import type { ProfileDefaultValues } from '../Profile/onboarding/Profile'
import type { CompensationDefaultValues } from '../Compensation'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { EmployeeOnboardingStatus } from '@/shared/constants'
import type { RequireAtLeastOne } from '@/types/Helpers'

export type OnboardingDefaultValues = RequireAtLeastOne<{
  profile?: ProfileDefaultValues
  compensation?: CompensationDefaultValues
}>

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
}

export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  return <FederalTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function StateTaxesContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return <StateTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} isAdmin={isAdmin} />
}

export function DeductionsContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  return <Deductions onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}
