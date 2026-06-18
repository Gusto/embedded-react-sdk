import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePayrollsListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsGet'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsUpdate'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsCalculate'
import type {
  EmployeeCompensations,
  PayrollPrepared,
} from '@gusto/embedded-api-v-2025-11-15/models/components/payroll'
import { APIError } from '@gusto/embedded-api-v-2025-11-15/models/errors/apierror'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2025-11-15/models/errors/unprocessableentityerror'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollprocessingrequest'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1companiescompanyidpayrolls'
import { PayrollConfigurationRropPresentation } from '../../components/payroll/PayrollConfigurationRrop/PayrollConfigurationRropPresentation'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  PREPARE_QUERY_KEY,
  usePayrollConfigurationData,
} from '@/components/Payroll/PayrollConfiguration/usePayrollConfigurationData'
import { PayrollOverview } from '@/components/Payroll/PayrollOverview/PayrollOverview'
import { PayrollReceipts } from '@/components/Payroll/PayrollReceipts/PayrollReceipts'
import { componentEvents } from '@/shared/constants'
import { useDateFormatter } from '@/hooks/useDateFormatter'

// Retryable conflicts surfaced by the payroll update endpoint:
//  - 409 / 422 "being processed by another request" (category: invalid_operation)
//  - 422 stale version under optimistic locking (category: invalid_attribute_value, message
//    mentions "Supplied Version") — happens when the prepared-payroll refetch bumps versions
//    between our save attempts. Retrying re-reads the latest known version (from props or
//    the prior mutation response), which by then should match the server.
function isRetryableSaveError(error: unknown): boolean {
  if (error instanceof UnprocessableEntityError) {
    return error.errors.some(
      e =>
        e.category === 'invalid_operation' ||
        (e.category === 'invalid_attribute_value' &&
          typeof e.message === 'string' &&
          e.message.toLowerCase().includes('version')),
    )
  }
  if (error instanceof APIError && error.httpMeta.response.status === 409) {
    return true
  }
  return false
}

export interface RegularRateOfPayProps {
  companyId: string
  preferredPayrollId?: string
}

const UNPROCESSED_LOOKBACK_MONTHS = 6
const UNPROCESSED_LOOKAHEAD_MONTHS = 3

function shiftDate(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return date.toISOString().split('T')[0]!
}

function Root({ companyId, preferredPayrollId }: RegularRateOfPayProps) {
  const { Alert, Heading } = useComponentContext()

  const { data: payrollsData } = usePayrollsListSuspense({
    companyId,
    processingStatuses: [ProcessingStatuses.Unprocessed],
    startDate: shiftDate(-UNPROCESSED_LOOKBACK_MONTHS),
    endDate: shiftDate(UNPROCESSED_LOOKAHEAD_MONTHS),
    payrollTypes: [QueryParamPayrollTypes.Regular, QueryParamPayrollTypes.OffCycle],
    includeOffCycle: true,
  })
  const selectedPayrollId = useMemo(() => {
    const list = payrollsData.payrollList ?? []
    const preferred = list.find(p => p.payrollUuid === preferredPayrollId)
    return preferred?.payrollUuid ?? list[0]?.payrollUuid ?? ''
  }, [payrollsData.payrollList, preferredPayrollId])

  if (!selectedPayrollId) {
    return (
      <Flex flexDirection="column" gap={16} alignItems="stretch">
        <Heading as="h2">Regular rate of pay</Heading>
        <Alert label="No unprocessed payrolls" status="warning">
          This company has no unprocessed payrolls in the current window. Create or open one to load
          this prototype.
        </Alert>
      </Flex>
    )
  }

  return <PreparedConfiguration companyId={companyId} payrollId={selectedPayrollId} />
}

interface PreparedConfigurationProps {
  companyId: string
  payrollId: string
}

