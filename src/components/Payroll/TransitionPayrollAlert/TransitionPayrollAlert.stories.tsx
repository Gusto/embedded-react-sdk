import { useState } from 'react'
import { fn } from 'storybook/test'
import type { PayPeriod } from '@gusto/embedded-api/models/components/payperiod'
import { TransitionPayrollAlertPresentation } from './TransitionPayrollAlertPresentation'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.TransitionPayrollAlert')
  return <>{children}</>
}

const weeklyPayPeriods: PayPeriod[] = [
  {
    startDate: '2024-12-01',
    endDate: '2024-12-15',
    payScheduleUuid: 'schedule-weekly',
    payroll: { processed: false, payrollType: 'transition' },
  },
  {
    startDate: '2024-12-16',
    endDate: '2024-12-31',
    payScheduleUuid: 'schedule-weekly',
    payroll: { processed: false, payrollType: 'transition' },
  },
]

const monthlyPayPeriods: PayPeriod[] = [
  {
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    payScheduleUuid: 'schedule-monthly',
    payroll: { processed: false, payrollType: 'transition' },
  },
]

const singleGroup = [
  {
    payScheduleUuid: 'schedule-weekly',
    payScheduleName: 'Weekly Schedule',
    payPeriods: weeklyPayPeriods,
  },
]

const multipleGroups = [
  {
    payScheduleUuid: 'schedule-weekly',
    payScheduleName: 'Weekly Schedule',
    payPeriods: weeklyPayPeriods,
  },
  {
    payScheduleUuid: 'schedule-monthly',
    payScheduleName: 'Monthly Schedule',
    payPeriods: monthlyPayPeriods,
  },
]

export default {
  title: 'Domain/Payroll/TransitionPayrollAlert',
  decorators: [
    (Story: React.ComponentType) => (
      <I18nLoader>
        <Story />
      </I18nLoader>
    ),
  ],
}

export const SingleSchedule = () => {
  const onRunPayroll = fn().mockName('onRunPayroll')
  const onSkipPayroll = fn().mockName('onSkipPayroll')

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={singleGroup}
      onRunPayroll={onRunPayroll}
      onSkipPayroll={onSkipPayroll}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={() => {}}
      skippingPayPeriod={null}
    />
  )
}

export const MultipleSchedules = () => {
  const onRunPayroll = fn().mockName('onRunPayroll')
  const onSkipPayroll = fn().mockName('onSkipPayroll')

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={multipleGroups}
      onRunPayroll={onRunPayroll}
      onSkipPayroll={onSkipPayroll}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={() => {}}
      skippingPayPeriod={null}
    />
  )
}

export const WithSkipSuccess = () => {
  const [showAlert, setShowAlert] = useState(true)
  const onRunPayroll = fn().mockName('onRunPayroll')
  const onSkipPayroll = fn().mockName('onSkipPayroll')

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={singleGroup}
      onRunPayroll={onRunPayroll}
      onSkipPayroll={onSkipPayroll}
      showSkipSuccessAlert={showAlert}
      onDismissSkipSuccessAlert={() => {
        setShowAlert(false)
      }}
      skippingPayPeriod={null}
    />
  )
}

export const SkippingInProgress = () => {
  const onRunPayroll = fn().mockName('onRunPayroll')
  const onSkipPayroll = fn().mockName('onSkipPayroll')

  return (
    <TransitionPayrollAlertPresentation
      groupedPayPeriods={singleGroup}
      onRunPayroll={onRunPayroll}
      onSkipPayroll={onSkipPayroll}
      showSkipSuccessAlert={false}
      onDismissSkipSuccessAlert={() => {}}
      skippingPayPeriod={weeklyPayPeriods[0] ?? null}
    />
  )
}
