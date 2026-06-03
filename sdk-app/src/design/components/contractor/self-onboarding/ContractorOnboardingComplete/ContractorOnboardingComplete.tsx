import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ContractorOnboardingCompleteProps {
  onDone: () => void
  className?: string
}

export function ContractorOnboardingComplete({
  onDone,
  className,
}: ContractorOnboardingCompleteProps) {
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
          <Components.Button variant="secondary" onClick={onDone}>
            Done
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
