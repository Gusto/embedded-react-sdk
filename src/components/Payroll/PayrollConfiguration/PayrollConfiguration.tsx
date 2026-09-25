import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { payrollsCalculate } from '@gusto/embedded-api/funcs/payrollsCalculate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdRequest } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
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
import { derivePayrollCategory, PayrollCategory } from '../payrollTypes'
import { getGrossUpTargetCompensationName, isGrossUpEligible } from './grossUpHelpers'
import { useCalculationPoll, isCalculatingStatus, type PayrollShow } from './useCalculationPoll'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents, type EventType } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { SDKInternalError } from '@/types/sdkError'

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
 * | `runPayroll/employee/edit` | An employee row is selected for editing | `{ payrollId, employeeId, firstName, lastName }` |
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
  className,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { baseSubmitHandler, setError } = useBase()
  const dateFormatter = useDateFormatter()

  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false)
  // True once this screen has read a "calculating" status for the payroll, whether we started that
  // calc or someone else did. Calling prepare after that would wipe the result, so we use this to
  // keep prepare off.
  const hasSeenCalculatingRef = useRef(false)
  // Set when a poll ends in a non-retryable read error without confirming a calculated/failed
  // outcome. Guards the auto-pickup effect below from re-arming a poll against the same stale
  // "Calculating" read over and over -- it only clears once the status genuinely leaves Calculating.
  const hasTerminalPollErrorRef = useRef(false)
  const gustoClient = useGustoEmbeddedContext()

  const payrollRequest = useMemo<GetV1CompaniesCompanyIdPayrollsPayrollIdRequest>(
    () => ({
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    }),
    [companyId, payrollId],
  )

  const { data: payrollData, refetch: refetchPayroll } = usePayrollsGetSuspense(payrollRequest)

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
  // Drives the loader gate below. Deliberately separate from `error` -- `baseSubmitHandler`
  // clears `error` at the start of *any* submit (e.g. skipping an employee, applying a gross-up),
  // which would otherwise reopen this gate and get the loader stuck on with no poll running to
  // ever clear it (SDK-1276). Only the same sites that used to own the old boolean flag touch it.
  const [hasProcessingFailedAlert, setHasProcessingFailedAlert] = useState(false)

  const emitProcessingFailed = () => {
    onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
    setHasProcessingFailedAlert(true)
    setError({
      category: 'internal_error',
      message: `${t('alerts.processingFailed.label')}. ${t('alerts.processingFailed.message')}`,
      fieldErrors: [],
    })
  }

  const onProcessingFailed = (payroll: PayrollShow | undefined) => {
    emitProcessingFailed()
    // Let prepare run again on retry — but only when there is no calculation for it to wipe.
    if (payroll?.calculatedAt == null) {
      hasSeenCalculatingRef.current = false
    }
  }

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
      setPayrollBlockers([])
    },
    onProcessingFailed,
    // Unlike a real processing failure, we never confirmed whether the calculation actually
    // succeeded server-side, so this must not reset hasSeenCalculatingRef — doing so would
    // re-arm prepare and risk wiping a calculation that may have genuinely completed.
    onError: () => {
      hasTerminalPollErrorRef.current = true
      emitProcessingFailed()
    },
  })

  // Show the loading state the whole time we're calculating, so a second tab shows the loader
  // instead of a blank table until it moves to the overview. Once the failed/error alert is
  // showing, the poll has already reached a terminal state, so the loading UI must clear even
  // though hasSeenCalculatingRef stays true (it still guards prepare separately, below).
  const isCalculatingActive =
    !hasProcessingFailedAlert &&
    (isCalculatingPayroll || isPolling || hasSeenCalculatingRef.current)

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
    isTransitionPayroll:
      derivePayrollCategory(payrollData.payrollShow ?? {}) === PayrollCategory.Transition,
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
    setHasProcessingFailedAlert(false)
    setError(null)
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
          startCalculationPoll({
            baselineCalculatedAt: payrollData.payrollShow?.calculatedAt?.getTime() ?? null,
            // We just submitted the payroll, so we haven't yet seen it return with the calculating status
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
        setPayrollBlockers(result.blockers)
      }
    })
  }

  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
      payrollId,
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
    if (!isCalculatingStatus(payrollData.payrollShow?.processingRequest)) {
      // The status only leaves Calculating on a genuinely fresh read, so this is where a prior
      // terminal failure stops blocking future pickups.
      hasTerminalPollErrorRef.current = false
      return
    }
    // A read error we already reported for this same stale "Calculating" snapshot -- retrying it
    // immediately would just spin (fail, isPolling flips false, this effect fires again, repeat)
    // instead of waiting for a genuinely new read.
    if (hasTerminalPollErrorRef.current) return

    // A fresh calculating status means a real calculation is in flight again -- even right after
    // this screen's own deadline reported one as failed -- so any stale failure alert must not
    // linger over it and block the loading UI.
    setHasProcessingFailedAlert(false)
    setError(null)
    startCalculationPoll({
      baselineCalculatedAt: payrollData.payrollShow?.calculatedAt?.getTime() ?? null,
      // We have seen the calculating status, which is why we're starting to poll now until it completes or fails.
      sawCalculatingThisPoll: true,
    })
  }, [
    payrollData.payrollShow?.processingRequest,
    payrollData.payrollShow?.calculatedAt,
    isPolling,
    startCalculationPoll,
    setError,
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
        className={className}
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
        className={className}
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
