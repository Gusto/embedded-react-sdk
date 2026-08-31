import { useMemo, useState } from 'react'
import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesUpdateMutation } from '@gusto/embedded-api/react-query/paySchedulesUpdate'
import { PayScheduleUpdateRequestWorkweekStartDay } from '@gusto/embedded-api/models/components/payscheduleupdaterequest'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import styles from './RropApiVerification.module.scss'
import {
  Field,
  JsonBlock,
  RunButton,
  StepCard,
  classifyError,
  useAsyncStep,
  type ClassifiedError,
  type StepPhase,
} from './shared'

const WEEKDAYS = Object.values(PayScheduleUpdateRequestWorkweekStartDay)

/**
 * Pay Schedules RRoP verification (Test Fest cases 6–11). Reads
 * `workweek_start_day` off every schedule, and offers a gated update path that
 * confirms the write response (also a `PayScheduleShow`) parses.
 */
export function PaySchedulesVerification({ companyId }: { companyId: string }) {
  const listQuery = usePaySchedulesGetAll({ companyId }, { enabled: false, throwOnError: false })

  const listPhase: StepPhase = listQuery.isFetching
    ? 'running'
    : listQuery.error
      ? 'error'
      : listQuery.isFetched
        ? 'success'
        : 'idle'
  const listError: ClassifiedError | null = listQuery.error ? classifyError(listQuery.error) : null

  const schedules = useMemo(() => listQuery.data?.payScheduleShowResponse ?? [], [listQuery.data])

  const [selectedUuid, setSelectedUuid] = useState('')
  const [targetDay, setTargetDay] = useState<PayScheduleUpdateRequestWorkweekStartDay>(
    PayScheduleUpdateRequestWorkweekStartDay.Monday,
  )
  const selectedSchedule = schedules.find(s => s.uuid === selectedUuid)

  const updateMutation = usePaySchedulesUpdateMutation()
  const updateStep = useAsyncStep<PayScheduleShow | undefined>()

  const runUpdate = () => {
    if (!selectedSchedule) return
    void updateStep.run(async () => {
      const response = await updateMutation.mutateAsync({
        request: {
          companyId,
          payScheduleId: selectedSchedule.uuid,
          payScheduleUpdateRequest: {
            version: selectedSchedule.version,
            workweekStartDay: targetDay,
          },
        },
      })
      return response.payScheduleShow
    })
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Pay Schedules</h3>
      <p className={styles.sectionIntro}>
        Verifies <code>workweek_start_day</code> parses on read and write. ⚠️ Updating a pay
        schedule deletes all unprocessed payrolls with future pay-period end dates — the update step
        is opt-in and will wipe the draft payroll the Payrolls section below relies on. Run it last.
      </p>

      <StepCard
        title="List pay schedules"
        description="GET /v1/companies/:id/pay_schedules — reads workweekStartDay on every schedule."
        phase={listPhase}
        error={listError}
        actions={
          <RunButton onClick={() => void listQuery.refetch()} disabled={listQuery.isFetching}>
            {listQuery.isFetched ? 'Re-run' : 'Run'}
          </RunButton>
        }
      >
        {listPhase === 'success' && (
          <>
            <Field label="count" value={schedules.length} />
            {schedules.map(schedule => (
              <div key={schedule.uuid} className={styles.field}>
                <span className={styles.fieldLabel}>{schedule.customName ?? schedule.uuid}</span>
                <span className={styles.fieldValue}>
                  frequency={schedule.frequency ?? '—'} · workweekStartDay=
                  {schedule.workweekStartDay ?? '—'}
                </span>
              </div>
            ))}
            <JsonBlock label="Raw payScheduleShowResponse" value={schedules} />
          </>
        )}
      </StepCard>

      <StepCard
        title="Update workweekStartDay (destructive)"
        description="PUT /v1/companies/:id/pay_schedules/:id — confirms the write response parses. Deletes future unprocessed payrolls."
        phase={updateStep.phase}
        error={updateStep.error}
        actions={
          <RunButton
            onClick={runUpdate}
            disabled={!selectedSchedule || updateStep.phase === 'running'}
          >
            Run update
          </RunButton>
        }
      >
        <div className={styles.inlineControls}>
          <label className={styles.controlGroup}>
            <span className={styles.fieldLabel}>Pay schedule</span>
            <select
              value={selectedUuid}
              onChange={e => {
                setSelectedUuid(e.target.value)
              }}
            >
              <option value="">Select a schedule (run List first)…</option>
              {schedules.map(schedule => (
                <option key={schedule.uuid} value={schedule.uuid}>
                  {schedule.customName ?? schedule.uuid} — {schedule.frequency ?? ''}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.controlGroup}>
            <span className={styles.fieldLabel}>New workweekStartDay</span>
            <select
              value={targetDay}
              onChange={e => {
                setTargetDay(e.target.value as PayScheduleUpdateRequestWorkweekStartDay)
              }}
            >
              {WEEKDAYS.map(day => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
        </div>
        {updateStep.phase === 'success' && updateStep.result && (
          <>
            <Field label="uuid" value={updateStep.result.uuid} />
            <Field label="version" value={updateStep.result.version} />
            <Field label="workweekStartDay" value={updateStep.result.workweekStartDay ?? '—'} />
            <JsonBlock label="Raw payScheduleShow" value={updateStep.result} />
          </>
        )}
      </StepCard>
    </section>
  )
}
