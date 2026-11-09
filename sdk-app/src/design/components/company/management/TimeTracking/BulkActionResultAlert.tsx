import type { BulkActionResult } from './types'
import { pluralize } from './formatters'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const ACTION_VERBS: Record<BulkActionResult['action'], { done: string; attempt: string }> = {
  approved: { done: 'approved', attempt: 'approve' },
  rejected: { done: 'rejected', attempt: 'reject' },
  pending: { done: 'unapproved', attempt: 'unapprove' },
  deleted: { done: 'deleted', attempt: 'delete' },
}

interface BulkActionResultAlertProps {
  result: BulkActionResult
  itemNoun?: string
  onDismiss?: () => void
}

/** Copy follows Gusto's approval toasts: all, "x of y", or none succeeded. */
export function BulkActionResultAlert({
  result,
  itemNoun = 'timesheet',
  onDismiss,
}: BulkActionResultAlertProps) {
  const Components = useComponentContext()
  const verbs = ACTION_VERBS[result.action]
  const succeededCount = result.succeeded.length
  const failedCount = result.failed.length
  const total = succeededCount + failedCount
  const capitalizedNoun = itemNoun.charAt(0).toUpperCase() + itemNoun.slice(1)

  if (failedCount === 0) {
    return (
      <Components.Alert
        status="success"
        label={
          succeededCount === 1
            ? `${capitalizedNoun} ${verbs.done}`
            : `${pluralize(succeededCount, itemNoun)} ${verbs.done}`
        }
        onDismiss={onDismiss}
      />
    )
  }

  const label =
    succeededCount === 0
      ? total === 1
        ? `We could not ${verbs.attempt} the ${itemNoun}.`
        : `We could not ${verbs.attempt} ${pluralize(failedCount, itemNoun)}.`
      : `We could only ${verbs.attempt} ${succeededCount} of ${total} ${itemNoun}s.`

  return (
    <Components.Alert
      status={succeededCount === 0 ? 'error' : 'info'}
      label={label}
      onDismiss={onDismiss}
    >
      <Flex flexDirection="column" gap={8}>
        {result.failed.map(item => (
          <Flex key={item.id} flexDirection="column" gap={2}>
            <Components.Text weight="semibold">{item.label}</Components.Text>
            {item.messages.length > 0 ? (
              item.messages.map(message => (
                <Components.Text key={message} size="sm">
                  {message}
                </Components.Text>
              ))
            ) : (
              <Components.Text size="sm">Please try again.</Components.Text>
            )}
          </Flex>
        ))}
      </Flex>
    </Components.Alert>
  )
}
