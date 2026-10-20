import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { DataView, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface PayScheduleEmployeeRow {
  employeeCount: number
  schedule: PayScheduleShow
}

/** @internal */
export interface PayScheduleEmployeeOverviewPresentationProps {
  /** One row per assigned pay schedule. */
  rows: PayScheduleEmployeeRow[]
  /** Replaces the table with a warning while preserving management actions. */
  accessDenied?: boolean
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
export function PayScheduleEmployeeOverviewPresentation({
  rows,
  accessDenied,
  enableAutoPilot,
  enableMultipleSchedules,
  onEditSchedule,
  onManageAssignment,
  onEditAutoPilot,
}: PayScheduleEmployeeOverviewPresentationProps) {
  const { t } = useTranslation('Company.Management.PaySchedule')
  const Components = useComponentContext()

  const dataViewProps = useDataView<PayScheduleEmployeeRow>({
    data: rows,
    columns: [
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
      {
        key: 'employees',
        title: t('labels.employees'),
        render: ({ employeeCount }) => t('employeeCount', { count: employeeCount }),
      },
      ...(enableAutoPilot
        ? [
            {
              key: 'autoPilot',
              title: t('autoPilot.label'),
              render: ({ schedule }: PayScheduleEmployeeRow) => (
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
          description={t('employeeDescription')}
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
      {accessDenied ? (
        <Components.Alert status="warning" label={t('employeeAccessDenied')} />
      ) : (
        <DataView label={t('employeeTableLabel')} isWithinBox {...dataViewProps} />
      )}
    </Components.Box>
  )
}
