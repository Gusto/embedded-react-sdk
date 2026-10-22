import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { DataView, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface PayScheduleDepartmentRow {
  departmentName: string
  schedule: PayScheduleShow
}

/** @internal */
export interface PayScheduleDepartmentOverviewPresentationProps {
  /** One row per department, including employees without a department. */
  rows: PayScheduleDepartmentRow[]
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
export function PayScheduleDepartmentOverviewPresentation({
  rows,
  enableAutoPilot,
  enableMultipleSchedules,
  onEditSchedule,
  onManageAssignment,
  onEditAutoPilot,
}: PayScheduleDepartmentOverviewPresentationProps) {
  const { t } = useTranslation('Company.Management.PaySchedule')
  const Components = useComponentContext()

  const dataViewProps = useDataView<PayScheduleDepartmentRow>({
    data: rows,
    columns: [
      {
        key: 'department',
        title: t('labels.department'),
        render: ({ departmentName }) => departmentName,
      },
      {
        key: 'schedule',
        title: t('labels.schedule'),
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
              render: ({ schedule }: PayScheduleDepartmentRow) => (
                <Components.Badge status={schedule.autoPayroll ? 'success' : 'info'}>
                  {schedule.autoPayroll ? t('autoPilot.enabled') : t('autoPilot.disabled')}
                </Components.Badge>
              ),
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
      withPadding={false}
      header={
        <Components.BoxHeader
          title={t('title')}
          description={t('departmentDescription')}
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
      <DataView label={t('departmentTableLabel')} isWithinBox {...dataViewProps} />
    </Components.Box>
  )
}
