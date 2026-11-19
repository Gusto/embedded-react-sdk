import {
  formatDay,
  formatHours,
  formatPeriod,
  localStartDate,
  reviewState,
  scheduleLabel,
  willSync,
  workedHours,
  EFFECT_LABEL,
  REVIEW_STATE_LABEL,
  type Person,
  type ApiPayPeriod,
  type ApiPaySchedule,
  type ApiShift,
} from './model'
import { GapPin, Modal, ReadOnlyNote, RequestBlock } from './parts'
import styles from './TimeTrackingReview.module.scss'

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
  const included = shifts.filter(willSync)
  const skipped = shifts.filter(shift => !willSync(shift))
  const rows = people
    .map(person => {
      const mine = included.filter(s => s.entity_uuid === person.employee.uuid)
      return { person, count: mine.length, hours: mine.reduce((sum, s) => sum + workedHours(s), 0) }
    })
    .filter(row => row.count > 0)
    .sort((a, b) => a.person.name.localeCompare(b.person.name))
  const nameOf = (uuid: string) => people.find(p => p.employee.uuid === uuid)?.name ?? uuid

  return (
    <Modal
      wide
      title={`${isUpdate ? 'Update payroll' : 'Send to payroll'}: ${scheduleLabel(schedule)} · ${formatPeriod(period)}`}
      onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={styles.bannerWarning}>
        <GapPin id="scope" /> This recalculates hours for{' '}
        <strong>everyone on {scheduleLabel(schedule)}</strong> for these dates and replaces what’s
        on the payroll, including any hours fixed by hand in payroll. Filters on the page don’t
        narrow it.
      </div>

      <RequestBlock
        method="POST"
        path={`/v1/companies/${companyId}/time_tracking/payroll_syncs`}
        body={{
          pay_schedule_uuid: schedule.uuid,
          start_date: period.start_date,
          end_date: period.end_date,
        }}
        caption="Then poll the sync’s status by its UUID until it finishes. The path is a best guess and hasn’t been checked against the API."
      />

      <h3 className={styles.subhead}>
        Will be included: {included.length} approved, finished shifts
      </h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Person</th>
            <th>
              Hours sync <GapPin id="flsa" />
            </th>
            <th className={styles.num}>Shifts</th>
            <th className={styles.num}>Worked</th>
            <th className={styles.num}>
              Overtime <GapPin id="overtime" />
            </th>
            <th>
              Change on payroll <GapPin id="payroll-hours" />
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ person, count, hours }) => (
            <tr key={person.employee.uuid}>
              <td>{person.name}</td>
              <td>
                <span className={`${styles.effect} ${styles[`effect_${person.effect}`]}`}>
                  {EFFECT_LABEL[person.effect]}
                </span>
              </td>
              <td className={styles.num}>{count}</td>
              <td className={styles.num}>{formatHours(hours)}</td>
              <td className={styles.num}>—</td>
              <td className={styles.muted}>Can’t read payroll’s hours</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className={styles.subhead}>Won’t be sent: {skipped.length}</h3>
      {skipped.length === 0 ? (
        <p className={styles.muted}>Nothing is pending, rejected or still clocked in.</p>
      ) : (
        <ul className={styles.plainList}>
          {skipped.map(shift => (
            <li key={shift.uuid}>
              {nameOf(shift.entity_uuid)}, {formatDay(localStartDate(shift))}:{' '}
              {REVIEW_STATE_LABEL[reviewState(shift)]}.{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => {
                  onReview(shift.entity_uuid)
                }}
              >
                Review
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.muted}>
        After it finishes, the only record of what went is each shift’s new synced_to_payroll_at.{' '}
        <GapPin id="which-payroll" /> <GapPin id="receipt" />
      </p>
      <ReadOnlyNote />
    </Modal>
  )
}
