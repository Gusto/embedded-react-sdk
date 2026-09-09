import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { payrollsCalculate } from '@gusto/embedded-api/funcs/payrollsCalculate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsGetBlockers } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollPrepared } from '@gusto/embedded-api/models/components/payrollshow'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { useTranslation } from 'react-i18next'
import {
  payrollSubmitHandler,
  type ApiPayrollBlocker,
} from '../../../PayrollBlocker/payrollHelpers'
import type { PayrollCategory } from '../../../payrollTypes'
import { transformEmployeeCompensation } from '../../payrollUpdateHelpers'
import { usePayrollConfigurationData } from '../../usePayrollConfigurationData'
import { useCalculationPoll, isCalculatingStatus, type PayrollShow } from '../../useCalculationPoll'
import { useI18n } from '@/i18n'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type { BaseHookReady, HookLoadingResult, HookSubmitResult } from '@/partner-hook-utils/types'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'

/**
 * A late-payroll or direct-deposit-deadline banner descriptor returned by
 * {@link usePayrollConfiguration}.
 *
 * @remarks
 * Copy-free: the raw dates are supplied so the consumer formats and translates
 * them. `latePayroll` fires when the pay date slipped; `directDepositDeadline`
 * carries the cutoff for the scheduled check date.
 *
 * @public
 */
export type PayrollConfigurationNotice =
  | {
      type: 'latePayroll'
      /** The originally scheduled check date. */
      initialCheckDate: string
      /** The new expected debit time. */
      expectedDebitTime: string
      /** The new expected check date. */
      expectedCheckDate: string
    }
  | {
      type: 'directDepositDeadline'
      /** The scheduled check (pay) date. */
      checkDate: string
      /** The direct-deposit submission deadline. */
      payrollDeadline: Date
    }

/**
 * Parameters for {@link usePayrollConfiguration}.
 *
 * @public
 */
export interface UsePayrollConfigurationParams {
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /**
   * Callback invoked with the payroll lifecycle events the hook emits
   * (`runPayroll/calculated`, `runPayroll/processingFailed`,
   * `runPayroll/alreadyProcessed`, `runPayroll/employee/skip`,
   * `runPayroll/employee/saved`).
   */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Data payload exposed by {@link usePayrollConfiguration} once loaded.
 *
 * @public
 */
export type UsePayrollConfigurationData = {
  /** Prepared employee compensations for the current page. */
  employeeCompensations: PayrollEmployeeCompensationsType[]
  /** Employee records matching the prepared compensations. */
  employeeDetails: Employee[]
  /** The payroll's pay period. */
  payPeriod?: PayrollPayPeriodType
  /** The pay schedule the payroll belongs to. */
  paySchedule?: PayScheduleShow
  /** The derived payroll category (Regular, Bonus, Correction, …). */
  payrollCategory: PayrollCategory
  /** Submission blockers currently preventing the payroll from being calculated. */
  blockers: ApiPayrollBlocker[]
  /** An optional late-payroll or deadline banner descriptor. */
  notice?: PayrollConfigurationNotice
}

/**
 * Lifecycle status flags exposed by {@link usePayrollConfiguration}.
 *
 * @remarks
 * Independent booleans, not a mutually-exclusive state machine: a consumer
 * shows a full-surface loader while `isPreparing || isUpdating || isCalculating`,
 * the calculating affordance while `isCalculating`, and hands off to a read-only
 * view while `isProcessed`. `isFetching` is a lighter background-refresh hint.
 *
 * @public
 */
export type UsePayrollConfigurationStatus = {
  /** The compensation table's initial prepare is loading (no rows yet). */
  isPreparing: boolean
  /** A background prepare/employees refetch is in flight (pagination, post-mutation). */
  isFetching: boolean
  /** A compensation update (skip/unskip) mutation is in flight. */
  isUpdating: boolean
  /** The payroll calculation is running or being polled. */
  isCalculating: boolean
  /** The payroll is already processed; the consumer should delegate to a read-only view. */
  isProcessed: boolean
}

/**
 * Ready-state shape returned by {@link usePayrollConfiguration} once the payroll
 * has loaded.
 *
 * @public
 */
export interface UsePayrollConfigurationReady extends BaseHookReady<
  UsePayrollConfigurationData,
  UsePayrollConfigurationStatus
> {
  /** Pagination controls for the employee compensations list. */
  pagination: PaginationControlProps
  /** Imperative actions for configuring the payroll. */
  actions: {
    /** Submits the payroll to be calculated and begins polling for the result. */
    calculatePayroll: () => Promise<void>
    /** Toggles whether an employee is skipped for this payroll and persists the change. */
    toggleExclude: (
      employeeCompensation: PayrollEmployeeCompensationsType,
    ) => Promise<HookSubmitResult<PayrollPrepared | undefined> | undefined>
  }
}

/**
 * Return type of {@link usePayrollConfiguration}.
 *
 * @public
 */
export type UsePayrollConfigurationResult = HookLoadingResult | UsePayrollConfigurationReady

/**
 * Headless, partner-facing data hook for the payroll configuration screen.
 *
 * @remarks
 * Centralizes the business logic of the configuration phase of running a payroll:
 * it prepares and paginates employee compensations, exposes the payroll's category
 * and any submission blockers, drives the submit-to-calculate lifecycle (including
 * polling the API for the calculation status and the guard that prevents a
 * re-prepare from wiping a running calculation), and reports whether the payroll
 * has already been processed. Wire the returned `data`, `status`, `pagination`, and
 * `actions` to any UI; gross-up (net-earnings) is handled by the companion
 * `usePayrollGrossUp` hook.
 *
 * @param params - See {@link UsePayrollConfigurationParams}.
 * @returns A discriminated union: `{ isLoading: true }` while the payroll loads,
 *   then the {@link UsePayrollConfigurationReady} shape.
 * @public
 */
export function usePayrollConfiguration({
  companyId,
  payrollId,
  onEvent,
}: UsePayrollConfigurationParams): UsePayrollConfigurationResult {
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('PayrollConfiguration')
  const gustoClient = useGustoEmbeddedContext()

  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false)
  // True once this screen has read a "calculating" status for the payroll, whether we started that
  // calc or someone else did. Calling prepare after that would wipe the result, so we use this to
  // keep prepare off.
  const hasSeenCalculatingRef = useRef(false)

