import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import { employeesGet } from '@gusto/embedded-api/funcs/employeesGet'
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payroll'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PaySchedule } from '@gusto/embedded-api/models/components/payschedule'
import type { PayrollCategory } from '../payrollTypes'
import { derivePayrollCategory } from '../payrollTypes'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { usePagination } from '@/hooks/usePagination/usePagination'

interface UsePayrollConfigurationDataParams {
  companyId: string
  payrollId: string
  isCalculating?: boolean
  excludedEmployeeUuids?: string[]
}

interface UsePayrollConfigurationDataReturn {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod: PayrollPayPeriodType | undefined
  paySchedule: PaySchedule | undefined
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
  excludedEmployeeUuids = [],
}: UsePayrollConfigurationDataParams): UsePayrollConfigurationDataReturn {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()

  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })
  const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([])
  const [isDataInSync, setIsDataInSync] = useState(false)
  const hasInitialDataRef = useRef(false)

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

  const listedEmployeeUuids = useMemo(() => {
    return employeeData?.showEmployees?.map(e => e.uuid) || []
  }, [employeeData?.showEmployees])

  const missingExcludedUuids = useMemo(() => {
    const listedSet = new Set(listedEmployeeUuids)
    return excludedEmployeeUuids.filter(uuid => !listedSet.has(uuid))
  }, [excludedEmployeeUuids, listedEmployeeUuids])

  const employeeUuids = useMemo(() => {
    if (currentPage === 1) {
      return [...listedEmployeeUuids, ...missingExcludedUuids]
    }
    return listedEmployeeUuids
  }, [listedEmployeeUuids, missingExcludedUuids, currentPage])

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

  const excludedUuidsKey = useMemo(() => missingExcludedUuids.join(','), [missingExcludedUuids])

  const { data: excludedEmployeeDetails } = useQuery({
    queryKey: ['excluded-employee-details', excludedUuidsKey],
    queryFn: async () => {
      const results = await Promise.all(
        missingExcludedUuids.map(uuid => employeesGet(gustoClient, { employeeId: uuid })),
      )
      const failedResult = results.find(result => !result.ok)
      if (failedResult) {
        throw failedResult.error
      }

      return results
        .filter(result => result.ok)
        .map(result => result.value.employee)
        .filter((e): e is Employee => e != null)
    },
    enabled: missingExcludedUuids.length > 0 && !isCalculating,
    staleTime: FIVE_MINUTES,
  })

  const syncData = useCallback(() => {
    const currentEmployeeData = employeeDataRef.current
    if (!currentEmployeeData?.showEmployees || !prepareData?.employeeCompensations) {
      setIsDataInSync(false)
      return
    }

    const currentUuids = currentEmployeeData.showEmployees.map(e => e.uuid)
    const preparedUuids = new Set(prepareData.employeeCompensations.map(c => c.employeeUuid))
    const allListedInSync =
      currentUuids.length > 0 && currentUuids.every(uuid => preparedUuids.has(uuid))

    if (allListedInSync) {
      const mergedEmployees = [...currentEmployeeData.showEmployees]
      if (currentPage === 1 && excludedEmployeeDetails?.length) {
        const listedSet = new Set(currentUuids)
        for (const employee of excludedEmployeeDetails) {
          if (!listedSet.has(employee.uuid)) {
            mergedEmployees.push(employee)
          }
        }
      }
      setDisplayedEmployees(mergedEmployees)
      setIsDataInSync(true)
      hasInitialDataRef.current = true
    } else {
      setIsDataInSync(false)
    }
  }, [prepareData?.employeeCompensations, excludedEmployeeDetails, currentPage])

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

  const isInitialLoading = isPrepareLoading && !hasInitialDataRef.current
  const isPaginating = isPrepareFetching && hasInitialDataRef.current
  const isPaginationFetching = isFetchingEmployeeData || isPaginating || !isDataInSync
  const isLoading =
    isInitialLoading || isPayScheduleLoading || (!employeeData && isFetchingEmployeeData)

  const headers = employeeData?.httpMeta.response.headers ?? new Headers()
  const pagination: PaginationControlProps = getPaginationProps(headers, isPaginationFetching)

  return {
    employeeCompensations: prepareData?.employeeCompensations || [],
    employeeDetails: displayedEmployees,
    payPeriod: prepareData?.payPeriod,
    paySchedule: payScheduleData?.paySchedule,
    payrollCategory: derivePayrollCategory(prepareData ?? {}),
    pagination,
    isLoading,
    refetch: handleRefetch,
  }
}
