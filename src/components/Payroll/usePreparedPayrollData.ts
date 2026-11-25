import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/unprocessedpayroll'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { useBase } from '../Base'
import { isPayrollSubmitted } from './helpers'
import { retryAsync } from '@/helpers/retryAsync'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
  employeeUuids?: string[]
  sortBy?: string
  onDataReady?: (preparedPayroll: PayrollPrepared) => void
  /**
   * When true, prepare is called without a roster. A transition payroll's roster is fixed by the
   * pay-schedule transition, so the API rejects any `employeeUuids` sent to prepare.
   */
  isTransitionPayroll?: boolean
}

interface UsePreparedPayrollDataReturn {
  handlePreparePayroll: () => Promise<void>
  preparedPayroll: PayrollPrepared | undefined
  paySchedule: PayScheduleShow | undefined
  isLoading: boolean
  isPaginating: boolean
  hasInitialData: boolean
  /** `true` once the payroll is found to be already submitted, in which case prepare is skipped. */
  isPayrollAlreadySubmitted: boolean
}

const PREPARE_MAX_ATTEMPTS = 4
const PREPARE_RETRY_DELAY_MS = 1500

const isPayrollBeingProcessedError = (error: unknown): boolean => {
  if (!(error instanceof UnprocessableEntityError)) return false
  return error.errors.some(e => e.category === 'invalid_operation')
}

/**
 * Wraps the prepare-payroll mutation and pay-schedule fetch, retrying while the payroll is still being processed.
 *
 * @remarks
 * Fires the prepare call once on mount, after a fresh read of the payroll, then exposes `handlePreparePayroll`
 * for callers that need to re-prepare (e.g. after sort or pagination changes). A submitted payroll is never
 * prepared: prepare always fails for one, so the hook sets `isPayrollAlreadySubmitted` instead.
 * Distinguishes initial loading from subsequent pagination via `isLoading` and `isPaginating`, and surfaces
 * the pay schedule for the prepared payroll's pay period.
 *
 * @param params - The company and payroll identifiers, plus optional employee filter, sort, and ready callback.
 * @returns The prepared payroll, its pay schedule, loading flags, and a `handlePreparePayroll` callback to re-run.
 * @internal
 */
export const usePreparedPayrollData = ({
  companyId,
  payrollId,
  employeeUuids,
  sortBy,
  onDataReady,
  isTransitionPayroll = false,
}: UsePreparedPayrollDataParams): UsePreparedPayrollDataReturn => {
  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()
  const hasInitialDataRef = useRef(false)
  const hasFiredRef = useRef(false)
  const [isPayrollAlreadySubmitted, setIsPayrollAlreadySubmitted] = useState(false)
  const { baseSubmitHandler } = useBase()
  const { data: payrollData, isFetching: isFetchingPayroll } = usePayrollsGetSuspense({
    companyId,
    payrollId,
  })
  const payrollShow = payrollData.payrollShow

  const employeeUuidsKey = useMemo(() => employeeUuids?.join(',') ?? '', [employeeUuids])

  const { data: payScheduleData, isLoading: isPayScheduleLoading } = usePaySchedulesGet(
    {
      companyId,
      payScheduleId: preparedPayroll?.payPeriod?.payScheduleUuid || '',
    },
    {
      enabled: !!preparedPayroll?.payPeriod?.payScheduleUuid,
    },
  )

  const executePrepare = useCallback(async () => {
    const result = await preparePayroll({
      request: {
        companyId,
        payrollId,
        sortBy,
        requestBody: {
          employeeUuids: isTransitionPayroll ? undefined : employeeUuids,
        },
      },
    })
    setPreparedPayroll(result.payrollPrepared)
    if (result.payrollPrepared) {
      hasInitialDataRef.current = true
      onDataReady?.(result.payrollPrepared)
    }
  }, [
    companyId,
    payrollId,
    preparePayroll,
    employeeUuidsKey,
    sortBy,
    onDataReady,
    isTransitionPayroll,
  ])

  const handlePreparePayroll = useCallback(async () => {
    if (isPayrollSubmitted(payrollShow)) {
      setIsPayrollAlreadySubmitted(true)
      return
    }
    await baseSubmitHandler(null, () =>
      retryAsync(executePrepare, {
        maxAttempts: PREPARE_MAX_ATTEMPTS,
        delayMs: PREPARE_RETRY_DELAY_MS,
        shouldRetry: isPayrollBeingProcessedError,
      }),
    )
  }, [baseSubmitHandler, executePrepare, payrollShow])

  useEffect(() => {
    if (hasFiredRef.current || isFetchingPayroll) return
    hasFiredRef.current = true
    void handlePreparePayroll()
  }, [handlePreparePayroll, isFetchingPayroll])

  const isAwaitingPayrollStatus = isFetchingPayroll && !hasFiredRef.current
  const isInitialLoading = isPreparePayrollPending && !hasInitialDataRef.current
  const isPaginating = isPreparePayrollPending && hasInitialDataRef.current
  const isLoading = isAwaitingPayrollStatus || isInitialLoading || isPayScheduleLoading

  return {
    handlePreparePayroll,
    preparedPayroll,
    paySchedule: payScheduleData?.payScheduleShow,
    isLoading,
    isPaginating,
    hasInitialData: hasInitialDataRef.current,
    isPayrollAlreadySubmitted,
  }
}
