import { useWatch, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsTypePaidTimeOff } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollEditEmployeeFormValues } from './PayrollEditEmployeePresentation'
import { Flex, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

function rowAriaId(name: string) {
  return `timeoff-balance-${name.replace(/\s+/g, '-').toLowerCase()}`
}

const TimeOffBalance = ({
  accrualBalance,
  accrualMethod,
  hoursUsed,
  id,
}: {
  accrualBalance: string
  accrualMethod?: string
  hoursUsed: number
  id: string
}) => {
  const { Text } = useComponentContext()
  const { t } = useTranslation('Payroll.PayrollEditEmployee')

  if (accrualMethod === 'unlimited') {
    return null
  }

  const currentBalance = parseFloat(accrualBalance)
  const remainingBalance = currentBalance - hoursUsed

  return (
    <Text size="sm" variant="supporting" aria-live="polite" aria-atomic={true} id={id}>
      {t('timeOffBalance.remaining', { balance: remainingBalance.toFixed(1) })}
    </Text>
  )
}

/** @internal */
export interface TimeOffTypeCellProps {
  /** The time-off entry to label, with its accrual balance if eligible. */
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff
  /** The employee whose accrual balance is displayed alongside the label. */
  employee: Employee
}

/** @internal */
export const TimeOffTypeCell = ({ timeOff, employee }: TimeOffTypeCellProps) => {
  const { Text } = useComponentContext()
  useI18n('Payroll.PayrollEditEmployee')

  const { control } = useFormContext<PayrollEditEmployeeFormValues>()
  const watchedValue = useWatch({
    control,
    name: `timeOffCompensations.${timeOff.name}`,
  })

  if (!timeOff.name) {
    return null
  }

  const hoursUsed = parseFloat(watchedValue || '0')
  const eligiblePolicy = employee.eligiblePaidTimeOff?.find(policy => policy.name === timeOff.name)

  return (
    <Flex flexDirection="column" gap={4}>
      <Text>{timeOff.name}</Text>
      {eligiblePolicy?.accrualBalance && (
        <TimeOffBalance
          accrualBalance={eligiblePolicy.accrualBalance}
          accrualMethod={eligiblePolicy.accrualMethod ?? undefined}
          hoursUsed={hoursUsed}
          id={rowAriaId(timeOff.name)}
        />
      )}
    </Flex>
  )
}

/** @internal */
export interface PayoutTimeOffFieldProps {
  /** The time-off entry whose final-payout hours the field captures. */
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff
  /** Whether to visually hide the field's label, e.g. when it's rendered as a table cell alongside a `TimeOffTypeCell`. */
  shouldVisuallyHideLabel?: boolean
}

/** @internal */
export const PayoutTimeOffField = ({
  timeOff,
  shouldVisuallyHideLabel,
}: PayoutTimeOffFieldProps) => {
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  if (!timeOff.name) {
    return null
  }

  return (
    <TextInputField
      key={`payout-${timeOff.name}`}
      name={`finalPayoutCompensations.${timeOff.name}`}
      type="number"
      min={0}
      adornmentEnd={t('hoursUnit')}
      label={timeOff.name}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      aria-describedby={rowAriaId(timeOff.name)}
    />
  )
}

/** @internal */
export interface TimeOffFieldProps {
  /** The time-off entry whose hours the field captures. */
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff
  /** Whether to visually hide the field's label, e.g. when it's rendered as a table cell alongside a `TimeOffTypeCell`. */
  shouldVisuallyHideLabel?: boolean
}

/** @internal */
export const TimeOffField = ({ timeOff, shouldVisuallyHideLabel }: TimeOffFieldProps) => {
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  if (!timeOff.name) {
    return null
  }

  return (
    <TextInputField
      key={timeOff.name}
      name={`timeOffCompensations.${timeOff.name}`}
      type="number"
      min={0}
      adornmentEnd={t('hoursUnit')}
      isRequired
      label={timeOff.name}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      aria-describedby={rowAriaId(timeOff.name)}
    />
  )
}