  const payrollRequest = useMemo<GetV1CompaniesCompanyIdPayrollsPayrollIdRequest>(
    () => ({
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    }),
    [companyId, payrollId],
  )

  const payrollQuery = usePayrollsGet(payrollRequest)
  const payrollData = payrollQuery.data
  const refetchPayroll = payrollQuery.refetch

  const excludedEmployeeUuids = useMemo(
    () =>
      payrollData?.payrollShow?.employeeCompensations
        ?.filter(comp => comp.excluded)
        .map(comp => comp.employeeUuid!)
        .filter(Boolean) ?? [],
    [payrollData?.payrollShow?.employeeCompensations],
  )

  // Remember once we've seen it calculating.
  if (isCalculatingStatus(payrollData?.payrollShow?.processingRequest)) {
    hasSeenCalculatingRef.current = true
  }

  const blockersQuery = usePayrollsGetBlockers({ companyUuid: companyId })

  const blockersFromApi: ApiPayrollBlocker[] = useMemo(
    () =>
      (blockersQuery.data?.payrollBlockers ?? []).map(blocker => ({
        key: blocker.key,
        message: blocker.message,
      })),
    [blockersQuery.data?.payrollBlockers],
  )

  // While calculating, the live API blockers are overridden: cleared on success, replaced with the
  // blockers parsed from a failed calculate. `null` means "show the live API blockers".
  const [calculateBlockersOverride, setCalculateBlockersOverride] = useState<
    ApiPayrollBlocker[] | null
  >(null)

