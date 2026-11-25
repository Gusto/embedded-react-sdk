import { useState } from 'react'
import {
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
} from './model'
import { ChangePin, GapPin } from './parts'
import type { Preview } from './preview'
import styles from './TimeTrackingReview.module.scss'
import { Flex } from '@/components/Common'
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

export function SendDialog({
  isOpen,
  companyId,
  schedule,
  period,
  people,
  shifts,
  isUpdate,
  onClose,
  onSend,
}: {
  isOpen: boolean
  companyId: string
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  people: Person[]
  shifts: ApiShift[]
  isUpdate: boolean
  onClose: () => void
  onSend: (included: ApiShift[], preview: Preview, outcome: SendOutcome) => void
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

  const send = () => {
    onSend(
      included,
      {
        title: isUpdate ? 'Update payroll' : 'Send to payroll',
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

  const action = isUpdate ? 'Update payroll' : 'Send to payroll'

  return (
    <Components.Dialog
      isOpen={isOpen}
      onClose={onClose}
      onPrimaryActionClick={send}
      title={
        <>
          {isUpdate ? 'Update payroll' : 'Send hours to payroll'}? <ChangePin id="send-dialog" />
        </>
      }
      primaryActionLabel={skippedCount > 0 ? `${action} anyway` : action}
      closeActionLabel={skippedCount > 0 ? 'Review shifts first' : 'Cancel'}
      shouldCloseOnBackdropClick
    >
      <Flex flexDirection="column" gap={16}>
        <Components.Text>
          {formatHours(hours)} hours from {included.length} approved{' '}
          {included.length === 1 ? 'shift' : 'shifts'} for {peopleIncluded}{' '}
          {peopleIncluded === 1 ? 'person' : 'people'} go to the {payrollName}. This replaces the
          hours payroll has for {scheduleLabel(schedule)}, {formatPeriod(period)}, including hours
          changed by hand. <GapPin id="sync-limits" />
        </Components.Text>
        {skippedCount > 0 && (
          <Components.Alert
            status="warning"
            label={`${skippedCount} ${skippedCount === 1 ? 'shift' : 'shifts'} won’t be sent`}
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
      </Flex>
    </Components.Dialog>
  )
}
