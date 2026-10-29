import { useMemo, useState, useCallback, useEffect } from 'react'
import { usePaySchedulesGetAll } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { usePayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import {
  ProcessingStatuses,
  QueryParamPayrollTypes,
} from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrolls'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { useUnprocessedTransitionPayPeriods } from '../useUnprocessedTransitionPayPeriods'
import {
  TransitionPayrollAlertPresentation,
  type TransitionPayPeriodGroup,
} from './TransitionPayrollAlertPresentation'
import { BaseComponent, type LoaderComponentType } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

interface TransitionPayrollAlertProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
  LoaderComponent?: LoaderComponentType
  /**
   * When true, a payroll blocker is present and the run/skip actions are
   * disabled so the user can't start a transition payroll that would dead-end.
   */
  hasBlockers?: boolean
}

const COMPONENT_NAME = 'Payroll.TransitionPayrollAlert'

/** @internal */
export function TransitionPayrollAlert({
  companyId,
  onEvent,
  LoaderComponent,
  hasBlockers,
}: TransitionPayrollAlertProps) {
  return (
    <BaseComponent onEvent={onEvent} LoaderComponent={LoaderComponent}>
      <Root companyId={companyId} hasBlockers={hasBlockers} />
    </BaseComponent>
  )
}

function Root({ companyId, hasBlockers }: { companyId: string; hasBlockers?: boolean }) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { observability } = useObservability()

  const { unprocessedPayPeriods } = useUnprocessedTransitionPayPeriods(companyId)

  const { data: paySchedulesData, error: paySchedulesError } = usePaySchedulesGetAll({ companyId })

  const sortedPayPeriodDates = unprocessedPayPeriods
    .flatMap(payPeriod => [payPeriod.startDate, payPeriod.endDate])
    .filter((date): date is string => typeof date === 'string')
    .sort()

  const { data: transitionPayrollsData, error: transitionPayrollsError } = usePayrollsList(
    {
      companyId,
      processingStatuses: [ProcessingStatuses.Unprocessed],
      payrollTypes: [QueryParamPayrollTypes.OffCycle],
      includeOffCycle: true,
      startDate: sortedPayPeriodDates.at(0),
      endDate: sortedPayPeriodDates.at(-1),
    },
    { enabled: sortedPayPeriodDates.length > 0 },
  )

  const calculatedPayrollUuids = (transitionPayrollsData?.payrollList ?? [])
    .filter(payroll => payroll.calculatedAt)
    .map(payroll => payroll.payrollUuid)
    .filter((payrollUuid): payrollUuid is string => typeof payrollUuid === 'string')

  const gateQueryError = paySchedulesError ?? transitionPayrollsError

  useEffect(() => {
    if (!gateQueryError) return
    onEvent(componentEvents.ERROR, gateQueryError)
    const sdkError = normalizeToSDKError(gateQueryError)
    observability?.onError?.({
      ...sdkError,
      timestamp: Date.now(),
      componentName: COMPONENT_NAME,
    })
  }, [gateQueryError, onEvent, observability])

  const groupedPayPeriods = useMemo<TransitionPayPeriodGroup[]>(() => {
    if (!paySchedulesData) return []
    const paySchedules = paySchedulesData.payScheduleShowResponse ?? []

    const groups = new Map<string, PayPeriod[]>()
    for (const period of unprocessedPayPeriods) {
      const uuid = period.payScheduleUuid ?? 'unknown'
      const existing = groups.get(uuid) ?? []
      existing.push(period)
      groups.set(uuid, existing)
    }

    return Array.from(groups.entries()).map(([payScheduleUuid, payPeriods]) => {
      const schedule = paySchedules.find(s => s.uuid === payScheduleUuid)
      const payScheduleName = schedule?.customName || schedule?.name || 'Transition'
      return { payScheduleUuid, payScheduleName, payPeriods }
    })
  }, [unprocessedPayPeriods, paySchedulesData])

  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [skippingPayPeriod, setSkippingPayPeriod] = useState<PayPeriod | null>(null)

  const { mutateAsync: skipPayroll } = usePayrollsSkipMutation()

  const handleRunPayroll = (payPeriod: PayPeriod) => {
    const payrollUuid = payPeriod.payroll?.payrollUuid
    const { startDate, endDate, payScheduleUuid } = payPeriod

    if (payrollUuid && calculatedPayrollUuids.includes(payrollUuid)) {
      onEvent(componentEvents.REVIEW_PAYROLL, {
        payrollUuid,
        payPeriod: { startDate, endDate, payScheduleUuid },
      })
      return
    }

    onEvent(componentEvents.RUN_TRANSITION_PAYROLL, {
      payrollUuid,
      startDate,
      endDate,
      payScheduleUuid,
    })
  }

  const handleSkipPayroll = useCallback(
    async (payPeriod: PayPeriod) => {
      setSkippingPayPeriod(payPeriod)
      await baseSubmitHandler({}, async () => {
        await skipPayroll({
          request: {
            companyUuid: companyId,
            requestBody: {
              payrollType: PayrollType.TransitionFromOldPaySchedule,
              startDate: payPeriod.startDate,
              endDate: payPeriod.endDate,
              payScheduleUuid: payPeriod.payScheduleUuid ?? undefined,
            },
          },
        })
        setShowSkipSuccessAlert(true)
        onEvent(componentEvents.TRANSITION_PAYROLL_SKIPPED, {
          payrollUuid: payPeriod.payroll?.payrollUuid,
          startDate: payPeriod.startDate,
          endDate: payPeriod.endDate,
          payScheduleUuid: payPeriod.payScheduleUuid,
        })
      })
      setSkippingPayPeriod(null)
    },
    [companyId, skipPayroll, onEvent, baseSubmitHandler],
  )

  const handleDismissSkipSuccessAlert = useCallback(() => {
    setShowSkipSuccessAlert(false)
  }, [])

  if (!paySchedulesData || !transitionPayrollsData || groupedPayPeriods.length === 0) {
    return null
  }

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={groupedPayPeriods}
      calculatedPayrollUuids={calculatedPayrollUuids}
      onRunPayroll={handleRunPayroll}
      onSkipPayroll={handleSkipPayroll}
      showSkipSuccessAlert={showSkipSuccessAlert}
      onDismissSkipSuccessAlert={handleDismissSkipSuccessAlert}
      skippingPayPeriod={skippingPayPeriod}
      hasBlockers={hasBlockers}
    />
  )
}
