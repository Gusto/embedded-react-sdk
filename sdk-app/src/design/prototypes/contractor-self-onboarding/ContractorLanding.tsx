import { useMemo } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import DOMPurify from 'dompurify'
import { ContractorWelcome } from '../../components/contractor/self-onboarding/ContractorWelcome/ContractorWelcome'
import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'

interface ContractorLandingProps extends CommonComponentInterface {
  contractorId: string
  companyId: string
}

export function ContractorLanding(props: ContractorLandingProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const Root = ({ contractorId, companyId, className }: ContractorLandingProps) => {
  const { onEvent: _onEvent } = useBase()
  const onEvent = _onEvent as (type: string, data?: unknown) => void

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })

  const contractorName = useMemo(
    () => DOMPurify.sanitize(contractor?.firstName ?? contractor?.businessName ?? 'there'),
    [contractor],
  )
  const companyName = useMemo(() => DOMPurify.sanitize(company?.name ?? 'Your company'), [company])

  return (
    <ContractorWelcome
      className={className}
      contractorName={contractorName}
      companyName={companyName}
      onStart={() => {
        onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_START)
      }}
    />
  )
}
