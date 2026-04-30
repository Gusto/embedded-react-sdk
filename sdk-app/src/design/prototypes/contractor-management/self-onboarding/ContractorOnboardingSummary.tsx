import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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

const Root = ({ className }: ContractorOnboardingSummaryProps) => {
  const { onEvent: _onEvent } = useBase()
  const onEvent = _onEvent as (type: string, data?: unknown) => void
  const Components = useComponentContext()

  return (
    <section className={className}>
      <Flex flexDirection="column" gap={32}>
        <Flex alignItems="center" flexDirection="column" gap={8}>
          <Components.Heading as="h2" textAlign="center">
            You&apos;re all set!
          </Components.Heading>
          <Components.Text textAlign="center">
            Your onboarding information has been submitted. Your company will review your details
            and you&apos;ll be notified if anything else is needed.
          </Components.Text>
        </Flex>
        <ActionsLayout justifyContent="center">
          <Components.Button
            variant="secondary"
            onClick={() => {
              onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_DONE)
            }}
          >
            Done
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
