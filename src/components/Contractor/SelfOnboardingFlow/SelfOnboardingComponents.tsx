import { ContractorProfile } from '../Profile'
import { Address } from '../Address'
import { PaymentMethod } from '../PaymentMethod/PaymentMethod'
import { DocumentSigner } from '../DocumentSigner'
import { SelfOnboardingSummary } from '../SelfOnboardingSummary'
import { Landing } from '../Landing'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'

export interface SelfOnboardingFlowProps extends BaseComponentInterface {
  companyId: string
  contractorId: string
}

export interface SelfOnboardingContextInterface extends FlowContextInterface {
  companyId: string
  contractorId: string
}

export function LandingContextual() {
  const { companyId, contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <Landing
      companyId={ensureRequired(companyId)}
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
    />
  )
}

export function ProfileContextual() {
  const { companyId, contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return (
    <ContractorProfile
      companyId={ensureRequired(companyId)}
      contractorId={ensureRequired(contractorId)}
      onEvent={onEvent}
      isAdmin={false}
    />
  )
}

export function AddressContextual() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <Address contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

export function PaymentMethodContextual() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <PaymentMethod contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

export function DocumentSignerContextual() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <DocumentSigner contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}

export function SummaryContextual() {
  const { contractorId, onEvent } = useFlow<SelfOnboardingContextInterface>()
  return <SelfOnboardingSummary contractorId={ensureRequired(contractorId)} onEvent={onEvent} />
}
