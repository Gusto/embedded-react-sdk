import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payroll'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayrollCategory } from '../payrollTypes'
import { derivePayrollCategory } from '../payrollTypes'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { usePagination } from '@/hooks/usePagination/usePagination'

interface UsePayrollConfigurationDataParams {
  companyId: string
  payrollId: string
  isCalculating?: boolean
}

interface UsePayrollConfigurationDataReturn {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod: PayrollPayPeriodType | undefined
  paySchedule: PayScheduleObject | undefined
  payrollCategory: PayrollCategory
  pagination: PaginationControlProps
  isLoading: boolean
  refetch: () => Promise<void>
}

export const PREPARE_QUERY_KEY = 'payroll-prepare'
const FIVE_MINUTES = 5 * 60 * 1000

export function usePayrollConfigurationData({
  companyId,
  payrollId,
  isCalculating = false,
}: UsePayrollConfigurationDataParams): UsePayrollConfigurationDataReturn {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()

  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })
  const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([])
  const [isDataInSync, setIsDataInSync] = useState(false)

  const { data: employeeData, isFetching: isFetchingEmployeeData } = useEmployeesList(
    {
      companyId,
      payrollUuid: payrollId,
      per: itemsPerPage,
      page: currentPage,
      sortBy: 'name',
    },
    { placeholderData: keepPreviousData },
  )

  const employeeDataRef = useRef(employeeData)
  employeeDataRef.current = employeeData

  const employeeUuids = useMemo(() => {
    return employeeData?.showEmployees?.map(e => e.uuid) || []
  }, [employeeData?.showEmployees])

  const employeeUuidsKey = useMemo(() => employeeUuids.join(','), [employeeUuids])

  const {
    data: prepareData,
    isLoading: isPrepareLoading,
    isFetching: isPrepareFetching,
  } = useQuery({
    queryKey: [PREPARE_QUERY_KEY, payrollId, employeeUuidsKey],
    queryFn: async ({ signal }) => {
      const result = await payrollsPrepare(
        gustoClient,
        {
          companyId,
          payrollId,
          sortBy: 'last_name',
          requestBody: {
            employeeUuids,
          },
        },
        { signal },
      )

      if (!result.ok) {
        throw result.error
      }

      return result.value.payrollPrepared
    },
    enabled: employeeUuids.length > 0 && !isCalculating,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    return () => {
      void queryClient.cancelQueries({
        queryKey: [PREPARE_QUERY_KEY, payrollId],
      })
    }
  }, [queryClient, payrollId])

  useEffect(() => {
    if (isCalculating) {
      void queryClient.cancelQueries({
        queryKey: [PREPARE_QUERY_KEY, payrollId],
      })
    }
  }, [isCalculating, queryClient, payrollId])

  const syncData = useCallback(() => {
    const currentEmployeeData = employeeDataRef.current
    if (!currentEmployeeData?.showEmployees || !prepareData?.employeeCompensations) {
      setIsDataInSync(false)
      return
    }

    const currentUuids = currentEmployeeData.showEmployees.map(e => e.uuid)
    const preparedUuids = new Set(prepareData.employeeCompensations.map(c => c.employeeUuid))
    const inSync = currentUuids.length > 0 && currentUuids.every(uuid => preparedUuids.has(uuid))

    if (inSync) {
      setDisplayedEmployees(currentEmployeeData.showEmployees)
      setIsDataInSync(true)
    } else {
      setIsDataInSync(false)
    }
  }, [prepareData?.employeeCompensations])

  useEffect(() => {
    syncData()
  }, [syncData])

  const { data: payScheduleData, isLoading: isPayScheduleLoading } = usePaySchedulesGet(
    {
      companyId,
      payScheduleId: prepareData?.payPeriod?.payScheduleUuid || '',
    },
    {
      enabled: !!prepareData?.payPeriod?.payScheduleUuid,
    },
  )

  const handleRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [PREPARE_QUERY_KEY, payrollId],
    })
  }, [queryClient, payrollId])

  const prepareHasNoData = !prepareData?.employeeCompensations?.length
  const isInitialLoading = isPrepareLoading || (isPrepareFetching && prepareHasNoData)
  const isPaginating = isPrepareFetching && !isPrepareLoading && !prepareHasNoData
  const isPaginationFetching = isFetchingEmployeeData || isPaginating || !isDataInSync
  const isLoading =
    isInitialLoading || isPayScheduleLoading || (!employeeData && isFetchingEmployeeData)

  const headers = employeeData?.httpMeta.response.headers ?? new Headers()
  const pagination: PaginationControlProps = getPaginationProps(headers, isPaginationFetching)

  return {
    employeeCompensations: prepareData?.employeeCompensations || [],
    employeeDetails: displayedEmployees,
    payPeriod: prepareData?.payPeriod,
    paySchedule: payScheduleData?.payScheduleObject,
    payrollCategory: derivePayrollCategory(prepareData ?? {}),
    pagination,
    isLoading,
    refetch: handleRefetch,
  }
}
