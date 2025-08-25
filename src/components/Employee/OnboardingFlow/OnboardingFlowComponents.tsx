import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import { FederalTaxes } from '../FederalTaxes/FederalTaxes'
import { StateTaxes } from '../StateTaxes/StateTaxes'
import type { ProfileDefaultValues } from '../Profile'
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
}

export function FederalTaxesContextual() {
  const { employeeId, onEvent } = useFlow<OnboardingContextInterface>()
  return <FederalTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function StateTaxesContextual() {
  const { employeeId, onEvent, isAdmin } = useFlow<OnboardingContextInterface>()
  return <StateTaxes onEvent={onEvent} employeeId={ensureRequired(employeeId)} isAdmin={isAdmin} />
}
