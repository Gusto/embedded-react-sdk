import { useCallback, useRef } from 'react'
import {
  buildPayrollsGetQuery,
  type PayrollsGetQueryData,
} from '@gusto/embedded-api/react-query/payrollsGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { usePollingTask, type PollTickResult } from '@/hooks/usePollingTask/usePollingTask'

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
  baselineCalculatedAt: number | null
  sawCalculating: boolean
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

const evaluateCalculationOutcome = (
  data: PayrollsGetQueryData,
  run: CalculationPollRun | null,
): PollTickResult<CalculationOutcome> => {
  const payroll = data.payrollShow

  if (isCalculatingStatus(payroll?.processingRequest)) {
    if (run) run.sawCalculating = true
    return { done: false }
  }

  if (payroll?.processingRequest?.status === PayrollProcessingRequestStatus.ProcessingFailed) {
    return { done: true, value: { type: 'failed', payroll } }
  }

  const calculatedAt = payroll?.calculatedAt
  const isNewCalculation =
    run?.sawCalculating === true || calculatedAt?.getTime() !== run?.baselineCalculatedAt

  if (isNewCalculation && isCalculatedStatus(payroll?.processingRequest, calculatedAt)) {
    return { done: true, value: { type: 'calculated', payroll } }
  }

  return { done: false }
}

/** @internal */
export interface UseCalculationPollOptions {
  payrollRequest: GetV1CompaniesCompanyIdPayrollsPayrollIdRequest
  onCalculated: (payroll: PayrollShow | undefined) => void
  onProcessingFailed: (payroll: PayrollShow | undefined) => void
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
  payrollRequest,
  onCalculated,
  onProcessingFailed,
}: UseCalculationPollOptions): CalculationPoll {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()
  const pollRunRef = useRef<CalculationPollRun | null>(null)

  const fetchPayroll = (signal: AbortSignal) =>
    queryClient.fetchQuery({
      ...buildPayrollsGetQuery(gustoClient, payrollRequest, { signal }),
      staleTime: 0,
    })

  const handleDone = (outcome: CalculationOutcome) => {
    if (outcome.type === 'failed') {
      onProcessingFailed(outcome.payroll)
      return
    }
    onCalculated(outcome.payroll)
  }

  // The server is the source of truth. A calculation that succeeded while we were waiting must
  // never be reported as a failure — that reported false failures for payrolls that had
  // calculated fine, and re-armed the prepare that would then wipe the result (SDK-1291).
  // Advancing on a stale success is the safer of the two wrong answers: the next screen re-reads
  // the payroll, whereas a false failure destroys real data.
  const handleDeadline = (lastData: PayrollsGetQueryData | null) => {
    const payroll = lastData?.payrollShow
    if (isCalculatedStatus(payroll?.processingRequest, payroll?.calculatedAt)) {
      onCalculated(payroll)
      return
    }
    onProcessingFailed(payroll)
  }

  const { start: startPoll, isPolling } = usePollingTask<PayrollsGetQueryData, CalculationOutcome>({
    fetch: fetchPayroll,
    evaluate: data => evaluateCalculationOutcome(data, pollRunRef.current),
    onDone: handleDone,
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
