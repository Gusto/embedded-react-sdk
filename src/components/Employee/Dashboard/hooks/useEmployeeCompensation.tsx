import { useCallback, useMemo } from 'react'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useJobsAndCompensationsDeleteCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDeleteCompensation'
import { usePayrollsGetPayStubsSuspense } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
import type { Job } from '@gusto/embedded-api/models/components/job'
import type { GetV1EmployeesEmployeeUuidPayStubsResponse } from '@gusto/embedded-api/models/operations/getv1employeesemployeeuuidpaystubs'
import {
  getPendingCompensationChanges,
  type PendingCompensationChange,
} from '../getPendingCompensationChanges'
import { derivePrimaryFlsaStatus } from '@/components/Employee/Compensation/shared/derivePrimaryFlsaStatus'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import { usePagination } from '@/hooks/usePagination/usePagination'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface UseEmployeeCompensationProps {
  employeeId: string
}

interface UseEmployeeCompensationReady extends BaseHookReady<
  {
    jobs: Job[]
    primaryJob?: Job
    primaryFlsaStatus?: string
    hasMultipleJobs: boolean
    pendingChanges: PendingCompensationChange[]
    payStubs: EmployeePayStub[]
    /** First name from the shared employee fetch; useful for cosmetic copy
     *  in alerts (e.g. "Heads up, Jane has pending changes"). Optional
     *  because the employee record can omit it. */
    employeeFirstName?: string
  },
  { isPending: boolean; cancellingCompensationUuid: string | null }
> {
  pagination: {
    payStubs?: PaginationControlProps
  }
  actions: {
    cancelPendingChange: (
      pendingChange: PendingCompensationChange,
    ) => Promise<HookSubmitResult<unknown> | undefined>
  }
}

export type UseEmployeeCompensationResult = HookLoadingResult | UseEmployeeCompensationReady

export function useEmployeeCompensation({
  employeeId,
}: UseEmployeeCompensationProps): UseEmployeeCompensationResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })

  const employeeQuery = useEmployeesGetSuspense({
    employeeId,
    include: ['all_compensations'],
  })
  const payStubsQuery = usePayrollsGetPayStubsSuspense({
    employeeId,
    page: currentPage,
    per: itemsPerPage,
  })
  const cancelCompensationMutation = useJobsAndCompensationsDeleteCompensationMutation()
  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('Employee.Dashboard.JobAndPay.Compensation')

  const employee = employeeQuery.data.employee
  const payStubsData = payStubsQuery.data

  const jobs = useMemo(() => employee?.jobs ?? [], [employee?.jobs])
  const primaryJob = useMemo(() => jobs.find(job => job.primary === true), [jobs])
  const primaryFlsaStatus = useMemo(() => derivePrimaryFlsaStatus(jobs), [jobs])
  const hasMultipleJobs = jobs.length > 1

  const pendingChanges = useMemo(
    () => getPendingCompensationChanges(employee?.jobs),
    [employee?.jobs],
  )

  const payStubs = payStubsData.employeePayStubsList || []

  const payStubsPagination = useMemo(() => {
    const headers = payStubsData.httpMeta.response.headers
    return getPaginationProps(headers, payStubsQuery.isFetching)
  }, [payStubsData.httpMeta.response.headers, payStubsQuery.isFetching, getPaginationProps])

  const cancellingCompensationUuid = cancelCompensationMutation.isPending
    ? cancelCompensationMutation.variables.request.compensationId
    : null

  const cancelPendingChange = useCallback(
    async (
      pendingChange: PendingCompensationChange,
    ): Promise<HookSubmitResult<unknown> | undefined> => {
      let submitResult: HookSubmitResult<unknown> | undefined
      await baseSubmitHandler(pendingChange, async ({ compensationUuid }) => {
        const data = await cancelCompensationMutation.mutateAsync({
          request: { compensationId: compensationUuid },
        })
        submitResult = { mode: 'update', data }
      })
      return submitResult
    },
    [baseSubmitHandler, cancelCompensationMutation],
  )

  const isPending =
    employeeQuery.isFetching || payStubsQuery.isFetching || cancelCompensationMutation.isPending

  const isLoading = !employee && isPending

  const errorHandling = composeErrorHandler([employeeQuery, payStubsQuery], {
    submitError,
    setSubmitError,
  })

  if (isLoading) {
    return {
      isLoading: true,
      errorHandling,
    }
  }

  return {
    isLoading: false,
    data: {
      jobs,
      primaryJob,
      primaryFlsaStatus,
      hasMultipleJobs,
      pendingChanges,
      payStubs,
      employeeFirstName: employee?.firstName ?? undefined,
    },
    status: {
      isPending,
      cancellingCompensationUuid,
    },
    pagination: {
      payStubs: payStubsPagination,
    },
    actions: {
      cancelPendingChange,
    },
    errorHandling,
  }
}
