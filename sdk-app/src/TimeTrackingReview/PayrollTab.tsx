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
import { GapPin, PrototypeModal } from './parts'
import type { Notify } from './preview'
import { DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const PERIODS_PER_SCHEDULE = 3

interface PayrollRow {
  schedule: ApiPaySchedule
  period: ApiPayPeriod
  unsent: number
  notReady: number
  total: number
}

export function PayrollTab({
  companyId,
  people,
  schedules,
  periods,
  applySim,
  onReview,
  onProcess,
  onNotify,
}: {
  companyId: string
  people: Person[]
  schedules: ApiPaySchedule[]
  periods: ApiPayPeriod[]
  onReview: (scheduleUuid: string, key: string) => void
  applySim: (shifts: ApiShift[]) => ApiShift[]
  onProcess: (period: ApiPayPeriod) => void
  onNotify: Notify
}) {
  const Components = useComponentContext()
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = useMemo(
    () =>
      schedules.flatMap(schedule =>
        periods
          .filter(p => p.pay_schedule_uuid === schedule.uuid && p.payroll && p.start_date <= today)
          .sort((a, b) => b.start_date.localeCompare(a.start_date))
          .slice(0, PERIODS_PER_SCHEDULE)
          .map(period => ({ schedule, period })),
      ),
    [schedules, periods, today],
  )

  const [shifts, setShifts] = useState<ApiShift[] | null>(null)
  const [running, setRunning] = useState<PayrollRow | null>(null)

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

  const rows: PayrollRow[] = upcoming
    .map(({ schedule, period }) => {
      const mine = applySim(shifts ?? []).filter(s => {
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
        notReady: count(['pending', 'open']),
      }
    })
    .sort((a, b) =>
      a.period.payroll!.payroll_deadline.localeCompare(b.period.payroll!.payroll_deadline),
    )

  const dataView = useDataView<PayrollRow>({
    data: rows,
    columns: [
      {
        title: 'Payroll',
        render: ({ schedule, period }) => (
          <Flex flexDirection="column" gap={0}>
            <Components.Text weight="medium">{formatPeriod(period)}</Components.Text>
            <Components.Text size="sm" variant="supporting">
              {scheduleLabel(schedule)}
            </Components.Text>
          </Flex>
        ),
      },
      { title: 'Check date', render: ({ period }) => formatShortDate(period.payroll!.check_date) },
      {
        title: 'Deadline',
        render: ({ period }) => formatDateTime(period.payroll!.payroll_deadline),
      },
      {
        title: (
          <>
            Timesheets <GapPin id="resync" />
          </>
        ),
        render: row =>
          row.period.payroll?.processed ? (
            <Components.Badge status="success">Processed</Components.Badge>
          ) : shifts === null ? (
            '…'
          ) : row.unsent > 0 ? (
            <Components.Badge status="warning">{row.unsent} not sent</Components.Badge>
          ) : row.total > 0 ? (
            <Components.Badge status="success">All sent</Components.Badge>
          ) : (
            <Components.Badge>No shifts</Components.Badge>
          ),
      },
    ],
    itemMenu: row =>
      row.period.payroll?.processed ? null : (
        <Components.Button
          variant="secondary"
          onClick={() => {
            setRunning(row)
          }}
        >
          Run payroll
        </Components.Button>
      ),
  })

  const runPayroll = (row: PayrollRow) => {
    const payrollUuid = row.period.payroll!.payroll_uuid
    setRunning(null)
    onProcess(row.period)
    onNotify(
      `Payroll for ${formatPeriod(row.period)} submitted.${row.unsent ? ` ${row.unsent} approved shifts weren’t in it.` : ''}`,
      {
        title: `Run payroll: ${formatPeriod(row.period)}`,
        requests: [
          { method: 'PUT', path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/prepare` },
          { method: 'PUT', path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/calculate` },
          { method: 'PUT', path: `/v1/companies/${companyId}/payrolls/${payrollUuid}/submit` },
        ],
        notes: ['Payroll’s own flow. It uses whatever hours payroll already has.'],
        gapIds: ['resync', 'lock-bug'],
      },
    )
  }

  return (
    <Flex flexDirection="column" gap={16}>
      <Components.Text size="sm" variant="supporting">
        A stand-in for the payroll screen, which is a different flow. It shows where the reminder to
        send hours first would appear. Transition and off-cycle payrolls aren’t listed.{' '}
        <GapPin id="transition" />
      </Components.Text>
      <DataView label="Upcoming payrolls" {...dataView} />

      {running && (
        <PrototypeModal
          title={`Run payroll: ${formatPeriod(running.period)}`}
          onClose={() => {
            setRunning(null)
          }}
          footer={
            <Flex justifyContent="flex-end" gap={12}>
              <Components.Button
                variant="secondary"
                onClick={() => {
                  runPayroll(running)
                }}
              >
                {running.unsent > 0 ? 'Run without sending' : 'Submit payroll'}
              </Components.Button>
              {running.unsent > 0 && (
                <Components.Button
                  onClick={() => {
                    setRunning(null)
                    onReview(running.schedule.uuid, periodKey(running.period))
                  }}
                >
                  Review and send hours
                </Components.Button>
              )}
            </Flex>
          }
        >
          {running.unsent > 0 ? (
            <Components.Alert status="warning" label="You use timesheets">
              {running.unsent} approved {running.unsent === 1 ? 'shift hasn’t' : 'shifts haven’t'}{' '}
              been sent to this payroll. Send them before you run it?
              {running.notReady > 0 &&
                ` ${running.notReady} more are pending or still clocked in and won’t go.`}
            </Components.Alert>
          ) : (
            <Components.Text>
              {running.total === 0
                ? 'No shifts in this period.'
                : 'Every approved shift in this period has been sent.'}
            </Components.Text>
          )}
          <Components.Text size="sm" variant="supporting">
            Payroll’s current hours per person can’t be read until it’s prepared.{' '}
            <GapPin id="payroll-hours" />
          </Components.Text>
        </PrototypeModal>
      )}
    </Flex>
  )
}
