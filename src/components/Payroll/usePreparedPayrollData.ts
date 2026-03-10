import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { QueryParamSortBy } from '@gusto/embedded-api/models/operations/putv1companiescompanyidpayrollspayrollidprepare'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { useBase } from '../Base'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
  employeeUuids?: string[]
  sortBy?: QueryParamSortBy
  onDataReady?: (preparedPayroll: PayrollPrepared) => void
}

interface UsePreparedPayrollDataReturn {
  handlePreparePayroll: () => Promise<void>
  preparedPayroll: PayrollPrepared | undefined
  paySchedule: PayScheduleObject | undefined
  isLoading: boolean
  isPaginating: boolean
  hasInitialData: boolean
}

const PREPARE_MAX_ATTEMPTS = 4
const PREPARE_RETRY_DELAY_MS = 1500

const isPayrollBeingProcessedError = (error: unknown): boolean => {
  if (!(error instanceof UnprocessableEntityErrorObject)) return false
  return Array.isArray(error.errors) && error.errors.some(e => e.category === 'invalid_operation')
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
    await baseSubmitHandler(null, async () => {
      for (let attempt = 0; attempt < PREPARE_MAX_ATTEMPTS; attempt++) {
        try {
          await executePrepare()
          return
        } catch (error) {
          const isLastAttempt = attempt === PREPARE_MAX_ATTEMPTS - 1
          if (isPayrollBeingProcessedError(error) && !isLastAttempt) {
            await delay(PREPARE_RETRY_DELAY_MS)
            continue
          }
          throw error
        }
      }
    })
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
    paySchedule: payScheduleData?.payScheduleObject,
    isLoading,
    isPaginating,
    hasInitialData: hasInitialDataRef.current,
  }
}
