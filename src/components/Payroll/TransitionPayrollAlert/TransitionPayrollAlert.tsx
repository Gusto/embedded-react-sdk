import { Suspense, useMemo, useState, useCallback } from 'react'
import { usePaySchedulesGetPayPeriodsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetPayPeriods'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import { PayrollTypes } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayperiods'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { TransitionPayrollAlertPresentation } from './TransitionPayrollAlertPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'

interface TransitionPayrollAlertProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

interface GroupedTransitionPayPeriods {
  payScheduleUuid: string
  payScheduleName: string
  payPeriods: PayPeriod[]
}

interface RootProps {
  companyId: string
  groupedPayPeriods: GroupedTransitionPayPeriods[]
}

const LOOK_AHEAD_DAYS = 90

export function TransitionPayrollAlert(props: TransitionPayrollAlertProps) {
  return (
    <Suspense fallback={null}>
      <TransitionPayrollAlertGate {...props} />
    </Suspense>
  )
}

function TransitionPayrollAlertGate({ companyId, onEvent }: TransitionPayrollAlertProps) {
  const lookAheadEndDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + LOOK_AHEAD_DAYS)
    return new RFCDate(date)
  }, [])

  const { data: payPeriodsData } = usePaySchedulesGetPayPeriodsSuspense({
    companyId,
    payrollTypes: PayrollTypes.Transition,
    endDate: lookAheadEndDate,
  })

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })

  const groupedPayPeriods = useMemo<GroupedTransitionPayPeriods[]>(() => {
    const paySchedules = paySchedulesData.payScheduleShowResponse ?? []
    const unprocessed = (payPeriodsData.payPeriods ?? []).filter(
      (pp: PayPeriod) => !pp.payroll?.processed,
    )

    const groups = new Map<string, PayPeriod[]>()
    for (const period of unprocessed) {
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
  }, [payPeriodsData, paySchedulesData])

  if (groupedPayPeriods.length === 0) {
    return null
  }

  return (
    <BaseComponent onEvent={onEvent}>
      <Root companyId={companyId} groupedPayPeriods={groupedPayPeriods} />
    </BaseComponent>
  )
}

function Root({ companyId, groupedPayPeriods }: RootProps) {
  const { onEvent, baseSubmitHandler } = useBase()

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
