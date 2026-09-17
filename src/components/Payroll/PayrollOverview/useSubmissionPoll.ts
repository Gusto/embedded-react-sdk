import { useCallback, useRef } from 'react'
import type {
  PayrollsGetQueryData,
  PayrollsGetQueryError,
} from '@gusto/embedded-api/react-query/payrollsGet'
import type { QueryObserverResult } from '@tanstack/react-query'
import { PAYROLL_PROCESSING_STATUS } from '@/shared/constants'
import {
  usePollingTask,
  isNonRetryablePollError,
  type PollReadOutcome,
  type PollTickResult,
} from '@/hooks/usePollingTask/usePollingTask'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

const COMPONENT_NAME = 'Payroll.PayrollOverview'

/** @internal */
export type PayrollShow = NonNullable<PayrollsGetQueryData['payrollShow']>

type SubmissionOutcome =
  | { type: 'processed'; payroll: PayrollShow | undefined }
  | { type: 'failed'; payroll: PayrollShow | undefined }
  | { type: 'loaded' }

/**
 * Per-run state for the submission poll. `baseline` is only known when the run starts from a
 * click on Submit, where the pre-submit render already has data to snapshot. A run started
 * without one (e.g. to guard the initial read on mount) relies on `sawSubmitting` alone.
 *
 * @internal
 */
export interface SubmissionPollRun {
  baseline: { processed: boolean; status: string | undefined } | null
  sawSubmitting: boolean
}

const isSubmittingStatus = (status: string | undefined) =>
  status === PAYROLL_PROCESSING_STATUS.submitting

const isProcessedStatus = (processed: boolean | undefined, status: string | undefined) =>
  processed === true || status === PAYROLL_PROCESSING_STATUS.submit_success

// Verify against the last-known data before reporting failure: a success that already landed
// on the server must never be reported as a failure just because the deadline hit first.
const verifiedSubmissionOutcome = (lastData: PayrollsGetQueryData | null): SubmissionOutcome => {
  const payroll = lastData?.payrollShow
  if (isProcessedStatus(payroll?.processed, payroll?.processingRequest?.status)) {
    return { type: 'processed', payroll }
  }
  return { type: 'failed', payroll }
}

const evaluateSubmissionOutcome = (
  outcome: PollReadOutcome<PayrollsGetQueryData>,
  run: SubmissionPollRun | null,
): PollTickResult<SubmissionOutcome> => {
  if (!outcome.success) {
    return isNonRetryablePollError(outcome.error)
      ? { status: 'error', error: outcome.error }
      : { status: 'polling' }
  }

  const payroll = outcome.data.payrollShow
  const submissionStatus = payroll?.processingRequest?.status
  const isSubmitting = isSubmittingStatus(submissionStatus)

  if (isSubmitting && run) run.sawSubmitting = true

  if (submissionStatus === PAYROLL_PROCESSING_STATUS.processing_failed) {
    return { status: 'done', value: { type: 'failed', payroll } }
  }

  // Checked ahead of the `isSubmitting` re-poll below: `processed` can flip true while
  // `processingRequest.status` still reads `submitting` (a real API race), so a transition must
  // be detected on `processed` alone, not gated on status having already moved on.
  const isNewTransition =
    run?.sawSubmitting === true ||
    (run?.baseline != null &&
      (payroll?.processed !== run.baseline.processed || submissionStatus !== run.baseline.status))

  if (isNewTransition && isProcessedStatus(payroll?.processed, submissionStatus)) {
    return { status: 'done', value: { type: 'processed', payroll } }
  }

  if (isSubmitting) return { status: 'polling' }

  return { status: 'done', value: { type: 'loaded' } }
}

/** @internal */
export interface UseSubmissionPollOptions {
  /**
   * The render-driving payroll query's own `refetch`, reused so the poll's reads land on the
   * same query the component observes rather than racing a second, independently-built one.
   */
  refetch: () => Promise<QueryObserverResult<PayrollsGetQueryData, PayrollsGetQueryError>>
  onProcessed: (payroll: PayrollShow | undefined) => void
  onProcessingFailed: (payroll: PayrollShow | undefined) => void
  /**
   * Called when the poll gives up on a non-retryable read error, without ever confirming a
   * processed/failed outcome. The raw error is reported to observability by this hook already.
   */
  onError: () => void
}

/** @internal */
export interface SubmissionPoll {
  start: (run: SubmissionPollRun) => void
  isPolling: boolean
}

/**
 * Polls a payroll until its submission reaches a terminal state, via {@link usePollingTask}.
 *
 * @internal
 */
export function useSubmissionPoll({
  refetch,
  onProcessed,
  onProcessingFailed,
  onError,
}: UseSubmissionPollOptions): SubmissionPoll {
  const pollRunRef = useRef<SubmissionPollRun | null>(null)
  const { observability } = useObservability()

  const fetchPayroll = async (): Promise<PayrollsGetQueryData> => {
    const result = await refetch()
    if (result.status !== 'success') throw result.error ?? new Error('Payroll refetch failed')
    return result.data
  }

  const handleDone = (outcome: SubmissionOutcome) => {
    if (outcome.type === 'failed') {
      onProcessingFailed(outcome.payroll)
      return
    }
    if (outcome.type === 'processed') {
      onProcessed(outcome.payroll)
    }
  }

  const handleDeadline = (lastData: PayrollsGetQueryData | null) => {
    handleDone(verifiedSubmissionOutcome(lastData))
  }

  const { start: startPoll, isPolling } = usePollingTask<PayrollsGetQueryData, SubmissionOutcome>({
    fetch: fetchPayroll,
    evaluate: outcome => evaluateSubmissionOutcome(outcome, pollRunRef.current),
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
    (run: SubmissionPollRun) => {
      pollRunRef.current = run
      startPoll()
    },
    [startPoll],
  )

  return { start, isPolling }
}
