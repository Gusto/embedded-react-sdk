import { useTranslation } from 'react-i18next'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { useI18n } from '@/i18n'

interface TerminationSummaryPresentationProps {
  employeeName: string
  effectiveDate: string | undefined
  canCancel: boolean
  canEdit: boolean
  showRunPayroll: boolean
  showRunOffCyclePayroll: boolean
  onCancelClick: () => void
  onEditDismissal: () => void
  onRunDismissalPayroll: () => void
  onRunOffCyclePayroll: () => void
  isLoading: boolean
  isCancelDialogOpen: boolean
  onDialogClose: () => void
  onDialogConfirm: () => void
  isCancelling: boolean
}

export function TerminationSummaryPresentation({
  employeeName,
  effectiveDate,
  canCancel,
  canEdit,
  showRunPayroll,
  showRunOffCyclePayroll,
  onCancelClick,
  onEditDismissal,
  onRunDismissalPayroll,
  onRunOffCyclePayroll,
  isLoading,
  isCancelDialogOpen,
  onDialogClose,
  onDialogConfirm,
  isCancelling,
}: TerminationSummaryPresentationProps) {
  const { Alert, Heading, Text, Button, DescriptionList, Dialog } = useComponentContext()
  const { formatLongWithYear } = useDateFormatter()
  useI18n('Terminations.TerminationSummary')
  const { t } = useTranslation('Terminations.TerminationSummary')

  const formattedDate = formatLongWithYear(effectiveDate) || 'N/A'

  const dateItems = [
    {
      term: t('dates.lastDayOfWork'),
      description: formattedDate,
    },
    {
      term: t('dates.lastPayDay'),
      description: formattedDate,
    },
  ]

  const hasActions = canCancel || canEdit || showRunPayroll || showRunOffCyclePayroll

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        <Alert status="success" label={t('alert.success.label', { employeeName })} />
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('subtitle')}</Text>
      </Flex>

      <DescriptionList items={dateItems} />

      {hasActions && (
        <ActionsLayout>
          {canCancel && (
            <Button variant="error" onClick={onCancelClick} isDisabled={isLoading}>
              {t('actions.cancelTermination')}
            </Button>
          )}
          {canEdit && (
            <Button variant="secondary" onClick={onEditDismissal} isDisabled={isLoading}>
              {t('actions.editDismissal')}
            </Button>
          )}
          {showRunPayroll && (
            <Button variant="primary" onClick={onRunDismissalPayroll} isDisabled={isLoading}>
              {t('actions.runDismissalPayroll')}
            </Button>
          )}
          {showRunOffCyclePayroll && (
            <Button variant="primary" onClick={onRunOffCyclePayroll} isDisabled={isLoading}>
              {t('actions.runOffCyclePayroll')}
            </Button>
          )}
        </ActionsLayout>
      )}

      <Dialog
        isOpen={isCancelDialogOpen}
        onClose={onDialogClose}
        onPrimaryActionClick={onDialogConfirm}
        isDestructive
        isPrimaryActionLoading={isCancelling}
        primaryActionLabel={t('cancelDialog.confirm')}
        closeActionLabel={t('cancelDialog.cancel')}
        title={t('cancelDialog.title')}
      >
        <Text>{t('cancelDialog.body')}</Text>
      </Dialog>
    </Flex>
  )
}
