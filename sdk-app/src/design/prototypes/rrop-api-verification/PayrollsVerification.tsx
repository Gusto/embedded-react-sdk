import { useEffect, useMemo, useState } from 'react'
import { usePayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import { ProcessingStatuses } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import type {
  PayrollPrepared,
  PayrollShow,
} from '@gusto/embedded-api/models/components/payrollshow'
import type { PayrollUpdate } from '@gusto/embedded-api/models/components/payrollupdate'
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

/**
 * Rebuild a valid `PayrollUpdate` body from a prepared payroll: echo each
 * employee-compensation version, and attach `breakdowns` that tile every
 * workweek (full value in the first week, zeros in the rest) so the array covers
 * the whole pay period with no gaps/overlaps and sums to each line's total —
 * the constraints the RRoP write path enforces.
 */
function buildUpdateBody(prepared: PayrollPrepared): PayrollUpdate {
  const workweeks = prepared.workweeks ?? []

  const tile = (total: string | undefined, zero: string) =>
    workweeks.map((ww, index) => ({
      startDate: ww.startDate,
      endDate: ww.endDate,
      value: index === 0 ? (total ?? zero) : zero,
    }))

  return {
    employeeCompensations: (prepared.employeeCompensations ?? []).map(comp => ({
      employeeUuid: comp.employeeUuid,
      version: comp.version != null ? String(comp.version) : undefined,
      excluded: comp.excluded,
      hourlyCompensations: (comp.hourlyCompensations ?? []).map(hourly => ({
        name: hourly.name,
        hours: hourly.hours,
        jobUuid: hourly.jobUuid,
        breakdowns:
          workweeks.length > 0
            ? tile(hourly.hours, '0.000').map(({ startDate, endDate, value }) => ({
                startDate,
                endDate,
                hours: value,
              }))
            : undefined,
      })),
      fixedCompensations: (comp.fixedCompensations ?? []).map(fixed => ({
        name: fixed.name,
        amount: fixed.amount,
        jobUuid: fixed.jobUuid,
        breakdowns:
          workweeks.length > 0
            ? tile(fixed.amount, '0.00').map(({ startDate, endDate, value }) => ({
                startDate,
                endDate,
                amount: value,
              }))
            : undefined,
      })),
    })),
  }
}

function PreparedSummary({ prepared }: { prepared: PayrollPrepared }) {
  const firstComp = prepared.employeeCompensations?.[0]
  return (
    <>
      <Field label="workweeks (count)" value={prepared.workweeks?.length ?? 0} />
      {prepared.workweeks?.map((ww, i) => (
        <Field
          key={i}
          label={`workweek[${i}]`}
          value={`${String(ww.startDate ?? '?')} → ${String(ww.endDate ?? '?')}`}
        />
      ))}
      <Field
        label="employeeCompensations (count)"
        value={prepared.employeeCompensations?.length ?? 0}
      />
      {firstComp && (
        <>
          <Field label="[0].grossPay" value={firstComp.grossPay ?? '—'} />
          <Field label="[0].version" value={String(firstComp.version ?? '—')} />
          <Field
            label="[0].hourlyComp breakdowns"
            value={String(firstComp.hourlyCompensations?.[0]?.breakdowns?.length ?? 0)}
          />
        </>
      )}
    </>
  )
}

/**
 * Payrolls RRoP verification (Test Fest cases 12–19). Walks the Prepare →
 * Update → Calculate → Get sequence, confirming `workweeks`, per-compensation
 * `breakdowns`, `gross_pay`, and `pay_adjustments` all parse at each step.
 */
export function PayrollsVerification({
  companyId,
  initialPayrollId,
}: {
  companyId: string
  initialPayrollId?: string
}) {
  const listQuery = usePayrollsList(
    { companyId, processingStatuses: [ProcessingStatuses.Unprocessed] },
    { enabled: false, throwOnError: false },
  )

  const listPhase: StepPhase = listQuery.isFetching
    ? 'running'
    : listQuery.error
      ? 'error'
      : listQuery.isFetched
        ? 'success'
        : 'idle'
  const listError: ClassifiedError | null = listQuery.error ? classifyError(listQuery.error) : null

  const unprocessedPayrolls = useMemo(
    () => (listQuery.data?.payrollList ?? []).filter(p => !p.processed),
    [listQuery.data],
  )

  const [payrollId, setPayrollId] = useState(initialPayrollId ?? '')
  useEffect(() => {
    if (!payrollId && unprocessedPayrolls[0]?.payrollUuid) {
      setPayrollId(unprocessedPayrolls[0].payrollUuid)
    }
  }, [unprocessedPayrolls, payrollId])

  const prepareMutation = usePayrollsPrepareMutation()
  const updateMutation = usePayrollsUpdateMutation()
  const calculateMutation = usePayrollsCalculateMutation()

  const prepareStep = useAsyncStep<PayrollPrepared | undefined>()
  const updateStep = useAsyncStep<PayrollPrepared | undefined>()
  const calculateStep = useAsyncStep<boolean>()
  const [prepared, setPrepared] = useState<PayrollPrepared | null>(null)

  const getQuery = usePayrollsGet({ companyId, payrollId }, { enabled: false, throwOnError: false })
  const getPhase: StepPhase = getQuery.isFetching
    ? 'running'
    : getQuery.error
      ? 'error'
      : getQuery.isFetched
        ? 'success'
        : 'idle'
  const getError: ClassifiedError | null = getQuery.error ? classifyError(getQuery.error) : null
  const payrollShow: PayrollShow | undefined = getQuery.data?.payrollShow

  const runPrepare = () =>
    void prepareStep.run(async () => {
      const response = await prepareMutation.mutateAsync({ request: { companyId, payrollId } })
      setPrepared(response.payrollPrepared ?? null)
      return response.payrollPrepared
    })

  const runUpdate = () =>
    void updateStep.run(async () => {
      if (!prepared) throw new Error('Run Prepare first to obtain versions + workweeks.')
      const response = await updateMutation.mutateAsync({
        request: { companyId, payrollId, payrollUpdate: buildUpdateBody(prepared) },
      })
      if (response.payrollPrepared) setPrepared(response.payrollPrepared)
      return response.payrollPrepared
    })

  const runCalculate = () =>
    void calculateStep.run(async () => {
      await calculateMutation.mutateAsync({ request: { companyId, payrollId } })
      return true
    })

  const disabledNoPayroll = !payrollId

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Payrolls (RRoP flow)</h3>
      <p className={styles.sectionIntro}>
        Walks Prepare → Update → Calculate → Get on an unprocessed payroll, verifying{' '}
        <code>workweeks</code>, per-compensation <code>breakdowns</code>, <code>gross_pay</code>,
        and <code>pay_adjustments</code> all parse. Update writes zero-tiled breakdowns covering the
        full pay period (safe, reversible by re-preparing); Calculate computes real numbers.
      </p>

      <StepCard
        title="1. List unprocessed payrolls"
        description="GET /v1/companies/:id/payrolls?processing_statuses=unprocessed"
        phase={listPhase}
        error={listError}
        actions={
          <RunButton onClick={() => void listQuery.refetch()} disabled={listQuery.isFetching}>
            {listQuery.isFetched ? 'Re-run' : 'Run'}
          </RunButton>
        }
      >
        <div className={styles.inlineControls}>
          <label className={styles.controlGroup}>
            <span className={styles.fieldLabel}>Payroll under test</span>
            <select
              value={payrollId}
              onChange={e => {
                setPayrollId(e.target.value)
              }}
            >
              <option value="">
                {initialPayrollId
                  ? `Settings payrollId (${initialPayrollId})`
                  : 'Select a payroll…'}
              </option>
              {unprocessedPayrolls.map(p => (
                <option key={p.payrollUuid} value={p.payrollUuid}>
                  {p.payrollUuid} — check {p.checkDate ?? ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        {listPhase === 'success' && (
          <>
            <Field label="unprocessed count" value={unprocessedPayrolls.length} />
            <JsonBlock label="Raw payrollList" value={listQuery.data?.payrollList} />
          </>
        )}
      </StepCard>

      <StepCard
        title="2. Prepare payroll"
        description="PUT .../prepare — response carries top-level workweeks, empty breakdowns scaffolds, and per-employee gross_pay + version."
        phase={prepareStep.phase}
        error={prepareStep.error}
        actions={
          <RunButton
            onClick={runPrepare}
            disabled={disabledNoPayroll || prepareStep.phase === 'running'}
          >
            Run prepare
          </RunButton>
        }
      >
        {prepareStep.phase === 'success' && prepareStep.result && (
          <>
            <PreparedSummary prepared={prepareStep.result} />
            <JsonBlock label="Raw payrollPrepared" value={prepareStep.result} />
          </>
        )}
      </StepCard>

      <StepCard
        title="3. Update payroll with breakdowns"
        description="PUT .../payrolls/:id — echoes versions and submits per-workweek breakdowns tiling the full pay period."
        phase={updateStep.phase}
        error={updateStep.error}
        actions={
          <RunButton
            onClick={runUpdate}
            disabled={disabledNoPayroll || !prepared || updateStep.phase === 'running'}
          >
            Run update
          </RunButton>
        }
      >
        {updateStep.phase === 'success' && updateStep.result && (
          <>
            <PreparedSummary prepared={updateStep.result} />
            <JsonBlock label="Raw payrollPrepared (update response)" value={updateStep.result} />
          </>
        )}
      </StepCard>

      <StepCard
        title="4. Calculate payroll"
        description="PUT .../calculate — triggers the RRoP computation. No body to parse; failures here are API-level."
        phase={calculateStep.phase}
        error={calculateStep.error}
        actions={
          <RunButton
            onClick={runCalculate}
            disabled={disabledNoPayroll || calculateStep.phase === 'running'}
          >
            Run calculate
          </RunButton>
        }
      >
        {calculateStep.phase === 'success' && <Field label="calculate" value="accepted" />}
      </StepCard>

      <StepCard
        title="5. Get payroll (#show)"
        description="GET .../payrolls/:id — the calculated view: verifies gross_pay, pay_adjustments, and computed breakdowns parse."
        phase={getPhase}
        error={getError}
        actions={
          <RunButton
            onClick={() => void getQuery.refetch()}
            disabled={disabledNoPayroll || getQuery.isFetching}
          >
            {getQuery.isFetched ? 'Re-run' : 'Run get'}
          </RunButton>
        }
      >
        {getPhase === 'success' && payrollShow && (
          <>
            <Field label="processed" value={String(payrollShow.processed ?? '—')} />
            <Field
              label="employeeCompensations (count)"
              value={payrollShow.employeeCompensations?.length ?? 0}
            />
            {payrollShow.employeeCompensations?.slice(0, 3).map((comp, i) => (
              <div key={i} className={styles.field}>
                <span className={styles.fieldLabel}>[{i}] gross / adjustments</span>
                <span className={styles.fieldValue}>
                  grossPay={comp.grossPay ?? '—'} · payAdjustments=
                  {comp.payAdjustments ? `[${comp.payAdjustments.length}]` : '—'}
                </span>
              </div>
            ))}
            <JsonBlock label="Raw payrollShow" value={payrollShow} />
          </>
        )}
      </StepCard>
    </section>
  )
}
