import { useCallback, useMemo } from 'react'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api/models/operations/getv1employeesemployeeidjobs'
import { useJobsAndCompensationsDeleteCompensationMutation } from '@gusto/embedded-api/react-query/jobsAndCompensationsDeleteCompensation'
import { usePayrollsGetPayStubs } from '@gusto/embedded-api/react-query/payrollsGetPayStubs'
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
import type { BaseHookReady, HookSubmitResult } from '@/partner-hook-utils/types'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

type EmployeePayStub = NonNullable<
  GetV1EmployeesEmployeeUuidPayStubsResponse['employeePayStubsList']
>[number]

export interface UseEmployeeCompensationProps {
  employeeId: string
}

export interface UseEmployeeCompensationResult extends BaseHookReady<
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
  {
    isPending: boolean
    cancellingCompensationUuid: string | null
    /** Compensation card depends on the jobs fetch (jobs, pending
     *  changes, FLSA status). */
    isEmployeeLoading: boolean
    /** Paystubs card depends on a separate paginated endpoint. */
    isPayStubsLoading: boolean
  }
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

/**
 * Phase B: non-Suspense queries so the Compensation and Paystubs cards
 * can paint independently within the Job and pay tab. JobAndPayView
 * already gets the Payment and Deductions cards as separate non-Suspense
 * hooks, so this completes the four-section incremental render.
 */
export function useEmployeeCompensation({
  employeeId,
}: UseEmployeeCompensationProps): UseEmployeeCompensationResult {
  const { currentPage, itemsPerPage, getPaginationProps } = usePagination({
    defaultItemsPerPage: 10,
  })

  // staleTime: Infinity on dashboard reads — the SDK QueryClient already
  // invalidates all queries on any mutation success, so post-write
  // freshness is preserved. Without this, every subscriber re-mount
  // (e.g. tab navigation) would fire a redundant background refetch.
  //
  // GET /v1/employees/:id/jobs?include=all_compensations returns all effective-
  // dated compensations (current + future) with compensation.title on each,
  // which is required for pending-change detection. Without the include param,
  // only the current compensation is returned.
  const jobsQuery = useJobsAndCompensationsGetJobs(
    { employeeId, include: GetV1EmployeesEmployeeIdJobsQueryParamInclude.AllCompensations },
    { staleTime: Infinity },
  )
  // Employee query is a lightweight secondary fetch for cosmetic data only
  // (first name used in alert copy). Jobs / compensation data comes from jobsQuery.
  const employeeQuery = useEmployeesGet({ employeeId }, { staleTime: Infinity })
  const payStubsQuery = usePayrollsGetPayStubs(
    { employeeId, page: currentPage, per: itemsPerPage },
    { staleTime: Infinity },
  )
  const cancelCompensationMutation = useJobsAndCompensationsDeleteCompensationMutation()
  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('Employee.Dashboard.JobAndPay.Compensation')

  const employee = employeeQuery.data?.employee

  const jobs = useMemo(() => jobsQuery.data?.jobs ?? [], [jobsQuery.data?.jobs])
  const primaryJob = useMemo(() => jobs.find(job => job.primary === true), [jobs])
  const primaryFlsaStatus = useMemo(() => derivePrimaryFlsaStatus(jobs), [jobs])
  const hasMultipleJobs = jobs.length > 1

  const pendingChanges = useMemo(() => getPendingCompensationChanges(jobs), [jobs])

  const payStubs = payStubsQuery.data?.employeePayStubsList ?? []

  const payStubsPagination = useMemo(() => {
    const headers = payStubsQuery.data?.httpMeta.response.headers
    if (!headers) return undefined
    return getPaginationProps(headers, payStubsQuery.isFetching)
  }, [payStubsQuery.data?.httpMeta.response.headers, payStubsQuery.isFetching, getPaginationProps])

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
    jobsQuery.isFetching ||
    employeeQuery.isFetching ||
    payStubsQuery.isFetching ||
    cancelCompensationMutation.isPending

  const errorHandling = composeErrorHandler([jobsQuery, employeeQuery, payStubsQuery], {
    submitError,
    setSubmitError,
  })

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
      isEmployeeLoading: jobsQuery.isLoading,
      isPayStubsLoading: payStubsQuery.isLoading,
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
