import { useCallback, useMemo } from 'react'
import { useEmployeesGet } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesGet'
import { useJobsAndCompensationsGetJobs } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsGetJobs'
import { GetV1EmployeesEmployeeIdJobsQueryParamInclude } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidjobs'
import { useJobsAndCompensationsDeleteCompensationMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/jobsAndCompensationsDeleteCompensation'
import type { Job } from '@gusto/embedded-api-v-2025-11-15/models/components/job'
import {
  getPendingCompensationChanges,
  type PendingCompensationChange,
} from '../getPendingCompensationChanges'
import { derivePrimaryFlsaStatus } from '@/components/Employee/Compensation/shared/derivePrimaryFlsaStatus'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookSubmitResult } from '@/partner-hook-utils/types'

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
    isCompensationLoading: boolean
  }
> {
  actions: {
    cancelPendingChange: (
      pendingChange: PendingCompensationChange,
    ) => Promise<HookSubmitResult<unknown> | undefined>
  }
}

/**
 * Non-Suspense queries for the Compensation card on the Job and pay tab.
 * Returns jobs + pending-changes + the employee's first name (for cosmetic
 * alert copy) along with a cancel-pending-change action. Paystubs data
 * moved into `@/components/Employee/Paystubs/shared/usePaystubsList` when
 * the Paystubs card became its own management block.
 */
export function useEmployeeCompensation({
  employeeId,
}: UseEmployeeCompensationProps): UseEmployeeCompensationResult {
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
    jobsQuery.isFetching || employeeQuery.isFetching || cancelCompensationMutation.isPending

  const errorHandling = composeErrorHandler([jobsQuery, employeeQuery], {
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
      employeeFirstName: employee?.firstName ?? undefined,
    },
    status: {
      isPending,
      cancellingCompensationUuid,
      isCompensationLoading: jobsQuery.isLoading,
    },
    actions: {
      cancelPendingChange,
    },
    errorHandling,
  }
}
