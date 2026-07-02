import { ensureRequired } from '@/helpers/ensureRequired'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import { useFlow } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Landing as LandingComponent } from '@/components/Contractor/Landing'
import { ContractorProfile as ProfileComponent } from '@/components/Contractor/Profile'
import { Address as AddressComponent } from '@/components/Contractor/Address'
import { PaymentMethod as PaymentMethodComponent } from '@/components/Contractor/PaymentMethod/PaymentMethod'
import { DocumentSigner as DocumentSignerComponent } from '@/components/Contractor/Documents/DocumentSigner'
import { OnboardingSummary as OnboardingSummaryComponent } from '@/components/Contractor/OnboardingSummary'

/**
 * Props for {@link SelfOnboardingFlow}.
 *
 * @public
 */
export interface SelfOnboardingFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
  /** The associated contractor identifier. */
  contractorId: string
}

/** @internal */
export interface SelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  contractorId: string
}

/** @internal */
export function Landing() {
  const { companyId, contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <LandingComponent
      companyId={ensureRequired(companyId)}
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function Profile() {
  const { companyId, contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <ProfileComponent
      companyId={ensureRequired(companyId)}
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

/** @internal */
export function Address() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <AddressComponent contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function PaymentMethod() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <PaymentMethodComponent contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function DocumentSigner() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <DocumentSignerComponent contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

/** @internal */
export function OnboardingSummary() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <OnboardingSummaryComponent contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
  )
}
