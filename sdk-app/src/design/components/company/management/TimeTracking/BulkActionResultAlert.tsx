import type { BulkActionResult } from './types'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const ACTION_LABELS: Record<BulkActionResult['action'], string> = {
  approved: 'approved',
  rejected: 'rejected',
  pending: 'returned to pending',
}

interface BulkActionResultAlertProps {
  result: BulkActionResult
  onDismiss?: () => void
}

export function BulkActionResultAlert({ result, onDismiss }: BulkActionResultAlertProps) {
  const Components = useComponentContext()
  const action = ACTION_LABELS[result.action]
  const succeededCount = result.succeeded.length
  const failedCount = result.failed.length

  if (failedCount === 0) {
    return (
      <Components.Alert
        status="success"
        label={`${succeededCount} ${succeededCount === 1 ? 'timesheet' : 'timesheets'} ${action}`}
        onDismiss={onDismiss}
      />
    )
  }

  const label =
    succeededCount === 0
      ? `${failedCount} ${failedCount === 1 ? 'timesheet' : 'timesheets'} couldn’t be ${action}`
      : `${succeededCount} ${action}, ${failedCount} couldn’t be ${action}`

  return (
    <Components.Alert
      status={succeededCount === 0 ? 'error' : 'warning'}
      label={label}
      onDismiss={onDismiss}
    >
      <Flex flexDirection="column" gap={8}>
        {result.failed.map(item => (
          <Flex key={item.id} flexDirection="column" gap={2}>
            <Components.Text weight="semibold">{item.label}</Components.Text>
            {item.messages.map(message => (
              <Components.Text key={message} size="sm">
                {message}
              </Components.Text>
            ))}
          </Flex>
        ))}
        {succeededCount > 0 ? (
          <Components.Text size="sm" variant="supporting">
            {`${action[0]!.toUpperCase()}${action.slice(1)}: ${result.succeeded.map(item => item.label).join(', ')}`}
          </Components.Text>
        ) : null}
      </Flex>
    </Components.Alert>
  )
}
