import { useId } from 'react'
import { useWatch, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollEmployeeCompensationsTypePaidTimeOff } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollEditEmployeeFormValues } from './PayrollEditEmployeePresentation'
import { Flex, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export interface TimeOffFieldProps {
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff
  employee: Employee
}

export const TimeOffBalance = ({
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

export interface PayoutTimeOffFieldProps {
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff
  employee: Employee
}

export const PayoutTimeOffField = ({ timeOff, employee }: PayoutTimeOffFieldProps) => {
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const { control } = useFormContext<PayrollEditEmployeeFormValues>()
  const id = useId()

  const hoursUsedThisPeriod = useWatch({
    control,
    name: `timeOffCompensations.${timeOff.name}`,
  })

  if (!timeOff.name) {
    return null
  }

  const hoursUsed = parseFloat(hoursUsedThisPeriod || '0')
  const eligiblePolicy = employee.eligiblePaidTimeOff?.find(policy => policy.name === timeOff.name)

  return (
    <Flex flexDirection="column" gap={4}>
      <TextInputField
        key={`payout-${timeOff.name}`}
        name={`finalPayoutCompensations.${timeOff.name}`}
        type="number"
        min={0}
        adornmentEnd={t('hoursUnit')}
        label={timeOff.name}
        aria-describedby={id}
      />
      {eligiblePolicy?.accrualBalance && (
        <TimeOffBalance
          accrualBalance={eligiblePolicy.accrualBalance}
          accrualMethod={eligiblePolicy.accrualMethod ?? undefined}
          hoursUsed={hoursUsed}
          id={id}
        />
      )}
    </Flex>
  )
}

export const TimeOffField = ({ timeOff, employee }: TimeOffFieldProps) => {
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const { control } = useFormContext<PayrollEditEmployeeFormValues>()
  const id = useId()

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
      <TextInputField
        key={timeOff.name}
        name={`timeOffCompensations.${timeOff.name}`}
        type="number"
        min={0}
        adornmentEnd={t('hoursUnit')}
        isRequired
        label={timeOff.name}
        aria-describedby={id}
      />
      {eligiblePolicy?.accrualBalance && (
        <TimeOffBalance
          accrualBalance={eligiblePolicy.accrualBalance}
          accrualMethod={eligiblePolicy.accrualMethod ?? undefined}
          hoursUsed={hoursUsed}
          id={id}
        />
      )}
    </Flex>
  )
}
