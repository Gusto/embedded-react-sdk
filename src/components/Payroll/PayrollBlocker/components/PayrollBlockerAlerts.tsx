import { useTranslation } from 'react-i18next'
import {
  type ApiPayrollBlocker,
  getBlockerTranslationKeys,
  hasActionableBlockers,
} from '../payrollHelpers'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'

interface PayrollBlockerAlertsProps {
  blockers: ApiPayrollBlocker[]
  className?: string
  onViewBlockersClick?: () => void
  viewBlockersLabel?: string
}

export function PayrollBlockerAlerts({
  blockers,
  onViewBlockersClick,
  viewBlockersLabel,
  className,
}: PayrollBlockerAlertsProps) {
  useI18n('Payroll.PayrollBlocker')
  const { t } = useTranslation('Payroll.PayrollBlocker')
  const { Alert, Button, Text, UnorderedList } = useComponentContext()

  if (blockers.length === 0) {
    return null
  }

  const hasMultipleBlockers = blockers.length > 1
  const showViewBlockersCta =
    Boolean(onViewBlockersClick) && (hasMultipleBlockers || hasActionableBlockers(blockers))

  const enrichedBlockers = blockers.map(blocker => {
    const translationKeys = getBlockerTranslationKeys(blocker.key)

    const title = t(translationKeys.titleKey, {
      defaultValue: t('defaultBlockerDescription'),
    })
    const description = t(translationKeys.descriptionKey, {
      defaultValue: blocker.message || t('defaultBlockerDescription'),
    })
    const helpText = t(translationKeys.helpTextKey, { defaultValue: t('defaultBlockerHelp') })

    return {
      ...blocker,
      title,
      description,
      helpText,
    }
  })

  const ctaLabel = viewBlockersLabel || t(hasMultipleBlockers ? 'viewAllBlockers' : 'viewBlocker')

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
          {showViewBlockersCta && (
            <div>
              <Button variant="secondary" onClick={onViewBlockersClick} title={ctaLabel}>
                {ctaLabel}
              </Button>
            </div>
          )}
        </Flex>
      </Alert>
    )
  }

  const listItems = enrichedBlockers.map(blocker => blocker.title)

  return (
    <Alert
      status="error"
      label={t('multipleIssuesTitle', { count: blockers.length })}
      className={className}
    >
      <Flex flexDirection="column" gap={16}>
        <UnorderedList items={listItems} />
        {showViewBlockersCta && (
          <div>
            <Button variant="secondary" onClick={onViewBlockersClick} title={ctaLabel}>
              {ctaLabel}
            </Button>
          </div>
        )}
      </Flex>
    </Alert>
  )
}
