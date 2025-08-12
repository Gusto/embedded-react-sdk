import type { PaymentMethodBankAccount } from '@gusto/embedded-api/models/components/paymentmethodbankaccount'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { useFlow } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Landing as LandingComponent } from '@/components/Employee/Landing'
import { Profile as ProfileComponent } from '@/components/Employee/Profile'
import { FederalTaxes as FederalTaxesComponent } from '@/components/Employee/FederalTaxes'
import { StateTaxes as StateTaxesComponent } from '@/components/Employee/StateTaxes'
import { PaymentMethod as PaymentMethodComponent } from '@/components/Employee/PaymentMethod'
import { OnboardingSummary as OnboardingSummaryComponent } from '@/components/Employee/OnboardingSummary'

export interface SelfOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}
export interface SelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  paymentMethod?: PaymentMethodBankAccount
}

export function Landing() {
  const { companyId, employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <LandingComponent
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}

export function Profile() {
  const { companyId, employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <ProfileComponent
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

export function FederalTaxes() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <FederalTaxesComponent employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function StateTaxes() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <StateTaxesComponent
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

export function PaymentMethod() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <PaymentMethodComponent employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function OnboardingSummary() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <OnboardingSummaryComponent
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}