  const { start: startCalculationPoll, isPolling } = useCalculationPoll({
    refetch: refetchPayroll,
    onCalculated: (payroll: PayrollShow | undefined) => {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: {
          type: 'success',
          title: t('alerts.progressSaved'),
          alertKey: 'progressSaved',
        },
        payPeriod: payroll?.payPeriod,
      })
      setCalculateBlockersOverride([])
    },
    onProcessingFailed: (payroll: PayrollShow | undefined) => {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      // Let prepare run again on retry — but only when there is no calculation for it to wipe.
      if (payroll?.calculatedAt == null) {
        hasSeenCalculatingRef.current = false
      }
    },
  })

  // Show the loading state the whole time we're calculating, so a second tab shows the loader
  // instead of a blank table until it moves on.
  const isCalculatingActive = isCalculatingPayroll || isPolling || hasSeenCalculatingRef.current

  const {
    employeeDetails,
    employeeCompensations,
    paySchedule,
    payPeriod,
    payrollCategory,
    pagination,
    isLoading: isPreparing,
    isFetching: isPrepareFetching,
    isAlreadyProcessed,
    refetch,
  } = usePayrollConfigurationData({
    companyId,
    payrollId,
    // Don't prepare while calculating, or once we've seen it calculate. If the payroll was already
    // calculated when we opened (e.g. clicking Edit), we do prepare so it can be edited.
    disablePrepare: isPolling || isCalculatingPayroll || hasSeenCalculatingRef.current,
    excludedEmployeeUuids,
  })

  const hasFiredAlreadyProcessedRef = useRef(false)

  useEffect(() => {
    if (!isAlreadyProcessed) {
      hasFiredAlreadyProcessedRef.current = false
      return
    }
    if (hasFiredAlreadyProcessedRef.current) return
    hasFiredAlreadyProcessedRef.current = true
    onEvent(componentEvents.RUN_PAYROLL_ALREADY_PROCESSED, {
      payrollId,
      alert: {
        type: 'error',
        title: t('alerts.alreadyProcessed'),
        alertKey: 'alreadyProcessed',
      },
      payPeriod: payrollData?.payrollShow?.payPeriod,
    })
  }, [isAlreadyProcessed, onEvent, payrollId, t, payrollData?.payrollShow?.payPeriod])

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const onCalculatePayroll = useCallback(async () => {
    setCalculateBlockersOverride([])
    // Mark it right away so prepare can't run and cancel the calculation we just started.
    hasSeenCalculatingRef.current = true

    await baseSubmitHandler({}, async () => {
      const result = await payrollSubmitHandler(async () => {
        setIsCalculatingPayroll(true)
        try {
          const calcResult = await payrollsCalculate(gustoClient, { companyId, payrollId })
          if (!calcResult.ok) {
            throw calcResult.error
          }
          startCalculationPoll({
            baselineCalculatedAt: payrollData?.payrollShow?.calculatedAt?.getTime() ?? null,
            // We just submitted the payroll, so we haven't yet seen it return with the calculating status.
            sawCalculatingThisPoll: false,
          })
        } catch (error) {
          // Calculate itself failed before polling ever started (e.g. a 409 conflict), so let
          // prepare run again on retry -- otherwise hasSeenCalculatingRef stays stuck true forever
          // with no RUN_PAYROLL_CALCULATED/RUN_PAYROLL_PROCESSING_FAILED event ever firing.
          hasSeenCalculatingRef.current = false
          throw error
        } finally {
          setIsCalculatingPayroll(false)
        }
      })

      if (!result.success && result.blockers.length > 0) {
        setCalculateBlockersOverride(result.blockers)
      }
    })
  }, [baseSubmitHandler, gustoClient, companyId, payrollId, startCalculationPoll, payrollData])

  const blockers = calculateBlockersOverride ?? blockersFromApi

  const toggleExclude = useCallback(
    async (
      employeeCompensation: PayrollEmployeeCompensationsType,
    ): Promise<HookSubmitResult<PayrollPrepared | undefined> | undefined> => {
      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SKIP, {
        employeeId: employeeCompensation.employeeUuid,
      })
      let submitResult: HookSubmitResult<PayrollPrepared | undefined> | undefined
      await baseSubmitHandler({}, async () => {
        const transformedCompensation = transformEmployeeCompensation(employeeCompensation)
        const result = await updatePayroll({
          request: {
            companyId,
            payrollId,
            payrollUpdate: {
              employeeCompensations: [
                { ...transformedCompensation, excluded: !transformedCompensation.excluded },
              ],
            },
          },
        })
        onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
          payrollPrepared: result.payrollPrepared,
        })
        await refetch()
        submitResult = { mode: 'update', data: result.payrollPrepared }
      })
      return submitResult
    },
    [onEvent, baseSubmitHandler, updatePayroll, companyId, payrollId, refetch],
  )

  // Pick up a calculation this screen didn't start (another tab, another admin). Starting a poll
  // from rendered data is fine — only the decision to *finish* one must not depend on a render,
  // and that lives in the poll loop.
  useEffect(() => {
    if (isPolling) return
    if (!isCalculatingStatus(payrollData?.payrollShow?.processingRequest)) return

    startCalculationPoll({
      baselineCalculatedAt: payrollData?.payrollShow?.calculatedAt?.getTime() ?? null,
      // We have seen the calculating status, which is why we're starting to poll now until it completes or fails.
      sawCalculatingThisPoll: true,
    })
  }, [
    payrollData?.payrollShow?.processingRequest,
    payrollData?.payrollShow?.calculatedAt,
    isPolling,
    startCalculationPoll,
  ])

  const notice = useMemo<PayrollConfigurationNotice | undefined>(() => {
    const statusMeta = payrollData?.payrollShow?.payrollStatusMeta

    if (
      statusMeta?.payrollLate &&
      statusMeta.initialCheckDate &&
      statusMeta.expectedDebitTime &&
      statusMeta.expectedCheckDate
    ) {
      return {
        type: 'latePayroll',
        initialCheckDate: statusMeta.initialCheckDate,
        expectedDebitTime: statusMeta.expectedDebitTime,
        expectedCheckDate: statusMeta.expectedCheckDate,
      }
    }

    const payrollShow = payrollData?.payrollShow
    if (payrollShow?.checkDate && payrollShow.payrollDeadline) {
      return {
        type: 'directDepositDeadline',
        checkDate: payrollShow.checkDate,
        payrollDeadline: payrollShow.payrollDeadline,
      }
    }

    return undefined
  }, [payrollData?.payrollShow])

  const errorHandling = composeErrorHandler([payrollQuery, blockersQuery], {
    submitError,
    setSubmitError,
  })

  if (payrollQuery.isLoading || blockersQuery.isLoading) {
    return { isLoading: true, errorHandling }
  }

  return {
    isLoading: false,
    data: {
      employeeCompensations,
      employeeDetails,
      payPeriod,
      paySchedule,
      payrollCategory,
      blockers,
      notice,
    },
    status: {
      isPreparing,
      isFetching: payrollQuery.isFetching || isPrepareFetching,
      isUpdating: isUpdatingPayroll,
      isCalculating: isCalculatingActive,
      isProcessed: isAlreadyProcessed,
    },
    pagination,
    actions: {
      calculatePayroll: onCalculatePayroll,
      toggleExclude,
    },
    errorHandling,
  }
}
