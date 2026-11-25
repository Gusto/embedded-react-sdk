import { useState } from 'react'
import {
  formatDateTime,
  formatHours,
  formatPeriod,
  formatShortDate,
  reviewState,
  scheduleLabel,
  willSync,
  workedHours,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
  type SentSummary,
} from './model'
import { ChangePin, GapPin, SubPage } from './parts'
import type { Preview } from './preview'
import styles from './TimeTrackingReview.module.scss'
import { ActionsLayout, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type SendOutcome = 'success' | 'partial' | 'error'

export type SendFailure =
  { kind: 'processed' } | { kind: 'error' } | { kind: 'partial'; names: string[]; shifts: number }

/** Review is before sending; summary covers both the wait and the result. */
export type SendView = 'review' | 'summary'

const OUTCOME_OPTIONS: Array<{ value: SendOutcome; label: string }> = [
  { value: 'success', label: 'Everything sends' },
  { value: 'partial', label: 'Some people fail' },
  { value: 'error', label: 'The whole send fails' },
]

function isOutcome(value: string): value is SendOutcome {
  return OUTCOME_OPTIONS.some(option => option.value === value)
}

type SkipReason = 'pending' | 'rejected' | 'open'

const SKIP_REASONS: Array<{ reason: SkipReason; label: (count: number) => string }> = [
  { reason: 'pending', label: count => `${count} pending` },
  { reason: 'rejected', label: count => `${count} rejected` },
  { reason: 'open', label: count => `${count} still clocked in` },
]

function skipReason(shift: ApiShift): SkipReason | null {
  const state = reviewState(shift)
  return state === 'pending' || state === 'rejected' || state === 'open' ? state : null
}

function namesList(names: string[]) {
  const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b))
  if (unique.length <= 3) return unique.join(', ')
  return `${unique.slice(0, 3).join(', ')} and ${unique.length - 3} more`
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

