import { useState } from 'react'
import {
  EFFECT_LABEL,
  REVIEW_STATE_LABEL,
  formatDateTime,
  formatDay,
  formatHours,
  formatPeriod,
  formatShortDate,
  localStartDate,
  reviewState,
  scheduleLabel,
  sentSummary,
  willSync,
  type SentSummary,
  workedHours,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { ChangePin, GapPin, SubPage } from './parts'
import type { Preview } from './preview'
import styles from './TimeTrackingReview.module.scss'
import { DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type SendOutcome = 'success' | 'partial' | 'error'

export type SendFailure =
  { kind: 'processed' } | { kind: 'error' } | { kind: 'partial'; names: string[]; shifts: number }

const OUTCOME_OPTIONS: Array<{ value: SendOutcome; label: string }> = [
  { value: 'success', label: 'Everything sends' },
  { value: 'partial', label: 'Some people fail' },
  { value: 'error', label: 'The whole send fails' },
]

function isOutcome(value: string): value is SendOutcome {
  return OUTCOME_OPTIONS.some(option => option.value === value)
}

interface IncludedRow {
  person: Person
  count: number
  hours: number
}

interface SkippedRow {
  shift: ApiShift
  name: string
}

export function SendPage({
  companyId,
  schedule,
  period,
  people,
  shifts,
  isUpdate,
  onClose,
  onReview,
  onSend,
}: {
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  isUpdate: boolean
  onClose: () => void
  onReview: (personUuid: string) => void
  onSend: (included: ApiShift[], preview: Preview, outcome: SendOutcome) => void
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
  const totalHours = rows.reduce((sum, r) => sum + r.hours, 0)
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'

  const [wasUpdate] = useState(isUpdate)
  const [outcome, setOutcome] = useState<SendOutcome>('success')
  const send = () => {
    onSend(
      included,
      {
        title: wasUpdate ? 'Update payroll' : 'Send to payroll',
        requests: [
          {
            method: 'POST',
            path: `/v1/companies/${companyId}/time_tracking/payroll_syncs`,
            body: {
              pay_schedule_uuid: schedule.uuid,
              start_date: period.start_date,
              end_date: period.end_date,
            },
            caption: 'Then poll the sync by its UUID until it finishes. The path is a best guess.',
          },
        ],
        gapIds: ['sync-limits', 'which-timesheets'],
      },
      outcome,
    )
  }

  const dataView = useDataView<IncludedRow>({
    data: rows,
    columns: [
      { title: 'Person', render: ({ person }) => person.name },
      { title: 'Job', render: ({ person }) => person.title },
      { title: 'Shifts', justify: 'end', render: ({ count }) => count },
      { title: 'Hours', justify: 'end', render: ({ hours }) => formatHours(hours) },
      {
        title: <>Note</>,
        render: ({ person }) =>
          person.effect === 'all' ? (
            ''
          ) : (
            <Components.Badge status="warning">{EFFECT_LABEL[person.effect]}</Components.Badge>
          ),
      },
    ],
  })

  const skippedView = useDataView<SkippedRow>({
    data: skipped.map(shift => ({ shift, name: nameOf(shift.entity_uuid) })),
    columns: [
      { title: 'Person', render: ({ name }) => name },
      { title: 'Date', render: ({ shift }) => formatDay(localStartDate(shift)) },
      { title: 'Why', render: ({ shift }) => REVIEW_STATE_LABEL[reviewState(shift)] },
    ],
    itemMenu: ({ shift, name }) => (
      <Components.Button
        variant="tertiary"
        aria-label={`Review ${name}’s shifts`}
        onClick={() => {
          onReview(shift.entity_uuid)
        }}
      >
        Review
      </Components.Button>
    ),
  })

  const title = `${wasUpdate ? 'Update payroll' : 'Send to payroll'}: ${formatPeriod(period)}`

  return (
    <SubPage
      trail={[{ label: 'Timesheets', onClick: onClose }]}
      current={wasUpdate ? 'Update payroll' : 'Send to payroll'}
      title={
        <>
          {title} <ChangePin id="send-page" />
        </>
      }
      description={`${scheduleLabel(schedule)} · ${included.length} approved, finished shifts · ${formatHours(totalHours)} hours → ${payrollName}`}
      footer={
        <Flex justifyContent="space-between" alignItems="flex-end" gap={12} flexWrap="wrap">
          <Flex alignItems="flex-end" gap={8}>
            <div className={styles.simulate}>
              <Components.Select
                label="Prototype only: simulate the result"
                placeholder="Choose a result"
                value={outcome}
                options={OUTCOME_OPTIONS}
                onChange={value => {
                  if (isOutcome(value)) setOutcome(value)
                }}
              />
            </div>
            <ChangePin id="send-outcomes" />
          </Flex>
          <Flex gap={12} justifyContent="flex-end">
            <Components.Button variant="secondary" onClick={onClose}>
              Cancel
            </Components.Button>
            <Components.Button isDisabled={included.length === 0} onClick={send}>
              {wasUpdate ? 'Update payroll' : 'Send to payroll'}
            </Components.Button>
          </Flex>
        </Flex>
      }
    >
      <Components.Alert status="warning" label="This replaces the hours on payroll">
        It recalculates everyone on {scheduleLabel(schedule)} for these dates, including hours fixed
        by hand in payroll. <GapPin id="sync-limits" />
      </Components.Alert>
      <DataView label="Included" {...dataView} />
      <Components.Text size="sm" variant="supporting">
        What each person has on payroll now can’t be read, so the change can’t be shown.{' '}
      </Components.Text>
      {skipped.length > 0 && (
        <Flex flexDirection="column" gap={8}>
          <Components.Heading as="h3" styledAs="h5">
            {skipped.length} won’t be sent
          </Components.Heading>
          <DataView label="Won’t be sent" {...skippedView} />
        </Flex>
      )}
    </SubPage>
  )
}

export function ReceiptPage({
  schedule,
  period,
  people,
  shifts,
  workweekStartDay,
  snapshot,
  sendingSince,
  failure,
  onBack,
  onUpdate,
  onRunPayroll,
}: {
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  workweekStartDay: string | null
  snapshot: SentSummary | null
  sendingSince: string | null
  failure: SendFailure | null
  onBack: () => void
  onUpdate: () => void
  onRunPayroll: () => void
}) {
  const Components = useComponentContext()
  const live = sentSummary(shifts, people, workweekStartDay)
  const summary = snapshot ?? live
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'

  const rowsView = useDataView({
    data: summary.rows,
    columns: [
      { title: 'Person', render: row => row.person.name },
      {
        title: (
          <>
            Regular <ChangePin id="receipt-totals" />
          </>
        ),
        justify: 'end',
        render: row =>
          formatHours(row.hours - (row.overtime?.overtime ?? 0) - (row.overtime?.double ?? 0)),
      },
      {
        title: (
          <>
            Overtime <GapPin id="rules-applied" />
          </>
        ),
        justify: 'end',
        render: row => <Estimate hours={row.overtime?.overtime} />,
      },
      {
        title: 'Double time',
        justify: 'end',
        render: row => <Estimate hours={row.overtime?.double} />,
      },
      { title: 'Total', justify: 'end', render: row => formatHours(row.hours) },
    ],
  })

  const back = (
    <Components.Button variant="secondary" onClick={onBack}>
      Back to timesheets
    </Components.Button>
  )

  if (sendingSince) {
    return (
      <SubPage
        narrow
        trail={[{ label: 'Timesheets', onClick: onBack }]}
        current="Sending hours"
        title={`Sending hours for ${formatPeriod(period)}`}
        description={`${scheduleLabel(schedule)} → ${payrollName}`}
        footer={back}
      >
        <Components.Alert status="info" label="Waiting for payroll to confirm…">
          Started {formatDateTime(sendingSince)}. The send runs in the background, so this page
          checks on it until it finishes. You can keep working; the result shows here and on
          Timesheets. <GapPin id="sync-limits" /> <ChangePin id="send-outcomes" />
        </Components.Alert>
        <Components.LoadingSpinner />
      </SubPage>
    )
  }

  if (failure && failure.kind !== 'partial') {
    return (
      <SubPage
        narrow
        trail={[{ label: 'Timesheets', onClick: onBack }]}
        current="Couldn’t send"
        title={
          <>
            Couldn’t send hours <ChangePin id="send-outcomes" />
          </>
        }
        description="Nothing was changed on payroll."
        footer={
          <Flex justifyContent="flex-end" gap={12}>
            {back}
            <Components.Button onClick={onUpdate}>Try again</Components.Button>
          </Flex>
        }
      >
        {failure.kind === 'processed' ? (
          <Components.Alert status="error" label={`The ${payrollName} was already processed`}>
            There’s no open payroll for {scheduleLabel(schedule)}, {formatPeriod(period)}, so its
            hours can’t change. <GapPin id="sync-limits" />
          </Components.Alert>
        ) : (
          <Components.Alert status="error" label="The send failed">
            Payroll didn’t accept any hours for {formatPeriod(period)}. Try again, and if it keeps
            failing, contact support. What the API reports for a failed send isn’t defined yet.{' '}
            <GapPin id="which-timesheets" />
          </Components.Alert>
        )}
      </SubPage>
    )
  }

  return (
    <SubPage
      trail={[{ label: 'Timesheets', onClick: onBack }]}
      current="Hours sent"
      title={
        <>
          Hours sent for {formatPeriod(period)} <ChangePin id="receipt" />
        </>
      }
      description={
        summary.lastAt
          ? `Last sent ${formatDateTime(summary.lastAt)} to the ${payrollName}. ${summary.sent.length} shifts for ${summary.rows.length} people on ${scheduleLabel(schedule)}. If anything changes before payroll runs, update it again.`
          : 'Nothing has been sent for this period.'
      }
      footer={
        <Flex justifyContent="flex-end" gap={12}>
          <Components.Button variant="secondary" onClick={onRunPayroll}>
            See it in Run payroll
          </Components.Button>
          <Components.Button onClick={onBack}>Done</Components.Button>
        </Flex>
      }
    >
      {failure?.kind === 'partial' ? (
        <Components.Alert
          status="error"
          label={`${failure.names.length} ${failure.names.length === 1 ? 'person wasn’t' : 'people weren’t'} sent`}
          action={
            <Components.Button variant="secondary" onClick={onUpdate}>
              Try again
            </Components.Button>
          }
        >
          {failure.shifts} {failure.shifts === 1 ? 'shift' : 'shifts'} for{' '}
          {failure.names.join(', ')} didn’t reach payroll. Everyone else below was sent. What the
          API reports for a partial send isn’t defined yet. <GapPin id="which-timesheets" />{' '}
          <ChangePin id="send-outcomes" />
        </Components.Alert>
      ) : (
        summary.lastAt && (
          <Components.Alert status="success" label={`Sent to the ${payrollName}`}>
            Everyone below is on payroll for {formatPeriod(period)}.
          </Components.Alert>
        )
      )}
      {live.changed > 0 && (
        <Components.Alert
          status="warning"
          label={`${live.changed} ${live.changed === 1 ? 'shift has' : 'shifts have'} changed since this send`}
          action={
            <Components.Button variant="secondary" onClick={onUpdate}>
              Update payroll
            </Components.Button>
          }
        >
          Payroll still has the old hours until you update it. Spotted by comparing each shift’s
          updated_at with its synced_to_payroll_at. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      <Components.Heading as="h3" styledAs="h5">
        What was sent
      </Components.Heading>
      <DataView label="What was sent" {...rowsView} />
      <Components.Text size="sm" variant="supporting">
        Overtime and double time are this page’s estimates until the API returns how hours were
        classified. <GapPin id="rules-applied" /> Which payroll they landed on can’t be read yet
        either. <GapPin id="which-timesheets" />
      </Components.Text>
    </SubPage>
  )
}

function Estimate({ hours }: { hours: number | undefined }) {
  if (!hours) return <>—</>
  return <span className={styles.estimate}>≈ {formatHours(hours)}</span>
}
