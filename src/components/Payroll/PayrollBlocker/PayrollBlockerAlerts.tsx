import { useTranslation } from 'react-i18next'
import type { PayrollBlockerProps } from './PayrollBlockerTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'

/**
 * PayrollBlockerAlerts - Alert-style component for inline blocker display
 * Shows single blocker as alert, or multiple blockers as summary with "Review" button
 */
export function PayrollBlockerAlerts({
  blockers,
  onMultipleViewClick,
  multipleViewLabel,
  className,
}: PayrollBlockerProps) {
  useI18n('PayrollBlocker')
  const { t } = useTranslation('PayrollBlocker')
  const { Alert, Button, Text, UnorderedList } = useComponentContext()

  if (blockers.length === 0) {
    return null
  }

  const hasMultipleBlockers = blockers.length > 1
  const singleBlocker = blockers[0]

  if (!hasMultipleBlockers && singleBlocker) {
    const action = singleBlocker.action

    return (
      <Alert status="error" label={singleBlocker.title} className={className}>
        <Flex flexDirection="column" gap={8}>
          <Text>{singleBlocker.description}</Text>
          {singleBlocker.helpText && (
            <Text variant="supporting" size="sm">
              {singleBlocker.helpText}
            </Text>
          )}
          {action && (
            <div>
              <Button variant="secondary" onClick={action.onClick} title={action.label}>
                {action.label}
              </Button>
            </div>
          )}
        </Flex>
      </Alert>
    )
  }

  const listItems = blockers.map(blocker => blocker.title)
  const defaultMultipleLabel = multipleViewLabel || t('viewAllBlockers')

  return (
    <Alert
      status="error"
      label={t('multipleIssuesTitle', { count: blockers.length })}
      className={className}
    >
      <Flex flexDirection="column" gap={16}>
        <UnorderedList items={listItems} />
        {onMultipleViewClick && (
          <div>
            <Button variant="secondary" onClick={onMultipleViewClick} title={defaultMultipleLabel}>
              {defaultMultipleLabel}
            </Button>
          </div>
        )}
      </Flex>
    </Alert>
  )
}
