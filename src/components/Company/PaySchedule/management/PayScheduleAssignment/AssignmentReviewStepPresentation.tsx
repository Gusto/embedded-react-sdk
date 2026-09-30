import { useTranslation } from 'react-i18next'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import { Flex, ActionsLayout, DataView, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/** @internal */
export interface AssignmentReviewStepPresentationProps {
  employeeChanges: PayScheduleAssignmentEmployeeChange[]
  isSubmitting: boolean
  onBack: () => void
  onSubmit: () => void
}

function EmployeeChangesTable({
  employeeChanges,
}: {
  employeeChanges: PayScheduleAssignmentEmployeeChange[]
}) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const dateFormatter = useDateFormatter()

  const dataViewProps = useDataView({
    data: employeeChanges,
    columns: [
      {
        title: t('reviewStep.nameLabel'),
        key: 'firstName',
        render: change => [change.firstName, change.lastName].filter(Boolean).join(' '),
      },
      {
        title: t('reviewStep.payFrequencyLabel'),
        key: 'payFrequency',
        render: change => change.payFrequency,
      },
      {
        title: t('reviewStep.firstPayPeriodLabel'),
        key: 'firstPayPeriod',
        render: change =>
          change.firstPayPeriod
            ? dateFormatter.formatPayPeriodRange(
                change.firstPayPeriod.startDate,
                change.firstPayPeriod.endDate,
              )
            : null,
      },
      {
        title: t('reviewStep.transitionPayPeriodLabel'),
        key: 'transitionPayPeriod',
        render: change =>
          change.transitionPayPeriod
            ? dateFormatter.formatPayPeriodRange(
                change.transitionPayPeriod.startDate,
                change.transitionPayPeriod.endDate,
              )
            : t('reviewStep.noTransitionNeeded'),
      },
    ],
  })

  return <DataView label={t('reviewStep.employeeChangesHeading')} {...dataViewProps} />
}

/** @internal */
export function AssignmentReviewStepPresentation({
  employeeChanges,
  isSubmitting,
  onBack,
  onSubmit,
}: AssignmentReviewStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={32}>
      <Components.Heading as="h2">
        {employeeChanges.length === 0 ? t('reviewStep.noChangesHeading') : t('reviewStep.heading')}
      </Components.Heading>
      {employeeChanges.length === 0 ? (
        <Components.Text variant="supporting">
          {t('reviewStep.noChangesDescription')}
        </Components.Text>
      ) : (
        <Flex flexDirection="column" gap={16}>
          <Components.Text weight="semibold">
            {t('reviewStep.employeeChangesHeading')}
          </Components.Text>
          <EmployeeChangesTable employeeChanges={employeeChanges} />
        </Flex>
      )}
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onBack} isDisabled={isSubmitting}>
          {t('backCta')}
        </Components.Button>
        <Components.Button variant="primary" onClick={onSubmit} isLoading={isSubmitting}>
          {t('submitCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
