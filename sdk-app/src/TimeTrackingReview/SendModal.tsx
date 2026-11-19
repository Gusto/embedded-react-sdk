import {
  EFFECT_LABEL,
  REVIEW_STATE_LABEL,
  formatDay,
  formatHours,
  formatPeriod,
  localStartDate,
  reviewState,
  scheduleLabel,
  willSync,
  workedHours,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { GapPin, PrototypeModal, ReadOnlyNote, RequestBlock } from './parts'
import { DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface IncludedRow {
  person: Person
  count: number
  hours: number
}

export function SendModal({
  companyId,
  schedule,
  period,
  people,
  shifts,
  isUpdate,
  onClose,
  onReview,
}: {
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  isUpdate: boolean
  onClose: () => void
  onReview: (personUuid: string) => void
}) {
  const Components = useComponentContext()
  const included = shifts.filter(willSync)
  const skipped = shifts.filter(shift => !willSync(shift))
  const rows: IncludedRow[] = people
    .map(person => {
      const mine = included.filter(s => s.entity_uuid === person.employee.uuid)
      return { person, count: mine.length, hours: mine.reduce((sum, s) => sum + workedHours(s), 0) }
    })
    .filter(row => row.count > 0)
    .sort((a, b) => a.person.name.localeCompare(b.person.name))
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid

  const dataView = useDataView<IncludedRow>({
    data: rows,
    columns: [
      { title: 'Person', render: ({ person }) => person.name },
      { title: 'Hours', justify: 'end', render: ({ hours }) => formatHours(hours) },
      {
        title: (
          <>
            Note <GapPin id="flsa" />
          </>
        ),
        render: ({ person }) =>
          person.effect === 'all' ? (
            ''
          ) : (
            <Components.Badge status="warning">{EFFECT_LABEL[person.effect]}</Components.Badge>
          ),
      },
    ],
  })

  return (
    <PrototypeModal
      title={`${isUpdate ? 'Update payroll' : 'Send to payroll'}: ${scheduleLabel(schedule)} · ${formatPeriod(period)}`}
      onClose={onClose}
    >
      <Components.Alert status="warning" label="This replaces the hours on payroll">
        It recalculates everyone on {scheduleLabel(schedule)} for these dates, including hours fixed
        by hand in payroll. <GapPin id="scope" />
      </Components.Alert>
      <Components.Text weight="medium">
        {included.length} approved, finished shifts will go
      </Components.Text>
      <DataView label="Included" {...dataView} />
      <Components.Text size="sm" variant="supporting">
        What each person has on payroll now can’t be read, so the change can’t be shown.{' '}
        <GapPin id="payroll-hours" />
      </Components.Text>
      {skipped.length > 0 && (
        <Flex flexDirection="column" gap={4}>
          <Components.Text weight="medium">{skipped.length} won’t go</Components.Text>
          {skipped.map(shift => (
            <Flex key={shift.uuid} alignItems="center" gap={8}>
              <Components.Text size="sm">
                {nameOf(shift.entity_uuid)}, {formatDay(localStartDate(shift))}:{' '}
                {REVIEW_STATE_LABEL[reviewState(shift)]}
              </Components.Text>
              <Components.Button
                variant="tertiary"
                onClick={() => {
                  onReview(shift.entity_uuid)
                }}
              >
                Review
              </Components.Button>
            </Flex>
          ))}
        </Flex>
      )}
      <RequestBlock
        method="POST"
        path={`/v1/companies/${companyId}/time_tracking/payroll_syncs`}
        body={{
          pay_schedule_uuid: schedule.uuid,
          start_date: period.start_date,
          end_date: period.end_date,
        }}
        caption="Then poll the sync by its UUID. The path is a best guess and hasn’t been checked."
      />
      <Components.Text size="sm" variant="supporting">
        Afterwards, the only record of what went is each shift’s synced_to_payroll_at.{' '}
        <GapPin id="which-payroll" />
      </Components.Text>
      <ReadOnlyNote />
    </PrototypeModal>
  )
}
