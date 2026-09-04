import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  buildPayrollsGetQuery,
  usePayrollsGetSuspense,
  type PayrollsGetQueryData,
} from '@gusto/embedded-api/react-query/payrollsGet'
import { payrollsCalculate } from '@gusto/embedded-api/funcs/payrollsCalculate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import { useQueryClient } from '@tanstack/react-query'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useTranslation } from 'react-i18next'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsCalculateGrossUpMutation } from '@gusto/embedded-api/react-query/payrollsCalculateGrossUp'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { GrossUpModal } from '../GrossUpModal'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import type { PayrollFlowAlert } from '../PayrollFlow/PayrollFlowComponents'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { usePayrollConfigurationData } from './usePayrollConfigurationData'
import { getGrossUpTargetCompensationName, isGrossUpEligible } from './grossUpHelpers'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents, type EventType } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { SDKInternalError } from '@/types/sdkError'
import { usePollingTask, type PollTickResult } from '@/hooks/usePollingTask/usePollingTask'

const POLL_INTERVAL_MS = 5_000
const POLL_DEADLINE_MS = 3 * 60 * 1000

type PayrollShow = NonNullable<PayrollsGetQueryData['payrollShow']>

type CalculationOutcome =
  | { type: 'calculated'; payroll: PayrollShow | undefined }
  | { type: 'failed'; payroll: PayrollShow | undefined }

/**
 * Per-run state for the calculation poll. Written when a run starts and read only from inside
 * the poll loop — never during render, which is what made the previous `previousCalculatedAtRef`
 * completion gate depend on a render arriving.
 */
interface CalculationPollRun {
  baselineCalculatedAt: number | null
  sawCalculating: boolean
}

const isCalculatingStatus = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating

const isCalculatedStatus = (
  processingRequest?: PayrollProcessingRequest | null,
  calculatedAt?: Date | null,
) =>
  calculatedAt != null &&
  (processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess ||
    processingRequest == null)

const evaluateCalculationOutcome = (
  data: PayrollsGetQueryData,
  run: CalculationPollRun | null,
): PollTickResult<CalculationOutcome> => {
  const payroll = data.payrollShow

  if (isCalculatingStatus(payroll?.processingRequest)) {
    if (run) run.sawCalculating = true
    return { done: false }
  }

  if (payroll?.processingRequest?.status === PayrollProcessingRequestStatus.ProcessingFailed) {
    return { done: true, value: { type: 'failed', payroll } }
  }

  const calculatedAt = payroll?.calculatedAt
  const isNewCalculation =
    run?.sawCalculating === true || calculatedAt?.getTime() !== run?.baselineCalculatedAt

  if (isNewCalculation && isCalculatedStatus(payroll?.processingRequest, calculatedAt)) {
    return { done: true, value: { type: 'calculated', payroll } }
  }

  return { done: false }
}

/**
 * Props for {@link PayrollConfiguration}.
 *
 * @public
 */
export interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  /** The associated company identifier. */
  companyId: string
  /** The associated payroll identifier. */
  payrollId: string
  /** Optional alert components to render above the configuration content. */
  alerts?: ReactNode
  /** Whether to show the reimbursements column in the compensation table. Defaults to `true`. */
  withReimbursements?: boolean
}

/**
 * Handles the configuration phase of payroll processing, allowing users to review and modify employee compensation before calculating the payroll.
 *
 * @remarks
 * If the payroll turns out to already be processed (e.g. another actor submitted it while this
 * screen was open), this component emits `runPayroll/alreadyProcessed` and then renders
 * {@link PayrollOverview} in its place — the read-only breakdown with the gated "Cancel payroll"
 * action — instead of the configuration table. Events from that delegated view (e.g.
 * `runPayroll/cancelled`) are emitted through this component's own `onEvent`.
 *
 * Emits the following events:
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `runPayroll/employee/edit` | An employee row is selected for editing | `{ employeeId, firstName, lastName }` |
 * | `runPayroll/employee/skip` | An employee is skipped or unskipped for this payroll | `{ employeeId }` |
 * | `runPayroll/employee/saved` | Employee compensation changes are persisted | `{ payrollPrepared }` |
 * | `runPayroll/calculated` | Payroll calculation completes successfully | `{ payrollId, alert, payPeriod }` |
 * | `runPayroll/alreadyProcessed` | The payroll turns out to already be processed while configuring it | `{ payrollId, alert, payPeriod }` |
 * | `runPayroll/processingFailed` | Payroll calculation fails or times out | — |
 * | `runPayroll/blockers/viewAll` | The "view all blockers" affordance is selected | — |
 * | `runPayroll/grossUp/selected` | The set-net-earnings menu item is selected for an employee | `{ employeeUuid }` |
 * | `runPayroll/grossUp/calculated` | A gross-up amount is calculated from a target net pay | `{ grossUp, netPay, employeeUuid }` |
 *
 * @param props - See {@link PayrollConfigurationProps}.
 * @returns The payroll configuration screen.
 * @public
 */
