import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePaySchedulesGet } from '@gusto/embedded-api/react-query/paySchedulesGet'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { payrollsPrepare } from '@gusto/embedded-api/funcs/payrollsPrepare'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsGetBlockers } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { Payroll, PayrollPrepared } from '@gusto/embedded-api/models/components/payroll'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { useQueryErrorHandler, type HookLoadingResult, type HookErrors } from '../../helpers'
import {
  payrollSubmitHandler,
  type ApiPayrollBlocker,
} from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import {
  calculateGrossPay,
  getRegularHours,
  getOvertimeHours,
  getTotalPtoHours,
  getAdditionalEarnings,
  getReimbursements,
  getEmployeePayRateInfo,
} from '@/components/Payroll/helpers'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { PaginationItemsPerPage } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'

const PREPARE_QUERY_KEY = 'payroll-prepare'
const FIVE_MINUTES = 5 * 60 * 1000
const POLLING_INTERVAL = 5_000

export interface EnrichedEmployeeCompensation {
  employeeUuid: string
  firstName: string
  lastName: string
  payRate: number | null
  paymentUnit: string | null
  excluded: boolean
  compensation: PayrollEmployeeCompensationsType
  grossPay: number
  totalHours: number
  regularHours: number
  overtimeHours: number
  totalPtoHours: number
  additionalEarnings: number
  reimbursements: number
}

export interface PaginationResult {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: PaginationItemsPerPage
  isFetching: boolean
  isFirstPage: boolean
  isLastPage: boolean
  onFirstPage: () => void
  onPreviousPage: () => void
  onNextPage: () => void
  onLastPage: () => void
  onItemsPerPageChange: (n: PaginationItemsPerPage) => void
}

export interface PayrollConfigurationData {
  payroll: Payroll | undefined
  employees: Employee[]
  employeeCompensations: EnrichedEmployeeCompensation[]
  payPeriod: PayrollPayPeriodType | undefined
  paySchedule: PayScheduleObject | undefined
  isOffCycle: boolean
  offCycleReason: string | null
  totals: Payroll['totals']
  blockers: ApiPayrollBlocker[]
}

export interface PayrollConfigurationReady {
  isLoading: false
  isPending: boolean
  isPendingCalculatePayroll: boolean
  isPendingUpdateSkipEmployee: boolean
  data: PayrollConfigurationData
  pagination: PaginationResult
  errors: HookErrors
  onCalculate: () => Promise<void>
  onSkipEmployee: (employeeUuid: string) => Promise<PayrollPrepared | undefined>
  onUnskipEmployee: (employeeUuid: string) => Promise<PayrollPrepared | undefined>
}

export type UsePayrollConfigurationResult = HookLoadingResult | PayrollConfigurationReady

interface UsePayrollConfigurationParams {
  companyId: string
  payrollId: string
  defaultItemsPerPage?: PaginationItemsPerPage
}

function buildEnrichedCompensations(
  employeeCompensations: PayrollEmployeeCompensationsType[],
  employees: Employee[],
  payPeriod: PayrollPayPeriodType | undefined,
  paySchedule: PayScheduleObject | undefined,
  isOffCycle: boolean,
): EnrichedEmployeeCompensation[] {
  const employeeMap = new Map(employees.map(e => [e.uuid, e]))

  return employeeCompensations.map(compensation => {
    const employee = employeeMap.get(compensation.employeeUuid ?? '')
    const payRateInfo = employee ? getEmployeePayRateInfo(employee) : null

    const grossPay = employee
      ? calculateGrossPay(compensation, employee, payPeriod?.startDate, paySchedule, isOffCycle)
      : 0

    const regularHours = getRegularHours(compensation)
    const overtimeHours = getOvertimeHours(compensation)

    return {
      employeeUuid: compensation.employeeUuid ?? '',
      firstName: employee?.firstName ?? '',
      lastName: employee?.lastName ?? '',
      payRate: payRateInfo?.rate ?? null,
      paymentUnit: payRateInfo?.paymentUnit ?? null,
      excluded: compensation.excluded ?? false,
      compensation,
      grossPay,
      totalHours: regularHours + overtimeHours,
      regularHours,
      overtimeHours,
      totalPtoHours: getTotalPtoHours(compensation),
      additionalEarnings: getAdditionalEarnings(compensation),
      reimbursements: getReimbursements(compensation),
    }
  })
}

