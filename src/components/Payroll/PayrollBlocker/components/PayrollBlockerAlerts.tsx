import { useTranslation } from 'react-i18next'
import { useInformationRequestsGetInformationRequests } from '@gusto/embedded-api/react-query/informationRequestsGetInformationRequests'
import { useRecoveryCasesGet } from '@gusto/embedded-api/react-query/recoveryCasesGet'
import { InformationRequestStatus } from '@gusto/embedded-api/models/components/informationrequest'
import { RecoveryCaseStatus } from '@gusto/embedded-api/models/components/recoverycase'
import { type ApiPayrollBlocker, getBlockerTranslationKeys } from '../payrollHelpers'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'

interface PayrollBlockerAlertsProps {
  companyId?: string
  blockers: ApiPayrollBlocker[]
  className?: string
  onMultipleViewClick?: () => void
  multipleViewLabel?: string
}

/**
 * PayrollBlockerAlerts - Alert-style component for inline blocker display
 * Shows single blocker as alert, or multiple blockers as summary with "Review" button
 * Also includes payroll-blocking information requests and unresolved recovery cases
 * Returns null for empty blocker arrays
 */
export function PayrollBlockerAlerts({
  companyId,
  blockers,
  onMultipleViewClick,
  multipleViewLabel,
  className,
}: PayrollBlockerAlertsProps) {
  useI18n('Payroll.PayrollBlocker')
  const { t } = useTranslation('Payroll.PayrollBlocker')
  const { Alert, Button, Text, UnorderedList } = useComponentContext()

  const { data: informationRequestsData } = useInformationRequestsGetInformationRequests(
    { companyUuid: companyId ?? '' },
    { enabled: !!companyId },
  )

  const { data: recoveryCasesData } = useRecoveryCasesGet(
    { companyUuid: companyId ?? '' },
    { enabled: !!companyId },
  )

  const blockingInformationRequests =
    informationRequestsData?.informationRequestList?.filter(
      req => req.blockingPayroll && req.status !== InformationRequestStatus.Approved,
    ) ?? []

  const unresolvedRecoveryCases =
    recoveryCasesData?.recoveryCaseList?.filter(
      recoveryCase =>
        recoveryCase.status === RecoveryCaseStatus.Open ||
        recoveryCase.status === RecoveryCaseStatus.RedebitInitiated ||
        recoveryCase.status === RecoveryCaseStatus.WireInitiated,
    ) ?? []

  const hasBlockingRFIs = blockingInformationRequests.length > 0
  const hasUnresolvedRecoveryCases = unresolvedRecoveryCases.length > 0

  const allBlockers = [...blockers]

  if (hasBlockingRFIs) {
    allBlockers.push({
      key: 'pending_information_request',
      message: t('blockers.pending_information_request.description'),
    })
  }

  if (hasUnresolvedRecoveryCases) {
    allBlockers.push({
      key: 'pending_recovery_case',
      message: t('blockers.pending_recovery_case.description'),
    })
  }

  const uniqueBlockersMap = new Map<string, ApiPayrollBlocker>()
  allBlockers.forEach(blocker => {
    if (!uniqueBlockersMap.has(blocker.key)) {
      uniqueBlockersMap.set(blocker.key, blocker)
    }
  })
  const uniqueBlockers = Array.from(uniqueBlockersMap.values())

  if (uniqueBlockers.length === 0) {
    return null
  }

  const hasMultipleBlockers = uniqueBlockers.length > 1

  const enrichedBlockers = uniqueBlockers.map(blocker => {
    const translationKeys = getBlockerTranslationKeys(blocker.key)

    const title = t(translationKeys.titleKey, {
      defaultValue: t('defaultBlockerDescription'),
    })
    const description = t(translationKeys.descriptionKey, {
      defaultValue: blocker.message || t('defaultBlockerDescription'),
    })
    const helpText = t(translationKeys.helpTextKey, {
      defaultValue: t('defaultBlockerHelp'),
    })

    return {
      ...blocker,
      title,
      description,
      helpText,
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
      label={t('multipleIssuesTitle', { count: uniqueBlockers.length })}
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
