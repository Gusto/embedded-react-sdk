import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { useCompanyPaySchedulesSummary } from '../../shared/useCompanyPaySchedulesSummary'
import { DataView, useDataView, EmptyData, Loading } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import type { LoaderComponentType } from '@/components/Base'

/**
 * Props for {@link PaySchedulesCard}.
 *
 * @alpha
 */
export interface PaySchedulesCardProps {
  /** The associated company identifier. */
  companyId: string
  /** Callback invoked when the card emits an event. See the events table on {@link PaySchedulesCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
  /** Custom loading indicator rendered while this component's async data is fetching. Overrides the indicator configured on `GustoProvider` for this instance only. */
  LoaderComponent?: LoaderComponentType
}

const ASSIGNMENT_MODE_KEY = {
  single: 'card.assignmentMode.single',
  hourly_salaried: 'card.assignmentMode.hourlySalaried',
  by_employee: 'card.assignmentMode.byEmployee',
  by_department: 'card.assignmentMode.byDepartment',
} as const

/**
 * Standalone "Pay schedules" card listing a company's pay schedules.
 *
 * @remarks
 * Owns its own data fetch and emits
 * `company/management/paySchedule/editRequested` when the Manage or Add button
 * is clicked. The card is read-only — editing schedules and their employee
 * assignments happens in the screen the parent routes to — and renders no
 * alerts: alert presentation is the surrounding surface's responsibility.
 *
 * Names the assignment mode rather than the per-employee or per-department
 * mapping, which needs the company's full roster to resolve. AutoPilot status
 * is deliberately absent: it is only meaningful when the surrounding
 * integration has enabled it, which this card cannot see.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/management/paySchedule/editRequested` | Fired when "Manage" or "Add pay schedule" is clicked | `{ companyId: string }` |
 *
 * @param props - See {@link PaySchedulesCardProps}.
 * @returns The pay schedules summary card.
 * @alpha
 */
export function PaySchedulesCard(props: PaySchedulesCardProps) {
  return (
    <BaseBoundaries
      componentName="Company.Management.PaySchedules"
      LoaderComponent={props.LoaderComponent}
    >
      <PaySchedulesCardContent {...props} />
    </BaseBoundaries>
  )
}

function PaySchedulesCardContent({ companyId, onEvent, LoaderComponent }: PaySchedulesCardProps) {
  useI18n('Company.Management.PaySchedules')
  const { t } = useTranslation('Company.Management.PaySchedules')
  const Components = useComponentContext()

  const summary = useCompanyPaySchedulesSummary({ companyId })

  const isLoading = summary.isLoading
  const schedules = summary.isLoading ? [] : summary.data.schedules
  const hasSchedules = schedules.length > 0
  const assignmentType = summary.isLoading ? undefined : summary.data.assignmentType

  const handleManage = () => {
    onEvent(componentEvents.COMPANY_MANAGEMENT_PAY_SCHEDULE_EDIT_REQUESTED, { companyId })
  }

  const schedulesDataView = useDataView({
    data: schedules,
    columns: [
      {
        key: 'schedule',
        title: t('card.scheduleColumn'),
        render: (schedule: PayScheduleShow) => (
          <Flex flexDirection="column" gap={4}>
            <Components.Text size="sm" weight="medium">
              {schedule.customName || schedule.name || t('card.unnamedSchedule')}
            </Components.Text>
            <Components.Text size="sm">{schedule.frequency}</Components.Text>
          </Flex>
        ),
      },
    ],
    emptyState: () => (
      <EmptyData
        title={t('card.emptyState.title')}
        description={t('card.emptyState.description')}
      />
    ),
  })

  return (
    <BaseLayout error={summary.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <Components.Box
        withPadding={false}
        header={
          <Components.BoxHeader
            title={t('card.title')}
            description={assignmentType ? t(ASSIGNMENT_MODE_KEY[assignmentType]) : undefined}
            action={
              <Components.Button
                variant="secondary"
                onClick={handleManage}
                isDisabled={isLoading}
                aria-label={hasSchedules ? t('card.manageAriaLabel') : undefined}
              >
                {hasSchedules ? t('card.manageCta') : t('card.addCta')}
              </Components.Button>
            }
          />
        }
      >
        {isLoading ? (
          <Loading />
        ) : (
          <DataView label={t('card.listLabel')} isWithinBox {...schedulesDataView} />
        )}
      </Components.Box>
    </BaseLayout>
  )
}
