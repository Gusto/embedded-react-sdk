import { useTranslation, Trans } from 'react-i18next'
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
  showSuccessAlert: boolean
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
  showSuccessAlert,
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
  const { Alert, Heading, Text, Button, DescriptionList, Dialog, Link } = useComponentContext()
  const { formatLongWithYear } = useDateFormatter()
  useI18n('Employee.Terminations.TerminationSummary')
  const { t } = useTranslation('Employee.Terminations.TerminationSummary')

  const formattedDate = formatLongWithYear(effectiveDate) || 'N/A'

  const dateItems = [
    {
      term: t('dates.today'),
      description: t('dates.dismissed', { employeeName }),
    },
    {
      term: formattedDate,
      description: t('dates.lastDayOfWork'),
    },
    {
      term: formattedDate,
      description: t('dates.lastPayDay'),
    },
  ]

  const hasActions = canCancel || canEdit || showRunPayroll || showRunOffCyclePayroll

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={4}>
        {showSuccessAlert && (
          <Alert status="success" label={t('alert.success.label', { employeeName })} />
        )}
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('subtitle')}</Text>
      </Flex>

      <DescriptionList items={dateItems} />

      <Flex flexDirection="column" gap={16}>
        <Heading as="h3">{t('offboarding.title')}</Heading>

        <Flex flexDirection="column" gap={16}>
          <Flex flexDirection="column" gap={8}>
            <Heading as="h4">{t('offboarding.runPayroll.title')}</Heading>
            <Text>
              <Trans
                i18nKey="offboarding.runPayroll.description"
                t={t}
                components={{
                  StateRequirementsLink: <Link />,
                }}
              />
            </Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Heading as="h4">{t('offboarding.taxForms.title')}</Heading>
            <Text>{t('offboarding.taxForms.description')}</Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            <Heading as="h4">{t('offboarding.disconnectAccounts.title')}</Heading>
            <Text>{t('offboarding.disconnectAccounts.description')}</Text>
          </Flex>
        </Flex>
      </Flex>

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
