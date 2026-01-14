import { useTranslation } from 'react-i18next'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleType } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Flex, ActionsLayout, DataView } from '@/components/Common'
import { useDateFormatter } from '@/hooks/useDateFormatter'

interface ManagePayScheduleReviewPresentationProps {
  preview: PayScheduleAssignmentPreview | null
  assignmentType: PayScheduleType
  isLoading: boolean
  isSubmitting: boolean
  onConfirm: () => void
  onBack: () => void
}

export function ManagePayScheduleReviewPresentation({
  preview,
  assignmentType,
  isLoading,
  isSubmitting,
  onConfirm,
  onBack,
}: ManagePayScheduleReviewPresentationProps) {
  useI18n('CompanyManagement.ManagePayScheduleReview')
  const { t } = useTranslation('CompanyManagement.ManagePayScheduleReview')
  const { Heading, Text, Button, LoadingSpinner } = useComponentContext()
  const dateFormatter = useDateFormatter()

  const hasChanges = (preview?.employeeChanges?.length ?? 0) > 0
  const showScheduleColumn = assignmentType !== PayScheduleAssignmentBodyType.Single

  if (isLoading) {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center" gap={16}>
        <LoadingSpinner />
        <Text>{t('loading')}</Text>
      </Flex>
    )
  }

  const formatTransitionPeriod = (change: PayScheduleAssignmentEmployeeChange): string => {
    if (!change.transitionPayPeriod) {
      return t('noTransition')
    }
    const { startDate, endDate } = change.transitionPayPeriod
    if (startDate && endDate) {
      return `${dateFormatter.formatShort(startDate)} - ${dateFormatter.formatShort(endDate)}`
    }
    return t('noTransition')
  }

  return (
    <Flex flexDirection="column" gap={24}>
      <Flex flexDirection="column" gap={8}>
        <Heading as="h2">{hasChanges ? t('title') : t('emptyTitle')}</Heading>
        <Text>{hasChanges ? t('description') : t('emptyDescription')}</Text>
      </Flex>

      {hasChanges && (
        <DataView
          label={t('tableLabel')}
          columns={[
            {
              title: <Text weight="semibold">{t('columns.name')}</Text>,
              render: (change: PayScheduleAssignmentEmployeeChange) => (
                <Text weight="semibold">{`${change.firstName} ${change.lastName}`}</Text>
              ),
            },
            ...(showScheduleColumn
              ? [
                  {
                    title: <Text weight="semibold">{t('columns.newSchedule')}</Text>,
                    render: (change: PayScheduleAssignmentEmployeeChange) => (
                      <Text>{change.payFrequency}</Text>
                    ),
                  },
                ]
              : []),
            {
              title: <Text weight="semibold">{t('columns.firstPayDate')}</Text>,
              render: (change: PayScheduleAssignmentEmployeeChange) => (
                <Text>
                  {change.firstPayPeriod?.checkDate
                    ? dateFormatter.formatShort(change.firstPayPeriod.checkDate)
                    : ''}
                </Text>
              ),
            },
            {
              title: <Text weight="semibold">{t('columns.transitionPeriod')}</Text>,
              render: (change: PayScheduleAssignmentEmployeeChange) => (
                <Text>{formatTransitionPeriod(change)}</Text>
              ),
            },
          ]}
          data={preview?.employeeChanges ?? []}
        />
      )}

      <ActionsLayout>
        <Button variant="secondary" onClick={onBack}>
          {t('backButton')}
        </Button>
        <Button onClick={onConfirm} isDisabled={isSubmitting}>
          {isSubmitting ? t('submitting') : t('confirmButton')}
        </Button>
      </ActionsLayout>
    </Flex>
  )
}
