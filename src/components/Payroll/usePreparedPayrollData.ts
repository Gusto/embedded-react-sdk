import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollshow'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { useBase } from '../Base'
import { retryAsync } from '@/helpers/retryAsync'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
  employeeUuids?: string[]
  sortBy?: string
  onDataReady?: (preparedPayroll: PayrollPrepared) => void
}

interface UsePreparedPayrollDataReturn {
  handlePreparePayroll: () => Promise<void>
  preparedPayroll: PayrollPrepared | undefined
  paySchedule: PayScheduleShow | undefined
  isLoading: boolean
  isPaginating: boolean
  hasInitialData: boolean
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
 * Fires the prepare call once on mount, then exposes `handlePreparePayroll` for callers that need to re-prepare
 * (e.g. after sort or pagination changes). Distinguishes initial loading from subsequent pagination via
 * `isLoading` and `isPaginating`, and surfaces the pay schedule for the prepared payroll's pay period.
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
}: UsePreparedPayrollDataParams): UsePreparedPayrollDataReturn => {
  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()
  const hasInitialDataRef = useRef(false)
  const hasFiredRef = useRef(false)
  const { baseSubmitHandler } = useBase()

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
          employeeUuids,
        },
      },
    })
    setPreparedPayroll(result.payrollPrepared)
    if (result.payrollPrepared) {
      hasInitialDataRef.current = true
      onDataReady?.(result.payrollPrepared)
    }
  }, [companyId, payrollId, preparePayroll, employeeUuidsKey, sortBy, onDataReady])

  const handlePreparePayroll = useCallback(async () => {
    await baseSubmitHandler(null, () =>
      retryAsync(executePrepare, {
        maxAttempts: PREPARE_MAX_ATTEMPTS,
        delayMs: PREPARE_RETRY_DELAY_MS,
        shouldRetry: isPayrollBeingProcessedError,
      }),
    )
  }, [baseSubmitHandler, executePrepare])

  useEffect(() => {
    if (hasFiredRef.current) return
    hasFiredRef.current = true
    void handlePreparePayroll()
  }, [handlePreparePayroll])

  const isInitialLoading = isPreparePayrollPending && !hasInitialDataRef.current
  const isPaginating = isPreparePayrollPending && hasInitialDataRef.current
  const isLoading = isInitialLoading || isPayScheduleLoading

  return {
    handlePreparePayroll,
    preparedPayroll,
    paySchedule: payScheduleData?.payScheduleShow,
    isLoading,
    isPaginating,
    hasInitialData: hasInitialDataRef.current,
  }
}