function Facts({ facts }: { facts: Array<[string, string]> }) {
  const Components = useComponentContext()
  return (
    <dl className={styles.sendFacts}>
      {facts.map(([label, value]) => (
        <div key={label} className={styles.sendFact}>
          <dt>
            <Components.Text size="sm" variant="supporting">
              {label}
            </Components.Text>
          </dt>
          <dd>
            <Components.Text weight="medium">{value}</Components.Text>
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function SendPage({
  view,
  companyId,
  schedule,
  period,
  people,
  shifts,
  isUpdate,
  sendingSince,
  failure,
  sent,
  onClose,
  onSend,
  onSendAgain,
}: {
  view: SendView
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  isUpdate: boolean
  sendingSince: string | null
  failure: SendFailure | null
  sent: SentSummary
  onClose: () => void
  onSend: (included: ApiShift[], preview: Preview, outcome: SendOutcome) => void
  onSendAgain: () => void
}) {
  const Components = useComponentContext()
  const [outcome, setOutcome] = useState<SendOutcome>('success')
  const [wasUpdate] = useState(isUpdate)
  const included = shifts.filter(willSync)
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid
  const peopleIncluded = new Set(included.map(shift => shift.entity_uuid)).size
  const hours = included.reduce((sum, shift) => sum + workedHours(shift), 0)
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'
  const action = wasUpdate ? 'Update payroll' : 'Send to payroll'

  const skippedGroups = SKIP_REASONS.map(({ reason, label }) => {
    const matching = shifts.filter(shift => skipReason(shift) === reason)
    return {
      reason,
      label: label(matching.length),
      names: namesList(matching.map(shift => nameOf(shift.entity_uuid))),
      count: matching.length,
    }
  }).filter(group => group.count > 0)
  const skippedCount = skippedGroups.reduce((sum, group) => sum + group.count, 0)

  const stage: 'review' | 'sending' | 'sent' | 'failed' =
    view === 'review'
      ? 'review'
      : sendingSince
        ? 'sending'
        : failure && failure.kind !== 'partial'
          ? 'failed'
          : 'sent'

  const send = () => {
    onSend(
      included,
      {
        title: action,
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

  const toSendFacts: Array<[string, string]> = [
    ['Hours', formatHours(hours)],
    ['Approved shifts', String(included.length)],
    ['People', String(peopleIncluded)],
    ['Goes to', `The ${payrollName}`],
  ]
  const sentFacts: Array<[string, string]> = [
    ['Hours', formatHours(sent.hours)],
    ['Shifts', String(sent.sent.length)],
    ['People', String(sent.rows.length)],
    ['Payroll', `The ${payrollName}`],
  ]
  const factsTitle = {
    review: 'What you’re sending',
    sending: 'What’s being sent',
    sent: 'What was sent',
    failed: 'What wasn’t sent',
  }[stage]
  const description = {
    review: `${scheduleLabel(schedule)} · ${formatPeriod(period)}. Check what’s going, then send.`,
    sending: `${scheduleLabel(schedule)} · ${formatPeriod(period)}. Started ${formatDateTime(sendingSince ?? '')}; you can go back to timesheets while it runs.`,
    sent: sent.lastAt
      ? `${scheduleLabel(schedule)} · ${formatPeriod(period)}. Sent ${formatDateTime(sent.lastAt)} to the ${payrollName}.`
      : `${scheduleLabel(schedule)} · ${formatPeriod(period)}.`,
    failed: `${scheduleLabel(schedule)} · ${formatPeriod(period)}. Nothing was sent.`,
  }[stage]

  const backButton = (variant: 'primary' | 'secondary') => (
    <Components.Button variant={variant} onClick={onClose}>
      Back to timesheets
    </Components.Button>
  )
  const primaryAction =
    stage === 'failed' ? (
      <Components.Button onClick={onSendAgain}>Try again</Components.Button>
    ) : (
      <Components.Button
        isLoading={stage === 'sending'}
        isDisabled={stage === 'sending' || included.length === 0}
        onClick={send}
      >
        {action}
      </Components.Button>
    )
  const footer =
    stage === 'sent' ? (
      <ActionsLayout>{backButton('primary')}</ActionsLayout>
    ) : (
      <ActionsLayout>
        {backButton('secondary')}
        {primaryAction}
      </ActionsLayout>
    )

  return (
    <SubPage
      trail={[{ label: 'Timesheets', onClick: onClose }]}
      current={action}
      title={
        <>
          {action} <ChangePin id="send-dialog" /> <ChangePin id="send-anchored" />
        </>
      }
      description={description}
      footer={footer}
    >
      {stage === 'review' && period.payroll && (
        <Components.Alert
          status="info"
          label={`Send by ${formatDateTime(period.payroll.payroll_deadline)}`}
        >
          Hours sent by then are paid on {formatShortDate(period.payroll.check_date)}.
        </Components.Alert>
      )}
      {stage === 'review' && skippedCount > 0 && (
        <Components.Alert
          status="warning"
          label={`${plural(skippedCount, 'shift', 'shifts')} won’t be sent`}
          action={
            <Components.Button variant="secondary" onClick={onClose}>
              Review shifts
            </Components.Button>
          }
        >
          <ul className={styles.skipList}>
            {skippedGroups.map(group => (
              <li key={group.reason}>
                <strong>{group.label}:</strong> {group.names}
              </li>
            ))}
          </ul>
          Only approved, finished shifts are sent. Hours left out aren’t paid on this payroll unless
          you approve them and send again. <ChangePin id="send-warning" />
        </Components.Alert>
      )}
      {stage === 'sending' && (
        <Components.Alert status="info" label="Sending hours to payroll…">
          <Flex alignItems="center" gap={8}>
            <Components.LoadingSpinner size="sm" style="inline" />
            <span>
              This may take a minute or two. The result shows here when it’s done.{' '}
              <GapPin id="sync-limits" />
            </span>
          </Flex>
        </Components.Alert>
      )}
      {stage === 'failed' && failure?.kind === 'processed' && (
        <Components.Alert status="error" label={`The ${payrollName} was already processed`}>
          There’s no open payroll for these dates, so their hours can’t change.{' '}
          <GapPin id="sync-limits" />
        </Components.Alert>
      )}
      {stage === 'failed' && failure?.kind === 'error' && (
        <Components.Alert status="error" label="The send failed">
          Payroll didn’t accept any hours, so nothing changed. Try again, and if it keeps failing,
          contact support. What the API reports for a failed send isn’t defined yet.{' '}
          <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      {stage === 'sent' && failure?.kind === 'partial' && (
        <Components.Alert
          status="error"
          label={`${plural(failure.names.length, 'person wasn’t', 'people weren’t')} sent`}
          action={
            <Components.Button variant="secondary" onClick={onSendAgain}>
              Try again
            </Components.Button>
          }
        >
          {plural(failure.shifts, 'shift', 'shifts')} for {failure.names.join(', ')} didn’t reach
          payroll. Everyone else was sent. What the API reports for a partial send isn’t defined
          yet. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      {stage === 'sent' && !failure && (
        <Components.Alert status="success" label="Hours sent to payroll">
          {plural(sent.rows.length, 'person’s', 'people’s')} hours are on the {payrollName}.
        </Components.Alert>
      )}
      <Components.Box header={<Components.BoxHeader title={factsTitle} />}>
        <Flex flexDirection="column" gap={16}>
          <Facts facts={stage === 'sent' ? sentFacts : toSendFacts} />
          <Components.Text size="sm" variant="supporting">
            Sending replaces the hours payroll has for these dates, including hours changed by hand.
            Payroll works out overtime when the hours arrive. <GapPin id="rules-applied" />
          </Components.Text>
        </Flex>
      </Components.Box>
      {stage === 'sent' && sent.changed > 0 && (
        <Components.Alert
          status="warning"
          label={`${plural(sent.changed, 'shift has', 'shifts have')} changed since this send`}
          action={
            <Components.Button variant="secondary" onClick={onSendAgain}>
              Update payroll
            </Components.Button>
          }
        >
          Payroll keeps the old hours until you update it. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      <div className={styles.simulate}>
        <Components.Select
          label="Prototype only: simulate the result"
          placeholder="Choose a result"
          value={outcome}
          isDisabled={stage !== 'review'}
          options={OUTCOME_OPTIONS}
          onChange={value => {
            if (isOutcome(value)) setOutcome(value)
          }}
        />
      </div>
    </SubPage>
  )
}
