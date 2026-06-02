import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ContractorWelcomeProps {
  contractorName: string
  companyName: string
  onStart: () => void
  className?: string
}

export function ContractorWelcome({
  contractorName,
  companyName,
  onStart,
  className,
}: ContractorWelcomeProps) {
  const Components = useComponentContext()

  return (
    <section className={className}>
      <Components.Box
        footer={
          <ActionsLayout>
            <Components.Button variant="primary" onClick={onStart}>
              Get started
            </Components.Button>
          </ActionsLayout>
        }
      >
        <Flex alignItems="center" flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">
              Welcome, {contractorName}! {companyName} has invited you to complete your onboarding.
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
