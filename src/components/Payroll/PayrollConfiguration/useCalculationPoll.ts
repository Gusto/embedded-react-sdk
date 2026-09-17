import { useCallback, useRef } from 'react'
import type {
  PayrollsGetQueryData,
  PayrollsGetQueryError,
} from '@gusto/embedded-api/react-query/payrollsGet'
import type { QueryObserverResult } from '@tanstack/react-query'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import {
  usePollingTask,
  isNonRetryablePollError,
  type PollReadOutcome,
  type PollTickResult,
} from '@/hooks/usePollingTask/usePollingTask'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

const COMPONENT_NAME = 'Payroll.PayrollConfiguration'

/** @internal */
export type PayrollShow = NonNullable<PayrollsGetQueryData['payrollShow']>

type CalculationOutcome =
  | { type: 'calculated'; payroll: PayrollShow | undefined }
  | { type: 'failed'; payroll: PayrollShow | undefined }

/**
 * Per-run state for the calculation poll. Written when a run starts and read only from inside
 * the poll loop — never during render, which is what made the previous `previousCalculatedAtRef`
 * completion gate depend on a render arriving.
 */
interface CalculationPollRun {
  /**
   * Fast calculations may transition directly to `CalculateSuccess` between ticks, without ever
   * seeing the `Calculating` status.
   * If we know the previous `calculatedAt` timestamp and it changes, we know our polling can resolve.
   */
  baselineCalculatedAt: number | null
  /**
   * The API contract guarantees no relationship between `processingRequest.status` and `calculatedAt` —
   * a deduped/coalesced calculate can legitimately return `CalculateSuccess` with the exact same
   * `calculatedAt` as the baseline captured when this run started.
   * If we have seen `Calculating` status during this run, and it changes to `CalculateSuccess`,
   * we know our polling can resolve even if the timestamp hasn't changed.
   */
  sawCalculatingThisPoll: boolean
}

/** @internal */
export const isCalculatingStatus = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating

const isCalculatedStatus = (
  processingRequest?: PayrollProcessingRequest | null,
  calculatedAt?: Date | null,
) =>
  calculatedAt != null &&
  (processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess ||
    processingRequest == null)

// A calculation that succeeded while we were waiting on the deadline must never be reported as a
// failure — a false failure re-arms prepare, which would then wipe the result. Advancing on a
// stale success is the safer of the two wrong answers: the next screen re-reads the payroll,
// whereas a false failure destroys real data.
const verifiedCalculationOutcome = (lastData: PayrollsGetQueryData | null): CalculationOutcome => {
  const payroll = lastData?.payrollShow
  if (isCalculatedStatus(payroll?.processingRequest, payroll?.calculatedAt)) {
    return { type: 'calculated', payroll }
  }
  return { type: 'failed', payroll }
}

const evaluateCalculationOutcome = (
  outcome: PollReadOutcome<PayrollsGetQueryData>,
  run: CalculationPollRun | null,
): PollTickResult<CalculationOutcome> => {
  if (!outcome.success) {
    return isNonRetryablePollError(outcome.error)
      ? { status: 'error', error: outcome.error }
      : { status: 'polling' }
  }

  const payroll = outcome.data.payrollShow

  if (isCalculatingStatus(payroll?.processingRequest)) {
    if (run) run.sawCalculatingThisPoll = true
    return { status: 'polling' }
  }

  if (payroll?.processingRequest?.status === PayrollProcessingRequestStatus.ProcessingFailed) {
    return { status: 'done', value: { type: 'failed', payroll } }
  }

  const calculatedAt = payroll?.calculatedAt
  const isNewCalculation =
    run?.sawCalculatingThisPoll === true || calculatedAt?.getTime() !== run?.baselineCalculatedAt

  if (isNewCalculation && isCalculatedStatus(payroll?.processingRequest, calculatedAt)) {
    return { status: 'done', value: { type: 'calculated', payroll } }
  }

  return { status: 'polling' }
}

/** @internal */
export interface UseCalculationPollOptions {
  /**
   * The render-driving payroll query's own `refetch`, reused so the poll's reads land on the
   * same query the component observes rather than racing a second, independently-built one.
   */
  refetch: () => Promise<QueryObserverResult<PayrollsGetQueryData, PayrollsGetQueryError>>
  onCalculated: (payroll: PayrollShow | undefined) => void
  onProcessingFailed: (payroll: PayrollShow | undefined) => void
  /**
   * Called when the poll gives up on a non-retryable read error, without ever confirming a
   * calculated/failed outcome. The raw error is reported to observability by this hook already.
   */
  onError: () => void
}

/** @internal */
export interface CalculationPoll {
  start: (props: CalculationPollRun) => void
  isPolling: boolean
}

/**
 * Polls a payroll until its calculation reaches a terminal state, via {@link usePollingTask}.
 *
 * @internal
 */
export function useCalculationPoll({
  refetch,
  onCalculated,
  onProcessingFailed,
  onError,
}: UseCalculationPollOptions): CalculationPoll {
  const pollRunRef = useRef<CalculationPollRun | null>(null)
  const { observability } = useObservability()

  const fetchPayroll = async (): Promise<PayrollsGetQueryData> => {
    const result = await refetch()
    if (result.status !== 'success') throw result.error ?? new Error('Payroll refetch failed')
    return result.data
  }

  const handleDone = (outcome: CalculationOutcome) => {
    if (outcome.type === 'failed') {
      onProcessingFailed(outcome.payroll)
      return
    }
    onCalculated(outcome.payroll)
  }

  const handleDeadline = (lastData: PayrollsGetQueryData | null) => {
    handleDone(verifiedCalculationOutcome(lastData))
  }

  const { start: startPoll, isPolling } = usePollingTask<PayrollsGetQueryData, CalculationOutcome>({
    fetch: fetchPayroll,
    evaluate: outcome => evaluateCalculationOutcome(outcome, pollRunRef.current),
    onDone: handleDone,
    onError: error => {
      const sdkError = normalizeToSDKError(error)
      observability?.onError?.({
        ...sdkError,
        timestamp: Date.now(),
        componentName: COMPONENT_NAME,
      })
      onError()
    },
    onDeadline: handleDeadline,
  })

  const start = useCallback(
    (run: CalculationPollRun) => {
      pollRunRef.current = run
      startPoll()
    },
    [startPoll],
  )

  return { start, isPolling }
}
