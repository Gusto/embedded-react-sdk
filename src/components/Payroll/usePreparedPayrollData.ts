import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayrollPrepareSortBy } from '@gusto/embedded-api/models/components/payrollpreparesortby'
import { useBase } from '../Base'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
  employeeUuids?: string[]
  sortBy?: PayrollPrepareSortBy
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

  const handlePreparePayroll = useCallback(async () => {
    await baseSubmitHandler(null, async () => {
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
    })
  }, [
    companyId,
    payrollId,
    preparePayroll,
    employeeUuidsKey,
    baseSubmitHandler,
    sortBy,
    onDataReady,
  ])

  useEffect(() => {
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
