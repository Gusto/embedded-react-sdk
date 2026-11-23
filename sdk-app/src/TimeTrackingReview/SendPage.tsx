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

interface SkippedRow {
  shift: ApiShift
  name: string
}

/** Which state of the one send page to show: deciding what to send, or the outcome of a send. */
export type SendPhase = 'review' | 'result'

export function SendPage({
  companyId,
  schedule,
  period,
  people,
  shifts,
  phase,
  isUpdate,
  snapshot,
  sendingSince,
  failure,
  onClose,
  onReview,
  onSend,
  onSendAgain,
  onRunPayroll,
}: {
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  phase: SendPhase
  isUpdate: boolean
  snapshot: SentSummary | null
  sendingSince: string | null
  failure: SendFailure | null
  onClose: () => void
  onReview: (personUuid: string) => void
  onSend: (included: ApiShift[], preview: Preview, outcome: SendOutcome) => void
  onSendAgain: () => void
  onRunPayroll: () => void
}) {
  const Components = useComponentContext()
  const [wasUpdate] = useState(isUpdate)
  const [outcome, setOutcome] = useState<SendOutcome>('success')
  const workweekStartDay = schedule.workweek_start_day
  const included = shifts.filter(willSync)
  const skipped = shifts.filter(shift => !willSync(shift))
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'

  const toSend = sentSummary(
    included.map(shift => ({
      ...shift,
      synced_to_payroll_at: shift.synced_to_payroll_at ?? 'now',
    })),
    people,
    workweekStartDay,
  )
  const live = sentSummary(shifts, people, workweekStartDay)
  const sent = snapshot ?? live
  const isSending = Boolean(sendingSince)
  const isResult = phase === 'result' && !isSending
  const summary = isResult ? sent : toSend

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
      {
        title: 'Note',
        render: row =>
          row.person.effect === 'all' ? (
            ''
          ) : (
            <Components.Badge status="warning">{EFFECT_LABEL[row.person.effect]}</Components.Badge>
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

  const action = wasUpdate ? 'Update payroll' : 'Send to payroll'
  const reviewFooter = (
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
          {action}
        </Components.Button>
      </Flex>
    </Flex>
  )
  const doneFooter = (
    <Flex justifyContent="flex-end" gap={12}>
      {isResult && !failure && (
        <Components.Button variant="secondary" onClick={onRunPayroll}>
          See it in Run payroll
        </Components.Button>
      )}
      {failure && failure.kind !== 'partial' && (
        <Components.Button variant="secondary" onClick={onSendAgain}>
          Try again
        </Components.Button>
      )}
      <Components.Button onClick={onClose}>
        {isSending ? 'Back to timesheets' : 'Done'}
      </Components.Button>
    </Flex>
  )

  const isFailedOutright = isResult && failure !== null && failure.kind !== 'partial'
  const description = isResult
    ? isFailedOutright
      ? 'Nothing was changed on payroll.'
      : sent.lastAt
        ? `Last sent ${formatDateTime(sent.lastAt)} to the ${payrollName}. ${sent.sent.length} shifts for ${sent.rows.length} people on ${scheduleLabel(schedule)}.`
        : 'Nothing has been sent for this period.'
    : `${scheduleLabel(schedule)} · ${included.length} approved, finished shifts · ${formatHours(toSend.hours)} hours → ${payrollName}`

  return (
    <SubPage
      trail={[{ label: 'Timesheets', onClick: onClose }]}
      current={action}
      title={
        <>
          {action}: {formatPeriod(period)} <ChangePin id="send-page" />{' '}
          <ChangePin id="one-send-page" />
        </>
      }
      description={description}
      footer={phase === 'review' && !isSending ? reviewFooter : doneFooter}
    >
      {isSending ? (
        <Components.Alert status="info" label="Waiting for payroll to confirm…">
          <Flex alignItems="center" gap={8}>
            <Components.LoadingSpinner size="sm" style="inline" />
            <span>
              Started {formatDateTime(sendingSince ?? '')}. The send runs in the background, so this
              page checks on it until it finishes. You can keep working; the result shows here and
              on Timesheets. <GapPin id="sync-limits" /> <ChangePin id="send-outcomes" />
            </span>
          </Flex>
        </Components.Alert>
      ) : !isResult ? (
        <Components.Alert status="warning" label="This replaces the hours on payroll">
          It recalculates everyone on {scheduleLabel(schedule)} for these dates, including hours
          fixed by hand in payroll. <GapPin id="sync-limits" />
        </Components.Alert>
      ) : failure?.kind === 'processed' ? (
        <Components.Alert status="error" label={`The ${payrollName} was already processed`}>
          There’s no open payroll for {scheduleLabel(schedule)}, {formatPeriod(period)}, so its
          hours can’t change. <GapPin id="sync-limits" />
        </Components.Alert>
      ) : failure?.kind === 'error' ? (
        <Components.Alert status="error" label="The send failed">
          Payroll didn’t accept any hours for {formatPeriod(period)}. Try again, and if it keeps
          failing, contact support. What the API reports for a failed send isn’t defined yet.{' '}
          <GapPin id="which-timesheets" /> <ChangePin id="send-outcomes" />
        </Components.Alert>
      ) : failure?.kind === 'partial' ? (
        <Components.Alert
          status="error"
          label={`${failure.names.length} ${failure.names.length === 1 ? 'person wasn’t' : 'people weren’t'} sent`}
          action={
            <Components.Button variant="secondary" onClick={onSendAgain}>
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
        sent.lastAt && (
          <Components.Alert status="success" label={`Sent to the ${payrollName}`}>
            Everyone below is on payroll for {formatPeriod(period)}. <ChangePin id="receipt" />
          </Components.Alert>
        )
      )}

      {isResult && live.changed > 0 && (
        <Components.Alert
          status="warning"
          label={`${live.changed} ${live.changed === 1 ? 'shift has' : 'shifts have'} changed since this send`}
          action={
            <Components.Button variant="secondary" onClick={onSendAgain}>
              Update payroll
            </Components.Button>
          }
        >
          Payroll still has the old hours until you update it. Spotted by comparing each shift’s
          updated_at with its synced_to_payroll_at. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}

      {!isFailedOutright && (
        <>
          <Components.Heading as="h3" styledAs="h5">
            {isResult ? 'What was sent' : 'What will be sent'}
          </Components.Heading>
          <DataView label={isResult ? 'What was sent' : 'What will be sent'} {...rowsView} />
          <Components.Text size="sm" variant="supporting">
            Overtime and double time are this page’s estimates until the API returns how hours were
            classified. <GapPin id="rules-applied" /> Which payroll they land on can’t be read yet
            either. <GapPin id="which-timesheets" />
          </Components.Text>
        </>
      )}

      {phase === 'review' && !isSending && skipped.length > 0 && (
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

function Estimate({ hours }: { hours: number | undefined }) {
  if (!hours) return <>—</>
  return <span className={styles.estimate}>{formatHours(hours)}</span>
}