export function PayrollConfiguration(props: PayrollConfigurationProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
  withReimbursements = true,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { baseSubmitHandler } = useBase()
  const dateFormatter = useDateFormatter()

  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false)
  const pollRunRef = useRef<CalculationPollRun | null>(null)
  // True once this screen has read a "calculating" status for the payroll, whether we started that
  // calc or someone else did. Calling prepare after that would wipe the result, so we use this to
  // keep prepare off.
  const hasSeenCalculatingRef = useRef(false)
  const gustoClient = useGustoEmbeddedContext()
  const queryClient = useQueryClient()

  const payrollRequest = useMemo<GetV1CompaniesCompanyIdPayrollsPayrollIdRequest>(
    () => ({
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    }),
    [companyId, payrollId],
  )

  const { data: payrollData } = usePayrollsGetSuspense(payrollRequest)

  const excludedEmployeeUuids = useMemo(
    () =>
      payrollData.payrollShow?.employeeCompensations
        ?.filter(comp => comp.excluded)
        .map(comp => comp.employeeUuid!)
        .filter(Boolean) ?? [],
    [payrollData.payrollShow?.employeeCompensations],
  )

  // Remember once we've seen it calculating.
  if (isCalculatingStatus(payrollData.payrollShow?.processingRequest)) {
    hasSeenCalculatingRef.current = true
  }

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockers ?? []

  const blockersFromApi: ApiPayrollBlocker[] = payrollBlockerList.map(blocker => ({
    key: blocker.key,
    message: blocker.message,
  }))

  const [payrollBlockers, setPayrollBlockers] = useState(blockersFromApi)

  const emitCalculated = (payroll: PayrollShow | undefined) => {
    onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
      payrollId,
      alert: {
        type: 'success',
        title: t('alerts.progressSaved'),
        alertKey: 'progressSaved',
      },
      payPeriod: payroll?.payPeriod,
    })
    setPayrollBlockers([])
  }

  const emitProcessingFailed = (payroll: PayrollShow | undefined) => {
    onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
    // Let prepare run again on retry — but only when there is no calculation for it to wipe.
    if (payroll?.calculatedAt == null) {
      hasSeenCalculatingRef.current = false
    }
  }

  const fetchPayroll = (signal: AbortSignal) =>
    queryClient.fetchQuery({
      ...buildPayrollsGetQuery(gustoClient, payrollRequest, { signal }),
      staleTime: 0,
    })

  const handleCalculationDone = (outcome: CalculationOutcome) => {
    if (outcome.type === 'failed') {
      emitProcessingFailed(outcome.payroll)
      return
    }
    emitCalculated(outcome.payroll)
  }

  // The server is the source of truth. A calculation that succeeded while we were waiting must
  // never be reported as a failure — that reported false failures for payrolls that had
  // calculated fine, and re-armed the prepare that would then wipe the result (SDK-1291).
  // Advancing on a stale success is the safer of the two wrong answers: the next screen re-reads
  // the payroll, whereas a false failure destroys real data.
  const handleCalculationDeadline = (lastData: PayrollsGetQueryData | null) => {
    const payroll = lastData?.payrollShow
    if (isCalculatedStatus(payroll?.processingRequest, payroll?.calculatedAt)) {
      emitCalculated(payroll)
      return
    }
    emitProcessingFailed(payroll)
  }

  const { start: startCalculationPoll, isPolling } = usePollingTask<
    PayrollsGetQueryData,
    CalculationOutcome
  >({
    fetch: fetchPayroll,
    evaluate: data => evaluateCalculationOutcome(data, pollRunRef.current),
    onDone: handleCalculationDone,
    onDeadline: handleCalculationDeadline,
    intervalMs: POLL_INTERVAL_MS,
    deadlineMs: POLL_DEADLINE_MS,
  })

  // Show the loading state the whole time we're calculating, so a second tab shows the loader
  // instead of a blank table until it moves to the overview.
  const isCalculatingActive = isCalculatingPayroll || isPolling || hasSeenCalculatingRef.current

  const {
    employeeDetails,
    employeeCompensations,
    paySchedule,
    payPeriod,
    payrollCategory,
    pagination,
    isLoading,
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

  const alreadyProcessedAlert: PayrollFlowAlert = useMemo(
    () => ({
      type: 'error',
      title: t('alerts.alreadyProcessed'),
      alertKey: 'alreadyProcessed',
    }),
    [t],
  )

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
      alert: alreadyProcessedAlert,
      payPeriod: payrollData.payrollShow?.payPeriod,
    })
  }, [
    isAlreadyProcessed,
    onEvent,
    payrollId,
    alreadyProcessedAlert,
    payrollData.payrollShow?.payPeriod,
  ])

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const { mutateAsync: calculateGrossUpMutation } = usePayrollsCalculateGrossUpMutation()

  const [grossUpEmployeeUuid, setGrossUpEmployeeUuid] = useState<string | null>(null)
  const [isGrossUpModalOpen, setIsGrossUpModalOpen] = useState(false)

  const grossUpEnabled = isGrossUpEligible(payrollCategory)
  const grossUpTargetCompensation = getGrossUpTargetCompensationName(payrollCategory)

  const onGrossUpSelect = (employeeUuid: string) => {
    setGrossUpEmployeeUuid(employeeUuid)
    setIsGrossUpModalOpen(true)
    onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_SELECTED, { employeeUuid })
  }

  const onCalculateGrossUp = async (netPay: number): Promise<string | null> => {
    if (!grossUpEmployeeUuid) return null
    let grossUp: string | null = null

    await baseSubmitHandler(null, async () => {
      const result = await calculateGrossUpMutation({
        request: {
          payrollUuid: payrollId,
          payrollGrossUpRequest: {
            employeeUuid: grossUpEmployeeUuid,
            netPay: netPay.toString(),
          },
        },
      })

      grossUp = result.payrollGrossUpResponse?.grossUp ?? null

      if (grossUp) {
        onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_CALCULATED, {
          grossUp,
          netPay,
          employeeUuid: grossUpEmployeeUuid,
        })
      }
    })

    return grossUp
  }

  const onGrossUpApply = async (grossAmount: string) => {
    if (!grossUpEmployeeUuid || !grossUpTargetCompensation) {
      throw new SDKInternalError(
        'Unable to apply gross-up: missing employee or target compensation.',
      )
    }

    const employeeComp = employeeCompensations.find(ec => ec.employeeUuid === grossUpEmployeeUuid)
    if (!employeeComp) {
      throw new SDKInternalError('Unable to apply gross-up: employee compensation not found.')
    }

    const existingFixed = employeeComp.fixedCompensations ?? []
    const hasTargetCompensation = existingFixed.some(
      fc => fc.name?.toLowerCase() === grossUpTargetCompensation.toLowerCase(),
    )

    const updatedFixedCompensations = existingFixed.map(fc => ({
      name: fc.name,
      jobUuid: fc.jobUuid,
      amount:
        fc.name?.toLowerCase() === grossUpTargetCompensation.toLowerCase() ? grossAmount : '0',
    }))

    if (!hasTargetCompensation) {
      const primaryJobUuid =
        employeeComp.hourlyCompensations?.[0]?.jobUuid ?? existingFixed[0]?.jobUuid ?? ''
      updatedFixedCompensations.push({
        name: grossUpTargetCompensation,
        jobUuid: primaryJobUuid,
        amount: grossAmount,
      })
    }

    const updatedHourlyCompensations = (employeeComp.hourlyCompensations ?? []).map(hc => ({
      name: hc.name,
      jobUuid: hc.jobUuid,
      hours: '0',
    }))

    const updatedPaidTimeOff = (employeeComp.paidTimeOff ?? []).map(pto => ({
      name: pto.name,
      hours: '0',
    }))

    const transformedCompensation = transformEmployeeCompensation({
      ...employeeComp,
      fixedCompensations: updatedFixedCompensations,
      hourlyCompensations: updatedHourlyCompensations,
      paidTimeOff: updatedPaidTimeOff,
    })

    await baseSubmitHandler({}, async () => {
      const result = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [{ ...transformedCompensation, excluded: false }],
          },
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
      })
      await refetch()
    })

    setGrossUpEmployeeUuid(null)
    setIsGrossUpModalOpen(false)
  }

  const handleGrossUpApply = async (grossAmount: string) => {
    try {
      await onGrossUpApply(grossAmount)
    } catch {
      // Modal stays open; error is surfaced by baseSubmitHandler
    }
  }

  const onCalculatePayroll = async () => {
    setPayrollBlockers([])
    // Mark it right away so prepare can't run and cancel the calculation we just started.
    hasSeenCalculatingRef.current = true

    await baseSubmitHandler({}, async () => {
      const result = await payrollSubmitHandler(async () => {
        setIsCalculatingPayroll(true)
        try {
          const calcResult = await payrollsCalculate(gustoClient, {
            companyId,
            payrollId,
          })
          if (!calcResult.ok) {
            throw calcResult.error
          }
          pollRunRef.current = {
            baselineCalculatedAt: payrollData.payrollShow?.calculatedAt?.getTime() ?? null,
            sawCalculating: false,
          }
          startCalculationPoll()
        } finally {
          setIsCalculatingPayroll(false)
        }
      })

      if (!result.success && result.blockers.length > 0) {
        setPayrollBlockers(result.blockers)
      }
    })
  }

  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
      employeeId: employee.uuid,
      firstName: employee.firstName,
      lastName: employee.lastName,
    })
  }

  const transformEmployeeCompensation = (
    compensation: PayrollEmployeeCompensationsType,
  ): PayrollUpdateEmployeeCompensations => {
    const { paymentMethod } = compensation
    return {
      employeeUuid: compensation.employeeUuid,
      version: compensation.version,
      excluded: compensation.excluded,
      fixedCompensations: compensation.fixedCompensations,
      hourlyCompensations: compensation.hourlyCompensations,
      paidTimeOff: compensation.paidTimeOff,
      deductions: compensation.deductions,
      ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
      memo: compensation.memo || undefined,
    }
  }

  const onToggleExclude = async (employeeCompensation: PayrollEmployeeCompensationsType) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SKIP, {
      employeeId: employeeCompensation.employeeUuid,
    })
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
    })
  }

  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
  }

  // Pick up a calculation this screen didn't start (another tab, another admin). Starting a poll
  // from rendered data is fine — only the decision to *finish* one must not depend on a render,
  // and that lives in the poll loop.
  useEffect(() => {
    if (isPolling) return
    if (!isCalculatingStatus(payrollData.payrollShow?.processingRequest)) return

    pollRunRef.current = {
      baselineCalculatedAt: payrollData.payrollShow?.calculatedAt?.getTime() ?? null,
      sawCalculating: true,
    }
    startCalculationPoll()
  }, [
    payrollData.payrollShow?.processingRequest,
    payrollData.payrollShow?.calculatedAt,
    isPolling,
    startCalculationPoll,
  ])

  const payrollAlert = (() => {
    const statusMeta = payrollData.payrollShow?.payrollStatusMeta

    const isLatePayroll =
      statusMeta?.payrollLate &&
      statusMeta.initialCheckDate &&
      statusMeta.expectedDebitTime &&
      statusMeta.expectedCheckDate

    if (isLatePayroll) {
      return {
        label: t('alerts.payrollLate', {
          initialCheckDate: dateFormatter.formatShortWithWeekday(statusMeta.initialCheckDate),
        }),
        content: t('alerts.payrollLateText', {
          ...dateFormatter.formatWithTime(statusMeta.expectedDebitTime),
          newCheckDate: dateFormatter.formatShortWithWeekday(statusMeta.expectedCheckDate),
        }),
        variant: 'warning' as const,
      }
    }

    const { payrollShow } = payrollData

    if (payrollShow?.checkDate && payrollShow.payrollDeadline) {
      return {
        label: t('alerts.directDepositDeadline', {
          payDate: dateFormatter.formatShortWithWeekday(payrollShow.checkDate),
          ...dateFormatter.formatWithTime(payrollShow.payrollDeadline),
        }),
        content: t('alerts.directDepositDeadlineText'),
        variant: 'info' as const,
      }
    }

    return undefined
  })()

  if (isAlreadyProcessed) {
    const onAlreadyProcessedOverviewEvent = (type: EventType, data?: unknown) => {
      if (type === componentEvents.RUN_PAYROLL_CANCELLED) {
        // Cancelling un-processes the payroll, making it editable again — re-run prepare so
        // this component drops back into the configuration table for the same payrollId.
        void refetch()
      }
      onEvent(type, data)
    }

    return (
      <PayrollOverview
        companyId={companyId}
        payrollId={payrollId}
        onEvent={onAlreadyProcessedOverviewEvent}
        withReimbursements={withReimbursements}
        alerts={[alreadyProcessedAlert]}
      />
    )
  }

  return (
    <>
      <PayrollConfigurationPresentation
        onCalculatePayroll={onCalculatePayroll}
        isCalculateDisabled={blockersFromApi.length > 0}
        onEdit={onEdit}
        onToggleExclude={onToggleExclude}
        onViewBlockers={onViewBlockers}
        employeeCompensations={employeeCompensations}
        employeeDetails={employeeDetails}
        payPeriod={payPeriod}
        paySchedule={paySchedule}
        payrollCategory={payrollCategory}
        alerts={alerts}
        payrollAlert={payrollAlert}
        isPending={isCalculatingActive || isLoading || isUpdatingPayroll}
        isCalculating={isCalculatingActive}
        payrollBlockers={payrollBlockers}
        pagination={pagination}
        withReimbursements={withReimbursements}
        grossUpEnabled={grossUpEnabled}
        onGrossUpSelect={onGrossUpSelect}
      />
      {grossUpEnabled && (
        <GrossUpModal
          isOpen={isGrossUpModalOpen}
          onCalculateGrossUp={onCalculateGrossUp}
          onApply={handleGrossUpApply}
          onCancel={() => {
            setIsGrossUpModalOpen(false)
          }}
        />
      )}
    </>
  )
}
