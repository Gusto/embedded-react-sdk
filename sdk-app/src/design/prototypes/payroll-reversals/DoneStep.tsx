import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'

interface DoneStepProps {
  onStartOver: () => void
}

export function DoneStep({ onStartOver }: DoneStepProps) {
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8}>
        <Components.Heading as="h2">Reversal submitted</Components.Heading>
        <Components.Text variant="supporting" size="sm">
          Your payroll reversal request has been submitted. Gusto will process the reversal and
          notify you of the outcome. You can monitor the status from your payroll history.
        </Components.Text>
      </Flex>

      <Components.Alert status="success" label="Reversal request received">
        <Components.Text size="sm">
          The reversal has been queued for processing. If fund recovery was requested, Gusto will
          submit ACH debit requests to the affected employee accounts. You will receive an email
          confirmation with the details.
        </Components.Text>
      </Components.Alert>

      <div>
        <Components.Button variant="secondary" onClick={onStartOver}>
          Start another reversal
        </Components.Button>
      </div>
    </Flex>
  )
}
