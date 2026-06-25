import type { PaymentMethodBankAccount } from '@gusto/embedded-api-v-2025-11-15/models/components/paymentmethodbankaccount'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { useFlow } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Landing as LandingComponent } from '@/components/Employee/Landing'
import { Profile as ProfileComponent } from '@/components/Employee/Profile/onboarding/Profile'
import { FederalTaxes as FederalTaxesComponent } from '@/components/Employee/FederalTaxes/onboarding/FederalTaxes'
import { StateTaxes as StateTaxesComponent } from '@/components/Employee/StateTaxes/onboarding'
import { PaymentMethod as PaymentMethodComponent } from '@/components/Employee/PaymentMethod'
import { OnboardingSummary as OnboardingSummaryComponent } from '@/components/Employee/OnboardingSummary'
import { DocumentSigner as DocumentSignerComponent } from '@/components/Employee/Documents/onboarding/DocumentSigner'

/**
 * Props for {@link SelfOnboardingFlow}.
 *
 * @public
 */
export interface SelfOnboardingFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** The associated employee identifier. */
  employeeId: string
  /** When true, the Document Signer step checks if the employee has I-9 enabled and routes to the Employment Eligibility and I-9 signature form steps. Defaults to `false`. */
  withEmployeeI9?: boolean
}

/** @internal */
export interface SelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  withEmployeeI9?: boolean
  paymentMethod?: PaymentMethodBankAccount
}

/** @internal */
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

/** @internal */
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

/** @internal */
export function FederalTaxes() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <FederalTaxesComponent employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
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

/** @internal */
export function PaymentMethod() {
  const { employeeId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <PaymentMethodComponent employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
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

/** @internal */
export function DocumentSigner() {
  const { employeeId, withEmployeeI9 = false, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <DocumentSignerComponent
      employeeId={ensureRequired(employeeId)}
      withEmployeeI9={withEmployeeI9}
      onEvent={onEvent}
    />
  )
}
