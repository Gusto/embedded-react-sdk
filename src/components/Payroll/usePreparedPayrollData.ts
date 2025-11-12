import { useState, useEffect, useCallback } from 'react'
import { usePayrollsPrepareMutation } from '@gusto/embedded-api/react-query/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollprepared'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayrollPrepareSortBy } from '@gusto/embedded-api/models/components/payrollpreparesortby'
import { useBase } from '../Base'

interface UsePreparedPayrollDataParams {
  companyId: string
  payrollId: string
  employeeUuids?: string[]
  sortBy?: PayrollPrepareSortBy
  page?: number
  per?: number
}

interface UsePreparedPayrollDataReturn {
  handlePreparePayroll: () => Promise<void>
  preparedPayroll: PayrollPrepared | undefined
  paySchedule: PayScheduleObject | undefined
  isLoading: boolean
  httpMeta?: { response: Response }
}

export const usePreparedPayrollData = ({
  companyId,
  payrollId,
  employeeUuids,
  sortBy,
  page,
  per,
}: UsePreparedPayrollDataParams): UsePreparedPayrollDataReturn => {
  const { mutateAsync: preparePayroll, isPending: isPreparePayrollPending } =
    usePayrollsPrepareMutation()
  const [preparedPayroll, setPreparedPayroll] = useState<PayrollPrepared | undefined>()
  const [httpMeta, setHttpMeta] = useState<{ response: Response } | undefined>()
  const { baseSubmitHandler } = useBase()

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
          page,
          per,
          requestBody: {
            employeeUuids,
          },
        },
      })
      setPreparedPayroll(result.payrollPrepared)
      setHttpMeta(result.httpMeta)
    })
  }, [companyId, payrollId, preparePayroll, employeeUuids, sortBy, page, per, baseSubmitHandler])

  useEffect(() => {
    void handlePreparePayroll()
  }, [handlePreparePayroll])

  const isLoading = isPreparePayrollPending || isPayScheduleLoading

  return {
    handlePreparePayroll,
    preparedPayroll,
    paySchedule: payScheduleData?.payScheduleObject,
    isLoading,
    httpMeta,
  }
}
