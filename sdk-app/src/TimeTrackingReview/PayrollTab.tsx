import { useEffect, useMemo, useState } from 'react'
import { getAllPages, withQuery } from './api'
import {
  addDays,
  formatDateTime,
  formatPeriod,
  formatShortDate,
  localStartDate,
  periodKey,
  reviewState,
  scheduleLabel,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
  type Person,
} from './model'
import { GapPin } from './parts'
import type { Preview } from './preview'
import styles from './TimeTrackingReview.module.scss'

const PERIODS_PER_SCHEDULE = 3

export function PayrollTab({
  companyId,
  people,
  schedules,
  periods,
  onReview,
  onPreview,
}: {
  companyId: string
  people: Person[]
  schedules: ApiPaySchedule[]
  periods: ApiPayPeriod[]
  onReview: (scheduleUuid: string, key: string, openSend: boolean) => void
  onPreview: (preview: Preview) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = useMemo(
    () =>
      schedules.flatMap(schedule =>
        periods
          .filter(
            p =>
              p.pay_schedule_uuid === schedule.uuid &&
              p.payroll &&
              !p.payroll.processed &&
              p.start_date <= today,
          )
          .sort((a, b) => b.start_date.localeCompare(a.start_date))
          .slice(0, PERIODS_PER_SCHEDULE)
          .map(period => ({ schedule, period })),
      ),
    [schedules, periods, today],
  )

  const [shifts, setShifts] = useState<ApiShift[] | null>(null)
  useEffect(() => {
    if (!upcoming.length) return
    const controller = new AbortController()
    const from = upcoming.reduce(
      (min, u) => (u.period.start_date < min ? u.period.start_date : min),
      upcoming[0]!.period.start_date,
    )
    const to = upcoming.reduce(
      (max, u) => (u.period.end_date > max ? u.period.end_date : max),
      upcoming[0]!.period.end_date,
    )
    const path = withQuery(`/v1/companies/${companyId}/time_tracking/time_sheets`, {
      entity_type: 'Employee',
      shift_started_after: `${addDays(from, -1)}T00:00:00Z`,
      shift_started_before: `${addDays(to, 2)}T00:00:00Z`,
    })
    getAllPages<ApiShift>(path, 500, controller.signal)
      .then(setShifts)
      .catch(() => {
        if (!controller.signal.aborted) setShifts([])
      })
    return () => {
      controller.abort()
    }
  }, [companyId, upcoming])

  const scheduleOf = useMemo(
    () => new Map(people.map(p => [p.employee.uuid, p.scheduleUuid])),
    [people],
  )

  const rows = upcoming
    .map(({ schedule, period }) => {
      const mine = (shifts ?? []).filter(s => {
        const date = localStartDate(s)
        return (
          scheduleOf.get(s.entity_uuid) === schedule.uuid &&
          date >= period.start_date &&
          date <= period.end_date
        )
      })
      const count = (states: string[]) => mine.filter(s => states.includes(reviewState(s))).length
      return {
        schedule,
        period,
        total: mine.length,
        unsent: count(['unsent', 'changed']),
        pending: count(['pending', 'open']),
        sent: count(['sent']),
      }
    })
    .sort((a, b) =>
      a.period.payroll!.payroll_deadline.localeCompare(b.period.payroll!.payroll_deadline),
    )

  const runPreview = (period: ApiPayPeriod) => {
    const payrollUuid = period.payroll!.payroll_uuid
    onPreview({
      title: `Run payroll: ${formatPeriod(period)}`,
      requests: [
        {
          method: 'PUT',
          path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/prepare`,
          caption: 'Payroll’s own flow, not time tracking.',
        },
        { method: 'PUT', path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/calculate` },
        { method: 'PUT', path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/submit` },
      ],
      notes: [
        'Payroll uses whatever hours it has. Approved shifts that were never sent aren’t in them.',
        'Once it’s processed, sending again changes nothing and status changes on these dates are blocked.',
      ],
      gapIds: ['resync', 'lock-bug'],
    })
  }

  return (
    <div className={styles.tabBody}>
      <div className={styles.bannerInfo}>
        This stands in for the payroll screen, which is a different flow. It shows where the “send
        your hours first” reminder would sit. <GapPin id="resync" />
      </div>

      {shifts === null && (
        <div className={styles.placeholder}>Loading shifts for upcoming payrolls…</div>
      )}

      <div className={styles.payrollList}>
        {rows.map(({ schedule, period, total, unsent, pending, sent }) => {
          const payroll = period.payroll!
          const overdue = payroll.payroll_deadline < new Date().toISOString()
          return (
            <article key={`${schedule.uuid}-${periodKey(period)}`} className={styles.payrollCard}>
              <div className={styles.payrollHeader}>
                <div>
                  <h3>
                    {scheduleLabel(schedule)} · {formatPeriod(period)}
                  </h3>
                  <p className={styles.muted}>
                    Check date {formatShortDate(payroll.check_date)} · deadline{' '}
                    {formatDateTime(payroll.payroll_deadline)}
                    {overdue && ' · past the deadline'}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    runPreview(period)
                  }}
                >
                  Run payroll
                </button>
              </div>
              {shifts !== null && unsent > 0 && (
                <div className={styles.bannerWarning}>
                  <strong>You use timesheets.</strong> {unsent} approved{' '}
                  {unsent === 1 ? 'shift hasn’t' : 'shifts haven’t'} been sent to this payroll. Send
                  them before you run it?
                  {pending > 0 && ` ${pending} more are pending or still clocked in and won’t go.`}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.primaryButton}
                      onClick={() => {
                        onReview(schedule.uuid, periodKey(period), true)
                      }}
                    >
                      Review and send
                    </button>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => {
                        onReview(schedule.uuid, periodKey(period), false)
                      }}
                    >
                      Open timesheets
                    </button>
                  </div>
                </div>
              )}
              {shifts !== null && unsent === 0 && (
                <p className={styles.muted}>
                  {total === 0
                    ? 'No shifts in this period.'
                    : `All ${sent} approved shifts have been sent.${pending ? ` ${pending} are pending or still clocked in.` : ''}`}{' '}
                  <GapPin id="which-payroll" />
                </p>
              )}
              <p className={styles.muted}>
                What payroll currently has for each person can’t be read until it’s prepared.{' '}
                <GapPin id="payroll-hours" />
              </p>
            </article>
          )
        })}
      </div>
      <p className={styles.muted}>
        Shows the latest {PERIODS_PER_SCHEDULE} unprocessed payrolls for each schedule. Transition
        and off-cycle payrolls aren’t here. <GapPin id="transition" />
      </p>
    </div>
  )
}
