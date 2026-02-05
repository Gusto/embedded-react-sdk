import { useState, useMemo } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { PayPeriodDateFormPresentation } from './PayPeriodDateFormPresentation'
import {
  createPayPeriodDateFormSchema,
  type PayPeriodDateFormData,
  type PayPeriodDateFormProps,
} from './PayPeriodDateFormTypes'
import { usePayPeriodDateValidation } from './usePayPeriodDateValidation'
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

function Root({
  onEvent,
  dictionary,
  payrollType = 'bonus',
  initialValues,
}: PayPeriodDateFormProps) {
  useComponentDictionary('Payroll.PayPeriodDateForm', dictionary)
  useI18n('Payroll.PayPeriodDateForm')
  const { t } = useTranslation('Payroll.PayPeriodDateForm')
  const { baseSubmitHandler } = useBase()

  const { minCheckDate, today } = usePayPeriodDateValidation()

  const [isCheckOnly, setIsCheckOnly] = useState(initialValues?.isCheckOnly ?? false)

  const schema = useMemo(
    () =>
      createPayPeriodDateFormSchema(
        t as (key: string) => string,
        payrollType,
        isCheckOnly ? today : minCheckDate,
      ),
    [t, payrollType, isCheckOnly, minCheckDate, today],
  )

  const defaultValues: PayPeriodDateFormData = {
    isCheckOnly: initialValues?.isCheckOnly ?? false,
    startDate: initialValues?.startDate ?? null,
    endDate: initialValues?.endDate ?? null,
    checkDate: initialValues?.checkDate ?? null,
  }

  const methods = useForm<PayPeriodDateFormData>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
  })

  const { handleSubmit } = methods

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
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PayPeriodDateFormPresentation
          isCheckOnly={isCheckOnly}
          onCheckOnlyChange={handleCheckOnlyChange}
        />
      </form>
    </FormProvider>
  )
}
