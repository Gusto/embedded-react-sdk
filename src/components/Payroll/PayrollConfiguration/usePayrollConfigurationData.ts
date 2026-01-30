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
import type {
  PaginationControlProps,
  PaginationItemsPerPage,
} from '@/components/Common/PaginationControl/PaginationControlTypes'

interface UsePayrollConfigurationDataParams {
  companyId: string
  payrollId: string
}

interface UsePayrollConfigurationDataReturn {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod: PayrollPayPeriodType | undefined
  paySchedule: PayScheduleObject | undefined
  isOffCycle: boolean
  pagination: PaginationControlProps
  isLoading: boolean
  refetch: () => Promise<void>
}

const PREPARE_QUERY_KEY = 'payroll-prepare'
const FIVE_MINUTES = 5 * 60 * 1000

export function usePayrollConfigurationData({
  companyId,
  payrollId,
}: UsePayrollConfigurationDataParams): UsePayrollConfigurationDataReturn {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()
  const defaultItemsPerPage = 10

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<PaginationItemsPerPage>(defaultItemsPerPage)
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

  const employeeUuids = useMemo(() => {
    return employeeData?.showEmployees?.map(e => e.uuid) || []
  }, [employeeData?.showEmployees])

  const totalPages = Number(employeeData?.httpMeta.response.headers.get('x-total-pages') ?? 1)
  const totalCount = Number(employeeData?.httpMeta.response.headers.get('x-total-count') ?? 0)

  const employeeUuidsKey = useMemo(() => employeeUuids.join(','), [employeeUuids])

  const {
    data: prepareData,
    isLoading: isPrepareLoading,
    isFetching: isPrepareFetching,
  } = useQuery({
    queryKey: [PREPARE_QUERY_KEY, payrollId, employeeUuidsKey],
    queryFn: async () => {
      const result = await payrollsPrepare(gustoClient, {
        companyId,
        payrollId,
        sortBy: 'last_name',
        requestBody: {
          employeeUuids,
        },
      })

      if (!result.ok) {
        throw result.error
      }

      return result.value.payrollPrepared
    },
    enabled: employeeUuids.length > 0,
    staleTime: FIVE_MINUTES,
    placeholderData: keepPreviousData,
  })

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
      hasInitialDataRef.current = true
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

  const handleItemsPerPageChange = (newCount: PaginationItemsPerPage) => {
    setItemsPerPage(newCount)
  }

  const handleFirstPage = () => {
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }

  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }

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

  const pagination: PaginationControlProps = {
    currentPage,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    handleItemsPerPageChange,
    totalPages,
    totalCount,
    isFetching: isPaginationFetching,
    itemsPerPage,
  }

  return {
    employeeCompensations: prepareData?.employeeCompensations || [],
    employeeDetails: displayedEmployees,
    payPeriod: prepareData?.payPeriod,
    paySchedule: payScheduleData?.payScheduleObject,
    isOffCycle: prepareData?.offCycle ?? false,
    pagination,
    isLoading,
    refetch: handleRefetch,
  }
}
