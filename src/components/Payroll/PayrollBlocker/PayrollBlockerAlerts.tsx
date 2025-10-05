import { useTranslation } from 'react-i18next'
import { getBlockerMetadata, getBlockerTranslationKeys } from './blockerMetadata'
import type { ApiPayrollBlocker } from './payrollHelpers'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'

interface PayrollBlockerAlertsProps {
  blockers: ApiPayrollBlocker[]
  className?: string
  onMultipleViewClick?: () => void
  multipleViewLabel?: string
}

/**
 * PayrollBlockerAlerts - Alert-style component for inline blocker display
 * Shows single blocker as alert, or multiple blockers as summary with "Review" button
 * Returns null for empty blocker arrays
 */
export function PayrollBlockerAlerts({
  blockers,
  onMultipleViewClick,
  multipleViewLabel,
  className,
}: PayrollBlockerAlertsProps) {
  useI18n('PayrollBlocker')
  const { t } = useTranslation('PayrollBlocker')
  const { Alert, Button, Text, UnorderedList } = useComponentContext()

  // Return null for empty blockers array
  if (blockers.length === 0) {
    return null
  }

  const hasMultipleBlockers = blockers.length > 1

  // Enrich blockers with metadata and translations at component level
  const enrichedBlockers = blockers.map(blocker => {
    const metadata = getBlockerMetadata(blocker.key, blocker.message)
    const translationKeys = getBlockerTranslationKeys(blocker.key)

    // Try to get translated values, fallback to metadata defaults
    const title = t(translationKeys.titleKey, { defaultValue: metadata.title })
    const description = t(translationKeys.descriptionKey, { defaultValue: metadata.description })
    const helpText = t(translationKeys.helpTextKey, { defaultValue: metadata.helpText || '' })

    return {
      ...blocker,
      title,
      description,
      helpText,
      metadata,
    }
  })

  const singleBlocker = enrichedBlockers[0]

  if (!hasMultipleBlockers && singleBlocker) {
    return (
      <Alert status="error" label={singleBlocker.title} className={className}>
        <Flex flexDirection="column" gap={8}>
          <Text>{singleBlocker.description}</Text>
          {singleBlocker.helpText && singleBlocker.helpText !== singleBlocker.description && (
            <Text variant="supporting" size="sm">
              {singleBlocker.helpText}
            </Text>
          )}
        </Flex>
      </Alert>
    )
  }

  const listItems = enrichedBlockers.map(blocker => blocker.title)
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
