import { useCallback, useRef } from 'react'
import {
  buildPayrollsGetQuery,
  type PayrollsGetQueryData,
} from '@gusto/embedded-api/react-query/payrollsGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import { PAYROLL_PROCESSING_STATUS } from '@/shared/constants'
import { usePollingTask, type PollTickResult } from '@/hooks/usePollingTask/usePollingTask'

const POLL_INTERVAL_MS = 5_000
const POLL_DEADLINE_MS = 3 * 60 * 1000

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

const evaluateSubmissionOutcome = (
  queryData: PayrollsGetQueryData,
  run: SubmissionPollRun | null,
): PollTickResult<SubmissionOutcome> => {
  const payroll = queryData.payrollShow
  const submissionStatus = payroll?.processingRequest?.status
  const isSubmitting = isSubmittingStatus(submissionStatus)

  if (isSubmitting && run) run.sawSubmitting = true

  if (submissionStatus === PAYROLL_PROCESSING_STATUS.processing_failed) {
    return { done: true, value: { type: 'failed', payroll } }
  }

  // Checked ahead of the `isSubmitting` re-poll below: `processed` can flip true while
  // `processingRequest.status` still reads `submitting` (a real API race), so a transition must
  // be detected on `processed` alone, not gated on status having already moved on.
  const isNewTransition =
    run?.sawSubmitting === true ||
    (run?.baseline != null &&
      (payroll?.processed !== run.baseline.processed || submissionStatus !== run.baseline.status))

  if (isNewTransition && isProcessedStatus(payroll?.processed, submissionStatus)) {
    return { done: true, value: { type: 'processed', payroll } }
  }

  if (isSubmitting) return { done: false }

  return { done: true, value: { type: 'loaded' } }
}

/** @internal */
export interface UseSubmissionPollOptions {
  payrollRequest: GetV1CompaniesCompanyIdPayrollsPayrollIdRequest
  onProcessed: (payroll: PayrollShow | undefined) => void
  onProcessingFailed: (payroll: PayrollShow | undefined) => void
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
  payrollRequest,
  onProcessed,
  onProcessingFailed,
}: UseSubmissionPollOptions): SubmissionPoll {
  const gustoEmbedded = useGustoEmbeddedContext()
  const queryClient = useQueryClient()
  const pollRunRef = useRef<SubmissionPollRun | null>(null)

  const fetchPayroll = (signal: AbortSignal) =>
    queryClient.fetchQuery({
      ...buildPayrollsGetQuery(gustoEmbedded, payrollRequest, { signal }),
      staleTime: 0,
    })

  const handleDone = (outcome: SubmissionOutcome) => {
    if (outcome.type === 'failed') {
      onProcessingFailed(outcome.payroll)
      return
    }
    if (outcome.type === 'processed') {
      onProcessed(outcome.payroll)
    }
  }

  // Verify against the server before reporting failure, same rationale as
  // PayrollConfiguration's calculation poll: a success that arrived while we were waiting must
  // never be reported as a failure.
  const handleDeadline = (lastData: PayrollsGetQueryData | null) => {
    const payroll = lastData?.payrollShow
    if (isProcessedStatus(payroll?.processed, payroll?.processingRequest?.status)) {
      onProcessed(payroll)
      return
    }
    onProcessingFailed(payroll)
  }

  const { start: startPoll, isPolling } = usePollingTask<PayrollsGetQueryData, SubmissionOutcome>({
    fetch: fetchPayroll,
    evaluate: queryData => evaluateSubmissionOutcome(queryData, pollRunRef.current),
    onDone: handleDone,
    onDeadline: handleDeadline,
    intervalMs: POLL_INTERVAL_MS,
    deadlineMs: POLL_DEADLINE_MS,
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