function transformEmployeeCompensation({
  paymentMethod,
  reimbursements: _reimbursements,
  ...compensation
}: PayrollEmployeeCompensationsType): PayrollUpdateEmployeeCompensations {
  return {
    ...compensation,
    ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
    memo: compensation.memo || undefined,
  }
}

export function usePayrollConfiguration({
  companyId,
  payrollId,
  defaultItemsPerPage = 10,
}: UsePayrollConfigurationParams): UsePayrollConfigurationResult {
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()

  const [isPolling, setIsPolling] = useState(false)
  const [blockers, setBlockers] = useState<ApiPayrollBlocker[]>([])
  const blockersInitializedRef = useRef(false)

  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage,
  })
  const [displayedEmployees, setDisplayedEmployees] = useState<Employee[]>([])
  const [isDataInSync, setIsDataInSync] = useState(false)
  const hasInitialDataRef = useRef(false)

  const {
    data: employeeData,
    isLoading: isEmployeesLoading,
    isFetching: isFetchingEmployeeData,
    error: employeesQueryError,
  } = useEmployeesList(
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
    error: prepareQueryError,
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
    enabled: employeeUuids.length > 0,
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

  const {
    data: payScheduleData,
    isLoading: isPayScheduleLoading,
    error: payScheduleQueryError,
  } = usePaySchedulesGet(
    {
      companyId,
      payScheduleId: prepareData?.payPeriod?.payScheduleUuid || '',
    },
    {
      enabled: !!prepareData?.payPeriod?.payScheduleUuid,
    },
  )

  const {
    data: payrollData,
    isLoading: isPayrollLoading,
    error: payrollQueryError,
  } = usePayrollsGet(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    },
    { refetchInterval: isPolling ? POLLING_INTERVAL : false },
  )

  const {
    data: blockersData,
    isLoading: isBlockersLoading,
    error: blockersQueryError,
  } = usePayrollsGetBlockers({
    companyUuid: companyId,
  })

  useEffect(() => {
    if (!blockersInitializedRef.current && blockersData?.payrollBlockerList) {
      blockersInitializedRef.current = true
      setBlockers(
        blockersData.payrollBlockerList.map(blocker => ({
          key: blocker.key ?? 'unknown',
          message: blocker.message,
        })),
      )
    }
  }, [blockersData?.payrollBlockerList])

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler(
    [
      employeesQueryError,
      prepareQueryError,
      payScheduleQueryError,
      payrollQueryError,
      blockersQueryError,
    ],
    setError,
  )

  const { mutateAsync: calculatePayroll, isPending: isCalculateMutationPending } =
    usePayrollsCalculateMutation()

  const { mutateAsync: updatePayroll, isPending: isPendingUpdateSkipEmployee } =
    usePayrollsUpdateMutation()

  useEffect(() => {
    const processingStatus = payrollData?.payrollShow?.processingRequest?.status
    if (processingStatus === PayrollProcessingRequestStatus.Calculating && !isPolling) {
      setIsPolling(true)
    }
    if (isPolling && processingStatus === PayrollProcessingRequestStatus.CalculateSuccess) {
      setBlockers([])
      setIsPolling(false)
    }
    if (isPolling && processingStatus === PayrollProcessingRequestStatus.ProcessingFailed) {
      setIsPolling(false)
    }
  }, [payrollData?.payrollShow?.processingRequest?.status, isPolling])

  const handleRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: [PREPARE_QUERY_KEY, payrollId],
    })
  }, [queryClient, payrollId])

  const onCalculate = useCallback(async () => {
    setBlockers([])

    await baseSubmitHandler({}, async () => {
      const result = await payrollSubmitHandler(async () => {
        await calculatePayroll({
          request: {
            companyId,
            payrollId,
          },
        })
        setIsPolling(true)
      })

      if (!result.success && result.blockers.length > 0) {
        setBlockers(result.blockers)
      }
    })
  }, [baseSubmitHandler, calculatePayroll, companyId, payrollId])

  const findCompensationForEmployee = useCallback(
    (employeeUuid: string): PayrollEmployeeCompensationsType | undefined => {
      return prepareData?.employeeCompensations?.find(ec => ec.employeeUuid === employeeUuid)
    },
    [prepareData?.employeeCompensations],
  )

  const updateEmployeeExcluded = useCallback(
    async (employeeUuid: string, excluded: boolean): Promise<PayrollPrepared | undefined> => {
      const employeeComp = findCompensationForEmployee(employeeUuid)
      if (!employeeComp) return undefined

      const transformedCompensation = transformEmployeeCompensation(employeeComp)
      let payrollPrepared: PayrollPrepared | undefined

      await baseSubmitHandler({}, async () => {
        const result = await updatePayroll({
          request: {
            companyId,
            payrollId,
            payrollUpdate: {
              employeeCompensations: [{ ...transformedCompensation, excluded }],
            },
          },
        })
        payrollPrepared = result.payrollPrepared
        await handleRefetch()
      })

      return payrollPrepared
    },
    [
      findCompensationForEmployee,
      baseSubmitHandler,
      updatePayroll,
      companyId,
      payrollId,
      handleRefetch,
    ],
  )

  const onSkipEmployee = useCallback(
    async (employeeUuid: string): Promise<PayrollPrepared | undefined> => {
      return updateEmployeeExcluded(employeeUuid, true)
    },
    [updateEmployeeExcluded],
  )

  const onUnskipEmployee = useCallback(
    async (employeeUuid: string): Promise<PayrollPrepared | undefined> => {
      return updateEmployeeExcluded(employeeUuid, false)
    },
    [updateEmployeeExcluded],
  )

  const isLoading =
    isEmployeesLoading ||
    isPrepareLoading ||
    isPayScheduleLoading ||
    isPayrollLoading ||
    isBlockersLoading

  if (isLoading) {
    return { isLoading: true as const }
  }

  const payPeriod = prepareData?.payPeriod
  const paySchedule = payScheduleData?.payScheduleObject
  const isOffCycle = prepareData?.offCycle ?? false
  const offCycleReason = prepareData?.offCycleReason ?? null

  const enrichedCompensations = buildEnrichedCompensations(
    prepareData?.employeeCompensations || [],
    displayedEmployees,
    payPeriod,
    paySchedule,
    isOffCycle,
  )

  const isPendingCalculatePayroll = isCalculateMutationPending || isPolling

  const isPaginatingEmployees = isPrepareFetching && hasInitialDataRef.current
  const isPaginationFetching = isFetchingEmployeeData || isPaginatingEmployees || !isDataInSync

  const headers = employeeData?.httpMeta.response.headers ?? new Headers()
  const rawPagination = getPaginationProps(headers, isPaginationFetching)

  const pagination: PaginationResult = {
    currentPage: rawPagination.currentPage,
    totalPages: rawPagination.totalPages,
    totalCount: rawPagination.totalCount,
    itemsPerPage: rawPagination.itemsPerPage,
    isFetching: rawPagination.isFetching ?? false,
    isFirstPage: rawPagination.currentPage <= 1,
    isLastPage: rawPagination.currentPage >= rawPagination.totalPages,
    onFirstPage: rawPagination.handleFirstPage,
    onPreviousPage: rawPagination.handlePreviousPage,
    onNextPage: rawPagination.handleNextPage,
    onLastPage: rawPagination.handleLastPage,
    onItemsPerPageChange: rawPagination.handleItemsPerPageChange,
  }

  return {
    isLoading: false as const,
    isPending: isPendingCalculatePayroll || isPendingUpdateSkipEmployee,
    isPendingCalculatePayroll,
    isPendingUpdateSkipEmployee,
    data: {
      payroll: payrollData?.payrollShow,
      employees: displayedEmployees,
      employeeCompensations: enrichedCompensations,
      payPeriod,
      paySchedule,
      isOffCycle,
      offCycleReason,
      totals: payrollData?.payrollShow?.totals,
      blockers,
    },
    pagination,
    errors: { error, fieldErrors, setError },
    onCalculate,
    onSkipEmployee,
    onUnskipEmployee,
  }
}
