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
import { ActionsLayout, Flex, PayrollLoading } from '@/components/Common'
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
  const included = shifts.filter(willSync)
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid
  const peopleIncluded = new Set(included.map(shift => shift.entity_uuid)).size
  const hours = included.reduce((sum, shift) => sum + workedHours(shift), 0)
  const payrollName = period.payroll
    ? `${formatShortDate(period.payroll.check_date)} payroll`
    : 'payroll'
  const action = isUpdate ? 'Update payroll' : 'Send to payroll'
  const trail = [{ label: 'Timesheets', onClick: onClose }]

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

  if (view === 'review') {
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
              caption:
                'Then poll the sync by its UUID until it finishes. The path is a best guess.',
            },
          ],
          gapIds: ['sync-limits', 'which-timesheets'],
        },
        outcome,
      )
    }
    return (
      <SubPage
        trail={trail}
        current={action}
        title={
          <>
            Review and send hours <ChangePin id="send-dialog" />
          </>
        }
        description={`${scheduleLabel(schedule)} · ${formatPeriod(period)}`}
        footer={
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onClose}>
              Back
            </Components.Button>
            <Components.Button isDisabled={included.length === 0} onClick={send}>
              {action}
            </Components.Button>
          </ActionsLayout>
        }
      >
        {period.payroll && (
          <Components.Alert
            status="info"
            label={`To pay these hours on ${formatShortDate(period.payroll.check_date)}, send them by ${formatDateTime(period.payroll.payroll_deadline)}.`}
          />
        )}
        {skippedCount > 0 && (
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
            Only approved, finished shifts are sent. Hours left out aren’t paid on this payroll
            unless you approve them and send again. <ChangePin id="send-warning" />
          </Components.Alert>
        )}
        <Components.Box header={<Components.BoxHeader title="What you’re sending" />}>
          <Flex flexDirection="column" gap={16}>
            <Facts
              facts={[
                ['Hours', formatHours(hours)],
                ['Approved shifts', String(included.length)],
                ['People', String(peopleIncluded)],
                ['Goes to', `The ${payrollName}`],
              ]}
            />
            <Components.Text size="sm" variant="supporting">
              Sending replaces the hours payroll has for {scheduleLabel(schedule)},{' '}
              {formatPeriod(period)}, including hours changed by hand. Payroll works out overtime
              when the hours arrive. <GapPin id="sync-limits" /> <GapPin id="rules-applied" />
            </Components.Text>
          </Flex>
        </Components.Box>
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
      </SubPage>
    )
  }

  if (sendingSince) {
    return (
      <SubPage
        trail={trail}
        current={action}
        title={action}
        footer={
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onClose}>
              Back to timesheets
            </Components.Button>
          </ActionsLayout>
        }
      >
        <PayrollLoading
          title="Sending hours to payroll..."
          description="This may take a minute or two. You can leave this page while this happens."
        />
        <Components.Text size="sm" variant="supporting">
          Started {formatDateTime(sendingSince)}. <GapPin id="sync-limits" />{' '}
          <ChangePin id="send-outcomes" />
        </Components.Text>
      </SubPage>
    )
  }

  const isFailed = failure !== null && failure.kind !== 'partial'
  const summaryActions = <Components.Button onClick={onClose}>Done</Components.Button>
  const tryAgain = (
    <Components.Button variant="secondary" onClick={onSendAgain}>
      Try again
    </Components.Button>
  )

  return (
    <SubPage
      trail={trail}
      current="Send summary"
      title={
        <>
          Send summary <ChangePin id="send-dialog" />
        </>
      }
      description={
        isFailed || !sent.lastAt
          ? `Nothing was sent for ${formatPeriod(period)}.`
          : `Sent ${formatDateTime(sent.lastAt)} to the ${payrollName}.`
      }
      actions={summaryActions}
    >
      {failure?.kind === 'processed' && (
        <Components.Alert status="error" label={`The ${payrollName} was already processed`}>
          There’s no open payroll for these dates, so their hours can’t change.{' '}
          <GapPin id="sync-limits" />
        </Components.Alert>
      )}
      {failure?.kind === 'error' && (
        <Components.Alert status="error" label="The send failed" action={tryAgain}>
          Payroll didn’t accept any hours, so nothing changed. If it keeps failing, contact support.
          What the API reports for a failed send isn’t defined yet. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      {failure?.kind === 'partial' && (
        <Components.Alert
          status="error"
          label={`${plural(failure.names.length, 'person wasn’t', 'people weren’t')} sent`}
          action={tryAgain}
        >
          {plural(failure.shifts, 'shift', 'shifts')} for {failure.names.join(', ')} didn’t reach
          payroll. Everyone else was sent. What the API reports for a partial send isn’t defined
          yet. <GapPin id="which-timesheets" />
        </Components.Alert>
      )}
      {!failure && sent.lastAt && (
        <Components.Alert status="success" label="Hours sent to payroll">
          {plural(sent.rows.length, 'person’s', 'people’s')} hours are on the {payrollName}.
        </Components.Alert>
      )}
      {!isFailed && sent.lastAt && (
        <Components.Box header={<Components.BoxHeader title="What was sent" />}>
          <Facts
            facts={[
              ['Hours', formatHours(sent.hours)],
              ['Shifts', String(sent.sent.length)],
              ['People', String(sent.rows.length)],
              ['Payroll', `The ${payrollName}`],
            ]}
          />
        </Components.Box>
      )}
      {!isFailed && sent.changed > 0 && (
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
    </SubPage>
  )
}
