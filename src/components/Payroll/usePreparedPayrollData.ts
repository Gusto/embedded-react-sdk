import { useState, useEffect, useCallback } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollprepared'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
}

interface UsePreparedPayrollDataReturn {
  handlePreparePayroll: () => Promise<void>
  preparedPayroll: PayrollPrepared | undefined
  paySchedule: PayScheduleObject | undefined
  isLoading: boolean
}

export const usePreparedPayrollData = ({
  companyId,
  payrollId,
}: UsePreparedPayrollDataParams): UsePreparedPayrollDataReturn => {
  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()

  const { data: payScheduleData, isLoading: isPayScheduleLoading } = usePaySchedulesGet(
    {
      companyId,
      payScheduleId: preparedPayroll?.payPeriod?.payScheduleUuid || '',
    },
    {
      enabled: Boolean(preparedPayroll?.payPeriod?.payScheduleUuid),
    },
  )

  const handlePreparePayroll = useCallback(async () => {
    const result = await preparePayroll({
      request: {
        companyId,
        payrollId,
      },
    })
    setPreparedPayroll(result.payrollPrepared)
  }, [companyId, payrollId, preparePayroll])

  useEffect(() => {
    void handlePreparePayroll()
  }, [handlePreparePayroll])

  const isLoading = isPreparePayrollPending || isPayScheduleLoading

  return {
    handlePreparePayroll,
    preparedPayroll,
    paySchedule: payScheduleData?.payScheduleObject,
    isLoading,
  }
}
