import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { PayPeriodDateFormPresentation } from './PayPeriodDateFormPresentation'
import { type PayPeriodDateFormData, type PayPeriodDateFormProps } from './PayPeriodDateFormTypes'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export function PayPeriodDateForm(props: PayPeriodDateFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ onEvent, dictionary, initialValues }: PayPeriodDateFormProps) {
  useComponentDictionary('Payroll.PayPeriodDateForm', dictionary)
  useI18n('Payroll.PayPeriodDateForm')
  const { baseSubmitHandler } = useBase()

  const { handleSubmit } = useFormContext<PayPeriodDateFormData>()

  const [isCheckOnly, setIsCheckOnly] = useState(initialValues?.isCheckOnly ?? false)

  const onSubmit = async (data: PayPeriodDateFormData) => {
    await baseSubmitHandler(data, () => {
      onEvent(componentEvents.RUN_PAYROLL_DATES_CONFIGURED, {
        isCheckOnly: data.isCheckOnly,
        startDate: data.startDate?.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0],
        checkDate: data.checkDate?.toISOString().split('T')[0],
      })
      return Promise.resolve()
    })
  }

  const handleCheckOnlyChange = (checked: boolean) => {
    setIsCheckOnly(checked)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <PayPeriodDateFormPresentation
        isCheckOnly={isCheckOnly}
        onCheckOnlyChange={handleCheckOnlyChange}
      />
    </form>
  )
}
