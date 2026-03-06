import { useCallback, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payroll'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { QueryParamSortBy } from '@gusto/embedded-api/models/operations/putv1companiescompanyidpayrollspayrollidprepare'

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

const PREPARE_EMPLOYEE_QUERY_KEY = 'payroll-prepare-employee'
const FIVE_MINUTES = 5 * 60 * 1000

export const usePreparedPayrollData = ({
  companyId,
  payrollId,
  employeeUuids,
  sortBy,
  onDataReady,
}: UsePreparedPayrollDataParams): UsePreparedPayrollDataReturn => {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()
  const hasInitialDataRef = useRef(false)
  const onDataReadyRef = useRef(onDataReady)
  onDataReadyRef.current = onDataReady

  const employeeUuidsKey = useMemo(() => employeeUuids?.join(',') ?? '', [employeeUuids])

  const {
    data: preparedPayroll,
    isLoading: isPrepareLoading,
    isFetching: isPrepareFetching,
  } = useQuery({
    queryKey: [PREPARE_EMPLOYEE_QUERY_KEY, payrollId, employeeUuidsKey, sortBy],
    queryFn: async () => {
      const result = await payrollsPrepare(gustoClient, {
        companyId,
        payrollId,
        sortBy,
        requestBody: {
          employeeUuids,
        },
      })

      if (!result.ok) {
        throw result.error
      }

      const prepared = result.value.payrollPrepared
      if (prepared) {
        hasInitialDataRef.current = true
        onDataReadyRef.current?.(prepared)
      }

      return prepared
    },
    staleTime: FIVE_MINUTES,
  })

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
    await queryClient.invalidateQueries({
      queryKey: [PREPARE_EMPLOYEE_QUERY_KEY, payrollId],
    })
  }, [queryClient, payrollId])

  const isInitialLoading = isPrepareLoading && !hasInitialDataRef.current
  const isPaginating = isPrepareFetching && hasInitialDataRef.current
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
