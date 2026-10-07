import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { DataView, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export type CompensationType = 'hourly' | 'salaried'

/** @internal */
export interface PayScheduleCompensationRow {
  compensationType: CompensationType
  schedule: PayScheduleShow
}

/** @internal */
export interface PayScheduleCompensationOverviewPresentationProps {
  /** One row per compensation type, in display order. */
  rows: PayScheduleCompensationRow[]
  /** Shows the AutoPilot column and its row action when `true`. */
  enableAutoPilot?: boolean
  /** Shows the Manage action when `true`. */
  enableMultipleSchedules?: boolean
  /** Fired when the user chooses Edit schedule from a row menu. */
  onEditSchedule: (schedule: PayScheduleShow) => void
  /** Fired when the user clicks Manage. */
  onManageAssignment: () => void
  /** Fired when the user chooses AutoPilot from a row menu. */
  onEditAutoPilot: (schedule: PayScheduleShow) => void
}

/** @internal */
export function PayScheduleCompensationOverviewPresentation({
  rows,
  enableAutoPilot,
  enableMultipleSchedules,
  onEditSchedule,
  onManageAssignment,
  onEditAutoPilot,
}: PayScheduleCompensationOverviewPresentationProps) {
  const { t } = useTranslation('Company.Management.PaySchedule')
  const Components = useComponentContext()

  const dataViewProps = useDataView<PayScheduleCompensationRow>({
    data: rows,
    columns: [
      {
        key: 'compensationType',
        title: t('labels.compensationType'),
        render: ({ compensationType }) => t(`compensationTypes.${compensationType}`),
      },
      {
        key: 'name',
        title: t('labels.name'),
        render: ({ schedule }) => schedule.customName,
      },
      {
        key: 'frequency',
        title: t('labels.frequency'),
        render: ({ schedule }) => schedule.frequency,
      },
      ...(enableAutoPilot
        ? [
            {
              key: 'autoPilot',
              title: t('autoPilot.label'),
              render: ({ schedule }: PayScheduleCompensationRow) =>
                schedule.autoPayroll ? t('autoPilot.enabled') : t('autoPilot.disabled'),
            },
          ]
        : []),
    ],
    itemMenu: ({ schedule }) => (
      <HamburgerMenu
        items={[
          {
            label: t('editScheduleCta'),
            onClick: () => {
              onEditSchedule(schedule)
            },
          },
          ...(enableAutoPilot
            ? [
                {
                  label: t('autoPilot.label'),
                  onClick: () => {
                    onEditAutoPilot(schedule)
                  },
                },
              ]
            : []),
        ]}
        triggerLabel={t('rowMenuTriggerLabel')}
      />
    ),
  })

  return (
    <Components.Box
      header={
        <Components.BoxHeader
          title={t('title')}
          description={t('compensationDescription')}
          action={
            enableMultipleSchedules ? (
              <Components.Button variant="secondary" onClick={onManageAssignment}>
                {t('manageCta')}
              </Components.Button>
            ) : undefined
          }
        />
      }
    >
      <DataView label={t('compensationTableLabel')} isWithinBox {...dataViewProps} />
    </Components.Box>
  )
}
