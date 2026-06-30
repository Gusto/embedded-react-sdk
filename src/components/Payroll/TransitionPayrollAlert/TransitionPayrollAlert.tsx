import { useMemo, useState, useCallback, useEffect } from 'react'
import { usePaySchedulesGetAll } from '@gusto/embedded-api-v-2026-06-15/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api-v-2026-06-15/react-query/payrollsSkip'
import { PayrollType } from '@gusto/embedded-api-v-2026-06-15/models/operations/postcompaniespayrollskipcompanyuuid'
import type { PayPeriod } from '@gusto/embedded-api-v-2026-06-15/models/components/payperiod'
import { useUnprocessedTransitionPayPeriods } from '../useUnprocessedTransitionPayPeriods'
import {
  TransitionPayrollAlertPresentation,
  type TransitionPayPeriodGroup,
} from './TransitionPayrollAlertPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'
import { useObservability } from '@/contexts/ObservabilityProvider/useObservability'
import { normalizeToSDKError } from '@/types/sdkError'

interface TransitionPayrollAlertProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

const COMPONENT_NAME = 'Payroll.TransitionPayrollAlert'

/** @internal */
export function TransitionPayrollAlert({ companyId, onEvent }: TransitionPayrollAlertProps) {
  return (
    <BaseComponent onEvent={onEvent}>
      <Root companyId={companyId} />
    </BaseComponent>
  )
}

function Root({ companyId }: { companyId: string }) {
  const { onEvent, baseSubmitHandler } = useBase()
  const { observability } = useObservability()

  const { unprocessedPayPeriods } = useUnprocessedTransitionPayPeriods(companyId)

  const { data: paySchedulesData, error: paySchedulesError } = usePaySchedulesGetAll({ companyId })

  useEffect(() => {
    if (!paySchedulesError) return
    onEvent(componentEvents.ERROR, paySchedulesError)
    const sdkError = normalizeToSDKError(paySchedulesError)
    observability?.onError?.({
      ...sdkError,
      timestamp: Date.now(),
      componentName: COMPONENT_NAME,
    })
  }, [paySchedulesError, onEvent, observability])

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

  const handleRunPayroll = useCallback(
    (payPeriod: PayPeriod) => {
      onEvent(componentEvents.RUN_TRANSITION_PAYROLL, {
        startDate: payPeriod.startDate,
        endDate: payPeriod.endDate,
        payScheduleUuid: payPeriod.payScheduleUuid,
      })
    },
    [onEvent],
  )

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

  if (!paySchedulesData || groupedPayPeriods.length === 0) {
    return null
  }

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={groupedPayPeriods}
      onRunPayroll={handleRunPayroll}
      onSkipPayroll={handleSkipPayroll}
      showSkipSuccessAlert={showSkipSuccessAlert}
      onDismissSkipSuccessAlert={handleDismissSkipSuccessAlert}
      skippingPayPeriod={skippingPayPeriod}
    />
  )
}
