import { useMemo, useState, useCallback } from 'react'
import { usePaySchedulesGetPayPeriods } from '@gusto/embedded-api/react-query/paySchedulesGetPayPeriods'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePayrollsSkipMutation } from '@gusto/embedded-api/react-query/payrollsSkip'
import { PayrollType } from '@gusto/embedded-api/models/operations/postcompaniespayrollskipcompanyuuid'
import { PayrollTypes } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayperiods'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { TransitionPayrollAlertPresentation } from './TransitionPayrollAlertPresentation'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { componentEvents } from '@/shared/constants'

interface TransitionPayrollAlertProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

const LOOK_AHEAD_DAYS = 90

function getEndDate(): RFCDate {
  const date = new Date()
  date.setDate(date.getDate() + LOOK_AHEAD_DAYS)
  return new RFCDate(date)
}

export function TransitionPayrollAlert({ companyId, onEvent }: TransitionPayrollAlertProps) {
  const [showSkipSuccessAlert, setShowSkipSuccessAlert] = useState(false)
  const [skippingPayPeriod, setSkippingPayPeriod] = useState<PayPeriod | null>(null)

  const { data: payPeriodsData } = usePaySchedulesGetPayPeriods({
    companyId,
    payrollTypes: PayrollTypes.Transition,
    endDate: getEndDate(),
  })

  const { data: paySchedulesData } = usePaySchedulesGetAllSuspense({ companyId })
  const paySchedules = paySchedulesData.payScheduleList ?? []

  const { mutateAsync: skipPayroll } = usePayrollsSkipMutation()

  const unprocessedTransitionPeriods = useMemo(() => {
    const periods = payPeriodsData?.payPeriods ?? []
    return periods.filter((pp: PayPeriod) => !pp.payroll?.processed)
  }, [payPeriodsData])

  const groupedPayPeriods = useMemo(() => {
    const groups = new Map<string, PayPeriod[]>()

    for (const period of unprocessedTransitionPeriods) {
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
  }, [unprocessedTransitionPeriods, paySchedules])

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
      try {
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
      } finally {
        setSkippingPayPeriod(null)
      }
    },
    [companyId, skipPayroll, onEvent],
  )

  if (groupedPayPeriods.length === 0) {
    return null
  }

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={groupedPayPeriods}
      onRunPayroll={handleRunPayroll}
      onSkipPayroll={handleSkipPayroll}
      showSkipSuccessAlert={showSkipSuccessAlert}
      onDismissSkipSuccessAlert={() => {
        setShowSkipSuccessAlert(false)
      }}
      skippingPayPeriod={skippingPayPeriod}
    />
  )
}