function PreparedConfiguration({ companyId, payrollId }: PreparedConfigurationProps) {
  const [view, setView] = useState<'configure' | 'review' | 'receipts'>('configure')
  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  // Bumped every time the user re-enters the configure step from review. Used as a `key`
  // on the configuration presentation so PayrollSpreadsheet remounts and re-seeds its
  // local state from the freshest prepared-payroll data instead of holding the stale
  // pre-calc snapshot.
  const [editRevision, setEditRevision] = useState(0)
  // True while the prepared-payroll is refetching after the user clicks Edit on review.
  // Drives skeleton cells in the spreadsheet so the user sees the configure view
  // immediately instead of staring at a calculation/review screen for an extra beat.
  const [isReseeding, setIsReseeding] = useState(false)
  const previousCalculatedAtRef = useRef<number | null>(null)

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )

  const { mutateAsync: updatePayroll } = usePayrollsUpdateMutation()
  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()
  const queryClient = useQueryClient()

  // Serialize saves so they can't pile up while the prepared-payroll query is refetching
  // (which happens after every mutation via the global SDK invalidation in createSdkQueryClient).
  const saveQueueRef = useRef<Promise<unknown>>(Promise.resolve())
  // Latest known compensation version per employee. Updated from two sources, last-write-wins:
  //  1. Each successful update response (immediate post-mutation version).
  //  2. The prepared-payroll prop refresh (post-refetch version — may bump again past 1).
  // Each save reads from this ref *inside* the retry callback, so retries pick up fresher
  // versions that arrive between attempts.
  const versionByEmployeeRef = useRef<Map<string, string>>(new Map())

  const handleSaveEmployeeCompensation = async (compensation: EmployeeCompensations) => {
    const { reimbursements: _ignore, paymentMethod, memo, version, ...rest } = compensation
    const employeeUuid = compensation.employeeUuid
    // Seed the cache from the compensation argument the first time we see this employee,
    // so the very first save (before any refetch has settled) has a version to send.
    if (
      employeeUuid &&
      typeof version === 'string' &&
      !versionByEmployeeRef.current.has(employeeUuid)
    ) {
      versionByEmployeeRef.current.set(employeeUuid, version)
    }

    const refreshVersionFromCache = (uuid: string): boolean => {
      const matches = queryClient.getQueriesData<PayrollPrepared>({
        queryKey: [PREPARE_QUERY_KEY, payrollId],
      })
      for (const [, data] of matches) {
        const updated = data?.employeeCompensations?.find(
          (c: EmployeeCompensations) => c.employeeUuid === uuid,
        )
        if (updated?.version && typeof updated.version === 'string') {
          versionByEmployeeRef.current.set(uuid, updated.version)
          return true
        }
      }
      return false
    }

    const next = saveQueueRef.current
      .catch(() => {})
      .then(async () => {
        const MAX_ATTEMPTS = 4
        let lastError: unknown
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          try {
            const result = await updatePayroll({
              request: {
                companyId,
                payrollId,
                payrollUpdate: {
                  employeeCompensations: [
                    {
                      ...rest,
                      memo: memo || undefined,
                      // Always read the latest cached version — refetches between attempts
                      // (see catch block below) may have written a newer one.
                      version: employeeUuid
                        ? versionByEmployeeRef.current.get(employeeUuid)
                        : undefined,
                      ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
                    },
                  ],
                },
              },
            })

            if (employeeUuid) {
              const updated = result.payrollPrepared?.employeeCompensations?.find(
                (c: EmployeeCompensations) => c.employeeUuid === employeeUuid,
              )
              const nextVersion = typeof updated?.version === 'string' ? updated.version : undefined
              if (nextVersion) {
                versionByEmployeeRef.current.set(employeeUuid, nextVersion)
              }
            }
            return
          } catch (err) {
            lastError = err
            const isLastAttempt = attempt === MAX_ATTEMPTS - 1
            if (!isRetryableSaveError(err) || isLastAttempt) throw err

            // Force a refetch of the prepared payroll so the next attempt picks up the
            // server's current version. Read directly from the queryClient cache after
            // refetch so we don't have to wait for React to re-render + useEffect to fire.
            await queryClient.refetchQueries({
              queryKey: [PREPARE_QUERY_KEY, payrollId],
            })
            if (employeeUuid) refreshVersionFromCache(employeeUuid)

            // Brief delay to let any in-flight "being processed" state clear on the server.
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
        throw lastError
      })
    saveQueueRef.current = next
    await next
  }

  const excludedEmployeeUuids = useMemo(
    () =>
      payrollData.payrollShow?.employeeCompensations
        ?.filter(comp => comp.excluded)
        .map(comp => comp.employeeUuid)
        .filter((uuid): uuid is string => Boolean(uuid)) ?? [],
    [payrollData.payrollShow?.employeeCompensations],
  )

  const {
    employeeDetails,
    employeeCompensations,
    paySchedule,
    payPeriod,
    payrollCategory,
    isLoading,
  } = usePayrollConfigurationData({
    companyId,
    payrollId,
    // Pause the prepare query while we're not on the configure view. PayrollOverview's
    // submission triggers a global SDK invalidation which would otherwise refetch
    // `payrollsPrepare` and reset the payroll's `calculatedAt` on the server, causing
    // PayrollOverview's `!payrollData.calculatedAt` precondition to throw "Payroll is
    // not calculated" on the next render. The SDK's PayrollExecutionFlow avoids this
    // implicitly because its configuration step unmounts when overview takes over.
    isCalculating: isPolling || isCalculatingPayroll || view !== 'configure',
    excludedEmployeeUuids,
  })

  // Detect calculation completion while polling. Mirrors the SDK's PayrollConfiguration logic.
  useEffect(() => {
    if (!isPolling) return
    const status = payrollData.payrollShow?.processingRequest?.status
    const currentCalculatedAt = payrollData.payrollShow?.calculatedAt?.getTime() ?? null
    const isNew = currentCalculatedAt !== previousCalculatedAtRef.current
    const isSuccess =
      currentCalculatedAt != null &&
      (status === PayrollProcessingRequestStatus.CalculateSuccess ||
        payrollData.payrollShow?.processingRequest == null)
    if (isNew && isSuccess) {
      setIsPolling(false)
      setView('review')
    }
    if (status === PayrollProcessingRequestStatus.ProcessingFailed) {
      setIsPolling(false)
    }
  }, [isPolling, payrollData.payrollShow?.calculatedAt, payrollData.payrollShow?.processingRequest])

  const handleCalculatePayroll = async () => {
    previousCalculatedAtRef.current = payrollData.payrollShow?.calculatedAt?.getTime() ?? null
    setIsCalculatingPayroll(true)
    try {
      await calculatePayroll({ request: { companyId, payrollId } })
      setIsPolling(true)
    } finally {
      setIsCalculatingPayroll(false)
    }
  }

  // `usePayrollConfigurationData` doesn't expose the prepared payroll's
  // `fixedCompensationTypes`, but it does live in the React Query cache under the same
  // prepare query key. Read it directly. Re-runs whenever `employeeCompensations`
  // changes (i.e. whenever the prepare data was refreshed in the cache).
  const fixedCompensationTypes = useMemo(() => {
    const matches = queryClient.getQueriesData<PayrollPrepared>({
      queryKey: [PREPARE_QUERY_KEY, payrollId],
    })
    for (const [, data] of matches) {
      if (data?.fixedCompensationTypes && data.fixedCompensationTypes.length > 0) {
        return data.fixedCompensationTypes
      }
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, payrollId, employeeCompensations])

  // Hide skipped/excluded employees from the spreadsheet. PayrollOverview keeps them as a
  // Skipped badge in review, but for the editing surface we drop them — their per-compensation
  // version can drift out of sync once they're excluded, and they don't participate in totals.
  const includedEmployeeCompensations = useMemo(
    () => employeeCompensations.filter(comp => !comp.excluded),
    [employeeCompensations],
  )
  const includedEmployeeUuids = useMemo(
    () =>
      new Set(
        includedEmployeeCompensations
          .map(c => c.employeeUuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
      ),
    [includedEmployeeCompensations],
  )
  const includedEmployees = useMemo(
    () => employeeDetails.filter(e => includedEmployeeUuids.has(e.uuid)),
    [employeeDetails, includedEmployeeUuids],
  )

  // Sync prop versions into the cache after each prepared-payroll refetch.
  // Last-write-wins with the mutation-response source above.
  useEffect(() => {
    for (const comp of employeeCompensations) {
      if (comp.employeeUuid && typeof comp.version === 'string') {
        versionByEmployeeRef.current.set(comp.employeeUuid, comp.version)
      }
    }
  }, [employeeCompensations])

  // Prototype-only status badge shown above every view. Reflects whether the payroll has
  // been processed (submitted + accepted) versus still unprocessed, and when it was last
  // calculated.
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()
  const isProcessed = payrollData.payrollShow?.processed === true
  const calculatedAt = payrollData.payrollShow?.calculatedAt ?? null
  const calculatedLabel = (() => {
    if (!calculatedAt) return 'Not yet calculated'
    const { date, time } = dateFormatter.formatWithTime(calculatedAt)
    return `Calculated ${date} at ${time}`
  })()
  const statusHeader = (
    <Flex gap={12} alignItems="center">
      <Components.Badge status={isProcessed ? 'success' : 'info'}>
        {isProcessed ? 'Processed' : 'Unprocessed'}
      </Components.Badge>
      <Components.Text variant="supporting">{calculatedLabel}</Components.Text>
      <Components.Text variant="supporting">Payroll ID: {payrollId}</Components.Text>
    </Flex>
  )

  let body: ReactNode
  if (view === 'receipts') {
    body = <PayrollReceipts payrollId={payrollId} onEvent={() => {}} />
  } else if (view === 'review') {
    body = (
      <PayrollOverview
        companyId={companyId}
        payrollId={payrollId}
        onEvent={event => {
          if (event === componentEvents.RUN_PAYROLL_EDIT) {
            // Switch view immediately for a snappy transition. The spreadsheet renders
            // with skeleton cells (isReseeding) while we refetch the prepared payroll
            // in the background. Once the refetch lands, bump editRevision to remount
            // the spreadsheet so it re-seeds from the post-calc server state.
            setIsReseeding(true)
            setView('configure')
            void (async () => {
              await queryClient.refetchQueries({
                queryKey: [PREPARE_QUERY_KEY, payrollId],
              })
              setEditRevision(r => r + 1)
              setIsReseeding(false)
            })()
          }
          if (event === componentEvents.RUN_PAYROLL_RECEIPT_GET) {
            // User explicitly clicked View Receipt from the post-submission overview.
            setView('receipts')
          }
        }}
      />
    )
  } else {
    body = (
      <PayrollConfigurationRropPresentation
        key={editRevision}
        isSpreadsheetLoading={isReseeding}
        employeeCompensations={includedEmployeeCompensations}
        employeeDetails={includedEmployees}
        fixedCompensationTypes={fixedCompensationTypes}
        payPeriod={payPeriod}
        paySchedule={paySchedule}
        payrollCategory={payrollCategory}
        isPending={isLoading || isPolling || isCalculatingPayroll}
        isCalculating={isCalculatingPayroll || isPolling}
        onCalculatePayroll={handleCalculatePayroll}
        onViewBlockers={() => {}}
        onSaveEmployeeCompensation={handleSaveEmployeeCompensation}
      />
    )
  }

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      {statusHeader}
      {body}
    </Flex>
  )
}

export function RegularRateOfPay(props: RegularRateOfPayProps) {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={32} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <Root {...props} />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
