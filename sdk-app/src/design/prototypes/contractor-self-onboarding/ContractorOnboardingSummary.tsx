import { ContractorOnboardingComplete } from '../../components/contractor/self-onboarding/ContractorOnboardingComplete/ContractorOnboardingComplete'
import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'

interface ContractorOnboardingSummaryProps extends CommonComponentInterface {
  contractorId: string
}

export function ContractorOnboardingSummary(
  props: ContractorOnboardingSummaryProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ className }: ContractorOnboardingSummaryProps) {
  const { onEvent: _onEvent } = useBase()
  const onEvent = _onEvent as (type: string, data?: unknown) => void

  return (
    <ContractorOnboardingComplete
      className={className}
      onDone={() => {
        onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_DONE)
      }}
    />
  )
}
