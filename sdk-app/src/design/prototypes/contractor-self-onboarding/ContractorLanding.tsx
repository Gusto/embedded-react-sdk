import { useMemo } from 'react'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import DOMPurify from 'dompurify'
import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })

  const displayName = useMemo(
    () => DOMPurify.sanitize(contractor?.firstName ?? contractor?.businessName ?? 'there'),
    [contractor],
  )
  const companyName = useMemo(() => DOMPurify.sanitize(company?.name ?? 'Your company'), [company])

  return (
    <section className={className}>
      <Components.Box
        footer={
          <ActionsLayout>
            <Components.Button
              variant="primary"
              onClick={() => {
                onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SELF_ONBOARDING_START)
              }}
            >
              Get started
            </Components.Button>
          </ActionsLayout>
        }
      >
        <Flex alignItems="center" flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              Welcome, {displayName}! {companyName} has invited you to complete your onboarding.
            </Components.Heading>
            <Components.Text variant="supporting">
              We just need a few details from you to get set up.
            </Components.Text>
          </Flex>
          <Flex flexDirection="column" gap={8}>
            <Components.Heading as="h3">
              Here&apos;s what you&apos;ll need to do:
            </Components.Heading>
            <Components.UnorderedList
              items={[
                'Complete your profile and tax information',
                'Add your mailing address',
                'Set up your payment method',
                'Review and sign documents',
              ]}
            />
          </Flex>
        </Flex>
      </Components.Box>
    </section>
  )
}
