import { useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { usePayrollsGetPayStubsSuspense } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { HookLoadingResult, BaseHookReady } from '@/partner-hook-utils/types'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface UseEmployeeCompensationProps {
  employeeId: string
}

interface UseEmployeeCompensationReady extends BaseHookReady<
  {
    primaryJob?: Job
    garnishmentList: Garnishment[]
    payStubs: EmployeePayStub[]
  },
  { isPending: boolean }
> {
  pagination: {
    payStubs?: PaginationControlProps
  }
}

export type UseEmployeeCompensationResult = HookLoadingResult | UseEmployeeCompensationReady

export function useEmployeeCompensation({
  employeeId,
}: UseEmployeeCompensationProps): UseEmployeeCompensationResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })

  const employeeQuery = useEmployeesGetSuspense({ employeeId })
  const garnishmentsQuery = useGarnishmentsListSuspense({ employeeId })
  const payStubsQuery = usePayrollsGetPayStubsSuspense({
    employeeId,
    page: currentPage,
    per: itemsPerPage,
  })

  const employee = employeeQuery.data.employee
  const garnishmentList = garnishmentsQuery.data.garnishments
  const payStubsData = payStubsQuery.data

  const primaryJob = useMemo(() => {
    return employee?.jobs?.find(job => job.primary === true)
  }, [employee?.jobs])

  const payStubs = payStubsData.employeePayStubsList || []

  const payStubsPagination = useMemo(() => {
    const headers = payStubsData.httpMeta.response.headers
    return getPaginationProps(headers, payStubsQuery.isFetching)
  }, [payStubsData.httpMeta.response.headers, payStubsQuery.isFetching, getPaginationProps])

  const isPending =
    employeeQuery.isFetching ||
    garnishmentsQuery.isFetching ||
    payStubsQuery.isFetching

  const isLoading = !employee && isPending

  const errorHandling = composeErrorHandler([
    employeeQuery,
    garnishmentsQuery,
    payStubsQuery,
  ])

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      primaryJob,
      garnishmentList: garnishmentList || [],
      payStubs,
    },
    status: {
      isPending,
    },
    pagination: {
      payStubs: payStubsPagination,
    },
    errorHandling,
  }
}
