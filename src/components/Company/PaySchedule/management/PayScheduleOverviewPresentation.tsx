import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import styles from './PayScheduleOverviewPresentation.module.scss'
import { Flex } from '@/components/Common/Flex'
import { Loading } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface PayScheduleOverviewPresentationProps {
  /** The company's single pay schedule, or `undefined` while it's loading. */
  schedule: PayScheduleShow | undefined
  /** Shows the AutoPilot row and its Edit action when `true`. */
  enableAutoPilot?: boolean
  /** Shows the Manage action when `true`. */
  enableMultipleSchedules?: boolean
  /** Fired when the user clicks Edit on the pay schedule row. */
  onEditSchedule: () => void
  /** Fired when the user clicks Manage. */
  onManageAssignment: () => void
  /** Fired when the user clicks Edit on the AutoPilot row. */
  onEditAutoPilot: () => void
}

function Row({ label, value, action }: { label: ReactNode; value: ReactNode; action?: ReactNode }) {
  const Components = useComponentContext()
  return (
    <div className={styles.row}>
      <Flex justifyContent="space-between" alignItems="center">
        <Flex flexDirection="column" gap={4}>
          <Components.Text weight="semibold">{label}</Components.Text>
          <Components.Text variant="supporting">{value}</Components.Text>
        </Flex>
        {action}
      </Flex>
    </div>
  )
}

/** @internal */
export function PayScheduleOverviewPresentation({
  schedule,
  enableAutoPilot,
  enableMultipleSchedules,
  onEditSchedule,
  onManageAssignment,
  onEditAutoPilot,
}: PayScheduleOverviewPresentationProps) {
  const { t } = useTranslation('Company.Management.PaySchedule')
  const Components = useComponentContext()

  return (
    <Components.Box
      header={
        <Components.BoxHeader
          title={t('title')}
          description={t('description')}
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
      {schedule ? (
        <div className={styles.rows}>
          <Row
            label={t('labels.name')}
            value={schedule.customName ?? schedule.name}
            action={
              <Components.Button variant="secondary" onClick={onEditSchedule}>
                {t('editCta')}
              </Components.Button>
            }
          />
          <Row label={t('labels.frequency')} value={schedule.frequency} />
          {enableAutoPilot ? (
            <Row
              label={t('autoPilot.label')}
              value={schedule.autoPayroll ? t('autoPilot.enabled') : t('autoPilot.disabled')}
              action={
                <Components.Button variant="secondary" onClick={onEditAutoPilot}>
                  {t('editCta')}
                </Components.Button>
              }
            />
          ) : null}
        </div>
      ) : (
        <Loading />
      )}
    </Components.Box>
  )
}
